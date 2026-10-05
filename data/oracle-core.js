/* ============================================================
   THE ORACLE — knowledge (catalog, questions, narrowing rules)
   Extracted verbatim from ../Simon Allmer Catalog/Oracle/oracle.js
   (everything above the "Engine" section). The Center's chat
   (oracle-chat.js) drives these; the well UI is not used here.
   Re-extract when the catalog Oracle changes.
   ============================================================ */

// Studio hues — worn by every floor below their branch.
const COMICS_COLOR = '#ef4444';
const FILMS_COLOR = '#3b82f6';
const MUSIC_COLOR = '#fbbf24';
const GAMES_COLOR = '#10b981';
const JOURNALS_COLOR = '#b8763a';

const ORACLE = {
    start: 'medium',
    nodes: {
        // ---- Entry: the functional branch ----
        medium: {
            label: 'Medium',
            color: '#c8a96a',
            eyebrow: 'The Oracle',
            prompt: 'Through which <em>medium</em> shall the Oracle speak?',
            sub: 'Five studios. Choose the one whose craft you desire.',
            choices: ['comics', 'films', 'music', 'games', 'journals'],
        },

        // ---- The five studios ----
        comics: {
            label: 'Comics',
            color: COMICS_COLOR,
            hint: 'Ink, panel, and page',
            eyebrow: 'By Genre',
            prompt: 'Which <em>genre</em> calls you?',
            sub: 'Two worlds are being drawn.',
            options: [
                {
                    label: 'Fantasy',
                    hint: 'The Art of Futory',
                    verdict: {
                        title: 'The Art of Futory',
                        body: 'A universe drawn before it is told.',
                        note: 'Ready yourself — Futory: Dragon Kingdom arrives next year.',
                        links: [['The Art of Futory', 'https://simonallmer.com/artoffutory']],
                    },
                },
                {
                    label: 'Historical Drama',
                    hint: 'American Portrait',
                    verdict: {
                        title: 'American Portrait',
                        body: 'A life told whole, in ink — the good and the bad, unflinching.',
                        note: 'In production. Patience: what is drawn slowly is drawn to last.',
                        links: [['American Portrait', 'https://simonallmer.com/americanportrait']],
                    },
                },
            ],
        },
        films: {
            label: 'Films',
            color: FILMS_COLOR,
            hint: 'Light in the dark',
            verdict: {
                title: 'American Portrait',
                body: 'Simon is at work on it now. The page holds an early look.',
                note: 'Patience is its own devotion. What is made slowly is made to last.',
                links: [['Early look', 'https://simonallmer.com/americanportrait']],
            },
        },
        music: {
            label: 'Music',
            color: MUSIC_COLOR,
            hint: 'Sound and score',
            eyebrow: 'By Ear',
            prompt: 'What do you wish to <em>hear</em>?',
            sub: 'Every recording lives on one page. The Oracle will name what to seek there.',
            options: [
                {
                    label: 'Pop',
                    hint: 'Simon',
                    verdict: {
                        title: 'Simon',
                        body: 'Pop, under his own name.',
                        note: 'Seek that name on the Audio page.',
                        links: [['Audio', 'https://simonallmer.com/audio']],
                    },
                },
                {
                    label: 'Soul',
                    hint: 'Soul Town',
                    verdict: {
                        title: 'Soul Town',
                        body: 'Soul, and the town it comes from.',
                        note: 'Seek that name on the Audio page.',
                        links: [['Audio', 'https://simonallmer.com/audio']],
                    },
                },
                {
                    label: 'Score',
                    hint: 'American Portrait',
                    verdict: {
                        title: 'American Portrait',
                        body: 'The score written for the American epic.',
                        note: 'Seek that name on the Audio page.',
                        links: [['Audio', 'https://simonallmer.com/audio']],
                    },
                },
            ],
        },
        games: {
            label: 'Games',
            color: GAMES_COLOR,
            hint: 'Play made design',
            eyebrow: 'By Form',
            prompt: 'Shall the play be <em>digital</em> or <em>physical</em>?',
            sub: 'Screen or table — the form decides which games can gather.',
            choices: ['digital', 'physical'],
        },

        // ---- The two forms of play ----
        // Each leads to its own player question, because the two forms
        // offer different table sizes (see playerCounts).
        digital: {
            label: 'Digital',
            color: GAMES_COLOR,
            hint: 'Screen, arcade, machine',
            mode: 'digital',
            eyebrow: 'By Players',
            prompt: 'How many <em>players</em> gather?',
            sub: 'Machines fill the empty seats — every game plays from one.',
            question: 'players',
        },
        physical: {
            label: 'Physical',
            color: GAMES_COLOR,
            hint: 'Cards, board, table',
            mode: 'physical',
            eyebrow: 'By Players',
            prompt: 'How many <em>players</em> gather?',
            sub: 'Every seat is a person — the Oracle will name the games for your table.',
            question: 'players',
        },
        journals: {
            label: 'Journals',
            color: JOURNALS_COLOR,
            hint: 'The written record',
            eyebrow: 'By Interest',
            prompt: 'What draws your <em>interest</em>?',
            sub: 'Choose the subject and the Oracle will hand you the volume.',
            question: 'topic',
        },
    },
};

