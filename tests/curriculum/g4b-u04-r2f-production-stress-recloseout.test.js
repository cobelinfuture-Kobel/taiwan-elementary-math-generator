import assert from "node:assert/strict";
import test from "node:test";

import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_PROMOTED_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import {
  G4B_U04_PRODUCTION_LIFECYCLE,
  validateG4BU04ProductionPromotionProjection,
} from "../../site/modules/curriculum/registry/g4b-u04-production-promotion.js";
import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {
  G4B_U04_ALLOWLISTED_SDG_GOALS,
  G4B_U04_CONTEXT_CONTRACT_VERSION,
} from "../../site/modules/curriculum/batch-b/g4b-u04-controlled-context-variants.js";
import {
  normalizeG4BU04PromptSignature,
} from "../../site/modules/curriculum/batch-b/g4b-u04-prompt-deduplication.js";

const SOURCE_ID = "g4b_u04_4b04";
const STRESS_COUNTS = Object.freeze([1, 19, 68, 120, 200, 600]);
const ESTIMATION_KP = "kp_g4b_u04_round_then_add_subtract";
const ESTIMATION_GROUP = "pg_g4b_u04_estimate_add_subtract";
const INVERSE_KP = "kp_g4b_u04_inverse_rounding_possible_original";
const INVERSE_GROUP = "pg_g4b_u04_inverse_original_values";

function fullPlan(questionCount, seed, overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    worksheetMode: "batchAKnowledgePoint",
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS],
    selectedPatternGroupIds: [...G4B_U04_PROMOTED_PATTERN_GROUP_IDS],
    questionMode: "mixed",
    contextMode: "mixed",
    layoutMode: "auto_safe",
    questionCount,
    ordering: "shuffleAcrossPatterns",
    generationSeed: seed,
    includeAnswerKey: true,
    printLayout: {
      paperSize: "A4",
      columns: 6,
      rowsPerPage: 20,
      showAnswerKeyPage: true,
    },
    ...overrides,
  };
}

function singlePlan({
  knowledgePointId,
  patternGroupId,
  questionMode,
  contextMode,
  layoutMode = "auto_safe",
  questionCount,
  seed,
  columns = 6,
  rowsPerPage = 20,
}) {
  return fullPlan(questionCount, seed, {
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [knowledgePointId],
    selectedPatternGroupIds: [patternGroupId],
    questionMode,
    contextMode,
    layoutMode,
    printLayout: {
      paperSize: "A4",
      columns,
      rowsPerPage,
      showAnswerKeyPage: true,
    },
  });
}

function build(plan) {
  const result = buildBatchABrowserWorksheetDocument(plan);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.validation.errors.length, 0);
  assert.ok(result.worksheetDocument);
  assert.equal(result.worksheetDocument.generatedQuestions.length, plan.questionCount);
  assert.equal(result.worksheetDocument.answerKeyItems.length, plan.questionCount);
  const signatures = result.worksheetDocument.generatedQuestions
    .map((question) => normalizeG4BU04PromptSignature(question.promptText));
  assert.equal(new Set(signatures).size, signatures.length, "worksheet prompt signatures must be unique");
  return result;
}

function reached(document, field) {
  return new Set(document.generatedQuestions.map((question) => question[field]));
}

test("R2F retains D0 production authority over 13 KP, 13 groups and 19 specs", () => {
  const projection = validateG4BU04ProductionPromotionProjection();
  assert.equal(projection.ok, true, projection.errors.join(","));
  assert.deepEqual(projection.counts, {
    knowledgePoints: 13,
    patternGroups: 13,
    patternSpecs: 19,
  });
  assert.equal(G4B_U04_PRODUCTION_LIFECYCLE.productionUse, "allowed");
  assert.equal(G4B_U04_PRODUCTION_LIFECYCLE.distance, "D0_G4B_U04");
});

test("R2F cumulative canonical stress validates 1008 unique questions", () => {
  let cumulative = 0;
  for (const count of STRESS_COUNTS) {
    const result = build(fullPlan(count, `r2f-stress-${count}`));
    cumulative += result.worksheetDocument.generatedQuestions.length;
    assert.equal(result.worksheetDocument.summary.questionCount, count);
    assert.equal(result.worksheetDocument.provenance.genericContextFallbackUsed, false);
    assert.equal(result.worksheetDocument.provenance.freeFormAIUsed, false);
  }
  assert.equal(cumulative, 1008);
});

