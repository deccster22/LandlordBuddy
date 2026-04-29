# P4B-CX-APP-ROUTE-07 Launcher/Current-Matter Execution-Directive Contract Pack

Date: 2026-04-29
Task ID: P4B-CX-APP-ROUTE-07
Phase posture: 4B primary, 4C parallel (bounded)
Gate posture: Review A checkpoint-cleared only; BR04 cleared with gate only

This is a contract/documentation artifact only.
It does not implement execution directives, runtime behavior, tests, UI wording, or rendered screen routing.

## 1. Contract Intent and Boundary

- Freeze a narrow execution-directive contract for consuming launcher/current-matter transition orchestration outputs from `APP-ROUTE-06`.
- Keep execution directives internal control instructions only.
- Preserve separate inspectability:
  - lifecycle-derived transition state
  - non-lifecycle transition state
- Preserve non-certifying posture:
  - no legal sufficiency claim
  - no compliance clearance claim
  - no storage-provider readiness claim
  - no privacy-engine completion claim
  - no alpha-readiness or Review C implication

## 2. Directive Input Contract

Execution-directive consumers may consume these internal inputs only:

### 2.1 Orchestration handling contract input

- orchestration target:
  - `ORCHESTRATION_LIFECYCLE_CONTEXT_CONTINUE`
  - `ORCHESTRATION_NO_RECORD_NON_CLEARANCE_CONTINUE`
  - `ORCHESTRATION_FAIL_SAFE_HOLD`
  - `ORCHESTRATION_EXPLICIT_NO_SIGNAL`
- orchestration handling mode:
  - `ORCHESTRATION_MODE_LIFECYCLE_CONTEXT`
  - `ORCHESTRATION_MODE_NO_RECORD_NON_CLEARANCE`
  - `ORCHESTRATION_MODE_FAIL_SAFE_HOLD`
  - `ORCHESTRATION_MODE_EXPLICIT_NO_SIGNAL`
- invariants:
  - `clearanceInferred: false`
  - explicit booleans for `noRecordNonClearanceHandling`, `failSafeHoldHandling`, `explicitNoRoutingSignalHandling`

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

### 2.4 Protected state inputs that must not be collapsed

- no-record non-clearance (`NO_RECORD_NON_CLEARANCE_CONTROL` lineage)
- malformed/cannot-resume (`CANNOT_SAFELY_RESUME_CONTROL` lineage)
- no-signal (`NO_LIFECYCLE_ROUTING_SIGNAL` lineage)
- hold-aware/release-controlled visibility
- deletion vs de-identification route distinction

## 3. Allowed Internal Execution-Directive Outcomes

Future directive implementation must resolve to one of these internal outcomes:

1. `DIRECTIVE_CONTINUE_WITH_LIFECYCLE_CONTEXT`
   - internal continuation with lifecycle context preserved
2. `DIRECTIVE_CONTINUE_NO_RECORD_NON_CLEARANCE`
   - internal continuation with explicit non-clearance/no-record posture
3. `DIRECTIVE_HOLD_CANNOT_SAFELY_RESUME`
   - explicit fail-safe hold directive for malformed/unsafe resume
4. `DIRECTIVE_EXPLICIT_NO_ROUTING_SIGNAL`
   - explicit no-signal directive; no default-success fallback

Allowed overlay metadata on continuation directives:

- hold-aware overlay (`holdAwareLifecycleStatePresent: true`)
- release-controlled overlay (`releaseControlledLifecycleStatePresent: true`)
- deletion route overlay (`lifecycleRoute: "DELETION_REQUEST"`)
- de-identification route overlay (`lifecycleRoute: "DEIDENTIFICATION_ACTION"`)

These are internal directives only, not user-visible states.

## 4. Forbidden Directive Interpretations

Directive consumers must not interpret internal directives as:

- compliance cleared
- legally sufficient
- officially accepted/filed/submitted/lodged
- ready for filing
- user-facing status label
- CTA tier/state/priority
- rendered screen route
- completion of BR04/privacy/storage readiness

## 5. Directive-State Table

