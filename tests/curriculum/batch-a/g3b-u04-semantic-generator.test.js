import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";

import {
  G3B_U04_STRUCTURAL_SEMANTIC_KNOWLEDGE_POINT_IDS,
  G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS,
  generateG3BU04StructuralSemanticQuestion,
  isG3BU04StructuralSemanticPatternSpecId,
  validateG3BU04StructuralGeneratedQuestion
} from "../../../site/modules/curriculum/batch-a/g3b-u04-semantic-generator.js";
import {
  getG3BU04SemanticPatternDefinition,
  listG3BU04SemanticPatternDefinitions
} from "../../../site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js";

function expectedAnswer(question) {
  const q = question.quantities;
  const shape = getG3BU04SemanticPatternDefinition(question.patternSpecId).equationShape;
  if (shape === "(a+b)/c") return (q.a + q.b) / q.c;
  if (shape === "(p*q)/r") return (q.p * q.q) / q.r;
  if (shape === "(p*q)/(q+g)") return (q.p * q.q) / (q.q + q.g);
  if (shape === "(a-b)/c") return (q.a - q.b) / q.c;
  if (shape === "a/b+c") return q.a / q.b + q.c;
  if (shape === "a-(b/c)") return q.a - q.b / q.c;
  if (shape === "(a/b)-c") return q.a / q.b - q.c;
  if (shape === "a*b*c") return q.a * q.b * q.c;
  return null;
}

