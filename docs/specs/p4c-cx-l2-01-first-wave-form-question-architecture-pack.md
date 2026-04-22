# P4C-CX-L2-01 First-Wave Form And Question Architecture Pack

Date: 2026-04-22
Task ID: P4C-CX-L2-01
Phase posture: Phase 4B remains primary; this is bounded parallel Phase 4C Lane 2 architecture work.

This pack translates the accepted first-wave journey and focused operating-shell structure into first-wave form/question architecture.

It does not invent new journey semantics, state families, protected lines, or guarded doctrine.

Guardrails preserved in this pack:

- preparation remains separate from official action
- handoff remains external and separate from execution
- deterministic controls remain separate from guarded controls
- stale, live confirmation required, wrong-channel reroute, and referral-first remain distinct
- shell stays bounded and wedge-led
- no portal mimicry, legal-advice behavior, filing/submission implication, or alpha-readiness implication
- ask only what is needed when it is needed; no over-collection

Source anchors:

- `docs/specs/p4c-cx-l1-01-first-wave-product-journey-pack.md`
- `docs/specs/p4c-cx-shell-01-focused-operating-shell-hero-workflow-mvp-structure-pack.md`
- `docs/specs/focused-operating-shell-baseline.md`
- `docs/architecture/current-product-posture.md`
- `docs/specs/lane-2-first-wave-copy-baseline.md`
- `docs/specs/lane-4-lifecycle-control-baseline.md`
- `docs/specs/non-blocked-dependency-map.md`
- `src/domain/model.ts`
- `src/workflow/arrearsHeroWorkflow.ts`
- `src/modules/arrears/index.ts`
- `src/modules/notice-readiness/index.ts`
- `src/modules/br01/*`
- `src/modules/br02/*`
- `src/modules/touchpoints/index.ts`
- `src/modules/output/*`
- `src/modules/handoff/*`

## 1. Architecture outcome summary

This pack defines:

- grouped first-wave question flows for shell plus hero workflow
- screen-level form architecture for core screens
- field inventory with required vs optional vs guarded classification
- dependency map for progression, slowdown, and interruptions
- high-friction and consequential-input notes with shell/legal fencing
- done-for-now persistence rules per major step

## 2. Grouped Question-Flow Pack

| Flow ID | Group | Primary screens | Ordered question groups | Progression rule | Done-for-now contract |
| --- | --- | --- | --- | --- | --- |
| `L2-FLOW-01` | Account/profile boundary setup | `SH-SCR-01` | operator identity, prep-and-handoff boundary acknowledgement, optional contact preferences | Must capture boundary acknowledgement before matter launcher access | Save profile + boundary acknowledgement so user can exit and resume without re-answering |
| `L2-FLOW-02` | Property setup | `SH-SCR-02` | property address, state/jurisdiction signals, source references | Property core fields required before tenancy creation | Persist partial property draft with explicit missing-field list |
| `L2-FLOW-03` | Tenancy setup + renter details | `SH-SCR-03` | tenancy dates, rent cycle, landlord/tenant parties, renter contacts | At least one tenant and one landlord party required before matter creation | Persist tenancy draft and party rows independently so capture can continue later |
| `L2-FLOW-04` | Lease/bond/reminder shell context | `SH-SCR-03`, `SH-SCR-05` | lease end visibility, bond-paid factual status, reminder triggers and dates | These inputs support continuity and reminders; they must not gate deterministic notice eligibility | Persist as shell context with clear "reminder support only" posture |
| `L2-FLOW-05` | Matter launcher and routing entry | `SH-SCR-04`, `SH-SCR-05`, `SH-SCR-06` | resume-or-start decision, objective capture, jurisdiction/risk signals | Objective capture is required; route-out/referral interrupts progression when triggered | Save launcher decision and unresolved objective/routing reasons |
| `L2-FLOW-06` | Matter creation baseline | `HW-SCR-01` | link property/tenancy, confirm matter identity, initial source references | Must produce `INTAKE_OPEN` baseline record | Save new matter even when intake is paused |
| `L2-FLOW-07` | Arrears intake | `HW-SCR-02` | rent charges, payment records, as-at timestamp, paid-to-date/current arrears confirmation | Requires minimum ledger completeness for threshold shell calculation | Persist each ledger row atomically; allow incomplete intake state |
| `L2-FLOW-08` | Threshold check | `HW-SCR-03` | threshold status confirmation, reasons if below/blocked, source corrections | `THRESHOLD_MET` unlocks notice progression; below/invalid remains blocked | Persist threshold result and correction tasks |
| `L2-FLOW-09` | Notice-prep fields | `HW-SCR-03` | notice number, prior notice context, output mode selection | Deterministic blockers remain explicit; guarded issues remain review-led | Save draft fields independently from readiness outcome |
| `L2-FLOW-10` | Service method + consent proof | `HW-SCR-04` | per-renter service method/attempt/date/proof, email consent linkage, hand-service review notes | Email requires consent proof linkage; hand delivery stays guarded slowdown | Persist one service-event row per renter per attempt and separate consent-proof records |
| `L2-FLOW-11` | Evidence timing + evidence capture | `HW-SCR-04`, `HW-SCR-05` | evidence timing state, hearing override inputs, evidence item metadata, proof-linkage markers | Missing service date or required evidence linkage blocks readiness; stale/freshness issues trigger warning/slowdown | Save evidence rows even when validation is blocked; preserve validation flag history |
| `L2-FLOW-12` | Output review + official handoff | `HW-SCR-05`, `HW-SCR-06` | review checklist, next-action context, external handoff confirmation, freshness/wrong-channel posture checks | `Prepared for handoff` remains rendering-only; official action stays external | Save "done for now" checkpoint and external next-action context |

