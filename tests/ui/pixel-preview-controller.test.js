import test from "node:test";
import assert from "node:assert/strict";

import { buildPixelWorksheetDocument } from "../../site/pixel/pixel-generation-bridge.js";
import {
  clearPixelWorksheetPreview,
  PIXEL_PREVIEW_STYLESHEET_HREF,
  renderPixelWorksheetPreview
} from "../../site/pixel/pixel-preview-controller.js";
import { createPixelWorksheetState } from "../../site/pixel/pixel-worksheet-state.js";

test("Pixel preview controller renders shared worksheetDocument HTML into srcdoc", () => {
  const state = createPixelWorksheetState({
    sourceId: "g3a_u02_3a02",
    questionCount: 12,
    includeAnswerKey: true,
    generationSeed: "pixel-preview-controller"
  });
  const result = buildPixelWorksheetDocument(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));

  const frame = { srcdoc: "" };
  const preview = renderPixelWorksheetPreview(frame, result.worksheetDocument);

  assert.equal(preview.worksheetId, result.worksheetDocument.worksheetId);
  assert.equal(preview.questionCount, 12);
  assert.equal(preview.answerKeyItemCount, 12);
  assert.equal(preview.questionPageCount >= 1, true);
  assert.equal(preview.answerKeyPageCount >= 1, true);
  assert.equal(frame.srcdoc, preview.html);
  assert.equal(frame.srcdoc.includes(result.worksheetDocument.title), true);
  assert.equal(frame.srcdoc.includes(PIXEL_PREVIEW_STYLESHEET_HREF), true);
});

test("Pixel preview controller omits answer-key counts when worksheet answer key is disabled", () => {
  const state = createPixelWorksheetState({
    sourceId: "g3a_u02_3a02",
    questionCount: 8,
    includeAnswerKey: false,
    generationSeed: "pixel-preview-no-answer-key"
  });
  const result = buildPixelWorksheetDocument(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));

  const frame = { srcdoc: "" };
  const preview = renderPixelWorksheetPreview(frame, result.worksheetDocument);
  assert.equal(preview.questionCount, 8);
  assert.equal(preview.answerKeyItemCount, 0);
  assert.equal(preview.answerKeyPageCount, 0);
});

test("Pixel preview controller rejects missing worksheetDocument and can clear srcdoc", () => {
  const frame = {
    srcdoc: "existing",
    removeAttribute(name) {
      if (name === "srcdoc") this.srcdoc = "";
    }
  };
  assert.throws(() => renderPixelWorksheetPreview(frame, null), /requires a worksheetDocument/);
  clearPixelWorksheetPreview(frame);
  assert.equal(frame.srcdoc, "");
});
