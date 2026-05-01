# P4B-CX-APP-ROUTE-09 Launcher/Current-Matter Handling-Action Contract Pack

Date: 2026-05-01
Task ID: P4B-CX-APP-ROUTE-09
Phase posture: 4B primary, 4C parallel (bounded)
Gate posture: Review A checkpoint-cleared only; BR04 cleared with gate only

This is a contract/documentation artifact only.
It does not implement handling actions, runtime behavior, tests, UI wording, status labels, CTA behavior, or rendered screen routing.

## 1. Contract Intent and Boundary

- Freeze a narrow handling-action contract for consuming launcher/current-matter internal execution directives from `APP-ROUTE-08`.
- Keep handling actions internal orchestration instructions only.
- Preserve separate inspectability:
  - lifecycle-derived transition state
  - non-lifecycle transition state
- Preserve non-certifying posture:
  - no legal sufficiency claim
  - no compliance clearance claim
  - no storage-provider readiness claim
  - no privacy-engine completion claim
  - no alpha-readiness or Review C implication

## 2. Handling-Action Input Contract

Handling-action consumers may consume these internal inputs only.

### 2.1 Directive input contract

- directive kind:
  - `DIRECTIVE_CONTINUE_WITH_LIFECYCLE_CONTEXT`
  - `DIRECTIVE_CONTINUE_NO_RECORD_NON_CLEARANCE`
  - `DIRECTIVE_HOLD_CANNOT_SAFELY_RESUME`
  - `DIRECTIVE_EXPLICIT_NO_ROUTING_SIGNAL`
- directive booleans/invariants:
  - `clearanceInferred: false`
  - `continueWithLifecycleContext`
  - `continueWithoutLifecycleRecordNonClearance`
  - `failSafeHoldDirective`
  - `explicitNoLifecycleRoutingSignalDirective`
  - `proceedWithInternalExecution`

### 2.2 Lifecycle-derived transition state (must remain separately inspectable)

- transition target/handling mode (`TRANSITION_*`, `MODE_*`)
- lifecycle route visibility:
  - `DELETION_REQUEST`
  - `DEIDENTIFICATION_ACTION`
  - `NONE`
- protected indicators:
  - `holdAwareLifecycleStatePresent`
  - `releaseControlledLifecycleStatePresent`
  - `deletionRequestPresent`
  - `deidentificationActionPresent`
- lifecycle lineage metadata:
  - orchestration decision
  - coordinator decision
  - execution control outcome
  - execution routing outcome

### 2.3 Non-lifecycle transition state (must remain separately inspectable)

- posture:
  - `NON_LIFECYCLE_CONTINUE_ALLOWED`
  - `NON_LIFECYCLE_HOLD_REQUESTED`
- preserved state:
  - `progressionHoldRequested`
  - `unresolvedBlockerCodes`
  - optional `transitionHintCode`
  - `nonLifecycleHoldRequested`

### 2.4 Protected state inputs that must not be collapsed

- no-record non-clearance (`NO_RECORD_NON_CLEARANCE_CONTROL` lineage)
- malformed/cannot-resume (`CANNOT_SAFELY_RESUME_CONTROL` lineage)
- no-signal (`NO_LIFECYCLE_ROUTING_SIGNAL` lineage)
- hold-aware/release-controlled visibility
- deletion vs de-identification route distinction
- lifecycle/non-lifecycle slice separation

## 3. Allowed Internal Handling-Action Outcomes

Future handling-action implementation must resolve to one of these internal outcomes:

1. `ACTION_CONTINUE_INTERNAL_WITH_LIFECYCLE_CONTEXT`
   - continue internal orchestration with lifecycle context preserved
2. `ACTION_CONTINUE_INTERNAL_NO_RECORD_NON_CLEARANCE`
   - continue internal orchestration without lifecycle record and without clearance inference
3. `ACTION_HOLD_INTERNAL_CANNOT_SAFELY_RESUME`
   - explicit fail-safe hold because lifecycle record cannot safely resume
4. `ACTION_EXPLICIT_INTERNAL_NO_ROUTING_SIGNAL`
   - explicit no-signal handling path; no default-success fallback

Allowed overlay metadata on continuation actions:

- hold-aware overlay (`holdAwareLifecycleStatePresent: true`)
- release-controlled overlay (`releaseControlledLifecycleStatePresent: true`)
- deletion route overlay (`lifecycleRoute: "DELETION_REQUEST"`)
- de-identification route overlay (`lifecycleRoute: "DEIDENTIFICATION_ACTION"`)

These are internal handling actions only, not user-visible states.

## 4. Forbidden Handling-Action Interpretations

Handling-action consumers must not interpret internal actions as:

- success/clearance
- compliance cleared
- legally sufficient
- officially accepted/filed/submitted/lodged
- ready for filing
- user-facing status label
- CTA tier/state/priority
- rendered screen route
- public-facing route name
- completion of BR04/privacy/storage readiness

## 5. Handling-Action State Table

