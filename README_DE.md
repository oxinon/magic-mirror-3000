# Magic Mirror 3000

Ein selbst gehosteter, dockerisierter Ableger des klassischen
[MagicMirror²](https://magicmirror.builders/)-Projekts: eine Fullscreen-Anzeige für einen
Wand-Bildschirm oder einen echten Zwei-Wege-Spiegel, plus eine eigene Admin-Oberfläche zum
Konfigurieren – kein manuelles Bearbeiten von Config-Dateien nötig.

🇬🇧 [English version of this guide](README.md)

![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)

Ein Container, vier Ports:

| Port | Zweck |
|------|-------|
| **5031** | Admin-Oberfläche (Widgets aktivieren, Position wählen, Felder bearbeiten) |
| **5032** | Fullscreen-Spiegelanzeige (auf dem Raspberry Pi / Kiosk-Bildschirm öffnen) |
| **5033** | Mobile Einkaufslisten-Ansicht (auf dem Smartphone öffnen) |
| **5034** | Mobile Notizen-/To-Do-Ansicht (auf dem Smartphone öffnen) |

Alle vier laufen aus einem `app.py` heraus (vier Flask-Instanzen in einem Prozess). Der Fullscreen-Client
holt sich seine Daten per `fetch()` vom Admin-Port – deshalb müssen alle Ports von den Geräten aus erreichbar
sein, auf denen die jeweilige Seite läuft.

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
- **Mobile Listen-Editoren** – Einkaufsliste und Notizen/To-Do bekommen jeweils eine eigene, handy-gerechte
  Seite (Port 5033/5034), damit du unterwegs direkt vom Smartphone aus Einträge hinzufügen oder abhaken
  kannst
- **Swipe-Navigation auf Touchscreens** – auf einem Kiosk-Touchdisplay per Wisch-Geste zwischen Spiegel,
  Einkaufsliste und To-Do im Kreis wechseln und Listen direkt am Bildschirm bearbeiten
- **Automatische statische Veröffentlichung** – erzeugt in regelmäßigen Abständen eine eigenständige
  HTML-Kopie des Spiegels und lädt sie per SFTP auf einen externen Webserver hoch (siehe
  [weiter unten](#statische-spiegel-kopie--sftp-veröffentlichung))

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
  Spiegelanzeige nur zur Anzeige, nicht anklickbar. Bearbeitung im Admin-Panel oder
  bequem vom Handy aus über die eigene Seite auf **Port 5034**
- **Einkaufsliste** – frei editierbare Liste, gleiches Verhalten wie Notizen/To-Do; Bearbeitung
  im Admin-Panel oder vom Handy aus über die eigene Seite auf **Port 5033**. Erledigte
  Artikel werden auf dem Spiegel ausgeblendet – dort steht immer nur, was noch zu besorgen ist
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
- **Umweltstation** – Live-Werte deiner eigenen T-Display-S3-Sensorstation: Temperatur, Luftfeuchtigkeit,
  Luftdruck und ein selbst berechneter Luftqualitätsindex (IAQ), dazu eine **Earthquake Alert**-Anzeige
  und ein **Digitaler Eingang**-Statuschip (siehe [weiter unten](#umweltstation))
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
Notizen, Einkaufslisten-Artikel) oder die von externen Quellen kommen (Kalender-Termine, Nachrichten,
Region-Namen aus der DEFCON-API) – die zeigen immer die Sprache, in der sie
tatsächlich vorliegen.

**Titel-Felder:** Lässt du das Titel-Feld eines Widgets leer, wird automatisch
die Übersetzung des Standardnamens angezeigt (z.B. „Wetter" / „Weather" je
nach gewählter Sprache). Trägst du selbst einen Titel ein, bleibt der fest –
unabhängig von der Sprachauswahl.

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

## Umweltstation

Widget für eine selbst gebaute [T-Display-S3-Umwelt-/Erdbeben-Sensorstation](https://github.com/) im
eigenen Netzwerk – kein externer Dienst, kein API-Key, nur die eigene JSON-Status-Adresse des Sensors
(z.B. `http://192.168.1.50/api/status`).

Zeigt:
- **Temperatur, Luftfeuchtigkeit, Luftdruck** und einen selbst berechneten **Luftqualitätsindex (IAQ)**,
  mit derselben Grün/Amber/Rot-Farbcodierung wie das Luftqualität-Widget
- **Earthquake Alert** – wird aktiv, sobald der Beschleunigungs-Trigger des Sensors (bzw. sein
  `quake_output`-Pin) eine plötzliche Erschütterung erkennt. Damit ein kurzer Trigger zwischen zwei
  Abfragen nicht verloren geht, hält das Backend einen erkannten Alarm für 15 Sekunden als „aktiv"
  fest, selbst wenn der Sensor selbst zwischenzeitlich schon wieder auf Ruhig zurückgesprungen ist
- **Digitaler Eingang**-Chip – grün, wenn der digitale Eingang des Sensors an ist, grau wenn aus
  (bildet ab, was du dort angeschlossen hast, z.B. einen Tür-/Fensterkontakt)

Dieses Widget wird häufiger abgefragt als der Rest des Spiegels (standardmäßig alle 5 Sekunden), damit
Earthquake Alert und Digitaler Eingang zügig reagieren.

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

## Einkaufsliste & To-Do – mobile Bearbeitung

Beide Listen-Widgets (Einkaufsliste, Notizen/To-Do) lassen sich auf drei Wegen bearbeiten: direkt im
Admin-Panel, oder über ihre eigene, handy-gerechte Seite:

| Widget | Mobile Bearbeitungsseite |
|---|---|
| Einkaufsliste | `http://<server>:5033` |
| Notizen / To-Do | `http://<server>:5034` |

Beide Seiten übernehmen die dunkle Messing-Optik des Spiegels, sind safe-area-tauglich (Notch/Home-Indicator)
und schreiben direkt in dieselbe `config.json`, die auch Admin-Panel und Spiegel nutzen – eine Änderung vom
Handy aus erscheint also innerhalb des normalen Aktualisierungszyklus auf dem Spiegel, ganz ohne extra
Sync-Schritt. Abgehakte Artikel wandern in einen eingeklappten „Erledigt"-Bereich; Löschen entfernt den
Eintrag endgültig.

## Swipe-Navigation (Touchscreen-Kioskmodus)

Läuft der Spiegel auf einem Touchdisplay im Kioskmodus, kannst du überall auf dem Bildschirm nach links/rechts
wischen, um im Kreis zwischen den drei Fullscreen-Seiten zu wechseln:

```
Spiegel (5032)  ⇄  Einkaufsliste (5033)  ⇄  To-Do (5034)  ⇄  zurück zum Spiegel
```

So lassen sich Einträge direkt am Wanddisplay hinzufügen oder abhaken, ohne das Handy zu zücken. Ein Swipe
löst eine vollständige Seitennavigation aus (jede Ansicht läuft auf ihrem eigenen Port), abgestimmt über
einen horizontalen Mindestabstand sowie eine vertikale Toleranz-/Zeitgrenze, damit Scrollen oder Antippen
nicht versehentlich als Wisch-Geste erkannt wird.

## Statische Spiegel-Kopie + SFTP-Veröffentlichung

Der Spiegel kann sich in regelmäßigen Abständen selbst in eine einzelne, komplett eigenständige `index.html`
rendern – gleiches Layout, gleicher live laufender Nachrichten-Ticker, gleiche Rotation – und diese
automatisch auf einen externen Webserver veröffentlichen, sodass eine Webseite an anderer Stelle immer eine
aktuelle Kopie deines Spiegels zeigt.

**Funktionsweise:**
- Alle *X* Minuten (Standard 30, im Admin-Panel einstellbar) rendert das Backend den aktuellen Spiegel-Stand
  neu in eine statische `index.html` mit komplett eingebettetem CSS, JavaScript und Fonts – keine externen
  Abhängigkeiten, die Datei kann also einfach irgendwohin hochgeladen werden und funktioniert sofort
- Sensible Konfigurationswerte (deine Google-Kalender-Adresse, API-Keys usw.) werden vor dem Export
  herausgefiltert – sie verlassen deinen Server nie
- Die exportierte Seite lädt sich selbst regelmäßig neu, damit ein offen gelassener Browser-Tab auf der
  veröffentlichten Kopie automatisch aktuell bleibt
- Ein SFTP-Watcher beobachtet den lokalen Publish-Ordner und lädt jede geänderte Datei per SFTP auf deinen
  Zielserver hoch (SHA-256-Änderungserkennung, atomarer Upload per Temp-Datei-Umbenennung)

**Steuerung im Admin-Panel:**

*Statische Spiegel-Kopie*
- Toggle „Automatisch rendern" + Intervall in Minuten
- „Publish-Verzeichnis": lokaler Ordner, in den `index.html` (plus Fonts/Assets) geschrieben wird.
  Standard: `DATA_ROOT/publish`
- „Jetzt rendern": löst sofort einen Render aus, unabhängig vom Intervall

*SFTP-Veröffentlichung*
- Beobachtet das obige Publish-Verzeichnis und lädt geänderte Dateien hochkant per SFTP hoch, sobald sich
  ihr Inhalt ändert
- „Verbindung testen" prüft Host/User/Passwort-oder-Key, bevor du scharfschaltest

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
      - "5033:5033"   # Einkaufsliste (mobil)
      - "5034:5034"   # To-Do (mobil)
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
- Einkaufsliste (Handy): `http://<server>:5033`
- To-Do (Handy): `http://<server>:5034`

## Lokal ohne Docker testen

```bash
cd magic-mirror
pip install -r requirements.txt
DATA_ROOT=./data API_PORT=5031 MIRROR_PORT=5032 SHOPPING_PORT=5033 TODO_PORT=5034 python3 app.py
```

## Aufbau

```
magic-mirror/
├── app.py                     # Flask-Backend (API + vier statische Frontends)
├── static_export.py           # Renderer für die statische Spiegel-Kopie + Scheduler
├── sftp_sync.py                # SFTP-Publish-Watcher
├── requirements.txt
├── Dockerfile
├── config/default_config.json # Werkseinstellung, wird beim ersten Start kopiert
└── static/
    ├── admin/                 # Konfigurationsoberfläche (Port 5031)
    │   ├── index.html
    │   ├── admin.js
    │   ├── static-mirror-admin.js  # Steuerung für die Static-Export-/SFTP-Karten
    │   ├── style.css          # dein bestehendes Design-System
    │   └── admin-extra.css    # Zusatzkomponenten (Positions-Picker, Switches …)
    ├── mirror/                # Fullscreen-Anzeige (Port 5032)
    │   ├── index.html
    │   ├── mirror.js
    │   ├── mirror.css
    │   └── swipe-nav.js
    ├── shopping/               # Einkaufslisten-UI mobil (Port 5033)
    │   ├── index.html
    │   ├── shopping.js
    │   ├── shopping.css
    │   └── swipe-nav.js
    └── todo/                   # To-Do-UI mobil (Port 5034)
        ├── index.html
        ├── todo.js
        ├── todo.css
        └── swipe-nav.js
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
