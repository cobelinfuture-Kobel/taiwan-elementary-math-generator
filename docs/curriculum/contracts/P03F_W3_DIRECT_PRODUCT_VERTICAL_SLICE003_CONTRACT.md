# P03F W3 Direct Product Vertical Slice 003 Contract

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice003Implementation
QUEUE      = p03e_q003_r5_g3b_u07_3b07_profile_fraction_c1
TARGET     = E6_D0_COMPLETE
```

## Atomic frozen scope

```text
source = g3b_u07_3b07
rank   = 5
profile= profile_fraction
KnowledgePoint = kp_g3b_u07_quotient_as_fraction
```

No other G3B-U07 KnowledgePoint is admitted by this milestone.

## Product surface

```text
PatternGroups        = 1
numeric PatternSpecs = 1
application specs    = 0
question witnesses   = 8
answer-key witnesses = 8
HTML witnesses       = 1
PDF witnesses        = 1 after Chromium acceptance
```

The output must use the shared planner, operation-family generator contract, deterministic validator, WorksheetDocument, answer key and production HTML renderer. Global Context is not applicable because the source-backed KnowledgePoint is a direct symbolic relation between division and fraction notation.

## Mathematical invariants

- `dividend > 0` and `divisor > 0`.
- The ordered identity is `dividend ÷ divisor = dividend/divisor`.
- The dividend remains the numerator and the divisor remains the denominator.
- The fraction value must equal the original division result.
- Proper, improper and whole-number quotient identities may appear.
- Equivalent simplification may be recorded, but it cannot replace or reverse the ordered source identity in the answer witness.

## Admission gate

E6 requires exact queue and predecessor proof, 1/1 KP, 1/1 PatternGroup, 1/1 PatternSpec, both W3 fraction capabilities, current Classic and Pixel selection, 8/8 generated and validated questions, 8/8 answer-key items, one committed HTML file, one Chromium A4 PDF with two physical pages, zero duplicate prompts, zero overflow, committed SHA256 values and visual semantic review.

Before the artifact gate passes:

```text
productAdmissionState = PRODUCT_ACCEPTANCE_PENDING
newProductAdmissionCount = 0
queuePositionConsumed = 2
remaining direct slices = 51
remaining direct W3 KPs = 79
```

After E6:

```text
productAdmissionState = PRODUCTION_ADMITTED_D0
newProductAdmissionCount = 1
queuePositionConsumed = 3
remaining direct slices = 50
remaining direct W3 KPs = 78
```
