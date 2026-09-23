# S43B3 KnowledgePoint Pattern Map Schema Lock

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43B3_KnowledgePointPatternMapSchemaLock
TASK_STATUS = SCHEMA_LOCK
WRITE_TYPE = docs_only
```

S43B3 locks the schema that connects KnowledgePointNode, PatternGroup, and PatternSpec before registry materialization or HTML selector work.

This task does not create `batch_a_knowledge_point_pattern_map.json`, does not materialize rows, and does not change PatternSpecs, generator, validator, renderer, or HTML UI.

## Inputs

```text
S43B1 = KnowledgePointNode schema lock
S43B2 = PatternGroup schema lock
S43A2 = current PatternSpec seed coverage
S43A4 = A/B/C/D printable coverage gap matrix
S43A5 = schema-first implementation order
```

## Schema Identity

```text
schemaName = BatchAKnowledgePointPatternMap
schemaVersion = 1
schemaStatus = locked_for_S43B4_and_S43C_planning
futureRegistry = data/curriculum/registry/batch_a_knowledge_point_pattern_map.json
```

## Role

```text
KnowledgePointNode -> PatternGroup -> PatternSpec
```

This mapping table records whether a PatternSpec is an existing coarse seed, a future fine variant, or outside S43 printable scope.

## Required Fields

| field | type | rule |
|---|---|---|
| mappingId | string | stable unique ID; starts with `map_` |
| sourceId | string | one of 13 Batch A source IDs |
| knowledgePointId | string | references KnowledgePointNode |
| patternGroupId | string | references PatternGroup |
| patternSpecId | string or null | existing/future PatternSpec; null only when not implemented yet |
| mappingRole | enum | relation type |
| mappingStatus | enum | lifecycle state |
| supportClass | enum | A/B/C/D from S43A4 |
| constraintStatus | enum | explicit/seed_warning/missing/not_applicable |
| constraintNote | string or null | required if warning or missing |
| generatorRequirement | enum | generator readiness |
| validatorRequirement | enum | validator readiness |
| htmlExposurePolicy | enum | future selector exposure policy |
| qaStatus | enum | QA lifecycle state |
| holdReason | string or null | reason when not selectable/implemented |
| notes | string | may be empty but must exist |

## Enums

```text
mappingRole = primary | seed | variant | out_of_scope | supporting
mappingStatus = draft_candidate | schema_ready | seed_mapped | needs_pattern_spec | needs_generator_variant | needs_validator_variant | needs_generator_and_validator_variant | out_of_s43_scope | materialized | qa_verified
constraintStatus = explicit | seed_warning | missing | not_applicable
generatorRequirement = none | new_fine_pattern_spec_only | generator_variant_required | not_in_s43
validatorRequirement = none | validator_variant_required | constraint_hook_required | not_in_s43
htmlExposurePolicy = eligible_after_qa | internal_only | not_selectable
qaStatus = not_started | schema_checked | unit_test_required | smoke_test_required | qa_verified | not_applicable
holdReason = null | pattern_group_pending | pattern_spec_pending | constraint_warning | constraint_missing | generator_variant_required | validator_variant_required | generator_and_validator_variant_required | word_problem_template_required | visual_required | future_domain | planned_only | qa_pending
```

## Invariants

```text
1. mappingId must be unique and start with map_.
2. sourceId must match one of the 13 Batch A source IDs.
3. knowledgePointId and patternGroupId must share the same sourceId.
4. patternGroupId must represent the knowledgePointId.
5. patternSpecId may be null only when mappingStatus is not yet implemented or out_of_s43_scope.
6. mappingRole = seed means an existing coarse PatternSpec is reused.
7. supportClass D requires htmlExposurePolicy = not_selectable.
8. constraintStatus seed_warning or missing requires non-null constraintNote.
9. htmlExposurePolicy eligible_after_qa requires qaStatus = qa_verified before HTML exposure.
10. A-class seed mappings may remain internal_only until PatternGroup and mapping QA pass.
```

## ID Format Rules

```text
mappingId = map_<source_unit_prefix>_<knowledge_slug>_<pattern_slug>
allowed characters = lowercase ascii letters, digits, underscores
forbidden = spaces, Chinese characters, hyphens, duplicate IDs
example = map_g3a_u02_add_multi_carry_seed
```

## Minimal Row Shape

```text
mappingId
sourceId
knowledgePointId
patternGroupId
patternSpecId
mappingRole
mappingStatus
supportClass
constraintStatus
constraintNote
generatorRequirement
validatorRequirement
htmlExposurePolicy
qaStatus
holdReason
notes
```

## G3A-U02 Example Policies

```text
map_g3a_u02_add_multi_carry_seed:
  knowledgePointId = kp_g3a_u02_add_multi_carry
  patternGroupId = pg_g3a_u02_add_multi_carry_seed
  patternSpecId = ps_g3a_u02_4digit_add_multi_carry
  mappingRole = seed
  mappingStatus = seed_mapped
  supportClass = A
  constraintStatus = seed_warning
  htmlExposurePolicy = internal_only
  qaStatus = smoke_test_required
  holdReason = constraint_warning

