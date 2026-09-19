"""
sftp_sync.py -- integrated SFTP sync for the DEFCON/Crypto Report
Assistant.

Unlike the standalone sftpupload.py script (which watches a fixed list
of individually named files), this module watches an entire local
directory generically: every file inside it, regardless of name, is
hashed (SHA-256) and re-uploaded under the SAME filename whenever its
content changes. This matches the app's publish directory, which can
contain any number of differently named report files
(defconreport-usa.html, cryptoreport-crypto.html, index.html, ...).

Runs as a background thread inside the Flask app (SftpSyncService),
started/stopped on demand (e.g. via a toggle in the web UI) and,
optionally, automatically on app startup if it was left enabled before
the last restart (persisted in sftp_settings.json, see app.py).

This module can ALSO be run directly for local testing outside the app/
Docker (`python3 sftp_sync.py`), reading the same SFTP_HOST/SFTP_USER/...
environment variables (or a .env file) as the old standalone
sftpupload.py script did -- see _main_standalone() at the bottom. The
app itself does NOT use this entry point; app.py always configures and
starts/stops SftpSyncService directly from sftp_settings.json (set via
Settings -> "SFTP Publish Sync" in the web UI), never from environment
variables. The standalone mode is purely a convenience for testing your
SFTP credentials/connectivity before entering them in the UI.
"""
import hashlib
import logging
import os
import sys
import threading
import time

try:
    import paramiko
except ImportError:
    paramiko = None

log = logging.getLogger("sftp-sync")
# paramiko's own logging is very chatty on DEBUG -- throttled to WARNING
# so it doesn't drown out this module's log lines.
logging.getLogger("paramiko").setLevel(logging.WARNING)

DEFAULT_CHECK_INTERVAL_SEC = 30
DEFAULT_UPLOAD_RETRY_SEC = 60


def file_sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def connect(settings):
    if paramiko is None:
        raise RuntimeError("paramiko is not installed")
    client = paramiko.SSHClient()
    if settings.get("host_key_policy") == "strict":
        client.load_system_host_keys()
        client.set_missing_host_key_policy(paramiko.RejectPolicy())
    else:
        # Trust-on-first-use, like FileZilla's connect dialog -- just
        # without the prompt. Practical for most shared-hosting setups.
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    timeout = float(settings.get("timeout_sec") or 20)
    connect_kwargs = dict(
        hostname=settings["host"], port=int(settings.get("port") or 22), username=settings["user"],
        timeout=timeout, banner_timeout=timeout, auth_timeout=timeout,
    )
    if settings.get("key_file"):
        connect_kwargs["key_filename"] = settings["key_file"]
        if settings.get("key_passphrase"):
            connect_kwargs["passphrase"] = settings["key_passphrase"]
    if settings.get("password"):
        connect_kwargs["password"] = settings["password"]
    if not settings.get("key_file") and not settings.get("password"):
        raise RuntimeError("Neither a key file nor a password is set.")

    client.connect(**connect_kwargs)
    return client


def ensure_remote_dir(sftp, remote_dir):
    """Creates the target directory recursively if it doesn't exist yet.
    stat() raises FileNotFoundError if a path segment is missing -- the
    normal case on the very first run, not a real error."""
    if remote_dir in ("", "/"):
        return
    path = ""
    for part in [p for p in remote_dir.split("/") if p]:
        path += "/" + part
        try:
            sftp.stat(path)
        except FileNotFoundError:
            sftp.mkdir(path)


