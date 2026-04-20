# BR05 Supporting Content System Pack

Task ID: `P4B-CX-BR05-02`
Date: 2026-04-20
Phase posture: Phase 4B, documentation lane, protected lines untouched

## 1. Purpose

This pack defines modular supporting content for trust cues, boundaries, and explanatory surfaces around the frozen Lane 2 baseline.

This pack is additive only:

- it reinforces frozen Lane 2 semantics
- it does not rewrite protected core lines
- it does not add legal-authority or portal-mimicry behavior
- it does not promise privacy, auditability, or official outcomes beyond substantiated controls

Primary source anchors:

- `docs/specs/br05-trust-comprehension-baseline-pack.md`
- `docs/governance/P4B Freeze Map.md`
- `docs/qa/control-inventory.md`
- `docs/architecture/output-handoff-evidence-shells.md`

## 2. Module contract

Each module includes:

- `moduleId`
- `safetyTag` as one of:
- `SAFE_SUPPORTING_EXPLANATION`
- `CONDITIONAL_GUARDED`
- `overclaimTag` always set to `MUST_NOT_OVERCLAIM`
- approved copy blocks:
- `primaryText`
- `microHelpText`
- placement targets:
- surface keys, state families, and placement pattern
- backing controls (code/docs/test anchors)

## 3. Supporting content module library

### 3.1 FAQ/help modules

#### `BR05-FAQ-01` Prepared vs filed

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "`Prepared for handoff` means your preparation details are organized for review and external action. It does not mean filed, submitted, accepted, or legally complete."
- `microHelpText`: "Preparation state only. Official action remains outside Landlord Buddy."
- placement: FAQ/help entry and readiness-summary helper
- backing controls: `officialSystemAction: NOT_INCLUDED`; handoff boundary codes

#### `BR05-FAQ-02` Why stale/live/wrong-channel appears

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "These states are control signals. `Stale` means prior guidance may no longer be reliable, `Live confirmation required` means current official instructions must be checked, and `Wrong channel` means stop and reroute before continuing."
- `microHelpText`: "These are behavior controls, not cosmetic warnings."
- placement: FAQ/help entry and touchpoint consequence surfaces
- backing controls: BR03 touchpoint classification/freshness/wrong-channel controls

#### `BR05-FAQ-03` Review required vs referral-first

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "`Review required` means progression may still be possible after review. `Referral-first` means ordinary progression stops and you need specialist or official-channel help."
- `microHelpText`: "Review is a pause; referral is a stop-and-reroute pattern."
- placement: FAQ/help entry and referral/review surfaces
- backing controls: notice-readiness outcomes plus referral-stop guidance block

#### `BR05-FAQ-04` What paid support does and does not include

- `safetyTag`: `CONDITIONAL_GUARDED`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "Paid support can cover preparation, organization, and handoff support. It does not buy official filing, legal certainty, or tribunal authority."
- `microHelpText`: "Support service only; official acts remain external."
- placement: pricing help panels and upgrade FAQ
- backing controls: BR05 trigger matrix baseline and anti-overclaim boundaries

### 3.2 Trust-cue glossary and micro-help modules

#### `BR05-TC-01` Source label explainer

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "Source labels show where a statement comes from: stable rule, official guidance, live portal/form behavior, or unresolved item."
- `microHelpText`: "Source labels improve traceability but do not convert unresolved items into settled truth."
- placement: `source-index`, `visible-source-labels`, glossary
- backing controls: visible source-type label bindings

#### `BR05-TC-02` Freshness/date cue explainer

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "Freshness cues show when a touchpoint was last checked and whether a live check is required before reliance."
- `microHelpText`: "Date visibility supports judgment; it is not a guarantee that external systems have not changed."
- placement: `freshness-check`, `touchpoint-stale`, `live-confirmation-required`
- backing controls: BR03 stale and live-confirmation consequence families

#### `BR05-TC-03` Boundary-code explainer

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "Boundary codes explain product limits: preparation/handoff only, no product submission, and no portal mimicry."
- `microHelpText`: "Boundary codes are operational controls, not legal disclaimers only."
- placement: `handoff-boundary`, `boundary-codes`, glossary/help
- backing controls: handoff boundary code set and trust bindings

#### `BR05-TC-04` Local validation explainer

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "`Local validation` means file and structure checks passed in-product. It does not confirm official acceptance or legal sufficiency."
- `microHelpText`: "Passes local checks only."
- placement: `supporting-evidence-index`, evidence helper text
- backing controls: local evidence validation structure and boundary keys

### 3.3 Official handoff support modules

#### `BR05-HO-01` Prepared for handoff state helper

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "This matter is prepared for handoff. Next official action still occurs outside Landlord Buddy."
- `microHelpText`: "Prepared does not mean lodged, accepted, or complete."
- placement: `review-before-official-step`, readiness support panel
- backing controls: review/handoff ownership and external action boundary

