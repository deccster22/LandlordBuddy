# Phase 4C Operating Pack Extract

Date added: 2026-05-04
Source: `Phase 4C Operating Pack .pdf`
Status: repo source snapshot

## Current posture

Phase 4C is Product Experience Construction and Launch-Surface Readiness.

It is not beta. It is not alpha.

Current posture: Phase 4B remains the primary active phase until existing build lanes are completed strongly enough for the first-wave app spine to be considered functionally real. Phase 4C work may proceed in parallel where it helps define user journey, forms, UI/UX, branding, and launch-surface shape.

## 4C mission

Turn the current governed repo spine into a coherent, branded, navigable first-wave product experience.

The project already has:

- strong logic/control spine
- frozen or parked blocker lanes
- semantic/trust fences
- repo-aligned docs/specs/QA artifacts

It does not yet have, in source-pack terms:

- fully defined user journey
- full form/question architecture
- actual first-wave UI/UX
- chosen brand/app-tile/visual system
- app-shaped experience that feels like a product rather than a rule engine with manners

## 4C success statement

By the end of 4C, the project should have a coherent first-wave app shape, real user flows, real forms/questions, reviewable UI/UX, a first-pass brand system, implemented trust/handoff surfaces, and a documented list of what still blocks true internal alpha prep.

## Entry posture

4C starts from:

- 4A complete in substance
- 4B active
- Lane 2 frozen for implementation fidelity
- Lane 4 aligned enough for build-facing control implementation
- BR01 / BR02 / BR03 / BR05 stable enough to park rather than actively redraft, with reopen triggers preserved

Core rule: parked does not mean finished. Frozen does not mean launched.

## Lane map

| Lane | Mission | Review gate |
| --- | --- | --- |
| Lane 1 Product experience and user journey | Define actual first-wave user journey from entry to official handoff | 4C-A |
| Lane 2 Form and question architecture | Turn rule objects into humane, reliable first-wave question flows | 4C-B |
| Lane 3 UI/UX system and screen design | Turn frozen semantics and question flows into reviewable first-wave interface | 4C-C |
| Lane 4 Brand, identity, and visual system | Give product a credible outer shell matching inner posture | 4C-D |
| Lane 5 Trust, content, and launch-surface integration | Implement frozen trust/copy/boundary system across actual product and launch surfaces | 4C-E |
| Lane 6 QA, docs, and alpha-readiness foundation | Make app shape testable, documented, and honestly assessable before 5A | 4C-F |

## Lane 1 expected outputs

- end-to-end first-wave journey map
- primary flow map for homepage/entry, onboarding, matter creation, arrears intake, threshold check, notice prep, service/evidence capture, output review, official handoff
- screen inventory
- state-to-screen map
- next-action-owner map
- exit-point map

## Lane 2 expected outputs

- field inventory for first-wave workflows
- grouped question flows for tenancy/property basics, rent amount/schedule, arrears/payment history, renter details, notice-prep fields, service method/consent proof, evidence inputs
- dependency map between questions
- required vs optional map
- high-friction question notes
- consequential-input copy guidance

## Lane 3 expected outputs

- wireframes or UI mocks for first-wave screens
- component inventory
- layout rules for warnings, state panels, handoff blocks, trust cues, evidence/service surfaces, hold/lifecycle surfaces
- renderer-state consumption rules
- mobile/responsive assumptions where relevant

## Lane 4 expected outputs

- logo direction
- app tile direction
- wordmark
- palette
- typography system
- in-app type/color/spacing guidance
- visual trust posture guide
- anti-reference list

## Lane 5 expected outputs

- populated homepage / waitlist / onboarding / pricing / FAQ / key surfaces
- trust cue placement map
- privacy cue placement map
- handoff CTA hierarchy implemented
- support-label and paid-moment placement
- what-this-is / what-this-is-not system

## Lane 6 expected outputs

- architecture/module map refresh
- acceptance-criteria refresh
- trust surface checklist for implemented modules
- first-wave QA scenario pack
- ADR starter / decision log
- compact internal-alpha-not-yet note
- guarded seams register

## Cross-phase rules

1. Do not call something alpha-ready because the repo is tidy.
2. Parked is not finished.
3. Lane 2 and Lane 4 are closed for authoring; changes are review events.
4. 4C should make the product visible, usable, and reviewable, not merely internally coherent.
5. No lane should outrun product truth, especially lifecycle wording, trust/security cues, handoff language, readiness language, pricing/value claims.

## Contributor implication

Use this source extract to frame 4C work. For implementation, continue following repo docs, `AGENTS.md`, and accepted task packets. Do not treat 4C surface work as permission to dilute the arrears-first wedge or overstate alpha readiness.
