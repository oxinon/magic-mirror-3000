// ── Theme (identisch zu den anderen Dashboards) ─────────────────────
function toggleSettingsPanel() {
    const panel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('settingsOverlay');
    const open = panel.classList.toggle('open');
    overlay.classList.toggle('open', open);
}
function closeSettingsPanel() {
    document.getElementById('settingsPanel').classList.remove('open');
    document.getElementById('settingsOverlay').classList.remove('open');
}
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSettingsPanel();
});

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('oxinonTheme', theme);
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeStateLabel');
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    if (themeLabel) themeLabel.textContent = theme === 'dark' ? at('onLabel') : at('offLabel');
}
function toggleDarkMode() {
    const current = document.documentElement.dataset.theme || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ── Übersetzungen der Admin-Oberfläche ───────────────────────────
const AT = {
    de: {
        subtitle: 'Widget-Konfiguration',
        settingsHeader: 'Einstellungen',
        appearanceLabel: 'Erscheinungsbild',
        darkMode: 'Dark Mode',
        onLabel: 'An',
        offLabel: 'Aus',
        mirrorSectionLabel: 'Spiegelanzeige',
        languageLabel: 'Sprache',
        configSectionLabel: 'Konfiguration',
        resetDefaults: 'Auf Standard zurücksetzen',
        previewHeading: 'Spiegel-Anzeige',
        previewBody: 'Die Fullscreen-Anzeige läuft auf einem eigenen Port und aktualisiert sich automatisch, sobald hier gespeichert wird (Konfiguration wird alle 60\u00a0s neu geladen).',
        openMirrorBtn: '🖥 Spiegel öffnen',
        widgetsHeading: 'Widgets',
        saveBtn: '💾 Speichern',
        resetConfirm: 'Wirklich alle Widgets auf die Standardeinstellungen zurücksetzen?',
        saveOk: 'Gespeichert ✓',
        saveErrorGeneric: 'Fehler beim Speichern.',
        saveServerUnreachable: 'Server nicht erreichbar.',
        posLabel: (r, c) => `Zeile ${r} · Spalte ${c}`,
        activeLabel: 'Aktiv',
        titleLabel: 'Titel',
        titlePlaceholder: 'Leer lassen = automatische Übersetzung',
        widthLabel: 'Breite (Anzahl Kacheln)',
        width1: '1 Kachel', width2: '2 Kacheln', width3: '3 Kacheln', width4: '4 Kacheln (ganze Reihe)',
        searchBtn: '🔍 Suchen',
        searching: 'Suche …',
        noResults: 'Keine Treffer.',
        searchFailed: 'Suche fehlgeschlagen.',
        currentPrefix: 'Aktuell',
        removeGeneric: 'Entfernen',

        widgetTitle_clock: 'Uhr & Datum',
        widgetTitle_calendar: 'Google Kalender',
        widgetTitle_weather: 'Wetter',
        widgetTitle_news: 'Nachrichten-Feed',
        widgetTitle_crypto: 'Krypto-Kurse',
        widgetTitle_stocks: 'Aktienkurse',
        widgetTitle_todo: 'Notizen / To-Do',
        widgetTitle_quote: 'Zitat des Tages',
        widgetTitle_serverStatus: 'Server-Status',
        widgetTitle_warnings: 'Amtliche Warnungen',
        widgetTitle_airQuality: 'Luftqualität',
        widgetTitle_elbePegel: 'Elbe-Pegelstand',
        widgetTitle_ews: 'Apocalypse EWS',
        widgetTitle_defcon: 'DEFCON-Einschätzung',
        widgetTitle_compliments: 'Komplimente',

        clockDateFormatLabel: 'Datumsformat (Locale)',
        clockDateFormatDe: 'Deutsch',
        clockDateFormatEn: 'Englisch (US)',
        clock24hLabel: '24-Stunden-Format',
        clockBoldLabel: 'Fett anzeigen',
        clockSecondsLabel: 'Sekunden anzeigen',
        clockDateLabel: 'Datum anzeigen',

        calIcalLabel: 'Private iCal-Adresse',
        calHint: 'Google Kalender → Einstellungen → gewünschter Kalender → „Geheime Adresse im iCal-Format" kopieren. Nur Lesezugriff, es wird nichts an Google zurückgeschrieben.',
        calMaxEventsLabel: 'Max. Anzahl Termine',
        calDaysAheadLabel: 'Zeitraum (Tage im Voraus)',

        weatherLocationLabel: 'Standort',
        weatherLocationPlaceholder: 'Ort suchen, z.B. Hamburg',
        weatherUnitLabel: 'Einheit',
        weatherWarningsToggle: 'Eigene Wetterwarnungen anzeigen',
        weatherStormLabel: 'Sturm ab (Böen km/h)',
        weatherHeatLabel: 'Hitze ab (°C)',
        weatherColdLabel: 'Kälte ab (°C)',
        weatherHint: 'Live-Daten von Open-Meteo, kein API-Key nötig. Warnungen sind selbst berechnete Schwellenwerte, keine offizielle Wetterwarnung eines Wetterdienstes.',

        newsSourcesLabel: 'Quellen (werden im Wechsel angezeigt)',
        newsNameColHeader: 'Anzeigename',
        newsUrlColHeader: 'RSS/Atom-Feed-Adresse (die eigentliche Feed-URL, keine normale Webseite)',
        newsAddSourceBtn: '+ Quelle hinzufügen',
        newsRemoveSource: 'Quelle entfernen',
        newsMaxItemsLabel: 'Max. Anzahl Meldungen je Quelle',
        newsScrollSpeedLabel: 'Lauf-Geschwindigkeit (Sek. je Durchlauf)',
        newsRotationLabel: 'Wechsel-Intervall zwischen Quellen (Sek.)',
        newsHint: 'Bei 2–4 Kacheln erweitert sich das Widget innerhalb seiner Zeile nach rechts (ausgehend von der gewählten Position im Raster links). Belege in dieser Zeile keine weiteren Widgets, sonst überlappen sie sich.',

        cryptoCoinsLabel: 'Coins (CoinGecko-IDs, z.B. bitcoin, ethereum, solana)',
        cryptoAddPlaceholder: 'Coin hinzufügen + Enter',
        cryptoAddBtn: '+ Hinzufügen',
        cryptoHint: 'ID muss der CoinGecko-Bezeichnung entsprechen, z.B. <code>bitcoin</code> statt <code>BTC</code>.',
        cryptoCurrencyLabel: 'Währung',

        todoEntriesLabel: 'Einträge',
        todoEntryPlaceholder: 'Eintrag',
        todoAddBtn: '+ Eintrag hinzufügen',
        todoHint: 'Wird nur angezeigt – auf der Spiegelanzeige selbst nicht anklickbar.',

        stocksSymbolsLabel: 'Symbole (Yahoo-Finance-Format)',
        stocksAddPlaceholder: 'Symbol hinzufügen + Enter',
        stocksAddBtn: '+ Hinzufügen',
        stocksHint: 'US-Aktien: <code>AAPL</code>, <code>MSFT</code>, <code>TSLA</code>, <code>NVDA</code> · Deutsche Aktien (Suffix <code>.DE</code>): <code>SAP.DE</code>, <code>VOW3.DE</code> (VW), <code>BMW.DE</code>, <code>ALV.DE</code> (Allianz) · Indizes (Präfix <code>^</code>): <code>^GDAXI</code> (DAX), <code>^GSPC</code> (S&amp;P 500) · Krypto: <code>BTC-USD</code> · ETFs genauso wie Aktien, z.B. <code>VWCE.DE</code>. Kein API-Key nötig, Kurse leicht verzögert.',

        quoteItemsLabel: 'Zitate (eines pro Tag, wechselt automatisch um Mitternacht)',
        quoteColHeaderText: 'Zitat',
        quoteColHeaderAuthor: 'Autor',
        quoteTextPlaceholder: 'Zitattext',
        quoteAuthorPlaceholder: 'Autor (optional)',
        quoteAddBtn: '+ Zitat hinzufügen',
        quoteRemove: 'Zitat entfernen',

        serverFilterLabel: 'Nur diese Container anzeigen (kommagetrennt, leer = alle)',
        serverRotationLabel: 'Wechsel-Intervall bei mehr als 4 Containern (Sek.)',
        serverHint: 'Zeigt maximal 4 Container gleichzeitig – bei mehr wird automatisch in 4er-Gruppen durchgewechselt. Braucht Lesezugriff auf den Docker-Socket. In der <code>docker-compose.yml</code> muss beim <code>magic-mirror</code>-Dienst <code>/var/run/docker.sock:/var/run/docker.sock:ro</code> als Volume eingetragen sein (steht bereits im mitgelieferten <code>docker-compose.snippet.yml</code>).',

        warnLocationLabel: 'Standort',
        warnOtherLocationPlaceholder: 'Anderer Ort oder Postleitzahl',
        warnHint: 'Quelle: NINA (Bundesamt für Bevölkerungsschutz), bündelt DWD-Unwetterwarnungen zusammen mit weiteren amtlichen Warnungen (Katastrophenschutz, Hochwasser) für die gewählte Region. Kein API-Key nötig. Findet die Suche einen Ort nicht, probier es mit der Postleitzahl statt dem Ortsnamen – das funktioniert zuverlässiger.',

        aqiLocationLabel: 'Standort',
        aqiHint: 'Live-Daten von Open-Meteo (dieselbe Quelle wie beim Wetter-Widget), kein API-Key nötig. Zeigt den Europäischen Luftqualitätsindex sowie Feinstaub- und Ozonwerte.',

        pegelStationLabel: 'Pegel-Bezeichnung',
        pegelHint: 'Quelle: PEGELONLINE der Wasserstraßen- und Schifffahrtsverwaltung (WSV), kein API-Key nötig. Standard ist der Pegel Hamburg St. Pauli. Andere Elbe-Pegel z.B. <code>CUXHAVEN</code>, <code>HAMBURG HARBURG</code>, <code>GEESTHACHT</code> – der Name muss (teilweise) mit der offiziellen Pegel-Bezeichnung übereinstimmen.',

        ewsHint: 'Quelle: <a href="https://ews.kylemcdonald.net/" target="_blank" rel="noopener">ews.kylemcdonald.net</a> von Kyle McDonald. Trackt eine feste Kohorte von Business-Jets weltweit über ADS-B-Flugdaten und vergleicht die Anzahl gleichzeitig fliegender Maschinen mit einem gelernten Normalwert für Tageszeit und Wochentag – augenzwinkernd als „Frühwarnsystem" für ungewöhnliche Aktivität gedacht. Stufe 1–2 normal, 4–5 deutlich über dem Erwartungswert. Nutzt einen inoffiziellen, öffentlichen Datenfeed; kein API-Key nötig, kann sich aber theoretisch künftig ändern.',

        defconUrlLabel: 'API-Adresse',
        defconApiKeyLabel: 'API-Key (optional)',
        defconApiKeyPlaceholder: 'Nur falls die Schnittstelle abgesichert ist',
        defconRotationLabel: 'Wechsel-Intervall bei mehr als 4 Regionen (Sek.)',
        defconHint: 'Zeigt alle Regionen aus der API-Antwort mit ihrem aktuellen Wert, maximal 4 gleichzeitig – bei mehr Regionen wird automatisch in 4er-Gruppen durchgewechselt. Läuft der Spiegel im selben Docker-Netzwerk wie <code>defcon-assistant</code>, funktioniert die interne Adresse (<code>http://defcon-assistant:5028/...</code>) direkt, ohne Umweg über das öffentliche Internet.',

        complimentsItemsLabel: 'Komplimente (werden im Wechsel angezeigt)',
        complimentPlaceholder: 'Kompliment',
        complimentsAddBtn: '+ Kompliment hinzufügen',
        complimentsRotationLabel: 'Wechsel-Intervall (Sek.)',
        complimentsHint: 'Klassisches Magic-Mirror-Widget: zeigt nacheinander wechselnde, freundliche Sprüche an. Läuft komplett lokal, kein externer Dienst nötig.',
    },
    en: {
        subtitle: 'Widget Configuration',
        settingsHeader: 'Settings',
        appearanceLabel: 'Appearance',
        darkMode: 'Dark Mode',
        onLabel: 'On',
        offLabel: 'Off',
        mirrorSectionLabel: 'Mirror Display',
        languageLabel: 'Language',
        configSectionLabel: 'Configuration',
        resetDefaults: 'Reset to defaults',
        previewHeading: 'Mirror Display',
        previewBody: 'The fullscreen display runs on its own port and refreshes automatically once you save here (configuration reloads every 60\u00a0s).',
        openMirrorBtn: '🖥 Open mirror',
        widgetsHeading: 'Widgets',
        saveBtn: '💾 Save',
        resetConfirm: 'Really reset all widgets to their default settings?',
        saveOk: 'Saved ✓',
        saveErrorGeneric: 'Error while saving.',
        saveServerUnreachable: 'Server unreachable.',
        posLabel: (r, c) => `Row ${r} · Column ${c}`,
        activeLabel: 'Active',
        titleLabel: 'Title',
        titlePlaceholder: 'Leave empty = automatic translation',
        widthLabel: 'Width (number of tiles)',
        width1: '1 tile', width2: '2 tiles', width3: '3 tiles', width4: '4 tiles (full row)',
        searchBtn: '🔍 Search',
        searching: 'Searching …',
        noResults: 'No results.',
        searchFailed: 'Search failed.',
        currentPrefix: 'Current',
        removeGeneric: 'Remove',

        widgetTitle_clock: 'Clock & Date',
        widgetTitle_calendar: 'Google Calendar',
        widgetTitle_weather: 'Weather',
        widgetTitle_news: 'News Feed',
        widgetTitle_crypto: 'Crypto Prices',
        widgetTitle_stocks: 'Stock Prices',
        widgetTitle_todo: 'Notes / To-Do',
        widgetTitle_quote: 'Quote of the Day',
        widgetTitle_serverStatus: 'Server Status',
        widgetTitle_warnings: 'Official Warnings',
        widgetTitle_airQuality: 'Air Quality',
        widgetTitle_elbePegel: 'Elbe Water Level',
        widgetTitle_ews: 'Apocalypse EWS',
        widgetTitle_defcon: 'DEFCON Assessment',
        widgetTitle_compliments: 'Compliments',

        clockDateFormatLabel: 'Date format (locale)',
        clockDateFormatDe: 'German',
        clockDateFormatEn: 'English (US)',
        clock24hLabel: '24-hour format',
        clockBoldLabel: 'Show bold',
        clockSecondsLabel: 'Show seconds',
        clockDateLabel: 'Show date',

        calIcalLabel: 'Private iCal address',
        calHint: 'Google Calendar → Settings → desired calendar → copy "Secret address in iCal format". Read-only, nothing is written back to Google.',
        calMaxEventsLabel: 'Max. number of events',
        calDaysAheadLabel: 'Time range (days ahead)',

        weatherLocationLabel: 'Location',
        weatherLocationPlaceholder: 'Search location, e.g. Hamburg',
        weatherUnitLabel: 'Unit',
        weatherWarningsToggle: 'Show custom weather warnings',
        weatherStormLabel: 'Storm from (gusts km/h)',
        weatherHeatLabel: 'Heat from (°C)',
        weatherColdLabel: 'Cold from (°C)',
        weatherHint: 'Live data from Open-Meteo, no API key needed. Warnings are self-calculated thresholds, not an official weather warning from a weather service.',

        newsSourcesLabel: 'Sources (shown in rotation)',
        newsNameColHeader: 'Display name',
        newsUrlColHeader: 'RSS/Atom feed address (the actual feed URL, not a regular web page)',
        newsAddSourceBtn: '+ Add source',
        newsRemoveSource: 'Remove source',
        newsMaxItemsLabel: 'Max. number of headlines per source',
        newsScrollSpeedLabel: 'Scroll speed (sec. per pass)',
        newsRotationLabel: 'Rotation interval between sources (sec.)',
        newsHint: 'At 2–4 tiles the widget expands to the right within its row (starting from the chosen position on the grid to the left). Don\u2019t place other widgets in that row, or they will overlap.',

        cryptoCoinsLabel: 'Coins (CoinGecko IDs, e.g. bitcoin, ethereum, solana)',
        cryptoAddPlaceholder: 'Add coin + Enter',
        cryptoAddBtn: '+ Add',
        cryptoHint: 'ID must match the CoinGecko name, e.g. <code>bitcoin</code> instead of <code>BTC</code>.',
        cryptoCurrencyLabel: 'Currency',

        todoEntriesLabel: 'Entries',
        todoEntryPlaceholder: 'Entry',
        todoAddBtn: '+ Add entry',
        todoHint: 'Display only – not clickable on the mirror display itself.',

        stocksSymbolsLabel: 'Symbols (Yahoo Finance format)',
        stocksAddPlaceholder: 'Add symbol + Enter',
        stocksAddBtn: '+ Add',
        stocksHint: 'US stocks: <code>AAPL</code>, <code>MSFT</code>, <code>TSLA</code>, <code>NVDA</code> · German stocks (suffix <code>.DE</code>): <code>SAP.DE</code>, <code>VOW3.DE</code> (VW), <code>BMW.DE</code>, <code>ALV.DE</code> (Allianz) · Indices (prefix <code>^</code>): <code>^GDAXI</code> (DAX), <code>^GSPC</code> (S&amp;P 500) · Crypto: <code>BTC-USD</code> · ETFs work the same as stocks, e.g. <code>VWCE.DE</code>. No API key needed, prices slightly delayed.',

        quoteItemsLabel: 'Quotes (one per day, changes automatically at midnight)',
        quoteColHeaderText: 'Quote',
        quoteColHeaderAuthor: 'Author',
        quoteTextPlaceholder: 'Quote text',
        quoteAuthorPlaceholder: 'Author (optional)',
        quoteAddBtn: '+ Add quote',
        quoteRemove: 'Remove quote',

        serverFilterLabel: 'Only show these containers (comma-separated, empty = all)',
        serverRotationLabel: 'Rotation interval for more than 4 containers (sec.)',
        serverHint: 'Shows a maximum of 4 containers at once – with more, it automatically rotates through groups of 4. Needs read access to the Docker socket. In <code>docker-compose.yml</code>, the <code>magic-mirror</code> service needs <code>/var/run/docker.sock:/var/run/docker.sock:ro</code> as a volume (already included in the provided <code>docker-compose.snippet.yml</code>).',

        warnLocationLabel: 'Location',
        warnOtherLocationPlaceholder: 'Other location or postal code',
        warnHint: 'Source: NINA (Federal Office of Civil Protection), bundles DWD severe weather warnings together with other official warnings (civil protection, flooding) for the selected region. No API key needed. If the search doesn\u2019t find a place, try the postal code instead of the place name – that works more reliably.',

        aqiLocationLabel: 'Location',
        aqiHint: 'Live data from Open-Meteo (same source as the weather widget), no API key needed. Shows the European Air Quality Index as well as particulate matter and ozone levels.',

        pegelStationLabel: 'Station name',
        pegelHint: 'Source: PEGELONLINE from the German Federal Waterways and Shipping Administration (WSV), no API key needed. Default is the Hamburg St. Pauli station. Other Elbe stations e.g. <code>CUXHAVEN</code>, <code>HAMBURG HARBURG</code>, <code>GEESTHACHT</code> – the name must (partially) match the official station name.',

        ewsHint: 'Source: <a href="https://ews.kylemcdonald.net/" target="_blank" rel="noopener">ews.kylemcdonald.net</a> by Kyle McDonald. Tracks a fixed cohort of business jets worldwide via ADS-B flight data and compares the number of aircraft flying at once with a learned baseline for time of day and weekday – tongue-in-cheek framed as an "early warning system" for unusual activity. Level 1–2 is normal, 4–5 significantly above the expected value. Uses an unofficial, public data feed; no API key needed, but it could theoretically change in the future.',

        defconUrlLabel: 'API address',
        defconApiKeyLabel: 'API key (optional)',
        defconApiKeyPlaceholder: 'Only if the endpoint is secured',
        defconRotationLabel: 'Rotation interval for more than 4 regions (sec.)',
        defconHint: 'Shows all regions from the API response with their current value, up to 4 at once – with more regions it automatically rotates through groups of 4. If the mirror runs on the same Docker network as <code>defcon-assistant</code>, the internal address (<code>http://defcon-assistant:5028/...</code>) works directly, without going through the public internet.',

        complimentsItemsLabel: 'Compliments (shown in rotation)',
        complimentPlaceholder: 'Compliment',
        complimentsAddBtn: '+ Add compliment',
        complimentsRotationLabel: 'Rotation interval (sec.)',
        complimentsHint: 'Classic Magic Mirror widget: shows a sequence of changing, friendly messages. Runs entirely locally, no external service needed.',
    },
};

let adminLang = 'de';
function at(key, ...args) {
    const dict = AT[adminLang] || AT.de;
    const val = dict[key];
    return typeof val === 'function' ? val(...args) : (val ?? key);
}

function applyAdminLanguage(lang) {
    adminLang = (lang === 'en') ? 'en' : 'de';
    const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    set('txtSubtitle', at('subtitle'));
    set('txtSettingsHeader', at('settingsHeader'));
    set('txtAppearanceLabel', at('appearanceLabel'));
    set('txtDarkMode', at('darkMode'));
    set('txtMirrorSectionLabel', at('mirrorSectionLabel'));
    set('txtLanguageLabel', at('languageLabel'));
    set('txtConfigSectionLabel', at('configSectionLabel'));
    set('txtResetDefaults', at('resetDefaults'));
    set('txtPreviewHeading', at('previewHeading'));
    set('txtPreviewBody', at('previewBody'));
    set('txtOpenMirrorBtn', at('openMirrorBtn'));
    set('txtWidgetsHeading', at('widgetsHeading'));
    set('txtSaveBtn', at('saveBtn'));
    const themeLabel = document.getElementById('themeStateLabel');
    if (themeLabel) {
        const isDark = document.documentElement.dataset.theme === 'dark';
        themeLabel.textContent = isDark ? at('onLabel') : at('offLabel');
    }
    if (currentConfig) renderWidgetList();
}

// ── Sprache (wirkt auf Spiegelanzeige UND diese Konfigurationsseite) ──
async function changeMirrorLanguage(lang) {
    applyAdminLanguage(lang);
    if (!currentConfig) return;
    currentConfig.language = lang;
    try {
        await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentConfig),
        });
    } catch (e) {
        // Wird beim nächsten regulären Speichern ohnehin mit übertragen.
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
}

