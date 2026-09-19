# Magic Mirror 3000 auf dem Raspberry Pi 4 – Kiosk-Setup

Diese Anleitung beschreibt die komplette Einrichtung von [Magic Mirror 3000](https://github.com/oxinon/magic-mirror-3000) auf einem Raspberry Pi 4 mit Raspberry Pi OS (Wayland/labwc), inklusive Docker-Installation, Kiosk-Browser (Chromium), unsichtbarem Mauszeiger, deaktivierten Systemmeldungen und automatischem Start beim Booten.

## Voraussetzungen

- Raspberry Pi 4 (empfohlen: mind. 2 GB RAM)
- Raspberry Pi OS mit Desktop (Bookworm/Trixie, Wayland-Session mit `labwc`)
- Internetzugang für Installation
- Angeschlossener Bildschirm

---

## 1. Autologin aktivieren

Der Pi soll ohne Login-Prompt direkt in den Desktop booten.

```bash
sudo raspi-config
```

→ **System Options** → **Boot / Auto Login** → **Desktop Autologin**

---

## 2. Session-Typ prüfen

```bash
echo $XDG_SESSION_TYPE
echo $XDG_CURRENT_DESKTOP
```

Diese Anleitung geht von **Wayland** mit **labwc** aus (Standard bei aktuellem Raspberry Pi OS).

---

## 3. Benötigte Pakete installieren

```bash
sudo apt update
sudo apt install -y chromium-browser wmctrl wlrctl x11-apps imagemagick
```

| Paket | Zweck |
|---|---|
| `chromium-browser` | Browser für den Kiosk-Modus |
| `wmctrl` | Prüfen, ob das Chromium-Fenster existiert |
| `wlrctl` | Simuliert Mausbewegungen unter Wayland/wlroots (Ersatz für `ydotool`, das unter Trixie nicht verfügbar ist) |
| `x11-apps` | liefert `xcursorgen` zum Erstellen des unsichtbaren Cursor-Themes |
| `imagemagick` | erzeugt das transparente Cursor-Bild |

---

## 4. Unsichtbares Cursor-Theme erstellen

Da `xcursor-transparent-theme` unter Trixie nicht verfügbar ist, wird das Theme manuell gebaut:

```bash
mkdir -p ~/.icons/invisible/cursors
cd ~/.icons/invisible/cursors

convert -size 32x32 xc:none invisible.png

cat > invisible.cursor.in <<'EOF'
32 0 0 invisible.png
EOF

xcursorgen invisible.cursor.in invisible
ln -s invisible left_ptr
ln -s invisible default

cd ~/.icons/invisible
cat > index.theme <<'EOF'
[Icon Theme]
Name=invisible
EOF
```

Theme aktivieren:

```bash
gsettings set org.gnome.desktop.interface cursor-theme 'invisible'
```

---

## 5. Docker installieren

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo reboot
```

Nach dem Neustart prüfen:

```bash
docker --version
docker compose version
```

---

## 6. Magic Mirror 3000 herunterladen und einrichten

```bash
cd ~
git clone https://github.com/oxinon/magic-mirror-3000.git
cd magic-mirror-3000
```

`docker-compose.yml` anlegen:

```bash
nano docker-compose.yml
```

Inhalt:

```yaml
services:
  magic-mirror:
    build:
      context: .
    container_name: magic-mirror
    ports:
      - "5031:5031"   # Admin-UI
      - "5032:5032"   # Vollbild-Mirror
    environment:
      - DATA_ROOT=/app/data
    volumes:
      - ./data:/app/data
      # nur nötig für das Server-Status-Widget:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    restart: unless-stopped
```

> Falls das **Server-Status-Widget** (zeigt andere laufende Container) nicht benötigt wird, kann die `docker.sock`-Zeile entfernt werden.

Container bauen und starten:

```bash
docker compose up -d --build
```

Der erste Build dauert auf dem Pi 4 einige Minuten. Status prüfen:

```bash
docker compose ps
docker compose logs -f
```

---

## 7. Widgets konfigurieren

Admin-Panel im lokalen Netzwerk öffnen (z. B. vom Laptop/Handy):

```
http://<PI-IP-ADRESSE>:5031
```

Pi-IP-Adresse ermitteln:

```bash
hostname -I
```

Im Admin-Panel: Widgets aktivieren, im 4×4-Raster positionieren, Standort für Wetter/Luftqualität/Warnungen suchen, News-Feeds hinzufügen usw. Änderungen werden automatisch in `config.json` gespeichert und spätestens nach 60 Sekunden vom Mirror-Display übernommen.

---

## 8. Kiosk-Startskript erstellen

```bash
mkdir -p ~/scripts
nano ~/scripts/kiosk.sh
```

Inhalt:

```bash
#!/bin/bash

# kurz warten, bis Desktop-Session vollständig geladen ist
sleep 5

# Cursor-Theme auf unsichtbar setzen
gsettings set org.gnome.desktop.interface cursor-theme 'invisible' 2>/dev/null

sleep 2

export XCURSOR_THEME=invisible
export XCURSOR_SIZE=24

# Chromium im Kiosk-Modus starten (lokaler Magic-Mirror-Container)
chromium-browser --kiosk \
  --ozone-platform=wayland \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-notifications \
  --no-first-run \
  --password-store=basic \
  --check-for-update-interval=31536000 \
  http://localhost:5032 &

# Warten, bis das Chromium-Fenster tatsächlich existiert
for i in $(seq 1 30); do
    if wmctrl -l 2>/dev/null | grep -qi "chromium"; then
        break
    fi
    sleep 0.5
done

sleep 1

# Maus minimal bewegen, um Cursor-Repaint zu erzwingen (dann unsichtbar)
wlrctl pointer move 5 0
sleep 0.1
wlrctl pointer move -5 0
```

Ausführbar machen:

```bash
chmod +x ~/scripts/kiosk.sh
```

---

## 9. Autostart einrichten

```bash
mkdir -p ~/.config/autostart
nano ~/.config/autostart/kiosk.desktop
```

Inhalt (Pfad ggf. an eigenen Benutzernamen anpassen, prüfen mit `echo $HOME`):

```ini
[Desktop Entry]
Type=Application
Name=Kiosk Chromium
Exec=/home/user/scripts/kiosk.sh
X-GNOME-Autostart-enabled=true
NoDisplay=false
```

---

## 10. Neustart und Test

```bash
sudo reboot
```

Nach dem Boot sollte der Pi automatisch einloggen, den Magic-Mirror-3000-Container starten (läuft dank `restart: unless-stopped` ohnehin dauerhaft im Hintergrund) und Chromium im Vollbild-Kiosk-Modus mit dem Dashboard öffnen — ohne sichtbaren Mauszeiger, ohne Passwort-Abfrage und ohne störende Systemmeldungen.

---

## Nützliche Befehle

| Befehl | Zweck |
|---|---|
| `docker compose logs -f` | Live-Logs des Magic-Mirror-Containers ansehen |
| `docker compose restart` | Container neu starten (z. B. nach Config-Problemen) |
| `docker compose down` | Container stoppen und entfernen |
| `docker compose up -d --build` | Container neu bauen (z. B. nach `git pull`) |
| `~/scripts/kiosk.sh` | Kiosk-Skript manuell testen |

## Projektstruktur (Magic Mirror 3000)

```
magic-mirror-3000/
├── app.py                     # Flask-Backend (API + beide Frontends)
├── requirements.txt
├── Dockerfile
├── docker-compose.yml         # selbst erstellt (siehe Schritt 6)
├── config/default_config.json # Werkseinstellungen
└── static/
    ├── admin/                 # Admin-UI (Port 5031)
    └── mirror/                # Vollbild-Anzeige (Port 5032)
```

## Quellen

- Magic Mirror 3000: https://github.com/oxinon/magic-mirror-3000
