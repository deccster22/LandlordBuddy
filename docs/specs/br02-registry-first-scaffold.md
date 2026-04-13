# BR02 Registry-First Scaffold

This spec anchors the Phase 4B BR02 scaffold now present in `src/modules/br02` and the shared BR02-capable domain shapes in `src/domain/model.ts`.

## Scope

- Registry-first definitions for date rules, service methods, validator severities, evidence timing precedence, and freshness monitors.
- Object models for service-event rows, consent proof records, evidence timing state, and BR02 audit events.
- QA inventory hooks that map the current scaffold to deterministic and guarded acceptance checks.

## Structural posture

- One service-event row is modeled per renter per service event or attempt.
- Consent proof is modeled separately from service events so it can be reused per renter and scope variation.
- Registered post is the preferred deterministic postal path.
- Email service is deterministic only when linked consent proof exists.
- Hand service stays guarded and reviewable.
- Evidence timing remains dual-step plus hearing-specific override priority.
- The 7-day step is a required prep step only and must not be rendered as universal deadline truth.
- Freshness monitors keep timing and registered-post surfaces explicitly non-authoritative when stale.

## Consumer layer

- `src/modules/br02/consumer.ts` now consumes the accepted scaffold into notice-eligibility, service-proof, termination-date, and evidence-deadline results.
- The legacy service-event assessor in `src/modules/br02/index.ts` now carries a nested `consumerAssessment` bundle so the older seam can expose the new consumer layer without collapsing the existing shape.
- `src/workflow/arrearsHeroWorkflow.ts`, `src/modules/output/index.ts`, and `src/modules/handoff/index.ts` now thread the nested `consumerAssessment` bundle through a BR02 downstream bridge when notice-readiness is not already present. `src/modules/output/index.ts` and `src/modules/handoff/index.ts` can now accept a nested `br02ConsumerAssessment` directly, while the older `br02Assessment` shell remains available for compatibility.
- The legacy top-level `readyForDeterministicDateHandling` flag remains compatibility only. It is still exposed for bridge checks, but it is no longer the sole downstream decision surface or the preferred input for consequential downstream gating.
- Hearing-specific deadlines continue to outrank generic timing when a hearing reference is available.
- Hand-service proof remains review-led and guarded; this consumer layer does not settle final sufficiency doctrine.

## Non-goals preserved

- No portal submission logic or portal mimicry.
- No final hand-service sufficiency doctrine.
- No final hearing-notice variance doctrine.
- No flattening of generic timing surfaces into one universal truth.
- No implication of official filing, acceptance, or legal certainty.
