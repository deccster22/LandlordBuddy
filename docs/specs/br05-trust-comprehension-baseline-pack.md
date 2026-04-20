# BR05 Trust/Comprehension Baseline Pack

Task ID: `P4B-CX-BR05-01`
Date: 2026-04-20
Phase posture: Phase 4B, documentation lane, no protected-line rewrite

## 1. Scope and guardrails

This pack establishes the BR05 baseline from currently frozen Lane 2 surfaces and parked blocker posture.

It does:

- inventory front-stage promise, support labels, trust cues, boundary lines, warning families, pricing-trigger moments, and comprehension risks
- map where frozen surfaces already carry required trust/boundary controls
- identify where comprehension still depends on supporting explanatory content
- separate settled structural evidence from unresolved commercial questions

It does not:

- rewrite protected Lane 2 copy lines
- imply filing, submission, proxy filing, portal parity, legal authority, or legal certainty
- implement pricing/paywall logic
- settle willingness-to-pay doctrine as truth

## 2. Source anchors used for this baseline

- `docs/governance/P4B Freeze Map.md`
- `docs/specs/non-blocked-dependency-map.md`
- `docs/architecture/arrears-mvp-architecture.md`
- `docs/architecture/output-handoff-evidence-shells.md`
- `docs/qa/control-inventory.md`
- `src/modules/output/trustBindings.ts`
- `src/modules/output/index.ts`
- `src/modules/handoff/index.ts`
- `src/modules/timeline/index.ts`
- `src/modules/notice-readiness/index.ts`

## 3. Front-stage promise and support-label baseline (frozen)

| Item | Current frozen baseline | Constraint to preserve |
| --- | --- | --- |
| Front-stage promise | `Prepare your Notice to Vacate` | Keep as protected Lane 2 line; no hidden rewrite in BR05 lane |
| Support/output label | `Notice Readiness Pack` | Secondary support label only; must not outrank boundary language |
| Ready-language safety | `Prepared for handoff` default when full handoff panel is absent | `Ready` must not stand alone on consequential surfaces |

## 4. Required boundary statement set (must remain visible)

These are the current structural boundary keys that define trust posture in output/handoff shells.

| Boundary key | Required role |
| --- | --- |
| `boundary.prep-and-handoff-only` | Product role is preparation/handoff, not official execution |
| `boundary.no-product-submission` | No filing/submission by product |
| `boundary.no-portal-mimicry` | No portal equivalence or authenticated-flow mimicry |
| `boundary.readiness-not-filing` | Readiness is local preparation status only |
| `boundary.local-validation-not-official-acceptance` | Local checks do not equal official acceptance |
| `boundary.handoff-not-completed-official-step` | Handoff guidance is not completion of official action |

### 4.1 Boundary placement expectations by surface family

| Surface family | Boundary statements that must be visible on or adjacent to the surface |
| --- | --- |
| Readiness/progression surfaces | `boundary.readiness-not-filing`; add `boundary.no-product-submission` where user may infer execution |
| Evidence/local validation surfaces | `boundary.local-validation-not-official-acceptance`; `boundary.readiness-not-filing` |
| Official handoff guidance surfaces | `boundary.prep-and-handoff-only`, `boundary.no-product-submission`, `boundary.no-portal-mimicry`, `boundary.handoff-not-completed-official-step` |
| Authenticated/live official touchpoint consequence surfaces | `boundary.no-portal-mimicry`, `boundary.handoff-not-completed-official-step` |
| Referral/wrong-channel stop surfaces | `boundary.no-portal-mimicry` plus external-step boundary statements where reroute/handoff is required |

## 5. Required trust-cue classes (research-aligned baseline)

