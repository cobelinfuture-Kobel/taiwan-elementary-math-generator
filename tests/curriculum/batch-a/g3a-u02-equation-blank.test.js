import test from "node:test";
import assert from "node:assert/strict";

import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { validateBatchABrowserQuestion } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import { BATCH_A_RESOLVER_SELECTION_MODES, resolveVisiblePatternGroupSelection } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { BATCH_A_SELECTOR_AVAILABILITY, getVisibleBatchAKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource, resolveVisiblePatternSpecIdsForKnowledgePoint } from "../../../site/modules/curriculum/registry/batch-a-selector-equation-extension.js";

const sourceId = "g3a_u02_3a02";
const addKp = "kp_g3a_u02_add_missing_digit_equation";
const subKp = "kp_g3a_u02_sub_missing_digit_equation";
const addGroup = "pg_g3a_u02_add_missing_digit_equation";
const subGroup = "pg_g3a_u02_sub_missing_digit_equation";
const addSpec = "ps_g3a_u02_add_missing_digit_equation";
const subSpec = "ps_g3a_u02_sub_missing_digit_equation";
const EXPECTED_BATCH_A_VISIBLE_COUNT = 34;

function make(kpId, groupId, count = 8) {
  return generateBatchABrowserQuestions({ sourceId, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT, selectedKnowledgePointIds: [kpId], selectedPatternGroupIds: [groupId], questionCount: count, generationSeed: `s43g4n1-${kpId}`, includeAnswerKey: true });
}

function checkQuestion(question, operator) {
  assert.equal(question.kind, "missingDigitEquation");
  assert.equal(question.operator, operator);
  assert.equal((question.blankedDisplayText.match(/□/g) ?? []).length, question.blanks.length);
  assert.equal(question.blanks.some((blank) => blank.target === "result"), true);
  assert.equal(new Set(question.blanks.map((blank) => blank.placeValue)).size, question.blanks.length);
  assert.equal(question.answerText, question.missingDigits.join(","));
  assert.equal(question.finalAnswer, question.answerText);
  assert.equal(validateBatchABrowserQuestion(question).ok, true);
}

test("S43G4N5 selector exposes equation blank KPs", () => {
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, EXPECTED_BATCH_A_VISIBLE_COUNT);
  assert.equal(availability.visibleCount, 10);
  assert.equal(getVisibleBatchAKnowledgePoint(addKp)?.displayName, "加法等式缺位填空");
  assert.equal(getVisibleBatchAKnowledgePoint(subKp)?.displayName, "減法等式缺位填空");
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(addKp), [addSpec]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(subKp), [subSpec]);
});

test("S43G4N3 addition equation blank generation and validation", () => {
  const result = make(addKp, addGroup, 8);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  for (const question of result.questions) checkQuestion(question, "add");
  const edited = { ...result.questions[0], answerText: "0,0,0" };
  assert.equal(validateBatchABrowserQuestion(edited).ok, false);
});

test("S43G4N3 subtraction equation blank generation and validation", () => {
  const result = make(subKp, subGroup, 8);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  for (const question of result.questions) checkQuestion(question, "subtract");
});

test("S43G4N5 resolver accepts same-unit equation blank mix", () => {
  const plan = resolveVisiblePatternGroupSelection({ sourceId, selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT, selectedKnowledgePointIds: [addKp, subKp], selectedPatternGroupIds: [addGroup, subGroup], questionCount: 8, generationSeed: "s43g4n5" });
  assert.equal(plan.ok, true, JSON.stringify(plan.errors));
  assert.deepEqual(plan.knowledgePointIds, [addKp, subKp]);
  assert.deepEqual(plan.patternSpecIds, [addSpec, subSpec].sort());
});