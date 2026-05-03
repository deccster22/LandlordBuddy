# P4B-CX-APP-ALIGN-07 Adoption-Gated Watchpoint Logging Expansion Backlog Map

Date: 2026-05-03
Task ID: P4B-CX-APP-ALIGN-07

Scope: define an adoption-gated backlog map for possible future watchpoint-logging expansion beyond the first sink-injected caller path.

This is a documentation/backlog artifact only.
It does not change runtime code, tests, UI/copy, routing behavior, logging behavior, sink behavior, status labels, CTA hierarchy, analytics/admin/support tooling, or product semantics.

## 1. Backlog Posture

- Review A remains checkpoint-cleared only.
- 4B remains primary and 4C remains parallel.
- Current logging adoption remains one narrow sink-injected caller path only.
- No global/default production logging is allowed.
- No persistent sink, dashboard/admin/support sink, analytics sink, or user-visible/export sink is currently allowed.
- Logging remains internal observability only and non-certifying.

## 2. Candidate Classification Legend

| Classification | Meaning |
| --- | --- |
| `SAFE_FUTURE_INTERNAL_SINK_INJECTED_CANDIDATE` | Candidate can be implemented as explicit sink-injected internal-only expansion without opening UI/analytics behavior. |
| `NEEDS_ADDITIONAL_CONTRACT_BEFORE_IMPLEMENTATION` | Candidate needs a narrow contract freeze before runtime wiring. |
| `HOLD_PENDING_PRIVACY_SECURITY_STORAGE_REVIEW` | Candidate is blocked until privacy/minimisation and security/storage gates are accepted. |
| `HOLD_PENDING_4C_SHELL_CURRENT_MATTER_SURFACE_WORK` | Candidate must wait for shell/current-matter surface-contract catch-up due leakage risk. |
| `HOLD_PENDING_LANE4_REVIEWC_RENDERED_SURFACE_COMPARISON` | Candidate touches rendered/operator surfaces and must wait for visual/review gates. |
| `REJECT_NOT_APPLICABLE` | Candidate is out of posture and should not be built in current sequencing. |

## 3. Expansion Candidate Map

