# S43C14 G3A-U02 Single Visible-KP Smoke QA

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C14_G3AU02_SingleVisibleKPSmokeQA
TASK_STATUS = SINGLE_VISIBLE_KP_SMOKE_QA_IMPLEMENTED_PENDING_TEST_READBACK
WRITE_TYPE = focused_smoke_tests_plus_docs
```

## Roadmap Alignment

```text
ROADMAP_FILE = docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
ROADMAP_PHASE = S43C_G3AU02PrototypeAndFirstVisibleKPPath
ROADMAP_NEXT_EXPECTED_STEP = S43C14_G3AU02_SingleVisibleKPSmokeQA
ROADMAP_ALIGNMENT = PASS
```

S43C14 follows S43C13R2R1 public-main PASS. It is the smoke QA step for the single visible G3A-U02 KnowledgePoint path. It does not proceed to S43C15, does not enable mixed-KP generation, and does not start S43E.

## Preflight Inputs

```text
S43C13R2R1_STATUS = PASS_PUBLIC_MAIN_SYNCED_AND_TESTED
S43C13R2R1_TESTS_TOTAL = 304
S43C13R2R1_TESTS_PASS = 304
S43C13R2R1_TESTS_FAIL = 0
S43C13R2R1_WORKTREE = public/main detached clean
```

## Files Changed

```text
tests/curriculum/batch-a/g3a-u02-single-visible-kp-smoke-qa.test.js
docs/curriculum/output/S43C14_G3AU02_SingleVisibleKPSmokeQA.md
```

## Smoke QA Coverage

The focused smoke QA test now verifies:

```text
1. Registry visibility smoke
   - BATCH_A_SELECTOR_AVAILABILITY.visibleCount = 1
   - hiddenPendingCount = 1
   - notSelectableCount = 2
   - only kp_g3a_u02_add_multi_carry is visible
   - visible KP maps to pg_g3a_u02_add_multi_carry_seed

2. Single visible KP plan smoke
   - worksheetMode = batchAKnowledgePoint
   - selected KP = kp_g3a_u02_add_multi_carry
   - selected PatternGroup = pg_g3a_u02_add_multi_carry_seed
   - resolved PatternSpec = ps_g3a_u02_4digit_add_multi_carry
   - allocation uses only the visible add-multi-carry PatternSpec

3. Single visible KP generation smoke
   - generateBatchABrowserQuestions(...) returns ok = true
   - question count = 12
   - top-level question.patternSpecId is ps_g3a_u02_4digit_add_multi_carry
   - metadata.patternId is ps_g3a_u02_4digit_add_multi_carry
   - sourceId is g3a_u02_3a02
   - validateBatchABrowserQuestions(...) returns ok = true

4. Worksheet / answer key / renderer smoke
   - buildBatchABrowserWorksheetDocument(...) returns ok = true
   - generationMode = batchAKnowledgePoint
   - summary.questionCount = 12
   - generatedQuestions = 12
   - questionDisplayModels = 12
   - answerKeyItems = 12
   - questionPages exist
   - answerKeyPages exist
   - answer key numbering aligns with generated questions
   - HTML renderer output contains question pages, answer-key pages, and visible PatternSpec data attributes

5. Query survival / query protection smoke
   - visible KP query survives as singleKnowledgePoint
   - D-row query falls back to sourceUnit
   - D-row query drops selectedKnowledgePointIds and selectedPatternGroupIds

6. Hidden / D row resolver rejection smoke
   - kp_g3a_u02_sub_multi_borrow remains rejected as KP_NOT_VISIBLE
   - kp_g3a_u02_word_problem_estimation_add_sub remains rejected as KP_NOT_VISIBLE
   - both blocked paths resolve to no PatternSpec and no allocation

7. SourceUnit preservation smoke
   - sourceUnit path still returns batchASourceId worksheet generation
   - selected KP / PatternGroup inputs are ignored in sourceUnit mode
   - sourceUnit G3A-U02 still uses both add and subtract PatternSpecs

8. Mixed mode deferral smoke
   - mixedKnowledgePointsSameUnit remains SAME_UNIT_MIXED_NOT_SUPPORTED_YET
   - mixedKnowledgePointsCrossUnit remains CROSS_UNIT_NOT_SUPPORTED_YET
```

## Scope Boundary Preserved

```text
S43C15 prototype closeout = not executed
same-unit mixed KP selection = not implemented
cross-unit mixed KP selection = not implemented
S43E 13-unit KP expansion = not started
Batch B/C/D/E expansion = not started
```

## S43C14 Gate

```text
S43C14_GATE = PASS_SMOKE_QA_IMPLEMENTED_PENDING_TEST_READBACK

PASS:
- roadmap alignment checked and passed
- focused S43C14 smoke QA test exists
- single visible KP registry state is asserted
- single visible KP plan path is asserted
- single visible KP generation path is asserted
- generated questions are validator-checked
- worksheet answer key path is asserted
- renderer HTML output is asserted
- visible KP query survival is asserted
- D-row query fallback is asserted
- hidden subtract A-row resolver rejection is asserted
- D-row resolver rejection is asserted
- sourceUnit path remains unaffected
- mixed same-unit/cross-unit modes remain deferred
- S43E expansion not started

GAPS:
- post-S43C14 public/main npm test PASS not observed
- S43C15 G3A-U02 prototype closeout not executed
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_HTML_SINGLE_VISIBLE_KP_ENABLEMENT_PUBLIC_MAIN_TEST_PASS
GOAL_DISTANCE_AFTER  = D1_SINGLE_VISIBLE_KP_SMOKE_QA_IMPLEMENTED_PENDING_TEST_READBACK
DISTANCE_REDUCED     = S43C14 smoke QA assertions now cover the single visible KP path, answer key, renderer output, query survival, sourceUnit preservation, hidden/D protection, and mixed-mode deferral; PASS still requires post-S43C14 public-main npm test readback

HTMLSingleVisibleKPEnablement         100% -> 100%
SingleVisibleKPSmokeQA                  0% -> 100%
KPHTMLSelectablePath                   98% ->  99%
S43Overall                             99% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43C14 public/main npm test PASS 尚未 observed",
  "S43C15 G3A-U02 prototype closeout 尚未 executed",
  "S43E 13-unit KP expansion 尚未開始"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C14R1_PublicMainTestReadback
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
