import test from "node:test";
import assert from "node:assert/strict";

import { buildWorksheetDocumentFromState } from "../../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAIncludeAnswerKey,
  setBatchAQuestionCount,
  setBatchASelectorSelection,
  setBatchASourceId
} from "../../../site/assets/browser/state/config-state.js";
import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import {
  validateBatchABrowserQuestion,
  validateBatchABrowserQuestions
} from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints
} from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g4a_u08_4a08";
const KP_IDS = Object.freeze([
  "kp_g4a_u08_parentheses_first",
  "kp_g4a_u08_mul_div_before_add_sub",
  "kp_g4a_u08_left_to_right_same_level",
  "kp_g4a_u08_comprehensive_order_of_operations"
]);
const APP_KP_IDS = Object.freeze([
  "kp_g4a_u08_app_add_sub_sequence",
  "kp_g4a_u08_app_parentheses_grouping",
  "kp_g4a_u08_app_mul_div_sequence",
  "kp_g4a_u08_app_mul_div_before_add_sub"
]);
const COMPREHENSIVE_KP_ID = "kp_g4a_u08_comprehensive_order_of_operations";
const SPEC_IDS = Object.freeze([
  "ps_g4a_u08_parentheses_add_sub",
  "ps_g4a_u08_parentheses_mul_div",
  "ps_g4a_u08_mul_before_add_sub",
  "ps_g4a_u08_div_before_add_sub",
  "ps_g4a_u08_add_sub_left_to_right",
  "ps_g4a_u08_mul_div_left_to_right",
  "ps_g4a_u08_mixed_mul_div_add_sub_no_parentheses",
  "ps_g4a_u08_mixed_with_parentheses",
  "ps_g4a_u08_large_add_sub_overlay_no_parentheses",
  "ps_g4a_u08_large_add_sub_overlay_with_parentheses"
]);
const OVERLAY_SPEC_IDS = new Set([
  "ps_g4a_u08_large_add_sub_overlay_no_parentheses",
  "ps_g4a_u08_large_add_sub_overlay_with_parentheses"
]);
const OPERATORS = new Set(["+", "-", "×", "÷"]);
const PRECEDENCE = Object.freeze({ "+": 1, "-": 1, "×": 2, "÷": 2 });

function firstGroupId(kpId) {
  return getVisiblePatternGroupsForKnowledgePoint(kpId)[0]?.patternGroupId;
}

function stateFor(kpIds, count = 40, includeAnswerKey = true, ordering = "groupedByPattern") {
  const state = createConfigState();
  setBatchASourceId(state, SOURCE_ID);
  setBatchAIncludeAnswerKey(state, includeAnswerKey);
  state.batchA.ordering = ordering;
  setBatchASelectorSelection(state, {
    selectionMode: kpIds.length === 1 ? BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT : BATCH_A_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [...kpIds],
    selectedPatternGroupIds: kpIds.map(firstGroupId)
  });
  setBatchAQuestionCount(state, count);
  return state;
}

function uniquePromptCount(questions) {
  return new Set(questions.map((question) => question.blankedDisplayText)).size;
}

function overlayCount(questions) {
  return questions.filter((question) => question.largeAddSubOverlay === true || OVERLAY_SPEC_IDS.has(question.patternSpecId)).length;
}

function shapeVariantCount(questions) {
  return new Set(questions.map((question) => question.shapeVariant)).size;
}

function toRpn(tokens) {
  const output = [];
  const ops = [];
  for (const token of tokens) {
    if (Number.isInteger(token)) output.push(token);
    else if (token === "(") ops.push(token);
    else if (token === ")") {
      while (ops.length > 0 && ops[ops.length - 1] !== "(") output.push(ops.pop());
      ops.pop();
    } else if (OPERATORS.has(token)) {
      while (ops.length > 0 && OPERATORS.has(ops[ops.length - 1]) && PRECEDENCE[ops[ops.length - 1]] >= PRECEDENCE[token]) output.push(ops.pop());
      ops.push(token);
    }
  }
  while (ops.length > 0) output.push(ops.pop());
  return output;
}

function evaluate(tokens) {
  const stack = [];
  for (const token of toRpn(tokens)) {
    if (Number.isInteger(token)) {
      stack.push(token);
      continue;
    }
    const right = stack.pop();
    const left = stack.pop();
    if (token === "+") stack.push(left + right);
    else if (token === "-") stack.push(left - right);
    else if (token === "×") stack.push(left * right);
    else if (token === "÷") stack.push(left / right);
  }
  return stack[0];
}

test("G4A-U08 exposes all 15 canonical KnowledgePoints including numeric and Phase2A families", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 15);
  assert.equal(availability.hiddenPendingCount, 0);
  assert.equal(availability.notSelectableCount, 0);
  const visibleIds = listVisibleBatchAKnowledgePoints().filter((kp) => kp.sourceId === SOURCE_ID).map((kp) => kp.knowledgePointId);
  assert.equal(visibleIds.length, 15);
  assert.equal(visibleIds.filter((kpId) => kpId.startsWith("kp_g4a_u08_num_")).length, 11);
  assert.deepEqual(visibleIds.filter((kpId) => APP_KP_IDS.includes(kpId)), APP_KP_IDS);
});

test("G4A-U08 source-unit generation produces ten PatternSpecs", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 50, ordering: "groupedByPattern", generationSeed: "s55d" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 50);
  assert.deepEqual(result.plan.patternSpecIds, SPEC_IDS);
  assert.deepEqual(new Set(result.questions.map((question) => question.patternSpecId)), new Set(SPEC_IDS));
  assert.equal(validateBatchABrowserQuestions(result.questions).ok, true);
});