| Required trust-cue class | Current structural anchor | Current coverage posture | Supporting explanatory content still needed? |
| --- | --- | --- | --- |
| Official/source reference visibility | `source-index` plus visible source-type labels (`source-label.*`) | Present structurally | Yes. Explain what each source type can and cannot establish. |
| Date/version/freshness visibility | `freshness-check`, `touchpoint-stale`, `live-confirmation-required` | Present structurally | Yes. Explain downgrade and live-check consequences in plain language. |
| Privacy/security handling visibility | BR04 privacy hooks and audit linkage surfaces; evidence local-validation boundary | Partial structural support | Yes. Front-stage trust copy should explain local handling and boundaries without overclaim. |
| External action ownership visibility | `external-action-owner`, review/handoff ownership state (`USER_OR_OPERATOR`) | Present structurally | Low-to-medium. Reinforce that official action stays outside product execution. |
| Readiness-vs-filing distinction | readiness trust cues and `boundary.readiness-not-filing` family | Present structurally | Yes. This remains a high-risk comprehension area without reinforcement content. |
| Stop/reroute/referral clarity | `referral-stop`, `wrong-channel-reroute`, slowdown/referral review-state cues | Present structurally | Yes. Explain why ordinary progression is unavailable and what next action is in scope. |

## 6. Trust-cue coverage map across frozen Lane 2 surfaces

| Frozen surface family | Existing structural trust cues now | Boundary keys already attached | Comprehension still needs supporting content? |
| --- | --- | --- | --- |
| Promise/readiness surfaces (`readiness-summary`, `blocker-summary`, `review-hold-points`) | `trust-cue.readiness-summary`, `trust-cue.blocker-summary`, `trust-cue.review-hold` | `boundary.readiness-not-filing` | Yes. Users still need plain-language explanation of local readiness vs official action. |
| Snapshot/source surfaces (`matter-summary`, `arrears-snapshot`, `source-index`) | `trust-cue.local-matter-snapshot`, `trust-cue.local-arrears-snapshot`, `trust-cue.visible-source-labels` | Contextual (not all surfaces carry boundary keys directly) | Yes. Source-type labels need concise interpretation help. |
| Handoff core (`handoff-boundary`, `external-action-owner`, `review-before-official-step`) | `trust-cue.boundary-codes-visible`, `trust-cue.external-action-owner`, `trust-cue.review-before-official-step` | `boundary.prep-and-handoff-only`, `boundary.no-product-submission`, `boundary.no-portal-mimicry`, `boundary.handoff-not-completed-official-step` | Low-to-medium. Structural cues exist; supporting text should reinforce who acts next and where. |
| Touchpoint/freshness controls (`freshness-check`, `touchpoint-stale`, `live-confirmation-required`, `wrong-channel-reroute`) | `trust-cue.freshness-check`, `trust-cue.touchpoint-stale`, `trust-cue.live-confirmation-required`, `trust-cue.wrong-channel-reroute` | `boundary.readiness-not-filing`, `boundary.no-portal-mimicry`, `boundary.handoff-not-completed-official-step` | Yes. Users need explicit downgrade/reroute consequences explained in plain language. |
| Referral/slowdown controls (`referral-stop`, `slowdown-review`, `guarded-review-flags`) | `trust-cue.referral-stop`, `trust-cue.slowdown-review`, `trust-cue.guarded-review-flags` | Mostly `boundary.readiness-not-filing` and handoff boundaries | Yes. Must explain why progression is paused/stopped and what support is still in-scope. |

## 7. Warning-family baseline (frozen semantic families)

| Family | Current runtime/control anchors | Required trust boundary |
| --- | --- | --- |
| Service warnings | `SERVICE_PROOF_GUARDED`, `HAND_SERVICE_REVIEW_GUARDED`; BR02 service-method distinction | Recorded proof does not imply legal sufficiency |
| Evidence timing warnings | `EVIDENCE_TIMING_REVIEW`, guarded evidence milestone, dual-step timing posture | Generic timing must not outrank hearing-specific/official instruction |
| Handoff warnings | Handoff boundary codes, external-action-owner guidance, official-step external state | Product does not file/submit/complete official acts |
| Referral/sensitive overlay warnings | `referral-stop`, wrong-channel reroute, BR01 referral/route-out posture | Referral-first is stop-and-reroute, not ordinary progression |

## 8. Event-linked pricing trigger matrix (baseline, hypothesis-aware)

This matrix defines supportable event moments, not pricing doctrine. Commercial decisions remain unresolved.

