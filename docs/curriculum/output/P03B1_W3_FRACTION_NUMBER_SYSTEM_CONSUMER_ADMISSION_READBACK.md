# P03B1 W3 Fraction Number System Consumer Admission Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03B1_W3FractionNumberSystemConsumerAdmission
STATUS     = IMPLEMENTED_PENDING_EXACT_HEAD_CI
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## Capability transition

```text
cap_fraction_number_system

historical R04 status = contract_only
P03B1 successor status = production_admitted
```

## Exact cohort

```text
effective dependent KnowledgePoints = 73
direct W3 KnowledgePoints            = 40
protected existing D0 rows           = 1
new-product rows                     = 72
dependent source nodes               = pending exact-head readback
source / KP bindings                 = pending exact-head readback
direct requirement rows              = pending exact-head readback
```

## Runtime contract

```text
numeric domain         = NON_NEGATIVE_RATIONAL
input forms            = SAFE_INTEGER / FRACTION / MIXED_NUMBER
canonical form         = REDUCED_IMPROPER_FRACTION
mixed projection       = WHOLE_NUMBER_PLUS_PROPER_REMAINDER
intermediate model     = exact BigInt
floating approximation = forbidden
```

Allowed:

```text
normalize
equivalence
exact ordering
equivalent representation expansion
```

Excluded:

```text
fraction arithmetic
decimal conversion
cross-domain normalization
question generation
PatternSpec / generator / worksheet / renderer / UI
new product admission
```

## Deterministic witnesses

```text
3       → 3/1
2/4     → 1/2
7/3     → 7/3 → 2 1/3
1 2/4   → 3/2 → 1 1/2
0/9     → 0/1

2/4 ≡ 1/2
3/4 > 2/3
1/2 expanded by 3 → 3/6
```

## Product boundary

The one protected D0 row retains its existing product admission. The other 72 rows remain product-blocked; only their shared fraction representation dependency is admitted.

## Acceptance

```text
full Node regression                    = pending
hardening queue entry                   = pending
cohort sweep                            = pending
source / KP binding sweep               = pending
safe integer normalization              = pending
fraction reduction                      = pending
improper fraction projection            = pending
mixed-number normalization              = pending
zero canonicalization                   = pending
exact equivalence                       = pending
exact ordering                          = pending
equivalent expansion                    = pending
invalid input fail close                = pending
arithmetic scope fail close             = pending
promotion status                        = pending
historical R04 preservation             = pending
scope boundary                          = pending
Chromium required                       = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_W3_DEPENDENCY_SAFE_HARDENING_QUEUE_AND_EVIDENCE_GAPS_RECONCILED
GOAL_DISTANCE_AFTER  = D1_W3_FRACTION_NUMBER_SYSTEM_PRODUCTION_ADMITTED
DISTANCE_REDUCED     = The first W3 root capability now has a production deterministic exact-rational representation consumer across 73 dependent KnowledgePoints.
REMAINING_BLOCKERS   = [six W3 capabilities remain contract-only; 72 fraction-dependent new-product rows remain product-blocked; one protected D0 row requires post-admission compatibility revalidation]
NEXT_SHORTEST_STEP   = P03B2_W3DecimalNumberSystemConsumerAdmission
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
