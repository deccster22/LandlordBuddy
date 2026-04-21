# P4C-CX-L1-01 First-Wave Product Experience And Journey Pack

Date: 2026-04-21
Task ID: P4C-CX-L1-01
Phase posture: Phase 4B remains primary; this is parallel Phase 4C Lane 1 definition work.

This pack translates the current arrears-to-notice-readiness spine into a first-wave product journey that can be narrated end-to-end without inventing new doctrine or renaming frozen semantics.

Guardrails preserved in this pack:

- preparation remains separate from official action
- handoff remains separate from execution
- deterministic controls remain separate from guarded controls
- wrong-channel, stale, live-confirmation, review, and referral remain distinct
- official handoff remains external
- no filing/submission/proxy filing implication
- no portal mimicry and no legal-advice path selection

Source anchors:

- `docs/architecture/arrears-mvp-spine.md`
- `docs/architecture/arrears-mvp-architecture.md`
- `docs/architecture/output-handoff-evidence-shells.md`
- `docs/governance/P4B Freeze Map.md`
- `docs/specs/non-blocked-dependency-map.md`
- `docs/qa/p4b-cx-l3-01-qa-rule-map.md`
- `docs/qa/p4b-cx-l3-02-scenario-library-and-state-matrix.md`

## 1. First-Wave End-To-End Journey Map

| Step | Primary screen | User goal | Runtime posture anchor | Done-for-now contract | Next action owner |
| --- | --- | --- | --- | --- | --- |
| 1 | Homepage / entry | Understand what the product does and does not do; start safely | Preparation-only boundary, no official execution | User has either started a matter or intentionally exited | `USER_OR_OPERATOR` |
| 2 | Onboarding / first run | Confirm lane fit and boundary posture before entering consequential steps | Preparation/handoff boundary and trust cues visible | User has acknowledged prep-and-handoff posture and proceeds to create a matter | `USER_OR_OPERATOR` |
| 3 | Matter creation | Create a matter with property, tenancy, and parties | Workflow enters `INTAKE_OPEN` | Matter exists with a valid identity and baseline records | `USER_OR_OPERATOR` |
| 4 | Arrears intake | Capture ledger facts and source references once | `INTAKE_OPEN` or `INTAKE_INCOMPLETE` -> `TRIAGE_READY` | Intake is complete enough to run threshold triage, or explicitly paused | `USER_OR_OPERATOR` |
| 5 | Threshold check | Determine if no-early-notice gate can open | Arrears threshold shell + BR02 notice eligibility gate | Outcome is explicit: threshold met, below threshold, or blocked-invalid | `USER_OR_OPERATOR` |
| 6 | Notice preparation | Build reviewable notice-preparation state without overclaim | Notice readiness outcome: `READY_FOR_REVIEW`, `REVIEW_REQUIRED`, `BLOCKED`, or `REFER_OUT` | Matter is ready for local review, paused for review/blocker, or referred out | `USER_OR_OPERATOR` |
| 7 | Service/evidence capture | Capture service method, proof posture, consent, and timing posture | BR02 consumer + evidence shell + local-only validation | Service/evidence posture is explicit; no implicit sufficiency claim | `USER_OR_OPERATOR` |
| 8 | Output review | Review printable/prep-pack structure and control surfaces | Output shell + trust bindings + renderer state | Matter is locally reviewable, blocked, guarded, or referral-stopped | `USER_OR_OPERATOR` |
| 9 | Official handoff | Move to external action with boundary-safe guidance | Handoff guidance shell, external-action-owner, boundary codes | `Prepared for handoff` or referral/reroute stop; official action remains external | `USER_OR_OPERATOR` outside Landlord Buddy |

## 2. Primary Flow Map (Entry To Official Handoff)

Mainline first-wave flow:

1. Homepage / entry
2. Onboarding / first run
3. Matter creation
4. Arrears intake
5. Threshold check
6. Notice preparation
7. Service/evidence capture
8. Output review
9. Official handoff

Consequence branches that must remain explicit:

| Branch point | Trigger | Required branch behaviour | Return point |
| --- | --- | --- | --- |
| Intake pause | Missing core facts/source refs | `INTAKE_INCOMPLETE` or `STOPPED_PENDING_EXTERNAL_INPUT`; do not auto-continue | Arrears intake |
| Threshold hard-stop | `BLOCKED_INVALID` or below threshold | Show blocker state, hold progression, no notice progression | Threshold check after input correction |
| Guarded slowdown | Guarded service/timing/mixed-claim posture | Stay in review-required path; no silent deterministic pass | Notice preparation or service/evidence capture |
| Referral / route-out | BR01 referral/route-out or wrong-channel reroute | Stop ordinary flow, show referral-stop/reroute posture | External path only; re-entry requires explicit new in-scope path |
| Freshness/live override | Stale or live-confirmation-required touchpoint posture | Downgrade to warning/slowdown; shift CTA posture away from ordinary handoff if required | Output review or official handoff after refresh/confirmation |

## 3. First-Wave Screen Inventory

Primary journey screens:

