# P4C-CX-APP-01 Thin App Screen And Form Contract Pack

Date: 2026-04-23
Task ID: P4C-CX-APP-01
Phase posture: Phase 4B remains primary; this is bounded parallel Phase 4C contract-layer work.

This pack defines implementation-facing screen and form contracts for the thin `src/app` layer that composes existing `src/domain`, `src/workflow`, and `src/modules` surfaces.

It does not introduce new doctrine, state families, or runtime rule expansions.

## 1. Contract Scope And Guardrails

Guardrails preserved:

- preparation remains separate from official action
- official handoff remains external
- deterministic and guarded controls remain visibly separate
- stale, live-confirmation-required, wrong-channel-reroute, and referral-first remain distinct interruption families
- lane 2 semantics remain implementation-fidelity only
- lane 4 control posture remains implementation-fidelity only
- no portal mimicry, filing implication, compliance-clearance implication, or legal-advice behavior

Explicit fences carried into the app contract layer:

- `Prepared for handoff` is a rendering rule only, not a new state family
- reminder support is allowed; compliance certification is not
- bond-paid status is factual visibility only, not legal sufficiency
- notes/inspections/maintenance remain chronology and recordkeeping, not adjudication
- export/document bundle surfaces remain packaging/records, not filing or legal readiness

## 2. Thin App Contract Primitives

### 2.1 App surface families

| Surface family code | Meaning | Primary consumers |
| --- | --- | --- |
| `SHELL_CONTINUITY_SURFACE` | bounded shell continuity views around the hero wedge | account/profile, property, tenancy, active matters, current matter |
| `MATTER_LAUNCHER_SURFACE` | shell-to-hero entry/resume router | matter launcher panel and related resume actions |
| `HERO_CAPTURE_SURFACE` | consequential capture/validation steps in hero flow | matter creation, intake, threshold, notice prep, service/evidence |
| `REVIEW_AND_OUTPUT_SURFACE` | consequential local review and packaging | output review and related checkpoints |
| `EXTERNAL_HANDOFF_SURFACE` | explicit external-action boundary guidance | official handoff surface |

### 2.2 App component families

| Component family | Contract role |
| --- | --- |
| `APP_FRAME` | top-level app shell layout and continuity slots |
| `CONTEXT_SUMMARY_CARD` | non-authoritative context summaries (property/tenancy/matter) |
| `WORKFLOW_STEP_FORM` | grouped field capture with required/optional/guarded handling |
| `INTERRUPTION_CARD` | visible blocked/guarded/stale/live/reroute/referral controls |
| `NEXT_ACTION_PANEL` | explicit next-action class and boundary owner |
| `DONE_FOR_NOW_CHECKPOINT` | pause/save/return control contract |
| `EXTERNAL_BOUNDARY_PANEL` | handoff boundary cues and external owner contract |

### 2.3 Next-action context classes (rendering and routing)

| Context class | Allowed next-action kinds | Boundary |
| --- | --- | --- |
| `IN_PRODUCT` | `ATTACH_REVIEW_STATE`, `RESOLVE_BLOCKER`, `COMPLETE_LOCAL_REVIEW`, `COMPLETE_GUARDED_REVIEW` | inside Landlord Buddy |
| `OFFICIAL_EXTERNAL` | `TAKE_EXTERNAL_OFFICIAL_STEP` | outside Landlord Buddy |
| `REFERRAL_EXTERNAL` | `REFER_OUTSIDE_STANDARD_PATH` and wrong-channel reroute stops | outside Landlord Buddy |

## 3. Shell Continuity And Launcher Entry/Resume Contract

### 3.1 Entry and resume route contract

| Route code | Entry source | Resolver input | Destination |
| --- | --- | --- | --- |
| `APP-ROUTE-01` | account/profile | boundary acknowledgement status | property/tenancy shell or active matters |
| `APP-ROUTE-02` | property or tenancy shell | selected tenancy/property and matter existence | matter launcher |
| `APP-ROUTE-03` | active matters/current matter | `Matter.workflowState` and `ReviewHandoffState.ownership.nextAction.kind` | mapped hero step or external stop surface |
| `APP-ROUTE-04` | output review/current matter | `OUT-03` done-for-now checkpoint | resume at last unresolved consequential step |
| `APP-ROUTE-05` | official handoff return | external action note/checkpoint and current handoff stage | current matter with explicit external dependency visibility |

