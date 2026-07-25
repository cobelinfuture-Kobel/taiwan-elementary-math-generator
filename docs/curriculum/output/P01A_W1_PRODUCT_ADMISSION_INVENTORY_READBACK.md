# P01A W1 Product Admission Inventory Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P01A_W1ProductAdmissionInventoryAndGapMatrix
STATUS = PASS_PARTIAL_W1_PRODUCT_ADMISSION_PENDING_P01D2_CI
```

## Current executable result

```text
R05-W1 KnowledgePoints                         = 21
source nodes                                  = 4
all required capabilities production-admitted = 21
shadow capability gaps                        = 0
contract-only capability gaps                 = 0
full-product KnowledgePoints visible          = 9
full-product Pattern bindings present          = 9
full-product source authorities                = 2
existing public-pattern admissions ready       = 9
partial PatternGroup / PatternSpec gaps         = 0
full public vertical slices required            = 12
inventory direct admission count                = 0
```

Production admission evidence for the nine visible rows is owned by P01D1 and P01D2. P01A remains the dynamic inventory authority and never claims direct production admission.

## Source clusters

| Source node | KnowledgePoints | Current product state |
|---|---:|---|
| `g5b_u05_5b05a` | 4 | runtime/worksheet/HTML/PDF slice admitted by P01D1 |
| `g6a_u01_6a01` | 5 | runtime/worksheet/HTML/PDF slice admitted by P01D2 |
| `g5a_u03_5a03a` | 7 | full vertical slice required |
| `g5a_u03_5a03a1` | 5 | full vertical slice required |

The two G5A-U03 source nodes form one 12-KP factor/multiple product cluster.

## Admitted rows

### P01D1 — G5B-U05

```text
kp_g5b_u05a_large_number_place_value_extension
kp_g5b_u05a_large_number_read_write
kp_g5b_u05a_power_of_ten_scaling
kp_g5b_u05a_large_number_decompose_compare
```

### P01D2 — G6A-U01

```text
kp_g6a_u01_prime_composite_classification
kp_g6a_u01_prime_factorization
kp_g6a_u01_short_division_common_factors
kp_g6a_u01_greatest_common_factor
kp_g6a_u01_least_common_multiple
```

Each admitted row now has:

```text
canonical KP
→ FormalMapping
→ visible full-product PatternGroup
→ two executable PatternSpecs
→ shared deterministic runtime and validator
→ WorksheetDocument and answer key
→ HTML and Chromium PDF acceptance
```

Public Classic source-dropdown cutover remains deferred to `P01E_W1PublicUIHTMLPDFPrintCloseout`.

## Removed false W1 row

```text
knowledgePointId = kp_g4a_u07_quantity_multiplicative_pattern
canonicalNameZh  = 倍數型數量規律
correct profile  = profile_pattern_relation
correct wave     = R05-W6
```

P01A1 corrected the semantic collision between factor/multiple vocabulary and explicit pattern-relation semantics. P01D1/P01D2 do not reverse or bypass that correction.

## Remaining implementation order

```text
P01D1 g5b_u05_5b05a large-number extension           = 4 KP admitted and merged
P01D2 g6a_u01_6a01 number theory                      = 5 KP pending final CI/merge
P01D3 g5a_u03_5a03a + 5a03a1 factor/multiple         = 12 KP next
P01E  W1 public UI / HTML / PDF / print closeout      = after all 21 KP admitted
```

## Inventory boundary

```text
existing protected 15-unit fleet changed = false
protected Batch A baseline count          = 13
protected public fleet count              = 15
full-product source authority count       = 17
public dropdown changed                   = false
W2–W8 implementation started             = false
recursive-improvement admin               = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_W1_4_ADMITTED_17_REMAINING
GOAL_DISTANCE_AFTER  = D2_W1_9_ADMITTED_12_REMAINING
DISTANCE_REDUCED     = Five G6A-U01 W1 KnowledgePoints gain complete deterministic number-theory, worksheet, HTML and PDF paths; the remaining W1 product gap falls from 17 to 12.
REMAINING_BLOCKERS   = [12 W1 factor/multiple KPs, W1 final UI closeout, W2-W8 delivery, P09 79-source UI, P10 full closeout]
NEXT_SHORTEST_STEP   = P01D3_G5AU03FactorMultipleVerticalSlice
```
