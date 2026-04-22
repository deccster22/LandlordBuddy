# P4C-CX-SHELL-01 Focused Operating Shell + Hero Workflow MVP Structure Pack

Date: 2026-04-22
Task ID: P4C-CX-SHELL-01
Phase posture: Phase 4B remains primary; this pack is bounded Phase 4C structure work in parallel.

This pack converts the accepted focused operating-shell decision into an explicit first-wave product structure that bridges journey, module map, and screen-level contracts without changing doctrine.

Guardrails preserved in this pack:

- prep remains separate from official action
- handoff remains external and separate from execution
- deterministic and guarded controls remain visibly separate
- shell stays bounded and wedge-supportive, not a PM-suite expansion
- no legal-advice behavior, portal mimicry, filing implication, or alpha-readiness implication

Source anchors:

- `docs/specs/focused-operating-shell-baseline.md`
- `docs/decisions/ADR-focused-operating-shell-direction.md`
- `docs/specs/p4c-cx-l1-01-first-wave-product-journey-pack.md`
- `docs/qa/p4c-cx-l1-01-4c-a-status-pack.md`
- `docs/architecture/p4c-doc-l6-01-first-wave-module-map-refresh.md`
- `docs/architecture/current-product-posture.md`
- `src/domain/model.ts`
- `src/workflow/arrearsHeroWorkflow.ts`
- `src/modules/output/*`, `src/modules/handoff/*`, `src/modules/touchpoints/*`

## 1. First-Wave Product Structure (Shell + Hero)

| Structure zone | Primary purpose | Included first-wave screens |
| --- | --- | --- |
| Focused operating shell continuity | Keep landlord context, records, reminders, and evidence continuity visible around the wedge | Account/profile home, portfolio/property home, tenancy home, active matters, current matter |
| Matter launcher boundary | Convert shell continuity context into explicit hero workflow entry/resume behavior | Matter launcher panel (from active matters/current matter/property/tenancy context) |
| Hero arrears workflow | Run arrears-to-notice-readiness progression using existing state/control spine | Matter creation, arrears intake, threshold check, notice preparation, service/evidence capture, output review, official handoff guidance |
| External official action boundary | Keep official action ownership outside product | Continue in official system / referral external path |

Shell-to-wedge precedence rule:

- shell continuity supports capture quality, navigation, and matter continuity
- hero arrears flow remains the lead consequential path
- shell must feed the matter launcher, not compete with the hero flow

## 2. Shell Feature Decision Table

Decision values: `INCLUDE_NOW`, `LATER`, `PARKED`, `REJECTED`