def upload_one(sftp, local_path, remote_filename, remote_dir):
    """Uploads a single file over an already-open SFTP session -- first
    under a temp name, then an atomic server-side rename, so a viewer
    never loads a broken/truncated page mid-upload."""
    ensure_remote_dir(sftp, remote_dir)
    remote_dir_clean = remote_dir.rstrip("/") or "/"
    remote_target = f"{remote_dir_clean}/{remote_filename}"
    remote_tmp = f"{remote_dir_clean}/{remote_filename}.uploading"

    sftp.put(local_path, remote_tmp)

    # posix_rename overwrites an existing target (unlike rename()), but
    # is an OpenSSH extension not every SFTP server supports -- some
    # reject it with an SFTP error status (IOError/OSError), not a
    # missing method (AttributeError). Treat any exception as "not
    # supported", not just AttributeError.
    try:
        sftp.posix_rename(remote_tmp, remote_target)
    except Exception:
        try:
            sftp.remove(remote_target)
        except (IOError, OSError):
            pass
        sftp.rename(remote_tmp, remote_target)


def test_connection(settings):
    """Connects, opens an SFTP session, and makes sure the remote
    directory exists (creating it if needed) -- then disconnects.
    Raises on any failure; the caller turns that into an API response."""
    client = connect(settings)
    try:
        sftp = client.open_sftp()
        try:
            ensure_remote_dir(sftp, settings.get("remote_dir") or "/")
        finally:
            sftp.close()
    finally:
        client.close()


class SftpSyncService:
    """Background thread that watches a local directory generically --
    every file in it, whatever its name -- and uploads changes via SFTP.
    Start/stop at any time via start()/stop(), e.g. from a toggle in the
    web UI. Settings and the watched directory are read fresh on every
    poll cycle (via the getter callbacks), so changes made in the UI
    take effect without needing to restart the service."""

    def __init__(self, get_settings_fn, get_watch_dir_fn):
        self._get_settings = get_settings_fn
        self._get_watch_dir = get_watch_dir_fn
        self._thread = None
        self._stop_event = threading.Event()
        self._control_lock = threading.Lock()
        self._hashes = {}
        self._last_upload_ts = {}
        self.last_error = None
        self.last_success_ts = None

    def is_running(self):
        return self._thread is not None and self._thread.is_alive()

    def start(self):
        with self._control_lock:
            if self.is_running():
                return
            self._stop_event.clear()
            self._thread = threading.Thread(target=self._loop, daemon=True)
            self._thread.start()
            log.info("SFTP sync started.")

    def stop(self):
        with self._control_lock:
            if not self.is_running():
                return
            self._stop_event.set()
            self._thread.join(timeout=10)
            self._thread = None
            log.info("SFTP sync stopped.")

    def _loop(self):
        while not self._stop_event.is_set():
            interval = DEFAULT_CHECK_INTERVAL_SEC
            retry_wait = DEFAULT_UPLOAD_RETRY_SEC
            try:
                settings = self._get_settings()
                interval = float(settings.get("check_interval_sec") or DEFAULT_CHECK_INTERVAL_SEC)
                retry_wait = float(settings.get("upload_retry_sec") or DEFAULT_UPLOAD_RETRY_SEC)
                watch_dir = self._get_watch_dir()

                if not settings.get("host") or not settings.get("user"):
                    self.last_error = "SFTP host/user not configured."
                    self._stop_event.wait(interval)
                    continue
                if not os.path.isdir(watch_dir):
                    self.last_error = f"Watch directory does not exist: {watch_dir}"
                    self._stop_event.wait(interval)
                    continue

                force_reupload_sec = float(settings.get("force_reupload_sec") or 0)
                to_upload = []
                current_files = set()
                for fname in sorted(os.listdir(watch_dir)):
                    fpath = os.path.join(watch_dir, fname)
                    if not os.path.isfile(fpath):
                        continue
                    current_files.add(fname)
                    try:
                        current_hash = file_sha256(fpath)
                    except OSError:
                        continue
                    changed = current_hash != self._hashes.get(fname)
                    heartbeat_due = (force_reupload_sec > 0 and
                                      (time.time() - self._last_upload_ts.get(fname, 0)) >= force_reupload_sec)
                    if changed or heartbeat_due:
                        to_upload.append((fname, fpath, current_hash))

                # Drop entries for files that disappeared, so they get
                # re-uploaded from scratch if they reappear later.
                for fname in list(self._hashes.keys()):
                    if fname not in current_files:
                        self._hashes.pop(fname, None)
                        self._last_upload_ts.pop(fname, None)

                if to_upload:
                    client = connect(settings)
                    try:
                        sftp = client.open_sftp()
                        try:
                            for fname, fpath, current_hash in to_upload:
                                upload_one(sftp, fpath, fname, settings.get("remote_dir") or "/")
                                self._hashes[fname] = current_hash
                                self._last_upload_ts[fname] = time.time()
                                log.info("Uploaded %s (%d bytes).", fname, os.path.getsize(fpath))
                        finally:
                            sftp.close()
                    finally:
                        client.close()
                    self.last_error = None
                    self.last_success_ts = time.time()
            except Exception as e:
                self.last_error = str(e)
                log.error("SFTP sync error: %s", e)
                self._stop_event.wait(retry_wait)
                continue

            self._stop_event.wait(interval)


