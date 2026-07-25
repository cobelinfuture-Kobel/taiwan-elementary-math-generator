# W2 Shadow Foundation Evidence Reconciliation Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P02A_W2ShadowFoundationHardeningOrderAndEvidenceReconciliation
MODE       = EVIDENCE_RECONCILIATION_ONLY
```

## Purpose

P02A determines whether any of the five R05-W2 `shadow_available` capabilities already have enough later evidence to be promoted, and freezes a dependency-safe hardening order for those that do not.

A production-admitted product claim is not automatically capability-specific evidence. Promotion requires all of the following:

```text
producer evidence >= E3
+ capability-specific production consumer >= E5
+ full global scope coverage
+ fail-closed capability validator
+ dependency-safe order
```

## Reconciled scope

```text
global source nodes          = 79
canonical KnowledgePoints    = 482
current public source nodes  = 19
W2 shared capabilities       = 5
```

## Hardening order

| Order | Capability | Current coverage | Target | Disposition |
|---:|---|---:|---:|---|
| 1 | `cap_kp_authority_lookup` | 19 sources | 79 sources | Partial production evidence |
| 2 | `cap_quantity_dimension_unit_identity` | 3 KPs | 51 dependent KPs | Partial production evidence |
| 3 | `cap_prerequisite_readiness` | 0 KPs | 482 KPs | Shadow only |
| 4 | `cap_quantity_semantic_role_binding` | 2 KPs | 26 dependent KPs | Partial production evidence |
| 5 | `cap_same_unit_quantity_arithmetic` | 0 KPs | 2 dependent KPs | Shadow only |

The order preserves both dependency roots:

```text
cap_kp_authority_lookup
→ cap_prerequisite_readiness

cap_quantity_dimension_unit_identity
→ cap_quantity_semantic_role_binding
→ cap_same_unit_quantity_arithmetic
```

The last two quantity capabilities both depend directly on quantity identity; the table order uses affected-scope size to place semantic-role binding before same-unit arithmetic.

## Evidence interpretation

### Global authority lookup

R02 covers all 79 source nodes at E3. R07/R08 and P01E provide E5 consumer evidence for the current 19-source public product, but not for the remaining 60 source nodes. This is direct but partial-scope evidence, not global promotion evidence.

### Prerequisite readiness

R03 provides an E3 graph and mastered-set N+1 readiness model for 482 KnowledgePoints. No production learner/planner consumer or fail-closed readiness gate is currently admitted.

### Quantity dimension and unit identity

Three of 51 dependent KnowledgePoints currently have public Pattern bindings. Existing product output is partial and does not provide a global quantity identity contract or shared domain validator.

### Quantity semantic-role binding

Two of 26 dependent KnowledgePoints have public Pattern bindings. Existing application output is indirect partial evidence and does not prove complete semantic-role coverage.

### Same-unit quantity arithmetic

None of the two dependent KnowledgePoints currently has a public Pattern binding through this shared capability. A shared runtime and validator remain required.

## Hard boundaries

```text
R04 capability status change    = forbidden
production consumer change      = forbidden
production admission            = forbidden
public UI change                = forbidden
PatternSpec implementation      = forbidden
P03-P08 implementation          = forbidden
existing 19-source product      = protected
```

## Acceptance

- five exact capability IDs;
- two dependency roots and three dependent capabilities;
- global scope = 79 sources / 482 KPs;
- partial evidence count = 3;
- shadow-only count = 2;
- promotion-ready count = 0;
- every missing-evidence list non-empty;
- premature promotion fails closed;
- dependency-order drift fails closed;
- implementation remains behind a separate approval boundary.

## Next implementation boundary

```text
NEXT_TASK = P02B_W2GlobalAuthorityLookupConsumerAdmission
```

P02B is the first implementation task because authority lookup is a dependency root and already has partial E5 consumer evidence for 19 of 79 source nodes. P02A does not authorize P02B automatically.
