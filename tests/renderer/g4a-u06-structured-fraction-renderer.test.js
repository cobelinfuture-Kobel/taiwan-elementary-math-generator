import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  renderInlineMathModel,
  serializeInlineMathModel,
  validateInlineMathModel,
} from "../../site/modules/renderer/inline-math.js";
import {
  buildG4AU06InlineMathModel,
  G4A_U06_STRUCTURED_FRACTION_SOURCE_ID,
} from "../../site/modules/curriculum/batch-a/g4a-u06-inline-fraction-display.js";
import {
  renderQuestionCell,
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer.js";
import { buildBatchABrowserWorksheetDocument as buildP03F17Worksheet } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f17-extension.js";
import { buildBatchABrowserWorksheetDocument as buildP03F25Worksheet } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f25-extension.js";
import { buildBatchABrowserWorksheetDocument as buildP03F33Worksheet } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f33-extension.js";
import {
  G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
} from "../../site/modules/curriculum/registry/g4a-u06-fraction-type-classification-selector-projection.js";
import {
  G4A_U06_P03F25_GROUP_ID,
  G4A_U06_P03F25_KP_ID,
  G4A_U06_P03F25_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4a-u06-improper-mixed-conversion-selector-projection-p03f25.js";
import {
  G4A_U06_P03F33_KP_IDS,
} from "../../site/modules/curriculum/registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";

const SOURCE_ID = G4A_U06_STRUCTURED_FRACTION_SOURCE_ID;

function p03f17Options() {
  return {
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: [G4A_U06_FRACTION_CLASSIFICATION_KP_ID],
    questionMode: "numeric",
    questionCount: 9,
    generationSeed: "structured-fraction-p03f17",
    includeAnswerKey: true,
  };
}

function p03f25Options() {
  return {
    sourceId: SOURCE_ID,
    selectedKnowledgePointIds: [G4A_U06_P03F25_KP_ID],
    selectedPatternGroupIds: [G4A_U06_P03F25_GROUP_ID],
    patternSpecIds: [...G4A_U06_P03F25_PATTERN_SPEC_IDS],
    questionMode: "numeric",
    questionCount: 12,
    generationSeed: "structured-fraction-p03f25",
    includeAnswerKey: true,
  };
}

function p03f33Options() {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G4A_U06_P03F33_KP_IDS],
    questionMode: "numeric",
    questionCount: 16,
    generationSeed: "structured-fraction-p03f33",
    includeAnswerKey: true,
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
  };
}

test("inline_math_v1 serializes exactly and renders escaped structured fractions", () => {
  const model = buildG4AU06InlineMathModel({ sourceId: SOURCE_ID, plainText: "1 3/4 < 11/6" });
  assert.ok(model);
  assert.equal(serializeInlineMathModel(model), "1 3/4 < 11/6");
  assert.equal(validateInlineMathModel(model, "1 3/4 < 11/6").ok, true);
  const html = renderInlineMathModel(model, "1 3/4 < 11/6");
  assert.match(html, /class="math-mixed-fraction"/);
  assert.match(html, /class="math-fraction"/);
  assert.match(html, /1\.5px|math-fraction__numerator/);
  assert.equal(html.includes(" < 11"), false);
  assert.equal(html.includes("&lt;"), true);
});


test("both browser and canonical print stylesheets implement the fraction layout contract", () => {
  for (const stylesheetPath of [
    "site/assets/styles/print-styles.css",
    "src/renderer/print-styles.css",
  ]) {
    const css = fs.readFileSync(stylesheetPath, "utf8");
    assert.match(css, /\.math-fraction\s*\{[^}]*display:\s*inline-flex/s);
    assert.match(css, /\.math-fraction\s*\{[^}]*flex-direction:\s*column/s);
    assert.match(css, /\.math-fraction__numerator\s*\{[^}]*border-bottom:\s*1\.5px solid currentColor/s);
  }
});

test("inline_math_v1 fails closed on canonical plain-text mismatch", () => {
  const model = buildG4AU06InlineMathModel({ sourceId: SOURCE_ID, plainText: "3/4" });
  const tampered = { ...model, plainText: "4/5" };
  assert.equal(validateInlineMathModel(tampered, "4/5").ok, false);
  assert.throws(() => renderInlineMathModel(tampered, "4/5"), (error) => error.code === "inline_math_model_invalid");
});

test("G4A-U06 binding does not activate for another source", () => {
  assert.equal(buildG4AU06InlineMathModel({ sourceId: "g3a_u08_3a08", plainText: "3/4" }), null);
  assert.equal(buildG4AU06InlineMathModel({ sourceId: SOURCE_ID, plainText: "沒有分數" }), null);
});

test("legacy question cells remain escaped when no structured model is supplied", () => {
  const html = renderQuestionCell({
    cellIndex: 0,
    rowIndex: 0,
    columnIndex: 0,
    cellType: "question",
    questionId: "legacy",
    questionNumber: 1,
    displayModel: {
      questionNumberText: "1.",
      patternId: "legacy",
      blankedDisplayText: "<script>alert(1)</script> 3/4",
    },
  });
  assert.equal(html.includes("<script>"), false);
  assert.equal(html.includes("&lt;script&gt;"), true);
  assert.equal(html.includes('class="math-fraction"'), false);
});

test("Slice017 classification binds structured fractions only in prompts", () => {
  const result = buildP03F17Worksheet(p03f17Options());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.ok(result.worksheetDocument.questionDisplayModels.every((model) => model.promptInlineMath));
  assert.ok(result.worksheetDocument.answerKeyItems.every((item) => item.promptInlineMath));
  assert.ok(result.worksheetDocument.answerKeyItems.every((item) => item.answerInlineMath === null));
});

test("Slice025 conversion binds prompt and answer fractions without changing canonical text", () => {
  const result = buildP03F25Worksheet(p03f25Options());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const items = result.worksheetDocument.answerKeyItems;
  assert.ok(items.some((item) => item.promptInlineMath));
  assert.ok(items.some((item) => item.answerInlineMath));
  for (const item of items) {
    if (item.promptInlineMath) assert.equal(serializeInlineMathModel(item.promptInlineMath), item.promptText);
    if (item.answerInlineMath) assert.equal(serializeInlineMathModel(item.answerInlineMath), item.answerText);
  }
});

test("Slice033 comparison, number-line text, and add/sub render horizontal fraction markup", () => {
  const result = buildP03F33Worksheet(p03f33Options());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.ok(result.worksheetDocument.questionDisplayModels.every((model) => model.promptInlineMath));
  assert.ok(result.worksheetDocument.answerKeyItems.some((item) => item.answerInlineMath));
  assert.ok(result.worksheetDocument.answerKeyItems.some((item) => item.answerInlineMath === null));
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "./assets/styles/print-styles.css" });
  assert.match(html, /data-inline-math-source="g4a_u06_4a06"/);
  assert.match(html, /class="math-fraction"/);
  assert.match(html, /class="math-mixed-fraction"/);
  assert.equal((html.match(/data-inline-math-source="g4a_u06_4a06"/g) ?? []).length > 16, true);
});
