# S43B2 PatternGroup Schema Lock

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43B2_PatternGroupSchemaLock
TASK_STATUS = SCHEMA_LOCK
WRITE_TYPE = docs_only
```

S43B2 locks the PatternGroup schema contract required to connect KnowledgePointNode rows to printable PatternSpecs and future HTML selection.

This task does not create `batch_a_pattern_groups.json`, does not materialize rows, and does not change PatternSpecs, generator, validator, renderer, or HTML UI.

## Inputs

```text
S43B1 = KnowledgePointNode schema lock
S43A4 = A/B/C/D printable coverage gap matrix
S43A5 = schema-first implementation order
```

## Schema Identity

```text
schemaName = BatchAPatternGroup
schemaVersion = 1
schemaStatus = locked_for_S43B3_and_S43C_planning
futureRegistry = data/curriculum/registry/batch_a_pattern_groups.json
```

## Role in System

```text
SourceUnit
→ KnowledgePointNode
→ PatternGroup
→ PatternSpec
→ Generator
→ Validator
→ HTML worksheet / answer key / print
```

PatternGroup is the selectable printable unit between KnowledgePointNode and PatternSpec. A KnowledgePoint may have one or more PatternGroups. A PatternGroup may contain one or more PatternSpecs.

## Required Fields

| field | type | rule |
|---|---|---|
| patternGroupId | string | stable unique ID; must start with `pg_` |
| sourceId | string | one of the 13 Batch A source IDs |
| unitCode | string | example: `3A-U02` |
| unitTitle | string | Traditional Chinese source unit title |
| displayName | string | label shown in future selector |
| primaryKnowledgePointId | string | main KnowledgePoint represented by this group |
| knowledgePointIds | string[] | one or more KP IDs covered by this group |
| supportClass | enum | A, B, C, or D; inherited or consolidated from related KP rows |
| patternSpecIds | string[] | one or more PatternSpec IDs when printable; empty allowed only before implementation |
| generatorSupportStatus | enum | generator readiness |
| validatorSupportStatus | enum | validator readiness |
| htmlWorksheetStatus | enum | worksheet rendering readiness |
| answerKeyStatus | enum | answer-key readiness |
| visibilityStatus | enum | `visible`, `hidden`, or `not_selectable` |
| allocationPolicy | enum | question allocation behavior when multiple PatternSpecs exist |
| registryStatus | enum | lifecycle state |
| holdReason | string or null | required when not visible/selectable |
| notes | string | may be empty but must exist |

## Enums

### generatorSupportStatus

```text
supported
seed_supported
needs_fine_pattern_spec
needs_generator_variant
not_supported
```

### validatorSupportStatus

```text
supported
seed_supported
needs_validator_variant
not_supported
```

### htmlWorksheetStatus

```text
printable
seed_printable
not_printable_yet
not_in_s43_scope
```

### answerKeyStatus

```text
supported
seed_supported
not_supported_yet
not_in_s43_scope
```

### visibilityStatus

```text
visible = may appear in the future HTML selector after QA
hidden = retained internally but not exposed yet
not_selectable = must not appear in S43 HTML selector
```

### allocationPolicy

```text
single_pattern = one PatternSpec only
average_across_patterns = evenly distribute across PatternSpecs
fixed_counts = explicit future per-PatternSpec counts
not_applicable = no printable PatternSpec yet
```

### registryStatus

```text
draft_candidate
schema_ready
materialized
qa_verified
deprecated
```

### holdReason

```text
null
schema_pending
knowledge_point_pending
pattern_spec_pending
generator_variant_required
validator_variant_required
generator_and_validator_variant_required
visual_required
word_problem_template_required
future_domain
planned_only
qa_pending
```

## Invariants

```text
1. patternGroupId must be unique inside Batch A.
2. patternGroupId must start with pg_.
3. sourceId must match one of the 13 Batch A source IDs.
4. primaryKnowledgePointId must also appear in knowledgePointIds.
5. knowledgePointIds must not be empty.
6. supportClass must be A/B/C/D.
7. visibilityStatus = visible requires at least one patternSpecId.
8. visibilityStatus = visible requires generatorSupportStatus supported or seed_supported.
9. visibilityStatus = visible requires validatorSupportStatus supported or seed_supported.
10. supportClass D must have visibilityStatus = not_selectable.
11. D-class PatternGroups must not appear in S43 HTML selector.
12. patternSpecIds may be empty only when registryStatus is draft_candidate/schema_ready and holdReason is non-null.
13. htmlWorksheetStatus = printable requires answerKeyStatus supported or seed_supported.
14. allocationPolicy must be single_pattern when exactly one PatternSpec is active.
```

## ID Format Rules

```text
patternGroupId = pg_<source_unit_prefix>_<semantic_slug>
allowed characters = lowercase ascii letters, digits, underscores
forbidden = spaces, Chinese characters, hyphens, duplicate IDs
example = pg_g3a_u02_sub_consecutive_borrow
```

## Minimal Row Shape

```text
patternGroupId
sourceId
unitCode
unitTitle
displayName
primaryKnowledgePointId
knowledgePointIds
supportClass
patternSpecIds
generatorSupportStatus
validatorSupportStatus
htmlWorksheetStatus
answerKeyStatus
visibilityStatus
allocationPolicy
registryStatus
holdReason
notes
```

## G3A-U02 Example Policies

```text
pg_g3a_u02_add_multi_carry_seed:
  primaryKnowledgePointId = kp_g3a_u02_add_multi_carry
  supportClass = A
  patternSpecIds = [ps_g3a_u02_4digit_add_multi_carry]
  generatorSupportStatus = seed_supported
  validatorSupportStatus = seed_supported
  htmlWorksheetStatus = seed_printable
  answerKeyStatus = seed_supported
  visibilityStatus = hidden
  holdReason = qa_pending

