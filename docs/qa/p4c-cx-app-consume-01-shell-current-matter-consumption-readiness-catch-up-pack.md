# P4C-CX-APP-CONSUME-01 Shell/Current-Matter Consumption-Readiness Catch-Up Pack

Date: 2026-05-08
Task ID: P4C-CX-APP-CONSUME-01

Scope: map current internal app-routing and watchpoint outputs to possible shell/current-matter consumers, classify present consumption readiness, and restate explicit gates before any rendered or second-path logging expansion.

This is a documentation/planning artifact only.
It does not change runtime code, tests, UI/copy, routing behavior, logging behavior, sink behavior, status labels, CTA hierarchy, analytics/admin/support tooling, or product semantics.

## 1. Posture Snapshot

- Review A remains checkpoint-cleared only.
- 4B remains primary and 4C remains parallel.
- 4C remains product-experience construction, not alpha/beta readiness.
- Internal app-routing/handling and watchpoint diagnostics chains are coherent, but remain internal machinery only.
- Internal machinery does not equal rendered-surface readiness, legal/compliance sufficiency, storage/security readiness, or Review C readiness.

## 2. Internal Output Map To Potential Consumers

| Internal output family | Current seam anchor | Current role | Possible future consumer families | Protected-state carry requirement |
| --- | --- | --- | --- | --- |
| lifecycle resume routing metadata | `launcherCurrentMatterLifecycleResumeAdapter` | neutral lifecycle support metadata for launcher/current-matter control flow | launcher/current-matter internal coordinator planning, lifecycle context panel planning (gated), warning/interruption planning (gated) | preserve no-record non-clearance, cannot-resume, no-signal, hold/release, deletion/de-identification |
| internal execution routing outcomes | `launcherCurrentMatterExecutionRouting` | contract-faithful lifecycle routing outcomes | non-visual orchestration planning, internal QA diagnostics | preserve explicit fail-safe states; never collapse to generic success |
| internal control outcomes | `launcherCurrentMatterExecutionCaller` | internal control outcome bridge from routing to follow-on handling | internal coordinator and recovery planning | preserve no-record non-clearance and explicit no-signal |
| follow-on coordinator outcomes | `launcherCurrentMatterFollowOnRouteCoordinator` | maps control outcomes into neutral follow-on internal handling outcomes | transition and shell/current-matter planning contracts | preserve hold/release and lifecycle route-kind visibility |
| transition selector outcomes | `launcherCurrentMatterTransitionSelector` | internal transition targets/handling modes only | non-visual orchestration and continuity planning | preserve lifecycle/non-lifecycle separation and protected-state tags |
| transition orchestration outputs | `launcherCurrentMatterTransitionOrchestrationEntry` | composes lifecycle and non-lifecycle slices with separate inspectability | output/handoff checkpoint continuation planning, internal matter recovery planning | preserve separate lifecycle/non-lifecycle inspectability |
| execution directives | `launcherCurrentMatterExecutionDirectiveConsumer` | internal `DIRECTIVE_*` instructions only | handling-action and future non-visual consumer contract planning | preserve non-certifying directive posture and full lineage metadata |
| handling actions | `launcherCurrentMatterHandlingActionConsumer` | internal `ACTION_*` orchestration instructions only | non-visual orchestration caller planning, QA replay/debug planning | preserve no-record, cannot-resume, no-signal, hold/release, route-kind distinctions |
| watchpoint event families | `launcherCurrentMatterWatchpointLoggingEmitter` + one wired caller | internal observability events only | internal QA/debug diagnostics, internal audit/replay planning | preserve minimised locator-first payloads and forbidden-semantics boundaries |
| watchpoint diagnostics findings | `launcherCurrentMatterWatchpointRegressionDiagnostics` | regression drift checks around existing one-path injected-sink adoption | build/QA guardrail checks and contract verification planning | preserve one-path-only posture; no second-path implied |

## 3. Candidate Consumer Classification Legend

