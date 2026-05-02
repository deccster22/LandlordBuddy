# P4B-CX-APP-ALIGN-01 App/Repo Posture Alignment Artifact

Date: 2026-05-02
Task ID: P4B-CX-APP-ALIGN-01

Scope: reconcile the internal launcher/current-matter app-routing spine (`APP-ROUTE-01` through `APP-ROUTE-10`) with current 4C shell/current-matter surface contracts.

This is a documentation/alignment artifact only.
It does not change runtime code, tests, UI, copy, routing behavior, status labels, CTA hierarchy, or product semantics.

## 1. Current Alignment Posture

- Review A remains checkpoint-cleared only.
- 4B remains primary and 4C remains bounded parallel.
- Internal routing/directive/handling depth is real, but does not equal UI/surface readiness.
- Internal handling actions are orchestration instructions only and are not screen routes, status labels, CTA decisions, or compliance signals.
- Lifecycle and non-lifecycle transition slices remain separately inspectable and must not collapse into generic launcher resume state.
- `NO_RECORD` with `clearanceInferred: false`, malformed/cannot-resume, and explicit no-signal paths remain protected internal controls.

## 2. Spine-To-Surface Chain Summary

Current chain present in app layer:

1. persistence and resume load/replay (`outputHandoffCheckpointHydration`)
2. neutral lifecycle routing metadata (`launcherCurrentMatterLifecycleResumeAdapter`)
3. execution routing (`launcherCurrentMatterExecutionRouting`)
4. internal control outcome (`launcherCurrentMatterExecutionCaller`)
5. follow-on coordinator (`launcherCurrentMatterFollowOnRouteCoordinator`)
6. transition selector (`launcherCurrentMatterTransitionSelector`)
7. transition orchestration entrypoint (`launcherCurrentMatterTransitionOrchestrationEntry`)
8. execution directives (`launcherCurrentMatterExecutionDirectiveConsumer`)
9. handling actions (`launcherCurrentMatterHandlingActionConsumer`)

Current 4C contract context:

- shell/current-matter surfaces are contract-defined in `P4C-CX-SHELL-01` and `P4C-CX-APP-01`
- journey/state placements are contract-defined in `P4C-CX-L1-01`
- form/question gating and interruption behavior are contract-defined in `P4C-CX-L2-01`
- these remain contract scaffolds with UI/render sequencing still gated

## 3. Surface Readiness Classification Legend

| Classification | Meaning |
| --- | --- |
| `READY_FOR_FUTURE_NON_VISUAL_INTEGRATION_PLANNING` | Internal seam can be planned as a non-rendered consumer target with existing contract anchors. |
| `CONTRACT_BACKED_NOT_UI_READY` | Surface contract exists, but rendered/CTA/status behavior is not ready to consume runtime seam directly. |
| `HOLD_PENDING_4C_SHELL_CURRENT_MATTER_SURFACE_WORK` | Runtime wiring should wait for explicit shell/current-matter contract refinement before surface consumption. |
| `HOLD_PENDING_LANE4_REVIEWC_RENDERED_SURFACE_COMPARISON` | Runtime surface use should wait for Lane 4 and Review C rendered-surface comparison outcomes. |
| `NOT_APPLICABLE` | Surface is outside allowed consumer scope for this routing spine stage. |

## 4. Alignment Table (Internal Seam vs Future Surface Consumption)

