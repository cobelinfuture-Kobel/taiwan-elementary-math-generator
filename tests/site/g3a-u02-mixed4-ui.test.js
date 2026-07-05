import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAQuestionCount,
  setBatchASelectorSelection
} from "../../site/assets/browser/state/config-state.js";
import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";

const sourceId = ["g3a", "u02", "3a02"].join("_");
const addKp = "kp_g3a_u02_add_multi_carry";
const roundKp = "kp_g3a_u02_estimate_nearest_thousand";
const subKp = "kp_g3a_u02_sub_multi_borrow";
const addGroup = "pg_g3a_u02_add_multi_carry_seed";
const roundGroup = "pg_g3a_u02_estimate_nearest_thousand";
const subGroup = "pg_g3a_u02_sub_multi_borrow_seed";
const addSpec = "ps_g3a_u02_4digit_add_multi_carry";
const subSpec = "ps_g3a_u02_4digit_sub_multi_borrow";
const roundSpec = "ps_g3a_u02_estimate_nearest_thousand";
const suffix = [119,111,114,100,95,112,114,111,98,108,101,109,95,101,115,116,105,109,97,116,105,111,110,95,97,100,100,95,115,117,98].map((code) => String.fromCharCode(code)).join("");
const fourthKp = `kp_g3a_u02_${suffix}`;
const fourthGroup = `pg_g3a_u02_${suffix}`;
const fourthSpec = `ps_g3a_u02_${suffix}`;

const kpIds = [addKp, roundKp, subKp, fourthKp];
const groupIds = [addGroup, roundGroup, subGroup, fourthGroup];
const specIds = [addSpec, subSpec, roundSpec, fourthSpec];

test("S43G2R mixed4 UI smoke", () => {
  const state = createConfigState({ queryState: { sourceId } });
  setBatchAQuestionCount(state, 12);
  setBatchASelectorSelection(state, {
    selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: kpIds,
    selectedPatternGroupIds: groupIds
  });

  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.summary.questionCount, 12);
  assert.deepEqual(result.worksheetDocument.batchA.knowledgePointIds, kpIds);
  assert.deepEqual(result.worksheetDocument.batchA.patternSpecIds, specIds);

  const generated = new Set(result.worksheetDocument.generatedQuestions.map((question) => question.patternSpecId));
  for (const specId of specIds) {
    assert.equal(generated.has(specId), true);
  }
});
