# S43C13R2 Public Main Test Failure FullFix

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C13R2_PublicMainTestFailureFullFix
TASK_STATUS = PUBLIC_MAIN_TEST_FAILURE_FULLFIX_IMPLEMENTED_PENDING_TEST_READBACK
WRITE_TYPE = runtime_metadata_patch_plus_test_updates_plus_docs
```

## Roadmap Alignment

```text
ROADMAP_FILE = docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
ROADMAP_PHASE = S43C_G3AU02PrototypeAndFirstVisibleKPPath
ROADMAP_NEXT_EXPECTED_STEP = S43C13R2_PublicMainTestFailureFullFix
ROADMAP_ALIGNMENT = PASS
```

S43C13R2 is a corrective task after S43C13R1 public-main test readback failed. It does not proceed to S43C14 smoke QA and does not expand S43E.

## Failure Input

S43C13R1 public-main worktree test readback reported:

```text
TEST_SCOPE_OBSERVED = public-main worktree
LOCAL_TEST_COMMAND = npm test
LOCAL_TESTS_TOTAL = 302
LOCAL_TESTS_PASS = 295
LOCAL_TESTS_FAIL = 7
S43C13R1_STATUS = PUBLIC_MAIN_TEST_FAIL
```

Observed failures were:

```text
1. stale promotion QA expected add-multi-carry to remain hidden
2. stale promotion QA expected browser selector visibleCount = 0
3. single-KP generation test read top-level question.patternSpecId and received undefined
4. main.js mixed-mode test expected literal MIXED_* enum names in runtime file
5. selector-state default test still expected visibleCount = 0
6. selector-state hidden A-row test still targeted promoted add-multi-carry as hidden
7. readiness file-count guard was stale after S43C13 site/runtime additions
```

## Files Changed

```text
site/modules/curriculum/batch-a/batch-a-browser-generator.js
tests/curriculum/batch-a/g3a-u02-add-multi-carry-promotion-qa.test.js
tests/site/selector-state.test.js
tests/site/html-zero-visible-selector.test.js
tests/site/site-readiness.test.js
docs/curriculum/output/S43C13R2_PublicMainTestFailureFullFix.md
```

## Fix 1: Generated Expression PatternSpec Metadata

Updated:

```text
site/modules/curriculum/batch-a/batch-a-browser-generator.js
```

`attachBatchAMetadata(question, definition)` now sets:

```text
question.patternSpecId = definition.patternSpecId
question.sourceId = definition.sourceId
question.metadata.patternId = definition.patternSpecId
question.metadata.sourceId = definition.sourceId
```

Purpose:

```text
- Keep existing metadata.patternId path intact.
- Also expose top-level patternSpecId consistently for Batch A generated expression questions.
- Fix S43C13 single-KP generation assertion where expression questions previously returned undefined for question.patternSpecId.
```

## Fix 2: Promotion QA Updated to Post-S43C11/S43C12 State

Updated:

```text
tests/curriculum/batch-a/g3a-u02-add-multi-carry-promotion-qa.test.js
```

The test now expects the promoted add-multi-carry registry triplet:

```text
KnowledgePoint.htmlSelectableStatus = selectable
PatternGroup.visibilityStatus = visible
Mapping.htmlExposurePolicy = eligible_after_qa
Mapping.qaStatus = qa_verified
```

The browser selector projection now expects:

```text
visibleCount = 1
hiddenPendingCount = 1
notSelectableCount = 2
```

Protection retained:

```text
kp_g3a_u02_sub_multi_borrow remains hidden
D rows remain not_selectable
```

## Fix 3: Selector State Tests Updated to One-Visible Production State

Updated:

```text
tests/site/selector-state.test.js
```

The default state still remains sourceUnit mode, but availability now correctly reflects S43C12:

```text
visibleCount = 1
hiddenPendingCount = 1
notSelectableCount = 2
```

Added / preserved coverage:

```text
- visible add-multi-carry KP survives normalization
- hidden subtract A-row is dropped
- D-row is dropped
- piecemeal setters still fall back safely
- atomic selector setter can enter single-KP mode only with both visible KP and PatternGroup ids
- worksheet plan remains sourceUnit by default
```

## Fix 4: HTML Selector Test Aligned With Actual Disabled-Mode Contract

Updated:

```text
tests/site/html-zero-visible-selector.test.js
```

The test no longer requires literal mixed-mode enum names to appear in `main.js`. It verifies:

```text
- index.html still disables mixedKnowledgePointsSameUnit
- index.html still disables mixedKnowledgePointsCrossUnit
- main.js reads generated selector projection
- main.js uses setBatchASelectorSelection
- main.js has disabled-option handling
- main.js does not call resolveVisiblePatternGroupSelection directly
- main.js does not hardcode visible/hidden/D row ids
```

## Fix 5: Site Readiness File-Count Guard Updated

Updated:

```text
tests/site/site-readiness.test.js
```

The upper file-count sanity bound was increased:

```text
before: files.length <= 40
after:  files.length <= 50
```

Reason:

```text
S43C13 intentionally added/expanded browser registry, selector, and KP runtime artifacts under site/. The guard remains bounded and still detects abnormal site bloat, node_modules, or .git leakage.
```

## Scope Boundary Preserved

```text
S43C14 smoke QA = not executed
same-unit mixed KP selection = not implemented
cross-unit mixed KP selection = not implemented
S43E 13-unit KP expansion = not started
dev/private branch merge/rebase = not performed
```

## S43C13R2 Gate

```text
S43C13R2_GATE = PASS_FULLFIX_IMPLEMENTED_PENDING_TEST_READBACK

PASS:
- public-main 7-failure set was addressed directly
- stale hidden/zero-visible promotion tests updated
- generated expression questions now expose top-level patternSpecId/sourceId
- selector-state tests updated for one-visible production state
- main.js selector test updated to disabled-mode contract
- readiness file-count guard updated within bounded sanity range
- hidden subtract A-row protection preserved
- D-row protection preserved
- mixed same-unit/cross-unit modes remain disabled
- S43E expansion not started

GAPS:
- post-S43C13R2 public/main npm test PASS not observed
- S43C14 single visible KP smoke QA not executed
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_HTML_SINGLE_VISIBLE_KP_ENABLEMENT_PUBLIC_MAIN_TEST_FAIL
GOAL_DISTANCE_AFTER  = D1_HTML_SINGLE_VISIBLE_KP_ENABLEMENT_FULLFIX_PENDING_TEST_READBACK
DISTANCE_REDUCED     = all 7 observed public-main failure causes were addressed in code/tests, but PASS still requires post-fix public-main npm test readback

HTMLSingleVisibleKPEnablement         100% -> 100%
SingleVisibleKPSmokeQA                  0% ->   0%
KPHTMLSelectablePath                   96% ->  97%
S43Overall                             99% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43C13R2 public/main npm test PASS 尚未 observed",
  "S43C13R2 PASS_LOCAL_SYNCED_AND_TESTED 尚未 achieved",
  "S43C14 single visible KP smoke QA 尚未 executed",
  "S43E 13-unit KP expansion 尚未開始"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C13R2R1_PublicMainTestReadback
```

Run public-main worktree test after pulling the latest public main:

```text
git fetch public main
git checkout public/main
npm test
git status
```

Expected valid evidence:

```text
npm test: fail 0
git status: working tree clean
```
