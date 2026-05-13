# P4C-CX-APP-CONSUME-02 Shell/Current-Matter Lifecycle-State Consumption Contract Pack

Date: 2026-05-13
Task ID: P4C-CX-APP-CONSUME-02

Scope: define the first narrow non-visual shell/current-matter consumption contract slice for internal lifecycle-state outputs from the app-routing spine.

This is a documentation/contract artifact only.
It does not change runtime code, tests, UI/copy, routing behavior, logging behavior, sink behavior, status labels, CTA hierarchy, analytics/admin/support tooling, rendered surfaces, or product semantics.

## 1. Selected First Consumer Slice

Selected slice: `SCRC-01` from `P4C-CX-APP-CONSUME-01`.

Slice name: **launcher/current-matter internal lifecycle consumption planner**.

Slice boundary:

- internal-only planning and contract use for shell/current-matter lifecycle continuity
- non-visual continuation-eligibility planning
- non-visual fail-safe interruption planning
- lifecycle-context preservation planning with explicit protected-state carry

Explicitly deferred from this slice:

- rendered state panels
- rendered warning/interruption blocks
- CTA hierarchy behavior
- user-facing status labels
- second watchpoint caller-path expansion (`WLB-01` remains held)

## 2. Allowed Source Outputs (This Slice)

Allowed source outputs for this slice are internal lifecycle-state and lifecycle-adjacent non-visual outputs only:

- lifecycle resume routing metadata (`launcherCurrentMatterLifecycleResumeAdapter`)
- internal execution routing outcomes (`launcherCurrentMatterExecutionRouting`)
- internal control outcomes (`launcherCurrentMatterExecutionCaller`)
- follow-on route coordinator outcomes (`launcherCurrentMatterFollowOnRouteCoordinator`)
- transition selector outcomes (`launcherCurrentMatterTransitionSelector`)
- transition orchestration outputs (`launcherCurrentMatterTransitionOrchestrationEntry`)
- execution directives (`launcherCurrentMatterExecutionDirectiveConsumer`)
- handling actions (`launcherCurrentMatterHandlingActionConsumer`)
- watchpoint diagnostics findings as internal QA context only (not product state)

## 3. Source-Output To Consumer Contract Table

| Source output | Allowed internal consumer | Allowed current use | Forbidden conversion | Protected states carried | Minimum metadata required | Dependency/gate before implementation | Gate before rendered use | Review owner / review type |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lifecycle resume routing metadata | launcher/current-matter internal lifecycle consumption planner | classify internal lifecycle continuity context for planning and fallback routing intent | user-facing lifecycle status labels; success/compliance states | no-record non-clearance; cannot-resume; no-signal; hold/release; route kind distinction | routing outcome; `clearanceInferred`; hold/release flags; route-kind fields | this contract accepted + existing `APP-ROUTE-01..10` posture preserved | Lane 4 + Review C + shell/current-matter rendered contract | Product + app architecture contract review |
| internal execution routing outcomes | same | internal continuation-eligibility planning | generic "resume success" conversion; CTA wording | no-record; cannot-safely-resume; explicit no-signal | execution outcome enum + reason metadata | this contract accepted | Lane 4 + Review C | Product + app architecture |
| internal control outcomes | same | internal fail-safe interruption planning at non-visual seam | rendered warning labels; legal/compliance implication | no-record non-clearance control; cannot-resume control; explicit no-signal control | control outcome enum + raw routing lineage | this contract accepted | shell/current-matter rendered interruption contract + Review C | Product + app architecture + QA |
| follow-on route coordinator outcomes | same | internal lifecycle-context preservation planning | screen state badges; CTA hierarchy outcomes | hold-aware; release-controlled; deletion/de-identification distinction | coordinator outcome + lifecycle context block | this contract accepted | Lane 4 / Review C rendered mapping gate | Product + app architecture |
| transition selector outcomes | same | non-visual transition-mode planning | screen-route naming or user route labels | no-record, cannot-resume, no-signal, hold/release, route distinction | transition target/mode + metadata block | this contract accepted | rendered state/route contract gate | Product + app architecture |
| transition orchestration outputs | same | keep lifecycle and non-lifecycle slices separately inspectable in internal planning | collapse to one generic launcher-resume success state | lifecycle/non-lifecycle separation; protected-state continuity | orchestration mode + lifecycle slice + non-lifecycle slice | this contract accepted | rendered-surface contract gate | Product + app architecture + QA |
| execution directives | same | internal orchestration intent planning only | CTA copy, user status, compliance labels | protected-state continuity through `DIRECTIVE_*` outcomes | directive kind + lineage metadata + protected flags | this contract accepted | rendered-CTA/status gate | Product + app architecture |
| handling actions | same | internal shell/current-matter continuation planning only | screen routes, user-facing action labels, finality language | protected-state continuity through `ACTION_*` outcomes | action kind + directive/orchestration lineage + protected flags | this contract accepted | rendered hierarchy/status gate | Product + app architecture |
| watchpoint diagnostics findings (QA context only) | same (QA-adjacent internal context) | internal QA/debug traceability and drift evidence only | product state source; user/admin/support labels; exported/user-visible logs | drift checks for no-record, cannot-resume, no-signal, hold/release, route-kind, lifecycle/non-lifecycle separation | diagnostic finding ID + check result + non-sensitive references only | existing one-path diagnostics boundary remains unchanged | any rendered/support/analytics exposure requires separate future gates | QA + Product + architecture |

