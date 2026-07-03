# S43B5 Schema Validation Contract Draft

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43B5_SchemaValidationContractDraft
TASK_STATUS = VALIDATION_CONTRACT_DRAFT
WRITE_TYPE = docs_only
```

S43B5 drafts validation rules for the three locked registry schemas and the cross-schema visibility policy.

This task does not create registry JSON, test code, PatternSpecs, generator variants, validator variants, resolver logic, renderer changes, or HTML UI.

## Inputs

```text
S43B1 = KnowledgePointNode schema lock
S43B2 = PatternGroup schema lock
S43B3 = KnowledgePointPatternMap schema lock
S43B4 = printable status and visibility policy lock
```

## Validation Scope

Future validation must cover four layers:

```text
1. KnowledgePointNode row validation
2. PatternGroup row validation
3. KnowledgePointPatternMap row validation
4. Cross-schema visibility alignment validation
```

The contract is intended for future tests before registry materialization and before any HTML KnowledgePoint selector work.

## Validation Levels

```text
L1 = static schema validation
L2 = enum and ID-format validation
L3 = referential integrity validation
L4 = supportClass and holdReason consistency validation
L5 = visibility alignment validation
L6 = HTML exposure eligibility validation
```

## L1 KnowledgePointNode Validation

Required checks:

```text
- every row has all S43B1 required fields
- knowledgePointId starts with kp_
- knowledgePointId is unique
- sourceId is one of the 13 Batch A source IDs
- supportClass is A/B/C/D
- patternGroupIds exists and is an array
- htmlSelectableStatus is selectable, hidden, or not_selectable
- holdReason exists and may be null only when selectable
```

## L1 PatternGroup Validation

Required checks:

```text
- every row has all S43B2 required fields
- patternGroupId starts with pg_
- patternGroupId is unique
- sourceId is one of the 13 Batch A source IDs
- primaryKnowledgePointId appears in knowledgePointIds
- knowledgePointIds is not empty
- patternSpecIds exists and is an array
- visibilityStatus is visible, hidden, or not_selectable
- allocationPolicy is valid for PatternSpec count
```

## L1 Mapping Validation

Required checks:

```text
- every row has all S43B3 required fields
- mappingId starts with map_
- mappingId is unique
- sourceId is one of the 13 Batch A source IDs
- supportClass is A/B/C/D
- patternSpecId may be null only when mappingStatus is not implemented or out_of_s43_scope
- constraintStatus seed_warning or missing requires constraintNote
- htmlExposurePolicy is eligible_after_qa, internal_only, or not_selectable
```

## L3 Referential Integrity Validation

Required checks:

```text
- PatternGroup.primaryKnowledgePointId references an existing KnowledgePointNode
- every PatternGroup.knowledgePointIds item references an existing KnowledgePointNode
- Mapping.knowledgePointId references an existing KnowledgePointNode
- Mapping.patternGroupId references an existing PatternGroup
- Mapping.sourceId equals KnowledgePointNode.sourceId
- Mapping.sourceId equals PatternGroup.sourceId
- PatternGroup.sourceId equals every referenced KnowledgePointNode.sourceId
```

For future PatternSpec materialization:

```text
- non-null Mapping.patternSpecId must reference an existing PatternSpec
- PatternGroup.patternSpecIds must include every mapped primary PatternSpec when mapping is materialized
```

## L4 SupportClass Consistency Validation

Required checks:

```text
A:
- may use seed PatternSpec
- may remain hidden until QA
- must not become selectable without PatternGroup and mapping QA

B:
- requires fine PatternSpec before selectable
- must not be visible while patternSpecIds is empty

C:
- requires generator and/or validator variant before selectable
- holdReason must mention generator or validator requirement

