# Magic Mirror

A self-hosted, dockerized take on the classic [MagicMirror²](https://magicmirror.builders/) project: a
fullscreen dashboard for a wall-mounted display or a real two-way mirror, plus a separate admin panel
to configure everything — no editing config files by hand.

🇩🇪 [Deutsche Version dieser Anleitung](README_DE.md)

Two ports, one container:

| Port | Purpose |
|------|---------|
| **5031** | Admin UI — enable widgets, position them, edit their settings |
| **5032** | Fullscreen mirror display — open this on the screen/kiosk browser |

Both run from a single `app.py` (two Flask instances in one process). The fullscreen display fetches
its data from the admin port via `fetch()`, so both ports need to be reachable from whatever device
shows the mirror.

![Magic Mirror screenshot](pictures/1.png)

## Features

- **16-slot grid** (4×4) — position every widget freely; several widgets can span 1–4 tiles wide
- **German / English UI toggle** — switches both the mirror display and the admin panel itself, live,
  no page reload
- **No mandatory API keys** — almost everything runs on free, keyless public APIs; the few widgets that
  need credentials (Google Calendar, your own DEFCON API) use your own values, never a shared key
- **Live-editable from a web UI** — widget settings persist to `config.json` and the mirror picks up
  changes within 60 seconds, no container restart needed

## Widgets

- **Clock & Date** — 12/24h, seconds on/off, date on/off, locale, bold toggle, width 1–4 tiles
- **Google Calendar** — via the private iCal address (read-only, no Google Cloud credentials needed)
- **Weather** — live data from Open-Meteo (no API key). Pick a location via the built-in search
  (Open-Meteo geocoding), °C/°F, plus self-calculated warnings (storm/heat/cold/thunderstorm) with
  amber/red severity coloring
- **News feed** — any number of RSS/Atom sources, rotate automatically on the mirror (interval
  configurable), widget can span 1–4 tiles
- **Crypto prices** — any CoinGecko coin ID (e.g. `bitcoin`, `ethereum`, `solana`), price + 24h change,
  choose the base currency
- **Notes / To-Do** — freely editable list with done-checkboxes; display-only on the mirror itself
  (edit in the admin panel)
- **Quote of the Day** — changes automatically at midnight, your own list of quotes (text + author), no
  external service
- **Stock prices** — via Yahoo Finance (no API key, slightly delayed), e.g. `AAPL`, `MSFT`, `SAP.DE`
- **Server status** — shows the running state of your other Docker containers from the same stack
  (green = running, red = stopped), max 4 at once, rotates automatically if there are more; needs read
  access to the Docker socket (see below)
- **Official warnings** — current warnings for a location (e.g. via NINA, Germany's civil-protection
  API) bundling severe-weather warnings with other official alerts
- **Air quality** — European Air Quality Index, particulate matter (PM2.5/PM10) and ozone via
  Open-Meteo
- **River water level** — current water level via an official waterways-authority API (default example:
  the Elbe at Hamburg St. Pauli via Germany's PEGELONLINE)
- **Apocalypse Early Warning System** — tracks a cohort of business jets worldwide
  ([ews.kylemcdonald.net](https://ews.kylemcdonald.net/) by Kyle McDonald), warning level 1–5 based on
  how many are airborne at once compared to a learned baseline
- **DEFCON assessment** — plug in your own JSON API and show all regions with their current value,
  color-coded by severity (lower = more critical), max 4 regions at once with automatic rotation
- **Compliments** — the classic MagicMirror² widget: freely editable, rotating friendly messages, runs
  entirely locally

Every widget can be placed on any of the 16 tiles in the 4×4 grid via a click-grid in the admin panel.
Positions are internally named `r{row}-c{col}`, e.g. `r1-c1` (top-left) through `r4-c4` (bottom-right).
All settings are saved to `DATA_ROOT/config.json` and picked up by the mirror display within 60 seconds
— no container restart required.

## Language toggle

The gear menu in the admin panel (⚙️ top right) → "Language" switches between German and English —
affects **both the mirror display and the admin panel itself**, live, no page reload. Covers all
system-generated text: weekday/month names, field labels, buttons, hints, error messages, empty states,
weather descriptions and warnings.

Content you enter yourself (widget titles, quotes, notes) or that comes from external sources (calendar
events, news headlines, region names from your DEFCON API) is never translated — it always shows in
whatever language it actually is.

**Title fields:** leave a widget's title field empty and it automatically shows the translated default
name (e.g. "Weather" / "Wetter" depending on the selected language). Type your own title and it stays
fixed regardless of language.

## Setting up Google Calendar

1. In Google Calendar: **Settings** → the calendar you want → "Integrate calendar" section.
2. Copy the **"Secret address in iCal format"**.
3. Paste it into the Calendar widget in the admin panel and save.

Note: only events within the configured window (default 14 days) are read. Complex recurring events
(RRULE with exceptions) are only considered by their original start date, not fully expanded — fine for
a wall-mounted overview, not a gapless scheduling tool.

## News feed

Add any number of RSS/Atom addresses as sources (Admin → News Feed → "Add source"). The mirror always
shows one source as a ticker and switches to the next automatically (default every 45s, adjustable under
"Rotation interval between sources").

Under "Width" the widget can expand across 1–4 tiles of its row (starting from the position chosen in
the 4×4 grid, expanding rightward, clamped at the edge). Handy for a wide ticker along the bottom — just
keep the other tiles in that row empty, or widgets will overlap.

A few examples:
- BBC World: `https://feeds.bbci.co.uk/news/world/rss.xml`
- NPR: `https://feeds.npr.org/1004/rss.xml`
- Al Jazeera: `https://www.aljazeera.com/xml/rss/all.xml`

## Weather

Runs entirely without an API key via [Open-Meteo](https://open-meteo.com/). In the admin panel's
Weather widget, type a place into the search (e.g. "Berlin"), click a result — coordinates are filled
in automatically. The three thresholds (storm gusts, heat, cold) trigger a warning line in amber/red
when exceeded; these are self-calculated local thresholds, not an official warning from a weather
service.

## Server status

Shows the status (running/stopped) of your other containers from the same `docker-compose.yml` — handy
as a quick overview right on the mirror. Needs read access to the Docker socket:

```yaml
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

Already included in the provided `docker-compose.snippet.yml`. Without this mount the widget shows a
clear error message instead of staying blank. Optionally enter a comma-separated list of container names
in the admin panel to show only specific containers (empty = all). Shows a maximum of 4 containers at
once; with more, it rotates automatically through groups of 4.

## Stock prices

Runs via Yahoo Finance's public chart endpoint, no API key (unofficial, but widely used and stable).
Prices are slightly delayed (not a real-time ticker), but plenty for an at-a-glance mirror widget.
Symbol format:
- US stocks: `AAPL`, `MSFT`, `TSLA`, `NVDA`
- German stocks (suffix `.DE`): `SAP.DE`, `VOW3.DE` (VW), `BMW.DE`, `ALV.DE` (Allianz)
- Indices (prefix `^`): `^GDAXI` (DAX), `^GSPC` (S&P 500)
- Crypto: `BTC-USD`
- ETFs work the same as stocks, e.g. `VWCE.DE`

## Quote of the Day

Runs entirely locally, no external service. A list of quotes (text + author) is maintained in the admin
panel; which one is shown is derived from the current calendar day — changes automatically at midnight,
stays stable throughout the day.

## Official warnings

Runs via [NINA](https://warnung.bund.de/), the API behind Germany's official civil-protection warning
app — same data source used by the NINA app itself. Bundles severe-weather warnings together with other
official alerts (flooding, civil protection) for a region. No API key needed.

In the admin panel's Warnings widget, search for a location, click a result — if the search doesn't
find a place, try the postal code instead of the name (more reliable). Warnings always apply to the
whole district/borough, not street-level — that's a limitation of the source data itself.

## Air quality

Runs via the same Open-Meteo source as the Weather widget, no API key needed. Shows the European Air
Quality Index (0–100+, green/amber/red depending on severity) plus particulate matter (PM2.5, PM10) and
ozone. Location configurable in the admin panel via the same search as the Weather widget.

## River water level

Runs via [PEGELONLINE](https://www.pegelonline.wsv.de/) from Germany's Federal Waterways and Shipping
Administration (WSV) — official, free, and per its own documentation usable without authentication. The
example default is the **Hamburg St. Pauli** station on the Elbe. Other stations can be entered in the
admin panel by their (partial) official name, e.g. `CUXHAVEN`, `HAMBURG HARBURG`, `GEESTHACHT` — the
full list of stations is at
[pegelonline.wsv.de/webservices/rest-api/v2/stations.json](https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations.json).

## Apocalypse Early Warning System

Widget for [ews.kylemcdonald.net](https://ews.kylemcdonald.net/) — a project that tracks a fixed cohort
of business jets worldwide via ADS-B flight data and compares the number airborne at once with a
learned baseline for time of day and weekday. Tongue-in-cheek framed as an "early warning system":
if an unusually large number of people with access to private jets are suddenly airborne at once,
something might be going on. Level 1–2 is normal operation, 4–5 is significantly above the expected
value.

Uses a public but not officially documented stable API from the project. No API key needed. If the
provider ever changes the address, the widget shows an error message instead of stale/wrong data.

## DEFCON assessment

Shows all regions from your own JSON API as a tile list, each region with name + current value,
color-coded by severity. DEFCON convention: **lower number = more critical** — values ≤2 red, 2–3.5
amber, >3.5 green.

**Max 4 regions at once:** if your API returns more than 4 regions, the widget shows only 4 at a time
and rotates automatically to the next group — rotation interval configurable in the admin panel
(default 15 seconds).

**Expected API format:**

```json
{
  "updated": "2026-08-18T10:00:00Z",
  "regions": [
    { "id": "germany", "name": "Germany", "value": 3.4 },
    { "id": "usa",     "name": "USA",     "value": 3.8 },
    { "id": "russia",  "name": "Russia",  "value": 1.8 }
  ]
}
```

`id` is optional, `name` and `value` are required. `trend` is not currently evaluated.

In the admin panel's DEFCON widget, enter the API address and optionally an API key (sent as an
`X-API-Key` header if set). If the mirror runs on the same Docker network as your API's container, the
internal container address works directly (e.g. `http://your-api-container:PORT/...`) — no detour
through the public internet, faster and independent of whether the public site is reachable.

## Adding it to `docker-compose.yml`

Building block for your existing compose file (see `docker-compose.snippet.yml` in this repo):

```yaml
  magic-mirror:
    build:
      context: ./magic-mirror
    container_name: magic-mirror
    ports:
      - "5031:5031"   # admin UI
      - "5032:5032"   # fullscreen mirror
    environment:
      - DATA_ROOT=/app/data
    volumes:
      - ./data/magic-mirror:/app/data
      # only needed for the Server Status widget:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    restart: unless-stopped
    networks:
      - docker-net
```

Then, as usual:

```bash
docker compose up -d --build magic-mirror
```

- Admin: `http://<server>:5031`
- Mirror (kiosk browser in fullscreen, e.g. `chromium --kiosk http://<server>:5032`):
  `http://<server>:5032`

## Running locally without Docker

```bash
cd magic-mirror
pip install -r requirements.txt
DATA_ROOT=./data API_PORT=5031 MIRROR_PORT=5032 python3 app.py
```

## Project structure

```
magic-mirror/
├── app.py                     # Flask backend (API + both static frontends)
├── requirements.txt
├── Dockerfile
├── config/default_config.json # Factory defaults, copied on first run
└── static/
    ├── admin/                 # Admin UI (port 5031)
    │   ├── index.html
    │   ├── admin.js
    │   ├── style.css
    │   └── admin-extra.css
    └── mirror/                # Fullscreen display (port 5032)
        ├── index.html
        ├── mirror.js
        └── mirror.css
```

## Contributing

Issues and pull requests are welcome — this started as a personal project, so expect some rough edges
outside the author's own setup (Hamburg-centric defaults, for instance). Adding a new widget is
generally a matter of: one new route in `app.py`, one block in `widgetSpecificFields()` in `admin.js`,
one renderer in `mirror.js`, and an entry in `config/default_config.json`.
