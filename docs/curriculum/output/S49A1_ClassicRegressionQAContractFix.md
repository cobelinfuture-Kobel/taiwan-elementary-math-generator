S49A1_ClassicRegressionQAContractFix

CURRENT_MAJOR_TASK = S49_PixelUIFullQA
CURRENT_SUBTASK = S49A1_ClassicRegressionQAContractFix
TASK_STATUS = FIX_WRITTEN_CI_PENDING
OUTPUT = Align Classic regression QA with the authoritative shared worksheet-result contract

## 1. Failure Readback

Observed deployment sequence:

```text
Deploy GitHub Pages #1219 = PASS at a1b7f07
Deploy GitHub Pages #1220 = FAIL at c9678b4 (S49A test added)
Deploy GitHub Pages #1221 = FAIL at d751863 (S49A docs added)
Deploy GitHub Pages #1222 = FAIL at ccb4b6f (later main commit inherits the broken test)
```

Because `.github/workflows/pages.yml` runs `npm test` in the required `Test` job before deployment, these failures are test-gate failures, not a GitHub Pages hosting outage.

## 2. Root Cause

`tests/ui/classic-regression-qa.test.js` asserted:

```text
result.stage = complete
```

The authoritative shared Classic pipeline is:

```text
buildWorksheetDocumentFromState()
→ buildBatchABrowserWorksheetDocument()
```

Its successful result contract is:

```text
{
  ok: true,
  worksheetDocument,
  validation,
  errors: [],
  warnings
}
```

It does not expose a `stage` field. `stage = complete` belongs to the Pixel generation bridge/controller layer, not the shared Classic worksheet-result contract.

## 3. Full Contract Fix

Modified:

```text
tests/ui/classic-regression-qa.test.js
```

Removed the invalid bridge-specific assertion:

```text
result.stage === complete
```

Replaced it with stable shared-output assertions:

```text
result.ok === true
result.worksheetDocument exists
result.worksheetDocument.schemaVersion === worksheet-document-v1
result.validation.ok === true
```

The 13-source generation checks, question counts, answer-key checks, sourceId checks, Classic surface checks, shared-pipeline wiring checks, responsive checks, and Pixel-bridge exclusion checks remain intact.

## 4. Scope Integrity

```text
Production Classic HTML = unchanged
Production Pixel HTML = unchanged
Generator = unchanged
Validator = unchanged
Renderer = unchanged
Registry / PatternSpec = unchanged
S57 / G3B-U04 implementation = not continued by this task
```

## 5. Acceptance Status

```text
Root cause identified = PASS
Authoritative result contract confirmed = PASS
Invalid bridge-stage assertion removed = PASS
Stable worksheetDocument contract assertion added = PASS
Math CI Readback = PENDING
Deploy GitHub Pages readback = PENDING automatically because Pages workflow also runs tests
```

## 6. Closeout

1. 本任務縮短了哪一段距離？
   - It removes the incorrect Pixel-bridge `stage` assumption from Classic full-chain QA.
2. 推進了哪一個系統節點？
   - Classic WebUI regression QA / shared worksheet-result contract.
3. 是否解除 blocker？
   - At implementation level, yes: the first failing S49A assertion has been corrected.
4. 是否增加新的 blocker？
   - No. CI must verify whether later S57 commits introduce any independent failure after this fix.
5. 下一個最短有效步驟是什麼？
   - S49A1_CIReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_CLASSIC_REGRESSION_QA_CI_FAILED_WRONG_RESULT_STAGE_CONTRACT
GOAL_DISTANCE_AFTER = D1_WEBUI_CLASSIC_REGRESSION_QA_CONTRACT_FIX_WRITTEN_CI_PENDING
DISTANCE_REDUCED = Classic regression QA now validates the authoritative shared worksheet output rather than a Pixel-only controller field.
REMAINING_BLOCKERS = ["Need Math CI Readback for commit cca4071 or later", "Need Deploy GitHub Pages test/deploy readback", "Need determine whether S57E4 has any independent CI failure", "Need S49B Pixel functional QA", "Need final production gate"]
NEXT_SHORTEST_STEP = S49A1_CIReadback
STOP_REASON = ci_readback_required
BLOCKER_TYPE = CI_FAILURE_FIX_PENDING_VERIFICATION
LAST_COMPLETED_STATUS = S49A1_FIX_WRITTEN
REQUIRED_OPERATOR_ACTION = Provide Math CI Readback and Pages result for commit cca407104e30234151b2f0c6ab6b5e7d348c78c0 or a later main descendant.
NEXT_RESUME_TASK = S49A1_CIReadback
