import assert from "node:assert/strict";
import test from "node:test";

import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  createConfigState,
  setBatchAQuestionCount,
  setBatchASourceId
} from "../../site/assets/browser/state/config-state.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { validateBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";

function errorCodes(result) {
  return [
    ...(result.errors ?? []),
    ...(result.validation?.errors ?? [])
  ].map((issue) => issue.code);
}

test("Batch A validation - sourceId outside Batch A is rejected", () => {
  const result = validateBatchABrowserPlan({
    sourceId: "outside_batch_a",
    questionCount: 20,
    ordering: "groupedByPattern"
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((issue) => issue.code === "batch_a_source_not_available"), true);
});

test("Batch A validation - question count must be in range", () => {
  const result = validateBatchABrowserPlan({
    sourceId: "g3a_u02_3a02",
    questionCount: 0,
    ordering: "groupedByPattern"
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((issue) => issue.code === "batch_a_question_count_invalid"), true);
});

test("Batch A validation - ordering must be supported", () => {
  const result = validateBatchABrowserPlan({
    sourceId: "g3a_u02_3a02",
    questionCount: 20,
    ordering: "oldOrdering"
  });

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((issue) => issue.code === "batch_a_ordering_invalid"), true);
});

test("Batch A validation - valid source plan generates", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: "g3a_u02_3a02",
    questionCount: 8,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "validation-messaging"
  });

  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.questionCount, 8);
  assert.equal(result.worksheetDocument.validationSummary.ok, true);
});

test("Batch A validation - invalid source leaves prior valid result intact", () => {
  const state = createConfigState();
  const firstResult = buildWorksheetDocumentFromState(state);
  assert.equal(firstResult.ok, true);

  setBatchASourceId(state, "outside_batch_a");
  const secondResult = buildWorksheetDocumentFromState(state);

  assert.equal(secondResult.ok, false);
  assert.equal(secondResult.worksheetDocument, null);
  assert.equal(errorCodes(secondResult).includes("batch_a_source_not_available"), true);
  assert.equal(firstResult.worksheetDocument.summary.questionCount > 0, true);
});

test("Batch A validation - question count helper clamps to supported max", () => {
  const state = createConfigState();
  setBatchAQuestionCount(state, 500);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.questionCount, 200);
});
