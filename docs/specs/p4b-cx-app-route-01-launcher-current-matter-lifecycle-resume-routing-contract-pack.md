# P4B-CX-APP-ROUTE-01 Launcher/Current-Matter Lifecycle Resume Routing Contract Pack

Date: 2026-04-27
Task ID: P4B-CX-APP-ROUTE-01
Phase posture: 4B primary, 4C parallel (bounded)
Gate posture: Review A checkpoint-cleared only; BR04 cleared with gate only

This is a contract/documentation artifact only.
It does not implement launcher/current-matter execution routing, UI wording, or runtime behavior changes.

## 1. Contract Intent and Boundary

- Freeze app-layer routing semantics for launcher/current-matter consumption of BR04 lifecycle resume metadata.
- Keep lifecycle resume metadata as internal routing/support metadata only.
- Preserve non-certifying posture:
  - no legal sufficiency claim
  - no compliance clearance claim
  - no storage-provider readiness claim
  - no privacy-engine completion claim
  - no alpha-readiness or Review C implication

## 2. Routing Input Contract

### 2.1 Raw lifecycle resume checkpoint input (`outputPackageLifecycleResume`)

Allowed raw states at checkpoint hydration seam:

1. `status: "RESUMED"`
   - `clearanceInferred` is always `false`.
   - `replayPlan` is present and includes:
     - lifecycle route (`DELETION_REQUEST` or `DEIDENTIFICATION_ACTION`)
     - hold suppression visibility (`suppressedByHold`)
     - runtime hold/release visibility (`runtimeRecord.activeHoldFlagIds`, `runtimeRecord.releasedHoldFlagIds`)
     - class/policy visibility (`runtimeRecord.dataClassId`, `runtimeRecord.policyKey`, `classControl.policyKey`, `classControl.durationModelKey`)
     - route-specific lifecycle action payload (`deletionRequest` or `deidentificationAction`)
   - `auditEvents` is present and remains provenance metadata, not clearance.

2. `status: "NO_RECORD"`
   - `clearanceInferred` is always `false`.
   - record is absent by key and remains explicitly non-clearance.
   - this state is controlled absence, not success and not malformed.

3. Malformed lifecycle record payload (cannot safely resume)
   - no `status` object is returned from resume loader.
   - behavior is fail-loud exception (`Malformed output-package lifecycle orchestration record ...`).
   - malformed payload must not be converted to resumed/no-record success semantics.

### 2.2 Neutral app routing metadata input (`launcherCurrentMatterLifecycleResumeRouting`)

Current adapter output states:

1. `status: "LIFECYCLE_RESUME_AVAILABLE"`
   - `checkpointStatus: "RESUMED"`
   - `clearanceInferred: false`
   - `lifecycleResumeRecordPresent: true`
   - `lifecycleRoute: "DELETION_REQUEST" | "DEIDENTIFICATION_ACTION"`
   - hold/release visibility flags preserved:
     - `holdAwareLifecycleStatePresent`
     - `releaseControlledLifecycleStatePresent`
   - route visibility flags preserved:
     - `deletionRequestPresent`
     - `deidentificationActionPresent`
   - provenance linkage preserved:
     - `resumeRecordKey`
     - embedded `outputPackageLifecycleResume`

2. `status: "LIFECYCLE_RECORD_NOT_FOUND"`
   - `checkpointStatus: "NO_RECORD"`
   - `clearanceInferred: false`
   - `lifecycleResumeRecordPresent: false`
   - `lifecycleRoute: "NONE"`
   - hold/release and route flags remain false/absent
   - provenance linkage preserved via `resumeRecordKey`

### 2.3 Contracted input overlays for future launcher/current-matter routing

Future execution routing may consume these overlay conditions:

- hold-aware overlay: `holdAwareLifecycleStatePresent === true`
- release-controlled overlay: `releaseControlledLifecycleStatePresent === true`
- deletion route branch: `lifecycleRoute === "DELETION_REQUEST"`
- de-identification route branch: `lifecycleRoute === "DEIDENTIFICATION_ACTION"`
- class/policy reference visibility: `replayPlan.runtimeRecord` and `replayPlan.classControl` fields
- provenance visibility: `resumeRecordKey` and `auditEvents`

## 3. Routing Outcome Contract (Execution Layer, Future)

Later launcher/current-matter execution routing must resolve to one of these contract outcomes:

1. `RESUME_AVAILABLE`
   - lifecycle resume metadata is present and routable.

2. `NO_LIFECYCLE_RECORD_FOUND`
   - no persisted lifecycle record exists for the resume key.

3. `CANNOT_SAFELY_RESUME_RECORD`
   - lifecycle record payload is malformed or otherwise unsafe to consume.