## 3. Screen-Level Form Architecture For Core Flows

| Screen ID | Form sections | Required inputs now | Optional inputs now | Guarded/review-led inputs | Warning / slowdown placement | Referral / route-out placement |
| --- | --- | --- | --- | --- | --- | --- |
| `SH-SCR-01` Account/profile home | Profile identity, boundary acknowledgement | `ACC-01`, `ACC-03` | `ACC-02`, `ACC-04` | none | boundary reminder appears at submit and resume entry | none |
| `SH-SCR-02` Portfolio/property home | Property record form | `PROP-01`, `PROP-02`, `PROP-03`, `PROP-04`, `PROP-06` | `PROP-05` (defaulted) | `MAT-03` jurisdiction cross-check if non-VIC signals exist | warning when source references missing | route-out pre-check when non-VIC posture is detected |
| `SH-SCR-03` Tenancy home | Tenancy basics, renter details, lease/bond/reminder context | `TEN-01`, `TEN-02`, `TEN-04`, `TEN-06`, `REN-01` | `TEN-03`, `TEN-05`, `REN-02`, `REN-03`, `BOND-01`, `REM-*` | mandatory-reminder triggers (`REM-03`..`REM-06`) remain guarded configuration slots | reminder cautions and bond factual-visibility cue | none |
| `SH-SCR-04` Active matters | Matter list filters, resume launcher | `MAT-06` (resume or start) | status filters/sorting | touchpoint freshness posture overrides (`OUT-04`) | stale/live/wrong-channel cues rendered separately | referral-first and wrong-channel stop cards remain distinct |
| `SH-SCR-05` Current matter view | Matter summary, shell continuity panels, done-for-now checkpoint | `OUT-03` when pausing | `NOTE-*`, `DOC-*`, `SHELL-INS-*`, `SHELL-MAINT-*` | `SHELL-INS-*` and `SHELL-MAINT-*` remain bounded shell slots, non-hero gating | shell warnings for reminder freshness and chronology gaps | referral-first stop state shown when active |
| `SH-SCR-06` Matter launcher | Start/resume decision, objective/routing capture | `MAT-01`, `MAT-02` | `MAT-07` | `MAT-04`, `MAT-05` | guarded slowdown summary for mixed objectives | BR01 referral/route-out interrupts progression |
| `HW-SCR-01` Matter creation | Matter identity and baseline links | `MAT-01`, `MAT-02`, `MAT-07` | none | `MAT-04` sensitive risk flag | boundary warning remains visible before progression | route-out if objective/jurisdiction is out of scope |
| `HW-SCR-02` Arrears intake | Ledger charges, payments, arrears context | `LED-01`..`LED-03`, `LED-05`, `LED-06`, `LED-10` | `LED-04`, `LED-07`, `LED-08`, `LED-09`, `LED-11`, `LED-12` | none | deterministic blocker warnings for invalid ledger/threshold inputs | none |
| `HW-SCR-03` Threshold + notice preparation | Threshold result, notice-prep fields, prior notice context | `THR-01`, `NP-01` | `NP-02`..`NP-05`, `NP-06` | `NP-07` unresolved issue notes | below-threshold and guarded slowdown warnings | referral stop if BR01/BR02 controls escalate |
| `HW-SCR-04` Service/evidence capture | Service event rows, consent proof, timing overrides | `SV-01`, `SV-02`, `SV-03`, `SV-05`, `SV-06` | `SV-04`, `SV-07`, `SV-08`, `CP-04`..`CP-06`, `ET-06` | `CP-01`..`CP-03`, `ET-01`..`ET-05` | service warning family and timing warning family remain distinct | wrong-channel and referral overlays can interrupt |
| `HW-SCR-05` Output review | Readiness summary, evidence list, next-action context | `EV-01`, `EV-02`, `EV-05`, `EV-06`, `OUT-01`, `OUT-02` | `EV-03`, `EV-04`, `EV-07`, `EV-08`, `NOTE-*`, `DOC-*` | `EV-09`, `OUT-04` | stale/live confirmation and guarded review warnings are separate cards | referral-first stop card and wrong-channel reroute card are separate |
| `HW-SCR-06` Official handoff | External handoff guidance and checkpoint | `HO-01`, `HO-02` | `HO-03` | `OUT-04` when freshness/reroute controls apply | handoff warning family with boundary cues | wrong-channel reroute and referral external pathways interrupt ordinary handoff |

