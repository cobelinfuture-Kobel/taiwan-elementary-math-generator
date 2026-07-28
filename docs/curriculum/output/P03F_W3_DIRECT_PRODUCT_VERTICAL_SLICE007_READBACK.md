# P03F W3 Direct Product Vertical Slice 007 Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice007Implementation
STATUS     = PASS_CI_ACCEPTED_PENDING_MERGE
EVIDENCE   = E6_D0_COMPLETE
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

## D0 product evidence

```text
required W3 capabilities         = 2 / 2 PASS
numeric PatternSpecs             = 2 / 2 PASS
application PatternSpecs         = 2 / 2 PASS
numeric questions / answers      = 6 / 6 PASS
application questions / answers  = 6 / 6 PASS
production HTML / PDF            = 2 / 2 COMMITTED
physical PDF pages               = 4
artifact SHA256 gate             = PASS
visual semantic review           = PASS
product admission                = PRODUCTION_ADMITTED_D0
full Node regression             = 2526 / 2526 PASS
```

The numeric and application paths independently cover `itemCount` and `fractionalUnits`. Every witness preserves `itemCount x denominator = numerator x itemsPerWhole`; application prompts preserve box, items-per-box and fractional-box roles through the W02 classroom shared-resource binding.

## Committed hashes

```text
numeric HTML SHA256     = d7e0ed76daf9aece34062d15e8e524f7e36cce822584a7ef14def88bff6718fe
numeric PDF SHA256      = a1d0b3ab8af0ec205d3a08ea6c74d5c6ed5f02c93f8e81619801652b8cdc188a
application HTML SHA256 = f02c448453b0ffb87b0b8f3101303bc034a3fa878e1ac4af994219ef3f487c1a
application PDF SHA256  = 8722c06103bb7547033201a26ae9049a64395eb3a6d78686fdd355c0eaff1e12
```

## Exact-head acceptance

```text
accepted head             = c8e93a0cfdde4115900d5bb0d81abe29d74539de
Node workflow run         = 30336004018 SUCCESS
Chromium workflow run     = 30336004034 SUCCESS
Chromium artifact         = 8679148712
Chromium artifact digest  = sha256:2809762a79d4fa7ff234519e57078b7a18635eca5432a7a711b37f8ca03fb5b2
GLM-S03 contract/shards    = PASS
GLM-S01/S02/S05/S06/S07   = PASS
POSTG / GCTX governance    = PASS
```

```text
GOAL_DISTANCE_BEFORE = D1_W3_DIRECT_PRODUCT_SLICE006_D0_MERGED
GOAL_DISTANCE_AFTER  = D1_W3_DIRECT_PRODUCT_SLICE007_D0_CI_ACCEPTED_PENDING_MERGE
DISTANCE_REDUCED     = Queue position 7 now has a complete source-to-product lineage, reviewed hash-bound HTML/PDF, exact-head full regression and Chromium evidence.
REMAINING_BLOCKERS   = [PR merge, post-merge authority sync]
NEXT_SHORTEST_STEP   = P03F7_MergeAndPostMergeAuthoritySync
slice008 started     = false
```