### 3.2 Workflow-state to resume-screen mapping

| Workflow state | Resume screen |
| --- | --- |
| `INTAKE_OPEN` | `APP-SCR-07` matter creation if baseline links missing; otherwise `APP-SCR-08` arrears intake |
| `INTAKE_INCOMPLETE` | `APP-SCR-08` arrears intake |
| `TRIAGE_READY` | `APP-SCR-09` threshold check |
| `TRIAGE_SLOWDOWN` | `APP-SCR-09` threshold check with guarded slowdown interruption |
| `ARREARS_FACTS_READY` | `APP-SCR-10` notice preparation |
| `ARREARS_FACTS_GUARDED` | `APP-SCR-10` notice preparation with guarded interruptions |
| `NOTICE_DRAFTING_READY` | `APP-SCR-11` service/evidence capture |
| `NOTICE_DRAFTING_GUARDED` | `APP-SCR-11` service/evidence capture with guarded interruptions |
| `NOTICE_READY_FOR_REVIEW` | `APP-SCR-12` output review |
| `REFER_OUT` | `APP-SCR-13` official handoff in referral-external posture |
| `STOPPED_PENDING_EXTERNAL_INPUT` | last blocking hero screen checkpoint (`APP-SCR-08`, `APP-SCR-09`, `APP-SCR-10`, or `APP-SCR-11`) |

## 4. Screen Contract Inventory

Implementation status values:

- `CONTRACT_ONLY`: defined here only; app composition not implemented yet
- `LOGIC_READY_UI_PENDING`: lower-layer logic exists; app wiring/presentation pending

### APP-SCR-01 Account/Profile Shell Entry

- Purpose: establish profile continuity and mandatory prep-and-handoff boundary acknowledgement.
- Owning modules consumed: `src/domain/model.ts` entity primitives; `src/domain/preparation.ts` boundary states.
- Component family/surface type: `APP_FRAME`, `WORKFLOW_STEP_FORM` on `SHELL_CONTINUITY_SURFACE`.
- State families rendered: boundary acknowledgement captured/missing, non-consequential profile completeness.
- Warnings/interruptions rendered: boundary acknowledgement required before launcher entry.
- Trust cues required: prep-only and no-product-submission cues.
- Primary next action: `IN_PRODUCT`.
- Done-for-now/exit/return behavior: user may exit after saving `ACC-01` and `ACC-03`; resume returns to this screen until boundary acknowledgement is present.
- Persistence writes: profile draft fields (`ACC-*`) and boundary acknowledgement checkpoint.
- Resume reads: profile draft bundle plus boundary acknowledgement status.
- Placeholder/not-yet-implemented: app-layer profile persistence adapter remains `CONTRACT_ONLY`.

### APP-SCR-02 Property Shell View

- Purpose: capture and display property context that feeds tenancy and matter launcher.
- Owning modules consumed: `src/domain/model.ts` (`Property`, source references).
- Component family/surface type: `APP_FRAME`, `WORKFLOW_STEP_FORM`, `CONTEXT_SUMMARY_CARD` on `SHELL_CONTINUITY_SURFACE`.
- State families rendered: property completeness and route-out pre-check indicators.
- Warnings/interruptions rendered: source-reference missing warning; non-VIC route-out pre-check warning.
- Trust cues required: shell-support cue and no legal sufficiency implication.
- Primary next action: `IN_PRODUCT`.
- Done-for-now/exit/return behavior: save partial property draft and return with explicit missing required fields.
- Persistence writes: property draft (`PROP-*`), source-reference links.
- Resume reads: latest property draft and unresolved required-field list.
- Placeholder/not-yet-implemented: reminder panel hook is `CONTRACT_ONLY`.

### APP-SCR-03 Tenancy Shell View

