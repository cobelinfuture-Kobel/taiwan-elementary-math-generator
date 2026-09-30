import assert from "node:assert/strict";
import test from "node:test";

import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserQuestion, validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-extension.js";
import { G4A_U04_STEP_QUESTION_GROUP_IDS } from "../../site/modules/curriculum/batch-a/g4a-u04-step-understanding-runtime.js";
import { getVisiblePatternGroupsForKnowledgePoint } from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";

const SOURCE_ID = "g4a_u04_4a04";
const KP_ID = "kp_g4a_u04_4digit_by_1digit_thousands_sufficient";
const GROUP_ID = "pg_g4a_u04_4digit_by_1digit_thousands_sufficient";
const DIRECT_SPEC_ID = "ps_g4a_u04_4digit_by_1digit_thousands_sufficient";
const STEP_SPEC_ID = "ps_g4a_u04_4digit_by_1digit_thousands_sufficient_step_understanding";

function plan(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [GROUP_ID],
    questionCount: 12,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "g4a-u04-step-understanding-focused",
    ...overrides,
  };
}

test("G4A-U04 existing KP group exposes direct calculation plus step-understanding without a new KP", () => {
  const groups = getVisiblePatternGroupsForKnowledgePoint(KP_ID);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].patternGroupId, GROUP_ID);
  assert.deepEqual(groups[0].patternSpecIds, [DIRECT_SPEC_ID, STEP_SPEC_ID]);
});

test("G4A-U04 step-understanding runtime materializes all approved G1-G6 projections", () => {
  const generated = generateBatchABrowserQuestions(plan());
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 12);
  const stepQuestions = generated.questions.filter((question) => question.patternSpecId === STEP_SPEC_ID);
  assert.equal(stepQuestions.length, 6);
  assert.deepEqual(stepQuestions.map((question) => question.questionGroupId), G4A_U04_STEP_QUESTION_GROUP_IDS);
  assert.equal(validateBatchABrowserQuestions(generated.questions).ok, true);

  const g2 = stepQuestions.find((question) => question.questionGroupId === "G2_WHOLE_EXPRESSION_RECONSTRUCTION");
  assert.ok(g2);
  assert.ok(["multiple_choice", "fill_in"].includes(g2.responseMode));
  if (g2.responseMode === "multiple_choice") {
    assert.equal(g2.options.filter((option) => option.isCorrect).length, 1);
    assert.equal(g2.options.some((option) => option.isIntermediateStep && !option.isCorrect), true);
  }

  const g5 = stepQuestions.find((question) => question.questionGroupId === "G5_COMPOSITE_2SUB");
  assert.ok(g5);
  assert.equal(g5.subitems.length, 2);
  assert.deepEqual(g5.subitems.map((item) => item.kind), ["step_order", "whole_expression"]);
  assert.equal(g5.independentSubitemScoring, true);
  assert.match(g5.blankedDisplayText, /\(1\)/);
  assert.match(g5.blankedDisplayText, /\(2\)/);

  const g6 = stepQuestions.find((question) => question.questionGroupId === "G6_FILL_IN_RECONSTRUCTION");
  assert.ok(g6);
  assert.equal(g6.responseMode, "fill_in");
  assert.ok(Array.isArray(g6.fillInAnswers) && g6.fillInAnswers.length > 0);
});

test("G4A-U04 step-understanding is deterministic for the same seed", () => {
  const left = generateBatchABrowserQuestions(plan());
  const right = generateBatchABrowserQuestions(plan());
  assert.equal(left.ok, true);
  assert.equal(right.ok, true);
  assert.deepEqual(
    left.questions.map((question) => [question.patternSpecId, question.questionGroupId ?? null, question.blankedDisplayText, question.answerText]),
    right.questions.map((question) => [question.patternSpecId, question.questionGroupId ?? null, question.blankedDisplayText, question.answerText]),
  );
});

test("G4A-U04 validator rejects corrupted reasoning trace and multiple-choice authority", () => {
  const generated = generateBatchABrowserQuestions(plan());
  const stepQuestions = generated.questions.filter((question) => question.patternSpecId === STEP_SPEC_ID);
  const g1 = stepQuestions.find((question) => question.questionGroupId === "G1_STEP_SEQUENCE_ORDERING");
  assert.ok(g1);
  const corruptedTrace = g1.reasoningTrace.map((step, index) => index === 0 ? { ...step, quotientDigit: step.quotientDigit + 1 } : step);
  assert.equal(validateBatchABrowserQuestion({ ...g1, reasoningTrace: corruptedTrace }).ok, false);

  const g2 = stepQuestions.find((question) => question.questionGroupId === "G2_WHOLE_EXPRESSION_RECONSTRUCTION" && question.responseMode === "multiple_choice");
  if (g2) {
    assert.equal(validateBatchABrowserQuestion({ ...g2, correctOptionLabel: "Z" }).ok, false);
  }
});

test("G4A-U04 worksheet and answer key materialize G1-G6 without splitting G5 into separate question numbers", () => {
  const result = buildWorksheetDocumentFromPlan(plan({ printLayout: { columns: 1, rowsPerPage: 3 } }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const questions = result.worksheetDocument.generatedQuestions;
  const stepQuestions = questions.filter((question) => question.patternSpecId === STEP_SPEC_ID);
  assert.equal(stepQuestions.length, 6);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 12);
  const g5 = stepQuestions.find((question) => question.questionGroupId === "G5_COMPOSITE_2SUB");
  assert.ok(g5);
  const g5Answer = result.worksheetDocument.answerKeyItems.find((item) => item.questionId === g5.id);
  assert.ok(g5Answer);
  assert.match(g5Answer.answerText, /\(1\)/);
  assert.match(g5Answer.answerText, /\(2\)/);

  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.match(html, /G1|G2|G3|G4|G5|G6|直式|完整算式|正確順序/);
  assert.match(html, /\(1\)/);
  assert.match(html, /\(2\)/);
  assert.equal(html.includes("step_understanding"), false);
});
