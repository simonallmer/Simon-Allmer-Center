/* ============================================================
   SIMON ALLMER CENTER — the city guide
   One state (city × studio) drives every box on the overview
   and the map page. The Oracle (oracle-chat.js) can set it too,
   through window.Center.
   ============================================================ */
(() => {
    'use strict';

    const STUDIOS = window.STUDIOS;
    const CITIES = window.CITIES;
    const LOCATIONS = window.LOCATIONS;
    const NEWS = window.NEWS || [];
    const QUOTES = window.MEDITATIONS || [];

    const FILTER_STUDIOS = Object.keys(STUDIOS).filter(k => !STUDIOS[k].tagOnly);
    const ALL = { label: 'All Studios', color: '#c8a96a' };

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const ICON = {
        out: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
        route: '<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-6.1-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 14.9 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.2"/></svg>',
        map: '<svg viewBox="0 0 24 24"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/></svg>',
        arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
        close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
    };

    /* ============================================================
       Events — status derived from today
       ============================================================ */
    const now = () => new Date();
    const EVENTS = (window.EVENTS || []).map(e => ({ ...e, startDate: new Date(e.start), endDate: new Date(e.end) }))
        .sort((a, b) => a.startDate - b.startDate);

    function stampEvents() {
        const t = now();
        EVENTS.forEach(e => { e.status = e.endDate < t ? 'past' : 'upcoming'; });
        const next = EVENTS.find(e => e.status === 'upcoming');
        if (next) next.status = 'next';
    }
    stampEvents();

    /* ============================================================
       State
       ============================================================ */
    const store = {
        get() { try { return JSON.parse(localStorage.getItem('sac.state') || '{}'); } catch (e) { return {}; } },
        set(v) { try { localStorage.setItem('sac.state', JSON.stringify(v)); } catch (e) { /* private mode */ } }
    };

    const saved = store.get();
    const state = {
        city: CITIES.some(c => c.id === saved.city) ? saved.city : 'worldwide',
        studio: saved.studio === 'all' || FILTER_STUDIOS.includes(saved.studio) ? saved.studio : 'all',
        selected: null
    };

    const city = () => CITIES.find(c => c.id === state.city);
    const studioMeta = k => (k === 'all' ? ALL : STUDIOS[k]);

    const inCity = (item, cid = state.city) => cid === 'worldwide' || item.city === CITIES.find(c => c.id === cid).name;
    const hasStudio = (item, s = state.studio) => s === 'all' || item.studios.includes(s);

    const locationsFor = (cid = state.city, s = state.studio) => LOCATIONS.filter(l => inCity(l, cid) && hasStudio(l, s));
    const eventsFor = (cid = state.city, s = state.studio) => EVENTS.filter(e => inCity(e, cid) && hasStudio(e, s));
    const upcoming = list => list.filter(e => e.status !== 'past');

    /* ---------- Small renderers ---------- */
    const ordered = keys => Object.keys(STUDIOS).filter(k => keys.includes(k));
    const dotsHTML = studios => `<span class="dots">${studios.filter(k => STUDIOS[k]).map(k => `<i class="dot" style="--c:${STUDIOS[k].color}" title="${STUDIOS[k].label}"></i>`).join('')}</span>`;
    const tagHTML = k => STUDIOS[k] ? `<span class="tag" style="--c:${STUDIOS[k].color}"><i class="dot"></i>${STUDIOS[k].label}</span>` : '';
    const mon = d => d.toLocaleDateString('en-GB', { month: 'short' });
    const fmtDay = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const shortDate = e => e.dateLabel.replace(/, \d{4}$/, '');

    function coordsLabel(c) {
        const ns = c.lat >= 0 ? 'N' : 'S', ew = c.lng >= 0 ? 'E' : 'W';
        return `${Math.abs(c.lat).toFixed(4)}° ${ns}  ·  ${Math.abs(c.lng).toFixed(4)}° ${ew}`;
    }

    setInterval(() => renderNext(), 30000);

    // Same index for everyone on a given day; advances at local midnight.
    function dayIndex(length) {
        const t = now();
        const day = Math.floor((t - new Date(t.getFullYear(), 0, 0)) / 864e5) + t.getFullYear() * 366;
        return day % length;
    }

    /* ============================================================
       Overview
       ============================================================ */
    function renderContext() {
        $('#context').innerHTML = `<b>${esc(city().name)}</b><span class="sep"></span><b>${esc(studioMeta(state.studio).label)}</b>`;
    }

    function renderCity(animate) {
        const c = city();
        const name = $('#cityName');
        name.textContent = c.name;
        if (animate) { name.classList.remove('swap'); void name.offsetWidth; name.classList.add('swap'); }

        if (c.id === 'worldwide') {
            const all = [...LOCATIONS, ...EVENTS];
            const cities = new Set(all.map(x => x.city)), countries = new Set(all.map(x => x.country));
            $('#cityCoords').textContent = `${cities.size} CITIES  ·  ${countries.size} COUNTRIES`;
        } else {
            $('#cityCoords').textContent = coordsLabel(c);
        }

        const l = locationsFor().length, e = upcoming(eventsFor()).length;
        const scope = state.studio === 'all' ? '' : `<i>/</i>${esc(STUDIOS[state.studio].label)}`;
        $('#cityTally').innerHTML = `${l} Location${l === 1 ? '' : 's'}<i>/</i>${e} Upcoming Event${e === 1 ? '' : 's'}${scope}`;

        const picker = CITIES.map(x => `<button role="radio" aria-checked="${x.id === state.city}" data-city="${x.id}">${esc(x.name)}</button>`).join('');
        $('#cityPicker').innerHTML = picker;
        $('#mapCityPicker').innerHTML = picker;
    }

    function renderStudios() {
        const count = s => locationsFor(state.city, s).length + upcoming(eventsFor(state.city, s)).length;
        $('#studioPicker').innerHTML = ['all', ...FILTER_STUDIOS].map(k => {
            const m = studioMeta(k), n = count(k);
            return `<button class="studio-opt ${n ? '' : 'is-empty'}" role="radio" aria-checked="${k === state.studio}" data-studio="${k}" style="--c:${m.color}">
                <span class="bar"></span><span class="name">${esc(m.label)}</span><span class="count">${String(n).padStart(2, '0')}</span>
            </button>`;
        }).join('');

        $('#mapStudioPicker').innerHTML = ['all', ...FILTER_STUDIOS].map(k => {
            const m = studioMeta(k);
            return `<button class="chip" role="radio" aria-checked="${k === state.studio}" data-studio="${k}"><i class="dot" style="--c:${m.color}"></i>${k === 'all' ? 'All' : esc(m.label)}</button>`;
        }).join('');
    }

    function emptyLine(what, adj = '') {
        const s = state.studio === 'all' ? '' : STUDIOS[state.studio].label + ' ';
        const where = state.city === 'worldwide' ? '' : ` in ${city().name}`;
        return `<p class="empty">No ${adj}${s}${what}${where} yet.</p>`;
    }

    function renderLocations() {
        const list = locationsFor();
        const el = $('#locationList');
        if (!list.length) { el.innerHTML = `<li>${emptyLine('locations')}</li>`; return; }

        const row = l => `<li><button class="row" style="width:100%;text-align:left" data-open="loc:${l.id}">
            <span><span class="row-title">${esc(l.name)}${l.flagship ? '<span class="row-flag">FLAGSHIP</span>' : ''}</span>
            <span class="row-meta" style="display:block">${ordered(l.studios).map(k => STUDIOS[k].label).join(' · ')}</span></span>
            ${dotsHTML(ordered(l.studios))}
        </button></li>`;

        if (state.city === 'worldwide') {
            const groups = [];
            list.forEach(l => { let g = groups.find(g => g.city === l.city); if (!g) groups.push(g = { city: l.city, country: l.country, items: [] }); g.items.push(l); });
            el.innerHTML = groups.map(g => `<li class="group-head"><span>${esc(g.city)}</span><span>${esc(g.country)}</span></li>${g.items.map(row).join('')}`).join('');
        } else {
            el.innerHTML = list.map(row).join('');
        }
    }

    function eventRow(e) {
        const cls = `event ${e.status === 'past' ? 'is-past' : ''} ${e.status === 'next' ? 'is-next' : ''}`;
        return `<button class="${cls}" style="width:100%;text-align:left" data-open="ev:${e.id}">
            <span class="event-date"><span class="m">${mon(e.startDate)}</span><span class="d">${e.startDate.getDate()}</span></span>
            <span>
                <span class="event-title" style="display:block">${esc(e.name)}${e.status === 'next' ? '<span class="row-flag">NEXT</span>' : ''}</span>
                <span class="row-meta" style="display:block">${esc(e.city)} · ${esc(shortDate(e))}</span>
                <span class="event-tags">${ordered(e.studios).map(tagHTML).join('')}</span>
            </span>
        </button>`;
    }

    function renderEvents() {
        const list = eventsFor();
        const up = upcoming(list);
        const past = list.filter(e => e.status === 'past').reverse().slice(0, 2);
        let html = up.length ? up.map(eventRow).join('') : emptyLine('events', 'upcoming ');
        if (past.length) html += `<div class="group-head" style="padding-top:1.2rem"><span>Recently</span><span></span></div>` + past.map(eventRow).join('');
        $('#eventList').innerHTML = html;
    }

    function renderQuote() {
        if (!QUOTES.length) return;
        const idx = dayIndex(QUOTES.length), q = QUOTES[idx];
        $('#medText').textContent = q.text;
        const a = $('#medAuthor');
        a.textContent = q.author;
        if (q.url) a.href = q.url; else a.removeAttribute('href');
        $('#medNo').textContent = `No. ${String(idx + 1).padStart(2, '0')}`;
    }

    function renderArtwork() {
        const ARTS = window.ARTWORKS || [];
        const src = window.ARTWORK_SOURCE || {};
        const box = $('#artBox');
        if (!ARTS.length) { box.hidden = true; return; }
        const idx = dayIndex(ARTS.length), a = ARTS[idx];
        const sized = `${a.src}?format=2500w`;
        box.classList.toggle('is-tall', a.h > a.w);
        box.style.setProperty('--art', `url("${a.src}?format=500w")`);
        const img = $('#artImg');
        img.onload = () => img.classList.add('is-loaded');
        img.alt = `${a.title} — ${a.artist || src.artist}`;
        img.src = sized;
        $('#artLink').href = src.url;
        $('#artMore').href = src.url;
        $('#artTitle').textContent = a.title;
        $('#artCredit').innerHTML = `${esc(a.artist || src.artist)}<i>/</i>${esc(src.collection)}`;
        $('#artNo').textContent = `No. ${String(idx + 1).padStart(2, '0')} / ${ARTS.length}`;
    }

    function renderNews() {
        const match = NEWS.filter(p => state.studio === 'all' || p.studio === state.studio);
        const p = match[0] || NEWS[0];
        if (!p) { $('#newsBox').innerHTML = '<p class="empty">No news yet.</p>'; return; }
        $('#newsAside').textContent = match.length ? fmtDay(p.date) : 'Latest from all studios';
        $('#newsBox').innerHTML = `
            <div class="news-grid">
                <div>
                    <p class="news-kicker">${tagHTML(p.studio)}<span>${esc(p.kicker)}</span></p>
                    <h2 class="news-title">${esc(p.title)}</h2>
                    <p class="news-lede">${esc(p.lede)}</p>
                    <div class="news-actions">${p.links.map(([label, href], i) => `<a class="btn ${i === 0 ? 'solid' : ''}" href="${href}" target="_blank" rel="noopener">${esc(label)} ${i === 0 ? ICON.arrow : ICON.out}</a>`).join('')}</div>
                </div>
                <ul class="news-points">${(p.items || []).slice(0, 4).map(([b, s]) => `<li><b>${esc(b)}</b><span>${esc(s)}</span></li>`).join('')}</ul>
            </div>`;
    }

    // The next event still to come — as narrow as the filters allow,
    // widened step by step when they leave nothing.
    function nextEvent() {
        const tries = [[state.city, state.studio], [state.city, 'all'], ['worldwide', state.studio], ['worldwide', 'all']];
        for (const [c, s] of tries) {
            const e = upcoming(eventsFor(c, s))[0];
            if (e) return { event: e, widened: !(c === state.city && s === state.studio) };
        }
        return null;
    }

    function renderNext() {
        const el = $('#nextBox');
        const n = nextEvent();
        if (!n) { el.innerHTML = '<p class="empty">No events announced yet.</p>'; return; }
        const e = n.event, t = now();
        const live = e.startDate <= t;
        const diff = Math.max(0, e.startDate - t);
        const d = Math.floor(diff / 864e5), h = Math.floor(diff % 864e5 / 36e5), m = Math.floor(diff % 36e5 / 6e4);
        el.innerHTML = `
            ${n.widened ? `<p class="next-note">Nothing in this selection yet. The next event anywhere:</p>` : ''}
            <p class="next-name">${esc(e.name)}</p>
            <p class="next-where">${e.venue !== e.city ? esc(e.venue) + ' · ' : ''}${esc(e.city)} · ${esc(shortDate(e))}</p>
            ${live
                ? `<div class="countdown"><div style="grid-column:1/-1"><b>NOW ON</b><span>until ${e.endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span></div></div>`
                : `<div class="countdown">
                    <div><b>${String(d).padStart(2, '0')}</b><span>Days</span></div>
                    <div><b>${String(h).padStart(2, '0')}</b><span>Hours</span></div>
                    <div><b>${String(m).padStart(2, '0')}</b><span>Min</span></div>
                   </div>`}
            ${e.unveiling && e.unveiling.length ? `<p class="next-unveil">Unveiling <em>${e.unveiling.map(esc).join('</em> and <em>')}</em></p>` : ''}
            <button class="btn" data-open="ev:${e.id}">${ICON.map} View on Map</button>`;
    }

    function renderAll(animate) {
        renderContext();
        renderCity(animate);
        renderStudios();
        renderLocations();
        renderEvents();
        renderNews();
        renderNext();
        if (mapReady) syncMap(true);
    }

    /* ---------- Setters (also used by the Oracle) ---------- */
    function persist() { store.set({ city: state.city, studio: state.studio }); }

    function setCity(id) {
        if (!CITIES.some(c => c.id === id) || id === state.city) return;
        state.city = id;
        persist();
        renderAll(true);
    }

    function setStudio(k) {
        if (!(k === 'all' || FILTER_STUDIOS.includes(k)) || k === state.studio) return;
        state.studio = k;
        persist();
        renderAll(false);
    }

    document.addEventListener('click', e => {
        if (e.target.closest('.oracle')) return; // the Oracle handles its own
        const c = e.target.closest('[data-city]');
        if (c) return setCity(c.dataset.city);
        const s = e.target.closest('[data-studio]');
        if (s) return setStudio(s.dataset.studio);
        const o = e.target.closest('[data-open]');
        if (o) return showMap(o.dataset.open);
        if (e.target.closest('[data-showmap]')) return showMap();
        if (e.target.closest('[data-top]')) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });

    /* ============================================================
       Map page
       ============================================================ */
    let map, mapReady = false;
    const markers = new Map(); // 'loc:id' / 'ev:id' -> marker
    const mainStudio = item => item.studios.find(k => STUDIOS[k] && !STUDIOS[k].tagOnly) || item.studios[0];

    function ring(studios) {
        studios = ordered(studios).filter(k => !STUDIOS[k].tagOnly);
        if (studios.length === 1) return STUDIOS[studios[0]].color;
        const step = 360 / studios.length, gap = 5;
        return `conic-gradient(from -90deg, ${studios.map((k, i) => `${STUDIOS[k].color} ${i * step}deg ${i * step + step - gap}deg, transparent ${i * step + step - gap}deg ${(i + 1) * step}deg`).join(', ')})`;
    }

    function initMap() {
        map = L.map('map', { zoomControl: false, zoomSnap: 0.25, minZoom: 3, worldCopyJump: true }).setView([48.5, 11], 5);
        L.control.zoom({ position: 'topright' }).addTo(map);
        $('.leaflet-control-zoom-in').innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 5v14M5 12h14"/></svg>';
        $('.leaflet-control-zoom-out').innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M5 12h14"/></svg>';

        // Esri Dark Gray Canvas (keyless). Lifted in CSS so streets and water read.
        const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/';
        const attribution = 'Tiles &copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors';
        L.tileLayer(ESRI + 'World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxNativeZoom: 16, maxZoom: 19, attribution }).addTo(map);
        L.tileLayer(ESRI + 'World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', { maxNativeZoom: 16, maxZoom: 19, pane: 'overlayPane' }).addTo(map);

        LOCATIONS.forEach(l => {
            const size = l.flagship ? 38 : 28;
            markers.set('loc:' + l.id, L.marker([l.lat, l.lng], {
                title: l.name, riseOnHover: true,
                icon: L.divIcon({ className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
                    html: `<div class="pin ${l.flagship ? 'flagship' : ''}" style="--ring:${ring(l.studios)}"><span class="pin-ring"></span><span class="pin-core"></span></div>` })
            }).on('click', () => select('loc:' + l.id)));
        });

        EVENTS.forEach(e => {
            markers.set('ev:' + e.id, L.marker([e.lat, e.lng], {
                title: e.name, riseOnHover: true,
                icon: L.divIcon({ className: '', iconSize: [28, 28], iconAnchor: [14, 14],
                    html: `<div class="pin event ${e.status === 'past' ? 'is-past' : ''}" style="--c:${STUDIOS[mainStudio(e)].color}"><span class="diamond"></span><span class="pin-label">${esc(e.name)}</span></div>` })
            }).on('click', () => select('ev:' + e.id)));
        });

        mapReady = true;
    }

    const visibleKeys = () => [...locationsFor().map(l => 'loc:' + l.id), ...eventsFor().map(e => 'ev:' + e.id)];

    function syncMap(refit) {
        const keys = new Set(visibleKeys());
        markers.forEach((m, k) => { if (keys.has(k)) m.addTo(map); else m.remove(); });
        markPins();
        renderMapSide();
        $('#mapTitle').textContent = `${city().name} · ${studioMeta(state.studio).label}`;
        if (state.selected && !keys.has(state.selected)) closeCard();
        if (refit) fit();
    }

    function fit() {
        const pts = visibleKeys().map(k => markers.get(k).getLatLng());
        const c = city();
        if (pts.length > 1) map.flyToBounds(L.latLngBounds(pts), { padding: [80, 80], maxZoom: 14, duration: 1 });
        else if (pts.length === 1) map.flyTo(pts[0], 14, { duration: 1 });
        else if (c.lat) map.flyTo([c.lat, c.lng], 12, { duration: 1 });
        else map.flyTo([48.5, 11], 5, { duration: 1 });
    }

    function markPins() {
        markers.forEach((m, k) => m.getElement()?.querySelector('.pin')?.classList.toggle('is-selected', k === state.selected));
    }

    function renderMapSide() {
        const locs = locationsFor(), evs = eventsFor();
        const up = upcoming(evs), past = evs.filter(e => e.status === 'past').reverse();
        const pick = (key, glyph, color, title, meta, extra = '', cls = '') => `
            <button class="pick ${cls} ${state.selected === key ? 'is-selected' : ''}" data-select="${key}">
                <span class="glyph ${glyph}" style="--c:${color}"></span>
                <span><span class="row-title" style="display:block">${title}</span><span class="row-meta" style="display:block">${meta}</span></span>
                ${extra}
            </button>`;

        let html = `<div class="group-head"><span>Locations</span><span>${String(locs.length).padStart(2, '0')}</span></div>`;
        html += locs.length ? locs.map(l => pick('loc:' + l.id, 'loc', l.studios.length > 1 ? '#c8a96a' : STUDIOS[mainStudio(l)].color, esc(l.name), esc(l.city), dotsHTML(ordered(l.studios)))).join('') : emptyLine('locations');
        html += `<div class="group-head"><span>Events</span><span>${String(up.length).padStart(2, '0')}</span></div>`;
        html += up.length ? up.map(e => pick('ev:' + e.id, 'ev', STUDIOS[mainStudio(e)].color, esc(e.name), `${esc(e.city)} · ${esc(shortDate(e))}`)).join('') : emptyLine('events', 'upcoming ');
        if (past.length) html += `<div class="group-head"><span>Past</span><span></span></div>` + past.map(e => pick('ev:' + e.id, 'ev', STUDIOS[mainStudio(e)].color, esc(e.name), `${esc(e.city)} · ${esc(e.dateLabel)}`, '', 'is-past')).join('');
        $('#mapList').innerHTML = html;
    }

    $('#mapList').addEventListener('click', e => {
        const b = e.target.closest('[data-select]');
        if (b) select(b.dataset.select);
    });

    const directions = q => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

    function select(key) {
        const [kind, id] = key.split(':');
        const item = kind === 'loc' ? LOCATIONS.find(l => l.id === id) : EVENTS.find(e => e.id === id);
        if (!item) return;

        // Widen the selection if the item sits outside it
        if (!inCity(item)) state.city = 'worldwide';
        if (!hasStudio(item)) state.studio = 'all';
        persist();
        state.selected = key;
        renderContext(); renderCity(false); renderStudios(); renderLocations(); renderEvents(); renderNews(); renderNext();
        syncMap(false);
        $$('.pick').forEach(p => p.classList.toggle('is-selected', p.dataset.select === key));

        const card = $('#mapCard');
        if (kind === 'loc') {
            card.innerHTML = `
                <button class="icon-btn" data-close aria-label="Close">${ICON.close}</button>
                <p class="eyebrow">${item.flagship ? 'Flagship · ' : ''}Location</p>
                <h3>${esc(item.name)}</h3>
                <p class="meta">${esc(item.city)}, ${esc(item.country)}</p>
                ${item.note ? `<p class="meta" style="margin-top:.6rem;font-family:var(--serif);font-style:italic;font-size:.95rem;color:var(--pearl-2)">${esc(item.note)}</p>` : ''}
                <div class="tags">${ordered(item.studios).map(tagHTML).join('')}</div>
                <div class="actions">
                    <a class="btn solid" href="${directions(item.name + ', ' + item.city)}" target="_blank" rel="noopener">${ICON.route} Directions</a>
                    ${item.url ? `<a class="btn" href="${item.url}" target="_blank" rel="noopener">Website ${ICON.out}</a>` : ''}
                </div>`;
        } else {
            card.innerHTML = `
                <button class="icon-btn" data-close aria-label="Close">${ICON.close}</button>
                <p class="eyebrow">${item.status === 'next' ? 'Next Event' : item.status === 'past' ? 'Past Event' : 'Event'} · ${esc(item.dateLabel)}</p>
                <h3>${esc(item.name)}</h3>
                <p class="meta">${esc(item.venue)}${item.venue !== item.city ? ', ' + esc(item.city) : ''}<br>${esc(item.hours)}</p>
                ${item.unveiling && item.unveiling.length ? `<p class="meta" style="margin-top:.6rem">Unveiling <span style="font-family:var(--serif);color:var(--pearl);font-size:.95rem">${item.unveiling.map(esc).join(' and ')}</span></p>` : ''}
                <div class="tags">${ordered(item.studios).map(tagHTML).join('')}</div>
                <div class="actions">
                    <a class="btn solid" href="${item.url}" target="_blank" rel="noopener">Official Site ${ICON.out}</a>
                    <a class="btn" href="${directions(item.address)}" target="_blank" rel="noopener">${ICON.route} Directions</a>
                </div>`;
        }
        card.hidden = false;
        card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';

        const ll = markers.get(key).getLatLng();
        const z = Math.max(map.getZoom(), kind === 'loc' ? 15 : 13);
        const p = map.project(ll, z).add(L.point(0, card.offsetHeight / 2));
        map.flyTo(map.unproject(p, z), z, { duration: 1 });
        map.once('moveend', markPins);
        const row = $(`.pick[data-select="${key}"]`), list = $('#mapList');
        if (row) list.scrollTo({ top: row.offsetTop - list.offsetTop - 40, behavior: 'smooth' });
    }

    function closeCard() {
        state.selected = null;
        $('#mapCard').hidden = true;
        markPins();
        $$('.pick.is-selected').forEach(p => p.classList.remove('is-selected'));
    }

    $('#mapCard').addEventListener('click', e => { if (e.target.closest('[data-close]')) closeCard(); });

    /* ============================================================
       Showing the map — it lives at the foot of the overview
       ============================================================ */
    function showMap(selectKey) {
        const box = $('#mapBox');
        const top = box.getBoundingClientRect().top + window.scrollY - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--top')) - 12;
        window.scrollTo({ top, behavior: 'smooth' });
        map.invalidateSize();
        if (selectKey) setTimeout(() => select(selectKey), 350);
    }

    window.addEventListener('resize', () => map.invalidateSize());

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !document.querySelector('.oracle.is-open') && state.selected) closeCard();
    });

    /* ---------- Boot ---------- */
    initMap();
    renderAll(false);
    renderQuote();
    renderArtwork();
    if (location.hash === '#map') showMap();

    /* ---------- For the Oracle ---------- */
    window.Center = {
        state, setCity, setStudio, showMap, select, nextEvent,
        cities: CITIES, studios: STUDIOS, filterStudios: FILTER_STUDIOS,
        locationsFor, eventsFor, upcoming,
        quote: () => ({ text: $('#medText').textContent, author: $('#medAuthor').textContent, url: $('#medAuthor').getAttribute('href') })
    };
})();
