# P4C-CX-L3-WIREFRAME-02 Second Guarded Low-Fidelity Shell/Current-Matter Flow Sketch Packet

Date: 2026-05-14
Task ID: P4C-CX-L3-WIREFRAME-02

Scope: create a second guarded low-fidelity pass that situates lifecycle/current-matter zones within broader shell/current-matter flow, without final UI/copy/labels/CTA hierarchy/visual treatment or implementation.

This is a low-fidelity documentation/design-planning artifact only.
It does not change runtime code, tests, UI implementation, copy, routing behavior, logging behavior, sink behavior, status labels, CTA hierarchy, analytics/admin/support tooling, rendered surfaces, visual design assets, or product semantics.

## 1. Low-Fidelity Legend

- `[ZONE: ...]` means provisional boundary only, not a final component.
- `[TRUST CUE PLACEHOLDER]` is not final copy.
- `[BOUNDARY CUE PLACEHOLDER]` is not final copy.
- `[CTA PLACEHOLDER - NOT COPY]` does not authorize CTA wording.
- `[WARNING PLACEHOLDER - NOT COPY]` does not authorize warning copy.
- `[STATUS PLACEHOLDER - NOT LABEL]` does not authorize status labels.
- Layout order is provisional and not approved final navigation architecture.
- Flow order is provisional unless separately confirmed by later contract review.
- R2C2 is working identity context only and does not authorize lifecycle/status rendered treatment.

## 2. Low-Fidelity Sketches (Placeholder Only)

### Sketch `WF2-01`: Shell Home / Operating Shell Entry

Purpose: place shell context and continuity entry zones before launcher/current-matter.

```text
+------------------------------------------------------------------+
| [ZONE: Shell Context]                                            |
| [STATUS PLACEHOLDER - NOT LABEL]                                 |
| [TRUST CUE PLACEHOLDER] [BOUNDARY CUE PLACEHOLDER]               |
+-------------------------------+----------------------------------+
| [ZONE: Active Matters]        | [ZONE: Matter Launcher]          |
| [WARNING PLACEHOLDER - NOT COPY]                                 |
+-------------------------------+----------------------------------+
| [ZONE: Property/Tenancy Context]                                 |
| [CTA PLACEHOLDER - NOT COPY]                                     |
+------------------------------------------------------------------+
```

### Sketch `WF2-02`: Property/Tenancy Context Area

Purpose: map property/tenancy context as bounded continuity support.

```text
+--------------------------------------------------------------+
| [ZONE: Property/Tenancy Context]                             |
| [STATUS PLACEHOLDER - NOT LABEL]                             |
| [TRUST CUE PLACEHOLDER] [BOUNDARY CUE PLACEHOLDER]           |
| [WARNING PLACEHOLDER - NOT COPY]                             |
| [CTA PLACEHOLDER - NOT COPY]                                 |
+--------------------------------------------------------------+
```

### Sketch `WF2-03`: Active Matters List

Purpose: map active-matters list as continuity and launcher handoff surface.

```text
+------------------------------------------------------------------+
| [ZONE: Active Matters]                                           |
|   [STATUS PLACEHOLDER - NOT LABEL]                               |
|   [STATUS PLACEHOLDER - NOT LABEL]                               |
| [TRUST CUE PLACEHOLDER] [BOUNDARY CUE PLACEHOLDER]               |
+--------------------------------------+---------------------------+
| [ZONE: Matter Launcher]              | [ZONE: Shell Context]     |
| [CTA PLACEHOLDER - NOT COPY]                                     |
+--------------------------------------+---------------------------+
```

### Sketch `WF2-04`: Matter Launcher Entry Point

Purpose: keep launcher as workflow entry without legal-strategy/official-action implication.

```text
+--------------------------------------------------------------+
| [ZONE: Matter Launcher]                                      |
| [TRUST CUE PLACEHOLDER] [BOUNDARY CUE PLACEHOLDER]           |
| [WARNING PLACEHOLDER - NOT COPY]                             |
| [CTA PLACEHOLDER - NOT COPY]                                 |
+----------------------------+---------------------------------+
| [ZONE: Current Matter]     | [ZONE: Active Matters]          |
+----------------------------+---------------------------------+
```

### Sketch `WF2-05`: Current-Matter Flow With Lifecycle Zones

Purpose: place all lifecycle/current-matter boundary zones in one flow view.

```text
+------------------------------------------------------------------+
| [ZONE: Current Matter]                                            |
| [ZONE: Current-Matter Lifecycle Continuity]                       |
| [TRUST CUE PLACEHOLDER] [STATUS PLACEHOLDER - NOT LABEL]          |
+-------------------------------+----------------------------------+
| [ZONE: Lifecycle Context]     | [ZONE: Warning/Interruption Candidate] |
| [BOUNDARY CUE PLACEHOLDER]    | [WARNING PLACEHOLDER - NOT COPY] |
+-------------------------------+----------------------------------+
| [ZONE: Review/Referral/Handoff]                                  |
| [TRUST CUE PLACEHOLDER] [BOUNDARY CUE PLACEHOLDER]               |
+------------------------------------------------------------------+
| [ZONE: Output/Handoff Continuation]                              |
| [CTA PLACEHOLDER - NOT COPY]                                     |
+------------------------------------------------------------------+
```

