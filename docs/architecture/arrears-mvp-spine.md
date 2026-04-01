# Arrears MVP Spine

This repository starts with a narrow arrears-to-notice-readiness domain spine. It is intentionally designed to stop before filing, tribunal execution, or authenticated portal behavior.

## Core shape

- `src/domain/model.ts` defines the shared entities for the arrears MVP wedge: tenancy, ledger inputs, notice-preparation records, routing metadata, referral flags, audit entries, and source references.
- `src/workflow/arrearsHeroWorkflow.ts` defines the hero workflow states from intake through notice readiness.
- `src/modules/output` owns output selection and package shells without implying filing or live official submission.
- `src/modules/handoff` owns official handoff guidance shells for user/operator action outside the product boundary.
- `src/modules/touchpoints` owns touchpoint classification placeholders and metadata lookup shells.
- `Matter` is the aggregate anchor for workflow coordination, but it does not absorb every concern into one status field.

## Explicit separation

Three dimensions stay separate on purpose:

- `forumPath`: the target forum or pathway shape for the matter.
- `outputMode`: the kind of package the system is preparing.
- `officialHandoff`: the handoff posture for user/operator action outside the product.

This separation prevents a workflow-ready matter from being misread as filed, submitted, or officially accepted.

## Deterministic vs guarded insertion points

The model encodes deterministic structures where the roadmap is settled:

- source-linked arrears facts
- controlled workflow states
- reviewable notice-draft packaging
- explicit warning, slowdown, and referral surfaces

The following areas are represented as guarded insertion points and must not be collapsed into silent success logic:

- mixed-claim routing
- evidence timing doctrine
- hand-service proof sufficiency
- privacy retention mechanics
- authenticated portal behavior

Guarded areas should flow through `ReferralFlag`, workflow slowdown states, unresolved draft issue lists, and audit logging until later doctrine or product decisions are extracted.
