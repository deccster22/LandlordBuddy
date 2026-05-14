# P4C-CX-L3-JOURNEY-INVENTORY-01 Provisional Product Journey and Screen Inventory Pack

Date: 2026-05-15
Task ID: P4C-CX-L3-JOURNEY-INVENTORY-01

Scope: convert guarded low-fidelity shell/current-matter sketch outputs into a provisional journey and screen inventory without opening final architecture, final UI/copy/status/CTA decisions, visual lock, or implementation work.

This is a documentation and journey-inventory artifact only.
It does not change runtime code, tests, UI implementation, copy, routing behavior, logging behavior, sink behavior, status labels, CTA hierarchy, analytics/admin/support tooling, rendered surfaces, visual assets, or product semantics.

## 1. Provisional-Order Warning

- Flow order in this pack is provisional and not final navigation architecture.
- Sketches are not approved UI and do not authorize rendered behavior.
- Screen names in this pack are working names only and not final naming.
- Placeholder text from low-fi sketches is not copy.
- CTA/status treatment remains gated and requires separate downstream review.

## 2. Input Sketch Set and Guarded Assumption

- Primary low-fi source present in repo:
  - `WF-01` through `WF-06` from `P4C-CX-L3-WIREFRAME-01`.
- Additional low-fi source assumed from prior accepted chain context:
  - `WF2-01` through `WF2-07` from `P4C-CX-L3-WIREFRAME-02`.
- Guarded assumption:
  - `P4C-CX-L3-WIREFRAME-02` is referenced by task sequence but not yet present as a file on current `main`; this pack uses its accepted zone set and flow shape as provisional input only.

## 3. Provisional Journey Map Table

| Journey stage ID | Stage name | User purpose | Product purpose | Candidate screen(s) | Entry trigger | Exit condition | Next-action owner | Trust / boundary cue requirement | Lifecycle-state involvement | Handoff / review / warning involvement | Source sketch reference | Readiness classification | Unresolved decision | Gate before implementation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `JST-01` | entry / shell home | orient to current operating context | maintain bounded shell entry without PM-suite drift | `SCR-01` | product entry or return from handback | proceed to context, active matters, or launcher | user | trust cue + shell boundary cue | none required | warning candidate only if prior guarded state exists | `WF2-01` | `PROVISIONAL` | whether shell entry prioritizes active matters or launcher | Lane 3 journey consolidation + Review C precheck |
| `JST-02` | property/tenancy context | locate relevant context before matter work | provide bounded continuity context | `SCR-02` | selected from shell home or active matters | launch matter, return, or pause | user | trust cue where reliance is implied | indirect | review cue if contextual gaps exist | `WF2-02` | `NEEDS_FORM_ARCHITECTURE` | minimum context fields before launcher | Lane 2 form/question catch-up |
| `JST-03` | active matters | locate existing work-in-progress | expose bounded matter continuity list | `SCR-03` | shell home entry or handback return | open launcher or current matter | user | trust cue + source freshness cue | indirect | warning/review cue for guarded entries | `WF2-03` | `NEEDS_JOURNEY_DECISION` | list grouping and ordering rules | Lane 1 journey consolidation |
| `JST-04` | matter launcher | choose bounded workflow entry | route into objective-first flow without legal-strategy implication | `SCR-04` | active matters or shell entry | proceed to current matter or arrears workflow | user | boundary cue at launcher transition | indirect | warning cue for guarded launch constraints | `WF2-04` | `CONTRACT_BACKED` | launcher entry branching precedence | Lane 3 screen contract refresh + Legal/Risks/Rules check |
| `JST-05` | current-matter view | continue matter work | host bounded lifecycle/current-matter envelope | `SCR-05` | launcher or active matter selection | continue, hold, interrupt, handoff, or handback | user | trust cue adjacency at consequential zones | direct | review/referral/warning zones become active | `WF-01`, `WF-06`, `WF2-05` | `CONTRACT_BACKED` | zone emphasis under mixed guarded states | Review C rendered-surface comparison gate |
| `JST-06` | lifecycle context | inspect lifecycle posture context | preserve protected lifecycle distinctions | `SCR-06` | entered within current-matter envelope | return to continuity, interruption, or review area | product + user | privacy/lifecycle boundary cue | direct | review cue when cannot-resume/no-signal/hold present | `WF-02`, `WF2-05` | `CONTRACT_BACKED` | how much lifecycle context is surfaced per stage | Lane 3/Lane 4 gate + Review C |
| `JST-07` | arrears / notice workflow entry | enter hero workflow path | maintain hero wedge precedence and handoff boundaries | `SCR-07` | launcher branch for arrears objective | continue hero workflow or return | user | prep-vs-official boundary cue | indirect | warning and referral carry-forward as needed | `WF2-06` | `NEEDS_FORM_ARCHITECTURE` | minimum objective/context bundle at entry | Lane 2 form architecture gate |
| `JST-08` | output / handoff continuation | prepare continuation/handoff context | preserve prep-and-handoff external ownership | `SCR-08` | downstream from current-matter progression | handoff, review, referral, or pause/return | split (user + official system externally) | explicit not-official-filing boundary cue | direct when lifecycle affects continuity | review/referral/warning may override ordinary continuation | `WF-03`, `WF2-05`, `WF2-06` | `HOLD_PENDING_REVIEWC_RENDERED_SURFACE_COMPARISON` | handoff zone prominence under interruptions | Review C + Legal/Risks/Rules gate |
| `JST-09` | warning / interruption candidate | surface guarded interruption points | keep fail-safe interruption bounded and non-punitive | `SCR-09` | cannot-resume, no-signal, or guarded no-record context | route to review/referral/hold or controlled return | product + user | referral/review cue adjacency | direct | warning and review moments are primary | `WF-04`, `WF2-05` | `HOLD_PENDING_LANE3_UIUX_SCREEN_CONTRACT` | interruption escalation precedence | Lane 3 warning-boundary contract refresh |
| `JST-10` | review / referral / handoff | separate consequential pathways | keep review/referral/handoff distinct and non-certifying | `SCR-10` | interruption or guarded continuation branch | referral exit, handoff exit, hold, or return | split (user + referral owner) | trust + boundary cues required | direct | review/referral/handoff moment primary | `WF-05`, `WF2-05` | `HOLD_PENDING_LEGAL_RISKS_RULES_REVIEW` | referral-first presentation under mixed states | Legal/Risks/Rules + Review C |
| `JST-11` | return-to-shell / handback | return with next-action-owner clarity | preserve continuity without completion/finality claim | `SCR-11` | end of current-matter cycle or temporary exit | back to shell, active matters, or unresolved state | user | trust cue + boundary cue at handback | indirect | warning/review carry-forward may persist | `WF2-07` | `PROVISIONAL` | handback trigger threshold and unresolved-state behavior | Lane 1 journey consolidation + Review C precheck |

