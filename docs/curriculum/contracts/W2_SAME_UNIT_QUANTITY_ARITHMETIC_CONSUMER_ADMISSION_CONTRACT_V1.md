# W2 Same-Unit Quantity Arithmetic Consumer Admission Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02F_W2SameUnitQuantityArithmeticConsumerAdmission
CAPABILITY = cap_same_unit_quantity_arithmetic
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## 1. Purpose

P02F promotes the final R05-W2 shadow foundation through one deterministic production arithmetic consumer. It covers the exact two KnowledgePoints selected by the P02 dependency inventory without creating another KnowledgePoint, quantity-identity, semantic-role or operation authority.

```text
kp_fraction_times_integer_quantity = exact fraction or mixed-number quantity × integer
kp_mass_times_integer              = whole-number mass quantity × integer
```

The fraction domain is fixed by the canonical W02 operation model: `amountPerGroup` is a fraction or mixed-number quantity, `groupCount` is a nonnegative integer, and the answer type is `fraction_measure`.

## 2. Authoritative lineage

```text
W02 canonical operation model
→ P02 exact two-KP capability cohort
→ P02B Global KnowledgePoint and source authority
→ P02C quantity dimension / unit identity
→ P02E semantic-role binding
→ QUANTITY_TIMES_INTEGER descriptor
→ exact integer or rational execution
→ exact input-unit preservation
→ fail-closed validator
→ P02F successor promotion registry
```

## 3. Operation contract

```text
operationFamilyId = QUANTITY_TIMES_INTEGER
inputs            = BASE_QUANTITY, INTEGER_MULTIPLIER
result            = PRODUCT_QUANTITY
expression        = resultQuantity = baseQuantity × integerMultiplier
```

The multiplier must be a nonnegative JavaScript safe integer. Zero is valid.

### 3.1 Whole-number mass domain

```text
numericDomainId = NON_NEGATIVE_SAFE_INTEGER
input value     = nonnegative safe integer
result value    = nonnegative safe integer
```

Unsafe multiplication results fail closed.

### 3.2 Fraction or mixed-number quantity domain

```text
numericDomainId = NON_NEGATIVE_RATIONAL
accepted inputs = safe integer | numerator/denominator | proper mixed-number object
result          = reduced exact rational
```

P02F uses BigInt for intermediate multiplication and greatest-common-divisor reduction. Floating-point approximation is not allowed. The result exposes reduced improper numerator and denominator together with equivalent whole-number and remainder-numerator fields.

The permanent authority regression requires:

```text
operationFamilyId           = fraction_times_integer
amountPerGroup role         = 每份分數或帶分數量
groupCount role             = 份數
answerType                  = fraction_measure
equivalent form             = fraction multiplication
measurement unit invariant = preserved
```

## 4. Unit invariant

### 4.1 Fixed P02C unit family

`kp_mass_times_integer` accepts only:

```text
milligram
gram
kilogram
metric_ton
```

### 4.2 Source-declared quantity unit

`kp_fraction_times_integer_quantity` has `SOURCE_DECLARED_ONLY` unit identity. The P02C value `source_declared_unit` is an authority placeholder, not an executable unit ID.

A valid request must provide:

```text
sourceNodeId
quantity.unitId
sourceDeclaredUnitId
```

Both unit IDs must be identical, non-empty and different from `source_declared_unit`. This binds the operation to the unit declared by the source item without inventing a global unit or performing conversion.

### 4.3 Result invariant

```text
result unit = exact input unit ID
```

P02F does not convert units, normalize mixed units or combine different dimensions. A different asserted result unit is invalid even when both units belong to the same dimension or unit family.

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
invalid fixed-family unit ID       → P02F_UNIT_ID_INVALID
missing source for declared unit   → P02F_SOURCE_DECLARED_UNIT_SOURCE_REQUIRED
missing declared unit              → P02F_SOURCE_DECLARED_UNIT_REQUIRED
placeholder used as actual unit    → P02F_SOURCE_DECLARED_UNIT_PLACEHOLDER_FORBIDDEN
source-declared unit mismatch      → P02F_SOURCE_DECLARED_UNIT_MISMATCH
invalid whole-number value         → P02F_QUANTITY_VALUE_INVALID
invalid rational or mixed value    → P02F_RATIONAL_VALUE_INVALID
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

All five R05-W2 foundations are then production admitted. R04 remains the immutable historical baseline.

## 7. Exact acceptance

```text
Node tests                    = 2373 / 2373 PASS
KnowledgePoints               = 2 / 2
source nodes                  = 3
source / KP bindings          = 3
fixed canonical mass units    = 4 / 4
source-declared unit modes     = 1
exact rational modes          = 1
semantic-role bindings        = 2 / 2
canonical operation gate      = PASS
remaining W2 shadow           = 0
```

## 8. Explicit exclusions

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
