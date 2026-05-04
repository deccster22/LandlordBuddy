# Visual Doctrine v0.1 Extract

Date added: 2026-05-04
Source: `LandlordBuddy Visual Doctrine v0.1.pdf`
Status: repo source snapshot

## Doctrine statement

LandlordBuddy should look like a calm procedural operating system for rental-property workflows, with a serious matter workbench inside it.

It must visually signal:

- rental property / tenancy context
- documents, evidence, records, and notices
- procedural sequencing and safe handoff
- trust without official mimicry
- seriousness without panic
- usefulness without becoming a generic property-management suite

It must not look like:

- real estate agency
- government portal
- legal practice
- tribunal filing system
- maintenance marketplace
- friendly generic buddy app
- full landlord OS with scope ambition leaking through

Controlling metaphor: stable operating shell with focused procedural workbench.

## Core visual principles

### 1. Property signal is necessary but must be abstracted

A pure house/key signal is too generic and real-estate-adjacent. A purely abstract workflow mark may not communicate property or tenancy. Use a hybrid signal that combines property/tenancy with administration, documents, or workflow.

Rule: house, roof, doorway, or property cue may be used only as an abstracted modifier. It must not be the whole mark.

### 2. Administration first, property second

Core value is notices, records, evidence, workflow checks, and official handoff. App icon/logo exploration should prioritise document/record/notice geometry with a subtle property cue, not a route-only symbol.

Note: later repo Lane 4 work appears to have run a narrow final pass that recommended Route Spine as a primary icon candidate for launcher-size durability. Treat that as a later implementation-facing decision requiring reconciliation with this doctrine rather than silently erasing the doctrine.

### 3. UI is procedural risk-control layer

Visual clarity, semantic hierarchy, and state separation outrank brand flourish wherever consequential.

### 4. Brand and semantic colour must be separated

Brand colour expresses identity and ordinary action. Semantic colour expresses risk, warning, slowdown, referral, handoff, lifecycle, or critical stop. Do not overload brand orange/blue/green with semantic meanings.

### 5. Shell and matter must look different but related

Shell mode is stable context. Matter mode is consequential work.

Shell mode: calm, routine, stable.

Matter mode: serious, controlled, clear, and consequence-aware.

## Logo and app tile doctrine

Current source-document leading direction: Document + House compound mark, likely but not locked.

Required properties:

- simple
- silhouette-driven
- flat
- non-3D
- readable at 24px
- category-recognisable without text
- clearly not official, legal, or agency-like

Options to test:

1. Document + House Negative Space
2. Document + Roof Fold
3. House Container + Record Line
4. House + Workflow Split
5. Route Spine as control / possible UI motif
6. LB Monogram as fallback utility mark only

Rejects:

- house-only
- key
- lock
- gavel
- courthouse
- seal
- shield as primary
- checkmark-on-house
- handshake/people
- mascot
- For Rent sign
- city skyline
- document with tick/certification feel

## Wordmark doctrine

Fixed wordmark decision: `LandlordBuddy`.

Rules:

- Use `LandlordBuddy` in CamelCase.
- Do not use `Landlord Buddy` as the wordmark.
- Do not use all-caps as primary.
- Do not use all-lowercase unless later testing supports a softer low-authority variant.
- Do not line-break between Landlord and Buddy.
- Do not rely on colour alone to separate the two parts.
- Protect the `dB` junction with manual optical spacing.
- Use compact `LB` fallback only where full wordmark is too small or crowded.

## Typography doctrine

Use modern, legible, operational, calm sans-serif typography.

Avoid:

- legal-stationery feel
- government form feel
- playful startup feel
- real-estate brochure feel
- fintech casino feel
- bureaucratic PDF dungeon feel

Candidate families noted in source:

- Geist
- Onest
- Manrope
- Public Sans
- IBM Plex Sans
- Montserrat / Roboto as benchmarks

Rules:

- no ornate serif as primary
- no script
- no narrow official font
- no ultra-light weights
- no heavy black weights in product UI
- use medium/semi-bold for labels and state headers
- use tabular numerals for ledger/rent/payment figures
- increase tracking slightly at small sizes
- avoid low-contrast grey microcopy

## Brand colour doctrine

Likely direction:

- deep ink/navy as anchor
- dark teal or blue-teal as trust/support
- restrained warm accent only where safe
- off-white/cool neutral surfaces
- no red in brand
- no warning amber as brand decoration

Rules:

- brand colour is not semantic state colour
- warm brand accent must not mean warning
- red/rust is not brand; red is protected for critical states
- green must be limited because success can imply false compliance clearance
- brand palette can carry identity and progression, not legal truth

## Semantic colour doctrine

Semantic roles:

| Role | Direction | Rule |
| --- | --- | --- |
| Critical / hard stop | red | deterministic block, no bypass |
| Warning / review | amber on neutral | check/slow/verify, no full amber wall |
| Slowdown / information | blue/slate/neutral | complexity/review-led, not danger |
| Referral / routing | indigo/purple or high-contrast neutral | external/specialist boundary, not error |
| Official handoff | slate/blue neutral + external cue | prepared here, official action outside LB |
| Lifecycle / hold | indigo/slate/violet | retention/deletion/legal hold/privacy-sensitive |
| Success / complete | muted green, limited | never legal clearance or tribunal sufficiency |

Rules:

- warnings use neutral cards with amber border/icon, not saturated amber blocks
- referral is not an error page
- official handoff is not success
- hard stop blocks action, no continue-anyway escape
- colour never carries meaning alone
- internal statuses like Guarded Green are not UI semantics

## Colour profile doctrine

Required profiles:

1. Canonical Night
2. High Contrast Night
3. Day Briefing
4. Colour-Vision-Safe Night
5. Document Neutral

Semantic-role parity must hold across profiles.

## Shell mode

Shell mode is the stable operating context:

- dark or brand-infused chrome
- flat panels
- minimal shadows
- high-contrast text/icons
- calm navigation
- low motion
- evidence-aware but not legalistic

Shell surfaces must not imply compliance clearance, legal strategy, official proof acceptance, maintenance marketplace, accounting dashboard, or official portal behaviour.

## Matter mode

Matter mode is the controlled procedural workbench:

- light document/workspace surfaces
- elevated cards
- larger text
- stronger sectioning
- clear state hierarchy
- boundary language
- subtle workflow feedback
- serious but not alarmist

Matter surfaces must not imply official filing, lodged/accepted status, or legal validity.

## Component doctrine

- Boundary statement: short, visible, repeated, near reliance moments.
- Warning/review: neutral card, amber border/icon, clear consequence copy.
- Hard stop: light red wash, red border/icon, disabled primary CTA, only edit/back actions.
- Referral/routing: neutral or indigo/purple routing card, external/specialist cue.
- Official handoff: slate/blue/neutral external block, explicitly outside LandlordBuddy.
- Lifecycle/hold: persistent badge, muted indigo/slate/violet, release-controlled status.

## Freeze rule

Do not visually freeze LandlordBuddy until all exist:

- logo/app tile variant board
- 24px raster proof
- wordmark/type treatment board
- semantic colour profile matrix
- shell/matter screen proof
- consequential-state component proof
- colour/accessibility audit
- documented rejects and rationale
- final Product + Marketing + Legal/Risk review

## Repo audit watchpoint

This source doctrine and later repo Lane 4 docs may conflict around the icon primary direction. The doctrine says Document + House was the leading hypothesis; later repo docs appear to select Route Spine after a small-size pass. Treat that as a normal design evolution, but preserve the decision trail so the final Lane 4 synthesis explains why launcher durability overrode the earlier category-signal hypothesis.
