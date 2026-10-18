# Render deployment

## Choice

Use one Render **Free web service** to run the existing Node server and serve its frontend from the same origin. GitHub Pages remains the independent commercial-only edition. Vercel is not required for this architecture.

Official references checked 2026-10-18:
- https://render.com/docs/free
- https://render.com/docs/blueprint-spec
- https://render.com/docs/node-version
- https://render.com/docs/deploy-to-render

Render Free sleeps after 15 minutes without inbound traffic, takes about a minute to wake, and shares 750 instance hours per workspace/month. Local files are ephemeral and a persistent disk is unavailable on Free. Free Postgres expires after 30 days; Free Key Value loses state on restart. This blueprint does not create a database or a paid service. Check the workspace's existing usage and spending settings before deploying. We do not add a payment method or select paid compute.

## Deploy the reviewed configuration

The repository's `render.yaml` explicitly selects:

- Free Node web service, Node 22.
- Existing repository and `codex/product-review` branch.
- `npm test` as build command; `node server.mjs` as start command.
- `HOST=0.0.0.0`; Render supplies its own PORT.
- `/healthz` as an unauthenticated liveness check, with no Qloo call.
- `ACCESS_TOKEN` generated privately by Render.
- `QLOO_API_KEY` entered privately during setup, never committed.
- Hackathon Qloo origin and 100 outbound attempts per UTC day **per process**.
- Automatic redeployment disabled for the quick-deploy blueprint. Manually deploy the reviewed latest commit after future changes; enable automatic deployment only after deliberately reviewing that workflow.

Quick-deploy URL (public source, no key in the URL):

https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FGeorgefifth%2Fpartner-desk%2Ftree%2Fcodex%2Fproduct-review

1. Sign in to Render in your own account. If GitHub permissions or terms are requested, review and complete those steps yourself.
2. Inspect the selected workspace first. Reuse an existing Partner Desk service/blueprint if present; do not create duplicates. Check remaining Free hours/bandwidth and whether a payment method/spending limit is already configured.
3. Open the quick-deploy URL, confirm one Free web service and the expected branch. Do not upgrade compute or add unrelated resources.
4. Enter QLOO_API_KEY directly into Render's secret field. Do not copy the local .env to GitHub or paste credentials in chat. The blueprint does not transfer the local secret automatically.
5. Deploy, then use the actual onrender.com URL returned by Render. A name in render.yaml is not proof that a particular public hostname is available.
6. For live access, view ACCESS_TOKEN privately in the service's Environment panel and enter it in Partner Desk's unlock dialog. Do not share the API key with visitors. A failed token must keep the unlock form open and must not clear example commercial terms.

## Guardrails and honest limits

ACCESS_TOKEN restricts who can spend the Qloo credential. The application never sends that credential to the browser, logs request bodies or uses a key to probe liveness. Token validation via /api/access makes no upstream request. Numeric request budgets reject invalid configuration; 0 disables outbound requests for that process. A timeout/retry can count as an attempted request, so the configured limit is not a successful-query allowance.

The 100-attempt counter and 15-minute evidence cache are memory-only. Sleep, redeploy or restart clears them. No durable daily budget or account-level billing cap is implemented. This is a controlled pilot, not an anonymous public live API. A durable shared quota store and per-user access controls remain necessary before expanding public live access. Do not keep the Free instance awake with scheduled pings.

Behind Render's reverse proxy, the current request limiter can group users under a proxy IP. It is a conservative process-local safety layer, not an accurate per-user quota. We do not trust arbitrary forwarded-for headers to manufacture identities.

## Acceptance after deployment

- HTTPS page loads and /healthz returns 200 with status/version only.
- /api/config says liveAvailable and tokenRequired are true; it contains no secrets.
- Unauthenticated /api/search, live analysis and live API export return 401 without spending Qloo calls.
- Incorrect desk token stays in the unlock dialog with a recoverable error.
- Correct desk token unlocks; brand and candidate IDs still require explicit human confirmation.
- A narrow real Qloo search/compare preserves upstream provenance. Commercial mismatches still override cultural affinity; failure never becomes demo data.
- Snapshot export matches displayed evidence and timestamp.
- Mobile editing remains usable. Capture only synthetic/demo screens for publication; review live Qloo data-use terms before sharing live evidence captures.
- Revisit after idle: account for Render's documented platform wake-up screen. Do not claim this cold-start time is application response latency.

Do not call Render live until the actual hosted URL and real-key workflow have passed these checks.