## 4. Candidate Screen Inventory Table

| Screen ID | Screen name (working) | Screen purpose | Primary user question | Allowed conceptual content | Forbidden content | Internal source dependencies | Lifecycle-state dependency | Form/question dependency | Visual dependency | Copy dependency | Review C dependency | Legal/Risks/Rules dependency | privacy/minimisation dependency | Implementation readiness | Risk if implemented too early | Gate before design/build |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `SCR-01` | shell home | bounded shell entry context | "Where do I continue next?" | shell context placeholders, entry transitions | final status labels, PM-suite framing, official-portal framing | shell continuity contract, active matters feed | low | medium | high | high | required | required | required | `PROVISIONAL` | shell could be misread as final IA | Lane 1 consolidation + Lane 3 contract check |
| `SCR-02` | property/tenancy context | continuity context support | "Do I have enough context to continue?" | context placeholders, caution placeholders | legal sufficiency claims, compliance signals | context registry + matter linkage | medium | high | high | high | required | required | required | `NEEDS_FORM_ARCHITECTURE` | context can imply legal advisory behavior | Lane 2 form/question catch-up |
| `SCR-03` | active matters | list continuity surface | "Which matter should I open?" | provisional rows, continuity markers | final taxonomy, final status language | matter registry + lifecycle summary pointers | medium | medium | high | high | required | required | required | `NEEDS_JOURNEY_DECISION` | list semantics may freeze too early | Lane 1 consolidation gate |
| `SCR-04` | matter launcher | bounded workflow entry | "What can I open safely?" | objective-first launcher placeholders | legal path selection implication, official action implication | launcher contract + objective routing | medium | high | high | high | required | required | required | `CONTRACT_BACKED` | launcher may be interpreted as legal strategy | Lane 3 screen contract + legal trust review |
| `SCR-05` | current-matter envelope | host lifecycle/current-matter zones | "What should I work on in this matter?" | zone containers and trust/boundary cues | final copy, final CTA hierarchy, final status labels | `SCRC-01` outputs + routing/directive/handling outputs | high | medium | high | high | required | required | required | `CONTRACT_BACKED` | could be mistaken for build-ready UI | Review C + Lane 4 + Lane 3 gate |
| `SCR-06` | lifecycle context panel | preserve lifecycle distinctions | "What lifecycle context applies right now?" | no-record/no-signal/hold/release/deletion/de-identification context placeholders | clearance claims, success/finality claims | lifecycle planner slice + route metadata | high | low | high | high | required | required | required | `CONTRACT_BACKED` | lifecycle cues may become pseudo-statuses | Review C + copy boundary gate |
| `SCR-07` | arrears workflow entry | bridge to hero wedge | "Can I move into arrears workflow entry?" | objective continuity placeholders, boundary cue | filing-readiness or legal-advice implication | BR01/BR02 entry prerequisites + launcher state | medium | high | high | high | required | required | required | `NEEDS_FORM_ARCHITECTURE` | could overstate readiness to proceed | Lane 2 + Lane 3 + legal trust gate |
| `SCR-08` | output/handoff continuation | prep-to-handoff bridge | "What is ready for external continuation?" | prep continuity placeholders, external-boundary cue | submit/filed/accepted/final language | output/handoff contract + planner context | high | medium | high | high | required | required | required | `HOLD_PENDING_REVIEWC_RENDERED_SURFACE_COMPARISON` | handoff may look like in-product filing | Review C + Legal/Risks/Rules |
| `SCR-09` | warning/interruption candidate | fail-safe interruption zone | "Can I safely continue from saved context?" | bounded interruption placeholders | punitive/advisory/legal-finding copy | cannot-resume/no-signal/no-record pathways | high | low | high | high | required | required | required | `HOLD_PENDING_LANE3_UIUX_SCREEN_CONTRACT` | interruption could collapse into generic alert | Lane 3 warning contract + Review C |
| `SCR-10` | review/referral/handoff | consequential separation | "Do I need review, referral, or handoff?" | separated consequence placeholders | merged success state, official equivalence | review/referral routing + handoff posture | high | medium | high | high | required | required | required | `HOLD_PENDING_LEGAL_RISKS_RULES_REVIEW` | referral-first posture can be diluted | Legal/Risks/Rules + Review C |
| `SCR-11` | return-to-shell handback | owner handback continuity | "What should happen next?" | handback placeholders and owner cues | completion/finality claims | handback mapping + active-matter reinsertion | medium | low | high | high | required | required | required | `PROVISIONAL` | handback may imply closure/clearance | Lane 1 + Review C precheck |