| Directive input | Allowed handling action | Protected metadata to preserve | Forbidden interpretation | Later test expectation |
| --- | --- | --- | --- | --- |
| `DIRECTIVE_CONTINUE_WITH_LIFECYCLE_CONTEXT` + lifecycle route present | `ACTION_CONTINUE_INTERNAL_WITH_LIFECYCLE_CONTEXT` | lifecycle route, hold/release flags, deletion/de-identification visibility, lineage metadata | generic compliance-cleared success | lifecycle context remains explicit and non-certifying |
| `DIRECTIVE_CONTINUE_NO_RECORD_NON_CLEARANCE` | `ACTION_CONTINUE_INTERNAL_NO_RECORD_NON_CLEARANCE` | `clearanceInferred: false`, no-record lineage, explicit no-record handling flag | safe-cleared or finalized state | no-record remains explicit non-clearance |
| `DIRECTIVE_HOLD_CANNOT_SAFELY_RESUME` | `ACTION_HOLD_INTERNAL_CANNOT_SAFELY_RESUME` | malformed/cannot-resume lineage, fail-safe flag | silent resume success fallback | cannot-resume remains fail-safe hold |
| `DIRECTIVE_EXPLICIT_NO_ROUTING_SIGNAL` | `ACTION_EXPLICIT_INTERNAL_NO_ROUTING_SIGNAL` | explicit no-signal handling flag and lineage | default proceed/success | no-signal remains explicit and non-default |
| hold-aware overlay on any continuation directive | continuation action with hold-aware overlay | `holdAwareLifecycleStatePresent` and route visibility | treat as normal clear path | hold-aware overlay remains visible |
| release-controlled overlay on any continuation directive | continuation action with release-controlled overlay | `releaseControlledLifecycleStatePresent` and route visibility | treat as generic all-clear | release-controlled overlay remains visible |
| deletion route overlay | continuation action with deletion route | `lifecycleRoute: "DELETION_REQUEST"`, `deletionRequestPresent: true` | conflate with de-identification | deletion remains distinct |
| de-identification route overlay | continuation action with de-identification route | `lifecycleRoute: "DEIDENTIFICATION_ACTION"`, `deidentificationActionPresent: true` | conflate with deletion | de-identification remains distinct |

## 6. Fail-Safe Rules

- No-record must never become success/clearance handling semantics.
- Malformed/cannot-resume must map to explicit fail-safe hold handling semantics.
- No-signal must map to explicit no-signal handling semantics.
- Hold-aware and release-controlled state must remain visible in handling metadata.
- Deletion and de-identification routes must remain distinguishable in handling metadata.
- Lifecycle and non-lifecycle slices must remain separately inspectable in handling consumption.
- `clearanceInferred: false` must remain invariant for handling-action consumption.

## 7. Not UI Copy / Not Screen Routing / Not CTA Behavior

This contract does not define:

- button text
- banners/body copy
- user-facing status labels
- CTA hierarchy or CTA priority
- visual route rendering
- screen navigation language
- public-facing route names

Any future UI/screen contract must be authored separately and must not reinterpret internal handling actions as user-facing certainty claims.

## 8. Later Implementation Checklist

- [ ] Consume `DIRECTIVE_*` outputs without collapsing lifecycle/non-lifecycle inspectability.
- [ ] Implement only allowed internal handling-action outcomes.
- [ ] Preserve no-record as explicit non-clearance handling.
- [ ] Preserve malformed/cannot-resume as explicit fail-safe hold handling.
- [ ] Preserve no-signal as explicit handling, not default success.
- [ ] Preserve hold-aware/release-controlled overlays and deletion/de-identification distinction.
- [ ] Keep handling actions internal; do not generate user-facing status/CTA/screen-route/public-route semantics.
- [ ] Keep `clearanceInferred: false` invariant.
- [ ] Keep output/handoff trust semantics unchanged.
- [ ] Do not imply BR04 completion, storage readiness, alpha readiness, or Review C completion.

## 9. Next Move Recommendation

Recommendation: implement the next internal handling-action consumer seam now against this contract, while keeping it narrow and non-UI.

Rationale:

- `APP-ROUTE-09` now freezes handling-action semantics before runtime expansion, reducing semantic drift risk.
- Protected states (`NO_RECORD`, malformed, no-signal, hold/release, deletion/de-identification) are explicit enough for safe implementation.
- This preserves 4B internal plumbing momentum while remaining compatible with bounded 4C parallel surface work.

## 10. Source Anchors

- `docs/specs/p4b-cx-app-route-01-launcher-current-matter-lifecycle-resume-routing-contract-pack.md`
- `docs/specs/p4b-cx-app-route-07-launcher-current-matter-execution-directive-contract-pack.md`
- `docs/qa/p4b-cx-app-route-status-02-post-route-08-checkpoint-note.md`
- `src/app/launcherCurrentMatterExecutionRouting.ts`
- `src/app/launcherCurrentMatterExecutionCaller.ts`
- `src/app/launcherCurrentMatterFollowOnRouteCoordinator.ts`
- `src/app/launcherCurrentMatterTransitionSelector.ts`
- `src/app/launcherCurrentMatterTransitionOrchestrationEntry.ts`
- `src/app/launcherCurrentMatterExecutionDirectiveConsumer.ts`
