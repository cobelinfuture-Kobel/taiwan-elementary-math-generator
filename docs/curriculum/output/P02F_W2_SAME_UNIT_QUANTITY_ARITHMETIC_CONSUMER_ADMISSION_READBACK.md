# P02F W2 Same-Unit Quantity Arithmetic Consumer Admission Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02F_W2SameUnitQuantityArithmeticConsumerAdmission
STATUS     = PASS_EXACT_HEAD_CI_READY_TO_MERGE
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
operation descriptors         = 2
dependent source nodes        = 3
source / KP bindings          = 3
semantic-role bindings        = 2
fixed canonical unit bindings = 4
source-declared descriptors   = 1
safe-integer descriptors      = 2
descriptor errors             = 0
effective W2 promotions       = 5
remaining W2 shadow           = 0
```

The exact cohort is:

```text
kp_fraction_times_integer_quantity
kp_mass_times_integer
```

Global authority readback confirms:

```text
kp_fraction_times_integer_quantity
= repeated equal quantities across length, width or mass contexts
= sources g4a_u06_4a06 and g4b_u03_4b03

kp_mass_times_integer
= total mass from per-share mass and share count
= source g3b_u06_3b06
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

For `kp_mass_times_integer`, the input unit must be one executable canonical P02C unit:

```text
milligram
gram
kilogram
metric_ton
```

For `kp_fraction_times_integer_quantity`, P02F requires a source node and an explicit source-declared quantity-unit ID. The unit is treated as an opaque identity; the generic `source_declared_unit` placeholder is not executable. P02F never parses numerator, denominator or mixed-number structure.

## Fail-closed behavior

```text
missing / unknown / non-cohort KP      = blocked
source / KP mismatch                   = blocked
missing fixed or source-declared unit  = blocked
placeholder or mismatched unit         = blocked
negative or decimal coefficient        = blocked
rational or mixed-number object        = blocked
negative or decimal multiplier         = blocked
wrong operation family                 = blocked
changed result unit                    = blocked
overflow beyond safe integer           = blocked
```

## Exact-head acceptance

```text
full Node regression                    = 2374 / 2374 PASS
Global authority semantic readback      = 2 / 2 PASS
operation descriptors                   = 2 / 2 PASS
dependent sources                       = 3 / 3 PASS
source / KP bindings                    = 3 / 3 PASS
semantic-role bindings                  = 2 / 2 PASS
fixed canonical unit executions         = 4 / 4 PASS
source-declared unit gate                = PASS
integer-only operand boundary            = PASS
rational / decimal fail closed           = PASS
source / KP mismatch fail closed         = PASS
operation / result-unit fail closed      = PASS
overflow fail closed                     = PASS
P02B-P02E promotions preserved           = PASS
exactly one new P02F promotion           = PASS
all five W2 foundations admitted         = PASS
R04 historical baseline preserved        = PASS
Chromium required                        = false
```

## Product boundary

```text
fraction engine            = false
unit conversion            = false
mixed-unit normalization   = false
story templates            = false
PatternSpec / generator    = false
worksheet / renderer       = false
public UI                  = false
existing 19-source product = preserved
P03-P08                    = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_QUANTITY_SEMANTIC_ROLE_BINDING_PRODUCTION_ADMITTED
GOAL_DISTANCE_AFTER  = D1_ALL_FIVE_W2_FOUNDATIONS_PRODUCTION_ADMITTED
DISTANCE_REDUCED     = The final W2 shared foundation now has a production-admitted safe-integer coefficient same-unit quantity-times-integer consumer for the exact two-KP cohort. All five W2 shared foundations are now production admitted, with no remaining W2 shadow foundation.
REMAINING_BLOCKERS   = [P02G downstream wave and product-unblock reconciliation not yet completed]
NEXT_SHORTEST_STEP   = P02G_W2FiveFoundationProductionAdmissionCloseoutAndDownstreamUnblockMatrix
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
