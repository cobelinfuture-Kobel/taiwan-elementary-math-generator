import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  getBatchAWorksheetPlan,
  setBatchASelectorSelection,
} from "../../site/assets/browser/state/config-state.js";
import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  G3A_U08_PART_WHOLE_KP_ID,
  G3A_U08_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g3a-u08-part-whole-fraction-selector-projection.js";
import {
  G3A_U08_UNIT_FRACTION_KP_ID,
  G3A_U08_DISCRETE_FRACTION_KP_ID,
} from "../../site/modules/curriculum/registry/g3a-u08-slice002-selector-projection.js";
import { G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID } from "../../site/modules/curriculum/registry/g3a-u08-same-denominator-compare-selector-projection.js";
import { G3A_U08_P04F24_KP_ID } from "../../site/modules/curriculum/registry/g3a-u08-measurement-fraction-selector-projection-p04f24.js";
import { G3A_U08_P04F24_CURRENT_KP_IDS } from "../../site/modules/curriculum/batch-a/g3a-u08-current-coordinator-p04f24.js";

function modesFor(questions, knowledgePointId) {
  return [...new Set(questions
    .filter((question) => question.metadata?.knowledgePointId === knowledgePointId)
    .map((question) => question.questionMode))].sort();
}

test("Classic live state keeps G3A-U08 five-KP same-unit mix as numeric + application", () => {
  // batch-a-selector-extension intentionally exposes the historical P01E snapshot to
  // ordinary Node callers and the current P04F31 selector only while a browser document
  // exists. This focused test is asserting the Classic browser state path, so materialize
  // that exact environment boundary instead of accidentally testing the historical Node view.
  const priorDocument = globalThis.document;
  globalThis.document = {};

  try {
    const state = createConfigState({
      queryState: {
        sourceId: G3A_U08_SOURCE_ID,
        questionCount: 20,
        ordering: "shuffleAcrossPatterns",
        includeAnswerKey: true,
        generationSeed: "g3a-u08-live-five-kp",
        columns: 3,
        rowsPerPage: 5,
      },
    });

    setBatchASelectorSelection(state, {
      selectionMode: BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
      selectedKnowledgePointIds: [...G3A_U08_P04F24_CURRENT_KP_IDS],
      selectedPatternGroupIds: [],
    });

    const livePlan = getBatchAWorksheetPlan(state);
    assert.equal(livePlan.sourceId, G3A_U08_SOURCE_ID);
    assert.equal(livePlan.selectionMode, BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT);
    assert.deepEqual(livePlan.selectedKnowledgePointIds, [...G3A_U08_P04F24_CURRENT_KP_IDS]);

    // Classic has no G3A-U08 question-mode control. The current public profile therefore
    // contributes its default numeric value; the P04F24 route must not collapse this live
    // same-unit five-KP request into the single measurement-fraction application route.
    assert.equal(livePlan.questionMode, "numeric");

    const result = buildWorksheetDocumentFromState(state);
    assert.equal(result.ok, true, JSON.stringify(result.errors ?? []));

    const questions = result.worksheetDocument.generatedQuestions;
    assert.equal(questions.length, 20);
    assert.equal(new Set(questions.map((question) => question.metadata?.knowledgePointId)).size, 5);
    assert.deepEqual(
      [...new Set(questions.map((question) => question.metadata?.knowledgePointId))].sort(),
      [...G3A_U08_P04F24_CURRENT_KP_IDS].sort(),
    );

    assert.deepEqual(modesFor(questions, G3A_U08_PART_WHOLE_KP_ID), ["numeric"]);
    assert.deepEqual(modesFor(questions, G3A_U08_UNIT_FRACTION_KP_ID), ["application", "numeric"]);
    assert.deepEqual(modesFor(questions, G3A_U08_DISCRETE_FRACTION_KP_ID), ["application", "numeric"]);
    assert.deepEqual(modesFor(questions, G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID), ["application", "numeric"]);
    assert.deepEqual(modesFor(questions, G3A_U08_P04F24_KP_ID), ["application"]);

    assert.ok(questions.some((question) => question.questionMode === "numeric"));
    assert.ok(questions.some((question) => question.questionMode === "application"));
  } finally {
    if (priorDocument === undefined) delete globalThis.document;
    else globalThis.document = priorDocument;
  }
});
