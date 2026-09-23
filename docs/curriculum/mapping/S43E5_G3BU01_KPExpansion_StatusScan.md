# S43E5 G3B-U01 KP Expansion StatusScan

```text
CURRENT_MAJOR_TASK = S43E5_G3B_U01_KPExpansion
CURRENT_SUBTASK = status scan and supported KP promotion for 3B-U01 除法
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3b_u01_3b01
UNIT = 3B-U01 除法
```

## 1. Source Readback

```text
sourceUnit = g3b_u01_3b01
unitCode = 3B-U01
title = 除法
domain = integer_expression
```

The source unit is present in Batch A source units.

## 2. Existing Supported PatternSpecs

Repository baseline already contains two G3B-U01 exact-division PatternSpecs:

```text
ps_g3b_u01_3digit_by_1digit_regroup_hundreds
  title = 三位數除以一位數
  kind = expression
  operator = divide
  range = [100, 999] ÷ [2, 9]
  division = exact quotient

ps_g3b_u01_2digit_by_1digit_regroup_tens
  title = 二位數除以一位數退位
  kind = expression
  operator = divide
  range = [10, 99] ÷ [2, 9]
  division = exact quotient
```

## 3. Scope Lock

```text
IN_SCOPE = [
  "promote existing G3B-U01 supported division PatternSpecs to visible KnowledgePoints",
  "add PatternGroup rows",
  "add selector/resolver/worksheet tests",
  "update Batch A visibleCount"
]
OUT_OF_SCOPE = [
  "division with remainder",
  "long-division visual layout",
  "word problems",
  "new division validator semantics beyond existing exact-division validator"
]
```

## 4. KnowledgePoint Matrix

| KnowledgePoint | ID | Support class | Status |
|---|---|---:|---|
| 三位數除以一位數 | `kp_g3b_u01_3digit_by_1digit_regroup_hundreds` | A | promoted |
| 二位數除以一位數退位 | `kp_g3b_u01_2digit_by_1digit_regroup_tens` | A | promoted |

## 5. PatternGroup / PatternSpec Map

```text
kp_g3b_u01_3digit_by_1digit_regroup_hundreds
  -> pg_g3b_u01_3digit_by_1digit_regroup_hundreds
  -> ps_g3b_u01_3digit_by_1digit_regroup_hundreds

kp_g3b_u01_2digit_by_1digit_regroup_tens
  -> pg_g3b_u01_2digit_by_1digit_regroup_tens
  -> ps_g3b_u01_2digit_by_1digit_regroup_tens
```

## 6. Implementation Performed

```text
1. Added two G3B-U01 visible KnowledgePoint rows to selector registry.
2. Added two PatternGroup rows and KP -> PatternSpec links.
3. Updated Batch A visibleCount from 24 to 26.
4. Updated G3B-U01 visibleCount to 2.
5. Added G3B-U01 selector / resolver / worksheet tests.
6. Updated stale total visibleCount assertions from 24 to 26.
```

## 7. Validation Required

```text
git pull public main
npm test
git status
browser PDF smoke for G3B-U01 single-KP and same-unit mixed worksheets
```

## 8. Distance Update

```text
GOAL_DISTANCE_BEFORE = D3_G3B_U01_SOURCE_EXISTS_BUT_KP_REGISTRY_ABSENT
GOAL_DISTANCE_AFTER  = D1_G3B_U01_TWO_SUPPORTED_KPS_PROMOTED_PENDING_READBACK
DISTANCE_REDUCED     = G3B-U01 now has two visible supported division KnowledgePoints, PatternGroups, PatternSpec maps, resolver coverage, and worksheet smoke tests
REMAINING_BLOCKERS   = ["npm test readback pending", "browser PDF smoke pending"]
NEXT_SHORTEST_STEP   = git pull public main; npm test; git status
```
