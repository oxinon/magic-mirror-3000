#!/usr/bin/env python3
"""
Magic Mirror – Backend
=======================
Ein Dienst, zwei Ports:
  - API_PORT   (Default 5031): Admin-/Konfigurationsoberfläche + REST-API
  - MIRROR_PORT(Default 5032): Fullscreen-Spiegel-Anzeige (statisch, holt sich
                                Daten per fetch() vom API_PORT)

Konfiguration liegt als JSON unter DATA_ROOT/config.json und wird beim
ersten Start aus config/default_config.json initialisiert.
"""
import json
import os
import threading
import time
from datetime import datetime, timedelta

import feedparser
import requests
import docker as docker_sdk
from dateutil import tz
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from icalendar import Calendar

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_ROOT = os.environ.get("DATA_ROOT", "/app/data")
CONFIG_PATH = os.path.join(DATA_ROOT, "config.json")
DEFAULT_CONFIG_PATH = os.path.join(BASE_DIR, "config", "default_config.json")

API_PORT = int(os.environ.get("API_PORT", "5031"))
MIRROR_PORT = int(os.environ.get("MIRROR_PORT", "5032"))

# Cache-Busting: ändert sich bei jedem Containerstart (= nach jedem Rebuild),
# damit Browser nach einem Update nicht versehentlich eine alte, gecachte
# admin.js/mirror.js weiterverwenden (führt sonst zu "Speichern wirkt nicht",
# weil das alte JS noch ein überholtes Konfigurationsformat schreibt).
ASSET_VERSION = str(int(time.time()))

os.makedirs(DATA_ROOT, exist_ok=True)

_config_lock = threading.Lock()

# Kleine In-Memory-Caches, damit Kalender/News/Krypto nicht bei jedem
# Mirror-Tick neu abgerufen werden.
_cache = {}
CACHE_TTL = {
    "calendar": 300,     # 5 Minuten
    "news": 600,         # 10 Minuten
    "crypto": 60,        # 60 Sekunden
    "weather": 600,      # 10 Minuten
    "stocks": 300,       # 5 Minuten
    "server-status": 20, # 20 Sekunden
    "warnings": 300,     # 5 Minuten
    "air-quality": 1800, # 30 Minuten
    "elbe-pegel": 900,   # 15 Minuten
    "ews": 1200,         # 20 Minuten (Quelle aktualisiert alle 30 Minuten)
    "defcon": 300,       # 5 Minuten
}


def cache_get(key):
    entry = _cache.get(key)
    if not entry:
        return None
    ts, data = entry
    if time.time() - ts > CACHE_TTL.get(key, 60):
        return None
    return data


def cache_set(key, data):
    _cache[key] = (time.time(), data)


