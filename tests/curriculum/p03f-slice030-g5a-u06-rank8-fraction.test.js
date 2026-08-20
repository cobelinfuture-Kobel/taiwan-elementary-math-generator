import test from "node:test";
import assert from "node:assert/strict";

import {
  G5A_U06_P03F30_KP_IDS,
  G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS,
  G5A_U06_P03F30_SOURCE_ID,
  P03F30_REQUIRED_CAPABILITY_IDS,
  auditG5AU06P03F30SelectorProjection,
} from "../../site/modules/curriculum/registry/g5a-u06-rank8-fraction-selector-projection-p03f30.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP03F30PublicSelectorComposition,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f30-extension.js";
import { validateP03F30PatternDefinitions } from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f30-extension.js";
import {
  generateG5AU06P03F30Questions,
  validateG5AU06P03F30Question,
} from "../../site/modules/curriculum/batch-a/g5a-u06-rank8-fraction-runtime-p03f30.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f30-extension.js";
import { getCurrentPixelRegistrySnapshot, getCurrentPixelSourceSummary } from "../../site/pixel/pixel-registry-bridge.js";
import { getBatchASourceUnit, listCurrentFullProductPublicSourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";

const options = {
  sourceId: G5A_U06_P03F30_SOURCE_ID,
  selectionMode: "sourceUnit",
  questionMode: "numeric",
  questionCount: 24,
  generationSeed: "p03f30-core",
  includeAnswerKey: true,
  printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
};

test("P03F30 historical selector remains 30/224 while current inventory advances through Slice045 to 33/246", () => {
  assert.equal(auditG5AU06P03F30SelectorProjection().ok, true);
  assert.equal(auditP03F30PublicSelectorComposition().ok, true);
  assert.equal(validateP03F30PatternDefinitions().ok, true);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5A_U06_P03F30_SOURCE_ID);
  assert.deepEqual([availability.visibleCount, availability.hiddenPendingCount, availability.notSelectableCount], [4, 3, 3]);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount, 30);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount, 30);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 224);
  assert.equal(listCurrentFullProductPublicSourceUnits().length, 33);
  assert.equal(getBatchASourceUnit(G5A_U06_P03F30_SOURCE_ID)?.unitCode, "5A-U06");
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 33);
  assert.equal(pixel.visibleKnowledgePointCount, 246);
  const summary = getCurrentPixelSourceSummary(G5A_U06_P03F30_SOURCE_ID);
  assert.ok(summary);
  assert.equal(summary.visibleKnowledgePoints.length, 5);
  assert.equal(summary.hiddenPendingCount, 2);
});

test("P03F30 runtime emits 24 unique validated witnesses across all four exact numeric specs", () => {
  const generation = generateG5AU06P03F30Questions(options);
  assert.equal(generation.ok, true, JSON.stringify(generation.errors));
  assert.equal(generation.questions.length, 24);
  assert.equal(new Set(generation.questions.map((row) => row.blankedDisplayText)).size, 24);
  assert.deepEqual(new Set(generation.questions.map((row) => row.patternSpecId)), new Set(G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS));
  assert.deepEqual(new Set(generation.questions.map((row) => row.metadata.knowledgePointId)), new Set(G5A_U06_P03F30_KP_IDS));
  assert.ok(generation.questions.some((row) => row.patternSpecId.includes("compare") && row.answerText === "="));
  assert.ok(generation.questions.some((row) => row.resultNumerator > row.resultDenominator));
  for (const question of generation.questions) {
    assert.equal(validateG5AU06P03F30Question(question).ok, true);
    assert.deepEqual(question.metadata.requiredCapabilityIds, P03F30_REQUIRED_CAPABILITY_IDS);
    assert.equal(question.metadata.globalContextAuthorityPath, null);
    assert.equal(question.globalContextProduction, null);
  }
  assert.equal(generation.allocation.length, 4);
  assert.ok(generation.allocation.every((row) => row.questionCount === 6));
});

test("P03F30 single-KP selection resolves only the requested numeric spec", () => {
  const kpId = "kp_g5a_u06_unlike_fraction_add";
  const specId = "ps_g5a_u06_unlike_fraction_add_result_numeric";
  const generation = generateG5AU06P03F30Questions({ ...options, selectionMode:"singleKnowledgePoint", selectedKnowledgePointIds:[kpId], patternSpecIds:[specId], questionCount:8 });
  assert.equal(generation.ok, true, JSON.stringify(generation.errors));
  assert.equal(generation.questions.length, 8);
  assert.deepEqual([...new Set(generation.questions.map((row) => row.patternSpecId))], [specId]);
  assert.ok(generation.questions.every((row) => row.metadata.knowledgePointId === kpId && row.arithmeticOperation === "add"));
});

test("P03F30 validator fails closed on tampered answer and application context", () => {
  const original = generateG5AU06P03F30Questions({ ...options, questionCount:4 }).questions[0];
  const tamperedAnswer = { ...original, answerText:"999/1", finalAnswer:"999/1" };
  assert.equal(validateG5AU06P03F30Question(tamperedAnswer).ok, false);
  const tamperedContext = { ...original, globalContextProduction:{ contextId:"forbidden" } };
  const validation = validateG5AU06P03F30Question(tamperedContext);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => error.code === "p03f30_application_scope_leak"));
});

test("P03F30 shared worksheet produces 24 questions + 24 answers on 3 + 3 pages without parallel pipeline", () => {
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
  result.worksheetDocument.answerKeyItems.forEach((answer, index) => {
    const question = result.worksheetDocument.generatedQuestions[index];
    assert.equal(answer.questionId, question.id);
    assert.equal(answer.answerText, question.answerText);
    assert.equal(answer.knowledgePointId, question.metadata.knowledgePointId);
  });
});