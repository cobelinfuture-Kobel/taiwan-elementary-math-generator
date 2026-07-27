# P03F W3 Direct Product Vertical Slice 002 Contract

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice002Implementation
QUEUE      = p03e_q002_r5_g3a_u08_3a08_profile_fraction_c1
TARGET     = E6_D0_COMPLETE
```

## Atomic frozen scope

```text
source = g3a_u08_3a08
rank   = 5
profile= profile_fraction
KnowledgePoints =
  kp_g3a_u08_discrete_set_fraction
  kp_g3a_u08_unit_fraction_accumulation
```

The two KnowledgePoints are one P03E queue slice and must not be split into separate milestones.

## Product surface

```text
PatternGroups        = 4
numeric PatternSpecs = 3
application specs    = 3
Global Context binds = 3
question witnesses   = 12
answer-key witnesses = 12
HTML witnesses       = 2
PDF witnesses        = 2 after Chromium acceptance
```

Numeric and application output must use the shared planner, shared operation-family generator, deterministic validator, WorksheetDocument, answer key and production HTML renderer. Application questions must retain W02 binding IDs and Global Context lineage for health/sports activity supplies, ancient trade and household chores. A unit-specific story engine is forbidden.

## Mathematical invariants

- `1 <= numerator < denominator` for the fraction component in this slice.
- Unit-fraction accumulation keeps the denominator fixed and makes the numerator equal to the accumulated unit-fraction count.
- Discrete item-count generation requires `numerator * itemsPerWhole` divisible by `denominator`.
- Both discrete conversion directions preserve total quantity.
- `itemsPerWhole`, `wholeUnits`, numerator and denominator keep distinct semantic roles.
- `kp_g3a_u08_whole_as_fraction` remains excluded.

## Admission gate

E6 requires exact queue and predecessor proof, 2/2 KPs, 4/4 groups, 6/6 PatternSpecs, 3/3 Global Context records, both W3 fraction capabilities, current Classic and Pixel selection, 12/12 generated/validated questions, 12/12 answer-key items, two committed HTML files, two Chromium A4 PDFs, zero overflow, committed SHA256 values and visual semantic review.

Before the artifact gate passes:

```text
productAdmissionState = PRODUCT_ACCEPTANCE_PENDING
newProductAdmissionCount = 0
queuePositionConsumed = 1
slice003 started = false
```

After E6:

```text
productAdmissionState = PRODUCTION_ADMITTED_D0
newProductAdmissionCount = 2
remaining direct slices = 51
remaining direct W3 KPs = 79
```
