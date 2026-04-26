# P4B-CX-BR02-16 RuntimeBridge Payment-Plan Sign-Off Note

## Scope of this note

This note documents the BR02 runtimeBridge threading control added in `P4B-CX-BR02-16`.
It is implementation-facing and does not change user-facing copy, legal posture, or handoff semantics.

## What changed

- `src/modules/br02/runtimeBridgeThreading.ts` now defines a narrow threading decision for BR02 assessment call sites.
- `src/modules/br02/index.ts` now exposes `runtimeBridgeThreading` on `assessBr02ServiceEvent(...)` output, plus `deriveBr02RuntimeBridgeThreadingForAssessment(...)` for explicit call-site decisions.
- Main BR02 downstream call sites can now use `assessment.runtimeBridgeThreading.downstreamInputs`, which always carries `br02ConsumerAssessment` and threads `br02RuntimeBridge` only when safe or explicitly sign-off accepted.

## Payment-plan conservative posture and sign-off gate

- Conservative branch codes are:
  - `PAYMENT_PLAN_MINIMUM_WINDOW_PENDING`
  - `PAYMENT_PLAN_REVIEW_REQUIRED`
- When either branch code is present, runtimeBridge threading requires explicit sign-off acceptance.
- Without sign-off acceptance, the threading decision withholds `br02RuntimeBridge` and keeps downstream parity on `br02ConsumerAssessment`.

## Why this is conservative

- RuntimeBridge includes payment-plan timing posture that is intentionally stricter than legacy consumer-only downstream behavior in unresolved payment-plan branches.
- Withholding bridge threading by default in those branches avoids accidental readiness tightening without explicit product acceptance.

## Risk if this control is wrong

- If conservative payment-plan posture is silently applied everywhere, downstream readiness could tighten without explicit product approval.
- If conservative posture is ignored after explicit sign-off, review-required payment-plan seams could be under-surfaced.

## Revisit trigger before wider adoption

Broader runtimeBridge-default adoption should happen only after Product explicitly accepts payment-plan conservative behavior for unresolved branches and confirms downstream readiness posture impacts across workflow, output, and handoff surfaces.
