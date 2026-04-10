# BR04 Privacy Lifecycle Scaffold

This note describes the first BR04 implementation scaffold added during Phase 4B. It creates stable attachment points for privacy, retention, hold, lifecycle, audit, and access-boundary work without hard-coding unsettled doctrine.

## What this scaffold covers

- `src/domain/model.ts` now defines shared privacy domain objects: `DataClass`, `RetentionPolicyRef`, `PreservationScope`, `HoldFlag`, `LifecycleAction`, `DeletionRequest`, `DeidentificationAction`, `PrivacyAuditEvent`, `AccessScope`, and `PrivacyRoleBoundary`.
- `Matter`, `EvidenceItem`, `NoticeDraft`, and `OutputPackage` now carry `privacyHooks`, so privacy lifecycle linkage is explicit on the current matter/evidence/document spine.
- `src/modules/br04/index.ts` provides build-facing helper constructors and QA inventory hooks for the BR04 lane.
- `src/modules/evidence/index.ts` now maps existing evidence privacy and hold posture into a placeholder `privacyHooks.lifecycleState` without claiming a settled retention engine.
- The generic audit module now recognizes `PRIVACY` as a valid audit domain for later integration work.

## How BR04 plugs into the current spine

1. Matter-level control remains the anchor. `Matter.privacyHooks` is the top-level attachment point for privacy lifecycle state, policy refs, hold link IDs, deletion/deidentification requests, and access-scope links.
2. Evidence remains locally validated first. The existing evidence shell still separates local validation from official acceptance, and now carries privacy lifecycle hooks in parallel.
3. Document shells stay reviewable. `NoticeDraft` and `OutputPackage` now expose privacy hooks without implying filing, submission, or compliant final disposal behavior.
4. Auditability remains explicit. Privacy actions have a dedicated event shape instead of hiding lifecycle changes in generic notes or silent state transitions.
5. Role and scope boundaries stay structural. `AccessScope` and `PrivacyRoleBoundary` make access posture visible now so later policy work can plug in without flattening permissions into ad hoc checks.

## Guarded or blocked details that remain unresolved

- Exact retention durations remain configurable and must not be hard-coded here.
- Hold trigger taxonomy remains placeholder-only.
- Release authority and review cadence remain placeholder-only.
- Deidentification method detail remains placeholder-only.
- User-facing privacy copy remains out of scope for this scaffold.
- Rental-application compliance remains excluded.
- No part of this scaffold implies universal preservation, universal deletion, legal advice, or official execution.

## Intended later insertion points

- A configurable retention engine should resolve `RetentionPolicyRef.policyKey` values into class-based timing and action rules.
- Later hold extraction work should attach settled trigger detail to `HoldReason` and settled release controls to `HoldFlag`.
- Later access-policy extraction should refine `PrivacyRoleBoundary` operation sets and scope coverage without removing explicit review lanes.
- Later BR04 output work can read `privacyHooks` on matter/evidence/document objects instead of inventing a second privacy spine.
