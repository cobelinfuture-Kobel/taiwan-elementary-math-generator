# S43C2 G3A-U02 PatternGroup Seed Materialization

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C2_G3AU02PatternGroupSeedMaterialization
TASK_STATUS = REGISTRY_SEED_MATERIALIZATION
WRITE_TYPE = registry_json_plus_docs
```

## Files Created

```text
data/curriculum/registry/batch_a_knowledge_points.json
data/curriculum/registry/batch_a_pattern_groups.json
data/curriculum/registry/batch_a_knowledge_point_pattern_map.json
```

## Materialized Scope

```text
sourceId = g3a_u02_3a02
KnowledgePointNode rows = 4
PatternGroup rows = 4
Mapping rows = 4
A seed rows = 2
D not_selectable rows = 2
C rows = 0
selectable_ready rows = 0
```

## A Seed Rows

```text
kp_g3a_u02_add_multi_carry
kp_g3a_u02_sub_multi_borrow
```

A rows remain internal / hidden pending QA. They reference existing seed PatternSpecs:

```text
ps_g3a_u02_4digit_add_multi_carry
ps_g3a_u02_4digit_sub_multi_borrow
```

## D Rows

```text
kp_g3a_u02_estimate_nearest_thousand
kp_g3a_u02_word_problem_estimation_add_sub
```

D rows remain not_selectable during S43.

## Manual Readback Result

```text
KnowledgePointNode rows present = PASS
PatternGroup rows present = PASS
Mapping rows present = PASS
A rows hidden/internal = PASS
D rows not_selectable = PASS
selectable_ready count = 0 = PASS
```

No HTML, generator, validator, renderer, or resolver code was changed.

## S43C2 Gate

```text
S43C2_GATE = PASS_G3AU02_A_D_REGISTRY_SEEDS_MATERIALIZED
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_G3AU02_PROTOTYPE_REGISTRY_MATERIALIZATION_PLANNED
GOAL_DISTANCE_AFTER  = D2_G3AU02_A_D_REGISTRY_SEEDS_MATERIALIZED
DISTANCE_REDUCED     = first G3A-U02 registry slice is materialized under locked schemas

G3A_U02_PrototypePlan            100% -> 100%
G3A_U02_RegistryRows               0% ->  44%
PatternGroupRegistry               0% ->  10%
KPHTMLSelectablePath               0% ->   0%
S43Overall                        66% ->  70%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "Validation test file 尚未 implemented",
  "G3A-U02 C 類 variant rows 尚未 materialized",
  "G3A-U02 P0 C 類 prototype 尚未拆成 PatternSpec / generator / validator work items",
  "carry/borrow explicit constraint 尚未 QA verified",
  "HTML KnowledgePoint selector 尚未實作",
  "per-KP printable QA 尚未建立"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C3_G3AU02FinePatternSpecImplementationPlan
```
