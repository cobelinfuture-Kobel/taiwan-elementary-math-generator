import test from "node:test";
import assert from "node:assert/strict";

import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s76j-entry.js";
import { validateG4AU08AllCanonicalPublicQuestion } from "../../site/modules/curriculum/batch-a/g4a-u08-all-canonical-public-router.js";
import { validateG4AU08PublicQuestionArithmetic } from "../../site/modules/curriculum/batch-a/g4a-u08-public-arithmetic-validator.js";
import {
  G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE,
  getG4AU08FullSourceProductionProjection,
  validateG4AU08FullSourceProductionProjection,
} from "../../site/modules/curriculum/registry/g4a-u08-full-source-production-promotion.js";

const SOURCE_ID = "g4a_u08_4a08";
const GROUPS = G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS;
const KP_IDS = [...new Set(GROUPS.map((row) => row.primaryKnowledgePointId))];
const GROUP_IDS = GROUPS.map((row) => row.patternGroupId);
const SPEC_IDS = [...new Set(GROUPS.flatMap((row) => row.patternSpecIds))];

function options(questionCount, overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...KP_IDS],
    selectedPatternGroupIds: [...GROUP_IDS],
    questionMode: "mixed",
    questionCount,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `s76r-full-source-${questionCount}`,
    title: "四上整數四則全知識點",
    ...overrides,
  };
}

function publicSnapshot(result) {
  return result.questions.map((question) => ({
    id: question.id,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    patternSpecId: question.patternSpecId,
    promptText: question.promptText,
    finalAnswer: question.finalAnswer,
    answerText: question.answerText,
  }));
}

test("S76R full-source promotion contract exposes 15 KP, 28 PatternGroups and 33 PatternSpecs", () => {
  const validation = validateG4AU08FullSourceProductionProjection();
  assert.equal(validation.ok, true, validation.errors.join(","));
  const projection = getG4AU08FullSourceProductionProjection();
  assert.equal(projection.knowledgePointIds.length, 15);
  assert.equal(projection.patternGroupIds.length, 28);
  assert.equal(projection.patternSpecIds.length, 33);
  assert.equal(projection.lifecycle.distance.startsWith("D1"), true);
  assert.notEqual(projection.lifecycle.productionUse, "allowed");
  assert.equal(listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID).visibleCount, 15);
  assert.equal(listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID).length, 15);
});

test("S76R accepted count matrix produces exact blocking-validated output", () => {
  for (const questionCount of G4A_U08_FULL_SOURCE_STRESS_ACCEPTANCE.publicCountMatrix) {
    const result = generateBatchABrowserQuestions(options(questionCount));
    assert.equal(result.ok, true, `${questionCount}:${JSON.stringify(result.errors)}`);
    assert.equal(result.questions.length, questionCount, String(questionCount));
    assert.equal(result.allocation.reduce((sum, row) => sum + row.questionCount, 0), questionCount);
    for (const question of result.questions) {
      assert.equal(validateG4AU08AllCanonicalPublicQuestion(question).ok, true, question.id);
      assert.equal(validateG4AU08PublicQuestionArithmetic(question).ok, true, question.id);
    }
  }
});

test("S76R rejects 1001 questions with zero canonical output", () => {
  const result = generateBatchABrowserQuestions(options(1001));
  assert.equal(result.ok, false);
  assert.deepEqual(result.questions, []);
  assert.ok(result.errors.some((entry) => entry.code === "G4A_U08_S76Q_COUNT_INVALID"));
});

test("S76R 112-question matrix reaches all 15 KP, 28 groups and 33 PatternSpecs", () => {
  const result = generateBatchABrowserQuestions(options(112));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 112);
  assert.deepEqual(new Set(result.questions.map((row) => row.knowledgePointId)), new Set(KP_IDS));
  assert.deepEqual(new Set(result.questions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId)), new Set(GROUP_IDS));
  assert.deepEqual(new Set(result.questions.map((row) => row.patternSpecId)), new Set(SPEC_IDS));
  assert.equal(result.questions.every((row) => row.productionUse === "preview_only_pending_s76r"), true);
  assert.equal(result.questions.every((row) => row.worksheetReachability === "enabled"), true);
});

test("S76R rejects arithmetic and canonical identity mutations for all 28 groups", () => {
  let arithmeticMutationRejectCount = 0;
  let identityMutationRejectCount = 0;
  for (const group of GROUPS) {
    const result = generateBatchABrowserQuestions({
      sourceId: SOURCE_ID,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [group.primaryKnowledgePointId],
      selectedPatternGroupIds: [group.patternGroupId],
      questionMode: group.mode,
      questionCount: 1,
      ordering: "groupedByPattern",
      includeAnswerKey: true,
      generationSeed: `s76r-mutation-${group.patternGroupId}`,
    });
    assert.equal(result.ok, true, `${group.patternGroupId}:${JSON.stringify(result.errors)}`);
    const original = result.questions[0];
    assert.equal(validateG4AU08PublicQuestionArithmetic(original).ok, true, group.patternGroupId);

    const arithmeticMutation = structuredClone(original);
    arithmeticMutation.finalAnswer += 1;
    arithmeticMutation.structuredAnswer = arithmeticMutation.structuredAnswer
      ? { ...arithmeticMutation.structuredAnswer, value: arithmeticMutation.finalAnswer }
      : arithmeticMutation.structuredAnswer;
    arithmeticMutation.answerText = String(arithmeticMutation.finalAnswer);
    if (!validateG4AU08PublicQuestionArithmetic(arithmeticMutation).ok) arithmeticMutationRejectCount += 1;

    const identityMutation = structuredClone(original);
    identityMutation.resolvedPatternGroupId = "pg_g4a_u08_unregistered_mutation";
    if (!validateG4AU08AllCanonicalPublicQuestion(identityMutation).ok) identityMutationRejectCount += 1;
  }
  assert.equal(arithmeticMutationRejectCount, 28);
  assert.equal(identityMutationRejectCount, 28);
});

test("S76R full-source worksheet preserves 112 questions, answers and complete canonical coverage", () => {
  const result = buildBatchABrowserWorksheetDocument(options(112));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.generatedQuestions.length, 112);
  assert.equal(document.questionDisplayModels.length, 112);
  assert.equal(document.answerKeyItems.length, 112);
  assert.equal(document.summary.questionCount, 112);
  assert.equal(document.rendererBehaviorChanged, false);
  assert.deepEqual(new Set(document.generatedQuestions.map((row) => row.knowledgePointId)), new Set(KP_IDS));
  assert.deepEqual(new Set(document.generatedQuestions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId)), new Set(GROUP_IDS));
  assert.deepEqual(new Set(document.generatedQuestions.map((row) => row.patternSpecId)), new Set(SPEC_IDS));

  const withoutAnswerKey = buildBatchABrowserWorksheetDocument(options(112, { includeAnswerKey: false }));
  assert.equal(withoutAnswerKey.ok, true, JSON.stringify(withoutAnswerKey.errors));
  assert.equal(withoutAnswerKey.worksheetDocument.generatedQuestions.length, 112);
  assert.equal(withoutAnswerKey.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(withoutAnswerKey.worksheetDocument.answerKeyPages.length, 0);
});

test("S76R deterministic replay preserves public prompts, identities and answers", () => {
  const replayOptions = options(112, { generationSeed: "s76r-deterministic-replay" });
  const first = generateBatchABrowserQuestions(replayOptions);
  const second = generateBatchABrowserQuestions(replayOptions);
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.equal(second.ok, true, JSON.stringify(second.errors));
  assert.deepEqual(publicSnapshot(first), publicSnapshot(second));
});
