# Repo Boundaries

This repo foundation is designed for Phase 4A build planning, not for final doctrine or portal implementation. The goal is to keep deterministic core logic stable while guarded areas remain explicit and reviewable.

## Layer Rules

- `src/domain` is the source-of-truth layer for core entities, enums, and validation helpers.
- `src/domain` must not import `src/workflow`, `src/modules`, `src/app`, or `src/ui`.
- `src/workflow` can depend on `src/domain`, but it must not depend on `src/app` or `src/ui`.
- `src/modules` can compose deterministic domain structures, but they must stay presentation-free and must not depend on `src/app` or `src/ui`.
- `src/app` is reserved for the eventual platform shell and should stay thin. It composes lower layers but must not become the place where doctrine or deterministic rules are invented.

## Guarded Posture

- No portal mimicry.
- No legal-advice behavior.
- No hard-coded final wording for unresolved doctrine.
- No silent collapse of guarded review states into deterministic success.

Guarded areas should continue to surface as warnings, slowdown states, referrals, unresolved draft issues, and explicit handoff states until later phase decisions are settled.

## Automated Guard

`npm run lint` is the lightweight enforcement layer for this posture. It checks:

- required repo folders for the current Phase 4A skeleton
- restricted imports across `domain`, `workflow`, `modules`, and future app/UI layers
- runtime `.js` bridge files for `src/**/*.ts`, so the current Node-based shell does not drift away from the TypeScript source

Use `npm run verify` as the completion gate for repo-foundation work.
