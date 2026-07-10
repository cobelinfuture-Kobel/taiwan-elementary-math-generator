import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPixelWorksheetDocument,
  PIXEL_GENERATION_ERROR_CODES,
  resolvePixelWorksheetGenerationRequest
} from "../../site/pixel/pixel-generation-bridge.js";
import {
  BATCH_A_SELECTION_MODES,
  createPixelKnowledgePointSelectorState
} from "../../site/pixel/pixel-selector-state.js";
import {
  createPixelWorksheetState,
  syncPixelWorksheetSelection
} from "../../site/pixel/pixel-worksheet-state.js";

test("Pixel generation bridge builds a source-unit worksheet through the shared pipeline", () => {
  const state = createPixelWorksheetState({
    sourceId: "g3a_u02_3a02",
    questionCount: 12,
    includeAnswerKey: true,
    generationSeed: "pixel-source-unit-12",
    columns: 3,
    rowsPerPage: 6
  });

  const request = resolvePixelWorksheetGenerationRequest(state);
  assert.equal(request.ok, true);
  assert.equal(request.plan.sourceId, "g3a_u02_3a02");
  assert.equal(request.plan.questionCount, 12);

  const result = buildPixelWorksheetDocument(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.stage, "complete");
  assert.equal(result.worksheetDocument.generatedQuestions.length, 12);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 12);
  assert.equal(result.worksheetDocument.batchA.sourceId, "g3a_u02_3a02");
  assert.equal(result.validation.ok, true);
  assert.equal(state.lastWorksheetDocument?.worksheetId, result.worksheetDocument.worksheetId);
});

test("Pixel generation bridge preserves shared single-KnowledgePoint selection", () => {
  const selectorState = createPixelKnowledgePointSelectorState({
    sourceId: "g4a_u08_4a08",
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT
  });
  const state = createPixelWorksheetState({
    sourceId: "g4a_u08_4a08",
    questionCount: 8,
    includeAnswerKey: false,
    generationSeed: "pixel-single-kp-8"
  });
  syncPixelWorksheetSelection(state, {
    sourceId: "g4a_u08_4a08",
    selectorState
  });

  const result = buildPixelWorksheetDocument(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.plan.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.equal(result.plan.selectedKnowledgePointIds.length, 1);
  assert.equal(result.plan.selectedPatternGroupIds.length, 1);
  assert.deepEqual(result.worksheetDocument.batchA.knowledgePointIds, result.plan.selectedKnowledgePointIds);
  assert.deepEqual(result.worksheetDocument.batchA.patternGroupIds, result.plan.selectedPatternGroupIds);
  assert.equal(result.worksheetDocument.generatedQuestions.length, 8);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(result.worksheetDocument.printOptions.showAnswerKey, false);
});

test("Pixel generation bridge rejects malformed single-KnowledgePoint requests before generation", () => {
  const state = createPixelWorksheetState({ sourceId: "g3a_u02_3a02", questionCount: 10 });
  state.batchA.selectionMode = BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT;
  state.batchA.selectedKnowledgePointIds = [];
  state.batchA.selectedPatternGroupIds = [];

  const request = resolvePixelWorksheetGenerationRequest(state);
  assert.equal(request.ok, false);
  assert.equal(request.errors.some((entry) => entry.code === PIXEL_GENERATION_ERROR_CODES.SINGLE_KP_SELECTION_INVALID), true);

  const result = buildPixelWorksheetDocument(state);
  assert.equal(result.ok, false);
  assert.equal(result.stage, "preflight");
  assert.equal(result.worksheetDocument, null);
});
