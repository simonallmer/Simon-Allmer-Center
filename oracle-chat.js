/* ============================================================
   THE ORACLE — as a concierge
   A chat with prepared answers. Recommendations run on the
   catalog Oracle's own knowledge (data/oracle-core.js: ORACLE,
   GAMES, QUESTIONS, nextQuestion, matching, ...); questions about
   places and dates are answered from the city guide (window.Center)
   and can set the overview's City and Studio boxes directly.
   ============================================================ */
(() => {
    'use strict';

    const C = window.Center;
    const $ = s => document.querySelector(s);
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const root = $('#oracle');
    const panel = $('#oraclePanel');
    const fab = $('#oracleFab');
    const log = $('#oracleLog');
    const replies = $('#oracleReplies');
    const stateEl = $('#oracleState');

    let started = false;
    let busy = false;

    /* ---------- Open / close ---------- */
    function open() {
        root.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        fab.setAttribute('aria-expanded', 'true');
        if (!started) { started = true; greet(); }
    }

    function close() {
        root.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        fab.setAttribute('aria-expanded', 'false');
    }

    fab.addEventListener('click', () => root.classList.contains('is-open') ? close() : open());
    $('#oracleClose').addEventListener('click', close);
    $('#oracleReset').addEventListener('click', () => { log.innerHTML = ''; greet(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('is-open')) close(); });

    /* ---------- Speaking ---------- */
    const scroll = () => log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });

    function say(html, sub) {
        return new Promise(resolve => {
            busy = true;
            replies.innerHTML = '';
            stateEl.textContent = 'Speaking';
            const dots = document.createElement('div');
            dots.className = 'msg typing';
            dots.innerHTML = '<i></i><i></i><i></i>';
            log.appendChild(dots);
            scroll();
            setTimeout(() => {
                dots.remove();
                const m = document.createElement('div');
                m.className = 'msg oracle-msg';
                m.innerHTML = html + (sub ? `<span class="sub">${sub}</span>` : '');
                log.appendChild(m);
                scroll();
                stateEl.textContent = 'Listening';
                busy = false;
                resolve();
            }, 520 + Math.min(600, html.length * 6));
        });
    }

    function heard(label) {
        const m = document.createElement('div');
        m.className = 'msg user-msg';
        m.textContent = label;
        log.appendChild(m);
        scroll();
    }

    function card(html, color) {
        const el = document.createElement('div');
        el.className = 'msg answer';
        if (color) el.style.setProperty('--c', color);
        el.innerHTML = html;
        log.appendChild(el);
        scroll();
        return el;
    }

    // options: [{ label, hint, color, quiet, run }]
    function offer(options) {
        replies.innerHTML = '';
        options.forEach((o, i) => {
            const b = document.createElement('button');
            b.className = 'reply' + (o.quiet ? ' quiet' : '');
            b.style.animationDelay = `${i * 0.04}s`;
            b.innerHTML = `<b>${o.color ? `<i class="dot" style="--c:${o.color}"></i>` : ''}${esc(o.label)}</b>${o.hint ? `<small>${esc(o.hint)}</small>` : ''}`;
            b.addEventListener('click', () => {
                if (busy) return;
                heard(o.label);
                o.run();
            });
            replies.appendChild(b);
        });
    }

    const menu = { label: 'Something else', quiet: true, run: () => home() };

    /* ============================================================
       The menu
       ============================================================ */
    async function greet() {
        await say('Welcome to the <em>Center</em>. What do you seek?', 'Choose, and I will narrow the world for you.');
        offerHome();
    }

    async function home() {
        await say('What else shall I find?');
        offerHome();
    }

    function offerHome() {
        offer([
            { label: 'Recommend me something', hint: 'A game, a journal, a record', run: () => ask('medium') },
            { label: 'Where can I find you?', hint: 'Locations by city and studio', run: whereCity },
            { label: 'What is on next?', hint: 'The next event', run: whatsNext },
            { label: 'A meditation', hint: 'Words for today', run: meditation }
        ]);
    }

    /* ============================================================
       Places — answered from the city guide
       ============================================================ */
    async function whereCity() {
        await say('In which <em>city</em>?');
        offer(C.cities.map(c => ({ label: c.name, run: () => whereStudio(c.id) })));
    }

    async function whereStudio(cityId) {
        C.setCity(cityId);
        await say('And which <em>studio</em>?');
        offer([
            { label: 'All Studios', color: '#c8a96a', run: () => wherePlaces(cityId, 'all') },
            ...C.filterStudios.map(k => ({ label: C.studios[k].label, color: C.studios[k].color, run: () => wherePlaces(cityId, k) }))
        ]);
    }

    async function wherePlaces(cityId, studio) {
        C.setStudio(studio);
        const city = C.cities.find(c => c.id === cityId);
        const where = cityId === 'worldwide' ? 'worldwide' : `in <em>${esc(city.name)}</em>`;
        const what = studio === 'all' ? 'Simon Allmer' : `Allmer ${esc(C.studios[studio].label)}`;
        const locs = C.locationsFor(cityId, studio);
        const evs = C.upcoming(C.eventsFor(cityId, studio));

        if (!locs.length && !evs.length) {
            await say(`Nothing of ${what} ${where} yet.`, 'I have set the overview to it all the same. Try another studio, or the world.');
            offer([{ label: 'Show worldwide', run: () => wherePlaces('worldwide', studio) }, menu]);
            return;
        }

        await say(`${locs.length ? `${locs.length} place${locs.length === 1 ? '' : 's'}` : 'No places'}${evs.length ? ` and ${evs.length} event${evs.length === 1 ? '' : 's'}` : ''} carry ${what} ${where}.`, 'The overview now shows them.');
        locs.slice(0, 4).forEach(l => {
            const el = card(`<p class="meta">${esc(l.city)}${l.flagship ? ' · Flagship' : ''}</p><h4>${esc(l.name)}</h4>
                <div class="links"><button data-k="loc:${l.id}">Show on map</button></div>`, l.studios.length > 1 ? '#c8a96a' : C.studios[l.studios[0]].color);
            el.querySelector('button').addEventListener('click', () => { C.showMap('loc:' + l.id); close(); });
        });
        evs.slice(0, 2).forEach(eventCard);
        offer([{ label: 'Open in Map', run: () => { C.showMap(); close(); } }, menu]);
    }

    function eventCard(e) {
        const el = card(`<p class="meta">${esc(e.dateLabel)}</p><h4>${esc(e.name)}</h4>
            <p>${e.venue !== e.city ? esc(e.venue) + ', ' : ''}${esc(e.city)}${e.unveiling && e.unveiling.length ? ` · Unveiling ${e.unveiling.map(esc).join(' and ')}` : ''}</p>
            <div class="links"><a href="${e.url}" target="_blank" rel="noopener">Official site</a><button>Show on map</button></div>`, '#c8a96a');
        el.querySelector('button').addEventListener('click', () => { C.showMap('ev:' + e.id); close(); });
    }

    async function whatsNext() {
        const n = C.nextEvent();
        if (!n) { await say('No event is announced yet.'); offer([menu]); return; }
        const days = Math.ceil((n.event.startDate - new Date()) / 864e5);
        await say(`<em>${esc(n.event.name)}</em>, ${days <= 0 ? 'now on' : days === 1 ? 'tomorrow' : `in ${days} days`}.`);
        eventCard(n.event);
        offer([menu]);
    }

    async function meditation() {
        const q = C.quote();
        await say(`“${esc(q.text)}”`, `— ${esc(q.author)}`);
        offer([menu]);
    }

    /* ============================================================
       Recommendations — the catalog Oracle's knowledge
       ============================================================ */
    const plain = html => html.replace(/<[^>]+>/g, '');

    async function ask(id) {
        const node = ORACLE.nodes[id];

        if (node.verdict) return verdict(node.verdict, node.color);

        if (node.question === 'players') return askPlayers({ mode: node.mode });
        if (node.question === 'topic') return askJournal({});

        await say(node.prompt, node.sub);

        if (node.choices) {
            offer([...node.choices.map(c => {
                const n = ORACLE.nodes[c];
                return { label: n.label, hint: n.hint, color: id === 'medium' ? n.color : null, run: () => ask(c) };
            }), menu]);
        } else if (node.options) {
            offer([...node.options.map(o => ({ label: o.label, hint: o.hint, run: () => verdict(o.verdict, node.color) })), menu]);
        }
    }

    async function verdict(v, color) {
        await say('The Oracle speaks.');
        card(`<h4>${esc(v.title)}</h4><p>${esc(v.body)}</p>${v.note ? `<p><em>${esc(v.note)}</em></p>` : ''}
            <div class="links">${v.links.map(([l, h]) => `<a href="${h}" target="_blank" rel="noopener">${esc(l)}</a>`).join('')}</div>`, color);
        offer([{ label: 'Ask again', run: () => ask('medium') }, menu]);
    }

    /* ---------- Games ---------- */
    async function askPlayers(q) {
        const node = ORACLE.nodes[q.mode];
        await say(node.prompt, node.sub);
        offer([...playerCounts(q.mode).map(n => ({
            label: n === 1 ? 'Alone' : `${n} players`,
            hint: `${gamesFor(n, q.mode).length} game${gamesFor(n, q.mode).length === 1 ? '' : 's'}`,
            run: () => narrowGames({ ...q, players: n })
        })), menu]);
    }

    async function narrowGames(q) {
        const x = nextQuestion(q);
        if (!x) return gameResult(q);
        await say(x.prompt, x.sub);
        offer([...x.options.map(o => ({
            label: o.label,
            hint: o.hint,
            run: () => narrowGames({ ...q, [x.key]: o.value })
        })), menu]);
    }

    // The same door rule as the catalog Oracle: Product, Arcade, Demo,
    // minus any door that opens a page another already opens.
    function doors(g) {
        const priority = inPrint(g) ? ['product', 'arcade', 'demo'] : ['arcade', 'demo', 'product'];
        const owner = new Map();
        priority.forEach(k => { const h = linkFor(g, k); if (!owner.has(h)) owner.set(h, k); });
        return DOORS.filter(k => owner.get(linkFor(g, k)) === k).map(k => [DOOR_LABEL[k], linkFor(g, k)]);
    }

    function seats(g, mode) {
        const c = countsFor(g, mode);
        if (c.length === 1) return c[0] === 1 ? 'Solo' : `${c[0]} players`;
        const contiguous = c.every((n, i) => i === 0 || n === c[i - 1] + 1);
        return contiguous ? `${c[0]}–${c[c.length - 1]} players` : `${c.join(' or ')} players`;
    }

    async function gameResult(q) {
        const found = matching(q);
        if (!found.length) {
            await say('No game answers all of that yet.', 'Ask again with a lighter hand.');
            offer([{ label: 'Ask again', run: () => ask('games') }, menu]);
            return;
        }
        const said = saidSoFar(q);
        await say(found.length === 1 ? 'The Oracle has chosen.' : `${found.length} games answer you.`,
            [q.mode === 'digital' ? 'Digital' : 'Physical', q.players === 1 ? 'Alone' : `${q.players} players`, ...said].join(' · '));

        found.slice(0, 6).forEach(g => {
            card(`<p class="meta">${esc(g.brand || 'Allmer Games')} · ${seats(g, q.mode)} · up to ${g.minutes} min</p>
                <h4>${esc(g.name)}</h4>
                <div class="links">${doors(g).map(([l, h]) => `<a href="${h}" target="_blank" rel="noopener">${l}</a>`).join('')}</div>`, GAMES_COLOR);
        });

        const opts = [];
        if (q.mode === 'physical') opts.push({ label: 'Where to play', hint: 'Games locations', color: GAMES_COLOR, run: () => whereFor('games') });
        opts.push({ label: 'Ask again', run: () => ask('games') }, menu);
        offer(opts);
    }

    /* ---------- Journals ---------- */
    async function askJournal(q) {
        const x = nextJournalQuestion(q);
        if (!x) return journalResult(q);
        await say(x.prompt, x.sub);
        offer([...x.options.map(o => ({ label: o.label, hint: o.hint, run: () => askJournal({ ...q, [x.key]: o.value }) })), menu]);
    }

    async function journalResult(q) {
        const found = journalsMatching(q);
        await say(found.length === 1 ? 'Your volume.' : 'Your volumes.');
        found.forEach(j => card(`<p class="meta">${esc(j.topic)} · ${j.year}</p><h4>${esc(j.name)}</h4>
            <div class="links"><a href="https://simonallmer.com/${j.slug}" target="_blank" rel="noopener">Open</a></div>`, JOURNALS_COLOR));
        offer([{ label: 'Where to read', hint: 'Journals locations', color: JOURNALS_COLOR, run: () => whereFor('journals') }, { label: 'Ask again', run: () => ask('journals') }, menu]);
    }

    // From a recommendation to a place: keep the visitor's city, set the studio.
    async function whereFor(studio) {
        const cityId = C.state.city;
        C.setStudio(studio);
        const locs = C.locationsFor(cityId, studio);
        if (!locs.length && cityId !== 'worldwide') {
            await say(`None in ${esc(C.cities.find(c => c.id === cityId).name)} yet. Here is the world.`);
            return wherePlaces('worldwide', studio);
        }
        return wherePlaces(cityId, studio);
    }

    /* ---------- Expose a gentle entry for other parts of the page ---------- */
    window.Oracle = { open, close };
})();
