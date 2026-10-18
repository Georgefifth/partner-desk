export const example = {
  title: 'Outside, together', brand: 'Patagonia', objective: 'Introduce a new everyday outdoor collection through a credible cultural partnership.',
  market: 'United States', format: 'Sponsored content', currency: 'USD', budget: 5000,
  candidates: [
    { id: 'bon-iver', name: 'Bon Iver', type: 'artist', fee: 8500, markets: ['United States'], format: 'Sponsored content', notes: 'Explore a music-led campaign.', source: '', excluded: false },
    { id: 'outside', name: 'Outside Podcast', type: 'podcast', fee: 3200, markets: ['United States'], format: 'Sponsored content', notes: 'Ask about package deliverables and audience geography.', source: '', excluded: false },
    { id: 'khruangbin', name: 'Khruangbin', type: 'artist', fee: 4500, markets: ['United States'], format: 'Sponsored content', notes: 'Consider a listening-session concept.', source: '', excluded: false },
    { id: 'national', name: 'The National', type: 'artist', fee: null, markets: ['United States'], format: 'Sponsored content', notes: 'Rate card has not been received.', source: '', excluded: false },
    { id: 'daily', name: 'The Daily', type: 'podcast', fee: 2800, markets: ['United Kingdom'], format: 'Sponsored content', notes: 'The example package covers a different market.', source: '', excluded: false },
    { id: 'trail-notes', name: 'Trail Notes', type: 'podcast', fee: 1500, markets: [], format: '', notes: 'Fictional unlisted candidate to demonstrate missing evidence.', source: '', excluded: false }
  ].map(candidate => ({ ...candidate, quoteBasis:'package', quoteUnits:null, quoteChannel:candidate.type }))
};

// Entirely invented fixtures. Not Qloo data or real commercial quotes.
export const demoAffinity = { 'bon-iver': 0.91, outside: 0.84, khruangbin: 0.78, national: 0.69, daily: 0.42 };
