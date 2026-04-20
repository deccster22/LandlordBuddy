# BR05 Beta Measurement Plan Artifact

Task ID: `P4B-CX-BR05-04`
Date: 2026-04-21
Phase posture: Phase 4B beta measurement planning, no core semantic change

## 1. Purpose and guardrails

This artifact operationalizes BR05 pricing/trust validation for beta without changing frozen Lane 2 semantics.

This plan is measurement logic only. It is not:

- canon truth
- pricing implementation
- paywall or subscription implementation
- protected-line copy rewrite

Non-negotiable constraints:

- pricing remains hypothesis-driven
- payment is never framed as buying filing, official action, or legal certainty
- trust claims remain limited to control-backed product behavior
- stale, live-confirmation-required, wrong-channel, referral-first, and prepared-for-handoff meanings remain distinct

Primary dependencies:

- `docs/specs/br05-trust-comprehension-baseline-pack.md`
- `docs/specs/br05-supporting-content-system-pack.md`
- `docs/specs/br05-beta-pricing-trust-validation-pack.md`
- `docs/qa/br05-module-surface-alignment-checks.md`

## 2. Measurement model (separation rule)

All beta readouts must separate:

1. trust signal
2. comprehension signal
3. conversion signal
4. guardrail/harm signal

Decision rule:

- conversion uplift alone is insufficient evidence of success
- trust or guardrail deterioration can falsify a trigger even when conversion rises

## 3. Event schema

This schema defines measurement shape only. It does not implement analytics infrastructure.

### 3.1 Common event envelope

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `event_name` | string | yes | Uses BR05 taxonomy below |
| `event_time` | ISO datetime | yes | UTC timestamp |
| `beta_cohort` | string | yes | Beta variant or control cohort key |
| `trigger_id` | enum | yes for trigger-linked events | `BR05-BETA-TRG-01..07` |
| `inventory_entry_id` | enum | yes for surface events | `L2-INV-01..12` |
| `module_id` | string | yes for module events | `BR05-*` from BR05-02 |
| `output_mode` | enum | yes where relevant | `PRINTABLE_OUTPUT`, `PREP_PACK_COPY_READY`, `OFFICIAL_HANDOFF_GUIDANCE` |
| `user_state` | string | yes | Current trigger/state context (for example `REVIEW_REQUIRED`) |
| `trust_dependency_key` | string | yes | Boundary/freshness/source/external-ownership dependency |
| `readiness_outcome` | enum | optional | `READY_FOR_REVIEW`, `REVIEW_REQUIRED`, `BLOCKED`, `REFER_OUT` |
| `review_state_key` | string | optional | Renderer/trust review-state key when present |
| `result` | string | optional | `opened`, `viewed`, `started`, `completed`, `abandoned`, `flagged` |
| `notes` | string | optional | Free-text operational note, not user-visible copy |

### 3.2 Event taxonomy

| Event name | Class | Meaning |
| --- | --- | --- |
| `br05.trigger.entered` | trigger | User/session entered a priced validation moment |
| `br05.surface.exposed` | surface | Trigger-linked Lane 2 inventory surface rendered |
| `br05.module.exposed` | support | A BR05 supporting module was rendered |
| `br05.module.opened` | support | User opened helper/FAQ/glossary module |
| `br05.pricing.prompt.viewed` | conversion | User viewed event-linked support/pricing prompt |
| `br05.pricing.plan.viewed` | conversion | User opened plan/support details from trigger moment |
| `br05.pricing.intent.started` | conversion | User started upgrade/support intent flow |
| `br05.pricing.intent.completed` | conversion | User completed bounded upgrade/support intent action |
| `br05.session.abandoned_after_trigger` | conversion-risk | Session ended after trigger without progression or plan action |
| `br05.guardrail.overclaim_signal` | guardrail | User behavior indicates official-action/legal-certainty misunderstanding |
| `br05.guardrail.trust_deficit_signal` | guardrail | User behavior indicates trust breakdown (for example repeated boundary confusion) |
| `br05.guardrail.negative_support_pattern` | guardrail | Support/contact pattern suggests harm from pricing/trust framing |

## 4. Trigger taxonomy and mapping to measurable signals

