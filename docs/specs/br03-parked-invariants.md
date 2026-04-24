# BR03 Parked Invariants (P4B-CX-BR03-05A)

This note records the BR03 stopping point after `BR03-01` through `BR03-04` so the lane can pause without ambiguity.

It is a park-state clarification pass, not a doctrine expansion.

## Parked status

- BR03 is stable enough to pause at the current first-wave touchpoint/control implementation.
- No new registry breadth, forum-path breadth, or authenticated execution behavior is included here.
- Prep remains separate from official action, and handoff remains separate from execution.

## Locked implemented scope

Current BR03 behavior is locked to:

- touchpoint resolver and registry shell in `src/modules/touchpoints/index.ts`
- app/shell source-event snapshot producer seam in `src/app/br03TouchpointSnapshotProducer.ts`
- downstream output threading in `src/modules/output/index.ts`
- downstream handoff threading in `src/modules/handoff/index.ts`
- trust/review-state bindings in `src/modules/output/trustBindings.ts`
- precedence and downstream-alignment tests in:
  - `tests/br03-touchpoint-control.test.ts`
  - `tests/br03-touchpoint-matrix.test.ts`

Current first-wave touchpoint IDs:

- `vic-arrears-public-rule`
- `vic-arrears-public-form-warning`
- `vic-arrears-authenticated-handoff`
- `vic-arrears-freshness-watch`

Current supported forum-path coverage:

- `VIC_VCAT_RENT_ARREARS`

## Supported touchpoint/control posture

Supported consequence families are explicit and remain separate:

- `MIRROR`
- `MIRROR_WITH_WARNING`
- `DEFER_TO_LIVE_OFFICIAL_FLOW`
- `STALE`
- `LIVE_CONFIRMATION_REQUIRED`
- `WRONG_CHANNEL_REROUTE`
- `AUTHENTICATED_HANDOFF_ONLY`

Current downstream posture remains:

- mirror and mirror-with-warning support preparation posture only
- defer/authenticated posture remains handoff-only
- stale remains cautionary and non-authoritative
- live confirmation required remains slowdown/review
- wrong-channel remains stop + explain + reroute referral posture

## Locked precedence invariants

These invariants are locked at this parking point:

- wrong-channel reroute suppresses ordinary mirror allowances and keeps reroute/referral posture explicit downstream
- authenticated-handoff-only suppresses ordinary mirror allowances and keeps authenticated surfaces in defer/handoff-only posture
- stale and live-confirmation-required remain distinct consequence families and may coexist under mixed-touchpoint inputs
- stale does not collapse into live-confirmation-required or generic warning-only handling
- source-event snapshot production remains explicit and auditable; missing source events retain registry-default posture with non-parity caveat
- resolver outputs are the shared source for prep-pack, handoff guidance, renderer state, review-state keys, and carry-forward controls
- wrong-channel reroute suppresses prep-pack copy-ready fallback and forces referral-stop posture

## Guarded boundaries preserved

The following remain intentionally guarded while BR03 is parked:

- live-confirmation-required triggers are registry/source-snapshot-driven; cadence and authority are not promoted to deterministic doctrine
- wrong-channel detection remains explicit control input, not automated portal-state interpretation
- authenticated official surfaces remain metadata plus handoff controls only; no product-side authenticated execution is introduced
- touchpoint posture snapshots remain keyed by touchpoint ID; no broader per-instance policy engine is introduced

## Explicit broaden/reactivation triggers

Reactivate BR03 when any of these occur:

1. New touchpoint IDs must be added to the registry shell.
2. New forum paths require touchpoint control coverage.
3. New authenticated or live official surfaces need represented consequences.
4. New freshness-sensitive touchpoint classes require separate control behavior.
5. Per-instance override needs exceed current touchpoint-ID keyed posture.

Expected reactivation scope when triggered:

- extend registry/control definitions deliberately
- extend precedence tests before consumer changes
- keep prep/handoff separation and anti-overclaim boundaries intact

## While parked, do not broaden by stealth

- do not add portal execution behavior
- do not imply filing, submission, or official acceptance
- do not merge stale and live-confirmation-required into one generic caution mode
- do not weaken wrong-channel reroute into ordinary handoff
