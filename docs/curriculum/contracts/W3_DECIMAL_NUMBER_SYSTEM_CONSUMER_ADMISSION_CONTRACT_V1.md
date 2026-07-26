# W3 Decimal Number System Consumer Admission Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03B2_W3DecimalNumberSystemConsumerAdmission
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## 1. Purpose

P03B2 admits `cap_decimal_number_system` as the second production-grade W3 root number-system capability. It establishes one exact, deterministic representation consumer for the fifty-one KnowledgePoints whose effective W3 capability closure includes decimal number-system semantics.

This task admits a shared capability only. It does not admit any new KnowledgePoint product row and does not change public output.

## 2. Authority lineage

```text
R04 canonical capability definitions
→ R05 delivery-wave authority
→ P03 exact W3 product inventory
→ P03A fail-closed hardening queue
→ P03B1 validated successor promotion authority
→ P03B2 decimal number-system consumer admission
```

R04 remains historical and immutable. P03B2 extends the validated successor promotion registry without rewriting R04 or P03A.

## 3. Exact cohort

```text
effective dependent KnowledgePoints = 51
direct W3 KnowledgePoints            = 45
protected existing D0 rows           = 3
new-product dependent rows           = 48
```

Every descriptor must retain traceable source-node binding. A request is accepted only when the KnowledgePoint belongs to this cohort and any asserted source node is bound to that KnowledgePoint.

## 4. Numeric-domain contract

```text
numericDomainId   = NON_NEGATIVE_DECIMAL
canonical form    = NORMALIZED_BASE10_COEFFICIENT_SCALE
coefficient type  = non-negative integer digit string
scale             = non-negative integer, maximum 32
maximum digits    = 64
base              = 10
```

Canonical normalization removes trailing fractional zeros. Zero is always represented as:

```json
{
  "coefficient": "0",
  "scale": 0,
  "canonicalText": "0"
}
```

Examples:

```text
3                      → coefficient 3, scale 0 → 3
0012.3400              → coefficient 1234, scale 2 → 12.34
coefficient 500/scale3 → coefficient 5, scale 1 → 0.5
whole 1 + digits 050   → coefficient 105, scale 2 → 1.05
0.000                  → coefficient 0, scale 0 → 0
```

All comparison and scale expansion use exact BigInt intermediates. JavaScript floating-point approximation is forbidden.

## 5. Accepted input forms

```text
SAFE_INTEGER
DECIMAL_STRING
SCALED_INTEGER
DECIMAL_PARTS
```

`DECIMAL_STRING` accepts unsigned base-10 literals only. Signs, exponent notation, whitespace and empty fractional parts are rejected.

`SCALED_INTEGER` has the form:

```json
{"coefficient": "500", "scale": 3}
```

`DECIMAL_PARTS` has the form:

```json
{"wholeNumber": 1, "fractionalDigits": "050"}
```

A JavaScript fractional number such as `0.5` is rejected because its binary floating-point origin cannot satisfy the exact decimal-source contract.

## 6. Allowed actions

```text
NORMALIZE
EQUIVALENCE
COMPARE
EXPAND_SCALE
```

`EXPAND_SCALE` may add trailing decimal zeros only. The target scale must be at least the canonical scale and no greater than 32.

## 7. Fail-closed boundary

The consumer blocks:

```text
missing or unknown KnowledgePoint
KnowledgePoint outside the decimal cohort
source / KnowledgePoint mismatch
incorrect capability assertion
unsupported action such as ADD
missing comparison value
malformed decimal string
JavaScript fractional-number input
negative value or scale
exponent notation
scale above 32
more than 64 input digits
invalid scale contraction
result overflow
```

## 8. Explicit non-goals

P03B2 does not implement or promote:

```text
decimal addition, subtraction, multiplication or division
decimal-domain validator capability
fraction-to-decimal conversion
decimal-to-fraction conversion
mixed fraction/decimal normalization
FormalMapping or PatternSpec
question generation
worksheet or answer-key rendering
public UI or selection changes
new product admission
protected D0 rebuild
P04-P08 work
```

## 9. Successor promotion

```text
inherited effective promotions = 6
new promotion                  = cap_decimal_number_system
effective promotions          = 7
remaining W3 contract-only     = 5
```

The next implementation entry is:

```text
P03B3_W3FractionDomainValidatorAdmission
```

It requires separate operator approval.