| Shell feature | Decision | Why | Source basis | Risk if wrong | Revisit trigger |
| --- | --- | --- | --- | --- | --- |
| Account/profile home | `INCLUDE_NOW` | Needed as first-wave continuity entry without changing doctrine | Focused shell baseline inclusion, 4C journey continuity need | If absent, returning-user continuity is weak and matter resumption friction rises | If first-wave onboarding contract changes materially |
| Portfolio/property home | `INCLUDE_NOW` | Required bounded context layer for property-linked matters | Focused shell baseline inclusion list | If missing, matter routing starts without stable property context | If property abstraction/model changes beyond current `Property` aggregate |
| Tenancy home | `INCLUDE_NOW` | Required to bridge tenancy/renter/ledger facts into launcher | Focused shell baseline + journey pack matter-creation/intake sequence | If absent, launcher may skip tenancy-level context and increase false starts | If tenancy lifecycle doctrine reopens |
| Active matters list | `INCLUDE_NOW` | Core shell continuity surface for returning-user matter resumption | Focused shell baseline + 4C-A recommendation | If absent, users lose explicit continuity and restart matters unnecessarily | If matter-state family changes are accepted |
| Current matter view | `INCLUDE_NOW` | Required bridge surface between shell continuity and hero resumption | 4C-A status pack review hotspot + module map app-shell gap | If absent, launcher logic and next-action clarity remain implicit | If app-layer contracts move to implementation phase |
| Matter launcher | `INCLUDE_NOW` | Explicit handoff between shell and hero is mandatory for this task | Focused shell baseline + task packet acceptance criteria | If ambiguous, shell/hero boundary blurs and wedge precedence weakens | If hero entry criteria or routing insertion points change |
| Property records | `INCLUDE_NOW` | Baseline shell inclusion and required capture continuity | Focused shell baseline section 3 | If omitted, downstream evidence and tenancy mapping degrades | If property data model changes |
| Tenancy records | `INCLUDE_NOW` | Core to arrears workflow setup and scoped matter identity | Focused shell baseline + domain `Tenancy` aggregate | If omitted, arrears intake cannot rely on stable tenancy context | If tenancy/matter linkage changes |
| Renter details | `INCLUDE_NOW` | Needed for service-event and consent-proof posture linkage | Focused shell baseline + BR02 posture | If omitted, BR02 paths become brittle or misleading | If BR02 party/service model is revised |
| Bond-paid status visibility | `INCLUDE_NOW` | Allowed factual visibility surface; bounded by anti-overclaim rule | Focused shell baseline + current product posture shell fences | If overstated, could imply legal sufficiency | If legal/wording guardrails update |
| Manual rent tracking / simple ledger | `INCLUDE_NOW` | Supports arrears wedge inputs without full accounting expansion | Focused shell baseline + module map arrears shell | If missing, arrears path loses deterministic input quality | If accounting-scope decision changes |
| Lease milestones / reminders | `INCLUDE_NOW` | Supports continuity, but remains warning-led and non-certifying | Focused shell baseline + shell reminder constraints | If overstated, reminders could read as compliance clearance | If reminder doctrine or legal guardrails change |
| Inspection reminders / outcomes | `LATER` | Keep MVP wedge-focused while preserving a bounded insertion slot | Focused shell baseline includes capability, but not hero-critical for first-wave launcher bridge | If forced now, scope may drift toward PM-suite behavior | After first shell+hero contract implementation review |
| Manual maintenance register | `LATER` | Keep first wave focused on arrears continuity and launcher clarity | Focused shell baseline allows it; task packet prioritizes shell-hero bridge first | If forced now, maintenance flows could dilute wedge prominence | After wedge-led shell screens are implemented and validated |
| Notes / observations | `INCLUDE_NOW` | High-value continuity surface with low doctrine risk | Focused shell baseline inclusion | If absent, fact continuity quality drops across sessions | If evidence/notes separation rules change |
| Document and evidence vault | `INCLUDE_NOW` | Needed for preparation quality and handoff packaging continuity | Focused shell baseline + output/evidence shell architecture | If absent, review/handoff preparation weakens | If evidence retention doctrine freeze changes |
| Structured export | `INCLUDE_NOW` | Explicit accepted shell capability; remains packaging-only | Focused shell baseline + shell wording constraints | If overstated, could imply legal readiness or filing | If export implication guardrails are revised |

## 3. Shell-To-Hero Workflow Map

| Stage | Where it happens | Boundary meaning | Primary module anchors | Consequential output |
| --- | --- | --- | --- | --- |
| `SH-01` Shell continuity | Account/profile, portfolio/property, tenancy, active matters, current matter | Inside-product context only; no official action implied | `src/domain/model.ts` entities + thin app composition (`src/app` reserved) | Matter context is visible and resumable |
| `SH-02` Matter launcher decision | Matter launcher panel/action from shell surfaces | Explicit boundary where shell continuity ends and hero progression begins/resumes | `src/workflow/arrearsHeroWorkflow.ts`, BR01/BR02 insertion gates | User starts a new hero matter or resumes existing state |
| `HW-01` Hero progression | Matter creation through output review | Arrears wedge lead path; deterministic/guarded separation remains explicit | `src/workflow`, `src/modules/arrears`, `timeline`, `notice-readiness`, `br01`, `br02`, `output` | Prepared local review state with explicit blockers/guarded/referral branches |
| `HW-02` Official handoff guidance | Official handoff screen/panel | Handoff remains external and preparation-led | `src/modules/handoff`, `src/modules/touchpoints`, `src/modules/output` | `Prepared for handoff` rendering and external next-action context |
| `EX-01` External action | Outside Landlord Buddy | Official action owner is `USER_OR_OPERATOR`, not product | External official system / specialist path | Official execution occurs outside product |
| `RT-01` Return loop | Back to active matters/current matter | Re-entry to shell continuity after external updates | Shell screens consume persisted matter context | "Done for now" remains visible until next in-product action |

