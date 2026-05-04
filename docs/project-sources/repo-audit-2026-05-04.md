# Repo Audit Against Recent Decisions and Project Sources

Date: 2026-05-04
Branch: `docs/source-sync-audit-2026-05-04`
Base commit: `49b9fef9b2c12edcdddf3604e4ed893b42bf2d68`
Status: source-sync audit complete for repo-visible docs; binary source files not uploaded directly

## Audit objective

Check the LandlordBuddy repo against recent project-source decisions and progress, then add missing important source documents as repo-native Markdown extracts so Codex/contributors can see the current operating spine without relying only on ChatGPT Project files.

## Repo health summary

Status: Mostly healthy, with missing source-layer issue now addressed.

The repo already had strong implementation-facing posture docs before this sync:

- current product posture
- frozen lane status
- focused operating shell baseline
- shell ADR and canon shell delta note
- Gate A / Review A checkpoint sync
- architecture/module docs
- 4C Lane 1-4 specs and QA packs
- AGENTS guardrails

The main gap was that the underlying project source pack was not present in repo form. In particular, Master Canon v1.3 and several governing source docs were only represented indirectly through derived repo notes.

## Files added in this branch

| File | Purpose |
| --- | --- |
| `docs/project-sources/README.md` | manifest for mirrored project-source stack |
| `docs/project-sources/founder-operating-governance-source-pack.md` | founder brief, operating principles, admin/runbook, phase roadmap, blocker program, forward plan extract |
| `docs/project-sources/master-canon-v1.3-operational-extract.md` | operational extract of Master Canon v1.3 |
| `docs/project-sources/gate-a-decision-doc-v1.0.md` | source snapshot of official Gate A / Review A decision |
| `docs/project-sources/phase-4c-operating-pack-extract.md` | 4C lane map and product-experience construction posture |
| `docs/project-sources/operating-shell-decision-stack.md` | Product + Legal + Marketing operating-shell decision stack |
| `docs/project-sources/visual-doctrine-v0.1-extract.md` | visual doctrine, semantic colour, shell/matter UI, freeze criteria |
| `docs/project-sources/research-digest-v6-register-update-note.md` | digest/register source summary and tracker update note |
| `docs/project-sources/repo-audit-2026-05-04.md` | this audit note |

## Alignment checks

### Current product posture

Status: Confirmed / aligned.

Repo current posture already says 4B remains primary, 4C runs in parallel, Gate A is checkpoint-cleared with gates retained, and nothing implies alpha readiness, Review C completion, full BR04 completion, payment-plan default adoption, official portal parity, or product-side filing/submission/acceptance.

### Focused operating shell

Status: Confirmed / aligned.

Repo already contains shell baseline and shell delta docs that match the source stack:

- wedge remains Victoria-first, residential-only, arrears-first
- shell is bounded operational context, reminder/logging continuity, evidence/document continuity, and matter launching
- shell does not allow accounting, tax, marketplace, tenant messaging, direct official filing, PM-suite sprawl, or national expansion complexity

### Gate A / Review A

Status: Confirmed / aligned.

Repo decision doc already reflects the official Gate A source:

- BR02 runtimeBridge cleared with gate
- BR02 payment-plan conservative default adoption held
- BR03 source-fed touchpoint/hydration cleared with gate
- BR04 lifecycle/privacy upgraded to cleared with gate for current 4B checkpoint
- no alpha-readiness or official-parity overclaim

### Master Canon v1.3

Status: Source-layer gap addressed.

Before this branch, repo had canon shell delta but not a visible source snapshot of Master Canon v1.3. This branch adds an operational extract. It does not rewrite full canon into the repo and does not change product doctrine.

### Digest and tracker

Status: Partially addressed / needs follow-up.

Digest v6 is represented as a register update note and important content inventory. The full PDF digest was not transcribed, and the tracker XLSX was not updated because this GitHub connector pass is UTF-8-file oriented and not suitable for binary spreadsheet editing.

Needed follow-up:

- update `LandlordBuddy_Tracker_Audit_Register_V6.xlsx` manually or via spreadsheet tooling
- update the digest source file if the project source pack must remain synchronised outside repo
- consider a repo-native lightweight register mirror if future Codex tasks need searchable register data

### Visual doctrine vs later Lane 4 outputs

Status: Needs explicit reconciliation in final Lane 4 synthesis.

Visual Doctrine v0.1 says the current leading logo/app-tile hypothesis was Document + House, with Route Spine demoted to control/UI motif. Later repo Lane 4 work appears to recommend Route Spine as primary after a launcher-size durability pass.

This may be a valid evolution, not a defect. But it should be explicit:

- Document + House had stronger category signal in doctrine.
- Route Spine later won small-size launcher durability.
- Final synthesis should explain whether small-size durability now outranks category signal, and what compensating property/tenancy signal appears in wordmark, onboarding, shell UI, or store metadata.

## Material gaps remaining

| Gap | Status | Recommended handling |
| --- | --- | --- |
| Binary source docs not committed directly | Known limitation | Keep Markdown extracts; optionally upload binaries manually if desired |
| Tracker XLSX not updated | Needs Validation | run spreadsheet update using proper spreadsheet tooling |
| Full Research Digest v6 not transcribed | Needs Validation | decide whether repo needs full digest mirror or summary only |
| Icon-direction contradiction | Needs Validation | resolve in Lane 4 final direction synthesis / visual decision log |
| Repo source freshness process | Needs Validation | decide cadence for source-pack refresh after major project decisions |

## Product decision hygiene

Decision: Add repo-native project-source layer.

Status: Confirmed as documentation hygiene.

Why: The repo had build-facing docs but lacked visible source snapshots for founder/governance/canon/Gate A/4C/shell/visual/digest materials. Without these, future Codex runs could infer intent from derived docs only.

Evidence basis: project-source files in ChatGPT Project and current repo index/docs.

Risk if wrong: repo becomes cluttered or source extracts drift from binary originals.

Revisit trigger: if source extracts conflict with future canon, if binary source docs become directly manageable in repo, or if a repo-native register system replaces the tracker.

## Recommended next steps

1. Merge this PR if the source-layer approach is accepted.
2. Update tracker XLSX and digest/register control records with `REPO-SYNC-2026-05-04`.
3. Add a short Lane 4 reconciliation note if Route Spine remains final despite Visual Doctrine's Document + House lead.
4. Decide whether future major Project-source docs should be mirrored into `docs/project-sources/` as Markdown extracts as a normal admin step.