// ── Positionen ────────────────────────────────────────────────────
const GRID_ROWS = 4;
const GRID_COLS = 4;
const POSITIONS = [];
for (let r = 1; r <= GRID_ROWS; r++) {
    for (let c = 1; c <= GRID_COLS; c++) {
        POSITIONS.push(`r${r}-c${c}`);
    }
}
function positionLabel(pos) {
    const m = /^r(\d+)-c(\d+)$/.exec(pos || '');
    return m ? at('posLabel', m[1], m[2]) : '–';
}

const WIDGET_ICONS = {
    clock: '🕐', calendar: '📅', weather: '🌤', news: '📰', crypto: '💰',
    stocks: '📈', todo: '📝', quote: '💬', serverStatus: '🖥', warnings: '⚠️',
    airQuality: '🌬️', elbePegel: '🌊', ews: '✈️', defcon: '🚨', compliments: '💌',
};
const WIDGET_IDS = Object.keys(WIDGET_ICONS);

let currentConfig = null;

// ── Config laden ─────────────────────────────────────────────────
async function loadConfig() {
    const res = await fetch('/api/config');
    const data = await res.json();
    if (data.ok) {
        currentConfig = data.config;
        const langSelect = document.getElementById('mirrorLanguageSelect');
        adminLang = currentConfig.language === 'en' ? 'en' : 'de';
        if (langSelect) langSelect.value = adminLang;
        applyAdminLanguage(adminLang);
    }
}

