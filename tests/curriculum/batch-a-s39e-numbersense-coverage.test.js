import test from "node:test";
import assert from "node:assert/strict";

import {
  buildS39ENumberSenseCoverageWorksheetHtml,
  getS39ENumberSenseCoveragePatternSpecIds,
  getS39ENumberSenseCoverageSourceIds
} from "../../src/curriculum/worksheet/batch-a-s39e-numbersense-coverage.js";
import { BATCH_A_WORKSHEET_OUTPUT_STATUS } from "../../src/curriculum/worksheet/batch-a-worksheet-output.js";

test("S39E registers remaining number-sense sourceIds", () => {
  assert.equal(getS39ENumberSenseCoveragePatternSpecIds().length, 2);
  assert.deepEqual(getS39ENumberSenseCoverageSourceIds().sort(), ["g3a_u01_3a01", "g4a_u01_4a01"].sort());
});

test("S40C S39E renders production-allowed number-sense worksheet HTML", () => {
  const result = buildS39ENumberSenseCoverageWorksheetHtml();
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.generatedQuestions.length, 2);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 2);
  assert.equal(result.worksheetDocument.questionPages.length > 0, true);
  assert.equal(result.worksheetDocument.answerKeyPages.length > 0, true);
  assert.equal(result.worksheetDocument.batchA.productionUse, BATCH_A_WORKSHEET_OUTPUT_STATUS.PRODUCTION_USE_ALLOWED);
  assert.equal(result.html.length > 0, true);
});