| Classification | Meaning |
| --- | --- |
| `INTERNAL_ONLY_READY` | Safe for current internal runtime/diagnostic use with existing explicit boundaries. |
| `SAFE_FUTURE_NON_VISUAL_PLANNING` | Safe to plan now as non-visual/internal consumption; no rendered behavior implied. |
| `NEEDS_ADDITIONAL_CONSUMPTION_CONTRACT` | Requires a narrow contract pack before implementation. |
| `CONTRACT_BACKED_NOT_UI_READY` | Existing surface/app contracts support planning, but not rendered/state-label/CTA consumption. |
| `HOLD_PENDING_4C_SHELL_CURRENT_MATTER_SURFACE_WORK` | Must wait for shell/current-matter contract refinement. |
| `HOLD_PENDING_LANE4_REVIEWC_RENDERED_SURFACE_COMPARISON` | Must wait for Lane 4 / Review C rendered-surface gates. |
| `HOLD_PENDING_PRIVACY_SECURITY_STORAGE_REVIEW` | Must wait for privacy/security/storage gating before expansion. |
| `REJECT_NOT_APPLICABLE` | Out of current posture and should not be consumed. |

## 4. Candidate Consumer Classification Table

| Consumer ID | Candidate consumer name | Candidate type | Source internal output | Intended future use | Allowed current use | Forbidden current use | Current contract basis | Visual dependency | Lane 4 dependency | Review C dependency | Legal/Risks/Rules dependency | Privacy/minimisation dependency | Implementation readiness | Risk if consumed too early | Gate before rendered use | Trigger before next work | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `SCRC-01` | launcher/current-matter internal orchestration coordinator | internal runtime seam | handling actions + orchestration outputs | choose next internal non-visual orchestration branch | internal design/planning only | screen-route/status/CTA mapping | `APP-ROUTE-06` to `APP-ROUTE-10`, `APP-POSTURE-01` | none for planning | not required for planning | not required for planning | enforce non-certifying semantics | preserve protected-state metadata and minimised payload posture | planning-ready | could drift into implied surface routing | shell/current-matter rendered contract update | scoped non-visual consumer contract packet | `SAFE_FUTURE_NON_VISUAL_PLANNING` |
| `SCRC-02` | output/handoff checkpoint continuation planner | internal continuity seam | orchestration outputs + directives/actions | checkpoint continuation planning and replay integrity | docs/planning only | user-facing completion/readiness claims | `APP-ROUTE-06` to `APP-ROUTE-10`, `P4C-CX-APP-01` persistence notes | none for planning | not required for planning | not required for planning | maintain prep-vs-official boundary | keep locator-only non-sensitive references | contract needed | could imply "resume success" in missing/malformed paths | handoff-surface contract + warning/fence binding | compact continuation contract first | `NEEDS_ADDITIONAL_CONSUMPTION_CONTRACT` |
| `SCRC-03` | internal matter recovery/resume planning | non-visual planning | control/coordinator/selector outcomes | plan guarded resume/recovery control handoffs | planning and QA scenario mapping | converting resume metadata to user-facing confidence labels | `APP-ALIGN-01`, `APP-ALIGN-02`, `P4C-CX-SHELL-01` | visual dependent when surfaced | required for rendered expression | required for rendered expression | preserve anti-overclaim boundaries | preserve non-sensitive lineage markers only | gated planning | could collapse fail-safe states into generic resume success | explicit shell/current-matter recovery contract | accepted recovery contract update | `HOLD_PENDING_4C_SHELL_CURRENT_MATTER_SURFACE_WORK` |
| `SCRC-04` | active matters/current matter state projection planning | surface-consumption planning | selector/orchestration/directive/action states | define future mapping rules for current-matter continuity surfaces | planning documentation only | rendered badges/labels/CTA behavior | `P4C-CX-L1-01`, `P4C-CX-SHELL-01`, `P4C-CX-APP-01` | yes | yes | yes | trust-cue and boundary semantics review required | payload minimisation and excluded fields preserved | contract-backed but not UI-ready | high risk of premature rendered semantics | Lane 4/Review C comparative gate acceptance | lane-3/lane-4 readiness task completes | `CONTRACT_BACKED_NOT_UI_READY` |
| `SCRC-05` | lifecycle context panel planning | future rendered component planning | lifecycle routing metadata + route kinds + hold/release | define future panel data contract only | planning notes only | rendered lifecycle status language now | `APP-ALIGN-01`, `P4C-CX-APP-01` | yes | yes | yes | legal/trust review for language boundaries | maintain no personal/content credentials in payloads | gated | could imply compliance/legal/finality meaning | Review C surface gate and trust wording review | dedicated lifecycle context surface contract task | `HOLD_PENDING_LANE4_REVIEWC_RENDERED_SURFACE_COMPARISON` |
| `SCRC-06` | warning/interruption surface planning | future rendered warning family planning | no-record/cannot-resume/no-signal and watchpoints | interruption-family mapping planning only | planning docs only | implementation of rendered warning blocks | `P4C-CX-L1-01`, `P4C-CX-L2-01`, lane warning doctrine | yes | yes | yes | warning-family semantics gate required | minimised non-sensitive event context only | gated | risk of hidden fallback-to-success UI semantics | Lane 4 + Review C rendered comparison outcomes | interruption contract refinement task | `HOLD_PENDING_LANE4_REVIEWC_RENDERED_SURFACE_COMPARISON` |
| `SCRC-07` | internal QA diagnostics consumption | internal QA/debug seam | one-path watchpoint events + diagnostics findings | detect protected-state drift in CI/QA | active via injected test sink only | second runtime caller adoption, dashboards, exported/user logs | `APP-ALIGN-03` to `APP-ALIGN-09` | none | not required | not required | preserve internal-only/non-certifying language | explicit excluded-field checks enforced | internal-ready | risk only if expanded beyond one-path sink-injected scope | separate expansion contract for any topology change | maintain current one-path diagnostics boundary | `INTERNAL_ONLY_READY` |
| `SCRC-08` | audit/debug inspection planning | internal support planning | directives/actions/watchpoints lineage | future internal audit/debug inspection contract planning | planning only | support/admin tooling or user-visible logs | `APP-ALIGN-02`, `APP-ALIGN-07`, `APP-POSTURE-01` | not required for planning | not required for planning | not required for planning | preserve non-claim semantics | strict minimisation/redaction requirements | contract needed | can become de-facto analytics/status language | privacy/security/storage + product review gate | narrow inspection-contract pack | `NEEDS_ADDITIONAL_CONSUMPTION_CONTRACT` |
| `SCRC-09` | persistent sink or dashboard-adjacent consumer | sink-topology expansion | watchpoint emitter outputs | planning only for future topology options | planning notes only | any runtime persistent sink/dashboard/admin/support exposure | `APP-ALIGN-06`, `APP-ALIGN-07` | potentially yes | potentially yes | potentially yes | high doctrine/trust risk review required | strong privacy/security/storage prerequisite | blocked | overcollection and false readiness risk | dedicated sink-topology gate approvals | explicit privacy/security/storage review completion | `HOLD_PENDING_PRIVACY_SECURITY_STORAGE_REVIEW` |
| `SCRC-10` | user-facing lifecycle/status label consumer | rendered/public consumer | any internal route/directive/handling/watchpoint output | none in current posture | none | any use as user-visible status/success/compliance labels | doctrine and posture explicitly forbid this now | yes | yes | yes | prohibited without major posture shift | prohibited | not allowed | immediate overclaim and trust-boundary break | none currently | no trigger in current phase | `REJECT_NOT_APPLICABLE` |

