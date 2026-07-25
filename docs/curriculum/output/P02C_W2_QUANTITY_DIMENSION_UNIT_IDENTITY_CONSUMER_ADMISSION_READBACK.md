# P02C W2 Quantity Dimension / Unit Identity Consumer Admission Readback

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02C_W2QuantityDimensionUnitIdentityContractAndConsumerAdmission
STATUS     = IMPLEMENTED_PENDING_EXACT_HEAD_CI
EVIDENCE   = E5_PRODUCTION_ADMITTED_PENDING_CI
```

## Target capability

```text
capability                       = cap_quantity_dimension_unit_identity
historical R04 status            = shadow_available
effective successor status       = production_admitted pending CI
consumer mode                    = PRODUCTION_READ_ONLY_QUANTITY_IDENTITY
```

## Exact scope

```text
effective dependent KPs          = 51
dependent source nodes           = 20
identity cardinality             = exactly one per dependent KP
inherited W2 promotions          = 1
new W2 promotions                = 1
remaining shadow foundations     = 3
```

## Runtime lineage

```text
P02 51-KP dependency inventory
→ P02B Global authority consumer
→ primary runtime profile
→ contract dimension rule
→ read-only dimension / unit-family identity
→ source/KP pair validation
→ fail-closed validator
→ P02C successor promotion registry
```

## Scope exclusions

```text
unit conversion              = false
quantity semantic roles      = false
same-unit arithmetic         = false
PatternSpec implementation   = false
generator implementation     = false
worksheet implementation     = false
renderer change              = false
public UI change             = false
P03-P08 started              = false
```

## Acceptance pending exact-head CI

- 51 / 51 dependent KPs classified exactly once;
- 20 / 20 source nodes represented;
- all canonical source/KP bindings round-trip through P02B;
- unknown and non-dependent KPs fail closed;
- wrong source, dimension and unit assertions fail closed;
- P02B promotion remains effective;
- exactly one new P02C promotion;
- full Node regression passes;
- Chromium correctly skipped.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_GLOBAL_AUTHORITY_LOOKUP_PRODUCTION_ADMITTED
GOAL_DISTANCE_AFTER  = D1_QUANTITY_IDENTITY_IMPLEMENTED_PENDING_CI
DISTANCE_REDUCED     = The second W2 foundation has a complete 51-KP / 20-source read-only quantity identity consumer and successor promotion authority pending exact-head verification.
REMAINING_BLOCKERS   = [exact-head CI, three W2 foundations remain shadow]
NEXT_SHORTEST_STEP   = P02D_W2PrerequisiteReadinessConsumerAdmission
```

```text
IMPLEMENTATION_BOUNDARY = true
SEPARATE_APPROVAL_REQUIRED = true
```
