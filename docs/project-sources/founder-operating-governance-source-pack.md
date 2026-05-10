# Founder, Operating, Governance, and Roadmap Source Pack

Date added: 2026-05-04
Status: repo source snapshot
Source documents:

- `LandlordBuddy_Founder_Brief.pdf`
- `Landlord Buddy Operating Principles.pdf`
- `LandlordBuddy_Admin_Batch_Runbook_v1.pdf`
- `LandlordBuddy_Master_Operating_Pack_v3.pdf`
- `LandlordBuddy_Phase_Guide_Roadmap_v3.pdf`
- `LandlordBuddy_Blocker_Resolution_Program_v1.pdf`
- `LandlordBuddy Product forward plan.pdf`

## Purpose

This file captures the project-source spine that should be visible to repo contributors. It is intentionally repo-native Markdown rather than a binary document dump.

## Founder brief extract

### Confirmed product frame

- Landlord Buddy is a paid compliance-and-workflow app for Australian landlords, starting with Victorian residential property.
- Target users are existing and prospective self-managing landlords, especially owners with one or a handful of properties.
- The North Star is helping self-managing Victorian landlords complete common residential tenancy workflows correctly, confidently, and with less dispute risk.
- The product is not a law firm and not a generic property-management suite.
- The core villain is costly procedural failure caused by confusion, bad sequencing, missing evidence, and false confidence.
- The MVP wedge remains arrears-to-resolution first: timeline building, evidence checks, notice/document guidance, routing logic, and next-step pack generation.
- MVP exclusions include national rules engine, maintenance marketplace, full accounting suite, and AI legal oracle behaviour.
- Trust posture: source-grounded, Victoria-specific, confidence-aware, and disciplined about referral-out scenarios.

## Operating principles extract

### Research discipline

All project work must distinguish between:

- confirmed legal requirements
- official guidance
- best practice
- inference or speculation

### Source hierarchy

1. Tier 1: legislation, regulations, tribunal rules, official forms, official government guidance
2. Tier 2: regulator guidance, official dispute bodies, official privacy guidance
3. Tier 3: legal aid, community legal centres, official-adjacent guidance
4. Tier 4: credible market sources and product websites
5. Tier 5: commentary, blogs, forums, anecdotal discussion

When sources conflict, prefer the higher-tier source, flag the conflict, and state whether product logic or legal certainty is affected.

### Decision hygiene

Every material conclusion must be tagged:

- Confirmed
- Likely
- Tentative
- Rejected
- Needs Validation

Every material product decision must include:

- decision
- why
- evidence basis
- risk if wrong
- revisit trigger

### MVP blacklist

Do not build yet:

- maintenance marketplace / tradie booking
- generic messaging platform
- full property accounting suite
- tax optimisation tools
- tenant screening rabbit hole
- national multi-state rules engine at MVP
- AI advice chatbot that sounds like a lawyer
- broad commercial leasing support
- dashboards with no workflow leverage

## Admin batch and operating loop extract

### Confirmed operating loop

`Question -> Evidence -> Normalise -> Batch -> Route -> Decide -> Canon`

### Durable layer responsibilities

- Research Control Room owns intake, normalisation, routing, and next-move recommendations.
- Research Digest holds normalised memory worth retaining but not necessarily canonising.
- Tracker / Audit Register holds structured control data.
- Specialist chats receive only sliced decision-relevant packets.
- Master Canon receives durable conclusions only.

### Batch discipline

- Raw research is not operational until normalised.
- Batch 2 to 4 jobs when possible.
- Produce digest draft, register draft, specialist packets, canon delta, and progress note.
- Promote by destination rather than enthusiasm.

## Phase guide and blocker program extract

### Phase 3B progression rule

Do not progress on wedge clarity alone. Every foundational blocker must resolve to Lime Green, beta-safe Guarded Green, or Parked Red before true Phase 4 progression.

### Foundational blockers

| Blocker | Purpose | Operating posture |
| --- | --- | --- |
| BR01 Mixed-Claim Routing | Determine when arrears intersects with bonds, compensation, repairs, damage, or related claims | objective-first routing, split/stop/refer where required |
| BR02 Service / Evidence / Timing Precision | Lock rules and practical sufficiency standards controlling correctness and trust | service hierarchy, dual-step timing, guarded proof standards |
| BR03 Portal / Tool Touchpoint Verification | Decide what can be mirrored, referenced, deferred, or warned about | prep-and-handoff, public mirroring only where stable, authenticated handoff only |
| BR04 Privacy / Retention / Deletion / Legal Hold | Establish defensible beta privacy and preservation posture | APP-equivalent, class-based, hold-aware, lifecycle-driven |
| BR05 Trust / Comprehension / Commercial Viability | Verify wedge legibility, boundary clarity, and payment triggers | concrete promise, visible boundaries, event-linked commercial posture |

### Blocker adjudication fields

For blocker closure, keep:

- blocker ID
- owning chat
- current evidence state
- key source-backed findings
- known contradictions
- product implication
- risk if wrong
- recommended status
- rationale
- beta impact
- re-audit or revisit trigger

## Product forward plan extract

### Phase 4A

Mission: turn the cleared Phase 3B posture into a dependency-aware, build-ready skeleton without hard-coding guarded ambiguity.

Outputs include architecture note, domain model, workflow state model, module map, dependency map, build assumptions register, and first Codex packets.

### Phase 4B

Mission: define and begin implementing non-blocked core workflow surfaces.

Outputs include notice-readiness module spec, arrears/timeline engine spec, evidence vault and audit trail spec, official handoff/output mode spec, trust surface spec, repo scaffolds, and deterministic-rule test strategy.

### Phase 4C

Mission in the older forward plan: prepare repo and product specs so remaining blocker-close extraction work can slot in cleanly.

Note: the later 4C Operating Pack refines this into Product Experience Construction and Launch-Surface Readiness while preserving the rule that 4B remains primary until the app spine is functionally real.

### Phase 5A

Internal alpha prep only starts once admin reconciliation is trustworthy, build-facing extraction tasks have landed, and Product can show a clean non-blocked implementation spine plus controlled guarded insertion points.

## Contributor implication

Use this source pack to understand project intent and governance. Do not use it to override newer accepted repo specs, Gate A decisions, current canon v1.3, or `AGENTS.md`.
