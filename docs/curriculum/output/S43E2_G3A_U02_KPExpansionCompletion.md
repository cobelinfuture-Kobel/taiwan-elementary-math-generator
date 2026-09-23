# S43E2 — G3A-U02 KnowledgePoint Expansion Completion

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E2_G3A_U02_KPExpansionCompletion
TASK_STATUS = PASS_UNIT_EXPANSION_OVERLAY
WRITE_TYPE = unit_registry_expansion_overlay_plus_closeout_documentation
REPOSITORY = cobelinfuture-Kobel/taiwan-elementary-math-generator
BRANCH = main
```

## 1. Scope Lock

This task completes the G3A-U02 KnowledgePoint expansion inventory as a unit-level registry overlay.

In scope:

```text
- Complete G3A-U02 KnowledgePoint coverage list
- Record PatternGroup / PatternSpec path for each G3A-U02 KP
- Classify supportClass A/C/D
- Preserve the existing S43C visible KP only
- Keep all new C-class rows hidden
- Keep D-class rows not_selectable
```

Out of scope:

```text
- Browser selector regeneration
- New generator implementation
- New validator implementation
- Same-unit mixed KP mode
- Cross-unit mixed KP mode
- Batch B/C/D/E
- Other Batch A units
- Production release
```

## 2. Artifact Created

```text
data/curriculum/registry/unit_expansions/S43E2_G3A_U02_KPExpansionCompletion.json
```

This is a unit expansion overlay. It does not change the browser projection and does not expose new HTML-selectable rows.

## 3. G3A-U02 KnowledgePoint Coverage

S43E2 records 13 G3A-U02 KnowledgePoints:

```text
A-class:
1. kp_g3a_u02_add_multi_carry
2. kp_g3a_u02_sub_multi_borrow

C-class:
3. kp_g3a_u02_add_no_carry
4. kp_g3a_u02_add_single_carry
5. kp_g3a_u02_sub_no_borrow
6. kp_g3a_u02_sub_single_borrow
7. kp_g3a_u02_sub_continuous_borrow
8. kp_g3a_u02_sub_borrow_across_zero
9. kp_g3a_u02_add_missing_digit
10. kp_g3a_u02_sub_missing_digit
11. kp_g3a_u02_sub_middle_missing_digit

D-class:
12. kp_g3a_u02_estimate_nearest_thousand
13. kp_g3a_u02_word_problem_estimation_add_sub
```

## 4. Support Classification

```text
supportClassA = 2
supportClassC = 9
supportClassD = 2
```

A-class means an existing or seed runtime path is known, but only `kp_g3a_u02_add_multi_carry` remains visible from the prior S43C gate.

C-class means candidate PatternGroup / PatternSpec path is declared, but new generator / validator work is required before exposure.

D-class means out of S43 printable scope and must remain not_selectable.

## 5. Exposure Policy

```text
browserProjectionChanged = false
visibleKnowledgePointChange = none
selectableNow = 1
hiddenRows = 10
notSelectableRows = 2
```

Only the prior S43C visible KP remains selectable:

```text
kp_g3a_u02_add_multi_carry
```

S43E2 does not expose:

```text
- kp_g3a_u02_sub_multi_borrow
- any new C-class row
- any D-class row
```

## 6. Gate Check

```text
S43E2_GATE = PASS
```

Checks:

```text
PASS — G3A-U02 has completed unit-level KnowledgePoint coverage
PASS — each G3A-U02 row has PatternGroup path or explicit D-class no-pattern policy
PASS — A-class rows have known existing/seed PatternSpec path
PASS — C-class rows have candidate PatternSpec IDs and explicit implementation blockers
PASS — D-class rows have explicit blocked reasons
PASS — new rows are not exposed in browser selector
PASS — visible KP count is unchanged
PASS — no browser selector regeneration was performed
PASS — no runtime code was changed
PASS — no mixed KP mode was enabled
```

## 7. Runtime / Test Status

```text
RUNTIME_CODE_CHANGED = false
BROWSER_PROJECTION_CHANGED = false
NPM_TEST = NOT_RUN_THIS_STEP
REASON = registry overlay and closeout documentation only
```

## 8. Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_BATCH_A_KP_EXPANSION_STARTED_WITH_G3A_U01_REGISTRY_COVERAGE
GOAL_DISTANCE_AFTER  = D1_BATCH_A_KP_EXPANSION_HAS_G3A_U01_AND_G3A_U02_REGISTRY_COVERAGE
DISTANCE_REDUCED     = completed G3A-U02 unit-level KnowledgePoint expansion coverage while preserving selector safety
```

Distance vector:

```text
Source                         100%
KnowledgePoint registry         G3A-U01 + G3A-U02 coverage recorded
PatternGroup registry           G3A-U01 + G3A-U02 paths recorded
KP → PatternSpec map            G3A-U01 + G3A-U02 paths recorded
Generator                       unchanged
Validator                       unchanged
Worksheet                       unchanged
HTML single-KP selector         unchanged; only G3A-U02 add_multi_carry visible
Mixed KP selector               0% / disabled
Batch A 13-unit KP expansion    2 / 13 units covered at registry/overlay level
S43 overall                     in progress
```

## 9. Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "G3A-U02 C-class rows require generator / validator implementation before exposure",
  "G3A-U02 sub_multi_borrow remains hidden pending explicit borrow-policy QA",
  "G3A-U02 D-class estimation and word-problem rows remain not_selectable",
  "Browser selector projection was not regenerated for S43E2",
  "Only G3A-U02 add_multi_carry remains visible/selectable in HTML",
  "S43E3–S43E13 remaining unit expansions have not started",
  "S43F generator/validator expansion has not started",
  "S43G mixed KnowledgePoint worksheet QA has not started"
]
```

## 10. Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43E3_G3A_U03_KPExpansion
```

Rationale:

```text
S43E1 covered G3A-U01.
S43E2 covered G3A-U02 at unit-level registry overlay level.
The roadmap order places G3A-U03 expansion next.
```

## 11. Closeout

```text
TASK = S43E2_G3A_U02_KPExpansionCompletion
STATUS = PASS_UNIT_EXPANSION_OVERLAY
GOAL_DISTANCE_UPDATED = YES
S43E_PROGRESS = 2_OF_13_UNITS_COVERED_AT_REGISTRY_OVERLAY_LEVEL
NEXT = S43E3_G3A_U03_KPExpansion
```
