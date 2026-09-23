# P03F W3 Direct Product Vertical Slice012 Contract

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice012Implementation
TARGET_EVIDENCE_LEVEL = E6_D0_COMPLETE
QUEUE_POSITION = 12
```

## Frozen identity

```text
SLICE_ID = p03e_q012_r6_g4b_u08_4b08_profile_fraction_c1
PREDECESSOR = p03e_q011_r6_g4b_u06_4b06_profile_decimal_c1
SOURCE = g4b_u08_4b08
KNOWLEDGE_POINT = kp_g4b_u08_equivalence_cross_product
PROFILE = profile_fraction
RANK = 6
```

## Capability contract

```text
cap_fraction_arithmetic
cap_fraction_domain_validator
cap_fraction_number_system
```

All three capability IDs must be present exactly. No missing capability, future capability, Global Context capability or application capability may be added.

## Formal mapping

```text
operationModelId  = op_g4b_u08_equivalence_cross_product
operationFamilyId = cross_product_equivalence
requestedUnknownRole = equivalent
givenRoles =
- leftNumerator
- leftDenominator
- rightNumerator
- rightDenominator
answerType = boolean
```

Canonical identity:

```text
equivalent =
leftNumerator × rightDenominator
==
rightNumerator × leftDenominator
```

## Product surface

Exactly one new numeric PatternGroup and one new numeric PatternSpec are admitted:

```text
pg_g4b_u08_equivalence_cross_product_numeric
ps_g4b_u08_equivalence_cross_product_equivalent_numeric
```

Application mode is not applicable. No application story, Atomic Context Binding, Global Context family or template may be created.

## Shared runtime requirements

The slice must use the existing shared:

```text
browser planner
fraction number-system consumer
fraction domain validator
fraction arithmetic consumer
question router
worksheet assembler
answer-key assembler
HTML renderer
Chromium PDF print path
Classic selector
Pixel selector
```

No second generator, validator, worksheet or renderer pipeline is permitted.

## Same-source compatibility

`g4b_u08_4b08` is already public through Slice005.

```text
public source count remains 25
visible KP count for G4B-U08: 1 → 2
hidden pending count for G4B-U08: 6 → 5
```

Source-unit default generation must remain the Slice005 three-PatternSpec behavior. Slice012 activates only through an explicit new KnowledgePoint, PatternGroup or PatternSpec selection.

## D0 gate

Slice012 is complete only after:

```text
authority complete
PatternSpec parity complete
three capability witnesses complete
explicit public selection complete
8 unique deterministic questions
8 validated answers
shared worksheet and answer key complete
HTML committed
Chromium PDF committed
physical page parity verified
artifact hashes verified
visual review passed
full regression passed
required CI passed
PR merged
post-merge E6 closeout merged
```

Until those conditions are satisfied:

```text
queuePositionConsumed = 11
slice012KnowledgePointAdmitted = false
nextQueuePositionStarted = false
```