// ============================================================
//  The Games — drawn from the catalog.
//  counts   = the table-sizes the game is designed for.
//             (Seven Wonders is exactly 2 OR 4 — never 3 — hence a set.)
//  physical = the sizes you can actually sit down and play in print.
//             An empty set means there is no physical edition yet, so
//             the title never appears on the physical floor and carries
//             no Product link.
//  types    = which players the game serves. Bartle's four, plus the
//             Solver — Bartle wrote for shared worlds, where the only
//             things to act on are the world and other people, so the
//             one who sits alone against a problem had no seat.
//  fate     = how much chance decides: none | some | much. A title can
//             hold two — American Playing Cards is many games in one
//             deck, Elements can be played hard or played light.
//  minutes  = the ceiling of its band: 5, 15 or 30. Nothing runs past
//             thirty, so you can always switch it up or play again.
//  Digitally every game plays from 1 up to its largest table, since
//  machines take the empty seats — see countsFor().
//  Slugs build the three links: /slug, /slugarcade, /slugdemo.
//  A title whose pages don't follow that pattern names its own in
//  `links` — both Futory sets share one product page and one pair
//  of Futory Cards doors.
//  TBA titles (Trinity, Capital, Equilibrium, Silk Road) are omitted
//  until made.
// ============================================================
// ------------------------------------------------------------
//  Shared pages — a temporary state, not the destination.
//  Every product is meant to have a page of its own; until then
//  some titles borrow a brand's. Where two doors on one row would
//  open the same page, doorsFor() shows it once, so the collapse
//  is visible as a missing button.
//
//  Still to be made, in Simon's order:
//    · Casino Camino — Fortuna and Ricochet share /camino as both
//      product and demo, so neither has a Demo door.
//    · Beat Race — no product page apart from /beatrace, so it
//      shows no Product door. (Crosslink is done: it has its own
//      three pages, and its override came down.)
//  Shared across titles rather than within a row, also unfinished:
//    · Futory Cards Unity and Duality share /futory and both
//      Futory Cards doors.
//    · Believe Objects rides entirely on the Believe pages.
//    · All fourteen Wonders share /sevenwondersarcade.
// ------------------------------------------------------------
const FUTORY_CARDS = {
    product: 'futory',
    arcade: 'futorycardsarcade',
    demo: 'futorycardsdemo',
};

// Fortuna and Ricochet are played on the road itself — one Camino page
// serves as both product and demo.
const CASINO_CAMINO = {
    product: 'camino',
    arcade: 'casinocaminoarcade',
    demo: 'camino',
};

// All fourteen Wonders share one arcade. Product and demo stay their
// own — /pyramid, /pyramiddemo — so only the arcade is named here.
const SEVEN_WONDERS = {
    arcade: 'sevenwondersarcade',
};

// Believe Objects lives behind the Believe pages.
const BELIEVE = {
    product: 'believe',
    arcade: 'believearcade',
    demo: 'believedemo',
};

