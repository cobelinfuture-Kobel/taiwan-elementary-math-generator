# S43A5 S43 Implementation Order Decision

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43A5_S43ImplementationOrderDecision
TASK_STATUS = ORDER_DECISION
WRITE_TYPE = docs_only
```

S43A5 closes the S43A inventory/readback phase by selecting the implementation order and the first prototype slice for the Batch A KnowledgePoint-selectable HTML worksheet path.

This task does not implement JSON registries, PatternSpecs, generator variants, validator variants, renderer changes, or HTML UI.

## Inputs

```text
S43A1 = Batch A unit inventory and expected KP estimates
S43A2 = current sourceId -> PatternSpec coverage readback and seed classification
S43A3 = 172 normalized KnowledgePoint draft ID candidates
S43A4 = A/B/C/D printable coverage gap matrix
```

## Decision Summary

```text
DECISION = proceed to schema lock before implementation
FIRST_IMPLEMENTATION_FAMILY = S43B schema lock
FIRST_PROTOTYPE_UNIT = g3a_u02_3a02
FIRST_PROTOTYPE_UNIT_TITLE = 3A-U02 四位數的加減
FIRST_PROTOTYPE_SLICE = A seeds + selected C constraints; D rows hidden
IMMEDIATE_NEXT_STEP = S43B1_KnowledgePointNodeSchemaLock
```

Rationale:

```text
S43A4 classified all 172 KP draft rows into printable coverage classes.
14 A rows can seed coarse PatternGroups.
37 B rows likely need new fine PatternSpecs using existing expression/comparison style generators.
86 C rows require generator and/or validator variants.
35 D rows must remain blocked/hidden for S43 printable path.

Therefore implementation must not jump directly into HTML selector work.
The next valid step is to lock schemas that will govern KP rows, PatternGroups, KP-to-PatternSpec mappings, printable status, and hidden/blocked behavior.
```

## Rejected Paths

| candidate path | decision | reason |
|---|---|---|
| Directly implement HTML KnowledgePoint selector | reject | no KnowledgePointNode / PatternGroup / mapping schema exists yet |
| Directly materialize all 172 KP rows into production JSON | reject | schema not locked; D rows must be hidden/blocked; A/B/C classes need different handling |
| Directly create all missing PatternSpecs | reject | too broad; 37 B + 86 C rows require staged implementation |
| Directly make all 172 KP printable | reject | not all are printable in S43; D rows require visual, word-problem, future-domain, or plannedOnly support |
| Jump to Batch B/C/D/E | reject | S43 is Batch A KP-selectable worksheet completion only |
| Prototype G3A-U02 before schema lock | reject | would cause unstable one-off data shape and future migration cost |

## Approved Implementation Order

```text
S43B1_KnowledgePointNodeSchemaLock
S43B2_PatternGroupSchemaLock
S43B3_KnowledgePointPatternMapSchemaLock
S43B4_PrintableStatusAndVisibilityPolicyLock
S43B5_SchemaValidationContractDraft
S43C1_G3AU02PrototypeRegistryMaterializationPlan
S43C2_G3AU02PatternGroupSeedMaterialization
S43C3_G3AU02FinePatternSpecImplementationPlan
S43C4_G3AU02GeneratorValidatorVariantPlan
S43C5_G3AU02PrototypeQAPlan
S43D1_HTMLKnowledgePointSelectorDesign
```

Execution control rule:

```text
S43B must finish before S43C.
S43C must prove one source unit before S43E expands to 13 units.
S43D HTML selector must not expose D rows.
S43E 13-unit expansion must not start before G3A-U02 prototype passes registry/QA gates.
```

## First Prototype Unit Decision

```text
FIRST_PROTOTYPE_UNIT = g3a_u02_3a02
UNIT = 3A-U02 四位數的加減
```

Reason:

```text
It has 2 A rows, 5 C rows, and 2 D rows.
It is small enough for a controlled prototype, but complex enough to test all required policies:
- existing coarse seed reuse
- carry/borrow explicit constraint warnings
- generator/validator variant needs
- blocked D rows
- future HTML visibility rules
```

## G3A-U02 Prototype Scope

### Included A seed rows

```text
A_SEEDS = [
  "kp_g3a_u02_add_multi_carry",
  "kp_g3a_u02_sub_multi_borrow"
]
```

Use these as initial coarse PatternGroup seeds only. They are not yet complete fine-grained KP coverage because carry/borrow constraints are not explicitly enforced.

### P0 C-class prototype candidates

```text
P0_C_CANDIDATES = [
  "kp_g3a_u02_sub_consecutive_borrow",
  "kp_g3a_u02_vertical_sub_missing_digit",
  "kp_g3a_u02_borrow_zero_middle_handling"
]
```

Why these three:

```text
They exercise the hardest part of 3A-U02: subtraction borrow constraints.
They also expose whether the generator/validator layer can distinguish ordinary subtraction from consecutive borrow, missing digit, and zero-middle borrow handling.
```

### Deferred C-class candidates

```text
DEFERRED_C = [
  "kp_g3a_u02_vertical_add_missing_digit",
  "kp_g3a_u02_sub_missing_middle_digit"
]
```

These remain in G3A-U02 but should follow after the first borrow-focused prototype has a stable schema and QA path.

### Hidden D rows

```text
D_HIDDEN = [
  "kp_g3a_u02_estimate_nearest_thousand",
  "kp_g3a_u02_word_problem_estimation_add_sub"
]
```

Visibility policy:

```text
D rows must not appear as selectable printable HTML KnowledgePoints until the required estimation / word-problem template support exists.
```

## Required Schema Decisions Before Any Prototype JSON

### S43B1 KnowledgePointNode schema must decide

```text
requiredFields = [
  "knowledgePointId",
  "sourceId",
  "unitCode",
  "displayName",
  "canonicalSkillTag",
  "supportClass",
  "sourceAuthorityStatus",
  "registryStatus",
  "patternGroupIds",
  "htmlSelectableStatus",
  "blockedReason"
]
```

### S43B2 PatternGroup schema must decide

```text
requiredFields = [
  "patternGroupId",
  "sourceId",
  "knowledgePointIds",
  "displayName",
  "patternSpecIds",
  "generatorSupportStatus",
  "validatorSupportStatus",
  "htmlWorksheetStatus",
  "answerKeyStatus",
  "visibilityStatus"
]
```

### S43B3 KP-to-PatternSpec map schema must decide

```text
requiredFields = [
  "knowledgePointId",
  "patternGroupId",
  "patternSpecId",
  "mappingRole",
  "mappingStatus",
  "constraintWarning",
  "blockedReason"
]
```

### S43B4 status/visibility policy must decide

```text
supportClass = A | B | C | D
htmlSelectableStatus = selectable | hidden | blocked
visibilityStatus = visible | hidden
blockedReason = visual_required | word_problem_template_required | future_domain | planned_only | schema_pending | generator_variant_required | validator_variant_required
```

## S43 Implementation Track After S43B

```text
Track 1 = Registry track
- materialize KnowledgePoint rows
- materialize PatternGroup rows
- materialize KP-to-PatternSpec map rows

