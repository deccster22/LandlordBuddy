# BR01 Parked Invariants (P4B-CX-BR01-05A)

This note records the BR01 stopping point after `BR01-01` through `BR01-04` so the lane can pause without ambiguity.

It is a park-state clarification pass, not a doctrine expansion.

## Parked status

- BR01 is stable enough to pause at the current first-pass routing and downstream-control implementation.
- No new mixed-claim registry breadth, doctrine settlement, or workflow-state renaming is introduced here.
- Preparation remains separate from official action, and handoff remains separate from execution.

## Locked implemented scope

Current BR01 behavior is locked to:

- scenario registry and resolver in:
  - `src/modules/br01/registry.ts`
  - `src/modules/br01/resolver.ts`
- workflow insertion-point mapping in:
  - `src/workflow/arrearsHeroWorkflow.ts`
- persisted artifact assembly in:
  - `src/modules/br01/persistence.ts`
- persisted-artifact and request-time downstream hydration in:
  - `src/modules/br01/downstream.ts`
  - `src/modules/output/index.ts`
  - `src/modules/handoff/index.ts`
- coverage tests in:
  - `tests/br01-routing.test.ts`
  - `tests/br01-downstream.test.ts`

## Supported scenario families

Current BR01 scenario families include:

- objective capture required (`OBJECTIVE_CAPTURE_REQUIRED`)
- arrears-only deterministic route (`ARREARS_ONLY`)
- arrears + repairs slowdown/review (`ARREARS_PLUS_REPAIRS`)
- arrears + split-matter combinations:
  - `ARREARS_PLUS_COMPENSATION`
  - `ARREARS_PLUS_DAMAGE`
  - `ARREARS_PLUS_BOND_ISSUES`
  - `ARREARS_PLUS_QUIET_ENJOYMENT`
- arrears + family-violence-sensitive referral (`ARREARS_PLUS_FAMILY_VIOLENCE_SENSITIVE`)
- guarded mixed-objective fallback (`ARREARS_MIXED_OBJECTIVES_GUARDED`)
- route-out scenarios:
  - `ARREARS_OBJECTIVE_MISSING_ROUTE_OUT`
  - `INTERSTATE_OR_NON_VICTORIA_ROUTE_OUT`

## Deterministic vs guarded posture

Current deterministic posture:

- arrears-only (`ARREARS_ONLY`) is the narrow deterministic continue path.

Current guarded/external posture:

- mixed-claim combinations remain slowdown/review, split-matter, referral, or route-out as defined by current registry rows.
- unresolved mixed combinations remain explicit guarded slowdown via `ARREARS_MIXED_OBJECTIVES_GUARDED`.
- interstate/non-supported jurisdiction posture remains explicit route-out and external-facing.

This posture does not imply legal advice, filing, submission, official acceptance, or portal parity.

## Workflow consequence families (locked)

BR01 workflow insertion families remain explicit and separate:

- deterministic continue
- guarded review
- split-matter required
- referral stop
- route-out stop

Current insertion-point codes:

- `BR01_DETERMINISTIC_CONTINUE`
- `BR01_GUARDED_REVIEW`
- `BR01_SPLIT_MATTER_REQUIRED`
- `BR01_REFERRAL_STOP`
- `BR01_ROUTE_OUT_STOP`

Current route-out workflow consequence remains:

- route-out maps to `STOPPED_PENDING_EXTERNAL_INPUT` (not flattened into ordinary referral progression).

## Persisted-artifact posture (locked)

Current persisted BR01 artifact assembly:

- `RoutingDecision` is assembled from BR01 routing output.
- `ReferralFlag` is assembled for BR01 referral/route-out outcomes with:
  - `BR01_REFERRAL_REQUIRED`
  - `BR01_ROUTE_OUT_REQUIRED`

Current persisted-artifact downstream preference:

- downstream consumers prefer stored BR01 artifacts when available:
  - `RoutingDecision`
  - relevant active BR01 `ReferralFlag`
- request-time BR01 routing input is explicit fallback only when stored artifacts are absent.

Current narrow reason propagation posture:

- referral reason codes are consumed at the downstream selection seam only.
- stored reason parsing currently relies on rationale reason suffix extraction where explicit reason fields are not yet present.

## Downstream consumer posture (locked)

Current output/handoff downstream posture from BR01 remains:

- deterministic stored or request-time arrears-only posture does not inject extra BR01 caution controls
- split-matter posture remains review-led (`SLOWDOWN` control family)
- referral posture remains referral-stop (`REFERRAL` control family)
- route-out posture remains distinct from referral via BR01 route-out reason/control propagation while still using refer-out stop posture in downstream readiness/trust structures

Existing frozen trust and boundary surfaces remain intact:

- referral-stop and review keys are structural controls, not copy rewrites
- no portal execution behavior is introduced
- no official execution behavior is introduced

## Guarded boundaries preserved while parked

The following remain intentionally guarded:

- mixed combinations not covered by current registry rows
- unresolved threshold/statutory-exception doctrine
- broader persisted-artifact consumption beyond current output/handoff seams
- explicit reason-field schema for stored BR01 artifacts (current seam uses rationale parsing)
- dedicated route-out workflow-state naming beyond current stop-state handling

## Explicit broaden/reactivation triggers

Reactivate or broaden BR01 when any of these occur:

1. New mixed-claim combinations need coverage that is not representable by current registry rows.
2. Product wants persisted-artifact consumption beyond current output/handoff downstream seams.
3. Stored-artifact reason extraction needs explicit reason fields instead of rationale parsing.
4. Product wants dedicated route-out workflow-state naming beyond current stop-state mapping.
5. Doctrine settles for currently guarded thresholds/statutory exceptions.
6. A mixed scenario cannot be expressed cleanly in the current registry/resolver model and would otherwise be forced.

Expected reactivation scope when triggered:

- extend registry/resolver and persisted-artifact handling deliberately
- extend workflow/downstream distinction tests before broad consumer changes
- keep prep/handoff separation, anti-overclaim, and no-portal-execution boundaries intact

## While parked, do not broaden by stealth

- do not add portal execution behavior
- do not imply filing, submission, or official acceptance
- do not flatten split/review/referral/route-out into generic mixed-claim caution
- do not redesign resolver doctrine under the guise of maintenance
- do not rewrite protected Lane 2 copy
