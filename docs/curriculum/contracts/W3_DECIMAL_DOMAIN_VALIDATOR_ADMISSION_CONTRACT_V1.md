# W3 Decimal Domain Validator Admission Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03B4_W3DecimalDomainValidatorAdmission
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## Purpose

P03B4 admits `cap_decimal_domain_validator` as the second production-grade W3 domain-validator capability. It consumes the P03B2 exact decimal number-system consumer and adds deterministic base-10 domain constraints for every KnowledgePoint whose effective W3 capability closure includes decimal validation.

This task does not perform decimal arithmetic and does not admit any new product row.

## Authority lineage

```text
R04 canonical validator dependency
→ R05 delivery-wave authority
→ P03 exact W3 product inventory
→ P03A fail-closed hardening queue
→ P03B2 exact decimal number-system consumer
→ P03B3 latest validated successor promotion authority
→ P03B4 decimal domain validator admission
```

R04 remains historical and immutable.

## Validation surface

```text
VALIDATE_VALUE
VALIDATE_PAIR
VALIDATE_SET
```

### Value constraints

```text
allowedMagnitudeClasses
allowZero
minimumValue
maximumValue
maxCanonicalCoefficientDigits
maxCanonicalScale
allowedCanonicalScales
```

Magnitude classes:

```text
ZERO
WHOLE_NUMBER
DECIMAL_FRACTION
```

Every bound and tested value is normalized by P03B2 into:

```text
NORMALIZED_BASE10_COEFFICIENT_SCALE
```

### Pair relations

```text
EQUAL
NOT_EQUAL
LESS_THAN
LESS_THAN_OR_EQUAL
GREATER_THAN
GREATER_THAN_OR_EQUAL
```

Comparison aligns both canonical scales with BigInt powers of ten. Floating-point approximation is prohibited.

### Set constraints

```text
minCount
maxCount
uniqueCanonicalValues
```

Equivalent forms such as `0.5` and `0.500` share the same canonical identity and fail closed when uniqueness is required.

## Fail-closed boundary

P03B4 blocks missing or unknown KnowledgePoints, cohort mismatch, source/KP mismatch, incorrect capability assertions, unsupported actions such as `ADD`, P03B2 normalization failures, unknown policy fields, invalid magnitude classes, forbidden zero, coefficient-digit or scale violations, exact-range violations, relation mismatch, invalid set size, and duplicate canonical values.

## Explicit non-goals

```text
decimal addition, subtraction, multiplication or division
fraction arithmetic
fraction/decimal conversion
mixed-number cross-domain normalization
FormalMapping or PatternSpec
question generation
worksheet, answer-key or renderer changes
public UI changes
new product admission
protected D0 rebuild
P04-P08 work
```

## Successor promotion

```text
inherited effective promotions = 8
new promotion                  = cap_decimal_domain_validator
effective promotions          = 9
remaining W3 contract-only     = 3
```

The next implementation entry is:

```text
P03B5_W3FractionArithmeticAdmission
```

It requires separate operator approval.
