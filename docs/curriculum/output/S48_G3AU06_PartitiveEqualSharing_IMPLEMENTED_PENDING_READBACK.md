# S48 G3A-U06 Partitive Division Equal Sharing — Pending Readback

```text
CURRENT_MAJOR_TASK = S48_G3AU06_PartitiveDivisionEqualSharing_Implementation
CURRENT_SUBTASK = implement standalone generator/check/test for 等分除：平分
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3a_u06_3a06
KNOWLEDGE_POINT_ID = kp_g3a_u06_partitive_division_equal_sharing
PATTERN_SPEC_ID = ps_g3a_u06_partitive_division_equal_sharing
```

## Scope

```text
IN_SCOPE = ["standalone semantic model", "standalone generator", "standalone checker", "automated tests"]
OUT_OF_SCOPE = ["UI selector", "worksheet route", "mixed allocation", "PDF smoke"]
```

## Contract

```text
semanticModel = partitive_division
meaning = total items, fixed group count, ask itemsPerGroup
formula = total = itemsPerGroup * groupCount
answerField = itemsPerGroup
```

## Files

```text
site/modules/curriculum/batch-a/g3a-u06-word-problem-generator.js
site/modules/curriculum/batch-a/g3a-u06-equal-sharing-check.js
tests/curriculum/g3a-u06-equal-sharing.test.js
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_G3A_U06_NEW_KP_FORMAL_MAPPING_READY
GOAL_DISTANCE_AFTER  = D1_G3A_U06_EQUAL_SHARING_GENERATOR_CHECKER_TESTS_IMPLEMENTED
DISTANCE_REDUCED     = 等分除：平分 advanced from mapping contract to standalone generator/checker/test implementation
REMAINING_BLOCKERS   = ["CI readback pending", "not yet visible in UI", "worksheet route not yet connected", "PDF smoke deferred"]
NEXT_SHORTEST_STEP   = S49_G3AU06_ParityRangeMissingDigit_Implementation
```
