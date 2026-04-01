# Arrears MVP Architecture Overview

This note describes the current Phase 4A arrears MVP build surface in this repo. It explains what is settled enough to build against, what remains guarded, and where later blocker outputs should attach. It does not authorize filing, portal parity, official submission, or final legal wording.

See also:

- `docs/architecture/arrears-mvp-spine.md`
- `docs/architecture/repo-boundaries.md`
- `docs/architecture/output-handoff-evidence-shells.md`
- `docs/specs/non-blocked-dependency-map.md`

## Phase-scoped posture

- Scope is Victoria-only, arrears-first, and limited to the `ARREARS_TO_NOTICE_READINESS` lane.
- The MVP terminus is `NOTICE_READY_FOR_REVIEW` plus reviewable output or handoff guidance.
- `forumPath`, `outputMode`, and `officialHandoff` are separate state dimensions on purpose.
- Authenticated official-channel behavior remains handoff-only in detail.
- Guarded doctrine stays visible as warnings, slowdown states, referrals, unresolved issues, and audit entries.

## One-capture spine

The current implementation follows a one-capture spine:

1. Capture tenancy, party, property, ledger, source, notice, service, and evidence records in shared domain entities.
2. Anchor workflow coordination on `Matter`, while keeping fine-grained `workflowState` separate from coarse `status`.
3. Reuse the same captured facts for arrears calculation, timeline placeholders, notice-readiness checks, output selection, handoff guidance, evidence review, and audit recording.
4. Carry unresolved doctrine forward as visible controls instead of branching into silent success logic.

There is no separate filing model, portal model, or output-only data model. The same matter spine feeds printable output, prep-pack output, and official handoff guidance without implying that any official action has occurred.

## Module map

| Path | Current responsibility | Must not imply |
| --- | --- | --- |
| `docs/architecture` | Build-facing repo posture and boundary notes | Final doctrine or future-state design |
| `docs/specs` | Phase-scoped specs and blocker maps | Settled architecture by accident |
| `docs/decisions` | Short records for settled choices only | Guarded work that is still unresolved |
| `src/domain` | Core entities, enums, separation validators, guarded insertion-point constants | Workflow orchestration, app logic, or UI logic |
| `src/workflow` | Hero workflow states and workflow guardrails | Filing behavior or app/UI coupling |
| `src/modules/arrears` | Deterministic arrears calculation shell and threshold gate | Final doctrine beyond current shell inputs |
| `src/modules/timeline` | Threshold-driven milestone shell and reminder hooks | Final evidence or hearing sequencing |
| `src/modules/notice-readiness` | Deterministic blockers plus guarded review hooks for notice progression | Final legal wording, legal advice, or mixed-claim resolution |
| `src/modules/output` | Output selection and package shells | Official submission or accepted filing state |
| `src/modules/handoff` | Official handoff guidance shell and boundary codes | Portal execution or portal mimicry |
| `src/modules/touchpoints` | Placeholder touchpoint registry and carry-forward controls | Freshness assumptions or authenticated automation |
| `src/modules/evidence` | Local evidence validation and evidence item shells | Final retention policy or official upload truth |
| `src/modules/audit` | Audit event creation and in-memory recording | Hidden doctrine or silent state transitions |
| `tests` | Regression coverage for the current posture | Product doctrine source of truth |

## Domain model

The main domain shapes live in `src/domain/model.ts` and `src/domain/preparation.ts`.

- Aggregate anchor: `Matter` is the workflow coordination record. `ArrearsMatterAggregate` is the current bundle shape for matter-linked data.
- Capture entities: `Property`, `Party`, `Tenancy`, and `SourceReference` hold the shared factual spine.
- Ledger entities: `RentCharge`, `PaymentRecord`, and `ArrearsStatus` support deterministic arrears calculation.
- Preparation-separation entities: `ForumPathState`, `OutputModeState`, and `OfficialHandoffStateRecord` keep forum path, output mode, and official handoff independent.
- Notice-preparation entities: `PriorNoticeRecord`, `NoticeDraft`, and `ServiceEvent` support reviewable notice preparation without final doctrine lock-in.
- Governance entities: `RoutingDecision`, `ReferralFlag`, `OutputPackage`, `EvidenceItem`, `AuditLogEntry`, and `PaymentPlanRecord` carry forward warnings, referrals, output packaging, evidence review, and traceability.

Contributor rule: extend these shapes by preserving separation. Do not flatten `forumPath`, `outputMode`, and `officialHandoff` into one status or one enum.

## Workflow state model

`src/workflow/arrearsHeroWorkflow.ts` defines the current hero workflow:

