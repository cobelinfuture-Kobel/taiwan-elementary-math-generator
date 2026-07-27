# P03B7 W3 Mixed Number Domain Normalization Admission Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03B7_W3MixedNumberDomainNormalizationAdmission
STATUS     = IMPLEMENTED_PENDING_EXACT_HEAD_CI
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## Capability admission

```text
capabilityId             = cap_mixed_number_domain_normalization
historical R04 status    = contract_only
P03B7 successor status   = production_admitted
source domains           = FRACTION + DECIMAL
fraction authority       = P03B1 + P03B3
base-10 authority        = P03B2 + P03B4
arithmetic gates         = P03B5 + P03B6
```

P03B7 extends P03B6's latest validated successor promotion authority. R04 remains unchanged.

## Exact cohort

```text
effective dependent KnowledgePoints = PENDING_EXACT_HEAD_CI
direct W3 KnowledgePoints            = PENDING_EXACT_HEAD_CI
direct capability requirement rows   = PENDING_EXACT_HEAD_CI
protected existing D0 rows           = PENDING_EXACT_HEAD_CI
new-product dependent rows           = PENDING_EXACT_HEAD_CI
dependent source nodes               = PENDING_EXACT_HEAD_CI
source / KP bindings                 = PENDING_EXACT_HEAD_CI
P03B1 descriptor coverage            = PENDING_EXACT_HEAD_CI
P03B2 descriptor coverage            = PENDING_EXACT_HEAD_CI
P03B3 descriptor coverage            = PENDING_EXACT_HEAD_CI
P03B4 descriptor coverage            = PENDING_EXACT_HEAD_CI
descriptor errors                    = PENDING_EXACT_HEAD_CI
```

## Normalization surface

```text
TO_FRACTION
TO_DECIMAL
EQUIVALENCE
COMPARE
```

Exact behaviors:

```text
exact decimal coefficient / 10^scale to reduced fraction
exact terminating fraction or mixed number to base-10 decimal
recurring fraction-to-decimal conversion fail close
cross-domain equivalence by reduced rational identity
cross-domain comparison by BigInt cross multiplication
P03B1/P03B2 canonical normalization
P03B3/P03B4 source and target policy validation
no floating-point approximation or truncation
```

## Product boundary

```text
protected D0 rows              = PENDING_EXACT_HEAD_CI
new-product rows               = PENDING_EXACT_HEAD_CI
new products admitted by P03B7 = 0
visible output changed          = false
```

## Promotion state

```text
inherited effective promotions = 11
new W3 promotions              = 1
effective promotions           = 12
remaining W3 contract-only     = 0
```

## Exact-head acceptance

```text
full Node regression                       = PENDING_EXACT_HEAD_CI
milestone claim integrity                  = PENDING_EXACT_HEAD_CI
hardening queue entry                      = PENDING_EXACT_HEAD_CI
six-capability hardening gate              = PENDING_EXACT_HEAD_CI
P03B6 predecessor promotion                = PENDING_EXACT_HEAD_CI
mixed-domain cohort                        = PENDING_EXACT_HEAD_CI
source / KP binding sweep                  = PENDING_EXACT_HEAD_CI
P03B1 descriptor coverage                  = PENDING_EXACT_HEAD_CI
P03B2 descriptor coverage                  = PENDING_EXACT_HEAD_CI
P03B3 descriptor coverage                  = PENDING_EXACT_HEAD_CI
P03B4 descriptor coverage                  = PENDING_EXACT_HEAD_CI
decimal-to-fraction normalization           = PENDING_EXACT_HEAD_CI
terminating fraction-to-decimal             = PENDING_EXACT_HEAD_CI
mixed-number input                         = PENDING_EXACT_HEAD_CI
cross-domain equivalence                   = PENDING_EXACT_HEAD_CI
cross-domain comparison                    = PENDING_EXACT_HEAD_CI
non-terminating decimal fail close         = PENDING_EXACT_HEAD_CI
same-domain fail close                     = PENDING_EXACT_HEAD_CI
overflow fail close                        = PENDING_EXACT_HEAD_CI
invalid input fail close                   = PENDING_EXACT_HEAD_CI
promotion status                           = PENDING_EXACT_HEAD_CI
historical R04 preservation                = PENDING_EXACT_HEAD_CI
scope boundary                             = PENDING_EXACT_HEAD_CI
Chromium required                          = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_W3_TWO_ARITHMETIC_CAPABILITIES_PRODUCTION_ADMITTED
GOAL_DISTANCE_AFTER  = D1_W3_ALL_CONTRACT_CAPABILITIES_PRODUCTION_ADMITTED
DISTANCE_REDUCED     = The final W3 contract capability now provides one exact authority for fraction/decimal conversion, equivalence and comparison without recurring-decimal approximation.
REMAINING_BLOCKERS   = [W3-dependent product rows remain product-blocked until capability closeout and product-unblock reconciliation]
NEXT_SHORTEST_STEP   = P03C_W3CapabilityCloseoutAndProductUnblockReconciliation
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
