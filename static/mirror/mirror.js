(() => {
    const API_BASE = `${location.protocol}//${location.hostname}:${window.MM_API_PORT}`;

    // ---------------- Übersetzungen ----------------
    const I18N = {
        de: {
            weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
            months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
            calDefaultTitle: 'Kalender',
            calNoEvents: 'Keine anstehenden Termine',
            calUnavailable: 'Kalender nicht verfügbar',
            calUnreachable: 'Kalender nicht erreichbar',
            newsDefaultTitle: 'Nachrichten',
            newsNoSources: 'Keine Nachrichten verfügbar',
            newsNoItems: 'Keine Meldungen',
            newsUnreachable: 'Nachrichten nicht erreichbar',
            cryptoDefaultTitle: 'Krypto',
            cryptoNoData: 'Keine Kursdaten verfügbar',
            cryptoUnreachable: 'Kursdaten nicht erreichbar',
            weatherDefaultTitle: 'Wetter',
            weatherFeelsLike: 'gefühlt',
            weatherHumidity: 'Luftfeuchte',
            weatherWind: 'Wind',
            weatherGusts: 'Böen',
            weatherUnavailable: 'Wetter nicht verfügbar',
            weatherUnreachable: 'Wetter nicht erreichbar',
            stocksDefaultTitle: 'Aktienkurse',
            stocksNa: 'n/a',
            quoteDefaultTitle: 'Zitat des Tages',
            quoteUnavailable: 'Kein Zitat verfügbar',
            serverDefaultTitle: 'Server-Status',
            serverSummary: (running, total) => `${running} von ${total} Containern laufen`,
            serverUnavailable: 'Server-Status nicht verfügbar',
            serverNoContainers: 'Keine Container gefunden',
            serverUnreachable: 'Server-Status nicht erreichbar',
            warnDefaultTitle: 'Warnungen',
            warnNone: 'Keine aktuellen Warnungen',
            warnUnavailable: 'Warnungen nicht verfügbar',
            warnUnreachable: 'Warnungen nicht erreichbar',
            aqiDefaultTitle: 'Luftqualität',
            aqiGood: 'Gut',
            aqiModerate: 'Mäßig',
            aqiPoor: 'Schlecht',
            aqiUnavailable: 'Luftqualität nicht verfügbar',
            aqiUnreachable: 'Luftqualität nicht erreichbar',
            pegelDefaultTitle: 'Elbe-Pegel',
            pegelUnavailable: 'Pegelstand nicht verfügbar',
            pegelUnreachable: 'Pegelstand nicht erreichbar',
            ewsDefaultTitle: 'Apocalypse EWS',
            ewsStats: (count, baseline, z) => `${count} Jets aktiv · erwartet ${baseline} · z ${z}`,
            ewsUnavailable: 'EWS nicht verfügbar',
            ewsUnreachable: 'EWS nicht erreichbar',
            defconDefaultTitle: 'DEFCON-Einschätzung',
            defconUnavailable: 'DEFCON-Daten nicht verfügbar',
            defconNoRegions: 'Keine Regionen verfügbar',
            defconUnreachable: 'DEFCON-Daten nicht erreichbar',
            complimentsDefaultTitle: 'Komplimente',
            complimentsNoItems: 'Keine Komplimente hinterlegt',
            todoDefaultTitle: 'Notizen',
            todoNoItems: 'Keine Einträge',
            apiUnreachable: 'API nicht erreichbar – Verbindung wird erneut versucht …',
            locale: 'de-DE',
        },
        en: {
            weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            calDefaultTitle: 'Calendar',
            calNoEvents: 'No upcoming events',
            calUnavailable: 'Calendar unavailable',
            calUnreachable: 'Calendar unreachable',
            newsDefaultTitle: 'News',
            newsNoSources: 'No news available',
            newsNoItems: 'No headlines',
            newsUnreachable: 'News unreachable',
            cryptoDefaultTitle: 'Crypto',
            cryptoNoData: 'No price data available',
            cryptoUnreachable: 'Price data unreachable',
            weatherDefaultTitle: 'Weather',
            weatherFeelsLike: 'feels like',
            weatherHumidity: 'Humidity',
            weatherWind: 'Wind',
            weatherGusts: 'gusts',
            weatherUnavailable: 'Weather unavailable',
            weatherUnreachable: 'Weather unreachable',
            stocksDefaultTitle: 'Stocks',
            stocksNa: 'n/a',
            quoteDefaultTitle: 'Quote of the Day',
            quoteUnavailable: 'No quote available',
            serverDefaultTitle: 'Server Status',
            serverSummary: (running, total) => `${running} of ${total} containers running`,
            serverUnavailable: 'Server status unavailable',
            serverNoContainers: 'No containers found',
            serverUnreachable: 'Server status unreachable',
            warnDefaultTitle: 'Warnings',
            warnNone: 'No current warnings',
            warnUnavailable: 'Warnings unavailable',
            warnUnreachable: 'Warnings unreachable',
            aqiDefaultTitle: 'Air Quality',
            aqiGood: 'Good',
            aqiModerate: 'Moderate',
            aqiPoor: 'Poor',
            aqiUnavailable: 'Air quality unavailable',
            aqiUnreachable: 'Air quality unreachable',
            pegelDefaultTitle: 'Elbe Water Level',
            pegelUnavailable: 'Water level unavailable',
            pegelUnreachable: 'Water level unreachable',
            ewsDefaultTitle: 'Apocalypse EWS',
            ewsStats: (count, baseline, z) => `${count} jets active · expected ${baseline} · z ${z}`,
            ewsUnavailable: 'EWS unavailable',
            ewsUnreachable: 'EWS unreachable',
            defconDefaultTitle: 'DEFCON Assessment',
            defconUnavailable: 'DEFCON data unavailable',
            defconNoRegions: 'No regions available',
            defconUnreachable: 'DEFCON data unreachable',
            complimentsDefaultTitle: 'Compliments',
            complimentsNoItems: 'No compliments configured',
            todoDefaultTitle: 'Notes',
            todoNoItems: 'No entries',
            apiUnreachable: 'API unreachable – retrying connection …',
            locale: 'en-US',
        },
    };

    let lang = 'de';
    function t(key, ...args) {
        const dict = I18N[lang] || I18N.de;
        const val = dict[key];
        return typeof val === 'function' ? val(...args) : (val ?? key);
    }

    let config = null;
    let lastConfigJson = null;

    async function fetchJson(path) {
        const res = await fetch(API_BASE + path, { cache: 'no-store' });
        return res.json();
    }

    function cellFor(position) {
        return document.querySelector(`.mm-cell[data-pos="${position}"]`);
    }

    // ---------------- Mehrspaltige Kacheln (z.B. News über 2–4 Felder) ----------------
    const GRID_COLS = 4;

    function applyColumnSpan(cell, position, span) {
        span = Math.min(Math.max(Number(span) || 1, 1), GRID_COLS);
        if (span <= 1) {
            cell.style.gridColumn = '';
            return;
        }
        const match = /-c(\d+)$/.exec(position || '');
        const col = match ? parseInt(match[1], 10) : 1;
        let start = col;
        if (start + span - 1 > GRID_COLS) start = GRID_COLS + 1 - span; // an den rechten Rand klemmen
        if (start < 1) start = 1;
        cell.style.gridColumn = `${start} / span ${span}`;
    }

    function widgetShell(title) {
        const wrap = document.createElement('div');
        wrap.className = 'mm-widget';
        if (title) {
            const h = document.createElement('div');
            h.className = 'mm-widget-title';
            h.textContent = title;
            wrap.appendChild(h);
        }
        return wrap;
    }

    // ---------------- Uhr ----------------
    function renderClock(wcfg) {
        const cell = cellFor(wcfg.position);
        if (!cell) return;
        applyColumnSpan(cell, wcfg.position, wcfg.span);
        cell.innerHTML = '';
        cell.dataset.widget = 'clock';
        const shell = widgetShell(null);
        const timeEl = document.createElement('div');
        timeEl.className = 'mm-clock-time';
        timeEl.style.fontWeight = wcfg.bold ? '700' : '300';
        const dateEl = document.createElement('div');
        dateEl.className = 'mm-clock-date';
        shell.appendChild(timeEl);
        if (wcfg.showDate) shell.appendChild(dateEl);
        cell.appendChild(shell);

        function tick() {
            const now = new Date();
            let h = now.getHours();
            let suffix = '';
            if (!wcfg.format24h) {
                suffix = h >= 12 ? ' PM' : ' AM';
                h = h % 12 || 12;
            }
            const hh = String(h).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const ss = String(now.getSeconds()).padStart(2, '0');
            timeEl.innerHTML = `${hh}:${mm}` + (wcfg.showSeconds ? `<span class="mm-secs">${ss}</span>` : '') + suffix;
            if (wcfg.showDate) {
                const wd = t('weekdays')[now.getDay()];
                const mo = t('months')[now.getMonth()];
                dateEl.textContent = lang === 'en'
                    ? `${wd}, ${mo} ${now.getDate()}, ${now.getFullYear()}`
                    : `${wd}, ${now.getDate()}. ${mo} ${now.getFullYear()}`;
            }
        }
        tick();
        setInterval(tick, 1000);
    }

    // ---------------- Kalender ----------------
    function formatEventWhen(iso, allDay) {
        const d = new Date(iso);
        const day = `${d.getDate()}.${d.getMonth() + 1}.`;
        if (allDay) return day;
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${day} ${hh}:${mm}`;
    }

    async function renderCalendar(wcfg) {
        const cell = cellFor(wcfg.position);
        if (!cell) return;
        let list = cell.querySelector('.mm-cal-list');
        if (!list || cell.dataset.widget !== 'calendar') {
            cell.innerHTML = '';
            const shell = widgetShell(wcfg.title || t('calDefaultTitle'));
            list = document.createElement('div');
            list.className = 'mm-cal-list';
            shell.appendChild(list);
            cell.appendChild(shell);
            cell.dataset.widget = 'calendar';
        }

        try {
            const data = await fetchJson('/api/calendar');
            if (!data.ok) {
                list.innerHTML = `<div class="mm-empty">${data.msg || t('calUnavailable')}</div>`;
                return;
            }
            if (!data.events.length) {
                list.innerHTML = `<div class="mm-empty">${t('calNoEvents')}</div>`;
                return;
            }
            list.innerHTML = data.events.map(ev => `
                <div class="mm-cal-item">
                    <div class="mm-cal-when">${formatEventWhen(ev.start, ev.allDay)}</div>
                    <div>
                        <div class="mm-cal-title">${escapeHtml(ev.title)}</div>
                        ${ev.location ? `<span class="mm-cal-loc">${escapeHtml(ev.location)}</span>` : ''}
                    </div>
                </div>
            `).join('');
        } catch (e) {
            list.innerHTML = `<div class="mm-empty">${t('calUnreachable')}</div>`;
        }
    }

    // ---------------- News (mehrere Quellen im Wechsel) ----------------
    const newsState = {}; // widgetId(=position) -> {sources, idx}
    const defconState = {}; // position -> {chunks, idx, timer}

    async function renderNews(wcfg) {
        const cell = cellFor(wcfg.position);
        if (!cell) return;
        applyColumnSpan(cell, wcfg.position, wcfg.span);
        cell.dataset.widget = 'news';
        const shell = widgetShell(null);
        shell.classList.add('mm-news');
        const sourceLabel = document.createElement('div');
        sourceLabel.className = 'mm-news-source';
        const ticker = document.createElement('div');
        ticker.className = 'mm-news-ticker';
        shell.appendChild(sourceLabel);
        shell.appendChild(ticker);
        cell.innerHTML = '';
        cell.appendChild(shell);

        try {
            const data = await fetchJson('/api/news');
            if (!data.ok || !(data.sources || []).length) {
                sourceLabel.textContent = wcfg.title || t('newsDefaultTitle');
                ticker.innerHTML = `<div class="mm-empty">${data.msg || t('newsNoSources')}</div>`;
                return;
            }
            const key = wcfg.position;
            const state = newsState[key] || { idx: 0 };
            state.sources = data.sources;
            if (state.idx >= state.sources.length) state.idx = 0;
            newsState[key] = state;

            paintNewsSource(wcfg, sourceLabel, ticker, state);

            if (state.sources.length > 1 && !state.rotating) {
                state.rotating = true;
                const rotationMs = (wcfg.rotationSec || 45) * 1000;
                state.timer = setInterval(() => {
                    state.idx = (state.idx + 1) % state.sources.length;
                    paintNewsSource(wcfg, sourceLabel, ticker, state);
                }, rotationMs);
            }
        } catch (e) {
            sourceLabel.textContent = wcfg.title || t('newsDefaultTitle');
            ticker.innerHTML = `<div class="mm-empty">${t('newsUnreachable')}</div>`;
        }
    }

    function paintNewsSource(wcfg, sourceLabel, ticker, state) {
        const src = state.sources[state.idx];
        sourceLabel.textContent = src.name || wcfg.title || t('newsDefaultTitle');
        if (!src.ok || !(src.items || []).length) {
            ticker.innerHTML = `<div class="mm-empty">${src.msg || t('newsNoItems')}</div>`;
            return;
        }
        const itemsHtml = src.items.map(it => `<span class="mm-news-item"><b>${escapeHtml(it.title)}</b></span>`).join('');
        const track = document.createElement('div');
        track.className = 'mm-news-track';
        track.innerHTML = itemsHtml + itemsHtml;
        const speed = wcfg.scrollSpeedSec || 40;
        track.style.animationDuration = `${speed}s`;
        ticker.innerHTML = '';
        ticker.appendChild(track);
    }

    // ---------------- Krypto ----------------
    async function renderCrypto(wcfg) {
        const cell = cellFor(wcfg.position);
        if (!cell) return;
        let list = cell.querySelector('.mm-crypto-list');
        if (!list || cell.dataset.widget !== 'crypto') {
            cell.innerHTML = '';
            const shell = widgetShell(wcfg.title || t('cryptoDefaultTitle'));
            list = document.createElement('div');
            list.className = 'mm-crypto-list';
            shell.appendChild(list);
            cell.appendChild(shell);
            cell.dataset.widget = 'crypto';
        }

        try {
            const data = await fetchJson('/api/crypto');
            if (!data.ok || !data.prices.length) {
                list.innerHTML = `<div class="mm-empty">${data.msg || t('cryptoNoData')}</div>`;
                return;
            }
            list.innerHTML = data.prices.map(p => {
                const changeCls = (p.change24h || 0) >= 0 ? 'up' : 'down';
                const changeSign = (p.change24h || 0) >= 0 ? '+' : '';
                const priceFmt = p.price != null ? p.price.toLocaleString(t('locale'), { maximumFractionDigits: 2 }) : '–';
                const changeFmt = p.change24h != null ? `${changeSign}${p.change24h.toFixed(2)}%` : '';
                return `
                    <div class="mm-crypto-row">
                        <span class="mm-crypto-sym">${escapeHtml(p.ticker || p.id)}</span>
                        <span class="mm-crypto-price">${priceFmt} ${p.currency.toUpperCase()}</span>
                        <span class="mm-crypto-change ${changeCls}">${changeFmt}</span>
                    </div>`;
            }).join('');
        } catch (e) {
            list.innerHTML = `<div class="mm-empty">${t('cryptoUnreachable')}</div>`;
        }
    }

    // ---------------- Wetter ----------------
    async function renderWeather(wcfg) {
        const cell = cellFor(wcfg.position);
        if (!cell) return;
        let body = cell.querySelector('.mm-weather-body');
        if (!body || cell.dataset.widget !== 'weather') {
            cell.innerHTML = '';
            const shell = widgetShell(wcfg.title || t('weatherDefaultTitle'));
            body = document.createElement('div');
            body.className = 'mm-weather-body';
            shell.appendChild(body);
            cell.appendChild(shell);
            cell.dataset.widget = 'weather';
        }

        try {
            const data = await fetchJson('/api/weather');
            if (!data.ok) {
                body.innerHTML = '';
                body.appendChild(elWith('div', 'mm-empty', data.msg || t('weatherUnavailable')));
                return;
            }
            const w = data.weather;
            const feelsTxt = w.feelsLike != null ? `, ${t('weatherFeelsLike')} ${Math.round(w.feelsLike)}${w.unit}` : '';
            const humidityTxt = w.humidity != null ? `<span>${t('weatherHumidity')} ${Math.round(w.humidity)}%</span>` : '';
            const gustTxt = w.windGusts != null ? ` (${t('weatherGusts')} ${Math.round(w.windGusts)})` : '';
            const windTxt = w.windSpeed != null ? `<span>${t('weatherWind')} ${Math.round(w.windSpeed)} km/h${gustTxt}</span>` : '';
            const warningsHtml = (w.warnings || []).map(warn =>
                `<div class="mm-weather-warning wsev-${warn.severity}">${escapeHtml(warn.label)}</div>`
            ).join('');

            body.innerHTML = `
                <div class="mm-weather-main">
                    <span class="mm-weather-icon">${w.icon}</span>
                    <span class="mm-weather-temp">${w.temperature != null ? Math.round(w.temperature) : '–'}${w.unit}</span>
                </div>
                ${w.location ? `<div class="mm-weather-loc">${escapeHtml(w.location)}</div>` : ''}
                <div class="mm-weather-desc">${escapeHtml(w.description)}${feelsTxt}</div>
                <div class="mm-weather-stats">${humidityTxt}${windTxt}</div>
                ${warningsHtml ? `<div class="mm-weather-warnings">${warningsHtml}</div>` : ''}
            `;
        } catch (e) {
            body.innerHTML = '';
            body.appendChild(elWith('div', 'mm-empty', t('weatherUnreachable')));
        }
    }

    function elWith(tag, cls, text) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        e.textContent = text;
        return e;
    }

    // ---------------- Aktienkurse ----------------
    async function renderStocks(wcfg) {
        const cell = cellFor(wcfg.position);
        if (!cell) return;
        let list = cell.querySelector('.mm-crypto-list');
        if (!list || cell.dataset.widget !== 'stocks') {
            cell.innerHTML = '';
            const shell = widgetShell(wcfg.title || t('stocksDefaultTitle'));
            list = document.createElement('div');
            list.className = 'mm-crypto-list';
            shell.appendChild(list);
            cell.appendChild(shell);
            cell.dataset.widget = 'stocks';
        }

        try {
            const data = await fetchJson('/api/stocks');
            if (!data.ok || !data.quotes.length) {
                list.innerHTML = `<div class="mm-empty">${data.msg || t('cryptoNoData')}</div>`;
                return;
            }
            list.innerHTML = data.quotes.map(q => {
                if (!q.ok) {
                    return `<div class="mm-crypto-row"><span class="mm-crypto-sym">${escapeHtml(q.symbol)}</span><span class="mm-empty">${escapeHtml(q.msg || t('stocksNa'))}</span></div>`;
                }
                const changeCls = (q.change24h || 0) >= 0 ? 'up' : 'down';
                const changeSign = (q.change24h || 0) >= 0 ? '+' : '';
                const priceFmt = q.price != null ? q.price.toLocaleString(t('locale'), { maximumFractionDigits: 2 }) : '–';
                const changeFmt = q.change24h != null ? `${changeSign}${q.change24h.toFixed(2)}%` : '';
                return `
                    <div class="mm-crypto-row">
                        <span class="mm-crypto-sym">${escapeHtml(q.symbol)}</span>
                        <span class="mm-crypto-price">${priceFmt}${q.currency ? ' ' + q.currency : ''}</span>
                        <span class="mm-crypto-change ${changeCls}">${changeFmt}</span>
                    </div>`;
            }).join('');
        } catch (e) {
            list.innerHTML = `<div class="mm-empty">${t('cryptoUnreachable')}</div>`;
        }
    }

    // ---------------- Zitat des Tages ----------------
    async function renderQuote(wcfg) {
        const cell = cellFor(wcfg.position);
        if (!cell) return;
        applyColumnSpan(cell, wcfg.position, wcfg.span);
        let body = cell.querySelector('.mm-quote-body');
        if (!body || cell.dataset.widget !== 'quote') {
            cell.innerHTML = '';
            const shell = widgetShell(wcfg.title || t('quoteDefaultTitle'));
            body = document.createElement('div');
            body.className = 'mm-quote-body';
            shell.appendChild(body);
            cell.appendChild(shell);
            cell.dataset.widget = 'quote';
        }

        try {
            const data = await fetchJson('/api/quote');
            if (!data.ok) {
                body.innerHTML = `<div class="mm-empty">${data.msg || t('quoteUnavailable')}</div>`;
                return;
            }
            const q = data.quote;
            body.innerHTML = `
                <div class="mm-quote-text">${escapeHtml(q.text)}</div>
                ${q.author ? `<div class="mm-quote-author">${escapeHtml(q.author)}</div>` : ''}
            `;
        } catch (e) {
            body.innerHTML = `<div class="mm-empty">${t('quoteUnavailable')}</div>`;
        }
    }

    // ---------------- Server-Status ----------------
    const SERVER_PAGE_SIZE = 4;
    const serverState = {}; // position -> {chunks, idx, timer}

    function paintServerChunk(body, total, running, state) {
        const summary = `<div class="mm-server-summary">${t('serverSummary', running, total)}</div>`;
        const chunk = state.chunks[state.idx];
        const rows = chunk.map(c => {
            const isRunning = c.status === 'running';
            return `
                <div class="mm-server-row">
                    <span class="mm-server-dot ${isRunning ? 'running' : 'stopped'}"></span>
                    <span class="mm-server-name">${escapeHtml(c.name)}</span>
                </div>`;
        }).join('');
        body.innerHTML = summary + `<div class="mm-server-list">${rows || `<div class="mm-empty">${t('serverNoContainers')}</div>`}</div>`;
    }

    async function renderServerStatus(wcfg) {
        const cell = cellFor(wcfg.position);
        if (!cell) return;
        let body = cell.querySelector('.mm-server-body');
        if (!body || cell.dataset.widget !== 'serverStatus') {
            cell.innerHTML = '';
            const shell = widgetShell(wcfg.title || t('serverDefaultTitle'));
            body = document.createElement('div');
            body.className = 'mm-server-body';
            shell.appendChild(body);
            cell.appendChild(shell);
            cell.dataset.widget = 'serverStatus';
        }

        try {
            const data = await fetchJson('/api/server-status');
            if (!data.ok) {
                body.innerHTML = `<div class="mm-empty">${data.msg || t('serverUnavailable')}</div>`;
                return;
            }

            const containers = data.containers || [];
            const chunks = [];
            for (let i = 0; i < containers.length; i += SERVER_PAGE_SIZE) {
                chunks.push(containers.slice(i, i + SERVER_PAGE_SIZE));
            }
            if (!chunks.length) chunks.push([]);

            const key = wcfg.position;
            const state = serverState[key] || { idx: 0 };
            state.chunks = chunks;
            if (state.idx >= state.chunks.length) state.idx = 0;
            serverState[key] = state;

            paintServerChunk(body, data.total, data.running, state);

            if (state.chunks.length > 1 && !state.rotating) {
                state.rotating = true;
                const rotationMs = (wcfg.rotationSec || 15) * 1000;
                state.timer = setInterval(() => {
                    state.idx = (state.idx + 1) % state.chunks.length;
                    paintServerChunk(body, data.total, data.running, state);
                }, rotationMs);
            }
        } catch (e) {
            body.innerHTML = `<div class="mm-empty">${t('serverUnreachable')}</div>`;
        }
    }

    // ---------------- Amtliche Warnungen ----------------
    function formatWarnTime(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${dd}.${mm}. ${hh}:${min}`;
    }

    async function renderWarnings(wcfg) {
        const cell = cellFor(wcfg.position);
        if (!cell) return;
        let body = cell.querySelector('.mm-warn-body');
        if (!body || cell.dataset.widget !== 'warnings') {
            cell.innerHTML = '';
            const shell = widgetShell(wcfg.title || t('warnDefaultTitle'));
            body = document.createElement('div');
            body.className = 'mm-warn-body';
            shell.appendChild(body);
            cell.appendChild(shell);
            cell.dataset.widget = 'warnings';
        }

        try {
            const data = await fetchJson('/api/warnings');
            if (!data.ok) {
                body.innerHTML = `<div class="mm-empty">${data.msg || t('warnUnavailable')}</div>`;
                return;
            }
            if (!data.warnings.length) {
                body.innerHTML = `<div class="mm-warn-ok">${t('warnNone')}${data.location ? ' – ' + escapeHtml(data.location) : ''}</div>`;
                return;
            }
            body.innerHTML = `<div class="mm-warn-list">` + data.warnings.map(w => {
                const cls = w.severity ? ` wsev-${w.severity}` : '';
                const meta = [w.provider, formatWarnTime(w.sent)].filter(Boolean).join(' · ');
                return `
                    <div class="mm-warn-item${cls}">
                        <span class="mm-warn-title">${escapeHtml(w.title)}</span>
                        ${meta ? `<span class="mm-warn-meta">${escapeHtml(meta)}</span>` : ''}
                    </div>`;
            }).join('') + `</div>`;
        } catch (e) {
            body.innerHTML = `<div class="mm-empty">${t('warnUnreachable')}</div>`;
        }
    }

    // ---------------- Luftqualität ----------------
    function aqiBand(aqi) {
        if (aqi == null) return { cls: '', label: '' };
        if (aqi <= 40) return { cls: 'aqi-good', label: t('aqiGood') };
        if (aqi <= 80) return { cls: 'aqi-moderate', label: t('aqiModerate') };
        return { cls: 'aqi-poor', label: t('aqiPoor') };
    }

    async function renderAirQuality(wcfg) {
        const cell = cellFor(wcfg.position);
        if (!cell) return;
        let body = cell.querySelector('.mm-aqi-body');
        if (!body || cell.dataset.widget !== 'airQuality') {
            cell.innerHTML = '';
            const shell = widgetShell(wcfg.title || t('aqiDefaultTitle'));
            body = document.createElement('div');
            body.className = 'mm-aqi-body';
            shell.appendChild(body);
            cell.appendChild(shell);
            cell.dataset.widget = 'airQuality';
        }

        try {
            const data = await fetchJson('/api/air-quality');
            if (!data.ok) {
                body.innerHTML = `<div class="mm-empty">${data.msg || t('aqiUnavailable')}</div>`;
                return;
            }
            const a = data.airQuality;
            const band = aqiBand(a.aqi);
            const details = [];
            if (a.pm25 != null) details.push(`PM2.5 ${Math.round(a.pm25)} µg/m³`);
            if (a.pm10 != null) details.push(`PM10 ${Math.round(a.pm10)} µg/m³`);
            if (a.ozone != null) details.push(`Ozon ${Math.round(a.ozone)} µg/m³`);

            body.innerHTML = `
                <div class="mm-aqi-main">
                    <span class="mm-aqi-value ${band.cls}">${a.aqi != null ? Math.round(a.aqi) : '–'}</span>
                    <span class="mm-aqi-label">${band.label} ${a.location ? '· ' + escapeHtml(a.location) : ''}</span>
                </div>
                <div class="mm-aqi-details">${details.map(d => `<span>${d}</span>`).join('')}</div>
            `;
        } catch (e) {
            body.innerHTML = `<div class="mm-empty">${t('aqiUnreachable')}</div>`;
        }
    }

    // ---------------- Elbe-Pegelstand ----------------
    function pegelTrendArrow(trend) {
        if (trend == null) return '';
        if (trend > 0) return '<span class="mm-pegel-trend">↑</span>';
        if (trend < 0) return '<span class="mm-pegel-trend">↓</span>';
        return '<span class="mm-pegel-trend">→</span>';
    }

    async function renderElbePegel(wcfg) {
        const cell = cellFor(wcfg.position);
        if (!cell) return;
        let body = cell.querySelector('.mm-pegel-body');
        if (!body || cell.dataset.widget !== 'elbePegel') {
            cell.innerHTML = '';
            const shell = widgetShell(wcfg.title || t('pegelDefaultTitle'));
            body = document.createElement('div');
            body.className = 'mm-pegel-body';
            shell.appendChild(body);
            cell.appendChild(shell);
            cell.dataset.widget = 'elbePegel';
        }

        try {
            const data = await fetchJson('/api/elbe-pegel');
            if (!data.ok) {
                body.innerHTML = `<div class="mm-empty">${data.msg || t('pegelUnavailable')}</div>`;
                return;
            }
            body.innerHTML = `
                <div class="mm-pegel-main">
                    <span class="mm-pegel-value">${data.value != null ? data.value.toLocaleString(t('locale')) : '–'}</span>
                    <span class="mm-pegel-unit">${escapeHtml(data.unit || 'cm')}</span>
                    ${pegelTrendArrow(data.trend)}
                </div>
                ${data.station ? `<div class="mm-pegel-station">${escapeHtml(data.station)}</div>` : ''}
            `;
        } catch (e) {
            body.innerHTML = `<div class="mm-empty">${t('pegelUnreachable')}</div>`;
        }
    }

    // ---------------- Apocalypse EWS ----------------
    function ewsLevelClass(level) {
        if (level == null) return '';
        if (level <= 2) return 'lvl-low';
        if (level === 3) return 'lvl-mid';
        return 'lvl-high';
    }

    async function renderEws(wcfg) {
        const cell = cellFor(wcfg.position);
        if (!cell) return;
        let body = cell.querySelector('.mm-ews-body');
        if (!body || cell.dataset.widget !== 'ews') {
            cell.innerHTML = '';
            const shell = widgetShell(wcfg.title || t('ewsDefaultTitle'));
            body = document.createElement('div');
            body.className = 'mm-ews-body';
            shell.appendChild(body);
            cell.appendChild(shell);
            cell.dataset.widget = 'ews';
        }

        try {
            const data = await fetchJson('/api/ews');
            if (!data.ok) {
                body.innerHTML = `<div class="mm-empty">${data.msg || t('ewsUnavailable')}</div>`;
                return;
            }
            const cls = ewsLevelClass(data.emergencyLevel);
            const count = data.concurrentCount != null ? Math.round(data.concurrentCount) : '–';
            const baseline = data.baselineMean != null ? Math.round(data.baselineMean) : '–';
            const z = data.zScore != null ? data.zScore.toFixed(2) : '–';
            body.innerHTML = `
                <div class="mm-ews-main">
                    <span class="mm-ews-level ${cls}">${data.emergencyLevel ?? '–'}</span>
                    <span class="mm-ews-label">${escapeHtml(data.alertLevel || '')}</span>
                </div>
                <div class="mm-ews-stats">${t('ewsStats', count, baseline, z)}</div>
            `;
        } catch (e) {
            body.innerHTML = `<div class="mm-empty">${t('ewsUnreachable')}</div>`;
        }
    }

    // ---------------- DEFCON-Einschätzung ----------------
    const DEFCON_PAGE_SIZE = 4;

    function paintDefconChunk(body, state) {
        const chunk = state.chunks[state.idx];
        body.innerHTML = `<div class="mm-defcon-list">` + chunk.map(r => `
            <div class="mm-defcon-row">
                <span class="mm-defcon-name">${escapeHtml(r.name)}</span>
                <span class="mm-defcon-value wsev-${r.severity}">${Number(r.value).toFixed(1)}</span>
            </div>`).join('') + `</div>`;
    }

    async function renderDefcon(wcfg) {
        const cell = cellFor(wcfg.position);
        if (!cell) return;
        applyColumnSpan(cell, wcfg.position, wcfg.span);
        let body = cell.querySelector('.mm-defcon-body');
        if (!body || cell.dataset.widget !== 'defcon') {
            cell.innerHTML = '';
            const shell = widgetShell(wcfg.title || t('defconDefaultTitle'));
            body = document.createElement('div');
            body.className = 'mm-defcon-body';
            shell.appendChild(body);
            cell.appendChild(shell);
            cell.dataset.widget = 'defcon';
        }

        try {
            const data = await fetchJson('/api/defcon');
            if (!data.ok) {
                body.innerHTML = `<div class="mm-empty">${data.msg || t('defconUnavailable')}</div>`;
                return;
            }
            if (!data.regions.length) {
                body.innerHTML = `<div class="mm-empty">${t('defconNoRegions')}</div>`;
                return;
            }

            const chunks = [];
            for (let i = 0; i < data.regions.length; i += DEFCON_PAGE_SIZE) {
                chunks.push(data.regions.slice(i, i + DEFCON_PAGE_SIZE));
            }

            const key = wcfg.position;
            const state = defconState[key] || { idx: 0 };
            state.chunks = chunks;
            if (state.idx >= state.chunks.length) state.idx = 0;
            defconState[key] = state;

            paintDefconChunk(body, state);

            if (state.chunks.length > 1 && !state.rotating) {
                state.rotating = true;
                const rotationMs = (wcfg.rotationSec || 15) * 1000;
                state.timer = setInterval(() => {
                    state.idx = (state.idx + 1) % state.chunks.length;
                    paintDefconChunk(body, state);
                }, rotationMs);
            }
        } catch (e) {
            body.innerHTML = `<div class="mm-empty">${t('defconUnreachable')}</div>`;
        }
    }

    // ---------------- Komplimente ----------------
    const complimentState = {}; // position -> {items, idx, timer}

    function paintCompliment(body, state) {
        body.innerHTML = `<div class="mm-compliment-text">${escapeHtml(state.items[state.idx])}</div>`;
    }

    function renderCompliments(wcfg) {
        const cell = cellFor(wcfg.position);
        if (!cell) return;
        applyColumnSpan(cell, wcfg.position, wcfg.span);
        let body = cell.querySelector('.mm-compliment-body');
        if (!body || cell.dataset.widget !== 'compliments') {
            cell.innerHTML = '';
            const shell = widgetShell(wcfg.title || t('complimentsDefaultTitle'));
            body = document.createElement('div');
            body.className = 'mm-compliment-body';
            shell.appendChild(body);
            cell.appendChild(shell);
            cell.dataset.widget = 'compliments';
        }

        const items = (wcfg.items || []).filter(Boolean);
        if (!items.length) {
            body.innerHTML = `<div class="mm-empty">${t('complimentsNoItems')}</div>`;
            return;
        }

        const key = wcfg.position;
        const state = complimentState[key] || { idx: 0 };
        state.items = items;
        if (state.idx >= state.items.length) state.idx = 0;
        complimentState[key] = state;

        paintCompliment(body, state);

        if (state.items.length > 1 && !state.rotating) {
            state.rotating = true;
            const rotationMs = (wcfg.rotationSec || 10) * 1000;
            state.timer = setInterval(() => {
                state.idx = (state.idx + 1) % state.items.length;
                paintCompliment(body, state);
            }, rotationMs);
        }
    }

    // ---------------- Notizen / To-Do ----------------
    function renderTodo(wcfg) {
        const cell = cellFor(wcfg.position);
        if (!cell) return;
        const shell = widgetShell(wcfg.title || t('todoDefaultTitle'));
        const list = document.createElement('div');
        list.className = 'mm-todo-list';
        const items = wcfg.items || [];
        if (!items.length) {
            list.innerHTML = `<div class="mm-empty">${t('todoNoItems')}</div>`;
        } else {
            list.innerHTML = items.map(it => `
                <div class="mm-todo-item${it.done ? ' done' : ''}">
                    <span class="mm-todo-check">${it.done ? '[x]' : '[ ]'}</span>
                    <span class="mm-todo-text">${escapeHtml(it.text)}</span>
                </div>`).join('');
        }
        shell.appendChild(list);
        cell.innerHTML = '';
        cell.dataset.widget = 'todo';
        cell.appendChild(shell);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }

    const RENDERERS = {
        clock: renderClock,
        calendar: renderCalendar,
        news: renderNews,
        crypto: renderCrypto,
        weather: renderWeather,
        todo: renderTodo,
        stocks: renderStocks,
        quote: renderQuote,
        serverStatus: renderServerStatus,
        warnings: renderWarnings,
        airQuality: renderAirQuality,
        elbePegel: renderElbePegel,
        ews: renderEws,
        defcon: renderDefcon,
        compliments: renderCompliments,
    };

    const REFRESH_MS = {
        calendar: 5 * 60 * 1000,
        news: 10 * 60 * 1000,
        crypto: 60 * 1000,
        weather: 10 * 60 * 1000,
        stocks: 5 * 60 * 1000,
        quote: 60 * 60 * 1000,
        serverStatus: 30 * 1000,
        warnings: 5 * 60 * 1000,
        airQuality: 30 * 60 * 1000,
        elbePegel: 15 * 60 * 1000,
        ews: 20 * 60 * 1000,
        defcon: 5 * 60 * 1000,
    };

    function clearAllCells() {
        Object.values(newsState).forEach(s => { if (s.timer) clearInterval(s.timer); });
        for (const k in newsState) delete newsState[k];
        Object.values(defconState).forEach(s => { if (s.timer) clearInterval(s.timer); });
        for (const k in defconState) delete defconState[k];
        Object.values(complimentState).forEach(s => { if (s.timer) clearInterval(s.timer); });
        for (const k in complimentState) delete complimentState[k];
        Object.values(serverState).forEach(s => { if (s.timer) clearInterval(s.timer); });
        for (const k in serverState) delete serverState[k];
        document.querySelectorAll('.mm-cell').forEach(c => {
            c.innerHTML = '';
            c.style.gridColumn = '';
            delete c.dataset.widget;
        });
    }

    function renderAll() {
        if (!config) return;
        clearAllCells();
        for (const [id, wcfg] of Object.entries(config.widgets || {})) {
            if (!wcfg.enabled) continue;
            const fn = RENDERERS[id];
            if (fn) fn(wcfg);
        }
    }

    async function loadConfigAndRender() {
        try {
            const data = await fetchJson('/api/config');
            if (!data.ok) return;
            const newConfigJson = JSON.stringify(data.config);
            if (newConfigJson === lastConfigJson) {
                // Konfiguration unverändert – kein Neuaufbau nötig, verhindert den
                // "ganze Seite blinkt" Effekt bei jedem 60s-Poll. Die einzelnen
                // Widgets aktualisieren ihre Werte ohnehin über eigene Timer.
                return;
            }
            lastConfigJson = newConfigJson;
            config = data.config;
            lang = (config.language === 'en') ? 'en' : 'de';
            renderAll();
        } catch (e) {
            document.querySelector('.mm-grid').innerHTML =
                `<div class="mm-cell mm-cell-center" data-pos="r2-c2"><div class="mm-empty">${t('apiUnreachable')}</div></div>`;
        }
    }

    // Periodische Auffrischung der dynamischen Widgets (ohne komplettes Re-Render,
    // damit z.B. der News-Ticker nicht neu von vorn beginnt).
    function scheduleRefresh() {
        setInterval(() => {
            if (!config) return;
            for (const [id, wcfg] of Object.entries(config.widgets || {})) {
                if (!wcfg.enabled || !REFRESH_MS[id]) continue;
                RENDERERS[id](wcfg);
            }
        }, 30 * 1000);
    }

    // Konfiguration alle 60s neu holen, falls im Admin etwas geändert wurde.
    setInterval(loadConfigAndRender, 60 * 1000);

    document.addEventListener('DOMContentLoaded', () => {
        loadConfigAndRender();
        scheduleRefresh();
    });
})();
