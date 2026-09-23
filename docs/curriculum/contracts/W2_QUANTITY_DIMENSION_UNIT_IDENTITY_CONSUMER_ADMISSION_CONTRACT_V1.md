# W2 Quantity Dimension / Unit Identity Consumer Admission Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02C_W2QuantityDimensionUnitIdentityContractAndConsumerAdmission
CAPABILITY = cap_quantity_dimension_unit_identity
```

## 1. Purpose

Admit one production read-only shared consumer that resolves a canonical quantity dimension and unit-family identity for every KnowledgePoint that effectively depends on `cap_quantity_dimension_unit_identity`.

This contract does not implement unit conversion, quantity semantic roles, same-unit arithmetic, PatternSpecs, generators, worksheet output, rendering or public UI.

## 2. Authority lineage

```text
R02 Global KnowledgePoint authority
→ R04 semantic runtime profile assignment
→ R05 effective capability closure
→ P02 51-KP dependency inventory
→ P02B Global authority lookup consumer
→ P02C quantity dimension / unit identity consumer
→ P02C fail-closed validator
→ P02C successor capability-promotion registry
```

P02C must not copy KnowledgePoint content or create a second curriculum registry.

## 3. Exact scope

```text
effective dependent KnowledgePoints = 51
dependent source nodes              = 20
identity cardinality                = exactly one per dependent KP
consumer mode                       = PRODUCTION_READ_ONLY_QUANTITY_IDENTITY
```

Allowed primary runtime profiles:

```text
profile_quantity_measurement
profile_time
profile_speed_rate
```

Any other primary profile fails closed.

## 4. Identity model

Each admitted identity contains:

```text
identityId
knowledgePointId
primaryRuntimeProfileId
classificationRuleId
dimensionId
unitFamilyId
canonicalUnitIds[]
unitIdentityMode
sourceNodeIds[]
assignedDeliveryWaveId
authorityMode
consumerMode
productionAdmissionState
```

Every identity explicitly declares:

```text
conversionAllowed           = false
semanticRoleBindingAllowed  = false
quantityArithmeticAllowed   = false
```

## 5. Dimension rules

Fixed profile identities:

```text
profile_time       → TIME / TIME_DURATION_AND_CLOCK
profile_speed_rate → SPEED / DISTANCE_PER_TIME
```

`profile_quantity_measurement` is classified by contract terms into:

```text
MASS
CAPACITY
LENGTH
```

When the source authority establishes a measurement KP but does not identify one of those concrete metric families, the identity is:

```text
SCALAR_MEASUREMENT
SOURCE_DECLARED_MEASUREMENT_UNIT
SOURCE_DECLARED_ONLY
```

This fallback preserves the source-declared identity. It does not authorize conversion or infer a concrete unit.

## 6. Fail-closed behavior

```text
missing KP ID                  → P02C_QUANTITY_KP_ID_REQUIRED
unknown KP                     → P02C_UNKNOWN_KNOWLEDGE_POINT
non-dependent KP               → P02C_KP_NOT_QUANTITY_IDENTITY_DEPENDENT
invalid primary profile        → P02C_PRIMARY_PROFILE_INVALID
no matching identity           → P02C_QUANTITY_IDENTITY_UNCLASSIFIED
multiple matching identities   → P02C_QUANTITY_IDENTITY_AMBIGUOUS
source / KP mismatch           → P02C_SOURCE_KP_MISMATCH
wrong asserted dimension       → P02C_DIMENSION_ID_MISMATCH
wrong asserted unit            → P02C_UNIT_ID_MISMATCH
```

No request may fall back to free-form inference, legacy batch labels or source-title-only classification.

## 7. Promotion rule

Historical R04 remains unchanged:

```text
cap_quantity_dimension_unit_identity = shadow_available
```

After exact-head validation, P02C becomes the successor effective-status authority:

```text
cap_kp_authority_lookup                 = production_admitted (inherited from P02B)
cap_quantity_dimension_unit_identity    = production_admitted (new in P02C)
```

Remaining shadow foundations:

```text
cap_prerequisite_readiness
cap_quantity_semantic_role_binding
cap_same_unit_quantity_arithmetic
```

## 8. Acceptance

P02C closes only when all conditions pass:

1. exactly 51 dependent KPs are present;
2. exactly 51 unique identities are materialized;
3. exactly 20 dependent source nodes are covered;
4. every canonical source/KP binding round-trips through P02B;
5. every identity accepts its own dimension and one canonical unit;
6. unknown, non-dependent, mismatched dimension, unit and source requests fail closed;
7. P02B promotion remains effective;
8. exactly one new promotion is added;
9. conversion, semantic-role and arithmetic scope remain disabled;
10. full Node regression passes on the exact PR head.

Chromium is not required because visible output is unchanged.

## 9. Boundary

```text
public UI change             = forbidden
PatternSpec implementation   = forbidden
generator implementation     = forbidden
worksheet implementation     = forbidden
renderer change              = forbidden
unit conversion              = deferred
semantic role binding        = deferred
same-unit arithmetic         = deferred
P03-P08 implementation       = forbidden
```

## 10. Next boundary

```text
NEXT_TASK = P02D_W2PrerequisiteReadinessConsumerAdmission
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