| Trigger ID | User state | Trust dependency | Module IDs in play | Inventory entries | Primary measurable signals |
| --- | --- | --- | --- | --- | --- |
| `BR05-BETA-TRG-01` threshold-adjacent | `THRESHOLD_MET` | readiness boundary + source cue | `BR05-PR-01`, `BR05-FAQ-04`, `BR05-FAQ-01`, `BR05-TC-03` | `L2-INV-01`, `L2-INV-02` | trigger entered, readiness helper open, pricing prompt view, plan view, intent start/complete |
| `BR05-BETA-TRG-02` review-heavy | `REVIEW_REQUIRED` | uncertainty visibility + review cue | `BR05-PR-02`, `BR05-RR-01`, `BR05-FAQ-03` | `L2-INV-11`, `L2-INV-01` | slowdown helper open, review module engagement, plan view, abandon-after-trigger |
| `BR05-BETA-TRG-03` referral-stop | `REFER_OUT` / referral-stop | referral reason clarity + external ownership | `BR05-RR-02`, `BR05-FAQ-03`, `BR05-PR-02` | `L2-INV-12`, `L2-INV-10` | referral helper open, reroute engagement, plan view, trust-deficit or overclaim signals |
| `BR05-BETA-TRG-04` wrong-channel | wrong-channel reroute active | stop+reroute boundary + no portal mimicry | `BR05-WN-04`, `BR05-FAQ-02`, `BR05-RR-02` | `L2-INV-10` | wrong-channel helper open, reroute completion proxy, repeated wrong-channel entries |
| `BR05-BETA-TRG-05` live-confirmation-required | live confirmation state | freshness/date cue + override clarity | `BR05-WN-03`, `BR05-TC-02`, `BR05-FAQ-02` | `L2-INV-09`, `L2-INV-07` | live-confirmation helper usage, freshness helper usage, abandon-after-trigger, trust-deficit signal |
| `BR05-BETA-TRG-06` official-handoff-adjacent | handoff guidance state | external ownership + handoff boundary | `BR05-HO-01`, `BR05-HO-02`, `BR05-PR-03`, `BR05-FAQ-01` | `L2-INV-04`, `L2-INV-05`, `L2-INV-06` | handoff helper engagement, plan view, intent start/complete, overclaim signal |
| `BR05-BETA-TRG-07` VCAT-adjacent escalation | external-step/hearing-adjacent context | external dependency + anti-authority boundary | `BR05-PR-03`, `BR05-WN-03`, `BR05-FAQ-04` | `L2-INV-06`, `L2-INV-09` | escalation support module engagement, plan view, trust-deficit/overclaim signals |

## 5. Metric framework

### 5.1 Trust metrics

| Metric ID | Metric | Formula | Scope |
| --- | --- | --- | --- |
| `TRUST-M01` | Guarded help-open rate | `count(br05.module.opened where trigger in 02/03/04/05/07) / count(br05.trigger.entered where trigger in 02/03/04/05/07)` | Guarded moments |
| `TRUST-M02` | Stale/live explanation usage rate | `count(br05.module.opened where module in BR05-WN-02, BR05-WN-03, BR05-TC-02) / count(br05.surface.exposed where inventory in L2-INV-08, L2-INV-09)` | Freshness moments |
| `TRUST-M03` | Referral explanation engagement rate | `count(br05.module.opened where module in BR05-RR-02, BR05-FAQ-03) / count(br05.trigger.entered where trigger in 03/04)` | Referral/reroute moments |
| `TRUST-M04` | Handoff boundary engagement rate | `count(br05.module.opened where module in BR05-HO-01, BR05-HO-02, BR05-TC-03) / count(br05.surface.exposed where inventory in L2-INV-04, L2-INV-05, L2-INV-06)` | Handoff moments |

### 5.2 Comprehension metrics

| Metric ID | Metric | Formula | Scope |
| --- | --- | --- | --- |
| `COMP-M01` | Prepared-vs-filed confusion proxy rate | `count(br05.guardrail.overclaim_signal where trigger in 01/06) / count(br05.trigger.entered where trigger in 01/06)` | Readiness/handoff moments |
| `COMP-M02` | Wrong-channel repeat proxy rate | `count(session with repeated br05.trigger.entered for trigger 04 after helper open) / count(session with trigger 04)` | Wrong-channel moments |
| `COMP-M03` | Referral misunderstanding proxy rate | `count(br05.guardrail.trust_deficit_signal where trigger in 03) / count(br05.trigger.entered where trigger in 03)` | Referral moments |

### 5.3 Conversion metrics

| Metric ID | Metric | Formula | Scope |
| --- | --- | --- | --- |
| `CONV-M01` | Trigger-to-plan-view rate | `count(br05.pricing.plan.viewed) / count(br05.trigger.entered)` | All triggers |
| `CONV-M02` | Trigger-to-intent-start rate | `count(br05.pricing.intent.started) / count(br05.trigger.entered)` | All triggers |
| `CONV-M03` | Trigger-to-intent-complete rate | `count(br05.pricing.intent.completed) / count(br05.trigger.entered)` | All triggers |
| `CONV-M04` | Trigger-to-support-module engagement rate | `count(br05.module.opened where module like BR05-PR-* or BR05-FAQ-04) / count(br05.trigger.entered)` | Pricing-linked triggers |
| `CONV-M05` | Trigger-to-abandon rate | `count(br05.session.abandoned_after_trigger) / count(br05.trigger.entered)` | All triggers |

### 5.4 Guardrail metrics

