# W3 Fraction Domain Validator Admission Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03B3_W3FractionDomainValidatorAdmission
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## 1. Purpose

P03B3 admits `cap_fraction_domain_validator` as the first production-grade W3 domain-validator capability. It consumes the already admitted P03B1 fraction number-system consumer and adds deterministic domain constraints for the fifty-two KnowledgePoints whose effective W3 capability closure includes fraction validation.

This task does not perform fraction arithmetic and does not admit any new KnowledgePoint product row.

## 2. Authority lineage

```text
R04 canonical validator dependency
→ R05 delivery-wave authority
→ P03 exact W3 product inventory
→ P03A fail-closed hardening queue
→ P03B1 exact fraction number-system consumer
→ P03B2 latest validated successor promotion authority
→ P03B3 fraction domain validator admission
```

R04 remains historical and immutable. P03B3 may promote only the successor status of `cap_fraction_domain_validator`.

## 3. Exact cohort

```text
effective dependent KnowledgePoints = 52
direct W3 KnowledgePoints            = 40
protected existing D0 rows           = 1
new-product dependent rows           = 51
```

Every P03B3 descriptor must have a matching P03B1 fraction-number-system descriptor and at least one authoritative source-node binding.

## 4. Validation surface

```text
VALIDATE_VALUE
VALIDATE_PAIR
VALIDATE_SET
```

### VALIDATE_VALUE

Normalizes one value through P03B1 and applies optional exact constraints:

```text
allowedMagnitudeClasses
allowZero
minimumValue
maximumValue
maxCanonicalNumerator
maxCanonicalDenominator
```

Magnitude classes are:

```text
ZERO
WHOLE_NUMBER
PROPER_FRACTION
IMPROPER_FRACTION
```

### VALIDATE_PAIR

Validates two fraction-domain values and may enforce one exact relation:

```text
EQUAL
NOT_EQUAL
LESS_THAN
LESS_THAN_OR_EQUAL
GREATER_THAN
GREATER_THAN_OR_EQUAL
```

Pair comparison uses exact cross multiplication through canonical integer numerator and denominator values.

### VALIDATE_SET

Validates a bounded set of one to thirty-two values. Optional policy:

```text
minCount
maxCount
uniqueCanonicalValues
```

Equivalent inputs such as `1/2` and `2/4` share the same canonical identity. When uniqueness is required, they are treated as duplicates and validation fails closed.

## 5. Number-system dependency

P03B3 does not independently parse fractions. Every value, policy bound and set member must pass through:

```text
P03B1_W3FractionNumberSystemConsumerAdmission
```

Therefore denominator validity, mixed-number validity, safe-integer limits, reduction, zero canonicalization and exact rational identity remain single-authority behaviors.

## 6. Fail-closed boundary

The validator blocks:

```text
missing or unknown KnowledgePoint
KnowledgePoint outside the fraction-validator cohort
source / KnowledgePoint mismatch
incorrect capability assertion
unsupported action such as ADD
P03B1 number-system rejection
invalid or unknown value-policy keys
invalid magnitude classes
forbidden zero
canonical numerator or denominator limit violation
minimum or maximum exact-range violation
invalid or mismatched pair relation
missing or invalid set
set-size violation
canonical duplicate when uniqueness is required
```

## 7. Explicit non-goals

P03B3 does not implement or promote:

```text
fraction addition, subtraction, multiplication or division
decimal-domain validator
decimal arithmetic
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

## 8. Successor promotion

```text
inherited effective promotions = 7
new promotion                  = cap_fraction_domain_validator
effective promotions          = 8
remaining W3 contract-only     = 4
```

The next implementation entry is:

```text
P03B4_W3DecimalDomainValidatorAdmission
```

It requires separate operator approval.
