import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAIncludeAnswerKey,
  setBatchAQuestionCount,
  setBatchASelectorSelection
} from "../../site/assets/browser/state/config-state.js";
import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const KP_ID = "kp_g3a_u02_estimate_nearest_thousand";
const GROUP_ID = "pg_g3a_u02_estimate_nearest_thousand";
const SPEC_ID = "ps_g3a_u02_estimate_nearest_thousand";

test("S43G2M UI state accepts rounding KP and renders HTML", () => {
  const state = createConfigState({ queryState: { sourceId: "g3a_u02_3a02" } });
  setBatchAQuestionCount(state, 8);
  setBatchAIncludeAnswerKey(state, true);
  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [GROUP_ID]
  });

  assert.equal(state.batchA.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(state.batchA.selectedKnowledgePointIds, [KP_ID]);
  assert.deepEqual(state.batchA.selectedPatternGroupIds, [GROUP_ID]);
  assert.equal(state.batchA.includeAnswerKey, true);
  assert.equal(state.batchA.selectorWarnings.length, 0);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  const worksheet = result.worksheetDocument;
  assert.equal(worksheet.summary.questionCount, 8);
  assert.deepEqual(worksheet.batchA.knowledgePointIds, [KP_ID]);
  assert.deepEqual(worksheet.batchA.patternGroupIds, [GROUP_ID]);
  assert.deepEqual(worksheet.batchA.patternSpecIds, [SPEC_ID]);
  assert.equal(worksheet.generatedQuestions.every((question) => question.patternSpecId === SPEC_ID), true);
  assert.equal(worksheet.answerKeyItems.length, 8);

  const html = renderWorksheetDocumentToHtml(worksheet, {});
  assert.equal(html.includes("worksheet-page--questions"), true);
  assert.equal(html.includes("worksheet-page--answer-key"), true);
  assert.equal(html.includes(`data-pattern-id="${SPEC_ID}"`), true);
});