test("R2F 68-question mixed worksheet reaches every effective authority node", () => {
  const result = build(fullPlan(68, "r2f-full-authority-68", {
    ordering: "groupedByPattern",
  }));
  const document = result.worksheetDocument;
  assert.deepEqual(reached(document, "knowledgePointId"), new Set(G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS));
  assert.deepEqual(
    new Set(document.generatedQuestions.map((question) => question.resolvedPatternGroupId ?? question.patternGroupId)),
    new Set(G4B_U04_PROMOTED_PATTERN_GROUP_IDS),
  );
  assert.deepEqual(reached(document, "patternSpecId"), new Set(G4B_U04_PROMOTED_PATTERN_SPEC_IDS));
  assert.equal(document.contextAllocation.requestedMode, "mixed");
  assert.ok(document.contextAllocation.counts.daily_life > 0);
  assert.ok(document.contextAllocation.counts.sdg > 0);
  assert.ok(document.contextAllocation.counts.not_applicable > 0);
});

test("R2F daily_life and sdg modes remain deterministic and fully validator-backed", () => {
  for (const contextMode of ["daily_life", "sdg"]) {
    const plan = singlePlan({
      knowledgePointId: ESTIMATION_KP,
      patternGroupId: ESTIMATION_GROUP,
      questionMode: "operation_estimation",
      contextMode,
      questionCount: 120,
      seed: `r2f-${contextMode}-120`,
    });
    const first = build(plan);
    const second = build(plan);
    assert.deepEqual(first, second);
    const questions = first.worksheetDocument.generatedQuestions;
    assert.equal(questions.every((question) => question.contextContractVersion === G4B_U04_CONTEXT_CONTRACT_VERSION), true);
    assert.equal(questions.every((question) => question.contextModeApplied === contextMode), true);
    if (contextMode === "sdg") {
      assert.equal(first.worksheetDocument.contextAllocation.counts.sdg, 120);
      assert.equal(first.worksheetDocument.contextAllocation.counts.daily_life, 0);
      assert.equal(questions.every((question) => G4B_U04_ALLOWLISTED_SDG_GOALS.includes(question.sdgGoal)), true);
      assert.equal(questions.every((question) => question.context.fictionalExerciseData === true), true);
      assert.equal(questions.every((question) => question.context.currentRealWorldStatistic === false), true);
      assert.equal(questions.every((question) => question.context.persuasion === false), true);
      assert.equal(questions.every((question) => question.context.fearBasedLanguage === false), true);
    } else {
      assert.equal(first.worksheetDocument.contextAllocation.counts.daily_life, 120);
      assert.equal(first.worksheetDocument.contextAllocation.counts.sdg, 0);
      assert.equal(questions.every((question) => question.sdgGoal === null), true);
    }
  }
});

test("R2F custom layout remains capped and truthful for inverse long answers", () => {
  const result = build(singlePlan({
    knowledgePointId: INVERSE_KP,
    patternGroupId: INVERSE_GROUP,
    questionMode: "reasoning",
    contextMode: "sdg",
    layoutMode: "custom_with_caps",
    questionCount: 12,
    seed: "r2f-inverse-layout-cap",
    columns: 6,
    rowsPerPage: 20,
  }));
  const document = result.worksheetDocument;
  assert.equal(document.contextAllocation.counts.not_applicable, 12);
  assert.equal(document.layoutResolution.capped, true);
  assert.deepEqual(document.layoutResolution.requestedQuestionLayout, {
    paperSize: "A4",
    columns: 6,
    rowsPerPage: 20,
  });
  assert.deepEqual(document.layoutResolution.resolvedQuestionLayout, {
    paperSize: "A4",
    columns: 1,
    rowsPerPage: 4,
  });
  assert.deepEqual(document.layoutResolution.resolvedAnswerLayout, {
    paperSize: "A4",
    columns: 1,
    rowsPerPage: 5,
  });
  assert.match(document.layoutNoticeText, /安全版面/);
});

test("R2F rejects requests above the canonical 1000-question limit", () => {
  const result = buildBatchABrowserWorksheetDocument(fullPlan(1001, "r2f-over-limit"));
  assert.equal(result.ok, false);
  assert.equal(result.worksheetDocument, null);
  assert.ok(result.errors.some((error) => error.code === "G4B_U04_CANONICAL_COUNT_INVALID"));
});