## 4. Field Inventory And Required/Optional/Guarded Map

Requirement classes:

- `REQUIRED`: needed to proceed in first-wave flow
- `OPTIONAL`: useful continuity/support input, not a deterministic progression gate
- `GUARDED`: review-led or doctrine-sensitive input; never auto-flattened into deterministic truth

| Field ID | Input | Primary flow/screen | Requirement | Notes |
| --- | --- | --- | --- | --- |
| `ACC-01` | Operator display name | `L2-FLOW-01` / `SH-SCR-01` | `REQUIRED` | profile identity for continuity |
| `ACC-02` | Operator contact email | `L2-FLOW-01` / `SH-SCR-01` | `OPTIONAL` | communication preference only |
| `ACC-03` | Prep-and-handoff boundary acknowledgement | `L2-FLOW-01` / `SH-SCR-01` | `REQUIRED` | mandatory boundary gate before consequential flows |
| `ACC-04` | Working timezone | `L2-FLOW-01` / `SH-SCR-01` | `OPTIONAL` | reminder/timestamp clarity; default from system |
| `PROP-01` | Property address line | `L2-FLOW-02` / `SH-SCR-02` | `REQUIRED` | maps to `Property.addressLine1` |
| `PROP-02` | Suburb | `L2-FLOW-02` / `SH-SCR-02` | `REQUIRED` | maps to `Property.suburb` |
| `PROP-03` | State/territory | `L2-FLOW-02` / `SH-SCR-02` | `REQUIRED` | feeds BR01 route-out checks |
| `PROP-04` | Postcode | `L2-FLOW-02` / `SH-SCR-02` | `REQUIRED` | maps to `Property.postcode` |
| `PROP-05` | Country code | `L2-FLOW-02` / `SH-SCR-02` | `OPTIONAL` | defaults `AU`; avoid duplicate asking |
| `PROP-06` | Property source references | `L2-FLOW-02` / `SH-SCR-02` | `REQUIRED` | preserves one-capture evidence traceability |
| `TEN-01` | Landlord party links | `L2-FLOW-03` / `SH-SCR-03` | `REQUIRED` | maps to `Tenancy.landlordPartyIds` |
| `TEN-02` | Tenant party links | `L2-FLOW-03` / `SH-SCR-03` | `REQUIRED` | maps to `Tenancy.tenantPartyIds` |
| `TEN-03` | Managing agent link | `L2-FLOW-03` / `SH-SCR-03` | `OPTIONAL` | maps to `Tenancy.managingAgentPartyId` |
| `TEN-04` | Agreement start date | `L2-FLOW-03` / `SH-SCR-03` | `REQUIRED` | maps to `Tenancy.agreementStartDate` |
| `TEN-05` | Agreement end date | `L2-FLOW-03` / `SH-SCR-03` | `OPTIONAL` | maps to `Tenancy.agreementEndDate` |
| `TEN-06` | Rent cycle | `L2-FLOW-03` / `SH-SCR-03` | `REQUIRED` | maps to `Tenancy.rentCycle` |
| `TEN-07` | Tenancy source references | `L2-FLOW-03` / `SH-SCR-03` | `REQUIRED` | traceability anchor |
| `REN-01` | Renter display name | `L2-FLOW-03` / `SH-SCR-03` | `REQUIRED` | maps to `Party.displayName` |
| `REN-02` | Renter contact email | `L2-FLOW-03` / `SH-SCR-03` | `OPTIONAL` | may become conditionally required for email service flow |
| `REN-03` | Renter contact phone | `L2-FLOW-03` / `SH-SCR-03` | `OPTIONAL` | continuity/support |
| `REN-04` | Renter source references | `L2-FLOW-03` / `SH-SCR-03` | `OPTIONAL` | recommended for consequential steps |
| `BOND-01` | Bond-paid status visibility | `L2-FLOW-04` / `SH-SCR-03` | `OPTIONAL` | factual visibility only; not legal conclusion |
| `BOND-02` | Bond status source reference | `L2-FLOW-04` / `SH-SCR-03` | `OPTIONAL` | trust cue for factual status |
| `REM-01` | Renewal reminder enabled | `L2-FLOW-04` / `SH-SCR-03` | `OPTIONAL` | support reminder only |
| `REM-02` | Reminder lead-time days | `L2-FLOW-04` / `SH-SCR-03` | `OPTIONAL` | no compliance certification implication |
| `REM-03` | Mandatory reminder key | `L2-FLOW-04` / `SH-SCR-03` | `GUARDED` | remains config slot where doctrine is amber |
| `REM-04` | Mandatory reminder trigger date | `L2-FLOW-04` / `SH-SCR-03` | `GUARDED` | guarded reminder trigger input |
| `REM-05` | Mandatory reminder last-checked at | `L2-FLOW-04` / `SH-SCR-03` | `GUARDED` | supports freshness controls |
| `REM-06` | Mandatory reminder source reference | `L2-FLOW-04` / `SH-SCR-03` | `GUARDED` | preserves mirror-with-warning posture |
| `MAT-01` | Selected tenancy/context for matter | `L2-FLOW-05` / `SH-SCR-06` | `REQUIRED` | matter launcher start/resume anchor |
| `MAT-02` | Objective capture selection | `L2-FLOW-05` / `SH-SCR-06` | `REQUIRED` | BR01 objective-first routing gate |
| `MAT-03` | Interstate/non-VIC jurisdiction signals | `L2-FLOW-05` / `SH-SCR-06` | `REQUIRED` | drives route-out posture |
| `MAT-04` | Family-violence-sensitive flag | `L2-FLOW-05` / `SH-SCR-06` | `GUARDED` | referral-first control; never ordinary handoff |
| `MAT-05` | Forum-path support override signal | `L2-FLOW-05` / `SH-SCR-06` | `GUARDED` | unresolved forum support remains guarded |
| `MAT-06` | Resume existing vs start new | `L2-FLOW-05` / `SH-SCR-04` | `REQUIRED` | launcher decision contract |
| `MAT-07` | Matter baseline source references | `L2-FLOW-06` / `HW-SCR-01` | `REQUIRED` | traceability for consequential matter data |
| `LED-01` | Rent charge due date | `L2-FLOW-07` / `HW-SCR-02` | `REQUIRED` | maps to `RentCharge.dueDate` |
| `LED-02` | Rent charge amount | `L2-FLOW-07` / `HW-SCR-02` | `REQUIRED` | maps to `RentCharge.amount` |
| `LED-03` | Rent charge period dates | `L2-FLOW-07` / `HW-SCR-02` | `REQUIRED` | maps to period start/end |
| `LED-04` | Rent charge source references | `L2-FLOW-07` / `HW-SCR-02` | `OPTIONAL` | strongly encouraged for evidence quality |
| `LED-05` | Payment received timestamp | `L2-FLOW-07` / `HW-SCR-02` | `REQUIRED` | maps to `PaymentRecord.receivedAt` |
| `LED-06` | Payment amount | `L2-FLOW-07` / `HW-SCR-02` | `REQUIRED` | maps to `PaymentRecord.amount` |
| `LED-07` | Payment method | `L2-FLOW-07` / `HW-SCR-02` | `OPTIONAL` | maps to `PaymentRecord.method` |
| `LED-08` | Payment reference | `L2-FLOW-07` / `HW-SCR-02` | `OPTIONAL` | maps to `PaymentRecord.reference` |
| `LED-09` | Payment source references | `L2-FLOW-07` / `HW-SCR-02` | `OPTIONAL` | source traceability support |
| `LED-10` | Arrears calculation as-at | `L2-FLOW-07` / `HW-SCR-02` | `REQUIRED` | required for deterministic shell calculation |
| `LED-11` | Paid-to-date confirmation | `L2-FLOW-07` / `HW-SCR-02` | `OPTIONAL` | confirm derived value; do not replace ledger truth |
| `LED-12` | Current arrears context note | `L2-FLOW-07` / `HW-SCR-02` | `OPTIONAL` | chronology support, not doctrine |
| `THR-01` | Threshold state result | `L2-FLOW-08` / `HW-SCR-03` | `REQUIRED` | derived gate outcome |
| `THR-02` | Threshold rule version | `L2-FLOW-08` / `HW-SCR-03` | `REQUIRED` | system-derived provenance |
| `THR-03` | Threshold reasons | `L2-FLOW-08` / `HW-SCR-03` | `REQUIRED` | blocker explanation when gate is closed |
| `NP-01` | Notice number | `L2-FLOW-09` / `HW-SCR-03` | `REQUIRED` | deterministic notice-readiness requirement |
| `NP-02` | Prior notice exists | `L2-FLOW-09` / `HW-SCR-03` | `OPTIONAL` | enables prior notice capture path |
| `NP-03` | Prior notice type | `L2-FLOW-09` / `HW-SCR-03` | `OPTIONAL` | maps to prior notice record |
| `NP-04` | Prior notice issued at | `L2-FLOW-09` / `HW-SCR-03` | `OPTIONAL` | maps to prior notice record |
| `NP-05` | Prior notice source references | `L2-FLOW-09` / `HW-SCR-03` | `OPTIONAL` | provenance only |
| `NP-06` | Output mode selection | `L2-FLOW-09` / `HW-SCR-03` | `REQUIRED` | preserves output-mode separation |
| `NP-07` | Unresolved issue notes | `L2-FLOW-09` / `HW-SCR-03` | `GUARDED` | review-led issue capture |
| `SV-01` | Renter party selection | `L2-FLOW-10` / `HW-SCR-04` | `REQUIRED` | one service-event row per renter/attempt |
| `SV-02` | Service scope | `L2-FLOW-10` / `HW-SCR-04` | `REQUIRED` | default `NOTICE` |
| `SV-03` | Service method | `L2-FLOW-10` / `HW-SCR-04` | `REQUIRED` | BR02 branching input |
| `SV-04` | Service attempt number | `L2-FLOW-10` / `HW-SCR-04` | `OPTIONAL` | defaults to first attempt |
| `SV-05` | Service occurred-at timestamp | `L2-FLOW-10` / `HW-SCR-04` | `REQUIRED` | required for date/deadline calculations |
| `SV-06` | Service proof status | `L2-FLOW-10` / `HW-SCR-04` | `REQUIRED` | supports deterministic/guarded posture |
| `SV-07` | Service proof evidence links | `L2-FLOW-10` / `HW-SCR-04` | `OPTIONAL` | proof linkage support |
| `SV-08` | Service notes | `L2-FLOW-10` / `HW-SCR-04` | `OPTIONAL` | chronology support |
| `CP-01` | Consent proof required flag | `L2-FLOW-10` / `HW-SCR-04` | `GUARDED` | derived gate; do not hide dependency |
| `CP-02` | Consent scope variation key | `L2-FLOW-10` / `HW-SCR-04` | `REQUIRED` when email service selected | reusable consent-proof identity |
| `CP-03` | Consent status | `L2-FLOW-10` / `HW-SCR-04` | `REQUIRED` when email service selected | `PROVIDED` required for deterministic email path |
| `CP-04` | Consent captured/revoked timestamps | `L2-FLOW-10` / `HW-SCR-04` | `OPTIONAL` | timeline context |
| `CP-05` | Consent evidence links | `L2-FLOW-10` / `HW-SCR-04` | `OPTIONAL` | provenance strengthening |
| `CP-06` | Consent source references | `L2-FLOW-10` / `HW-SCR-04` | `OPTIONAL` | provenance strengthening |
| `ET-01` | Evidence timing stale state code | `L2-FLOW-11` / `HW-SCR-04` | `GUARDED` | keeps freshness-sensitive logic explicit |
| `ET-02` | Hearing override present | `L2-FLOW-11` / `HW-SCR-04` | `GUARDED` | conditionally opens hearing-specific fields |
| `ET-03` | Hearing override label/code | `L2-FLOW-11` / `HW-SCR-04` | `GUARDED` | source-driven override identification |
| `ET-04` | Hearing reference type | `L2-FLOW-11` / `HW-SCR-04` | `GUARDED` | hearing date vs hearing notice reference |
| `ET-05` | Hearing reference date | `L2-FLOW-11` / `HW-SCR-04` | `GUARDED` | missing reference yields warning/slowdown |
| `ET-06` | Evidence timing notes | `L2-FLOW-11` / `HW-SCR-04` | `OPTIONAL` | chronology support |
| `EV-01` | Evidence item kind | `L2-FLOW-11` / `HW-SCR-05` | `REQUIRED` | maps to `EvidenceItem.kind` |
| `EV-02` | Evidence item title | `L2-FLOW-11` / `HW-SCR-05` | `REQUIRED` | maps to `EvidenceItem.title` |
| `EV-03` | Storage locator | `L2-FLOW-11` / `HW-SCR-05` | `OPTIONAL` | maps to `EvidenceItem.storageLocator` |
| `EV-04` | File metadata | `L2-FLOW-11` / `HW-SCR-05` | `OPTIONAL` | auto-captured on upload where available |
| `EV-05` | Attachment separation status | `L2-FLOW-11` / `HW-SCR-05` | `REQUIRED` | explicit review marker |
| `EV-06` | Proof-of-sending status | `L2-FLOW-11` / `HW-SCR-05` | `REQUIRED` | explicit linkage posture |
| `EV-07` | Related proof evidence IDs | `L2-FLOW-11` / `HW-SCR-05` | `OPTIONAL` | keeps linkage explicit |
| `EV-08` | Evidence source references | `L2-FLOW-11` / `HW-SCR-05` | `OPTIONAL` | provenance strengthening |
| `EV-09` | Validation flag set | `L2-FLOW-11` / `HW-SCR-05` | `GUARDED` | local validation posture, not legal sufficiency |
| `NOTE-01` | Note category | `L2-FLOW-04`, `L2-FLOW-11` / `SH-SCR-05` | `OPTIONAL` | recordkeeping only |
| `NOTE-02` | Note text | `L2-FLOW-04`, `L2-FLOW-11` / `SH-SCR-05` | `OPTIONAL` | chronology support |
| `NOTE-03` | Note captured at | `L2-FLOW-04`, `L2-FLOW-11` / `SH-SCR-05` | `OPTIONAL` | chronology support |
| `NOTE-04` | Linked subject (property/tenancy/matter) | `L2-FLOW-04`, `L2-FLOW-11` / `SH-SCR-05` | `OPTIONAL` | scoped note retrieval |
| `NOTE-05` | Note source references | `L2-FLOW-04`, `L2-FLOW-11` / `SH-SCR-05` | `OPTIONAL` | provenance strengthening |
| `SHELL-INS-01` | Inspection reminder date | `L2-FLOW-04` / `SH-SCR-05` | `OPTIONAL` | continuity support slot; not hero gate |
| `SHELL-INS-02` | Inspection outcome status | `L2-FLOW-04` / `SH-SCR-05` | `GUARDED` | shell bounded slot; no adjudication implication |
| `SHELL-MAINT-01` | Maintenance summary | `L2-FLOW-04` / `SH-SCR-05` | `OPTIONAL` | chronology support slot |
| `SHELL-MAINT-02` | Maintenance status | `L2-FLOW-04` / `SH-SCR-05` | `GUARDED` | bounded slot; no marketplace/work-order semantics |
| `DOC-01` | Document bundle selection | `L2-FLOW-11`, `L2-FLOW-12` / `SH-SCR-05` | `OPTIONAL` | packaging support only |
| `DOC-02` | Export package purpose label | `L2-FLOW-12` / `HW-SCR-05` | `OPTIONAL` | records/bundle context only |
| `DOC-03` | Export source selection | `L2-FLOW-12` / `HW-SCR-05` | `OPTIONAL` | packaging scope only |
| `OUT-01` | Review checklist acknowledgement | `L2-FLOW-12` / `HW-SCR-05` | `REQUIRED` | local review completion marker |
| `OUT-02` | Next-action context class | `L2-FLOW-12` / `HW-SCR-05` | `REQUIRED` | must distinguish in-product vs official external vs referral external |
| `OUT-03` | Done-for-now checkpoint | `L2-FLOW-12` / `SH-SCR-05` | `REQUIRED` when pausing | preserves return/resume behavior |
| `OUT-04` | Touchpoint freshness/channel posture | `L2-FLOW-12` / `HW-SCR-05` | `GUARDED` | keeps stale/live/wrong-channel distinct |
| `HO-01` | External handoff channel confirmation | `L2-FLOW-12` / `HW-SCR-06` | `REQUIRED` | confirms external owner for official step |
| `HO-02` | Official handoff stage | `L2-FLOW-12` / `HW-SCR-06` | `REQUIRED` | maps to `OfficialHandoffStateRecord.stage` |
| `HO-03` | External action notes | `L2-FLOW-12` / `HW-SCR-06` | `OPTIONAL` | continuity only; no official submission claim |

