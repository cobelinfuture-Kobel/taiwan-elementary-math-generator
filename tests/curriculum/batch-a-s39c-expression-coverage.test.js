import test from "node:test";
import assert from "node:assert/strict";

import {
  buildS39CExpressionCoverageWorksheetHtml,
  getS39CExpressionCoveragePatternSpecIds,
  getS39CExpressionCoverageSourceIds
} from "../../src/curriculum/worksheet/batch-a-s39c-expression-coverage.js";
import { BATCH_A_WORKSHEET_OUTPUT_STATUS } from "../../src/curriculum/worksheet/batch-a-worksheet-output.js";

const EXPECTED_SOURCE_IDS = [
  "g3b_u08_3b08",
  "g4a_u08_4a08",
  "g4b_u01_4b01",
  "g5a_u08_5a08"
];

test("S39C expression coverage registers four missing sourceIds", () => {
  assert.equal(getS39CExpressionCoveragePatternSpecIds().length, 4);
  assert.deepEqual(getS39CExpressionCoverageSourceIds().sort(), [...EXPECTED_SOURCE_IDS].sort());
});

test("S40C S39C expression coverage renders production-allowed worksheet output and answer key", () => {
  const result = buildS39CExpressionCoverageWorksheetHtml({ generationSeed: "s40c-s39c" });
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.generatedQuestions.length, 4);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 4);
  assert.equal(result.worksheetDocument.questionPages.length > 0, true);
  assert.equal(result.worksheetDocument.answerKeyPages.length > 0, true);
  assert.equal(result.worksheetDocument.batchA.productionUse, BATCH_A_WORKSHEET_OUTPUT_STATUS.PRODUCTION_USE_ALLOWED);
  assert.equal(result.html.length > 0, true);
});