# ---------------------------------------------------------------------------
# Konfiguration laden / speichern
# ---------------------------------------------------------------------------
def load_default_config():
    with open(DEFAULT_CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_config():
    with _config_lock:
        if not os.path.exists(CONFIG_PATH):
            cfg = load_default_config()
            save_config(cfg, lock=False)
            return cfg
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            cfg = json.load(f)
        # Nach einem Update können neue Widgets in der Werkskonfiguration dazugekommen
        # sein (z.B. das Warnungen-Widget). Fehlen sie in einer bestehenden, schon
        # gespeicherten config.json, werden sie ergänzt – bestehende, vom Nutzer
        # angepasste Widget-Einstellungen bleiben dabei unangetastet.
        default_cfg = load_default_config()
        cfg.setdefault("widgets", {})
        changed = False
        if "language" not in cfg:
            cfg["language"] = default_cfg.get("language", "de")
            changed = True
        for wid, wdefault in default_cfg.get("widgets", {}).items():
            if wid not in cfg["widgets"]:
                cfg["widgets"][wid] = wdefault
                changed = True
        # Alte 3x3-Positionsnamen (vor dem Umstieg auf das 4x4-Raster) auf das
        # neue Schema abbilden, damit betroffene Widgets nicht einfach
        # verschwinden.
        for wid, wcfg in cfg["widgets"].items():
            pos = wcfg.get("position")
            if pos in OLD_POSITION_MIGRATION:
                wcfg["position"] = OLD_POSITION_MIGRATION[pos]
                changed = True
            # Alte, unangetastete deutsche Standardtitel leeren, damit die
            # sprachabhängige Titel-Übersetzung greifen kann (siehe oben).
            if wcfg.get("title") == OLD_DEFAULT_TITLES.get(wid):
                wcfg["title"] = ""
                changed = True
        # Alte Stooq-Symbolschreibweise (z.B. "aapl.us") auf das
        # Yahoo-Finance-Format (z.B. "AAPL") migrieren, seit Stooq einen
        # Pflicht-API-Key verlangt und die Quelle wurde umgestellt.
        stocks_wcfg = cfg["widgets"].get("stocks")
        if stocks_wcfg and stocks_wcfg.get("symbols"):
            migrated = []
            for sym in stocks_wcfg["symbols"]:
                s = sym.strip()
                if s.lower().endswith(".us"):
                    s = s[:-3]
                migrated.append(s.upper() if "." not in s else s.upper())
            if migrated != stocks_wcfg["symbols"]:
                stocks_wcfg["symbols"] = migrated
                changed = True
        if changed:
            save_config(cfg, lock=False)
        return cfg


def save_config(cfg, lock=True):
    def _write():
        tmp_path = CONFIG_PATH + ".tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)
        os.replace(tmp_path, CONFIG_PATH)

    if lock:
        with _config_lock:
            _write()
    else:
        _write()


GRID_ROWS = 4
GRID_COLS = 4
POSITIONS = [f"r{r}-c{c}" for r in range(1, GRID_ROWS + 1) for c in range(1, GRID_COLS + 1)]

# Migration: bis vor kurzem lief der Spiegel mit einem 3x3-Raster und
# semantischen Positionsnamen (z.B. "top-left"). Bestehende, gespeicherte
# Konfigurationen enthalten noch diese alten Namen -- sie werden beim Laden
# automatisch auf sinnvolle Positionen im neuen 4x4-Raster abgebildet, statt
# dass die betroffenen Widgets stumm verschwinden.
OLD_POSITION_MIGRATION = {
    "top-left": "r1-c1", "top-center": "r1-c2", "top-right": "r1-c4",
    "middle-left": "r2-c1", "middle-center": "r2-c2", "middle-right": "r2-c4",
    "bottom-left": "r4-c1", "bottom-center": "r4-c2", "bottom-right": "r4-c4",
}

# Bis vor kurzem hatte jedes Widget einen fest eingetragenen deutschen
# Standardtitel (z.B. "Wetter"). Seit der Sprachumschaltung wird der Titel
# stattdessen dynamisch aus der gewählten Sprache abgeleitet, wenn das Feld
# leer ist. Bestehende, gespeicherte Titel, die exakt einem der alten
# Standardwerte entsprechen (also vermutlich nie bewusst angepasst wurden),
# werden einmalig geleert, damit z.B. ein Sprachwechsel auf Englisch auch bei
# schon laufenden Installationen sichtbar wird. Ein Titel, den jemand selbst
# eingetragen hat, bleibt unangetastet, auch wenn er zufällig gleich lautet.
OLD_DEFAULT_TITLES = {
    "clock": "Uhr", "calendar": "Kalender", "weather": "Wetter",
    "news": "Nachrichten", "crypto": "Krypto", "todo": "Notizen",
    "quote": "Zitat des Tages", "stocks": "Aktienkurse",
    "serverStatus": "Server-Status", "warnings": "Warnungen",
    "airQuality": "Luftqualität", "elbePegel": "Elbe-Pegel",
    "defcon": "DEFCON-Einschätzung",
}


# ---------------------------------------------------------------------------
# Flask Apps
# ---------------------------------------------------------------------------
api_app = Flask(__name__, static_folder=None)
CORS(api_app, resources={r"/api/*": {"origins": "*"}})

mirror_app = Flask(__name__, static_folder=None)


# ---- Admin (statisch) ------------------------------------------------------
@api_app.route("/")
@api_app.route("/index.html")
def admin_index():
    path = os.path.join(BASE_DIR, "static", "admin", "index.html")
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()
    html = html.replace("__MIRROR_PORT__", str(MIRROR_PORT))
    html = html.replace("__ASSET_VERSION__", ASSET_VERSION)
    return html, 200, {"Content-Type": "text/html; charset=utf-8"}


@api_app.route("/static/<path:path>")
def admin_static(path):
    return send_from_directory(os.path.join(BASE_DIR, "static", "admin"), path)


# ---- Mirror (statisch, eigener Port) ---------------------------------------
@mirror_app.route("/")
@mirror_app.route("/index.html")
def mirror_index():
    path = os.path.join(BASE_DIR, "static", "mirror", "index.html")
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()
    html = html.replace("__API_PORT__", str(API_PORT))
    html = html.replace("__ASSET_VERSION__", ASSET_VERSION)
    return html, 200, {"Content-Type": "text/html; charset=utf-8"}


@mirror_app.route("/static/<path:path>")
def mirror_static(path):
    return send_from_directory(os.path.join(BASE_DIR, "static", "mirror"), path)


# ---------------------------------------------------------------------------
# API: Konfiguration
# ---------------------------------------------------------------------------
@api_app.route("/api/config", methods=["GET"])
def api_get_config():
    return jsonify({"ok": True, "config": load_config()})


@api_app.route("/api/config", methods=["POST"])
def api_set_config():
    try:
        new_cfg = request.get_json(force=True)
        if not isinstance(new_cfg, dict) or "widgets" not in new_cfg:
            return jsonify({"ok": False, "msg": "Ungültiges Konfigurationsformat."}), 400
        if new_cfg.get("language") not in ("de", "en"):
            new_cfg["language"] = "de"
        for wid, wcfg in new_cfg.get("widgets", {}).items():
            pos = wcfg.get("position")
            if pos and pos not in POSITIONS:
                return jsonify({"ok": False, "msg": f"Ungültige Position '{pos}' bei Widget '{wid}'."}), 400
            if "span" in wcfg:
                try:
                    wcfg["span"] = max(1, min(GRID_COLS, int(wcfg["span"])))
                except (TypeError, ValueError):
                    wcfg["span"] = 1
        save_config(new_cfg)
        _cache.clear()
        return jsonify({"ok": True, "config": new_cfg})
    except Exception as e:
        return jsonify({"ok": False, "msg": str(e)}), 400


@api_app.route("/api/config/reset", methods=["POST"])
def api_reset_config():
    cfg = load_default_config()
    save_config(cfg)
    _cache.clear()
    return jsonify({"ok": True, "config": cfg})


# ---------------------------------------------------------------------------
# API: Kalender (private iCal-Adresse, read-only)
# ---------------------------------------------------------------------------
@api_app.route("/api/calendar")
def api_calendar():
    cfg = load_config()
    wcfg = cfg.get("widgets", {}).get("calendar", {})
    ical_url = (wcfg.get("icalUrl") or "").strip()
    max_events = int(wcfg.get("maxEvents", 8) or 8)
    days_ahead = int(wcfg.get("daysAhead", 14) or 14)

    if not ical_url:
        return jsonify({"ok": False, "msg": "Keine iCal-Adresse konfiguriert.", "events": []})

    cached = cache_get("calendar")
    if cached is not None:
        return jsonify({"ok": True, "events": cached[:max_events], "cached": True})

    try:
        resp = requests.get(ical_url, timeout=10)
        resp.raise_for_status()
        cal = Calendar.from_ical(resp.content)

        now = datetime.now(tz=tz.tzlocal())
        horizon = now + timedelta(days=days_ahead)
        events = []

        for component in cal.walk("VEVENT"):
            dtstart = component.get("dtstart")
            if dtstart is None:
                continue
            start = dtstart.dt
            # Ganztägige Termine (date statt datetime) auf lokale Zeit heben
            if not isinstance(start, datetime):
                start = datetime(start.year, start.month, start.day, tzinfo=tz.tzlocal())
            elif start.tzinfo is None:
                start = start.replace(tzinfo=tz.tzlocal())

            dtend = component.get("dtend")
            end = None
            if dtend is not None:
                end = dtend.dt
                if not isinstance(end, datetime):
                    end = datetime(end.year, end.month, end.day, tzinfo=tz.tzlocal())
                elif end.tzinfo is None:
                    end = end.replace(tzinfo=tz.tzlocal())

            # Einfache Behandlung: nur Termine im Fenster [now, horizon] anzeigen.
            # (Wiederkehrende Termine ohne RRULE-Expansion – siehe Hinweis in README.)
            if start < now - timedelta(hours=20) or start > horizon:
                continue

            events.append({
                "title": str(component.get("summary", "Ohne Titel")),
                "location": str(component.get("location", "") or ""),
                "start": start.isoformat(),
                "end": end.isoformat() if end else None,
                "allDay": not isinstance(dtstart.dt, datetime),
            })

        events.sort(key=lambda e: e["start"])
        cache_set("calendar", events)
        return jsonify({"ok": True, "events": events[:max_events]})
    except Exception as e:
        return jsonify({"ok": False, "msg": f"Kalender-Fehler: {e}", "events": []})


# ---------------------------------------------------------------------------
# API: News (mehrere RSS-Quellen im Wechsel)
# ---------------------------------------------------------------------------
@api_app.route("/api/news")
def api_news():
    cfg = load_config()
    wcfg = cfg.get("widgets", {}).get("news", {})
    sources = wcfg.get("sources") or []
    max_items = int(wcfg.get("maxItems", 8) or 8)

    if not sources:
        return jsonify({"ok": False, "msg": "Keine Nachrichtenquelle konfiguriert.", "sources": []})

    cache_key = "news:" + "|".join(s.get("feedUrl", "") for s in sources)
    cached = cache_get(cache_key)
    if cached is not None:
        return jsonify({"ok": True, "sources": cached, "cached": True})

    result = []
    for src in sources:
        name = src.get("name") or "Quelle"
        feed_url = (src.get("feedUrl") or "").strip()
        if not feed_url:
            continue
        try:
            parsed = feedparser.parse(feed_url)
            items = []
            for entry in parsed.entries[:40]:
                items.append({
                    "title": entry.get("title", ""),
                    "summary": (entry.get("summary", "") or "")[:280],
                    "link": entry.get("link", ""),
                    "published": entry.get("published", "") or entry.get("updated", ""),
                })
            result.append({"name": name, "items": items[:max_items], "ok": True})
        except Exception as e:
            result.append({"name": name, "items": [], "ok": False, "msg": str(e)})

    cache_set(cache_key, result)
    return jsonify({"ok": True, "sources": result})


# ---------------------------------------------------------------------------
# API: Krypto (CoinGecko, öffentlich, kein API-Key nötig)
# ---------------------------------------------------------------------------
@api_app.route("/api/crypto")
def api_crypto():
    cfg = load_config()
    wcfg = cfg.get("widgets", {}).get("crypto", {})
    symbols = wcfg.get("symbols") or ["bitcoin", "ethereum"]
    currency = (wcfg.get("currency") or "eur").lower()

    cache_key = "crypto:" + ",".join(symbols) + ":" + currency
    cached = cache_get(cache_key)
    if cached is not None:
        return jsonify({"ok": True, "prices": cached, "cached": True})

    try:
        ids = ",".join(symbols)
        r = requests.get(
            "https://api.coingecko.com/api/v3/simple/price",
            params={"ids": ids, "vs_currencies": currency, "include_24hr_change": "true"},
            timeout=10,
        )
        r.raise_for_status()
        data = r.json()
        prices = []
        for sym in symbols:
            entry = data.get(sym, {})
            prices.append({
                "id": sym,
                "ticker": crypto_ticker(sym),
                "price": entry.get(currency),
                "change24h": entry.get(f"{currency}_24h_change"),
                "currency": currency,
            })
        cache_set(cache_key, prices)
        return jsonify({"ok": True, "prices": prices})
    except Exception as e:
        return jsonify({"ok": False, "msg": f"Krypto-Fehler: {e}", "prices": []})


@api_app.route("/api/health")
def api_health():
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------
# API: DEFCON-Einschätzungen (ai-defcon.com / defcon-assistant)
# ---------------------------------------------------------------------------
def defcon_severity(value):
    """DEFCON-Prinzip: niedrigere Zahl = kritischer. Grobe Einteilung für die
    Ampelfarbe, angelehnt an die 1-7-Skala der anderen Widgets."""
    try:
        v = float(value)
    except (TypeError, ValueError):
        return 0
    if v <= 2:
        return 7  # rot
    if v <= 3.5:
        return 6  # amber
    return 0  # neutral/grün


@api_app.route("/api/defcon")
def api_defcon():
    cfg = load_config()
    wcfg = cfg.get("widgets", {}).get("defcon", {})
    url = (wcfg.get("url") or "").strip()
    api_key = (wcfg.get("apiKey") or "").strip()

    if not url:
        return jsonify({"ok": False, "msg": "Keine Quelladresse konfiguriert.", "regions": []})

    cache_key = f"defcon:{url}"
    cached = cache_get(cache_key)
    if cached is not None:
        return jsonify({"ok": True, **cached, "cached": True})

    try:
        headers = {"X-API-Key": api_key} if api_key else {}
        r = requests.get(url, headers=headers, timeout=10)
        r.raise_for_status()
        data = r.json()
        regions = []
        for entry in data.get("regions", []) or []:
            name = entry.get("name")
            value = entry.get("value")
            if not name or value is None:
                continue
            regions.append({
                "name": name,
                "value": value,
                "severity": defcon_severity(value),
            })
        result = {"regions": regions, "updated": data.get("updated")}
        cache_set(cache_key, result)
        return jsonify({"ok": True, **result})
    except Exception as e:
        return jsonify({"ok": False, "msg": f"DEFCON-Daten nicht abrufbar: {e}", "regions": []})


# ---------------------------------------------------------------------------
# API: Apocalypse Early Warning System (ews.kylemcdonald.net)
# ---------------------------------------------------------------------------
# Inoffizieller, öffentlicher Snapshot-Feed des Projekts (Cloudflare R2).
# Trackt eine feste Kohorte von Business-Jets über ADS-B Exchange und
# vergleicht die Anzahl gleichzeitig fliegender Maschinen mit einem
# gelernten Normalwert für Tageszeit/Wochentag. Da die URL nicht offiziell
# als stabile API dokumentiert ist, kann sie sich künftig ändern -- das
# Widget zeigt dann einfach eine Fehlermeldung statt Daten.
EWS_DASHBOARD_URL = "https://pub-49bb6a6f314c47be9b481c25e5f6ca9e.r2.dev/dashboard.json"


@api_app.route("/api/ews")
def api_ews():
    cache_key = "ews"
    cached = cache_get(cache_key)
    if cached is not None:
        return jsonify({"ok": True, **cached, "cached": True})

    try:
        r = requests.get(EWS_DASHBOARD_URL, timeout=15)
        r.raise_for_status()
        data = r.json()
        cur = data.get("current", {}) or {}
        live = data.get("liveStatus", {}) or {}
        result = {
            "emergencyLevel": cur.get("emergencyLevel"),
            "alertLevel": cur.get("alertLevel"),
            "concurrentCount": cur.get("concurrentCount"),
            "baselineMean": cur.get("baselineMean"),
            "zScore": cur.get("zScore"),
            "asOf": cur.get("asOf") or live.get("latestSampledAt"),
        }
        cache_set(cache_key, result)
        return jsonify({"ok": True, **result})
    except Exception as e:
        return jsonify({"ok": False, "msg": f"EWS nicht abrufbar: {e}"})


# ---------------------------------------------------------------------------
# API: Luftqualität (Open-Meteo, kein API-Key nötig)
# ---------------------------------------------------------------------------
@api_app.route("/api/air-quality")
def api_air_quality():
    cfg = load_config()
    wcfg = cfg.get("widgets", {}).get("airQuality", {})
    lat = wcfg.get("latitude")
    lon = wcfg.get("longitude")
    location_name = wcfg.get("location") or ""

    if lat is None or lon is None:
        return jsonify({"ok": False, "msg": "Kein Standort konfiguriert."})

    cache_key = f"air-quality:{lat}:{lon}"
    cached = cache_get(cache_key)
    if cached is not None:
        return jsonify({"ok": True, "airQuality": cached, "cached": True})

    try:
        r = requests.get(
            "https://air-quality-api.open-meteo.com/v1/air-quality",
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "european_aqi,pm10,pm2_5,ozone,nitrogen_dioxide",
                "timezone": "auto",
            },
            timeout=10,
        )
        r.raise_for_status()
        data = r.json()
        cur = data.get("current", {})
        result = {
            "location": location_name,
            "aqi": cur.get("european_aqi"),
            "pm10": cur.get("pm10"),
            "pm25": cur.get("pm2_5"),
            "ozone": cur.get("ozone"),
            "no2": cur.get("nitrogen_dioxide"),
        }
        cache_set(cache_key, result)
        return jsonify({"ok": True, "airQuality": result})
    except Exception as e:
        return jsonify({"ok": False, "msg": f"Luftqualität-Fehler: {e}"})


