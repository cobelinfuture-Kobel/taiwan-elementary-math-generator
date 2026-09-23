# S43C1 G3A-U02 Prototype Registry Materialization Plan

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C1_G3AU02PrototypeRegistryMaterializationPlan
TASK_STATUS = MATERIALIZATION_PLAN
WRITE_TYPE = docs_only
```

S43C1 plans the first G3A-U02 prototype registry slice using the locked schemas and validation contract from S43B1-S43B5.

This task does not create production registry JSON, does not create PatternSpecs, and does not change generator, validator, renderer, resolver, or HTML UI.

## Inputs

```text
S43A5 = implementation order and G3A-U02 prototype decision
S43B1 = KnowledgePointNode schema
S43B2 = PatternGroup schema
S43B3 = KnowledgePointPatternMap schema
S43B4 = printable status and visibility policy
S43B5 = schema validation contract draft
```

## Prototype Unit

```text
sourceId = g3a_u02_3a02
unitCode = 3A-U02
unitTitle = 四位數的加減
```

Reason:

```text
G3A-U02 has 2 A-class seed rows, 5 C-class variant rows, and 2 D-class not-selectable rows.
It is small enough to materialize first while still testing seed reuse, generator/validator variants, and D-row visibility protection.
```

## Future Target Registries

S43C1 only plans future writes to these files. It does not create them.

```text
data/curriculum/registry/batch_a_knowledge_points.json
data/curriculum/registry/batch_a_pattern_groups.json
data/curriculum/registry/batch_a_knowledge_point_pattern_map.json
```

## Planned KnowledgePointNode Slice

| knowledgePointId | class | planned html status | holdReason | stage |
|---|---|---|---|---|
| kp_g3a_u02_add_multi_carry | A | hidden | pattern_group_pending | C2 seed |
| kp_g3a_u02_sub_multi_borrow | A | hidden | pattern_group_pending | C2 seed |
| kp_g3a_u02_sub_consecutive_borrow | C | hidden | generator_and_validator_variant_required | C3 P0 |
| kp_g3a_u02_vertical_sub_missing_digit | C | hidden | generator_and_validator_variant_required | C3 P0 |
| kp_g3a_u02_borrow_zero_middle_handling | C | hidden | generator_and_validator_variant_required | C3 P0 |
| kp_g3a_u02_vertical_add_missing_digit | C | hidden | generator_and_validator_variant_required | C3 deferred |
| kp_g3a_u02_sub_missing_middle_digit | C | hidden | generator_and_validator_variant_required | C3 deferred |
| kp_g3a_u02_estimate_nearest_thousand | D | not_selectable | planned_only | C2 blocked row |
| kp_g3a_u02_word_problem_estimation_add_sub | D | not_selectable | word_problem_template_required | C2 blocked row |

Planned count:

```text
KnowledgePointNode planned rows = 9
A = 2
B = 0
C = 5
D = 2
```

## Planned PatternGroup Slice

| patternGroupId | class | planned PatternSpec status | visibilityStatus | stage |
|---|---|---|---|---|
| pg_g3a_u02_add_multi_carry_seed | A | existing seed PatternSpec | hidden | C2 seed |
| pg_g3a_u02_sub_multi_borrow_seed | A | existing seed PatternSpec | hidden | C2 seed |
| pg_g3a_u02_sub_consecutive_borrow | C | no PatternSpec yet | hidden | C3 P0 |
| pg_g3a_u02_vertical_sub_missing_digit | C | no PatternSpec yet | hidden | C3 P0 |
| pg_g3a_u02_borrow_zero_middle_handling | C | no PatternSpec yet | hidden | C3 P0 |
| pg_g3a_u02_vertical_add_missing_digit | C | no PatternSpec yet | hidden | C3 deferred |
| pg_g3a_u02_sub_missing_middle_digit | C | no PatternSpec yet | hidden | C3 deferred |
| pg_g3a_u02_estimate_nearest_thousand | D | no PatternSpec in S43 | not_selectable | C2 blocked row |
| pg_g3a_u02_word_problem_estimation_add_sub | D | no PatternSpec in S43 | not_selectable | C2 blocked row |

The A-class PatternGroups may reference existing S42 browser PatternSpecs but must remain hidden until mapping and QA pass.

## Planned Mapping Slice

| mappingId | role | mappingStatus | patternSpecId | exposure |
|---|---|---|---|---|
| map_g3a_u02_add_multi_carry_seed | seed | seed_mapped | ps_g3a_u02_4digit_add_multi_carry | internal_only |
| map_g3a_u02_sub_multi_borrow_seed | seed | seed_mapped | ps_g3a_u02_4digit_sub_multi_borrow | internal_only |
| map_g3a_u02_sub_consecutive_borrow_variant | variant | needs_generator_and_validator_variant | null | internal_only |
| map_g3a_u02_vertical_sub_missing_digit_variant | variant | needs_generator_and_validator_variant | null | internal_only |
| map_g3a_u02_borrow_zero_middle_handling_variant | variant | needs_generator_and_validator_variant | null | internal_only |
| map_g3a_u02_vertical_add_missing_digit_variant | variant | needs_generator_and_validator_variant | null | internal_only |
| map_g3a_u02_sub_missing_middle_digit_variant | variant | needs_generator_and_validator_variant | null | internal_only |
| map_g3a_u02_estimate_nearest_thousand_out_of_scope | out_of_scope | out_of_s43_scope | null | not_selectable |
| map_g3a_u02_word_problem_estimation_add_sub_out_of_scope | out_of_scope | out_of_s43_scope | null | not_selectable |

## Existing Seed PatternSpecs

```text
ps_g3a_u02_4digit_add_multi_carry
ps_g3a_u02_4digit_sub_multi_borrow
```

These are allowed only as A-class coarse seeds. They must not be treated as fully verified fine-grained carry/borrow KnowledgePoints until explicit constraint validation exists.

## Materialization Stage Plan

```text
S43C2 = materialize A seed and D not_selectable registry rows for G3A-U02
S43C3 = draft P0 C-class fine PatternSpec implementation plan
S43C4 = plan generator/validator variants for P0 C rows
S43C5 = plan G3A-U02 prototype QA
```

C2 should create registry rows only. It should not make any row selectable.

## Initial Visibility After C2

```text
A rows = hidden_pending
C rows = hidden_pending or planned only, depending on whether they are materialized in C2
D rows = not_selectable
selectable_ready rows = 0
```

No G3A-U02 KnowledgePoint should appear in HTML after C2 because selector implementation and QA gates do not exist yet.

## C2 Materialization Boundary

Approved for C2:

```text
- create registry files if absent
- add G3A-U02 KnowledgePointNode rows for A and D rows
- add G3A-U02 PatternGroup rows for A and D rows
- add G3A-U02 mapping rows for A and D rows
- keep all A rows hidden
- keep all D rows not_selectable
```

Deferred from C2:

```text
- making any row selectable
- HTML selector changes
- generator/validator variant implementation
- fine PatternSpec creation for C rows
- cross-unit selection
- all 13-unit materialization
```

## Validation Requirements Before C2 Closeout

Future C2 registry rows must satisfy S43B5 validation layers:

```text
L1 = static schema validation
L2 = enum and ID-format validation
L3 = referential integrity validation
L4 = supportClass and holdReason consistency validation
L5 = visibility alignment validation
L6 = HTML exposure eligibility validation
```

C2 closeout must explicitly show:

```text
KnowledgePointNode rows valid
PatternGroup rows valid
Mapping rows valid
D rows not_selectable
A rows hidden_pending
selectable_ready count = 0
```

## S43C1 Gate

```text
S43C1_GATE = PASS_G3AU02_PROTOTYPE_MATERIALIZATION_PLAN