async function saveConfig() {
    const msgEl = document.getElementById('save-msg');
    collectFormIntoConfig();
    try {
        const res = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentConfig),
        });
        const result = await res.json();
        if (result.ok) {
            msgEl.textContent = at('saveOk');
            msgEl.className = 'mm-save-msg ok';
        } else {
            msgEl.textContent = result.msg || at('saveErrorGeneric');
            msgEl.className = 'mm-save-msg error';
        }
    } catch (e) {
        msgEl.textContent = at('saveServerUnreachable');
        msgEl.className = 'mm-save-msg error';
    }
    setTimeout(() => { msgEl.textContent = ''; }, 4000);
}

async function resetConfig() {
    if (!confirm(at('resetConfirm'))) return;
    const res = await fetch('/api/config/reset', { method: 'POST' });
    const data = await res.json();
    if (data.ok) {
        currentConfig = data.config;
        const langSelect = document.getElementById('mirrorLanguageSelect');
        adminLang = currentConfig.language === 'en' ? 'en' : 'de';
        if (langSelect) langSelect.value = adminLang;
        applyAdminLanguage(adminLang);
        closeSettingsPanel();
    }
}

function openMirrorPreview() {
    const url = `${location.protocol}//${location.hostname}:${window.MM_MIRROR_PORT}`;
    window.open(url, '_blank');
}