D:
- must be not_selectable across KnowledgePointNode, PatternGroup, and mapping
- must never be exposed in S43 selector, query params, resolver input, or mixed worksheet mode
```

## L5 Visibility Alignment Validation

The only selectable-ready triplet is:

```text
KnowledgePointNode.htmlSelectableStatus = selectable
PatternGroup.visibilityStatus = visible
Mapping.htmlExposurePolicy = eligible_after_qa
Mapping.qaStatus = qa_verified
Mapping.patternSpecId != null
```

Invalid states:

```text
- KnowledgePointNode selectable but PatternGroup hidden/not_selectable
- PatternGroup visible but Mapping internal_only/not_selectable
- Mapping eligible_after_qa but qaStatus not qa_verified
- supportClass D with any visible/selectable state
- any row with non-null holdReason exposed to HTML
```

## L6 HTML Exposure Eligibility Validation

A KnowledgePoint may appear in the future HTML selector only if at least one related PatternGroup and Mapping satisfy all conditions:

```text
- KP.htmlSelectableStatus = selectable
- PatternGroup.visibilityStatus = visible
- Mapping.htmlExposurePolicy = eligible_after_qa
- Mapping.qaStatus = qa_verified
- Mapping.patternSpecId is not null
- PatternGroup has at least one PatternSpec ID
- PatternGroup.htmlWorksheetStatus = printable or seed_printable
- PatternGroup.answerKeyStatus = supported or seed_supported
- supportClass is not D
- holdReason is null
```

## Negative Validation Cases

Future validation tests must reject:

```text
- duplicate knowledgePointId / patternGroupId / mappingId
- unknown sourceId
- D-class row marked selectable or visible
- mapping with eligible_after_qa but qaStatus not qa_verified
- mapping with seed_warning but null constraintNote
- PatternGroup visible with empty patternSpecIds
- Mapping patternSpecId null while mappingStatus materialized or qa_verified
- cross-source mapping between KP and PatternGroup
- HTML exposure of hidden_pending or not_selectable rows
```

## G3A-U02 Required Future Validation Samples

```text
A seed sample:
- kp_g3a_u02_add_multi_carry may remain hidden_pending while seed QA is incomplete
- it must not become selectable until mapping qaStatus = qa_verified

C variant sample:
- kp_g3a_u02_borrow_zero_middle_handling must remain hidden_pending until generator and validator variants pass QA

D sample:
- kp_g3a_u02_word_problem_estimation_add_sub must remain not_selectable during S43
```

## Non-Goals

```text
S43B5 does not write test code.
S43B5 does not create registry JSON.
S43B5 does not materialize G3A-U02 rows.
S43B5 does not implement resolver logic.
S43B5 does not implement HTML selector UI.
```

## S43B5 Gate

```text
S43B5_GATE = PASS_SCHEMA_VALIDATION_CONTRACT_DRAFTED

PASS:
- validation levels L1-L6 drafted
- KnowledgePointNode validation rules drafted
- PatternGroup validation rules drafted
- Mapping validation rules drafted
- referential integrity checks drafted
- supportClass consistency checks drafted
- visibility alignment checks drafted
- HTML exposure eligibility checks drafted
- negative validation cases drafted
- registry materialization explicitly deferred

GAPS:
- no validation test file implemented yet
- no registry JSON materialized yet
- no G3A-U02 prototype registry materialization plan yet
- no HTML KnowledgePoint selector exists yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_VISIBILITY_POLICY_LOCKED
GOAL_DISTANCE_AFTER  = D2_SCHEMA_VALIDATION_CONTRACT_DRAFTED
DISTANCE_REDUCED     = S43 now has validation criteria for KnowledgePointNode, PatternGroup, Mapping, and HTML exposure safety before registry materialization

KnowledgePointSchema              100% -> 100%
PatternGroupSchema                100% -> 100%
KnowledgePointPatternMapSchema    100% -> 100%
VisibilityPolicy                  100% -> 100%
SchemaValidationContract            0% -> 100%
PatternGroupRegistry                0% ->   0%
KPHTMLSelectablePath                0% ->   0%
S43Overall                         56% ->  62%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "Validation test file 尚未 implemented",
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
NEXT_SHORTEST_STEP = S43C1_G3AU02PrototypeRegistryMaterializationPlan
```

S43C1 should plan the first G3A-U02 prototype registry slice using the locked schemas and validation contract before writing production JSON.