map_g3a_u02_borrow_zero_middle_handling:
  knowledgePointId = kp_g3a_u02_borrow_zero_middle_handling
  patternGroupId = pg_g3a_u02_borrow_zero_middle_handling
  patternSpecId = null
  mappingRole = variant
  mappingStatus = needs_generator_and_validator_variant
  supportClass = C
  constraintStatus = missing
  htmlExposurePolicy = internal_only
  qaStatus = not_started
  holdReason = generator_and_validator_variant_required

map_g3a_u02_word_problem_estimation_add_sub:
  knowledgePointId = kp_g3a_u02_word_problem_estimation_add_sub
  patternGroupId = pg_g3a_u02_word_problem_estimation_add_sub
  patternSpecId = null
  mappingRole = out_of_scope
  mappingStatus = out_of_s43_scope
  supportClass = D
  constraintStatus = not_applicable
  htmlExposurePolicy = not_selectable
  qaStatus = not_applicable
  holdReason = word_problem_template_required
```

## HTML Selector Rule

```text
A mapping can support future visible HTML selection only when:
- htmlExposurePolicy = eligible_after_qa
- qaStatus = qa_verified
- mappingStatus = materialized or qa_verified
- patternSpecId is not null
- related PatternGroup visibilityStatus = visible
- related KnowledgePointNode htmlSelectableStatus = selectable
```

Rows with `internal_only` or `not_selectable` must not be exposed by the S43 HTML selector.

## Non-Goals

```text
S43B3 does not align global visibility policy across all registries.
S43B3 does not materialize mapping JSON.
S43B3 does not create new PatternSpecs.
S43B3 does not implement generator/validator variants.
S43B3 does not implement HTML selector UI.
```

## S43B3 Gate

```text
S43B3_GATE = PASS_KNOWLEDGEPOINT_PATTERN_MAP_SCHEMA_LOCKED

PASS:
- mapping required fields locked
- mappingRole and mappingStatus enums locked
- constraintStatus policy locked
- generatorRequirement / validatorRequirement enums locked
- htmlExposurePolicy rule locked
- mapping ID format rules locked
- G3A-U02 A/C/D example policies defined
- production mapping registry materialization explicitly deferred

GAPS:
- PrintableStatus / visibility policy not yet aligned across all three schemas
- no mapping JSON materialized yet
- no schema validation test exists yet
- no HTML KnowledgePoint selector exists yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_PATTERN_GROUP_SCHEMA_LOCKED
GOAL_DISTANCE_AFTER  = D2_KNOWLEDGEPOINT_PATTERN_MAP_SCHEMA_LOCKED
DISTANCE_REDUCED     = S43 now has the mapping contract needed to connect KnowledgePointNode rows, PatternGroups, and PatternSpecs without exposing unverified mappings to HTML

KnowledgePointSchema              100% -> 100%
PatternGroupSchema                100% -> 100%
KnowledgePointPatternMapSchema      0% -> 100%
PatternGroupRegistry                0% ->   0%
KPHTMLSelectablePath                0% ->   0%
S43Overall                         44% ->  50%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "PrintableStatus / visibility policy 尚未跨三個 schema 對齊",
  "172 個 KP draft rows 尚未進 JSON registry",
  "A 類 PatternSpec seeds 尚未 materialize 為 PatternGroup JSON",
  "G3A-U02 P0 C 類 prototype 尚未拆成 PatternSpec / generator / validator work items",
  "D 類尚未寫入 HTML hidden/not_selectable policy implementation",
  "HTML KnowledgePoint selector 尚未實作",
  "per-KP printable QA 尚未建立"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43B4_PrintableStatusAndVisibilityPolicyLock
```

S43B4 must align KnowledgePointNode, PatternGroup, and mapping visibility/status policy before any registry materialization or HTML selector work.
