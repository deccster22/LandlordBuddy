# ADR-L4-lifecycle-control-baseline

## Status
Accepted

## Decision
Lane 4 is closed for authoring/control drafting and moves to implementation fidelity and control enforcement.

## Why
The lifecycle/control posture is now strong enough to build against.
The key remaining value comes from implementing truthful handlers, logs, scope expression, and lifecycle state, not from continued prose drafting.

## What is frozen
- delete vs de-identify distinction
- scoped/reviewable hold posture
- auditability claims must map to real product behavior
- export/download remains separate from lifecycle completion
- archive/matter-close does not imply delete/de-identify
- configurable timing by class must not become pseudo-doctrine in UI wording

## What is not frozen
- future refinements driven by real implementation constraints
- record-level specificity work where current class/scope expression proves insufficient
- narrow escalation on real product-truth mismatches

## Reopen triggers
Reopen Lane 4 only if:
- lifecycle wording affecting reliance must change
- delete vs de-identify semantics must change
- hold scope cannot be expressed below whole-account level where needed
- auditability/lifecycle cues would appear without real product support
- build reveals a real mismatch between UI wording and underlying lifecycle/control truth
- configurable timing starts drifting into apparent fixed truth on user-facing surfaces

## Consequence
Lane 4 now moves into implementation fidelity and control enforcement only.