# ---------------------------------------------------------------------------
# API: Elbe-Pegelstand (PEGELONLINE / WSV, keine Authentifizierung nötig)
# ---------------------------------------------------------------------------
@api_app.route("/api/elbe-pegel")
def api_elbe_pegel():
    cfg = load_config()
    wcfg = cfg.get("widgets", {}).get("elbePegel", {})
    station_query = (wcfg.get("station") or "HAMBURG ST. PAULI").strip().upper()

    cache_key = f"elbe-pegel:{station_query}"
    cached = cache_get(cache_key)
    if cached is not None:
        return jsonify({"ok": True, **cached, "cached": True})

    try:
        r = requests.get(
            "https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations.json",
            params={"waters": "ELBE", "includeTimeseries": "true", "includeCurrentMeasurement": "true"},
            timeout=10,
        )
        r.raise_for_status()
        stations = r.json()
        match = None
        for s in stations if isinstance(stations, list) else []:
            longname = (s.get("longname") or "").upper()
            shortname = (s.get("shortname") or "").upper()
            if station_query in longname or station_query in shortname:
                match = s
                break

        if not match:
            return jsonify({"ok": False, "msg": f"Pegel „{station_query}“ nicht gefunden."})

        timeseries = match.get("timeseries") or []
        w_series = next((t for t in timeseries if t.get("shortname") == "W"), {})
        current = w_series.get("currentMeasurement") or {}

        result = {
            "station": match.get("longname"),
            "value": current.get("value"),
            "unit": w_series.get("unit", "cm"),
            "trend": current.get("trend"),
            "timestamp": current.get("timestamp"),
        }
        cache_set(cache_key, result)
        return jsonify({"ok": True, **result})
    except Exception as e:
        return jsonify({"ok": False, "msg": f"Pegel-Fehler: {e}"})


