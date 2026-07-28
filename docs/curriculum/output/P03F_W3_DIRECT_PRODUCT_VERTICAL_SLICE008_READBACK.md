# P03F W3 Direct Product Vertical Slice 008 Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice008Implementation
STATUS     = RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE
EVIDENCE   = E3_SHADOW_RUNTIME_INTEGRATED
```

## Frozen slice

```text
queue position = 8
slice ID       = p03e_q008_r6_g3b_u09_3b09_profile_decimal_c1
source         = g3b_u09_3b09
KnowledgePoints =
  kp_g3b_u09_decimal_read_write
  kp_g3b_u09_decimal_compose_decompose
PatternGroups  = 2
PatternSpecs   = 2
numeric/application = NUMERIC_ONLY
```

## Current product path

```text
source evidence                    = BOUND
Tag Registry bindings              = 16
FormalMappings                     = 2
numeric PatternSpecs               = 2
shared generator                   = CONNECTED
shared deterministic validator     = CONNECTED
decimal number system              = CONNECTED
decimal domain validator           = CONNECTED
Classic/Pixel selection            = CONNECTED
current G3B-U09 visible/hidden KPs  = 3 / 4
question allocation                = 4 read/write + 4 compose/decompose
WorksheetDocument/answer key       = 8 / 8 EXPECTED
production HTML                    = RUNTIME_READY
Chromium PDF                       = PENDING
visual semantic review             = PENDING
product admission                  = FAIL_CLOSED_PENDING_ARTIFACT
```

The read/write path preserves `decimalText = encodePlaceValue(digitsByPlace)`. The compose/decompose path preserves `decimal = whole + fractionalUnits × 0.1`. Both paths remain numeric-only; application mode and Global Context are not applicable.

```text
GOAL_DISTANCE_BEFORE = D1_W3_DIRECT_PRODUCT_SLICE007_D0_MERGED
GOAL_DISTANCE_AFTER  = D1_W3_DIRECT_PRODUCT_SLICE008_RUNTIME_CONNECTED_PENDING_ARTIFACT
DISTANCE_REDUCED     = Queue position 8 now carries both source-backed KnowledgePoints through shared selector, generator, validator and worksheet paths while production admission remains fail closed.
REMAINING_BLOCKERS   = [focused/full CI, Chromium HTML/PDF, visual review, committed hashes, exact-head CI, PR merge]
NEXT_SHORTEST_STEP   = P03F8_ChromiumArtifactMaterializationAndReview
slice009 started     = false
```
