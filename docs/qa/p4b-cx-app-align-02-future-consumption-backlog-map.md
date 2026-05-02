# P4B-CX-APP-ALIGN-02 Future-Consumption Backlog Map

Date: 2026-05-03
Task ID: P4B-CX-APP-ALIGN-02

Scope: define a narrow backlog map for future non-visual consumers of the launcher/current-matter app-routing spine, keyed to 4C shell/current-matter and Lane 4 / Review C gates.

This is a documentation/backlog artifact only.
It does not change runtime code, tests, UI, copy, routing behavior, status labels, CTA hierarchy, or product semantics.

## 1. Backlog Posture

- Review A remains checkpoint-cleared only.
- 4B remains primary and 4C remains parallel.
- Internal routing/directive/handling depth does not equal UI/screen readiness.
- Lifecycle and non-lifecycle slices remain separately inspectable.
- Protected states (`NO_RECORD`, malformed/cannot-resume, explicit no-signal, hold/release, deletion/de-identification) remain mandatory in all candidate planning.

## 2. Candidate Classification Legend

| Classification | Meaning |
| --- | --- |
| `SAFE_FUTURE_NON_VISUAL_IMPLEMENTATION_CANDIDATE` | Candidate can be implemented as internal-only non-rendered logic without requiring new rendered-surface contracts. |
| `NEEDS_ADDITIONAL_CONTRACT_BEFORE_IMPLEMENTATION` | Candidate is non-visual but needs a narrow contract freeze first. |
| `HOLD_PENDING_4C_SHELL_CURRENT_MATTER_SURFACE_WORK` | Candidate should wait for shell/current-matter contract refinement even if implementation is non-visual. |
| `HOLD_PENDING_LANE4_REVIEWC_RENDERED_SURFACE_COMPARISON` | Candidate is blocked by rendered-surface comparison gates. |
| `REJECT_NOT_APPLICABLE` | Candidate is out of bounds for current posture. |

## 3. Future-Consumption Backlog Map

| Consumer ID | Consumer type | Source seam(s) | Consumed state | Allowed non-visual use | Forbidden use | Protected states | Prerequisite gates | Implementation readiness | Risk if implemented too early | Recommended next trigger | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `FCB-01` | internal orchestration coordinator | `launcherCurrentMatterHandlingActionConsumer`, `launcherCurrentMatterTransitionOrchestrationEntry` | `ACTION_*` handling outcomes + lifecycle/non-lifecycle slices | Select internal follow-on orchestration branch and checkpoint intent only | Any screen route, status label, CTA decision, or compliance implication | no-record non-clearance, fail-safe cannot-resume, explicit no-signal, hold/release, deletion/de-identification | existing `APP-ROUTE-09/10` contracts; `APP-ALIGN-01` posture fences | `ready with contract guardrails` | consumer could drift into hidden UI semantics if scope is not pinned | explicit task packet to open the next non-UI internal seam | `SAFE_FUTURE_NON_VISUAL_IMPLEMENTATION_CANDIDATE` |
| `FCB-02` | checkpoint continuation planner | `outputHandoffCheckpointHydration`, `launcherCurrentMatterHandlingActionConsumer` | resume checkpoint + `ACTION_*` + lifecycle lineage | plan internal continuation checkpoint payloads for replay/debug only | any user-visible progression claim or "resume success" label | no-record, malformed fail-safe, no-signal, hold/release, deletion/de-identification | hydration contract stability plus explicit checkpoint-field contract addendum | `requires mini contract` | replay schema drift could hide fail-safe posture | add a compact continuation-payload contract pack before code | `NEEDS_ADDITIONAL_CONTRACT_BEFORE_IMPLEMENTATION` |
| `FCB-03` | current-matter recovery planner | `launcherCurrentMatterExecutionCaller`, `launcherCurrentMatterFollowOnRouteCoordinator`, `launcherCurrentMatterTransitionSelector` | control outcomes + coordinator outcomes + transition mode | prepare internal recovery/resume planning matrix without rendering behavior | status/CTA hierarchy, rendered warning behavior, or route naming | explicit no-signal, no-record non-clearance, cannot-resume hold | 4C shell/current-matter contract refinement for recovery semantics | `gated` | planner could outrun shell/current-matter contract terms | accepted shell/current-matter recovery contract update | `HOLD_PENDING_4C_SHELL_CURRENT_MATTER_SURFACE_WORK` |
| `FCB-04` | lifecycle audit/debug/replay inspection adapter | `launcherCurrentMatterExecutionDirectiveConsumer`, `launcherCurrentMatterHandlingActionConsumer`, lifecycle persistence seams | directive/action lineage + lifecycle route metadata + hold/release flags | internal inspection views/log snapshots for engineering debugging and audit QA | user-facing lifecycle badges, legal/privacy sufficiency claims | hold/release, deletion/de-identification, no-record, malformed, no-signal | audit field whitelist and retention-safe debug contract | `requires mini contract` | overcollection or ambiguous debug output could imply readiness/compliance | freeze debug payload whitelist and non-claim language first | `NEEDS_ADDITIONAL_CONTRACT_BEFORE_IMPLEMENTATION` |
| `FCB-05` | guardrail/watchpoint logging emitter | `launcherCurrentMatterExecutionRouting`, `launcherCurrentMatterExecutionCaller`, `launcherCurrentMatterHandlingActionConsumer` | routing/control/action outcomes and protected-state flags | emit internal watchpoint events for fail-safe/no-record/no-signal path observability | user-facing notifications, status labels, or CTA branching | no-record non-clearance, cannot-resume hold, explicit no-signal, hold/release | logging taxonomy + event schema guardrails (internal only) | `ready after small schema freeze` | noisy or ambiguous logs may cause accidental semantics drift | short logging-schema contract and ownership assignment | `SAFE_FUTURE_NON_VISUAL_IMPLEMENTATION_CANDIDATE` |
| `FCB-06` | future rendered-surface prep map (planning only) | `APP-ALIGN-01`, `P4C-CX-APP-01`, `P4C-CX-L1-01`, `P4C-CX-L2-01` | mapping metadata only (no runtime inputs) | document future consumption slots and gating criteria only | any runtime wiring, UI behavior, copy, status label, CTA implementation | all protected states must stay explicit as non-rendered contract notes | 4C shell/current-matter surface contract refresh | `planning-only hold` | planning could be misread as implementation approval | schedule with explicit "documentation-only" packet | `HOLD_PENDING_4C_SHELL_CURRENT_MATTER_SURFACE_WORK` |
| `FCB-07` | interruption/state projection to rendered warning surfaces | `ACTION_*` outcomes + interruption families | protected-state projection candidates | pre-implementation analysis only after rendered-surface comparison | current implementation of rendered warning/status/CTA behavior | no-record, malformed, no-signal, hold/release must remain explicit | Lane 4 visual freeze and Review C rendered-surface comparison acceptance | `blocked` | premature projection risks collapsing interruption families | explicit Lane 4 / Review C gate acceptance checkpoint | `HOLD_PENDING_LANE4_REVIEWC_RENDERED_SURFACE_COMPARISON` |
| `FCB-08` | public route aliasing or user-facing route names | any routing/directive/handling seam | internal outcomes as external labels | none | any public route naming derived from internal directives/actions | all protected states | permanently out of scope per current posture | `not allowed` | high trust/compliance confusion risk | no trigger; keep rejected | `REJECT_NOT_APPLICABLE` |

