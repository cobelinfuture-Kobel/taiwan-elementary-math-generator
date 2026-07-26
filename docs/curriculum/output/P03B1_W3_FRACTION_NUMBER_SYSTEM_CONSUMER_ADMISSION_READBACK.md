# P03B1 W3 Fraction Number System Consumer Admission Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03B1_W3FractionNumberSystemConsumerAdmission
STATUS     = PASS_CI_SYNCED_AND_MERGED
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## GitHub closeout

```text
IMPLEMENTATION_PR = #379
IMPLEMENTATION_HEAD_SHA = 99d49b0b11362fdddb4f4ff3d3464c642bfa6084
IMPLEMENTATION_MERGE_SHA = 2abb96d80c53ef7ea5646c7c090f90af5d75771e
IMPLEMENTATION_PR_STATE = MERGED
```

## Capability transition

```text
cap_fraction_number_system

historical R04 status  = contract_only
P03B1 successor status = production_admitted
```

The historical R04 capability matrix remains unchanged. Effective status is supplied by the validated P03B1 successor promotion registry.

## Exact cohort

```text
effective dependent KnowledgePoints = 73
direct W3 KnowledgePoints            = 40
direct capability requirement rows   = 47
inherited capability closure rows    = 26
protected existing D0 rows           = 1
new-product rows                      = 72
dependent source nodes               = 18
source / KP bindings                 = 83
descriptor errors                    = 0
```

The 47 direct requirement rows and 26 inherited closure rows use the same shared number-system consumer. Capability admission does not alter their final delivery wave or product state.

## Runtime contract

```text
numeric domain          = NON_NEGATIVE_RATIONAL
input forms             = SAFE_INTEGER / FRACTION / MIXED_NUMBER
canonical form          = REDUCED_IMPROPER_FRACTION
mixed projection        = WHOLE_NUMBER_PLUS_PROPER_REMAINDER
intermediate model      = exact BigInt
floating approximation  = forbidden
negative values         = forbidden
zero                    = canonical 0 / 1
```

Allowed:

```text
NORMALIZE
EQUIVALENCE
COMPARE
EXPAND_EQUIVALENT
```

Excluded:

```text
fraction arithmetic
fraction-domain validator promotion
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

All reductions, comparisons and expansions use exact integer intermediates. Equivalent expansion changes the representation but preserves the canonical reduced value.

## Fail-closed behavior

```text
missing / unknown / non-cohort KnowledgePoint = blocked
source / KP mismatch                          = blocked
capability assertion mismatch                 = blocked
unsupported arithmetic action such as ADD    = blocked
JavaScript decimal number input               = blocked
zero or invalid denominator                   = blocked
malformed mixed number                        = blocked
missing comparison value                      = blocked
non-positive expansion factor                 = blocked
unsafe canonical or expanded result           = blocked
```

## Promotion and product boundary

```text
newly production admitted = cap_fraction_number_system
inherited W2 promotions   = 5
effective promotions      = 6
remaining W3 contract-only capabilities = 6

protected existing D0 admission change = false
new product admission                   = false
public UI or visible output change      = false
```

Still contract-only:

```text
cap_decimal_number_system
cap_fraction_domain_validator
cap_decimal_domain_validator
cap_fraction_arithmetic
cap_decimal_arithmetic
cap_mixed_number_domain_normalization
```

The one protected D0 row retains its existing product admission. The other 72 rows remain product-blocked; only their shared fraction representation dependency is admitted.

## Acceptance

```text
full Node regression                    = 2398 / 2398 PASS
milestone claim integrity               = PASS
hardening queue entry                   = PASS
capability cohort                       = 73 / 73 PASS
direct W3 cohort                        = 40 / 40 PASS
direct requirement rows                 = 47 / 47 PASS
dependent sources                       = 18 / 18 PASS
source / KP bindings                    = 83 / 83 PASS
descriptor errors                       = 0
safe integer normalization              = PASS
fraction reduction                      = PASS
improper fraction projection            = PASS
mixed-number normalization              = PASS
zero canonicalization                   = PASS
exact equivalence                       = PASS
exact ordering                          = PASS
equivalent expansion                    = PASS
invalid input fail close                = PASS
arithmetic scope fail close             = PASS
promotion status                        = PASS
historical R04 preservation             = PASS
scope boundary                          = PASS
Chromium required                       = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_W3_DEPENDENCY_SAFE_HARDENING_QUEUE_AND_EVIDENCE_GAPS_RECONCILED
GOAL_DISTANCE_AFTER  = D1_W3_FRACTION_NUMBER_SYSTEM_PRODUCTION_ADMITTED
DISTANCE_REDUCED     = The first W3 root capability now has a production deterministic exact-rational representation consumer across 73 dependent KnowledgePoints, 18 source nodes and 83 source/KP bindings, with exact normalization, projection, equivalence and ordering while arithmetic and product admission remain fail closed.
REMAINING_BLOCKERS   = [six W3 capabilities remain contract-only; 72 fraction-dependent new-product rows remain product-blocked; one protected D0 row requires post-admission compatibility revalidation]
NEXT_SHORTEST_STEP   = P03B2_W3DecimalNumberSystemConsumerAdmission
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
