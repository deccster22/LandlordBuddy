# P4C-MKT-L4-RS-01G Narrow Final Icon And LandlordBuddy Treatment Pass

Date: 2026-04-23
Task ID: P4C-MKT-L4-RS-01G
Phase posture: Phase 4B remains primary; this is bounded Phase 4C Lane 4 pre-synthesis tightening work.

Objective:

- tighten unresolved icon/treatment decisions before final Lane 4 synthesis
- treat `LandlordBuddy` as fixed primary wordmark
- prefer clarity, trust fit, stress readability, and launcher recognisability over novelty

## 1. Scope Locks Preserved

- `LandlordBuddy` wordmark format is fixed and not reopened in this pass.
- This pass evaluates treatment and icon structure only.
- Lane 2 semantics, CTA hierarchy, warning families, and trust-cue posture remain unchanged.
- No visual recommendation implies filing, submission, legal authority, compliance certification, or official acceptance.
- Excluded by rule in this pass:
  - house/roof/key motifs
  - handshake/people motif as default answer
  - seal/crest/courthouse/gavel/fake-official motifs

## 2. Source Anchors Used

- `docs/specs/p4c-mkt-l4-01-first-wave-brand-visual-direction-pack.md`
- `docs/qa/p4c-mkt-l4-01-4c-d-status-pack.md`
- `docs/governance/P4B Freeze Map.md`
- `AGENTS.md`
- `C:\Users\Decclan\Downloads\Landlord Buddy App Icon Research.docx`
- `C:\Users\Decclan\Downloads\LandlordBuddy Wordmark Formats.docx`
- `C:\Users\Decclan\Downloads\Landlord Buddy Semantic Colour System Research Pack.docx`
- `C:\Users\Decclan\Downloads\Landlord Buddy Visual Doctrine & UX_UI Phase Map.docx`

## 3. App Icon Rerun Note (Three Structural Families)

This rerun is launcher-first: if a concept degrades at `24px` in mixed-crowded context, it is not eligible as primary.

| Family | Structural description | Strengths | Risks | Decision |
| --- | --- | --- | --- | --- |
| `Route Spine` | One dominant vertical spine with two offset waypoint cuts and one terminal node. Pure geometric fill, no text. | Strong silhouette memory, low-detail durability at `20-24px`, workflow-support cue without legal-authority theatre. | Can look too utility-like if color contrast is weak. | `Primary` |
| `Cut Block Monogram` | Rounded-square mass with negative-space cuts that loosely suggest `L/B` without explicit lettering. | Very stable at tiny sizes, ownable geometry, balanced seriousness. | Slightly less immediate meaning than Route Spine; can read as generic utility if over-neutralized. | `Fallback` |
| `Tabbed Path` | Single tabbed slab with an internal route line and endpoint notch. | Closest to preparation/document continuity cue. | Internal route detail collapses first at `20-24px`; crowded-launcher confusion rises. | `Not selected` |

Selection rationale:

- `Route Spine` is the strongest fit when recognisability at `24px` is the hard gate.
- `Cut Block Monogram` is held as fallback when a more neutral profile is required.
- `Tabbed Path` remains a useful synthesis reference, but not a final recommendation due to small-size failure risk.

Detailed matrix evidence is recorded in:

- `docs/qa/p4c-mkt-l4-rs-01g-small-size-app-tile-qa-board.md`

## 4. LandlordBuddy Wordmark Treatment Note

Fixed format in this task: `LandlordBuddy`.

### 4.1 Primary treatment

- `LandlordBuddy` in `Public Sans SemiBold` (`600`), sentence-case pattern preserved exactly as fixed.
- Single-color wordmark on consequential surfaces (no split-color gimmick across `Landlord`/`Buddy`).
- Optical kerning on; add a slight positive tracking bias to protect seam readability around `dB` at smaller sizes.
- Use strong neutral contrast (`Ink` on light surfaces, `Surface` on dark surfaces); avoid gradient, bevel, gloss, or metallic effects.

### 4.2 Fallback treatment

- `LandlordBuddy` in `Inter SemiBold` (`600`) when Public Sans rendering or availability is constrained.
- Keep the same contrast and no-effects policy.

### 4.3 Compact lockup behavior

- `Full lockup`: icon + `LandlordBuddy` for standard shell/header placements.
- `Compact lockup`: icon + tighter wordmark spacing only; do not introduce extra descriptors.
- `Ultra-compact`: icon-only for launcher and narrow-control surfaces where text falls below readable threshold.
- Never substitute all-caps or compressed text as a compact workaround.

### 4.4 Surface usage notes

- Header/nav: keep lockup calm and procedural; no heroic styling that outruns prep-and-handoff posture.
- App-store adjacency: treat icon as primary asset; platform label carries app name, so avoid forcing decorative micro-wordmarks into tile art.
- Trust-heavy surfaces: keep mark visually subordinate to state/trust cues; branding must not overpower warning or boundary lines.

## 5. Typography Micro-Evaluation Note

Evaluation criteria:

- readability of fixed `LandlordBuddy` shape at practical UI sizes
- seam clarity around CamelCase join
- trust tone fit (workflow-support, non-official, non-gimmicky)
- distinctiveness without proptech-generic drift

| Typeface | LandlordBuddy seam clarity | Small-size crispness | Trust/stress fit | Verdict |
| --- | --- | --- | --- | --- |
| `Public Sans` | Strong uppercase/lowercase transitions keep `LandlordBuddy` readable without visual noise. | Stable at `14-18px` UI ranges. | Calm and procedural without fake-official stiffness. | `Primary` |
| `Inter` | Good seam clarity, slightly tighter rhythm in dense nav conditions. | Very strong screen rendering. | Reliable fallback, but can read more generic in brand contexts. | `Fallback` |
| `Source Sans 3` | Friendly and open, but seam emphasis softens at heavier stress contexts. | Good body rendering; less distinctive for wordmark emphasis. | Better as supporting/body text than wordmark anchor. | `Not selected for wordmark` |
| `IBM Plex Sans` | Characterful and clear, but firmer technical tone increases severity risk. | Strong rendering. | Useful for data-heavy interiors, but less aligned to calm-supportive brand lead. | `Not selected for wordmark` |

Primary typography treatment:

- wordmark: `Public Sans 600`
- surrounding UI/copy: continue `Source Sans 3` for body-support balance where already adopted

Fallback typography treatment:

- wordmark: `Inter 600`
- surrounding UI/copy: `Inter 400/500` when single-family deployment is required

## 6. Recommendation Summary

Primary icon direction:

- `Route Spine`

Fallback icon direction:

- `Cut Block Monogram`

Primary wordmark treatment:

- fixed `LandlordBuddy` in `Public Sans 600`, single-color, high-contrast, no decorative effects

Fallback wordmark treatment:

- fixed `LandlordBuddy` in `Inter 600`, same no-effects and contrast discipline

Primary typography treatment:

- `Public Sans` for mark and UI labels, `Source Sans 3` for body/supporting copy

Fallback typography treatment:

- all-`Inter` stack when deployment simplicity is needed

## 7. Guarded Assumptions Preserved

- No new legal/process meaning is inferred from iconography.
- No readiness-state semantics or trust-key semantics are altered.
- No CTA wording, warning-family behaviour, or handoff posture is changed.
- Launcher performance at `24px` is treated as a hard control, not an aesthetic preference.