- Purpose: capture tenancy, party, bond visibility, and reminder context before matter launch.
- Owning modules consumed: `src/domain/model.ts` (`Tenancy`, `Party`), `src/modules/arrears/index.ts` snapshot support.
- Component family/surface type: `APP_FRAME`, `WORKFLOW_STEP_FORM`, `CONTEXT_SUMMARY_CARD` on `SHELL_CONTINUITY_SURFACE`.
- State families rendered: tenancy completeness, renter linkage completeness, shell reminder status.
- Warnings/interruptions rendered: guarded reminder cautions; bond factual-visibility cue.
- Trust cues required: reminder-not-clearance cue and bond-factual-only cue.
- Primary next action: `IN_PRODUCT`.
- Done-for-now/exit/return behavior: tenancy and party rows save independently; resume remains on unresolved required group.
- Persistence writes: tenancy draft (`TEN-*`), party records (`REN-*`), shell context (`BOND-*`, `REM-*`).
- Resume reads: tenancy draft, party rows, reminder/bond context.
- Placeholder/not-yet-implemented: inspection and maintenance slots remain bounded and `CONTRACT_ONLY`.

### APP-SCR-04 Active Matters

- Purpose: list resumable matters with explicit next-action context and interruption badges.
- Owning modules consumed: `src/workflow/arrearsHeroWorkflow.ts`, `src/modules/output/rendererStateAdapter.ts`, `src/modules/handoff/reviewState.ts`.
- Component family/surface type: `APP_FRAME`, `CONTEXT_SUMMARY_CARD`, `NEXT_ACTION_PANEL`, `INTERRUPTION_CARD` on `SHELL_CONTINUITY_SURFACE`.
- State families rendered: `Matter.workflowState`, review/handoff readiness outcomes, next-action kind.
- Warnings/interruptions rendered: stale, live-confirmation-required, wrong-channel-reroute, referral-first as separate cards.
- Trust cues required: `Prepared for handoff` rendering-only cue and external-owner cue where applicable.
- Primary next action: `IN_PRODUCT`, `OFFICIAL_EXTERNAL`, or `REFERRAL_EXTERNAL` depending on matter.
- Done-for-now/exit/return behavior: resume selection writes a launcher checkpoint; return keeps filters and last-selected matter.
- Persistence writes: launcher decision (`MAT-06`) and selected matter context.
- Resume reads: matter list snapshots, renderer/review-handoff summaries, latest launcher decision.
- Placeholder/not-yet-implemented: list virtualization/sorting behavior is `CONTRACT_ONLY`.

### APP-SCR-05 Current Matter Home

- Purpose: expose one matter's continuity state, done-for-now checkpoint, and route to next consequential screen.
- Owning modules consumed: `src/workflow/arrearsHeroWorkflow.ts`, `src/modules/output/index.ts`, `src/modules/handoff/index.ts`, `src/modules/touchpoints/index.ts`.
- Component family/surface type: `APP_FRAME`, `CONTEXT_SUMMARY_CARD`, `NEXT_ACTION_PANEL`, `DONE_FOR_NOW_CHECKPOINT`, `INTERRUPTION_CARD` on `SHELL_CONTINUITY_SURFACE`.
- State families rendered: workflow state, review/handoff posture, next-action boundary, touchpoint freshness/channel posture.
- Warnings/interruptions rendered: blocked, guarded, stale, live confirmation, wrong-channel, referral-first kept distinct.
- Trust cues required: prep-and-handoff boundary, no product submission, no portal mimicry where relevant.
- Primary next action: context-derived (`IN_PRODUCT`, `OFFICIAL_EXTERNAL`, `REFERRAL_EXTERNAL`).
- Done-for-now/exit/return behavior: `OUT-03` checkpoint is required to pause consequential work and drives resume destination.
- Persistence writes: `OUT-03` done-for-now checkpoint, shell notes/docs links (`NOTE-*`, `DOC-*`).
- Resume reads: latest checkpoint bundle plus unresolved interruption codes.
- Placeholder/not-yet-implemented: shell chronology timeline panel remains `CONTRACT_ONLY`.

### APP-SCR-06 Matter Launcher

