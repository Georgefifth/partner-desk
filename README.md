# Partner Desk

A working comparison desk for small consumer-brand teams choosing artist or podcast partners. Bring a candidate list, commercial terms and a brand. Inspect the cultural evidence, identify blockers and download a decision brief.

## Start locally

Requires Node.js 22.9+ (tested with Node 26). No runtime packages or install step.

```sh
npm start
```

Open http://127.0.0.1:4318. The default example is fully synthetic: all scores and quotes are invented. Names of real organizations are used only to illustrate the workflow, not to imply rates or relationships.

## Live Qloo access

Set `QLOO_API_KEY` in the local `.env` file (or your shell). Use `.env.example` as the configuration reference. The file is gitignored and never served. Restart `npm start` after updating it.

```ini
QLOO_API_KEY=your_hackathon_key
QLOO_BASE_URL=https://hackathon.api.qloo.com
HOST=127.0.0.1
PORT=4318
```

Choose **Connect live evidence**, then **Find in Qloo** to confirm the brand and candidate identities. No result is automatically accepted just because its name looks similar. Unresolved candidates stay in the report with unknown cultural evidence. All fees and delivery-market claims come from the user. Qloo does not verify them.

Switching the supplied example into live mode clears its invented commercial terms. Enter your own quotes and delivery terms after switching. Only the hackathon and production Qloo origins are allowed. Production needs a separately entitled key. Calls are paced to fewer than four per second, retry 429 once, have a timeout, use a private 15-minute memory cache, and are capped at 1,000 outbound attempts per UTC day per server process. Restarting loses the cache and counters: this is a local prototype, not a distributed quota service.

## What works

- Editable brief and 1–12 supplied artist/podcast candidates.
- Paste a list of names with optional categories; invalid imports never partially overwrite the list.
- Brand and candidate identity search/confirmation in live mode.
- Review all unresolved identities in one place, with no automatic selections.
- Explicit whole-package, weekly, episode and CPM rate bases; placement-channel checks prevent reusing a website rate as a podcast quote.
- Three decision groups, with hard constraints before affinity.
- Unknown terms, missing Qloo records and partial failures stay visible.
- Evidence drawer with observation time, exact parameters and returned fields.
- Pin candidates, filter decisions and inspect a commercial-only view.
- Local Markdown export; pinned candidates only when pins are present.
- Explicitly saved browser drafts; no automatic persistence or analytics.
- Shared comparison/search tools over MCP stdio for an external agent.

This is a bounded, deterministic agent tool/workflow. It does not claim to run an autonomous LLM. An external agent can call it via MCP. The objective is brief context only; this MVP does not optimize for awareness versus conversion. Market checks compare supplied *delivery markets*, not measured audience geography. A budget is per partner, not a total allocation. No email is sent.

Choose **Try public research case** in the footer for a source-linked Field Notes planning exercise. Its budget and target market are assumptions, while the offer descriptions link to public publisher pages. It demonstrates why a website sponsorship rate cannot be treated as a podcast rate. It is not an actual brand campaign or a customer pilot. See `SCENARIO.md` for evidence and coverage limitations.

Before comparing a rate, confirm **Quote details**: whole package needs no quantity; per-week and per-episode rates need a unit count. CPM remains non-comparable without a delivery/package quote. Confirm what channel the offer covers. Legacy drafts with those fields missing require confirmation.

## MCP

```sh
npm run mcp
```

The process implements newline-delimited JSON-RPC over stdio with `initialize`, `ping`, `tools/list` and `tools/call`. Tools: `search_partner_entity`, `compare_campaign`. Clients must pass confirmed entity IDs in live campaigns; never infer consent to an identity from the search result alone. For a client configuration use `node`, args `['--env-file-if-exists=.env', '/absolute/path/to/mcp.mjs']`, with this project as its working directory. Do not place secrets in shared client configuration.

## Verification

```sh
npm test
```

Domain, adapter, HTTP and MCP checks cover money boundaries, provenance, missing data, identity validation, wrong upstream results, retries, request limits and security boundaries. No real API calls are made by these tests.

`scripts/browser-workflow-check.mjs` is an opt-in live browser check of paste import, rate normalization, explicit batch identity confirmation, the sourced placement mismatch and live export. It uses a few Qloo queries with the locally configured key. `scripts/coverage-check.mjs` probes a declared convenience sample; it does not estimate market coverage.

Optional browser verification requires Playwright and a Chromium browser:

