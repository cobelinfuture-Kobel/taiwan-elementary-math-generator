# P03F W3 Direct Product Vertical Slice 008 Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice008Implementation
STATUS     = PASS_CI_SYNCED_AND_MERGED
EVIDENCE   = E6_D0_COMPLETE
```

## Frozen slice

```text
queue position  = 8
slice ID        = p03e_q008_r6_g3b_u09_3b09_profile_decimal_c1
source          = g3b_u09_3b09
KnowledgePoints = kp_g3b_u09_decimal_read_write
                  kp_g3b_u09_decimal_compose_decompose
PatternGroups   = 2
PatternSpecs    = 2
numeric/application = NUMERIC_ONLY
slice009 started = false
```

## Product nodes

```text
source evidence                 = BOUND
Tag Registry bindings           = 16
FormalMappings                  = 2
numeric PatternSpecs            = 2
application PatternSpecs        = 0
decimal number system           = CONNECTED
decimal domain validator        = CONNECTED
shared generator / validator    = CONNECTED / CONNECTED
current Classic / Pixel         = CONNECTED / CONNECTED
G3B-U09 visible / hidden KPs    = 3 / 4
questions / answer-key items    = 8 / 8 PASS
PatternSpec allocation          = 4 read-write / 4 compose-decompose
production HTML / PDF           = 1 / 1 COMMITTED
physical PDF pages              = 2
artifact SHA256 gate            = PASS
visual semantic review          = PASS
product admission               = PRODUCTION_ADMITTED_D0
```

## Capability and semantic acceptance

```text
required W3 capabilities        = 2 / 2 PASS
read/write invariant            = notation and spoken form preserve each place value
compose/decompose invariant     = decimal = whole + fractionalUnits × 0.1
canonical decimal scale         = exactly 1
question witnesses              = 8
duplicate prompts               = 0
overflow findings               = 0
clipping findings               = 0
overlap findings                = 0
broken glyph findings           = 0
semantic findings               = 0
application / Global Context    = NOT_APPLICABLE / NOT_APPLICABLE
```

## Committed output evidence

```text
HTML = docs/curriculum/output/p03f-slice008-product-admission/g3b-u09-decimal-read-write-compose.html
PDF  = docs/curriculum/output/p03f-slice008-product-admission/g3b-u09-decimal-read-write-compose.pdf
report = docs/curriculum/output/p03f-slice008-product-admission/p03f-slice008-product-acceptance-report.json

HTML SHA256 = c138b45d8d0fa9ab44ba9f8a5967af9fd6afbed8ba315e7d3b59620c1e0afbee
PDF SHA256  = b8d2091bf52fad35bebfa09d843166d73ded4ce9b79dbc9f3be1750d881c3a2e
```

## Final exact-head acceptance and merge

```text
implementation PR               = #422
implementation head             = 6ffb1cb08f7d8c41043a6c379b1cb9f1efa7e982
implementation merge SHA        = 2ceaeb25c742e5d13c1f3a1d0759d276b3e2ce36
implementation merged at        = 2026-07-28T09:41:20Z
artifact materialization commit = e58400c264e7ef65bc644aae1f2a8d8f5d8bf0aa
artifact materialization run    = 30346166856
final exact head                = 6ffb1cb08f7d8c41043a6c379b1cb9f1efa7e982
final Node run                  = 30346970226 SUCCESS
final Chromium run              = 30346970242 SUCCESS
final Chromium artifact         = 8683306994
final artifact digest           = sha256:f738fd3534aa5dd1e15b930c9406883bee9b6766007609acd231507dac933ee4
full Node regression            = 2535 / 2535 PASS
questions                       = 8 / 8 PASS
answer-key items                = 8 / 8 PASS
physical page parity            = PASS
visual semantic review          = PASS
artifact / committed hash parity = PASS
required governance workflows   = PASS
```

## Admission effect

```text
new product admissions       = 2
cumulative W3 admissions     = 10
remaining direct slices      = 45
remaining direct W3 KPs      = 72
later-wave dependent rows    = 33 unchanged
slice009 started             = false
other G3B-U09 KPs admitted   = 0
application story engines    = 0
parallel product pipelines   = 0
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_W3_DIRECT_PRODUCT_SLICE007_D0_MERGED
GOAL_DISTANCE_AFTER  = D1_W3_DIRECT_PRODUCT_SLICE008_D0_MERGED
DISTANCE_REDUCED     = Frozen queue position 8 moved from an unimplemented queue row to two merged D0 decimal products through source evidence, exact W3 capabilities, shared runtime, committed reviewed HTML/PDF and exact-head CI.
REMAINING_BLOCKERS   = [45 direct-product slices have not yet reached D0, 72 direct W3 KnowledgePoints remain, 33 later-wave dependent rows remain owned by later waves]
NEXT_SHORTEST_STEP   = P03F_W3DirectProductVerticalSlice009Implementation
```

## Task closeout

```text
1. Distance segment shortened = W3 direct-product queue position 8 moved from frozen-only to merged E6 D0.
2. System nodes advanced       = two KnowledgePoints, Tag Registry, two FormalMappings, two PatternSpecs, decimal W3 capabilities, shared Generator/Validator, Classic/Pixel selector, Worksheet and HTML/PDF renderer.
3. Blocker removed             = queue position 8 runtime, artifact, visual, hash, exact-head CI and merge blockers.
4. New blocker added           = none.
5. Next shortest valid step    = P03F_W3DirectProductVerticalSlice009Implementation.
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
