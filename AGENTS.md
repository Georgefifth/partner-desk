# Partner Desk

## Goal
Help small consumer-brand teams compare an existing shortlist of artists and podcasts for one campaign. Reduce research and handoff time; do not predict revenue or partnership acceptance.

## Workspace boundary
This is a new, isolated project. Do not inspect or reuse sibling projects or personal files. Research inputs must be public. All code, UI, docs and tests are in English. No delegated agents unless the user explicitly requests them.

## Architecture
Node.js 22+ ES modules, native HTTP server, static HTML/CSS/JavaScript, no runtime dependencies. A shared domain service drives the web API and a stdio MCP tool. The Qloo adapter is server-only and accepts documented, allowlisted parameters. Human-confirmed entity IDs are required in live mode. Commercial constraints are evaluated deterministically, separately from Qloo ranking.

## Constraints
- Never invent Qloo IDs, scores, audience shares, quotes, source material or live evidence.
- Demo data is synthetic and must be labeled in UI, evidence and exports. Live failures must never silently fall back to demo.
- Never expose API keys, log request bodies, fetch arbitrary URLs, send outreach or purchase services.
- No public deployment, publishing or new accounts without user authorization. Public hosting still needs a live-data check, quota policy and hosting choice.
- No aggregate magic score: hard constraints precede cultural affinity. Unknown data remains unknown. No score comparisons across entity types.
- Use source-linked, editable user facts for commercial terms. A website link is not verification.
- Always retain pricing units and channel applicability. A website rate is not a podcast quote; CPM is not a package cost. Never fill unknown quantities or placement channels from an entity's cultural category.
- Batch lookup may suggest identities but never auto-confirm them. Exact-name matching in probes is not a general coverage guarantee.

## Quality
Keyboard-accessible controls, mobile layout, explicit errors, disabled stale exports and visibly separated evidence origins. No remote fonts or tracking. Browser storage is opt-in (no automatic storage of commercial briefs).

## Verification
Run `npm test`. Cover budget boundaries, unknown data, exclusions, response-shape variation, incorrect IDs/types, ambiguity, timeouts, rate limits, request limits, origin checks, exports and MCP operation. Perform browser checks on desktop and mobile. A mocked adapter test does not confirm the real Qloo integration. Keep that limitation explicit.

## Repository and network checks
This project now has its own Git repository. Before any Git status, stage or publish command, confirm `git rev-parse --show-toplevel` equals this project directory; never inherit the unrelated home repository. An initial network-sandbox failure from `gh auth status` is not proof that credentials expired: retry with authorized network access before asking the user to log in.

The public Pages build uses an explicit file allowlist. Never publish `.env`, `artifacts/`, live Qloo screenshots or raw upstream responses. Static commercial mode cannot claim live Qloo evidence. Run tests against both browser and server modes when changing domain rules.
