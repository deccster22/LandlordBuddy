# Operating Shell Decision Stack

Date added: 2026-05-04
Sources:

- `LandlordBuddy 4C Product Operating Shell Decision - incl. Legal and Marketing inputs.pdf`
- `Operating Shell Risk and Inclusion Note v0.1.pdf`
- `Marketing Product-Shape Update Pack v2.pdf`

Status: repo source snapshot

## Decision

Include a focused operating shell above the arrears workflow.

Status: Likely.

Why: the wedge should be the strongest room in the house, not the entire house. A customer-facing product needs an outer layer that feels like a real app landlords can return to regularly, while staying bounded and avoiding generic PM-suite bloat.

Evidence basis: founder brief, operating principles, canon, forward plan, and 4C pack all support a workflow/compliance product with entity structure, operational continuity, trust posture, and product-experience construction beyond a single wizard.

Risk if wrong: scope creep into generic PM sludge.

Revisit trigger: once Product maps shell screens, question architecture, and first UI contracts.

## What is included now

- account/profile
- one or more properties
- tenancy details
- renter details
- active matter list
- basic bond status visibility, including whether bond was paid
- rent amount and frequency
- next expected rent date
- manual rent received entry
- simple rent history / ledger view
- current arrears status
- mandatory landlord-side compliance reminders where trigger/due date can be derived from captured facts
- lease start/end and renewal/expiry reminder
- inspection reminders and outcome status
- manual maintenance / issue register
- general property, tenancy, matter, condition, observation notes
- document and evidence vault
- matter launcher
- structured export for ledgers, summaries, and bundles

## What is rejected now

- accounting software integrations
- full accounting suite behaviour
- tax advice / tax optimisation
- direct tax calculations beyond simple reporting summaries
- maintenance marketplace / tradie booking
- tenant messaging platform
- direct official filing / submission
- generic PM-suite sprawl
- national expansion complexity

## Legal/risk shell doctrine

The shell is acceptable only as:

- operational context
- reminder / logging continuity
- evidence and document continuity
- matter launching into the hero workflow

It is not permission to become:

- generic PM suite
- legal advisor
- maintenance platform
- accounting tool
- portal-submission product

## Core legal boundary

Landlord Buddy may support administration, official-form assembly, evidence management, recordkeeping, neutral rule-based workflow guidance, reminders, and referral gates.

It must not:

- provide bespoke legal advice
- recommend personalised legal paths
- draft bespoke legal correspondence

The operating shell does not change that boundary.

## Reminder rule

A reminder is in scope only if all are true:

1. It relates to a mandatory or clearly lawful landlord-side obligation or milestone.
2. The trigger can be calculated or reliably derived from captured facts.
3. The product is not choosing a legal path or strategy for the user.
4. The reminder surface does not imply fake all-clear or guaranteed compliance.
5. Legally sensitive ambiguity remains warning-led, review-led, or excluded.

Reminder risk watchlist:

- unresolved legal classification
- possible confusion with official notice/service advice
- certification-like reminder language
- dependency on external official systems the product does not control

## Bond, inspection, maintenance, notes, and export posture

Bond status is factual visibility only. It is not a legal conclusion, compliance verdict, or substitute for official RTBA truth.

Inspection, maintenance, and notes are allowed as recordkeeping, chronology, outcome logging, and attachment/evidence continuity. They are not legal adjudication, breach determination, or advice about enforcement steps.

Structured export is allowed for human-readable summaries, CSV/accountant-friendly outputs, and document bundles. It is not official filing, tribunal acceptance proxy, legal sufficiency guarantee, or court-ready magic without guarded review logic.

## Marketing posture

Updated working positioning:

Landlord Buddy is a focused workflow and compliance operating product for self-managing Victorian landlords, with a powerful arrears and dispute workflow inside it.

Plain-English version:

Landlord Buddy helps landlords keep the tenancy organised with reminders, records, and evidence continuity, and helps them prepare correctly when arrears or dispute steps become formal.

## Message hierarchy

- Hero truth: prepare correctly when arrears or disputes turn formal.
- Support truth: stay organised with reminders, records, and evidence continuity before higher-stakes steps arise.
- Operating-shell truth: keep property, tenancy, rent tracking, reminders, records, and documents in one structured workflow.
- Trust truth: built for workflow support, reminders, records, and evidence continuity; not a law firm, not a filing portal, and not a generic property-management suite.

## Launch-surface copy discipline

Safe launch-surface territory:

- organisation
- tracking
- preparation
- reminders
- records
- evidence continuity
- next-step readiness
- manual rent tracking and arrears visibility
- inspections, notes, documents, active matters in one place
- structured export for records and bundles
- preparing correctly when arrears or dispute steps matter

Unsafe territory:

- law firm implication
- legal-path selection implication
- official system implication
- reminder equals compliance clearance
- record equals tribunal sufficiency
- export equals filing, acceptance, or legal readiness
- lease/bond/note/inspection status equals legal correctness
- all-in-one landlord OS
- full property management
- tax-ready platform
- maintenance and communications in one place

Short safe rule: reminder support = yes; compliance certification = no.

## Export language posture

Safe:

- export your ledger
- export summaries
- export document bundles
- export records for review
- export organised files and attachments

Unsafe:

- ready for tribunal
- ready for court
- filing-ready
- accepted by VCAT
- hearing-ready pack
- official submission bundle

## Communication chronology note

A bounded communication-log / chronology concept may be a future candidate:

- dated contact entries
- channel type
- factual summary
- linked attachments
- chronology

It does not mean tenant messaging, live chat, negotiation engine, or CRM creep. Do not publicly promise communication tools yet.

## Canon implication

If durable, this justifies a narrow canon delta only:

- MVP remains arrears-first.
- App includes a focused operating shell.
- Shell provides operational context, reminder/logging/evidence/document continuity, and matter launching.
- Shell does not turn the product into a generic property-management suite.

## Repo status note

The repo already contains shell baseline, shell ADR, canon shell delta, and Product structure packs. This source snapshot gives future contributors the combined Product, Legal, and Marketing rationale behind those repo docs.
