import assert from "node:assert/strict";
import test from "node:test";

import {
  BATCH_A_SELECTION_MODES,
  createConfigState,
  setBatchAGenerationSeed,
  setBatchAIncludeAnswerKey,
  setBatchALayoutMode,
  setBatchAOrdering,
  setBatchAPrintLayout,
  setBatchAQuestionCount,
  setBatchASelectionMode,
  setBatchASourceId,
} from "../../site/assets/browser/state/config-state.js";
import { buildWorksheetDocumentFromState } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import {
  validateBatchABrowserQuestions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js";
import {
  G4A_U08_GENERATOR_VALIDATOR_DOMAIN_FULLFIX_VERSION,
  validateG4AU08GeneratorValidatorDomainQuestion,
} from "../../site/modules/curriculum/batch-a/g4a-u08-generator-validator-domain-fullfix.js";

const SOURCE_ID = "g4a_u08_4a08";
const FAILING_SEED = "glm-s07:g4a_u08_4a08:3x5:answer-on";

function sourceUnitOptions(seed, questionCount = 18) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_SELECTION_MODES.SOURCE_UNIT,
    questionCount,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: seed,
  };
}

function failingScenarioState() {
  const state = createConfigState();
  setBatchASourceId(state, SOURCE_ID);
  setBatchASelectionMode(state, BATCH_A_SELECTION_MODES.SOURCE_UNIT);
  setBatchAQuestionCount(state, 18);
  setBatchAOrdering(state, "groupedByPattern");
  setBatchAIncludeAnswerKey(state, true);
  setBatchAGenerationSeed(state, FAILING_SEED);
  setBatchAPrintLayout(state, { columns: 3, rowsPerPage: 5 });
  setBatchALayoutMode(state, "custom_with_caps");
  return state;
}

function operationViolations(question) {
  const violations = [];
  for (const [index, operation] of (question.operationOrderTrace ?? []).entries()) {
    if (!Number.isInteger(operation.result) || operation.result < 0 || operation.result > 9999) {
      violations.push({ code: "intermediate_range", index, operation });
    }
    if (operation.op === "×" && operation.result > 500) {
      violations.push({ code: "multiplication_too_large", index, operation });
    }
    if (operation.op === "÷" && operation.result > 100) {
      violations.push({ code: "division_quotient_too_large", index, operation });
    }
  }
  return violations;
}

test("GLM-S07 exact failing seed is normalized inside the generator domain", () => {
  const result = generateBatchABrowserQuestions(sourceUnitOptions(FAILING_SEED));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 18);
  assert.equal(result.fullFix?.version, G4A_U08_GENERATOR_VALIDATOR_DOMAIN_FULLFIX_VERSION);
  assert.equal(result.fullFix?.admitted, true);
  assert.equal(result.fullFix?.repairedQuestionCount, 1);
  assert.equal(result.fullFix?.rejectedQuestionCount, 0);

  const repaired = result.questions.find((question) => (
    question.metadata?.generatorValidatorDomainFullFixVersion
      === G4A_U08_GENERATOR_VALIDATOR_DOMAIN_FULLFIX_VERSION
  ));
  assert.ok(repaired, "expected one validator-domain normalized question");
  assert.equal(repaired.patternSpecId, "ps_g4a_u08_mul_div_left_to_right");
  assert.equal(repaired.shapeVariant, "mul_div_ltr_multiply_then_divide");
  assert.deepEqual(repaired.expressionTokens, [64, "×", 7, "÷", 8]);
  assert.equal(repaired.expression, "64 × 7 ÷ 8");
  assert.equal(repaired.operationOrderTrace[0].result, 448);
  assert.equal(repaired.finalAnswer, 56);
  assert.equal(repaired.answerText, "56");
  assert.deepEqual(operationViolations(repaired), []);

  const domain = result.questions.map(validateG4AU08GeneratorValidatorDomainQuestion);
  assert.equal(domain.every((entry) => entry.ok), true, JSON.stringify(domain.filter((entry) => !entry.ok)));
  const blocking = validateBatchABrowserQuestions(result.questions);
  assert.equal(blocking.ok, true, JSON.stringify(blocking.errors));
});

test("GLM-S07 exact 3x5 answer-on worksheet now passes the blocking worksheet validator", () => {
  const result = buildWorksheetDocumentFromState(failingScenarioState());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.ok(result.worksheetDocument);
  assert.equal(result.worksheetDocument.summary.questionCount, 18);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 18);
  assert.equal(result.worksheetDocument.layoutResolution.layoutExact, true);
  assert.equal(result.worksheetDocument.layoutResolution.capped, false);
  assert.deepEqual(result.worksheetDocument.layoutResolution.resolvedQuestionLayout, {
    paperSize: "A4",
    columns: 3,
    rowsPerPage: 5,
  });
});

test("G4A-U08 source-unit numeric generator remains inside validator domains across 128 deterministic seeds", () => {
  let generatedQuestionCount = 0;
  const coveredPatternSpecs = new Set();
  const coveredShapeVariants = new Set();
  for (let seedIndex = 0; seedIndex < 128; seedIndex += 1) {
    const seed = `glm-s07-domain-sweep-${seedIndex}`;
    const result = generateBatchABrowserQuestions(sourceUnitOptions(seed, 40));
    assert.equal(result.ok, true, `${seed}: ${JSON.stringify(result.errors)}`);
    assert.equal(result.questions.length, 40, seed);
    generatedQuestionCount += result.questions.length;
    for (const question of result.questions) {
      coveredPatternSpecs.add(question.patternSpecId);
      if (question.shapeVariant) coveredShapeVariants.add(question.shapeVariant);
      assert.deepEqual(operationViolations(question), [], `${seed}: ${JSON.stringify(question)}`);
      const domain = validateG4AU08GeneratorValidatorDomainQuestion(question);
      assert.equal(domain.ok, true, `${seed}: ${JSON.stringify(domain.errors)}`);
    }
    const blocking = validateBatchABrowserQuestions(result.questions);
    assert.equal(blocking.ok, true, `${seed}: ${JSON.stringify(blocking.errors)}`);
  }
  assert.equal(generatedQuestionCount, 5120);
  assert.equal(coveredPatternSpecs.size, 10);
  assert.ok(coveredShapeVariants.has("mul_div_ltr_multiply_then_divide"));
});
