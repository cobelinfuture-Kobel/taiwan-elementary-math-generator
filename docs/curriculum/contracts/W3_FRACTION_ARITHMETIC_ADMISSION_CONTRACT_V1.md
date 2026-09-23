# W3 Fraction Arithmetic Admission Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03B5_W3FractionArithmeticAdmission
QUEUE_ID   = P03B5_W3FractionArithmeticConsumerAdmission
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## 1. Purpose

P03B5 admits `cap_fraction_arithmetic` as the first W3 arithmetic capability. It consumes the admitted P03B1 fraction number-system consumer and P03B3 fraction domain validator, then executes exact binary arithmetic over non-negative rational values.

This task admits a shared runtime capability. It does not admit new worksheet products or generate questions.

## 2. Authority lineage

```text
R04 canonical capability dependency
→ R05 delivery-wave authority
→ P03 exact W3 product inventory
→ P03A fail-closed hardening queue
→ P03B1 exact fraction number system
→ P03B3 exact fraction domain validator
→ P03B4 latest successor promotion authority
→ P03B5 fraction arithmetic admission
```

R04 remains immutable. P03B5 may promote only the successor delivery status of `cap_fraction_arithmetic`.

## 3. Hardening gates

Both gates are mandatory:

```text
cap_fraction_number_system
cap_fraction_domain_validator
```

Every P03B5 descriptor must have a corresponding P03B1 number-system descriptor, P03B3 domain-validator descriptor and authoritative source-node binding.

## 4. Arithmetic surface

```text
ADD
SUBTRACT
MULTIPLY
DIVIDE
```

Operand roles:

```text
LEFT_OPERAND
RIGHT_OPERAND
```

Accepted input forms are inherited from P03B1:

```text
SAFE_INTEGER
FRACTION
MIXED_NUMBER
```

The result form is always:

```text
REDUCED_IMPROPER_FRACTION
```

A mixed projection is included by P03B1 but is not a second arithmetic authority.

## 5. Exact algorithms

### Addition and subtraction

A least common denominator is derived using the denominator GCD. Both numerators are scaled exactly before addition or subtraction.

Subtraction that would produce a negative result fails closed because the admitted domain is `NON_NEGATIVE_RATIONAL`.

### Multiplication

Operands are cross-cancelled before multiplication. Final numerator and denominator are reduced again before canonicalization.

### Division

Division multiplies the left operand by the exact reciprocal of the right operand. A zero right numerator fails closed as division by zero.

### Numeric representation

All intermediate calculations use `BigInt`. No floating-point approximation is permitted. The final reduced numerator and denominator must fit JavaScript safe-integer limits before they are handed back to P03B1 for canonical materialization.

## 6. Result-domain validation

Every arithmetic result is validated through P03B3, even when no explicit result policy is supplied.

An optional `resultPolicy` can constrain:

```text
allowedMagnitudeClasses
allowZero
minimumValue
maximumValue
maxCanonicalNumerator
maxCanonicalDenominator
```

Examples of valid policy use include requiring a proper-fraction result, forbidding zero, or restricting the result to an exact interval.

## 7. Fail-closed boundary

P03B5 blocks:

```text
missing or unknown KnowledgePoint
KnowledgePoint outside the fraction-arithmetic cohort
source / KnowledgePoint mismatch
incorrect capability assertion
unsupported operation
missing operand
P03B1 or P03B3 operand rejection
negative subtraction result
division by zero
final reduced numerator or denominator overflow
P03B3 result-policy rejection
```

## 8. P02F boundary

`p02f-same-unit-quantity-arithmetic-consumer.mjs` remains a `PARTIAL_COMPONENT_CANDIDATE` only.

P02F performs quantity-times-integer under unit identity. P03B5 performs unitless binary fraction arithmetic under W3 number-system and domain-validator authority. P03B5 does not consume P02F as its arithmetic authority.

## 9. Explicit non-goals

P03B5 does not implement or promote:

```text
decimal arithmetic
fraction / decimal conversion
mixed-number cross-domain normalization
unit conversion or mixed-unit arithmetic
FormalMapping or PatternSpec
question generation
worksheet, answer-key or renderer changes
public UI changes
new product admission
protected D0 rebuild
P04-P08 work
```

## 10. Successor promotion

```text
inherited effective promotions = 9
new promotion                  = cap_fraction_arithmetic
effective promotions          = 10
remaining W3 contract-only     = 2
```

The next implementation entry is:

```text
P03B6_W3DecimalArithmeticAdmission
```

It requires separate operator approval.