## 5. Surface-Consumption Gate Table

| Surface/seam class | Current status | Allowed now | Forbidden now | Gate before expansion |
| --- | --- | --- | --- | --- |
| internal control flow | active | existing internal route/directive/handling chain | remapping to user-facing route/status semantics | none beyond current route/posture contracts |
| internal QA/debug diagnostics | active | one-path injected test/in-memory sink diagnostics | second-path runtime wiring or sink topology expansion | separate contract-first packet for any expansion |
| shell/current-matter planning docs | active | planning/classification and non-visual mapping | implementation or rendered claims | accepted consumption contract task per consumer |
| non-visual orchestration | planning-ready | non-visual consumer planning and scoped contract drafting | hidden UI/CTA mapping | narrow non-visual consumer contract acceptance |
| rendered state panel | gated | none | direct use of internal states as rendered status | Lane 4 + Review C rendered-surface gate |
| rendered warning/interruption block | gated | none | rendered warning implementation from internal states | interruption-family surface contract + Review C gate |
| rendered CTA hierarchy | gated | none | CTA behavior derivation from directives/actions/watchpoints | CTA hierarchy gate and consequential-surface review |
| user-visible lifecycle/status label | blocked | none | any conversion of internal states to user labels | explicit future posture change (not currently authorized) |
| analytics/admin/support surface | blocked | planning only (if separately approved) | runtime or user/operator-facing analytics/support rollout | privacy/security/storage + product/legal governance gates |
| exported report or user-facing log | blocked | none | any export/user-visible log based on watchpoints | dedicated export/report contract + privacy/security/legal review |

