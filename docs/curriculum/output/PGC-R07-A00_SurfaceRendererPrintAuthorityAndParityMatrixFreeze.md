# PGC-R07 A00 Surface, Renderer, Print Authority and Parity Matrix Freeze

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
SELECTION_TASK_ID = PGC-R06-A07_D0Closed_SelectNextApprovedProgram
TASK_ID = PGC-R07-A00_SurfaceRendererPrintAuthorityAndParityMatrixFreeze
SELECTED_NEXT_PROGRAM = PGC-R07_RealPrintAndSurfaceParityConformance
STATUS = FROZEN_PENDING_CI_AND_MERGE
```

## Selection result

The accepted program controller fixes the order as:

```text
PGC-R06
→ PGC-R07
→ PGC-R08
→ PGC-R09
→ P03F_W3DirectProductVerticalSlice014Implementation
```

R06 is D0 closed with `389/389` legal R06 routes passing the global live gate and a repair queue of zero. The next approved product milestone is therefore R07. The open GCI governance branch is not substituted for the PGC product sequence, and Slice014 remains frozen.

## R07 audit authority

```text
Capability / surface rows = 1222
Runtime capacity rows      = 1155
Public source units        = 26
Visible KnowledgePoints    = 193
Surfaces                   = 3
```

Surfaces:

```text
CLASSIC      = PUBLIC_ACTIVE
FALLBACK_404 = PUBLIC_DEPRECATED but still publicly reachable
PIXEL        = PUBLIC_ACTIVE
```

The canonical worksheet entry remains:

```text
site/assets/browser/pipeline/build-worksheet-document.js
→ buildWorksheetDocumentFromState
```

Preview and browser print remain:

```text
site/assets/browser/pipeline/render-preview-frame.js
→ renderPreviewFrame
→ printPreviewFrame
```

## Parity contract

For the same configuration and seed, all audited surfaces and output projections must preserve:

```text
KnowledgePoint identity
PatternSpec identity
question identity
answer identity
context identity
question count
question order
```

Only presentation layout may differ.

Output projections:

```text
PREVIEW_HTML
PRINT_HTML
CHROMIUM_PDF
ANSWER_KEY
```

## Renderer branches requiring proof

The existing renderer remains the only authority, but its current branches must be audited separately:

```text
SHARED_EXACT_LAYOUT
DYNAMIC_HTML
STATIC_HTML_URL
SHARED_FALLBACK
```

This milestone does not remove or repair any branch. It freezes the exact baseline so later fixes are driven by evidence rather than route-by-route assumptions.

## Ordered R07 milestones

```text
A00  Surface / renderer / print authority and parity scope freeze
A01  Three-surface parity baseline materialization
A02  Shared-renderer and legacy-branch parity FullFix
A03  Real Chromium print and answer-key matrix
A04  Overflow, clipping, font and pagination FullFix
A05  Final surface-parity reconciliation and R07 closeout
```

## Frozen boundary

```text
No new KnowledgePoint
No new PatternGroup
No new PatternSpec
No new generator
No second validator
No second renderer
No UI visual redesign
No Batch expansion
No Slice014
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D1_R06_D0_CLOSED_REAL_PRINT_AND_SURFACE_PARITY_UNPROVEN
GOAL_DISTANCE_AFTER  = D1_R07_SURFACE_RENDERER_PRINT_SCOPE_AND_PARITY_CONTRACT_FROZEN
DISTANCE_REDUCED     = selected the approved R07 product program and froze one complete machine-auditable parity scope
REMAINING_BLOCKERS   = [THREE_SURFACE_PARITY_BASELINE_NOT_MATERIALIZED, RENDERER_BRANCH_PARITY_UNPROVEN, REAL_CHROMIUM_PDF_MATRIX_INCOMPLETE, VISUAL_OVERFLOW_FONT_PAGINATION_MATRIX_INCOMPLETE]
NEXT_SHORTEST_STEP   = PGC-R07-A01_ThreeSurfaceParityBaselineMaterialization
```

## Task closeout

```text
1. Distance segment shortened = R06 D0 terminal state to an exact R07 surface/print audit scope
2. System nodes advanced = renderer / preview / print / PDF / answer-key acceptance authority
3. Blocker removed = next approved program ambiguity
4. New blocker added = none; existing unproven parity gaps are now explicit
5. Next shortest effective step = materialize the three-surface parity baseline
```
