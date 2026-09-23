# P02B W2 Global Authority Lookup Consumer Admission Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02B_W2GlobalAuthorityLookupConsumerAdmission
STATUS     = PASS_EXACT_HEAD_CI_READY_TO_MERGE
EVIDENCE   = E5_PRODUCTION_ADMITTED
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

## Exact scope

```text
global canonical source nodes    = 79
canonical KnowledgePoints        = 482
source → KP bindings             = 511
KP → source bindings             = 511
current public source IDs        = 19
public compatibility aliases     = 1
promoted W2 foundations          = 1
remaining shadow foundations     = 4
```

The public product ID `g5a_u02_5a02` is a read-only compatibility alias over:

```text
g5a_u02_5a02a
g5a_u02_5a02a1
```

It does not create an 80th Global source node.

## Consumer lineage

```text
R02 reconciled authority
→ P02B canonical source/KP maps
→ read-only compatibility source aliases
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
broken alias target    → P02B_SOURCE_ALIAS_TARGET_MISSING
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

## Acceptance

```text
full Node regression                 = 2342 / 2342 PASS
canonical source round trip          = 79 / 79 PASS
canonical KnowledgePoint round trip  = 482 / 482 PASS
source / KP bindings                 = 511 / 511 PASS
current public source lookup         = 19 / 19 PASS
unknown identity fail closed         = PASS
source / KP mismatch fail closed     = PASS
premature expanded promotion blocked = PASS
R04 historical baseline preserved    = PASS
Chromium required                     = false
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

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_W2_EVIDENCE_GAPS_AND_HARDENING_ORDER_CLOSED
GOAL_DISTANCE_AFTER  = D1_GLOBAL_AUTHORITY_LOOKUP_PRODUCTION_ADMITTED
DISTANCE_REDUCED     = The first W2 shared foundation now resolves all 79 canonical source nodes and 482 canonical KnowledgePoints through one production-admitted read-only consumer with complete bidirectional identity validation and fail-closed compatibility alias handling.
REMAINING_BLOCKERS   = [four W2 foundations remain shadow]
NEXT_SHORTEST_STEP   = P02C_W2QuantityDimensionUnitIdentityContractAndConsumerAdmission
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
