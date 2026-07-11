import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  G3B_U08_SEMANTIC_BLOCKING_CODES,
  G3B_U08_SEMANTIC_VALIDATION_STAGES,
  G3B_U08_SEMANTIC_WARNING_CODES,
  generateG3BU08ValidatedSemanticBatch,
  generateG3BU08ValidatedSemanticQuestion,
  validateG3BU08SemanticQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-validator.js";
import {
  generateG3BU08HiddenSemanticQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-generator.js";
import {
  listG3BU08SemanticContextVariants,
  listG3BU08SemanticContextVariantsForPatternSpec
} from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-context-registry.js";
import {
  listG3BU08SemanticPatternDefinitions
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u08-semantic-extension.js";

const contract = JSON.parse(readFileSync(
  new URL("../../data/curriculum/contracts/S58B_G3B_U08_SemanticValidationContract.json", import.meta.url),
  "utf8"
));

function clone(value) {
  return structuredClone(value);
}

function hidden(patternSpecId, variantIndex = 0, seed = "s58e-test") {
  const variants = listG3BU08SemanticContextVariantsForPatternSpec(patternSpecId);
  const result = generateG3BU08HiddenSemanticQuestion({
    patternSpecId,
    contextVariantId: variants[variantIndex].contextVariantId,
    seed,
    sequenceNumber: variantIndex + 1
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  return result.question;
}

const IDS = Object.freeze({
  total: "ps_g3b_u08_total_daily_saving_accumulation",
  scoreTotal: "ps_g3b_u08_total_score_per_success",
  scoreCount: "ps_g3b_u08_group_count_score_events",
  division: "ps_g3b_u08_group_count_packaging",
  segment: "ps_g3b_u08_group_count_equal_segments",
  perGroup: "ps_g3b_u08_per_group_equal_share_people",
  reverse: "ps_g3b_u08_reverse_base_price_multiple",
  near: "ps_g3b_u08_estimate_near_hundred_total",
  budget: "ps_g3b_u08_estimate_budget_sufficiency_upper",
  over: "ps_g3b_u08_estimate_exact_over_benchmark",
  under: "ps_g3b_u08_estimate_exact_under_benchmark",
  compare: "ps_g3b_u08_same_price_compare_weight"
});

function mutateQuestion(patternSpecId, mutator, variantIndex = 0) {
  const question = clone(hidden(patternSpecId, variantIndex, `mutation:${patternSpecId}`));
  mutator(question);
  return question;
}

function codesFor(question) {
  return new Set(validateG3BU08SemanticQuestion(question).blockingErrors.map((entry) => entry.code));
}

test("S58E runtime exactly materializes the 8-stage, 44-code contract", () => {
  assert.equal(G3B_U08_SEMANTIC_VALIDATION_STAGES.length, 8);
  assert.deepEqual(
    G3B_U08_SEMANTIC_VALIDATION_STAGES.map(({ stage, name }) => ({ stage, name })),
    contract.stages.map(({ stage, name }) => ({ stage, name }))
  );
  assert.equal(G3B_U08_SEMANTIC_BLOCKING_CODES.length, 44);
  assert.equal(new Set(G3B_U08_SEMANTIC_BLOCKING_CODES).size, 44);
  assert.deepEqual([...G3B_U08_SEMANTIC_BLOCKING_CODES], contract.blockingCodes);
  assert.deepEqual([...G3B_U08_SEMANTIC_WARNING_CODES], contract.warnings);
});

test("S58E validates all 72 explicit family-context variants with no blocking defect", () => {
  const specs = listG3BU08SemanticPatternDefinitions();
  const variants = listG3BU08SemanticContextVariants();
  assert.equal(specs.length, 24);
  assert.equal(variants.length, 72);

  let accepted = 0;
  for (const spec of specs) {
    const familyVariants = listG3BU08SemanticContextVariantsForPatternSpec(spec.patternSpecId);
    assert.equal(familyVariants.length, 3, spec.patternSpecId);
    for (const [index, variant] of familyVariants.entries()) {
      const generated = generateG3BU08ValidatedSemanticQuestion({
        patternSpecId: spec.patternSpecId,
        contextVariantId: variant.contextVariantId,
        seed: `s58e-72:${variant.contextVariantId}`,
        sequenceNumber: index + 1
      });
      assert.equal(generated.ok, true, `${variant.contextVariantId}: ${JSON.stringify(generated.errors)}`);
      assert.equal(generated.validation.valid, true);
      assert.equal(generated.validation.stageResults.length, 8);
      assert.equal(generated.validation.blockingErrors.length, 0);
      assert.equal(generated.question.phase, "S58E");
      assert.equal(generated.question.validationStatus, "accepted");
      assert.equal(generated.question.contextVariantId, variant.contextVariantId);
      accepted += 1;
    }
  }
  assert.equal(accepted, 72);
});

test("S58E human-readback language gates pass across all 72 deterministic prompts", () => {
  for (const spec of listG3BU08SemanticPatternDefinitions()) {
    for (const [index, variant] of listG3BU08SemanticContextVariantsForPatternSpec(spec.patternSpecId).entries()) {
      const result = generateG3BU08ValidatedSemanticQuestion({
        patternSpecId: spec.patternSpecId,
        contextVariantId: variant.contextVariantId,
        seed: `s58e-human:${variant.contextVariantId}`,
        sequenceNumber: index + 1
      });
      assert.equal(result.ok, true, variant.contextVariantId);
      const prompt = result.question.promptText;
      assert.match(prompt, /[？?]/);
      assert.match(prompt, /[？?。]$/);
      assert.doesNotMatch(prompt, /\{[^}]+\}|每段剪成|成功一(?:球|題|關)|\b(?:kp|pg|ps|tpl|ctx)_g3b_u08_/i);
      assert.equal(prompt.length >= 15 && prompt.length <= 120, true, `${variant.contextVariantId}: ${prompt}`);
      if (spec.knowledgePointId === "kp_g3b_u08_same_price_value_comparison") assert.match(prompt, /價格相同/);
      if (spec.templateFamilyId === "tpl_g3b_u08_group_count_score_events") {
        assert.match(prompt, /(?:投進了幾球|答對了幾題|完成了幾關)/);
      }
    }
  }
});

test("S58E mutation matrix reaches every contracted blocking code", () => {
  const cases = new Map([
    ["G3BU08_REQUIRED_FIELD_MISSING", mutateQuestion(IDS.total, (q) => { delete q.promptText; })],
    ["G3BU08_SOURCE_ID_MISMATCH", mutateQuestion(IDS.total, (q) => { q.sourceId = "wrong"; })],
    ["G3BU08_UNIT_IDENTITY_MISMATCH", mutateQuestion(IDS.total, (q) => { q.unitCode = "4A-U01"; })],
    ["G3BU08_PATTERN_KIND_MISMATCH", mutateQuestion(IDS.total, (q) => { q.kind = "numeric"; })],
    ["G3BU08_KP_NOT_APPROVED", mutateQuestion(IDS.total, (q) => { q.knowledgePointId = "kp_not_approved"; })],
    ["G3BU08_FAMILY_NOT_FROZEN", mutateQuestion(IDS.total, (q) => { q.templateFamilyId = "tpl_not_frozen"; })],
    ["G3BU08_PATTERN_GROUP_MISMATCH", mutateQuestion(IDS.total, (q) => { q.patternGroupId = "pg_wrong"; })],
    ["G3BU08_ARBITRARY_PATTERN_SPEC_INJECTION", mutateQuestion(IDS.total, (q) => { q.patternSpecId = "ps_injected"; })],
    ["G3BU08_GENERAL_TWO_STEP_LEAKAGE", mutateQuestion(IDS.total, (q) => { q.scopeMarkers = ["general_two_step_mixed_operation"]; })],
    ["G3BU08_NON_HORIZONTAL_REPRESENTATION", mutateQuestion(IDS.total, (q) => { q.representation = "vertical"; })],
    ["G3BU08_VERTICAL_ALGORITHM_FORBIDDEN", mutateQuestion(IDS.total, (q) => { q.promptText += "請用直式計算。"; })],
    ["G3BU08_TWO_DIGIT_MULTIPLIER_FORBIDDEN", mutateQuestion(IDS.total, (q) => { q.quantities.b = 12; })],
    ["G3BU08_TWO_DIGIT_DIVISOR_FORBIDDEN", mutateQuestion(IDS.division, (q) => { q.quantities.b = 12; })],
    ["G3BU08_PUBLIC_REMAINDER_APPLICATION_FORBIDDEN", mutateQuestion(IDS.division, (q) => { q.remainder = 1; })],
    ["G3BU08_DIVISION_NOT_EXACT", mutateQuestion(IDS.division, (q) => { q.quantities.a += 1; })],
    ["G3BU08_NON_POSITIVE_INTEGER_DOMAIN", mutateQuestion(IDS.total, (q) => { q.quantities.a = 0; })],
    ["G3BU08_DECIMAL_FRACTION_PERCENT_LEAKAGE", mutateQuestion(IDS.total, (q) => { q.promptText += "請用小數表示。"; })],
    ["G3BU08_NUMERIC_BOUND_EXCEEDED", mutateQuestion(IDS.total, (q) => { q.quantities.a = 1000; })],
    ["G3BU08_EQUATION_SHAPE_MISMATCH", mutateQuestion(IDS.total, (q) => { q.semanticSnapshot.equationShape = "a/b"; })],
    ["G3BU08_COMPUTED_ANSWER_MISMATCH", mutateQuestion(IDS.total, (q) => { q.finalAnswer += 1; })],
    ["G3BU08_ANSWER_MODEL_MISMATCH", mutateQuestion(IDS.total, (q) => { q.answerModelShape = "wrong"; })],
    ["G3BU08_UNKNOWN_ROLE_MISMATCH", mutateQuestion(IDS.total, (q) => { q.unknownRole = "wrong"; })],
    ["G3BU08_QUANTITY_ROLE_MISMATCH", mutateQuestion(IDS.total, (q) => { q.quantityRoleBindings.a.semanticRole = "wrong"; })],
    ["G3BU08_GROUP_ROLE_CONFUSION", mutateQuestion(IDS.division, (q) => { q.promptText = `把${q.quantities.a}枝鉛筆平均分給${q.quantities.b}人，每人有多少枝？`; })],
    ["G3BU08_COMPARISON_BASE_ROLE_CONFUSION", mutateQuestion(IDS.reverse, (q) => { q.promptText = `外套售價${q.quantities.a}元，剛好是帽子售價的${q.quantities.b}倍，外套售價多少元？`; })],
    ["G3BU08_PARTICIPANT_SCOPE_AMBIGUOUS", mutateQuestion(IDS.perGroup, (q) => { q.promptText = `小安和另外2人共2人平均分${q.quantities.a}枝鉛筆，每人多少枝？`; })],
    ["G3BU08_UNIT_FLOW_MISMATCH", mutateQuestion(IDS.total, (q) => { q.finalAnswerUnit = "個"; })],
    ["G3BU08_MEASURE_DIMENSION_MISMATCH", mutateQuestion(IDS.compare, (q) => { q.comparisonDimension = "capacity"; })],
    ["G3BU08_CLASSIFIER_MISMATCH", mutateQuestion(IDS.total, (q) => { q.finalAnswerWithUnit = `${q.finalAnswer}個`; })],
    ["G3BU08_SEGMENT_LENGTH_WORDING_UNNATURAL", mutateQuestion(IDS.segment, (q) => { q.promptText = q.promptText.replace("每段長", "每段剪成"); })],
    ["G3BU08_SUCCESS_EVENT_PHRASE_UNNATURAL", mutateQuestion(IDS.scoreTotal, (q) => { q.promptText = q.promptText.replace("每投進一球", "每成功一球"); })],
    ["G3BU08_SUCCESS_EVENT_CLASSIFIER_MISMATCH", mutateQuestion(IDS.scoreCount, (q) => { q.finalAnswerUnit = "題"; q.promptText = q.promptText.replace("幾球", "幾題"); })],
    ["G3BU08_UNRESOLVED_PLACEHOLDER", mutateQuestion(IDS.total, (q) => { q.promptText += "{missing}"; })],
    ["G3BU08_ESTIMATION_DIRECTION_INVALID", mutateQuestion(IDS.near, (q) => { q.quantities.h += 100; })],
    ["G3BU08_ESTIMATION_CONCLUSION_UNSUPPORTED", mutateQuestion(IDS.near, (q) => { q.judgment = "enough"; q.finalAnswerWithUnit = "夠"; })],
    ["G3BU08_ESTIMATION_BENCHMARK_CORRECTION_INCOMPLETE", mutateQuestion(IDS.over, (q) => { q.exactDifference += 1; })],
    ["G3BU08_SAME_PRICE_NOT_EXPLICIT", mutateQuestion(IDS.compare, (q) => { q.promptText = q.promptText.replace("價格相同", "價格未說明"); })],
    ["G3BU08_COMPARISON_DIMENSION_MISMATCH", mutateQuestion(IDS.compare, (q) => { q.comparisonDimension = "capacity"; })],
    ["G3BU08_COMPARISON_TIE_NOT_ALLOWED", mutateQuestion(IDS.compare, (q) => { q.optionBTotal = q.optionATotal; })],
    ["G3BU08_COMPARISON_NO_UNIQUE_WINNER", mutateQuestion(IDS.compare, (q) => { q.winner = "option_c"; })],
    ["G3BU08_FINAL_UNIT_OR_CONCLUSION_MISSING", mutateQuestion(IDS.total, (q) => { q.finalAnswerWithUnit = ""; })],
    ["G3BU08_INTERNAL_ID_LEAKAGE", mutateQuestion(IDS.total, (q) => { q.promptText += " ps_g3b_u08_internal"; })],
    ["G3BU08_PURE_NUMERIC_FALLBACK_FORBIDDEN", mutateQuestion(IDS.total, (q) => { q.promptText = q.equationModel; q.fallback = true; })],
    ["G3BU08_SEMANTIC_SNAPSHOT_INCOMPLETE", mutateQuestion(IDS.total, (q) => { delete q.semanticSnapshot.contextVariantId; })]
  ]);

  assert.equal(cases.size, 44);
  for (const code of G3B_U08_SEMANTIC_BLOCKING_CODES) {
    const question = cases.get(code);
    assert.ok(question, `Missing mutation for ${code}`);
    assert.ok(codesFor(question).has(code), `${code} was not emitted`);
  }
});

test("S58E validated batch preserves exact count, balanced allocation, determinism and no fallback", () => {
  const first = generateG3BU08ValidatedSemanticBatch({ questionCount: 240, seed: "s58e-batch", ordering: "shuffledAcrossPatterns" });
  const second = generateG3BU08ValidatedSemanticBatch({ questionCount: 240, seed: "s58e-batch", ordering: "shuffledAcrossPatterns" });
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.equal(first.questions.length, 240);
  assert.deepEqual(first.questions, second.questions);
  assert.equal(first.validation.valid, true);
  assert.equal(first.validation.blockingErrors.length, 0);
  assert.equal(Object.keys(first.allocation).length, 24);
  assert.deepEqual(new Set(Object.values(first.allocation)), new Set([10]));
  for (const question of first.questions) {
    assert.equal(question.phase, "S58E");
    assert.equal(question.validationStatus, "accepted");
    assert.equal(question.productionUse, "forbidden");
    assert.equal(question.selectorStatus, "hidden");
    assert.doesNotMatch(question.promptText, /\{[^}]+\}/);
  }
});

test("S58E blocks unknown generation inputs without fallback output", () => {
  const result = generateG3BU08ValidatedSemanticQuestion({ patternSpecId: "ps_unknown", seed: "invalid" });
  assert.equal(result.ok, false);
  assert.equal(result.question, null);
  assert.equal(result.errors.length > 0, true);
  assert.equal(result.validation, null);
});
