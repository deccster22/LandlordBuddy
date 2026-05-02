# P4B-CX-APP-ALIGN-03 Internal Guardrail/Watchpoint Logging Schema Contract Pack

Date: 2026-05-03
Task ID: P4B-CX-APP-ALIGN-03
Phase posture: 4B primary, 4C parallel (bounded)
Gate posture: Review A checkpoint-cleared only; BR04 cleared with gate only

This is a contract/documentation artifact only.
It does not implement logging, runtime behavior, tests, UI wording, status labels, CTA behavior, or rendered screen routing.

## 1. Contract Intent and Boundary

- Freeze a narrow internal logging schema contract for `FCB-05` guardrail/watchpoint observability.
- Keep logging internal-only and non-visual.
- Preserve separate inspectability:
  - lifecycle-derived transition/routing state
  - non-lifecycle transition state
- Preserve non-certifying posture:
  - no legal sufficiency claim
  - no compliance clearance claim
  - no storage-provider readiness claim
  - no privacy-engine completion claim
  - no filing/readiness/acceptance/finality claim
  - no alpha-readiness or Review C implication

## 2. Logging Scope

Internal logging scope is limited to:

- app-routing spine watchpoints from routing/control/directive/handling seams
- protected-state observability for no-record, malformed/cannot-resume, explicit no-signal, hold/release, and lifecycle route kind
- QA/audit/debug visibility for invariant checks

Out of logging scope:

- user-facing copy or product analytics copy
- rendered status/CTA/screen behavior
- legal/compliance interpretations
- storage/security readiness claims

## 3. Allowed Event Families

Allowed internal event families (example canonical `eventType` values):

1. `WATCH_LIFECYCLE_RESUME_STATE_OBSERVED`
2. `WATCH_LIFECYCLE_NO_RECORD_OBSERVED`
3. `WATCH_LIFECYCLE_CANNOT_RESUME_OBSERVED`
4. `WATCH_LIFECYCLE_NO_ROUTING_SIGNAL_OBSERVED`
5. `WATCH_LIFECYCLE_HOLD_RELEASE_STATE_OBSERVED`
6. `WATCH_LIFECYCLE_ACTION_ROUTE_OBSERVED`
7. `WATCH_LIFECYCLE_NONLIFECYCLE_SEPARATION_OBSERVED`

Allowed event-family intent:

- observe internal state and invariant posture only
- preserve explicit protected-state flags
- preserve source seam provenance

## 4. Forbidden Event Names and Semantics

Event names and semantics must not include or imply:

- success
- cleared
- compliant
- ready
- accepted
- filed
- approved
- valid
- legal
- complete
- safe
- final

Additional forbidden semantics:

- default proceed posture for no-signal states
- clearance implication for no-record states
- silent-success implication for malformed/cannot-resume states
- public-facing route aliasing from internal outcomes

## 5. Logging Schema Contract

### 5.1 Required fields

- `eventType` (string; must be one allowed family)
- `eventId` (string; unique identifier)
- `observedAt` (ISO 8601 timestamp)
- `sourceSeam` (string; internal seam name)
- `sourceTaskLineage` (string array; task IDs where useful)
- `lifecycleStateCategory` (enum-like string; non-certifying category only)
- `protectedStateFlags` (object; see 5.2)
- `clearanceInferred` (boolean; must remain explicit)
- `auditProvenanceRef` (string; non-sensitive provenance locator)
- `redactionPosture` (enum-like string; e.g. `MINIMISED_INTERNAL`)

### 5.2 Required protected-state flags object

- `cannotSafelyResumeFlag` (boolean)
- `noRecordFlag` (boolean)
- `noRoutingSignalFlag` (boolean)
- `holdAwareFlag` (boolean)
- `releaseControlledFlag` (boolean)
- `lifecycleNonLifecycleSeparationFlag` (boolean)
- `lifecycleRouteKind` (string enum: `DELETION_REQUEST` | `DEIDENTIFICATION_ACTION` | `NONE`)

### 5.3 Optional fields (strictly minimised)

- `matterLocatorRef` (string; safe internal locator only)
- `outputPackageLocatorRef` (string; safe internal locator only)
- `routingOutcomeCode` (string)
- `controlOutcomeCode` (string)
- `directiveCode` (string)
- `handlingActionCode` (string)

Optional fields remain internal-only and must not contain personal or legal fact payloads.

## 6. Privacy and Minimisation Rules

Must not log by default:

- tenant personal details
- landlord personal details beyond safe internal actor references
- free-text legal facts
- document contents
- official portal credentials or official portal identifiers
- unnecessary address details
- unnecessary payment transaction details

Allowed locator posture:

- safe internal stable-key locators only
- no raw document payload contents
- no expanded narrative fields unless separately approved in contract update

## 7. Fail-Safe Logging Rules

