# Magic Mirror 3000

Ein selbst gehosteter, dockerisierter Ableger des klassischen
[MagicMirror²](https://magicmirror.builders/)-Projekts: eine Fullscreen-Anzeige für einen
Wand-Bildschirm oder einen echten Zwei-Wege-Spiegel, plus eine eigene Admin-Oberfläche zum
Konfigurieren – kein manuelles Bearbeiten von Config-Dateien nötig.

🇬🇧 [English version of this guide](README.md)

![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)

Eigener Docker-Dienst. Zwei Ports:

| Port | Zweck |
|------|-------|
| **5031** | Admin-Oberfläche (Widgets aktivieren, Position wählen, Felder bearbeiten) |
| **5032** | Fullscreen-Spiegelanzeige (auf dem Raspberry Pi / Kiosk-Bildschirm öffnen) |

Beide laufen im selben Container, aus einem `app.py` heraus (zwei Flask-Instanzen in
einem Prozess). Der Fullscreen-Client holt sich seine Daten per `fetch()` vom
Admin-Port – deshalb müssen beide Ports von dem Gerät aus erreichbar sein, auf
dem der Spiegel läuft.

![Magic Mirror Screenshot](pictures/1.png)

## Features

- **16 Felder im 4×4-Raster** – jedes Widget frei positionierbar; mehrere Widgets können 1–4 Kacheln
  breit sein
- **Deutsch/Englisch-Umschaltung** – wirkt live auf Spiegelanzeige UND Konfigurationsseite, kein Neuladen
  nötig
- **Keine Pflicht-API-Keys** – fast alles läuft über freie, schlüssellose öffentliche APIs; die wenigen
  Widgets, die eigene Zugangsdaten brauchen (Google Kalender, deine eigene DEFCON-API), nutzen deine
  eigenen Werte, nie einen geteilten Schlüssel
- **Live editierbar über die Web-Oberfläche** – Widget-Einstellungen landen in `config.json`, der
  Spiegel übernimmt Änderungen innerhalb von 60 Sekunden, kein Container-Neustart nötig

## Widgets

- **Uhr & Datum** – 12/24h, Sekunden an/aus, Datum an/aus, Locale
- **Google Kalender** – über die private iCal-Adresse (read-only, keine
  Google-Cloud-Zugangsdaten nötig)
- **Wetter** – Live-Daten von Open-Meteo (kein API-Key nötig). Standort per
  eingebauter Ortssuche wählen (Geocoding über Open-Meteo), °C/°F, plus
  selbst berechnete Warnungen (Sturm/Hitze/Kälte/Gewitter) mit denselben
  Schwellenwert-Farben (Amber/Rot) wie in deinem World-Situation-Report
- **Nachrichten-Feed** – beliebig viele RSS-Quellen, werden auf dem Spiegel
  automatisch nacheinander durchgewechselt (Wechsel-Intervall einstellbar)
- **Krypto-Kurse** – beliebige CoinGecko-Coin-IDs (z.B. `bitcoin`, `ethereum`,
  `solana`), Kurs + 24h-Änderung, Basis-Währung wählbar
- **Notizen / To-Do** – frei editierbare Liste mit Erledigt-Haken; auf der
  Spiegelanzeige nur zur Anzeige, nicht anklickbar (Bearbeitung im Admin-Panel)
- **Zitat des Tages** – wechselt automatisch um Mitternacht, eigene Liste frei
  editierbar (Zitat + Autor), kein externer Dienst nötig
- **Aktienkurse** – über Yahoo Finance (kein API-Key, leicht
  verzögerte Kurse), z.B. `AAPL`, `MSFT`, `SAP.DE`
- **Server-Status** – zeigt den Laufstatus deiner anderen Docker-Container aus
  demselben Stack (grün = läuft, rot = gestoppt), maximal 4 gleichzeitig, bei
  mehr Containern im automatischen Wechsel; braucht Lesezugriff auf den
  Docker-Socket (siehe unten)
- **Amtliche Warnungen** – aktuelle Warnungen für einen Ort (z.B. Hamburg) über
  NINA (Bundesamt für Bevölkerungsschutz), bündelt DWD-Unwetterwarnungen mit
  weiteren amtlichen Meldungen (Hochwasser, Katastrophenschutz); standardmäßig
  bereits für Hamburg eingerichtet und aktiv
- **Luftqualität** – Europäischer Luftqualitätsindex, Feinstaub (PM2.5/PM10)
  und Ozon über Open-Meteo, standardmäßig für Hamburg eingerichtet
- **Elbe-Pegelstand** – aktueller Wasserstand über die offizielle
  PEGELONLINE-Schnittstelle der Wasserstraßen- und Schifffahrtsverwaltung,
  standardmäßig Pegel Hamburg St. Pauli
- **Apocalypse Early Warning System** – trackt eine Kohorte von
  Business-Jets weltweit (ews.kylemcdonald.net von Kyle McDonald),
  Warnstufe 1–5 je nachdem wie viele gleichzeitig in der Luft sind im
  Vergleich zum gelernten Normalwert
- **DEFCON-Einschätzung** – zeigt alle Regionen aus deiner eigenen
  ai-defcon.com/defcon-assistant-API mit aktuellem Wert, farbcodiert nach
  Kritikalität (niedriger = kritischer)
- **Komplimente** – klassisches Magic-Mirror-Widget, zeigt frei editierbare
  Sprüche im Wechsel an, läuft komplett lokal ohne externen Dienst

Jedes Widget kann einer von 16 Positionen in einem 4×4-Raster zugeordnet
werden (4 Zeilen × 4 Spalten) – per Klickraster im Admin-Panel. Positionen
heißen intern `r{Zeile}-c{Spalte}`, z.B. `r1-c1` (oben links) bis `r4-c4`
(unten rechts). Alle Einstellungen landen in `DATA_ROOT/config.json` und
werden von der Spiegelanzeige alle 60 Sekunden neu geladen (kein Neustart des
Containers nötig).

**Hinweis für bestehende Installationen:** Lief dein Spiegel vorher mit dem
alten 3×3-Raster, werden deine gespeicherten Positionen beim nächsten Start
automatisch auf sinnvolle Positionen im neuen 4×4-Raster übertragen – die
Widgets bleiben an vergleichbarer Stelle, die neu hinzugekommene Zeile/Spalte
in der Mitte bleibt zunächst frei für neue Widgets.

## Sprache der Spiegelanzeige und der Konfigurationsseite

Über das Zahnrad-Menü im Admin-Panel (⚙️ oben rechts) → „Sprache" lässt sich
zwischen Deutsch und Englisch umschalten – wirkt **sowohl auf die
Spiegelanzeige als auch auf die Konfigurationsseite selbst**. Betrifft alle
system-generierten Texte: Wochentage/Monatsnamen, Feldbeschriftungen,
Buttons, Hinweistexte, Fehlermeldungen, Leerzustände ("Keine Termine" /
"No upcoming events"), Wetter-Beschreibungen und Warnhinweise. Die
Konfigurationsseite übersetzt sich sofort beim Umschalten, ohne Neuladen der
Seite; die Spiegelanzeige übernimmt die neue Sprache beim nächsten
Config-Abgleich (spätestens nach 60 Sekunden).

Nicht übersetzt werden Inhalte, die du selbst eingibst (Widget-Titel, Zitate,
Notizen) oder die von externen Quellen kommen (Kalender-Termine, Nachrichten,
Region-Namen aus der DEFCON-API) – die zeigen immer die Sprache, in der sie
tatsächlich vorliegen.

**Titel-Felder:** Lässt du das Titel-Feld eines Widgets leer, wird automatisch
die Übersetzung des Standardnamens angezeigt (z.B. „Wetter" / „Weather" je
nach gewählter Sprache). Trägst du selbst einen Titel ein, bleibt der fest –
unabhängig von der Sprachauswahl. Lief dein Spiegel schon vor der
Sprachumschaltung, wurden die damals automatisch vergebenen deutschen
Standardtitel beim ersten Start danach automatisch geleert (nicht aber
Titel, die du selbst geändert hattest), damit der Sprachwechsel auch bei dir
sichtbar wird.

## Google Kalender einrichten

1. In Google Kalender: **Einstellungen** → gewünschter Kalender → Abschnitt
   „Kalender integrieren".
2. Die **„Geheime Adresse im iCal-Format"** kopieren (nicht die öffentliche
   iCal-Adresse, falls es einen Unterschied gibt – die geheime funktioniert
   auch bei privaten Kalendern).
