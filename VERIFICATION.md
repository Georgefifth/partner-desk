# Verification record

Date: 2026-10-18. This record concerns the new isolated Partner Desk project only. No prior local projects were inspected or reused.

## Automated checks

31 tests passed with `npm test` (Node 26.7.0): domain decisions, amount boundaries, unknown evidence, synthetic provenance, explicit identities, duplicate IDs, exclusions, partial errors, typed upstream responses, request pacing/retries/budget, safe links, server origin/token boundaries, report export and stdio MCP.

The observed `types` array from actual Qloo entity search is covered by a dedicated regression test. Test fixtures contain no copied proprietary Qloo responses.

## Browser checks

Installed Google Chrome via Playwright, 1440px desktop and 390px mobile:
- Example loads all six candidates, with a visible invented-data label.
- Candidate detail opens, displays provenance and expands evidence.
- Pinning restricts exported Markdown and the filename marks demo exports.
- Editing the budget disables stale export; recomputation changes decisions without changing synthetic cultural signals.
- Commercial-only view hides cultural values; drafts save explicitly and restore for recomputation.
- Desktop and mobile document widths do not exceed the viewport, including the editor.
- No uncaught JavaScript errors or failed application resources in the demo flow.

Visual review corrected native progress appearance and a narrow mobile handoff panel. Screenshots are local, ignored files in `artifacts/`; live screenshots must not be published without reviewing Qloo data-use terms.

## Live API and browser checks

The user configured a key locally. The key was never printed, embedded in frontend code, stored in a report or committed.

`scripts/live-check.mjs` passed:
- Exact single matches for Patagonia (brand), Khruangbin (artist), Outside Podcast.
- Both artist and podcast queries returned usable numeric affinity and live origin.
- Missing podcast commercial terms stayed unknown.
- Export preserved live provenance and included no synthetic cultural evidence.

`scripts/browser-live-check.mjs` passed the human-facing flow: switch mode, clear invented example terms, search, explicitly choose identities, enter test commercial terms, compare, inspect the evidence and download live Markdown. Commercial inputs in these checks were deliberately synthetic; they do not establish real rates, availability or partnerships.

## Not yet established

- Faster or better actual marketing decisions, willingness to pay, retention, partnership conversion or ROI.
- Broad regional/long-tail entity coverage; only the selected examples were live-checked.
- Production entitlement and economics after hackathon key expiry.
- External hosting/public repository, multi-user authorization, durable quota enforcement or Docker image execution.

These are release/validation tasks, not claims of completed work.

## v0.2 follow-up

41 automated checks passed after adding pricing-basis/channel validation, per-unit cost calculation, atomic name import and tied-score reporting. Missing quote applicability in legacy drafts is deliberately treated as unknown.

The original demo and original live artist/podcast browser checks passed again. The new live workflow check also passed: it rejected a duplicate import without partially adding names, calculated a three-episode package instead of comparing a unit rate, used a single batch review with no identities selected automatically, then evaluated the source-linked Field Notes planning case and exported its assumptions. Mobile editing remained within the viewport.

The public case correctly rejected the applicability of a website offer to a podcast placement, retained unknown ATP pricing, and preserved source links and pricing units in the export. See `SCENARIO.md` for the primary-source facts and declared coverage sample. This is not a real customer pilot, conversion measurement or proof of demand.

## v0.3 competitive review and Pages delivery — 2026-10-18

- `npm test`: 43 passing checks, including commercial mode making no Qloo calls, no synthetic evidence reuse, static/server row parity, restricted bundle inventory, relative project-site assets, static export selection and rejection of live requests on Pages.
- Real-key `scripts/live-check.mjs` rerun passed: brand, artist and podcast identities resolved, both categories returned Qloo-origin evidence, no warnings. Commercial test inputs remain synthetic.
- In-app browser, local server: filled The National's missing demo fee with 4,000; budget passed and decision changed, with the original illustrative affinity unchanged. Focus returned to the updated row.
- In-app browser, static build: created a blank Field Notes planning brief (not a commissioned campaign), pasted two names, checked all missing terms/evidence remained unknown. Entered 200 per episode × 3 with budget 500: package cost 600 and budget failed. Cancelled a change to 50: displayed package cost stayed 600. Explicit Save draft showed confirmation.
- Public URL `https://georgefifth.github.io/partner-desk/` opened successfully after Actions deployment. Actual hosted app loaded the browser edition, six demonstration candidates and clear static/live boundary. Changed a sample fee, observed a new decision without a changed cultural value, pinned that candidate, triggered export and observed pinned-brief download feedback. The browser automation download-event waiter timed out; the downloaded file was not independently read back in this session. Export content/selection are covered by the static integration test, not by that UI toast alone.
- Public mobile check at 390 × 844: DOM page width did not exceed viewport; terms dialog was one column, readable and scrollable. Initial public browser logs contained no errors or warnings. This is one browser environment, not a full accessibility/device audit.
- Publishing preflight inspected only this independent repository: configured key and recognized credential patterns absent from 40 publishable source files; .env, live screenshots and build output excluded. Qloo adapter is source code in the repository but excluded from the static bundle. Only the allowlisted public domain modules/fixtures ship to Pages.
- No prospective-customer task study was run. No measured time-saving, conversion lift, market demand, guaranteed opportunity or competitor latency superiority is claimed. Detailed priorities and a proposed five-user validation are in COMPETITIVE-REVIEW.md.

