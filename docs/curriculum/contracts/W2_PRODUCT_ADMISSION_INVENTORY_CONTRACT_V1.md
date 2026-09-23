# W2 Product Admission Inventory Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02_W2ProductAdmissionInventoryAndGapMatrix
WAVE_ID    = R05-W2
MODE       = INVENTORY_ONLY
```

## Authoritative classification

R05-W2 is a **shared capability wave**, not a KnowledgePoint product cohort.

```text
direct R05-W2 KnowledgePoints = 0
R05-W2 capability-plan rows    = 5
cross-wave dependent KPs       = 51
```

P02 must not create a product vertical-slice task for an empty direct cohort. Instead, it must inventory the five shared foundations and every KnowledgePoint in W3-W8 or another assigned wave whose effective capability closure depends on them.

## Required authorities

```text
R02 canonical KnowledgePoints
→ R03 prerequisite graph
→ R04 shared runtime capability matrix
→ R05 capability and delivery-wave assignments
→ R07 Global-primary consumer authority
→ P01E nineteen-source public product baseline
```

The earlier POSTG application-program label `W02` is unrelated to the R05-W2 delivery wave and must not determine P02 membership.

## Five shared foundations

```text
rank 0  cap_kp_authority_lookup
rank 0  cap_quantity_dimension_unit_identity
rank 1  cap_prerequisite_readiness
rank 1  cap_quantity_semantic_role_binding
rank 1  cap_same_unit_quantity_arithmetic
```

`cap_prerequisite_readiness` depends on `cap_kp_authority_lookup`.
`cap_quantity_semantic_role_binding` and `cap_same_unit_quantity_arithmetic` depend on `cap_quantity_dimension_unit_identity`.

Authority lookup and prerequisite readiness are infrastructure capabilities and may have zero direct KnowledgePoint mappings while remaining mandatory shared foundations.

## Required capability row

Every R05-W2 capability-plan row must expose:

- capability identity and class;
- pre-P02 delivery status;
- dependency capability IDs;
- hardening sequence rank;
- direct and effective dependent KnowledgePoint counts;
- dependent KnowledgePoint, source-node and delivery-wave sets;
- current runtime evidence paths;
- explicit `HARDEN_AND_ADMIT_SHARED_CAPABILITY` next action;
- fail-closed `CAPABILITY_INVENTORIED_NOT_ADMITTED` state.

## Required dependency row

Every cross-wave dependent KnowledgePoint must expose:

- canonical identity and source references;
- actual assigned delivery wave and prerequisite rank;
- intersection with the five W2 foundation capabilities;
- required, effective, production, shadow and contract-only capability sets;
- current public source/KP/PatternSpec coverage;
- downstream product gap state;
- capability-first ordered next actions;
- fail-closed `DEPENDENCY_INVENTORIED_NOT_ADMITTED` state.

Contract-only capabilities on a downstream W3-W8 row do not constitute W2 drift; P02 records them only as later-wave blockers.

## Hard boundaries

```text
shared capability hardening      = forbidden
PatternSpec implementation       = forbidden
public source adapter change     = forbidden
public UI change                 = forbidden
production admission             = forbidden
W3-W8 implementation             = forbidden
existing nineteen-source product = protected
recursive-improvement admin      = forbidden before P10
```

## Acceptance

- direct R05-W2 KnowledgePoint count = 0;
- five exact shadow foundation capability IDs;
- 51 unique cross-wave dependent KnowledgePoints;
- capability dependency order materialized;
- source-node and delivery-wave distributions explicit;
- current product coverage and downstream gap states explicit;
- capability-first next actions on every dependent row;
- fabricated W2 product cohort fails closed;
- direct production admissions = 0;
- full Node regression and milestone-claim integrity pass.

## Closeout transition

```text
before = W1 publicly admitted; W2 incorrectly appears to be an undifferentiated product wave

after  = W2 is correctly defined as five shared foundations with a cross-wave dependency matrix

next   = P02A_W2ShadowFoundationHardeningOrderAndEvidenceReconciliation
```
