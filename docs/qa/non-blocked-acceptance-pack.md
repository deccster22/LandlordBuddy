# Non-blocked Acceptance Pack

This pack defines build-facing acceptance criteria for the current arrears-first, non-blocked MVP spine. It is intentionally narrow. It makes current deterministic expectations testable, keeps guarded seams explicit, and refuses to turn blocked doctrine into false-green acceptance rules.

## Acceptance boundaries

- Scope is Victoria-only and limited to the arrears-to-notice-readiness lane.
- Passing this pack means the repo preserves deterministic versus guarded separation for the current spine.
- Passing this pack does not mean official filing, portal parity, legal judgement, final wording, or blocker doctrine has been solved.
- If a criterion depends on blocked doctrine, it must be tagged as warning, slowdown, referral, or placeholder instead of pass/fail logic.

## Module acceptance criteria

### Domain model

Acceptance criteria:

- `Matter` preserves separate `forumPath`, `outputMode`, and `officialHandoff` state objects; the repo does not flatten them into a single status field.
- `validatePreparationSeparation` rejects out-of-lane or boundary-breaking state, including unresolved forum paths marked as `IN_SCOPE_CONFIRMED`, output modes that imply official submission, or handoff states that imply product execution.
- Shared entities exist for referral flags, routing decisions, prior notices, service events, evidence items, payment plans, audit log entries, and source references so guarded work can be attached visibly.
- `GUARDED_INSERTION_POINTS` stays populated for mixed claims, evidence timing, hand-service proof, proof-linkage review, privacy retention, portal behavior, and touchpoint freshness.

Blocked areas for this module:

- final mixed-claim routing logic
- final privacy retention and deletion mechanics
- authenticated portal behavior beyond handoff metadata

### Workflow state shell

Acceptance criteria:

- The hero workflow terminates at `NOTICE_READY_FOR_REVIEW`, `REFER_OUT`, or `STOPPED_PENDING_EXTERNAL_INPUT`; no filed, submitted, or portal-executed state is introduced.
- Slowdown and guarded states remain explicit, including `TRIAGE_SLOWDOWN`, `ARREARS_FACTS_GUARDED`, and `NOTICE_DRAFTING_GUARDED`.
- Workflow guardrails continue to expose mixed-claim referral posture, evidence-timing slowdown, hand-service slowdown, and portal-handoff-only warning posture.
- `Matter.status` remains a coarse reporting field and does not replace `workflowState`.

Blocked areas for this module:

- automated mixed-claim routing matrix
- final evidence timing doctrine
- portal execution or mimicry

### Arrears and timeline shell

Acceptance criteria:

- Valid arrears inputs compute a deterministic arrears shell that includes outstanding amount, overdue charge IDs, unapplied payment IDs, days in arrears, threshold state, rule version, and threshold moment where available.
- Invalid or incomplete arrears inputs return a provisional shell with `BLOCKED_INVALID` threshold posture and visible reasons.
- The no-early-notice gate remains closed unless the threshold shell is met.
- The timeline always emits the current milestone categories: `ARREARS_THRESHOLD`, `NOTICE`, `PAYMENT_PLAN`, `EVIDENCE`, and `HEARING`.
- `PAYMENT_PLAN`, `EVIDENCE`, and `HEARING` remain guarded placeholders. Their presence is required; their final doctrine is not.
- Payment-plan handling is modelled as a timeline branch and reminder hook, not as a finalized exception rule.

Blocked areas for this module:

- final payment-plan timing or exception doctrine
- final evidence deadline wording
- final hearing sequencing or official date logic

### Notice-readiness shell

Acceptance criteria:

