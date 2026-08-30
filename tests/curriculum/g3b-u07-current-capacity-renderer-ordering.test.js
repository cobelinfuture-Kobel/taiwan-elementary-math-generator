import test from "node:test";
import assert from "node:assert/strict";

import {
  G3B_U07_CURRENT_KP_IDS,
  generateG3BU07CurrentQuestions,
  requestsG3BU07CurrentWorksheet,
} from "../../site/modules/curriculum/batch-a/g3b-u07-current-coordinator.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p04f30-extension.js";
import { resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding-p04f30.js";

const SOURCE_ID = "g3b_u07_3b07";
const FRACTION_UNIT_CONVERSION_KP_ID = "kp_g3b_u07_fraction_unit_conversion";
const TARGET_CAPACITY_KP_IDS = Object.freeze([
  FRACTION_UNIT_CONVERSION_KP_ID,
  "kp_g3b_u07_same_denominator_add_sub",
  "kp_g3b_u07_same_denominator_compare",
  "kp_g3b_u07_original_or_difference_context",
]);
const prompt = (question) => String(question.blankedDisplayText ?? "").replace(/\s+/g, " ").trim();
const identity = (question) => `${question.patternSpecId}|${prompt(question)}|${question.answerText}`;

function options(knowledgePointIds, overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: knowledgePointIds.length === 1 ? "singleKnowledgePoint" : "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: knowledgePointIds,
    questionMode: "numeric",
    questionCount: 121,
    ordering: "groupedByPattern",
    generationSeed: "g3b-u07-focused",
    includeAnswerKey: true,
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 5, showQuestionNumbers: true, showAnswerKeyPage: true },
    ...overrides,
  };
}

test("G3B-U07 current authority exposes exactly eight visible KPs and no hidden KP", () => {
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(rows.length, 8);
  assert.deepEqual(rows.map((row) => row.knowledgePointId), G3B_U07_CURRENT_KP_IDS);
  assert.equal(availability.visibleCount, 8);
  assert.equal(availability.hiddenPendingCount, 0);
  assert.equal(availability.notSelectableCount, 0);
});

for (const knowledgePointId of TARGET_CAPACITY_KP_IDS) {
  test(`${knowledgePointId} produces 120 and 121 distinct questions`, () => {
    for (const questionCount of [120, 121]) {
      const result = generateG3BU07CurrentQuestions(options([knowledgePointId], { questionCount }));
      assert.equal(result.ok, true, JSON.stringify(result.errors));
      assert.equal(result.questions.length, questionCount);
      assert.equal(new Set(result.questions.map(prompt)).size, questionCount);
      assert.equal(result.questions.every((question) => question.metadata.knowledgePointId === knowledgePointId), true);
    }
  });
}

test("fraction-unit conversion application produces 120 and 121 distinct questions", () => {
  for (const questionCount of [120, 121]) {
    const result = generateG3BU07CurrentQuestions(options([FRACTION_UNIT_CONVERSION_KP_ID], {
      questionMode: "application",
      questionCount,
      generationSeed: `g3b-u07-application-${questionCount}`,
      printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 3, showQuestionNumbers: true, showAnswerKeyPage: true },
    }));
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.questions.length, questionCount);
    assert.equal(new Set(result.questions.map(prompt)).size, questionCount);
    assert.equal(result.questions.every((question) => question.metadata.knowledgePointId === FRACTION_UNIT_CONVERSION_KP_ID), true);
    assert.equal(result.questions.every((question) => question.questionMode === "application"), true);
  }
});

test("public worksheet keeps numeric capacity and routes only fraction-unit conversion application through current coordinator", () => {
  const otherKnowledgePointIds = G3B_U07_CURRENT_KP_IDS.filter((id) => id !== FRACTION_UNIT_CONVERSION_KP_ID);
  assert.equal(requestsG3BU07CurrentWorksheet(options([FRACTION_UNIT_CONVERSION_KP_ID], { questionMode: "application" })), true);
  for (const knowledgePointId of otherKnowledgePointIds) {
    assert.equal(requestsG3BU07CurrentWorksheet(options([knowledgePointId], { questionMode: "application" })), false, knowledgePointId);
  }

  for (const questionMode of ["numeric", "application"]) {
    const result = buildBatchABrowserWorksheetDocument(options([FRACTION_UNIT_CONVERSION_KP_ID], {
      questionMode,
      questionCount: 121,
      generationSeed: `public-${questionMode}-121`,
      printLayout: { paperSize: "A4", columns: 2, rowsPerPage: questionMode === "application" ? 3 : 5, showQuestionNumbers: true, showAnswerKeyPage: true },
    }));
    assert.equal(result.ok, true, `${questionMode}:${JSON.stringify(result.errors)}`);
    const document = result.worksheetDocument;
    assert.equal(document.questions.length, 121, questionMode);
    assert.equal(document.answerKeyItems.length, 121, questionMode);
    assert.equal(new Set(document.questions.map(prompt)).size, 121, questionMode);
    assert.equal(document.publicControls.questionMode, questionMode);
    assert.equal(document.summary.numericQuestionCount, questionMode === "numeric" ? 121 : 0);
    assert.equal(document.summary.applicationQuestionCount, questionMode === "application" ? 121 : 0);
    assert.equal(document.questions.every((question) => question.questionMode === questionMode), true, questionMode);
  }
});