## 5. Question Dependency Map

| Dependency ID | Upstream input(s) | Dependency rule | Downstream effect |
| --- | --- | --- | --- |
| `DEP-01` | `ACC-03` | Boundary acknowledgement must be captured first | Unlock `SH-SCR-06` launcher entry |
| `DEP-02` | `PROP-03`, `MAT-03` | Non-VIC or unsupported forum signals route out | Interrupt ordinary hero entry with route-out stop |
| `DEP-03` | `TEN-01`, `TEN-02` | Tenancy needs at least one landlord and tenant | Unlock matter creation |
| `DEP-04` | `MAT-02` | Objective capture is mandatory | Missing objective triggers `OBJECTIVE_CAPTURE_REQUIRED` slowdown |
| `DEP-05` | `MAT-04` | Family-violence-sensitive signal escalates to referral-first | Interrupt ordinary progression with referral external path |
| `DEP-06` | `LED-01`..`LED-03`, `LED-05`, `LED-06`, `LED-10` | Minimum ledger set required for arrears shell | Enables threshold calculation |
| `DEP-07` | `THR-01` | Only `THRESHOLD_MET` can open no-early-notice gate | Below/invalid stays blocked in threshold step |
| `DEP-08` | `NP-01`, `NP-06` | Notice number and output mode required for notice-prep continuation | Enables service/evidence stage |
| `DEP-09` | `SV-03` | Service method selects downstream question branch | Email opens consent proof branch; hand delivery opens guarded review branch |
| `DEP-10` | `SV-03=EMAIL`, `CP-02`, `CP-03` | Email service needs linked provided consent proof | Missing linkage causes hard stop |
| `DEP-11` | `SV-05` | Service date required for termination/evidence deadlines | Missing date causes hard stop |
| `DEP-12` | `ET-02=true`, `ET-04`, `ET-05` | Hearing override requires hearing reference context | Missing reference produces warning/slowdown; no silent pass |
| `DEP-13` | `EV-05`, `EV-06` | Attachment separation and proof linkage status must be explicit | Controls review posture in output review |
| `DEP-14` | `OUT-04` freshness/channel controls | Stale/live/wrong-channel drive distinct warning/interrupt families | Shifts CTA hierarchy and next-action context |
| `DEP-15` | `OUT-02` | Next-action context must be explicit | Distinguishes in-product, official external, referral external pathways |
| `DEP-16` | `OUT-03` | Done-for-now checkpoint captured on pause | Enables safe resume from current matter view |