# ---------------------------------------------------------------------------
# API: Aktuelle amtliche Warnungen (NINA / Bundesamt für Bevölkerungsschutz)
# ---------------------------------------------------------------------------
# NINA bündelt DWD-Unwetterwarnungen zusammen mit Katastrophenschutz-Meldungen
# (MOWAS, KATWARN, BIWAPP, Hochwasser) für eine Region. Die Region wird über
# den Amtlichen Regionalschlüssel (ARS) adressiert, aber nur auf Kreisebene
# (die letzten 7 Stellen der 12-stelligen ARS sind immer "0000000").
@api_app.route("/api/ags-search")
def api_ags_search():
    query = (request.args.get("q") or "").strip()
    if not query:
        return jsonify({"ok": False, "msg": "Kein Suchbegriff.", "results": []})
    try:
        param_name = "postalCode" if (query.isdigit() and len(query) == 5) else "name"
        r = requests.get(
            "https://openplzapi.org/de/Localities",
            params={param_name: query},
            headers={"Accept": "text/json"},
            timeout=10,
        )
        r.raise_for_status()
        data = r.json()
        results = []
        seen = set()
        for loc in data if isinstance(data, list) else []:
            district = loc.get("district") or {}
            federal_state = loc.get("federalState") or {}
            district_key = district.get("key")
            if not district_key:
                continue
            ars = district_key.ljust(12, "0")
            if ars in seen:
                continue
            seen.add(ars)
            label_parts = [loc.get("name"), district.get("name"), federal_state.get("name")]
            results.append({
                "label": ", ".join(p for p in label_parts if p),
                "ars": ars,
            })
            if len(results) >= 8:
                break
        if not results:
            return jsonify({
                "ok": True, "results": [],
                "msg": "Keine Treffer. Versuch es mit der Postleitzahl statt dem Ortsnamen.",
            })
        return jsonify({"ok": True, "results": results})
    except Exception as e:
        return jsonify({"ok": False, "msg": f"Suche fehlgeschlagen: {e}", "results": []})


