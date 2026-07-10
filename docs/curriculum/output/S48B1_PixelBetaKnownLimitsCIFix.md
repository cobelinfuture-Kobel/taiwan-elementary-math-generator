S48B1_PixelBetaKnownLimitsCIFix

CURRENT_MAJOR_TASK = S48_PixelUIVersionAndReleaseSurface
CURRENT_SUBTASK = S48B1_PixelBetaKnownLimitsCIFix
TASK_STATUS = FIX_WRITTEN_CI_PENDING
OUTPUT = Regression-test alignment for S48B beta/known-limits stage

## 1. Failed Gate

Authoritative failing run:

```text
workflow = Math CI Readback
run = 902
sha = bf894e549002c97662f7df060d6204978f4bca8f
status = FAIL_NPM_TEST
tests = 553
pass = 552
fail = 1
workingTree = clean
```

Failing test:

```text
Pixel public page exposes answer and print controls
file = tests/ui/pixel-print-surface.test.js
stale assertion = /S46D 答案頁與列印控制/
```

## 2. Root Cause

S48B correctly updated the public Pixel workbench label from the older S46D milestone label to:

```text
S48B Beta 標示與已知限制
```

The print-surface regression test still asserted the previous milestone-specific label. The product answer/print surface remained present and functional:

```text
id="pixel-answer-key"
id="pixel-output-summary"
id="pixel-print-button"
src="./pixel-print-surface.js"
Preview / Print：已接入
aria-label="答案頁與列印控制"
```

This was a stale test assertion, not a generator, validator, renderer, preview, answer-key, or print failure.

## 3. Fix

Modified:

```text
tests/ui/pixel-print-surface.test.js
```

Replaced the milestone-specific assertion:

```text
/S46D 答案頁與列印控制/
```

with the stable functional contract:

```text
/aria-label="答案頁與列印控制"/
```

## 4. Scope Integrity

```text
Public Pixel HTML modified = NO
Pixel CSS modified = NO
Generator modified = NO
Validator modified = NO
Renderer modified = NO
Registry / PatternSpec modified = NO
Pages deployment required = NO
Math CI Readback required = YES
```

## 5. Closeout

1. 本任務縮短了哪一段距離？
   - It removes the stale milestone-label assertion blocking S48B acceptance.
2. 推進了哪一個系統節點？
   - Pixel UI regression-test stability / PublicRelease QA.
3. 是否解除 blocker？
   - The identified code-level blocker is fixed; CI verification remains.
4. 是否增加新的 blocker？
   - No.
5. 下一個最短有效步驟是什麼？
   - S48B1_CIReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_BETA_LIMITS_CI_FAILED_STALE_ASSERTION
GOAL_DISTANCE_AFTER = D1_WEBUI_PIXEL_BETA_LIMITS_CI_FIX_WRITTEN
DISTANCE_REDUCED = The only failing S48B test now checks the persistent answer/print accessibility contract instead of an obsolete milestone label.
REMAINING_BLOCKERS = ["Need Math CI Readback for S48B1 fix", "Need S48B Pages deployment acceptance if not already successful", "Need broader Pixel functional QA", "Need final production gate"]
NEXT_SHORTEST_STEP = S48B1_CIReadback
STOP_REASON = ci_readback_required
BLOCKER_TYPE = CI_FAILURE_FIX_PENDING_VERIFICATION
LAST_COMPLETED_STATUS = S48B1_FIX_WRITTEN
REQUIRED_OPERATOR_ACTION = Provide the Math CI Readback for the latest S48B1 fix commit.
NEXT_RESUME_TASK = S48B1_CIReadback
