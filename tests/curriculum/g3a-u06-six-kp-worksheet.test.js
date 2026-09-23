import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const SOURCE_ID = "g3a_u06_3a06";
const PARITY_KP_ID = "kp_g3a_u06_parity_range_missing_digit";
const PARITY_GROUP_ID = "pg_g3a_u06_parity_range_missing_digit";
const PARITY_SPEC_ID = "ps_g3a_u06_parity_range_missing_digit";
const EXPECTED_SPEC_IDS = new Set([
  "ps_g3a_u06_exact_division_check",
  "ps_g3a_u06_divisibility_exact_check",
  "ps_g3a_u06_division_with_remainder",
  "ps_g3a_u06_quotative_division_packaging",
  "ps_g3a_u06_partitive_division_equal_sharing",
  PARITY_SPEC_ID
]);

test("G3A U06 source worksheet can render all six visible KPs", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    questionCount: 24,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "g3a-u06-six-kp-worksheet",
    printLayout: { columns: 4, rowsPerPage: 6, showAnswerKeyPage: true }
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.worksheetDocument.questionDisplayModels.length, 24);
  assert.deepEqual(new Set(result.worksheetDocument.generatedQuestions.map((question) => question.patternSpecId)), EXPECTED_SPEC_IDS);
  assert.equal(result.worksheetDocument.questionDisplayModels.every((model) => typeof model.blankedDisplayText === "string" || typeof model.expressionText === "string"), true);
});

test("G3A U06 parity single-KP worksheet can fill a 4x10 printable page without unique-pool exhaustion", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [PARITY_KP_ID],
    selectedPatternGroupIds: [PARITY_GROUP_ID],
    questionCount: 40,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "g3a-u06-parity-full-page-smoke",
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true }
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.worksheetDocument.questionDisplayModels.length, 40);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.patternSpecId === PARITY_SPEC_ID), true);
  assert.equal(new Set(result.worksheetDocument.questionDisplayModels.map((model) => model.blankedDisplayText)).size, 40);
});