## 5. State-To-Screen Map

| Internal state | Possible future screen area | Allowed planning interpretation | Forbidden user-facing interpretation | Required Review C inspection | Gate before rendered use |
| --- | --- | --- | --- | --- | --- |
| lifecycle context available | `SCR-05`, `SCR-06` | continuity-context planning signal only | ready/cleared/safe/final | continuity framing remains non-certifying | Lane 3 + Lane 4 + Review C |
| no-record non-clearance | `SCR-06`, `SCR-09`, `SCR-10` | missing-record guarded planning context with `clearanceInferred=false` | all good, record complete, safe deletion | anti-fake-clearance posture remains explicit | Review C + Legal/Risks/Rules |
| malformed/cannot-resume | `SCR-09`, `SCR-10` | fail-safe interruption/referral candidate | temporary glitch, auto-continue | fail-safe interruption remains bounded and explicit | Lane 3 interruption contract + Review C |
| no-signal | `SCR-09`, `SCR-10` | explicit no-routing-signal guarded state | default proceed/success | no-signal remains explicit, non-default | Review C + routing-boundary check |
| hold-aware | `SCR-06`, `SCR-09`, `SCR-10` | hold context and consequential caution planning | resolved/cleared/finished | hold scope and caution carry-forward remains visible | Legal/Risks/Rules + privacy review |
| release-controlled | `SCR-06`, `SCR-10` | release-controlled transition context planning | immediate free proceed | release confirmation dependency remains explicit | Review C + trust/boundary review |
| deletion route | `SCR-06` | lifecycle route distinction planning only | record gone = safe/compliant | route distinction and non-clearance posture preserved | privacy/security/storage review gate |
| de-identification route | `SCR-06` | lifecycle route distinction planning only | anonymised = legally sufficient | de-identification distinction preserved, no legal claim | privacy/security/storage review gate |
| lifecycle/non-lifecycle separation | `SCR-05`, `SCR-06`, `SCR-10` | separate inspectable slices carried through screen planning | collapsed single success state | separation remains visible across consequential zones | Review C + architecture parity check |

## 6. Next-Action-Owner Map