3. Adresse im Admin-Panel beim Kalender-Widget einfügen und speichern.

Hinweis: Es werden nur Termine im gewählten Zeitfenster (Standard 14 Tage)
gelesen. Sehr komplexe wiederkehrende Termine (RRULE mit Ausnahmen) werden nur
anhand ihres ursprünglichen Starttermins berücksichtigt, nicht vollständig
expandiert – für den typischen Wandtafel-Überblick reicht das, für einen
lückenlosen Terminplaner nicht.

## Nachrichten-Feed

Beliebig viele RSS/Atom-Adressen als Quelle hinzufügen (Admin → Nachrichten-Feed
→ „Quelle hinzufügen"). Auf dem Spiegel wird immer eine Quelle als Laufband
gezeigt und automatisch zur nächsten gewechselt (Standard alle 45 s, unter
„Wechsel-Intervall zwischen Quellen" einstellbar).

Unter „Breite" lässt sich das Widget über 1 bis 4 Kacheln der Zeile
ausdehnen (ausgehend von der im 4×4-Raster gewählten Position, erweitert sich
nach rechts, klemmt am rechten Rand). Praktisch für einen breiten Ticker am
unteren Rand – lass dabei die anderen Kacheln in derselben Zeile frei, sonst
überlappen sich die Widgets.

Ein paar Beispiele:
- Tagesschau: `https://www.tagesschau.de/xml/rss2/`
- Spiegel: `https://www.spiegel.de/schlagzeilen/index.rss`
- Heise: `https://www.heise.de/rss/heise-atom.xml`

## Wetter

Läuft komplett ohne API-Key über [Open-Meteo](https://open-meteo.com/). Im
Admin-Panel beim Wetter-Widget einen Ort in die Suche eingeben (z.B. „Hamburg"),
Treffer aus der Liste anklicken – Koordinaten werden automatisch übernommen.
Die drei Schwellenwerte (Sturm-Böen, Hitze, Kälte) lösen bei Überschreitung
eine Warnzeile im selben Amber/Rot-Farbschema aus wie auf deiner
World-Situation-Report-Seite; das sind eigene, lokal berechnete Schwellenwerte,
keine offizielle Wetterwarnung eines Wetterdienstes.

## Server-Status

Zeigt den Status (läuft / gestoppt) deiner anderen Container aus derselben
`docker-compose.yml` an – praktisch als kleiner Überblick direkt auf dem
Spiegel. Braucht Lesezugriff auf den Docker-Socket:

```yaml
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
```

Steht bereits im mitgelieferten `docker-compose.snippet.yml`. Ohne diesen
Mount zeigt das Widget eine verständliche Fehlermeldung statt leer zu bleiben.
Im Admin-Panel kannst du optional eine Liste von Container-Namen eintragen,
um nur bestimmte Container anzuzeigen (leer = alle).

## Aktienkurse

Läuft über den öffentlichen Chart-Endpunkt von Yahoo Finance, ohne API-Key
(inoffiziell, aber weit verbreitet und stabil). Kurse sind leicht verzögert
(kein Echtzeit-Ticker), aber für einen Überblick auf dem Spiegel völlig
ausreichend. Symbol-Format:
- US-Aktien: `AAPL`, `MSFT`, `TSLA`, `NVDA`
- Deutsche Aktien (Suffix `.DE`): `SAP.DE`, `VOW3.DE` (VW), `BMW.DE`, `ALV.DE` (Allianz)
- Indizes (Präfix `^`): `^GDAXI` (DAX), `^GSPC` (S&P 500)
- Krypto: `BTC-USD`
- ETFs genauso wie Aktien, z.B. `VWCE.DE`

**Hinweis:** Bis Anfang 2026 lief dieses Widget über Stooq – die haben seither
einen Pflicht-API-Key eingeführt, daher der Wechsel zu Yahoo Finance. Alte,
im Stooq-Format gespeicherte Symbole (`aapl.us`) werden beim nächsten Start
automatisch ins neue Format (`AAPL`) migriert.

## Zitat des Tages

Läuft komplett lokal, ohne externen Dienst. Eine Liste von Zitaten (Text +
Autor) wird im Admin-Panel gepflegt; welches Zitat angezeigt wird, berechnet
sich aus dem aktuellen Kalendertag – wechselt also automatisch um Mitternacht,
bleibt aber den ganzen Tag über stabil.

## Amtliche Warnungen

Läuft über die [NINA-Schnittstelle](https://warnung.bund.de/) des Bundesamts
für Bevölkerungsschutz (BBK) – dieselbe Datenquelle wie die NINA-Warn-App.
Bündelt DWD-Unwetterwarnungen zusammen mit Katastrophenschutz-Meldungen
(MoWaS, Hochwasser, KATWARN, BIWAPP) für eine Region. Kein API-Key nötig,
standardmäßig bereits für Hamburg eingerichtet.

Im Admin-Panel beim Warnungen-Widget einen anderen Ort in die Suche eingeben,
Treffer anklicken – findet die Ortssuche nichts, probier es mit der
Postleitzahl statt dem Ortsnamen (funktioniert zuverlässiger). Die Warnungen
gelten immer für den ganzen Kreis bzw. die kreisfreie Stadt, nicht
straßengenau – so stellt es auch der Dienst selbst bereit.

## Luftqualität

Läuft über dieselbe Open-Meteo-Quelle wie das Wetter-Widget, kein API-Key
nötig. Zeigt den Europäischen Luftqualitätsindex (0–100+, grün/gelb/rot je
nach Belastung) sowie Feinstaub- (PM2.5, PM10) und Ozonwerte. Standort im
Admin-Panel über dieselbe Ortssuche wie beim Wetter-Widget einstellbar.

## Elbe-Pegelstand

Läuft über [PEGELONLINE](https://www.pegelonline.wsv.de/) der
Wasserstraßen- und Schifffahrtsverwaltung des Bundes (WSV) – offiziell,
kostenlos und laut deren eigener Dokumentation ganz ohne Authentifizierung.
Standardmäßig ist der Pegel **Hamburg St. Pauli** eingestellt. Andere
Elbe-Pegel lassen sich im Admin-Panel über die (Teil-)Bezeichnung eintragen,
z.B. `CUXHAVEN`, `HAMBURG HARBURG` oder `GEESTHACHT` – die vollständige Liste
aller Pegel findet sich unter
[pegelonline.wsv.de/webservices/rest-api/v2/stations.json](https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations.json).

## Apocalypse Early Warning System

Widget für [ews.kylemcdonald.net](https://ews.kylemcdonald.net/) – ein
Projekt, das eine feste Kohorte von Business-Jets weltweit über
ADS-B-Flugdaten trackt und die Anzahl gleichzeitig fliegender Maschinen mit
einem für Tageszeit und Wochentag gelernten Normalwert vergleicht.
Augenzwinkernd als „Frühwarnsystem" gedacht: Wenn plötzlich auffällig viele
Leute mit Zugang zu Privatjets gleichzeitig unterwegs sind, könnte etwas im
Gange sein. Warnstufe 1–2 ist normaler Betrieb, 4–5 deutlich über dem
Erwartungswert.

Nutzt einen öffentlichen, aber nicht offiziell als stabile API dokumentierten
Datenfeed des Projekts. Kein API-Key nötig. Falls der Anbieter die Adresse
mal ändert, zeigt das Widget eine Fehlermeldung statt falscher Daten.

## DEFCON-Einschätzung

Zeigt alle Regionen aus einer eigenen JSON-API (z.B. deiner
ai-defcon.com/defcon-assistant-Instanz) als Kachel-Liste, jede Region mit
Name + aktuellem Wert, farbcodiert nach Kritikalität. DEFCON-Prinzip:
**niedrigere Zahl = kritischer** – Werte ≤2 rot, 2–3.5 amber, >3.5 grün.

**Maximal 4 Regionen gleichzeitig:** Liefert die API mehr als 4 Regionen,
zeigt das Widget immer nur 4 auf einmal und wechselt automatisch zur
nächsten Gruppe – Wechsel-Intervall im Admin-Panel einstellbar (Standard
15 Sekunden).

**Erwartetes API-Format:**

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

`id` ist optional, `name` und `value` sind Pflicht. `trend` wird aktuell
nicht ausgewertet.

Im Admin-Panel beim DEFCON-Widget die API-Adresse eintragen und optional
einen API-Key (wird als `X-API-Key`-Header mitgeschickt, falls gesetzt).
Läuft der Spiegel im selben Docker-Netzwerk wie `defcon-assistant` (wie im
mitgelieferten `docker-compose.snippet.yml`), funktioniert die interne
Container-Adresse direkt:

```
http://defcon-assistant:5028/api/status.json
```

– ohne Umweg über das öffentliche Internet, schneller und unabhängig davon,
ob ai-defcon.com gerade erreichbar ist. „Breite" lässt sich wie bei Uhr,
Zitat und Nachrichten über 1–4 Kacheln einstellen; bei mehreren Regionen
lohnt sich eine breitere Kachel, da die Liste dann mehrspaltig umbricht.

## Einbindung in `docker-compose.yml`

Baustein für deine bestehende Compose-Datei (siehe
`docker-compose.snippet.yml` in diesem Repo):

```yaml
  magic-mirror:
    build:
      context: ./magic-mirror
    container_name: magic-mirror
    ports:
      - "5031:5031"   # Admin-Oberfläche
      - "5032:5032"   # Fullscreen-Spiegel
    environment:
      - DATA_ROOT=/app/data
    volumes:
      - ./data/magic-mirror:/app/data
      # Nur nötig, wenn das Server-Status-Widget aktiv ist:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    restart: unless-stopped
    networks:
      - docker-net
```

Projektordner anlegen und Dateien dort ablegen:

```bash
mkdir -p ./magic-mirror
# app.py, requirements.txt, Dockerfile, config/, static/ hierher kopieren
mkdir -p ./data/magic-mirror
```

Dann wie gewohnt:

```bash
docker compose up -d --build magic-mirror
```

- Admin: `http://<server>:5031`
- Spiegel (Kiosk-Browser im Fullscreen-Modus, z.B. `chromium --kiosk
  http://<server>:5032`): `http://<server>:5032`

## Lokal ohne Docker testen

```bash
cd magic-mirror
pip install -r requirements.txt
DATA_ROOT=./data API_PORT=5031 MIRROR_PORT=5032 python3 app.py
```

## Aufbau

```
magic-mirror/
├── app.py                     # Flask-Backend (API + zwei statische Frontends)
├── requirements.txt
├── Dockerfile
├── config/default_config.json # Werkseinstellung, wird beim ersten Start kopiert
└── static/
    ├── admin/                 # Konfigurationsoberfläche (Port 5031)
    │   ├── index.html
    │   ├── admin.js
    │   ├── style.css          # dein bestehendes Design-System
    │   └── admin-extra.css    # Zusatzkomponenten (Positions-Picker, Switches …)
    └── mirror/                # Fullscreen-Anzeige (Port 5032)
        ├── index.html
        ├── mirror.js
        └── mirror.css
```

## Mitwirken

Issues und Pull Requests sind willkommen – das Projekt hat als persönliches Setup angefangen, daher
sind manche Ecken außerhalb der ursprünglichen Umgebung (z.B. die Hamburg-lastigen Standardwerte) noch
nicht perfekt allgemeingültig. Ein neues Widget hinzuzufügen bedeutet in der Regel: eine neue Route in
`app.py`, ein Block in `widgetSpecificFields()` in `admin.js`, ein Renderer in `mirror.js`, sowie ein
Eintrag in `config/default_config.json`.

## Lizenz

[GNU General Public License v3.0](LICENSE) – du darfst dieses Projekt frei nutzen, verändern und
weiterverbreiten, auch kommerziell; abgeleitete Werke müssen unter derselben Lizenz stehen und ihren
Quellcode offenlegen.
