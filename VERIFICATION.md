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
