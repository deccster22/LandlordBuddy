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

## Non-goals preserved

- No portal submission logic or portal mimicry.
- No final hand-service sufficiency doctrine.
- No final hearing-notice variance doctrine.
- No flattening of generic timing surfaces into one universal truth.
- No implication of official filing, acceptance, or legal certainty.