NINA_SEVERITY_MAP = {"Minor": 6, "Moderate": 6, "Severe": 7, "Extreme": 7}


@api_app.route("/api/warnings")
def api_warnings():
    cfg = load_config()
    wcfg = cfg.get("widgets", {}).get("warnings", {})
    ars = (wcfg.get("ars") or "").strip()
    location_label = wcfg.get("location") or ""

    if not ars:
        return jsonify({"ok": False, "msg": "Kein Standort konfiguriert.", "warnings": [], "location": location_label})

    cache_key = f"warnings:{ars}"
    cached = cache_get(cache_key)
    if cached is not None:
        return jsonify({"ok": True, "warnings": cached, "location": location_label, "cached": True})

    try:
        r = requests.get(f"https://warnung.bund.de/api31/dashboard/{ars}.json", timeout=10)
        r.raise_for_status()
        data = r.json()
        warnings = []
        for item in data if isinstance(data, list) else []:
            payload = item.get("payload", {}) or {}
            pdata = payload.get("data", {}) or {}
            title = (item.get("i18nTitle") or {}).get("de") or pdata.get("headline") or "Warnung"
            severity_raw = pdata.get("severity", "")
            warnings.append({
                "title": title,
                "provider": pdata.get("provider", ""),
                "severity": NINA_SEVERITY_MAP.get(severity_raw, 0),
                "sent": item.get("sent"),
            })
        cache_set(cache_key, warnings)
        return jsonify({"ok": True, "warnings": warnings, "location": location_label})
    except Exception as e:
        return jsonify({"ok": False, "msg": f"Warnungen nicht abrufbar: {e}", "warnings": [], "location": location_label})


