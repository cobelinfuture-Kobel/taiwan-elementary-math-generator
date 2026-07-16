import test from "node:test";
import assert from "node:assert/strict";

import { buildG5AU02BrowserDynamicWorksheet } from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";
import {
  generateG5AU02Canonical,
  validateG5AU02Canonical,
} from "../../src/curriculum/g5a-u02/canonical-resolver.js";
import {
  enrichG5AU02GeneratedItemPrompt,
  validateG5AU02QuestionDisplayModel,
} from "../../src/curriculum/g5a-u02/question-display-model.js";
import {
  G5A_U02_S100_DIVISIBILITY_FAMILIES,
  G5A_U02_S100_PROBLEM_SCENARIO_IDS,
  getG5AU02S100PatternIds,
} from "../../src/curriculum/g5a-u02/s100-method-runtime.js";

const SOURCE_ID = "g5a_u02_5a02";
const PATTERN_IDS = getG5AU02S100PatternIds();
const EXPECTED_KINDS = new Map([
  ["ps_g5a_u02_factor_relation_equivalence", "factor_relation_dual_witness"],
  ["ps_g5a_u02_factor_enumeration_trial_division", "trial_division_table"],
  ["ps_g5a_u02_factor_list_from_pairs", "factor_pairs_to_ordered_list"],
  ["ps_g5a_u02_factor_statement_judgement", "controlled_divisibility_statement"],
  ["ps_g5a_u02_problem_type_classification", "number_theory_problem_type_scenario"],
  ["ps_g5a_u02_complete_factor_list_statement_evaluation", "factor_list_reasoning_statement_set"],
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function canonical(patternSpecId, seed) {
  return generateG5AU02Canonical(patternSpecId, { seed });
}

function expectCode(item, mutate, code) {
  const changed = clone(item);
  mutate(changed);
  const result = validateG5AU02Canonical(changed);
  assert.equal(result.ok, false, `${code} should block`);
  assert.ok(result.errors.includes(code), `${code}: ${result.errors.join(",")}`);
}

test("S100 scope is exactly the six S99 method/language/reasoning PatternSpecs", () => {
  assert.deepEqual(PATTERN_IDS, [
    "ps_g5a_u02_factor_relation_equivalence",
    "ps_g5a_u02_factor_enumeration_trial_division",
    "ps_g5a_u02_factor_list_from_pairs",
    "ps_g5a_u02_factor_statement_judgement",
    "ps_g5a_u02_problem_type_classification",
    "ps_g5a_u02_complete_factor_list_statement_evaluation",
  ]);
});

test("S100 384/384 canonical items preserve source methods and structured displays", () => {
  const grammarCoverage = new Set();
  const scenarioCoverage = new Set();
  const statementFamilyCoverage = new Set();
  const factorTruthCoverage = new Set();
  const divisibilityTruthCoverage = new Set();
  const taskModeCoverage = new Set();
  let inspected = 0;

  for (let patternIndex = 0; patternIndex < PATTERN_IDS.length; patternIndex += 1) {
    const patternSpecId = PATTERN_IDS[patternIndex];
    for (let offset = 0; offset < 64; offset += 1) {
      const item = canonical(patternSpecId, 100000 + patternIndex * 1000 + offset);
      const validation = validateG5AU02Canonical(item);
      assert.equal(validation.ok, true, validation.errors.join(","));
      const enriched = enrichG5AU02GeneratedItemPrompt(item);
      assert.equal(enriched.questionDisplayModel.kind, EXPECTED_KINDS.get(patternSpecId));
      const displayValidation = validateG5AU02QuestionDisplayModel(item, enriched.questionDisplayModel, enriched.prompt);
      assert.equal(displayValidation.ok, true, displayValidation.errors.join(","));
      assert.ok(enriched.prompt.length > 24);

      if (patternSpecId === "ps_g5a_u02_factor_relation_equivalence") {
        factorTruthCoverage.add(item.answer.isFactor);
        taskModeCoverage.add(item.data.learnerTaskMode);
        assert.equal(item.data.divisionWitness.remainder, item.data.target % item.data.candidateDivisor);
      }
      if (patternSpecId === "ps_g5a_u02_factor_enumeration_trial_division") {
        assert.equal(item.data.trialDivisionRows.length, item.data.searchEnd);
        assert.ok(item.data.trialDivisionRows.some((row) => row.isExact));
      }
      if (patternSpecId === "ps_g5a_u02_factor_list_from_pairs") {
        assert.ok(item.data.factorPairs.length > 0);
        assert.deepEqual(item.answer.values, item.data.orderedFactorList);
      }
      if (patternSpecId === "ps_g5a_u02_factor_statement_judgement") {
        grammarCoverage.add(item.data.grammarFamilyId);
        divisibilityTruthCoverage.add(item.answer.value);
      }
      if (patternSpecId === "ps_g5a_u02_problem_type_classification") {
        scenarioCoverage.add(item.data.scenarioFamilyId);
        assert.ok(Object.keys(item.data.quantityRoles).length >= 2);
      }
      if (patternSpecId === "ps_g5a_u02_complete_factor_list_statement_evaluation") {
        for (const statement of item.data.statements) statementFamilyCoverage.add(statement.statementFamilyId);
        assert.ok(item.data.truthPattern.includes(true));
        assert.ok(item.data.truthPattern.includes(false));
        assert.ok(item.data.statements.some((statement) => statement.requiredInference));
      }
      inspected += 1;
    }
  }

  assert.equal(inspected, 384);
  assert.deepEqual([...grammarCoverage].sort(), [...G5A_U02_S100_DIVISIBILITY_FAMILIES].sort());
  assert.deepEqual([...scenarioCoverage].sort(), [...G5A_U02_S100_PROBLEM_SCENARIO_IDS].sort());
  assert.deepEqual([...factorTruthCoverage].sort(), [false, true]);
  assert.deepEqual([...divisibilityTruthCoverage].sort(), [false, true]);
  assert.deepEqual([...taskModeCoverage].sort(), ["compare_two_methods", "complete_and_judge"]);
  for (const family of [
    "candidate_is_factor",
    "target_is_multiple",
    "factor_count_parity",
    "square_number_odd_factor_count",
    "paired_factors_product_target",
  ]) assert.ok(statementFamilyCoverage.has(family), family);
});

test("S100 public worksheets retain the 384 structured method questions without answer-record leakage", () => {
  let inspected = 0;
  for (let index = 0; index < PATTERN_IDS.length; index += 1) {
    const patternSpecId = PATTERN_IDS[index];
    const result = buildG5AU02BrowserDynamicWorksheet({
      sourceId: SOURCE_ID,
      patternSpecIds: [patternSpecId],
      questionCount: 64,
      generationSeed: 200000 + index * 1000,
      includeAnswerKey: true,
      questionRowsPerPage: 4,
    });
    assert.equal(result.ok, true, result.errors?.join(","));
    assert.equal(result.worksheetDocument.questionItems.length, 64);
    assert.equal(result.worksheetDocument.answerKeyItems.length, 64);
    for (const record of result.worksheetDocument.questionItems) {
      assert.equal(record.questionDisplayModel.kind, EXPECTED_KINDS.get(patternSpecId));
      assert.equal(record.promptCompletenessStatus, "visible_unique_solution_data_complete");
      assert.equal("answer" in record, false);
      assert.equal("structuredAnswer" in record, false);
      assert.equal("answerText" in record, false);
      inspected += 1;
    }
  }
  assert.equal(inspected, 384);
});

test("S100 blocking validators reject source-method mutations", () => {
  const factor = canonical(PATTERN_IDS[0], 301001);
  expectCode(factor, (item) => { delete item.data.divisionWitness; }, "G5AU02_P0_FACTOR_RELATION_DUAL_WITNESS_MISSING");
  expectCode(factor, (item) => { item.data.multiplicationWitness.product += 1; }, "G5AU02_P0_FACTOR_RELATION_WITNESS_INCONSISTENT");

  const trial = canonical(PATTERN_IDS[1], 302001);
  expectCode(trial, (item) => { item.data.trialDivisionRows.pop(); }, "G5AU02_P0_TRIAL_DIVISION_ROWS_INCOMPLETE");
  expectCode(trial, (item) => { item.data.trialDivisionRows[0].quotient += 1; }, "G5AU02_P0_TRIAL_DIVISION_ROW_ARITHMETIC_INVALID");
  expectCode(trial, (item) => { item.data.factorValues.pop(); }, "G5AU02_P0_TRIAL_DIVISION_FACTOR_SET_MISMATCH");

  const pairs = canonical(PATTERN_IDS[2], 303001);
  expectCode(pairs, (item) => { item.data.factorPairs = []; }, "G5AU02_P0_PAIR_SOURCE_NOT_VISIBLE");
  expectCode(pairs, (item) => { item.data.orderedFactorList.reverse(); }, "G5AU02_P0_PAIR_TO_LIST_TRANSFORMATION_INVALID");

  const statement = canonical(PATTERN_IDS[3], 304001);
  expectCode(statement, (item) => { item.data.grammarFamilyId = "free_form"; }, "G5AU02_P0_DIVISIBILITY_GRAMMAR_UNKNOWN");
  expectCode(statement, (item) => { [item.data.subjectValue, item.data.objectValue] = [item.data.objectValue, item.data.subjectValue]; }, "G5AU02_P0_DIVISIBILITY_ROLE_DIRECTION_INVALID");
  expectCode(statement, (item) => { item.data.truthValue = !item.data.truthValue; }, "G5AU02_P0_DIVISIBILITY_TRUTH_MISMATCH");

  const scenario = canonical(PATTERN_IDS[4], 305001);
  expectCode(scenario, (item) => { item.data.scenarioFamilyId = "free_form"; }, "G5AU02_P0_PROBLEM_SCENARIO_FAMILY_UNKNOWN");
  expectCode(scenario, (item) => { item.data.quantityRoles = {}; }, "G5AU02_P0_PROBLEM_QUANTITY_ROLE_MISSING");
  expectCode(scenario, (item) => { item.data.expectedLabel = "multiple"; item.data.contextKind = "multiple"; }, "G5AU02_P0_PROBLEM_TYPE_LABEL_MISMATCH");

  const reasoning = canonical(PATTERN_IDS[5], 306001);
  expectCode(reasoning, (item) => { item.data.statements = [{ kind: "contains_one" }]; }, "G5AU02_P0_STATEMENT_SET_TRIVIAL");
  expectCode(reasoning, (item) => { item.data.truthPattern = item.data.truthPattern.map(() => true); }, "G5AU02_P0_STATEMENT_TRUTH_PATTERN_INVALID");
  expectCode(reasoning, (item) => { for (const row of item.data.statements) row.requiredInference = "lookup_only"; }, "G5AU02_P0_STATEMENT_INFERENCE_NOT_REQUIRED");
});