| Metric ID | Metric | Formula | Scope |
| --- | --- | --- | --- |
| `GRD-M01` | Overclaim-risk signal rate | `count(br05.guardrail.overclaim_signal) / count(br05.trigger.entered)` | All triggers |
| `GRD-M02` | Trust-deficit signal rate | `count(br05.guardrail.trust_deficit_signal) / count(br05.trigger.entered)` | All triggers |
| `GRD-M03` | Negative support/contact pattern rate | `count(br05.guardrail.negative_support_pattern) / count(br05.trigger.entered)` | All triggers |
| `GRD-M04` | Boundary-engagement deficit rate | `1 - TRUST-M04` for handoff triggers | Handoff triggers |

## 6. Falsification thresholds (beta logic, not canon truth)

Use thresholds only after minimum sample gate is met:

- minimum `40` trigger entries per trigger ID per review window
- minimum `20` unique sessions per trigger ID per review window

Global red-flag thresholds:

- `GRD-M01 > 0.03` (overclaim risk above 3%)
- `GRD-M02 > 0.08` (trust-deficit above 8%)
- `COMP-M01 > 0.05` on readiness/handoff triggers

Any global red-flag breach is automatic trigger falsification for the affected moment until framing is corrected.

## 7. Trigger-by-trigger decision table

| Trigger ID | Validating result | Inconclusive result | Falsifying result | Next action if falsified |
| --- | --- | --- | --- | --- |
| `BR05-BETA-TRG-01` threshold | `CONV-M01` and `CONV-M02` improve vs control/cohort baseline, with no guardrail breach | sample gate not met, or mixed trust and conversion movement | overclaim or confusion proxy breach, or conversion flat/negative with rising abandon | remove pricing prompt on threshold surface, keep trust modules, re-test with boundary-first framing |
| `BR05-BETA-TRG-02` review-heavy | trust engagement (`TRUST-M01`) rises and abandon (`CONV-M05`) does not worsen materially | trust rises but conversion neutral | slowdown interpreted as upsell pressure (trust-deficit rises) | separate review helper from pricing prompt and re-run guarded-only variant |
| `BR05-BETA-TRG-03` referral | referral explanation engagement rises with stable guardrails | low volume and mixed sentiment | trust-deficit or negative-support pattern breach | suspend pricing at referral-stop, retain referral explanation only |
| `BR05-BETA-TRG-04` wrong-channel | wrong-channel repeat proxy (`COMP-M02`) improves and no overclaim breach | no clear change in repeat proxy | repeat proxy worsens or trust-deficit rises | remove pricing from wrong-channel flow, keep stop+reroute explanation only |
| `BR05-BETA-TRG-05` live confirmation | stale/live helper usage rises and abandon does not spike | helper usage up but no conversion movement | users infer product already confirmed live official status | strengthen live-check boundary copy module and rerun without pricing offer |
| `BR05-BETA-TRG-06` handoff-adjacent | plan-view and intent-start improve while handoff confusion proxy stays below threshold | conversion up with unstable trust metrics | official-completion misunderstanding rises | keep handoff helper modules, suppress pricing prompt near handoff boundary |
| `BR05-BETA-TRG-07` VCAT-adjacent | bounded support engagement rises with no authority overclaim signals | low sample or mixed signals | legal-authority interpretation appears in guardrail events | remove escalation-linked pricing prompt and continue support-only framing |

## 8. Rollout decision rules

1. Promote trigger from `TENTATIVE` to `LIKELY` only when sample gate is met and no falsification signal occurs for two consecutive review windows.
2. Promote trigger from `LIKELY` to `BETA_VALIDATED_FOR_NEXT_PASS` only when:
   - trust/comprehension metrics are stable or improving, and
   - conversion metrics are positive, and
   - no global guardrail threshold is breached.
3. Any guardrail red-flag immediately blocks expansion for that trigger until corrected and re-tested.
4. If conversion rises while trust/comprehension worsens, classify as `FAILED_FOR_TRUST` (not validated).

## 9. Ownership and review cadence

| Owner | Responsibility | Cadence |
| --- | --- | --- |
| Product owner (BR05) | Trigger-level decision calls and rollout gating | Weekly review window |
| Market/research partner | Hypothesis interpretation and interview synthesis | Weekly sync plus monthly synthesis |
| QA owner | Module-to-surface alignment checks (`BR05-QA-ALN-*`) before interpreting outcomes | Before each review window and after mapping changes |
| Engineering lead | Event schema integrity and taxonomy consistency review | Weekly data-quality check |
| Governance/legal reviewer | Boundary and overclaim-risk review for escalations | Fortnightly or ad hoc on red-flag breach |

Escalation SLA:

- any global red-flag threshold breach triggers review within `2 business days`

## 10. Implementation note

This plan is executable with current BR05 docs as a measurement contract. It intentionally does not introduce new runtime behavior, new paywall logic, or new doctrine.
