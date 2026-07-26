# P03B2 W3 Decimal Number System Consumer Admission Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03B2_W3DecimalNumberSystemConsumerAdmission
STATUS     = PASS_EXACT_HEAD_CI_READY_TO_MERGE
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## Capability admission

```text
capabilityId             = cap_decimal_number_system
historical R04 status    = contract_only
P03B2 successor status   = production_admitted
numericDomainId          = NON_NEGATIVE_DECIMAL
canonicalValueForm       = NORMALIZED_BASE10_COEFFICIENT_SCALE
```

P03B2 extends P03B1's validated successor authority. R04 remains unchanged.

## Exact cohort

```text
effective dependent KnowledgePoints = 51
direct W3 KnowledgePoints            = 45
direct capability requirement rows   = 46
protected existing D0 rows           = 3
new-product dependent rows           = 48
dependent source nodes               = 12
source / KP bindings                 = 51
descriptor errors                    = 0
```

## Exact decimal representation

Accepted input forms:

```text
SAFE_INTEGER
DECIMAL_STRING
SCALED_INTEGER
DECIMAL_PARTS
```

Canonical examples:

```text
3                      → 3
0012.3400              → 12.34
coefficient 500/scale3 → 0.5
whole 1 + digits 050   → 1.05
0.000                  → 0
```

Allowed actions:

```text
NORMALIZE
EQUIVALENCE
COMPARE
EXPAND_SCALE
```

All operations use exact BigInt intermediates. JavaScript fractional-number input, exponent notation, negative values, decimal arithmetic and fraction conversion fail closed.

## Product boundary

```text
3 protected D0 rows → existing product admission preserved
48 new-product rows → remain product-blocked
new products admitted by P03B2 = 0
visible output changed          = false
```

## Promotion state

```text
inherited effective promotions = 6
new W3 promotions              = 1
effective promotions           = 7
remaining W3 contract-only     = 5
```

## Exact-head acceptance

```text
full Node regression                     = 2405 / 2405 PASS
milestone claim integrity                = PASS
hardening queue entry                    = PASS
P03B1 predecessor promotion              = PASS
decimal cohort                           = 51 / 51 PASS
direct W3 cohort                         = 45 / 45 PASS
direct requirement rows                  = 46 / 46 PASS
dependent source nodes                   = 12 / 12 PASS
source / KP binding sweep                = 51 / 51 PASS
safe integer normalization               = PASS
decimal string normalization             = PASS
scaled integer normalization             = PASS
decimal parts normalization              = PASS
trailing-zero canonicalization           = PASS
zero canonicalization                    = PASS
exact equivalence                        = PASS
exact ordering                           = PASS
equivalent scale expansion               = PASS
invalid input fail close                 = PASS
arithmetic scope fail close              = PASS
promotion status                         = PASS
historical R04 preservation              = PASS
scope boundary                           = PASS
Chromium required                        = false
```

Node Test run `30208323860` completed successfully on PR #381 head `7ebe9763ca6ffa75da456e56c6fc1c6e941cffef`. The exact metrics above are now frozen into the manifest; the final head must re-run CI before merge.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_W3_FRACTION_NUMBER_SYSTEM_PRODUCTION_ADMITTED
GOAL_DISTANCE_AFTER  = D1_W3_TWO_ROOT_NUMBER_SYSTEMS_PRODUCTION_ADMITTED
DISTANCE_REDUCED     = The decimal root number-system capability now has an exact base-10 coefficient/scale consumer, deterministic validator, focused tests, integration tests and an E5 successor promotion claim for its 51-KP cohort.
REMAINING_BLOCKERS   = [five W3 capabilities remain contract-only; 48 decimal-dependent new-product rows remain product-blocked; three protected D0 rows require post-admission compatibility revalidation]
NEXT_SHORTEST_STEP   = P03B3_W3FractionDomainValidatorAdmission
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
