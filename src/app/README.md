# App Layer

This folder is reserved for the eventual app shell once platform choice is explicitly confirmed. Keep it thin: compose `src/domain`, `src/workflow`, and `src/modules` here, but do not push UI or platform concerns back down into those layers.

Current contract reference:

- `docs/specs/p4c-cx-app-01-thin-app-screen-form-contract-pack.md` defines the first-wave thin app screen/form contracts, launcher/resume routing, interruption handling, and persistence/resume expectations without changing runtime doctrine.
- `docs/specs/p4b-cx-app-route-01-launcher-current-matter-lifecycle-resume-routing-contract-pack.md` defines the narrow launcher/current-matter lifecycle-resume routing contract (inputs, outcomes, fail-safe behavior, and non-claim boundaries) before execution routing is implemented.
- `docs/qa/p4b-cx-app-status-01-post-br04-10-checkpoint-note.md` records the compact post-`P4B-CX-BR04-10` app-layer checkpoint posture, gates, and next-step options without opening execution-routing behavior.

Current implementation seam:

- `src/app/br03TouchpointSnapshotProducer.ts` converts persisted `OUT-04` touchpoint posture source events into BR03 `touchpointPostureSnapshots` with explicit registry-default fallback for missing source events.
- `src/app/outputHandoffCheckpointHydration.ts` wires persisted `OUT-04` source events through the snapshot producer into output/handoff composition checkpoint hydration, and now also supports BR04 lifecycle orchestration checkpoint resume loading/replay with controlled no-record handling and fail-loud malformed payload handling.
- `src/app/launcherCurrentMatterLifecycleResumeAdapter.ts` maps BR04 `outputPackageLifecycleResume` checkpoint status into neutral launcher/current-matter resume routing metadata (available vs no-record, hold/release visibility, and deletion-vs-deidentification route visibility) without adding UI wording or compliance claims.
- `src/app/launcherCurrentMatterExecutionRouting.ts` provides the narrow launcher/current-matter execution-routing seam that consumes neutral lifecycle resume routing metadata and resolves contract-faithful outcomes (`RESUME_AVAILABLE`, `NO_LIFECYCLE_RECORD_FOUND`, `CANNOT_SAFELY_RESUME_RECORD`) without adding UI wording or compliance claims.
- `src/app/launcherCurrentMatterExecutionCaller.ts` adds the first internal launcher/current-matter caller for lifecycle execution routing by consuming output-checkpoint execution-routing resolution and returning neutral internal control outcomes while preserving raw routing metadata for downstream inspection.
- `src/app/launcherCurrentMatterFollowOnRouteCoordinator.ts` wires launcher/current-matter lifecycle internal control outcomes into explicit follow-on internal route-handling outcomes, including fail-safe cannot-resume and explicit no-routing-signal handling without adding UI wording or compliance claims.
- `src/app/outputPackageLifecycleOrchestration.ts` wires one concrete BR04 output-package lifecycle consumer path at adapter level: output-package record construction, class-based lifecycle runtime planning, scoped hold/release command handling, deletion-vs-deidentification route selection, RBAC checks, audit emission capture, and replayable orchestration records.
- `src/app/outputPackageLifecycleOrchestrationPersistence.ts` adds a thin persistence seam for `OutputPackageLifecycleOrchestrationRecord`: stable-key save/load, malformed/missing fail-loud behavior, and replay-through-existing-planner support without introducing provider-specific storage claims.