test("all eight KPs produce 121 distinct questions individually", () => {
  for (const knowledgePointId of G3B_U07_CURRENT_KP_IDS) {
    const result = generateG3BU07CurrentQuestions(options([knowledgePointId]));
    assert.equal(result.ok, true, `${knowledgePointId}:${JSON.stringify(result.errors)}`);
    assert.equal(result.questions.length, 121);
    assert.equal(new Set(result.questions.map(prompt)).size, 121);
  }
});

test("single-KP shuffle is seeded, reproducible, and differs from grouped order", () => {
  const selected = ["kp_g3b_u07_fraction_unit_conversion"];
  const grouped = generateG3BU07CurrentQuestions(options(selected, { questionCount: 120, generationSeed: "single-order" }));
  const shuffledA = generateG3BU07CurrentQuestions(options(selected, { questionCount: 120, generationSeed: "single-order", ordering: "shuffleAcrossPatterns" }));
  const shuffledARepeat = generateG3BU07CurrentQuestions(options(selected, { questionCount: 120, generationSeed: "single-order", ordering: "shuffleAcrossPatterns" }));
  const shuffledB = generateG3BU07CurrentQuestions(options(selected, { questionCount: 120, generationSeed: "single-order-b", ordering: "shuffleAcrossPatterns" }));
  for (const result of [grouped, shuffledA, shuffledARepeat, shuffledB]) assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(new Set(grouped.questions.map(identity)), new Set(shuffledA.questions.map(identity)));
  assert.notDeepEqual(grouped.questions.map(identity), shuffledA.questions.map(identity));
  assert.deepEqual(shuffledA.questions.map(identity), shuffledARepeat.questions.map(identity));
  assert.notDeepEqual(shuffledA.questions.map(prompt), shuffledB.questions.map(prompt));
});

test("all-eight mixed shuffle preserves the exact set and represents every KP", () => {
  const grouped = generateG3BU07CurrentQuestions(options(G3B_U07_CURRENT_KP_IDS, { questionCount: 240, generationSeed: "mixed-order" }));
  const shuffled = generateG3BU07CurrentQuestions(options(G3B_U07_CURRENT_KP_IDS, { questionCount: 240, generationSeed: "mixed-order", ordering: "shuffleAcrossPatterns" }));
  assert.equal(grouped.ok, true, JSON.stringify(grouped.errors));
  assert.equal(shuffled.ok, true, JSON.stringify(shuffled.errors));
  assert.equal(grouped.questions.length, 240);
  assert.equal(new Set(grouped.questions.map(prompt)).size, 240);
  assert.deepEqual(new Set(grouped.questions.map(identity)), new Set(shuffled.questions.map(identity)));
  assert.notDeepEqual(grouped.questions.map(identity), shuffled.questions.map(identity));
  assert.deepEqual(new Set(shuffled.questions.map((question) => question.metadata.knowledgePointId)), new Set(G3B_U07_CURRENT_KP_IDS));
  assert.equal(Math.max(...shuffled.knowledgePointAllocation.map((row) => row.questionCount)) - Math.min(...shuffled.knowledgePointAllocation.map((row) => row.questionCount)), 0);
});

test("current worksheet renders every fraction token as structured numerator-over-denominator math", () => {
  const result = buildBatchABrowserWorksheetDocument(options(G3B_U07_CURRENT_KP_IDS, { questionCount: 240, generationSeed: "structured-fraction", ordering: "shuffleAcrossPatterns" }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.questions.length, 240);
  assert.equal(document.questionDisplayModels.length, 240);
  assert.equal(document.answerKeyItems.length, 240);
  for (const knowledgePointId of G3B_U07_CURRENT_KP_IDS) {
    const indexes = document.questions.map((question, index) => ({ question, index })).filter(({ question }) => question.metadata.knowledgePointId === knowledgePointId).map(({ index }) => index);
    assert.equal(indexes.length > 0, true, knowledgePointId);
    assert.equal(indexes.some((index) => document.questionDisplayModels[index].promptInlineMath || document.answerKeyItems[index].answerInlineMath), true, knowledgePointId);
  }
  document.questions.forEach((question, index) => {
    if (/\d+\/\d+/.test(question.blankedDisplayText)) assert.ok(document.questionDisplayModels[index].promptInlineMath);
    if (/\d+\/\d+/.test(question.answerText)) assert.ok(document.answerKeyItems[index].answerInlineMath);
  });
  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  assert.match(html, /class="math-fraction"/);
  assert.doesNotMatch(html, />\s*\d+\/\d+\s*</);
});

test("public binding exposes 240 for target single KPs and all-eight mixed selection", () => {
  for (const knowledgePointId of TARGET_CAPACITY_KP_IDS) {
    const binding = resolvePublicUiCapabilityBinding({ sourceId: SOURCE_ID, surfaceId: "CLASSIC", selectionMode: "singleKnowledgePoint", selectedKnowledgePointIds: [knowledgePointId], requestedQuestionType: "numeric" });
    assert.equal(binding.blocked, false, knowledgePointId);
    assert.equal(binding.questionCount.max, 240, knowledgePointId);
  }
  const mixed = resolvePublicUiCapabilityBinding({ sourceId: SOURCE_ID, surfaceId: "CLASSIC", selectionMode: "mixedKnowledgePointsSameUnit", selectedKnowledgePointIds: G3B_U07_CURRENT_KP_IDS, requestedQuestionType: "numeric" });
  assert.equal(mixed.blocked, false);
  assert.equal(mixed.questionCount.max, 240);
  assert.equal(mixed.selectedKnowledgePointIds.length, 8);
});
