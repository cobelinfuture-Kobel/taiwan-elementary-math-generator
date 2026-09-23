# S43B4 Printable Status and Visibility Policy Lock

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43B4_PrintableStatusAndVisibilityPolicyLock
TASK_STATUS = POLICY_LOCK
WRITE_TYPE = docs_only
```

S43B4 aligns printable status and visibility policy across the three locked schemas:

```text
KnowledgePointNode
PatternGroup
KnowledgePointPatternMap
```

This task does not materialize JSON registries and does not change PatternSpecs, generator, validator, renderer, or HTML UI.

## Inputs

```text
S43B1 = KnowledgePointNode schema lock
S43B2 = PatternGroup schema lock
S43B3 = KnowledgePointPatternMap schema lock
S43A4 = A/B/C/D printable coverage gap matrix
S43A5 = schema-first implementation order
```

## Policy Goal

Only a fully aligned and QA-verified triplet may become selectable in the future HTML KnowledgePoint selector.

```text
KnowledgePointNode.htmlSelectableStatus = selectable
AND PatternGroup.visibilityStatus = visible
AND Mapping.htmlExposurePolicy = eligible_after_qa
AND Mapping.qaStatus = qa_verified
```

Anything else remains hidden or not_selectable.

## Unified Visibility States

```text
selectable_ready = may appear in HTML selector
hidden_pending = internally tracked but not user-selectable
not_selectable = must not appear in S43 selector
```

## Cross-Schema Alignment Matrix

| unified state | KnowledgePointNode | PatternGroup | Mapping | HTML selector |
|---|---|---|---|---|
| selectable_ready | selectable | visible | eligible_after_qa + qa_verified | expose |
| hidden_pending | hidden | hidden | internal_only | hide |
| not_selectable | not_selectable | not_selectable | not_selectable | block |

## SupportClass Visibility Defaults

| supportClass | default unified state | reason |
|---|---|---|
| A | hidden_pending | seed exists but needs PatternGroup/mapping QA before selector exposure |
| B | hidden_pending | needs fine PatternSpec materialization and QA |
| C | hidden_pending | needs generator and/or validator variant before QA |
| D | not_selectable | outside S43 printable path or requires future support |

## Promotion Rules

### A-class seed to selectable_ready

```text
A row may promote from hidden_pending to selectable_ready only when:
- KnowledgePointNode.registryStatus = qa_verified
- PatternGroup.registryStatus = qa_verified
- Mapping.qaStatus = qa_verified
- PatternGroup has at least one PatternSpec ID
- generatorSupportStatus = supported or seed_supported
- validatorSupportStatus = supported or seed_supported
- htmlWorksheetStatus = printable or seed_printable
- answerKeyStatus = supported or seed_supported
```

### B-class to selectable_ready

```text
B row may promote only after:
- new fine PatternSpec exists
- PatternGroup references that PatternSpec
- mappingStatus = qa_verified
- generator and validator checks pass
- answer key and HTML worksheet smoke QA pass
```

### C-class to selectable_ready

```text
C row may promote only after:
- required generator variant exists
- required validator variant or constraint hook exists
- mappingStatus = qa_verified
- relevant unit tests and smoke QA pass
```

### D-class prohibition

```text
D row must remain not_selectable during S43.
D row may not be exposed by fallback UI, query params, direct resolver input, or mixed worksheet selection.
```

## Leakage Guard

HTML selector, worksheet resolver, and future query-state parser must reject or hide rows when any of the following is true:

```text
KnowledgePointNode.htmlSelectableStatus != selectable
PatternGroup.visibilityStatus != visible
Mapping.htmlExposurePolicy != eligible_after_qa
Mapping.qaStatus != qa_verified
supportClass = D
holdReason is non-null
```

## Mixed Worksheet Policy

Single-KP, same-unit multi-KP, and cross-unit multi-KP selection must all use the same visibility gate.

```text
No selection mode may bypass visibility alignment.
```

## Error / Block Categories

```text
schema_pending
pattern_group_pending
pattern_spec_pending
constraint_warning
constraint_missing
generator_variant_required
validator_variant_required
generator_and_validator_variant_required
word_problem_template_required
visual_required
future_domain
planned_only
qa_pending
```

These categories must be preserved in future registry rows so the UI can hide or explain blocked content without exposing it as printable.

## G3A-U02 Policy Examples

```text
kp_g3a_u02_add_multi_carry:
  current unified state = hidden_pending
  reason = A seed exists but mapping/QA not verified
  future promotion path = seed QA then selectable_ready

kp_g3a_u02_borrow_zero_middle_handling:
  current unified state = hidden_pending
  reason = C-class generator/validator variant required
  future promotion path = implement variant + QA

kp_g3a_u02_word_problem_estimation_add_sub:
  current unified state = not_selectable
  reason = D-class word_problem_template_required
  future promotion path = outside S43
```

## Non-Goals

```text
S43B4 does not materialize JSON registries.
S43B4 does not create schema validation tests.
S43B4 does not implement resolver logic.
S43B4 does not implement HTML selector UI.
S43B4 does not promote any row to selectable_ready.
```

## S43B4 Gate

```text
S43B4_GATE = PASS_PRINTABLE_STATUS_VISIBILITY_POLICY_LOCKED

PASS:
- unified visibility states locked
- cross-schema alignment matrix locked
- A/B/C/D default visibility policy locked
- promotion rules locked
- D-class prohibition locked
- leakage guard locked
- mixed worksheet policy locked
- G3A-U02 examples aligned
- registry materialization explicitly deferred

GAPS:
- schema validation contract not drafted yet
- no registry JSON materialized yet
- no resolver implementation exists yet
- no HTML KnowledgePoint selector exists yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_KNOWLEDGEPOINT_PATTERN_MAP_SCHEMA_LOCKED
GOAL_DISTANCE_AFTER  = D2_VISIBILITY_POLICY_LOCKED
DISTANCE_REDUCED     = S43 now has a cross-schema visibility gate preventing unverified KP/PatternGroup/Mapping rows from being exposed in HTML

KnowledgePointSchema              100% -> 100%
PatternGroupSchema                100% -> 100%
KnowledgePointPatternMapSchema    100% -> 100%
VisibilityPolicy                    0% -> 100%
PatternGroupRegistry                0% ->   0%
KPHTMLSelectablePath                0% ->   0%
S43Overall                         50% ->  56%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "Schema validation contract 尚未 drafted",
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
NEXT_SHORTEST_STEP = S43B5_SchemaValidationContractDraft
```

S43B5 must draft validation rules that can later test KnowledgePointNode, PatternGroup, Mapping, and visibility alignment before registry materialization.
