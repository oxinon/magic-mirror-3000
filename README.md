# Statische Spiegel-Kopie + SFTP-Veröffentlichung

Erzeugt alle X Minuten (Standard 30, im Admin-UI einstellbar) eine
eigenständige `index.html`, die **exakt so aussieht wie die Live-Anzeige
auf Port 5032** – News-Ticker, Rotation und alle Animationen laufen weiter,
weil `mirror.js`/`mirror.css` unverändert mitkopiert werden und nur ihre
`fetch()`-Aufrufe auf eingebackene JSON-Daten umgeleitet werden (siehe
Kommentar oben in `static_export.py`, wenn du wissen willst, wie/warum).

## Dateien in diesem Paket

| Datei | Zielort auf deinem Server | Zweck |
|---|---|---|
| `static_export.py` | neben `app.py` | Rendert die statische Kopie + Scheduler-Thread |
| `sftp_sync.py` | neben `app.py` | (dein eigenes Modul, unverändert) SFTP-Upload |
| `app.py` | ersetzt deine bestehende `app.py` | siehe unten – nur ergänzt, sonst 1:1 dein Original |
| `admin_index.html` | `static/admin/index.html` | zwei neue Karten ergänzt |
| `static-mirror-admin.js` | `static/admin/static-mirror-admin.js` | JS für die neuen Karten |

**`app.py`** habe ich direkt patchen können (ich hatte deine Datei ja
vorliegen) – die Änderungen sind rein additiv: neue Imports, zwei neue
Settings-Dateien (`static_mirror_settings.json`, `sftp_settings.json` in
`DATA_ROOT`), acht neue `/api/...`-Routen, zwei Zeilen im Startblock. Nichts
an deiner bestehenden Logik wurde entfernt oder umgebaut – am besten kurz
`diff` gegen dein Original laufen lassen, bevor du deployest.

## requirements.txt

`sftp_sync.py` braucht `paramiko`:

```
paramiko
```

## Fonts

Deine `mirror.css` referenziert `/assets/fonts/inter-v13-latin-*.woff2` –
das ist in `app.py` (jedenfalls in der Version, die ich vorliegen hatte)
kein Flask-Route, wird also vermutlich von etwas vor Flask ausgeliefert
(nginx-Reverse-Proxy o.ä.) oder liegt einfach noch nicht im Repo. Trag im
Admin-UI unter "Statische Spiegel-Kopie" → "Fonts-Verzeichnis" den
tatsächlichen Pfad zu den vier `.woff2`-Dateien ein (z.B.
`/app/static/assets/fonts`). Bleibt das Feld leer, versucht der Export es
zunächst unter `static/mirror/assets/fonts`; findet er dort nichts, fällt
die exportierte Seite optisch kaum merklich auf die System-Sans-Serif
zurück (Layout/Farben/Ticker bleiben identisch).

## Wie die beiden neuen Karten im Admin-UI funktionieren

**Statische Spiegel-Kopie**
- Toggle "Automatisch rendern" + Intervall in Minuten
- "Publish-Verzeichnis": lokaler Ordner, in den `index.html` + `mirror.css`
  + `mirror.js` + `static-data.js` + `fetch-shim.js` + `assets/fonts/`
  geschrieben werden. Standard: `DATA_ROOT/publish`.
- "Jetzt rendern": löst sofort einen Render aus, unabhängig vom Intervall.

**SFTP-Veröffentlichung**
- Beobachtet exakt dieses Publish-Verzeichnis (dein `sftp_sync.py`, ganz
  ohne Änderung von mir) und lädt geänderte Dateien hochkant per SFTP hoch,
  sobald sich ihr Inhalt ändert (Hash-Vergleich).
- "Verbindung testen" prüft Host/User/Passwort-oder-Key, bevor du
  scharfschaltest.

Zu deiner ursprünglichen Idee mit `~/Bilder` / `gdrive:Bilder`: Da
`sftp_sync.py` die Dateien bereits direkt per SFTP zum Zielserver
hochlädt, brauchst du rclone/Google Drive nicht mehr als Zwischenschritt –
das Publish-Verzeichnis kann ein ganz gewöhnlicher lokaler Ordner sein.
Falls du zusätzlich (oder stattdessen) via rclone/Google Drive syncen
willst, sag Bescheid – das lässt sich als zweiter Watcher neben
`sftp_sync.py` ergänzen, nach demselben Muster.

## Kurzer Testlauf lokal

```bash
pip install paramiko --break-system-packages   # falls noch nicht installiert
DATA_ROOT=./data python3 app.py
# Admin-UI: http://localhost:5031
# Spiegel:  http://localhost:5032
# Im Admin-UI: Intervall setzen, Publish-Verzeichnis prüfen, "Jetzt rendern"
# klicken, dann prüfen ob z.B. ./data/publish/index.html im Browser
# genauso aussieht wie http://localhost:5032 (am besten in einem Tab ohne
# Netzwerkzugriff auf Port 5031 testen, um den Fetch-Shim wirklich zu
# verifizieren).
```