#### `BR05-HO-02` External action owner helper

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "The next official step is owned by you or your operator, not executed by the product."
- `microHelpText`: "Product execution remains `NOT_EXECUTED_BY_PRODUCT`."
- placement: `external-action-owner`, handoff panel
- backing controls: handoff review state ownership model

#### `BR05-HO-03` Authenticated touchpoint handoff helper

- `safetyTag`: `CONDITIONAL_GUARDED`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "Authenticated surfaces are handoff-only in this product posture. Use the official channel directly for authenticated actions."
- `microHelpText`: "No in-product authenticated execution."
- placement: `authenticated-surface-handoff`, `defer-to-live-official-flow`
- backing controls: BR03 authenticated-handoff-only and no-portal-mimicry boundaries

### 3.4 Warning and control-state explanation modules

#### `BR05-WN-01` Service-proof caution helper

- `safetyTag`: `CONDITIONAL_GUARDED`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "Service-proof sufficiency is review-led here. Recorded proof and selected method are kept visible, but legal sufficiency is not auto-confirmed."
- `microHelpText`: "Recorded proof is evidence input, not final legal sufficiency."
- placement: service warning areas, review-hold surfaces
- backing controls: `SERVICE_PROOF_GUARDED`, `HAND_SERVICE_REVIEW_GUARDED`

#### `BR05-WN-02` Stale-state helper

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "This touchpoint is stale. Relying on it without refresh can lead to incorrect next steps."
- `microHelpText`: "Check current guidance before acting."
- placement: `touchpoint-stale`, stale warning panels
- backing controls: `TOUCHPOINT_STALE` control and stale-state posture

#### `BR05-WN-03` Live-confirmation-required helper

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "Live confirmation is required because current official instruction may override generic guidance."
- `microHelpText`: "Until confirmed, progression remains review-led."
- placement: `live-confirmation-required`, handoff warning areas
- backing controls: `TOUCHPOINT_LIVE_CONFIRMATION_REQUIRED` slowdown posture

#### `BR05-WN-04` Wrong-channel reroute helper

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "This is the wrong channel for the current step. Stop this path, review the channel guidance, and reroute before continuing."
- `microHelpText`: "Wrong-channel is a stop-and-reroute control."
- placement: `wrong-channel-reroute`, referral-stop overlays
- backing controls: `TOUCHPOINT_WRONG_CHANNEL_REROUTE` control precedence

### 3.5 Referral and review explanation modules

#### `BR05-RR-01` Review-required slowdown helper

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "Review is required before progression. This is a safety control for uncertainty, not a silent approval."
- `microHelpText`: "Uncertainty remains visible until reviewed."
- placement: `slowdown-review`, `guarded-review-flags`
- backing controls: `REVIEW_REQUIRED` outcome and guarded control families

#### `BR05-RR-02` Referral-first stop helper

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "This matter is in referral-first posture. Ordinary progression is stopped and external specialist or official help is recommended."
- `microHelpText`: "Referral-first is not a normal continue flow."
- placement: `referral-stop`, route-out/referral surfaces
- backing controls: referral-stop block, BR01 referral and route-out posture

### 3.6 Pricing-support explanation modules

#### `BR05-PR-01` 14+ day arrears support moment

- `safetyTag`: `CONDITIONAL_GUARDED`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "When threshold conditions are met (including day threshold in current rules), support options can focus on preparation and review readiness."
- `microHelpText`: "Trigger moment for support planning, not legal entitlement or filing status."
- placement: threshold milestone support callouts and pricing help
- backing controls: arrears threshold shell and no-early-notice gate

#### `BR05-PR-02` Review/referral support moment

- `safetyTag`: `CONDITIONAL_GUARDED`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "Review-heavy or referral-heavy states can trigger extra support options for review coordination and external handoff preparation."
- `microHelpText`: "Support can assist preparation; it does not remove guarded uncertainty."
- placement: `slowdown-review`, `referral-stop`, pricing help
- backing controls: notice-readiness outcomes and carry-forward controls

#### `BR05-PR-03` Escalation/handoff support moment

- `safetyTag`: `CONDITIONAL_GUARDED`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "VCAT-adjacent and handoff-adjacent moments can be support triggers for document organization and boundary-safe external handoff."
- `microHelpText`: "No support module may imply tribunal execution, filing authority, or legal guarantee."
- placement: external-step and handoff support areas, pricing help
- backing controls: external handoff dependency posture and handoff guidance boundaries

### 3.7 Privacy and trust reinforcement modules

#### `BR05-PV-01` Privacy-hook visibility helper

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "Preparation records can carry explicit privacy and access-scope hooks to keep handling traceable inside the product."
- `microHelpText`: "Traceable handling support does not itself settle retention doctrine."
- placement: privacy/help and evidence/output explanatory content
- backing controls: BR04 privacy hook attachment across matter/evidence/notice/output