// ── Rendering ────────────────────────────────────────────────────
function posPickerHtml(widgetId, activePos) {
    const cells = POSITIONS.map(p =>
        `<div class="mm-pos-cell${p === activePos ? ' active' : ''}" data-widget="${widgetId}" data-pos="${p}" onclick="selectPosition('${widgetId}','${p}')" title="${positionLabel(p)}"></div>`
    ).join('');
    return `
        <div>
            <div class="mm-pos-picker" id="pos-picker-${widgetId}">${cells}</div>
            <div class="mm-pos-label" id="pos-label-${widgetId}">${positionLabel(activePos)}</div>
        </div>`;
}

function selectPosition(widgetId, pos) {
    currentConfig.widgets[widgetId].position = pos;
    document.querySelectorAll(`#pos-picker-${widgetId} .mm-pos-cell`).forEach(c => {
        c.classList.toggle('active', c.dataset.pos === pos);
    });
    document.getElementById(`pos-label-${widgetId}`).textContent = positionLabel(pos);
}

function widthSelectHtml(wcfg) {
    return `
        <div class="mm-form-row">
            <label>${at('widthLabel')}</label>
            <select data-field="span">
                <option value="1" ${(wcfg.span ?? 1) == 1 ? 'selected' : ''}>${at('width1')}</option>
                <option value="2" ${wcfg.span == 2 ? 'selected' : ''}>${at('width2')}</option>
                <option value="3" ${wcfg.span == 3 ? 'selected' : ''}>${at('width3')}</option>
                <option value="4" ${wcfg.span == 4 ? 'selected' : ''}>${at('width4')}</option>
            </select>
        </div>`;
}

function titleFieldHtml(wcfg) {
    return `
        <div class="mm-form-row">
            <label>${at('titleLabel')}</label>
            <input type="text" data-field="title" placeholder="${at('titlePlaceholder')}" value="${escapeHtml(wcfg.title || '')}">
        </div>`;
}

