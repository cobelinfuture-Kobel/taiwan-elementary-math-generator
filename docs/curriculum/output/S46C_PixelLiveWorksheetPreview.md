S46C_PixelLiveWorksheetPreview

CURRENT_MAJOR_TASK = S46_PixelUIGenerationIntegration
CURRENT_SUBTASK = S46C_PixelLiveWorksheetPreview
TASK_STATUS = IMPLEMENTED_CI_AND_DEPLOY_PENDING
OUTPUT = Public Pixel iframe preview using the shared HTML worksheet renderer

## 1. Scope Check

S46C continues the approved Pixel UI path:

```text
- Preserve Classic UI at /
- Keep Pixel UI at /pixel/
- Reuse S46B public generation result
- Reuse shared renderPreviewFrame() and HTML renderer
- Reuse the shared worksheetDocument including question and answer-key pages
- Do not fork generator / validator / renderer / registry / PatternSpec
- Do not add print-button execution yet; print belongs to the next milestone
- Do not continue unrelated G3B-U04/S57 content work
```

## 2. Files Created

```text
site/pixel/pixel-preview-controller.js
site/pixel/pixel-live-preview.js
tests/ui/pixel-preview-controller.test.js
tests/ui/pixel-generation-subscriber.test.js
tests/ui/pixel-live-preview-surface.test.js
```

## 3. Files Modified

```text
site/pixel/index.html
site/pixel/pixel-generation-controller.js
site/pixel/pixel-selector.css
```

## 4. Implementation Notes

The deployed Pixel UI preview path is now:

```text
Generate button
-> runPixelWorksheetGeneration()
-> shared worksheetDocument
-> generation subscriber contract
-> renderPixelWorksheetPreview()
-> shared renderPreviewFrame()
-> shared renderWorksheetDocumentToHtml()
-> iframe.srcdoc
```

`pixel-preview-controller.js` passes `../assets/styles/print-styles.css`, which resolves from `/pixel/` to the existing shared public print stylesheet.

The public page now exposes:

```text
pixel-preview-empty
pixel-preview-frame-wrap
pixel-preview-frame
```

On successful generation:

```text
- sample placeholder questions are removed;
- the real worksheet HTML is written to iframe.srcdoc;
- preview title/question/page/answer counts are displayed;
- body.dataset exposes preview status, worksheetId, question count, and answer-key item count.
```

On failed generation:

```text
- iframe srcdoc is cleared;
- empty/error surface is restored;
- failure status remains visible without throwing into the page.
```

## 5. Shared-Core Integrity

No Pixel-only question renderer was created.

`pixel-preview-controller.js` delegates to:

```text
site/assets/browser/pipeline/render-preview-frame.js
site/modules/renderer/html-renderer.js
site/assets/styles/print-styles.css
```

The generation-controller subscriber is only an integration notification surface. Subscriber errors are isolated and cannot change the authoritative generation result.

## 6. Test Coverage

New tests verify:

```text
- shared worksheetDocument renders into iframe srcdoc;
- preview HTML includes the worksheet title and shared print stylesheet path;
- answer-key enabled/disabled counts remain accurate;
- missing worksheetDocument is rejected;
- preview srcdoc can be cleared;
- subscribers receive the exact authoritative generation execution once;
- unsubscribe and invalid-subscriber behavior;
- public HTML contains the real preview iframe and live-preview module;
- placeholder sample questions are removed;
- live-preview module subscribes and delegates to shared renderPreviewFrame.
```

## 7. Acceptance Status

```text
Public iframe preview surface = STATIC PASS
Shared HTML renderer reused = STATIC PASS
Shared worksheetDocument reused = STATIC PASS
Generation subscriber contract = STATIC PASS
Placeholder sample questions removed = STATIC PASS
Answer-key pages follow worksheetDocument setting = STATIC PASS
No renderer / generator / validator fork = STATIC PASS
Print execution remains deferred = PASS
Math CI Readback = PENDING
Deploy GitHub Pages = PENDING
```

## 8. Closeout

1. 本任務縮短了哪一段距離？
   - It moved Pixel UI from generation-summary-only to a real rendered HTML worksheet preview.
2. 推進了哪一個系統節點？
   - WebUI / Renderer / worksheetDocument preview integration.
3. 是否解除 blocker？
   - Yes. The blocker "Need S46C live worksheet preview" is removed at implementation level.
4. 是否增加新的 blocker？
   - No new functional blocker. CI and Pages readback are required because public behavior changed.
5. 下一個最短有效步驟是什麼？
   - S46C_CIReadbackAndPagesDeployReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_GENERATE_BUTTON_DEPLOYED
GOAL_DISTANCE_AFTER = D1_WEBUI_PIXEL_LIVE_PREVIEW_WRITTEN_CI_DEPLOY_PENDING
DISTANCE_REDUCED = Pixel UI now renders the authoritative shared worksheetDocument as real HTML in the public preview iframe.
REMAINING_BLOCKERS = ["Need Math CI Readback for S46C", "Need Deploy GitHub Pages readback for S46C", "Need Pixel answer-key/print execution controls", "Need full Pixel functional QA"]
NEXT_SHORTEST_STEP = S46C_CIReadbackAndPagesDeployReadback
STOP_REASON = ci_and_deploy_readback_required
BLOCKER_TYPE = CI_AND_DEPLOY_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S46C_IMPLEMENTED
REQUIRED_OPERATOR_ACTION = Provide Math CI Readback and Deploy GitHub Pages success result for the latest S46C commit.
NEXT_RESUME_TASK = S46C_CIReadbackAndPagesDeployReadback
