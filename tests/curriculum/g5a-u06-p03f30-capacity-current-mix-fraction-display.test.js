import test from "node:test";
import assert from "node:assert/strict";

import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  getBatchAWorksheetPlan,
  setBatchASelectorSelection,
} from "../../site/assets/browser/state/config-state.js";
import {buildWorksheetDocumentFromState} from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {
  P03F30_DISTINCT_CAPACITY_BY_PATTERN,
  generateG5AU06P03F30Questions,
} from "../../site/modules/curriculum/batch-a/g5a-u06-rank8-fraction-runtime-p03f30.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {
  G5A_U06_P03F30_HIDDEN_APPLICATION_SPEC_IDS,
  G5A_U06_P03F30_KP_IDS,
  G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS,
  G5A_U06_P03F30_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g5a-u06-rank8-fraction-selector-projection-p03f30.js";
import {G5A_U06_P03F38_KP_ID} from "../../site/modules/curriculum/registry/g5a-u06-rank9-mixed-improper-add-sub-selector-projection-p03f38.js";
import {
  G5A_U06_P04F34_KP_ID,
  G5A_U06_P04F34_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g5a-u06-measurement-difference-context-selector-projection-p04f34.js";

const printLayout = Object.freeze({paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true});
const gcd = (a,b) => { let x=Math.abs(a),y=Math.abs(b); while(y)[x,y]=[y,x%y]; return x || 1; };

function singlePlan(patternSpecId, questionCount = 240) {
  return {sourceId:G5A_U06_P03F30_SOURCE_ID,selectionMode:"singleKnowledgePoint",questionMode:"numeric",patternSpecIds:[patternSpecId],questionCount,generationSeed:`capacity-${patternSpecId}`,genericFallbackAllowed:false};
}

function mixedOptions(selectedKnowledgePointIds, questionCount) {
  return {sourceId:G5A_U06_P03F30_SOURCE_ID,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds,selectedPatternGroupIds:[],questionMode:"numeric",questionCount,generationSeed:`g5a-u06-current-${selectedKnowledgePointIds.length}-${questionCount}`,ordering:"shuffleAcrossPatterns",includeAnswerKey:true,printLayout};
}

test("G5A-U06 four direct numeric PatternSpecs each prove 240 distinct prompts", () => {
  for (const patternSpecId of G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS) {
    assert.ok(P03F30_DISTINCT_CAPACITY_BY_PATTERN[patternSpecId] >= 240, patternSpecId);
    const plan = singlePlan(patternSpecId);
    const generated = generateG5AU06P03F30Questions({plan});
    assert.equal(generated.ok, true, `${patternSpecId}:${JSON.stringify(generated.errors)}`);
    assert.equal(generated.questions.length, 240);
    assert.equal(new Set(generated.questions.map((question) => question.blankedDisplayText)).size, 240);
    assert.equal(new Set(generated.questions.map((question) => question.id)).size, 240);
  }
});

test("G5A-U06 exact four direct numeric selection succeeds at 20, 120 and 240", () => {
  for (const questionCount of [20,120,240]) {
    const result = buildBatchABrowserWorksheetDocument(mixedOptions([...G5A_U06_P03F30_KP_IDS], questionCount));
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    const questions = result.worksheetDocument.generatedQuestions;
    assert.equal(questions.length, questionCount);
    assert.equal(new Set(questions.map((question) => question.blankedDisplayText)).size, questionCount);
    assert.deepEqual([...new Set(questions.map((question) => question.metadata.knowledgePointId))].sort(), [...G5A_U06_P03F30_KP_IDS].sort());
    assert.ok(questions.every((question) => question.questionMode === "numeric"));
  }
});

test("G5A-U06 each direct numeric KP materializes a full 240-question worksheet", () => {
  for (const knowledgePointId of G5A_U06_P03F30_KP_IDS) {
    const result = buildBatchABrowserWorksheetDocument({sourceId:G5A_U06_P03F30_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[knowledgePointId],questionMode:"numeric",questionCount:240,generationSeed:`worksheet-240-${knowledgePointId}`,includeAnswerKey:true,printLayout});
    assert.equal(result.ok, true, `${knowledgePointId}:${JSON.stringify(result.errors)}`);
    assert.equal(result.worksheetDocument.questionCount, 240);
    assert.equal(result.worksheetDocument.answerKeyItems.length, 240);
    assert.equal(new Set(result.worksheetDocument.generatedQuestions.map((question) => question.blankedDisplayText)).size, 240);
  }
});

test("G5A-U06 existing numeric KPs and public Q34 application KP compose in one worksheet", () => {
  const selected = [...G5A_U06_P03F30_KP_IDS,G5A_U06_P04F34_KP_ID];
  for (const questionCount of [20,120,240]) {
    const result = buildBatchABrowserWorksheetDocument(mixedOptions(selected, questionCount));
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    const document = result.worksheetDocument;
    assert.equal(document.questionCount, questionCount);
    assert.ok(document.summary.numericQuestionCount > 0);
    assert.ok(document.summary.applicationQuestionCount > 0);
    assert.equal(document.summary.numericQuestionCount + document.summary.applicationQuestionCount, questionCount);
    assert.deepEqual([...new Set(document.generatedQuestions.map((question) => question.knowledgePointId ?? question.metadata.knowledgePointId))].sort(), [...selected].sort());
    assert.ok(document.generatedQuestions.some((question) => question.questionMode === "numeric"));
    assert.ok(document.generatedQuestions.some((question) => question.questionMode === "application"));
    assert.ok(document.generatedQuestions.filter((question) => question.questionMode === "application").every((question) => G5A_U06_P04F34_SPEC_IDS.includes(question.patternSpecId)));
    assert.ok(document.generatedQuestions.every((question) => !G5A_U06_P03F30_HIDDEN_APPLICATION_SPEC_IDS.includes(question.patternSpecId)));
  }
});

test("G5A-U06 all six currently visible KPs can share a 240-question numeric + application worksheet", () => {
  const selected = [...G5A_U06_P03F30_KP_IDS,G5A_U06_P03F38_KP_ID,G5A_U06_P04F34_KP_ID];
  const result = buildBatchABrowserWorksheetDocument(mixedOptions(selected, 240));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 240);
  assert.deepEqual([...new Set(result.worksheetDocument.generatedQuestions.map((question) => question.knowledgePointId ?? question.metadata.knowledgePointId))].sort(), [...selected].sort());
});