PASS:
- prototype unit confirmed as g3a_u02_3a02
- 9 planned KnowledgePointNode rows identified
- 9 planned PatternGroup rows identified
- 9 planned mapping rows identified
- A/C/D split preserved
- A seed rows remain hidden until QA
- D rows remain not_selectable
- C2 materialization boundary defined
- no production JSON written in this task

GAPS:
- production registry JSON not materialized yet
- validation test file not implemented yet
- G3A-U02 A seed rows not written yet
- G3A-U02 C variant implementation plan not written yet
- HTML KnowledgePoint selector not implemented yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_SCHEMA_VALIDATION_CONTRACT_DRAFTED
GOAL_DISTANCE_AFTER  = D2_G3AU02_PROTOTYPE_REGISTRY_MATERIALIZATION_PLANNED
DISTANCE_REDUCED     = S43 now has a concrete G3A-U02 registry slice plan governed by locked schemas and validation gates before writing production JSON

SchemaValidationContract          100% -> 100%
G3A_U02_PrototypePlan               0% -> 100%
G3A_U02_RegistryRows                0% ->   0%
PatternGroupRegistry                0% ->   0%
KPHTMLSelectablePath                0% ->   0%
S43Overall                         62% ->  66%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "Validation test file 尚未 implemented",
  "G3A-U02 registry rows 尚未 materialized",
  "A 類 PatternSpec seeds 尚未 materialize 為 PatternGroup JSON",
  "G3A-U02 P0 C 類 prototype 尚未拆成 PatternSpec / generator / validator work items",
  "D 類尚未寫入 HTML hidden/not_selectable policy implementation",
  "HTML KnowledgePoint selector 尚未實作",
  "per-KP printable QA 尚未建立"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C2_G3AU02PatternGroupSeedMaterialization
```

S43C2 should materialize the first G3A-U02 A seed and D not_selectable registry rows using the locked schemas. It must not expose any row to HTML yet.
