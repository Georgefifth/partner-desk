# Product brief

## User and job
A marketer at a small consumer brand or agency has 3–12 possible artist/podcast partners. They need a defensible shortlist for a campaign discussion. They currently move among search, a spreadsheet and a presentation.

## Hypothesis
Combining Qloo affinity with explicit commercial constraints in an editable comparison desk will reduce shortlist preparation time. Existing tools (FanFit, Modash, SparkToro) already address discovery; our focus is evaluating a supplied list. This is a positioning hypothesis, not a proven advantage.

## Core flow
1. Enter brand, campaign objective, target market, per-partner budget and partner format.
2. Add or paste candidates. Enter quoted rate, quote basis, placement channel, quantity where relevant, delivery markets, offered format, exclusion, notes and optional source URL. All rates use the campaign currency. Blank values are unknown; zero is valid.
3. Choose demo or live evidence. In live mode search individually or review all unresolved names together. Explicitly select the brand and each candidate identity; none is silently accepted. Missing candidates remain unresolved.
4. Run a bounded comparison: score confirmed candidates in separate artist/podcast requests; reject unrequested IDs; evaluate commercial constraints; produce evidence and next questions.
5. Review candidate detail, pin partners and export a Markdown decision brief. Edit inputs and rerun; stale reports cannot be exported.

## Decision policy
Known commercial mismatch => does not fit. Missing material terms or missing cultural evidence => needs information. Complete matching terms plus valid Qloo affinity => worth a conversation, not a recommendation to buy. Within each decision group and entity type, affinity orders candidates; artist and podcast scores are never compared. No arbitrary weighted total, ROI or price-efficiency claim.

Market is a user-entered campaign delivery constraint, not a Qloo audience location claim. Budget is per partner/package, not a total media plan. Per-episode and weekly rates are multiplied by an explicit quantity using cents arithmetic. CPM rates are not directly compared to package budgets. Quote placement must match the candidate's artist/podcast channel. Old drafts without quote applicability remain unknown until confirmed. "Does not fit" refers to the supplied terms, not a permanent rejection of the partner. Objective provides context in the brief; the current engine does not optimize for objectives such as conversion versus awareness.

## MVP acceptance
- Fresh checkout starts with Node and no package installation; example is usable without credentials.
- Changing budget or terms changes constraint outcomes without changing cultural scores.
- A website rate never becomes a podcast quote; missing rate basis, unit counts and CPM package costs remain unknown.
- Batch identity review never auto-confirms fuzzy or exact search results. Name imports reject duplicates atomically.
- Every shown cultural result has origin, entity ID, request parameters and returned evidence. Missing scores are not converted to zero.
- Demo and live cannot be confused, including exports and errors.
- User confirms entity mapping; no fuzzy name silently becomes a different person.
- API failure is visible; partial successful categories remain inspectable.
- Reports export locally, without contacting or emailing anyone.
- Responsive at 390px and 1440px, functional with keyboard, no horizontal document overflow.
- Live API checks passed for the documented examples. External hosting and broad coverage validation remain release gates.

## Validation experiment
Recruit 5–8 marketers who have an actual upcoming partnership task. Compare their normal process with the desk using different, comparable candidate lists. Measure time to a reviewed shortlist, source corrections and willingness to reuse for the next campaign. Aim for at least 25% lower median preparation time without more factual corrections. Record discarded results too. Do not use Qloo's own ranking as the sole measure of superiority.

## Exclusions
No creator marketplace, web scraping, private audience analytics, automatic outreach, budget prediction, contracting or unsupported long-tail creator inference.
