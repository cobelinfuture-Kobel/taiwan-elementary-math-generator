import test from "node:test";
import assert from "node:assert/strict";

import {
  createBinaryNode,
  createGeneratedQuestionSkeleton,
  createValueNode
} from "../../src/core/expression-model.js";
import { createIntegerValue } from "../../src/core/number-value.js";
import {
  createAnswerKeyItem,
  createQuestionDisplayModel,
  formatAnswerText,
  formatQuestionDisplayText
} from "../../src/core/worksheet-formatting.js";

function createQuestion(overrides = {}) {
  return createGeneratedQuestionSkeleton({
    id: overrides.id ?? "q1",
    expression: overrides.expression ?? createBinaryNode(
      "+",
      createValueNode(createIntegerValue(8), 1),
      createValueNode(createIntegerValue(5), 2)
    ),
    operandCount: overrides.operandCount ?? 2,
    operatorsUsed: overrides.operatorsUsed ?? ["+"],
    finalAnswer: overrides.finalAnswer ?? createIntegerValue(13),
    intermediateResults: overrides.intermediateResults ?? [createIntegerValue(13)],
    blankTarget: overrides.blankTarget ?? { type: "finalAnswer" },
    duplicateKey: overrides.duplicateKey ?? "(8+5)",
    metadata: {
      patternId: overrides.patternId ?? "pattern_a",
      patternTags: overrides.patternTags ?? ["tag-a"],
      skillTags: overrides.skillTags ?? ["skill-a"],
      difficultyTags: overrides.difficultyTags ?? ["easy"],
      curriculumNodeIds: overrides.curriculumNodeIds ?? ["node-a"],
      canonicalSkillIds: overrides.canonicalSkillIds ?? ["canonical-a"],
      precedenceMode: overrides.precedenceMode ?? "standard",
      parenthesesMode: overrides.parenthesesMode ?? "none"
    }
  });
}

test("displayText is derived from expression", () => {
  const question = createQuestion();
  const result = formatQuestionDisplayText(question);

  assert.equal(result.displayText, "8 + 5 = 13");
});

test("blankedDisplayText is derived from displayText plus blankTarget", () => {
  const question = createQuestion();
  const displayModel = createQuestionDisplayModel(question, 1);

  assert.equal(displayModel.displayText, "8 + 5 = 13");
  assert.equal(displayModel.blankedDisplayText, "8 + 5 = ___");
});

test("answerText is derived from finalAnswer", () => {
  const answerText = formatAnswerText(createIntegerValue(42));
  assert.equal(answerText, "42");
});

test("metadataSnapshot survives unchanged and is deep-copied", () => {
  const question = createQuestion();
  const displayModel = createQuestionDisplayModel(question, 1);
  const answerKeyItem = createAnswerKeyItem(question, displayModel);

  assert.deepEqual(displayModel.metadataSnapshot, {
    patternId: "pattern_a",
    patternTags: ["tag-a"],
    skillTags: ["skill-a"],
    difficultyTags: ["easy"],
    curriculumNodeIds: ["node-a"],
    canonicalSkillIds: ["canonical-a"],
    precedenceMode: "standard",
    parenthesesMode: "none",
    blankTarget: { type: "finalAnswer" },
    duplicateKey: "(8+5)"
  });
  assert.notEqual(displayModel.metadataSnapshot.patternTags, question.metadata.patternTags);
  assert.notEqual(displayModel.metadataSnapshot.blankTarget, question.blankTarget);
  assert.notEqual(answerKeyItem.metadataSnapshot.skillTags, question.metadata.skillTags);
});

test("nested expression formatting preserves authoritative tree structure", () => {
  const question = createQuestion({
    expression: createBinaryNode(
      "-",
      createBinaryNode(
        "+",
        createValueNode(createIntegerValue(8), 1),
        createValueNode(createIntegerValue(5), 2)
      ),
      createValueNode(createIntegerValue(4), 3)
    ),
    operandCount: 3,
    operatorsUsed: ["-", "+"],
    finalAnswer: createIntegerValue(9),
    intermediateResults: [createIntegerValue(13), createIntegerValue(9)],
    duplicateKey: "((8+5)-4)"
  });

  const displayModel = createQuestionDisplayModel(question, 2);
  assert.equal(displayModel.displayText, "(8 + 5) - 4 = 9");
  assert.equal(displayModel.blankedDisplayText, "(8 + 5) - 4 = ___");
});