| Context | User action | Product action | Official-system action | Human/legal/support referral action | No-action / hold / cannot safely continue state |
| --- | --- | --- | --- | --- | --- |
| shell entry | select context or launcher | present provisional continuity pathways | none | none | pause/return allowed |
| active matters | open matter or launcher | preserve continuity references | none | none | unresolved decision can hold |
| launcher | choose bounded workflow path | apply objective-first routing constraints | none | referral gate possible | guarded stop if unresolved |
| current matter | continue planning steps | preserve lifecycle/non-lifecycle separation | none | review/referral pathway prepared | hold/cannot-resume can block continue |
| interruption candidate | acknowledge interruption context | retain fail-safe interruption posture | none | referral/review owner may be next actor | explicit no-continue candidate |
| review/referral/handoff | choose review/referral/handoff direction | keep pathways distinct and non-certifying | external continuation may occur outside product | referral/review owner can become primary | hold/needs-decision can remain active |
| output/handoff continuation | prepare handoff package context | preserve prep-vs-official boundary | official steps remain external | optional support/legal handoff context | unresolved handoff remains explicit |
| handback | return to shell or active matters | show next-action-owner continuity marker | none | none | unresolved return state retained |

## 7. Exit-Point Map

| Exit type | Description | Candidate stage/source | Next-action owner | Guardrail note |
| --- | --- | --- | --- | --- |
| temporary exit | user pauses and returns later | `JST-01`, `JST-03`, `JST-11` | user | no completion/finality implication |
| handoff exit | prep ends, external continuation begins | `JST-08`, `JST-10` | split (user + official system external) | explicit external-action boundary required |
| referral exit | bounded referral path triggered | `JST-09`, `JST-10` | referral/review owner | no ordinary-handoff override when referral-first applies |
| cannot safely continue exit | fail-safe interruption blocks ordinary continuation | `JST-09` | user + review/referral owner | cannot-resume/no-signal remain explicit |
| return-to-shell exit | handback to shell continuity surfaces | `JST-11` | user | return does not imply resolved state |
| unresolved / needs decision exit | ambiguity explicitly held for later decision | any guarded stage | product + user | do not auto-resolve to success |

## 8. Trust/Handoff/Review Moment Register

| Moment type | Where it appears | Why it matters | Required cue posture |
| --- | --- | --- | --- |
| warning moment | interruption candidate, active matters, current matter | preserve guarded/fail-safe posture | warning placeholders remain bounded and non-advisory |
| review moment | review/referral/handoff zone, lifecycle context | preserve explicit review-led paths | review cue adjacent where consequential interpretation is possible |
| referral moment | interruption + review/referral zones | protect referral-first and wrong-channel boundaries | referral cue cannot be subordinated to ordinary continuation |
| privacy/lifecycle moment | lifecycle context panel and consequential transitions | preserve hold/release and route distinctions | privacy/lifecycle cue required when hold/delete/de-identification is relevant |
| official handoff moment | output/handoff continuation and review/referral/handoff | preserve prep-vs-official boundary | explicit not-official-filing boundary cue required |
| source/freshness moment | continuity and active matters surfaces | avoid overreliance on stale/partial context | source/freshness cue required near reliance-sensitive areas |

## 9. Visual Dependency Section

- No final visual lock is required or implied.
- R2C2 remains working identity input only.
- Lane 4 visual system governs any later rendered treatment.
- App tile/logo progress does not authorize lifecycle/status UI exposure.

## 10. Review C Inspection Checklist

- journey does not imply alpha readiness
- shell does not look like a generic property-management suite
- shell does not look like an official portal
- lifecycle/current-matter states do not imply clearance
- no-record non-clearance is preserved
- cannot-resume fail-safe is preserved
- explicit no-signal is preserved
- hold/release distinction is preserved
- deletion/de-identification distinction is preserved
- lifecycle/non-lifecycle separation is preserved
- trust/boundary cue adjacency is visible
- CTA/status separation is preserved
- no fake official/portal equivalence

## 11. WLB-01 Status

- `WLB-01` remains held.
- This provisional journey/screen inventory pack does not create any reason to reopen `WLB-01`.

## 12. Next-Option Analysis

### Option A: Lane 1 journey map consolidation using this inventory

- Upside: tightens provisional stage ordering/ownership decisions without opening rendered design work.
- Risk: can over-stabilize flow order before form architecture dependencies are explicit.

### Option B: Lane 2 form/question architecture catch-up

- Upside: resolves key screen-input dependencies (`SCR-02`, `SCR-07`) and reduces premature surface assumptions.
- Risk: requires careful scope control to avoid drifting into copy/CTA decisions.

### Option C: Lane 4 visual-state treatment contract

- Upside: starts rendered-state treatment guardrails.
- Risk: sequencing risk if form/journey dependencies remain unresolved.

### Option D: Review C rendered-surface comparison prep pack

- Upside: strengthens comparison criteria early.
- Risk: may be broader than needed before journey/form dependencies settle.

Recommended next move: **Option B**.

Rationale: this inventory exposes the strongest near-term unresolved dependencies in form/question architecture and entry/exit preconditions; resolving those first reduces downstream risk before visual-state or rendered-comparison work.