- Purpose: resolve start-new vs resume, objective capture, and route-out/referral preconditions.
- Owning modules consumed: `src/workflow/arrearsHeroWorkflow.ts`, `src/modules/br01/index.ts`, `src/modules/br02/downstream.ts`.
- Component family/surface type: `MATTER_LAUNCHER_SURFACE` with `WORKFLOW_STEP_FORM`, `NEXT_ACTION_PANEL`, and `INTERRUPTION_CARD`.
- State families rendered: launcher decision states, BR01 transition families, BR02 downstream gate summaries.
- Warnings/interruptions rendered: objective missing slowdown, route-out stop, referral-first stop, wrong-channel stop.
- Trust cues required: launcher is navigation only; no product execution cue.
- Primary next action: `IN_PRODUCT` unless route-out/referral triggers `REFERRAL_EXTERNAL`.
- Done-for-now/exit/return behavior: save launcher partials and unresolved objective/routing reasons for safe resume.
- Persistence writes: `MAT-01`..`MAT-07` launcher bundle and route rationale.
- Resume reads: launcher bundle, BR01/BR02 latest gating outputs, selected target screen.
- Placeholder/not-yet-implemented: deep-link resolver wiring to all hero screens is `CONTRACT_ONLY`.

### APP-SCR-07 Matter Creation (Hero Entry)

- Purpose: create matter baseline links and move workflow into intake.
- Owning modules consumed: `src/domain/model.ts` (`Matter`), `src/workflow/arrearsHeroWorkflow.ts`.
- Component family/surface type: `HERO_CAPTURE_SURFACE` with `WORKFLOW_STEP_FORM`.
- State families rendered: `INTAKE_OPEN`.
- Warnings/interruptions rendered: missing baseline link blockers and out-of-scope route-out interruption.
- Trust cues required: prep-only and no filing implication cues.
- Primary next action: `IN_PRODUCT`.
- Done-for-now/exit/return behavior: newly created matter can pause immediately and return to intake with baseline preserved.
- Persistence writes: matter identity and baseline source references (`MAT-01`, `MAT-02`, `MAT-07`).
- Resume reads: matter baseline and workflow state.
- Placeholder/not-yet-implemented: app-layer create-matter command adapter is `CONTRACT_ONLY`.

### APP-SCR-08 Arrears Intake

- Purpose: capture ledger facts and source traceability for threshold calculation.
- Owning modules consumed: `src/modules/arrears/index.ts`, `src/modules/timeline/index.ts`, `src/workflow/arrearsHeroWorkflow.ts`.
- Component family/surface type: `HERO_CAPTURE_SURFACE` with `WORKFLOW_STEP_FORM`, `INTERRUPTION_CARD`.
- State families rendered: `INTAKE_OPEN`, `INTAKE_INCOMPLETE`, `TRIAGE_READY`.
- Warnings/interruptions rendered: deterministic blockers for invalid/missing ledger minimums.
- Trust cues required: local validation-only cue.
- Primary next action: `IN_PRODUCT`.
- Done-for-now/exit/return behavior: each ledger row saves atomically; return preserves blocker reasons and partially completed rows.
- Persistence writes: `RentCharge` rows (`LED-01`..`LED-04`), `PaymentRecord` rows (`LED-05`..`LED-09`), arrears-as-at checkpoint (`LED-10`..`LED-12`).
- Resume reads: saved charge/payment rows, latest arrears shell result, blocking issues.
- Placeholder/not-yet-implemented: importer or bulk-ledger tooling remains out of scope.

### APP-SCR-09 Threshold Check

- Purpose: run no-early-notice gate and surface explicit threshold outcome.
- Owning modules consumed: `src/modules/arrears/index.ts`, `src/modules/br02/consumer.ts`, `src/workflow/arrearsHeroWorkflow.ts`.
- Component family/surface type: `HERO_CAPTURE_SURFACE` with `WORKFLOW_STEP_FORM`, `INTERRUPTION_CARD`, `NEXT_ACTION_PANEL`.
- State families rendered: `TRIAGE_READY`, `TRIAGE_SLOWDOWN`.
- Warnings/interruptions rendered: `BLOCKED_INVALID`, `BELOW_THRESHOLD`, guarded slowdown cards.
- Trust cues required: readiness-not-filing cue and threshold-shell-only cue.
- Primary next action: `IN_PRODUCT` or `REFERRAL_EXTERNAL` when route-out/referral gates are active.
- Done-for-now/exit/return behavior: threshold result and reasons are saved; return lands on threshold if unresolved.
- Persistence writes: `THR-01`..`THR-03` and threshold rule provenance.
- Resume reads: latest threshold state, reasons, and gate status.
- Placeholder/not-yet-implemented: threshold history comparison view remains `CONTRACT_ONLY`.

### APP-SCR-10 Notice Preparation

