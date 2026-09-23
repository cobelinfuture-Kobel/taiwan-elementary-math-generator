# S49 G3A-U06 Parity Range Missing Digit — Pending Readback

```text
CURRENT_MAJOR_TASK = S49_G3AU06_ParityRangeMissingDigit_Implementation
CURRENT_SUBTASK = implement standalone generator/audit/test for 奇偶數條件判斷
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3a_u06_3a06
KNOWLEDGE_POINT_ID = kp_g3a_u06_parity_range_missing_digit
PATTERN_SPEC_ID = ps_g3a_u06_parity_range_missing_digit
```

## Scope

```text
IN_SCOPE = ["standalone condition model", "multi-answer generator", "answer enumeration audit", "automated tests"]
OUT_OF_SCOPE = ["UI selector", "worksheet route", "mixed allocation", "PDF smoke"]
```

## Contract

```text
kind = parityRangeMissingDigit
model = tensDigit + missing ones digit
conditions = lowerBound < value < upperBound and parityTarget matches
answerModel = multiple integer answers in ascending order
```

## Files

```text
site/modules/curriculum/batch-a/g3a-u06-parity-generator.js
site/modules/curriculum/batch-a/g3a-u06-parity-audit.js
tests/curriculum/g3a-u06-parity-range.test.js
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_G3A_U06_NEW_KP_FORMAL_MAPPING_READY
GOAL_DISTANCE_AFTER  = D1_G3A_U06_PARITY_RANGE_GENERATOR_AUDIT_TESTS_IMPLEMENTED
DISTANCE_REDUCED     = 奇偶數條件判斷 advanced from mapping contract to standalone generator/audit/test implementation
REMAINING_BLOCKERS   = ["CI readback pending", "not yet visible in UI", "worksheet route not yet connected", "PDF smoke deferred"]
NEXT_SHORTEST_STEP   = S50_G3AU06_UIRegistrySelector_Integration
```