Final deployment inspection found browser module caching retaining the earlier row-action position after a successful deployment. The static build now adds a deterministic content version to entry assets and the complete relative module graph. The static integration check verifies versioned entry and dynamic imports. All 43 checks pass after this fix. No custom caching server or service worker was added.

## v0.4 refinement — 2026-10-18

Acceptance: commercial completion must be independent of cultural evidence; unknown/mismatched terms must stay unresolved/blocked; exports must preserve the displayed report without querying again; unit inputs and cost preview must reflect rate basis.

- 45 tests pass, including separate commercial assessment and live snapshot export retaining evidence, timestamp, selected partner and the original report without an additional adapter call.
- Local static browser: whole-package quote hides quantity; episode rate 200 × 3 previews 600 before saving; CPM hides quantity and explains why a package quote/estimate is needed. Cancelling kept the original episode terms.
- Public-source case tested locally with explicitly synthetic ATP commercial inputs: all four supplied checks passed, list and details showed Terms fit while culture remained Not assessed. The website-only Pen Addict offer remained a mismatch. No Qloo identity was needed in commercial mode.
- Empty Confirm terms filter had zero candidates; Show all candidates restored the two-row comparison. Candidate detail opened the focused editor directly.
- At 390 × 844 the document width did not exceed 390, the modal was scrollable and Save/Cancel remained visible. Screenshot critique moved the cost preview above the fields so it is visible while editing a mobile rate, rather than buried after notes.
- Web export is now a client-side snapshot formatter. API export keeps its previous recomputation contract. A commercial-only display toggle on live/demo data does not strip evidence from exports; its notice says so.
- No new claims about user time savings or buying intent. No public live backend was added.

Server edition browser loaded v0.4 and all six demo candidates with the new public modules. The real-key smoke check also passed again for the Patagonia brand, Khruangbin artist and Outside Podcast, with Qloo-origin evidence in both categories and no warnings. These remain narrow integration checks using synthetic commercial inputs.

## Render deployment preparation — v0.4.1

Added a Free-only render.yaml, non-Qloo /healthz liveness endpoint, explicit per-process QLOO_DAILY_LIMIT validation, graceful SIGTERM shutdown and a /api/access check so a wrong desk token does not switch modes or clear the example. All 47 tests pass, including repeated health probes spending no Qloo calls, rejected invalid budgets and token checks with no upstream calls. Render login and GitHub permissions are completed by the account owner. No local credential is copied to the hosting provider automatically. A successful CI run is not proof of a live Render service; the hosted URL must still be checked.

## Hosted Render acceptance — 2026-10-18

- Render reported the Free Node service Live at https://partner-desk.onrender.com/ for a7689de. Health returned 200/version 0.4.1; configuration reported live availability and required authentication without secrets. Unauthenticated access, search, live analysis and live API export returned 401; /.env and /lib/qloo.mjs returned 404.
- With explicit owner authorization, the generated desk token was used only in the hosted application's unlock form. It was not saved to source, artifacts or logs. The Qloo API key was not revealed.
- Actual hosted UI: unlocked live mode, retained only Outside Podcast and Khruangbin, searched all three names including Patagonia, and explicitly selected the correct brand, podcast and artist identities. No identity was selected by default. The compare returned Qloo affinity in both categories, with no displayed warning. Artist evidence inspection showed qloo-live origin, confirmed identity, request provenance and observedAt 2026-10-18T08:10:53.243Z.
- Missing commercial inputs stayed unknown after leaving demo mode. Both candidates remained Needs information despite cultural evidence; no demo rates were carried forward. Export showed Full comparison brief downloaded. The file was not independently read back; snapshot contents and no-query behavior are covered by automated tests.
- These are narrow integration and interface checks, not proof of market demand, comprehensive Qloo coverage, response-time superiority or suitability of either partnership. Render Free cold starts and restart-reset process quotas remain documented limitations.
