# BR04 Privacy Lifecycle Scaffold

This note describes the current BR04 implementation scaffold in Phase 4B. It now includes a dedicated policy-source lane that can populate privacy, retention, access-scope, and role-boundary hooks without hard-coding unsettled doctrine.

## What this scaffold covers

- `src/domain/model.ts` now defines shared privacy domain objects: `DataClass`, `RetentionPolicyRef`, `PreservationScope`, `HoldFlag`, `LifecycleAction`, `DeletionRequest`, `DeidentificationAction`, `PrivacyAuditEvent`, `AccessScope`, and `PrivacyRoleBoundary`.
- `Matter`, `EvidenceItem`, `NoticeDraft`, and `OutputPackage` now carry `privacyHooks`, so privacy lifecycle linkage is explicit on the current matter/evidence/document spine.
- `src/modules/br04/policy-source.ts` now provides the dedicated BR04 policy-source registry for data classes, retention policy refs, access scopes, role boundaries, and unresolved-doctrine placeholders.
- `src/modules/br04/index.ts` now provides build-facing helper constructors plus assembly and resolution helpers that map the policy source into current domain hook shapes.
- `src/modules/evidence/index.ts` now maps existing evidence privacy and hold posture into a placeholder `privacyHooks.lifecycleState` without claiming a settled retention engine.
- The generic audit module now recognizes `PRIVACY` as a valid audit domain for later integration work.

## How BR04 plugs into the current spine

1. Matter-level control remains the anchor. `Matter.privacyHooks` is the top-level attachment point for privacy lifecycle state, policy refs, hold link IDs, deletion/deidentification requests, and access-scope links.
2. Evidence remains locally validated first. The existing evidence shell still separates local validation from official acceptance, and now carries privacy lifecycle hooks in parallel.
3. Document shells stay reviewable. `NoticeDraft` and `OutputPackage` now expose privacy hooks without implying filing, submission, or compliant final disposal behavior.
4. Auditability remains explicit. Privacy actions have a dedicated event shape instead of hiding lifecycle changes in generic notes or silent state transitions.
5. Role and scope boundaries stay structural. `AccessScope` and `PrivacyRoleBoundary` make access posture visible now so later policy work can plug in without flattening permissions into ad hoc checks.

## What is source-driven now

- Data classes are now defined through the BR04 policy source instead of living only as ad hoc constructor inputs.
- `RetentionPolicyRef` objects can now be assembled from source-managed `policyKey` entries for matter, evidence, notice-draft, and output-package records.
- `AccessScope` objects can now be resolved from source-managed scope references before being attached to hooks or role boundaries.
- `PrivacyRoleBoundary` objects can now be assembled from source-managed scope references and operation sets, with overlap validation so an operation cannot silently land in multiple posture buckets.
- The policy source also carries explicit placeholder markers for unresolved doctrine such as exact retention duration, hold trigger taxonomy, release authority, review cadence, and the prohibition on any blanket keep/delete rule.

## Guarded or blocked details that remain unresolved

- Exact retention durations remain configurable and must not be hard-coded here.
- Hold trigger taxonomy remains placeholder-only.
- Release authority and review cadence remain placeholder-only.
- Deidentification method detail remains placeholder-only.
- User-facing privacy copy remains out of scope for this scaffold.
- Rental-application compliance remains excluded.
- No part of this scaffold implies universal preservation, universal deletion, legal advice, or official execution.
- Evidence upload limits remain local-only preparation checks. They are not BR04 lifecycle doctrine.

## Intended later insertion points

- A configurable retention engine should resolve `RetentionPolicyRef.policyKey` values into class-based timing and action rules.
- Later hold extraction work should attach settled trigger detail to `HoldReason` and settled release controls to `HoldFlag`.
- Later access-policy extraction should refine `PrivacyRoleBoundary` operation sets and scope coverage without removing explicit review lanes.
- Later BR04 output work can read `privacyHooks` on matter/evidence/document objects instead of inventing a second privacy spine.
- Later BR04 packs still need to define the actual retention schedule values, hold-trigger taxonomy, release authority table, and review cadence model before any privacy lifecycle automation becomes deterministic.
