# GCTX-P09 G3B-U04 Exact Semantic Binding Extraction Pilot

## 1. Milestone

P09 extracts one admitted G3B-U04 semantic PatternSpec into four fixed-domain candidate bindings shaped exactly like the P01 `approvedSemanticBindingEntry` contract.

The pilot validates the extraction model before attempting all remaining G3B-U04 families.

## 2. Locked pilot

```text
PatternSpec = ps_g3b_u04_add_divide_joint_purchase_equal_share
Template family = tpl_g3b_u04_add_divide_joint_purchase_equal_share
KnowledgePoint = kp_g3b_u04_add_then_divide
Operation = (a+b)/c
Question target = cost_per_person
```

Legacy domains:

```text
food
school_supplies
tickets
equipment_rental
```

Each domain becomes one fixed semantic binding. P09 does not permit runtime Cartesian assembly of context family, domain, roles, events, or question target.

## 3. Extracted binding content

Every candidate contains all P01 fields:

- stable binding, context-family and semantic-variant IDs;
- common-knowledge references;
- actor, place, object, activity and unit slots;
- exact `(a+b)/c` operation signature;
- four-step event flow;
- given, intermediate and answer quantity roles;
- unit-flow edges;
- terminal question role;
- language and numeric-profile references;
- compatibility and semantic guard rules;
- review evidence;
- locked randomness policy;
- blocking validator contract;
- required TWD answer-unit policy;
- candidate lifecycle.

## 4. Legacy parity

The extraction must preserve:

```text
a = first_shared_cost
b = second_shared_cost
c = payer_count
unknown = cost_per_person
```

Required guards:

```text
SUM_DIVISIBLE_BY_C
C_AT_LEAST_2
COST_UNIT_FLOW
SHARED_OWNERSHIP_CLEAR
```

The legacy validator remains required:

```text
S57_G3B_U04_SemanticValidationContract
```

Canonical answer recomputation remains blocking.

## 5. Candidate versus approved

The four entries are structurally complete candidate bindings, but they are not inserted into:

```text
data/curriculum/context/registry/approved-semantic-bindings.json
```

P09 requires:

```text
lifecycleStatus = candidate
reviewEvidence.approvalState = candidate
approved registry entries = 0
production selectable = false
runtime resolvable = false
```

Cross-registry common-knowledge, language and numeric-profile admission plus human semantic review remain later gates.

## 6. Internal-reference validator

The focused validator blocks:

- missing or additional P01 top-level fields;
- invalid canonical IDs or enums;
- unresolved slot, event, quantity or question references;
- duplicate binding, semantic-variant or language IDs;
- event-order drift;
- non-exact unit-flow edges;
- unlocked semantic randomness;
- missing validator or answer recomputation;
- legacy equation, role, guard or unit-policy drift;
- formal approved-registry population.

## 7. Acceptance

```text
PatternSpecs = 1
Bindings = 4
Context domains = 4
P01 schema-valid bindings = 4
Legacy parity bindings = 4
Approved registry entries = 0
Production-selectable bindings = 0
Errors = 0
```

## 8. Scope boundary

```text
no runtime behavior change
no formal approved-registry change
no production selection
no unit authority deletion or rewrite
no renderer or public-control change
31 G3B-U04 eligible PatternSpecs remain out of scope
```

## 9. Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_BINDING_ADMISSION_AND_LEGACY_NORMALIZATION_MERGED
GOAL_DISTANCE_AFTER  = D2_GCTX_FIRST_EXACT_BINDING_FAMILY_PENDING_CI
DISTANCE_REDUCED     = one admitted PatternSpec becomes four fixed-domain P01-schema candidate bindings with legacy parity
REMAINING_BLOCKERS   = [CI, merge, 31 remaining G3B-U04 PatternSpecs, cross-registry admission, human review, production admission, validator, resolver]
NEXT_SHORTEST_STEP   = GCTX-P10_G3BU04RemainingExactSemanticBindingExtraction
```
