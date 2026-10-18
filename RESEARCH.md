# Public-source notes, 2026-10-18

- Competition and judging: https://qloo.devpost.com/ — usable externally hosted app, public source, open-source license, meaningful Qloo integration. Agentic tools qualify; an LLM framework is not itself required.
- Developer guide: https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide — hackathon base URL, X-Api-Key, key expiration, ignored unsupported parameters, uneven coverage.
- Official entity search documentation: https://github.com/qloo/docs-public/blob/main/reference/get-search.md
- Official Insights parameters: https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md — filter.results.entities limits scoring to supplied IDs; signal.interests.entities supplies the brand signal.
- Per-type parameters: https://github.com/qloo/docs-public/blob/main/reference/available-parameters-by-entity-type.md — artist and podcast support the selected filters. No unsupported geographic claim is inferred.
- Response example: https://github.com/qloo/docs-public/blob/main/reference/basic-insights-use-case.md — results.entities, entity_id, subtype and query measurements. Live response variations still require key-backed verification.
- Caveat: the official repository's openapi-schema.json downloaded on this date is a schema *for OpenAPI documents*, not a usable endpoint specification. Do not claim validation against it.
- Direct competitor: https://devpost.com/software/fanfit-skjrxf — brand/creator affinity, evidence cards, outreach drafts. Existing implementation is a reason to narrow the workflow, not proof of demand or a reason to invent novelty.
- Modash: https://www.modash.io/pricing — existing spend on discovery and management; does not establish willingness to pay for this product.
- SparkToro: https://sparktoro.com/pricing — existing audience research, including API/MCP support.
- Passionfroot: https://help.passionfroot.me/creators/growing-your-business/discover-sponsors — opted-in sponsor directory; do not claim that cultural affinity establishes an active sponsorship opportunity.

Live Qloo validation subsequently succeeded for an exact Patagonia brand identity, a Khruangbin artist identity and Outside Podcast. Search returned a `types` array rather than the example's `subtype`; the adapter and regression tests cover this actual shape. Both categories returned recognizable cultural affinity, and live provenance survived export. No customer interview, real commercial quote or actual campaign outcome has been verified. Demo quotes and affinity values are invented test data, not claims about the named organizations.

Follow-up public-source exercise: https://www.penaddict.com/sponsor describes a website package, not a podcast rate. https://atp.fm/sponsor describes podcast deliverables without a public rate on the reviewed page. This motivated explicit pricing-basis and placement-channel checks. A convenience probe of eight brands returned four exact single-name matches; three of four sampled podcasts matched exactly. This is not representative and aliases were not exhausted. See `SCENARIO.md` for the named sample, evidence boundaries and independently labeled planning assumptions.
