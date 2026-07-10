S49A_ClassicRegressionQA

CURRENT_MAJOR_TASK = S49_PixelUIFullQA
CURRENT_SUBTASK = S49A_ClassicRegressionQA
TASK_STATUS = IMPLEMENTED_CI_PENDING
OUTPUT = Classic public-route and shared-pipeline regression QA

## 1. Scope Check

```text
- Verify that the existing Classic route at / remains usable after Pixel UI additions.
- Verify that the Classic 404 fallback retains its source-unit worksheet controls.
- Verify that Classic continues to use the shared config, generator, validator, preview, and print pipeline.
- Exercise all 13 public Batch A source units through the Classic source-unit generation path.
- Do not modify Classic or Pixel production behavior.
- Do not modify generator / validator / renderer / registry / PatternSpec.
- Do not continue unrelated G3B-U04 implementation work.
```

## 2. Files Created

```text
tests/ui/classic-regression-qa.test.js
```

No public site file was modified.

## 3. QA Coverage

### Classic public surfaces

The tests verify that `site/index.html` retains:

```text
- Batch A source selector
- KnowledgePoint selection mode and panel
- question count / ordering / answer-key / seed controls
- print columns / rows-per-page controls
- generate / print buttons
- status / validation regions
- preview metadata and iframe
- Classic-to-Pixel link
```

The tests verify that `site/404.html` retains the source-unit worksheet controls, preview iframe, standard-home link, and Pixel-version link.

### Shared pipeline wiring

The Classic browser entry must continue to reference:

```text
listBatchASourceUnits
createConfigState
buildWorksheetDocumentFromState
renderPreviewFrame
printPreviewFrame
```

The test also guards against Classic importing Pixel-only generation, registry, or worksheet-state bridge modules.

### 13-source generation regression

Every authoritative Batch A source unit is exercised through:

```text
createConfigState()
→ buildWorksheetDocumentFromState()
→ shared generator / validator
→ worksheetDocument
```

For each sourceId the test requires:

```text
result.ok = true
stage = complete
validation.ok = true
4 generated questions
4 answer-key items
showAnswerKey = true
worksheetDocument.batchA.sourceId matches the requested sourceId
```

Grouped and shuffled ordering modes alternate across the 13 sources.

### Answer-key-off and responsive contract

A representative Classic source-unit run must produce six questions with zero answer-key items when `includeAnswerKey = false`. The Classic CSS must retain the preview frame, one-column responsive breakpoint, and visible keyboard focus state for the version switch.

## 4. Acceptance Status

```text
Classic main surface guard = WRITTEN
Classic fallback surface guard = WRITTEN
Classic shared-pipeline wiring guard = WRITTEN
13-source generation regression = WRITTEN
answer-key-off regression = WRITTEN
responsive/focus contract guard = WRITTEN
Math CI Readback = PENDING
Deploy GitHub Pages = NOT REQUIRED (test/docs only)
```

## 5. Closeout

1. 本任務縮短了哪一段距離？
   - It moves Classic preservation from an assumption to an executable regression contract covering public controls and all 13 source-unit generation paths.
2. 推進了哪一個系統節點？
   - Classic WebUI QA / shared worksheet pipeline regression layer.
3. 是否解除 blocker？
   - At implementation level, it removes the blocker "Need S49A Classic regression QA".
4. 是否增加新的 blocker？
   - No functional blocker. Math CI verification is required.
5. 下一個最短有效步驟是什麼？
   - S49A_CIReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_BETA_LIMITS_CI_AND_DEPLOY_PASS
GOAL_DISTANCE_AFTER = D1_WEBUI_CLASSIC_REGRESSION_QA_WRITTEN_CI_PENDING
DISTANCE_REDUCED = Classic route preservation is now guarded by static public-surface checks and full source-unit generation checks for all 13 Batch A sources.
REMAINING_BLOCKERS = ["Need Math CI Readback for S49A", "Need S49B Pixel functional QA", "Need final production gate"]
NEXT_SHORTEST_STEP = S49A_CIReadback
STOP_REASON = ci_readback_required
BLOCKER_TYPE = CI_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S49A_IMPLEMENTED
REQUIRED_OPERATOR_ACTION = Provide the Math CI Readback for the latest S49A commit.
NEXT_RESUME_TASK = S49A_CIReadback