# ---------------------------------------------------------------------
# Standalone mode -- for local testing only, see module docstring above.
# The app never calls anything below this point.
# ---------------------------------------------------------------------

def _settings_from_env():
    return {
        "host": os.environ.get("SFTP_HOST", "").strip(),
        "port": int(os.environ.get("SFTP_PORT", "22") or 22),
        "user": os.environ.get("SFTP_USER", "").strip(),
        "password": os.environ.get("SFTP_PASS", "") or "",
        "key_file": os.environ.get("SFTP_KEY_FILE", "").strip(),
        "key_passphrase": os.environ.get("SFTP_KEY_PASSPHRASE", "") or "",
        "remote_dir": (os.environ.get("SFTP_REMOTE_DIR", "/").strip() or "/"),
        "host_key_policy": os.environ.get("SFTP_HOST_KEY_POLICY", "auto").strip().lower(),
        "check_interval_sec": float(os.environ.get("CHECK_INTERVAL_SEC", "30") or 30),
        "upload_retry_sec": float(os.environ.get("UPLOAD_RETRY_SEC", "60") or 60),
        "force_reupload_sec": float(os.environ.get("FORCE_REUPLOAD_SEC", "0") or 0),
        "timeout_sec": float(os.environ.get("SFTP_TIMEOUT_SEC", "20") or 20),
    }


def _main_standalone():
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass

    logging.basicConfig(
        level=os.environ.get("LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s [%(levelname)s] %(message)s",
    )

    settings = _settings_from_env()
    # New variable, since the standalone script this replaces watched a
    # fixed list of individual files, not a directory. Point it at your
    # publish folder, e.g. WATCH_DIR=/home/user/tmux/docker/data/defcon-assistant/publish
    watch_dir = os.environ.get("WATCH_DIR", "./publish").strip() or "./publish"

    if not settings["host"] or not settings["user"]:
        print("SFTP_HOST/SFTP_USER missing -- please check your .env "
              "(same variable names as the old sftpupload.py; see this "
              "file's docstring). Note: this standalone mode is for "
              "local testing only -- the app itself is configured via "
              "the web UI (Settings -> SFTP Publish Sync), not via .env.",
              file=sys.stderr)
        sys.exit(1)
    if not os.path.isdir(watch_dir):
        print(f"Watch directory does not exist: {watch_dir}\n"
              f"Set WATCH_DIR to point at your publish directory, e.g.:\n"
              f"  WATCH_DIR=/home/user/tmux/docker/data/defcon-assistant/publish python3 sftp_sync.py",
              file=sys.stderr)
        sys.exit(1)

    log.info("Standalone mode: watching '%s' -> %s@%s:%s%s (every %.0fs, Ctrl+C to stop)",
              watch_dir, settings["user"], settings["host"], settings["port"],
              settings["remote_dir"], settings["check_interval_sec"])

    service = SftpSyncService(lambda: settings, lambda: watch_dir)
    service.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print()  # newline after ^C
        log.info("Stopping ...")
        service.stop()


if __name__ == "__main__":
    _main_standalone()
