import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_WORKSHEET_OUTPUT_STATUS,
  buildBatchAWorksheetConfigSnapshot,
  buildBatchAWorksheetDocument
} from "../../src/curriculum/worksheet/batch-a-worksheet-output.js";

test("S40C Batch A worksheet config is production-use allowed", () => {
  const result = buildBatchAWorksheetConfigSnapshot();
  assert.equal(result.ok, true);
  assert.equal(result.configSnapshot.generation.questionCount, 23);
  assert.equal(result.configSnapshot.metadata.productionUse, BATCH_A_WORKSHEET_OUTPUT_STATUS.PRODUCTION_USE_ALLOWED);
});

test("S40C Batch A worksheet document assembles 23 routed questions", () => {
  const result = buildBatchAWorksheetDocument({ generationSeed: "s40c" });
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.schemaVersion, "worksheet-document-v1");
  assert.equal(result.worksheetDocument.generatedQuestions.length, 23);
  assert.equal(result.routeCounts.semantic, 20);
  assert.equal(result.routeCounts.base, 3);
  assert.equal(result.worksheetDocument.batchA.productionUse, BATCH_A_WORKSHEET_OUTPUT_STATUS.PRODUCTION_USE_ALLOWED);
});
