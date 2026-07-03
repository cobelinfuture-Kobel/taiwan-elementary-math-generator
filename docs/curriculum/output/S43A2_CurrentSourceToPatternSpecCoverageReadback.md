# S43A2 Current Source-to-PatternSpec Coverage Readback

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43A2_CurrentSourceToPatternSpecCoverageReadback
TASK_STATUS = READBACK
WRITE_TYPE = docs_only
```

S43A2 formalizes the current Batch A sourceId to browser PatternSpec coverage and classifies whether each current PatternSpec can be reused as an initial PatternGroup seed for the upcoming KnowledgePoint-selectable worksheet path.

This task does not implement UI, generator, validator, renderer, PatternGroup registry, or KnowledgePoint registry.

## Source Inputs

```text
primaryStableFile = site/modules/curriculum/batch-a/source-pattern-index.js
priorInventory    = docs/curriculum/output/S43A1_BatchAKnowledgePointSelectableWorksheetInventory.md
```

## Readback Summary

```text
batchASourceUnitCount = 13
currentBrowserPatternSpecCount = 14
sourceUnitsWithOnePattern = 12
sourceUnitsWithTwoPatterns = 1
sourceUnitWithTwoPatterns = g3a_u02_3a02
knowledgePointRegistryStatus = absent
patternGroupRegistryStatus = absent
knowledgePointPatternMapStatus = absent
```

The current stable browser bridge is source-unit selectable. It is not yet KnowledgePoint selectable.

## Current Source-to-PatternSpec Coverage Matrix

| sourceId | unit | current PatternSpec IDs | count | current coverage type | PatternGroup seed decision |
|---|---|---|---:|---|---|
| g3a_u01_3a01 | 3A-U01 10000以內的數 | ps_g3a_u01_4digit_compare | 1 | one coarse number-sense comparison pattern | reusable_seed_only |
| g3a_u02_3a02 | 3A-U02 四位數的加減 | ps_g3a_u02_4digit_add_multi_carry; ps_g3a_u02_4digit_sub_multi_borrow | 2 | two coarse add/sub patterns | reusable_seed_with_constraint_warning |
| g3a_u03_3a03 | 3A-U03 乘法 | ps_g3a_u03_2digit_by_1digit_carry | 1 | one coarse multiplication pattern | reusable_seed_with_constraint_warning |
| g3a_u06_3a06 | 3A-U06 二位數除以一位數 | ps_g3a_u06_exact_division_check | 1 | one exact division pattern | reusable_seed_only |
| g3b_u01_3b01 | 3B-U01 除法 | ps_g3b_u01_3digit_by_1digit_regroup_hundreds | 1 | one exact division pattern | reusable_seed_with_constraint_warning |
| g3b_u04_3b04 | 3B-U04 兩步驟計算 | ps_g3b_u04_consecutive_multiplication | 1 | one two-step multiplication pattern | reusable_seed_only |
| g3b_u08_3b08 | 3B-U08 乘法與除法 | ps_g3b_u08_division_check_exact | 1 | one exact division pattern used as inverse-check bridge | reusable_seed_only |
| g4a_u01_4a01 | 4A-U01 1億以內的數 | ps_g4a_u01_compare_8digit | 1 | one large-number comparison pattern | reusable_seed_only |
| g4a_u02_4a02 | 4A-U02 整數的乘法 | ps_g4a_u02_2digit_by_2digit | 1 | one two-digit multiplication pattern | reusable_seed_only |
| g4a_u04_4a04 | 4A-U04 整數的除法 | ps_g4a_u04_4digit_by_1digit_high_place_exact | 1 | one exact division pattern | reusable_seed_with_constraint_warning |
| g4a_u08_4a08 | 4A-U08 整數四則 | ps_g4a_u08_left_to_right_add_sub | 1 | one left-to-right add/sub pattern | reusable_seed_only |
| g4b_u01_4b01 | 4B-U01 多位數的乘與除 | ps_g4b_u01_multiplier_trailing_zero | 1 | one trailing-zero multiplication pattern | reusable_seed_only |
| g5a_u08_5a08 | 5A-U08 整數四則 | ps_g5a_u08_repeated_subtraction | 1 | one repeated-subtraction mixed-operation pattern | reusable_seed_only |

## Reuse Classification Rules

```text
reusable_seed_only = can seed a PatternGroup, but does not represent full unit KnowledgePoint coverage.
reusable_seed_with_constraint_warning = can seed a PatternGroup, but its label implies a fine-grained algorithmic constraint that is not fully encoded in the current browser bridge definition.
not_reusable_as_fine_kp = would be too coarse or semantically misleading if treated as a complete KnowledgePoint.
```

All 14 current PatternSpecs may be reused as initial PatternGroup seeds, but none should be treated as complete unit-level KnowledgePoint coverage.

## Constraint Warnings

### Carry / Borrow Naming Warning

The current browser PatternSpec helper stores operators, ranges, answer constraints, and skill tags. It does not store explicit carry/borrow policy fields.

Therefore these IDs should not be treated as fully verified fine-grained carry/borrow KnowledgePoints yet:

```text
ps_g3a_u02_4digit_add_multi_carry
ps_g3a_u02_4digit_sub_multi_borrow
ps_g3a_u03_2digit_by_1digit_carry
```

Reason:

```text
The PatternSpec ID names mention carry/borrow, but the current browser bridge parameters mainly encode operand ranges and operator slots.
A future PatternGroup / PatternSpec registry must add explicit algorithmic constraint tags or validator hooks for no_carry, single_carry, multi_carry, no_borrow, single_borrow, and multi_borrow.
```

### Division Exactness Warning

Current division PatternSpecs include `requireExactQuotient: true` and therefore only cover exact division paths.

They do not cover:

```text
有餘數除法
餘數小於除數
商補 0
最高位不夠除退位
十位/個位不夠除
估商
等分除 / 包含除 word-problem templates
```

Affected current seeds:

```text
ps_g3a_u06_exact_division_check
ps_g3b_u01_3digit_by_1digit_regroup_hundreds
ps_g3b_u08_division_check_exact
ps_g4a_u04_4digit_by_1digit_high_place_exact
```

## PatternGroup Seed Candidates

Initial seed PatternGroups can be created from the current PatternSpecs as follows:

| patternGroupId candidate | sourceId | seed PatternSpec | seed displayName | reuse status |
|---|---|---|---|---|
| pg_g3a_u01_4digit_compare | g3a_u01_3a01 | ps_g3a_u01_4digit_compare | 四位數比大小 | seed_only |
| pg_g3a_u02_4digit_add_general | g3a_u02_3a02 | ps_g3a_u02_4digit_add_multi_carry | 四位數加法 | seed_with_constraint_warning |
| pg_g3a_u02_4digit_sub_general | g3a_u02_3a02 | ps_g3a_u02_4digit_sub_multi_borrow | 四位數減法 | seed_with_constraint_warning |
| pg_g3a_u03_2digit_by_1digit | g3a_u03_3a03 | ps_g3a_u03_2digit_by_1digit_carry | 二位數乘以一位數 | seed_with_constraint_warning |
| pg_g3a_u06_2digit_by_1digit_exact | g3a_u06_3a06 | ps_g3a_u06_exact_division_check | 二位數除以一位數整除 | seed_only |
| pg_g3b_u01_3digit_by_1digit_exact | g3b_u01_3b01 | ps_g3b_u01_3digit_by_1digit_regroup_hundreds | 三位數除以一位數 | seed_with_constraint_warning |
| pg_g3b_u04_consecutive_multiplication | g3b_u04_3b04 | ps_g3b_u04_consecutive_multiplication | 連乘兩步驟 | seed_only |
| pg_g3b_u08_division_check_exact | g3b_u08_3b08 | ps_g3b_u08_division_check_exact | 乘除互逆檢查 | seed_only |
| pg_g4a_u01_compare_8digit | g4a_u01_4a01 | ps_g4a_u01_compare_8digit | 八位數比大小 | seed_only |
| pg_g4a_u02_2digit_by_2digit | g4a_u02_4a02 | ps_g4a_u02_2digit_by_2digit | 二位數乘以二位數 | seed_only |
| pg_g4a_u04_4digit_by_1digit_exact | g4a_u04_4a04 | ps_g4a_u04_4digit_by_1digit_high_place_exact | 四位數除以一位數 | seed_with_constraint_warning |
| pg_g4a_u08_add_sub_left_to_right | g4a_u08_4a08 | ps_g4a_u08_left_to_right_add_sub | 整數加減混合 | seed_only |
| pg_g4b_u01_trailing_zero_multiplication | g4b_u01_4b01 | ps_g4b_u01_multiplier_trailing_zero | 末位為 0 的乘法 | seed_only |
| pg_g5a_u08_repeated_subtraction | g5a_u08_5a08 | ps_g5a_u08_repeated_subtraction | 連減整數四則 | seed_only |

## Missing Fine-Grained PatternSpec Families

S43A2 confirms that new fine-grained PatternSpecs will be required after schema lock. Examples:

```text
g3a_u02:
- add_no_carry
- add_single_carry
- add_multi_carry_with_enforced_carry
- sub_no_borrow
- sub_single_borrow
- sub_multi_borrow_with_enforced_borrow
- add_sub_mixed
- missing_digit_add_sub
- estimate_to_nearest_thousand

