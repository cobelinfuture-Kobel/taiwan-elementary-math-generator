import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";

import {
  G3B_U04_MULTIPLICATIVE_SEMANTIC_KNOWLEDGE_POINT_IDS,
  G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS,
  generateG3BU04MultiplicativeSemanticQuestion,
  isG3BU04MultiplicativeSemanticPatternSpecId,
  validateG3BU04MultiplicativeGeneratedQuestion
} from "../../../site/modules/curriculum/batch-a/g3b-u04-multiplicative-semantic-generator.js";
import {
  G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS
} from "../../../site/modules/curriculum/batch-a/g3b-u04-semantic-generator.js";
import {
  getG3BU04SemanticPatternDefinition
} from "../../../site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js";

function generate(patternSpecId, options = {}) {
  const result = generateG3BU04MultiplicativeSemanticQuestion({
    patternSpecId,
    seed: options.seed ?? "s57e4-positive",
    sequenceNumber: options.sequenceNumber ?? 1,
    contextDomain: options.contextDomain
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.ok(result.question);
  return result.question;
}

function expectedAnswer(question) {
  const q = question.quantities;
  return question.knowledgePointId === "kp_g3b_u04_composite_multiplicative_ratio"
    ? q.m * q.n
    : q.a * q.m * q.n;
}

test("S57E4 exposes exactly seven multiplicative families across two deferred KnowledgePoints", () => {
  assert.equal(G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS.length, 7);
  assert.equal(new Set(G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS).size, 7);
  assert.deepEqual(new Set(G3B_U04_MULTIPLICATIVE_SEMANTIC_KNOWLEDGE_POINT_IDS), new Set([
    "kp_g3b_u04_composite_multiplicative_ratio",
    "kp_g3b_u04_multiplicative_quantity_chain"
  ]));
  const definitions = G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS.map(getG3BU04SemanticPatternDefinition);
  assert.equal(definitions.every(Boolean), true);
  assert.deepEqual(
    new Set(definitions.map((definition) => definition.knowledgePointId)),
    new Set(G3B_U04_MULTIPLICATIVE_SEMANTIC_KNOWLEDGE_POINT_IDS)
  );
  assert.equal(G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS.some((id) => G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS.includes(id)), false);
});

test("S57E4 generates one positive deterministic item for each multiplicative family", () => {
  for (const [index, patternSpecId] of G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS.entries()) {
    const spec = getG3BU04SemanticPatternDefinition(patternSpecId);
    const question = generate(patternSpecId, { sequenceNumber: index + 1 });
    assert.equal(question.patternSpecId, patternSpecId);
    assert.equal(question.templateFamilyId, spec.templateFamilyId);
    assert.equal(question.knowledgePointId, spec.knowledgePointId);
    assert.equal(question.kind, "g3bU04SemanticWordProblem");
    assert.equal(question.phase, "S57E4");
    assert.equal(question.finalAnswer, expectedAnswer(question));
    assert.ok(question.finalAnswer > 0 && question.finalAnswer <= 10000);
    assert.equal(question.answerText, `${question.finalAnswer}${question.answerUnit}`);
    assert.equal(/\{[^}]+\}/.test(question.promptText), false);
    assert.equal(question.relationshipDirection, "base_to_middle_then_middle_to_final");
    assert.ok(Array.isArray(question.eventSequence) && question.eventSequence.length >= 2);
    assert.equal(question.semanticSnapshot.templateFamilyId, spec.templateFamilyId);
    assert.equal(validateG3BU04MultiplicativeGeneratedQuestion(question).ok, true);
  }
});

test("S57E4 generates all 23 approved multiplicative family-context combinations", () => {
  let generatedCount = 0;
  for (const patternSpecId of G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS) {
    const spec = getG3BU04SemanticPatternDefinition(patternSpecId);
    for (const [contextIndex, contextDomain] of spec.contextDomains.entries()) {
      const question = generate(patternSpecId, {
        seed: "s57e4-family-context",
        sequenceNumber: contextIndex + 1,
        contextDomain
      });
      assert.equal(question.contextDomain, contextDomain);
      assert.equal(question.scenarioId.endsWith(`__${contextDomain}`), true);
      assert.equal(validateG3BU04MultiplicativeGeneratedQuestion(question).ok, true);
      generatedCount += 1;
    }
  }
  assert.equal(generatedCount, 23);
});

test("S57E4 composite ratio families preserve direction, measure dimension, and 倍 answer unit", () => {
  const ratioIds = G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS.filter((patternSpecId) => (
    getG3BU04SemanticPatternDefinition(patternSpecId).knowledgePointId === "kp_g3b_u04_composite_multiplicative_ratio"
  ));
  assert.equal(ratioIds.length, 3);
  const expectedDimensions = new Map([
    ["ps_g3b_u04_ratio_length_ratio_composition", "length"],
    ["ps_g3b_u04_ratio_capacity_ratio_composition", "capacity"],
    ["ps_g3b_u04_ratio_weight_ratio_composition", "weight"]
  ]);
  for (const patternSpecId of ratioIds) {
    for (let sequenceNumber = 1; sequenceNumber <= 40; sequenceNumber += 1) {
      const question = generate(patternSpecId, { seed: "s57e4-ratio", sequenceNumber });
      assert.equal(question.answerUnit, "倍");
      assert.equal(question.measureDimension, expectedDimensions.get(patternSpecId));
      assert.equal(question.quantities.m >= 2 && question.quantities.m <= 9, true);
      assert.equal(question.quantities.n >= 2 && question.quantities.n <= 9, true);
      assert.equal(question.finalAnswer, question.quantities.m * question.quantities.n);
      assert.equal(question.eventSequence.at(-1).action, "compose_multipliers");
    }
  }
});

test("S57E4 age-chain generation always satisfies child, sibling, parent, and ordering safeguards", () => {
  const patternSpecId = "ps_g3b_u04_quantity_chain_age_ratio_chain";
  const seen = new Set();
  for (let sequenceNumber = 1; sequenceNumber <= 200; sequenceNumber += 1) {
    const question = generate(patternSpecId, { seed: "s57e4-age", sequenceNumber, contextDomain: "family_age" });
    const age = question.ageModel;
    assert.ok(age);
    assert.equal(age.childAge, question.quantities.a);
    assert.equal(age.siblingAge, question.quantities.a * question.quantities.m);
    assert.equal(age.parentAge, question.finalAnswer);
    assert.equal(age.childAge >= 6 && age.childAge <= 12, true);
    assert.equal(age.siblingAge >= 10 && age.siblingAge <= 24, true);
    assert.equal(age.parentAge >= 25 && age.parentAge <= 60, true);
    assert.equal(age.childAge < age.siblingAge && age.siblingAge < age.parentAge, true);
    assert.equal(question.answerUnit, "歲");
    assert.equal(validateG3BU04MultiplicativeGeneratedQuestion(question).ok, true);
    seen.add(`${age.childAge}:${question.quantities.m}:${question.quantities.n}`);
  }
  assert.ok(seen.size >= 10);
});

test("S57E4 production-chain generation binds one common time period and positive outputs", () => {
  const patternSpecId = "ps_g3b_u04_quantity_chain_production_capacity_chain";
  for (let sequenceNumber = 1; sequenceNumber <= 160; sequenceNumber += 1) {
    const question = generate(patternSpecId, { seed: "s57e4-production", sequenceNumber });
    assert.deepEqual(question.timePeriodModel, {
      basePeriod: "same_period",
      middlePeriod: "same_period",
      finalPeriod: "same_period",
      label: "每段時間"
    });
    assert.ok(question.promptText.includes("每段時間"));
    assert.equal(question.intermediateResults[0], question.quantities.a * question.quantities.m);
    assert.equal(question.finalAnswer, question.intermediateResults[0] * question.quantities.n);
    assert.ok(question.finalAnswer > 0 && question.finalAnswer <= 10000);
    assert.equal(validateG3BU04MultiplicativeGeneratedQuestion(question).ok, true);
  }
});

test("S57E4 quantity chains preserve final units for personal quantity and price equivalence", () => {
  const personal = generate("ps_g3b_u04_quantity_chain_personal_quantity_ratio_chain", {
    seed: "personal-unit",
    sequenceNumber: 5,
    contextDomain: "pens"
  });
  assert.equal(personal.answerUnit, "支");
  assert.equal(personal.quantityRoleBindings.m.unitLabel, "倍");
  assert.equal(personal.quantityRoleBindings.n.unitLabel, "倍");

  const price = generate("ps_g3b_u04_quantity_chain_price_equivalence_chain", {
    seed: "price-unit",
    sequenceNumber: 5,
    contextDomain: "bakery"
  });
  assert.equal(price.answerUnit, "元");
  assert.equal(price.quantityRoleBindings.a.unitLabel, "元");
  assert.equal(price.finalAnswer, price.quantities.a * price.quantities.m * price.quantities.n);
});

test("S57E4 deterministically replays and varies without changing family identity", () => {
  for (const patternSpecId of G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS) {
    const first = generate(patternSpecId, { seed: "s57e4-determinism", sequenceNumber: 3 });
    const repeated = generate(patternSpecId, { seed: "s57e4-determinism", sequenceNumber: 3 });
    assert.deepEqual(repeated, first);
    const variants = [4, 5, 6, 7].map((sequenceNumber) => generate(patternSpecId, {
      seed: "s57e4-determinism",
      sequenceNumber
    }));
    assert.equal(
      variants.some((question) => question.equationModel !== first.equationModel || question.contextDomain !== first.contextDomain),
      true,
      patternSpecId
    );
    assert.equal(variants.every((question) => question.templateFamilyId === first.templateFamilyId), true);
  }
});

test("S57E4 rejects structural families and unapproved multiplicative contexts", () => {
  for (const patternSpecId of G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS.slice(0, 5)) {
    assert.equal(isG3BU04MultiplicativeSemanticPatternSpecId(patternSpecId), false);
    const result = generateG3BU04MultiplicativeSemanticQuestion({ patternSpecId, seed: "structural-deferred" });
    assert.equal(result.ok, false);
    assert.equal(result.errors[0].code, "G3B_U04_SEM_PATTERN_SPEC_UNREGISTERED");
  }
  const invalidContext = generateG3BU04MultiplicativeSemanticQuestion({
    patternSpecId: "ps_g3b_u04_ratio_length_ratio_composition",
    contextDomain: "family_age",
    seed: "invalid-context"
  });
  assert.equal(invalidContext.ok, false);
  assert.equal(invalidContext.errors[0].code, "G3B_U04_SEM_SCENARIO_PROFILE_UNREGISTERED");
});

test("S57E4 remains hidden, unrouted, unselectable, and outside worksheet production", () => {
  const selectorPath = new URL(
    "../../../site/modules/curriculum/registry/batch-a-selector-g3b-u04-semantic-extension.js",
    import.meta.url
  );
  assert.equal(existsSync(selectorPath), false);
  for (const patternSpecId of G3B_U04_MULTIPLICATIVE_SEMANTIC_PATTERN_SPEC_IDS) {
    const question = generate(patternSpecId, { seed: "hidden-scope", sequenceNumber: 1 });
    assert.equal(question.selectorStatus, "hidden");
    assert.equal(question.generatorRouting, "not_implemented_in_s57e4");
    assert.equal(question.productionUse, "forbidden");
  }
});