- Purpose: capture notice-prep fields and unresolved guarded issues before service/evidence stage.
- Owning modules consumed: `src/modules/notice-readiness/index.ts`, `src/modules/notice-draft/index.ts`, `src/modules/br01/downstream.ts`, `src/workflow/arrearsHeroWorkflow.ts`.
- Component family/surface type: `HERO_CAPTURE_SURFACE` with `WORKFLOW_STEP_FORM`, `INTERRUPTION_CARD`.
- State families rendered: `ARREARS_FACTS_READY`, `ARREARS_FACTS_GUARDED`, `NOTICE_DRAFTING_READY`, `NOTICE_DRAFTING_GUARDED`.
- Warnings/interruptions rendered: deterministic hard stops, guarded review slowdowns, referral/reroute stops.
- Trust cues required: review-before-official-step cue.
- Primary next action: `IN_PRODUCT` or `REFERRAL_EXTERNAL` depending on BR01/BR02 posture.
- Done-for-now/exit/return behavior: notice-prep draft fields save independently from readiness outcome.
- Persistence writes: notice draft (`NP-01`..`NP-07`) through `createNoticeDraftRecord` and unresolved issue list.
- Resume reads: latest notice draft, readiness issues, and guarded insertion flags.
- Placeholder/not-yet-implemented: final wording authoring remains out of scope and guarded.

### APP-SCR-11 Service And Evidence Capture

- Purpose: capture service events, consent proof, timing state, and evidence links with explicit guarded handling.
- Owning modules consumed: `src/modules/br02/index.ts`, `src/modules/br02/consumer.ts`, `src/modules/evidence/index.ts`, `src/modules/audit/index.ts`.
- Component family/surface type: `HERO_CAPTURE_SURFACE` with `WORKFLOW_STEP_FORM`, `INTERRUPTION_CARD`.
- State families rendered: BR02 consumer dispositions (`HARD_STOP`, `NEEDS_REVIEW`, `REVIEW_LED_CAUTION`, `NEXT_STEP_READY`) and workflow guarded/stop states.
- Warnings/interruptions rendered: service warnings, evidence timing warnings, wrong-channel stop, referral overlays.
- Trust cues required: local validation not official acceptance cue.
- Primary next action: `IN_PRODUCT` unless referral/reroute activates `REFERRAL_EXTERNAL`.
- Done-for-now/exit/return behavior: one service-event row per renter/attempt and standalone consent proof save separately; resume restores per-renter branches.
- Persistence writes: `ServiceEvent` (`SV-*`), `ConsentProof` (`CP-*`), `EvidenceTimingState` (`ET-*`), evidence drafts (`EV-*` subset), audit events for consequential changes.
- Resume reads: service rows by renter, consent objects by scope variation, timing precedence state, evidence validation flags.
- Placeholder/not-yet-implemented: communications chronology beyond captured notes remains non-hero and `CONTRACT_ONLY`.

### APP-SCR-12 Output Review

- Purpose: render readiness summary, trust-bound output packaging, and next-action context.
- Owning modules consumed: `src/modules/output/index.ts`, `src/modules/output/trustBindings.ts`, `src/modules/output/rendererStateAdapter.ts`, `src/modules/touchpoints/index.ts`, `src/modules/handoff/reviewState.ts`.
- Component family/surface type: `REVIEW_AND_OUTPUT_SURFACE` with `NEXT_ACTION_PANEL`, `INTERRUPTION_CARD`, `DONE_FOR_NOW_CHECKPOINT`.
- State families rendered: readiness outcomes (`READY_FOR_REVIEW`, `BLOCKED`, `REVIEW_REQUIRED`, `REFER_OUT`), review/handoff ownership context.
- Warnings/interruptions rendered: stale, live-confirmation-required, wrong-channel-reroute, referral-first, blocker/guarded warnings as separate surfaces.
- Trust cues required: trust binding boundary keys including no product submission and readiness-not-filing cues.
- Primary next action: all three context classes allowed; selected by `OUT-02`.
- Done-for-now/exit/return behavior: `OUT-03` checkpoint required for pause; return preserves interruption family and next-action context.
- Persistence writes: output-review checklist (`OUT-01`), next-action context (`OUT-02`), done-for-now checkpoint (`OUT-03`), touchpoint posture (`OUT-04`).
- Resume reads: renderer state snapshot, trust binding keys, last next-action context, unresolved interruptions.
- Placeholder/not-yet-implemented: visual diff/history of output package variants remains `CONTRACT_ONLY`.

