# P03F W3 Direct Product Vertical Slice 001 Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice001Implementation
STATUS     = D0_IMPLEMENTED_PENDING_CLEAN_HEAD_CI
EVIDENCE   = E6_D0_COMPLETE
```

## Exact slice

```text
queue position       = 1
slice id             = p03e_q001_r4_g3a_u08_3a08_profile_fraction_c1
source node           = g3a_u08_3a08
KnowledgePoint        = kp_g3a_u08_part_whole_fraction
PatternGroup          = pg_g3a_u08_part_whole_fraction_numeric
PatternSpec           = ps_g3a_u08_part_whole_fraction_fraction_numeric
application class     = APPLICATION_NOT_APPLICABLE
magnitude boundary    = 0 < numerator < denominator
excluded KnowledgePoint = kp_g3a_u08_whole_as_fraction
```

## Product nodes

```text
source evidence                    = BOUND
KnowledgePoint identity            = PRESERVED
Tag Registry binding               = 8 tags
FormalMapping                      = 1
PatternGroup                       = 1
PatternSpec successor              = 1
representation modes               = 2
shared generator                   = CONNECTED
browser deterministic validator    = CONNECTED
fraction number system             = CONNECTED
fraction domain validator          = CONNECTED
current public source adapter      = CONNECTED
current Classic / Pixel selection = CONNECTED
WorksheetDocument / answer key     = CONNECTED
production HTML                    = VERIFIED_AND_COMMITTED
Chromium PDF / print               = VERIFIED_AND_COMMITTED
artifact SHA256 gate               = CONNECTED
visual semantic review             = PASS
product admission                  = PRODUCTION_ADMITTED_D0
```

The single PatternSpec rotates deterministically between continuous equal partitions and discrete-set partitions. It does not create a second semantic identity, does not add application stories, and does not emit whole-as-fraction cases.

## Historical/current authority boundary

```text
P01E historical full-product fleet = 19 sources
current P03F public fleet           = 20 sources
historical P02/P03 inventories      = unchanged
```

The current Classic and Pixel surfaces use an explicit successor authority. Historical inventories remain reproducible and are not silently rewritten by the new product admission.

## Proper-fraction witnesses

```text
8/12
1/6
2/5
2/3
4/6
1/10
3/4
1/3
```

```text
whole-as-fraction findings = 0
overflow findings          = 0
clipping findings          = 0
overlap findings           = 0
broken glyph findings      = 0
```

## Committed output evidence

```text
HTML = docs/curriculum/output/p03f-slice001-product-admission/g3a-u08-part-whole-fraction.html
PDF  = docs/curriculum/output/p03f-slice001-product-admission/g3a-u08-part-whole-fraction.pdf
REPORT = docs/curriculum/output/p03f-slice001-product-admission/p03f-slice001-product-acceptance-report.json

HTML SHA256 = 9ff68a4f47f171227f521e9b0a4a099a8bdf0c5ac76c90a91a6fe8a8f2c6902e
PDF SHA256  = 4b0a02a89eec3148906db6629f63d0d2691ad121783160788742de4fc50e4362
```

## Verified acceptance before final E6 head

```text
full Node regression                  = 2477 / 2477 PASS
Node / Chromium run                   = 30242175844 SUCCESS
Chromium artifact                     = 8643701825
Chromium artifact digest              = sha256:b24656a6bab280542064a714cad6e50786158b389b50a1f7b8a0c7fe58a8d429
artifact materialization run          = 30243053389
queue identity                        = PASS
source / KP / tags / mapping          = PASS
PatternSpec successor parity          = PASS
proper-fraction scope                 = PASS
whole-as-fraction exclusion           = PASS
W3 capability bindings                = PASS
current public selector and controls  = PASS
worksheet and answer key              = 8 / 8 PASS
production HTML                       = PASS
Chromium PDF                           = PASS
question pages                         = 1
answer pages                           = 1
committed artifact hashes             = PASS
visual semantic review                = PASS
```

The exact final E6 head must repeat the full Node, governance and Chromium gates before merge.

## Admission effect

```text
new product admissions       = 1
remaining direct slices      = 52
remaining direct W3 KPs      = 81
later-wave dependent rows    = 33 unchanged
slice 002 started            = false
other G3A-U08 KPs admitted   = 0
application stories added    = 0
parallel product pipelines   = 0
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_W3_DIRECT_PRODUCT_EXECUTION_QUEUE_FROZEN
GOAL_DISTANCE_AFTER  = D1_W3_DIRECT_PRODUCT_SLICE001_D0_COMPLETE
DISTANCE_REDUCED     = The first frozen W3 direct-product slice is production admitted through the complete source-to-PDF pipeline with committed hashes, proper-fraction scope protection and visual semantic review.
REMAINING_BLOCKERS   = [52 direct-product slices have not yet reached D0, 33 later-wave dependent rows remain owned by later waves]
NEXT_SHORTEST_STEP   = P03F_W3DirectProductVerticalSlice002Implementation
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
