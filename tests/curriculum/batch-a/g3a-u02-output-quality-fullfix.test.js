import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const sourceId = "g3a_u02_3a02";
const mixedRows = Object.freeze([
  ["kp_g3a_u02_estimate_nearest_thousand", "pg_g3a_u02_estimate_nearest_thousand"],
  ["kp_g3a_u02_word_problem_estimation_add_sub", "pg_g3a_u02_word_problem_estimation_add_sub"],
  ["kp_g3a_u02_add_missing_digit_operand", "pg_g3a_u02_add_missing_digit_operand"],
  ["kp_g3a_u02_sub_missing_digit_operand", "pg_g3a_u02_sub_missing_digit_operand"],
  ["kp_g3a_u02_add_missing_digit_equation", "pg_g3a_u02_add_missing_digit_equation"],
  ["kp_g3a_u02_sub_missing_digit_equation", "pg_g3a_u02_sub_missing_digit_equation"],
  ["kp_g3a_u02_sub_middle_missing_digit", "pg_g3a_u02_sub_middle_missing_digit"],
  ["kp_g3a_u02_continuous_borrow_zero", "pg_g3a_u02_continuous_borrow_zero"]
]);
const residualDuplicatePrompts = Object.freeze([
  "8003 - 104 = ___",
  "3997 + 3 = ___",
  "9000 - 1101 = ___",
  "3006 - 107 = ___",
  "6008 - 109 = ___",
  "3008 - 1109 = ___",
  "2002 - 103 = ___",
  "9006 - 107 = ___",
  "2006 - 107 = ___",
  "5006 - 107 = ___",
  "5004 - 105 = ___",
  "6005 - 2106 = ___",
  "6006 - 2107 = ___",
  "9000 - 101 = ___",
  "3002 - 103 = ___"
]);

function buildMixedWorksheet(generationSeed = "s45b-output-quality-fullfix") {
  return buildBatchABrowserWorksheetDocument({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: mixedRows.map((row) => row[0]),
    selectedPatternGroupIds: mixedRows.map((row) => row[1]),
    questionCount: 200,
    ordering: "shuffleAcrossPatterns",
    generationSeed,
    includeAnswerKey: true,
    printLayout: { columns: 2, rowsPerPage: 10, showAnswerKeyPage: true }
  });
}

function promptFor(question) {
  return String(question.blankedDisplayText ?? question.duplicateKey ?? question.id);
}

test("S45B G3A-U02 mixed worksheet avoids exact duplicate prompts and uses long-text-safe layout", () => {
  const result = buildMixedWorksheet();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 200);
  assert.equal(result.worksheetDocument.generatedQuestions.some((question) => question.kind === "wordProblemEstimation"), true);
  assert.equal(result.worksheetDocument.printOptions.columns, 2);
  assert.equal(result.worksheetDocument.printOptions.rowsPerPage, 8);
  assert.equal(result.worksheetDocument.printOptions.pageBreakMode, "avoidLongTextCards");
  assert.equal(result.worksheetDocument.answerKeyPages.length > 0, true);

  const prompts = result.worksheetDocument.generatedQuestions.map(promptFor);
  assert.equal(new Set(prompts).size, prompts.length);
  assert.equal(prompts.some((text) => /2004 - 105 = ___/.test(text)), false);
  assert.equal(prompts.some((text) => /3003 - 1004 = ___/.test(text)), false);
});

test("S45B2 G3A-U02 generated PDF regression prompts do not recur", () => {
  for (const seed of ["s45b-output-quality-fullfix", "batch-a-browser", "s45c-pdf-recheck"]) {
    const result = buildMixedWorksheet(seed);
    assert.equal(result.ok, true, `${seed}: ${JSON.stringify(result.errors)}`);
    const prompts = result.worksheetDocument.generatedQuestions.map(promptFor);
    assert.equal(new Set(prompts).size, prompts.length, seed);
    for (const duplicatePrompt of residualDuplicatePrompts) {
      assert.equal(prompts.includes(duplicatePrompt), false, `${seed}: ${duplicatePrompt}`);
    }
  }
});

test("S45B G3A-U02 ordered-fill answer keys are explicit", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: ["kp_g3a_u02_add_missing_digit_equation"],
    selectedPatternGroupIds: ["pg_g3a_u02_add_missing_digit_equation"],
    questionCount: 6,
    generationSeed: "s45b-ordered-fill-answer-key",
    includeAnswerKey: true
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const orderedItems = result.worksheetDocument.answerKeyItems.filter((item) => item.patternId === "ps_g3a_u02_add_missing_digit_equation");
  assert.equal(orderedItems.length, 6);
  for (const item of orderedItems) {
    assert.match(item.answerText, /^依序填入：/);
    assert.equal(item.answerText.includes(","), true);
  }
});
