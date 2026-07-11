import test from "node:test";
import assert from "node:assert/strict";

import {
  G3B_U08_SEMANTIC_PATTERN_SPEC_IDS,
  getG3BU08SemanticPatternDefinition,
  listG3BU08SemanticPatternDefinitions
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u08-semantic-extension.js";
import {
  G3B_U08_SEMANTIC_CONTEXT_VARIANTS,
  listG3BU08SemanticContextVariants,
  listG3BU08SemanticContextVariantsForPatternSpec,
  validateG3BU08SemanticContextRegistry
} from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-context-registry.js";
import {
  G3B_U08_HIDDEN_SEMANTIC_PATTERN_SPEC_IDS,
  generateG3BU08HiddenSemanticBatch,
  generateG3BU08HiddenSemanticQuestion,
  validateG3BU08HiddenGeneratedQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-generator.js";

function generateAllExplicitVariants() {
  return listG3BU08SemanticPatternDefinitions().flatMap((spec) =>
    listG3BU08SemanticContextVariantsForPatternSpec(spec.patternSpecId).map((variant, index) => {
      const result = generateG3BU08HiddenSemanticQuestion({
        patternSpecId: spec.patternSpecId,
        contextVariantId: variant.contextVariantId,
        seed: `s58d-explicit-${index}`,
        sequenceNumber: index + 1
      });
      assert.equal(result.ok, true, `${spec.patternSpecId}/${variant.contextVariantId}: ${JSON.stringify(result.errors)}`);
      return result.question;
    })
  );
}

test("S58D registers exactly 72 approved hidden context variants across all 24 families", () => {
  const checked = validateG3BU08SemanticContextRegistry();
  assert.deepEqual(checked, { ok: true, errors: [] });
  assert.equal(G3B_U08_SEMANTIC_CONTEXT_VARIANTS.length, 72);
  assert.equal(listG3BU08SemanticContextVariants().length, 72);
  assert.equal(new Set(G3B_U08_SEMANTIC_CONTEXT_VARIANTS.map((variant) => variant.contextVariantId)).size, 72);
  assert.deepEqual(G3B_U08_HIDDEN_SEMANTIC_PATTERN_SPEC_IDS, G3B_U08_SEMANTIC_PATTERN_SPEC_IDS);
  for (const patternSpecId of G3B_U08_SEMANTIC_PATTERN_SPEC_IDS) {
    const spec = getG3BU08SemanticPatternDefinition(patternSpecId);
    const variants = listG3BU08SemanticContextVariantsForPatternSpec(patternSpecId);
    assert.equal(variants.length, 3, patternSpecId);
    for (const variant of variants) {
      assert.equal(variant.templateFamilyId, spec.templateFamilyId);
      assert.equal(spec.contextDomains.includes(variant.contextDomain), true);
      assert.equal(variant.realismProfile.representation, "horizontal_only");
      assert.equal(variant.realismProfile.publicUse, "forbidden");
    }
  }
});

test("S58D generates all 72 family-context variants without fallback or unresolved placeholders", () => {
  const questions = generateAllExplicitVariants();
  assert.equal(questions.length, 72);
  assert.equal(new Set(questions.map((question) => question.patternSpecId)).size, 24);
  assert.equal(new Set(questions.map((question) => question.contextVariantId)).size, 72);
  for (const question of questions) {
    const checked = validateG3BU08HiddenGeneratedQuestion(question);
    assert.equal(checked.ok, true, `${question.patternSpecId}: ${JSON.stringify(checked.errors)}`);
    assert.doesNotMatch(question.promptText, /\{[^}]+\}/);
    assert.equal(question.representation, "horizontal_only");
    assert.equal(question.selectorStatus, "hidden");
    assert.equal(question.generatorRouting, "hidden_only_not_canonical");
    assert.equal(question.productionUse, "forbidden");
    assert.equal(question.sourceId, "g3b_u08_3b08");
    assert.equal(question.phase, "S58D");
    assert.equal(question.semanticSnapshot.contextVariantId, question.contextVariantId);
    assert.equal(question.semanticSnapshot.representation, "horizontal_only");
    assert.equal(question.metadata.patternTags.includes("s58d_hidden_generator"), true);
  }
});

test("S58D obeys prior Batch A multiplication, exact-division and integer bounds", () => {
  const questions = generateAllExplicitVariants();
  for (const question of questions) {
    const spec = getG3BU08SemanticPatternDefinition(question.patternSpecId);
    const values = question.quantities;
    for (const value of Object.values(values)) {
      assert.equal(Number.isSafeInteger(value), true, `${question.patternSpecId}:${value}`);
      assert.equal(value > 0 && value <= 999, true, `${question.patternSpecId}:${value}`);
    }
    if (spec.equationShape === "a*b") {
      assert.equal(values.b >= 1 && values.b <= 9, true);
      assert.equal(values.a * values.b, question.finalAnswer);
      assert.equal(question.finalAnswer <= 999, true);
    }
    if (spec.equationShape === "a/b") {
      assert.equal(values.a >= 10 && values.a <= 999, true);
      assert.equal(values.b >= 2 && values.b <= 9, true);
      assert.equal(values.a % values.b, 0);
      assert.equal(values.a / values.b, question.finalAnswer);
    }
    if (spec.equationShape === "a*b vs c*d") {
      assert.equal(values.a <= 9 && values.c <= 9, true);
      assert.equal(question.optionAEquationModel, `${values.b} × ${values.a} = ${question.optionATotal}`);
      assert.equal(question.optionBEquationModel, `${values.d} × ${values.c} = ${question.optionBTotal}`);
      assert.notEqual(question.optionATotal, question.optionBTotal);
      assert.equal(question.winner, question.optionATotal > question.optionBTotal ? "option_a" : "option_b");
    }
  }
});

test("S58D emits the three approved answer-model shapes with correct arithmetic", () => {
  const questions = generateAllExplicitVariants();
  const byShape = Object.groupBy(questions, (question) => question.answerModelShape);
  assert.equal(byShape.semantic_single_integer_with_unit.length, 48);
  assert.equal(byShape.semantic_estimation_judgment.length, 12);
  assert.equal(byShape.semantic_same_price_comparison.length, 12);

  for (const question of byShape.semantic_single_integer_with_unit) {
    assert.equal(Number.isSafeInteger(question.finalAnswer), true);
    assert.equal(question.finalAnswerWithUnit, `${question.finalAnswer}${question.finalAnswerUnit}`);
  }
  for (const question of byShape.semantic_estimation_judgment) {
    assert.ok(question.estimateEquationModel);
    assert.ok(question.exactEquationModel);
    assert.equal(["approximately", "enough", "more_by", "less_by"].includes(question.judgment), true);
    if (question.judgment === "more_by" || question.judgment === "less_by") {
      assert.equal(question.exactDifference, question.quantities.d * question.quantities.b);
    }
    if (question.judgment === "enough") {
      assert.equal(question.quantities.a * question.quantities.b <= question.quantities.c, true);
    }
  }
  for (const question of byShape.semantic_same_price_comparison) {
    assert.ok(question.optionAEquationModel);
    assert.ok(question.optionBEquationModel);
    assert.equal(["option_a", "option_b"].includes(question.winner), true);
    assert.match(question.promptText, /價格相同/);
    assert.ok(question.conclusionZh);
  }
});

test("S58D applies the frozen natural-language and same-price FullFix directives", () => {
  const questions = generateAllExplicitVariants();
  for (const question of questions) {
    assert.doesNotMatch(question.promptText, /每段剪成/);
    assert.doesNotMatch(question.promptText, /成功一球|成功一題|成功一關/);
    if (question.templateFamilyId === "tpl_g3b_u08_total_score_per_success") {
      assert.match(question.promptText, /每(投進一球|答對一題|完成一關)可得\d+分/);
      assert.match(question.promptText, /(投進了\d+球|答對了\d+題|完成了\d+關)/);
    }
    if (question.templateFamilyId === "tpl_g3b_u08_group_count_score_events") {
      assert.match(question.promptText, /(投進了幾球|答對了幾題|完成了幾關)/);
    }
    if (question.knowledgePointId === "kp_g3b_u08_same_price_value_comparison") {
      assert.match(question.promptText, /價格相同/);
      assert.notEqual(question.optionATotal, question.optionBTotal);
      assert.equal(["option_a", "option_b"].includes(question.winner), true);
    }
  }
});

test("S58D single-question generation is deterministic by seed, sequence and explicit context", () => {
  const patternSpecId = "ps_g3b_u08_estimate_exact_over_benchmark";
  const contextVariantId = listG3BU08SemanticContextVariantsForPatternSpec(patternSpecId)[1].contextVariantId;
  const options = { patternSpecId, contextVariantId, seed: "deterministic-replay", sequenceNumber: 7 };
  const first = generateG3BU08HiddenSemanticQuestion(options);
  const second = generateG3BU08HiddenSemanticQuestion(options);
  assert.equal(first.ok, true);
  assert.deepEqual(second, first);
  const changed = generateG3BU08HiddenSemanticQuestion({ ...options, seed: "deterministic-replay-changed" });
  assert.equal(changed.ok, true);
  assert.notDeepEqual(changed.question.quantities, first.question.quantities);
});

test("S58D batch generation balances families, preserves exact count and deterministically shuffles", () => {
  const stable = generateG3BU08HiddenSemanticBatch({
    patternSpecIds: G3B_U08_SEMANTIC_PATTERN_SPEC_IDS,
    questionCount: 240,
    seed: "s58d-batch-240",
    ordering: "stable"
  });
  assert.equal(stable.ok, true, JSON.stringify(stable.errors));
  assert.equal(stable.questions.length, 240);
  assert.deepEqual(stable.questions.map((question) => question.questionNumber), Array.from({ length: 240 }, (_, index) => index + 1));
  assert.deepEqual(new Set(Object.values(stable.allocation)), new Set([10]));

  const shuffledA = generateG3BU08HiddenSemanticBatch({
    patternSpecIds: G3B_U08_SEMANTIC_PATTERN_SPEC_IDS,
    questionCount: 240,
    seed: "s58d-batch-240",
    ordering: "shuffledAcrossPatterns",
    orderingSeed: "shuffle-a"
  });
  const shuffledAReplay = generateG3BU08HiddenSemanticBatch({
    patternSpecIds: G3B_U08_SEMANTIC_PATTERN_SPEC_IDS,
    questionCount: 240,
    seed: "s58d-batch-240",
    ordering: "shuffledAcrossPatterns",
    orderingSeed: "shuffle-a"
  });
  const shuffledB = generateG3BU08HiddenSemanticBatch({
    patternSpecIds: G3B_U08_SEMANTIC_PATTERN_SPEC_IDS,
    questionCount: 240,
    seed: "s58d-batch-240",
    ordering: "shuffledAcrossPatterns",
    orderingSeed: "shuffle-b"
  });
  assert.equal(shuffledA.ok, true);
  assert.deepEqual(shuffledAReplay, shuffledA);
  assert.notDeepEqual(
    shuffledA.questions.map((question) => question.id),
    shuffledB.questions.map((question) => question.id)
  );
  assert.deepEqual(new Set(shuffledA.questions.map((question) => question.id)), new Set(stable.questions.map((question) => question.id)));
});

test("S58D rejects unregistered specs, mismatched contexts, duplicate batch ids and invalid ordering", () => {
  const unknown = generateG3BU08HiddenSemanticQuestion({ patternSpecId: "ps_unknown" });
  assert.equal(unknown.ok, false);
  assert.equal(unknown.question, null);
  assert.equal(unknown.errors[0].code, "G3B_U08_GEN_PATTERN_SPEC_UNREGISTERED");

  const firstSpec = G3B_U08_SEMANTIC_PATTERN_SPEC_IDS[0];
  const wrongVariant = listG3BU08SemanticContextVariantsForPatternSpec(G3B_U08_SEMANTIC_PATTERN_SPEC_IDS[1])[0];
  const mismatch = generateG3BU08HiddenSemanticQuestion({ patternSpecId: firstSpec, contextVariantId: wrongVariant.contextVariantId });
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.errors[0].code, "G3B_U08_GEN_CONTEXT_VARIANT_UNREGISTERED");

  const duplicate = generateG3BU08HiddenSemanticBatch({ patternSpecIds: [firstSpec, firstSpec], questionCount: 2 });
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.errors[0].code, "G3B_U08_GEN_BATCH_PATTERN_SPEC_DUPLICATE");

  const ordering = generateG3BU08HiddenSemanticBatch({ patternSpecIds: [firstSpec], questionCount: 1, ordering: "random" });
  assert.equal(ordering.ok, false);
  assert.equal(ordering.errors[0].code, "G3B_U08_GEN_BATCH_ORDERING_INVALID");
});