### APP-SCR-13 Official Handoff Surface

- Purpose: show external handoff guidance with explicit boundary ownership and stop/reroute handling.
- Owning modules consumed: `src/modules/handoff/index.ts`, `src/modules/output/index.ts`, `src/modules/touchpoints/index.ts`.
- Component family/surface type: `EXTERNAL_HANDOFF_SURFACE` with `EXTERNAL_BOUNDARY_PANEL`, `NEXT_ACTION_PANEL`, `INTERRUPTION_CARD`.
- State families rendered: `OfficialHandoffStateRecord.stage`, review/handoff posture, external dependency visibility.
- Warnings/interruptions rendered: handoff warning family, wrong-channel reroute stop, referral-first stop, stale/live controls.
- Trust cues required: `boundary.prep-and-handoff-only`, `boundary.no-product-submission`, `boundary.no-portal-mimicry`, external-action-owner cue.
- Primary next action: `OFFICIAL_EXTERNAL` in standard path; `REFERRAL_EXTERNAL` when reroute/referral applies.
- Done-for-now/exit/return behavior: save handoff checkpoint and return to current matter with explicit external dependency pending.
- Persistence writes: handoff confirmation (`HO-01`, `HO-02`), optional external note (`HO-03`), done-for-now state for post-handoff return.
- Resume reads: latest handoff stage, channel posture, and unresolved external dependency flags.
- Placeholder/not-yet-implemented: no in-product official execution path is allowed; remains permanently out of scope.

## 5. Form Contract Families

### APP-FRM-01 Account/Profile Boundary Form

- Field groups rendered: identity (`ACC-01`, `ACC-02`), boundary acknowledgement (`ACC-03`), timezone (`ACC-04`).
- Required vs optional vs guarded: `ACC-01` and `ACC-03` required; `ACC-02` and `ACC-04` optional; no guarded fields in this form.
- Validation points: acknowledgement required before launcher access; identity non-empty.
- Save/draft/resume behavior: partial profile draft is valid; resume always re-renders boundary cue.
- Interruption routing behavior: missing acknowledgement blocks `APP-ROUTE-03` and `APP-ROUTE-04`.
- External-action boundary: none; this is inside-product setup only.

### APP-FRM-02 Property And Tenancy Setup Form

- Field groups rendered: property core (`PROP-*`), tenancy core (`TEN-*`), renter contacts (`REN-*`), shell bond/reminder context (`BOND-*`, `REM-*`).
- Required vs optional vs guarded: required `PROP-01/02/03/04/06`, `TEN-01/02/04/06/07`, `REN-01`; optional `PROP-05`, `TEN-03/05`, `REN-02/03/04`, `BOND-*`, `REM-01/02`; guarded `REM-03/04/05/06`.
- Validation points: minimum landlord+tenant linkage, valid rent cycle, non-VIC route-out pre-check, source reference presence for required groups.
- Save/draft/resume behavior: property, tenancy, and party rows save independently; resume goes to first unresolved required group.
- Interruption routing behavior: non-VIC or unsupported forum posture routes to launcher stop state.
- External-action boundary: none; shell continuity only.

### APP-FRM-03 Matter Launcher And Routing Form

- Field groups rendered: context selection (`MAT-01`), objective capture (`MAT-02`), jurisdiction signals (`MAT-03`), sensitive/guarded routing (`MAT-04`, `MAT-05`), start/resume (`MAT-06`), source refs (`MAT-07`).
- Required vs optional vs guarded: required `MAT-01/02/03/06/07`; guarded `MAT-04/05`; no optional fields in first-pass launcher contract.
- Validation points: objective capture gate, jurisdiction route-out checks, family-violence-sensitive referral-first escalation.
- Save/draft/resume behavior: save launcher partials and unresolved routing reasons to prevent silent path shifts on resume.
- Interruption routing behavior: route-out and referral-first are stop states and bypass ordinary hero continuation.
- External-action boundary: referral and wrong-channel outcomes route to `REFERRAL_EXTERNAL`.

### APP-FRM-04 Arrears Intake Form