- `valid` is possible only when threshold posture is `threshold_met`, all mandatory unpaid-rent fields are present, `interstateRouteOut` is false, and guarded hooks are cleared or not applicable.
- Missing arrears amount, paid-to date, notice number, service method, or threshold confirmation produces a `hard stop` with field-specific issue codes.
- Interstate route-out remains a hard stop for the standard in-scope unpaid-rent path and sets `routeOut: true`.
- Guarded service-proof issues, mixed-claim interaction, and hand-service review do not silently pass; they remain `slowdown/review` issues.
- Guarded documentary completeness remains visible as a `warning` instead of becoming false-green success logic.
- Stronger outcomes outrank weaker ones, but summaries still retain the lower-severity counts.

Blocked areas for this module:

- final service-proof sufficiency doctrine
- final mixed-claim interaction routing
- final evidence completeness doctrine beyond the current shell
- final notice wording or legal-advice behavior

### Output and handoff framework

Acceptance criteria:

- Output selection preserves separate `forumPath`, `outputMode`, and `officialHandoff` posture throughout package generation.
- Generated output remains limited to `PRINTABLE_OUTPUT`, `PREP_PACK_COPY_READY`, or `OFFICIAL_HANDOFF_GUIDANCE`.
- Every generated package keeps `officialSystemAction: NOT_INCLUDED`.
- Official handoff guidance always carries boundary codes that preserve prep-and-handoff only posture and no portal mimicry.
- Touchpoint metadata and carry-forward controls propagate into output selection and handoff guidance instead of being dropped.
- Referral-severity controls cause handoff guidance to render a referral stop block rather than implying a normal official path.

Blocked areas for this module:

- authenticated portal parity or automation
- official submission, filing, or acceptance state
- final touchpoint registry detail pending later blocker output

### Evidence and audit shell

Acceptance criteria:

- Local evidence validation blocks unsupported file types and invalid sizes.
- Filename normalization and filename clarity checks remain visible in validation output.
- Attachment separation and proof linkage remain explicit review surfaces instead of silent assumptions.
- `LOCAL_VALIDATION_READY` means local-only validation passed only; it does not imply official upload or evidentiary sufficiency.
- Created evidence items preserve privacy class, retention class, hold status, source sensitivity, upload status, validation flags, and linked audit IDs.
- Audit events preserve timestamp, actor, matter ID, subject, severity, outcome, metadata, and source-reference linkage when supplied.
- Audit event names remain stable in `DOMAIN:ACTION` format.

Blocked areas for this module:

- final retention engine behavior
- final hand-service proof sufficiency
- official upload truth or portal-status behavior
- final trust-copy behavior around privacy and evidence framing

## Auditability and source-sensitivity gates

Before this packet can be treated as accepted, Product and QA should confirm the checklist in `docs/qa/auditability-checklist.md` still matches the implementation.

## Packet completion gate

This acceptance pack is satisfied only when all of the following are true:

- the deterministic controls listed in `docs/qa/control-inventory.md` remain testable in the current repo
- guarded areas are explicitly classified and not omitted
- blocked items remain listed module by module
- `npm run verify` passes

### BR02 registry-first scaffold

Acceptance criteria:

- `src/modules/br02` preserves registry-first definitions for date rules, service methods, validator severities, evidence timing precedence, freshness monitors, audit shape, and QA inventory hooks.
- `src/domain/model.ts` preserves BR02-capable shared object shapes for `ServiceEvent`, `ConsentProof`, and `EvidenceTimingState` without flattening them into prose-only notes.
- One service-event row is modeled per renter per attempt.
- Consent proof remains standalone and reusable per renter/scope variation.
- Registered post remains the preferred deterministic postal path.
- Email service requires linked consent proof before deterministic handling.
- Hand service remains guarded and reviewable.
- Evidence timing remains dual-step plus override, and the 7-day step is modeled as prep structure rather than fake universal deadline truth.
- Freshness and stale-state posture remain structural and non-authoritative when stale.
- BR02 audit events and QA hooks stay explicit and source-linkable.

Blocked areas for this module:

- final hand-service proof sufficiency doctrine
- final hearing-specific timing variance doctrine
- live official refresh cadence for registered-post assumptions
- portal-specific implementation details