const GAMES = [
    // Seven Wonders — designed for 2 or 4 players, no chance at all.
    // Only Pyramid and Statue are in print so far; the rest are screen-only.
    sw('Pyramid', 'pyramid', [2, 4]),
    sw('Gardens', 'gardens'),
    sw('Temple', 'temple'),
    sw('Statue', 'statue', [2]),
    sw('Mausoleum', 'mausoleum'),
    sw('Colossus', 'colossus'),
    sw('Pharos', 'pharos'),
    sw('Colosseum', 'colosseum'),
    sw('Great Wall', 'greatwall'),
    sw('Library', 'library'),
    sw('Tower', 'tower'),
    sw('Cathedral', 'cathedral'),
    sw('Palace', 'palace'),
    sw('Skyscraper', 'skyscraper'),

    // Futory — 2-4 (2-6 when several titles are combined).
    // Both sets live behind the one Futory page and the one pair of
    // Futory Cards doors.
    game('Futory Cards Unity', 'futorycardsunity', 'Futory',
        { min: 2, max: 4, types: 'achiever explorer', fate: 'some', minutes: 30, links: FUTORY_CARDS }),
    game('Futory Cards Duality', 'futorycardsduality', 'Futory',
        { min: 2, max: 4, types: 'achiever explorer', fate: 'some', minutes: 30, links: FUTORY_CARDS }),

    // Casino Camino — the road, the gamble
    // Many games in one deck — some of them lean on chance harder than others.
    game('American Playing Cards', 'americanplayingcards', 'Casino Camino',
        { min: 2, max: 6, types: 'socializer killer', fate: 'some much', minutes: 15 }),
    game('Fortuna', 'fortuna', 'Casino Camino',
        { min: 2, max: 8, types: 'socializer achiever', fate: 'much', minutes: 15, links: CASINO_CAMINO }),
    game('Ricochet', 'ricochet', 'Casino Camino',
        { min: 2, max: 8, types: 'killer socializer', fate: 'much', minutes: 15, links: CASINO_CAMINO }),

    // Believe — the story told on the spot. Purely social; the random
    // draw is the only place chance enters.
    game('Believe', 'believe', 'Believe',
        { min: 2, max: 8, types: 'socializer', fate: 'some', minutes: 15 }),
    game('Believe Objects', 'believeobjects', 'Believe',
        { min: 2, max: 8, types: 'socializer achiever', fate: 'some', minutes: 15, links: BELIEVE }),

    // Detective Noname — solo, screen only. One chapter ≈ 30 minutes.
    // The riddle itself is read at /noname; the brand page is its own.
    digitalOnly('Detective Noname and the Silent Circle', 'noname', 'Detective Noname',
        { min: 1, max: 1, types: 'solver explorer', fate: 'none', minutes: 30,
          links: { product: 'detectivenoname', arcade: 'detectivenonamearcade', demo: 'noname' } }),

    // Screen-born solo games — no physical edition
    digitalOnly('Beat Race', 'beatrace', '',
        { min: 1, max: 1, types: 'achiever', fate: 'none', minutes: 5,
          links: { product: 'beatrace', arcade: 'beatracearcade', demo: 'beatrace' } }),
    // No story to enter — only the problem.
    digitalOnly('Crosslink', 'crosslink', '',
        { min: 1, max: 1, types: 'solver', fate: 'none', minutes: 5 }),

    // Elements — learned in two minutes. You race to shed cards rather
    // than to beat anyone, and it stays light enough to talk over.
    // Playable strategically, though most won't — hence both fates.
    game('Elements', 'elements', 'Elements',
        { min: 2, max: 6, types: 'socializer achiever', fate: 'some much', minutes: 15 }),

    // Nectar (brand to be confirmed) — everything but an explorer's game
    game('Nectar', 'nectar', '',
        { min: 2, max: 6, types: 'achiever socializer killer', fate: 'some', minutes: 15 }),
];

const MAX_PLAYERS = 8;

function range(min, max) {
    const out = [];
    for (let i = min; i <= max; i++) out.push(i);
    return out;
}

// Every Seven Wonders title shares its nature: pure strategy, no chance,
// a full half-hour. `physical` is the only thing that differs — which of
// the 2/4 tables you can buy in a box (none by default).
function sw(name, slug, physical = []) {
    return game(name, slug, 'Seven Wonders',
        { counts: [2, 4], physical, types: 'achiever killer', fate: 'none', minutes: 30, links: SEVEN_WONDERS });
}

function game(name, slug, brand, o) {
    const counts = o.counts || range(o.min, o.max);
    return {
        name, slug, brand, counts,
        physical: o.physical || counts,   // in print at every size, unless told otherwise
        types: o.types.split(' '),
        fate: o.fate.split(' '),
        minutes: o.minutes,
        links: o.links || null,           // null = derive the three doors from the slug
    };
}

// A title that exists only on a screen — it never reaches the table.
function digitalOnly(name, slug, brand, o) {
    return game(name, slug, brand, { ...o, physical: [] });
}

