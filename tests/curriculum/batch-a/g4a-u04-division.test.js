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
} from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-extension.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints
} from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g4a_u04_4a04";
const KP_IDS = Object.freeze([
  "kp_g4a_u04_4digit_by_1digit_thousands_sufficient",
  "kp_g4a_u04_4digit_by_1digit_thousands_insufficient",
  "kp_g4a_u04_4digit_by_1digit_thousands_exact",
  "kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "kp_g4a_u04_3digit_by_2digit_tens_sufficient",
  "kp_g4a_u04_3digit_by_2digit_tens_insufficient",
  "kp_g4a_u04_division_check_with_remainder"
]);
const SPEC_IDS = Object.freeze([
  "ps_g4a_u04_4digit_by_1digit_thousands_sufficient",
  "ps_g4a_u04_4digit_by_1digit_thousands_insufficient",
  "ps_g4a_u04_4digit_by_1digit_thousands_exact",
  "ps_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "ps_g4a_u04_3digit_by_2digit_tens_sufficient",
  "ps_g4a_u04_3digit_by_2digit_tens_insufficient",
  "ps_g4a_u04_division_check_with_remainder"
]);
const EXPECTED_CASES = Object.freeze({
  ps_g4a_u04_4digit_by_1digit_thousands_sufficient: "thousands_sufficient",
  ps_g4a_u04_4digit_by_1digit_thousands_insufficient: "thousands_insufficient",
  ps_g4a_u04_4digit_by_1digit_thousands_exact: "thousands_exact",
  ps_g4a_u04_2digit_by_2digit_ten_multiple_divisor: "ten_multiple_divisor",
  ps_g4a_u04_3digit_by_2digit_tens_sufficient: "tens_sufficient",
  ps_g4a_u04_3digit_by_2digit_tens_insufficient: "tens_insufficient"
});

function firstGroupId(kpId) {
  return getVisiblePatternGroupsForKnowledgePoint(kpId)[0]?.patternGroupId;
}

function stateFor(kpIds, count = 35, includeAnswerKey = true, ordering = "groupedByPattern") {
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

function digitCount(value) {
  return String(Math.abs(value)).length;
}

function firstDigit(value) {
  return Number(String(value)[0]);
}

function firstTwoDigits(value) {
  return Number(String(value).slice(0, 2));
}

function uniquePromptCount(questions) {
  return new Set(questions.map((question) => question.blankedDisplayText)).size;
}

function assertDivisionMath(question) {
  assert.equal(question.quotient, Math.floor(question.dividend / question.divisor));
  assert.equal(question.remainder, question.dividend % question.divisor);
  assert.equal(question.remainder >= 0 && question.remainder < question.divisor, true);
  assert.equal(question.divisor * question.quotient + question.remainder, question.dividend);
}

function assertFirstPlaceCase(question) {
  if (question.firstPlaceCase === "thousands_sufficient") {
    assert.equal(digitCount(question.dividend), 4);
    assert.equal(digitCount(question.divisor), 1);
    assert.equal(firstDigit(question.dividend) >= question.divisor, true);
    assert.notEqual(firstDigit(question.dividend) % question.divisor, 0);
    assert.equal(question.quotientStartPlace, "thousands");
  } else if (question.firstPlaceCase === "thousands_insufficient") {
    assert.equal(firstDigit(question.dividend) < question.divisor, true);
    assert.equal(question.quotientStartPlace, "hundreds");
  } else if (question.firstPlaceCase === "thousands_exact") {
    assert.equal(firstDigit(question.dividend) % question.divisor, 0);
    assert.equal(question.quotientStartPlace, "thousands");
  } else if (question.firstPlaceCase === "ten_multiple_divisor") {
    assert.equal(question.divisor % 10, 0);
    assert.equal(question.quotientStartPlace, "ones");
  } else if (question.firstPlaceCase === "tens_sufficient") {
    assert.equal(firstTwoDigits(question.dividend) >= question.divisor, true);
    assert.equal(question.quotientStartPlace, "tens");
  } else if (question.firstPlaceCase === "tens_insufficient") {
    assert.equal(firstTwoDigits(question.dividend) < question.divisor, true);
    assert.equal(question.quotientStartPlace, "ones");
  }
}

test("G4A-U04 exposes seven division KnowledgePoints", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 7);
  assert.equal(availability.hiddenPendingCount, 0);
  assert.equal(availability.notSelectableCount, 0);
  const visibleIds = listVisibleBatchAKnowledgePoints().filter((kp) => kp.sourceId === SOURCE_ID).map((kp) => kp.knowledgePointId);
  assert.deepEqual(visibleIds, KP_IDS);
});

