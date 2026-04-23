# P4C-DOC-L6-02 Trust-Surface Checklist Extension

Date: 2026-04-23
Task ID: P4C-DOC-L6-02

Purpose: extend the Lane 6 trust-surface checklist to cover new shell and thin app contract surfaces.

Status meaning:

- `extended-starter`: checklist row is defined but not yet screen-validated in a rendered UI
- `needs-review-c-basis`: row requires Review C comparative screen basis before confidence upgrade

| Surface family | Required trust cue posture | Must-not-imply boundary | Primary anchors | Status |
| --- | --- | --- | --- | --- |
| Shell reminder surfaces (`REM-*`) | reminders are prompts/controls with freshness and source context | no compliance certification or all-clear implication | `docs/specs/p4c-cx-l2-01-first-wave-form-question-architecture-pack.md`, `docs/specs/focused-operating-shell-baseline.md` | `extended-starter` |
| Bond/status visibility surfaces (`BOND-*`) | bond status shown as factual visibility with source linkage | no legal sufficiency or legal conclusion implication | `docs/specs/p4c-cx-l2-01-first-wave-form-question-architecture-pack.md`, `docs/architecture/current-product-posture.md` | `extended-starter` |
| Export/document bundle surfaces (`DOC-*`) | export and document bundle shown as packaging/records posture | no filing, no acceptance, no legal readiness implication | `docs/specs/p4c-cx-l2-01-first-wave-form-question-architecture-pack.md`, `docs/specs/p4c-cx-app-01-thin-app-screen-form-contract-pack.md` | `extended-starter` |
| Launcher and resume surfaces (`APP-SCR-04/05/06`) | launcher is navigation context only; next-action class remains explicit | no hidden state jump that implies completion or product execution | `docs/specs/p4c-cx-shell-01-focused-operating-shell-hero-workflow-mvp-structure-pack.md`, `docs/specs/p4c-cx-app-01-thin-app-screen-form-contract-pack.md` | `extended-starter` |
| Current matter "done for now" surfaces (`OUT-03`) | pause state is explicit and resumable with unresolved controls still visible | no "done" phrasing that implies filed/accepted/completed official action | `docs/specs/p4c-cx-l2-01-first-wave-form-question-architecture-pack.md`, `docs/specs/p4c-cx-app-01-thin-app-screen-form-contract-pack.md` | `extended-starter` |
| Consequential interruption overlays | blocked, guarded, stale, live confirmation, wrong-channel, and referral-first remain separate | no generic interruption collapse and no ordinary handoff for reroute/referral-first | `docs/specs/p4c-cx-app-01-thin-app-screen-form-contract-pack.md`, `docs/qa/p4b-cx-l3-05a-review-c-readiness-pack.md` | `needs-review-c-basis` |
| Output review and handoff boundary surfaces | `Prepared for handoff` remains rendering-only with explicit external owner cues | no filing/proxy filing/submission implication | `src/modules/output`, `src/modules/handoff`, `tests/output-renderer-state.test.ts` | `extended-starter` |

## Extension Use Rule

Before raising readiness confidence language, each row needs:

1. rendered-surface evidence
2. trust-cue placement check
3. CTA hierarchy and interruption-family parity check
