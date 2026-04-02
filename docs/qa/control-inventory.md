# Non-blocked Control Inventory

This inventory turns the current repo spine into QA-visible control classes for the arrears-first MVP. It is constrained to the accepted non-blocked posture represented in the repo and task packet. It does not settle blocker doctrine that has not yet been extracted into deterministic repo rules.

## Control handling rules

- Deterministic rules may produce pass/fail invariants now.
- Guarded areas must be classified as `warning`, `slowdown/review`, `referral`, or `placeholder`.
- No control in this pack implies official filing, portal parity, legal judgement, or final doctrine wording.
- In the current notice-readiness shell, `hard stop` outranks `slowdown/review`, which outranks `warning`, but lower-severity issues still remain counted and visible.

## Deterministic rule inventory

| Rule | Current module surface | Testable invariant | Current QA anchor |
| --- | --- | --- | --- |
| Arrears threshold shell | `src/modules/arrears/index.ts` | With valid single-tenancy, single-currency ledger inputs plus a threshold rule, the shell computes `outstandingAmount`, `overdueChargeIds`, `unappliedPaymentIds`, `daysInArrears`, `thresholdState`, `ruleVersion`, and `thresholdMoment`. When core inputs are insufficient, it returns `calculationConfidence: PROVISIONAL` and `thresholdState.kind: BLOCKED_INVALID` with reasons. | `tests/arrears-shell.test.ts` |
| No-early-notice gate | `src/modules/timeline/index.ts` | `noEarlyNoticeGate.canPrepareNotice` is `true` only when `thresholdState.kind === THRESHOLD_MET`. It remains `false` for `BELOW_THRESHOLD` and `BLOCKED_INVALID`, with a visible reason string. | `tests/arrears-shell.test.ts` |
| Mandatory unpaid-rent notice fields | `src/modules/notice-readiness/index.ts` | Missing `arrearsAmount`, `paidToDate`, `noticeNumber`, or `serviceMethod` produces a `hard stop` issue with a field-specific code and keeps `noDeterministicFailures` false. | `tests/notice-readiness.result.test.ts` |
| Interstate hard stop | `src/modules/notice-readiness/index.ts` | `interstateRouteOut: true` produces `outcome: REFER_OUT`, keeps `noDeterministicFailures: false`, and keeps `readyForProgression: false`. | `tests/notice-readiness.result.test.ts` |
| Payment-plan timing branch as a modelled state/input rule | `src/modules/timeline/index.ts` | The timeline always emits a `PAYMENT_PLAN` milestone as a `GUARDED_PLACEHOLDER`. Its status tracks threshold input posture: `PENDING` when non-blocked but unresolved, `BLOCKED` when arrears inputs are invalid. This is a deterministic shell rule, not a deterministic payment-plan doctrine rule. | `tests/arrears-shell.test.ts` |
| Forum-path, output-mode, and official-handoff separation | `src/domain/preparation.ts`, `src/domain/model.ts`, `src/modules/output/index.ts`, `src/modules/handoff/index.ts` | A matter must carry `forumPath`, `outputMode`, and `officialHandoff` as separate state objects. Output mode must preserve `NO_OFFICIAL_SUBMISSION`; handoff must preserve `PREP_AND_HANDOFF_ONLY`; authenticated touchpoint posture must match the handoff stage. | `tests/arrears-spine.test.ts`, `tests/output-handoff.framework.test.ts` |
| Output and handoff boundary posture | `src/modules/output/index.ts`, `src/modules/handoff/index.ts` | Generated packages are limited to `PRINTABLE_OUTPUT`, `PREP_PACK_COPY_READY`, or `OFFICIAL_HANDOFF_GUIDANCE`, and every package sets `officialSystemAction: NOT_INCLUDED`. Handoff guidance always carries prep-and-handoff boundary codes. | `tests/output-handoff.framework.test.ts` |
| Local evidence file validation structure | `src/modules/evidence/index.ts` | Unsupported MIME types and invalid sizes block local validation. Filename clarity, attachment separation, and service-proof linkage remain visible issues instead of silent assumptions. `LOCAL_VALIDATION_READY` means local checks passed only. | `tests/evidence-audit.framework.test.ts` |

## Hard-stop inventory