## 6. Warning, Slowdown, Review, And Referral Placement

| Control family | Primary placement | Trigger examples | Required behavior |
| --- | --- | --- | --- |
| Service warnings | `HW-SCR-04`, `HW-SCR-05` | non-preferred postal paths, guarded proof posture | warning and review cues; no silent deterministic promotion |
| Evidence timing warnings | `HW-SCR-04`, `HW-SCR-05` | stale timing surface, hearing override freshness issues | preserve dual-step plus override posture; generic timing never outranks hearing-specific guidance |
| Handoff warnings | `HW-SCR-05`, `HW-SCR-06` | stale/live confirmation required, external dependency | shift CTA hierarchy; keep external ownership explicit |
| Referral/sensitive overlays | `SH-SCR-06`, `HW-SCR-03`, `HW-SCR-05`, `HW-SCR-06` | family-violence-sensitive signal, BR01 referral, wrong-channel reroute | stop ordinary progression and show referral or reroute pathway |
| Deterministic blockers | `HW-SCR-02`, `HW-SCR-03`, `HW-SCR-04` | missing ledger minimums, threshold not met, missing notice number, missing email consent | block progression with named reason |
| Guarded slowdowns | `HW-SCR-03`, `HW-SCR-04`, `HW-SCR-05` | hand service review, mixed-claim interaction, unresolved timing doctrine | hold in review-required path; preserve insertion points |

