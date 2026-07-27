# W3 Decimal Arithmetic Admission Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03B6_W3DecimalArithmeticAdmission
QUEUE_ID   = P03B6_W3DecimalArithmeticConsumerAdmission
CAPABILITY = cap_decimal_arithmetic
TARGET     = E5_PRODUCTION_ADMITTED
```

## 1. Authority lineage

```text
P03A hardening queue order 6
→ P03B2 exact decimal number system
→ P03B4 decimal domain validator
→ P03B6 deterministic decimal arithmetic
→ P03B6 successor promotion registry
```

The historical R04 capability matrix remains immutable. P03B6 extends the latest validated successor authority from P03B5.

## 2. Hardening gate

Both capabilities are mandatory:

```text
cap_decimal_number_system
cap_decimal_domain_validator
```

No P03B6 request may parse decimal values independently or bypass P03B4 operand/result validation.

## 3. Runtime actions

```text
ADD
SUBTRACT
MULTIPLY
DIVIDE
```

Inputs use P03B2 accepted exact forms:

```text
SAFE_INTEGER
DECIMAL_STRING
SCALED_INTEGER
DECIMAL_PARTS
```

Results use:

```text
NORMALIZED_BASE10_COEFFICIENT_SCALE
```

## 4. Exact arithmetic rules

### Addition and subtraction

Coefficients are aligned to a common decimal scale and combined with BigInt arithmetic.

Subtraction must remain inside `NON_NEGATIVE_DECIMAL`. A negative result fails closed with:

```text
P03B6_NEGATIVE_RESULT_FORBIDDEN
```

### Multiplication

Coefficients are multiplied and input scales are added. The result is normalized through P03B2.

### Division

Division is evaluated as an exact reduced rational quotient. The reduced denominator may contain only prime factors `2` and `5`.

```text
finite decimal       → admitted
non-terminating form → P03B6_NON_TERMINATING_DECIMAL
zero divisor         → P03B6_DIVISION_BY_ZERO
```

No rounding, repeating-decimal truncation or floating-point approximation is allowed.

## 5. Domain validation

Both operands are validated by P03B4 before arithmetic. The final canonical result is validated again by P03B4.

Optional request policies:

```text
operandPolicy
resultPolicy
```

`resultPolicy` may constrain magnitude class, zero, coefficient digits, scale, allowed scales and exact range through the existing P03B4 contract.

## 6. Fail-closed boundaries

P03B6 blocks:

```text
unknown or non-cohort KnowledgePoint
source / KnowledgePoint mismatch
capability assertion mismatch
unsupported operation
missing operand
JavaScript floating-point decimal input
negative subtraction result
zero divisor
non-terminating decimal quotient
P03B2 digit or scale overflow
P03B4 operand or result-policy rejection
```

## 7. Scope exclusions

P03B6 does not implement or modify:

```text
fraction arithmetic
fraction ↔ decimal conversion
mixed-number cross-domain normalization
unit conversion
FormalMapping
PatternSpec
question generation
worksheet or renderer
public UI
product admission
P04–P08
```

## 8. Promotion rule

`cap_decimal_arithmetic` may be promoted from `contract_only` to `production_admitted` only when:

```text
queue order and both gates pass
full dependent cohort materializes
P03B2 and P03B4 descriptor coverage is complete
ADD / SUBTRACT / MULTIPLY / terminating DIVIDE pass
negative, zero-divisor, recurring quotient and overflow fail closed
focused and integration tests pass
full Node regression passes
milestone E5 claim passes
```

## 9. Next boundary

```text
NEXT_TASK = P03B7_W3MixedNumberDomainNormalizationAdmission
SEPARATE_APPROVAL_REQUIRED = true
```