## 4. Allowed Internal-Only Uses (This Slice)

- shell/current-matter planning state (non-rendered)
- internal continuation-eligibility planning
- internal fail-safe interruption planning (non-rendered)
- internal lifecycle-context preservation planning
- internal QA/debug traceability references
- future non-visual orchestration planning

## 5. Forbidden Conversions (Explicit)

Do not convert this slice outputs into:

- user-facing lifecycle labels
- success/completion states
- compliance states
- legal sufficiency states
- official filing/acceptance/finality states
- CTA wording or hierarchy
- rendered state panels
- rendered warning/interruption blocks
- analytics/admin/support labels
- exported or user-visible logs

## 6. Protected-State Preservation Table

| Protected state | Required carry rule in this slice | Must-not-happen conversion |
| --- | --- | --- |
| no-record non-clearance | keep `clearanceInferred=false` explicit in lifecycle planning metadata | no-record treated as safe/cleared/success |
| malformed/cannot-safely-resume | keep explicit fail-safe posture as non-visual hold/interruption planning state | malformed degraded into proceed/success |
| explicit no-signal | preserve explicit no-signal category | no-signal treated as default proceed |
| hold-aware state | preserve hold-aware visibility and review-led meaning | hold collapsed into normal continuation |
| release-controlled state | preserve release-controlled visibility as distinct | release-controlled treated as full-clearance |
| deletion route | preserve `DELETION_REQUEST` distinction | collapsed into de-identification/generic lifecycle action |
| de-identification route | preserve `DEIDENTIFICATION_ACTION` distinction | collapsed into deletion/generic lifecycle action |
| lifecycle/non-lifecycle separation | preserve separate inspectability in planning contract | merged generic resume summary without slice distinction |
| clearance inference guard | keep non-clearance behavior explicit for missing records | inferred clearance from absent records |
| lifecycle-success guard | keep lifecycle context as internal planning context only | lifecycle state reworded as user-facing success |

## 7. Not-UI-Ready Boundary

This contract permits **internal planning only**.

It does not:

- authorize UI copy
- define screen labels
- define CTAs
- define rendered state panels
- define warning-panel behavior
- create support/admin/analytics terminology

## 8. Visual Dependency Handling

- No visual lock is required for this task.
- Visual-dependent candidates remain gated.
- Lane 4 and Review C continue to control rendered/status/CTA exposure.
- Nothing in this contract authorizes rendered implementation.

## 9. `WLB-01` Status (Held)

`WLB-01` remains **held**.

This contract does not require second-path watchpoint expansion because:

- selected slice `SCRC-01` consumes existing internal routing/directive/handling outputs only
- watchpoint diagnostics are used only as internal QA context, not as product state
- one-path sink-injected diagnostics coverage already supports bounded internal drift checks

Evidence required before reopening `WLB-01`:

- accepted non-visual consumer implementation need that cannot be met with current one-path diagnostics posture
- explicit second-path contract scope with protected-state parity checks
- renewed product/architecture/QA gate decision that second-path expansion is higher value than additional shell/current-matter consumption-contract catch-up

## 10. Next-Option Recommendation

Recommended next move: open a narrow **runtime implementation task for this exact non-visual slice** (internal lifecycle consumption planner only), while keeping rendered/state-label/CTA and second-path logging work gated.

Alternative: if 4C shell/current-matter contract maturity is still uncertain, run one more shell/current-matter contract slice before runtime implementation.