function widgetSpecificFields(id, wcfg) {
    if (id === 'clock') {
        return `
            <div class="mm-form-grid">
                <div class="mm-form-row">
                    <label>${at('titleLabel')}</label>
                    <input type="text" data-field="title" placeholder="${at('titlePlaceholder')}" value="${escapeHtml(wcfg.title || '')}">
                </div>
                <div class="mm-form-row">
                    <label>${at('clockDateFormatLabel')}</label>
                    <select data-field="dateLocale">
                        <option value="de-DE" ${wcfg.dateLocale === 'de-DE' ? 'selected' : ''}>${at('clockDateFormatDe')}</option>
                        <option value="en-US" ${wcfg.dateLocale === 'en-US' ? 'selected' : ''}>${at('clockDateFormatEn')}</option>
                    </select>
                </div>
                <div class="mm-form-row">
                    <label>${at('widthLabel')}</label>
                    <select data-field="span">
                        <option value="1" ${(wcfg.span ?? 1) == 1 ? 'selected' : ''}>${at('width1')}</option>
                        <option value="2" ${wcfg.span == 2 ? 'selected' : ''}>${at('width2')}</option>
                        <option value="3" ${wcfg.span == 3 ? 'selected' : ''}>${at('width3')}</option>
                        <option value="4" ${wcfg.span == 4 ? 'selected' : ''}>${at('width4')}</option>
                    </select>
                </div>
            </div>
            <div class="mm-switch-row">
                <label class="mm-switch"><input type="checkbox" data-field="format24h" ${wcfg.format24h ? 'checked' : ''}><span class="mm-switch-slider"></span></label>
                <span class="mm-switch-label">${at('clock24hLabel')}</span>
            </div>
            <div class="mm-switch-row">
                <label class="mm-switch"><input type="checkbox" data-field="bold" ${wcfg.bold ? 'checked' : ''}><span class="mm-switch-slider"></span></label>
                <span class="mm-switch-label">${at('clockBoldLabel')}</span>
            </div>
            <div class="mm-switch-row">
                <label class="mm-switch"><input type="checkbox" data-field="showSeconds" ${wcfg.showSeconds ? 'checked' : ''}><span class="mm-switch-slider"></span></label>
                <span class="mm-switch-label">${at('clockSecondsLabel')}</span>
            </div>
            <div class="mm-switch-row">
                <label class="mm-switch"><input type="checkbox" data-field="showDate" ${wcfg.showDate ? 'checked' : ''}><span class="mm-switch-slider"></span></label>
                <span class="mm-switch-label">${at('clockDateLabel')}</span>
            </div>`;
    }

    if (id === 'calendar') {
        return `
            ${titleFieldHtml(wcfg)}
            <div class="mm-form-row">
                <label>${at('calIcalLabel')}</label>
                <input type="url" data-field="icalUrl" placeholder="https://calendar.google.com/calendar/ical/…/private-XXXX/basic.ics" value="${escapeHtml(wcfg.icalUrl || '')}">
            </div>
            <div class="mm-hint">${at('calHint')}</div>
            <div class="mm-form-grid">
                <div class="mm-form-row">
                    <label>${at('calMaxEventsLabel')}</label>
                    <input type="number" min="1" max="30" data-field="maxEvents" value="${wcfg.maxEvents ?? 8}">
                </div>
                <div class="mm-form-row">
                    <label>${at('calDaysAheadLabel')}</label>
                    <input type="number" min="1" max="90" data-field="daysAhead" value="${wcfg.daysAhead ?? 14}">
                </div>
            </div>`;
    }

    if (id === 'weather') {
        return `
            ${titleFieldHtml(wcfg)}
            <div class="mm-form-row">
                <label>${at('weatherLocationLabel')}</label>
                <div class="mm-location-search">
                    <input type="text" id="weather-location-input" placeholder="${at('weatherLocationPlaceholder')}" value="">
                    <button type="button" onclick="searchWeatherLocation()">${at('searchBtn')}</button>
                </div>
                <div class="mm-location-results" id="weather-location-results"></div>
                <div class="mm-location-current" id="weather-location-current">
                    ${at('currentPrefix')}: ${escapeHtml(wcfg.location || '–')} (${wcfg.latitude ?? '–'}, ${wcfg.longitude ?? '–'})
                </div>
                <input type="hidden" data-field="location" id="weather-field-location" value="${escapeHtml(wcfg.location || '')}">
                <input type="hidden" data-field="latitude" id="weather-field-latitude" value="${wcfg.latitude ?? ''}">
                <input type="hidden" data-field="longitude" id="weather-field-longitude" value="${wcfg.longitude ?? ''}">
            </div>
            <div class="mm-form-grid">
                <div class="mm-form-row">
                    <label>${at('weatherUnitLabel')}</label>
                    <select data-field="units">
                        <option value="celsius" ${wcfg.units !== 'fahrenheit' ? 'selected' : ''}>°C</option>
                        <option value="fahrenheit" ${wcfg.units === 'fahrenheit' ? 'selected' : ''}>°F</option>
                    </select>
                </div>
            </div>
            <div class="mm-switch-row">
                <label class="mm-switch"><input type="checkbox" data-field="showWarnings" ${wcfg.showWarnings ? 'checked' : ''}><span class="mm-switch-slider"></span></label>
                <span class="mm-switch-label">${at('weatherWarningsToggle')}</span>
            </div>
            <div class="mm-form-grid">
                <div class="mm-form-row">
                    <label>${at('weatherStormLabel')}</label>
                    <input type="number" min="20" max="200" data-field="windWarnKmh" value="${wcfg.windWarnKmh ?? 60}">
                </div>
                <div class="mm-form-row">
                    <label>${at('weatherHeatLabel')}</label>
                    <input type="number" min="20" max="50" data-field="heatWarnC" value="${wcfg.heatWarnC ?? 32}">
                </div>
                <div class="mm-form-row">
                    <label>${at('weatherColdLabel')}</label>
                    <input type="number" min="-40" max="10" data-field="coldWarnC" value="${wcfg.coldWarnC ?? -10}">
                </div>
            </div>
            <div class="mm-hint">${at('weatherHint')}</div>`;
    }

    if (id === 'news') {
        const sources = wcfg.sources || [];
        const rows = sources.map((s) => `
            <div class="mm-list-row" data-news-row>
                <input type="text" class="mm-name-field" placeholder="z.B. Tagesschau" data-news-name value="${escapeHtml(s.name || '')}">
                <input type="url" class="mm-url-field" placeholder="https://www.tagesschau.de/xml/rss2/" data-news-url value="${escapeHtml(s.feedUrl || '')}">
                <button type="button" class="mm-list-row-remove" onclick="this.closest('[data-news-row]').remove()" title="${at('newsRemoveSource')}">✕</button>
            </div>`).join('');
        return `
            ${titleFieldHtml(wcfg)}
            <div class="mm-form-row">
                <label>${at('newsSourcesLabel')}</label>
                <div class="mm-list-editor" id="news-source-list">
                    <div class="mm-list-row mm-list-col-labels" aria-hidden="true">
                        <span class="mm-name-field">${at('newsNameColHeader')}</span>
                        <span class="mm-url-field">${at('newsUrlColHeader')}</span>
                        <span class="mm-list-row-remove-spacer"></span>
                    </div>
                    ${rows}
                </div>
                <button type="button" class="mm-list-add-btn" onclick="addNewsSourceRow()">${at('newsAddSourceBtn')}</button>
            </div>
            <div class="mm-form-grid">
                ${widthSelectHtml(wcfg)}
                <div class="mm-form-row">
                    <label>${at('newsMaxItemsLabel')}</label>
                    <input type="number" min="1" max="30" data-field="maxItems" value="${wcfg.maxItems ?? 8}">
                </div>
                <div class="mm-form-row">
                    <label>${at('newsScrollSpeedLabel')}</label>
                    <input type="number" min="10" max="180" data-field="scrollSpeedSec" value="${wcfg.scrollSpeedSec ?? 40}">
                </div>
                <div class="mm-form-row">
                    <label>${at('newsRotationLabel')}</label>
                    <input type="number" min="10" max="600" data-field="rotationSec" value="${wcfg.rotationSec ?? 45}">
                </div>
            </div>
            <div class="mm-hint">${at('newsHint')}</div>`;
    }

    if (id === 'crypto') {
        const tags = (wcfg.symbols || []).map(s => `
            <span class="mm-tag" data-symbol="${escapeHtml(s)}">${escapeHtml(s)}<button type="button" onclick="removeCryptoTag(this)">✕</button></span>
        `).join('');
        return `
            ${titleFieldHtml(wcfg)}
            <div class="mm-form-row">
                <label>${at('cryptoCoinsLabel')}</label>
                <div class="mm-tags" id="crypto-tags">
                    ${tags}
                    <input type="text" id="crypto-tag-input" placeholder="${at('cryptoAddPlaceholder')}" onkeydown="onCryptoTagKeydown(event)">
                    <button type="button" class="mm-tags-add-btn" onclick="addCryptoTagFromInput()">${at('cryptoAddBtn')}</button>
                </div>
                <div class="mm-hint">${at('cryptoHint')}</div>
            </div>
            <div class="mm-form-row" style="max-width:200px;">
                <label>${at('cryptoCurrencyLabel')}</label>
                <select data-field="currency">
                    <option value="eur" ${wcfg.currency === 'eur' ? 'selected' : ''}>EUR</option>
                    <option value="usd" ${wcfg.currency === 'usd' ? 'selected' : ''}>USD</option>
                    <option value="chf" ${wcfg.currency === 'chf' ? 'selected' : ''}>CHF</option>
                    <option value="gbp" ${wcfg.currency === 'gbp' ? 'selected' : ''}>GBP</option>
                </select>
            </div>`;
    }

    if (id === 'todo') {
        const items = wcfg.items || [];
        const rows = items.map((it) => `
            <div class="mm-list-row" data-todo-row>
                <label class="mm-switch" style="width:36px;flex-shrink:0;"><input type="checkbox" data-todo-done ${it.done ? 'checked' : ''}><span class="mm-switch-slider"></span></label>
                <input type="text" class="mm-text-field" placeholder="${at('todoEntryPlaceholder')}" data-todo-text value="${escapeHtml(it.text || '')}">
                <button type="button" class="mm-list-row-remove" onclick="this.closest('[data-todo-row]').remove()">✕</button>
            </div>`).join('');
        return `
            ${titleFieldHtml(wcfg)}
            <div class="mm-form-row">
                <label>${at('todoEntriesLabel')}</label>
                <div class="mm-list-editor" id="todo-item-list">
                    ${rows}
                </div>
                <button type="button" class="mm-list-add-btn" onclick="addTodoItemRow()">${at('todoAddBtn')}</button>
            </div>
            <div class="mm-hint">${at('todoHint')}</div>`;
    }

    if (id === 'stocks') {
        const tags = (wcfg.symbols || []).map(s => `
            <span class="mm-tag" data-symbol="${escapeHtml(s)}">${escapeHtml(s)}<button type="button" onclick="removeStockTag(this)">✕</button></span>
        `).join('');
        return `
            ${titleFieldHtml(wcfg)}
            <div class="mm-form-row">
                <label>${at('stocksSymbolsLabel')}</label>
                <div class="mm-tags" id="stock-tags">
                    ${tags}
                    <input type="text" id="stock-tag-input" placeholder="${at('stocksAddPlaceholder')}" onkeydown="onStockTagKeydown(event)">
                    <button type="button" class="mm-tags-add-btn" onclick="addStockTagFromInput()">${at('stocksAddBtn')}</button>
                </div>
                <div class="mm-hint">${at('stocksHint')}</div>
            </div>`;
    }

    if (id === 'quote') {
        const items = wcfg.items || [];
        const rows = items.map((it) => `
            <div class="mm-list-row" data-quote-row>
                <input type="text" class="mm-text-field" placeholder="${at('quoteTextPlaceholder')}" data-quote-text value="${escapeHtml(it.text || '')}">
                <input type="text" class="mm-name-field" placeholder="${at('quoteAuthorPlaceholder')}" data-quote-author value="${escapeHtml(it.author || '')}">
                <button type="button" class="mm-list-row-remove" onclick="this.closest('[data-quote-row]').remove()" title="${at('quoteRemove')}">✕</button>
            </div>`).join('');
        return `
            ${titleFieldHtml(wcfg)}
            <div class="mm-form-row">
                <label>${at('quoteItemsLabel')}</label>
                <div class="mm-list-editor" id="quote-item-list">
                    <div class="mm-list-row mm-list-col-labels" aria-hidden="true">
                        <span class="mm-text-field">${at('quoteColHeaderText')}</span>
                        <span class="mm-name-field">${at('quoteColHeaderAuthor')}</span>
                        <span class="mm-list-row-remove-spacer"></span>
                    </div>
                    ${rows}
                </div>
                <button type="button" class="mm-list-add-btn" onclick="addQuoteItemRow()">${at('quoteAddBtn')}</button>
            </div>
            ${widthSelectHtml(wcfg)}`;
    }

    if (id === 'serverStatus') {
        return `
            ${titleFieldHtml(wcfg)}
            <div class="mm-form-row">
                <label>${at('serverFilterLabel')}</label>
                <input type="text" data-field="filter" placeholder="z.B. server-monitor, crypto-assistant" value="${escapeHtml(wcfg.filter || '')}">
            </div>
            <div class="mm-form-row">
                <label>${at('serverRotationLabel')}</label>
                <input type="number" min="5" max="120" data-field="rotationSec" value="${wcfg.rotationSec ?? 15}">
            </div>
            <div class="mm-hint">${at('serverHint')}</div>`;
    }

    if (id === 'warnings') {
        return `
            ${titleFieldHtml(wcfg)}
            <div class="mm-form-row">
                <label>${at('warnLocationLabel')}</label>
                <div class="mm-quick-cities">
                    <button type="button" onclick='selectWarningsLocation({"label":"Hamburg","ars":"020000000000"})'>Hamburg</button>
                    <button type="button" onclick='selectWarningsLocation({"label":"Berlin","ars":"110000000000"})'>Berlin</button>
                    <button type="button" onclick='selectWarningsLocation({"label":"München, Kreisfreie Stadt München, Bayern","ars":"091620000000"})'>München</button>
                    <button type="button" onclick='selectWarningsLocation({"label":"Bremen","ars":"040110000000"})'>Bremen</button>
                </div>
                <div class="mm-location-search">
                    <input type="text" id="warnings-location-input" placeholder="${at('warnOtherLocationPlaceholder')}" value="">
                    <button type="button" onclick="searchWarningsLocation()">${at('searchBtn')}</button>
                </div>
                <div class="mm-location-results" id="warnings-location-results"></div>
                <div class="mm-location-current" id="warnings-location-current">
                    ${at('currentPrefix')}: ${escapeHtml(wcfg.location || '–')} (ARS ${escapeHtml(wcfg.ars || '–')})
                </div>
                <input type="hidden" data-field="location" id="warnings-field-location" value="${escapeHtml(wcfg.location || '')}">
                <input type="hidden" data-field="ars" id="warnings-field-ars" value="${escapeHtml(wcfg.ars || '')}">
            </div>
            <div class="mm-hint">${at('warnHint')}</div>`;
    }

    if (id === 'airQuality') {
        return `
            ${titleFieldHtml(wcfg)}
            <div class="mm-form-row">
                <label>${at('aqiLocationLabel')}</label>
                <div class="mm-location-search">
                    <input type="text" id="airquality-location-input" placeholder="${at('weatherLocationPlaceholder')}" value="">
                    <button type="button" onclick="searchAirQualityLocation()">${at('searchBtn')}</button>
                </div>
                <div class="mm-location-results" id="airquality-location-results"></div>
                <div class="mm-location-current" id="airquality-location-current">
                    ${at('currentPrefix')}: ${escapeHtml(wcfg.location || '–')} (${wcfg.latitude ?? '–'}, ${wcfg.longitude ?? '–'})
                </div>
                <input type="hidden" data-field="location" id="airquality-field-location" value="${escapeHtml(wcfg.location || '')}">
                <input type="hidden" data-field="latitude" id="airquality-field-latitude" value="${wcfg.latitude ?? ''}">
                <input type="hidden" data-field="longitude" id="airquality-field-longitude" value="${wcfg.longitude ?? ''}">
            </div>
            <div class="mm-hint">${at('aqiHint')}</div>`;
    }

    if (id === 'elbePegel') {
        return `
            ${titleFieldHtml(wcfg)}
            <div class="mm-form-row">
                <label>${at('pegelStationLabel')}</label>
                <input type="text" data-field="station" placeholder="HAMBURG ST. PAULI" value="${escapeHtml(wcfg.station || '')}">
            </div>
            <div class="mm-hint">${at('pegelHint')}</div>`;
    }

    if (id === 'ews') {
        return `
            ${titleFieldHtml(wcfg)}
            <div class="mm-hint">${at('ewsHint')}</div>`;
    }

    if (id === 'defcon') {
        return `
            ${titleFieldHtml(wcfg)}
            <div class="mm-form-row">
                <label>${at('defconUrlLabel')}</label>
                <input type="url" data-field="url" placeholder="http://defcon-assistant:5028/api/status.json" value="${escapeHtml(wcfg.url || '')}">
            </div>
            <div class="mm-form-row">
                <label>${at('defconApiKeyLabel')}</label>
                <input type="text" data-field="apiKey" placeholder="${at('defconApiKeyPlaceholder')}" value="${escapeHtml(wcfg.apiKey || '')}">
            </div>
            ${widthSelectHtml(wcfg)}
            <div class="mm-form-row">
                <label>${at('defconRotationLabel')}</label>
                <input type="number" min="5" max="120" data-field="rotationSec" value="${wcfg.rotationSec ?? 15}">
            </div>
            <div class="mm-hint">${at('defconHint')}</div>`;
    }

    if (id === 'compliments') {
        const items = wcfg.items || [];
        const rows = items.map((text) => `
            <div class="mm-list-row" data-compliment-row>
                <input type="text" class="mm-text-field" placeholder="${at('complimentPlaceholder')}" data-compliment-text value="${escapeHtml(text)}">
                <button type="button" class="mm-list-row-remove" onclick="this.closest('[data-compliment-row]').remove()" title="${at('removeGeneric')}">✕</button>
            </div>`).join('');
        return `
            ${titleFieldHtml(wcfg)}
            <div class="mm-form-row">
                <label>${at('complimentsItemsLabel')}</label>
                <div class="mm-list-editor" id="compliment-item-list">
                    ${rows}
                </div>
                <button type="button" class="mm-list-add-btn" onclick="addComplimentRow()">${at('complimentsAddBtn')}</button>
            </div>
            <div class="mm-form-grid">
                <div class="mm-form-row">
                    <label>${at('complimentsRotationLabel')}</label>
                    <input type="number" min="3" max="120" data-field="rotationSec" value="${wcfg.rotationSec ?? 10}">
                </div>
                ${widthSelectHtml(wcfg)}
            </div>
            <div class="mm-hint">${at('complimentsHint')}</div>`;
    }

    return '';
}

