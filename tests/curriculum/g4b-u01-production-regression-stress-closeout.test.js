import assert from "node:assert/strict";
import test from "node:test";

import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import {
  buildBatchABrowserWorksheetDocument as buildPreviousWorksheet,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s58h-extension.js";
import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s59h-extension.js";
import {
  generateG4BU01CanonicalHorizontalQuestions,
} from "../../site/modules/curriculum/batch-a/g4b-u01-canonical-horizontal-router.js";
import {
  G4B_U01_BLOCKING_CODES,
  G4B_U01_WARNING_CODES,
} from "../../site/modules/curriculum/batch-a/g4b-u01-horizontal-validator.js";
import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION,
  G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U01_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U01_PROMOTED_PATTERN_SPEC_IDS,
  validateG4BU01HorizontalPromotionProjection,
} from "../../site/modules/curriculum/registry/g4b-u01-horizontal-promotion.js";
import {
  G4B_U01_PRODUCTION_PROMOTION_ACTIVATION,
  validateG4BU01ProductionPromotionProjection,
} from "../../site/modules/curriculum/registry/g4b-u01-horizontal-production-promotion.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES,
} from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const SOURCE_ID = "g4b_u01_4b01";

function allOptions(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [...G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS],
    selectedPatternGroupIds: [...G4B_U01_PROMOTED_PATTERN_GROUP_IDS],
    questionCount: 72,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s59j-g4b-u01-production-gate",
    printLayout: { columns: 3, rowsPerPage: 8, showAnswerKeyPage: true },
    ...overrides,
  };
}

function singleOptions(overrides = {}) {
  return allOptions({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS[0]],
    selectedPatternGroupIds: [G4B_U01_PROMOTED_PATTERN_GROUP_IDS[0]],
    questionCount: 1,
    ...overrides,
  });
}

function buildPublic(options) {
  const result = buildBatchABrowserWorksheetDocument(options);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.ok(result.worksheetDocument);
  return result.worksheetDocument;
}

function spread(values) {
  return values.length === 0 ? 0 : Math.max(...values) - Math.min(...values);
}

function membership(document) {
  return document.generatedQuestions
    .map((question) => `${question.patternSpecId}:${question.answerText}`)
    .sort();
}

test("S59J accepts final base and worksheet-overlay production promotion", () => {
  assert.equal(G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION.status, "production_promotion_accepted");
  assert.equal(G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION.requiredNextGate, null);
  assert.equal(G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION.publicSelectorAndPrintQaAccepted, true);
  assert.equal(G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION.finalStressAccepted, true);
  assert.equal(G4B_U01_HORIZONTAL_PROMOTION_ACTIVATION.finalHtmlPdfSmokeAccepted, true);
  assert.equal(G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.status, "production_promotion_accepted");
  assert.equal(G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.requiredNextGate, null);
  assert.equal(G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.publicSelectorAndPrintQaAccepted, true);
  assert.equal(G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.finalStressAccepted, true);
  assert.equal(G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.finalHtmlPdfPromotionAccepted, true);
  const base = validateG4BU01HorizontalPromotionProjection();
  const overlay = validateG4BU01ProductionPromotionProjection();
  assert.equal(base.ok, true, JSON.stringify(base.errors));
  assert.equal(overlay.ok, true, JSON.stringify(overlay.errors));
  assert.deepEqual(base.counts, { knowledgePoints: 9, patternGroups: 9, patternSpecs: 12 });
  assert.deepEqual(overlay.counts, { knowledgePoints: 9, patternGroups: 9, patternSpecs: 12 });
});

test("S59J public count matrix preserves exact counts and blocks requests above 200", () => {
  for (const questionCount of [1, 9, 12, 72, 200]) {
    const document = buildPublic(allOptions({
      questionCount,
      generationSeed: `s59j-count-${questionCount}`,
    }));
    assert.equal(document.summary.questionCount, questionCount);
    assert.equal(document.generatedQuestions.length, questionCount);
    assert.equal(document.batchA.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), questionCount);
    assert.equal(document.validationSummary.ok, true);
    assert.equal(document.productionUse, "allowed");
    assert.equal(document.visibilityStatus, "visible");
  }

  for (const overLimit of [201, 257, 600, 1000]) {
    const rejected = buildBatchABrowserWorksheetDocument(allOptions({ questionCount: overLimit }));
    assert.equal(rejected.ok, false);
    assert.equal(rejected.worksheetDocument, null);
    assert.equal(
      rejected.errors.some((error) => error.code === "G4B_U01_PRODUCTION_QUESTION_COUNT_INVALID"),
      true,
    );
  }
});

