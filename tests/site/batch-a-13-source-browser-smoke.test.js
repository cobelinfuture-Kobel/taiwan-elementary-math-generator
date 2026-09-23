import assert from "node:assert/strict";
import test from "node:test";

import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { validateBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";

const BATCH_A_SOURCE_IDS = Object.freeze([
  "g3a_u01_3a01",
  "g3a_u02_3a02",
  "g3a_u03_3a03",
  "g3a_u06_3a06",
  "g3b_u01_3b01",
  "g3b_u04_3b04",
  "g3b_u08_3b08",
  "g4a_u01_4a01",
  "g4a_u02_4a02",
  "g4a_u04_4a04",
  "g4a_u08_4a08",
  "g4b_u01_4b01",
  "g5a_u08_5a08"
]);

const ORDERINGS = Object.freeze(["groupedByPattern", "shuffleAcrossPatterns"]);

function buildSmokeWorksheet(sourceId, ordering, options = {}) {
  return buildBatchABrowserWorksheetDocument({
    sourceId,
    questionCount: options.questionCount ?? 6,
    ordering,
    includeAnswerKey: options.includeAnswerKey ?? true,
    generationSeed: `s42b19:${sourceId}:${ordering}:${options.includeAnswerKey ?? true}`,
    printLayout: {
      columns: 3,
      rowsPerPage: 5
    }
  });
}

function assertSmokeWorksheet(result, sourceId, ordering, questionCount, includeAnswerKey) {
  assert.equal(result.ok, true, `${sourceId} ${ordering} should generate`);
  assert.deepEqual(result.errors, []);
  assert.equal(result.validation.ok, true);
  assert.deepEqual(result.validation.errors, []);

  const document = result.worksheetDocument;
  assert.equal(document.schemaVersion, "worksheet-document-v1");
  assert.equal(document.worksheetKind, "batchAWorksheet");
  assert.equal(document.batchA.sourceId, sourceId);
  assert.equal(document.summary.questionCount, questionCount);
  assert.equal(document.summary.orderingMode, ordering);
  assert.equal(document.generatedQuestions.length, questionCount);
  assert.equal(document.orderedQuestionIds.length, questionCount);
  assert.equal(document.questionDisplayModels.length, questionCount);
  assert.equal(document.questionPages.length > 0, true);
  assert.equal(document.configSnapshot.sourceId, sourceId);
  assert.equal(document.configSnapshot.questionCount, questionCount);
  assert.equal(document.configSnapshot.ordering, ordering);
  assert.equal(document.configSnapshot.includeAnswerKey, includeAnswerKey);
  assert.equal(document.printOptions.showAnswerKey, includeAnswerKey);

  for (const question of document.generatedQuestions) {
    assert.equal(question.metadata.sourceId, sourceId);
    assert.equal(document.batchA.patternSpecIds.includes(question.metadata.patternId), true);
  }

  if (includeAnswerKey) {
    assert.equal(document.answerKeyItems.length, questionCount);
    assert.equal(document.answerKeyPages.length > 0, true);
  } else {
    assert.equal(document.answerKeyItems.length, 0);
    assert.equal(document.answerKeyPages.length, 0);
  }
}

test("S42B19 Batch A source registry exposes exactly 13 sourceIds", () => {
  const sourceIds = listBatchASourceUnits().map((sourceUnit) => sourceUnit.sourceId);
  assert.deepEqual(sourceIds, BATCH_A_SOURCE_IDS);
});

test("S42B19 Batch A browser bridge generates all 13 sourceIds with grouped ordering", () => {
  for (const sourceId of BATCH_A_SOURCE_IDS) {
    const result = buildSmokeWorksheet(sourceId, "groupedByPattern", { questionCount: 6, includeAnswerKey: true });
    assertSmokeWorksheet(result, sourceId, "groupedByPattern", 6, true);
  }
});

test("S42B19 Batch A browser bridge generates all 13 sourceIds with shuffled ordering", () => {
  for (const sourceId of BATCH_A_SOURCE_IDS) {
    const result = buildSmokeWorksheet(sourceId, "shuffleAcrossPatterns", { questionCount: 7, includeAnswerKey: true });
    assertSmokeWorksheet(result, sourceId, "shuffleAcrossPatterns", 7, true);
  }
});

test("S42B19 Batch A browser bridge can suppress answer key for all 13 sourceIds", () => {
  for (const sourceId of BATCH_A_SOURCE_IDS) {
    const result = buildSmokeWorksheet(sourceId, "groupedByPattern", { questionCount: 5, includeAnswerKey: false });
    assertSmokeWorksheet(result, sourceId, "groupedByPattern", 5, false);
  }
});

test("S42B19 Batch A browser bridge rejects unsupported source leakage", () => {
  const validation = validateBatchABrowserPlan({
    sourceId: "g9x_u99_out_of_scope",
    questionCount: 6,
    ordering: "groupedByPattern"
  });

  assert.equal(validation.ok, false);
  assert.equal(validation.errors.some((issue) => issue.code === "batch_a_source_not_available"), true);

  const result = buildBatchABrowserWorksheetDocument({
    sourceId: "g9x_u99_out_of_scope",
    questionCount: 6,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s42b19:unsupported"
  });

  assert.equal(result.ok, false);
  assert.equal(result.worksheetDocument, null);
  assert.equal(result.errors.some((issue) => issue.code === "batch_a_source_not_available"), true);
});
