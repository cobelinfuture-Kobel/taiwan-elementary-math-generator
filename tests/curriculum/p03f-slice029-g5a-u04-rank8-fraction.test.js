import test from "node:test";
import assert from "node:assert/strict";

import {
  G5A_U04_P03F29_GROUP_ID,
  G5A_U04_P03F29_KP_ID,
  G5A_U04_P03F29_SPEC_ID,
  G5A_U04_P03F29_HIDDEN_APPLICATION_SPEC_ID,
  P03F29_REQUIRED_CAPABILITY_IDS,
  auditG5AU04P03F29SelectorProjection,
} from "../../site/modules/curriculum/registry/g5a-u04-rank8-fraction-selector-projection-p03f29.js";
import {
  auditP03F29PublicSelectorComposition,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f29-extension.js";
import { validateP03F29PatternDefinitions } from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f29-extension.js";
import {
  generateG5AU04P03F29Questions,
  validateG5AU04P03F29Question,
} from "../../site/modules/curriculum/batch-a/g5a-u04-rank8-fraction-runtime-p03f29.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f29-extension.js";
import { getCurrentPixelSourceSummary } from "../../site/pixel/pixel-registry-bridge.js";

const options = {
  sourceId: "g5a_u04_5a04",
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G5A_U04_P03F29_KP_ID],
  selectedPatternGroupIds: [G5A_U04_P03F29_GROUP_ID],
  patternSpecIds: [G5A_U04_P03F29_SPEC_ID],
  questionMode: "numeric",
  questionCount: 24,
  generationSeed: "p03f29-core",
  includeAnswerKey: true,
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
};

test("P03F29 selector adds one numeric comparison surface without application leakage", () => {
  assert.equal(auditG5AU04P03F29SelectorProjection().ok, true);
  assert.equal(auditP03F29PublicSelectorComposition().ok, true);
  const availability = listBatchAKnowledgePointAvailabilityBySource("g5a_u04_5a04");
  assert.equal(availability.visibleCount, 5);
  assert.equal(availability.hiddenPendingCount, 2);
  assert.equal(availability.notSelectableCount, 2);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G5A_U04_P03F29_KP_ID), [G5A_U04_P03F29_SPEC_ID]);
  const groups = getVisiblePatternGroupsForKnowledgePoint(G5A_U04_P03F29_KP_ID);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].patternGroupId, G5A_U04_P03F29_GROUP_ID);
  assert.equal(groups[0].publicQuestionMode, "numeric");
  assert.equal(groups[0].patternSpecIds.includes(G5A_U04_P03F29_HIDDEN_APPLICATION_SPEC_ID), false);
  assert.equal(validateP03F29PatternDefinitions().ok, true);
});

test("P03F29 exact runtime emits 24 unique validated < = > witnesses", () => {
  const generation = generateG5AU04P03F29Questions(options);
  assert.equal(generation.ok, true, JSON.stringify(generation.errors));
  assert.equal(generation.questions.length, 24);
  assert.equal(new Set(generation.questions.map((row) => row.blankedDisplayText)).size, 24);
  assert.deepEqual([...new Set(generation.questions.map((row) => row.answerText))].sort(), ["<", "=", ">"]);
  assert.ok(generation.questions.some((row) => row.leftNumerator > row.leftDenominator || row.rightNumerator > row.rightDenominator));
  for (const question of generation.questions) {
    assert.equal(validateG5AU04P03F29Question(question).ok, true);
    assert.deepEqual(question.metadata.requiredCapabilityIds, P03F29_REQUIRED_CAPABILITY_IDS);
    assert.equal(question.metadata.applicationClassification, "APPLICATION_COMPATIBLE");
    assert.equal(question.metadata.globalContextAuthorityPath, null);
    assert.equal(question.globalContextProduction, null);
  }
});

test("P03F29 validator fails closed on tampered comparison and application context", () => {
  const generation = generateG5AU04P03F29Questions({ ...options, questionCount: 1 });
  const original = generation.questions[0];
  const badAnswer = original.answerText === "<" ? ">" : "<";
  const tamperedAnswer = { ...original, answerText: badAnswer, finalAnswer: badAnswer, comparison: badAnswer };
  const answerValidation = validateG5AU04P03F29Question(tamperedAnswer);
  assert.equal(answerValidation.ok, false);
  assert.ok(answerValidation.errors.some((error) => error.code === "p03f29_compare_answer_invalid"));
  const tamperedContext = { ...original, globalContextProduction: { contextId: "forbidden" } };
  const contextValidation = validateG5AU04P03F29Question(tamperedContext);
  assert.equal(contextValidation.ok, false);
  assert.ok(contextValidation.errors.some((error) => error.code === "p03f29_application_scope_leak"));
});

test("P03F29 shared worksheet and answer key preserve exact cross-layer lineage", () => {
  const result = buildBatchABrowserWorksheetDocument(options);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 24);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 24);
  assert.equal(result.worksheetDocument.questionPages.length, 3);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 3);
  assert.equal(result.worksheetDocument.metadata.applicationExpansion, false);
  assert.equal(result.worksheetDocument.metadata.hiddenApplicationLineagePreserved, true);
  assert.equal(result.worksheetDocument.metadata.worksheetAdapter.sharedPagination, true);
  assert.equal(result.worksheetDocument.metadata.worksheetAdapter.sharedRenderer, true);
  assert.equal(result.worksheetDocument.metadata.worksheetAdapter.parallelPipeline, false);
  assert.equal(result.generation.allocation.length, 1);
  assert.equal(result.generation.allocation[0].questionCount, 24);
  result.worksheetDocument.answerKeyItems.forEach((answer, index) => {
    const question = result.worksheetDocument.generatedQuestions[index];
    assert.equal(answer.questionId, question.id);
    assert.equal(answer.patternId, question.patternSpecId);
    assert.equal(answer.knowledgePointId, question.metadata.knowledgePointId);
    assert.equal(answer.patternGroupId, question.metadata.patternGroupId);
    assert.equal(answer.answerText, question.answerText);
  });
});

test("P03F29 Pixel current surface exposes five G5A-U04 KPs with target visible", () => {
  const summary = getCurrentPixelSourceSummary("g5a_u04_5a04");
  assert.ok(summary);
  assert.equal(summary.visibleKnowledgePoints.length, 5);
  assert.ok(summary.visibleKnowledgePoints.some((row) => row.knowledgePointId === G5A_U04_P03F29_KP_ID));
  assert.equal(summary.hiddenPendingCount, 2);
});
