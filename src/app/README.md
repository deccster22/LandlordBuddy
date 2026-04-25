# App Layer

This folder is reserved for the eventual app shell once platform choice is explicitly confirmed. Keep it thin: compose `src/domain`, `src/workflow`, and `src/modules` here, but do not push UI or platform concerns back down into those layers.

Current contract reference:

- `docs/specs/p4c-cx-app-01-thin-app-screen-form-contract-pack.md` defines the first-wave thin app screen/form contracts, launcher/resume routing, interruption handling, and persistence/resume expectations without changing runtime doctrine.

Current implementation seam:

- `src/app/br03TouchpointSnapshotProducer.ts` converts persisted `OUT-04` touchpoint posture source events into BR03 `touchpointPostureSnapshots` with explicit registry-default fallback for missing source events.
- `src/app/outputHandoffCheckpointHydration.ts` wires persisted `OUT-04` source events through the snapshot producer into output/handoff composition checkpoint hydration.