| Screen ID | Screen | Purpose | Key control families surfaced | Primary success state |
| --- | --- | --- | --- | --- |
| `L1-SCR-01` | Homepage / entry | Start safely and set workflow-support posture | Handoff boundary, anti-overclaim | User can start matter |
| `L1-SCR-02` | Onboarding / first run | Establish separation and trust cues before consequential steps | Prep-only and handoff boundary cues | User can continue to matter creation |
| `L1-SCR-03` | Matter creation | Create matter and baseline tenancy context | Deterministic creation requirements | `INTAKE_OPEN` |
| `L1-SCR-04` | Arrears intake | Capture charges/payments/source references | Input completeness and source-link controls | `TRIAGE_READY` or explicit intake pause |
| `L1-SCR-05` | Threshold check | Apply arrears threshold and no-early-notice gate | Threshold blockers and gate rules | Threshold eligible or explicit block |
| `L1-SCR-06` | Notice preparation | Evaluate notice readiness posture | Deterministic blockers + guarded review hooks | `READY_FOR_REVIEW` or controlled review/stop |
| `L1-SCR-07` | Service/evidence capture | Capture service proof and timing posture | Service warning family, evidence timing family, local validation only | Service/evidence posture captured with visible controls |
| `L1-SCR-08` | Output review | Present structured package for local review | Trust-cue bindings, readiness/review states, stale/live/reroute controls | Package is reviewable with explicit boundary posture |
| `L1-SCR-09` | Official handoff | Hand off to external official action safely | Handoff warning family, CTA hierarchy, external-action-owner | Prepared for handoff or explicit stop/reroute |

First-wave consequential overlays/panels (explicit, not hidden logic):

| Screen ID | Overlay/panel | Trigger posture | Behaviour |
| --- | --- | --- | --- |
| `L1-OVR-01` | Stale | Touchpoint freshness `STALE` | Warning + downgrade consequence, not silent continue |
| `L1-OVR-02` | Live confirmation required | Touchpoint freshness `LIVE_CONFIRMATION_REQUIRED` | Slowdown and explicit live-source dependency |
| `L1-OVR-03` | Wrong-channel reroute | Touchpoint channel `WRONG_CHANNEL_REROUTE` | Stop + explain + reroute; suppress ordinary handoff |
| `L1-OVR-04` | Referral-first sensitive overlay | Referral severity controls active | Stop ordinary progression and direct to external/specialist path |
| `L1-OVR-05` | Hold-affected / deletion review | BR04 hold/deletion review conditions | Keep lifecycle actions review-led and scoped |

## 4. State-To-Screen Map

### 4.1 Workflow state to screen placement

| Workflow state | Primary screens | Required presentation posture | Required trust cue anchor |
| --- | --- | --- | --- |
| `INTAKE_OPEN` | Matter creation, arrears intake | Preparation only | Local preparation boundary visible |
| `INTAKE_INCOMPLETE` | Arrears intake | Blocked / controlled pause | Blocking reason named |
| `TRIAGE_READY` | Threshold check | Ready to review (local) | Readiness-not-filing cue |
| `TRIAGE_SLOWDOWN` | Threshold check, notice preparation | Needs review / guarded | Uncertainty type named |
| `ARREARS_FACTS_READY` | Threshold check, notice preparation | Ready to review (local) | Readiness remains local only |
| `ARREARS_FACTS_GUARDED` | Notice preparation, service/evidence capture | Needs review / guarded | Guarded reason visible |
| `NOTICE_DRAFTING_READY` | Notice preparation | Ready to review (local) | Review-before-official-step cue |
| `NOTICE_DRAFTING_GUARDED` | Notice preparation, service/evidence capture | Needs review / slowdown | Guarded review cue |
| `NOTICE_READY_FOR_REVIEW` | Output review | Ready to review / prepared for handoff pathway | External step still pending cue |
| `REFER_OUT` | Referral-first overlay, handoff panel | Referral-first stop | Concrete referral reason + reroute cue |
| `STOPPED_PENDING_EXTERNAL_INPUT` | Intake/threshold/notice screens as stop state | Blocked or external input required | Stop reason + return condition visible |

### 4.2 Review/handoff outcome to screen placement

| Review/handoff outcome | Primary screens | Next-action kind | Boundary |
| --- | --- | --- | --- |
| `NOT_EVALUATED` | Notice preparation, output review | `ATTACH_REVIEW_STATE` | Inside Landlord Buddy |
| `READY_FOR_REVIEW` | Output review, official handoff | `COMPLETE_LOCAL_REVIEW` or `TAKE_EXTERNAL_OFFICIAL_STEP` (by handoff stage) | Inside first, then outside for official step |
| `BLOCKED` | Threshold check, notice preparation, output review | `RESOLVE_BLOCKER` | Inside Landlord Buddy |
| `REVIEW_REQUIRED` | Notice preparation, service/evidence capture, output review | `COMPLETE_GUARDED_REVIEW` | Inside Landlord Buddy |
| `REFER_OUT` | Referral-first overlay, handoff guidance | `REFER_OUTSIDE_STANDARD_PATH` | Outside Landlord Buddy |

