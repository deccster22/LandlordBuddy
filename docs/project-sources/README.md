# Project Source Snapshots

Date added: 2026-05-04
Branch: `docs/source-sync-audit-2026-05-04`
Purpose: preserve the important ChatGPT Project source documents inside the repository as repo-native Markdown reference material.

## Why this folder exists

The repo already contains implementation-facing docs, specs, QA packs, ADRs, and posture notes. What was missing was a stable source layer for the founder brief, operating doctrine, canon, Gate A decision, 4C posture, visual doctrine, marketing/legal shell decisions, digest/register state, and tracker reconciliation needs.

This folder is not a replacement for official law, regulations, tribunal instructions, government forms, or live official portals. It is a project-source evidence layer for contributors and future audit work.

## Source priority note

When this folder conflicts with a higher-authority source, use the normal Landlord Buddy hierarchy:

1. legislation, regulations, tribunal rules, official forms, official government guidance
2. regulator guidance, official dispute bodies, official privacy guidance
3. legal aid, community legal centres, official-adjacent guidance
4. credible market sources and product websites
5. commentary, blogs, forums, anecdotal material

When project-source docs conflict with current repo posture, use the most recent accepted canon, decision doc, or Product/Legal/HQ checkpoint decision unless a review event is triggered.

## Mirrored source stack

| Project source | Repo snapshot | Current repo use |
| --- | --- | --- |
| `LandlordBuddy_Founder_Brief.pdf` | `founder-operating-governance-source-pack.md` | product concept, North Star, wedge, trust rule |
| `Landlord Buddy Operating Principles.pdf` | `founder-operating-governance-source-pack.md` | source hierarchy, decision hygiene, blacklist |
| `LandlordBuddy_Admin_Batch_Runbook_v1.pdf` | `founder-operating-governance-source-pack.md` | admin loop and batch discipline |
| `LandlordBuddy_Master_Operating_Pack_v3.pdf` | `founder-operating-governance-source-pack.md` | Phase 3B governance and batch-admin posture |
| `LandlordBuddy_Phase_Guide_Roadmap_v3.pdf` | `founder-operating-governance-source-pack.md` | phase gates and BR01-BR05 blocker posture |
| `LandlordBuddy_Blocker_Resolution_Program_v1.pdf` | `founder-operating-governance-source-pack.md` | blocker program and adjudication template |
| `LandlordBuddy Product forward plan.pdf` | `founder-operating-governance-source-pack.md` | Phase 4A-5A product execution map and task packet shape |
| `LandlordBuddy_Master_Canon_v1.3_Detailed_corrected.docx` | `master-canon-v1.3-operational-extract.md` | durable canon extract and decision spine |
| `LandlordBuddy_Official_Gate_A_Decision_Doc_v1.0.docx` | `gate-a-decision-doc-v1.0.md` | Review A / Gate A checkpoint source |
| `Phase 4C Operating Pack .pdf` | `phase-4c-operating-pack-extract.md` | 4C lane map and product-experience construction posture |
| `LandlordBuddy 4C Product Operating Shell Decision - incl. Legal and Marketing inputs.pdf` | `operating-shell-decision-stack.md` | focused shell decision, feature fence, required team outputs |
| `Operating Shell Risk and Inclusion Note v0.1.pdf` | `operating-shell-decision-stack.md` | legal/risk shell guardrails |
| `Marketing Product-Shape Update Pack v2.pdf` | `operating-shell-decision-stack.md` | marketing/launch-surface shell posture |
| `LandlordBuddy Visual Doctrine v0.1.pdf` | `visual-doctrine-v0.1-extract.md` | Lane 4 visual doctrine and freeze criteria |
| `LandlordBuddy_Research_Digest_v6.pdf` | `research-digest-v6-register-update-note.md` | digest state, old entries, and update needs |
| `LandlordBuddy_Tracker_Audit_Register_V6.xlsx` | `research-digest-v6-register-update-note.md` | tracker/register source present, but binary register not mirrored in this connector pass |

## What was intentionally not done

- Binary PDFs, DOCX, and XLSX files were not copied directly because the available GitHub connector supports UTF-8 file creation/update reliably, not binary document upload in this workflow.
- The tracker spreadsheet was not rewritten in this branch. The spreadsheet remains a binary project-source artifact and needs manual or later tool-backed register update.
- No product doctrine was changed by this source sync. This is an evidence and governance sync, not a scope expansion.

## Contributor rule

Use these snapshots as context and traceability aids. Do not treat them as permission to override `AGENTS.md`, accepted repo specs, current posture docs, or official source hierarchy.
