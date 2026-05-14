# P4C-CX-L3-WIREFRAME-01 Guarded Low-Fidelity Lifecycle/Current-Matter Wireframe Sketch Packet

Date: 2026-05-14
Task ID: P4C-CX-L3-WIREFRAME-01

Scope: create guarded low-fidelity sketch structures for lifecycle/current-matter zones using `P4C-CX-L3-WIREFRAME-BOUNDARY-01` boundaries, without final UI, final copy, final labels, final CTA hierarchy, or rendered implementation.

This is a low-fidelity documentation/design-planning artifact only.
It does not change runtime code, tests, UI implementation, copy, routing behavior, logging behavior, sink behavior, status labels, CTA hierarchy, analytics/admin/support tooling, rendered surfaces, visual design assets, or product semantics.

## 1. Low-Fidelity Legend

- `[ZONE: ...]` means provisional zone boundary only, not a final component.
- `[TRUST CUE PLACEHOLDER]` is not final copy.
- `[BOUNDARY CUE PLACEHOLDER]` is not final copy.
- `[CTA PLACEHOLDER - NOT COPY]` does not authorize CTA wording.
- `[STATUS PLACEHOLDER - NOT LABEL]` does not authorize status labels.
- `[WARNING PLACEHOLDER - NOT COPY]` does not authorize warning copy.
- Box order is provisional and not final layout approval.
- R2C2 is working identity context only and does not authorize rendered lifecycle/status treatment.

## 2. Low-Fidelity Sketches (Placeholder Only)

### Sketch `WF-01`: Current-Matter Page Low-Fi Structure

Purpose: outline baseline current-matter structural zones.

```text
+--------------------------------------------------------------+
| [ZONE: Current-Matter Lifecycle Continuity]                  |
|   [STATUS PLACEHOLDER - NOT LABEL]                           |
|   [TRUST CUE PLACEHOLDER] [BOUNDARY CUE PLACEHOLDER]         |
+------------------------------+-------------------------------+
| [ZONE: Lifecycle Context]    | [ZONE: Review/Referral/Handoff] |
| [WARNING PLACEHOLDER - NOT COPY]                              |
+------------------------------+-------------------------------+
| [ZONE: Output/Handoff Continuation]                          |
| [CTA PLACEHOLDER - NOT COPY]                                 |
+--------------------------------------------------------------+
```

### Sketch `WF-02`: Lifecycle Context Panel Low-Fi Structure

Purpose: isolate lifecycle context boundary planning without status claims.

```text
+----------------------------------------------+
| [ZONE: Lifecycle Context]                    |
| [STATUS PLACEHOLDER - NOT LABEL]             |
| [TRUST CUE PLACEHOLDER]                      |
| [BOUNDARY CUE PLACEHOLDER]                   |
| [WARNING PLACEHOLDER - NOT COPY]             |
+----------------------------------------------+
```

### Sketch `WF-03`: Output/Handoff Continuation Low-Fi Structure

Purpose: preserve prep-vs-official boundary near continuation controls.

```text
+----------------------------------------------------+
| [ZONE: Output/Handoff Continuation]                |
| [BOUNDARY CUE PLACEHOLDER]                         |
| [TRUST CUE PLACEHOLDER]                            |
| [CTA PLACEHOLDER - NOT COPY]                       |
+----------------------------------------------------+
```

### Sketch `WF-04`: Warning/Interruption Candidate Low-Fi Structure

Purpose: reserve guarded interruption placement for fail-safe/no-signal states.

```text
+----------------------------------------------------+
| [ZONE: Warning/Interruption Candidate]             |
| [WARNING PLACEHOLDER - NOT COPY]                   |
| [TRUST CUE PLACEHOLDER] [BOUNDARY CUE PLACEHOLDER]|
| [CTA PLACEHOLDER - NOT COPY]                       |
+----------------------------------------------------+
```

### Sketch `WF-05`: Review/Referral/Handoff Block Low-Fi Structure

Purpose: separate review/referral/handoff intent families at boundary level.

