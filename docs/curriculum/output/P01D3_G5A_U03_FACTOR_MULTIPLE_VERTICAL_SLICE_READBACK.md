# P01D3 G5A-U03 Factor / Multiple Vertical Slice Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P01D3_G5AU03FactorMultipleVerticalSlice
STATUS = PASS_PENDING_EXACT_HEAD_CI
```

## Source and pattern authority

```text
g5a_u03_5a03a  倍數    = 7 KnowledgePoints / 14 PatternSpecs
g5a_u03_5a03a1 公倍數  = 5 KnowledgePoints / 10 PatternSpecs
Total                    = 12 KnowledgePoints / 24 PatternSpecs
```

The source-backed geometry candidate `kp_g5a_u03a1_rectangle_square_tiling` remains outside this W1 task.

## Runtime result

```text
source authority          = isolated full-product extension
planner                   = existing shared Batch A planner
number-theory primitives  = shared
factor/multiple runtime   = deterministic domain plugin
validator                 = existing full-product facade
worksheet and answer key  = existing WorksheetDocument path
HTML and print renderer   = existing renderer
public dropdown           = unchanged
```

## Required exact-head acceptance

- full Node regression;
- 12/12 selector KnowledgePoints;
- 12/12 PatternGroups;
- 24/24 PatternSpecs;
- deterministic generation for both source nodes;
- bounded single-KP generation for all 12 KPs;
- 24/24 answer-tamper rejection;
- two worksheets and answer keys;
- two non-empty Chromium PDFs;
- zero overflow, console errors and page errors;
- P01A inventory = 21 admitted / 0 remaining;
- protected 15-unit GLM and POSTG gates remain green.

## Boundary

```text
existing 15-unit source registry changed = false
public UI source dropdown changed         = false
application stories added                 = false
parallel runtime pipeline                 = false
P01E started                              = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_W1_9_ADMITTED_12_REMAINING
GOAL_DISTANCE_AFTER  = D2_W1_21_ADMITTED_0_REMAINING
DISTANCE_REDUCED     = The final twelve W1 KnowledgePoints gain complete source-to-PDF product vertical slices; W1 public UI/HTML/PDF/print closeout remains.
REMAINING_BLOCKERS   = [P01E W1 public UI/HTML/PDF/print closeout, W2-W8 product delivery, P09 79-source UI, P10 full closeout]
NEXT_SHORTEST_STEP   = P01E_W1PublicUIHTMLPDFPrintCloseout
```
