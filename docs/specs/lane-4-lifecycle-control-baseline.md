# Lane 4 Lifecycle Control Baseline

## Status
Closed for authoring/control drafting. Implementation fidelity and control enforcement only.

## Purpose
This document freezes the current lifecycle-control baseline for Lane 4 so build can implement privacy, retention, deletion, de-identification, hold, and auditability behavior without policy drift or UI overclaim.

## Controlling posture
Lane 4 is treated as a build-facing control baseline.
The job is no longer to keep redrafting lifecycle semantics.
The job is to implement the accepted control system truthfully.

## What is frozen for build
The following are locked as baseline posture unless an explicit reopen trigger fires.

### Lifecycle truths
- deletion and de-identification are distinct lifecycle actions
- holds are scoped, reviewable, and not blanket whole-account freezes
- lifecycle wording must not outrun actual handlers or product state
- configurable timing by class must not harden into pseudo-doctrine through UI wording
- export/download is separate from deletion, release, or lifecycle completion
- archive/matter-close does not imply deletion or de-identification
- auditability cues must map to real logs, controls, or lifecycle state
- user-facing hold or lifecycle surfaces must map to real underlying product state, not policy prose alone

### Class/control expectations
- class-based posture remains the baseline
- record-level specificity may be required on consequential surfaces
- temporary derivative preview, deleted-item residue tombstone, and security-incident artifact classes remain part of the working lifecycle/control map where implemented

## Build restrictions
Do not silently change:
- lifecycle wording that affects user reliance
- delete vs de-identify semantics
- hold scope presentation
- auditability claims
- timing language that appears more precise than the product can substantiate
- export/archive language in ways that imply lifecycle completion

Any such change is a review event, not ordinary polish.

## UI truthfulness rules
On consequential surfaces:
- `On hold` must not imply permanent retention
- `On hold` must not imply blanket account freeze
- deletion language must not imply immediate universal erasure
- de-identification language must not be collapsed into deletion
- export/download must not be used as a proxy for removed-from-system claims
- archive/matter-close must not imply lifecycle completion unless the underlying handler/state truly supports that claim

## Auditability rule
Do not surface auditability or tracked-action cues unless the product can substantiate them with real logs, handlers, or lifecycle state.

## Reopen triggers
Lane 4 reopens only if:
1. Lifecycle wording needs to change in a way that affects reliance or user expectation.
2. Delete vs de-identify behavior is proposed to change.
3. Hold scope cannot be expressed below whole-account level on a consequential surface.
4. A surface requires record-level specificity that the current class/scope model cannot express cleanly.
5. Auditability or lifecycle cues would need to appear without real handler/log/state support.
6. Configurable timing by class is being pushed toward hard-coded apparent truth in user-facing surfaces.
7. Build reveals a real mismatch between product state and policy/copy posture.

## Build instruction
Treat Lane 4 as a control-enforcement lane.
Implement the baseline faithfully.
Escalate specific lifecycle/control conflicts rather than reopening the whole lane.

## Related docs
- `docs/qa/first-wave-semantic-fidelity-checklist.md`
- `docs/decisions/ADR-L4-lifecycle-control-baseline.md`
- `docs/architecture/current-product-posture.md`
- `docs/architecture/frozen-lanes-status.md`
