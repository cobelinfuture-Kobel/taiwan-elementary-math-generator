# S43B1 KnowledgePointNode Schema Lock

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43B1_KnowledgePointNodeSchemaLock
TASK_STATUS = SCHEMA_LOCK
WRITE_TYPE = docs_only
```

S43B1 locks the KnowledgePointNode schema contract required before Batch A KnowledgePoint rows can be materialized into a production registry.

This task does not create `batch_a_knowledge_points.json`, PatternGroup JSON, PatternSpec JSON, generator code, validator code, renderer code, or HTML UI.

## Inputs

```text
S43A3 = 172 normalized KnowledgePoint draft ID candidates
S43A4 = A/B/C/D printable coverage gap matrix
S43A5 = implementation order decision requiring schema-first guard
```

## Schema Identity

```text
schemaName = BatchAKnowledgePointNode
schemaVersion = 1
schemaStatus = locked_for_S43B2_and_S43C_planning
futureRegistry = data/curriculum/registry/batch_a_knowledge_points.json
```

## Required Fields

| field | type | rule |
|---|---|---|
| knowledgePointId | string | stable unique ID; must start with `kp_` |
| sourceId | string | one of the 13 Batch A source IDs |
| unitCode | string | example: `3A-U02` |
| unitTitle | string | Traditional Chinese source unit title |
| grade | integer | 3, 4, or 5 for current Batch A |
| semester | string | `A` or `B` |
| displayName | string | Traditional Chinese label shown to users |
| canonicalSkillTag | string | one primary skill tag |
| subskillTags | string[] | array, may be empty only with explicit reason |
| difficultyTags | string[] | array, may be empty only with explicit reason |
| representationTags | string[] | e.g. `numeric_expression`, `vertical_algorithm`, `word_problem` |
| answerModelCandidates | string[] | e.g. `numericAnswer`; may be empty only for non-printable rows |
| supportClass | enum | `A`, `B`, `C`, or `D` from S43A4 |
| sourceAuthorityStatus | enum | source derivation status |
| registryStatus | enum | lifecycle state |
| patternGroupIds | string[] | required even when empty |
| htmlSelectableStatus | enum | `selectable`, `hidden`, or `not_selectable` |
| holdReason | string or null | required when row is hidden or not selectable |
| notes | string | may be empty string but must exist |

## Enums

### supportClass

```text
A = existing PatternSpec seed can print a coarse worksheet now
B = needs new fine-grained PatternSpec, but existing expression/comparison style generator likely supports it
C = needs generator and/or validator variant before printable production
D = not printable in S43 due to visual, word-problem template, future-domain, or plannedOnly requirement
```

### sourceAuthorityStatus

```text
manual_visual_read_summary
stable_registry
qa_verified
```

### registryStatus

```text
draft_candidate
schema_ready
materialized
qa_verified
deprecated
```

### htmlSelectableStatus

```text
selectable = may appear in HTML KnowledgePoint selector after mapping and QA
hidden = not shown yet, but may become selectable after later work
not_selectable = must stay out of the selector in S43
```

### holdReason

```text
null
schema_pending
pattern_group_pending
pattern_spec_pending
generator_variant_required
validator_variant_required
generator_and_validator_variant_required
visual_required
word_problem_template_required
future_domain
planned_only
```

## Invariants

```text
1. knowledgePointId must be unique inside Batch A.
2. sourceId must match one of the 13 Batch A source IDs.
3. supportClass must be A/B/C/D.
4. patternGroupIds must exist as an array even before PatternGroup creation.
5. supportClass D must not have htmlSelectableStatus = selectable.
6. supportClass C must have a generator and/or validator holdReason until implemented.
7. supportClass A may still be hidden until PatternGroup and mapping QA pass.
8. registryStatus cannot become materialized during S43B1.
9. sourceAuthorityStatus remains manual_visual_read_summary until later registry QA upgrades it.
10. rows with word-problem, visual, future-domain, or plannedOnly requirements must remain not_selectable in S43.
```

## ID Format Rules

```text
knowledgePointId = kp_<source_unit_prefix>_<semantic_slug>
allowed characters = lowercase ascii letters, digits, underscores
forbidden = spaces, Chinese characters, hyphens, duplicate IDs
example = kp_g3a_u02_sub_consecutive_borrow
```

## Minimal Row Shape

```text
knowledgePointId
sourceId
unitCode
unitTitle
grade
semester
displayName
canonicalSkillTag
subskillTags
difficultyTags
representationTags
answerModelCandidates
supportClass
sourceAuthorityStatus
registryStatus
patternGroupIds
htmlSelectableStatus
holdReason
notes
```

## G3A-U02 Example Policies

```text
kp_g3a_u02_add_multi_carry:
  supportClass = A
  htmlSelectableStatus = hidden
  holdReason = pattern_group_pending

kp_g3a_u02_borrow_zero_middle_handling:
  supportClass = C
  htmlSelectableStatus = hidden
  holdReason = generator_and_validator_variant_required

kp_g3a_u02_word_problem_estimation_add_sub:
  supportClass = D
  htmlSelectableStatus = not_selectable
  holdReason = word_problem_template_required
```

## Non-Goals

```text
S43B1 does not decide PatternGroup schema.
S43B1 does not decide KP-to-PatternSpec mapping schema.
S43B1 does not create production JSON rows.
S43B1 does not implement selector UI.
S43B1 does not implement generator/validator variants.
S43B1 does not change current Batch A source-level worksheet behavior.
```

## S43B1 Gate

```text
S43B1_GATE = PASS_KNOWLEDGEPOINT_NODE_SCHEMA_LOCKED

PASS:
- required KnowledgePointNode fields locked
- supportClass enum locked
- sourceAuthorityStatus enum locked
- registryStatus enum locked
- htmlSelectableStatus enum locked
- holdReason enum locked
- A/B/C/D visibility invariants locked
- ID format rules locked
- G3A-U02 A/C/D example policies defined
- production registry materialization explicitly deferred

GAPS:
- PatternGroup schema not locked yet
- KnowledgePointPatternMap schema not locked yet
- no production JSON registry materialized yet
- no schema validation test exists yet
- no HTML KnowledgePoint selector exists yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D3_IMPLEMENTATION_ORDER_LOCKED
GOAL_DISTANCE_AFTER  = D2_KNOWLEDGEPOINT_NODE_SCHEMA_LOCKED
DISTANCE_REDUCED     = S43 now has a locked KnowledgePointNode contract, enabling future registry materialization without unstable one-off rows

ImplementationOrder              100% -> 100%
KnowledgePointSchema               0% -> 100%
PatternGroupSchema                 0% ->   0%
KnowledgePointPatternMapSchema     0% ->   0%
PatternGroupRegistry               0% ->   0%
KPHTMLSelectablePath               0% ->   0%
S43Overall                        32% ->  38%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "PatternGroup schema 尚未鎖定",
  "KnowledgePointPatternMap schema 尚未鎖定",
  "PrintableStatus / visibility policy 尚未跨 schema 對齊",
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
NEXT_SHORTEST_STEP = S43B2_PatternGroupSchemaLock
```

S43B2 must lock the PatternGroup schema before any PatternGroup JSON materialization or HTML selector work.