Interruption-style integrity rules for this architecture:

- stale, live confirmation required, wrong-channel reroute, and referral-first are separate interruption patterns
- wrong-channel always remains stop + explain + reroute
- referral-first never reuses ordinary handoff as primary
- `Prepared for handoff` is rendering-only and never replaces workflow/control truth

## 7. High-Friction And Consequential Question Notes

| Item ID | Question cluster | Why it is high-friction or consequential | Architecture treatment |
| --- | --- | --- | --- |
| `HF-01` | Objective capture (`MAT-02`) | Wrong objective capture distorts routing and trust posture | Ask early in launcher, keep explicit required gate |
| `HF-02` | Jurisdiction/route-out (`MAT-03`) | Incorrect jurisdiction creates false confidence risk | Ask before hero progression; interrupt with route-out stop |
| `HF-03` | Family-violence-sensitive signal (`MAT-04`) | Sensitive matter posture needs referral-first handling | Keep guarded and referral-led; no ordinary progression default |
| `HF-04` | Service method (`SV-03`) | Drives deterministic vs guarded pathways | Ask once per renter/attempt; branch questions conditionally |
| `HF-05` | Email consent proof (`CP-02`, `CP-03`) | Missing consent can invalidate deterministic email path | Conditional required gate for email only |
| `HF-06` | Service date (`SV-05`) | Missing date prevents termination/deadline calculations | Hard-stop until captured |
| `HF-07` | Hearing override inputs (`ET-02`..`ET-05`) | Generic timing can be wrong when hearing-specific instruction exists | Keep override branch explicit and freshness-sensitive |
| `HF-08` | Touchpoint freshness/channel posture (`OUT-04`) | Misclassified freshness/channel can cause wrong CTA path | Separate stale/live/reroute controls in output/handoff |
| `HF-09` | Next-action context (`OUT-02`) | Blurred context risks implying product execution | Force explicit selection: in-product, official external, referral external |