// The three doors. Most titles derive them from the slug; a title that
// names its own in `links` wins.
//
// A door is only worth showing if it goes somewhere new: every title
// offers its product page, in print or not, and any door repeating a
// page already offered on the row is dropped. So Detective Noname shows
// all three (brand page, arcade, the riddle itself), while Beat Race —
// whose product page is its demo — shows two.
function linkFor(g, kind) {
    const derived = { product: g.slug, arcade: g.slug + 'arcade', demo: g.slug + 'demo' };
    return `https://simonallmer.com/${(g.links && g.links[kind]) || derived[kind]}`;
}

// Product, Arcade, Demo — minus any door that leads where another
// already goes.
//
// When one page answers to two names, the truer name keeps it: what
// you can buy is a Product first, but a screen-only title is somewhere
// you play, so its shared page shows as the Arcade.
const DOORS = ['product', 'arcade', 'demo'];
const DOOR_LABEL = { product: 'Product', arcade: 'Arcade', demo: 'Demo' };

function doorsFor(g) {
    const priority = inPrint(g)
        ? ['product', 'arcade', 'demo']
        : ['arcade', 'demo', 'product'];

    const owner = new Map();   // href -> the kind that gets to name it
    priority.forEach(kind => {
        const href = linkFor(g, kind);
        if (!owner.has(href)) owner.set(href, kind);
    });

    return DOORS
        .filter(kind => owner.get(linkFor(g, kind)) === kind)
        .map(kind => extLink(DOOR_LABEL[kind], linkFor(g, kind)))
        .join('');
}

function inPrint(g) {
    return g.physical.length > 0;
}

// Digitally you can just turn on computers: any number of people from
// one up to the largest table the game was designed for.
function countsFor(g, mode) {
    return mode === 'digital' ? range(1, Math.max(...g.counts)) : g.physical;
}

function gamesFor(n, mode) {
    return GAMES.filter(g => countsFor(g, mode).includes(n));
}

// Only offer a number the catalog can actually answer. Every solo title
// is digital-only, so 1 simply doesn't appear on the physical floor.
function playerCounts(mode) {
    return range(1, MAX_PLAYERS).filter(n => gamesFor(n, mode).length > 0);
}

// ============================================================
//  The Journals — the catalog's J-numbers, in their own order.
//  topic = the shelf it stands on. scope narrows a crowded shelf
//  (two Chronicles, one of the world and one of America), so the
//  Oracle can always come down to a single volume.
// ============================================================
const JOURNALS = [
    journal('Simon Allmer World', 'world', 'Simon Allmer', 'Photography', 2020),
    journal('Society Review', 'societyreview', 'Society Review', 'Current Affairs', 2021),
    journal('Chronicle: Years of Change', 'chronicle', 'Chronicle', 'History', 2023, 'World'),
    // ACRONYM (Conspiracy, 2025) is held back until it is polished.
    // Restore this line and the topic returns on its own.
    // journal('ACRONYM', 'acronym', 'Detective Noname', 'Conspiracy', 2025),
    journal('Cosmographia', 'cosmographia', 'Cosmographia', 'Lexicon', 2026),
    journal('American Chronicle', 'americanchronicle', 'Chronicle', 'History', 2026, 'American'),
    journal('Enterpriser', 'enterpriser', 'Enterpriser', 'Business', 2026),
];

// The order the shelves stand in when the Oracle asks for an interest.
// A topic missing here falls in after these, in publication order.
const SHELVES = ['Photography', 'Business', 'Current Affairs', 'History', 'Conspiracy', 'Lexicon'];