// ── Luftqualität: Standortsuche (identisch zum Wetter-Widget) ────
async function searchAirQualityLocation() {
    const input = document.getElementById('airquality-location-input');
    const query = input.value.trim();
    const resultsEl = document.getElementById('airquality-location-results');
    if (!query) return;
    resultsEl.innerHTML = `<div class="mm-empty">${at('searching')}</div>`;
    try {
        const res = await fetch('/api/geocode?q=' + encodeURIComponent(query));
        const data = await res.json();
        if (!data.ok || !data.results.length) {
            resultsEl.innerHTML = `<div class="mm-empty">${at('noResults')}</div>`;
            return;
        }
        resultsEl.innerHTML = data.results.map((r) =>
            `<div class="mm-location-result" onclick='selectAirQualityLocation(${JSON.stringify(r)})'>${escapeHtml(r.label)}</div>`
        ).join('');
    } catch (e) {
        resultsEl.innerHTML = `<div class="mm-empty">${at('searchFailed')}</div>`;
    }
}

function selectAirQualityLocation(result) {
    document.getElementById('airquality-field-location').value = result.label;
    document.getElementById('airquality-field-latitude').value = result.latitude;
    document.getElementById('airquality-field-longitude').value = result.longitude;
    document.getElementById('airquality-location-current').textContent =
        `${at('currentPrefix')}: ${result.label} (${result.latitude}, ${result.longitude})`;
    document.getElementById('airquality-location-results').innerHTML = '';
    document.getElementById('airquality-location-input').value = '';
}

