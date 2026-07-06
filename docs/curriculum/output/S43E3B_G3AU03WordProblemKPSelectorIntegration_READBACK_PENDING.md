# S43E3B G3A-U03 Word Problem KP Selector Integration — Readback Pending

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E3B_G3AU03WordProblemKPSelectorIntegration
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
WRITE_TYPE = code_and_test
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

The G3A-U03 selector availability is now expected to show 7 visible KnowledgePoints instead of 6.

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

## Readback Status

```text
CI_STATUS = NOT_AVAILABLE_FROM_CONNECTOR
WORKFLOW_RUNS = []
LOCAL_NPM_TEST = PENDING_OPERATOR_READBACK
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = run npm test and git status on public repo main after pulling latest changes
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U03_WORD_PROBLEM_NOT_IN_KP_SELECTOR
GOAL_DISTANCE_AFTER  = D1_G3A_U03_WORD_PROBLEM_SELECTOR_IMPLEMENTED_READBACK_PENDING
DISTANCE_REDUCED     = selector row, PatternSpec definition, generator path, worksheet path, and tests were added for the specific G3A-U03 word-problem issue

REMAINING_BLOCKERS = [
  "npm test readback 尚未取得",
  "browser smoke 尚未由 operator 確認"
]
```