| Backlog ID | Candidate name | Candidate type | Source seam | Allowed purpose | Forbidden use | Protected states involved | Sink topology required | Privacy/minimisation requirements | Prerequisite gates | Review owner / review type | Implementation readiness | Risk if implemented too early | Trigger before implementation | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `WLB-01` | second internal caller path watchpoint wiring | runtime internal caller expansion | `launcherCurrentMatterExecutionCaller` -> `launcherCurrentMatterFollowOnRouteCoordinator` path | internal QA/audit observability for existing protected-state watchpoints only | UI/state/CTA behavior, compliance semantics, global logging fallback | no-record non-clearance, cannot-resume fail-safe, no-signal explicitness, hold/release, deletion/de-identification, lifecycle/non-lifecycle separation | explicit injected test sink or explicit injected internal QA sink only | locator-first payload only; preserve forbidden field exclusions and forbidden event semantics | `APP-ALIGN-03/04/05/06/07` accepted; exact path scope frozen in task packet | Product + app architecture checkpoint review | `ready after scoped packet` | accidental semantic drift or duplicate/conflicting watchpoint meaning across paths | accepted runtime packet naming one exact second path and no global sink | `SAFE_FUTURE_INTERNAL_SINK_INJECTED_CANDIDATE` |
| `WLB-02` | output/handoff checkpoint-adjacent watchpoint path | runtime adjacent seam expansion | `outputHandoffCheckpointHydration` + `launcherCurrentMatterLifecycleResumeAdapter` | observe hydration/resume-state boundary behavior for internal replay diagnostics | implicit "resume success" meaning from missing/malformed/no-signal hydration states | no-record non-clearance, malformed fail-safe, explicit no-signal, lifecycle/non-lifecycle separation | explicit injected internal QA sink only | locator-only provenance fields; no free-text/legal-content payloads | mini contract for event de-duplication and lineage precedence | Product + QA + architecture contract review | `contract needed` | duplicate emission and lineage ambiguity could mask fail-safe signals | compact hydration-watchpoint contract accepted | `NEEDS_ADDITIONAL_CONTRACT_BEFORE_IMPLEMENTATION` |
| `WLB-03` | internal QA replay/audit inspection path | internal QA consumer planning | `outputPackageLifecycleOrchestrationPersistence` + watchpoint event stream | internal QA replay/audit inspection only (non-user-visible) | support/admin UI, customer-facing logs, exported reports | full protected-state set + minimisation posture | explicit injected internal QA sink only (non-global) | strict redaction checklist; no personal/legal/content/credential payloads | QA inspection contract + privacy checklist signoff | QA owner + privacy/minimisation review | `contract needed` | inspection surface may become pseudo-dashboard language | accepted QA-inspection contract with scope and retention limits | `NEEDS_ADDITIONAL_CONTRACT_BEFORE_IMPLEMENTATION` |
| `WLB-04` | internal guardrail regression diagnostic path | internal regression diagnostics | existing test harness around `launcherCurrentMatterWatchpointWiredCaller` | improve invariant-drift detection in internal test/CI diagnostics | product analytics, customer messaging, public event naming | full protected-state set with explicit no-record/no-signal/fail-safe checks | explicit injected test sink only | no new payload fields; keep minimised schema-only fields | internal test-plan update only; no surface gates | Engineering + QA regression review | `ready` | overreach into runtime/operator tooling if not bounded to tests | accepted diagnostics-focused task packet | `SAFE_FUTURE_INTERNAL_SINK_INJECTED_CANDIDATE` |
| `WLB-05` | persistent internal sink planning | planning-only storage topology | watchpoint emitter sink interface | define future persistence options and constraints only | implementing production persistence now | all protected states + lineage integrity | persistent internal sink (planning only) | retention class mapping, minimisation posture, redaction enforcement, access controls | privacy/minimisation review + security/storage review + explicit retention contract | Security/storage + privacy + product governance review | `blocked` | persistence without gates risks overcollection and implied readiness | accepted storage/privacy contract pack and scoped implementation packet | `HOLD_PENDING_PRIVACY_SECURITY_STORAGE_REVIEW` |
| `WLB-06` | dashboard/admin/support tooling sink planning | planning-only operator surface | watchpoint events -> operator tooling concept | map non-visual operational needs and gate conditions only | building admin/support UI, exposing status semantics, CTA coupling | full protected-state set with explicit non-certifying caveats | dashboard/admin/support sink (planning only) | minimised data exposure and role-scoped access contract | 4C shell/current-matter contract refinement + privacy/security + product trust review | Product + architecture + privacy review | `blocked` | tooling labels may become de-facto product semantics | accepted operator-tooling contract that preserves internal-only language | `HOLD_PENDING_4C_SHELL_CURRENT_MATTER_SURFACE_WORK` |
| `WLB-07` | exported QA report planning | planning-only export path | QA sink output -> export package concept | define internal QA export boundaries only | user-visible report distribution or compliance claims | full protected-state set + minimisation posture | user-visible/exported sink (planning only) | strict redaction, aggregation, and de-identification rules before any output | privacy/minimisation + security/storage + legal/risks/rules + review-cadence controls | QA + privacy + legal/risks/rules review | `blocked` | exports can create false finality/compliance impressions | accepted export-boundary contract with explicit non-product usage scope | `HOLD_PENDING_PRIVACY_SECURITY_STORAGE_REVIEW` |
| `WLB-08` | analytics/reporting sink | analytics/platform expansion | watchpoint stream -> analytics layer | none in current posture | analytics copy, success/funnel narratives, public event taxonomies | all protected states | analytics/reporting sink | n/a (not allowed) | posture shift not approved | Product governance review | `not allowed` | immediate trust-language drift and confidence inflation risk | no trigger in current phase; keep rejected | `REJECT_NOT_APPLICABLE` |
| `WLB-09` | user-visible logs or rendered watchpoint surfaces | rendered/product surface expansion | any watchpoint emission seam | none in current posture | UI status labels, CTA behavior, rendered warnings, public route/event names | all protected states | user-visible/exported sink | n/a (not allowed) | Lane 4 + Review C + shell contracts (none currently authorise this) | Product + Review C comparative review | `not allowed` | converts internal observability into product claims | no trigger in current phase; keep rejected | `HOLD_PENDING_LANE4_REVIEWC_RENDERED_SURFACE_COMPARISON` |

