# P02F W2 Same-Unit Quantity Arithmetic Consumer Admission Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02F_W2SameUnitQuantityArithmeticConsumerAdmission
STATUS     = IMPLEMENTED_PENDING_EXACT_HEAD_CI
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## Target capability

```text
capability                 = cap_same_unit_quantity_arithmetic
historical R04 status      = shadow_available
effective successor status = production_admitted
consumer mode              = PRODUCTION_DETERMINISTIC_SAME_UNIT_QUANTITY_ARITHMETIC
operation family           = QUANTITY_TIMES_INTEGER
```

## Exact scope

```text
effective dependent KPs       = 2
expected dependent sources    = 3
expected source / KP bindings = 3
binding rule                  = exactly one descriptor per dependent KP
quantity identity             = required from P02C
semantic-role trace           = required from P02E
```

The exact cohort is:

```text
kp_fraction_times_integer_quantity
kp_mass_times_integer
```

## Runtime lineage

```text
P02 exact capability cohort
→ P02B Global source / KP authority
→ P02C quantity identity
→ P02E semantic-role trace
→ deterministic integer coefficient × integer multiplier
→ exact input-unit preservation
→ fail-closed validator
→ P02F successor promotion registry
```

## Arithmetic boundary

```text
quantity coefficients       = non-negative safe integers only
integer multipliers         = non-negative safe integers only
result coefficients         = non-negative safe integers only
zero                         = allowed
rational / mixed objects     = rejected
fraction parsing / reduction = false
unit conversion              = false
mixed-unit normalization     = false
cross-dimension arithmetic   = false
story / question generation  = false
```

For `kp_mass_times_integer`, the input unit must be one executable canonical P02C unit. For `kp_fraction_times_integer_quantity`, P02F requires a source node and an explicit source-declared quantity-unit ID. The unit is treated as an opaque identity; the generic `source_declared_unit` placeholder is not executable. P02F never parses numerator, denominator or mixed-number structure.

## Acceptance pending exact-head CI

- exact two-KP cohort materializes without descriptor errors;
- three source/KP bindings round-trip;
- four fixed canonical unit bindings execute without conversion;
- one source-declared descriptor requires explicit source and unit identity;
- both descriptors reject decimals and rational objects;
- deterministic integer results are correct and preserve exact units;
- negative, unknown-unit and overflow requests fail closed;
- wrong operation family and changed result unit fail closed;
- P02B-P02E promotions remain effective;
- exactly one new P02F promotion is added;
- no W2 shadow foundation remains;
- full Node regression passes;
- Chromium correctly skips.

## Product boundary

```text
fraction engine           = false
unit conversion           = false
mixed-unit normalization  = false
story templates           = false
PatternSpec / generator   = false
worksheet / renderer      = false
public UI                 = false
existing 19-source product = preserved
P03-P08                   = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_QUANTITY_SEMANTIC_ROLE_BINDING_PRODUCTION_ADMITTED
GOAL_DISTANCE_AFTER  = D1_ALL_FIVE_W2_FOUNDATIONS_IMPLEMENTED_PENDING_CI
DISTANCE_REDUCED     = The final W2 foundation now has a production-intended integer-coefficient same-unit quantity-times-integer consumer for the exact two-KP cohort, without absorbing fraction arithmetic or unit conversion.
REMAINING_BLOCKERS   = [exact-head CI, W2 downstream unblock matrix not yet reconciled]
NEXT_SHORTEST_STEP   = P02G_W2FiveFoundationProductionAdmissionCloseoutAndDownstreamUnblockMatrix
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
