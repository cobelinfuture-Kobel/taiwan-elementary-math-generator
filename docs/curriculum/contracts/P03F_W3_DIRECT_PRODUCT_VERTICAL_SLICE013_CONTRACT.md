# P03F W3 Direct Product Vertical Slice013 Contract

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice013Implementation
TARGET_EVIDENCE_LEVEL = E6_D0_COMPLETE
QUEUE_POSITION = 13
```

## Frozen identity

```text
SLICE_ID = p03e_q013_r6_g5a_u04_5a04_profile_fraction_c1
PREDECESSOR = p03e_q012_r6_g4b_u08_4b08_profile_fraction_c1
SOURCE = g5a_u04_5a04
KNOWLEDGE_POINT = kp_g5a_u04_expand_reduce_simplest
PROFILE = profile_fraction
RANK = 6
```

## Capability contract

```text
cap_fraction_arithmetic
cap_fraction_domain_validator
cap_fraction_number_system
```

The exact three-capability set is mandatory. No application, Global Context or future-wave capability may be added.

## Formal mapping

```text
operationModelId  = op_g5a_u04_expand_reduce_simplest
operationFamilyId = simplify_fraction
```

Canonical identities:

```text
commonFactor = gcd(numerator, denominator)
simplestNumerator = numerator / commonFactor
simplestDenominator = denominator / commonFactor
gcd(simplestNumerator, simplestDenominator) = 1
```

## Product surface

Exactly one new numeric PatternGroup and three numeric PatternSpecs are admitted:

```text
pg_g5a_u04_expand_reduce_simplest_numeric
ps_g5a_u04_expand_reduce_simplest_common_factor_numeric
ps_g5a_u04_expand_reduce_simplest_simplest_numerator_numeric
ps_g5a_u04_expand_reduce_simplest_simplest_denominator_numeric
```

Application mode is not applicable. No story template, Atomic Context Binding or Global Context family may be created.

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

## Public surface delta

```text
public source count: 25 → 26
G5A-U04 visible KP count: 0 → 1
G5A-U04 hidden pending count: 5 → 4
```

Only `kp_g5a_u04_expand_reduce_simplest` is admitted. The other G5A-U04 KnowledgePoints remain hidden.

## D0 gate

Slice013 is complete only after:

```text
authority complete
hidden PatternSpec parity complete
three fraction capability witnesses complete
public source and KP selection complete
9 deterministic unique questions
balanced 3 / 3 / 3 PatternSpec allocation
9 validated answers
shared worksheet and answer key complete
HTML committed
Chromium PDF committed
physical page parity verified
artifact hashes verified
visual review passed
full regression passed
required CI passed
implementation PR merged
post-merge E6 closeout merged
```

Until all conditions are satisfied:

```text
queuePositionConsumed = 12
slice013KnowledgePointAdmitted = false
nextQueuePositionStarted = false
```
