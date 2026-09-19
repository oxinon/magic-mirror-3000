(() => {
    'use strict';

    // Gleiches Muster wie mirror.js: die API läuft auf demselben Host, aber
    // auf API_PORT statt dem Port dieser Seite (5034).
    const API_BASE = `${location.protocol}//${location.hostname}:${window.MM_API_PORT}`;

    const listEl = document.getElementById('slList');
    const emptyEl = document.getElementById('slEmpty');
    const countEl = document.getElementById('slCount');
    const statusEl = document.getElementById('slStatus');
    const titleEl = document.getElementById('slTitle');
    const addForm = document.getElementById('slAddForm');
    const addInput = document.getElementById('slAddInput');
    const clearBtn = document.getElementById('slClearBtn');

    let items = []; // [{text, done}]
    let saving = false;
    let pendingSave = false;
    let editingIndex = -1; // während Inline-Bearbeitung kein Auto-Refresh-Rerender

    async function fetchJson(url, opts) {
        const res = await fetch(url, { cache: 'no-store', ...opts });
        return res.json();
    }

    function setStatus(text, isError) {
        statusEl.textContent = text;
        statusEl.className = 'sl-status' + (isError ? ' error' : '');
    }

    async function loadTitle() {
        try {
            const data = await fetchJson(`${API_BASE}/api/config`);
            const title = data.ok && data.config?.widgets?.todo?.title;
            if (title) {
                titleEl.textContent = title;
                document.title = title;
            }
        } catch (e) { /* Titel ist kosmetisch, kein Abbruch bei Fehler */ }
    }

    async function loadItems({ silent } = {}) {
        try {
            const data = await fetchJson(`${API_BASE}/api/todo-list`);
            if (!data.ok) throw new Error(data.msg || 'Fehler beim Laden');
            const incoming = data.items || [];
            // Während einer aktiven Inline-Bearbeitung nicht drüberbügeln --
            // sonst reißt ein Auto-Refresh mitten im Tippen den Text weg.
            if (editingIndex === -1 && JSON.stringify(incoming) !== JSON.stringify(items)) {
                items = incoming;
                render();
            }
            if (!silent) setStatus('');
        } catch (e) {
            if (!silent) setStatus('Nicht erreichbar', true);
        }
    }

    async function saveItems() {
        if (saving) { pendingSave = true; return; }
        saving = true;
        setStatus('Speichert …');
        try {
            const data = await fetchJson(`${API_BASE}/api/todo-list`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            });
            if (!data.ok) throw new Error(data.msg || 'Fehler beim Speichern');
            setStatus('Gespeichert');
            setTimeout(() => setStatus(''), 1500);
        } catch (e) {
            setStatus('Speichern fehlgeschlagen', true);
        } finally {
            saving = false;
            if (pendingSave) { pendingSave = false; saveItems(); }
        }
    }

    function render() {
        const openItems = items.map((it, i) => ({ ...it, i })).filter(it => !it.done);
        const doneItems = items.map((it, i) => ({ ...it, i })).filter(it => it.done);

        countEl.textContent = items.length ? `${openItems.length} offen` : '';
        emptyEl.style.display = items.length ? 'none' : 'block';

        const rows = [];
        if (openItems.length) {
            rows.push(...openItems.map(rowHtml));
        }
        if (doneItems.length) {
            rows.push(`<div class="sl-section-label">Erledigt</div>`);
            rows.push(...doneItems.map(rowHtml));
        }
        listEl.querySelectorAll('.sl-item, .sl-section-label').forEach(el => el.remove());
        listEl.insertAdjacentHTML('beforeend', rows.join(''));

        listEl.querySelectorAll('.sl-item').forEach(el => {
            const i = Number(el.dataset.index);
            el.querySelector('.sl-checkbox').addEventListener('click', () => toggleItem(i));
            el.querySelector('.sl-item-delete').addEventListener('click', () => deleteItem(i));
            const textEl = el.querySelector('.sl-item-text');
            textEl.addEventListener('click', () => startEdit(i, textEl));
        });
    }

    function rowHtml(it) {
        return `
            <div class="sl-item${it.done ? ' done' : ''}" data-index="${it.i}">
                <button type="button" class="sl-checkbox" aria-label="Erledigt">✓</button>
                <span class="sl-item-text">${escapeHtml(it.text)}</span>
                <button type="button" class="sl-item-delete" aria-label="Löschen">✕</button>
            </div>`;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }

    function toggleItem(i) {
        items[i].done = !items[i].done;
        render();
        saveItems();
    }

    function deleteItem(i) {
        items.splice(i, 1);
        render();
        saveItems();
    }

    function startEdit(i, textEl) {
        editingIndex = i;
        textEl.contentEditable = 'true';
        textEl.focus();
        document.execCommand('selectAll', false, null);

        const finish = () => {
            textEl.contentEditable = 'false';
            const newText = textEl.textContent.trim();
            editingIndex = -1;
            if (!newText) {
                deleteItem(i);
            } else if (newText !== items[i].text) {
                items[i].text = newText;
                saveItems();
            }
            textEl.removeEventListener('blur', finish);
            textEl.removeEventListener('keydown', onKeydown);
        };
        const onKeydown = (e) => {
            if (e.key === 'Enter') { e.preventDefault(); textEl.blur(); }
            if (e.key === 'Escape') { textEl.textContent = items[i].text; textEl.blur(); }
        };
        textEl.addEventListener('blur', finish);
        textEl.addEventListener('keydown', onKeydown);
    }

    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = addInput.value.trim();
        if (!text) return;
        items.unshift({ text, done: false });
        addInput.value = '';
        render();
        saveItems();
    });

    clearBtn.addEventListener('click', () => {
        if (!items.some(it => it.done)) return;
        items = items.filter(it => !it.done);
        render();
        saveItems();
    });

    loadTitle();
    loadItems();
    setInterval(() => loadItems({ silent: true }), 6000);
})();
