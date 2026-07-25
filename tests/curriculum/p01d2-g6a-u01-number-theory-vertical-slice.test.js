import test from "node:test";
import assert from "node:assert/strict";

import {
  auditP01D2BatchASelectorComposition,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G6A_U01_PATTERN_SPEC_IDS,
  G6A_U01_SOURCE_ID,
  validateP01D2PatternDefinitions,
} from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p01d2-extension.js";
import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import { listFullProductSourceUnits } from "../../site/modules/curriculum/batch-a/full-product-source-units-p01d2.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import {
  greatestCommonFactor,
  isPrime,
  leastCommonMultiple,
  primeExponentMap,
  primeFactors,
  validateG6AU01NumberTheoryQuestion,
} from "../../site/modules/curriculum/batch-a/number-theory-runtime.js";
import {
  validateBatchABrowserPlan,
  validateBatchABrowserQuestions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { materializeP01AW1ProductAdmissionInventory } from "../../src/curriculum/full-product/p01-w1-product-admission-inventory.mjs";

const KP_IDS = Object.freeze([
  "kp_g6a_u01_prime_composite_classification",
  "kp_g6a_u01_prime_factorization",
  "kp_g6a_u01_short_division_common_factors",
  "kp_g6a_u01_greatest_common_factor",
  "kp_g6a_u01_least_common_multiple",
]);

function sourceUnitOptions(overrides = {}) {
  return {
    sourceId: G6A_U01_SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 20,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "p01d2-source-unit",
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 4,
      showQuestionNumbers: true,
      showAnswerKeyPage: true,
    },
    ...overrides,
  };
}

function numericGroup(knowledgePointId) {
  return getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
    .find((group) => group.publicQuestionMode === "numeric" || group.mode === "numeric");
}

test("P01D2 keeps exactly five W1 KnowledgePoints and ten numeric PatternSpecs after public closeout", () => {
  const selectorAudit = auditP01D2BatchASelectorComposition();
  const patternAudit = validateP01D2PatternDefinitions();
  assert.equal(selectorAudit.ok, true, JSON.stringify(selectorAudit.errors));
  assert.equal(patternAudit.ok, true, JSON.stringify(patternAudit.errors));
  assert.equal(selectorAudit.counts.addedKnowledgePoints, 5);
  assert.equal(selectorAudit.counts.patternGroups, 5);
  assert.equal(selectorAudit.counts.patternSpecs, 10);
  assert.equal(G6A_U01_PATTERN_SPEC_IDS.length, 10);
  for (const knowledgePointId of KP_IDS) {
    const row = getVisibleBatchAKnowledgePoint(knowledgePointId);
    const group = numericGroup(knowledgePointId);
    assert.equal(row?.sourceId, G6A_U01_SOURCE_ID);
    assert.ok(group, knowledgePointId);
    assert.equal(group.patternSpecIds.length, 2);
  }
});

test("P01D2 preserves the protected thirteen-unit baseline while P01E publishes the nineteen-source fleet", () => {
  const protectedBaseline = listBatchASourceUnits({ includePublicCandidates: false });
  const publicFleet = listBatchASourceUnits({
    includePublicCandidates: true,
    includeFullProductPublic: true,
  });
  const p01d2Sources = listFullProductSourceUnits();
  assert.equal(protectedBaseline.length, 13);
  assert.equal(publicFleet.length, 19);
  const publicSource = publicFleet.find((row) => row.sourceId === G6A_U01_SOURCE_ID);
  assert.equal(publicSource?.unitCode, "6A-U01");
  assert.equal(publicSource?.lifecycle, "public_full_product_w1_release");
  assert.equal(p01d2Sources.length, 17);
  const source = p01d2Sources.find((row) => row.sourceId === G6A_U01_SOURCE_ID);
  assert.equal(source?.unitCode, "6A-U01");
  assert.equal(source?.lifecycle, "full_product_w1_vertical_slice");
});

test("P01D2 shared number-theory primitives satisfy mathematical invariants", () => {
  assert.equal(isPrime(1), false);
  assert.equal(isPrime(2), true);
  assert.equal(isPrime(97), true);
  assert.equal(isPrime(99), false);
  assert.deepEqual(primeFactors(360), [2, 2, 2, 3, 3, 5]);
  assert.deepEqual(primeExponentMap(360), { 2: 3, 3: 2, 5: 1 });
  assert.equal(greatestCommonFactor(84, 126), 42);
  assert.equal(leastCommonMultiple(24, 36), 72);
  assert.equal(
    greatestCommonFactor(24, 36) * leastCommonMultiple(24, 36),
    24 * 36,
  );
});

