# W3 Fraction Number System Consumer Admission Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03B1_W3FractionNumberSystemConsumerAdmission
CAPABILITY = cap_fraction_number_system
TARGET     = E5_PRODUCTION_ADMITTED
```

## 1. Purpose

P03B1 implements the first root capability in the P03A hardening queue. It admits one exact non-negative rational representation consumer across every KnowledgePoint whose effective W3 capability closure contains `cap_fraction_number_system`.

This is a number-system contract. It is not the later fraction arithmetic capability.

## 2. Authority lineage

```text
R04 historical capability matrix
→ R05 delivery-wave authority
→ P03 exact W3 product/dependency inventory
→ P03A dependency-safe hardening queue
→ P03B1 exact fraction representation consumer
→ P03B1 deterministic validator and tests
→ successor capability-promotion registry
```

R04 remains immutable and continues to show the historical `contract_only` status. Effective production status is declared only by the validated P03B1 successor registry.

## 3. Cohort

```text
effective fraction-number-system dependents = 73
direct R05-W3 KnowledgePoints               = 40
protected existing D0 rows                  = 1
new-product rows                            = 72
```

Each descriptor retains exact source/KP bindings, final delivery wave, direct or inherited capability requirement, protected-product state and product-gap state.

Capability admission does not admit any of the 72 new products.

## 4. Numeric domain

```text
numericDomainId = NON_NEGATIVE_RATIONAL
```

Accepted forms:

```text
SAFE_INTEGER
FRACTION { numerator, denominator }
MIXED_NUMBER { wholeNumber, numerator, denominator }
```

Constraints:

```text
wholeNumber >= 0 and safe integer
numerator   >= 0 and safe integer
denominator > 0 and safe integer
mixed-number numerator < denominator
```

Negative values, decimal JavaScript numbers, zero denominators, unsafe integers and malformed mixed numbers fail closed.

## 5. Canonical representation

Every valid input becomes:

```text
REDUCED_IMPROPER_FRACTION
```

with an exact mixed-number projection:

```text
wholeNumber + proper remainder / denominator
```

Canonical invariants:

```text
gcd(numerator, denominator) = 1
denominator > 0
zero = 0 / 1
whole number denominator = 1
no floating-point approximation
BigInt intermediate comparison and scaling
```

## 6. Allowed actions

```text
NORMALIZE
EQUIVALENCE
COMPARE
EXPAND_EQUIVALENT
```

`EXPAND_EQUIVALENT` multiplies numerator and denominator by the same positive safe-integer scale factor. It creates an equivalent representation without changing the canonical reduced value.

## 7. Explicit exclusions

```text
fraction addition/subtraction/multiplication/division = false
fraction-domain validator promotion                   = false
decimal conversion                                    = false
cross-domain mixed-number normalization               = false
FormalMapping / PatternSpec                           = false
question generation                                   = false
worksheet / answer key / renderer                     = false
public UI                                             = false
new product admission                                 = false
protected D0 admission change                         = false
P04-P08                                               = not started
```

## 8. Fail-closed behavior

The consumer blocks:

```text
missing or unknown KnowledgePoint
KnowledgePoint outside the fraction-number-system cohort
source/KP mismatch
capability assertion mismatch
unsupported action
missing primary or comparison value
invalid numerator or denominator
invalid mixed number
invalid equivalent scale factor
unsafe canonical or expanded result
any arithmetic action such as ADD
```

## 9. Admission evidence

Production admission requires and includes:

```text
authoritative contract
source-dependent cohort
runtime consumer
deterministic validator
focused tests
integration tests
E5 promotion claim
```

P02F exact rational quantity-times-integer code remains a partial candidate and is not treated as sufficient global evidence by itself.

## 10. Next boundary

```text
NEXT_TASK = P03B2_W3DecimalNumberSystemConsumerAdmission
SEPARATE_APPROVAL_REQUIRED = true
```
