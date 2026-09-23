S46B_PixelGenerateButtonIntegration

CURRENT_MAJOR_TASK = S46_PixelUIGenerationIntegration
CURRENT_SUBTASK = S46B_PixelGenerateButtonIntegration
TASK_STATUS = IMPLEMENTED_CI_AND_DEPLOY_PENDING
OUTPUT = Public Pixel generate-button integration using shared generator / validator pipeline

## 1. Scope Check

S46B continues the approved Pixel UI path:

```text
- Preserve Classic UI at /
- Keep Pixel UI at /pixel/
- Reuse S45D shared worksheet state
- Reuse S46A buildPixelWorksheetDocument bridge
- Reuse shared generator / validator / answer-key / pagination / worksheetDocument pipeline
- Do not fork generator / validator / renderer / registry / PatternSpec
- Do not implement full HTML worksheet preview yet; that belongs to S46C
```

## 2. Files Created

```text
site/pixel/pixel-generation-controller.js
tests/ui/pixel-generation-controller.test.js
tests/ui/pixel-generate-button-surface.test.js
```

## 3. Files Modified

```text
site/pixel/index.html
site/pixel/pixel-ui.js
site/pixel/pixel-selector.css
```

## 4. Implementation Notes

The public `/pixel/` generate button is now enabled and calls the existing shared generation path:

```text
Pixel controls
-> syncPixelWorksheetSelection()
-> applyPixelWorksheetSettings()
-> runPixelWorksheetGeneration()
-> buildPixelWorksheetDocument()
-> buildWorksheetDocumentFromState()
-> shared Batch A generator
-> shared validator
-> shared answer-key and pagination models
-> worksheetDocument
```

`pixel-generation-controller.js` does not generate or validate questions. It converts the shared pipeline result into a UI-safe summary:

```text
- ok / stage
- worksheetId / title
- generated question count
- question page count
- answer-key item count
- answer-key page count
- validation status
- normalized errors and warnings
```

Public UI behavior:

```text
- generate button is enabled when a valid source / selector state exists;
- button is disabled during generation;
- success status reports generated question/page/answer counts;
- failure status reports stage and error messages;
- changing controls after generation marks the result stale;
- body.dataset exposes generation status, worksheetId, question count, and answer-key item count for later preview / QA milestones;
- complete HTML worksheet preview is intentionally deferred to S46C.
```

## 5. Test Coverage

New tests verify:

```text
- successful source-unit generation produces a summarized shared worksheetDocument;
- answer-key enabled/disabled counts are reported correctly;
- malformed single-KP generation returns a preflight error without throwing;
- shared errors and warnings are normalized for UI output;
- public HTML contains an enabled generate button and live status/error regions;
- public Pixel UI imports the controller and binds the click handler.
```

## 6. Acceptance Status

```text
Public generate button enabled = STATIC PASS
Shared generation controller created = STATIC PASS
Shared generator / validator pipeline reused = STATIC PASS
Generation success/error status surface = STATIC PASS
Stale-result state = STATIC PASS
No generator / validator / renderer fork = STATIC PASS
Full worksheet preview remains deferred = PASS
Math CI Readback = PENDING
Deploy GitHub Pages = PENDING
```

## 7. Closeout Questions

1. 本任務縮短了哪一段距離？
   - It moved Pixel UI from a tested hidden generation bridge to a public button that can execute the authoritative worksheet pipeline.
2. 推進了哪一個系統節點？
   - WebUI generate action / Generator / Validator / worksheetDocument integration.
3. 是否解除 blocker？
   - Yes. The blocker "Need S46B public generate-button integration" is removed at implementation level.
4. 是否增加新的 blocker？
   - No new functional blocker. CI and Pages readback are required because public site behavior changed.
5. 下一個最短有效步驟是什麼？
   - S46B_CIReadbackAndPagesDeployReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_GENERATION_BRIDGE_CI_PASS
GOAL_DISTANCE_AFTER = D1_WEBUI_PIXEL_GENERATE_BUTTON_WRITTEN_CI_DEPLOY_PENDING
DISTANCE_REDUCED = Pixel UI can now execute the authoritative shared generator and validator pipeline from the public generate button and report worksheetDocument results.
REMAINING_BLOCKERS = ["Need Math CI Readback for S46B", "Need Deploy GitHub Pages readback for S46B", "Need S46C live worksheet preview", "Need Pixel print/answer-key execution path"]
NEXT_SHORTEST_STEP = S46B_CIReadbackAndPagesDeployReadback
STOP_REASON = ci_and_deploy_readback_required
BLOCKER_TYPE = CI_AND_DEPLOY_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S46B_IMPLEMENTED
REQUIRED_OPERATOR_ACTION = Provide Math CI Readback and Deploy GitHub Pages success result for the latest S46B commit.
NEXT_RESUME_TASK = S46B_CIReadbackAndPagesDeployReadback
