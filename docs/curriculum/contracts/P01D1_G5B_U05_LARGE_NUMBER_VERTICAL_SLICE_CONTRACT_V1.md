# P01D1 G5B-U05 Large-Number Vertical Slice Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P01D1_G5BU05LargeNumberVerticalSlice
SOURCE_ID = g5b_u05_5b05a
DELIVERY_WAVE = R05-W1
```

## Purpose

Admit the four G5B-U05 KnowledgePoints whose complete required runtime capability closure was already production-admitted in R04/R05. This milestone materializes the missing product layers without creating a parallel worksheet system.

## Admitted KnowledgePoints

```text
kp_g5b_u05a_large_number_place_value_extension
kp_g5b_u05a_large_number_read_write
kp_g5b_u05a_power_of_ten_scaling
kp_g5b_u05a_large_number_decompose_compare
```

The following source candidate is explicitly out of scope:

```text
kp_g5b_u05a_decimal_base10_structure
```

It is not assigned to W1 and may not become visible through this milestone.

## FormalMapping and PatternSpec contract

Each admitted KnowledgePoint must have exactly:

```text
1 FormalMapping
1 visible PatternGroup
2 executable PatternSpecs
```

Total:

```text
KnowledgePoints = 4
FormalMappings   = 4
PatternGroups    = 4
PatternSpecs     = 8
```

The eight PatternSpecs cover only source-backed capabilities:

```text
digit value
place-value composition
numeric to Chinese large-number text
Chinese large-number text to numeric
multiply by a power of ten
divide exactly by a power of ten
expanded form
large-number comparison
```

## Runtime lineage

```text
source evidence
→ canonical KnowledgePoint
→ FormalMapping / PatternGroup / PatternSpec
→ existing Batch A plan
→ P01D1 thin question route
→ stable validator facade
→ existing WorksheetDocument assembly
→ existing answer-key pagination
→ existing HTML renderer
→ Chromium PDF / print acceptance
```

The pre-P01D1 router and validator chains remain the complete authority for all other sources.

## Numeric boundary

```text
minimum large number = 100,000,000
maximum large number = 999,999,999,999,999
section units        = 萬 / 億 / 兆
integer requirement  = Number.isSafeInteger
```

Chinese-number conversion must round-trip deterministically across all admitted section units.

## Public product gate

P01D1 closes only when all of the following pass:

```text
public source option present
4/4 visible KnowledgePoints
4/4 PatternGroups
8/8 PatternSpecs
source-unit generation covers all 8 PatternSpecs
single-KP selection works for all 4 KPs
all generated answers pass deterministic validation
tampered answer fails closed
worksheet question count equals requested count
answer-key item count equals question count
HTML contains question and answer-key pages
Chromium produces non-empty PDF
no page overflow findings
P01A inventory reports 4 admitted / 17 remaining
full Node regression passes
milestone claim integrity passes
```

## Hard boundaries

```text
application story generation = forbidden
free-form AI generation       = forbidden
new worksheet planner         = forbidden
new renderer                   = forbidden
new PDF pipeline               = forbidden
W2-W8 implementation          = forbidden
recursive-improvement admin    = forbidden before P10
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_W1_21_VERTICAL_SLICES_REQUIRED
GOAL_DISTANCE_AFTER  = D2_W1_4_ADMITTED_17_REMAINING
NEXT_SHORTEST_STEP   = P01D2_G6AU01NumberTheoryVerticalSlice
```
