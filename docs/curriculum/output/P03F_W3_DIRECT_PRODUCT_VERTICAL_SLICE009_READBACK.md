# P03F W3 Direct Product Vertical Slice 009 Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice009Implementation
STATUS     = PRODUCTION_ARTIFACT_REVIEWED_PENDING_EXACT_HEAD_CI
EVIDENCE   = E5_PRODUCTION_ADMITTED
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

## Reviewed product evidence

```text
Tag Registry bindings           = 8
FormalMappings                  = 1
question / answer witnesses     = 8 / 8 PASS
direction allocation            = 4 fraction→decimal / 4 decimal→fraction
fraction number system          = CONNECTED
fraction domain validator       = CONNECTED
Classic / Pixel visible KPs     = 4 / 4
HTML / Chromium PDF             = COMMITTED / COMMITTED
physical PDF pages              = 2
overflow / duplicate / semantic = 0 / 0 / 0
visual clipping / overlap / glyph = 0 / 0 / 0
HTML SHA256 = 2237a184c307d14d1b94639dd69610a727f09595bc12ff41b3d27e75812fa87f
PDF SHA256  = f2e0c0b2a7d63e4d36a60632f765930da7c6ff41bc9e0f2495011120d319ea97
materialization commit = d57d15439cf5ec74c610d74ca7460d911bdf9d38
materialization run    = 30358679360
reviewed artifact      = 8687908951
production admission   = E5_PRODUCTION_ADMITTED
```

The public worksheet preserves denominator 10 for every fraction answer. Internal fraction capability consumers may normalize rational identity, but the learner-facing answer remains `n/10`. Decimal values retain exactly one decimal place.

## Admission effect

```text
new product admissions       = 1
cumulative W3 admissions     = 11
remaining direct slices      = 44
remaining direct W3 KPs      = 71
later-wave dependent rows    = 33 unchanged
slice010 started             = false
parallel product pipelines   = 0
```

```text
GOAL_DISTANCE_BEFORE = D1_W3_DIRECT_PRODUCT_SLICE008_D0_MERGED
GOAL_DISTANCE_AFTER  = D1_W3_DIRECT_PRODUCT_SLICE009_E5_PENDING_EXACT_HEAD_CI
DISTANCE_REDUCED     = Queue position 9 now has one reviewed production artifact pair, exact binary hashes, shared capability evidence, and a fail-closed E5 admission authority.
REMAINING_BLOCKERS   = [exact-head full regression, exact-head Chromium gate, PR merge, E6 metadata closeout]
NEXT_SHORTEST_STEP   = P03F9_ExactHeadCIAndMerge
slice010 started     = false
```
