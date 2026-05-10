# Master Canon v1.3 Operational Extract

Date added: 2026-05-04
Source: `LandlordBuddy_Master_Canon_v1.3_Detailed_corrected.docx`
Canon date: 2026-04-23
Status: repo source snapshot, not a replacement for the full canon document

## Authority boundary

This is an internal durable-truth extract, not a legal source. It preserves the operational spine of Master Canon v1.3 for repo contributors.

At all times, the project must distinguish between:

- confirmed legal requirements
- official guidance
- live portal/form behaviour
- best practice
- inference or unresolved items

False certainty remains a core trust and compliance risk.

## Current canon state

- Landlord Buddy remains Victoria-first, residential-only, and focused first on arrears-to-resolution.
- The product is a procedural-risk-prevention product with a focused operating shell around the arrears-first hero workflow.
- It is not a generic landlord education product, legal adviser, or property-management suite.
- Phase 3B is formally past broad discovery.
- BR01-BR05 have been adjudicated to Guarded Green with bounded operating postures and preserved exclusions.
- Phase 4C is shaping the first-wave app experience around the governed spine.
- Remaining work is controlled UI exposure, tracker/digest alignment, live-tool freshness handling, and guarded edge implementation.

## Core product canon

- Product concept: paid Victoria-first workflow and compliance product for self-managing residential landlords.
- Identity boundaries: not a law firm, not a substitute for legal advice in complex matters, not a generic property-management suite.
- North Star: help self-managing Victorian landlords complete common residential tenancy workflows correctly, confidently, and with less dispute risk.
- First job: prevent expensive admin and process mistakes in high-stress landlord workflows.
- Core villain: costly procedural failure caused by confusion, bad sequencing, missing evidence, and false confidence.
- Primary users: self-managing Victorian residential landlords, especially one/few-property owners.
- Jurisdiction: Victoria only, residential tenancies only, not national at MVP.

## Focused operating shell canon

The MVP includes a focused operating shell that provides:

- account/profile context
- property records
- tenancy records
- renter records
- active matters
- manual rent tracking and simple ledger
- current arrears status
- lease renewal / tenancy milestone reminders
- inspection reminders and outcome tracking
- manual maintenance register
- notes / observations / condition entries
- document and evidence vault
- matter launcher
- structured export

The shell provides operational continuity, reminder/logging value, evidence/document continuity, and a credible home for the arrears-first hero workflow. It does not change the MVP wedge.

The shell must not drift into:

- accounting integrations
- full accounting-suite behaviour
- tax advice or tax optimisation
- maintenance marketplace / tradie booking
- tenant messaging platform
- direct official filing/submission
- generic PM-suite sprawl
- national expansion complexity

## Major decision spine

| Decision | Status | Repo implication |
| --- | --- | --- |
| D01 MVP wedge prioritises arrears-to-resolution first | Confirmed | Preserve arrears-first MVP sequencing |
| D08 Separate confirmed law, official guidance, live portal/form behaviour, best practice, and inference | Confirmed | Do not flatten source types in UI/docs/code |
| D15 Treat the arrears wedge as deterministic-plus-guarded workflow | Confirmed | Use validators/hard gates for stable rules, warnings/slowdown/referral for guarded areas |
| D18 Implement layered rule hierarchy | Confirmed | Avoid false certainty from flattened rule logic |
| D19 Enforce deterministic rules; warn/slow/refer on discretionary/forum-dependent issues | Confirmed | Preserve warning/referral/hard-stop distinction |
| D20 Treat live portal/form behaviour as freshness-sensitive operational logic | Confirmed | Registry/staleness controls are product logic, not admin garnish |
| D23 Future expansion remains jurisdiction-specific | Likely | Do not build national MVP logic |
| D24 Arrears MVP remains narrow; payment integration/full accounting parked | Likely | Keep scope discipline |
| D25 Accept BR01-BR05 as Guarded Green | Confirmed | Phase 3B is no longer vague amber, but ambiguity remains bounded |
| D26 Include focused operating shell above arrears-first hero workflow | Likely | Shell exists, but remains bounded and wedge-first |

## Legal, boundary, and trust doctrine

- Landlord Buddy must not provide bespoke legal advice, recommend personalised legal paths, or draft bespoke legal correspondence.
- Safe role: administration, official-form assembly, evidence management, record-keeping, neutral rule-based workflow guidance, and referral gates.
- Disclaimers are secondary controls only.
- Boundary statements must be short, visible, and repeated at reliance moments.
- Product must visibly distinguish confirmed law, official guidance, live portal/form behaviour, best practice, and unresolved items.
- High-stakes workflows should surface source grounding, freshness, privacy/security cues, official-form fidelity, evidence/audit support, and referral pathways.
- Preferred front-stage expression: `Prepare your Notice to Vacate`.
- Most credible first paid moment: notice-preparation step after 14+ day arrears eligibility is met. This is likely commercial posture, not final pricing truth.

## Arrears wedge canon

- Safest and strongest wedge promise: process correctness around routing, deadlines, service, evidence, and escalation readiness.
- Mixed-claim routing starts with claim objective.
- Possession/eviction and money/remedy routes remain structurally distinct.
- If either party resides interstate, standard arrears-possession VCAT path must hard-stop and route out to the appropriate non-VCAT path, currently treated as Magistrates' Court pathway.
- Hard-stop principles: no early arrears notice before rent is more than 14 days late, no late/admin fee support, no self-help eviction implication/facilitation.
- 14-day unpaid-rent notice is valid only where rent is at least 14 days overdue and the notice specifies arrears amount.
- Current arrears Notice to Vacate forms must capture arrears amount, paid-to date, and notice number.
- Payment-plan timing is explicit branching logic: lodged at least 7 business days before hearing -> hearing cancels; lodged later -> hearing does not cancel but plan can still be presented.
- Service hierarchy: registered post preferred deterministic/low-ambiguity path; email requires stored consent proof for each renter served; hand service remains guarded/review-led.
- Evidence timing is dual-step and override-sensitive: 7-day send/share step, 3-day portal upload step, and hearing-notice override where applicable.
- Generic timing language must not outrank hearing-specific instructions.

## Privacy, portal, and official-tool canon

- Portal doctrine: prep-and-handoff; mirror only stable public guidance; public forms only for guarded draft/prep support; authenticated official actions handoff-only unless directly verified and maintainable.
- Official touchpoints are freshness-sensitive operational logic and must degrade safely when stale/uncertain.
- From 31 March 2026, Victorian rental-application tooling must use the prescribed form and must not request extra information outside that form.
- Rental-application tooling remains out of beta unless fully compliant.
- Privacy posture: APP-equivalent, class-based, hold-aware, lifecycle-driven.
- Retention must use class-based schedules, scoped preservation override, and hold-aware logic rather than universal `keep everything forever` or universal deletion.

## Product implementation doctrine

The arrears wedge is buildable in principle. Current research supports:

- intake
- arrears calculator
- strike counter
- notice validator
- service/date engine
- post-notice validator
- possession-readiness validator
- evidence validator
- payment-plan validator
- warning engine
- referral engine
- secure document storage

High-confidence validator candidates include:

- days-in-arrears calculation
- strike-count logic
- minimum termination-date logic
- service-method validation
- mandatory notice fields
- possession-gate readiness
- evidence file constraints
- payment-plan completeness
- interstate-party route-out
- no-early-notice gate
- no-late-fee gate
- no-self-help-eviction gate

## Repo warning

This extract is source context. Where a more recent accepted repo decision, Gate A checkpoint, or implementation spec narrows or gates a canon point, follow the newer accepted repo posture and preserve the review-event trail.
