# BR05 Module-to-Surface Alignment Checks

Task ID: `P4B-CX-BR05-03`
Date: 2026-04-20
Scope: QA acceptance checks for BR05 supporting-module alignment with concrete Lane 2 inventory entries

## 1. Inputs under test

- `docs/specs/br05-supporting-content-system-pack.md`
- `docs/specs/br05-beta-pricing-trust-validation-pack.md`
- `docs/specs/br05-beta-measurement-plan-artifact.md`
- `src/modules/output/trustBindings.ts`
- `src/modules/output/index.ts`
- `src/modules/handoff/index.ts`

## 2. Acceptance checks

| Check ID | Check | Pass condition | Fail condition |
| --- | --- | --- | --- |
| `BR05-QA-ALN-01` | Inventory key validity | Every inventory entry in BR05-03 maps to an existing surface/block/section key in current output/handoff logic | Any inventory key cannot be found in current output/handoff key sets |
| `BR05-QA-ALN-02` | Module binding completeness | Every BR05-02 module ID appears at least once in BR05-03 module-to-inventory binding table | Any BR05-02 module ID is unbound |
| `BR05-QA-ALN-03` | Module binding admissibility | No module is bound to an inventory entry outside its declared semantic family (for example stale module on referral-only entry) | Module appears on semantically incompatible entry |
| `BR05-QA-ALN-04` | Distinct warning-state preservation | Separate bindings remain for `touchpoint-stale`, `live-confirmation-required`, `wrong-channel-reroute`, `slowdown-review`, and `referral-stop` | Two or more distinct warning families are collapsed into one generic mapping |
| `BR05-QA-ALN-05` | Handoff boundary integrity | Handoff modules bind to `handoff-boundary`, `external-action-owner`, and/or `review-before-official-step` with external ownership preserved | Handoff modules imply in-product official execution or omit external ownership cues |
| `BR05-QA-ALN-06` | Pricing trigger event-link rule | Every pricing module (`BR05-PR-*`, `BR05-FAQ-04`) binds to concrete event/state inventory entries only | Pricing modules appear as generic non-event subscription prompts |
| `BR05-QA-ALN-07` | Overclaim guard rule | All bound modules preserve `MUST_NOT_OVERCLAIM` behavior and avoid filing/legal-certainty implication | Any bound module implies official filing, authority, or legal certainty |
| `BR05-QA-ALN-08` | Local validation boundary rule | Evidence/privacy modules bound to evidence entries preserve local-only validation meaning | Any evidence module implies official acceptance or settled legal sufficiency |
| `BR05-QA-ALN-09` | Trust-cue adjacency rule | Pricing-trigger entries include boundary/source/freshness cues where required by BR05-03 trigger table | Pricing entry lacks required trust cues for its trigger |
| `BR05-QA-ALN-10` | Falsification readiness rule | Each beta trigger has explicit falsification evidence criteria before rollout | Trigger has success criteria only, with no falsification definition |
| `BR05-QA-ALN-11` | Measurement-plan mapping sync | Every trigger/module/inventory mapping in BR05-04 references valid IDs defined in BR05-02 and BR05-03 | BR05-04 uses unknown or drifted trigger/module/inventory IDs |

## 3. QA execution notes

- Run these checks whenever BR05 module text, inventory entries, or trigger mappings are modified.
- Treat any `BR05-QA-ALN-*` failure as a release-blocking documentation defect for beta validation planning.
- Do not "fix" failures by weakening boundaries or collapsing warning families.

## 4. Completion gate

BR05 module-to-surface alignment is acceptable only when:

1. all checks `BR05-QA-ALN-01` through `BR05-QA-ALN-11` pass, and
2. protected Lane 2 lines remain untouched, and
3. no unsupported trust capability is claimed in any bound module.