Consequential-input wording fences preserved:

- reminder support = yes, compliance certification = no
- bond status = factual visibility, not legal conclusion
- notes/inspections/maintenance = chronology and recordkeeping, not adjudication
- export/document structures = records and bundles, not filing or legal readiness

## 8. Done-For-Now Handling Notes

| Major step | Minimum saved bundle before pause | Resume destination | Notes |
| --- | --- | --- | --- |
| Account/profile setup | `ACC-01`, `ACC-03` | `SH-SCR-01` | boundary acknowledgement must remain visible on resume |
| Property/tenancy setup | `PROP-*`, `TEN-*`, `REN-*` partial set | `SH-SCR-02` or `SH-SCR-03` | show explicit missing required fields, not generic incomplete label |
| Matter launcher | `MAT-06`, captured `MAT-02` progress | `SH-SCR-06` | retain unresolved objective/routing reasons |
| Arrears intake | saved ledger rows + `LED-10` if present | `HW-SCR-02` | keep deterministic blocker reasons attached to draft |
| Threshold/notice prep | `THR-*`, `NP-*` partial set | `HW-SCR-03` | blocked and guarded posture must remain distinct on return |
| Service/consent/timing | `SV-*`, `CP-*`, `ET-*` partial set | `HW-SCR-04` | preserve per-renter service rows and separate consent objects |
| Evidence/output review | `EV-*`, `OUT-*` partial set | `HW-SCR-05` | keep freshness/reroute/referral controls explicit |
| Official handoff guidance | `HO-*`, `OUT-03` | `HW-SCR-06` then `SH-SCR-05` | pause state reflects external dependency, not official completion |

## 9. 4C-B Feed-Forward Notes

This architecture is ready to feed 4C-B implementation planning with:

- explicit grouped question flow order
- explicit field-level requirement classes
- explicit dependency and interruption map
- explicit consequential-input fences for shell, trust, and handoff posture
- explicit done-for-now persistence contracts for each major step

Still intentionally guarded:

- BR03 cadence/authority doctrine details
- BR04 retention/release doctrine details
- reminder areas that remain amber and should not be hardened by form design
- communication chronology as a non-hero-gating shell continuity surface
