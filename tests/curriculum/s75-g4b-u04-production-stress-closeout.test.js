import assert from "node:assert/strict";
import test from "node:test";

import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_PROMOTED_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import {
  G4B_U04_WORKSHEET_ANSWER_SHAPES,
} from "../../site/modules/curriculum/registry/g4b-u04-worksheet-promotion.js";
import {
  G4B_U04_PRODUCTION_LIFECYCLE,
  validateG4BU04ProductionPromotionProjection,
} from "../../site/modules/curriculum/registry/g4b-u04-production-promotion.js";
import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s73-extension.js";

const PUBLIC_COUNTS = Object.freeze([1, 12, 17, 34, 68, 120, 200]);
const EXTRA_STRESS_COUNT = 600;
const ALL_MODES = Object.freeze([
  "concept",
  "numeric",
  "application",
  "operation_estimation",
  "reasoning",
]);

function options(questionCount, seed, overrides = {}) {
  return {
    sourceId: "g4b_u04_4b04",
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS],
    selectedPatternGroupIds: [...G4B_U04_PROMOTED_PATTERN_GROUP_IDS],
    questionMode: "mixed",
    questionCount,
    ordering: "shuffleAcrossPatterns",
    generationSeed: seed,
    includeAnswerKey: true,
    ...overrides,
  };
}

function build(questionCount, seed, overrides = {}) {
  const result = buildBatchABrowserWorksheetDocument(options(questionCount, seed, overrides));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.ok(result.worksheetDocument);
  assert.equal(result.worksheetDocument.generatedQuestions.length, questionCount);
  assert.equal(result.worksheetDocument.questionDisplayModels.length, questionCount);
  assert.equal(result.worksheetDocument.answerKeyItems.length, questionCount);
  assert.equal(result.validation.errors.length, 0);
  return result.worksheetDocument;
}

test("S75 production promotion retains D0 over the 13/13/19 effective authority", () => {
  const checked = validateG4BU04ProductionPromotionProjection();
  assert.equal(checked.ok, true, checked.errors.join(","));
  assert.deepEqual(checked.counts, { knowledgePoints: 13, patternGroups: 13, patternSpecs: 19 });
  assert.equal(G4B_U04_PRODUCTION_LIFECYCLE.productionUse, "allowed");
  assert.equal(G4B_U04_PRODUCTION_LIFECYCLE.distance, "D0_G4B_U04");
  assert.equal(G4B_U04_PRODUCTION_LIFECYCLE.requiredNextGate, "S76_BatchB_NextSourcePriorityLock");
});

test("S75 public count matrix and cumulative stress exceed 1000 validated questions", () => {
  let cumulative = 0;
  for (const count of PUBLIC_COUNTS) {
    const document = build(count, `s75-public-count-${count}`);
    cumulative += document.generatedQuestions.length;
    assert.equal(document.summary.questionCount, count);
    assert.equal(document.answerKeyItems.length, count);
  }
  const extra = build(EXTRA_STRESS_COUNT, "s75-extra-600");
  cumulative += extra.generatedQuestions.length;
  assert.equal(cumulative, 1052);
  assert.ok(cumulative >= 1000);
});

test("S75 canonical runtime rejects requests above the 1000-question hard limit", () => {
  const result = buildBatchABrowserWorksheetDocument(options(1001, "s75-over-limit"));
  assert.equal(result.ok, false);
  assert.equal(result.worksheetDocument, null);
  assert.ok(result.errors.some((entry) => entry.code === "G4B_U04_CANONICAL_COUNT_INVALID"));
});

test("S75 68-question canonical worksheet reaches every promoted KP group PatternSpec mode and answer shape", () => {
  const document = build(68, "s75-68-all-promoted", { ordering: "groupedByPattern" });
  const reachedKPs = new Set(document.generatedQuestions.map((row) => row.knowledgePointId));
  const reachedGroups = new Set(document.generatedQuestions.map((row) => row.resolvedPatternGroupId ?? row.patternGroupId));
  const reachedSpecs = new Set(document.generatedQuestions.map((row) => row.patternSpecId));
  const reachedModes = new Set(document.generatedQuestions.map((row) => row.mode));
  const reachedShapes = new Set(document.generatedQuestions.map((row) => row.answerModelShape));
  assert.deepEqual(reachedKPs, new Set(G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS));
  assert.deepEqual(reachedGroups, new Set(G4B_U04_PROMOTED_PATTERN_GROUP_IDS));
  assert.deepEqual(reachedSpecs, new Set(G4B_U04_PROMOTED_PATTERN_SPEC_IDS));
  assert.deepEqual(reachedModes, new Set(ALL_MODES));
  assert.deepEqual(reachedShapes, new Set(G4B_U04_WORKSHEET_ANSWER_SHAPES));
  assert.equal(document.g4bU04Summary.classCQuestionCount > 0, true);
  assert.equal(document.g4bU04Summary.classDQuestionCount > 0, true);
});

test("S75 every explicit public question mode remains blocking validated", () => {
  for (const mode of ALL_MODES) {
    const document = build(24, `s75-mode-${mode}`, { questionMode: mode });
    assert.equal(document.generatedQuestions.every((row) => row.mode === mode), true, mode);
    if (mode === "application") {
      assert.equal(document.generatedQuestions.every((row) => row.applicationText === true), true);
    }
  }
});
