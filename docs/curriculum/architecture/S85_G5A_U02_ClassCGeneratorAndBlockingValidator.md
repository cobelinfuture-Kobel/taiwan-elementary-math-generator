# S85 G5A-U02 Class C Generator and Blocking Validator

```text
TASK = S85_G5A_U02_ClassCGeneratorAndBlockingValidator
STATUS = IMPLEMENTED_PENDING_CI
UNIT_ID = g5a_u02
UNIT_TITLE = 因數與公因數
```

## Scope

S85 implements only the 14 S84 PatternSpecs classified as implementation class C.

It does not implement the eight class D semantic/application PatternSpecs, public selector exposure, canonical routing, worksheet integration, metadata correction, or production use.

## Runtime artifacts

```text
src/curriculum/g5a-u02/class-c-generator-validator.js
tests/curriculum/g5a-u02-class-c-generator-validator.test.js
```

The runtime provides:

- deterministic seeded generation;
- exact dispatch for the 14 accepted class C PatternSpec IDs;
- factor enumeration and factor-pair construction;
- factor relation, missing-factor, selection and boolean models;
- problem-type classification;
- complete-factor-list inference and statement evaluation;
- common-factor enumeration and GCF generation;
- blocking answer recomputation;
- hidden lifecycle enforcement;
- production-use and generic-fallback rejection.

## Implemented PatternSpecs

```text
ps_g5a_u02_factor_relation_equivalence
ps_g5a_u02_factor_enumeration_trial_division
ps_g5a_u02_factor_pair_enumeration
ps_g5a_u02_factor_list_from_pairs
ps_g5a_u02_factor_order_and_symmetry
ps_g5a_u02_missing_factor_reconstruction
ps_g5a_u02_divisor_candidate_selection
ps_g5a_u02_factor_statement_judgement
ps_g5a_u02_problem_type_classification
ps_g5a_u02_complete_factor_list_unknown_values
ps_g5a_u02_complete_factor_list_statement_evaluation
ps_g5a_u02_common_factor_concept_identification
ps_g5a_u02_common_factor_enumeration
ps_g5a_u02_greatest_common_factor
```

## Lifecycle boundary

```text
generatorStatus = class_c_implemented_hidden
validatorStatus = class_c_blocking_runtime
selectorStatus = hidden
canonicalRouting = disabled
productionUse = forbidden
genericFallback = forbidden
```

Class D IDs are rejected by the same exact-dispatch boundary and cannot fall through to a generic generator.

## Gate

S85 passes only when:

- exactly 14 Class C IDs are exported;
- each Class C ID deterministically generates a valid item;
- each generated item passes blocking validation;
- mutated factor sets, pairs, witnesses, selections, booleans, labels, common factors and GCF answers are blocked;
- lifecycle promotion and generic fallback are blocked;
- Class D generation is rejected;
- the repository test suite passes in CI.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_FORMAL_MAPPING_AND_HIDDEN_PATTERNSPECS_MATERIALIZED
GOAL_DISTANCE_AFTER  = D1_G5A_U02_CLASS_C_RUNTIME_IMPLEMENTED_HIDDEN_PENDING_CI
DISTANCE_REDUCED     = 14 deterministic Class C PatternSpecs now have executable generators and blocking validators.
REMAINING_BLOCKERS   = Class D semantic runtime; metadata correction; canonical resolver; public selector; worksheet integration; production gate.
NEXT_SHORTEST_STEP   = S86_G5A_U02_ClassCRuntimeQAAndHiddenProjectionBinding
```
