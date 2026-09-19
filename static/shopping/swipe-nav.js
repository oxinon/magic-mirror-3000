/* swipe-nav.js -- identisch auf allen drei Screens (Spiegel/Einkaufsliste/
   Notizen) eingebunden. Jede Seite setzt vor dem Einbinden dieses Skripts:
     window.MM_MIRROR_PORT, MM_SHOPPING_PORT, MM_TODO_PORT  (die drei Ports)
     window.MM_CURRENT_SCREEN                                (0, 1 oder 2)
   Wischen nach links -> nächster Screen, nach rechts -> vorheriger,
   im Kreis (nach dem letzten kommt wieder der erste). Navigation erfolgt
   per echtem Seitenwechsel (location.href), da jeder Screen eine eigene
   Flask-App auf einem eigenen Port ist -- kein SPA-Routing nötig. */
(() => {
    const PORTS = [window.MM_MIRROR_PORT, window.MM_SHOPPING_PORT, window.MM_TODO_PORT];
    const CURRENT = window.MM_CURRENT_SCREEN;
    if (CURRENT == null || PORTS.some((p) => !p)) return;

    function goTo(delta) {
        const next = (CURRENT + delta + PORTS.length) % PORTS.length;
        location.href = `${location.protocol}//${location.hostname}:${PORTS[next]}/`;
    }

    const THRESHOLD_X = 70;   // Mindest-Wegstrecke horizontal, in px
    const MAX_Y = 60;         // Toleranz vertikal -- sonst zählt's als Scrollen
    const MAX_TIME_MS = 800;  // zu langsame/gehaltene Gesten ignorieren
    let startX = 0, startY = 0, startT = 0;

    document.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        startT = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const t = e.changedTouches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        const dt = Date.now() - startT;
        if (dt > MAX_TIME_MS) return;
        if (Math.abs(dx) < THRESHOLD_X || Math.abs(dy) > MAX_Y) return;
        if (dx < 0) goTo(1);   // nach links wischen -> nächster Screen
        else goTo(-1);         // nach rechts wischen -> vorheriger Screen
    }, { passive: true });

    // Positions-Punkte aktualisieren, falls im Markup vorhanden.
    document.querySelectorAll('.mm-swipe-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === CURRENT);
    });
})();