```text
+----------------------------------------------------+
| [ZONE: Review/Referral/Handoff]                    |
| [STATUS PLACEHOLDER - NOT LABEL]                   |
| [WARNING PLACEHOLDER - NOT COPY]                   |
| [TRUST CUE PLACEHOLDER] [BOUNDARY CUE PLACEHOLDER]|
| [CTA PLACEHOLDER - NOT COPY]                       |
+----------------------------------------------------+
```

### Sketch `WF-06`: Combined Current-Matter + Lifecycle + Handoff Arrangement

Purpose: show full five-zone relationship in one low-fidelity envelope.

```text
+------------------------------------------------------------------+
| [ZONE: Current-Matter Lifecycle Continuity]                      |
| [TRUST CUE PLACEHOLDER] [STATUS PLACEHOLDER - NOT LABEL]         |
+------------------------------+-----------------------------------+
| [ZONE: Lifecycle Context]    | [ZONE: Warning/Interruption Cand.]|
| [BOUNDARY CUE PLACEHOLDER]   | [WARNING PLACEHOLDER - NOT COPY]  |
+------------------------------+-----------------------------------+
| [ZONE: Review/Referral/Handoff]                                  |
| [TRUST CUE PLACEHOLDER] [BOUNDARY CUE PLACEHOLDER]               |
+------------------------------------------------------------------+
| [ZONE: Output/Handoff Continuation]                              |
| [CTA PLACEHOLDER - NOT COPY]                                     |
+------------------------------------------------------------------+
```

## 3. Sketch-By-Sketch Boundary Table

| Sketch ID | Purpose | Zones shown | Allowed placeholder content type | Forbidden content type | Trust/boundary cue adjacency | CTA/status restrictions | Lifecycle state containment rule | Review C inspection notes | Lane 4 dependency | Legal/Risks/Rules dependency | privacy/minimisation dependency | readiness classification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `WF-01` | baseline page structure | continuity, lifecycle context, review/referral/handoff, output/handoff | zone labels, placeholder cues, placeholder CTA/status/warning markers | final labels/copy, final CTA wording, final hierarchy | required at continuity and consequential blocks | no direct planner->visible status/CTA | lifecycle/non-lifecycle separation remains explicit | inspect anti-overclaim adjacency and separation | deferred | required | required | `LOW_FI_BOUNDARY_ONLY` |
| `WF-02` | lifecycle panel boundary | lifecycle context | placeholder lifecycle-context markers only | legal/compliance/finality copy | privacy/lifecycle cue required | no visible status inheritance | no-record/non-clearance and route distinctions remain guarded | inspect hold/release and deletion/de-identification distinction | deferred | required | required | `LOW_FI_BOUNDARY_ONLY` |
| `WF-03` | handoff continuation boundary | output/handoff continuation | placeholder continuation/control markers | filing/official-equivalence wording | explicit external-boundary cue required | CTA placeholder only; no text selection | planner outcomes cannot directly choose continuation CTA | inspect prep-vs-official boundary clarity | deferred | required | required | `LOW_FI_BOUNDARY_ONLY` |
| `WF-04` | interruption boundary | warning/interruption candidate | placeholder interruption markers | punitive, advisory, legal-finding wording | referral/review boundary cue required | no CTA hierarchy decisions | cannot-resume/no-signal remain guarded interruption candidates only | inspect fail-safe prominence and non-default progression | deferred | required | required | `LOW_FI_BOUNDARY_ONLY` |
| `WF-05` | consequential separation boundary | review/referral/handoff | placeholder separation markers | merged success/finality posture | trust cue adjacent to consequential zone required | no final status labels or CTA tiers | referral-first and wrong-channel stop distinctions preserved | inspect no collapse into ordinary handoff | deferred | required | required | `LOW_FI_BOUNDARY_ONLY` |
| `WF-06` | full envelope relationship | all five zones | combined placeholder structure and adjacency markers | polished component structure, final spacing, visual styling decisions | all required cue adjacencies represented | placeholder-only CTA/status/warning markers | all four `PLAN_INTERNAL_*` outcomes remain contained and non-display names | inspect overall boundary integrity before any rendered pass | deferred | required | required | `LOW_FI_BOUNDARY_ONLY` |