- Field groups rendered: charges (`LED-01`..`LED-04`), payments (`LED-05`..`LED-09`), arrears as-at and context (`LED-10`..`LED-12`).
- Required vs optional vs guarded: required `LED-01/02/03/05/06/10`; optional `LED-04/07/08/09/11/12`; no guarded fields in deterministic intake baseline.
- Validation points: `validateArrearsCalculationInput`, currency/tenancy consistency, threshold rule presence.
- Save/draft/resume behavior: each row saves atomically; resume restores unresolved deterministic blockers and row-level edits.
- Interruption routing behavior: invalid input keeps matter in `INTAKE_INCOMPLETE`; no silent progression.
- External-action boundary: none.

### APP-FRM-05 Threshold Check Form

- Field groups rendered: threshold result (`THR-01`), rule version (`THR-02`), blocker reasons (`THR-03`).
- Required vs optional vs guarded: all fields required because they are system-derived gate outputs.
- Validation points: threshold state must be explicit and provenance attached.
- Save/draft/resume behavior: threshold output persists as checkpoint, with correction tasks.
- Interruption routing behavior: `BLOCKED_INVALID` and `BELOW_THRESHOLD` remain blocked; guarded slowdown remains review-required.
- External-action boundary: route-out/referral transitions only, no official action.

### APP-FRM-06 Notice Preparation Form

- Field groups rendered: notice core (`NP-01`, `NP-06`), prior notice context (`NP-02`..`NP-05`), unresolved issues (`NP-07`).
- Required vs optional vs guarded: required `NP-01`, `NP-06`; optional `NP-02`..`NP-05`; guarded `NP-07`.
- Validation points: deterministic hard stops for missing notice number/output mode; guarded issues remain visible and unresolved until reviewed.
- Save/draft/resume behavior: notice draft saves independently of readiness outcome.
- Interruption routing behavior: referral and guarded slowdowns maintain distinct cards and next-action classes.
- External-action boundary: none at this form stage.

### APP-FRM-07 Service, Consent, And Timing Form

- Field groups rendered: service event (`SV-*`), consent proof (`CP-*`), timing override/freshness (`ET-*`).
- Required vs optional vs guarded: required `SV-01/02/03/05/06`; conditional required `CP-02/03` when email service selected; optional `SV-04/07/08`, `CP-04/05/06`, `ET-06`; guarded `CP-01`, `ET-01/02/03/04/05`.
- Validation points: email-consent linkage gate, service date gate, hand service guarded review, timing override reference integrity.
- Save/draft/resume behavior: service rows are per renter/per attempt; consent proof remains standalone reusable object per scope variation.
- Interruption routing behavior: service warnings and timing warnings stay separate; wrong-channel/reroute overlays interrupt progression.
- External-action boundary: referral or wrong-channel outcomes route to `REFERRAL_EXTERNAL` context.

### APP-FRM-08 Evidence And Output Review Form

- Field groups rendered: evidence metadata (`EV-*`), review checklist (`OUT-01`), next-action class (`OUT-02`), done-for-now (`OUT-03`), freshness/channel posture (`OUT-04`), notes/docs (`NOTE-*`, `DOC-*`).
- Required vs optional vs guarded: required `EV-01/02/05/06`, `OUT-01`, `OUT-02`; optional `EV-03/04/07/08`, `NOTE-*`, `DOC-*`; guarded `EV-09`, `OUT-04`.
- Validation points: attachment separation and proof-linkage visibility, explicit next-action class, touchpoint posture enforcement.
- Save/draft/resume behavior: output-review checkpoint preserves unresolved interruption family and selected next-action class.
- Interruption routing behavior: stale/live/wrong-channel/referral remain separate, not merged into generic warning.
- External-action boundary: if `OUT-02` is external, CTA routing moves to handoff/referral surfaces only.

### APP-FRM-09 Official Handoff Checkpoint Form

- Field groups rendered: external channel confirmation (`HO-01`), handoff stage (`HO-02`), external notes (`HO-03`).
- Required vs optional vs guarded: required `HO-01`, `HO-02`; optional `HO-03`; guarded use of `OUT-04` when freshness/reroute applies.
- Validation points: external owner must remain user/operator; product execution remains disallowed.
- Save/draft/resume behavior: checkpoint saves handoff stage and returns to current matter with dependency still explicit.
- Interruption routing behavior: wrong-channel and referral suppress ordinary external handoff CTA.
- External-action boundary: this form is boundary-only; official action remains outside product.

