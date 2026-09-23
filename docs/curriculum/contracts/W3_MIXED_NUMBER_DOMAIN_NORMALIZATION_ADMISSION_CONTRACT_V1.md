# W3 Mixed Number Domain Normalization Admission Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03B7_W3MixedNumberDomainNormalizationAdmission
CAPABILITY = cap_mixed_number_domain_normalization
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## 1. Purpose

P03B7 establishes one deterministic authority for exact normalization between the already admitted fraction and decimal number domains.

It closes the final W3 contract-only capability without mutating the historical R04 capability matrix and without admitting any worksheet product.

## 2. Required predecessor authorities

The runtime must consume, not duplicate:

```text
P03B1 cap_fraction_number_system
P03B2 cap_decimal_number_system
P03B3 cap_fraction_domain_validator
P03B4 cap_decimal_domain_validator
P03B5 cap_fraction_arithmetic
P03B6 cap_decimal_arithmetic
```

P03B5 and P03B6 are hardening gates. P03B7 does not reimplement their arithmetic operators.

## 3. Supported actions

```text
TO_FRACTION
TO_DECIMAL
EQUIVALENCE
COMPARE
```

### 3.1 TO_FRACTION

Input domain must be `DECIMAL`.

The decimal is normalized through P03B2 and validated through P03B4. Its canonical coefficient and scale are interpreted as:

```text
coefficient / 10^scale
```

The result is reduced exactly and validated through P03B1 and P03B3.

### 3.2 TO_DECIMAL

Input domain must be `FRACTION`.

The fraction or mixed number is normalized through P03B1 and validated through P03B3. The reduced denominator must contain no prime factors other than 2 and 5.

If the fraction has a terminating decimal representation, the exact base-10 coefficient and scale are materialized through P03B2 and validated through P03B4.

Recurring-decimal approximation, truncation and rounding are prohibited.

### 3.3 EQUIVALENCE

The two inputs must use different domains. Both are normalized through their admitted number-system and validator authorities, then compared as exact rational values.

### 3.4 COMPARE

The two inputs must use different domains. Comparison uses BigInt cross multiplication and returns one of:

```text
LESS_THAN
EQUAL
GREATER_THAN
```

## 4. Accepted source domains

```text
FRACTION
DECIMAL
```

Fraction input forms are inherited from P03B1, including safe integers, proper/improper fractions and mixed numbers.

Decimal input forms are inherited from P03B2, including safe integers, decimal strings, scaled integers and decimal-parts objects.

JavaScript floating-point decimal input is not accepted.

## 5. Exactness and safety rules

```text
negative values allowed                  = false
floating-point approximation allowed     = false
recurring-decimal approximation allowed  = false
BigInt intermediate arithmetic           = required
maximum decimal coefficient digits       = 64
maximum decimal scale                    = 32
fraction numerator/denominator result     = safe-integer bounded
```

## 6. Fail-closed requirements

The consumer must block:

```text
unknown or non-dependent KnowledgePoint
source / KnowledgePoint mismatch
capability assertion mismatch
unsupported action
wrong source domain for conversion
same-domain EQUIVALENCE or COMPARE
missing source or comparison value
fraction or decimal validator rejection
non-terminating fraction-to-decimal result
overflow or safety-budget violation
```

## 7. Product boundary

P03B7 does not implement or modify:

```text
ratio or percent reasoning
unit conversion
mixed-unit normalization
FormalMapping
PatternSpec
question generation
worksheet or answer-key rendering
public UI
new product admission
protected D0 product admission
P04-P08 work
```

## 8. Promotion rule

The P03B7 registry extends the latest validated P03B6 successor promotion registry and promotes only:

```text
cap_mixed_number_domain_normalization
contract_only → production_admitted
```

R04 remains historical and unchanged.

After P03B7, the W3 contract-only capability set must be empty.

## 9. Required acceptance

```text
full Node regression
milestone claim integrity
queue order and six-capability gate
five-KP cohort sweep
source / KP binding sweep
P03B1/P03B2/P03B3/P03B4 descriptor coverage
decimal-to-fraction conversion
terminating fraction-to-decimal conversion
mixed-number input
cross-domain equivalence
cross-domain comparison
non-terminating decimal fail close
same-domain fail close
overflow and invalid-input fail close
promotion status
historical R04 preservation
scope boundary
```

Chromium acceptance is not required because P03B7 changes no visible output.

## 10. Next boundary

P03B7 completes W3 capability hardening. Product rows remain blocked until a separate reconciliation task re-evaluates capability gates and chooses the next product-unblock route.

```text
NEXT_SHORTEST_STEP = P03C_W3CapabilityCloseoutAndProductUnblockReconciliation
```
