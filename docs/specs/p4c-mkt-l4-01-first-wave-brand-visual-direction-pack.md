# P4C-MKT-L4-01 First-Wave Brand And Visual Direction Pack

Date: 2026-04-21
Task ID: P4C-MKT-L4-01
Phase posture: Phase 4B remains primary; this is bounded Phase 4C Lane 4 direction-setting work.

This pack defines the first-wave brand shell tightly enough to guide UI work while preserving current product truth and frozen semantics.

Guardrails preserved in this pack:

- workflow-support posture, not legal-authority theatre
- preparation separate from official action
- handoff separate from execution
- deterministic controls separate from guarded controls
- warning/review/referral families kept distinct
- no fake-official styling, portal mimicry, or overclaiming aesthetics

Source anchors:

- `AGENTS.md`
- `docs/governance/P4B Freeze Map.md`
- `docs/specs/p4c-cx-l1-01-first-wave-product-journey-pack.md`
- `docs/specs/br05-trust-comprehension-baseline-pack.md`
- `docs/specs/br05-supporting-content-system-pack.md`

Figma concept file (supporting artifact, not controlling truth):

- `https://www.figma.com/design/xdNrzOh9czzghlWKxvuf3z`
- Brand board node: `2:3`
- App tile legibility node: `3:2`
- Sample screens set node: `4:2`

## 1. Recommendation Summary

Primary recommendation: `Guided Ledger`

- Why this is primary:
  - calmer and more procedural than promotional
  - supports stress readability with high contrast and clear state separation
  - can carry trust cues and boundary lines without looking legalistic
  - does not visually imply filing power, official status, or legal finality

Fallback direction: `Civic Folder`

- Use this only if early user testing reports the primary direction as too stern.
- Keeps the same semantics and hierarchy, but softens chroma and edge contrast.

## 2. Identity Direction (Primary vs Fallback)

### 2.1 Primary: Guided Ledger

Visual character:

- clean, document-led structure
- deep slate anchors with restrained blue/teal guidance accents
- subtle paneling, visible dividers, no decorative hero theatrics

Emotional intent:

- calm under pressure
- careful, bounded, explicit
- credible without government or legal cosplay cues

### 2.2 Fallback: Civic Folder

Visual character:

- softer paper and stone neutrals
- lower visual temperature, less chroma in guidance accents
- same information architecture and warning hierarchy as primary

Emotional intent:

- approachable and less stern, while still procedural

Switch rule:

- retain primary unless testing shows comprehension is equal but confidence drops because the shell feels overly severe.

## 3. App Tile Direction

Direction:

- rounded-square tile
- high-contrast `LB` monogram
- single vertical anchor stroke to improve silhouette memory
- no crest, seal, courthouse, shield, checkmark-with-ribbon, or official stamp motif

Small-size test results (from node `3:2`):

- tested on light and dark backgrounds at 16/24/32/48/64 px
- `24px+`: monogram and anchor remain recognisable
- `16px`: compact fallback behavior still readable, but should not be treated as rich-detail state

Operational guidance:

- use monochrome or two-tone only
- keep corner radius consistent across platforms
- no gradient or gloss effects in production icon assets

## 4. Wordmark Direction

Direction:

- `Landlord Buddy` set in `Public Sans SemiBold`
- title case, modest tracking, straightforward geometry
- optional descriptor line in `Source Sans 3 Regular`

Do not do:

- legal serif stacks that imply legal authority
- all-caps government-department look
- agency-style emblems or icon-lockups that imply official certification

## 5. Palette Direction

### 5.1 Primary palette (recommended)

Core:

- `Ink 900` `#102332`
- `Slate 700` `#2E485D`
- `Trust Blue` `#5F8AA8`
- `Calm Teal` `#6E9486`
- `Surface 000` `#FFFFFF`
- `Surface 050` `#F3F5F7`

State accents (not decorative):

- `Warning Amber` `#B97823`
- `Referral Rust` `#9A4B3E`

### 5.2 Fallback palette (if primary is too stern in testing)

