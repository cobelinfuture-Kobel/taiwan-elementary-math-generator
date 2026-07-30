# PGC-R07-A04 Overflow, Clipping, Font and Pagination FullFix

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R07-A04_OverflowClippingFontPaginationFullFix
STATUS     = PENDING_EXACT_HEAD_CI
```

## Precondition

A03 has already proved the same G5A-U08 question and answer identity across Classic, fallback 404 and Pixel with six real Chromium A4 PDFs. A04 does not repeat that surface matrix. It closes the remaining renderer-branch and long-content layout gap.

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

## Actual routing requirement

Each witness must pass through the production `renderPreviewFrame` route. The test cannot call a renderer helper directly and claim branch coverage.

```text
SHARED_EXACT_LAYOUT
→ shouldUseSharedExactLayoutRenderer = true

DYNAMIC_HTML
→ worksheetDocument.dynamicHtml

STATIC_HTML_URL
→ worksheetDocument.staticHtmlUrl

SHARED_FALLBACK
→ default shared renderer branch
```

## Acceptance contract

Every row requires:

```text
NO_OVERFLOW
NO_CLIPPING
NO_QUESTION_OVERLAP
NO_MISSING_ANSWERS
NO_ABNORMAL_BLANK_PAGES
TRADITIONAL_CHINESE_FONT_OK
QUESTION_ANSWER_PAGE_BIJECTION
```

The browser runner additionally requires:

```text
real Chromium A4 PDF
valid %PDF- header
exact expected question and answer page counts
font face load status = loaded
Traditional Chinese glyph measurement > 0
no replacement glyph
0 console errors
0 page errors
cross-branch question identity exact per profile
cross-branch answer identity exact per profile
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

No new workflow is added. The existing `Node Test` workflow receives one branch-specific Chromium step and one artifact upload.

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

## Current gate

```text
FOCUSED_CONTRACT = PENDING_CI
FULL_REGRESSION  = PENDING_CI
CHROMIUM_MATRIX  = PENDING_CI
EXACT_HEAD       = PENDING_CI
```

## Goal distance

```text
GOAL_DISTANCE_BEFORE = D1_R07_REAL_CHROMIUM_PRINT_ANSWER_MATRIX_PASS
GOAL_DISTANCE_AFTER  = D1_R07_OVERFLOW_FONT_PAGINATION_MATRIX_PENDING_CI
DISTANCE_REDUCED     = four-branch stress matrix materialized
REMAINING_BLOCKERS   = [EXACT_HEAD_CHROMIUM_MATRIX_PENDING, FINAL_SURFACE_PARITY_RECONCILIATION_PENDING]
NEXT_SHORTEST_STEP   = PGC-R07-A04_ExactHeadCIAndMatrixReadback
```