pg_g3a_u02_borrow_zero_middle_handling:
  primaryKnowledgePointId = kp_g3a_u02_borrow_zero_middle_handling
  supportClass = C
  patternSpecIds = []
  generatorSupportStatus = needs_generator_variant
  validatorSupportStatus = needs_validator_variant
  htmlWorksheetStatus = not_printable_yet
  answerKeyStatus = not_supported_yet
  visibilityStatus = hidden
  holdReason = generator_and_validator_variant_required

pg_g3a_u02_word_problem_estimation_add_sub:
  primaryKnowledgePointId = kp_g3a_u02_word_problem_estimation_add_sub
  supportClass = D
  patternSpecIds = []
  generatorSupportStatus = not_supported
  validatorSupportStatus = not_supported
  htmlWorksheetStatus = not_in_s43_scope
  answerKeyStatus = not_in_s43_scope
  visibilityStatus = not_selectable
  holdReason = word_problem_template_required
```

## HTML Selector Contract

```text
Only PatternGroups with visibilityStatus = visible may appear in the future HTML KnowledgePoint selector.
Hidden PatternGroups may be used for internal planning or QA but must not be user-selectable.
Not_selectable PatternGroups must not be used for S43 printable worksheet generation.
D-class rows are not_selectable by default.
```

## Non-Goals

```text
S43B2 does not decide KP-to-PatternSpec mapping schema.
S43B2 does not materialize PatternGroup JSON.
S43B2 does not create new PatternSpecs.
S43B2 does not implement generator/validator variants.
S43B2 does not implement HTML selector UI.
```

## S43B2 Gate

```text
S43B2_GATE = PASS_PATTERN_GROUP_SCHEMA_LOCKED

PASS:
- PatternGroup required fields locked
- generator/validator/html/answer-key status enums locked
- visibilityStatus and allocationPolicy locked
- PatternGroup ID format rules locked
- PatternGroup visibility invariants locked
- G3A-U02 A/C/D example policies defined
- production PatternGroup registry materialization explicitly deferred

GAPS:
- KnowledgePointPatternMap schema not locked yet
- no PatternGroup JSON materialized yet
- no schema validation test exists yet
- no HTML KnowledgePoint selector exists yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_KNOWLEDGEPOINT_NODE_SCHEMA_LOCKED
GOAL_DISTANCE_AFTER  = D2_PATTERN_GROUP_SCHEMA_LOCKED
DISTANCE_REDUCED     = S43 now has a locked PatternGroup contract connecting KnowledgePointNode rows to printable PatternSpec seeds and future HTML selector visibility

KnowledgePointSchema              100% -> 100%
PatternGroupSchema                  0% -> 100%
KnowledgePointPatternMapSchema      0% ->   0%
PatternGroupRegistry                0% ->   0%
KPHTMLSelectablePath                0% ->   0%
S43Overall                         38% ->  44%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "KnowledgePointPatternMap schema 尚未鎖定",
  "PrintableStatus / visibility policy 尚未跨 mapping schema 對齊",
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
NEXT_SHORTEST_STEP = S43B3_KnowledgePointPatternMapSchemaLock
```

S43B3 must lock the mapping schema that connects KnowledgePointNode rows, PatternGroups, and PatternSpecs before any registry materialization or HTML selector work.