- `Graphite` `#2A2B2F`
- `Paper` `#F7F4EE`
- `Stone` `#CFC7BB`
- `Action Blue` `#506C84`
- `Warning Ochre` `#A87A32`
- `Referral Brick` `#8F4A43`

Color policy:

- state colors communicate control family and severity only
- avoid bright success greens and celebratory color language on consequential surfaces
- do not use color combinations that mimic official portals or legal seals

## 6. Typography System

Primary system:

- UI/headings/labels: `Public Sans`
- body/support/help copy: `Source Sans 3`

Recommended first-wave scale:

- Display: `40/48` (Bold)
- H1: `32/40` (SemiBold)
- H2: `24/32` (SemiBold)
- H3: `20/28` (SemiBold)
- Body M: `18/28` (Regular)
- Body S: `16/24` (Regular)
- State labels and trust cues: `16/22` (SemiBold)
- Boundary/helper microcopy: `14/20` (Regular)

Readability rules:

- keep line lengths short on consequential panels
- avoid condensed styles
- avoid lightweight body text

## 7. In-App Visual Usage Rules

### 7.1 Type and hierarchy

- trust-cue and state labels must be visually proximate to the controlled block
- consequential state headers must use explicit state names (no generic positive substitutes)
- boundary lines should sit above or beside reliance actions, not in footers

### 7.2 Color and state signaling

- preserve distinct visual treatments for `Blocked`, `Needs review`, `Ready to review`, `Prepared for handoff`, `Referral-first`, `Wrong-channel reroute`, and stale/live controls
- never collapse warning/review/referral into one generic caution style
- keep handoff blocks visually separate from review blocks

### 7.3 Spacing and panel structure

- spacing scale: `4, 8, 12, 16, 24, 32, 48`
- use framed panels and divider rhythm to reduce cognitive load
- keep severe-state panels visually heavier than informational panels

### 7.4 Seriousness at high-stakes moments

For consequential trust/handoff surfaces:

- increase contrast and simplify background treatment
- avoid playful motion, celebratory color, or novelty iconography
- emphasize boundary line, state meaning, and next-action ownership

For warning/review/referral moments:

- keep stop/slowdown/reroute controls unmistakable
- show escalation posture through panel weight and placement, not hype copy
- keep ordinary handoff visuals suppressed when referral-first or wrong-channel controls are active

## 8. Anti-Reference List (Do Not Emulate)

- fintech-casino neon, glow-heavy momentum aesthetics
- fake-official portal mimicry (department-like nav chrome, seal cues, bureaucratic pseudo-UI)
- law-firm cosplay (gavels, crests, courtroom motifs, Latinized gravitas styling)
- generic "all-green success dashboard" treatment for guarded states
- oversoft wellness UI that blurs risk or control consequences
- gamified reward patterns on consequential legal-prep surfaces
- glossy gradient hero treatments that outrun product truth
- vague warning visuals that erase behavioural distinctions

## 9. First-Wave Sample Screen Translation (3-5 Surfaces)

Implemented in node `4:2` with five first-wave samples:

1. `L1-SCR-01` Homepage / Entry (`4:5`)

- demonstrates `Preparation only` framing
- keeps handoff external and explicit

2. `L1-SCR-06` Notice Preparation (`4:20`)

- demonstrates `Ready to review` with required local-readiness cue
- preserves blocked/review/ready visual separation

3. `L1-SCR-07` Service / Evidence Capture (`4:35`)

- demonstrates service warning and evidence timing warning as separate families
- keeps local-validation boundary visible (`upload` not treated as finality)

4. `L1-SCR-09` Official Handoff (`4:51`) [consequential trust/handoff surface]

- demonstrates `Prepared for handoff` boundary line placement
- keeps external action owner explicit

5. `L1-OVR-04` Referral-first / Wrong-channel (`4:66`) [warning/review/referral surface]

- demonstrates stop-and-reroute posture
- suppresses ordinary handoff visual primacy

## 10. Scope Boundary For This Pack

This is a first-wave direction pack, not a full UI design system rollout.

Out of scope (intentionally not done here):

- full marketing site
- launch campaign
- frozen Lane 2 copy rewrite
- semantic/state renaming
- any visuals that imply official filing power or legal authority
