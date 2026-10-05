// Simon Allmer Center — where to find the studios' work.
// Source: Google My Maps "Simon Allmer Center"
// https://www.google.com/maps/d/viewer?mid=1EiWPIgRgWuntC8zYVbdM7ENzzWMHeKA
//
// studios: which studio products a venue carries — drives the pin colours.
// url: the venue's own website (null until confirmed; the card then links to Maps only).

window.STUDIOS = {
    comics:   { label: 'Comics',   color: '#ef4444' },
    films:    { label: 'Films',    color: '#3b82f6' },
    music:    { label: 'Music',    color: '#fbbf24' },
    games:    { label: 'Games',    color: '#10b981' },
    journals: { label: 'Journals', color: '#b8763a' },
    // Tag only (appears on events) — not one of the five studio filters
    snacks:   { label: 'Snacks',   color: '#f472b6', tagOnly: true }
};

// The city guide. Only these appear in the City box; venues and events
// elsewhere (Padua, Milan, ...) are listed under Worldwide.
window.CITIES = [
    { id: 'worldwide', name: 'Worldwide' },
    { id: 'vienna', name: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738 },
    { id: 'london', name: 'London', country: 'United Kingdom', lat: 51.5072, lng: -0.1276 }
];

window.LOCATIONS = [
    {
        id: 'allmer',
        name: 'Allmer',
        city: 'Vienna',
        country: 'Austria',
        lat: 48.1876635, lng: 16.3704386,
        studios: ['comics', 'films', 'music', 'games', 'journals'],
        note: 'The house of Simon Allmer. Every studio, under one roof.',
        url: 'https://simonallmer.com',
        flagship: true
    },
    {
        id: 'akira',
        name: 'Akira Cosplay Lounge',
        city: 'Vienna',
        country: 'Austria',
        lat: 48.2063052, lng: 16.352625,
        studios: ['games'],
        url: null
    },
    {
        id: 'spielebox',
        name: 'WIENXTRA-Spielebox',
        city: 'Vienna',
        country: 'Austria',
        lat: 48.211842, lng: 16.343781,
        studios: ['games'],
        url: null
    },
    {
        id: 'jojoe',
        name: 'JO&JOE Wien',
        city: 'Vienna',
        country: 'Austria',
        lat: 48.1959786, lng: 16.3378265,
        studios: ['games'],
        url: null
    },
    {
        id: 'badmoon',
        name: 'Bad Moon Cafe',
        city: 'London',
        country: 'United Kingdom',
        lat: 51.4966182, lng: -0.0883144,
        studios: ['games'],
        url: null
    },
    {
        id: 'houseofgames',
        name: 'House of Games Store',
        city: 'Padua',
        country: 'Italy',
        lat: 45.4076338, lng: 11.887412,
        studios: ['games'],
        url: null
    }
];