function generate(patternSpecId, options = {}) {
  const result = generateG3BU04StructuralSemanticQuestion({
    patternSpecId,
    seed: options.seed ?? "s57e3-positive",
    sequenceNumber: options.sequenceNumber ?? 1,
    contextDomain: options.contextDomain
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.ok(result.question);
  return result.question;
}

test("S57E3 exposes exactly 25 structural families across seven non-relation KnowledgePoints", () => {
  assert.equal(G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS.length, 25);
  assert.equal(new Set(G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS).size, 25);
  assert.equal(G3B_U04_STRUCTURAL_SEMANTIC_KNOWLEDGE_POINT_IDS.length, 7);
  const definitions = G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS.map(getG3BU04SemanticPatternDefinition);
  assert.equal(definitions.every(Boolean), true);
  assert.deepEqual(
    new Set(definitions.map((definition) => definition.knowledgePointId)),
    new Set(G3B_U04_STRUCTURAL_SEMANTIC_KNOWLEDGE_POINT_IDS)
  );
  assert.equal(definitions.some((definition) => definition.knowledgePointId === "kp_g3b_u04_composite_multiplicative_ratio"), false);
  assert.equal(definitions.some((definition) => definition.knowledgePointId === "kp_g3b_u04_multiplicative_quantity_chain"), false);
});

test("S57E3 generates one deterministic positive item for each of 25 structural families", () => {
  for (const [index, patternSpecId] of G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS.entries()) {
    const question = generate(patternSpecId, { sequenceNumber: index + 1 });
    const spec = getG3BU04SemanticPatternDefinition(patternSpecId);
    assert.equal(question.patternSpecId, patternSpecId);
    assert.equal(question.templateFamilyId, spec.templateFamilyId);
    assert.equal(question.knowledgePointId, spec.knowledgePointId);
    assert.equal(question.kind, "g3bU04SemanticWordProblem");
    assert.equal(question.phase, "S57E3");
    assert.equal(question.finalAnswer, expectedAnswer(question));
    assert.equal(Number.isInteger(question.finalAnswer), true);
    assert.ok(question.finalAnswer > 0 && question.finalAnswer <= 10000);
    assert.equal(question.answerText, `${question.finalAnswer}${question.answerUnit}`);
    assert.equal(question.blankedDisplayText, question.promptText);
    assert.equal(/\{[^}]+\}/.test(question.promptText), false);
    assert.ok(Array.isArray(question.eventSequence) && question.eventSequence.length >= 2);
    assert.equal(question.semanticSnapshot.templateFamilyId, spec.templateFamilyId);
    assert.equal(question.semanticSnapshot.equationShape, spec.equationShape);
    assert.deepEqual(question.semanticSnapshot.eventSequence, question.eventSequence);
    assert.equal(validateG3BU04StructuralGeneratedQuestion(question).ok, true);
  }
});

test("S57E3 resolves and generates all 94 approved structural family-context combinations", () => {
  let generatedCount = 0;
  for (const patternSpecId of G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS) {
    const spec = getG3BU04SemanticPatternDefinition(patternSpecId);
    for (const [contextIndex, contextDomain] of spec.contextDomains.entries()) {
      const question = generate(patternSpecId, {
        seed: "s57e3-family-context",
        sequenceNumber: contextIndex + 1,
        contextDomain
      });
      assert.equal(question.contextDomain, contextDomain);
      assert.equal(question.scenarioId.endsWith(`__${contextDomain}`), true);
      assert.equal(validateG3BU04StructuralGeneratedQuestion(question).ok, true);
      generatedCount += 1;
    }
  }
  assert.equal(generatedCount, 94);
});

test("S57E3 renders every numeric semantic role into the student-readable prompt", () => {
  for (const patternSpecId of G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS) {
    const spec = getG3BU04SemanticPatternDefinition(patternSpecId);
    const question = generate(patternSpecId, { seed: "s57e3-role-readback", sequenceNumber: 7 });
    for (const symbol of Object.keys(spec.quantityRoles)) {
      assert.equal(
        question.promptText.includes(String(question.quantities[symbol])),
        true,
        `${patternSpecId} omitted numeric role ${symbol} from prompt: ${question.promptText}`
      );
      const binding = question.quantityRoleBindings[symbol];
      assert.equal(binding.semanticRole, spec.quantityRoles[symbol]);
      assert.equal(binding.value, question.quantities[symbol]);
      assert.equal(typeof binding.unitDimension, "string");
    }
  }
});

test("S57E3 explicitly repairs the one approved skeleton that omitted its two price roles", () => {
  const patternSpecId = "ps_g3b_u04_add_divide_joint_purchase_equal_share";
  const question = generate(patternSpecId, { seed: "joint-purchase-role-prefix", sequenceNumber: 1, contextDomain: "food" });
  assert.ok(question.promptText.startsWith("三明治費用"));
  assert.ok(question.promptText.includes(`費用${question.quantities.a}元`));
  assert.ok(question.promptText.includes(`費用${question.quantities.b}元`));
  assert.ok(question.promptText.includes(`${question.quantities.c}人合買`));
});

test("S57E3 is deterministic for the same seed and varies quantities or context across sequence seeds", () => {
  for (const patternSpecId of G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS) {
    const first = generate(patternSpecId, { seed: "s57e3-determinism", sequenceNumber: 3 });
    const repeated = generate(patternSpecId, { seed: "s57e3-determinism", sequenceNumber: 3 });
    assert.deepEqual(repeated, first);
    const variants = [4, 5, 6].map((sequenceNumber) => generate(patternSpecId, {
      seed: "s57e3-determinism",
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

test("S57E3 bounded generation produces valid structural output across repeated seeds", () => {
  let generatedCount = 0;
  for (const patternSpecId of G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS) {
    for (let sequenceNumber = 1; sequenceNumber <= 12; sequenceNumber += 1) {
      const question = generate(patternSpecId, { seed: "s57e3-repeat", sequenceNumber });
      assert.equal(validateG3BU04StructuralGeneratedQuestion(question).ok, true);
      assert.equal(question.finalAnswer, expectedAnswer(question));
      assert.equal(question.intermediateResults.every((value) => Number.isInteger(value) && value > 0 && value <= 10000), true);
      generatedCount += 1;
    }
  }
  assert.equal(generatedCount, 300);
});

test("S57E3 rejects unapproved contexts and defers both multiplicative-relation KnowledgePoints", () => {
  const structuralId = G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS[0];
  const wrongContext = generateG3BU04StructuralSemanticQuestion({
    patternSpecId: structuralId,
    contextDomain: "family_age",
    seed: "invalid-context"
  });
  assert.equal(wrongContext.ok, false);
  assert.equal(wrongContext.errors[0].code, "G3B_U04_SEM_SCENARIO_PROFILE_UNREGISTERED");

  const deferredIds = listG3BU04SemanticPatternDefinitions()
    .filter((definition) => [
      "kp_g3b_u04_composite_multiplicative_ratio",
      "kp_g3b_u04_multiplicative_quantity_chain"
    ].includes(definition.knowledgePointId))
    .map((definition) => definition.patternSpecId);
  assert.equal(deferredIds.length, 7);
  for (const patternSpecId of deferredIds) {
    assert.equal(isG3BU04StructuralSemanticPatternSpecId(patternSpecId), false);
    const result = generateG3BU04StructuralSemanticQuestion({ patternSpecId, seed: "deferred" });
    assert.equal(result.ok, false);
    assert.equal(result.errors[0].code, "G3B_U04_SEM_PATTERN_SPEC_UNREGISTERED");
  }
});

test("S57E3 remains hidden, unrouted, unselectable, and outside worksheet production", () => {
  const selectorPath = new URL(
    "../../../site/modules/curriculum/registry/batch-a-selector-g3b-u04-semantic-extension.js",
    import.meta.url
  );
  assert.equal(existsSync(selectorPath), false);
  for (const patternSpecId of G3B_U04_STRUCTURAL_SEMANTIC_PATTERN_SPEC_IDS) {
    const question = generate(patternSpecId, { seed: "hidden-scope", sequenceNumber: 1 });
    assert.equal(question.selectorStatus, "hidden");
    assert.equal(question.generatorRouting, "not_implemented_in_s57e3");
    assert.equal(question.productionUse, "forbidden");
  }
});