Track 2 = PatternSpec track
- reuse 14 A seeds as PatternGroup seeds
- implement selected G3A-U02 C fine constraints first
- defer broad 13-unit B/C implementation until prototype gates pass

Track 3 = Runtime track
- generator variants
- validator variants
- worksheet plan resolver

Track 4 = HTML track
- source unit expands to KP list
- single KP selection
- same-unit multi-KP selection
- cross-unit multi-KP selection
- D rows hidden/blocked

Track 5 = QA track
- single KP smoke QA
- same-unit multi-KP smoke QA
- cross-unit multi-KP smoke QA
- unsupported leakage QA
- answer key / iframe / print path QA
```

## S43A5 Gate

```text
S43A5_GATE = PASS_IMPLEMENTATION_ORDER_LOCKED

PASS:
- first implementation family selected: S43B schema lock
- immediate next step selected: S43B1_KnowledgePointNodeSchemaLock
- first prototype unit selected: g3a_u02_3a02
- first prototype slice defined using A/C/D policy
- direct HTML implementation rejected until schema and registry path are locked
- D row hidden/blocked policy recognized before UI work

GAPS:
- KnowledgePointNode schema not locked yet
- PatternGroup schema not locked yet
- KnowledgePointPatternMap schema not locked yet
- S43B schema validation contract not drafted yet
- G3A-U02 prototype registry not materialized yet
- no generator/validator variants implemented yet
- HTML KP selector not implemented yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D3_KP_PRINTABLE_GAP_MATRIX_CLASSIFIED
GOAL_DISTANCE_AFTER  = D3_IMPLEMENTATION_ORDER_LOCKED
DISTANCE_REDUCED     = S43 now has a controlled implementation order, first prototype unit, A/C/D policy, and schema-first guard before runtime/UI work

ExpectedKPDraft                   100% -> 100%
PrintableCoverageClassification   100% -> 100%
ImplementationOrder                 0% -> 100%
KnowledgePointSchema                0% ->   0%
PatternGroupSchema                  0% ->   0%
PatternGroupRegistry                0% ->   0%
KPHTMLSelectablePath                0% ->   0%
S43Overall                         28% ->  32%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "KnowledgePointNode schema 尚未鎖定",
  "PatternGroup schema 尚未鎖定",
  "KnowledgePointPatternMap schema 尚未鎖定",
  "PrintableStatus / visibility policy 尚未正式 schema 化",
  "172 個 KP draft rows 尚未進 JSON registry",
  "A 類 PatternSpec seeds 尚未 materialize 為 PatternGroup JSON",
  "G3A-U02 P0 C 類 prototype 尚未拆成 PatternSpec / generator / validator work items",
  "D 類尚未寫入 HTML hidden/blocked policy",
  "HTML KnowledgePoint selector 尚未實作",
  "per-KP printable QA 尚未建立"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43B1_KnowledgePointNodeSchemaLock
```

S43B1 should create the KnowledgePointNode schema contract before any JSON registry materialization or UI work.
