# P03F W3 Direct Product Vertical Slice 009 Final Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice009Implementation
STATUS     = PASS_CI_SYNCED_AND_MERGED
EVIDENCE   = E6_D0_COMPLETE
```

## Frozen slice and product nodes

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

```text
question / answer witnesses = 8 / 8
fraction→decimal            = 4
decimal→fraction            = 4
public denominator          = 10 preserved
decimal scale               = exactly 1
cap_fraction_number_system  = CONNECTED
cap_fraction_domain_validator = CONNECTED
Classic / Pixel visible KPs = 4 / 4
remaining hidden G3B-U09 KPs = 3
```

## Reviewed artifacts

```text
HTML = docs/curriculum/output/p03f-slice009-product-admission/g3b-u09-tenths-fraction-decimal.html
PDF  = docs/curriculum/output/p03f-slice009-product-admission/g3b-u09-tenths-fraction-decimal.pdf
HTML SHA256 = 2237a184c307d14d1b94639dd69610a727f09595bc12ff41b3d27e75812fa87f
PDF SHA256  = f2e0c0b2a7d63e4d36a60632f765930da7c6ff41bc9e0f2495011120d319ea97
physical pages = 2
clipping / overlap / glyph / semantic findings = 0 / 0 / 0 / 0
reviewed artifact = 8687908951
```

## Exact-head CI and merge

```text
implementation head = 82ba1270cff7b1940f4dbe2d241d67e5364573c5
Node run           = 30360835962
Node tests         = 2542 / 2542 PASS
Chromium run       = 30360836160
Chromium artifact  = 8688769099
artifact digest    = sha256:7ae0badadae769ff799936433820211f406a64f576e05810b36b95759539a7ba
PR                  = #424
merge SHA           = 5ebf9a2f451bfdb4b377f1e82ccc7b06907735ca
merged at           = 2026-07-28T12:56:31Z
all applicable workflows = PASS
```

## Admission effect

```text
new product admissions       = 1
cumulative W3 admissions     = 11
remaining direct slices      = 44
remaining direct W3 KPs      = 71
later-wave dependent rows    = 33 unchanged
other G3B-U09 KPs admitted   = 0
application stories added    = 0
parallel product pipelines   = 0
slice010 started             = false
```

```text
GOAL_DISTANCE_BEFORE = D1_W3_DIRECT_PRODUCT_SLICE008_D0_MERGED
GOAL_DISTANCE_AFTER  = D1_W3_DIRECT_PRODUCT_SLICE009_D0_MERGED
DISTANCE_REDUCED     = One direct-product queue slice moved from frozen authority to reviewed, validated, printable and merged D0 product capability.
REMAINING_BLOCKERS   = [44 direct-product slices not D0, 33 later-wave dependent rows]
NEXT_SHORTEST_STEP   = P03F_W3DirectProductVerticalSlice010Implementation
NEXT_STEP_REQUIRES_SEPARATE_APPROVAL = true
```
