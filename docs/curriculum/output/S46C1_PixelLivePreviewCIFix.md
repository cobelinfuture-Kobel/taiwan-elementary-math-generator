S46C1_PixelLivePreviewCIFix

CURRENT_MAJOR_TASK = S46_PixelUIGenerationIntegration
CURRENT_SUBTASK = S46C1_PixelLivePreviewCIFix
TASK_STATUS = FIX_WRITTEN_CI_PENDING
OUTPUT = Stale UI surface assertion aligned with S46C live-preview contract

## 1. Failure Readback

Authoritative CI evidence:

```text
workflow = Math CI Readback
run = 29074583929
run_number = 876
sha = 2b04bbe57201790983ec8a0e4ae46fa38aee017e
status = FAIL_NPM_TEST
tests = 535
pass = 534
fail = 1
workingTree = clean
```

Failing test:

```text
tests/ui/pixel-generate-button-surface.test.js
Pixel public page enables generate button and exposes generation status regions
```

The assertion still required the S46B stage text:

```text
產生流程：已接入
```

S46C intentionally advanced the public status contract to:

```text
共用 Generator / Validator
Live Preview：已接入
```

The product surface was correct; the older S46B surface assertion was stale.

## 2. Fix

Modified only:

```text
tests/ui/pixel-generate-button-surface.test.js
```

The test now verifies both active S46C contracts:

```text
- 共用 Generator / Validator
- Live Preview：已接入
```

Existing generate-button, status-region, controller import, click binding, worksheetId, and question-count assertions remain unchanged.

## 3. Scope Integrity

```text
- No site/pixel production file changed.
- No generator changed.
- No validator changed.
- No renderer changed.
- No registry or PatternSpec changed.
- No G3B-U04/S57 content work changed.
- Pages deployment readback is not required for this test-only fix.
```

## 4. Acceptance Status

```text
Root cause identified = PASS
Stale test assertion replaced = PASS
Production behavior unchanged = PASS
Math CI Readback = PENDING
```

## 5. Closeout

1. 本任務縮短了哪一段距離？
   - It removes the CI blocker caused by an S46B text assertion that no longer matched the S46C live-preview stage.

2. 推進了哪一個系統節點？
   - UI regression QA / CI gate for the Pixel live-preview surface.

3. 是否解除 blocker？
   - Implementation-level yes; authoritative removal requires a passing Math CI rerun.

4. 是否增加新的 blocker？
   - No.

5. 下一個最短有效步驟是什麼？
   - S46C1_CIReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_LIVE_PREVIEW_CI_FAILED_STALE_ASSERTION
GOAL_DISTANCE_AFTER = D1_WEBUI_PIXEL_LIVE_PREVIEW_CI_FIX_WRITTEN
DISTANCE_REDUCED = The single failing stale UI assertion is aligned with the deployed S46C stage contract; no production code changed.
REMAINING_BLOCKERS = ["Need Math CI Readback for S46C1 fix", "Need Deploy GitHub Pages readback for S46C production files if not already successful", "Need S46D answer-key/print controls"]
NEXT_SHORTEST_STEP = S46C1_CIReadback
STOP_REASON = ci_readback_required
BLOCKER_TYPE = CI_FAILURE_FIX_PENDING_VERIFICATION
LAST_COMPLETED_STATUS = S46C1_FIX_WRITTEN
REQUIRED_OPERATOR_ACTION = Provide the next Math CI Readback for the latest S46C1 fix commit.
NEXT_RESUME_TASK = S46C1_CIReadback
