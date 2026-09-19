# Magic Mirror 3000

A self-hosted, dockerized take on the classic [MagicMirror²](https://magicmirror.builders/) project: a
fullscreen dashboard for a wall-mounted display or a real two-way mirror, plus a separate admin panel to
configure everything — no editing config files by hand.

🇩🇪 [Deutsche Version dieser Anleitung](README_DE.md)

![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)

One container, four ports:

| Port | Purpose |
|------|---------|
| **5031** | Admin UI — enable widgets, position them, edit their settings |
| **5032** | Fullscreen mirror display — open this on the screen/kiosk browser |
| **5033** | Mobile-friendly Shopping List editor — open on your phone |
| **5034** | Mobile-friendly To-Do editor — open on your phone |

All four run from a single `app.py` (four Flask instances in one process). The fullscreen display fetches
its data from the admin port via `fetch()`, so all ports need to be reachable from whatever device shows the
mirror.

![Magic Mirror Screenshot](pictures/1.png)

## Features

- **16-slot grid (4×4)** — position every widget freely; several widgets can span 1–4 tiles wide
- **German / English UI toggle** — switches both the mirror display and the admin panel itself, live, no
  page reload
- **No mandatory API keys** — almost everything runs on free, keyless public APIs; the few widgets that need
  credentials (Google Calendar, your own DEFCON API) use your own values, never a shared key
- **Live-editable from a web UI** — widget settings persist to `config.json` and the mirror picks up changes
  within 60 seconds, no container restart needed
- **Mobile-friendly list editors** — the Shopping List and To-Do widgets each get their own dedicated,
  phone-sized page (ports 5033/5034) so you can add or check off items straight from your smartphone
- **Swipe navigation on touchscreens** — swipe left/right on a kiosk touch display to loop between the
  mirror, the shopping list and the to-do list, and edit lists directly on the screen
- **Automatic static snapshot publishing** — periodically export a fully self-contained HTML copy of the
  mirror and push it to a remote web server via SFTP (see [below](#static-mirror-export--sftp-publishing))

## Widgets

- **Clock & Date** — 12/24h, seconds on/off, date on/off, locale, bold toggle, width 1–4 tiles
- **Google Calendar** — via the private iCal address (read-only, no Google Cloud credentials needed)
- **Weather** — live data from Open-Meteo (no API key). Pick a location via the built-in search (Open-Meteo
  geocoding), °C/°F, plus self-calculated warnings (storm/heat/cold/thunderstorm) with amber/red severity
  coloring
- **News feed** — any number of RSS/Atom sources, rotate automatically on the mirror (interval
  configurable), widget can span 1–4 tiles
- **Crypto prices** — any CoinGecko coin ID (e.g. `bitcoin`, `ethereum`, `solana`), price + 24h change,
  choose the base currency
- **Notes / To-Do** — freely editable checklist. Display-only on the mirror itself; edit from the admin
  panel or from your phone at its own dedicated page on **port 5034**
- **Shopping List** — freely editable checklist, same behavior as Notes/To-Do; edit from the admin panel or
  from your phone at its own dedicated page on **port 5033**. Checked-off items are hidden on the mirror, so
  it only ever shows what's still needed
- **Quote of the Day** — changes automatically at midnight, your own list of quotes (text + author), no
  external service
- **Stock prices** — via Yahoo Finance (no API key, slightly delayed), e.g. `AAPL`, `MSFT`, `SAP.DE`
- **Server status** — shows the running state of your other Docker containers from the same stack (green =
  running, red = stopped), max 4 at once, rotates automatically if there are more; needs read access to the
  Docker socket (see below)
- **Official warnings** — current warnings for a location (e.g. via NINA, Germany's civil-protection API)
  bundling severe-weather warnings with other official alerts
- **Air quality** — European Air Quality Index, particulate matter (PM2.5/PM10) and ozone via Open-Meteo
- **River water level** — current water level via an official waterways-authority API (default example: the
  Elbe at Hamburg St. Pauli via Germany's PEGELONLINE)
- **Environment Station** — live readings from your own T-Display-S3 sensor station: temperature, humidity,
  pressure and a self-computed air quality index (IAQ), plus an **Earthquake Alert** indicator and a
  **Digital Input** status chip (see [below](#environment-station))
- **Apocalypse Early Warning System** — tracks a cohort of business jets worldwide (ews.kylemcdonald.net by
  Kyle McDonald), warning level 1–5 based on how many are airborne at once compared to a learned baseline
- **DEFCON assessment** — plug in your own JSON API and show all regions with their current value,
  color-coded by severity (lower = more critical), max 4 regions at once with automatic rotation
- **Compliments** — the classic MagicMirror² widget: freely editable, rotating friendly messages, runs
  entirely locally

Every widget can be placed on any of the 16 tiles in the 4×4 grid via a click-grid in the admin panel.
Positions are internally named `r{row}-c{col}`, e.g. `r1-c1` (top-left) through `r4-c4` (bottom-right). All
settings are saved to `DATA_ROOT/config.json` and picked up by the mirror display within 60 seconds — no
container restart required.

## Language toggle

The gear menu in the admin panel (⚙️ top right) → "Language" switches between German and English — affects
both the mirror display and the admin panel itself, live, no page reload. Covers all system-generated text:
weekday/month names, field labels, buttons, hints, error messages, empty states, weather descriptions and
warnings.

Content you enter yourself (widget titles, quotes, notes, shopping items) or that comes from external
sources (calendar events, news headlines, region names from your DEFCON API) is never translated — it always
shows in whatever language it actually is.

**Title fields:** leave a widget's title field empty and it automatically shows the translated default name
(e.g. "Weather" / "Wetter" depending on the selected language). Type your own title and it stays fixed
regardless of language.

## Setting up Google Calendar

1. In Google Calendar: **Settings** → the calendar you want → "Integrate calendar" section.
2. Copy the **"Secret address in iCal format"**.
3. Paste it into the Calendar widget in the admin panel and save.

Note: only events within the configured window (default 14 days) are read. Complex recurring events (RRULE
with exceptions) are only considered by their original start date, not fully expanded — fine for a
wall-mounted overview, not a gapless scheduling tool.

## News feed

Add any number of RSS/Atom addresses as sources (Admin → News Feed → "Add source"). The mirror always shows
one source as a ticker and switches to the next automatically (default every 45s, adjustable under "Rotation
interval between sources").

Under "Width" the widget can expand across 1–4 tiles of its row (starting from the position chosen in the
4×4 grid, expanding rightward, clamped at the edge). Handy for a wide ticker along the bottom — just keep the
other tiles in that row empty, or widgets will overlap.

A few examples:
- BBC World: `https://feeds.bbci.co.uk/news/world/rss.xml`
- NPR: `https://feeds.npr.org/1004/rss.xml`
- Al Jazeera: `https://www.aljazeera.com/xml/rss/all.xml`

## Weather

Runs entirely without an API key via [Open-Meteo](https://open-meteo.com/). In the admin panel's Weather
widget, type a place into the search (e.g. "Berlin"), click a result — coordinates are filled in
automatically. The three thresholds (storm gusts, heat, cold) trigger a warning line in amber/red when
exceeded; these are self-calculated local thresholds, not an official warning from a weather service.

## Server status

Shows the status (running/stopped) of your other containers from the same `docker-compose.yml` — handy as a
quick overview right on the mirror. Needs read access to the Docker socket:

```yaml
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

Already included in the provided `docker-compose.snippet.yml`. Without this mount the widget shows a clear
error message instead of staying blank. Optionally enter a comma-separated list of container names in the
admin panel to show only specific containers (empty = all). Shows a maximum of 4 containers at once; with
more, it rotates automatically through groups of 4.

## Stock prices

Runs via Yahoo Finance's public chart endpoint, no API key (unofficial, but widely used and stable). Prices
are slightly delayed (not a real-time ticker), but plenty for an at-a-glance mirror widget. Symbol format:

- US stocks: `AAPL`, `MSFT`, `TSLA`, `NVDA`
- German stocks (suffix `.DE`): `SAP.DE`, `VOW3.DE` (VW), `BMW.DE`, `ALV.DE` (Allianz)
- Indices (prefix `^`): `^GDAXI` (DAX), `^GSPC` (S&P 500)
- Crypto: `BTC-USD`
- ETFs work the same as stocks, e.g. `VWCE.DE`

## Quote of the Day

Runs entirely locally, no external service. A list of quotes (text + author) is maintained in the admin
panel; which one is shown is derived from the current calendar day — changes automatically at midnight, stays
stable throughout the day.

## Official warnings

Runs via [NINA](https://warnung.bund.de/), the API behind Germany's official civil-protection warning app —
same data source used by the NINA app itself. Bundles severe-weather warnings together with other official
alerts (flooding, civil protection) for a region. No API key needed.

In the admin panel's Warnings widget, search for a location, click a result — if the search doesn't find a
place, try the postal code instead of the name (more reliable). Warnings always apply to the whole
district/borough, not street-level — that's a limitation of the source data itself.

## Air quality

Runs via the same Open-Meteo source as the Weather widget, no API key needed. Shows the European Air Quality
Index (0–100+, green/amber/red depending on severity) plus particulate matter (PM2.5, PM10) and ozone.
Location configurable in the admin panel via the same search as the Weather widget.

## River water level

Runs via [PEGELONLINE](https://www.pegelonline.wsv.de/) from Germany's Federal Waterways and Shipping
Administration (WSV) — official, free, and per its own documentation usable without authentication. The
example default is the Hamburg St. Pauli station on the Elbe. Other stations can be entered in the admin
panel by their (partial) official name, e.g. `CUXHAVEN`, `HAMBURG HARBURG`, `GEESTHACHT` — the full list of
stations is at
[pegelonline.wsv.de/webservices/rest-api/v2/stations.json](https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations.json).

## Environment Station

Widget for a self-built [T-Display-S3 environment/earthquake sensor](https://github.com/) station running on
your own network — no external service, no API key, just the sensor's own JSON status endpoint (e.g.
`http://192.168.1.50/api/status`).

Shows:
- **Temperature, humidity, pressure** and a self-computed **Air Quality Index (IAQ)**, using the same
  green/amber/red band coloring as the Air Quality widget
- **Earthquake Alert** — turns active when the sensor's accelerometer trigger (or its `quake_output` pin)
  detects a sudden shock/vibration. To make sure a brief trigger is never missed between polls, the backend
  **latches** an alert as "active" for 15 seconds after it fires, even if the sensor itself has already
  reset to calm
- **Digital Input** chip — green when the sensor's digital input is on, gray when off (reflects whatever
  you've wired to it, e.g. a door/window contact)

This widget is polled more frequently than the rest of the mirror (every 5 seconds by default) so that the
Earthquake Alert and Digital Input status stay responsive.

## Apocalypse Early Warning System

Widget for [ews.kylemcdonald.net](https://ews.kylemcdonald.net/) — a project that tracks a fixed cohort of
business jets worldwide via ADS-B flight data and compares the number airborne at once with a learned
baseline for time of day and weekday. Tongue-in-cheek framed as an "early warning system": if an unusually
large number of people with access to private jets are suddenly airborne at once, something might be going
on. Level 1–2 is normal operation, 4–5 is significantly above the expected value.

Uses a public but not officially documented stable API from the project. No API key needed. If the provider
ever changes the address, the widget shows an error message instead of stale/wrong data.

## DEFCON assessment

Shows all regions from your own JSON API as a tile list, each region with name + current value, color-coded
by severity. DEFCON convention: **lower number = more critical** — values ≤2 red, 2–3.5 amber, >3.5 green.

**Max 4 regions at once:** if your API returns more than 4 regions, the widget shows only 4 at a time and
rotates automatically to the next group — rotation interval configurable in the admin panel (default 15
seconds).

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

In the admin panel's DEFCON widget, enter the API address and optionally an API key (sent as an `X-API-Key`
header if set). If the mirror runs on the same Docker network as your API's container, the internal container
address works directly (e.g. `http://your-api-container:PORT/...`) — no detour through the public internet,
faster and independent of whether the public site is reachable.

## Shopping List & To-Do — mobile editing

Both list widgets (Shopping List, Notes/To-Do) can be edited three ways: directly in the admin panel, or from
their own dedicated, phone-sized page:

| Widget | Mobile edit page |
|---|---|
| Shopping List | `http://<server>:5033` |
| Notes / To-Do | `http://<server>:5034` |

Both pages share the mirror's dark/brass visual style, are safe-area aware (notch/home-indicator friendly),
and write straight into the same `config.json` the admin panel and mirror use — so a change made on your
phone shows up on the mirror within its normal refresh cycle, no sync step needed. Checked-off items move
into a collapsed "done" section; deleting an item removes it for good.

## Swipe navigation (touchscreen kiosk mode)

If you run the mirror on a touchscreen in kiosk mode, swipe left/right anywhere on the screen to move between
the three fullscreen pages in a loop:

```
Mirror (5032)  ⇄  Shopping List (5033)  ⇄  To-Do (5034)  ⇄  back to Mirror
```

This lets you add or check off items directly on the wall display, without pulling out your phone. Swiping
is a full page navigation (each screen is served from its own port), tuned with a horizontal distance
threshold and a vertical-tolerance/duration check so it won't misfire on scrolls or taps.

## Static mirror export & SFTP publishing

The mirror can periodically render itself into a single, fully self-contained `index.html` — same layout,
same live news ticker, same rotation — and automatically publish it to an external web server, so a website
elsewhere always shows an up-to-date copy of your mirror.

**How it works:**
- Every *N* minutes (default 30, configurable in the admin panel) the backend re-renders the current mirror
  state into one static `index.html` with all CSS, JavaScript and fonts inlined — zero external dependencies,
  so it can be uploaded anywhere and just works
- Sensitive configuration (your Google Calendar address, API keys, etc.) is stripped out before anything is
  written to the export — it never leaves your server
- The exported page auto-reloads itself periodically, so a browser tab left open on the published copy stays
  current without manual refreshing
- An SFTP watcher observes the local publish folder and uploads any changed file to your remote server
  (SHA-256 change detection, atomic upload via a temp-file rename)

**Admin panel controls:**

*Static Mirror Copy*
- "Auto-render" toggle + interval in minutes
- "Publish directory": local folder the `index.html` (plus fonts/assets) is written to. Default:
  `DATA_ROOT/publish`
- "Render now": triggers an immediate render regardless of the interval

*SFTP Publishing*
- Watches the publish directory above and uploads changed files by SFTP as soon as their content changes
- "Test connection" checks host/user/password-or-key before you switch it on

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
      - "5033:5033"   # shopping list mobile UI
      - "5034:5034"   # to-do mobile UI
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
- Mirror (kiosk browser in fullscreen, e.g. `chromium --kiosk http://<server>:5032`): `http://<server>:5032`
- Shopping list (phone): `http://<server>:5033`
- To-do (phone): `http://<server>:5034`

## Running locally without Docker

```bash
cd magic-mirror
pip install -r requirements.txt
DATA_ROOT=./data API_PORT=5031 MIRROR_PORT=5032 SHOPPING_PORT=5033 TODO_PORT=5034 python3 app.py
```

## Project structure

```
magic-mirror/
├── app.py                     # Flask backend (API + four static frontends)
├── static_export.py           # Self-contained static mirror snapshot renderer + scheduler
├── sftp_sync.py                # SFTP publish watcher
├── requirements.txt
├── Dockerfile
├── config/default_config.json # Factory defaults, copied on first run
└── static/
    ├── admin/                 # Admin UI (port 5031)
    │   ├── index.html
    │   ├── admin.js
    │   ├── static-mirror-admin.js  # Controls for static export + SFTP cards
    │   ├── style.css
    │   └── admin-extra.css
    ├── mirror/                # Fullscreen display (port 5032)
    │   ├── index.html
    │   ├── mirror.js
    │   ├── mirror.css
    │   └── swipe-nav.js
    ├── shopping/               # Shopping list mobile UI (port 5033)
    │   ├── index.html
    │   ├── shopping.js
    │   ├── shopping.css
    │   └── swipe-nav.js
    └── todo/                   # To-Do mobile UI (port 5034)
        ├── index.html
        ├── todo.js
        ├── todo.css
        └── swipe-nav.js
```

## Contributing

Issues and pull requests are welcome — this started as a personal project, so expect some rough edges outside
the author's own setup (Hamburg-centric defaults, for instance). Adding a new widget is generally a matter
of: one new route in `app.py`, one block in `widgetSpecificFields()` in `admin.js`, one renderer in
`mirror.js`, and an entry in `config/default_config.json`.

## License

[GNU General Public License v3.0](LICENSE) — you're free to use, modify, and redistribute this project,
including commercially; derivative works must be distributed under the same license and keep the source
code available.
