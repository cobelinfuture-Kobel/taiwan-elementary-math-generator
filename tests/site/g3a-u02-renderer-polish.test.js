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

const sourceId = "g3a_u02_3a02";
const addKp = "kp_g3a_u02_add_multi_carry";
const roundKp = "kp_g3a_u02_estimate_nearest_thousand";
const addGroup = "pg_g3a_u02_add_multi_carry_seed";
const roundGroup = "pg_g3a_u02_estimate_nearest_thousand";

function buildPolishDocument(questionCount = 20) {
  const state = createConfigState({ queryState: { sourceId } });
  setBatchAQuestionCount(state, questionCount);
  setBatchAIncludeAnswerKey(state, true);
  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [addKp, roundKp],
    selectedPatternGroupIds: [addGroup, roundGroup]
  });

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  return result.worksheetDocument;
}

test("S43G4F answer key prompts stay blanked and do not duplicate answer text", () => {
  const document = buildPolishDocument(12);
  assert.equal(document.answerKeyItems.length, 12);

  for (const item of document.answerKeyItems) {
    assert.match(item.promptText, /_{3,4}/);
    assert.equal(item.promptText.endsWith(item.answerText), false);
  }

  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  assert.match(html, /worksheet-cell--answer-key/);
  assert.doesNotMatch(html, /= 2000<\/div><div class="worksheet-cell__answer">2000<\/div>/);
});

test("S43G4F renderer omits filler cells from printable HTML by default", () => {
  const document = buildPolishDocument(20);
  assert.equal(document.questionPages.length, 1);
  assert.equal(document.questionPages[0].fillerCellCount > 0, true);

  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  assert.doesNotMatch(html, /worksheet-cell--filler/);
});
