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
effective dependent KPs = 2
operation descriptors   = 2
binding rule            = exactly one descriptor per dependent KP
quantity identity       = required from P02C
```

## Runtime lineage

```text
P02 exact capability cohort
→ P02B Global source / KP authority
→ P02C quantity identity
→ optional P02E semantic-role trace
→ deterministic quantity × integer execution
→ exact input-unit preservation
→ fail-closed validator
→ P02F successor promotion registry
```

## Arithmetic boundary

```text
quantity values           = non-negative safe integers only
integer multipliers       = non-negative safe integers only
result values             = non-negative safe integers only
zero                       = allowed
unit conversion            = false
mixed-unit normalization   = false
cross-dimension arithmetic = false
story / question generation = false
```

## Acceptance pending exact-head CI

- exact two-KP cohort materializes without descriptor errors;
- every canonical source/KP pair round-trips;
- every canonical P02C unit executes and remains unchanged;
- deterministic result values are correct;
- zero multiplier is accepted;
- negative, fractional, unknown-unit and overflow requests fail closed;
- wrong operation family and changed result unit fail closed;
- P02B-P02E promotions remain effective;
- exactly one new P02F promotion is added;
- no W2 shadow foundation remains;
- full Node regression passes;
- Chromium correctly skips.

## Product boundary

```text
unit conversion          = false
mixed-unit normalization = false
story templates          = false
PatternSpec / generator  = false
worksheet / renderer     = false
public UI                = false
existing 19-source product = preserved
P03-P08                  = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_QUANTITY_SEMANTIC_ROLE_BINDING_PRODUCTION_ADMITTED
GOAL_DISTANCE_AFTER  = D1_ALL_FIVE_W2_FOUNDATIONS_IMPLEMENTED_PENDING_CI
DISTANCE_REDUCED     = The final W2 shared foundation now has a production-intended deterministic same-unit quantity-times-integer consumer for the exact two-KP cohort, pending exact-head verification.
REMAINING_BLOCKERS   = [exact-head CI, W2 downstream unblock matrix not yet reconciled]
NEXT_SHORTEST_STEP   = P02G_W2FiveFoundationProductionAdmissionCloseoutAndDownstreamUnblockMatrix
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
