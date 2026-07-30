# PGC-R07 A03 Real Chromium Print and Answer-Key Matrix

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R07-A03_RealChromiumPrintAndAnswerKeyMatrix
STATUS = IMPLEMENTATION_READY_PENDING_EXACT_HEAD_CI
```

## Scope

A03 materializes one real-browser matrix for:

```text
3 public surfaces
× 2 answer-key modes
= 6 Chromium PDF acceptance rows
```

Surfaces:

```text
CLASSIC      = site/index.html
FALLBACK_404 = site/404.html
PIXEL        = site/pixel/index.html
```

The six rows use one exact configuration and seed:

```text
sourceId       = g5a_u08_5a08
selectionMode  = sourceUnit
questionMode   = mixed
depthMode      = mixed
contextMode    = mixed
questionCount  = 6
ordering       = groupedByPattern
generationSeed = pgc-r07-a03-g5a-u08-shared-seed
columns        = 3
rowsPerPage    = 5
```

## Browser evidence

The runner performs actual UI generation for each surface and answer-key mode. It then:

```text
1. reads question and answer cards from the preview iframe;
2. verifies question-number and answer-number bijection;
3. intercepts and proves the surface print target was invoked;
4. renders the preview iframe HTML through Chromium page.pdf;
5. requires an A4 PDF with a valid %PDF- header;
6. checks overflow, console errors and page errors;
7. compares exact question identity across all six rows;
8. compares exact answer identity across the three answer-key rows;
9. confirms answer-key on/off does not alter question identity.
```

Evidence paths:

```text
tools/curriculum/run-pgc-r07-a03-chromium-print-answer-matrix.mjs
tmp/pgc-r07-a03-chromium-print-answer-matrix/report.json
tmp/pgc-r07-a03-chromium-print-answer-matrix/*.html
tmp/pgc-r07-a03-chromium-print-answer-matrix/*.pdf
```

## Frozen boundary

```text
Generator modified       = false
Validator modified       = false
Renderer modified        = false
Product UI modified      = false
KnowledgePoint modified  = false
PatternGroup modified    = false
PatternSpec modified     = false
New workflow added       = false
Slice014 started         = false
```

The existing Node Test workflow receives one branch-specific Chromium acceptance step and artifact upload. No additional workflow is created.

## Acceptance gate

```text
Matrix rows                         = 6 / 6 PASS
Real Chromium PDFs                  = 6 / 6 PASS
Surface print targets               = 6 / 6 invoked
Answer-key bijection rows           = 3 / 3 PASS
Question identity across all rows   = exact match
Answer identity across answer rows  = exact match
Answer toggle question identity     = unchanged
Console errors                      = 0
Page errors                         = 0
Overflow findings                   = 0
Full repository regression          = PASS
```

These values remain pending until exact-head CI finishes. This document must not be promoted to final PASS from static inspection alone.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_R07_CLASSIC_CAPACITY_AWARE_PREVIEW_PRINT_PARITY_PASS
GOAL_DISTANCE_AFTER  = D1_R07_REAL_CHROMIUM_PRINT_ANSWER_MATRIX_IMPLEMENTATION_READY_PENDING_CI
DISTANCE_REDUCED     = executable six-row real Chromium PDF and answer-key identity matrix materialized
REMAINING_BLOCKERS   = [A03_EXACT_HEAD_CI_PENDING, RENDERER_BRANCH_PARITY_UNPROVEN, OVERFLOW_CLIPPING_FONT_PAGINATION_FULLFIX_PENDING]
NEXT_SHORTEST_STEP   = PGC-R07-A03_ExactHeadCIAndMatrixReadback
```
