import assert from "node:assert/strict";
import test from "node:test";

import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {
  normalizeG4BU04PromptSignature,
} from "../../site/modules/curriculum/batch-b/g4b-u04-prompt-deduplication.js";
import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import {
  G4B_U04_RENDERER_PROFILES,
} from "../../site/modules/curriculum/registry/g4b-u04-worksheet-promotion.js";

const SOURCE_ID = "g4b_u04_4b04";
const QUESTION_COUNT = 200;
const OLD_PAGE_COUNT = 50;
const TARGET_PAGE_COUNT = 25;

function buildPaperEfficiencyWorksheet({ includeAnswerKey = false } = {}) {
  return buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    worksheetMode: "batchAKnowledgePoint",
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS],
    selectedPatternGroupIds: [...G4B_U04_PROMOTED_PATTERN_GROUP_IDS],
    questionMode: "mixed",
    contextMode: "mixed",
    layoutMode: "custom_with_caps",
    questionCount: QUESTION_COUNT,
    ordering: "shuffleAcrossPatterns",
    generationSeed: "g4b-u04-r3a-paper-efficiency",
    includeAnswerKey,
    printLayout: {
      paperSize: "A4",
      columns: 4,
      rowsPerPage: 10,
      showAnswerKeyPage: includeAnswerKey,
    },
  });
}

test("R3A inverse-long question profile uses two columns while preserving the one-column answer profile", () => {
  assert.deepEqual(G4B_U04_RENDERER_PROFILES.inverseLong.questionSheet, {
    paperSize: "A4",
    columns: 2,
    rowsPerPage: 4,
    avoidSplit: true,
  });
  assert.deepEqual(G4B_U04_RENDERER_PROFILES.inverseLong.answerKey, {
    paperSize: "A4",
    columns: 1,
    rowsPerPage: 5,
    avoidSplit: true,
  });
});

test("R3A 200-question mixed worksheet cuts question pages from 50 to 25 without changing questions", () => {
  const result = buildPaperEfficiencyWorksheet();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.generatedQuestions.length, QUESTION_COUNT);
  assert.equal(document.rendererProfile.profileId, G4B_U04_RENDERER_PROFILES.inverseLong.profileId);
  assert.deepEqual(document.layoutResolution.requestedQuestionLayout, {
    paperSize: "A4",
    columns: 4,
    rowsPerPage: 10,
  });
  assert.deepEqual(document.layoutResolution.resolvedQuestionLayout, {
    paperSize: "A4",
    columns: 2,
    rowsPerPage: 4,
  });
  assert.equal(document.questionPages.length, TARGET_PAGE_COUNT);
  assert.ok(document.questionPages.length <= OLD_PAGE_COUNT / 2);
  assert.deepEqual(document.answerKeyItems, []);
  assert.deepEqual(document.answerKeyPages, []);
  assert.equal(document.appliedLayoutText, "套用版面：題目 2 欄 × 4 列；答案 1 欄 × 5 列");
  assert.equal(result.validation?.errors?.length ?? 0, 0);

  const signatures = document.generatedQuestions.map((question) =>
    normalizeG4BU04PromptSignature(question.promptText));
  assert.equal(new Set(signatures).size, signatures.length);
});

test("R3A keeps the inverse-long answer profile at one column when answer pages are enabled", () => {
  const result = buildPaperEfficiencyWorksheet({ includeAnswerKey: true });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.deepEqual(document.layoutResolution.resolvedAnswerLayout, {
    paperSize: "A4",
    columns: 1,
    rowsPerPage: 5,
  });
  assert.equal(document.answerKeyItems.length, QUESTION_COUNT);
  assert.equal(document.answerKeyPages.length, 40);
});