### APP-FRM-10 Shell Continuity Note, Reminder, And Export Form

- Field groups rendered: notes (`NOTE-*`), bounded inspection/maintenance slots (`SHELL-INS-*`, `SHELL-MAINT-*`), export/document selectors (`DOC-*`).
- Required vs optional vs guarded: optional `NOTE-*`, `DOC-*`, `SHELL-INS-01`, `SHELL-MAINT-01`; guarded `SHELL-INS-02`, `SHELL-MAINT-02`.
- Validation points: chronology completeness checks and source-link recommendations.
- Save/draft/resume behavior: records save without gating hero progression.
- Interruption routing behavior: chronology gap warnings remain support-level and do not fake legal outcomes.
- External-action boundary: export remains records packaging only; no filing implications.

## 6. Explicit Next-Action Handling Contract

| Context | Rendering contract | Routing contract | CTA boundary contract |
| --- | --- | --- | --- |
| `IN_PRODUCT` | show in-product next-step panel and unresolved local controls | route to next hero/shell screen by workflow state | no external-official CTA as primary |
| `OFFICIAL_EXTERNAL` | show external-owner and handoff boundary panel | route to `APP-SCR-13` and then return loop via `APP-SCR-05` | ordinary handoff uses external CTA only |
| `REFERRAL_EXTERNAL` | show stop/explain/reroute or referral-first panel | block ordinary hero continuation; route to referral/reroute path | ordinary handoff CTA must not be primary |

Rules:

- `Prepared for handoff` appears only when readiness and handoff surfaces support it, and only as rendering language.
- External next action is never interpreted as filed, lodged, accepted, or completed in product.
- Referral external handling never reuses ordinary handoff as the leading CTA posture.

## 7. Interruption And Overlay Handling Rules

| Interruption family | Trigger source | Required behavior |
| --- | --- | --- |
| deterministic blocker | arrears/threshold/readiness hard stops | progression blocked with named reason and explicit return condition |
| guarded slowdown/review | notice-readiness guarded issues, BR01/BR02 guarded outputs | remain in review-required posture; do not auto-promote to ready |
| stale | touchpoint freshness posture `STALE` | warning + downgrade; preserve explicit refresh dependency |
| live-confirmation-required | touchpoint freshness posture `LIVE_CONFIRMATION_REQUIRED` | slowdown with explicit live-source dependency |
| wrong-channel-reroute | touchpoint channel posture `WRONG_CHANNEL_REROUTE` | stop + explain + reroute; suppress ordinary handoff CTA |
| referral-first | BR01/BR02 referral triggers and sensitive flags | stop standard path and route to referral external next action |

Overlay integrity constraints:

- each family has a separate visual/behavioral contract and separate resolver code path
- stale/live/wrong-channel/referral are never merged into one generic interruption state
- interruption state is read from module outputs, never inferred from generic pending/success flags

## 8. Persistence And Resume Contract Notes

### 8.1 Write discipline

- Write through existing entity/module constructors and adapters; do not add hidden app-only doctrine logic.
- Capture consequential edits as explicit checkpoints per screen and matter.
- Keep atomic row/object writes for ledger rows, service events, consent proofs, and evidence items.
- Keep consent proof as a standalone reusable object linked by renter and scope variation key.

### 8.2 Resume read discipline

- Resolve resume destination from explicit saved workflow state and interruption context, not heuristics.
- Resume surfaces must include unresolved blocker/guarded/interruption payloads from persisted checkpoints.
- Keep done-for-now checkpoints explicit and visible on current-matter return.

### 8.3 Minimum checkpoint fields for thin app layer

| Checkpoint group | Minimum fields |
| --- | --- |
| launcher checkpoint | matter id, selected context, objective capture progress, unresolved route reasons, target screen id |
| hero step checkpoint | screen id, workflow state, required-field completeness flags, unresolved interruption codes |
| output/handoff checkpoint | next-action class, touchpoint posture summary, done-for-now timestamp, handoff stage |

## 9. Implementation Status Pack Link

Companion compact status artifact:

- `docs/qa/p4c-cx-app-01-compact-app-contract-status-pack.md`

