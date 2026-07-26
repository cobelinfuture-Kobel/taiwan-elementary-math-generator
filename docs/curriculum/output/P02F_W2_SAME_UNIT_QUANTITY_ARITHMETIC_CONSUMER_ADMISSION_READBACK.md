# P02F W2 Same-Unit Quantity Arithmetic Consumer Admission Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02F_W2SameUnitQuantityArithmeticConsumerAdmission
STATUS     = PASS_EXACT_HEAD_CI_READY_TO_MERGE
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## Admitted capability

```text
capability                 = cap_same_unit_quantity_arithmetic
historical R04 status      = shadow_available
effective successor status = production_admitted
consumer mode              = PRODUCTION_DETERMINISTIC_SAME_UNIT_QUANTITY_ARITHMETIC
operation family           = QUANTITY_TIMES_INTEGER
```

R04 remains the immutable historical baseline. P02F extends the validated P02E successor promotion authority.

## Exact scope

```text
effective dependent KPs      = 2
operation descriptors         = 2
dependent source nodes        = 3
source / KP bindings          = 3
fixed canonical unit bindings = 4
source-declared unit modes     = 1
exact rational modes          = 1
semantic-role bindings        = 2
inherited W2 promotions       = 4
new W2 promotions             = 1
effective W2 promotions       = 5
remaining shadow foundations  = 0
```

## Exact KnowledgePoints

### `kp_fraction_times_integer_quantity`

```text
name                    = 分數或帶分數乘整數量
sources                 = g4a_u06_4a06, g4b_u03_4b03
numeric domain          = NON_NEGATIVE_RATIONAL
dimension               = SOURCE_DECLARED_QUANTITY
unit family             = SOURCE_DECLARED_UNIT_FAMILY
semantic relation       = FRACTIONAL_QUANTITY_SCALING
source-declared unit    = required
```

The P02C `source_declared_unit` value remains an authority placeholder. Runtime requests must provide an actual source-declared unit and matching source node. Integer, fraction and mixed-number values are multiplied exactly and reduced without floating-point approximation.

### `kp_mass_times_integer`

```text
name              = 重量乘整數
source            = g3b_u06_3b06
numeric domain    = NON_NEGATIVE_SAFE_INTEGER
dimension         = MASS
unit family       = METRIC_MASS
semantic relation = EQUAL_GROUPS_TOTAL
canonical units   = milligram, gram, kilogram, metric_ton
```

## Runtime lineage

```text
P02 exact two-KP capability cohort
→ P02B Global source / KP authority
→ P02C quantity identity
→ P02E semantic-role trace
→ integer or exact-rational QUANTITY_TIMES_INTEGER
→ exact input-unit preservation
→ fail-closed validator
→ P02F successor promotion registry
```

## Arithmetic behavior

```text
integer mass input       = non-negative safe integer
fraction quantity input  = safe integer, rational or proper mixed number
integer multiplier       = non-negative safe integer
fraction result          = reduced exact rational
zero multiplier          = allowed
floating approximation   = forbidden
unit conversion           = false
mixed-unit normalization = false
cross-dimension arithmetic = false
story / question generation = false
```

Example exact rational projection:

```text
1 1/2 × 3 = 9/2 = 4 1/2
```

The result unit is identical to the input unit.

## Fail-closed behavior

```text
missing / unknown / non-cohort KP         = blocked
source / KP mismatch                      = blocked
invalid fixed-family unit                 = blocked
missing source-declared source            = blocked
missing source-declared unit              = blocked
source_declared_unit used as actual unit  = blocked
source-declared unit mismatch             = blocked
negative or fractional multiplier         = blocked
invalid rational or mixed number          = blocked
changed result unit                       = blocked
unsafe integer or rational result         = blocked
```

## Promotion boundary

Production admitted:

```text
cap_kp_authority_lookup
cap_prerequisite_readiness
cap_quantity_dimension_unit_identity
cap_quantity_semantic_role_binding
cap_same_unit_quantity_arithmetic
```

Still shadow:

```text
NONE
```

## Acceptance

```text
full Node regression                    = 2372 / 2372 PASS
KnowledgePoint identities               = 2 / 2 PASS
operation descriptors                   = 2 / 2 PASS
source nodes                            = 3 / 3 PASS
source / KP bindings                    = 3 / 3 PASS
fixed canonical mass units             = 4 / 4 PASS
source-declared unit contract           = PASS
source-declared placeholder rejection   = PASS
exact rational mixed-number execution  = PASS
rational reduction                      = PASS
whole-number mass execution            = PASS
exact input-unit preservation           = PASS
negative / fractional operands blocked = PASS
invalid rational forms blocked          = PASS
unsafe result overflow blocked          = PASS
P02B-P02E promotions preserved          = PASS
exactly one new P02F promotion          = PASS
all five W2 foundations admitted        = PASS
R04 historical baseline preserved       = PASS
Chromium required                       = false
```

## Product boundary

```text
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
DISTANCE_REDUCED     = The fifth W2 shared foundation now executes both authoritative quantity-times-integer KnowledgePoints across three sources: exact rational scaling with explicit source-declared unit binding and whole-number mass scaling across four canonical units. All five W2 foundations are production admitted.
REMAINING_BLOCKERS   = [W2 downstream unblock matrix has not yet recomputed the 51 dependent product rows]
NEXT_SHORTEST_STEP   = P02G_W2FiveFoundationProductionAdmissionCloseoutAndDownstreamUnblockMatrix
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
