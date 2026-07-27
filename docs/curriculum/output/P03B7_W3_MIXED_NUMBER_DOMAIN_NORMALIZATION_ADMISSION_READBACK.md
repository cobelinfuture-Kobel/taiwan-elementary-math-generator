# P03B7 W3 Mixed Number Domain Normalization Admission Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03B7_W3MixedNumberDomainNormalizationAdmission
STATUS     = PASS_EXACT_HEAD_CI_READY_TO_MERGE
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
effective dependent KnowledgePoints = 5
direct W3 KnowledgePoints            = 3
direct capability requirement rows   = 5
protected existing D0 rows           = 0
new-product dependent rows           = 5
dependent source nodes               = 1
source / KP bindings                 = 5
P03B1 descriptor coverage            = 5 / 5
P03B2 descriptor coverage            = 5 / 5
P03B3 descriptor coverage            = 5 / 5
P03B4 descriptor coverage            = 5 / 5
descriptor errors                    = 0
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
0 protected D0 rows  → no existing D0 compatibility row in this cohort
5 new-product rows   → remain product-blocked
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
full Node regression                       = 2449 / 2449 PASS
milestone claim integrity                  = PASS
hardening queue entry                      = PASS
six-capability hardening gate              = PASS
P03B6 predecessor promotion                = PASS
mixed-domain cohort                        = 5 / 5 PASS
direct W3 cohort                           = 3 / 3 PASS
direct requirement rows                    = 5 / 5 PASS
dependent source nodes                     = 1 / 1 PASS
source / KP binding sweep                  = 5 / 5 PASS
P03B1 descriptor coverage                  = 5 / 5 PASS
P03B2 descriptor coverage                  = 5 / 5 PASS
P03B3 descriptor coverage                  = 5 / 5 PASS
P03B4 descriptor coverage                  = 5 / 5 PASS
decimal-to-fraction normalization          = PASS
terminating fraction-to-decimal            = PASS
mixed-number input                         = PASS
cross-domain equivalence                   = PASS
cross-domain comparison                    = PASS
non-terminating decimal fail close         = PASS
same-domain fail close                     = PASS
overflow fail close                        = PASS
invalid input fail close                   = PASS
promotion status                           = PASS
historical R04 preservation                = PASS
scope boundary                             = PASS
Chromium required                          = false
```

Node Test run `30228277451` completed successfully on PR #396 head `a48f46f67e2a3fbed80c822f6edc2d715a84c38d`. Exact metrics are frozen into the manifest; the final head must re-run CI before merge.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_W3_TWO_ARITHMETIC_CAPABILITIES_PRODUCTION_ADMITTED
GOAL_DISTANCE_AFTER  = D1_W3_ALL_CONTRACT_CAPABILITIES_PRODUCTION_ADMITTED
DISTANCE_REDUCED     = The final W3 contract capability now provides one exact authority for fraction/decimal conversion, equivalence and comparison for its 5-KP cohort without recurring-decimal approximation.
REMAINING_BLOCKERS   = [five mixed-domain-dependent new-product rows remain product-blocked; the complete W3 successor capability set still requires closeout and product-unblock reconciliation]
NEXT_SHORTEST_STEP   = P03C_W3CapabilityCloseoutAndProductUnblockReconciliation
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
