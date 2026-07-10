S47A_PixelHTMLOutputAndPrintQA

CURRENT_MAJOR_TASK = S47_PixelUIOutputAndPrintQA
CURRENT_SUBTASK = S47A_PixelHTMLOutputAndPrintQA
TASK_STATUS = IMPLEMENTED_CI_PENDING
OUTPUT = Full-chain Pixel HTML output and print QA

## 1. Scope Check

```text
- Preserve Classic UI at /
- Keep Pixel UI at /pixel/
- Test the existing shared generator / validator / worksheetDocument / renderer / print chain
- Do not add a Pixel-only renderer
- Do not change public Pixel UI files in this milestone
- Do not continue unrelated G3B-U04/S57 curriculum work
```

## 2. Files Created

```text
tests/ui/pixel-html-output-print-qa.test.js
```

No public site file was modified, so Pages deployment readback is not required for S47A.

## 3. QA Chain

The new QA executes the real shared path:

```text
createPixelWorksheetState()
-> runPixelWorksheetGeneration()
-> shared generator / validator
-> authoritative worksheetDocument
-> renderPixelWorksheetPreview()
-> shared HTML renderer
-> iframe.srcdoc
-> summarizePixelPrintAvailability()
-> printPixelWorksheet()
-> shared printPreviewFrame()
```

## 4. Test Coverage

### Answer-key enabled

```text
- 20 generated questions
- 20 answer-key items
- at least one question page
- at least one answer page
- preview counters equal print-summary counters
- iframe srcdoc equals rendered HTML
- HTML contains a doctype
- HTML contains the shared print stylesheet path
- HTML contains the worksheet title
- HTML is non-trivial output
```

### Answer-key disabled

```text
- 12 generated questions
- zero answer-key items
- zero answer-key pages
- worksheetDocument answer arrays are empty
- print output is identified as question-only
- iframe still contains complete worksheet HTML
```

### Print execution

```text
- successful generated worksheet is rendered first
- printPixelWorksheet() delegates to iframe focus()
- printPixelWorksheet() delegates to iframe print()
- rendered srcdoc remains available at print time
```

## 5. Acceptance Status

```text
Full-chain HTML output QA test = WRITTEN
Answer-key enabled path = COVERED
Answer-key disabled path = COVERED
Iframe print path = COVERED
Public site files modified = NO
Math CI Readback = PENDING
Pages deployment readback = NOT_REQUIRED
```

## 6. Closeout

1. 本任務縮短了哪一段距離？
   - It adds one full-chain QA gate over generated HTML, answer-key inclusion/exclusion, and iframe printing.
2. 推進了哪一個系統節點？
   - Validator-backed worksheet output / HTML renderer / AnswerKey / Print QA.
3. 是否解除 blocker？
   - At implementation level, it removes the blocker "Need S47 HTML output / print QA".
4. 是否增加新的 blocker？
   - No new functional blocker. Math CI readback is required.
5. 下一個最短有效步驟是什麼？
   - S47A_CIReadback.

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_ANSWER_PRINT_DEPLOYED
GOAL_DISTANCE_AFTER = D1_WEBUI_PIXEL_HTML_PRINT_QA_WRITTEN_CI_PENDING
DISTANCE_REDUCED = Pixel output is now covered by a real end-to-end test from worksheet state through generation, HTML srcdoc, answer-key behavior, and iframe print execution.
REMAINING_BLOCKERS = ["Need Math CI Readback for S47A", "Need broader Pixel functional QA", "Need Classic/Pixel version-switch completion", "Need final production gate"]
NEXT_SHORTEST_STEP = S47A_CIReadback
STOP_REASON = ci_readback_required
BLOCKER_TYPE = CI_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S47A_IMPLEMENTED
REQUIRED_OPERATOR_ACTION = Provide Math CI Readback for the latest S47A commit.
NEXT_RESUME_TASK = S47A_CIReadback
