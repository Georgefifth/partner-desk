# Reviewer access decision

Prepared 2026-10-18. No access controls have been weakened, no credentials disclosed and no organizer contacted.

## Current state

Anyone can open the hosted application and use the illustrative or commercial workflows. Real Qloo calls require the shared desk token. The API key stays on Render. The shared token also allows spending the process-local Qloo request allowance, so it must not be published in a README, screenshot or public Devpost description.

The [overview](https://qloo.devpost.com/) requires an externally published usable application and excludes private-access submissions. The [rules](https://qloo.devpost.com/rules) explicitly discuss testing credentials. These statements should not be resolved by assuming that our current deployment qualifies.

## Recommended next action

The owner asks the organizer whether a public application with privately supplied judge credentials meets the current access requirement. If accepted, provide the desk token only through a confirmed non-public testing channel and ensure continued access through judging. The owner must authorize disclosure to that specific destination first. Do not insert the key or token into this source document.

Suggested message for owner review, not sent:

> Our submission is an externally hosted, public web app with a Qloo-powered workflow. The page, demonstration and commercial checks are public; live Qloo queries require a desk token to protect API quota. We can provide that token privately to judges, without sharing our Qloo API key. The overview excludes private-access demos, while the official rules allow testing credentials. Does this access arrangement qualify, and which non-public channel should we use for reviewer credentials?

If anonymous live interaction is required, prepare a separate constrained public review mode and obtain owner approval before enabling it. That would require persistent request accounting, a clear per-review allowance, abuse limits and evidence that reviewers can complete the core task. A hardcoded token in the frontend or disabling authentication is not an adequate solution. Do not treat an invented snapshot as a live Qloo demo.

No paid hosting is needed to request clarification or complete the current UI improvements. Free service sleep remains a disclosed usability limitation. Do not keep it awake with background pings.
