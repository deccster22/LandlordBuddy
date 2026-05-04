# Research Digest v6 and Register Update Note

Date added: 2026-05-04
Sources:

- `LandlordBuddy_Research_Digest_v6.pdf`
- `LandlordBuddy_Tracker_Audit_Register_V6.xlsx`

Status: repo source snapshot and reconciliation note

## What the digest is for

The Research Digest captures normalised output of Deep Research jobs, Agent tasks, and important specialist synthesis passes. It is the bridge between live chat work and durable project memory.

Workflow layer:

`Question -> Evidence -> Summary -> Asset -> Decision -> Canon`

The digest owns the Summary layer.

## Digest use rule

- Use the digest after Research Control Room normalises an output.
- Do not store raw dumps.
- Store cleaned, decision-ready summaries.
- Use one digest entry per job ID unless the pass is an explicit synthesis.
- If an entry is promoted, record the destination and date in the digest and update the Promotion Log in the tracker.

## Storage decision rule

Use a three-way storage decision:

1. Leave in chat only when rough, duplicative, or a dead end.
2. Capture in Research Digest when coherent and potentially useful later.
3. Promote to specialist chats and/or Master Canon when it changes rules, product direction, trust posture, pricing logic, or a durable project decision.

Rule of thumb: push less than you think, push cleaner than you think, and push by destination rather than enthusiasm.

## Register update fields

Digest entries expect register updates across:

- Research Log
- Open Questions
- Decision Register
- Risk Register
- Promotion Log

## Important v6 content categories

Research Digest v6 contains normalised entries and summaries including:

- AG03A-refresh arrears-to-resolution rules matrix delta
- DR04 legal boundary, compliance, privacy, and guardrails
- DR02 forms, templates, and field requirements
- AG05 product requirements seed pack
- AG07 guardrails and disclaimer pack
- AG10 referral red-flag matrix
- AG11 credibility and trust checklist pack
- DR09 willingness to pay and pricing triggers
- DR06 MVP shape and commercial model
- DR11 killer demo research brief
- DR10 trust and credibility signals
- DR07 user pain and failure-point analysis
- DR04A safe messaging, legal-boundary implementation, and privacy posture
- AG02C authenticated portal + evidence-rule verification
- AG04 scenario library
- AG06 backlog generation
- AG08 UX flow pack
- AG09 feature scoring matrix
- AG12 killer demo pack
- AG13 willingness-to-pay synthesis pack
- DR08 expansion roadmap beyond Victoria
- BR05B route-selection, service-warning, and handoff messaging comprehension test
- BR05 trust/comprehension/commercial viability
- BR04 privacy/retention/deletion/legal hold

## Reconciliation status from this repo pass

Confirmed:

- Repo now has current posture, Gate A sync, shell delta, focused operating shell specs, 4C Lane 1-4 specs, QA packs, and AGENTS guardrails.
- Master Canon v1.3 was not previously present as a full source snapshot. It is now represented in `master-canon-v1.3-operational-extract.md`.
- Founder/governance/source packs were not previously present as a visible repo source layer. They are now represented in `founder-operating-governance-source-pack.md`.
- Gate A source was already reflected by repo decision docs but now also exists as a project-source snapshot.
- Visual Doctrine v0.1 was not previously present as a project-source snapshot and is now represented in `visual-doctrine-v0.1-extract.md`.
- Digest v6 is captured here as a register/update note, not fully transcribed.
- Current app icon/logo working preference is `Document + House` / `House + Document`; this correction is captured in `docs/decisions/p4c-mkt-l4-icon-current-preference-note.md`.

Needs validation / follow-up:

- The tracker spreadsheet is a binary XLSX. It was not updated in this connector pass.
- Digest/register should be refreshed outside this branch if the working source of truth must remain the project XLSX/DOCX/PDF files rather than repo Markdown snapshots.
- Some older digest entries include now-superseded retention language such as broad lease-end-plus-six-years. Current canon v1.3 supersedes this with class-based, hold-aware retention logic.
- House/Doc icon variants still need the same practical small-size and crowded-launcher validation standard that was applied to earlier Route Spine testing.

## Recommended tracker updates

When the tracker is next edited, add or verify entries for:

| Register | Suggested entry |
| --- | --- |
| Research Log | `REPO-SYNC-2026-05-04` repo audit and project-source snapshot sync |
| Decision Register | confirm repo source-layer creation as documentation/audit decision, not product doctrine change; record current House/Doc icon preference correction if not already captured |
| Risk Register | risk of project-source/repo drift if binary source docs are not mirrored or periodically reconciled |
| Open Questions | whether tracker XLSX remains canonical control panel or whether repo-native register mirrors are needed; House/Doc small-size validation remains pending |
| Promotion Log | Master Canon v1.3, Gate A, 4C, shell, visual doctrine extracts promoted into repo project-source layer |

## Recommended digest entry

Job ID: `REPO-SYNC-2026-05-04`

Title: Repo audit and project-source snapshot sync

Status: Operationalised / Needs tracker update

Executive summary: The LandlordBuddy repo had strong implementation-facing docs but lacked a visible project-source layer for the founder brief, operating principles, master canon, Gate A decision, 4C operating pack, visual doctrine, operating shell decision stack, and digest/register state. This branch adds repo-native Markdown extracts and a manifest without changing product doctrine. A correction has also been added confirming House/Doc as the current icon/logo working preference, with older Route Spine artifacts retained as historical test evidence only. The tracker spreadsheet and full digest still need a separate register refresh if the binary project files remain the control-panel source of truth.

Storage decision: Capture in Research Digest and Promotion Log; do not promote to Master Canon except as a documentation/audit hygiene note.

Next step: Update tracker XLSX and digest source files, then optionally add a repo-native lightweight register mirror if future Codex tasks need searchable control data.