## 6. Not-UI-Ready Boundaries

Internal states and watchpoints are not currently safe to expose as:

- user-facing lifecycle/status labels
- success/completion indicators
- compliance or legal-sufficiency indicators
- official filing/acceptance/finality indicators
- CTA wording/priority rules
- public analytics labels

Reason: current seams are internal control/observability contracts and retain explicit fail-safe/guarded ambiguity (`NO_RECORD`, malformed/cannot-resume, explicit no-signal, hold/release, deletion/de-identification), which must not be collapsed into user-facing certainty.

## 7. Visual Dependency Handling

- No visual lock is required for this task.
- Visual-dependent candidates are mapped as gated, not implementation-ready.
- This artifact does not authorize rendered behavior, status labels, or CTA hierarchy work.
- Lane 4 and Review C remain controlling gates for any later rendered exposure.

## 8. Protected-State Preservation Requirements

| Protected state | Required preservation in any future consumption | Must-not-imply boundary |
| --- | --- | --- |
| resumed lifecycle context | remain explicit as internal context, not generic success | not compliance/legal/finality |
| no lifecycle record / non-clearance | keep `clearanceInferred=false` explicit | not safe/cleared |
| malformed / cannot safely resume | preserve fail-safe hold posture | not silent success/proceed |
| no routing signal | preserve explicit no-signal path | not default proceed |
| hold-aware state | preserve flag and review-led handling | not normalised clear state |
| release-controlled state | preserve distinct release-controlled flag | not full-clearance implication |
| deletion route | preserve route kind distinction | not de-identification |
| de-identification route | preserve route kind distinction | not deletion |
| lifecycle/non-lifecycle separation | preserve separate inspectability | not collapsed generic resume |
| watchpoint semantics | neutral `WATCH_*_OBSERVED` families and minimised payloads only | no success/clearance/compliance/finality language |

## 9. `WLB-01` Decision

### What `WLB-01` would open

- Contract-first consideration of a second internal watchpoint caller-path expansion beyond current one-path sink-injected adoption.

### Preconditions already satisfied

- route/directive/handling chain is internally coherent through `APP-ROUTE-10`
- watchpoint schema/emitter/one-path wiring and diagnostics boundaries are documented through `APP-ALIGN-09`
- protected-state and minimisation constraints are explicit

### Preconditions still gated

- shell/current-matter consumer contracts are still mostly planning-stage for rendered/surface-adjacent use
- visual-dependent consumers remain gated by Lane 4 and Review C
- second-path value is not yet strongly tied to an accepted near-term 4C consumption contract

### Decision

Recommended decision: **Hold `WLB-01` for now**.

Reason: this catch-up map confirms that sequencing risk is still consumer-readiness and surface gating, not missing internal logging machinery.

## 10. Next-Option Recommendation

### Option A: open `WLB-01` contract-first now

- Upside: keeps watchpoint expansion momentum.
- Risk: likely extends internal machinery before 4C consumption contracts catch up.

### Option B: hold `WLB-01` and return to shell/current-matter contract catch-up

- Upside: strongest alignment to actual 4C consumer readiness.
- Risk: slower internal logging expansion.

### Option C: replace near-term `WLB-01` with a narrow shell/current-matter consumption contract task first

- Upside: creates direct bridge from current internal states to explicitly gated future consumers without opening second-path logging.
- Risk: one extra planning step before any additional runtime seam.

Recommended next move: **Option C**.

Rationale:

- It directly addresses the current bottleneck (consumption readiness classification and gate clarity).
- It keeps internal-only route/watchpoint posture disciplined.
- It avoids implying visual/UI/readiness inflation while still moving 4C forward.
