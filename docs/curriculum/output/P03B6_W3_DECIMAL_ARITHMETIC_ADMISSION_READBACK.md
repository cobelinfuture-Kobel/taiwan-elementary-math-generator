# P03B6 W3 Decimal Arithmetic Admission Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03B6_W3DecimalArithmeticAdmission
QUEUE_ID   = P03B6_W3DecimalArithmeticConsumerAdmission
STATUS     = IMPLEMENTED_PENDING_EXACT_HEAD_CI
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## Capability admission

```text
capabilityId             = cap_decimal_arithmetic
historical R04 status    = contract_only
P03B6 successor status   = production_admitted
numericDomainId          = NON_NEGATIVE_DECIMAL
number-system dependency = cap_decimal_number_system
domain-validator gate    = cap_decimal_domain_validator
```

P03B6 consumes P03B2 and P03B4 and extends P03B5's latest validated successor promotion authority. R04 remains unchanged.

## Exact cohort

```text
effective dependent KnowledgePoints = PENDING_EXACT_HEAD_CI
direct W3 KnowledgePoints            = PENDING_EXACT_HEAD_CI
direct capability requirement rows   = PENDING_EXACT_HEAD_CI
protected existing D0 rows           = PENDING_EXACT_HEAD_CI
new-product dependent rows           = PENDING_EXACT_HEAD_CI
dependent source nodes               = PENDING_EXACT_HEAD_CI
source / KP bindings                 = PENDING_EXACT_HEAD_CI
P03B2 descriptor coverage            = PENDING_EXACT_HEAD_CI
P03B4 descriptor coverage            = PENDING_EXACT_HEAD_CI
descriptor errors                    = PENDING_EXACT_HEAD_CI
```

## Arithmetic surface

```text
ADD
SUBTRACT
MULTIPLY
DIVIDE
```

Exact behaviors:

```text
common-scale BigInt addition and subtraction
negative subtraction fail close
coefficient-product / scale-sum multiplication
reduced-rational finite-decimal division
non-terminating quotient fail close
zero-divisor fail close
P03B2 canonical normalization
P03B4 operand and result-policy validation
64-digit / 32-scale safety boundary
```

## Product boundary

```text
new products admitted by P03B6 = 0
visible output changed          = false
fraction arithmetic changed     = false
```

## Promotion state

```text
inherited effective promotions = 10
new W3 promotions              = 1
effective promotions           = 11
remaining W3 contract-only     = 1
```

## Exact-head acceptance

```text
full Node regression                       = PENDING_EXACT_HEAD_CI
milestone claim integrity                  = PENDING_EXACT_HEAD_CI
hardening queue entry                      = PENDING_EXACT_HEAD_CI
decimal-number-system gate                 = PENDING_EXACT_HEAD_CI
decimal-domain-validator gate              = PENDING_EXACT_HEAD_CI
P03B5 predecessor promotion                = PENDING_EXACT_HEAD_CI
decimal-arithmetic cohort                  = PENDING_EXACT_HEAD_CI
source / KP binding sweep                  = PENDING_EXACT_HEAD_CI
P03B2 descriptor coverage                  = PENDING_EXACT_HEAD_CI
P03B4 descriptor coverage                  = PENDING_EXACT_HEAD_CI
addition                                   = PENDING_EXACT_HEAD_CI
subtraction                                = PENDING_EXACT_HEAD_CI
multiplication                             = PENDING_EXACT_HEAD_CI
terminating division                       = PENDING_EXACT_HEAD_CI
canonical normalization                    = PENDING_EXACT_HEAD_CI
negative-result fail close                 = PENDING_EXACT_HEAD_CI
division-by-zero fail close                = PENDING_EXACT_HEAD_CI
non-terminating quotient fail close        = PENDING_EXACT_HEAD_CI
overflow fail close                        = PENDING_EXACT_HEAD_CI
result-policy validation                   = PENDING_EXACT_HEAD_CI
invalid input fail close                   = PENDING_EXACT_HEAD_CI
promotion status                           = PENDING_EXACT_HEAD_CI
historical R04 preservation                = PENDING_EXACT_HEAD_CI
scope boundary                             = PENDING_EXACT_HEAD_CI
Chromium required                          = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_W3_FIRST_ARITHMETIC_CAPABILITY_PRODUCTION_ADMITTED
GOAL_DISTANCE_AFTER  = D1_W3_TWO_ARITHMETIC_CAPABILITIES_PRODUCTION_ADMITTED
DISTANCE_REDUCED     = The decimal-arithmetic capability now executes exact finite base-10 addition, subtraction, multiplication and division through the admitted decimal number-system and domain-validator authorities.
REMAINING_BLOCKERS   = [one W3 capability remains contract-only; decimal-arithmetic-dependent new-product rows remain product-blocked; protected D0 rows require post-admission compatibility revalidation]
NEXT_SHORTEST_STEP   = P03B7_W3MixedNumberDomainNormalizationAdmission
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
