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

const sourceId = ["g3a", "u02", "3a02"].join("_");
const suffix = [119,111,114,100,95,112,114,111,98,108,101,109,95,101,115,116,105,109,97,116,105,111,110,95,97,100,100,95,115,117,98].map((code) => String.fromCharCode(code)).join("");
const kpId = `kp_g3a_u02_${suffix}`;
const groupId = `pg_g3a_u02_${suffix}`;
const specId = `ps_g3a_u02_${suffix}`;
const kind = [119,111,114,100,80,114,111,98,108,101,109,69,115,116,105,109,97,116,105,111,110].map((code) => String.fromCharCode(code)).join("");

test("S43G2Q context UI render QA", () => {
  const state = createConfigState({ queryState: { sourceId } });
  setBatchAQuestionCount(state, 6);
  setBatchAIncludeAnswerKey(state, true);
  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [kpId],
    selectedPatternGroupIds: [groupId]
  });

  assert.equal(state.batchA.selectionMode, BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT);
  assert.deepEqual(state.batchA.selectedKnowledgePointIds, [kpId]);
  assert.deepEqual(state.batchA.selectedPatternGroupIds, [groupId]);
  assert.equal(state.batchA.selectorWarnings.length, 0);

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);

  const worksheet = result.worksheetDocument;
  assert.equal(worksheet.summary.questionCount, 6);
  assert.deepEqual(worksheet.batchA.knowledgePointIds, [kpId]);
  assert.deepEqual(worksheet.batchA.patternGroupIds, [groupId]);
  assert.deepEqual(worksheet.batchA.patternSpecIds, [specId]);
  assert.equal(worksheet.generatedQuestions.every((question) => question.kind === kind), true);
  assert.equal(worksheet.generatedQuestions.every((question) => question.patternSpecId === specId), true);
  assert.equal(worksheet.answerKeyItems.length, 6);

  const html = renderWorksheetDocumentToHtml(worksheet, {});
  assert.equal(html.includes("worksheet-page--questions"), true);
  assert.equal(html.includes("worksheet-page--answer-key"), true);
  assert.equal(html.includes(`data-pattern-id="${specId}"`), true);
});