- No-record states must log as non-clearance (`clearanceInferred: false`).
- Malformed/cannot-resume states must log as explicit cannot-safely-resume watchpoints.
- No-signal states must log as explicit no-routing-signal watchpoints.
- Hold/release states must log as review-led visibility, not clear-path signals.
- Deletion and de-identification route kinds must remain distinct in logged metadata.
- Lifecycle/non-lifecycle separation flag must remain explicit and true when both slices are present.

## 8. Logging-State Table

| Source state | Allowed event type | Required flags | Forbidden interpretation | Later test expectation |
| --- | --- | --- | --- | --- |
| `RESUME_AVAILABLE_CONTROL` lineage | `WATCH_LIFECYCLE_RESUME_STATE_OBSERVED` | `clearanceInferred`, `lifecycleNonLifecycleSeparationFlag`, `lifecycleRouteKind` | resume means cleared/compliant/ready | lifecycle context observed without certifying semantics |
| `NO_RECORD_NON_CLEARANCE_CONTROL` lineage | `WATCH_LIFECYCLE_NO_RECORD_OBSERVED` | `noRecordFlag=true`, `clearanceInferred=false` | no record implies safe/cleared | no-record remains explicit non-clearance |
| `CANNOT_SAFELY_RESUME_CONTROL` lineage | `WATCH_LIFECYCLE_CANNOT_RESUME_OBSERVED` | `cannotSafelyResumeFlag=true` | malformed state fell back to success | malformed/cannot-resume remains fail-safe |
| `NO_LIFECYCLE_ROUTING_SIGNAL` lineage | `WATCH_LIFECYCLE_NO_ROUTING_SIGNAL_OBSERVED` | `noRoutingSignalFlag=true` | no signal defaults to proceed/success | no-signal remains explicit and non-default |
| hold-aware or release-controlled lifecycle state | `WATCH_LIFECYCLE_HOLD_RELEASE_STATE_OBSERVED` | `holdAwareFlag` and/or `releaseControlledFlag` | hold/release interpreted as completion | hold/release remain visible and review-led |
| lifecycle route observed (`DELETION_REQUEST`) | `WATCH_LIFECYCLE_ACTION_ROUTE_OBSERVED` | `lifecycleRouteKind=DELETION_REQUEST` | conflated with de-identification | deletion remains distinct |
| lifecycle route observed (`DEIDENTIFICATION_ACTION`) | `WATCH_LIFECYCLE_ACTION_ROUTE_OBSERVED` | `lifecycleRouteKind=DEIDENTIFICATION_ACTION` | conflated with deletion | de-identification remains distinct |
| lifecycle + non-lifecycle slices present | `WATCH_LIFECYCLE_NONLIFECYCLE_SEPARATION_OBSERVED` | `lifecycleNonLifecycleSeparationFlag=true` | collapsed into generic resume success | slice separation remains explicit |

## 9. Not Analytics Copy / Not UI Copy

This contract does not define:

- analytics dashboard copy
- product-facing status wording
- user-facing labels or banners
- CTA hierarchy language
- rendered route naming

Internal `eventType` values are schema identifiers only and must not be reused as public-facing language.

## 10. Later Implementation Checklist

- [ ] Implement only allowed internal event families.
- [ ] Enforce forbidden name/semantic list in schema validation.
- [ ] Emit `clearanceInferred=false` for no-record watchpoints.
- [ ] Emit explicit cannot-resume and no-signal watchpoints.
- [ ] Preserve hold/release visibility and distinct deletion/de-identification route kind.
- [ ] Preserve lifecycle/non-lifecycle separation flag.
- [ ] Enforce minimised payload rules and locator-only references.
- [ ] Keep logging internal-only and non-visual.
- [ ] Keep output/handoff trust semantics unchanged.
- [ ] Do not imply BR04 completion, compliance clearance, filing readiness, alpha readiness, or Review C completion.

## 11. Next Move Recommendation

Recommendation: implement `FCB-05` next as a narrow internal seam using this schema contract.

Rationale:

- `APP-ALIGN-02` already classified `FCB-05` as a safe non-visual candidate after schema freeze.
- This contract now constrains event naming, fail-safe semantics, and minimisation posture before code opens.
- Implementation can increase QA/audit/debug visibility without opening UI/status/CTA or compliance language risk.

## 12. Source Anchors

- `docs/qa/p4b-cx-app-route-status-03-post-route-10-checkpoint-note.md`
- `docs/qa/p4b-cx-app-align-01-routing-spine-shell-current-matter-surface-alignment.md`
- `docs/qa/p4b-cx-app-align-02-future-consumption-backlog-map.md`
- `src/app/launcherCurrentMatterExecutionRouting.ts`
- `src/app/launcherCurrentMatterExecutionCaller.ts`
- `src/app/launcherCurrentMatterFollowOnRouteCoordinator.ts`
- `src/app/launcherCurrentMatterTransitionSelector.ts`
- `src/app/launcherCurrentMatterTransitionOrchestrationEntry.ts`
- `src/app/launcherCurrentMatterExecutionDirectiveConsumer.ts`
- `src/app/launcherCurrentMatterHandlingActionConsumer.ts`
