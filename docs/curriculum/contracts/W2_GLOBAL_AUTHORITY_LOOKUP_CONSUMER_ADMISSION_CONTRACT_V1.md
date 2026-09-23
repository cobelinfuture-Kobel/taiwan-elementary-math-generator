# W2 Global Authority Lookup Consumer Admission Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02B_W2GlobalAuthorityLookupConsumerAdmission
CAPABILITY = cap_kp_authority_lookup
MODE       = PRODUCTION_READ_ONLY_GLOBAL_AUTHORITY
```

## Purpose

P02B admits the first R05-W2 shared foundation by placing a fail-closed read-only consumer over the existing R02 Global KnowledgePoint authority.

```text
R02 79-source / 482-KP authority
→ P02B production read-only lookup consumer
→ source / KP / source-KP pair validation
→ capability-specific validator
→ successor promotion authority
```

P02B does not copy or fork R02 KnowledgePoint content. R02 remains the sole canonical source/KP registry; P02B is a consumer and promotion record only.

## Required scope

```text
global source nodes        = 79
canonical KnowledgePoints  = 482
current public sources     = 19
promoted capabilities      = 1
remaining W2 foundations   = 4
```

## Consumer operations

The consumer must support:

1. source-node lookup;
2. KnowledgePoint lookup;
3. source/KnowledgePoint pair validation;
4. source-to-KP round trip;
5. KP-to-source round trip;
6. read-only production metadata;
7. deterministic fail-closed responses.

## Fail-closed codes

```text
P02B_LOOKUP_ID_REQUIRED
P02B_UNKNOWN_SOURCE_NODE
P02B_UNKNOWN_KNOWLEDGE_POINT
P02B_SOURCE_KP_MISMATCH
```

No unknown or mismatched identity may fall through to a legacy, inferred or free-form authority.

## Promotion authority

R04 remains the historical capability-matrix baseline and is not rewritten. P02B creates a validated successor promotion authority:

```text
cap_kp_authority_lookup
shadow_available
→ production_admitted
```

Only this capability may be promoted. The following remain shadow:

```text
cap_prerequisite_readiness
cap_quantity_dimension_unit_identity
cap_quantity_semantic_role_binding
cap_same_unit_quantity_arithmetic
```

## Hard boundaries

```text
parallel KP registry          = forbidden
KnowledgePoint content copy   = forbidden
PatternSpec implementation    = forbidden
generator implementation      = forbidden
worksheet implementation      = forbidden
renderer implementation       = forbidden
public UI change              = forbidden
P03-P08 implementation        = forbidden
existing 19-source product    = protected
recursive-improvement admin   = forbidden before P10
```

## Acceptance

- exactly 79 unique source descriptors;
- exactly 482 unique KnowledgePoint descriptors;
- every source has at least one KP;
- every KP has at least one source;
- complete bidirectional round-trip parity;
- all nineteen current public sources resolve;
- empty, unknown and mismatched identities fail closed;
- R04 historical status remains `shadow_available`;
- P02B successor status is `production_admitted`;
- exactly one capability promoted;
- full Node regression and milestone-claim integrity pass.

## Closeout transition

```text
before = authority lookup has partial production evidence for 19 / 79 sources

after  = one production read-only consumer resolves all 79 sources and 482 KPs

next   = P02C_W2QuantityDimensionUnitIdentityContractAndConsumerAdmission
```