## 5. Next-Action-Owner Map

| Next-action kind | Owner | Boundary | Typical trigger | Surface family |
| --- | --- | --- | --- | --- |
| `ATTACH_REVIEW_STATE` | `USER_OR_OPERATOR` | `INSIDE_LANDLORD_BUDDY` | Readiness not yet evaluated | Notice preparation / output review |
| `RESOLVE_BLOCKER` | `USER_OR_OPERATOR` | `INSIDE_LANDLORD_BUDDY` | Deterministic blocker present | Intake / threshold / notice / output |
| `COMPLETE_LOCAL_REVIEW` | `USER_OR_OPERATOR` | `INSIDE_LANDLORD_BUDDY` | Ready-for-review with no guarded stop | Output review |
| `COMPLETE_GUARDED_REVIEW` | `USER_OR_OPERATOR` | `INSIDE_LANDLORD_BUDDY` | Guarded slowdown/review controls active | Notice preparation / service-evidence / output |
| `TAKE_EXTERNAL_OFFICIAL_STEP` | `USER_OR_OPERATOR` | `OUTSIDE_LANDLORD_BUDDY` | Handoff stage indicates external dependency | Official handoff |
| `REFER_OUTSIDE_STANDARD_PATH` | `USER_OR_OPERATOR` | `OUTSIDE_LANDLORD_BUDDY` | Referral-first or wrong-channel reroute | Referral overlay / reroute surfaces |

Ownership invariants:

- Product preparation owner remains `LANDLORD_BUDDY` inside product boundary.
- External official execution owner is never the product.
- Handoff state indicates dependency, not completion.

## 6. Exit-Point And Return-Point Map

| Exit point ID | Exit condition | Exit posture | Return condition | Return screen |
| --- | --- | --- | --- | --- |
| `EP-01` | User leaves at homepage/onboarding | Intentional no-start | User chooses to start matter | Homepage / onboarding |
| `EP-02` | Missing intake dependencies | Controlled pause (`INTAKE_INCOMPLETE`) | Missing facts/source refs supplied | Arrears intake |
| `EP-03` | Threshold blocked or below threshold | Blocked no-early-notice gate | Arrears inputs corrected and threshold re-run | Threshold check |
| `EP-04` | Notice readiness hard-stop | Blocked progression | Mandatory readiness inputs resolved | Notice preparation |
| `EP-05` | Guarded slowdown/review required | Review-led pause | Guarded review completed | Notice preparation or service/evidence capture |
| `EP-06` | Wrong-channel reroute | Stop + explain + reroute | Correct official channel/path confirmed | Official handoff guidance |
| `EP-07` | Referral-first | Standard path stops | External advice/action returns matter to in-scope posture | New or revised matter entry |
| `EP-08` | Prepared for handoff / external action pending | Done-for-now inside product | User/operator returns with new official updates | Output review or handoff panel |

## 7. Explicit Review, Warning, And Handoff Moments

| Moment ID | Where it appears | Trigger controls/outcomes | Required behaviour |
| --- | --- | --- | --- |
| `M-01` | Threshold check | No-early-notice gate not met, blocked-invalid threshold | Hold progression and name blocker; no hidden progression |
| `M-02` | Notice preparation | Deterministic readiness blockers | Show blocked state and required fixes before progression |
| `M-03` | Notice preparation / service-evidence | Guarded readiness controls (`SERVICE_PROOF_GUARDED`, `MIXED_CLAIM_ROUTING_GUARDED`, `HAND_SERVICE_REVIEW_GUARDED`) | Slowdown/review, not deterministic success |
| `M-04` | Service/evidence capture | BR02 service warnings and consent-proof checks | Keep registered-post preference deterministic and hand service guarded |
| `M-05` | Service/evidence + output | Evidence timing warning family and override precedence | Keep dual-step timing visible; hearing override can outrank generic timing |
| `M-06` | Output review / official handoff | Stale/live confirmation controls | Downgrade posture and shift CTA hierarchy as required |
| `M-07` | Output review / official handoff | Wrong-channel reroute control | Stop ordinary handoff and enforce reroute |
| `M-08` | Official handoff | Boundary codes + external-action-owner + review-before-official-step | Keep handoff external and explicit; no filing/submission implication |
| `M-09` | Referral overlay | Referral severity from BR01/BR03 or readiness refer-out outcome | Stop standard path; expose referral reason and external next action |

## 8. Compact 4C-A Readiness Note (Lane 1)

This journey pack now provides:

- an end-to-end first-wave path from entry to official handoff
- explicit screen purposes for all major consequential steps
- explicit placement of review, warning, and handoff moments
- state-to-screen and owner-to-action mapping grounded in current runtime semantics
- explicit exit and return points so no step is left as "work it out later"

Still intentionally guarded:

- BR03 cadence/authority details for live-confirmation operations
- BR04 retention/release doctrine and final lifecycle automation
- unresolved mixed-claim doctrine outside current BR01 registry posture

This pack is narrative and control-placement documentation only. It does not introduce runtime refactors, UI mock design, final copy rewrites, or portal execution behaviour.