```sh
CHROME_PATH=/usr/bin/google-chrome node scripts/browser-check.mjs
```

If Playwright is provided by an existing runtime rather than this project's dependencies, set `PLAYWRIGHT_MODULE` to its absolute package path. The browser script records screenshots under ignored `artifacts/` and checks examples, evidence, exports, edits, local drafts and a 390px layout.

## Architecture

`public/` is the native browser client. `server.mjs` serves a strict static allowlist and JSON endpoints. `lib/domain.mjs` owns validation, commercial checks, report creation and Markdown export. `lib/qloo.mjs` owns credentials, request construction, throttling and strict evidence extraction. `mcp.mjs` reuses those same services. No proprietary response data is committed or written to a public fixture.

The adapter recognizes numeric affinity in documented/commonly returned response fields and supports the live `types` array. Unsupported response shapes fail visibly. Real-key checks passed for brand lookup, artist and podcast scoring, and live browser export on 2026-10-18. These are narrow integration checks, not complete coverage or recommendation-quality validation. The downloaded official repository file named `openapi-schema.json` was a generic OpenAPI meta-schema; the implementation does not pretend it was an endpoint contract. See `VERIFICATION.md` for the tested scope.

## Before public release

The server binds to localhost by default. If exposing live evidence on a public interface, set `HOST=0.0.0.0` and a strong `ACCESS_TOKEN`; the server refuses to expose a configured Qloo key without it. Live users enter the shared token in tab memory. This protects a pilot, not a production multi-tenant account system. Use HTTPS, persistent quotas and per-user authentication for a wider launch. Reverse proxies must preserve Host/Origin consistently; forward all paths to this Node server.

No external hosting, public repository or deployment has been created. Competition release still needs broader data coverage checks, provider data-use terms, an appropriate hosting decision and an externally accessible demo. See `PRODUCT.md` for acceptance criteria and the customer validation experiment.

MIT licensed. Public research sources are in `RESEARCH.md`.

## GitHub Pages edition

`npm run build:pages` creates `_site/` from an explicit file allowlist. It does not load `.env`, copy the Qloo adapter or ship captured live responses. GitHub Pages is [static hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages); it cannot run our Node API or protect an API key.

The browser edition supports the illustrative example, your own commercial reviews, focused quote updates, explicit browser draft saves, pins and Markdown exports. It makes no Qloo calls. Cultural fit stays unresolved in commercial mode. Live Qloo requires `npm start` and a server-side key; switching to commercial checks never silently manufactures evidence. A public backend is not deployed by the Pages workflow.

The workflow `.github/workflows/pages.yml` tests the project, builds static output and deploys to Pages from `codex/product-review`. Enable GitHub Pages with GitHub Actions as the publishing source. Never upload `.env` or the ignored `artifacts/` folder.

The latest research and acceptance criteria are in [COMPETITIVE-REVIEW.md](COMPETITIVE-REVIEW.md).

## v0.4: finish a commercial review

In commercial mode, **Terms fit** means the supplied budget, placement, delivery market and format checks pass. **Confirm terms** means commercial information is missing; **Does not fit** means at least one supplied condition conflicts. Cultural suitability and availability remain unverified in all three groups. Live/demo cultural assessments retain their existing decisions.

Quote editing shows quantities only for episode/week rates and previews the calculated package cost before saving. CPM stays non-comparable. You can open the same editor from a candidate's details. Empty filtered views include a direct Show all candidates action.

The web Export brief action now formats the displayed report snapshot on your device, preserving its timestamp and cultural evidence without an additional query. Pins select export candidates; list filters do not. The commercial-only view toggle does not remove evidence from a live/demo export. The HTTP export endpoint remains available for API consumers and still recomputes the supplied campaign.

## Render server edition

[Deploy the reviewed Free service](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FGeorgefifth%2Fpartner-desk%2Ftree%2Fcodex%2Fproduct-review) using the root `render.yaml`. See [DEPLOYMENT.md](DEPLOYMENT.md) for private secret setup, cold starts, process-local quota limitations and public acceptance checks. Render's generated desk access token is different from your Qloo API key. The Pages edition remains available without either credential.

Public URLs: [Live-capable Render edition](https://partner-desk.onrender.com/) (desk token required for Qloo) and [GitHub Pages commercial edition](https://georgefifth.github.io/partner-desk/). Browser drafts belong to each origin and are not automatically shared between these sites.