| Internal seam | Current internal capability | Possible future surface consumer | Current surface contract readiness | Allowed future consumption | Forbidden interpretation | Gate / trigger before UI consumption |
| --- | --- | --- | --- | --- | --- | --- |
| Lifecycle resume routing contract + execution routing | Lifecycle metadata resolved into explicit routing outcomes (`RESUME_AVAILABLE`, `NO_RECORD`, `CANNOT_SAFELY_RESUME`, explicit no-signal) | Launcher/current-matter resume shell (`SH-SCR-04/05/06`, `APP-SCR-04/05/06`) | `CONTRACT_BACKED_NOT_UI_READY` | Surface-level integration planning that preserves explicit protected states without rendering semantics decisions | Any user-facing success/clearance/compliance meaning | 4C shell/current-matter surface contract refinement that explicitly maps interruption families and trust-cue placements |
| Internal control caller + follow-on coordinator | Internal control and follow-on handling preserved with explicit fail-safe/no-signal paths | Current matter recovery/resume support | `READY_FOR_FUTURE_NON_VISUAL_INTEGRATION_PLANNING` | Non-visual composition planning for resume/recovery context inputs in app-layer coordinators | Treating control outcomes as status labels or CTA policies | Explicit non-visual integration plan accepted in app docs before any rendered consumption |
| Transition selector + orchestration entrypoint | Lifecycle and non-lifecycle transition slices composed and separately inspectable | Internal matter status orchestration seam | `READY_FOR_FUTURE_NON_VISUAL_INTEGRATION_PLANNING` | Internal orchestration/backlog planning that keeps lifecycle/non-lifecycle separation explicit | Collapsing lifecycle slice into generic resume-success state | Consumer contract that preserves slice separation and protected-state fields |
| Execution-directive consumer + handling-action consumer | Internal `DIRECTIVE_*` -> `ACTION_*` chain preserved with lineage metadata | Output/handoff checkpoint continuation support (internal only) | `CONTRACT_BACKED_NOT_UI_READY` | Internal continuation logic planning tied to checkpoint continuity and replay | Converting directives/actions into rendered route names or user-facing flow guarantees | Explicit handling-action consumer contract for non-UI continuation behavior and metadata retention |
| Hold/release + deletion/de-identification protected metadata carried through chain | Distinctions remain visible in routing/control/transition/directive/action metadata | Current matter lifecycle context panels (future, non-rendered planning only) | `HOLD_PENDING_4C_SHELL_CURRENT_MATTER_SURFACE_WORK` | Future data-contract planning for shell summaries that keep state distinctions intact | Any implication of legal sufficiency, privacy-engine completion, or storage-readiness completion | Shell/current-matter panel contract update plus explicit anti-overclaim copy/trust binding review event |
| No-record / malformed / no-signal protections | Explicit anti-fake-clearance and fail-safe behavior through handling actions | Interruption and warning surface family mapping | `HOLD_PENDING_LANE4_REVIEWC_RENDERED_SURFACE_COMPARISON` | Future mapping spec for interruption family behavior only after rendered-surface comparison | Default success fallback, generic "all good", or hidden fail-safe state | Lane 4 + Review C comparative rendered-surface checkpoint acceptance |
| Public handoff/finality surfaces | Out of scope for current internal routing seam | Official handoff panel finality claims | `NOT_APPLICABLE` | None at this seam stage | Filing/acceptance/finality implication from internal routing state | Must remain permanently external-boundary constrained by handoff doctrine |

## 5. Candidate Future Consumers (Allowed Planning Targets)

- launcher/current matter resume shell
- output/handoff checkpoint continuation (internal continuity behavior only)
- internal matter status orchestration
- current matter recovery/resume support

These are planning targets only at this stage and do not authorize rendered behavior decisions.

## 6. Surfaces That Must Not Consume Routing State Yet

- user-facing status labels
- CTA hierarchy decisions
- rendered warning panel wording/behavior
- compliance/privacy or legal-sufficiency claims
- official handoff/finality implication surfaces
- any public-facing route naming

## 7. What This Alignment Proves

- Internal routing depth through handling actions can be reconciled against existing 4C shell/current-matter contracts without changing doctrine.
- The likely future non-visual consumers are identifiable now, and can be planned safely.
- Protected states remain explicit and can remain protected in future seam planning.
- Surface-readiness gating is now explicit, reducing risk of runtime seams outrunning app/surface contracts.

## 8. What This Alignment Does Not Prove

- It does not prove UI/screen implementation readiness.
- It does not prove status-label, CTA, or rendered-warning behavior decisions are settled.
- It does not prove Review C or Lane 4 visual comparison outcomes.
- It does not prove BR04/privacy/storage completion or alpha readiness.

## 9. Do Not Overclaim

Do not treat this alignment artifact as:

- permission to render lifecycle routing states directly in user surfaces
- proof of compliance clearance, legal sufficiency, or official acceptance behavior
- proof that internal handling actions are equivalent to screen routing
- proof that next runtime seam should open without 4C surface catch-up

## 10. Next-Option Analysis

### Option A: Continue internal runtime seam work now

- Upside: keeps 4B runtime momentum.
- Risk: higher drift risk versus current 4C shell/current-matter contract maturity and rendered-surface gates.

### Option B: Pause runtime and open 4C shell/current-matter surface contract refinement

- Upside: strongest contract-surface alignment before new runtime seams.
- Risk: temporarily slows internal seam expansion.

### Option C: Create narrow future-consumption backlog map and hold runtime

- Upside: keeps momentum with concrete planning while preserving posture discipline and gate clarity.
- Risk: one additional planning step before code.

## 11. Recommended Next Move

Recommended: **Option C**.

Rationale:

- Internal seam depth is already sufficient for the current checkpoint.
- A narrow future-consumption backlog map can sequence non-visual consumer seams against 4C surface gates without readiness inflation.
- This keeps 4B progress practical while preventing implicit UI/CTA/compliance meaning leakage.