Matter launcher boundary rules:

1. Launcher sits between shell continuity and hero flow, not inside official-handoff execution.
2. Launcher may only do one of: start matter, resume matter at current workflow state, or route to referral/wrong-channel stop context.
3. Launcher must preserve external ownership when next action is outside product.

## 4. Screen Contract Bridge (Shell + Hero)

Implementation status legend:

- `CONTRACT_ONLY`: screen structure defined; no app-layer implementation yet
- `LOGIC_READY_UI_PENDING`: module/runtime semantics exist; screen composition pending

| Screen ID | Screen | Modules consumed | States shown | Warnings shown | Trust cues required | Matter launcher behavior | Implementation status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SH-SCR-01` | Account/profile home | `src/domain/model.ts` (account/operator context via thin app layer) | Non-consequential shell continuity state only | None by default | Shell is supportive; no filing/official action implication | Navigate to active matters or portfolio context | `CONTRACT_ONLY` |
| `SH-SCR-02` | Portfolio/property home | `src/domain/model.ts` (`Property`, `Matter`) | Property-linked matter summary states | Reminder implication warnings when surfaced | Bond visibility is factual only; reminders are prompts, not clearance | Start/resume matter from selected property | `CONTRACT_ONLY` |
| `SH-SCR-03` | Tenancy home | `src/domain/model.ts` (`Tenancy`, `Party`, ledger entities), `src/modules/arrears` for arrears snapshot | Tenancy context plus linked matter state badges | Service/evidence reminder cautions when relevant | Prep-only boundary and no legal-sufficiency implication | Launch or resume from tenancy context | `CONTRACT_ONLY` |
| `SH-SCR-04` | Active matters view | `src/workflow/arrearsHeroWorkflow.ts`, `src/modules/output/rendererStateAdapter.ts`, `src/modules/handoff/reviewState.ts` | Workflow state + review/handoff next-action context | Must keep stale/live/wrong-channel/referral distinct; no generic interruption collapse | `Prepared for handoff` is rendering-only; external action still pending | Resume selected matter at mapped hero step | `LOGIC_READY_UI_PENDING` |
| `SH-SCR-05` | Current matter view | `src/workflow`, `src/modules/output`, `src/modules/handoff`, `src/modules/touchpoints` | Current workflow state, review/handoff posture, next action owner/boundary | Blocked, guarded, stale, live confirmation, wrong-channel, referral-first remain distinct | Boundary cues for local prep vs external action | Launch into exact next hero screen or external referral context | `LOGIC_READY_UI_PENDING` |
| `SH-SCR-06` | Matter launcher panel | `src/workflow/arrearsHeroWorkflow.ts`, BR01/BR02 downstream gates | Start-new, resume-in-state, stop/reroute contexts | Wrong-channel and referral stop are explicit stop paths | No product execution; launcher is prep navigation only | Starts new matter or deep-links to target hero stage | `CONTRACT_ONLY` |
| `HW-SCR-01` | Matter creation (`L1-SCR-03`) | `src/domain/model.ts`, `src/workflow/arrearsHeroWorkflow.ts` | `INTAKE_OPEN` | Missing-context intake blockers | Prep-only; readiness is not filing | Entry point when launcher selects "new matter" | `LOGIC_READY_UI_PENDING` |
| `HW-SCR-02` | Arrears intake (`L1-SCR-04`) | `src/modules/arrears`, `src/modules/timeline`, `src/workflow` | `INTAKE_OPEN`, `INTAKE_INCOMPLETE`, `TRIAGE_READY` | Deterministic blocker reasons remain visible | Local validation only | Resume point from launcher by workflow state | `LOGIC_READY_UI_PENDING` |
| `HW-SCR-03` | Threshold check + notice preparation (`L1-SCR-05/06`) | `src/modules/arrears`, `src/modules/notice-readiness`, `src/modules/br01`, `src/modules/br02`, `src/workflow` | `TRIAGE_READY`, `TRIAGE_SLOWDOWN`, `ARREARS_FACTS_READY`, `ARREARS_FACTS_GUARDED`, `NOTICE_DRAFTING_READY`, `NOTICE_DRAFTING_GUARDED` | Hard-stop, guarded review, referral routing warnings | Readiness remains local review posture | Resume point from launcher for in-progress matters | `LOGIC_READY_UI_PENDING` |
| `HW-SCR-04` | Service/evidence capture (`L1-SCR-07`) | `src/modules/br02`, `src/modules/evidence`, `src/modules/audit` | Guarded/deterministic service and evidence timing states | Service warning family + evidence timing warning family | Local validation does not equal official acceptance | Resume point when launcher targets service/evidence stage | `LOGIC_READY_UI_PENDING` |
| `HW-SCR-05` | Output review (`L1-SCR-08`) | `src/modules/output`, `src/modules/touchpoints`, `src/modules/handoff/reviewState.ts` | `READY_FOR_REVIEW`, `BLOCKED`, `REVIEW_REQUIRED`, `REFER_OUT` | Stale, live confirmation, wrong-channel, referral-first, blocker/slowdown warnings | Trust bindings and readiness boundary cues required | Launcher can return user here for review continuation | `LOGIC_READY_UI_PENDING` |
| `HW-SCR-06` | Official handoff (`L1-SCR-09`) | `src/modules/handoff`, `src/modules/output`, `src/modules/touchpoints` | External next-action pending vs referral/stop contexts | Handoff warning family + wrong-channel/referral stop handling | `boundary.prep-and-handoff-only`, `boundary.no-product-submission`, `boundary.no-portal-mimicry`, external owner cue | Launcher may route here only for handoff-stage matters; action remains external | `LOGIC_READY_UI_PENDING` |

## 5. Scope-Discipline Statement (Explicit Exclusions)

This structure pack does not add or imply:

- integrations (accounting, portal, or other external system automation)
- full accounting behavior
- tax logic or tax optimization
- maintenance marketplace behavior
- messaging platform / communications hub behavior
- direct official filing, submission, or proxy execution
- alpha-readiness status or compliance certification

Bounded-shell rule:

- reminders are prompts/controls, not compliance clearance
- bond-paid is factual visibility, not legal sufficiency
- export is structured packaging, not legal readiness or official acceptance

## 6. Feedback-Fence Implementation Notes

1. `Prepared for handoff` is a rendering rule on consequential surfaces, not a state-family rename or state-family collapse.
2. Next-action contexts must be visually distinct:
   - `IN_PRODUCT` (`ATTACH_REVIEW_STATE`, `RESOLVE_BLOCKER`, `COMPLETE_LOCAL_REVIEW`, `COMPLETE_GUARDED_REVIEW`)
   - `OFFICIAL_EXTERNAL` (`TAKE_EXTERNAL_OFFICIAL_STEP`)
   - `REFERRAL_EXTERNAL` (`REFER_OUTSIDE_STANDARD_PATH`, wrong-channel reroute)
3. Do not collapse `STALE`, `LIVE_CONFIRMATION_REQUIRED`, `WRONG_CHANNEL_REROUTE`, and `REFERRAL_STOP` into one generic interruption style.
4. Preserve `done for now` as a visible screen-level rule for current-matter and active-matters return states; it must remain explicit even before full UI implementation.

## 7. Compact Status Link

Companion status artifact:

- `docs/qa/p4c-cx-shell-01-compact-shell-status-pack.md`
