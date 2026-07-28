# P03F W3 Direct Product Vertical Slice 007 Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice007Implementation
STATUS     = ARTIFACT_REVIEWED_PENDING_EXACT_HEAD_CI
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## Frozen slice

```text
queue position = 7
slice ID       = p03e_q007_r6_g3b_u07_3b07_profile_fraction_c1
source         = g3b_u07_3b07
KnowledgePoint = kp_g3b_u07_fraction_unit_conversion
PatternGroups  = 2
PatternSpecs   = 4
numeric/application = SEPARATE
```

## E5 product evidence

```text
required W3 capabilities        = 2 / 2 PASS
numeric PatternSpecs            = 2 / 2 PASS
application PatternSpecs        = 2 / 2 PASS
numeric questions / answers     = 6 / 6 PASS
application questions / answers = 6 / 6 PASS
production HTML / PDF           = 2 / 2 COMMITTED
physical PDF pages              = 4
artifact SHA256 gate            = PASS
visual semantic review          = PASS
product admission               = PRODUCTION_ADMITTED_D0
```

The numeric and application paths independently cover `itemCount` and `fractionalUnits`. Every witness preserves `itemCount x denominator = numerator x itemsPerWhole`; application prompts preserve box, items-per-box and fractional-box roles through the W02 classroom shared-resource binding.

## Committed hashes

```text
numeric HTML SHA256     = d7e0ed76daf9aece34062d15e8e524f7e36cce822584a7ef14def88bff6718fe
numeric PDF SHA256      = a1d0b3ab8af0ec205d3a08ea6c74d5c6ed5f02c93f8e81619801652b8cdc188a
application HTML SHA256 = f02c448453b0ffb87b0b8f3101303bc034a3fa878e1ac4af994219ef3f487c1a
application PDF SHA256  = 8722c06103bb7547033201a26ae9049a64395eb3a6d78686fdd355c0eaff1e12
```

## Pre-D0 acceptance

```text
pre-D0 head              = 06faaf2f1d162e7a04dc3cfabf9fe2f99f46d13f
pre-D0 Node run          = 30334086938 SUCCESS
pre-D0 Chromium run      = 30334086957 SUCCESS
pre-D0 Chromium artifact = 8678472303
full Node regression     = 2526 / 2526 PASS
```

```text
GOAL_DISTANCE_BEFORE = D1_W3_DIRECT_PRODUCT_SLICE006_D0_MERGED
GOAL_DISTANCE_AFTER  = D1_W3_DIRECT_PRODUCT_SLICE007_D0_ARTIFACT_REVIEWED_PENDING_EXACT_HEAD_CI
DISTANCE_REDUCED     = Queue position 7 now has committed reviewed numeric/application HTML/PDF and hash-bound product admission.
REMAINING_BLOCKERS   = [exact-head CI, E6 closeout metadata, PR merge]
NEXT_SHORTEST_STEP   = P03F7_ExactHeadCIAndD0Closeout
slice008 started     = false
```