function shelfOrder(topics) {
    const rank = t => (SHELVES.includes(t) ? SHELVES.indexOf(t) : SHELVES.length);
    return topics.map((t, i) => [t, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(([t]) => t);
}

function journal(name, slug, brand, topic, year, scope = '') {
    return { name, slug, brand, topic, year, scope };
}

function journalsMatching(q) {
    return JOURNALS.filter(j =>
        (!q.topic || j.topic === q.topic) &&
        (!q.scope || j.scope === q.scope)
    );
}

// In publication order, so the shelf reads as a history.
function distinct(values) {
    const out = [];
    values.forEach(v => { if (v && !out.includes(v)) out.push(v); });
    return out;
}

// The same rule the games branch follows: ask only while the volumes
// still standing disagree, and stop the moment one is left.
function nextJournalQuestion(q) {
    const rest = journalsMatching(q);
    if (rest.length <= 1) return null;

    if (!q.topic) {
        return {
            key: 'topic',
            eyebrow: 'By Interest',
            prompt: 'What draws your <em>interest</em>?',
            sub: 'Choose the subject and the Oracle will hand you the volume.',
            options: shelfOrder(distinct(rest.map(j => j.topic))).map(t => option(t, journalsMatching({ topic: t }))),
        };
    }

    const scopes = distinct(rest.map(j => j.scope));
    if (!q.scope && scopes.length > 1) {
        return {
            key: 'scope',
            eyebrow: 'By Scope',
            prompt: `Which <em>${q.topic.toLowerCase()}</em> do you seek?`,
            sub: 'The shelf holds more than one. Narrow it.',
            options: scopes.map(sc => option(sc, rest.filter(j => j.scope === sc))),
        };
    }
    return null;
}

// A valve names what stands behind it: the volume itself when one
// does, the count when several do.
function option(value, held) {
    return {
        value,
        label: value,
        hint: held.length === 1 ? held[0].name : `${held.length} volumes`,
    };
}

// ============================================================
//  The questions of appetite — asked after the table is set.
//
//  Order matters: the most telling question comes first, so a lone
//  survivor is named at once instead of surviving three more floors.
//  Bartle's four players discriminate hardest, then fate, then the hour.
// ============================================================
// What resists you names you: a person (Achiever, Killer), a world
// (Explorer), or a problem (Solver).
const ARCHETYPES = [
    { value: 'achiever', label: 'Achiever', hint: 'Points, status, the win recorded' },
    { value: 'explorer', label: 'Explorer', hint: 'A world to enter, and its deep lore' },
    { value: 'solver', label: 'Solver', hint: 'Riddles, deduction, the answer earned' },
    { value: 'socializer', label: 'Socializer', hint: 'Talk, alliance, the table itself' },
    { value: 'killer', label: 'Killer', hint: 'Competition, dominance, the other beaten' },
];

// `said` is how an answer is echoed back on the result floor, where the
// bare label ("None") would read wrong.
const FATES = [
    { value: 'none', label: 'None', hint: 'Every outcome earned', said: 'No fate' },
    { value: 'some', label: 'Some', hint: 'Chance deals, skill decides', said: 'Some fate' },
    { value: 'much', label: 'Much', hint: 'Surrender to the draw', said: 'Much fate' },
];

const SPANS = [
    { value: 5, label: '0–5 min', hint: 'A round between two things' },
    { value: 15, label: '5–15 min', hint: 'A sitting' },
    { value: 30, label: '15–30 min', hint: 'A chapter, a full game' },
];

const QUESTIONS = [
    {
        key: 'type',
        options: ARCHETYPES,
        color: GAMES_COLOR,
        eyebrow: 'By Nature',
        prompt: 'Which <em>player</em> are you?',
        sub: 'Choose the nature that is yours — the Oracle offers only those a game here can answer.',
        test: (g, v) => g.types.includes(v),
    },
    {
        key: 'fate',
        options: FATES,
        color: GAMES_COLOR,
        eyebrow: 'By Fate',
        prompt: 'How much <em>fate</em> shall you encounter?',
        sub: 'The Oracle asks how much it may decide on your behalf.',
        test: (g, v) => g.fate.includes(v),
    },
    {
        key: 'span',
        options: SPANS,
        color: GAMES_COLOR,
        eyebrow: 'By The Hour',
        prompt: 'How long shall it <em>last</em>?',
        sub: 'Nothing here runs past thirty minutes — switch it up, or play again.',
        test: (g, v) => g.minutes === v,
    },
];

// Everything still standing under the answers given so far.
function matching(q) {
    return gamesFor(q.players, q.mode).filter(g =>
        QUESTIONS.every(x => q[x.key] === undefined || x.test(g, q[x.key]))
    );
}

// A question earns its floor only when the survivors disagree about it.
// One game left, one live answer, or an answer that changes nothing —
// and the Oracle skips straight ahead rather than asking for form's sake.
function nextQuestion(q) {
    const rest = matching(q);
    if (rest.length <= 1) return null;

    for (const x of QUESTIONS) {
        if (q[x.key] !== undefined) continue;
        const live = x.options.filter(o => rest.some(g => x.test(g, o.value)));
        const splits = live.some(o => rest.filter(g => x.test(g, o.value)).length < rest.length);
        if (live.length > 1 && splits) return { ...x, options: live };
    }
    return null;
}

// The answers given, in the Oracle's own words.
function saidSoFar(q) {
    return QUESTIONS
        .filter(x => q[x.key] !== undefined)
        .map(x => {
            const option = x.options.find(o => o.value === q[x.key]);
            return option.said || option.label;
        });
}
