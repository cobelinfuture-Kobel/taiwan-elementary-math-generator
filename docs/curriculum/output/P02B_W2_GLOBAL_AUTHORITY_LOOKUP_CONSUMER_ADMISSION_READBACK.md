# P02B W2 Global Authority Lookup Consumer Admission Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02B_W2GlobalAuthorityLookupConsumerAdmission
STATUS     = IMPLEMENTED_PENDING_EXACT_HEAD_CI
EVIDENCE   = E5_PRODUCTION_ADMITTED_PENDING_CI
```

## Admitted capability

```text
capability                       = cap_kp_authority_lookup
historical R04 status            = shadow_available
effective successor status       = production_admitted
promotion authority              = P02B
consumer mode                    = PRODUCTION_READ_ONLY_GLOBAL_AUTHORITY
```

R04 remains an immutable historical baseline. P02B is the validated successor authority for the effective delivery status.

## Scope

```text
global source nodes              = 79
canonical KnowledgePoints        = 482
current public source nodes      = 19
promoted W2 foundations          = 1
remaining shadow foundations     = 4
```

## Consumer lineage

```text
R02 reconciled authority
→ P02B source/KP maps
→ source lookup
→ KnowledgePoint lookup
→ source/KP pair validation
→ fail-closed capability validator
→ P02B promotion registry
```

No KnowledgePoint content is copied into P02B. Source and KP descriptors are materialized directly from R02 on every consumer materialization.

## Fail-closed behavior

```text
empty request          → P02B_LOOKUP_ID_REQUIRED
unknown source         → P02B_UNKNOWN_SOURCE_NODE
unknown KnowledgePoint → P02B_UNKNOWN_KNOWLEDGE_POINT
source/KP mismatch     → P02B_SOURCE_KP_MISMATCH
```

## Promotion boundary

Promoted:

```text
cap_kp_authority_lookup
```

Still shadow:

```text
cap_prerequisite_readiness
cap_quantity_dimension_unit_identity
cap_quantity_semantic_role_binding
cap_same_unit_quantity_arithmetic
```

## Product boundary

```text
public UI changed             = false
PatternSpec implemented       = false
generator implemented         = false
worksheet implemented         = false
renderer changed              = false
existing 19-source product    = preserved
P03-P08 started               = false
```

## Acceptance pending exact-head CI

- exact 79 unique source descriptors;
- exact 482 unique KP descriptors;
- complete source↔KP round trips;
- all 19 public sources resolve;
- unknown and mismatched identities fail closed;
- exactly one promotion;
- R04 historical baseline unchanged;
- full Node regression and milestone-claim integrity.

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_W2_EVIDENCE_GAPS_AND_HARDENING_ORDER_CLOSED
GOAL_DISTANCE_AFTER  = D1_GLOBAL_AUTHORITY_LOOKUP_IMPLEMENTED_PENDING_CI
DISTANCE_REDUCED     = The first W2 foundation has a complete 79-source / 482-KP read-only production consumer and successor promotion authority pending exact-head verification.
REMAINING_BLOCKERS   = [exact-head CI, four W2 foundations remain shadow]
NEXT_SHORTEST_STEP   = P02C_W2QuantityDimensionUnitIdentityContractAndConsumerAdmission
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
