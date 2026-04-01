# Auditability And Source-Sensitivity Checklist

This checklist is for QA and Product review of the current non-blocked implementation spine. It is a review scaffold, not a new feature spec.

## Auditability checklist

### Cross-cutting

- Confirm every deterministic rule has a stable input shape, output shape, and visible reason or issue code when it fails.
- Confirm every guarded area is represented as a warning, slowdown/review, referral, or placeholder instead of disappearing into success.
- Confirm no module implies filing, submission, portal parity, or legal judgement.
- Confirm blocked doctrine is attached to explicit seams such as issue codes, carry-forward controls, guarded insertion points, referral flags, placeholder milestones, or handoff boundary codes.

### Domain and workflow

- Confirm `Matter` retains separate `forumPath`, `outputMode`, and `officialHandoff` fields.
- Confirm workflow still stops at review or handoff posture and does not introduce a filed state.
- Confirm guarded insertion points and workflow guardrails remain enumerated rather than implied.
- Confirm referral and stop states remain explicit control surfaces.

### Arrears and timeline

- Confirm arrears outputs retain `asAt`, threshold reasons, rule version, and threshold posture.
- Confirm provisional arrears results remain visibly provisional when inputs are insufficient.
- Confirm the no-early-notice gate records why notice preparation is or is not available.
- Confirm placeholder milestones remain present for payment-plan, evidence, and hearing seams.

### Notice-readiness

- Confirm every issue retains a stable `code`, `category`, `field`, `message`, and `outcome`.
- Confirm `deterministicPass`, `routeOut`, and summary counts remain derivable from the issues list rather than hidden state.
- Confirm guarded insertion-point text is retained for guarded issues.
- Confirm hard-stop posture does not erase warning or slowdown visibility.

### Output and handoff

- Confirm output packages retain `forumPath`, `outputMode`, `officialHandoff`, `touchpoints`, and `carryForwardControls`.
- Confirm `officialSystemAction` remains `NOT_INCLUDED` in every generated package.
- Confirm handoff guidance retains boundary codes and guidance blocks for authenticated surfaces, freshness checks, slowdown, and referral where present.
- Confirm touchpoint-derived controls are merged rather than lost.

### Evidence and audit

- Confirm evidence items retain normalized filename, upload status, validation flags, privacy class, retention class, hold status, and source sensitivity.
- Confirm local validation outcomes distinguish blocked-local issues from review-required issues.
- Confirm audit events retain matter linkage, subject linkage, severity, outcome, and metadata.
- Confirm local validation and audit recording do not imply official acceptance.

## Source-sensitivity checklist

The repo currently carries two related concepts that QA should keep separate:

- `VisibleSourceType` explains what kind of rule or touchpoint a control comes from.
- `SourceSensitivity` explains how sensitive a captured source or evidence item may be.

### Visible source type checks

| Visible source type | QA expectation |
| --- | --- |
| `STABLE_RULE` | May support deterministic pass or fail logic if the invariant is implemented and tested. |
| `OFFICIAL_GUIDANCE` | May support preparation or warning-bearing output, but should not be treated as official submission truth or final legal judgement. |
| `LIVE_PORTAL_OR_FORM_BEHAVIOR` | Must remain handoff-only, freshness-aware, and outside product execution. |
| `UNRESOLVED_ITEM` | Must remain warning, slowdown, referral, or placeholder only. |

### Source sensitivity checks

| Source sensitivity | QA expectation |
| --- | --- |
| `LOW` | May stay in standard MVP handling, but still needs source-reference traceability where the module supports it. |
| `PERSONAL` | Must keep explicit privacy and review posture visible; do not assume a final retention engine exists. |
| `SPECIAL_CATEGORY` | Treat as review-sensitive; do not infer automatic downstream use or relaxed handling. |
| `LEGAL_PRIVILEGE_CANDIDATE` | Treat as review-sensitive and non-automatic; do not convert into silent workflow permission. |

### Evidence classification checks

- Confirm evidence items keep `privacyClass`, `retentionClass`, `holdStatus`, and `sourceSensitivity` as separate fields.
- Confirm `UNCLASSIFIED_PENDING_POLICY` remains visible when retention policy is not yet settled.
- Confirm `REVIEW_REQUIRED` hold or retention posture is not rewritten into success copy.
- Confirm any future external-upload state is kept separate from local validation state.

## Blocked areas that this checklist must not convert into acceptance truth

- mixed-claim doctrine
- evidence deadline doctrine
- hand-service proof sufficiency
- authenticated portal behavior beyond handoff-only posture
- privacy retention engine behavior pending `AG-BR04A`
- final trust-copy behavior
