import test from "node:test";
import assert from "node:assert/strict";

import {
  runPixelWorksheetGeneration,
  summarizePixelGenerationResult
} from "../../site/pixel/pixel-generation-controller.js";
import { createPixelWorksheetState } from "../../site/pixel/pixel-worksheet-state.js";
import { BATCH_A_SELECTION_MODES } from "../../site/pixel/pixel-selector-state.js";

test("Pixel generation controller summarizes successful shared worksheet generation", () => {
  const state = createPixelWorksheetState({
    sourceId: "g3a_u02_3a02",
    questionCount: 12,
    includeAnswerKey: true,
    generationSeed: "pixel-controller-success"
  });
  const execution = runPixelWorksheetGeneration(state);
  assert.equal(execution.result.ok, true, JSON.stringify(execution.result.errors));
  assert.equal(execution.summary.ok, true);
  assert.equal(execution.summary.validationOk, true);
  assert.equal(execution.summary.questionCount, 12);
  assert.equal(execution.summary.answerKeyItemCount, 12);
  assert.equal(execution.summary.questionPageCount >= 1, true);
  assert.equal(execution.summary.answerKeyPageCount >= 1, true);
  assert.equal(execution.summary.worksheetId, state.lastWorksheetDocument.worksheetId);
  assert.match(execution.summary.statusText, /已產生 12 題/);
});

test("Pixel generation controller reports disabled answer key accurately", () => {
  const state = createPixelWorksheetState({
    sourceId: "g3a_u02_3a02",
    questionCount: 8,
    includeAnswerKey: false,
    generationSeed: "pixel-controller-no-answer"
  });
  const execution = runPixelWorksheetGeneration(state);
  assert.equal(execution.summary.ok, true);
  assert.equal(execution.summary.answerKeyItemCount, 0);
  assert.equal(execution.summary.answerKeyPageCount, 0);
});

test("Pixel generation controller summarizes preflight failures without throwing", () => {
  const state = createPixelWorksheetState({ sourceId: "g3a_u02_3a02" });
  state.batchA.selectionMode = BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT;
  state.batchA.selectedKnowledgePointIds = [];
  state.batchA.selectedPatternGroupIds = [];
  const execution = runPixelWorksheetGeneration(state);
  assert.equal(execution.result.ok, false);
  assert.equal(execution.summary.ok, false);
  assert.equal(execution.summary.stage, "preflight");
  assert.equal(execution.summary.questionCount, 0);
  assert.equal(execution.summary.errors.length >= 1, true);
  assert.match(execution.summary.statusText, /產生失敗/);
});

test("Pixel generation summary normalizes shared error and warning messages", () => {
  const summary = summarizePixelGenerationResult({
    ok: false,
    stage: "build",
    errors: [{ code: "example_error", message: "Example error" }],
    warnings: [{ code: "example_warning" }]
  });
  assert.deepEqual(summary.errors, ["Example error"]);
  assert.deepEqual(summary.warnings, ["example_warning"]);
});
