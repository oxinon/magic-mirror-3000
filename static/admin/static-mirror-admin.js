/* static-mirror-admin.js -- controls for the "Statische Spiegel-Kopie" and
   "SFTP-Veröffentlichung" cards. Kept separate from admin.js on purpose so
   it doesn't need to understand admin.js's widget-list templating. Talks to
   the same API host as admin.js (relative /api/... paths). */
(() => {
    async function getJson(path) {
        const res = await fetch(path, { cache: 'no-store' });
        return res.json();
    }
    async function postJson(path, body) {
        const res = await fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return res.json();
    }
    function flash(el, msg, ok) {
        el.textContent = msg;
        el.className = 'mm-save-msg ' + (ok ? 'ok' : 'error');
        setTimeout(() => { el.textContent = ''; el.className = 'mm-save-msg'; }, 4000);
    }
    function fmtTs(ts) {
        if (!ts) return 'noch nie';
        return new Date(ts * 1000).toLocaleString('de-DE');
    }

    // ---------------- Statische Spiegel-Kopie ----------------
    window.smSaveSettings = async function () {
        const msgEl = document.getElementById('smStatusMsg');
        const body = {
            enabled: document.getElementById('smEnabled').checked,
            interval_min: Number(document.getElementById('smInterval').value) || 30,
            publish_dir: document.getElementById('smPublishDir').value,
            fonts_dir: document.getElementById('smFontsDir').value,
        };
        const data = await postJson('/api/static-mirror/settings', body);
        flash(msgEl, data.ok ? 'Gespeichert.' : (data.msg || 'Fehler beim Speichern.'), data.ok);
    };

    window.smRenderNow = async function () {
        const msgEl = document.getElementById('smStatusMsg');
        flash(msgEl, 'Rendere …', true);
        const data = await postJson('/api/static-mirror/render-now', {});
        flash(msgEl, data.ok ? 'Kopie aktualisiert.' : (data.msg || 'Rendern fehlgeschlagen.'), data.ok);
    };

    async function smLoadSettings() {
        const data = await getJson('/api/static-mirror/settings');
        if (!data.ok) return;
        const s = data.settings;
        document.getElementById('smEnabled').checked = !!s.enabled;
        document.getElementById('smInterval').value = s.interval_min || 30;
        document.getElementById('smPublishDir').value = s.publish_dir || '';
        document.getElementById('smFontsDir').value = s.fonts_dir || '';
    }

    async function smPollStatus() {
        const data = await getJson('/api/static-mirror/status');
        if (!data.ok) return;
        const msgEl = document.getElementById('smStatusMsg');
        if (!msgEl.textContent) {
            const state = data.running ? 'aktiv' : 'gestoppt';
            msgEl.textContent = `${state} · zuletzt gerendert: ${fmtTs(data.last_render_ts)}` +
                (data.last_error ? ` · Fehler: ${data.last_error}` : '');
            msgEl.className = 'mm-save-msg mm-hint';
        }
    }

    // ---------------- SFTP-Veröffentlichung ----------------
    window.sftpSaveSettings = async function () {
        const msgEl = document.getElementById('sftpStatusMsg');
        const body = {
            enabled: document.getElementById('sftpEnabled').checked,
            host: document.getElementById('sftpHost').value,
            port: Number(document.getElementById('sftpPort').value) || 22,
            user: document.getElementById('sftpUser').value,
            password: document.getElementById('sftpPassword').value,
            key_file: document.getElementById('sftpKeyFile').value,
            remote_dir: document.getElementById('sftpRemoteDir').value,
        };
        const data = await postJson('/api/sftp/settings', body);
        flash(msgEl, data.ok ? 'Gespeichert.' : (data.msg || 'Fehler beim Speichern.'), data.ok);
    };

    window.sftpTestConnection = async function () {
        const msgEl = document.getElementById('sftpStatusMsg');
        flash(msgEl, 'Teste Verbindung …', true);
        const body = {
            host: document.getElementById('sftpHost').value,
            port: Number(document.getElementById('sftpPort').value) || 22,
            user: document.getElementById('sftpUser').value,
            password: document.getElementById('sftpPassword').value,
            key_file: document.getElementById('sftpKeyFile').value,
            remote_dir: document.getElementById('sftpRemoteDir').value,
        };
        const data = await postJson('/api/sftp/test', body);
        flash(msgEl, data.ok ? (data.msg || 'Verbindung erfolgreich.') : (data.msg || 'Verbindung fehlgeschlagen.'), data.ok);
    };

    async function sftpLoadSettings() {
        const data = await getJson('/api/sftp/settings');
        if (!data.ok) return;
        const s = data.settings;
        document.getElementById('sftpEnabled').checked = !!s.enabled;
        document.getElementById('sftpHost').value = s.host || '';
        document.getElementById('sftpPort').value = s.port || 22;
        document.getElementById('sftpUser').value = s.user || '';
        document.getElementById('sftpPassword').value = s.password || '';
        document.getElementById('sftpKeyFile').value = s.key_file || '';
        document.getElementById('sftpRemoteDir').value = s.remote_dir || '';
    }

    async function sftpPollStatus() {
        const data = await getJson('/api/sftp/status');
        if (!data.ok) return;
        const msgEl = document.getElementById('sftpStatusMsg');
        if (!msgEl.textContent) {
            const state = data.running ? 'aktiv' : 'gestoppt';
            msgEl.textContent = `${state} · letzter Upload: ${fmtTs(data.last_success_ts)}` +
                (data.last_error ? ` · Fehler: ${data.last_error}` : '');
            msgEl.className = 'mm-save-msg mm-hint';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        smLoadSettings();
        sftpLoadSettings();
        smPollStatus();
        sftpPollStatus();
        setInterval(smPollStatus, 15000);
        setInterval(sftpPollStatus, 15000);
    });
})();