| Control | Trigger now | Required system posture |
| --- | --- | --- |
| `BLOCKED_INVALID` arrears shell | Missing threshold rule, empty charge set, invalid calculation timestamp, mixed tenancy, or mixed currency inputs | Return provisional arrears shell output with visible reasons. Do not treat the matter as threshold-eligible. |
| `ARREARS_BELOW_THRESHOLD` | Notice-readiness input says `below_threshold` | Block standard unpaid-rent notice progression. |
| `ARREARS_THRESHOLD_UNCONFIRMED` | Threshold input is absent or `blocked_invalid` at notice-readiness time | Block standard notice progression until threshold posture is explicit. |
| `MISSING_ARREARS_AMOUNT` | `arrearsAmount` absent or non-numeric | Block notice readiness. |
| `MISSING_PAID_TO_DATE` | `paidToDate` absent or blank | Block notice readiness. |
| `MISSING_NOTICE_NUMBER` | `noticeNumber` absent or blank | Block notice readiness. |
| `MISSING_SERVICE_METHOD` | `serviceMethod` absent or blank | Block notice readiness. |
| `INTERSTATE_ROUTE_OUT` | `interstateRouteOut: true` | Stop the in-scope Victorian unpaid-rent path and keep route-out explicit. |
| `UNSUPPORTED_FILE_TYPE` | Evidence candidate MIME type is not in the local allow-list | Set `acceptedLocally: false` and `uploadStatus: LOCAL_VALIDATION_BLOCKED`. |
| `INVALID_FILE_SIZE` | Evidence candidate size is zero, negative, or above the local size limit | Set `acceptedLocally: false` and `uploadStatus: LOCAL_VALIDATION_BLOCKED`. |

## Warning inventory

| Control | Surface | Why it stays a warning |
| --- | --- | --- |
| `DOCUMENTARY_EVIDENCE_GUARDED` | Notice-readiness | Documentary completeness is not settled enough to become a hard deterministic blocker in this MVP shell. |
| `UNCLEAR_FILE_NAME` | Evidence validation | Poor filenames reduce reviewability but do not, by themselves, justify silent rejection. |
| `ATTACHMENT_SEPARATION_REVIEW` | Evidence validation | Attachment separation must stay visible for review instead of being silently assumed. |
| `PUBLIC_FORM_WARNING` | Touchpoint carry-forward control | Public-form preparation can continue only with visible warning and human review. |
| `FRESHNESS_SENSITIVE_SURFACE` | Touchpoint carry-forward control | Freshness-sensitive surfaces require a current check before reliance. |
| `PORTAL_HANDOFF_ONLY` | Workflow guardrail | Authenticated portal behavior is represented as a boundary warning, not a product-executed step. |

## Slowdown or review inventory

| Control | Surface | Required posture now |
| --- | --- | --- |
| `SERVICE_PROOF_GUARDED` | Notice-readiness | Keep service-proof sufficiency in review; do not auto-pass notice readiness. |
| `HAND_SERVICE_REVIEW_GUARDED` | Notice-readiness | Hand delivery remains operator-reviewable until doctrine is settled. |
| `MIXED_CLAIM_ROUTING_GUARDED` | Notice-readiness | Preserve the mixed-claim seam visibly; do not finalize routing in this validator. |
| `PROOF_LINKAGE_REVIEW` | Evidence validation | Local evidence can be stored, but proof linkage must remain explicitly reviewable. |
| `AUTHENTICATED_TOUCHPOINT_HANDOFF_ONLY` | Output or handoff carry-forward control | Keep authenticated surfaces outside product execution and in the handoff lane only. |
| `EVIDENCE_TIMING_GUARDED` | Workflow guardrail | Evidence timing doctrine remains unresolved and should slow progression, not silently pass. |
| `HAND_SERVICE_STANDARD_GUARDED` | Workflow guardrail | Hand-service proof standards remain unsettled and must stay reviewable. |

## Referral inventory

| Control | Surface | Required posture now |
| --- | --- | --- |
| `MIXED_CLAIM_GUARDED` | Workflow guardrail, future referral flags, handoff guidance carry-forward | Treat mixed-claim routing as referral-capable, not settled product routing. |
| `REFER_OUT` workflow state | `src/workflow/arrearsHeroWorkflow.ts` | Use when a guarded issue reaches referral severity or the matter exceeds settled MVP scope. |
| `referral-stop` guidance block | `src/modules/handoff/index.ts` | When referral-severity controls are present, handoff guidance must render a referral stop instead of implying normal progression. |

## Explicit non-inventory items

These remain intentionally outside deterministic pass or fail criteria in this pack:

- final mixed-claim acceptance rules
- final evidence deadline wording tests
- hand-service proof sufficiency thresholds
- authenticated portal behavior beyond handoff-only posture
- privacy retention engine behavior pending `AG-BR04A`
- final trust-copy and pricing validation outcomes

