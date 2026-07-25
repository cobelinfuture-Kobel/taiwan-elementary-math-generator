# W2 Same-Unit Quantity Arithmetic Consumer Admission Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02F_W2SameUnitQuantityArithmeticConsumerAdmission
CAPABILITY = cap_same_unit_quantity_arithmetic
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## 1. Purpose

P02F promotes the final R05-W2 shadow foundation through one deterministic production arithmetic consumer. The consumer covers the exact two KnowledgePoints selected by the P02 effective dependency inventory and does not create a second KnowledgePoint, quantity-identity or semantic-role authority.

## 2. Authoritative lineage

```text
P02 exact two-KP capability cohort
→ P02B Global KnowledgePoint and source authority
→ P02C quantity dimension / unit identity
→ optional P02E semantic-role trace
→ QUANTITY_TIMES_INTEGER descriptor
→ non-negative safe-integer execution
→ exact input-unit preservation
→ fail-closed validator
→ P02F successor promotion registry
```

## 3. Operation contract

```text
operationFamilyId = QUANTITY_TIMES_INTEGER
inputs            = BASE_QUANTITY, INTEGER_MULTIPLIER
result            = PRODUCT_QUANTITY
expression        = resultValue = quantityValue × integerMultiplier
```

Both numeric inputs and the result must be non-negative JavaScript safe integers. Zero is valid. Negative values, fractional values, non-numeric values and unsafe results are blocked.

## 4. Unit invariant

```text
input unit  = one canonical P02C unit ID
result unit = the exact same unit ID
```

P02F does not convert units, normalize mixed units or combine different dimensions. A request that asserts a different result unit is invalid even when the two units belong to the same dimension or unit family.

## 5. Fail-closed behavior

```text
missing KP                         → P02F_ARITHMETIC_KP_ID_REQUIRED
unknown KP                         → P02F_UNKNOWN_KNOWLEDGE_POINT
non-cohort KP                      → P02F_KP_NOT_SAME_UNIT_ARITHMETIC_DEPENDENT
missing direct capability mapping  → P02F_DIRECT_CAPABILITY_REQUIREMENT_MISSING
invalid runtime profile            → P02F_PRIMARY_PROFILE_INVALID
missing quantity identity          → P02F_QUANTITY_IDENTITY_REQUIRED
missing canonical unit authority   → P02F_CANONICAL_UNIT_REQUIRED
missing operation descriptor       → P02F_OPERATION_DESCRIPTOR_MISSING
source / KP mismatch               → P02F_SOURCE_KP_MISMATCH
missing quantity input             → P02F_QUANTITY_INPUT_REQUIRED
missing unit ID                    → P02F_UNIT_ID_REQUIRED
invalid unit ID                    → P02F_UNIT_ID_INVALID
invalid quantity value             → P02F_QUANTITY_VALUE_INVALID
invalid integer multiplier         → P02F_INTEGER_MULTIPLIER_INVALID
wrong operation family             → P02F_OPERATION_FAMILY_MISMATCH
changed result unit                → P02F_RESULT_UNIT_MISMATCH
unsafe numeric result              → P02F_RESULT_OVERFLOW
```

## 6. Promotion boundary

P02F inherits the four validated P02B-P02E promotions and adds exactly one promotion:

```text
cap_same_unit_quantity_arithmetic = production_admitted
```

After successful exact-head CI, all five R05-W2 foundations are production admitted. R04 remains the immutable historical baseline.

## 7. Explicit exclusions

```text
unit conversion              = excluded
mixed-unit normalization     = excluded
time-system arithmetic       = excluded
story generation             = excluded
question generation          = excluded
PatternSpec                  = excluded
worksheet / renderer / UI    = unchanged
P03-P08                      = not started
```