## 4. Sink-Topology Gate Table

| Sink topology | Current status | Allowed current use | Required gates before expansion | Minimum review set |
| --- | --- | --- | --- | --- |
| explicit injected test sink | active | tests and local diagnostics only | none beyond scoped task packet preserving schema and minimisation invariants | Engineering + QA |
| explicit injected internal QA sink | not yet wired | internal QA-only observability in bounded caller paths | candidate-specific contract + no-global/no-default confirmation | Product + QA + architecture + privacy/minimisation |
| persistent internal sink | not allowed | planning only | persistence contract, retention boundaries, access model, and storage/security approval | Product + privacy/minimisation + security/storage + legal/risks/rules |
| dashboard/admin/support sink | not allowed | planning only | operator-surface contract, 4C shell/current-matter alignment, privacy/security controls | Product + architecture + privacy/minimisation + security/storage + legal/risks/rules |
| analytics/reporting sink | rejected in current posture | none | posture-level governance change (not currently approved) | Product governance + legal/risks/rules |
| user-visible/exported sink | not allowed | planning only (strictly non-implementation) | export boundary contract + privacy/security + rendered-surface gate reviews | Product + QA + privacy/minimisation + security/storage + legal/risks/rules + Review C where rendered |

## 5. Review Ownership / Review Type Matrix

| Review stream | Owner(s) | Review type | Applies to |
| --- | --- | --- | --- |
| Product posture | Product | non-claim boundary and sequencing gate | all `WLB-*` candidates |
| App architecture | Engineering architecture | seam scope, sink injection topology, no-global guarantee | `WLB-01` to `WLB-06` |
| QA governance | QA | internal observability utility, replay/regression value, non-surface leakage checks | `WLB-01` to `WLB-07` |
| Privacy/minimisation | Privacy/data governance | field minimisation, redaction, excluded data-class controls | `WLB-01` to `WLB-07` |
| Security/storage | Security + storage architecture | persistence/access/retention controls for non-ephemeral sinks | `WLB-05` to `WLB-07` |
| Legal/risks/rules | legal/risk doctrine owners | anti-overclaim and non-certifying interpretation checks | `WLB-05` to `WLB-09` |
| Rendered-surface gate | Product + Review C flow owners | rendered-surface/non-internal exposure gate check | `WLB-06` and `WLB-09` |

## 6. Do Not Build Yet

Do not build from this backlog stage:

- global/default logging
- persistent production sink
- analytics dashboards
- support/admin tooling
- user-visible logs
- exported QA reports
- public event names
- UI/status/CTA/rendered exposure

## 7. Protected-State Requirements For Any Future Expansion

Every expansion candidate must preserve:

- `NO_RECORD` non-clearance (`clearanceInferred=false`)
- malformed/cannot-safely-resume as explicit fail-safe
- explicit no-routing-signal (never default success/proceed)
- hold-aware and release-controlled visibility
- distinct deletion vs de-identification route kinds
- lifecycle/non-lifecycle separation visibility
- locator-first minimised payload posture
- forbidden event semantics (no success/clearance/compliance/finality naming)

## 8. Recommended Next Implementation Candidate

Recommended next runtime candidate: **`WLB-04` internal guardrail regression diagnostic path**.

Why it is the safest next step:

- uses existing explicit injected test sink topology only
- does not add caller-path wiring, persistent storage, or operator/user surfaces
- increases confidence that protected-state watchpoints remain intact as routing seams evolve
- carries the lowest semantic leakage risk relative to second-path/runtime expansion

## 9. Next-Option Recommendation

Recommended sequence:

1. Open `WLB-04` as a bounded diagnostics-focused task (tests/internal diagnostics only).
2. If additional runtime observability is needed, open `WLB-01` next with one-path scope freeze and explicit injected internal QA sink.
3. Keep `WLB-05` through `WLB-09` gated until privacy/security/storage and 4C/Review C dependencies are explicitly accepted.