g3a_u06 / g3b_u01 / g4a_u04:
- exact_division_by_digit_pattern
- remainder_division
- quotient_has_zero
- highest_place_insufficient
- estimate_quotient
- division_missing_digit

g4a_u08 / g5a_u08:
- operation_precedence
- parentheses_first
- distributive_property
- repeated_subtraction
- repeated_division
- two_step_word_problem_template
```

## S43A2 Gate

```text
S43A2_GATE = PASS_CURRENT_PATTERN_COVERAGE_READBACK

PASS:
- 13 / 13 source units have current PatternSpec coverage readback
- 14 / 14 current PatternSpecs classified
- current PatternSpecs classified as seed candidates, not complete KP coverage
- carry/borrow/division exactness warnings recorded
- first reusable PatternGroup seed list drafted

GAPS:
- PatternGroup schema not locked yet
- KnowledgePoint schema not locked yet
- no PatternGroup JSON materialized yet
- fine-grained PatternSpec families not created yet
- HTML KnowledgePoint selector not implemented yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D3_INVENTORY_DONE_WITH_KP_PRINTABLE_GAPS_IDENTIFIED
GOAL_DISTANCE_AFTER  = D3_CURRENT_PATTERN_COVERAGE_CLASSIFIED_FOR_PATTERN_GROUP_SEEDING
DISTANCE_REDUCED     = existing 14 browser PatternSpecs are now classified for reuse as PatternGroup seeds and not misclassified as complete fine-grained KnowledgePoint coverage

SourceUnitCoverage               100% -> 100%
CurrentPatternReadback           100% -> 100%
PatternReuseClassification         0% -> 100%
ExpectedKPDraft                   60% ->  60%
PatternGroupSchema                 0% ->   0%
PatternGroupRegistry               0% ->   0%
KPHTMLSelectablePath               0% ->   0%
S43Overall                        12% ->  16%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "KnowledgePointNode schema 尚未鎖定",
  "PatternGroup schema 尚未鎖定",
  "KnowledgePointPatternMap schema 尚未鎖定",
  "PatternGroup JSON 尚未 materialize",
  "carry/borrow explicit constraints 尚未進 PatternSpec schema",
  "division remainder / quotient-zero / estimate quotient families 尚未建 PatternSpec",
  "HTML KnowledgePoint selector 尚未實作",
  "per-KP printable QA 尚未建立"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43A3_ExpectedKnowledgePointListDraftFor13Units
```

S43A3 should turn the S43A1 expected KP examples into a normalized 13-unit KnowledgePoint draft list with stable `knowledgePointId` candidates and source-backed/support-status fields, without implementing PatternGroup or UI yet.
