# BR05 Beta Pricing/Trust Validation Pack

Task ID: `P4B-CX-BR05-03`
Date: 2026-04-20
Phase posture: Phase 4B beta validation planning, no protected-line rewrite

## 1. Purpose and constraints

This pack converts current BR05 findings into a beta-facing validation plan that Product/Market can run without treating commercial hypotheses as settled truth.

This pack must preserve:

- event-linked pricing posture (not generic subscription-first positioning)
- frozen Lane 2 semantics and protected lines
- external handoff boundary
- no legal-authority, no filing implication, no portal mimicry
- trust cues grounded in actual repo-backed controls only

Primary anchors:

- `docs/specs/br05-trust-comprehension-baseline-pack.md`
- `docs/specs/br05-supporting-content-system-pack.md`
- `docs/governance/P4B Freeze Map.md`
- `docs/qa/control-inventory.md`
- `src/modules/output/trustBindings.ts`
- `src/modules/output/index.ts`
- `src/modules/handoff/index.ts`

## 2. Evidence status legend

Use this legend for every pricing/trust assumption:

- `VALIDATED`:
  - control behavior and surface trigger are repo-backed and test-backed now
  - does not mean willingness-to-pay is proven
- `LIKELY`:
  - supported by current research posture and control logic, but not yet beta-proven
- `TENTATIVE`:
  - plausible but weakly evidenced; should be treated as high-risk hypothesis

## 3. Candidate beta pricing trigger moments