test("G4A-U08 expressions recompute by standard precedence", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 100, ordering: "groupedByPattern", generationSeed: "s55d-eval" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  for (const question of result.questions) {
    assert.equal(evaluate(question.expressionTokens), question.finalAnswer);
    assert.equal(question.answerText, String(question.finalAnswer));
    assert.equal(validateBatchABrowserQuestion(question).ok, true);
  }
});

test("G4A-U08 prompt format stays horizontal without KP labels", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 40, ordering: "groupedByPattern", generationSeed: "s55f-prompts" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  for (const question of result.questions) {
    assert.equal(question.blankedDisplayText, `${question.expression} = ______`);
    for (const forbidden of ["括號", "乘除", "加減", "同級", "四則"]) assert.equal(question.blankedDisplayText.includes(forbidden), false);
  }
});

test("G4A-U08 same-level left-to-right examples differ from common wrong grouping", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT, selectedKnowledgePointIds: ["kp_g4a_u08_left_to_right_same_level"], selectedPatternGroupIds: [firstGroupId("kp_g4a_u08_left_to_right_same_level")], questionCount: 20, generationSeed: "s55-left-right" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const sub = result.questions.find((question) => question.expressionTokens[1] === "-" && (question.expressionTokens[3] === "+" || question.expressionTokens[3] === "-"));
  const divMul = result.questions.find((question) => question.expressionTokens[1] === "÷" && question.expressionTokens[3] === "×");
  assert.ok(sub);
  assert.ok(divMul);
  const wrongSub = sub.expressionTokens[3] === "+"
    ? sub.expressionTokens[0] - (sub.expressionTokens[2] + sub.expressionTokens[4])
    : sub.expressionTokens[0] - (sub.expressionTokens[2] - sub.expressionTokens[4]);
  assert.notEqual(sub.finalAnswer, wrongSub);
  assert.notEqual(divMul.finalAnswer, divMul.expressionTokens[0] / (divMul.expressionTokens[2] * divMul.expressionTokens[4]));
});

test("G4A-U08 validator rejects corrupted answer and trace", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 10, generationSeed: "s55-corrupt" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const question = result.questions[0];
  assert.equal(validateBatchABrowserQuestion({ ...question, finalAnswer: question.finalAnswer + 1 }).ok, false);
  assert.equal(validateBatchABrowserQuestion({ ...question, operationOrderTrace: [] }).ok, false);
});

test("G4A-U08 number-control constraints hold", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 100, generationSeed: "s55-number-control" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  for (const question of result.questions) {
    assert.equal(question.finalAnswer >= 0 && question.finalAnswer <= 9999, true);
    assert.equal(question.intermediateResults.every((value) => Number.isInteger(value) && value >= 0 && value <= 9999), true);
    assert.equal(question.operationOrderTrace.every((step) => step.op !== "×" || step.result <= 500), true);
    assert.equal(question.operationOrderTrace.every((step) => step.op !== "÷" || step.result <= 100), true);
  }
});

test("G4A-U08 large add/sub overlay rate is near 20 percent in source-unit mode", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 100, ordering: "groupedByPattern", generationSeed: "s55-overlay-rate" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const count = overlayCount(result.questions);
  assert.equal(count >= 10 && count <= 30, true);
  assert.equal(count, 20);
});

test("G4A-U08 single-KP generation uses varied expression shapes", () => {
  const minimumShapeCounts = new Map([
    ["kp_g4a_u08_parentheses_first", 6],
    ["kp_g4a_u08_mul_div_before_add_sub", 6],
    ["kp_g4a_u08_left_to_right_same_level", 5],
    [COMPREHENSIVE_KP_ID, 10]
  ]);
  for (const kpId of KP_IDS) {
    const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, selectionMode: BATCH_A_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT, selectedKnowledgePointIds: [kpId], selectedPatternGroupIds: [firstGroupId(kpId)], questionCount: 60, generationSeed: `s55-shape-${kpId}` });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(shapeVariantCount(result.questions) >= minimumShapeCounts.get(kpId), true, `${kpId} shape variants were too narrow`);
  }
});

test("G4A-U08 comprehensive single-KP overlay rate stays near 20 percent", () => {
  const result = buildWorksheetDocumentFromState(stateFor([COMPREHENSIVE_KP_ID], 30, true));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const count = overlayCount(result.worksheetDocument.generatedQuestions);
  assert.equal(count >= 3 && count <= 9, true);
  assert.equal(count, 6);
});

test("G4A-U08 same-unit mixed worksheet builds answer key", () => {
  const result = buildWorksheetDocumentFromState(stateFor(KP_IDS, 80, true));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 80);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 80);
  assert.deepEqual(new Set(result.worksheetDocument.batchA.patternSpecIds), new Set(SPEC_IDS));
});

test("G4A-U08 mixed worksheet duplicate rate stays bounded", () => {
  const result = buildWorksheetDocumentFromState(stateFor(KP_IDS, 120));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(uniquePromptCount(result.worksheetDocument.generatedQuestions) >= 108, true);
});

test("G4A-U08 shuffleAcrossPatterns changes render order", () => {
  const grouped = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 50, ordering: "groupedByPattern", generationSeed: "s55-shuffle" });
  const shuffled = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 50, ordering: "shuffleAcrossPatterns", generationSeed: "s55-shuffle" });
  assert.equal(grouped.ok, true, JSON.stringify(grouped.errors));
  assert.equal(shuffled.ok, true, JSON.stringify(shuffled.errors));
  assert.deepEqual(new Set(grouped.questions.map((question) => question.id)), new Set(shuffled.questions.map((question) => question.id)));
  assert.notDeepEqual(grouped.questions.map((question) => question.id), shuffled.questions.map((question) => question.id));
});
