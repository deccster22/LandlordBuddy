# First-Wave Semantic Fidelity Checklist

Date: 2026-04-22
Task ID: P4C-REPO-DOC-02

Purpose: repo-level checklist for implication-sensitive wording and posture checks as the focused operating shell is documented and extended.

Status meaning:

- `required`: must pass before accepting shell-facing doc/copy structure changes
- `starter`: check exists and should be used now

| Check ID | Check focus | Pass condition | Anchors | Status |
| --- | --- | --- | --- | --- |
| `SFC-01` | Hero wedge precedence | Arrears-to-notice-readiness remains explicit as the lead workflow; shell is clearly secondary/supportive | `docs/specs/focused-operating-shell-baseline.md`, `docs/architecture/current-product-posture.md` | `required` |
| `SFC-02` | Shell scope fence | Shell capabilities match accepted inclusion list and do not introduce PM-suite sprawl | `docs/specs/focused-operating-shell-baseline.md`, `docs/decisions/ADR-focused-operating-shell-direction.md` | `required` |
| `SFC-03` | Reminder implication control | Reminder language does not imply compliance certification, legal all-clear, or doctrinal finality | `AGENTS.md`, `docs/specs/focused-operating-shell-baseline.md` | `required` |
| `SFC-04` | Bond visibility implication control | Bond-paid status is described as factual visibility only | `docs/specs/focused-operating-shell-baseline.md`, `docs/architecture/current-product-posture.md` | `required` |
| `SFC-05` | Export implication control | Structured export wording does not imply filing, tribunal/court acceptance, or legal sufficiency | `docs/specs/focused-operating-shell-baseline.md`, `docs/architecture/output-handoff-evidence-shells.md` | `required` |
| `SFC-06` | Prep-and-handoff doctrine continuity | Shell language keeps official action external and never implies proxy execution | `AGENTS.md`, `docs/architecture/output-handoff-evidence-shells.md` | `required` |
| `SFC-07` | Legal/trust boundary continuity | No legal-advice behavior or official-system parity implication appears in shell-facing docs | `AGENTS.md`, `docs/architecture/repo-boundaries.md` | `required` |
| `SFC-08` | Phase posture honesty | Docs state 4B primary and 4C parallel; no alpha-readiness implication | `docs/architecture/current-product-posture.md`, `docs/architecture/frozen-lanes-status.md` | `required` |
| `SFC-09` | Lane 2/Lane 4 protection | No protected-line rewrite or Lane 4 lifecycle weakening appears in shell alignment edits | `docs/governance/P4B Freeze Map.md`, `AGENTS.md` | `required` |
| `SFC-10` | New-contributor clarity | A fresh contributor can locate baseline, decision, posture, and QA control docs from indexes | `docs/index.md`, `docs/specs/README.md`, `docs/qa/README.md`, `docs/decisions/README.md` | `starter` |

## Usage Rule

Use this checklist for documentation and architecture alignment changes first. Keep passing checks separate from product readiness claims.
