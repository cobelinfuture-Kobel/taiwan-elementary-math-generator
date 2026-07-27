# P03B6 W3 Decimal Arithmetic Admission Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03B6_W3DecimalArithmeticAdmission
QUEUE_ID   = P03B6_W3DecimalArithmeticConsumerAdmission
STATUS     = PASS_EXACT_HEAD_CI_READY_TO_MERGE
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
effective dependent KnowledgePoints = 25
direct W3 KnowledgePoints            = 24
direct capability requirement rows   = 25
protected existing D0 rows           = 0
new-product dependent rows           = 25
dependent source nodes               = 8
source / KP bindings                 = 25
P03B2 descriptor coverage            = 25 / 25
P03B4 descriptor coverage            = 25 / 25
descriptor errors                    = 0
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
0 protected D0 rows  → no existing D0 compatibility row in this cohort
25 new-product rows → remain product-blocked
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
full Node regression                       = 2438 / 2438 PASS
milestone claim integrity                  = PASS
hardening queue entry                      = PASS
decimal-number-system gate                 = PASS
decimal-domain-validator gate              = PASS
P03B5 predecessor promotion                = PASS
decimal-arithmetic cohort                  = 25 / 25 PASS
direct W3 cohort                           = 24 / 24 PASS
direct requirement rows                    = 25 / 25 PASS
dependent source nodes                     = 8 / 8 PASS
source / KP binding sweep                  = 25 / 25 PASS
P03B2 descriptor coverage                  = 25 / 25 PASS
P03B4 descriptor coverage                  = 25 / 25 PASS
addition                                   = PASS
subtraction                                = PASS
multiplication                             = PASS
terminating division                       = PASS
canonical normalization                    = PASS
negative-result fail close                 = PASS
division-by-zero fail close                = PASS
non-terminating quotient fail close        = PASS
overflow fail close                        = PASS
result-policy validation                   = PASS
invalid input fail close                   = PASS
promotion status                           = PASS
historical R04 preservation                = PASS
scope boundary                             = PASS
Chromium required                          = false
```

Node Test run `30227130982` completed successfully on PR #393 head `0bdcd5242a52f048f76309799d9a52592ea373cb`. Exact metrics are frozen into the manifest; the final head must re-run CI before merge.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_W3_FIRST_ARITHMETIC_CAPABILITY_PRODUCTION_ADMITTED
GOAL_DISTANCE_AFTER  = D1_W3_TWO_ARITHMETIC_CAPABILITIES_PRODUCTION_ADMITTED
DISTANCE_REDUCED     = The decimal-arithmetic capability now executes exact finite base-10 addition, subtraction, multiplication and division for its 25-KP cohort through the admitted decimal number-system and domain-validator authorities.
REMAINING_BLOCKERS   = [one W3 capability remains contract-only; 25 decimal-arithmetic-dependent new-product rows remain product-blocked]
NEXT_SHORTEST_STEP   = P03B7_W3MixedNumberDomainNormalizationAdmission
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
