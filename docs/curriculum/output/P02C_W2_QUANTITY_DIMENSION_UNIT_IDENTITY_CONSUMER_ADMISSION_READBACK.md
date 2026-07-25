# P02C W2 Quantity Dimension / Unit Identity Consumer Admission Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02C_W2QuantityDimensionUnitIdentityContractAndConsumerAdmission
STATUS     = PASS_EXACT_HEAD_CI_READY_TO_MERGE
EVIDENCE   = E5_PRODUCTION_ADMITTED
```

## Admitted capability

```text
capability                       = cap_quantity_dimension_unit_identity
historical R04 status            = shadow_available
effective successor status       = production_admitted
consumer mode                    = PRODUCTION_READ_ONLY_QUANTITY_IDENTITY
```

R04 remains an immutable historical baseline. P02C extends the validated P02B successor authority without rewriting prior evidence.

## Exact scope

```text
effective dependent KPs          = 51
classified identities            = 51
dependent source nodes           = 20
source / KP identity bindings    = 57
identity cardinality             = exactly one per dependent KP
inherited W2 promotions          = 1
new W2 promotions                = 1
effective W2 promotions          = 2
remaining shadow foundations     = 3
```

## Dimension distribution

```text
TIME                         = 14
LENGTH                       = 10
MASS                         = 7
CAPACITY                     = 5
SPEED                        = 5
SCALAR_MEASUREMENT           = 5
SOURCE_DECLARED_QUANTITY     = 5
TOTAL                        = 51
```

`SOURCE_DECLARED_QUANTITY` is used only for five cross-dimension KPs whose source authority allows more than one valid projection, such as length, capacity, mass, item count or another source-declared quantity. P02C does not choose one metric dimension arbitrarily.

An additional five `SCALAR_MEASUREMENT` identities preserve source-declared measurement units when the source establishes measurement semantics but does not authorize one fixed metric unit family.

Therefore:

```text
source-declared identity modes = 10
unit conversion allowed        = false
free-form dimension inference  = false
```

## Runtime lineage

```text
P02 51-KP dependency inventory
→ P02B Global authority consumer
→ R04 primary runtime profile
→ P02C contract dimension rule
→ read-only dimension / unit-family identity
→ source / KP pair validation
→ fail-closed validator
→ P02C successor promotion registry
```

No KnowledgePoint content is copied into P02C. The consumer materializes its identities from P02, P02B and R04 authorities.

## Fail-closed behavior

```text
missing KP ID                → P02C_QUANTITY_KP_ID_REQUIRED
unknown KP                   → P02C_UNKNOWN_KNOWLEDGE_POINT
non-dependent Global KP      → P02C_KP_NOT_QUANTITY_IDENTITY_DEPENDENT
invalid primary profile      → P02C_PRIMARY_PROFILE_INVALID
unclassified identity        → P02C_QUANTITY_IDENTITY_UNCLASSIFIED
ambiguous identity           → P02C_QUANTITY_IDENTITY_AMBIGUOUS
source / KP mismatch         → P02C_SOURCE_KP_MISMATCH
wrong asserted dimension     → P02C_DIMENSION_ID_MISMATCH
wrong asserted unit          → P02C_UNIT_ID_MISMATCH
```

## Promotion boundary

Production admitted:

```text
cap_kp_authority_lookup
cap_quantity_dimension_unit_identity
```

Still shadow:

```text
cap_prerequisite_readiness
cap_quantity_semantic_role_binding
cap_same_unit_quantity_arithmetic
```

## Acceptance

```text
full Node regression                 = 2348 / 2348 PASS
dependent KP identities              = 51 / 51 PASS
dependent source nodes               = 20 / 20 PASS
source / KP identity bindings        = 57 / 57 PASS
classification errors                = 0
non-dependent Global KP fail closed  = PASS
unknown identity fail closed         = PASS
source / KP mismatch fail closed     = PASS
dimension mismatch fail closed       = PASS
unit mismatch fail closed            = PASS
cross-dimension identity preservation = PASS
P02B promotion preserved             = PASS
exactly one new P02C promotion       = PASS
R04 historical baseline preserved    = PASS
Chromium required                    = false
```

## Product boundary

```text
unit conversion              = false
quantity semantic roles      = false
same-unit arithmetic         = false
PatternSpec implemented      = false
generator implemented        = false
worksheet implemented        = false
renderer changed             = false
public UI changed            = false
existing 19-source product   = preserved
P03-P08 started              = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_GLOBAL_AUTHORITY_LOOKUP_PRODUCTION_ADMITTED
GOAL_DISTANCE_AFTER  = D1_QUANTITY_IDENTITY_PRODUCTION_ADMITTED
DISTANCE_REDUCED     = The second W2 shared foundation now resolves all 51 effective dependent KnowledgePoints and 20 source nodes through one production-admitted read-only quantity identity consumer, with 57 validated source/KP bindings and fail-closed handling for concrete, generic and cross-dimension identities.
REMAINING_BLOCKERS   = [cap_prerequisite_readiness, cap_quantity_semantic_role_binding, cap_same_unit_quantity_arithmetic]
NEXT_SHORTEST_STEP   = P02D_W2PrerequisiteReadinessConsumerAdmission
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