### Sketch `WF2-06`: Combined Shell -> Current-Matter -> Handoff Flow

Purpose: show broad flow relationship from shell entry through handoff-adjacent area.

```text
[ZONE: Shell Context]
  -> [ZONE: Property/Tenancy Context]
  -> [ZONE: Active Matters]
  -> [ZONE: Matter Launcher]
  -> [ZONE: Current Matter]
      -> [ZONE: Current-Matter Lifecycle Continuity]
      -> [ZONE: Lifecycle Context]
      -> [ZONE: Warning/Interruption Candidate]
      -> [ZONE: Review/Referral/Handoff]
      -> [ZONE: Output/Handoff Continuation]
  -> [ZONE: Return-to-Shell / Next-Action-Owner Handback]

[TRUST CUE PLACEHOLDER] and [BOUNDARY CUE PLACEHOLDER] required at
continuity-sensitive and handoff-adjacent transitions.
```

### Sketch `WF2-07`: Return-To-Shell / Next-Action-Owner Handback

Purpose: reserve post-current-matter handback boundary area.

```text
+------------------------------------------------------------------+
| [ZONE: Return-to-Shell / Next-Action-Owner Handback]             |
| [TRUST CUE PLACEHOLDER] [BOUNDARY CUE PLACEHOLDER]               |
| [STATUS PLACEHOLDER - NOT LABEL]                                 |
| [CTA PLACEHOLDER - NOT COPY]                                     |
+-------------------------------+----------------------------------+
| [ZONE: Active Matters]        | [ZONE: Shell Context]            |
+-------------------------------+----------------------------------+
```

## 3. Sketch-By-Sketch Boundary Table

| Sketch ID | Purpose | Zones shown | Allowed placeholder content type | Forbidden content type | Trust/boundary cue adjacency | CTA/status restrictions | Lifecycle state containment rule | Review C inspection notes | Lane 3 dependency | Lane 4 dependency | Legal/Risks/Rules dependency | privacy/minimisation dependency | readiness classification | risk if treated as final UI | gate before rendering |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `WF2-01` | shell entry structure | shell context, active matters, launcher, property/tenancy | placeholder zone blocks and cue markers | final copy, final labels, final CTA text | required near shell continuity + launcher | no direct planner->CTA/status mapping | lifecycle states only indirectly represented | confirm shell is bounded and non-portal posture | required | deferred | required | required | `LOW_FI_BOUNDARY_ONLY` | could look like approved shell IA | Lane 3 zone-boundary acceptance + Review C |
| `WF2-02` | property/tenancy context boundary | property/tenancy context | context placeholders and caution markers | compliance/legal readiness implication | required where record/reminder reliance may appear | no final status/CTA wording | no lifecycle-success implication from context | confirm reminders/records do not imply clearance | required | deferred | required | required | `LOW_FI_BOUNDARY_ONLY` | context may be misread as legal advisory panel | Lane 3 + legal/trust review event |
| `WF2-03` | active matters continuity mapping | active matters, launcher, shell context | list placeholder rows and boundary cues | final matter labels, final status taxonomy | required at list + launcher transition | no final list status labels; no CTA text selection | planner outcomes not directly surfaced as list labels | confirm no generic success collapse in list | required | deferred | required | required | `LOW_FI_BOUNDARY_ONLY` | list semantics may be over-interpreted as final UX | Lane 3 + Review C comparative gate |
| `WF2-04` | launcher boundary | matter launcher, current matter, active matters | launcher placeholder structure only | legal path selection, official filing implication | required at launcher actions | no direct outcome->CTA conversion | launcher may route flow, not legal conclusions | confirm launcher remains workflow support only | required | deferred | required | required | `LOW_FI_BOUNDARY_ONLY` | launcher could be read as legal advice selector | Lane 3 contract + legal/trust gate |
| `WF2-05` | current-matter lifecycle integration | current matter + all five lifecycle zones | combined placeholder zone relationships | final status labels, warning copy, CTA hierarchy | required at continuity, interruption, and consequential zones | no CTA/status finalization | all `PLAN_INTERNAL_*` outcomes remain contained and non-display names | confirm no-record/cannot-resume/no-signal/hold-release/deletion-deidentification boundaries remain explicit | required | deferred | required | required | `LOW_FI_BOUNDARY_ONLY` | could be mistaken for final current-matter UI | Lane 3 + Review C + Lane 4 gate |
| `WF2-06` | broad flow relationship | shell to current-matter to handoff handback chain | directional placeholders and transition notes | approved navigation architecture claim | required on handoff-sensitive transitions | no CTA wording decisions from flow chain | lifecycle outcomes remain planning-only | confirm prep-vs-official boundary survives across transitions | required | deferred | required | required | `LOW_FI_BOUNDARY_ONLY` | could be treated as final nav model | Lane 3 journey/screen-inventory catch-up gate |
| `WF2-07` | return-to-shell handback | handback, active matters, shell context | handback placeholders and boundary cues | completion/finality claims | required at owner handback boundary | no final labels/CTA wording | no lifecycle-outcome finalization at handback | confirm next-action-owner separation stays explicit | required | deferred | required | required | `LOW_FI_BOUNDARY_ONLY` | handback may imply completion/clearance | Lane 3 + Review C consequence checks |

