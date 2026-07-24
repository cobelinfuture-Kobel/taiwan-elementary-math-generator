# P01D1 G5B-U05 Large-Number Vertical Slice Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P01D1_G5BU05LargeNumberVerticalSlice
STATUS = IMPLEMENTED_PENDING_FULL_CI_AND_CHROMIUM_PDF
```

## Source scope

```text
sourceId       = g5b_u05_5b05a
source title   = 數的十進位結構與億以上的數
source PDF     = meow911_5b05a_source.pdf
reviewed pages = 1, 2, 3
wave           = R05-W1
```

## Product materialization

```text
canonical KnowledgePoints = 4
FormalMappings             = 4
visible PatternGroups      = 4
executable PatternSpecs    = 8
public source options      = 16 total
protected baseline sources = 13 unchanged
```

Admitted KPs:

```text
kp_g5b_u05a_large_number_place_value_extension
kp_g5b_u05a_large_number_read_write
kp_g5b_u05a_power_of_ten_scaling
kp_g5b_u05a_large_number_decompose_compare
```

Excluded:

```text
kp_g5b_u05a_decimal_base10_structure
reason = not assigned to W1
```

## Runtime integration

```text
stable selector entry  = batch-a-selector-extension.js
stable plan entry      = batch-a-browser-generator.js
stable question entry  = batch-a-browser-question-router.js
stable validator entry = batch-a-browser-validator-g4a-u08-extension.js
worksheet entry        = batch-a-browser-worksheet-r2e-entry.js
HTML renderer          = site/modules/renderer/html-renderer.js
```

P01D1 adds thin extension layers and preserves the complete pre-P01D1 router and validator implementations for all existing sources.

## Executable acceptance

The focused and full regression gates verify:

```text
4/4 KP selector visibility
4/4 PatternGroups
8/8 PatternSpecs
16 deterministic source-unit questions
all eight operation families represented
single-KP generation for every admitted KP
Chinese-number round trip through 萬 / 億 / 兆
tamper rejection
16 worksheet questions
16 answer-key items
question and answer-key pagination
HTML question and answer sections
Chromium PDF non-empty
page overflow = 0
```

## W1 inventory delta

```text
BEFORE P01D1
admitted public-pattern rows = 0
remaining vertical slices    = 21

AFTER P01D1
admitted public-pattern rows = 4
remaining vertical slices    = 17
```

## Product boundary

```text
existing 15-unit product modified = false
application stories added         = false
parallel planner added            = false
parallel renderer added           = false
W2-W8 work started                = false
recursive-improvement admin       = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_W1_21_VERTICAL_SLICES_REQUIRED
GOAL_DISTANCE_AFTER  = D2_W1_4_ADMITTED_17_REMAINING
DISTANCE_REDUCED     = Four source-backed G5B-U05 KnowledgePoints now traverse FormalMapping, PatternSpec, shared generation, deterministic validation, worksheet, answer key, HTML and PDF acceptance.
REMAINING_BLOCKERS   = [17 W1 KnowledgePoints, P01E W1 closeout, W2-W8 delivery, P09 79-source UI, P10 full product closeout]
NEXT_SHORTEST_STEP   = P01D2_G6AU01NumberTheoryVerticalSlice
```
