import assert from "node:assert/strict";
import test from "node:test";

import {
  renderPreviewFrame,
  shouldUseSharedExactLayoutRenderer,
} from "../../site/assets/browser/pipeline/render-preview-frame.js";

function exactDocument(columns, rowsPerPage) {
  const cells = Array.from({ length: columns * rowsPerPage }, (_, index) => ({
    cellType: "question",
    questionDisplayModel: {
      questionId: `q-${index + 1}`,
      questionNumber: index + 1,
      questionNumberText: `${index + 1}.`,
      promptText: `題目 ${index + 1}`,
      displayText: `題目 ${index + 1}`,
      responsePrompt: "答：________",
      renderKind: "numeric",
    },
  }));
  return {
    dynamicHtml: "<!doctype html><html><body data-legacy-g5a-u02=\"true\">legacy single column</body></html>",
    questionPages: [{
      pageNumber: 1,
      pageType: "question",
      layout: { columns, rowsPerPage },
      cells,
    }],
    answerKeyPages: [],
    questionDisplayModels: cells.map((cell) => cell.questionDisplayModel),
    answerKeyItems: [],
    printOptions: {
      paperSize: "A4",
      columns,
      rowsPerPage,
      showAnswerKey: false,
      showQuestionNumbers: true,
    },
    layoutResolution: {
      layoutMode: "exact_approved_matrix",
      layoutExact: true,
      capped: false,
      requestedQuestionLayout: { columns, rowsPerPage },
      resolvedQuestionLayout: { columns, rowsPerPage },
      resolvedAnswerLayout: { columns: 1, rowsPerPage: 5 },
      appliedLayoutText: `題目 ${columns} 欄 × ${rowsPerPage} 列；答案 1 欄 × 5 列`,
    },
    appliedLayoutText: `題目 ${columns} 欄 × ${rowsPerPage} 列；答案 1 欄 × 5 列`,
    publicControls: { layoutMode: "exact_approved_matrix" },
  };
}

test("GLM-S09 exact-layout projection supersedes legacy G5A-U02 dynamic HTML", () => {
  for (const [columns, rowsPerPage] of [[2, 6], [3, 5]]) {
    const document = exactDocument(columns, rowsPerPage);
    assert.equal(shouldUseSharedExactLayoutRenderer(document), true);
    const frame = { srcdoc: "", dataset: {} };
    const result = renderPreviewFrame(frame, document, { stylesheetHref: "" });
    assert.equal(result.sharedExactLayout, true);
    assert.equal(frame.dataset.sharedExactLayoutRenderer, "true");
    assert.match(frame.srcdoc, /class="worksheet-grid"/);
    assert.match(frame.srcdoc, new RegExp(`--worksheet-columns:${columns}`));
    assert.doesNotMatch(frame.srcdoc, /data-legacy-g5a-u02/);
    assert.doesNotMatch(frame.srcdoc, /legacy single column/);
  }
});

test("GLM-S09 keeps legacy dynamic HTML only before exact-layout projection", () => {
  const document = {
    dynamicHtml: "<!doctype html><html><body data-legacy=\"true\">legacy</body></html>",
  };
  assert.equal(shouldUseSharedExactLayoutRenderer(document), false);
  const frame = { srcdoc: "", dataset: {} };
  const result = renderPreviewFrame(frame, document);
  assert.equal(result.dynamic, true);
  assert.match(frame.srcdoc, /data-legacy/);
});
