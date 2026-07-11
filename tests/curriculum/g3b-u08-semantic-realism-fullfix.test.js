import test from "node:test";
import assert from "node:assert/strict";

import {
  checkG3BU08HumanRealism
} from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-realism-policy.js";
import {
  generateG3BU08ValidatedSemanticQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-validator.js";
import {
  getG3BU08SemanticContextVariant,
  listG3BU08SemanticContextVariantsForPatternSpec
} from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-context-registry.js";
import {
  getG3BU08SemanticPatternDefinition,
  listG3BU08SemanticPatternDefinitions
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u08-semantic-extension.js";

function generate(patternSpecId, contextVariantId, seed = "s58e-realism") {
  const result = generateG3BU08ValidatedSemanticQuestion({
    patternSpecId,
    contextVariantId,
    seed,
    sequenceNumber: 1
  });
  assert.equal(result.ok, true, `${contextVariantId}: ${JSON.stringify(result.errors)}`);
  return result.question;
}

test("S58E FullFix keeps all 72 variants inside family-specific human realism ranges", () => {
  let checked = 0;
  for (const spec of listG3BU08SemanticPatternDefinitions()) {
    for (const variant of listG3BU08SemanticContextVariantsForPatternSpec(spec.patternSpecId)) {
      const question = generate(spec.patternSpecId, variant.contextVariantId, `realism:${variant.contextVariantId}`);
      const result = checkG3BU08HumanRealism(question, spec, variant);
      assert.equal(result.ok, true, `${variant.contextVariantId}: ${result.reasons.join(", ")}`);
      checked += 1;
    }
  }
  assert.equal(checked, 72);
});

test("S58E score and craft contexts avoid implausible per-event and per-product values", () => {
  const scoreSpec = "ps_g3b_u08_total_score_per_success";
  for (const variant of listG3BU08SemanticContextVariantsForPatternSpec(scoreSpec)) {
    const question = generate(scoreSpec, variant.contextVariantId, `score:${variant.contextVariantId}`);
    assert.equal(question.quantities.a >= 2 && question.quantities.a <= 10, true);
  }

  const craftSpecs = [
    "ps_g3b_u08_total_material_per_product",
    "ps_g3b_u08_group_count_craft_products"
  ];
  for (const patternSpecId of craftSpecs) {
    for (const variant of listG3BU08SemanticContextVariantsForPatternSpec(patternSpecId)) {
      const question = generate(patternSpecId, variant.contextVariantId, `craft:${variant.contextVariantId}`);
      const spec = getG3BU08SemanticPatternDefinition(patternSpecId);
      const result = checkG3BU08HumanRealism(question, spec, variant);
      assert.equal(result.ok, true, `${variant.contextVariantId}: ${result.reasons.join(", ")}`);
    }
  }
});

test("S58E equal-share, packaging and capacity answers remain plausible", () => {
  const patterns = [
    "ps_g3b_u08_group_count_packaging",
    "ps_g3b_u08_per_group_equal_share_people",
    "ps_g3b_u08_per_group_equal_container_capacity",
    "ps_g3b_u08_reverse_base_capacity_multiple"
  ];
  for (const patternSpecId of patterns) {
    for (const variant of listG3BU08SemanticContextVariantsForPatternSpec(patternSpecId)) {
      const question = generate(patternSpecId, variant.contextVariantId, `plausible:${variant.contextVariantId}`);
      const spec = getG3BU08SemanticPatternDefinition(patternSpecId);
      const result = checkG3BU08HumanRealism(question, spec, variant);
      assert.equal(result.ok, true, `${variant.contextVariantId}: ${result.reasons.join(", ")}`);
    }
  }
});

test("S58E comparison variants express their context and use dimension-natural conclusions", () => {
  const capacityId = "ps_g3b_u08_same_price_compare_capacity";
  for (const variant of listG3BU08SemanticContextVariantsForPatternSpec(capacityId)) {
    const question = generate(capacityId, variant.contextVariantId, `capacity:${variant.contextVariantId}`);
    assert.ok(variant.bindings.item);
    assert.match(question.promptText, new RegExp(variant.bindings.item));
    assert.equal(question.optionATotal === question.optionBTotal, false);
    assert.equal(Math.max(question.optionATotal, question.optionBTotal) / Math.min(question.optionATotal, question.optionBTotal) <= 3, true);
  }

  const lengthId = "ps_g3b_u08_same_price_compare_total_length";
  for (const variant of listG3BU08SemanticContextVariantsForPatternSpec(lengthId)) {
    const question = generate(lengthId, variant.contextVariantId, `length:${variant.contextVariantId}`);
    assert.match(question.conclusionZh, /總長度較長/);
    assert.doesNotMatch(question.conclusionZh, /總長度較多/);
  }
});

test("S58E realism policy blocks out-of-profile mutated content through the existing numeric boundary code", () => {
  const patternSpecId = "ps_g3b_u08_total_score_per_success";
  const variant = listG3BU08SemanticContextVariantsForPatternSpec(patternSpecId)[0];
  const question = generate(patternSpecId, variant.contextVariantId, "mutated-score");
  question.quantities.a = 137;
  question.finalAnswer = 137 * question.quantities.b;
  question.finalAnswerWithUnit = `${question.finalAnswer}分`;
  question.answerText = question.finalAnswerWithUnit;
  question.equationModel = `137 × ${question.quantities.b} = ${question.finalAnswer}`;
  question.semanticSnapshot.quantityRoleBindings.a.value = 137;
  const spec = getG3BU08SemanticPatternDefinition(patternSpecId);
  const scenario = getG3BU08SemanticContextVariant(variant.contextVariantId);
  const realism = checkG3BU08HumanRealism(question, spec, scenario);
  assert.equal(realism.ok, false);
});
