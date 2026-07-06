import test from "node:test";
import assert from "node:assert/strict";

import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/g3a-u06-division-generator.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import {
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

const SOURCE_ID = "g3a_u06_3a06";
const EXACT_KP_ID = "kp_g3a_u06_exact_division_check";
const EXACT_PG_ID = "pg_g3a_u06_exact_division_check";
const EXACT_PS_ID = "ps_g3a_u06_exact_division_check";
const DIVISIBILITY_KP_ID = "kp_g3a_u06_divisibility_exact_check";
const DIVISIBILITY_PG_ID = "pg_g3a_u06_divisibility_exact_check";
const DIVISIBILITY_PS_ID = "ps_g3a_u06_divisibility_exact_check";

function planFor(knowledgePointId, patternGroupId, questionCount = 12, seed = "g3a-u06-division-test") {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [knowledgePointId],
    selectedPatternGroupIds: [patternGroupId],
    questionCount,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: seed,
    printLayout: { columns: 4, rowsPerPage: 5, showAnswerKeyPage: true }
  };
}

test("G3A U06 exact division selector row is the three-digit exact division KP", () => {
  const kp = getVisibleBatchAKnowledgePoint(EXACT_KP_ID);
  assert.equal(kp.displayName, "三位數除以一位數整除");
  assert.equal(kp.sourceId, SOURCE_ID);
  assert.deepEqual(kp.patternSpecIds, [EXACT_PS_ID]);
  const groups = getVisiblePatternGroupsForKnowledgePoint(EXACT_KP_ID);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].patternGroupId, EXACT_PG_ID);
});

test("G3A U06 exact division generates three-digit dividend divided by one-digit divisor", () => {
  const result = generateBatchABrowserQuestions(planFor(EXACT_KP_ID, EXACT_PG_ID, 12));
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.questions.length, 12);
  for (const question of result.questions) {
    assert.equal(question.patternSpecId, EXACT_PS_ID);
    assert.equal(question.sourceId, SOURCE_ID);
    assert.equal(question.dividend >= 100 && question.dividend <= 999, true, `bad dividend ${question.dividend}`);
    assert.equal(question.divisor >= 2 && question.divisor <= 9, true, `bad divisor ${question.divisor}`);
    assert.equal(question.dividend % question.divisor, 0);
    assert.equal(question.quotient, question.dividend / question.divisor);
  }
});

test("G3A U06 divisibility check generates yes and no divisibility prompts", () => {
  const result = generateBatchABrowserQuestions(planFor(DIVISIBILITY_KP_ID, DIVISIBILITY_PG_ID, 12, "g3a-u06-divisibility-mixed"));
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.questions.length, 12);
  const answers = new Set(result.questions.map((question) => question.answerText));
  assert.equal(answers.has("可以"), true);
  assert.equal(answers.has("不可以"), true);
  for (const question of result.questions) {
    assert.equal(question.patternSpecId, DIVISIBILITY_PS_ID);
    assert.equal(question.kind, "divisibilityCheck");
    assert.match(question.blankedDisplayText, /整除嗎？____/);
    assert.equal(question.dividend >= 20 && question.dividend <= 99, true, `bad dividend ${question.dividend}`);
    assert.equal(question.divisor >= 2 && question.divisor <= 9, true, `bad divisor ${question.divisor}`);
    assert.equal(question.answerText, question.dividend % question.divisor === 0 ? "可以" : "不可以");
  }
});

test("G3A U06 worksheet bridge renders both fixed division KP outputs", () => {
  const exact = buildBatchABrowserWorksheetDocument(planFor(EXACT_KP_ID, EXACT_PG_ID, 4, "worksheet-exact"));
  assert.equal(exact.ok, true, JSON.stringify(exact.errors, null, 2));
  assert.equal(exact.worksheetDocument.questionDisplayModels.length, 4);
  assert.equal(exact.worksheetDocument.generatedQuestions.every((question) => question.dividend >= 100), true);

  const check = buildBatchABrowserWorksheetDocument(planFor(DIVISIBILITY_KP_ID, DIVISIBILITY_PG_ID, 4, "worksheet-check"));
  assert.equal(check.ok, true, JSON.stringify(check.errors, null, 2));
  assert.equal(check.worksheetDocument.questionDisplayModels.length, 4);
  assert.match(check.worksheetDocument.questionDisplayModels[0].blankedDisplayText, /整除嗎？____/);
});
