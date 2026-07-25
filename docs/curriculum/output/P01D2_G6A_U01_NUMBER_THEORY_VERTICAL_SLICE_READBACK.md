# P01D2 G6A-U01 Number-Theory Vertical Slice Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P01D2_G6AU01NumberTheoryVerticalSlice
STATUS = IMPLEMENTED_PENDING_FINAL_CI_MERGE
```

## Source scope

```text
sourceId       = g6a_u01_6a01
source title   = 最大公因數與最小公倍數
source PDF     = meow911_6a01_source.pdf
Drive file id  = 13ZKjfZ7d75ORCcHQ4MzZC8AqrZDVbehH
reviewed pages = 1, 2, 3, 4
wave           = R05-W1
```

The four-page source was visually read. P01D2 admits only deterministic number-theory capabilities. Source application situations such as schedules, grouping, packaging, cutting, and periodic events remain outside this milestone.

## Product materialization

```text
canonical KnowledgePoints = 5
FormalMappings             = 5
visible PatternGroups      = 5
executable PatternSpecs    = 10
protected public fleet     = 15 unchanged
full-product source fleet  = 17
public dropdown additions  = 0
```

Admitted KPs:

```text
質數合數分類
質因數分解
短除法分解共同因數
最大公因數
最小公倍數
```

## Shared runtime

```text
selector projection     = g6a-u01-selector-projection.js
selector composition    = batch-a-selector-p01d2-extension.js
source authority        = full-product-source-units-p01d2.js
PatternSpec authority   = source-pattern-full-product-p01d2-extension.js
shared math runtime     = number-theory-runtime.js
question route          = batch-a-browser-question-router.js
validator facade        = batch-a-browser-validator-full-product.js
worksheet entry         = batch-a-browser-worksheet-r2e-entry.js
HTML renderer           = site/modules/renderer/html-renderer.js
```

No new worksheet planner, renderer, PDF pipeline, or Golden anti-drift exception is introduced.

## Executable acceptance

The milestone Gate verifies:

```text
5 selector KPs
5 PatternGroups
10 PatternSpecs
20 deterministic source-unit questions
all 10 operations represented
single-KP generation for all 5 KPs
prime/composite boundaries including 1
prime-factorization product and exponent forms
short-division reconstruction and coprime tails
GCF and LCM invariants
answer tamper rejection
20 worksheet questions
20 answer-key items
HTML question and answer-key sections
Chromium non-empty PDF
page overflow = 0
P01D1 regression retained
```

## W1 inventory delta

```text
BEFORE P01D2
admitted W1 KPs = 4
remaining       = 17

AFTER P01D2
admitted W1 KPs = 9
remaining       = 12
```

The remaining twelve KPs belong to the G5A-U03 factor/multiple cluster.

## Boundary

```text
protected 15-unit product modified = false
public dropdown modified           = false
application stories added           = false
W2-W8 work started                  = false
recursive-improvement admin         = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_W1_4_ADMITTED_17_REMAINING
GOAL_DISTANCE_AFTER  = D2_W1_9_ADMITTED_12_REMAINING
DISTANCE_REDUCED     = Five source-backed G6A-U01 KnowledgePoints now traverse FormalMapping, PatternSpec, deterministic number-theory generation, validation, worksheet, answer key, HTML and PDF acceptance.
REMAINING_BLOCKERS   = [12 W1 factor/multiple KPs, P01E W1 public UI closeout, W2-W8 delivery, P09 79-source UI, P10 full-product closeout]
NEXT_SHORTEST_STEP   = P01D3_G5AU03FactorMultipleVerticalSlice
```