test("G4A-U04 source-unit generation produces seven PatternSpecs", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 35, ordering: "groupedByPattern", generationSeed: "s54c" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 35);
  assert.deepEqual(result.plan.patternSpecIds, SPEC_IDS);
  assert.deepEqual(new Set(result.questions.map((question) => question.patternSpecId)), new Set(SPEC_IDS));
  assert.equal(validateBatchABrowserQuestions(result.questions).ok, true);
});

test("G4A-U04 generated divisions satisfy quotient/remainder and source start-place cases", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 70, ordering: "groupedByPattern", generationSeed: "s54c-cases" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  for (const question of result.questions) {
    assertDivisionMath(question);
    if (question.kind === "g4aU04LongDivision") {
      assert.equal(question.firstPlaceCase, EXPECTED_CASES[question.patternSpecId]);
      assertFirstPlaceCase(question);
    }
    assert.equal(validateBatchABrowserQuestion(question).ok, true);
  }
});

test("G4A-U04 verification questions use dividend = divisor × quotient + remainder", () => {
  const result = buildWorksheetDocumentFromState(stateFor(["kp_g4a_u04_division_check_with_remainder"], 12));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  for (const question of result.worksheetDocument.generatedQuestions) {
    assert.equal(question.kind, "g4aU04DivisionCheckWithRemainder");
    assert.equal(question.remainder > 0, true);
    assert.equal(question.remainder < question.divisor, true);
    assert.equal(question.answerText, `${question.divisor} × ${question.quotient} + ${question.remainder} = ${question.dividend}`);
    assert.equal(validateBatchABrowserQuestion(question).ok, true);
  }
});

test("G4A-U04 validator rejects corrupted quotient and start-place metadata", () => {
  const result = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 7, generationSeed: "s54c-corrupt" });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const longDivision = result.questions.find((question) => question.kind === "g4aU04LongDivision");
  assert.ok(longDivision);
  assert.equal(validateBatchABrowserQuestion({ ...longDivision, quotient: longDivision.quotient + 1 }).ok, false);
  assert.equal(validateBatchABrowserQuestion({ ...longDivision, quotientStartPlace: "ones" }).ok, false);
});

test("G4A-U04 single-KP worksheets avoid excessive duplicate prompts", () => {
  for (const kpId of KP_IDS) {
    const result = buildWorksheetDocumentFromState(stateFor([kpId], 30));
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(uniquePromptCount(result.worksheetDocument.generatedQuestions) >= 27, true, `${kpId} duplicate threshold failed`);
  }
});

test("G4A-U04 same-unit mixed worksheet builds questions and answer key", () => {
  const result = buildWorksheetDocumentFromState(stateFor(KP_IDS, 70, true));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(new Set(result.worksheetDocument.batchA.patternSpecIds), new Set(SPEC_IDS));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 70);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 70);
  assert.equal(result.worksheetDocument.generatedQuestions.every((question) => question.sourceId === SOURCE_ID), true);
});

test("G4A-U04 mixed worksheet duplicate rate stays bounded", () => {
  const result = buildWorksheetDocumentFromState(stateFor(KP_IDS, 140));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(uniquePromptCount(result.worksheetDocument.generatedQuestions) >= 126, true);
});

test("G4A-U04 shuffleAcrossPatterns changes render order", () => {
  const grouped = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 35, ordering: "groupedByPattern", generationSeed: "s54c-shuffle" });
  const shuffled = generateBatchABrowserQuestions({ sourceId: SOURCE_ID, questionCount: 35, ordering: "shuffleAcrossPatterns", generationSeed: "s54c-shuffle" });
  assert.equal(grouped.ok, true, JSON.stringify(grouped.errors));
  assert.equal(shuffled.ok, true, JSON.stringify(shuffled.errors));
  assert.deepEqual(new Set(grouped.questions.map((question) => question.id)), new Set(shuffled.questions.map((question) => question.id)));
  assert.notDeepEqual(grouped.questions.map((question) => question.id), shuffled.questions.map((question) => question.id));
});
