import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveG4BU04WorksheetLayout,
} from "../../site/modules/curriculum/batch-b/g4b-u04-layout-resolution.js";
import {
  G4B_U04_INVERSE_LONG_APPROVED_LAYOUTS,
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
  generationSeed: "g4b-u04-r4-flexible-layouts",
  includeAnswerKey: false,
  layoutMode: "custom_with_caps",
});

const EXPECTED_LAYOUTS = Object.freeze([
  ...Array.from({ length: 5 }, (_, index) => ({ columns: 3, rowsPerPage: index + 1 })),
  ...Array.from({ length: 6 }, (_, index) => ({ columns: 2, rowsPerPage: index + 1 })),
  ...Array.from({ length: 7 }, (_, index) => ({ columns: 1, rowsPerPage: index + 1 })),
]);

function resolve(columns, rowsPerPage, layoutMode = "custom_with_caps") {
  return resolveG4BU04WorksheetLayout({
    profile: G4B_U04_RENDERER_PROFILES.inverseLong,
    layoutMode,
    requestedLayout: { paperSize: "A4", columns, rowsPerPage },
    includeAnswerKey: false,
  });
}

test("R4 inverseLong publishes the approved 3x1-5, 2x1-6 and 1x1-7 matrix", () => {
  assert.deepEqual(G4B_U04_INVERSE_LONG_APPROVED_LAYOUTS, EXPECTED_LAYOUTS);
  assert.deepEqual(G4B_U04_RENDERER_PROFILES.inverseLong.questionSheet.approvedLayouts, EXPECTED_LAYOUTS);
  assert.equal(EXPECTED_LAYOUTS.length, 18);
});

test("R4 all 18 approved custom layouts resolve exactly without cap warnings", () => {
  for (const layout of EXPECTED_LAYOUTS) {
    const resolved = resolve(layout.columns, layout.rowsPerPage);
    assert.deepEqual(
      resolved.resolvedQuestionLayout,
      { paperSize: "A4", ...layout },
      `${layout.columns}x${layout.rowsPerPage}`,
    );
    assert.equal(resolved.capped, false, `${layout.columns}x${layout.rowsPerPage}`);
    assert.deepEqual(resolved.cappedFields, [], `${layout.columns}x${layout.rowsPerPage}`);
  }
});

test("R4 auto_safe remains the approved 3x5 default and keeps answer layout independent", () => {
  const resolved = resolve(1, 1, "auto_safe");
  assert.deepEqual(resolved.resolvedQuestionLayout, { paperSize: "A4", columns: 3, rowsPerPage: 5 });
  assert.deepEqual(resolved.resolvedAnswerLayout, { paperSize: "A4", columns: 1, rowsPerPage: 5 });
  assert.equal(resolved.capped, false);
});

test("R4 custom requests above each column-specific limit cap to 3x5, 2x6 or 1x7", () => {
  const cases = [
    { requested: [4, 10], expected: [3, 5], cappedFields: ["columns", "rowsPerPage"] },
    { requested: [3, 6], expected: [3, 5], cappedFields: ["rowsPerPage"] },
    { requested: [2, 7], expected: [2, 6], cappedFields: ["rowsPerPage"] },
    { requested: [1, 8], expected: [1, 7], cappedFields: ["rowsPerPage"] },
  ];
  for (const row of cases) {
    const resolved = resolve(...row.requested);
    assert.deepEqual(resolved.resolvedQuestionLayout, {
      paperSize: "A4",
      columns: row.expected[0],
      rowsPerPage: row.expected[1],
    });
    assert.deepEqual(resolved.cappedFields, row.cappedFields);
    assert.equal(resolved.capped, true);
  }
});

test("R4 production renderer supports the widest 1x7 question-only boundary", () => {
  const result = buildBatchABrowserWorksheetDocument({
    ...INVERSE_PLAN,
    questionCount: 7,
    printLayout: {
      paperSize: "A4",
      columns: 1,
      rowsPerPage: 7,
      showAnswerKeyPage: false,
    },
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(
    result.worksheetDocument.layoutResolution.resolvedQuestionLayout,
    { paperSize: "A4", columns: 1, rowsPerPage: 7 },
  );
  assert.equal(result.worksheetDocument.layoutResolution.capped, false);
  assert.equal(result.worksheetDocument.questionPages.length, 1);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 0);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.equal(G4B_U04_RENDERER_INTEGRATION.questionPageResponseMode, "question_only");
  assert.match(html, /g4b-u04-cell__number/);
  assert.match(html, /g4b-u04-cell__prompt/);
  assert.doesNotMatch(html, /<div class="g4b-u04-cell__response"/);
  assert.doesNotMatch(html, /<section class="worksheet-section worksheet-section--answer-key">/);
});
