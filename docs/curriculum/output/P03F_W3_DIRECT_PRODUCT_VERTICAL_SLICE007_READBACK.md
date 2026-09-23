# P03F W3 Direct Product Vertical Slice 007 Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice007Implementation
STATUS     = PASS_CI_SYNCED_AND_MERGED
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

## Final exact-head and merge evidence

```text
final accepted head       = 9b25ce4aaf160cea5b9bccde36b12b5dc592b9c4
final Node workflow       = 30336698801 SUCCESS
final Chromium workflow   = 30336698786 SUCCESS
final Chromium artifact   = 8679426290
final artifact digest     = sha256:d119402f82176b8c540a56b9012ed3b6a46885dc1b66ec67ebb3f9fb3a9036b1
implementation PR         = #421
merge SHA                 = 6868a53a23ce79aef26f141d9a115b9db4f19303
merged at                 = 2026-07-28T07:04:22Z
all governance/layout CI  = PASS
```

```text
GOAL_DISTANCE_BEFORE = D1_W3_DIRECT_PRODUCT_SLICE006_D0_MERGED
GOAL_DISTANCE_AFTER  = D1_W3_DIRECT_PRODUCT_SLICE007_D0_MERGED
DISTANCE_REDUCED     = Queue position 7 moved from unimplemented to a merged D0 product slice with complete source-to-product lineage and exact production evidence.
REMAINING_BLOCKERS   = [46 direct slices, 74 direct KnowledgePoints, 33 later-wave dependents]
NEXT_SHORTEST_STEP   = P03F_W3DirectProductVerticalSlice008Implementation
slice008 started     = false
```
