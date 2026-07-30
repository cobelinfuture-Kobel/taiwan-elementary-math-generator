# PGC-R07 A03 Real Chromium Print and Answer-Key Matrix

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R07-A03_RealChromiumPrintAndAnswerKeyMatrix
STATUS = PASS_EXACT_HEAD_CI_REAL_CHROMIUM_MATRIX
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

The R1 harness waits for the iframe worksheet DOM and accepts the dedicated G5A-U08 cells, the shared worksheet cells and the G4B-U04 compatibility cells without modifying any product renderer.

Evidence paths:

```text
tools/curriculum/run-pgc-r07-a03-chromium-print-answer-matrix.mjs
tools/curriculum/run-pgc-r07-a03-chromium-print-answer-matrix-r1.mjs
tmp/pgc-r07-a03-chromium-print-answer-matrix/report.json
tmp/pgc-r07-a03-chromium-print-answer-matrix/*.html
tmp/pgc-r07-a03-chromium-print-answer-matrix/*.pdf
```

## Exact-head CI readback

```text
HEAD_SHA          = bb4b2841ecaee5407be68b7fdf9926929a968592
NODE_RUN_ID       = 30557975047
NODE_RUN_NUMBER   = 4396
ARTIFACT_ID       = 8765728589
ARTIFACT_DIGEST   = sha256:1b0021b607611169f9efb6c6f4eb2f8404e9002a605993c8f8610f9afb03ffef
ARTIFACT_SIZE     = 75871 bytes
```

The artifact contains six HTML files, six Chromium PDFs and `report.json`.

## Identity readback

```text
QUESTION_IDENTITY_SHA256 = 2f4a34f2cad1ccbf1c66ad609a6465439a479544a6bbd8048baf8e699f596210
ANSWER_IDENTITY_SHA256   = d8f09760eaf848d9e35c7f9b62dbcc9f426d34954509113990229dea71cefc2c
ANSWER_ON_PDF_BYTES      = 12992 per surface
ANSWER_OFF_PDF_BYTES     = 11954 per surface
```

Classic, fallback 404 and Pixel produced the same six questions in the same order. The three answer-key rows produced the same six answers in the same order. Toggling the answer key did not change question identity.

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
PGC-R00 scope gate                  = PASS
PR Gate Pilot                       = PASS
POSTG application gate              = PASS
Capacity runtime reconciliation     = PASS
```

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_R07_CLASSIC_CAPACITY_AWARE_PREVIEW_PRINT_PARITY_PASS
GOAL_DISTANCE_AFTER  = D1_R07_REAL_CHROMIUM_PRINT_ANSWER_MATRIX_PASS
DISTANCE_REDUCED     = exact question and answer identity proved across three public surfaces using six real Chromium A4 PDFs and actual print-target invocation
REMAINING_BLOCKERS   = [RENDERER_BRANCH_PARITY_UNPROVEN, OVERFLOW_CLIPPING_FONT_PAGINATION_FULLFIX_PENDING]
NEXT_SHORTEST_STEP   = PGC-R07-A04_OverflowClippingFontAndPaginationFullFix
```

## Task closeout

```text
1. DISTANCE SEGMENT SHORTENED =
   METADATA_ONLY_OR_SINGLE_SURFACE_PRINT_EVIDENCE
   -> REAL_THREE_SURFACE_CHROMIUM_PRINT_AND_ANSWER_IDENTITY_EVIDENCE

2. SYSTEM NODE ADVANCED =
   PUBLIC_SURFACE -> PRINT_TARGET -> CHROMIUM_PDF -> ANSWER_KEY_PARITY

3. BLOCKER REMOVED =
   REAL_PRINT_AND_ANSWER_KEY_MATRIX_MISSING

4. NEW BLOCKER ADDED =
   NONE

5. NEXT SHORTEST EFFECTIVE STEP =
   PGC-R07-A04_OverflowClippingFontAndPaginationFullFix
```
