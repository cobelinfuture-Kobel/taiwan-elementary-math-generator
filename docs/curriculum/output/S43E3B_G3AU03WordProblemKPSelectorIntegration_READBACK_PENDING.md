# S43E3B G3A-U03 Word Problem KP Selector Integration — PASS

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E3B_G3AU03WordProblemKPSelectorIntegration
TASK_STATUS = PASS_LOCAL_SYNCED_AND_CLEAN
WRITE_TYPE = code_and_test_readback
```

## Scope Lock

```text
IN_SCOPE:
- G3A-U03 only.
- Add two-step continuous multiplication word-problem KnowledgePoint selector row.
- Add pattern definition for the word-problem PatternSpec.
- Generate word-problem worksheet questions through the existing G3A-U03 quality generator path.
- Add selector / generator / worksheet tests for this path.

OUT_OF_SCOPE:
- Do not expand G3A-U01, G3A-U02, G3A-U06, or other Batch A units in this task.
- Do not enable cross-unit mixed KnowledgePoint selection.
- Do not touch Batch B/C/D/E.
```

## Implemented Files

```text
site/modules/curriculum/registry/batch-a-selector-equation-extension.js
site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js
site/modules/curriculum/batch-a/g3a-u03-quality-generator.js
tests/curriculum/g3a-u03-word-problem-kp-selector.test.js
```

## Implemented Behavior

```text
sourceId = g3a_u03_3a03
knowledgePointId = kp_g3a_u03_consecutive_multiplication_two_step_word_problem
patternGroupId = pg_g3a_u03_consecutive_multiplication_two_step_word_problem
patternSpecId = ps_g3a_u03_consecutive_multiplication_two_step_word_problem
displayName = 兩步驟連續乘法應用題
```

The G3A-U03 selector availability is expected to show 7 visible KnowledgePoints instead of 6.

The word-problem generator produces text questions with three multiplication factors and a final answer blank.

## Added QA Coverage

```text
tests/curriculum/g3a-u03-word-problem-kp-selector.test.js
```

The test covers:

```text
1. Registry visibility for the new G3A-U03 word-problem KnowledgePoint.
2. PatternGroup and PatternSpec resolution from the KnowledgePoint selector path.
3. G3A-U03 word-problem question generation.
4. Worksheet rendering and answer-key creation through the Batch A browser worksheet path.
```

## Final Operator Readback

```text
npm test
tests: 835
suites: 0
pass: 835
fail: 0
cancelled: 0
skipped: 0
todo: 0
duration_ms: 8883.0191

git status
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
```

## Result

```text
S43E3B_STATUS = PASS_LOCAL_SYNCED_AND_CLEAN
G3A_U03_WORD_PROBLEM_KP_SELECTOR = IMPLEMENTED_AND_TESTED
LOCAL_TEST_COMMAND = npm test
LOCAL_TESTS_TOTAL = 835
LOCAL_TESTS_PASS = 835
LOCAL_TESTS_FAIL = 0
LOCAL_WORKTREE_STATUS = clean
LOCAL_BRANCH_STATUS = up_to_date_with_origin_main
```

## Remaining Follow-up

```text
REMAINING_NON_BLOCKING_FOLLOWUP = [
  "browser smoke：在頁面選 3A-U03 乘法 → 單一知識點加強 → 兩步驟連續乘法應用題，確認預覽為中文應用題"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = browser smoke readback for G3A-U03 word-problem selector path
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U03_WORD_PROBLEM_SELECTOR_IMPLEMENTED_READBACK_PENDING
GOAL_DISTANCE_AFTER  = D1_G3A_U03_WORD_PROBLEM_SELECTOR_PASS_LOCAL_SYNCED_AND_CLEAN
DISTANCE_REDUCED     = npm test readback PASS and clean worktree evidence recorded for the specific G3A-U03 word-problem selector issue

REMAINING_BLOCKERS = [
  "browser smoke 尚未由 operator 確認"
]
```
