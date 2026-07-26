# P03B4 W3 Decimal Domain Validator Admission Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03B4_W3DecimalDomainValidatorAdmission
STATUS     = PASS_EXACT_HEAD_CI_READY_TO_MERGE
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## Capability admission

```text
capabilityId             = cap_decimal_domain_validator
historical R04 status    = contract_only
P03B4 successor status   = production_admitted
numericDomainId          = NON_NEGATIVE_DECIMAL
number-system dependency = cap_decimal_number_system
```

P03B4 consumes P03B2 and extends P03B3's latest validated successor promotion authority. R04 remains unchanged.

## Exact cohort

```text
effective dependent KnowledgePoints = 51
direct W3 KnowledgePoints            = 45
direct capability requirement rows   = 51
protected existing D0 rows           = 3
new-product dependent rows           = 48
dependent source nodes               = 12
source / KP bindings                 = 51
P03B2 descriptor coverage            = 51 / 51
descriptor errors                    = 0
```

## Validation surface

```text
VALIDATE_VALUE
VALIDATE_PAIR
VALIDATE_SET
```

Validated constraint families:

```text
magnitude class
zero allowance
canonical coefficient-digit limit
canonical scale limit
allowed canonical scales
exact minimum / maximum range
pair relation
set size
canonical uniqueness
```

Every value is normalized by P03B2 before P03B4 evaluates constraints.

## Product boundary

```text
3 protected D0 rows  → existing product admission preserved
48 new-product rows  → remain product-blocked
new products admitted by P03B4 = 0
visible output changed          = false
```

## Promotion state

```text
inherited effective promotions = 8
new W3 promotions              = 1
effective promotions           = 9
remaining W3 contract-only     = 3
```

## Exact-head acceptance

```text
full Node regression                       = 2421 / 2421 PASS
milestone claim integrity                  = PASS
hardening queue entry                      = PASS
decimal-number-system gate                 = PASS
P03B3 predecessor promotion                = PASS
decimal-validator cohort                   = 51 / 51 PASS
direct W3 cohort                           = 45 / 45 PASS
direct requirement rows                    = 51 / 51 PASS
dependent source nodes                     = 12 / 12 PASS
source / KP binding sweep                  = 51 / 51 PASS
P03B2 descriptor coverage                  = 51 / 51 PASS
value validation                           = PASS
magnitude constraint                       = PASS
zero constraint                            = PASS
canonical coefficient-digit limit          = PASS
canonical scale constraint                 = PASS
exact range constraint                     = PASS
pair relation validation                   = PASS
set validation                             = PASS
canonical duplicate fail close             = PASS
invalid input fail close                   = PASS
arithmetic scope fail close                = PASS
promotion status                           = PASS
historical R04 preservation                = PASS
scope boundary                             = PASS
Chromium required                          = false
```

Node Test run `30223974861` completed successfully on PR #387 head `fdf10eb32895fb5ae06f197899a4bb42a3d1051e`. Exact metrics are frozen into the manifest; the final head must re-run CI before merge.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_W3_FRACTION_DOMAIN_VALIDATOR_PRODUCTION_ADMITTED
GOAL_DISTANCE_AFTER  = D1_W3_TWO_DOMAIN_VALIDATORS_PRODUCTION_ADMITTED
DISTANCE_REDUCED     = The decimal-domain validator now provides exact base-10 magnitude, coefficient-digit, scale, range, pair-relation and canonical-set validation for its 51-KP cohort through the admitted decimal number-system consumer.
REMAINING_BLOCKERS   = [three W3 capabilities remain contract-only; 48 decimal-validator-dependent new-product rows remain product-blocked; three protected D0 rows require post-admission compatibility revalidation]
NEXT_SHORTEST_STEP   = P03B5_W3FractionArithmeticAdmission
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
