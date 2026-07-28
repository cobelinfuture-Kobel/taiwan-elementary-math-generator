# P03F W3 Direct Product Vertical Slice 009 Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice009Implementation
STATUS     = RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE
EVIDENCE   = E3_SHADOW_RUNTIME_INTEGRATED
```

## Frozen slice

```text
queue position = 9
slice ID       = p03e_q009_r6_g3b_u09_3b09_profile_fraction_c1
source         = g3b_u09_3b09
KnowledgePoint = kp_g3b_u09_tenths_fraction_decimal
PatternGroups  = 1
PatternSpecs   = 1
numeric/application = NUMERIC_ONLY
slice010 started = false
```

## Current product path

```text
source evidence                    = BOUND
Tag Registry bindings              = 8
FormalMappings                     = 1
numeric PatternSpecs               = 1
shared generator                   = CONNECTED
shared deterministic validator     = CONNECTED
fraction number system             = CONNECTED
fraction domain validator          = CONNECTED
Classic / Pixel selection          = CONNECTED
current G3B-U09 visible/hidden KPs = 4 / 3
question allocation                = 4 fraction→decimal + 4 decimal→fraction
WorksheetDocument / answer key     = 8 / 8 EXPECTED
production HTML                    = RUNTIME_READY
Chromium PDF                       = PENDING
visual semantic review             = PENDING
product admission                  = FAIL_CLOSED_PENDING_ARTIFACT
```

The public source representation preserves denominator 10, while the fraction number-system consumer may use a reduced rational form internally. Every decimal witness has exactly one decimal place. Application mode, Global Context, decimal arithmetic and generic fallback remain prohibited.

```text
GOAL_DISTANCE_BEFORE = D1_W3_DIRECT_PRODUCT_SLICE008_D0_MERGED
GOAL_DISTANCE_AFTER  = D1_W3_DIRECT_PRODUCT_SLICE009_RUNTIME_CONNECTED_PENDING_ARTIFACT
DISTANCE_REDUCED     = Queue position 9 now carries its source-backed KnowledgePoint through shared selector, generator, validator, fraction capabilities and worksheet paths while production admission remains fail closed.
REMAINING_BLOCKERS   = [focused/full CI, Chromium HTML/PDF, visual review, committed hashes, exact-head CI, PR merge]
NEXT_SHORTEST_STEP   = P03F9_ChromiumArtifactMaterializationAndReview
slice010 started     = false
```
