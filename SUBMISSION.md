# Partner Desk — submission draft

Status: prepared for owner review; not submitted. Checked 2026-10-18.

## Requirements and remaining gates

Sources: [overview](https://qloo.devpost.com/), [official rules](https://qloo.devpost.com/rules).

- Deadline: October 30, 2026, 11:45 pm EDT; October 31, 2026, 11:45 am Asia/Kuala_Lumpur.
- Required: working externally hosted application, public licensed source, English description and testing instructions. A video is optional.
- Project must use Qloo as an agentic tool, through a framework, or within an existing agent. Partner Desk offers two MCP tools; the web workflow is deterministic, not an autonomous LLM agent.
- Access wording differs: overview excludes private-access demos; rules allow testing credentials. Obtain organizer clarification or a compliant review-access arrangement before submitting. Current shared-token access is not declared compliant.
- Keep reviewer access working through the judging period ending November 16, 2026, 11:45 pm Eastern Time. Check the latest rules before final submission.

Owner-only decisions still needed: eligibility/ownership declarations, participant/team profile, final text approval and authorized reviewer access. Never publish the existing desk token or API key in GitHub or this document. Submitting accepts binding rules; the owner must perform or expressly confirm that final step. No organizer message has been sent.

## Project name and tagline

**Partner Desk**

Compare cultural partners with Qloo evidence and commercial conditions you can inspect.

## Inspiration

A small brand team may already have names for a campaign but still need to compare incompatible offers, incomplete delivery terms and cultural fit. A high taste-affinity value does not make a website sponsorship applicable to a podcast, or make an over-budget quote affordable. Partner Desk keeps those questions separate and produces an editable research handoff.

This is a focused workflow hypothesis supported by product and public-source research, not a claim of validated demand or measured savings. See COMPETITIVE-REVIEW.md and SCENARIO.md.

## What it does

Start a brief with a brand, target market, partnership format and per-partner budget. Paste a shortlist of artists or podcasts. In live mode, search Qloo and explicitly confirm identities before using evidence. The application requests brand-to-candidate cultural affinity and compares artists only with artists, podcasts only with podcasts.

Supply commercial terms independently: rate, billing basis, unit count, placement, delivery markets and format. A rate of $200 per episode for three episodes is a $600 package. A website offer cannot become a podcast quote. Missing values stay unknown. A commercial conflict cannot be overruled by cultural affinity.

Open each partner to inspect provenance and follow-up questions. Pin the partners to include and export the displayed Markdown brief without another evidence query. Browser drafts are saved only on request. No outreach, purchase, automatic commitment or revenue forecast is made.

## Why Qloo matters

Qloo supplies the cross-domain cultural relationship between a brand and each confirmed artist or podcast. Without it, Partner Desk can check supplied commercial conditions but cannot assess cultural affinity. Commercial-only mode makes that boundary visible; invented demonstration values never replace failed live queries.

The product combines a human-reviewed interface with the MCP tools `search_partner_entity` and `compare_campaign`. An external agent can find identities, request user confirmation and run the same constrained assessment. The application does not claim an integrated LLM, autonomous negotiation or agent-client interoperability beyond the tested MCP protocol flow.

## How we built it

Node.js ES modules serve an allowlisted browser application and Qloo adapter. A shared domain service drives HTTP and stdio MCP. Native HTML dialogs and a responsive comparison table support brief editing, identity review and focused quote corrections. The backend protects the API key, bounds requests, caches evidence and retains request provenance and observation timestamps. No runtime package dependencies, remote fonts or analytics are required.

Repository: https://github.com/Georgefifth/partner-desk/tree/codex/product-review

Hosted application: https://partner-desk.onrender.com/

Static commercial edition: https://georgefifth.github.io/partner-desk/

## Challenges and limits

Identity search can return similar names and incomplete coverage; selection remains explicit. Unknown commercial terms must not look like zero prices or verified availability. Artist and podcast affinities must not imply a common ranking scale.

Render Free can sleep, and its process-memory cache and quota counter reset on restart. The shared desk token is a pilot control, not multi-user authentication or a durable billing cap. A reviewer access arrangement remains a release gate. The initial page cannot display application progress while the hosting platform itself is waking.

## What is verified

Actual hosted Qloo identity search and comparison passed for Patagonia, Khruangbin and Outside Podcast on October 18. Commercial values in that check were left unknown. Automated tests cover decision rules, quote applicability, exports, authentication, limits, transport failures and static hosting. Detailed results are in VERIFICATION.md. Export UI feedback is observed; the downloaded file was not independently read back in the hosted browser session.

## Testing instructions draft

1. Open the Render application. Allow the free service to wake if necessary.
2. Inspect the clearly labeled illustrative example without credentials. Open a partner and update a supplied example quote to see commercial constraints change independently of its illustrative cultural value.
3. Choose Start your comparison for an empty brief. Add a brand, budget, market and candidate names. Commercial checks work without Qloo access.
4. For live testing, use the reviewer access method approved before submission. Do not request or paste a Qloo API key in the browser. Live access currently requires the desk token; this draft intentionally contains no credential.
5. Select Live Qloo, review identities, explicitly select correct results and compare. Inspect cultural evidence separately from missing commercial information.
6. Pin a partner and export the brief. Check origin labels, pricing units and unresolved questions.

Do not submit these testing instructions with step 4 unresolved. The Pages edition is useful for commercial checks, but is not a substitute for a usable Qloo-powered demo.
