import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const sourceId = "g3a_u02_3a02";
const kpIds = ["kp_g3a_u02_add_missing_digit_equation", "kp_g3a_u02_sub_missing_digit_equation"];
const groupIds = ["pg_g3a_u02_add_missing_digit_equation", "pg_g3a_u02_sub_missing_digit_equation"];

test("S43G4N6 eqblank worksheet renders", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: kpIds,
    selectedPatternGroupIds: groupIds,
    questionCount: 8,
    generationSeed: "s43g4n6",
    includeAnswerKey: true
  });

  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.summary.questionCount, 8);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.kind === "missingDigitEquation"), true);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 8);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.equal(html.includes("worksheet-page--questions"), true);
  assert.equal(html.includes("worksheet-page--answer-key"), true);
  assert.equal(html.includes("□"), true);
});