# Kurz-Ticker für gängige CoinGecko-IDs, damit im Widget nicht der volle Name
# (z.B. "ethereum") steht, sondern das gewohnte Kürzel (z.B. "ETH").
CRYPTO_TICKERS = {
    "bitcoin": "BTC", "ethereum": "ETH", "solana": "SOL", "cardano": "ADA",
    "ripple": "XRP", "dogecoin": "DOGE", "polkadot": "DOT", "litecoin": "LTC",
    "chainlink": "LINK", "polygon": "MATIC", "matic-network": "MATIC",
    "avalanche-2": "AVAX", "tron": "TRX", "binancecoin": "BNB",
    "shiba-inu": "SHIB", "uniswap": "UNI", "stellar": "XLM", "monero": "XMR",
    "cosmos": "ATOM", "near": "NEAR", "internet-computer": "ICP",
    "filecoin": "FIL", "aptos": "APT", "arbitrum": "ARB", "optimism": "OP",
    "usd-coin": "USDC", "tether": "USDT", "dai": "DAI", "sui": "SUI",
    "toncoin": "TON", "hedera-hashgraph": "HBAR",
}


def crypto_ticker(coin_id):
    if coin_id in CRYPTO_TICKERS:
        return CRYPTO_TICKERS[coin_id]
    # Fallback: erste 4 Buchstaben der ID, in Großschreibung.
    return coin_id[:4].upper()


# ---------------------------------------------------------------------------
# API: Wetter (Open-Meteo, kein API-Key nötig)
# ---------------------------------------------------------------------------
# Grobe Zuordnung der WMO-Wettercodes (Open-Meteo) auf Beschreibung + Symbolgruppe.
WEATHER_CODES = {
    # code: (Beschreibung DE, Beschreibung EN, Symbolgruppe)
    0: ("Klarer Himmel", "Clear sky", "clear"),
    1: ("Überwiegend klar", "Mostly clear", "clear"),
    2: ("Teilweise bewölkt", "Partly cloudy", "cloudy"),
    3: ("Bedeckt", "Overcast", "cloudy"),
    45: ("Nebel", "Fog", "fog"),
    48: ("Reifnebel", "Rime fog", "fog"),
    51: ("Leichter Nieselregen", "Light drizzle", "rain"),
    53: ("Nieselregen", "Drizzle", "rain"),
    55: ("Starker Nieselregen", "Heavy drizzle", "rain"),
    56: ("Gefrierender Nieselregen", "Freezing drizzle", "rain"),
    57: ("Starker gefrierender Nieselregen", "Heavy freezing drizzle", "rain"),
    61: ("Leichter Regen", "Light rain", "rain"),
    63: ("Regen", "Rain", "rain"),
    65: ("Starker Regen", "Heavy rain", "rain"),
    66: ("Gefrierender Regen", "Freezing rain", "rain"),
    67: ("Starker gefrierender Regen", "Heavy freezing rain", "rain"),
    71: ("Leichter Schneefall", "Light snow", "snow"),
    73: ("Schneefall", "Snow", "snow"),
    75: ("Starker Schneefall", "Heavy snow", "snow"),
    77: ("Schneegriesel", "Snow grains", "snow"),
    80: ("Leichte Regenschauer", "Light showers", "rain"),
    81: ("Regenschauer", "Showers", "rain"),
    82: ("Heftige Regenschauer", "Violent showers", "rain"),
    85: ("Leichte Schneeschauer", "Light snow showers", "snow"),
    86: ("Starke Schneeschauer", "Heavy snow showers", "snow"),
    95: ("Gewitter", "Thunderstorm", "storm"),
    96: ("Gewitter mit Hagel", "Thunderstorm with hail", "storm"),
    99: ("Schweres Gewitter mit Hagel", "Severe thunderstorm with hail", "storm"),
}

WEATHER_ICON_GROUP = {
    "clear": "☀",
    "cloudy": "☁",
    "fog": "▒",
    "rain": "🌧",
    "snow": "❄",
    "storm": "⛈",
}


def weather_lookup(code, lang="de"):
    entry = WEATHER_CODES.get(int(code))
    if not entry:
        return ("Unbekannt" if lang != "en" else "Unknown"), WEATHER_ICON_GROUP.get("cloudy", "☁"), "cloudy"
    desc_de, desc_en, group = entry
    desc = desc_en if lang == "en" else desc_de
    return desc, WEATHER_ICON_GROUP.get(group, "☁"), group