| Trigger ID | Candidate trigger moment | User state | Stress moment | Trust requirement | Why payment may feel justified | What could go wrong | Commercial confidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BR05-BETA-TRG-01` | Threshold-met (14+ day arrears profile) | `THRESHOLD_MET` with notice-prep gating active | User wants concrete next-step prep without procedural mis-sequencing | Readiness-not-filing boundary, source visibility, local-vs-official distinction | Support can reduce preparation errors and improve review confidence at a high-stress point | User perceives this as paying for legal authority or filing rights | `LIKELY` |
| `BR05-BETA-TRG-02` | Review-heavy slowdown state | `REVIEW_REQUIRED` / slowdown controls present | User blocked by uncertainty and wants clarity on what to do next | Explicit uncertainty naming, review-required rationale, no fake certainty | Paid review coordination can feel valuable when ambiguity is explicit | Users treat slowdown as near-success and blame product if outcomes vary | `LIKELY` |
| `BR05-BETA-TRG-03` | Referral-first or route-out stop | `REFER_OUT` / referral-stop posture active | User needs safe reroute and support framing under high consequence | Concrete referral reason, stop/reroute clarity, external ownership | Support may be valued for structured handoff and avoiding wrong continuation | Appears exploitative if referral looks like upsell pressure | `TENTATIVE` |
| `BR05-BETA-TRG-04` | Wrong-channel reroute | Wrong-channel control active (`stop + explain + reroute`) | User has attempted or is about to use an incorrect channel | Wrong-channel boundary and reroute path clarity, no portal mimicry | Payment may be justified for fast correction and channel-safe handoff prep | User interprets reroute as artificial friction created to sell support | `TENTATIVE` |
| `BR05-BETA-TRG-05` | Live-confirmation-required | Live confirmation state active before reliance | User needs confidence that current official instructions have been checked | Freshness/date visibility and explicit override boundary | Support may be valued for "what to verify now" guidance under time stress | Overclaim risk if copy implies product already completed live official checks | `LIKELY` |
| `BR05-BETA-TRG-06` | Official-handoff-adjacent moment | `OFFICIAL_HANDOFF_GUIDANCE` surfaces active (`handoff-boundary`, `external-action-owner`) | User transitioning from prep to external action and wants confidence in handoff package | External-action ownership, handoff-not-completed boundary, no product submission | Payment may be justified for handoff package quality and sequencing support | User assumes payment buys completion of official action | `LIKELY` |
| `BR05-BETA-TRG-07` | VCAT-adjacent escalation visibility | External-step summary / hearing placeholder context visible | User perceives escalation risk and needs bounded preparation support | Explicit external dependency and no-tribunal-execution implication | Support may be valued for organization and escalation readiness | Overreach into legal strategy or tribunal authority implication | `TENTATIVE` |

## 4. Trigger-by-trigger validation and falsification table

| Trigger ID | Signal status (control) | Trust-cue readiness status | Core assumption under test | Beta evidence that supports assumption | Beta evidence that falsifies assumption |
| --- | --- | --- | --- | --- | --- |
| `BR05-BETA-TRG-01` | `VALIDATED` | `VALIDATED` | Threshold-met users will pay for prep/review support when boundaries are explicit | Conversion uplift vs non-trigger baseline with unchanged core semantics; reduced "what does ready mean" confusion in interviews | No uplift or increased confusion that product should file/submit after seeing offer |
| `BR05-BETA-TRG-02` | `VALIDATED` | `VALIDATED` | Slowdown users value paid help that clarifies next safe action | Higher attach rate on slowdown surfaces plus lower abandonment caused by uncertainty | Attach rate flat/negative and users report slowdown copy feels like upsell pressure |
| `BR05-BETA-TRG-03` | `VALIDATED` | `VALIDATED` | Referral-stop users will value structured support without feeling exploited | Positive sentiment on fairness/clarity and measured uptake without trust drop | Trust complaints that referral is monetized coercion or hidden continuation promise |
| `BR05-BETA-TRG-04` | `VALIDATED` | `VALIDATED` | Wrong-channel users pay for correction support if reroute is explicit | Improved reroute completion and positive clarity sentiment with paid-support option present | Increased perception of artificial friction or reduced trust in channel guidance |
| `BR05-BETA-TRG-05` | `VALIDATED` | `VALIDATED` | Live-confirmation users pay for time-saving verification support framing | Users report reduced uncertainty and increased confidence while still acknowledging external dependency | Users infer product has already confirmed live official state when it has not |
| `BR05-BETA-TRG-06` | `VALIDATED` | `VALIDATED` | Handoff-adjacent users value support for package quality and external step readiness | Better handoff completion confidence and attach rate without overclaim confusion | Users infer paid support equals official completion/acceptance |
| `BR05-BETA-TRG-07` | `LIKELY` | `VALIDATED` | VCAT-adjacent moments create willingness to pay for bounded escalation-prep support | Positive response to bounded support framing in interviews and controlled beta experiments | Any signal that users read offers as legal-representation or tribunal-authority claims |

## 5. Trust cue to conversion-risk map

| Trust cue family | Conversion risk when missing/weak | Resulting commercial failure mode | Required mitigation |
| --- | --- | --- | --- |
| Boundary cues (`no-product-submission`, `readiness-not-filing`, `handoff-not-completed`) | User assumes paid plan buys filing/official completion | Short-term conversion with long-term trust breach and complaint risk | Keep boundary statements adjacent to pricing-support prompts |
| Source and freshness cues (`source-index`, `freshness-check`, `touchpoint-stale`, `live-confirmation-required`) | User cannot tell what is current or what can be relied on | Refusal to pay due to uncertainty or post-purchase distrust | Keep source/date context visible before pricing-support prompts |
| External ownership cues (`external-action-owner`, handoff boundaries) | User misunderstands who takes official step | Perceived non-delivery after purchase | Reinforce external action owner in every handoff-adjacent offer |
| Review/referral cues (`slowdown-review`, `referral-stop`, `wrong-channel-reroute`) | States collapse into generic warning language | Offers feel manipulative or contextless | Keep state-specific explanation modules distinct and mapped |
| Local validation cue (`local-validation-not-official-acceptance`) | Users overestimate evidentiary/legal finality | Value collapse after unmet expectations | Explicitly frame local-validation limits on evidence-related offers |

## 6. Lane 2 surface inventory entries (concrete) and module bindings

Surface inventory entries are concrete because they bind to current section/block/surface keys in output/handoff shells.

| Inventory entry ID | Output mode context | Concrete surface key(s) | State/control context |
| --- | --- | --- | --- |
| `L2-INV-01` | `PRINTABLE_OUTPUT` / `PREP_PACK_COPY_READY` | `readiness-summary` | Ready/review/blocked readability and local readiness framing |
| `L2-INV-02` | `PRINTABLE_OUTPUT` | `source-index` | Source-type visibility and trust cue grounding |
| `L2-INV-03` | `PREP_PACK_COPY_READY` | `supporting-evidence-index` | Local validation and evidence helper context |
| `L2-INV-04` | `OFFICIAL_HANDOFF_GUIDANCE` | `handoff-boundary` | Prep-and-handoff boundary visibility |
| `L2-INV-05` | `OFFICIAL_HANDOFF_GUIDANCE` | `external-action-owner` | External ownership of official next action |
| `L2-INV-06` | `OFFICIAL_HANDOFF_GUIDANCE` | `review-before-official-step` | Review gate before external official step |
| `L2-INV-07` | touchpoint consequence surfaces | `freshness-check` | Freshness-aware caution context |
| `L2-INV-08` | touchpoint consequence surfaces | `touchpoint-stale` | Stale downgrade and refresh-needed posture |
| `L2-INV-09` | touchpoint consequence surfaces | `live-confirmation-required` | Live check required before reliance |
| `L2-INV-10` | touchpoint consequence surfaces | `wrong-channel-reroute` | Stop + explain + reroute posture |
| `L2-INV-11` | review/referral consequence surfaces | `slowdown-review` | Guarded review slowdown posture |
| `L2-INV-12` | review/referral consequence surfaces | `referral-stop` | Referral-first stop posture |

### 6.1 Module ID bindings to concrete inventory entries

| Module ID | Bound inventory entry IDs |
| --- | --- |
| `BR05-FAQ-01` | `L2-INV-01`, `L2-INV-04`, `L2-INV-06` |
| `BR05-FAQ-02` | `L2-INV-07`, `L2-INV-08`, `L2-INV-09`, `L2-INV-10` |
| `BR05-FAQ-03` | `L2-INV-11`, `L2-INV-12` |
| `BR05-FAQ-04` | `L2-INV-01`, `L2-INV-11`, `L2-INV-12`, `L2-INV-06` |
| `BR05-TC-01` | `L2-INV-02` |
| `BR05-TC-02` | `L2-INV-07`, `L2-INV-08`, `L2-INV-09` |
| `BR05-TC-03` | `L2-INV-04`, `L2-INV-06`, `L2-INV-01` |
| `BR05-TC-04` | `L2-INV-03` |
| `BR05-HO-01` | `L2-INV-01`, `L2-INV-06` |
| `BR05-HO-02` | `L2-INV-05`, `L2-INV-06` |
| `BR05-HO-03` | `L2-INV-09`, `L2-INV-10` |
| `BR05-WN-01` | `L2-INV-11` |
| `BR05-WN-02` | `L2-INV-08` |
| `BR05-WN-03` | `L2-INV-09` |
| `BR05-WN-04` | `L2-INV-10` |
| `BR05-RR-01` | `L2-INV-11` |
| `BR05-RR-02` | `L2-INV-12`, `L2-INV-10` |
| `BR05-PR-01` | `L2-INV-01` |
| `BR05-PR-02` | `L2-INV-11`, `L2-INV-12` |
| `BR05-PR-03` | `L2-INV-05`, `L2-INV-06` |
| `BR05-PV-01` | `L2-INV-03` |
| `BR05-PV-02` | `L2-INV-03`, `L2-INV-12` |
| `BR05-PV-03` | `L2-INV-03`, `L2-INV-04` |

## 7. Trust-to-conversion checklist (compact beta use)

Run this checklist before and after each beta trigger test:

1. Trigger is event-linked to a concrete Lane 2 inventory entry, not a generic subscription surface.
2. Boundary statements are visible adjacent to any pricing-support prompt.
3. State meaning remains distinct (`stale`, `live confirmation`, `wrong channel`, `review`, `referral`).
4. External ownership is explicit on handoff-adjacent moments.
5. Source/freshness cues are visible when trigger depends on guidance reliability.
6. Local-validation boundaries are visible on evidence-adjacent support prompts.
7. Offer framing states preparation/support value only (no filing/legal certainty implication).
8. Hypothesis status is tagged (`VALIDATED` / `LIKELY` / `TENTATIVE`) and not promoted silently.
9. Success criteria include trust metrics, not conversion-only metrics.
10. Falsification criteria are pre-committed and reviewed before rollout expansion.

## 8. Beta interpretation rules

- A conversion increase without trust preservation is a failed outcome.
- A trust increase with zero conversion is not failure; it may invalidate pricing timing while validating trust framing.
- Any user signal that payment is perceived as buying official action/legal certainty is immediate red-flag evidence against current framing.

## 9. Guardrails summary

- This pack does not settle willingness-to-pay truth.
- This pack does not authorize paywall engineering.
- This pack does not reopen protected Lane 2 lines.
- This pack is a validation instrument, not a doctrine or strategy rewrite.
