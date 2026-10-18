# Design direction

Palette: cloud #F3F6FB, paper #FFFFFF, ink blue #252B57, iris #475BE8, sea green #1C7468, amber #A05F14. Trebuchet MS for display, system sans for body; no external assets.

Layout: a narrow blue navigation rail, left-aligned campaign heading, collapsible campaign editor above a wide comparison table, and a focused evidence drawer. Desktop prioritizes a readable decision matrix; mobile converts rows to labeled blocks. The memorable device is an aligned cultural-signal column with restrained colored tracks, beside uncompromising commercial checks.

Plan review: removed a proposed marketing hero, decorative metric cards and an opaque overall match percentage. The working campaign is the opening view. Source labels convey actual provenance, while status colors encode the three decision states. Illustrative artist artwork would imply editorial authority, so use simple initials instead.

## Competitive review revision — 2026-10-18 (before implementation)

Keep the familiar comparison table and current visual identity. The main visual weakness is the oversized campaign introduction and inactive navigation taking space from decisions. Avoid adding decorative metric cards or an AI chat surface.

Palette: cloud #F3F6FB, paper #FFFFFF, ink #252B57, iris #475BE8, sea #1C7468, amber #956017. Failure uses the existing restrained red. Typography: Trebuchet MS for headings, system sans for body; tabular numbers for prices. Increase small actionable labels and touch targets.

Layout options considered:

```
A (chosen): compact brief → filterable comparison → row Update terms → focused dialog
B: navigation → full campaign editor → six repeated candidate forms → comparison
```

A preserves overview while moving one-partner corrections next to their evidence. Retain the full editor for campaign-wide changes; add a clearly separate blank-campaign entry. Keep the rail for now to avoid unrelated navigation changes, but reduce heading spacing. On mobile use the existing stacked comparison rows and a one-column terms dialog. No motion is needed.

Principles: distinguish evidence origins; make unknown information actionable; preserve uncommitted input on cancel; recompute with shared domain rules; never convert demo evidence into live evidence. Static hosting must expose a meaningful local commercial-check workflow, with zero Qloo network calls and explicit labels. Capture desktop/mobile views after implementation and critique once more.

Second-pass critique: the first row-action placement under the decision text increased row height and separated the correction from the quote. Moved Update terms into the price column. Mobile retains the same action beside the data being corrected; the dialog remains a single scrollable column. No animation or new dashboard was introduced.
