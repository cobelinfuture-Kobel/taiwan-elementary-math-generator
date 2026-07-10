S49B_PixelFunctionalQA

CURRENT_MAJOR_TASK = S49_PixelUIFullQA
CURRENT_SUBTASK = S49B_PixelFunctionalQA
TASK_STATUS = IMPLEMENTED_CI_PENDING
OUTPUT = Pixel public-surface and full-chain functional QA

## 1. Preflight

Authoritative main readback before this milestone:

```text
sha = 45a362f7d24765e26726624933bd4c57db880b7f
Math CI Readback = #985
status = PASS_CI_SYNCED_AND_CLEAN
tests = 615
pass = 615
fail = 0
workingTree = clean
Deploy GitHub Pages #1267 = success
```

The later S57F1 closeout marker is documentation-only and does not change public Pixel behavior. S49B remains restricted to Pixel UI QA and does not continue S57F2 or any G3B-U04 promotion work.

## 2. Scope Lock

```text
- Verify the public /pixel/ controls and module wiring.
- Exercise every current public Batch A source through the Pixel state, generator, validator, preview, answer, and print chain.
- Verify representative single-KnowledgePoint and same-unit mixed-KnowledgePoint routes.
- Verify that unknown/non-public KnowledgePoint IDs are removed before generation.
- Reuse existing Pixel bridges and shared generator / validator / renderer / print pipeline.
- Do not modify public HTML, CSS, or JavaScript behavior.
- Do not modify generator / validator / renderer / registry / PatternSpec.
- Do not continue unrelated curriculum-content tasks.
```

## 3. Files Created

```text
tests/ui/pixel-functional-qa.test.js
```

No public site file was modified.

## 4. QA Coverage

### Public Pixel surface

The QA requires all deployed controls and regions:

```text
pixel-grade-select
pixel-semester-select
pixel-source-select
pixel-selection-mode-select
pixel-kp-panel
pixel-question-count
pixel-ordering
pixel-generation-seed
pixel-columns
pixel-rows-per-page
pixel-answer-key
pixel-plan-summary
pixel-generate-button
pixel-generation-status
pixel-generation-errors
pixel-preview-meta
pixel-preview-frame
pixel-output-summary
pixel-print-button
```

It also guards:

```text
- Pixel-to-Classic link
- Beta label
- pixel-ui.js
- pixel-live-preview.js
- pixel-print-surface.js
- initially disabled print button
- generate click-handler wiring
- generation subscriber wiring
- shared preview and print delegation
```

### All public Batch A source-unit routes

All 13 source options returned by the authoritative Pixel registry bridge are exercised through:

```text
createPixelWorksheetState()
→ runPixelWorksheetGeneration()
→ shared generator / validator
→ worksheetDocument
→ renderPixelWorksheetPreview()
→ shared HTML renderer
→ summarizePixelPrintAvailability()
→ printPixelWorksheet()
→ shared iframe print path
```

For every source the QA requires:

```text
execution.summary.ok = true
validationOk = true
worksheet-document-v1
requested sourceId preserved
4 generated questions
answer-key count follows includeAnswerKey
preview HTML contains doctype, title, and shared print stylesheet
print surface is ready
iframe focus() and print() are invoked exactly once
```

Grouped and shuffled ordering modes alternate across the 13 sources. Answer-key enabled and disabled modes also alternate.

### KnowledgePoint modes

A representative G4A-U08 route verifies:

```text
singleKnowledgePoint
mixedKnowledgePointsSameUnit
```

The generated worksheetDocument must preserve the authoritative selected KnowledgePoint IDs and PatternGroup IDs.

### Selector safety

The QA injects a non-public KnowledgePoint ID and requires:

```text
- the ID is dropped by Pixel selector state;
- pixel_selector_knowledge_point_dropped warning is emitted;
- the invalid ID never reaches worksheetDocument.batchA.knowledgePointIds;
- the sanitized valid selection still generates successfully.
```

## 5. Shared-Core Integrity

The milestone adds no production implementation. It calls only existing modules:

```text
pixel-registry-bridge.js
pixel-selector-state.js
pixel-worksheet-state.js
pixel-generation-controller.js
pixel-preview-controller.js
pixel-print-controller.js
```

Those modules continue to delegate to the shared Batch A config, generator, validator, renderer, worksheetDocument, and print pipeline.

## 6. Acceptance Status

```text
Pixel public surface QA = WRITTEN
13-source Pixel full-chain QA = WRITTEN
single-KP Pixel full-chain QA = WRITTEN
same-unit mixed-KP Pixel full-chain QA = WRITTEN
unknown/non-public KP sanitization QA = WRITTEN
preview/answer/print integration QA = WRITTEN
Math CI Readback = PENDING
Deploy GitHub Pages = NOT REQUIRED (test/docs only)
```

## 7. Closeout

1. 本任務縮短了哪一段距離？
   - It moves Pixel functionality from individually tested components to one executable public-surface and full-chain QA contract.
2. 推進了哪一個系統節點？
   - Pixel WebUI full-chain QA across Registry → Selector → Config → Generator → Validator → Renderer → AnswerKey → Print.
3. 是否解除 blocker？
   - At implementation level, it removes the blocker "Need S49B Pixel functional QA".
4. 是否增加新的 blocker？
   - No production blocker. The new QA must pass Math CI before final production-gate work.
5. 下一個最短有效步驟是什麼？
   - S49B_CIReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_CLASSIC_REGRESSION_QA_CI_PASS_MAIN_GREEN
GOAL_DISTANCE_AFTER = D1_WEBUI_PIXEL_FUNCTIONAL_QA_WRITTEN_CI_PENDING
DISTANCE_REDUCED = Pixel UI now has one full-chain regression contract covering every public source unit, representative KnowledgePoint modes, live HTML preview, answer-key behavior, and shared print execution.
REMAINING_BLOCKERS = ["Need Math CI Readback for S49B", "Need S49C Batch A / browser-path release QA", "Need S50 final production gate"]
NEXT_SHORTEST_STEP = S49B_CIReadback
STOP_REASON = ci_readback_required
BLOCKER_TYPE = CI_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S49B_IMPLEMENTED
REQUIRED_OPERATOR_ACTION = Provide the Math CI Readback for the latest S49B commit.
NEXT_RESUME_TASK = S49B_CIReadback