test("S59J completes aggregate 1000-question stress with all 9 groups and 12 PatternSpecs", () => {
  const expectedSpecs = new Set(G4B_U01_PROMOTED_PATTERN_SPEC_IDS);
  const reachedSpecs = new Set();
  const reachedGroups = new Set();
  let generatedTotal = 0;

  for (let batchIndex = 0; batchIndex < 5; batchIndex += 1) {
    const document = buildPublic(allOptions({
      questionCount: 200,
      generationSeed: `s59j-public-stress-${batchIndex + 1}`,
    }));
    generatedTotal += document.generatedQuestions.length;

    const groupCounts = new Map();
    const specCountsByGroup = new Map();
    for (const question of document.generatedQuestions) {
      assert.equal(question.kind, "g4bU01HorizontalCalculation");
      assert.equal(question.selectorStatus, "visible");
      assert.equal(question.productionUse, "allowed");
      assert.equal(question.representation, "horizontal_only");
      assert.equal(question.applicationText, false);
      assert.equal(question.canonicalRoute.publicHiddenModeFlagUsed, false);
      assert.equal(question.canonicalRoute.applicationModeUsed, false);
      assert.equal(question.canonicalRoute.verticalRepresentationUsed, false);
      assert.doesNotMatch(question.promptText, /直式|長除法|[？?]/);

      reachedSpecs.add(question.patternSpecId);
      reachedGroups.add(question.resolvedPatternGroupId);
      groupCounts.set(question.resolvedPatternGroupId, (groupCounts.get(question.resolvedPatternGroupId) ?? 0) + 1);
      const specCounts = specCountsByGroup.get(question.resolvedPatternGroupId) ?? new Map();
      specCounts.set(question.patternSpecId, (specCounts.get(question.patternSpecId) ?? 0) + 1);
      specCountsByGroup.set(question.resolvedPatternGroupId, specCounts);
    }

    assert.equal(groupCounts.size, 9);
    assert.equal(spread([...groupCounts.values()]) <= 1, true);
    for (const specCounts of specCountsByGroup.values()) {
      assert.equal(spread([...specCounts.values()]) <= 1, true);
    }
  }

  assert.equal(generatedTotal, 1000);
  assert.deepEqual(reachedSpecs, expectedSpecs);
  assert.deepEqual(reachedGroups, new Set(G4B_U01_PROMOTED_PATTERN_GROUP_IDS));
});

test("S59J keeps deterministic replay and shuffle membership invariants", () => {
  const groupedA = buildPublic(allOptions({
    questionCount: 72,
    generationSeed: "s59j-determinism",
    ordering: "groupedByPattern",
  }));
  const groupedB = buildPublic(allOptions({
    questionCount: 72,
    generationSeed: "s59j-determinism",
    ordering: "groupedByPattern",
  }));
  const shuffledA = buildPublic(allOptions({
    questionCount: 72,
    generationSeed: "s59j-determinism",
    ordering: "shuffleAcrossPatterns",
  }));
  const shuffledB = buildPublic(allOptions({
    questionCount: 72,
    generationSeed: "s59j-determinism",
    ordering: "shuffleAcrossPatterns",
  }));
  assert.deepEqual(groupedA.generatedQuestions, groupedB.generatedQuestions);
  assert.deepEqual(shuffledA.generatedQuestions, shuffledB.generatedQuestions);
  assert.deepEqual(membership(shuffledA), membership(groupedA));
  assert.notDeepEqual(
    shuffledA.generatedQuestions.map((question) => question.id),
    groupedA.generatedQuestions.map((question) => question.id),
  );
});

test("S59J preserves all 24 blocking codes with zero fallback output", () => {
  assert.equal(G4B_U01_BLOCKING_CODES.length, 24);
  const plan = buildBatchABrowserPlan(singleOptions());
  assert.equal(plan.resolverResult.ok, true, JSON.stringify(plan.resolverResult.errors));

  for (const code of G4B_U01_BLOCKING_CODES) {
    const result = generateG4BU01CanonicalHorizontalQuestions(plan, {
      validator() {
        return {
          ok: false,
          errors: [{ code, severity: "error", path: "arithmetic", message: code }],
          warnings: [],
          blockingCodes: [code],
        };
      },
    });
    assert.equal(result.ok, false, code);
    assert.equal(result.questions.length, 0, code);
    assert.equal(result.errors.some((error) => error.code === code), true, code);
  }
});

test("S59J retains both warning codes as nonblocking output", () => {
  assert.equal(G4B_U01_WARNING_CODES.length, 2);
  const plan = buildBatchABrowserPlan(singleOptions());
  const result = generateG4BU01CanonicalHorizontalQuestions(plan, {
    validator() {
      return {
        ok: true,
        errors: [],
        warnings: G4B_U01_WARNING_CODES.map((code) => ({
          code,
          severity: "warning",
          path: "promptText",
          message: code,
        })),
        blockingCodes: [],
      };
    },
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 1);
  assert.deepEqual(new Set(result.warnings.map((warning) => warning.code)), new Set(G4B_U01_WARNING_CODES));
});

test("S59J keeps every source-unit route delegated byte-for-byte to the pre-S59H worksheet path", () => {
  const sources = listBatchASourceUnits();
  assert.equal(sources.length >= 13, true);
  for (const source of sources) {
    const options = {
      sourceId: source.sourceId,
      questionCount: 3,
      ordering: "groupedByPattern",
      includeAnswerKey: true,
      generationSeed: `s59j-source-regression:${source.sourceId}`,
      printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true },
    };
    const previous = buildPreviousWorksheet(options);
    const extended = buildBatchABrowserWorksheetDocument(options);
    assert.deepEqual(extended, previous, source.sourceId);
    assert.equal(extended.ok, true, `${source.sourceId}: ${JSON.stringify(extended.errors)}`);
  }
});