// ── Aktien-Editor ─────────────────────────────────────────────────
function onStockTagKeydown(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    addStockTagFromInput();
}

function addStockTagFromInput() {
    const input = document.getElementById('stock-tag-input');
    if (!input) return;
    const val = input.value.trim().toLowerCase();
    if (!val) return;
    const container = document.getElementById('stock-tags');
    if ([...container.querySelectorAll('.mm-tag')].some(t => t.dataset.symbol === val)) {
        input.value = '';
        input.focus();
        return;
    }
    const tag = document.createElement('span');
    tag.className = 'mm-tag';
    tag.dataset.symbol = val;
    tag.innerHTML = `${escapeHtml(val)}<button type="button" onclick="removeStockTag(this)">✕</button>`;
    container.insertBefore(tag, input);
    input.value = '';
    input.focus();
}

function removeStockTag(btn) {
    btn.closest('.mm-tag').remove();
}

// ── Zitat-Editor ─────────────────────────────────────────────────
function addQuoteItemRow() {
    const list = document.getElementById('quote-item-list');
    const row = document.createElement('div');
    row.className = 'mm-list-row';
    row.dataset.quoteRow = '';
    row.innerHTML = `
        <input type="text" class="mm-text-field" placeholder="${at('quoteTextPlaceholder')}" data-quote-text value="">
        <input type="text" class="mm-name-field" placeholder="${at('quoteAuthorPlaceholder')}" data-quote-author value="">
        <button type="button" class="mm-list-row-remove" onclick="this.closest('[data-quote-row]').remove()" title="${at('quoteRemove')}">✕</button>`;
    list.appendChild(row);
    row.querySelector('[data-quote-text]').focus();
}

// ── News-Quellen Editor ─────────────────────────────────────────
function addNewsSourceRow() {
    const list = document.getElementById('news-source-list');
    const row = document.createElement('div');
    row.className = 'mm-list-row';
    row.dataset.newsRow = '';
    row.innerHTML = `
        <input type="text" class="mm-name-field" placeholder="z.B. Tagesschau" data-news-name value="">
        <input type="url" class="mm-url-field" placeholder="https://www.tagesschau.de/xml/rss2/" data-news-url value="">
        <button type="button" class="mm-list-row-remove" onclick="this.closest('[data-news-row]').remove()" title="${at('newsRemoveSource')}">✕</button>`;
    list.appendChild(row);
    row.querySelector('[data-news-name]').focus();
}

// ── Notizen-Editor ───────────────────────────────────────────────
function addTodoItemRow() {
    const list = document.getElementById('todo-item-list');
    const row = document.createElement('div');
    row.className = 'mm-list-row';
    row.dataset.todoRow = '';
    row.innerHTML = `
        <label class="mm-switch" style="width:36px;flex-shrink:0;"><input type="checkbox" data-todo-done><span class="mm-switch-slider"></span></label>
        <input type="text" class="mm-text-field" placeholder="${at('todoEntryPlaceholder')}" data-todo-text value="">
        <button type="button" class="mm-list-row-remove" onclick="this.closest('[data-todo-row]').remove()">✕</button>`;
    list.appendChild(row);
    row.querySelector('[data-todo-text]').focus();
}

// ── Komplimente-Editor ────────────────────────────────────────────
function addComplimentRow() {
    const list = document.getElementById('compliment-item-list');
    const row = document.createElement('div');
    row.className = 'mm-list-row';
    row.dataset.complimentRow = '';
    row.innerHTML = `
        <input type="text" class="mm-text-field" placeholder="${at('complimentPlaceholder')}" data-compliment-text value="">
        <button type="button" class="mm-list-row-remove" onclick="this.closest('[data-compliment-row]').remove()" title="${at('removeGeneric')}">✕</button>`;
    list.appendChild(row);
    row.querySelector('[data-compliment-text]').focus();
}

// ── Wetter: Standortsuche ────────────────────────────────────────
async function searchWeatherLocation() {
    const input = document.getElementById('weather-location-input');
    const query = input.value.trim();
    const resultsEl = document.getElementById('weather-location-results');
    if (!query) return;
    resultsEl.innerHTML = `<div class="mm-empty">${at('searching')}</div>`;
    try {
        const res = await fetch('/api/geocode?q=' + encodeURIComponent(query));
        const data = await res.json();
        if (!data.ok || !data.results.length) {
            resultsEl.innerHTML = `<div class="mm-empty">${at('noResults')}</div>`;
            return;
        }
        resultsEl.innerHTML = data.results.map((r) =>
            `<div class="mm-location-result" onclick='selectWeatherLocation(${JSON.stringify(r)})'>${escapeHtml(r.label)}</div>`
        ).join('');
    } catch (e) {
        resultsEl.innerHTML = `<div class="mm-empty">${at('searchFailed')}</div>`;
    }
}