#### `BR05-PV-02` Scoped hold/lifecycle helper

- `safetyTag`: `CONDITIONAL_GUARDED`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "Hold and lifecycle states are scoped and review-led. They are not blanket account freezes and not final disposal authority."
- `microHelpText`: "Scoped preservation is explicit; doctrine details remain placeholder-led where unresolved."
- placement: privacy/help and hold-affected surfaces
- backing controls: BR04 scoped hold and lifecycle placeholder posture

#### `BR05-PV-03` Auditability helper

- `safetyTag`: `SAFE_SUPPORTING_EXPLANATION`
- `overclaimTag`: `MUST_NOT_OVERCLAIM`
- `primaryText`: "Preparation and review events can be recorded for in-product traceability. This does not replace official records or prove legal sufficiency."
- `microHelpText`: "Auditability support is internal traceability, not official confirmation."
- placement: privacy/help and trust glossary
- backing controls: audit event recording plus auditability checklist posture

## 4. Supporting-content placement map

| Surface/state family | Primary module IDs | Secondary module IDs | Placement pattern | Distinctness rule |
| --- | --- | --- | --- | --- |
| Readiness summary and review readiness | `BR05-FAQ-01`, `BR05-HO-01` | `BR05-TC-03` | inline helper plus FAQ entry | Keep prepared/readiness distinct from filed/accepted language |
| Source index and source labels | `BR05-TC-01` | `BR05-FAQ-02` | glossary tooltip and expandable help | Source type clarity must not imply legal authority |
| Evidence/supporting evidence and local validation | `BR05-TC-04`, `BR05-PV-01` | `BR05-PV-03` | inline helper and privacy/help panel | Preserve local-validation-not-official-acceptance boundary |
| Handoff boundary and external action owner | `BR05-HO-01`, `BR05-HO-02` | `BR05-TC-03` | handoff panel explanatory row | Handoff remains external and bounded |
| Authenticated handoff/defer-to-live flow | `BR05-HO-03` | `BR05-WN-03` | state-level warning panel | No portal mimicry or product-executed authenticated action |
| Service-proof review areas | `BR05-WN-01` | `BR05-RR-01` | inline warning plus review micro-help | Service warning stays separate from stale/live controls |
| Stale state | `BR05-WN-02` | `BR05-TC-02` | state banner and tooltip | Stale remains distinct from live confirmation required |
| Live confirmation required state | `BR05-WN-03` | `BR05-TC-02` | state banner and helper drawer | Live confirmation remains distinct from stale and wrong-channel |
| Wrong-channel reroute state | `BR05-WN-04`, `BR05-RR-02` | `BR05-FAQ-02` | stop/reroute panel and FAQ link | Wrong-channel keeps stop + explain + reroute behavior |
| Slowdown/review state | `BR05-RR-01` | `BR05-FAQ-03` | review panel helper | Review remains pause/control, not silent near-success |
| Referral-first and route-out states | `BR05-RR-02` | `BR05-FAQ-03` | referral stop overlay and help | Referral remains stop-and-reroute, not ordinary handoff |
| Pricing/help at threshold moment | `BR05-PR-01` | `BR05-FAQ-04` | pricing-support explainer card | Payment support remains non-authority, non-filing |
| Pricing/help at review or referral moments | `BR05-PR-02` | `BR05-FAQ-04` | pricing-support explainer card | Do not imply payment removes uncertainty/referral posture |
| Pricing/help at escalation or handoff moments | `BR05-PR-03` | `BR05-FAQ-04` | pricing-support explainer card | Do not imply support buys tribunal execution or certainty |
| Privacy/help surfaces | `BR05-PV-01`, `BR05-PV-02` | `BR05-PV-03` | help panel and glossary links | No fake retention, security, or audit guarantees |

## 5. Guarded and must-not-overclaim notes

Global enforcement rules for this pack:

- never imply filing, submission, proxy filing, official acceptance, or legal certainty
- never imply portal parity or product execution of authenticated official actions
- never collapse stale, live-confirmation-required, wrong-channel, review-required, and referral-first into one generic warning
- never claim privacy/security/audit outcomes beyond current control-backed behavior
- never present pricing support as payment for free official acts or legal authority

Module governance:

- `SAFE_SUPPORTING_EXPLANATION` modules may be reused whenever their target surfaces are present
- `CONDITIONAL_GUARDED` modules require trigger checks and must not be shown as universal truth copy
- all modules remain support-layer text and must not replace frozen protected lines

## 6. Reuse notes for contributors

- treat module IDs as stable references for UI/help implementation and review
- if a module meaning changes, update this spec and the BR05 baseline pack in the same change set
- if a proposed module cannot be backed by current controls, park it as follow-on instead of publishing it as supported
