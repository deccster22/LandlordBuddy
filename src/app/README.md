# App Layer

This folder is reserved for the eventual app shell once platform choice is explicitly confirmed. Keep it thin: compose `src/domain`, `src/workflow`, and `src/modules` here, but do not push UI or platform concerns back down into those layers.

Current contract reference:

- `docs/specs/p4c-cx-app-01-thin-app-screen-form-contract-pack.md` defines the first-wave thin app screen/form contracts, launcher/resume routing, interruption handling, and persistence/resume expectations without changing runtime doctrine.

Current implementation seam:

- `src/app/br03TouchpointSnapshotProducer.ts` converts persisted `OUT-04` touchpoint posture source events into BR03 `touchpointPostureSnapshots` with explicit registry-default fallback for missing source events.
- `src/app/outputHandoffCheckpointHydration.ts` wires persisted `OUT-04` source events through the snapshot producer into output/handoff composition checkpoint hydration.
- `src/app/outputPackageLifecycleOrchestration.ts` wires one concrete BR04 output-package lifecycle consumer path at adapter level: output-package record construction, class-based lifecycle runtime planning, scoped hold/release command handling, deletion-vs-deidentification route selection, RBAC checks, audit emission capture, and replayable orchestration records.
- `src/app/outputPackageLifecycleOrchestrationPersistence.ts` adds a thin persistence seam for `OutputPackageLifecycleOrchestrationRecord`: stable-key save/load, malformed/missing fail-loud behavior, and replay-through-existing-planner support without introducing provider-specific storage claims.
