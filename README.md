# Landlord Buddy

Landlord Buddy is currently a Phase 4B foundation repo for deterministic-plus-guarded arrears workflows. The codebase intentionally stops at reviewable notice-preparation shells and keeps unresolved legal doctrine, portal behavior, and official handoff logic as explicit guarded placeholders.

## Setup

Install local tooling:

```bash
npm install
```

If PowerShell blocks `npm.ps1`, use `npm.cmd install` and `npm.cmd run <script>` instead.

## Run

There is no committed app shell yet. For a quick repo sanity run, use:

```bash
npm run check:spine
```

## Test

Run the automated tests:

```bash
npm test
```

## Verify

Run the full validation stack before reporting work done:

```bash
npm run verify
```

`npm run verify` runs `typecheck`, `lint`, `format:check`, and `test`.

## Repo Structure

- `src/domain`: deterministic core models and shared validation helpers.
- `src/workflow`: workflow-state skeletons and guardrails. No app/UI imports.
- `src/modules`: feature shells such as arrears, timeline, and notice-readiness.
- `src/app`: reserved thin adapter layer for the eventual app shell. Keep platform-specific code here only.
- `docs/architecture`: repo posture, layer boundaries, and guardrail notes.
- `docs/specs`: working feature specs before implementation.
- `docs/qa`: acceptance packs, control inventories, and lane regression/readiness artifacts.
- `docs/decisions`: short decision records once a repo or product choice is settled.
- `tests`: regression and guardrail coverage.

## Boundary Intent

The repo keeps deterministic core logic separate from presentation and unresolved doctrine:

- `domain` must not import `workflow`, `modules`, or future app/UI layers.
- `workflow` and `modules` must not depend on `src/app` or `src/ui`.
- Portal behavior remains handoff-only, and guarded legal or evidence doctrine must stay visible as hooks, warnings, or review states rather than silent success logic.

`npm run lint` enforces the current directory skeleton, restricted imports, and the runtime `.js` bridge files that keep the TypeScript source executable under the current Node-based shell.
