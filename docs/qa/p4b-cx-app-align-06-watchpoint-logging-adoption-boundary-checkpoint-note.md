# P4B-CX-APP-ALIGN-06 Watchpoint Logging Adoption-Boundary Checkpoint Note

Date: 2026-05-03
Task ID: P4B-CX-APP-ALIGN-06

Scope: record the current internal watchpoint logging adoption boundary after `APP-ALIGN-03` through `APP-ALIGN-05`.

This is a documentation/checkpoint artifact only.
It does not change runtime code, tests, UI/copy, routing behavior, logging behavior, status labels, CTA hierarchy, dashboards/admin/support tooling, analytics behavior, or product semantics.

## 1. Current Adoption Summary

- `APP-ALIGN-03`: schema contract frozen (`docs/specs/p4b-cx-app-align-03-internal-guardrail-watchpoint-logging-schema-contract-pack.md`).
- `APP-ALIGN-04`: internal emitter implemented (`src/app/launcherCurrentMatterWatchpointLoggingEmitter.ts`) with allowed `WATCH_*_OBSERVED` families, schema guards, forbidden-semantic token checks, and minimisation rules.
- `APP-ALIGN-05`: emitter wired into one narrow caller path only (`src/app/launcherCurrentMatterWatchpointWiredCaller.ts`) via explicit sink injection.
- Current wiring path:
  - `consumeLauncherCurrentMatterInternalHandlingActionWithWatchpointsFromOutputCheckpoint(...)`
  - wraps `consumeLauncherCurrentMatterInternalHandlingActionFromOutputCheckpoint(...)`
  - emits only when `watchpointSink` is injected
- No-sink behavior: inert by design (`emittedWatchpointEvents: []`) and handling-action output remains unchanged.
- Event-family posture: internal-only neutral `WATCH_*` families; no success/clearance/compliance/finality semantics.
- Protected-state coverage remains explicit in emitted flags.
- Payload posture remains locator-first and minimised (`MINIMISED_INTERNAL`).
- Current non-adoption areas remain unchanged: no second caller path, no global/default logger, no persistent sink, no dashboard/admin/support/export exposure, and no analytics copy.

## 2. Adoption-Boundary Table

| Boundary area | Current status | Allowed current use | Forbidden use | Trigger before expansion | Review owner / review type |
| --- | --- | --- | --- | --- | --- |
| Caller-path coverage | One sink-injected path only (`launcherCurrentMatterWatchpointWiredCaller`) | Internal QA/audit/debug visibility on that one path | Wiring additional paths without explicit task/gate | Adoption-gated expansion backlog accepted | Product + app architecture checkpoint review |
| Sink injection model | Explicit optional `watchpointSink` injection | Localized caller-level emission control | Hidden/global/default production logging | Explicit sink-topology contract for any wider wiring | Architecture review event |
| No-sink behavior | Explicit inert path (`[]` events) | Safe default behavior when no sink exists | Silent fallback to global/event-bus sink | Contract update that preserves explicit no-sink semantics | Engineering invariants review |
| Event naming posture | `WATCH_*_OBSERVED` internal families only | Internal observability identifiers | Semantics implying success, cleared/compliant, ready/final/filed/approved | Schema-contract revision with anti-overclaim validation retained | Product trust-language review |
| Payload minimisation | Locator-first, redacted, schema-guarded | Internal diagnostics with non-sensitive locators | Personal details, free-text legal facts, document contents, credentials/official identifiers, unnecessary address/payment data | Data-governance gate and minimisation checklist update | Privacy/data-minimisation review |
| Consumer exposure | No UI/admin/support/analytics consumer | Internal-only sink output in tests/QA harness flows | User-visible logs, dashboard copy, status labels, CTA coupling | Separate future task packets with surface gates | Product + 4C contract review |
| Persistence/export | No persistent sink or export seam | In-memory/test sink usage | Adding persistent storage/export behavior in this seam | Dedicated persistence contract + readiness gate | Storage/security + architecture review |

## 3. Protected-State Logging Summary

| Protected state | Current logging posture | Boundary caveat |
| --- | --- | --- |
| No-record non-clearance | Explicit `WATCH_LIFECYCLE_NO_RECORD_OBSERVED`; `noRecordFlag=true`; `clearanceInferred=false` | Must never be reinterpreted as success/clearance |
| Malformed / cannot-safely-resume | Explicit `WATCH_LIFECYCLE_CANNOT_RESUME_OBSERVED`; `cannotSafelyResumeFlag=true` | Must stay fail-safe and must not silently degrade |
| No routing signal | Explicit `WATCH_LIFECYCLE_NO_ROUTING_SIGNAL_OBSERVED`; `noRoutingSignalFlag=true` | Must never default to proceed/success |
| Hold-aware / release-controlled | `WATCH_LIFECYCLE_HOLD_RELEASE_STATE_OBSERVED` with explicit hold/release flags | Must remain review-led visibility, not completion signal |
| Deletion vs de-identification route kind | `lifecycleRouteKind` remains distinct (`DELETION_REQUEST` vs `DEIDENTIFICATION_ACTION`) | Must not collapse route kinds |
| Lifecycle/non-lifecycle separation | `lifecycleNonLifecycleSeparationFlag=true` preserved | Must not collapse into generic launcher-resume success |

## 4. Minimisation Summary

- Locator-first payload posture:
  - `matterLocatorRef`
  - `outputPackageLocatorRef`
  - `auditProvenanceRef`
- Redaction posture: `MINIMISED_INTERNAL`.
- Excluded data classes:
  - tenant/renter personal details
  - free-text legal facts
  - document contents
  - official credentials/identifiers
  - unnecessary address details
  - unnecessary payment details
- No UI/status/CTA/public-analytics fields are part of the watchpoint schema.

## 5. What This Proves

- The `APP-ALIGN-03` schema contract is now implemented and exercised through one real caller path.
- Explicit sink-injected emission and explicit no-sink inert behavior are both working and test-covered.
- Protected-state watchpoints and minimised payload posture are preserved at runtime in the wired path.
- Logging remains internal-only and non-certifying in current scope.

## 6. What This Does Not Prove

- It does not prove readiness for second-path wiring.
- It does not prove readiness for persistent sinks, dashboards, admin/support tooling, or exports.
- It does not prove UI/surface/status/CTA readiness.
- It does not prove BR04 completion, storage/security readiness, privacy-engine completion, alpha readiness, or Review C outcomes.

## 7. Do Not Overclaim

Do not treat this checkpoint as:

- permission to add global/default production logging
- permission to expose watchpoints as analytics/product language
- evidence of compliance clearance, legal sufficiency, filing readiness, or official action
- evidence that internal watchpoints should drive user-facing route/state behavior

## 8. Next-Option Analysis

### Option A: Wire a second internal caller path now

- Upside: broader internal observability coverage.
- Risk: expansion drift before explicit adoption gates, sink topology, and ownership are frozen.

### Option B: Pause logging expansion until 4C shell/current-matter contracts catch up

- Upside: strongest guard against route/surface semantic drift.
- Risk: delayed internal observability breadth for adjacent internal seams.

### Option C: Create an adoption-gated logging expansion backlog before any second path

- Upside: preserves momentum while making expansion gates, ownership, and forbidden interpretations explicit.
- Risk: adds one planning checkpoint before additional runtime wiring.

## 9. Recommended Next Move

Recommended: **Option C**.

Rationale:

- Current one-path adoption is sufficient as a proof point.
- Expansion risk now is sequencing/governance risk, not emitter correctness risk.
- A compact expansion backlog can gate second-path candidates, sink topology decisions, and review ownership before any additional runtime wiring.