WARNING_LABELS = {
    "de": {
        "storm": lambda v: f"Sturmböen {v} km/h",
        "heat": lambda v: f"Hitze {v}°C",
        "cold": lambda v: f"Kälte {v}°C",
        "thunderstorm": "Gewitter",
    },
    "en": {
        "storm": lambda v: f"Storm gusts {v} km/h",
        "heat": lambda v: f"Heat {v}°C",
        "cold": lambda v: f"Cold {v}°C",
        "thunderstorm": "Thunderstorm",
    },
}


@api_app.route("/api/weather")
def api_weather():
    cfg = load_config()
    lang = cfg.get("language", "de")
    wcfg = cfg.get("widgets", {}).get("weather", {})
    lat = wcfg.get("latitude")
    lon = wcfg.get("longitude")
    location_name = wcfg.get("location") or ""
    units = wcfg.get("units", "celsius")
    show_warnings = wcfg.get("showWarnings", True)
    wind_warn = float(wcfg.get("windWarnKmh", 60) or 60)
    heat_warn = float(wcfg.get("heatWarnC", 32) or 32)
    cold_warn = float(wcfg.get("coldWarnC", -10) or -10)

    if lat is None or lon is None:
        msg = "No location configured." if lang == "en" else "Kein Standort konfiguriert."
        return jsonify({"ok": False, "msg": msg})

    cache_key = f"weather:{lat}:{lon}:{units}:{lang}"
    cached = cache_get(cache_key)
    if cached is not None:
        return jsonify({"ok": True, "weather": cached, "cached": True})

    try:
        temp_unit = "fahrenheit" if units == "fahrenheit" else "celsius"
        r = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,apparent_temperature,relative_humidity_2m,"
                           "wind_speed_10m,wind_gusts_10m,weather_code",
                "temperature_unit": temp_unit,
                "wind_speed_unit": "kmh",
                "timezone": "auto",
            },
            timeout=10,
        )
        r.raise_for_status()
        data = r.json()
        cur = data.get("current", {})
        code = cur.get("weather_code", 0)
        desc, icon, group = weather_lookup(code, lang)

        temp = cur.get("temperature_2m")
        feels = cur.get("apparent_temperature")
        humidity = cur.get("relative_humidity_2m")
        wind = cur.get("wind_speed_10m")
        gusts = cur.get("wind_gusts_10m")

        warn_labels = WARNING_LABELS.get(lang, WARNING_LABELS["de"])
        warnings = []
        if show_warnings:
            if gusts is not None and gusts >= wind_warn:
                sev = 7 if gusts >= wind_warn + 20 else 6
                warnings.append({"label": warn_labels["storm"](round(gusts)), "severity": sev})
            if units != "fahrenheit" and temp is not None and temp >= heat_warn:
                sev = 7 if temp >= heat_warn + 4 else 6
                warnings.append({"label": warn_labels["heat"](round(temp)), "severity": sev})
            if units != "fahrenheit" and temp is not None and temp <= cold_warn:
                sev = 7 if temp <= cold_warn - 5 else 6
                warnings.append({"label": warn_labels["cold"](round(temp)), "severity": sev})
            if group == "storm":
                sev = 7 if code in (96, 99) else 6
                warnings.append({"label": warn_labels["thunderstorm"], "severity": sev})

        weather = {
            "location": location_name,
            "icon": icon,
            "description": desc,
            "temperature": temp,
            "feelsLike": feels,
            "humidity": humidity,
            "windSpeed": wind,
            "windGusts": gusts,
            "unit": "°F" if units == "fahrenheit" else "°C",
            "warnings": warnings,
        }
        cache_set(cache_key, weather)
        return jsonify({"ok": True, "weather": weather})
    except Exception as e:
        prefix = "Weather error" if lang == "en" else "Wetter-Fehler"
        return jsonify({"ok": False, "msg": f"{prefix}: {e}"})


@api_app.route("/api/geocode")
def api_geocode():
    query = (request.args.get("q") or "").strip()
    if not query:
        return jsonify({"ok": False, "msg": "Kein Suchbegriff.", "results": []})
    try:
        r = requests.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": query, "count": 5, "language": "de", "format": "json"},
            timeout=10,
        )
        r.raise_for_status()
        data = r.json()
        results = []
        for res in data.get("results", []) or []:
            parts = [res.get("name")]
            if res.get("admin1"):
                parts.append(res["admin1"])
            if res.get("country"):
                parts.append(res["country"])
            results.append({
                "label": ", ".join(p for p in parts if p),
                "latitude": res.get("latitude"),
                "longitude": res.get("longitude"),
            })
        return jsonify({"ok": True, "results": results})
    except Exception as e:
        return jsonify({"ok": False, "msg": f"Geocoding-Fehler: {e}", "results": []})