test("P01D2 source-unit plan and generator cover all ten PatternSpecs deterministically", () => {
  const options = sourceUnitOptions();
  const plan = buildBatchABrowserPlan(options);
  assert.equal(plan.sourceId, G6A_U01_SOURCE_ID);
  assert.equal(plan.sourceUnit?.unitCode, "6A-U01");
  assert.deepEqual(plan.patternSpecIds, [...G6A_U01_PATTERN_SPEC_IDS]);
  assert.equal(validateBatchABrowserPlan(plan).ok, true);
  const first = generateBatchABrowserQuestions(options);
  const second = generateBatchABrowserQuestions(options);
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.equal(first.questions.length, 20);
  assert.deepEqual(first.questions, second.questions);
  assert.deepEqual(
    [...new Set(first.questions.map((question) => question.patternSpecId))].sort(),
    [...G6A_U01_PATTERN_SPEC_IDS].sort(),
  );
  assert.equal(new Set(first.questions.map((question) => question.operation)).size, 10);
  const validation = validateBatchABrowserQuestions(first.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
  assert.equal(validation.validatorVersion, "p01d2-g6a-u01-number-theory-v1");
});

test("P01D2 supports bounded single-KP numeric selection for every admitted KnowledgePoint", () => {
  for (const knowledgePointId of KP_IDS) {
    const group = numericGroup(knowledgePointId);
    assert.ok(group, knowledgePointId);
    const result = generateBatchABrowserQuestions(sourceUnitOptions({
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [knowledgePointId],
      selectedPatternGroupIds: [group.patternGroupId],
      questionCount: 4,
      generationSeed: `p01d2-${knowledgePointId}`,
    }));
    assert.equal(result.ok, true, `${knowledgePointId}: ${JSON.stringify(result.errors)}`);
    assert.equal(result.questions.length, 4);
    assert.equal(
      result.questions.every((question) => group.patternSpecIds.includes(question.patternSpecId)),
      true,
    );
    assert.equal(
      result.questions.every((question) => question.metadata.knowledgePointId === knowledgePointId),
      true,
    );
  }
});

test("P01D2 validator fails closed when a deterministic answer is tampered", () => {
  const generated = generateBatchABrowserQuestions(sourceUnitOptions({ questionCount: 10 }));
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  for (const original of generated.questions) {
    const report = validateG6AU01NumberTheoryQuestion({
      ...original,
      answerText: "錯誤答案",
    });
    assert.equal(report.ok, false, original.patternSpecId);
  }
});

test("P01D2 produces worksheet, answer key, paginated HTML and print metadata on the shared path", () => {
  const result = buildBatchABrowserWorksheetDocument(sourceUnitOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.batchA.sourceId, G6A_U01_SOURCE_ID);
  assert.equal(document.generatedQuestions.length, 20);
  assert.equal(document.answerKeyItems.length, 20);
  assert.ok(document.questionPages.length > 0);
  assert.ok(document.answerKeyPages.length > 0);
  assert.equal(document.batchA.patternSpecIds.length, 10);
  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  assert.match(html, /<!doctype html>/);
  assert.match(html, /worksheet-page--questions/);
  assert.match(html, /worksheet-page--answer-key/);
  assert.doesNotMatch(html, /\{[A-Za-z_][^}]*\}/);
});

test("P01D2 remains admitted after P01E advances the cumulative W1 public closeout", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  assert.equal(inventory.metrics.knowledgePointCount, 21);
  assert.equal(inventory.metrics.sourceNodeCount, 4);
  assert.equal(inventory.metrics.publicKnowledgePointVisibleCount, 21);
  assert.equal(inventory.metrics.publicPatternBindingPresentCount, 21);
  assert.equal(inventory.metrics.publicSourceSelectableCount, 4);
  assert.equal(inventory.metrics.admissionReadyExistingPublicPatternCount, 21);
  assert.equal(inventory.metrics.patternGroupOrSpecBindingRequiredCount, 0);
  assert.equal(inventory.metrics.publicProductVerticalSliceRequiredCount, 0);
  for (const knowledgePointId of KP_IDS) {
    const row = inventory.getRow(knowledgePointId);
    assert.equal(row.productGapState, "ADMISSION_READY_EXISTING_PUBLIC_PATTERN");
    assert.equal(row.currentProductCoverage.publicSourceSelectable, true);
    assert.equal(row.currentProductCoverage.patternSpecIds.length, 2);
  }
  console.log(`P01D2_G6A_U01_READBACK=${JSON.stringify({
    sourceId: G6A_U01_SOURCE_ID,
    admittedKnowledgePointIds: KP_IDS,
    patternSpecIds: G6A_U01_PATTERN_SPEC_IDS,
    inventoryMetrics: inventory.metrics,
  })}`);
});
