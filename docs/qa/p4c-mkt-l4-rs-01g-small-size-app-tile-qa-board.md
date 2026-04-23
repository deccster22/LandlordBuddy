# P4C-MKT-L4-RS-01G Small-Size App Tile QA Board

Date: 2026-04-23
Task ID: P4C-MKT-L4-RS-01G
Purpose: narrow launcher-size QA evidence for final icon-direction selection before Lane 4 synthesis.

Scope rules preserved:

- evaluated concept set is limited to three structural families:
  - `Route Spine`
  - `Cut Block Monogram`
  - `Tabbed Path`
- excluded motif classes remain excluded:
  - house/roof/key
  - handshake/people as default
  - seal/crest/courthouse/gavel/fake-official

Test sizes:

- `16px`
- `20px`
- `24px`
- `32px`
- `48px`
- `64px`

Test contexts:

- light launcher background
- dark launcher background
- mixed crowded launcher context

Legend:

- `PASS`: recognisable and stable in-context
- `COND`: usable with caution, but confusion risk is non-trivial
- `FAIL`: not reliable for production recommendation

## 1. Route Spine (Primary Candidate)

| Size | Light | Dark | Mixed crowded | Notes |
| --- | --- | --- | --- | --- |
| `16px` | `COND` | `COND` | `COND` | silhouette remains visible, interior waypoint distinction softens |
| `20px` | `PASS` | `PASS` | `COND` | reliable shape; crowded separation still depends on contrast discipline |
| `24px` | `PASS` | `PASS` | `PASS` | recognition threshold met across all contexts |
| `32px` | `PASS` | `PASS` | `PASS` | stable |
| `48px` | `PASS` | `PASS` | `PASS` | stable |
| `64px` | `PASS` | `PASS` | `PASS` | stable |

## 2. Cut Block Monogram (Fallback Candidate)

| Size | Light | Dark | Mixed crowded | Notes |
| --- | --- | --- | --- | --- |
| `16px` | `COND` | `COND` | `FAIL` | negative-space cue compresses too far in crowded context |
| `20px` | `COND` | `COND` | `COND` | readable but less immediate than Route Spine |
| `24px` | `PASS` | `PASS` | `COND` | mostly stable; crowd-find speed trails primary |
| `32px` | `PASS` | `PASS` | `PASS` | stable |
| `48px` | `PASS` | `PASS` | `PASS` | stable |
| `64px` | `PASS` | `PASS` | `PASS` | stable |

## 3. Tabbed Path (Reserve Candidate)

| Size | Light | Dark | Mixed crowded | Notes |
| --- | --- | --- | --- | --- |
| `16px` | `FAIL` | `FAIL` | `FAIL` | interior path detail collapses |
| `20px` | `FAIL` | `COND` | `FAIL` | insufficient clarity under crowding |
| `24px` | `COND` | `COND` | `FAIL` | misses mixed-crowded requirement |
| `32px` | `PASS` | `COND` | `COND` | only partly reliable |
| `48px` | `PASS` | `PASS` | `COND` | acceptable but still less robust than top two |
| `64px` | `PASS` | `PASS` | `PASS` | stable, but too late for launcher-first gate |

## 4. Decision Output

Primary icon direction:

- `Route Spine`

Fallback icon direction:

- `Cut Block Monogram`

Rejected for this pass:

- `Tabbed Path` as final recommendation because it misses the `24px` mixed-crowded gate

## 5. Acceptance Trace

| Acceptance check | Status | Evidence |
| --- | --- | --- |
| Primary icon clearly recommended | `met` | Route Spine is top performer in three-context size sweep |
| Fallback icon exists | `met` | Cut Block Monogram retained as controlled fallback |
| Primary icon recognisable at `24px` | `met` | Route Spine `24px` row is `PASS/PASS/PASS` |
| No prohibited motifs used | `met` | concept families exclude house/key, handshake-default, fake-official motifs |
| Launcher failure does not get overruled by aesthetics | `met` | Tabbed Path held out despite larger-size quality |

## 6. Review Hotspots Before Lane 4 Synthesis

1. Confirm final production stroke/shape values preserve Route Spine `24px` parity after export and rasterization.
2. Confirm crowded-launcher contrast for both light and dark wallpapers with semantic palette constraints.
3. Recheck that icon treatment does not visually outrank warning or trust-cue blocks on consequential surfaces.