test("G5A-U06 structured fractions render numerator above denominator in prompts, answers and print HTML", () => {
  const selected = [...G5A_U06_P03F30_KP_IDS,G5A_U06_P04F34_KP_ID];
  const result = buildBatchABrowserWorksheetDocument(mixedOptions(selected, 120));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.ok(document.questionDisplayModels.every((model) => model.promptInlineMath));
  assert.ok(document.answerKeyItems.every((item) => item.promptInlineMath));
  assert.ok(document.answerKeyItems.some((item) => item.answerInlineMath));
  for (const question of document.generatedQuestions.filter((row) => Number.isSafeInteger(row.resultDenominator))) {
    assert.equal(gcd(question.resultNumerator, question.resultDenominator), 1);
    if (question.resultDenominator === 1) assert.equal(question.answerText.includes("/"), false);
    if (question.resultNumerator > question.resultDenominator && question.resultDenominator > 1) assert.equal(question.answerText.startsWith(`${question.resultNumerator}/${question.resultDenominator}`), true);
  }
  const html = renderWorksheetDocumentToHtml(document, {stylesheetHref:"./assets/styles/print-styles.css"});
  assert.match(html, /data-inline-math-source="g5a_u06_5a06"/);
  assert.match(html, /class="math-fraction"/);
  assert.match(html, /class="math-fraction__numerator"/);
  assert.match(html, /class="math-fraction__denominator"/);
});

test("Classic live state preserves G5A-U06 same-unit numeric + application selection", () => {
  const priorDocument = globalThis.document;
  globalThis.document = {};
  try {
    const selected = [...G5A_U06_P03F30_KP_IDS,G5A_U06_P04F34_KP_ID];
    const state = createConfigState({queryState:{sourceId:G5A_U06_P03F30_SOURCE_ID,questionCount:20,ordering:"shuffleAcrossPatterns",includeAnswerKey:true,generationSeed:"g5a-u06-live-mixed",columns:2,rowsPerPage:4}});
    setBatchASelectorSelection(state, {selectionMode:BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,selectedKnowledgePointIds:selected,selectedPatternGroupIds:[]});
    const livePlan = getBatchAWorksheetPlan(state);
    assert.deepEqual(livePlan.selectedKnowledgePointIds, selected);
    const result = buildWorksheetDocumentFromState(state);
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.worksheetDocument.summary.numericQuestionCount, 16);
    assert.equal(result.worksheetDocument.summary.applicationQuestionCount, 4);
    assert.ok(result.worksheetDocument.questionDisplayModels.every((model) => model.promptInlineMath));
  } finally {
    if (priorDocument === undefined) delete globalThis.document;
    else globalThis.document = priorDocument;
  }
});

test("Classic live state generates each former failing KP singly and the exact four-KP mix", () => {
  const priorDocument = globalThis.document;
  globalThis.document = {};
  try {
    for (const knowledgePointId of G5A_U06_P03F30_KP_IDS) {
      const state = createConfigState({queryState:{sourceId:G5A_U06_P03F30_SOURCE_ID,questionCount:20,ordering:"shuffleAcrossPatterns",includeAnswerKey:true,generationSeed:`g5a-u06-live-single-${knowledgePointId}`,columns:2,rowsPerPage:4}});
      setBatchASelectorSelection(state, {selectionMode:BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,selectedKnowledgePointIds:[knowledgePointId],selectedPatternGroupIds:[]});
      const result = buildWorksheetDocumentFromState(state);
      assert.equal(result.ok, true, `${knowledgePointId}:${JSON.stringify(result.errors)}`);
      assert.equal(result.worksheetDocument.questionCount, 20);
    }
    const mixedState = createConfigState({queryState:{sourceId:G5A_U06_P03F30_SOURCE_ID,questionCount:20,ordering:"shuffleAcrossPatterns",includeAnswerKey:true,generationSeed:"g5a-u06-live-exact-four",columns:2,rowsPerPage:4}});
    setBatchASelectorSelection(mixedState, {selectionMode:BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,selectedKnowledgePointIds:[...G5A_U06_P03F30_KP_IDS],selectedPatternGroupIds:[]});
    const mixedResult = buildWorksheetDocumentFromState(mixedState);
    assert.equal(mixedResult.ok, true, JSON.stringify(mixedResult.errors));
    assert.equal(mixedResult.worksheetDocument.questionCount, 20);
    assert.deepEqual([...new Set(mixedResult.worksheetDocument.generatedQuestions.map((question) => question.metadata.knowledgePointId))].sort(), [...G5A_U06_P03F30_KP_IDS].sort());
  } finally {
    if (priorDocument === undefined) delete globalThis.document;
    else globalThis.document = priorDocument;
  }
});
