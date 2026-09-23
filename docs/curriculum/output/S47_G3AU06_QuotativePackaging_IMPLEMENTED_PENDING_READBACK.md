# S47 G3A-U06 Quotative Division Packaging — Pending Readback

```text
CURRENT_MAJOR_TASK = S47_G3AU06_QuotativeDivisionPackaging_Implementation
CURRENT_SUBTASK = implement standalone generator/check/tests for 包含除：分裝
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3a_u06_3a06
KNOWLEDGE_POINT_ID = kp_g3a_u06_quotative_division_packaging
PATTERN_SPEC_ID = ps_g3a_u06_quotative_division_packaging
```

## Scope

```text
IN_SCOPE = ["standalone semantic model", "standalone generator", "standalone checker", "automated tests"]
OUT_OF_SCOPE = ["UI selector", "worksheet route", "mixed allocation", "PDF smoke"]
```

## Contract

```text
semanticModel = quotative_division
meaning = total items, fixed items per group, ask groupCount
formula = total = itemsPerGroup * groupCount
answerField = groupCount
```

## Files

```text
site/modules/curriculum/batch-a/g3a-u06-word-problem-generator.js
site/modules/curriculum/batch-a/g3a-u06-packaging-check.js
tests/curriculum/g3a-u06-quotative-packaging.test.js
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_G3A_U06_NEW_KP_FORMAL_MAPPING_READY
GOAL_DISTANCE_AFTER  = D1_G3A_U06_QUOTATIVE_PACKAGING_GENERATOR_CHECKER_TESTS_IMPLEMENTED
DISTANCE_REDUCED     = 包含除：分裝 advanced from mapping contract to standalone generator/checker/test implementation
REMAINING_BLOCKERS   = ["CI readback pending", "not yet visible in UI", "worksheet route not yet connected", "PDF smoke deferred"]
NEXT_SHORTEST_STEP   = S48_G3AU06_PartitiveDivisionEqualSharing_Implementation
```