| Orchestration input | Allowed directive | Protected metadata to preserve | Forbidden interpretation | Later test expectation |
| --- | --- | --- | --- | --- |
| `ORCHESTRATION_LIFECYCLE_CONTEXT_CONTINUE` + lifecycle route present | `DIRECTIVE_CONTINUE_WITH_LIFECYCLE_CONTEXT` | lifecycle route, hold/release flags, deletion/de-identification visibility, lineage metadata | generic compliance-cleared success | lifecycle context preserved and non-certifying |
| `ORCHESTRATION_NO_RECORD_NON_CLEARANCE_CONTINUE` | `DIRECTIVE_CONTINUE_NO_RECORD_NON_CLEARANCE` | `clearanceInferred: false`, no-record lineage, explicit no-record handling flag | safe-cleared or finalized state | no-record remains explicit non-clearance |
| `ORCHESTRATION_FAIL_SAFE_HOLD` | `DIRECTIVE_HOLD_CANNOT_SAFELY_RESUME` | malformed/cannot-resume lineage, fail-safe flag | silent resume success fallback | cannot-resume maps to fail-safe hold |
| `ORCHESTRATION_EXPLICIT_NO_SIGNAL` | `DIRECTIVE_EXPLICIT_NO_ROUTING_SIGNAL` | explicit no-signal handling flag and lineage | default proceed/success | no-signal remains explicit and non-default |
| lifecycle hold-aware overlay | any continue directive with overlay | `holdAwareLifecycleStatePresent` and route visibility | treat as normal clear path | hold-aware overlay remains visible |
| lifecycle release-controlled overlay | any continue directive with overlay | `releaseControlledLifecycleStatePresent` and route visibility | treat as generic all-clear | release-controlled overlay remains visible |
| deletion route overlay | continue directive with deletion route | `lifecycleRoute: "DELETION_REQUEST"`, `deletionRequestPresent: true` | conflate with de-identification | deletion remains distinct |
| de-identification route overlay | continue directive with de-identification route | `lifecycleRoute: "DEIDENTIFICATION_ACTION"`, `deidentificationActionPresent: true` | conflate with deletion | de-identification remains distinct |

## 6. Fail-Safe Rules

- No-record must never become success/clearance directive semantics.
- Malformed/cannot-resume must map to explicit fail-safe hold directive semantics.
- No-signal must map to explicit no-signal directive semantics.
- Hold-aware and release-controlled state must remain visible in directive metadata.
- Deletion and de-identification routes must remain distinguishable in directive metadata.
- `clearanceInferred: false` must remain invariant for directive consumption.

## 7. Not UI Copy / Not Screen Routing

This contract does not define:

- button text
- banner/body copy
- user-facing status labels
- CTA hierarchy
- visual route rendering
- screen navigation language

Any future UI/screen contract must be authored separately and must not reinterpret directives as user-facing certainty claims.

## 8. Later Implementation Checklist

- [ ] Consume orchestration outputs without collapsing lifecycle/non-lifecycle inspectability.
- [ ] Implement only allowed internal directive outcomes.
- [ ] Preserve no-record as explicit non-clearance.
- [ ] Preserve malformed/cannot-resume as explicit fail-safe hold.
- [ ] Preserve no-signal as explicit directive, not default success.
- [ ] Preserve hold-aware/release-controlled overlays and deletion/de-identification distinction.
- [ ] Keep directives internal; do not generate user-facing status/CTA/screen route semantics.
- [ ] Keep `clearanceInferred: false` invariant.
- [ ] Keep output/handoff trust semantics unchanged.
- [ ] Do not imply BR04 completion, storage readiness, alpha readiness, or Review C completion.

## 9. Next Move Recommendation

Recommendation: implement the next internal execution-directive consumer seam now against this contract, while keeping it narrow and non-UI.

Rationale:

- The directive contract is now frozen and can constrain semantics before runtime expansion.
- Protected states (`NO_RECORD`, malformed, no-signal, hold/release, deletion/de-identification) are explicit enough for safe implementation.
- This preserves 4B internal plumbing momentum without requiring 4C rendered-surface decisions.

## 10. Source Anchors

- `docs/specs/p4b-cx-app-route-01-launcher-current-matter-lifecycle-resume-routing-contract-pack.md`
- `docs/qa/p4b-cx-app-route-status-01-post-route-06-checkpoint-note.md`
- `src/app/launcherCurrentMatterExecutionRouting.ts`
- `src/app/launcherCurrentMatterExecutionCaller.ts`
- `src/app/launcherCurrentMatterFollowOnRouteCoordinator.ts`
- `src/app/launcherCurrentMatterTransitionSelector.ts`
- `src/app/launcherCurrentMatterTransitionOrchestrationEntry.ts`
