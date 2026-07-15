import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveG4BU04WorksheetLayout,
} from "../../site/modules/curriculum/batch-b/g4b-u04-layout-resolution.js";
import {
  G4B_U04_RENDERER_PROFILES,
} from "../../site/modules/curriculum/registry/g4b-u04-worksheet-promotion.js";
import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {
  G4B_U04_RENDERER_INTEGRATION,
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer-s73-extension.js";

const INVERSE_PLAN = Object.freeze({
  sourceId: "g4b_u04_4b04",
  worksheetMode: "batchAKnowledgePoint",
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: ["kp_g4b_u04_inverse_rounding_possible_original"],
  selectedPatternGroupIds: ["pg_g4b_u04_inverse_original_values"],
  questionMode: "reasoning",
  contextMode: "mixed",
  questionCount: 12,
  ordering: "groupedByPattern",
  generationSeed: "g4b-u04-r3c-question-only",
  includeAnswerKey: false,
  layoutMode: "custom_with_caps",
});

function resolve(columns, rowsPerPage) {
  return resolveG4BU04WorksheetLayout({
    profile: G4B_U04_RENDERER_PROFILES.inverseLong,
    layoutMode: "custom_with_caps",
    requestedLayout: { paperSize: "A4", columns, rowsPerPage },
    includeAnswerKey: false,
  });
}

test("R3C inverseLong defaults to approved question-only 3x5 and keeps answer layout independent", () => {
  assert.deepEqual(
    G4B_U04_RENDERER_PROFILES.inverseLong.questionSheet.approvedLayouts,
    [
      { columns: 3, rowsPerPage: 5 },
      { columns: 2, rowsPerPage: 6 },
    ],
  );
  const resolved = resolve(4, 10);
  assert.deepEqual(resolved.resolvedQuestionLayout, { paperSize: "A4", columns: 3, rowsPerPage: 5 });
  assert.deepEqual(resolved.resolvedAnswerLayout, { paperSize: "A4", columns: 1, rowsPerPage: 5 });
  assert.deepEqual(resolved.cappedFields, ["columns", "rowsPerPage"]);
  assert.equal(resolved.capped, true);
});

test("R3C preserves the explicitly approved 2x6 layout without a cap warning", () => {
  const resolved = resolve(2, 6);
  assert.deepEqual(resolved.resolvedQuestionLayout, { paperSize: "A4", columns: 2, rowsPerPage: 6 });
  assert.equal(resolved.capped, false);
  assert.deepEqual(resolved.cappedFields, []);
  assert.equal(resolved.appliedLayoutText, "套用版面：題目 2 欄 × 6 列；答案 1 欄 × 5 列");
});

test("R3C rejects the untested 3x6 combination and falls back to 3x5", () => {
  const resolved = resolve(3, 6);
  assert.deepEqual(resolved.resolvedQuestionLayout, { paperSize: "A4", columns: 3, rowsPerPage: 5 });
  assert.deepEqual(resolved.cappedFields, ["rowsPerPage"]);
  assert.equal(resolved.capped, true);
});

test("R3C production renderer emits question number and prompt only", () => {
  const result = buildBatchABrowserWorksheetDocument({
    ...INVERSE_PLAN,
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 6,
      showAnswerKeyPage: false,
    },
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(
    result.worksheetDocument.layoutResolution.resolvedQuestionLayout,
    { paperSize: "A4", columns: 2, rowsPerPage: 6 },
  );
  assert.equal(result.worksheetDocument.questionPages.length, 1);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 0);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.equal(G4B_U04_RENDERER_INTEGRATION.questionPageResponseMode, "question_only");
  assert.match(html, /g4b-u04-cell__number/);
  assert.match(html, /g4b-u04-cell__prompt/);
  assert.doesNotMatch(html, /<div class="g4b-u04-cell__response"/);
  assert.doesNotMatch(html, /<section class="worksheet-section worksheet-section--answer-key">/);
});
