# Lane 2 First-Wave Copy Baseline

## Status
Closed for authoring. Implementation fidelity only.

## Purpose
This document freezes the first-wave copy and semantic control baseline for Lane 2 so build can proceed without semantic drift, duplicate drafting, or silent implication changes.

## Controlling source
Use **LB L2 FIRST WAVE MARKETING HANDOFF PACK v0.3** as the first-wave build copy baseline.

## What is frozen for build
The following are locked for first-wave implementation unless an explicit reopen trigger fires.

### Protected lines
- `Prepare your Notice to Vacate`
- `Landlord Buddy helps you prepare and check this step. It does not file for you or decide the legal path.`
- `Checked against current public guidance on [date]. Live official steps may differ.`
- `Continue in the official system`
- `Prepared for handoff` and its associated anti-finality clarifier family on consequential surfaces

### Locked semantic controls
- state meanings
- CTA hierarchy
- trust-cue binding
- warning-family consequences
- stale vs live-confirmation-required distinction
- scoped-hold posture where surfaced in first-wave copy

## Build restrictions
Do not silently change:
- state labels
- CTA text
- boundary lines
- trust cues
- warning lines

Any such change is a semantic change, not microcopy polish, and must return for review.

## State distinction rules
Implementation must preserve:
- `Needs review` is not `Guarded`
- `Stale` is not `Live confirmation required`
- `Prepared for handoff` is not filed, accepted, or complete
- `Referral-first` is not ordinary handoff with stronger wording
- `On hold` is not a whole-account freeze

## Trust-cue-bound state rule
These should not appear on consequential first-wave surfaces without their required trust cue unless there is a documented reason it is still safe:
- `Prepared for handoff` or `Ready for handoff`
- `External review recommended`
- `Referral-first`
- `On hold` on consequential surfaces
- usually `Guarded` as well

## CTA hierarchy rules
Preserve:
- stale -> `Check the official step`
- live confirmation required -> `Confirm in official system`
- wrong-channel -> stop + explain + reroute
- referral-first -> help or review, not ordinary handoff

## Reopen triggers
Lane 2 reopens only if:
1. A new first-wave or near-term screen cannot be cleanly extended from the current surface-inventory pattern library.
2. A protected line needs to change.
3. A state label, CTA tier, boundary line, trust cue, or warning consequence is proposed to change.
4. Build implementation forces a trust-cue-bound state to appear without its required cue.
5. Product wants to merge or blur stale/live confirmation, needs review/guarded, or referral-first/ordinary handoff.
6. Marketing or Build wants to strengthen claims around legal certainty, filing/submission, official equivalence, or privacy/security precision.

## Build instruction
Apply the frozen first-wave copy baseline during implementation.
Escalate specific screens or lines when a real semantic conflict appears.
Do not reopen the whole lane for ordinary copy polish.

## Related docs
- `docs/governance/P4B Freeze Map.md`
- `docs/qa/first-wave-semantic-fidelity-checklist.md`
- `docs/decisions/ADR-L2-first-wave-copy-baseline.md`
- `docs/architecture/frozen-lanes-status.md`