4. `RESUME_AVAILABLE_HOLD_AWARE`
   - resume is available and hold-aware state is present.

5. `RESUME_AVAILABLE_RELEASE_CONTROLLED`
   - resume is available and release-controlled state is present.

6. `RESUME_AVAILABLE_WITH_LIFECYCLE_ACTION_PLAN`
   - resume is available with explicit route/action visibility (deletion vs de-identification).

These are routing outcomes, not user-facing legal or compliance outcomes.

## 4. Fail-Safe Behavior Contract

- `NO_RECORD` must continue without lifecycle clearance; it is not success and not inferred clearance.
- Malformed record payload must fail loud or map to explicit cannot-resume handling; no silent fallback.
- Hold-aware state must not be skipped when present.
- Release-controlled state must remain explicit when present.
- Deletion vs de-identification route must remain distinguishable in routing decisions.
- `clearanceInferred: false` must remain invariant across all lifecycle resume routing states.

## 5. Routing-State Table

| Input status | Routing signal | Allowed next behavior | Forbidden interpretation | Test expectation |
| --- | --- | --- | --- | --- |
| `RESUMED` with valid replay plan | `LIFECYCLE_RESUME_AVAILABLE` | Route using resume metadata and keep lifecycle action-plan visibility internal | "Lifecycle cleared/compliant/finalized" | Adapter/hydration resume assertions stay green |
| `RESUMED` with hold suppression or active holds | `LIFECYCLE_RESUME_AVAILABLE` + `holdAwareLifecycleStatePresent: true` | Route through hold-aware guarded path and keep review-led posture | Skip hold-aware handling or treat as normal clear path | Hold-aware routing metadata assertion stays green |
| `RESUMED` with released hold evidence | `LIFECYCLE_RESUME_AVAILABLE` + `releaseControlledLifecycleStatePresent: true` | Preserve release-controlled branch visibility and review controls | Treat released-hold context as generic all-clear | Release-controlled routing metadata assertion stays green |
| `NO_RECORD` | `LIFECYCLE_RECORD_NOT_FOUND` | Continue launcher/current-matter flow without lifecycle-clearance claim | Resume success, clearance inference, or disposal-ready claim | No-record non-clearance assertion stays green |
| Malformed record payload | `CANNOT_SAFELY_RESUME_RECORD` (contract outcome; fail-loud source error today) | Stop/resolution path that preserves explicit cannot-resume semantics | Silent fallback to resume/no-record success | Malformed payload fail-loud assertion stays green |

## 6. Allowed Consumption vs Forbidden Conversion

Later implementation may consume for routing only:

- status and checkpoint status
- hold/release visibility flags
- deletion/de-identification route visibility
- class/policy references from replay/runtime records
- audit/provenance visibility (`auditEvents`, `resumeRecordKey`)

Later implementation must not convert metadata into user-facing claim language implying:

- legal sufficiency
- compliance clearance
- official filing/submission/acceptance
- BR04 full completion
- storage-provider or key-management completion
- alpha-readiness or Review C completion

## 7. Not UI Copy

This contract does not define:

- button labels
- banners/messages
- trust/caution copy strings
- screen design language

Any future UI/copy surface must be authored separately and remain bound to trust-cue and non-claim controls.

## 8. Later Implementation Acceptance Checklist

- [ ] Consume only contracted inputs (`outputPackageLifecycleResume`, `launcherCurrentMatterLifecycleResumeRouting`) without widening semantics.
- [ ] Preserve `NO_RECORD` as explicit non-clearance (`clearanceInferred: false`).
- [ ] Preserve malformed payload handling as fail-loud or explicit cannot-resume path.
- [ ] Keep hold-aware and release-controlled routing states explicit and non-skippable.
- [ ] Keep deletion and de-identification routing distinguishable.
- [ ] Keep class/policy and audit/provenance data as routing/support metadata only.
- [ ] Do not introduce UI/copy claims from routing metadata.
- [ ] Do not imply BR04 completion, storage readiness, alpha readiness, or Review C completion.
- [ ] Keep output/handoff trust semantics unchanged by lifecycle resume routing consumption.

## 9. Source Anchors

- `docs/qa/p4b-cx-app-status-01-post-br04-10-checkpoint-note.md`
- `src/app/outputHandoffCheckpointHydration.ts`
- `src/app/launcherCurrentMatterLifecycleResumeAdapter.ts`
- `src/app/outputPackageLifecycleOrchestrationPersistence.ts`
- `tests/output-br04-lifecycle-resume-checkpoint.test.ts`
- `tests/output-br04-launcher-current-matter-resume-adapter.test.ts`