| Event-linked trigger moment | Detectable product signal now | Supportable support offer shape now (bounded) | Must-not-imply boundary | Evidence vs inference |
| --- | --- | --- | --- | --- |
| 14+ day arrears stress moment | `thresholdState.kind = THRESHOLD_MET`; timeline `arrears-threshold-moment` becomes eligible when threshold rule conditions are met (including day threshold configured in rule input) | Paid preparation/review support around notice-readiness and evidence organization | Payment does not buy filing, acceptance, or legal outcome | Detection is settled. Conversion value remains hypothesis. |
| Review-heavy or referral-heavy stop states | Notice-readiness `REVIEW_REQUIRED` / `REFER_OUT` / `BLOCKED`; `slowdown-review` or `referral-stop` blocks appear | Paid guided-review support or referral-handoff support pack | Payment does not replace legal advice or remove guarded uncertainty | Stop-state detection is settled. Offer fit is hypothesis. |
| VCAT-adjacent escalation moment | Timeline `hearing-placeholder` is external-dependent; external handoff dependency visible; live-confirmation/wrong-channel controls may activate | Paid escalation-prep support before external action (document preparation, boundary-safe checklists, handoff framing) | No portal mimicry, no product-side official submission, no claim of tribunal execution | Escalation adjacency signals are settled. Monetization tolerance is unresolved. |
| Official-handoff-adjacent support moment | Official handoff stage and guidance blocks (`handoff-boundary`, `external-action-owner`, `review-before-official-step`) indicate external next-action handoff | Paid handoff-coordination support (pack quality, sequencing visibility, source/freshness cues) | No charging as if product performs free official acts; no official equivalence implication | Handoff moment detection is settled. Packaging/pricing design is unresolved. |

## 9. Known comprehension-risk inventory

| Risk ID | Risk statement | Where it appears | Supporting-content mitigation allowed in BR05 |
| --- | --- | --- | --- |
| `CR-01` | Abstract readiness language can be misread as official completion | Readiness summaries, progression surfaces | Add concise explanation panels that restate local-only readiness and external next step |
| `CR-02` | Source labels may be seen as generic credibility badges instead of actionable trust cues | Source index and freshness-sensitive surfaces | Add source-type explainer content (what each source type can and cannot establish) |
| `CR-03` | `LOCAL_VALIDATION_READY` can be mistaken for evidentiary/legal sufficiency | Evidence/supporting-evidence surfaces | Add explicit support copy that local validation is file/structure-only |
| `CR-04` | Stale/live confirmation states can be treated as minor warnings rather than control gates | Touchpoint stale/live/wrong-channel surfaces | Add consequence-led helper content (what must happen before reliance) |
| `CR-05` | Referral-first can be interpreted as optional caution | Referral-stop surfaces | Add plain-language stop/reroute rationale and next-action boundary |
| `CR-06` | Event-based pricing can be interpreted as paying for official action rights | Pricing-adjacent explanatory content and upgrade moments | Add explicit payment boundary statements: support/preparation only |
| `CR-07` | 14+ day trigger may be over-generalized as universal legal deadline | Threshold and timing surfaces | Explain threshold-rule dependence and preserve hearing/official override precedence |

## 10. Frozen vs authorable vs unresolved

| Category | Items | BR05 action posture |
| --- | --- | --- |
| Frozen protected lines/surfaces | Hero promise, support-label hierarchy, boundary code posture, warning-family meaning, CTA hierarchy, trust-cue-bound state requirements | Preserve exactly; no direct rewrite |
| Supporting explanatory content that can be authored | Plain-language trust-cue explainers, source-label explainers, local-vs-official boundary explainers, pricing-boundary disclaimers tied to event moments | Author around frozen surfaces without changing protected lines |
| Unresolved commercial questions | Price points, packaging names, conversion assumptions by trigger, subscription vs event-pack mix, discounting, referral partner economics | Keep explicitly hypothesis-only; no canon claim and no runtime branching |

## 11. Baseline decision record for this task

- Lane 2 protected copy/state/CTA/trust surfaces remain untouched.
- BR05 output in this task is documentation-only and source-grounded.
- Event-linked pricing moments are captured as supportable trigger hypotheses, not settled commercial truth.
- Trust and boundary posture remains operational: preparation support plus explicit external handoff, with no legal-authority or portal-mimicry drift.