function selectWeatherLocation(result) {
    document.getElementById('weather-field-location').value = result.label;
    document.getElementById('weather-field-latitude').value = result.latitude;
    document.getElementById('weather-field-longitude').value = result.longitude;
    document.getElementById('weather-location-current').textContent =
        `${at('currentPrefix')}: ${result.label} (${result.latitude}, ${result.longitude})`;
    document.getElementById('weather-location-results').innerHTML = '';
    document.getElementById('weather-location-input').value = '';
}

// ── Warnungen: Standortsuche ─────────────────────────────────────
async function searchWarningsLocation() {
    const input = document.getElementById('warnings-location-input');
    const query = input.value.trim();
    const resultsEl = document.getElementById('warnings-location-results');
    if (!query) return;
    resultsEl.innerHTML = `<div class="mm-empty">${at('searching')}</div>`;
    try {
        const res = await fetch('/api/ags-search?q=' + encodeURIComponent(query));
        const data = await res.json();
        if (!data.ok || !data.results.length) {
            resultsEl.innerHTML = `<div class="mm-empty">${data.msg || at('noResults')}</div>`;
            return;
        }
        resultsEl.innerHTML = data.results.map((r) =>
            `<div class="mm-location-result" onclick='selectWarningsLocation(${JSON.stringify(r)})'>${escapeHtml(r.label)}</div>`
        ).join('');
    } catch (e) {
        resultsEl.innerHTML = `<div class="mm-empty">${at('searchFailed')}</div>`;
    }
}

function selectWarningsLocation(result) {
    document.getElementById('warnings-field-location').value = result.label;
    document.getElementById('warnings-field-ars').value = result.ars;
    document.getElementById('warnings-location-current').textContent =
        `${at('currentPrefix')}: ${result.label} (ARS ${result.ars})`;
    document.getElementById('warnings-location-results').innerHTML = '';
    document.getElementById('warnings-location-input').value = '';
}

function onCryptoTagKeydown(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    addCryptoTagFromInput();
}

function addCryptoTagFromInput() {
    const input = document.getElementById('crypto-tag-input');
    if (!input) return;
    const val = input.value.trim().toLowerCase();
    if (!val) return;
    const container = document.getElementById('crypto-tags');
    if ([...container.querySelectorAll('.mm-tag')].some(t => t.dataset.symbol === val)) {
        input.value = '';
        input.focus();
        return;
    }
    const tag = document.createElement('span');
    tag.className = 'mm-tag';
    tag.dataset.symbol = val;
    tag.innerHTML = `${escapeHtml(val)}<button type="button" onclick="removeCryptoTag(this)">✕</button>`;
    container.insertBefore(tag, input);
    input.value = '';
    input.focus();
}

function removeCryptoTag(btn) {
    btn.closest('.mm-tag').remove();
}

function renderWidgetList() {
    const list = document.getElementById('widget-list');
    const widgets = currentConfig.widgets;
    list.innerHTML = WIDGET_IDS.map(id => {
        const wcfg = widgets[id] || {};
        const icon = WIDGET_ICONS[id];
        const title = at(`widgetTitle_${id}`);
        return `
            <div class="mm-widget-card" data-widget-card="${id}">
                <div class="mm-widget-head">
                    <div class="mm-widget-head-title"><span class="icon">${icon}</span> ${title}</div>
                    <div class="mm-switch-row">
                        <label class="mm-switch"><input type="checkbox" data-field="enabled" ${wcfg.enabled ? 'checked' : ''}><span class="mm-switch-slider"></span></label>
                        <span class="mm-switch-label">${at('activeLabel')}</span>
                    </div>
                    ${posPickerHtml(id, wcfg.position)}
                </div>
                <div class="mm-widget-body" data-widget-body="${id}">
                    ${widgetSpecificFields(id, wcfg)}
                </div>
            </div>`;
    }).join('');
}

// ── Formular → Config zurückschreiben ───────────────────────────
function collectFormIntoConfig() {
    WIDGET_IDS.forEach(id => {
        const card = document.querySelector(`[data-widget-card="${id}"]`);
        if (!card) return;
        const wcfg = currentConfig.widgets[id] || {};

        const enabledInput = card.querySelector('[data-field="enabled"]');
        if (enabledInput) wcfg.enabled = enabledInput.checked;

        card.querySelectorAll('[data-widget-body] [data-field]').forEach(el => {
            const field = el.dataset.field;
            if (el.type === 'checkbox') {
                wcfg[field] = el.checked;
            } else if (el.type === 'number') {
                wcfg[field] = Number(el.value);
            } else {
                wcfg[field] = el.value;
            }
        });

        if (id === 'crypto') {
            const tags = card.querySelectorAll('#crypto-tags .mm-tag');
            wcfg.symbols = [...tags].map(t => t.dataset.symbol);
        }

        if (id === 'clock') {
            wcfg.span = Number(wcfg.span) || 1;
        }

        if (id === 'defcon') {
            wcfg.span = Number(wcfg.span) || 1;
        }

        if (id === 'compliments') {
            const rows = card.querySelectorAll('[data-compliment-row]');
            wcfg.items = [...rows].map(r => r.querySelector('[data-compliment-text]').value.trim()).filter(Boolean);
            wcfg.span = Number(wcfg.span) || 1;
        }

        if (id === 'news') {
            const rows = card.querySelectorAll('[data-news-row]');
            wcfg.sources = [...rows].map(r => ({
                name: r.querySelector('[data-news-name]').value.trim(),
                feedUrl: r.querySelector('[data-news-url]').value.trim(),
            })).filter(s => s.feedUrl);
            wcfg.span = Number(wcfg.span) || 1;
        }

        if (id === 'todo') {
            const rows = card.querySelectorAll('[data-todo-row]');
            wcfg.items = [...rows].map(r => ({
                text: r.querySelector('[data-todo-text]').value.trim(),
                done: r.querySelector('[data-todo-done]').checked,
            })).filter(it => it.text);
        }

        if (id === 'weather') {
            const lat = card.querySelector('#weather-field-latitude').value;
            const lon = card.querySelector('#weather-field-longitude').value;
            wcfg.latitude = lat !== '' ? Number(lat) : null;
            wcfg.longitude = lon !== '' ? Number(lon) : null;
            wcfg.location = card.querySelector('#weather-field-location').value;
        }

        if (id === 'stocks') {
            const tags = card.querySelectorAll('#stock-tags .mm-tag');
            wcfg.symbols = [...tags].map(t => t.dataset.symbol);
        }

        if (id === 'quote') {
            const rows = card.querySelectorAll('[data-quote-row]');
            wcfg.items = [...rows].map(r => ({
                text: r.querySelector('[data-quote-text]').value.trim(),
                author: r.querySelector('[data-quote-author]').value.trim(),
            })).filter(q => q.text);
            wcfg.span = Number(wcfg.span) || 1;
        }

        if (id === 'warnings') {
            wcfg.location = card.querySelector('#warnings-field-location').value;
            wcfg.ars = card.querySelector('#warnings-field-ars').value;
        }

        if (id === 'airQuality') {
            const lat = card.querySelector('#airquality-field-latitude').value;
            const lon = card.querySelector('#airquality-field-longitude').value;
            wcfg.latitude = lat !== '' ? Number(lat) : null;
            wcfg.longitude = lon !== '' ? Number(lon) : null;
            wcfg.location = card.querySelector('#airquality-field-location').value;
        }

        currentConfig.widgets[id] = wcfg;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    applyTheme(localStorage.getItem('oxinonTheme') || 'dark');
    setTimeout(() => document.body.classList.add('loaded'), 50);
    loadConfig();
});
