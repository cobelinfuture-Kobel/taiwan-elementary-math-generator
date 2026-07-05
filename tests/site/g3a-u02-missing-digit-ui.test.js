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
const kpIds = ["kp_g3a_u02_add_missing_digit_operand", "kp_g3a_u02_sub_missing_digit_operand"];
const groupIds = ["pg_g3a_u02_add_missing_digit_operand", "pg_g3a_u02_sub_missing_digit_operand"];
const specIds = ["ps_g3a_u02_add_missing_digit_operand", "ps_g3a_u02_sub_missing_digit_operand"].sort();

test("S43G4M G3A U02 missing digit UI print path", () => {
  const state = createConfigState({ queryState: { sourceId } });
  setBatchAQuestionCount(state, 8);
  setBatchAIncludeAnswerKey(state, true);
  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: kpIds,
    selectedPatternGroupIds: groupIds
  });

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.summary.questionCount, 8);
  assert.deepEqual(result.worksheetDocument.batchA.patternSpecIds, specIds);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.kind === "missingDigit"), true);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.blankedDisplayText.includes("□")), true);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 8);

  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.equal(html.includes("worksheet-page--questions"), true);
  assert.equal(html.includes("worksheet-page--answer-key"), true);
  assert.equal(html.includes("□"), true);
});
