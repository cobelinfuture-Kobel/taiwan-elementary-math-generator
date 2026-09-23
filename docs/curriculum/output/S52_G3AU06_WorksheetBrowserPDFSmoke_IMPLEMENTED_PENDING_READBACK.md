# S52 G3A-U06 Worksheet / Browser / PDF Smoke — Pending Readback

```text
CURRENT_MAJOR_TASK = S52_G3AU06_WorksheetBrowserPDFSmoke
CURRENT_SUBTASK = add automated worksheet bridge smoke for six visible G3A-U06 KPs
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3a_u06_3a06
```

## Scope

```text
IN_SCOPE = ["worksheet bridge smoke", "printable display fields", "six-KP source worksheet coverage"]
OUT_OF_SCOPE = ["manual uploaded PDF inspection", "Pages deployment confirmation"]
```

## Files Updated

```text
site/modules/curriculum/batch-a/g3a-u06-word-problem-generator.js
tests/curriculum/g3a-u06-six-kp-worksheet.test.js
```

## Required Manual Smoke After CI

```text
Generate G3A-U06 同單位混合知識點隨機 PDF.
Expected: all six KPs appear and render printable prompt/blank text.
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U06_SIX_KP_MIXED_ALLOCATION_ORDERING_IMPLEMENTED_PENDING_READBACK
GOAL_DISTANCE_AFTER  = D1_G3A_U06_SIX_KP_WORKSHEET_BRIDGE_SMOKE_IMPLEMENTED_PENDING_READBACK
DISTANCE_REDUCED     = worksheet bridge now has automated smoke coverage for all six visible G3A-U06 KPs
REMAINING_BLOCKERS   = ["CI readback pending", "manual browser PDF smoke pending", "Pages deploy may need rerun"]
NEXT_SHORTEST_STEP   = GitHub Actions CI readback, then browser PDF smoke
```
