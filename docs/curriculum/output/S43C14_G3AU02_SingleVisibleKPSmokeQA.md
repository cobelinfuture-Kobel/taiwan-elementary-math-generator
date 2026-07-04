# S43C14 G3A-U02 Single Visible-KP Smoke QA

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C14_G3AU02_SingleVisibleKPSmokeQA
TASK_STATUS = SINGLE_VISIBLE_KP_SMOKE_QA_IMPLEMENTED_PENDING_TEST_READBACK
ROADMAP_FILE = docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
ROADMAP_PHASE = S43C_G3AU02PrototypeAndFirstVisibleKPPath
ROADMAP_ALIGNMENT = PASS
WRITE_TYPE = smoke_qa_tests_plus_docs
```

## Precondition

```text
S43C13R2R1_STATUS = PASS_PUBLIC_MAIN_SYNCED_AND_TESTED
```

## Files Changed

```text
tests/curriculum/batch-a/g3a-u02-single-visible-kp-smoke-qa.test.js
docs/curriculum/output/S43C14_G3AU02_SingleVisibleKPSmokeQA.md
```

## Gate

```text
S43C14_GATE = PASS_SMOKE_QA_IMPLEMENTED_PENDING_TEST_READBACK
```

The new smoke QA test covers the first visible G3A-U02 KnowledgePoint worksheet path, answer key output, validator pass, sourceUnit preservation, blocked selector ids, and deferred mixed modes.

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_HTML_SINGLE_VISIBLE_KP_ENABLEMENT_PUBLIC_MAIN_TEST_PASS
GOAL_DISTANCE_AFTER  = D1_SINGLE_VISIBLE_KP_SMOKE_QA_IMPLEMENTED_PENDING_TEST_READBACK
DISTANCE_REDUCED     = explicit smoke QA coverage added for the first visible G3A-U02 KnowledgePoint path
```

```text
REMAINING_BLOCKERS = [
  "post-S43C14 public/main npm test PASS 尚未 observed",
  "S43C15 G3A-U02 prototype closeout 尚未完成",
  "S43E 13-unit KP expansion 尚未開始"
]
```

```text
NEXT_SHORTEST_STEP = S43C14R1_PublicMainTestReadback
```