## 4. Lifecycle Outcome Containment Table

| Planner outcome | Contained as (low-fi planning only) | Must not display as | May later inform (subject to Review C) |
| --- | --- | --- | --- |
| `PLAN_INTERNAL_CONTINUE_WITH_LIFECYCLE_CONTEXT` | continuity context candidate | ready/cleared/approved/safe/final/complete | non-certifying continuity placement in `WF-01`/`WF-06` |
| `PLAN_INTERNAL_CONTINUE_NO_RECORD_NON_CLEARANCE` | guarded continuity/interruption candidate | all-good, implied clearance, safe deletion clearance | missing-info caution posture in `WF-01`/`WF-04`/`WF-06` |
| `PLAN_INTERNAL_HOLD_CANNOT_SAFELY_RESUME` | fail-safe interruption candidate | resolved-by-default, proceed-anyway | bounded interruption emphasis in `WF-04`/`WF-06` |
| `PLAN_INTERNAL_EXPLICIT_NO_ROUTING_SIGNAL` | explicit non-default interruption/referral candidate | proceed/success/auto-routed | guarded referral/interruption planning in `WF-04`/`WF-05`/`WF-06` |

## 5. Trust/Boundary Adjacency Notes

- Place `[TRUST CUE PLACEHOLDER]` near continuity and consequential action areas where reliance could be inferred.
- Place `[BOUNDARY CUE PLACEHOLDER]` near handoff-adjacent zones to reinforce external official-action boundary.
- Place privacy/lifecycle boundary cues near lifecycle context where hold/delete/de-identification context appears.
- Place referral/review cues near interruption zones for cannot-resume/no-signal candidate states.

## 6. CTA / Status / Warning Boundary Notes

- No direct mapping from planner outcomes to CTA text.
- No direct mapping from planner outcomes to visible status labels.
- No final CTA wording or hierarchy is authorized.
- No final status labels are authorized.
- Warning placeholders are structural only; they do not authorize warning copy.
- No warning/interruption placeholder may imply legal advice, legal finding, or official determination.

## 7. Visual Dependency Section

- No final visual lock is required or implied.
- R2C2 remains working identity input only.
- Lane 4 visual system governs any later rendered treatment.
- App tile/logo progress does not authorize lifecycle/status UI exposure.

## 8. Review C Inspection Checklist

- no-record non-clearance remains explicit
- cannot-resume fail-safe remains explicit
- explicit no-signal remains explicit
- hold/release distinction remains visible
- deletion/de-identification distinction remains visible
- lifecycle/non-lifecycle separation remains visible
- trust/boundary cue adjacency is preserved
- anti-overclaim wording posture is preserved
- CTA/status separation from internal planner outcomes is preserved
- no fake official/portal equivalence is introduced

## 9. WLB-01 Status

- `WLB-01` remains held.
- This low-fidelity sketch packet does not create a reason to reopen `WLB-01`.

## 10. Next-Option Analysis

### Option A: Lane 4 visual-state treatment contract

- Upside: defines visual-state treatment guardrails before rendered lifecycle expression.
- Risk: may outrun low-fidelity boundary validation if opened immediately.

### Option B: Review C rendered-surface comparison prep pack

- Upside: strengthens comparative inspection criteria early.
- Risk: broader than needed before another low-fidelity pass across broader flow.

### Option C: second low-fidelity wireframe pass for broader shell/current-matter flow

- Upside: extends guarded boundary mapping beyond the five lifecycle zones while keeping no-copy/no-final-design posture.
- Risk: still needs strict guardrails to avoid drift toward polished mockups.

### Option D: pause screen work and return to product journey / form architecture work

- Upside: avoids premature screen-shape iteration.
- Risk: delays Lane 3 structural maturity needed for safe Review C preparation.

Recommended next move: **Option C**.

Rationale: one additional guarded low-fidelity pass across adjacent shell/current-matter flow gives stronger structural coverage without opening final copy, visual lock, or implementation work.