# ---------------------------------------------------------------------------
# API: Zitat des Tages
# ---------------------------------------------------------------------------
# Fallback, falls in der Konfiguration keine (oder keine mehr) Zitate stehen.
DEFAULT_QUOTES = [
    {"text": "Was du heute kannst besorgen, das verschiebe nicht auf morgen.", "author": "Sprichwort"},
    {"text": "Der Weg ist das Ziel.", "author": "Konfuzius"},
    {"text": "Nichts ist so beständig wie der Wandel.", "author": "Heraklit"},
    {"text": "Wer die Ruhe in sich selbst nicht findet, sucht sie vergebens anderswo.", "author": "La Rochefoucauld"},
    {"text": "Man sieht nur mit dem Herzen gut.", "author": "Antoine de Saint-Exupéry"},
]


@api_app.route("/api/quote")
def api_quote():
    cfg = load_config()
    wcfg = cfg.get("widgets", {}).get("quote", {})
    items = wcfg.get("items") or DEFAULT_QUOTES
    if not items:
        items = DEFAULT_QUOTES
    day_idx = datetime.now().timetuple().tm_yday
    idx = day_idx % len(items)
    return jsonify({"ok": True, "quote": items[idx]})


# ---------------------------------------------------------------------------
# API: Aktienkurse (Stooq, kein API-Key nötig, leicht verzögerte Kurse)
# ---------------------------------------------------------------------------
CURRENCY_SYMBOLS = {
    "USD": "$", "EUR": "€", "GBP": "£", "GBp": "£", "CHF": "CHF",
    "JPY": "¥", "CAD": "C$", "AUD": "A$", "HKD": "HK$",
}


@api_app.route("/api/stocks")
def api_stocks():
    cfg = load_config()
    wcfg = cfg.get("widgets", {}).get("stocks", {})
    symbols = wcfg.get("symbols") or []

    if not symbols:
        return jsonify({"ok": False, "msg": "Keine Symbole konfiguriert.", "quotes": []})

    cache_key = "stocks:" + ",".join(symbols)
    cached = cache_get(cache_key)
    if cached is not None:
        return jsonify({"ok": True, "quotes": cached, "cached": True})

    quotes = []
    for sym in symbols:
        try:
            # Yahoo Finance stellt keine offizielle API bereit, aber der Chart-
            # Endpunkt hinter der Webseite ist öffentlich abrufbar und braucht
            # keinen API-Key -- lediglich einen browserähnlichen User-Agent.
            r = requests.get(
                f"https://query1.finance.yahoo.com/v8/finance/chart/{sym}",
                params={"range": "5d", "interval": "1d"},
                headers={"User-Agent": "Mozilla/5.0 (compatible; MagicMirror/1.0)"},
                timeout=10,
            )
            r.raise_for_status()
            data = r.json()
            result = ((data.get("chart") or {}).get("result") or [None])[0]
            if not result:
                quotes.append({"symbol": sym.upper(), "ok": False, "msg": "Symbol nicht gefunden"})
                continue
            meta = result.get("meta", {}) or {}
            price = meta.get("regularMarketPrice")
            prev_close = meta.get("previousClose") or meta.get("chartPreviousClose")
            if price is None:
                quotes.append({"symbol": sym.upper(), "ok": False, "msg": "Keine Kursdaten"})
                continue
            change_pct = ((price - prev_close) / prev_close * 100) if prev_close else None
            currency_code = meta.get("currency") or ""
            quotes.append({
                "symbol": (meta.get("symbol") or sym).upper(),
                "price": price,
                "change24h": change_pct,
                "currency": CURRENCY_SYMBOLS.get(currency_code, currency_code),
                "ok": True,
            })
        except Exception as e:
            quotes.append({"symbol": sym.upper(), "ok": False, "msg": str(e)})

    cache_set(cache_key, quotes)
    return jsonify({"ok": True, "quotes": quotes})


# ---------------------------------------------------------------------------
# API: Server-Status (Docker-Container aus deinem eigenen Stack)
# ---------------------------------------------------------------------------
@api_app.route("/api/server-status")
def api_server_status():
    cfg = load_config()
    wcfg = cfg.get("widgets", {}).get("serverStatus", {})
    only_names = [n.strip() for n in (wcfg.get("filter") or "").split(",") if n.strip()]

    cached = cache_get("server-status")
    if cached is not None:
        return jsonify({"ok": True, **cached, "cached": True})

    try:
        client = docker_sdk.DockerClient(base_url="unix://var/run/docker.sock", timeout=5)
        containers = client.containers.list(all=True)
        items = []
        for c in containers:
            name = c.name
            if only_names and name not in only_names:
                continue
            items.append({"name": name, "status": c.status})
        items.sort(key=lambda x: x["name"])
        running = sum(1 for i in items if i["status"] == "running")
        result = {"containers": items, "running": running, "total": len(items)}
        cache_set("server-status", result)
        client.close()
        return jsonify({"ok": True, **result})
    except Exception as e:
        return jsonify({
            "ok": False,
            "msg": f"Docker nicht erreichbar: {e}. Ist /var/run/docker.sock im Container gemountet?",
            "containers": [], "running": 0, "total": 0,
        })


# ---------------------------------------------------------------------------
# Start
# ---------------------------------------------------------------------------
def run_mirror():
    mirror_app.run(host="0.0.0.0", port=MIRROR_PORT, threaded=True)


if __name__ == "__main__":
    t = threading.Thread(target=run_mirror, daemon=True)
    t.start()
    api_app.run(host="0.0.0.0", port=API_PORT, threaded=True)