## 4. Broader Shell/Current-Matter Flow-Containment Rules

- Shell context may launch matters but must not imply legal strategy selection.
- Active matters may show internal planning placeholders but not final user-facing status labels.
- Matter launcher may route to workflows but must not imply official filing or legal advice.
- Current-matter view may contain lifecycle zones but must not convert internal outcomes into public labels.
- Output/handoff area must preserve prep-and-handoff posture.
- Warning/interruption areas must remain bounded, serious, non-punitive, and non-advisory.
- Return-to-shell handback must preserve next-action-owner and external-action boundary cues where relevant.

## 5. Lifecycle Outcome Containment Table

| Planner outcome | Contained as (low-fi planning only) | Must not display as | May later inform (subject to Review C) |
| --- | --- | --- | --- |
| `PLAN_INTERNAL_CONTINUE_WITH_LIFECYCLE_CONTEXT` | continuity context candidate | ready/cleared/approved/safe/final/complete | non-certifying continuity placement in current-matter lifecycle zones |
| `PLAN_INTERNAL_CONTINUE_NO_RECORD_NON_CLEARANCE` | guarded continuity/interruption candidate | all-good, implied clearance, safe deletion clearance | missing-info caution posture in continuity and interruption candidate zones |
| `PLAN_INTERNAL_HOLD_CANNOT_SAFELY_RESUME` | fail-safe interruption candidate | resolved-by-default, proceed-anyway | bounded interruption emphasis and review/referral separation planning |
| `PLAN_INTERNAL_EXPLICIT_NO_ROUTING_SIGNAL` | explicit non-default interruption/referral candidate | proceed/success/auto-routed | guarded no-signal interruption/referral planning in consequential zones |

## 6. Trust/Boundary Adjacency Notes

- Source/freshness cue adjacency is required when lifecycle context affects reliance.
- Prep-vs-official boundary cue is required near handoff-adjacent areas.
- Privacy/lifecycle cue is required near hold/delete/de-identification context.
- Referral/review cue is required near cannot-resume/no-signal interruption candidates.
- Shell reminder/record/export areas must not imply compliance clearance, tribunal sufficiency, official filing, or legal readiness.

## 7. CTA / Status / Warning Boundary Notes

- No direct planner-outcome-to-CTA mapping.
- No lifecycle planner outcome may directly choose CTA text.
- No final CTA wording or final CTA hierarchy is authorized.
- No visible status label may inherit internal planner outcome names.
- Warning placeholders are structural only; they do not authorize warning copy.
- No warning/interruption placeholder may imply legal advice, legal finding, or official determination.

## 8. Visual Dependency Section

- No final visual lock is required or implied.
- R2C2 remains working identity input only.
- Lane 4 visual system governs any later rendered treatment.
- App tile/logo progress does not authorize lifecycle/status UI exposure.

## 9. Review C Inspection Checklist

- shell does not look like generic property-management suite
- shell does not look like official portal
- lifecycle/current-matter states do not imply clearance
- no-record non-clearance is preserved
- cannot-resume fail-safe is preserved
- explicit no-signal is preserved
- hold/release distinction is preserved
- deletion/de-identification distinction is preserved
- lifecycle/non-lifecycle separation is preserved
- trust/boundary cue adjacency is visible
- CTA/status separation is preserved
- no fake official/portal equivalence

## 10. WLB-01 Status

- `WLB-01` remains held.
- This packet does not create any reason to reopen `WLB-01`.

## 11. Next-Option Analysis

### Option A: Lane 4 visual-state treatment contract

- Upside: defines visual-state expression gates for later rendered work.
- Risk: can outrun flow-shape contract consolidation if opened immediately.

### Option B: Review C rendered-surface comparison prep pack

- Upside: strengthens comparative inspection standards early.
- Risk: may be broader than needed before journey/screen-inventory catch-up.

### Option C: product journey / screen inventory catch-up using low-fi outputs

- Upside: converts these low-fi structures into a clearer cross-screen inventory and transition map while preserving no-copy/no-final-design guardrails.
- Risk: requires explicit discipline to avoid slipping into final navigation/label decisions.

### Option D: pause screen work and return to form/question architecture

- Upside: reduces immediate surface-shape scope pressure.
- Risk: delays lane-3 structural coherence needed for safe Review C preparation.

Recommended next move: **Option C**.

Rationale: this second low-fi pass now covers broader shell/current-matter flow; the highest-value next step is to reconcile product journey and screen inventory contracts against these guarded structures before visual treatment or rendered comparison work.