| Workflow state | Meaning now | Guarded seam that stays visible |
| --- | --- | --- |
| `INTAKE_OPEN` | Matter exists and baseline capture is underway | Missing or contradictory inputs move to controlled pause |
| `INTAKE_INCOMPLETE` | Intake pause for fact gaps or privacy-handling gaps | Privacy handling is not silently solved here |
| `TRIAGE_READY` | Enough facts exist to classify the matter into the arrears lane | Mixed-claim signals branch to slowdown or referral |
| `TRIAGE_SLOWDOWN` | In-scope-looking matter with blocker-dependent issues | Service-proof, evidence-timing, and portal seams stay guarded |
| `ARREARS_FACTS_READY` | Arrears facts are source-linked and reviewable | Prior notice and timing doctrine are still not final |
| `ARREARS_FACTS_GUARDED` | Arrears basis exists but guarded assumptions are active | Mixed-claim and service-proof issues remain visible |
| `NOTICE_DRAFTING_READY` | Draft package can be assembled for review | Final legal wording remains unresolved |
| `NOTICE_DRAFTING_GUARDED` | Drafting is possible but warnings or referrals must carry through | No filing behavior or portal mimicry |
| `NOTICE_READY_FOR_REVIEW` | MVP terminus for internal review or external handoff prep | Stop before filing or authenticated official-system use |
| `REFER_OUT` | Matter exceeds settled MVP scope | Referral is explicit, not implicit |
| `STOPPED_PENDING_EXTERNAL_INPUT` | Controlled halt pending outside input | Workflow does not guess past missing dependencies |

`Matter.status` remains a coarser reporting field (`INTAKE`, `TRIAGE`, `ARREARS_REVIEW`, `NOTICE_PREPARATION`, `NOTICE_READY`, `STOPPED`, `REFERRED`) and should not replace `workflowState`.

## Deterministic vs guarded control model

Settled deterministic controls in the current repo:

- `validatePreparationSeparation` enforces Victoria-only arrears posture and the separation of forum path, output mode, and official handoff.
- `src/modules/arrears` computes arrears amount, paid-to date, threshold state, and threshold moment from source-linked ledger inputs.
- `src/modules/notice-readiness` treats only settled mandatory fields as hard deterministic blockers.
- `src/modules/evidence` performs local file, size, naming, and attachment-separation checks.
- `src/modules/output` and `src/modules/handoff` select package shells without implying official submission.
- `src/modules/audit` preserves visible review and block events as explicit records.

Guarded areas in the current repo:

- mixed-claim routing
- evidence timing and deadline wording
- hand-service and service-proof sufficiency
- privacy retention and deletion mechanics
- authenticated portal behavior
- trust/copy validation outcomes that are not yet final

Guarded areas must stay visible through structures that already exist:

- `WorkflowNode.guardedInsertionPoints`
- `ReferralFlag`
- `NoticeDraft.unresolvedIssueIds`
- `NoticeReadinessIssue.guardedInsertionPoint`
- `UploadValidationIssue.guardedInsertionPoint`
- `CarryForwardControl`
- touchpoint classifications and handoff boundary codes

Do not convert guarded seams into booleans that silently pass.

## Blocker insertion points

Later blocker outputs should slot into the current spine without changing its boundaries:

- `BR01 matrix`: plug into triage routing, notice-readiness mixed-claim handling, and referral/routing decision assemblers. Keep unresolved cases reviewable instead of auto-routed.
- `BR02 operating table`: plug into versioned rule inputs for arrears, timeline, and notice-readiness adapters. Only settled rows should become deterministic checks.
- `BR03 touchpoint register`: replace placeholder touchpoint metadata in `src/modules/touchpoints` and flow through existing carry-forward-control merge points in output and handoff.
- `AG-BR04A outputs`: fill output package content and privacy/retention handling hooks in output, evidence, and audit shells without changing the prep-and-handoff boundary.
- `BR05 trust/copy validation outcomes`: bind approved wording to existing section keys, block keys, and boundary codes rather than changing workflow meaning or product scope.

For the blocker-by-blocker map, see `docs/specs/non-blocked-dependency-map.md`.

## Contributor guidance

- Build against the settled spine first: `src/domain`, `src/workflow`, and the current modules are the source of truth for shape and boundaries.
- Put blocker-dependent doctrine behind explicit adapters, data tables, or specs. Do not scatter it through modules as ad hoc conditionals.
- Keep official handoff separate from workflow readiness and separate from output mode.
- Treat placeholder touchpoints, timeline milestones, and guarded review hooks as intentional seams, not missing polish.
- If a product or doctrine choice becomes settled, move it into `docs/decisions` or deterministic code deliberately instead of rewriting history in place.