## 4. Do Not Build Yet

Do not build from this backlog stage:

- rendered status labels
- CTA/state hierarchy behavior
- user-facing lifecycle banners
- compliance/privacy claims
- official handoff/finality claims
- public route names

## 5. Dependency And Gate Table

| Gate / dependency | Why it matters | Blocks which backlog classes | Unblocks when |
| --- | --- | --- | --- |
| 4C shell/current-matter surface contract refinement | Defines allowed future surface consumption boundaries and resume/recovery semantics | `HOLD_PENDING_4C_SHELL_CURRENT_MATTER_SURFACE_WORK` | explicit accepted contract update for shell/current-matter consumption boundaries |
| Lane 4 visual freeze direction | Prevents drift in rendered warning/status/priority semantics | `HOLD_PENDING_LANE4_REVIEWC_RENDERED_SURFACE_COMPARISON` | Lane 4 direction is accepted for the relevant surface family |
| Review C rendered-surface inspection | Confirms rendered-surface behavior alignment and anti-overclaim posture | `HOLD_PENDING_LANE4_REVIEWC_RENDERED_SURFACE_COMPARISON` | comparative rendered-surface checkpoint acceptance is recorded |
| BR04 doctrine completion (still gated) | Prevents overclaim around lifecycle/legal/privacy readiness | all classes must preserve caveats; especially debug/replay and any future surface mapping | doctrine updates are explicitly accepted and mapped into contracts |
| storage-provider/security readiness (out of scope now) | Prevents implicit production-readiness claims from internal planning | all classes that touch persistence/debug assumptions | explicit storage/security readiness tasks are accepted separately |

## 6. Recommended Next Implementation Candidate

Recommended candidate: `FCB-05` internal guardrail/watchpoint logging emitter.

Why this is the safest next runtime candidate:

- stays fully internal and non-visual
- improves detection of accidental fallback-to-success behavior
- directly reinforces protected-state invariants (`NO_RECORD`, malformed fail-safe, no-signal, hold/release, deletion/de-identification)
- can be bounded by a narrow internal logging-schema contract before implementation

## 7. Next-Option Recommendation

Recommended sequencing:

1. Freeze a compact logging-schema contract for `FCB-05` (docs-only).
2. Implement `FCB-05` as a narrow non-visual seam.
3. Keep `FCB-03`, `FCB-06`, and `FCB-07` on hold until 4C and Lane 4 / Review C gates advance.
