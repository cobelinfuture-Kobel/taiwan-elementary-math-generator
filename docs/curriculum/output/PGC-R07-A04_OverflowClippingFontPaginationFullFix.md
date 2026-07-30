# PGC-R07-A04 Overflow, Clipping, Font and Pagination FullFix

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R07-A04_OverflowClippingFontPaginationFullFix
STATUS     = PASS_EXACT_HEAD_CI_OVERFLOW_FONT_PAGINATION_MATRIX
```

## Precondition

A03 proved the same G5A-U08 question and answer identity across Classic, fallback 404 and Pixel with six real Chromium A4 PDFs. A04 does not repeat that surface matrix. It closes the remaining renderer-branch and long-content layout gap.

## Frozen scope

```text
4 renderer branches × 2 stress profiles = 8 real Chromium PDFs
```

Renderer branches:

```text
SHARED_EXACT_LAYOUT
DYNAMIC_HTML
STATIC_HTML_URL
SHARED_FALLBACK
```

Stress profiles:

```text
LONG_TEXT
- 8 Traditional Chinese long-text questions
- 2 columns × 2 rows
- 2 question pages + 2 answer pages

DENSE_NUMERIC
- 24 dense integer-expression questions
- 3 columns × 4 rows
- 2 question pages + 2 answer pages
```

## Actual routing evidence

Each witness passed through the production `renderPreviewFrame` route.

```text
SHARED_EXACT_LAYOUT
→ exactEligible=true
→ sharedExactLayout=true

DYNAMIC_HTML
→ exactEligible=false
→ dynamic=true

STATIC_HTML_URL
→ exactEligible=false
→ staticHtmlUrl=true

SHARED_FALLBACK
→ exactEligible=false
→ sharedExactLayout=true
```

## Acceptance result

```text
EXPECTED_ROWS                         = 8
ACTUAL_ROWS                           = 8
REAL_CHROMIUM_A4_PDF_PASS             = 8 / 8
PAGE_OVERFLOW_FINDINGS                = 0
CLIPPING_FINDINGS                     = 0
QUESTION_OVERLAP_FINDINGS             = 0
MISSING_ANSWERS                       = 0
ABNORMAL_BLANK_PAGES                  = 0
TRADITIONAL_CHINESE_FONT_PASS          = 8 / 8
QUESTION_ANSWER_PAGE_BIJECTION_PASS    = 8 / 8
CONSOLE_ERRORS                        = 0
PAGE_ERRORS                           = 0
CROSS_BRANCH_QUESTION_IDENTITY        = EXACT_MATCH_PER_PROFILE
CROSS_BRANCH_ANSWER_IDENTITY          = EXACT_MATCH_PER_PROFILE
```

Every row passed the seven frozen A00 dimensions:

```text
NO_OVERFLOW
NO_CLIPPING
NO_QUESTION_OVERLAP
NO_MISSING_ANSWERS
NO_ABNORMAL_BLANK_PAGES
TRADITIONAL_CHINESE_FONT_OK
QUESTION_ANSWER_PAGE_BIJECTION
```

## Exact-head evidence

```text
ACCEPTED_HEAD_SHA = 0008ccfff167da986de0a432efe352e1bd6c6d86
WORKFLOW_RUN_ID   = 30560688293
WORKFLOW_RUN_NO   = 4400
ARTIFACT_ID       = 8766828997
ARTIFACT_DIGEST   = sha256:3a726622d8cad1718d02e2077f08c7b8d1b7fa3d9803c009eb8d6b7cbc610baf
ARTIFACT_BYTES    = 337989
MIN_PDF_BYTES     = 21844
MAX_PDF_BYTES     = 79837
FULL_REGRESSION   = PASS
PGC_R00_GATE      = PASS
POSTG_GATE        = PASS
```

## Artifacts

```text
data/curriculum/public-generation/PGC-R07-A04.overflow-clipping-font-pagination-matrix.json
tools/curriculum/run-pgc-r07-a04-overflow-font-pagination-matrix.mjs
tests/curriculum/pgc-r07-a04-overflow-font-pagination-matrix.test.js
tmp/pgc-r07-a04-overflow-font-pagination-matrix/report.json
tmp/pgc-r07-a04-overflow-font-pagination-matrix/*.html
tmp/pgc-r07-a04-overflow-font-pagination-matrix/*.pdf
```

## CI policy

No new workflow was added. The existing `Node Test` workflow contains one branch-specific Chromium step and one artifact upload.

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

## Gate

```text
FOCUSED_CONTRACT = PASS
FULL_REGRESSION  = PASS
CHROMIUM_MATRIX  = PASS
EXACT_HEAD       = PASS
```

## Goal distance

```text
GOAL_DISTANCE_BEFORE = D1_R07_REAL_CHROMIUM_PRINT_ANSWER_MATRIX_PASS
GOAL_DISTANCE_AFTER  = D1_R07_OVERFLOW_FONT_PAGINATION_MATRIX_PASS
DISTANCE_REDUCED     = all four renderer branches passed long-text and dense multi-page stress in eight real Chromium A4 PDFs
REMAINING_BLOCKERS   = [FINAL_SURFACE_PARITY_RECONCILIATION_PENDING]
NEXT_SHORTEST_STEP   = PGC-R07-A05_FinalSurfaceParityReconciliationAndCloseout
```
