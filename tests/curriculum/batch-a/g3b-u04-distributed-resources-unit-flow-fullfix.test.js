import test from "node:test";
import assert from "node:assert/strict";

import {
  generateG3BU04StructuralSemanticQuestion
} from "../../../site/modules/curriculum/batch-a/g3b-u04-semantic-generator.js";
import {
  G3B_U04_DISTRIBUTED_RESOURCES_PATTERN_SPEC_ID,
  validateG3BU04SemanticQuestion
} from "../../../site/modules/curriculum/batch-a/g3b-u04-semantic-validator-unit-flow-fullfix.js";
import {
  G3B_U04_HIDDEN_SEMANTIC_MODE,
  generateG3BU04HiddenSemanticQuestions
} from "../../../site/modules/curriculum/batch-a/g3b-u04-semantic-question-generator.js";

const CONTEXTS = Object.freeze(["classroom", "library", "sports", "technology"]);

function generate(contextDomain, sequenceNumber = 1) {
  const result = generateG3BU04StructuralSemanticQuestion({
    patternSpecId: G3B_U04_DISTRIBUTED_RESOURCES_PATTERN_SPEC_ID,
    contextDomain,
    sequenceNumber,
    seed: `s57e7r1:${contextDomain}:${sequenceNumber}`
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  return result.question;
}

test("S57E7R1 accepts the registered distributed-resource unit flow in all four contexts", () => {
  for (const [index, contextDomain] of CONTEXTS.entries()) {
    const question = generate(contextDomain, index + 1);
    assert.equal(question.quantityRoleBindings.a.unitDimension, "count");
    assert.equal(question.quantityRoleBindings.b.unitDimension, "count");
    assert.equal(question.quantityRoleBindings.c.unitDimension, "count");
    assert.equal(question.quantityRoleBindings.a.unitLabel, question.answerUnit);
    assert.equal(question.quantityRoleBindings.c.unitLabel, question.answerUnit);

    const validation = validateG3BU04SemanticQuestion(question);
    assert.equal(validation.ok, true, `${contextDomain}: ${JSON.stringify(validation.errors)}`);
    assert.equal(
      validation.errors.some((error) => error.code === "G3B_U04_SEM_UNIT_FLOW_MISMATCH"),
      false
    );
    const unitStage = validation.stages.find((stage) => stage.stage === "unit_flow");
    assert.equal(unitStage?.ok, true);
    assert.deepEqual(unitStage?.errorCodes, []);
  }
});

test("S57E7R1 does not suppress a real distributed-resource unit mismatch", () => {
  const question = structuredClone(generate("classroom", 11));
  question.quantityRoleBindings.c.unitDimension = "currency";
  question.semanticSnapshot.quantityRoleBindings.c.unitDimension = "currency";

  const validation = validateG3BU04SemanticQuestion(question);
  assert.equal(validation.ok, false);
  assert.equal(
    validation.errors.some((error) => error.code === "G3B_U04_SEM_UNIT_FLOW_MISMATCH"),
    true,
    JSON.stringify(validation.errors)
  );
});

test("S57E7R1 aggregate regression passes the complete family route at boundary and stress counts", () => {
  for (const questionCount of [32, 257, 640, 1000]) {
    const result = generateG3BU04HiddenSemanticQuestions({
      sourceId: "g3b_u04_3b04",
      hiddenSemanticMode: G3B_U04_HIDDEN_SEMANTIC_MODE,
      questionCount,
      generationSeed: `s57e7r1-regression-${questionCount}`,
      ordering: "shuffleAcrossPatterns",
      includeAnswerKey: true
    });
    assert.equal(result.ok, true, `${questionCount}: ${JSON.stringify(result.errors)}`);
    assert.equal(result.questions.length, questionCount);
    assert.equal(result.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), questionCount);
    assert.equal(
      result.errors.some((error) => error.code === "G3B_U04_SEM_UNIT_FLOW_MISMATCH"),
      false
    );
  }
});
