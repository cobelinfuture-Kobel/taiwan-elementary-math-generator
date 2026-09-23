import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

test("S43G4O5 submid render", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: "g3a_u02_3a02",
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: ["kp_g3a_u02_sub_middle_missing_digit"],
    selectedPatternGroupIds: ["pg_g3a_u02_sub_middle_missing_digit"],
    questionCount: 8,
    generationSeed: "s43g4o5",
    includeAnswerKey: true
  });

  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.summary.questionCount, 8);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 8);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.equal(html.includes("□"), true);
});
