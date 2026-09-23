import test from "node:test";
import assert from "node:assert/strict";

import { createDefaultConfig } from "../../src/core/default-config.js";
import {
  createBinaryNode,
  createGeneratedQuestionSkeleton,
  createValueNode
} from "../../src/core/expression-model.js";
import { createIntegerValue } from "../../src/core/number-value.js";
import {
  assembleWorksheetDocument,
  resolveWorksheetOrdering
} from "../../src/core/worksheet-assembly.js";

function createQuestion({
  id,
  patternId,
  left,
  operator,
  right,
  answer,
  orderLabel
}) {
  return createGeneratedQuestionSkeleton({
    id,
    expression: createBinaryNode(
      operator,
      createValueNode(createIntegerValue(left), 1),
      createValueNode(createIntegerValue(right), 2)
    ),
    operandCount: 2,
    operatorsUsed: [operator],
    finalAnswer: createIntegerValue(answer),
    intermediateResults: [createIntegerValue(answer)],
    blankTarget: { type: "finalAnswer" },
    duplicateKey: `${id}-${orderLabel}`,
    metadata: {
      patternId,
      patternTags: [`tag-${patternId}`],
      skillTags: [`skill-${patternId}`],
      difficultyTags: ["basic"],
      curriculumNodeIds: [`node-${patternId}`],
      canonicalSkillIds: [`canonical-${patternId}`],
      precedenceMode: "standard",
      parenthesesMode: "none"
    }
  });
}

function createInput(overrides = {}) {
  const config = createDefaultConfig();
  config.generation.questionCount = 4;
  config.printLayout.columns = overrides.columns ?? 2;
  config.printLayout.rowsPerPage = overrides.rowsPerPage ?? 1;
  config.printLayout.showAnswerKeyPage = overrides.showAnswerKeyPage ?? true;
  config.patternPlan.worksheetOrdering.mode = overrides.orderingMode ?? "groupedByPattern";
  config.patternPlan.worksheetOrdering.stablePatternOrder = overrides.stablePatternOrder ?? ["pattern_b", "pattern_a"];

  const generatedQuestions = overrides.generatedQuestions ?? [
    createQuestion({ id: "q1", patternId: "pattern_a", left: 8, operator: "+", right: 5, answer: 13, orderLabel: "a1" }),
    createQuestion({ id: "q2", patternId: "pattern_c", left: 9, operator: "-", right: 2, answer: 7, orderLabel: "c1" }),
    createQuestion({ id: "q3", patternId: "pattern_b", left: 3, operator: "+", right: 4, answer: 7, orderLabel: "b1" }),
    createQuestion({ id: "q4", patternId: "pattern_a", left: 6, operator: "+", right: 1, answer: 7, orderLabel: "a2" })
  ];

  return {
    configSnapshot: config,
    allocationResult: [
      { patternId: "pattern_a", questionCount: 2 },
      { patternId: "pattern_b", questionCount: 1 },
      { patternId: "pattern_c", questionCount: 1 }
    ],
    generatedQuestions,
    generationReport: { requestedQuestionCount: generatedQuestions.length },
    generationSeed: overrides.generationSeed ?? "gen-seed",
    orderingSeed: overrides.orderingSeed
  };
}

test("question count preserved from generatedQuestions to display models", () => {
  const document = assembleWorksheetDocument(createInput());
  assert.equal(document.generatedQuestions.length, document.questionDisplayModels.length);
});

test("orderedQuestionIds resolve exactly to source questions", () => {
  const input = createInput();
  const document = assembleWorksheetDocument(input);
  const sourceIds = input.generatedQuestions.map((question) => question.id).sort();
  const orderedIds = [...document.orderedQuestionIds].sort();

  assert.deepEqual(orderedIds, sourceIds);
});

test("question numbering starts at 1 and is gap-free", () => {
  const document = assembleWorksheetDocument(createInput());
  assert.deepEqual(
    document.questionDisplayModels.map((item) => item.questionNumber),
    [1, 2, 3, 4]
  );
});

test("groupedByPattern respects stablePatternOrder", () => {
  const ordered = resolveWorksheetOrdering(createInput());
  assert.deepEqual(ordered.map((question) => question.id), ["q3", "q1", "q4", "q2"]);
});

test("groupedByPattern appends unknown patterns in first-seen order", () => {
  const input = createInput({
    generatedQuestions: [
      createQuestion({ id: "q1", patternId: "pattern_x", left: 1, operator: "+", right: 1, answer: 2, orderLabel: "x1" }),
      createQuestion({ id: "q2", patternId: "pattern_y", left: 2, operator: "+", right: 2, answer: 4, orderLabel: "y1" }),
      createQuestion({ id: "q3", patternId: "pattern_a", left: 3, operator: "+", right: 3, answer: 6, orderLabel: "a1" }),
      createQuestion({ id: "q4", patternId: "pattern_x", left: 4, operator: "+", right: 4, answer: 8, orderLabel: "x2" })
    ],
    stablePatternOrder: ["pattern_a"]
  });

  const ordered = resolveWorksheetOrdering(input);
  assert.deepEqual(ordered.map((question) => question.id), ["q3", "q1", "q4", "q2"]);
});

test("shuffledAcrossPatterns is deterministic with orderingSeed", () => {
  const input = createInput({
    orderingMode: "shuffleAcrossPatterns",
    orderingSeed: "ordering-seed"
  });

  const first = assembleWorksheetDocument(input);
  const second = assembleWorksheetDocument(input);

  assert.deepEqual(first.orderedQuestionIds, second.orderedQuestionIds);
});

test("orderingSeed null falls back to generationSeed", () => {
  const input = createInput({
    orderingMode: "shuffleAcrossPatterns",
    generationSeed: "fallback-seed",
    orderingSeed: null
  });

  const first = assembleWorksheetDocument(input);
  const second = assembleWorksheetDocument(input);

  assert.deepEqual(first.orderedQuestionIds, second.orderedQuestionIds);
  assert.equal(first.generationContext.resolvedOrderingSeed, "fallback-seed");
});

test("GeneratedQuestion objects remain unchanged after assembly", () => {
  const input = createInput();
  const before = JSON.parse(JSON.stringify(input.generatedQuestions));

  assembleWorksheetDocument(input);

  assert.deepEqual(input.generatedQuestions, before);
});

test("metadataSnapshot survives unchanged and is deep-copied in assembled document", () => {
  const input = createInput();
  const document = assembleWorksheetDocument(input);

  assert.deepEqual(document.questionDisplayModels[0].metadataSnapshot, {
    patternId: "pattern_b",
    patternTags: ["tag-pattern_b"],
    skillTags: ["skill-pattern_b"],
    difficultyTags: ["basic"],
    curriculumNodeIds: ["node-pattern_b"],
    canonicalSkillIds: ["canonical-pattern_b"],
    precedenceMode: "standard",
    parenthesesMode: "none",
    blankTarget: { type: "finalAnswer" },
    duplicateKey: "q3-b1"
  });
  assert.notEqual(
    document.questionDisplayModels[0].metadataSnapshot.patternTags,
    input.generatedQuestions[2].metadata.patternTags
  );
});

test("document summary and report are assembled", () => {
  const input = createInput();
  const document = assembleWorksheetDocument(input);

  assert.equal(document.summary.questionCount, 4);
  assert.deepEqual(document.summary.patternIdsInRenderOrder, ["pattern_b", "pattern_a", "pattern_c"]);
  assert.deepEqual(document.report, { requestedQuestionCount: 4 });
});
