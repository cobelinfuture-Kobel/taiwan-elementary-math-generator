import test from "node:test";
import assert from "node:assert/strict";

import {
  auditP01D3BatchASelectorComposition,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G5A_U03_PATTERN_SPEC_IDS,
  G5A_U03_SOURCE_ID,
  G5A_U03A1_SOURCE_ID,
  G5A_U03_SOURCE_IDS,
  getP01D3PatternSpecIdsForSource,
  validateP01D3PatternDefinitions,
} from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p01d3-extension.js";
import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import { listFullProductSourceUnits } from "../../site/modules/curriculum/batch-a/full-product-source-units-p01d3.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import {
  classifyRelativeToBase,
  divisibilitySet23510,
  divisorsOf,
  multiplesInInterval,
  validateG5AU03FactorMultipleQuestion,
} from "../../site/modules/curriculum/batch-a/factor-multiple-runtime.js";
import {
  validateBatchABrowserPlan,
  validateBatchABrowserQuestions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { materializeP01AW1ProductAdmissionInventory } from "../../src/curriculum/full-product/p01-w1-product-admission-inventory.mjs";

const KP_IDS = Object.freeze([
  "kp_g5a_u03a_factor_multiple_relation",
  "kp_g5a_u03a_divisibility_rules",
  "kp_g5a_u03a_exact_grouping_feasibility",
  "kp_g5a_u03a_multiple_identify_enumerate",
  "kp_g5a_u03a_bounded_or_nearest_multiple",
  "kp_g5a_u03a_count_multiples_interval",
  "kp_g5a_u03a_divisor_multiple_classification",
  "kp_g5a_u03a1_common_multiple_lcm",
  "kp_g5a_u03a1_bounded_common_multiples",
  "kp_g5a_u03a1_factor_multiple_language",
  "kp_g5a_u03a1_grouping_constraints",
  "kp_g5a_u03a1_number_constraint_construction",
]);

function sourceOptions(sourceId, overrides = {}) {
  const patternCount = getP01D3PatternSpecIdsForSource(sourceId).length;
  return {
    sourceId,
    selectionMode: "sourceUnit",
    questionCount: patternCount * 2,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `p01d3-${sourceId}`,
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 5, showQuestionNumbers: true, showAnswerKeyPage: true },
    ...overrides,
  };
}

test("P01D3 publishes exactly twelve W1 KnowledgePoints and twenty-four PatternSpecs", () => {
  const selector = auditP01D3BatchASelectorComposition();
  const patterns = validateP01D3PatternDefinitions();
  assert.equal(selector.ok, true, JSON.stringify(selector.errors));
  assert.equal(patterns.ok, true, JSON.stringify(patterns.errors));
  assert.deepEqual(selector.counts, { addedKnowledgePoints: 12, globalVisibleKnowledgePoints: selector.counts.globalVisibleKnowledgePoints, patternGroups: 12, patternSpecs: 24, sourceNodes: 2 });
  assert.equal(G5A_U03_PATTERN_SPEC_IDS.length, 24);
  assert.equal(getP01D3PatternSpecIdsForSource(G5A_U03_SOURCE_ID).length, 14);
  assert.equal(getP01D3PatternSpecIdsForSource(G5A_U03A1_SOURCE_ID).length, 10);
  for (const knowledgePointId of KP_IDS) {
    const row = getVisibleBatchAKnowledgePoint(knowledgePointId);
    const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
    assert.ok(G5A_U03_SOURCE_IDS.includes(row?.sourceId));
    assert.equal(groups.length, 1);
    assert.equal(groups[0].patternSpecIds.length, 2);
  }
});

test("P01D3 extends isolated full-product authority to nineteen without changing the protected fifteen-unit registry", () => {
  const protectedBaseline = listBatchASourceUnits({ includePublicCandidates: false });
  const protectedPublicFleet = listBatchASourceUnits({ includePublicCandidates: true });
  const fullProductSources = listFullProductSourceUnits();
  assert.equal(protectedBaseline.length, 13);
  assert.equal(protectedPublicFleet.length, 15);
  assert.equal(G5A_U03_SOURCE_IDS.some((sourceId) => protectedPublicFleet.some((row) => row.sourceId === sourceId)), false);
  assert.equal(fullProductSources.length, 19);
  assert.deepEqual(G5A_U03_SOURCE_IDS.map((sourceId) => fullProductSources.find((row) => row.sourceId === sourceId)?.lifecycle), ["full_product_w1_vertical_slice", "full_product_w1_vertical_slice"]);
});

test("P01D3 shared factor-multiple primitives preserve mathematical invariants", () => {
  assert.deepEqual(divisorsOf(36), [1,2,3,4,6,9,12,18,36]);
  assert.deepEqual(multiplesInInterval(6, 13, 43), [18,24,30,36,42]);
  assert.deepEqual(divisibilitySet23510(330), [2,3,5,10]);
  assert.equal(classifyRelativeToBase(12, 3), "因數");
  assert.equal(classifyRelativeToBase(12, 24), "倍數");
  assert.equal(classifyRelativeToBase(12, 12), "兩者都是");
  assert.equal(classifyRelativeToBase(12, 5), "兩者皆非");
});

test("P01D3 source-unit plans deterministically cover all source-specific PatternSpecs", () => {
  for (const sourceId of G5A_U03_SOURCE_IDS) {
    const options = sourceOptions(sourceId);
    const expectedIds = getP01D3PatternSpecIdsForSource(sourceId);
    const plan = buildBatchABrowserPlan(options);
    assert.deepEqual(plan.patternSpecIds, expectedIds);
    assert.equal(validateBatchABrowserPlan(plan).ok, true);
    const first = generateBatchABrowserQuestions(options);
    const second = generateBatchABrowserQuestions(options);
    assert.equal(first.ok, true, JSON.stringify(first.errors));
    assert.deepEqual(first.questions, second.questions);
    assert.equal(first.questions.length, expectedIds.length * 2);
    assert.deepEqual([...new Set(first.questions.map((row) => row.patternSpecId))].sort(), [...expectedIds].sort());
    assert.equal(new Set(first.questions.map((row) => row.operation)).size, expectedIds.length);
    const validation = validateBatchABrowserQuestions(first.questions);
    assert.equal(validation.ok, true, JSON.stringify(validation.errors));
    assert.equal(validation.validatorVersion, "p01d3-g5a-u03-factor-multiple-v1");
  }
});

test("P01D3 supports bounded single-KP generation for all twelve KnowledgePoints", () => {
  for (const knowledgePointId of KP_IDS) {
    const row = getVisibleBatchAKnowledgePoint(knowledgePointId);
    const group = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)[0];
    const result = generateBatchABrowserQuestions(sourceOptions(row.sourceId, {
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [knowledgePointId],
      selectedPatternGroupIds: [group.patternGroupId],
      questionCount: 4,
      generationSeed: `p01d3-${knowledgePointId}`,
    }));
    assert.equal(result.ok, true, `${knowledgePointId}: ${JSON.stringify(result.errors)}`);
    assert.equal(result.questions.length, 4);
    assert.equal(result.questions.every((question) => group.patternSpecIds.includes(question.patternSpecId)), true);
    assert.equal(result.questions.every((question) => question.metadata.knowledgePointId === knowledgePointId), true);
  }
});

test("P01D3 validator fails closed for every admitted PatternSpec when the answer is tampered", () => {
  for (const sourceId of G5A_U03_SOURCE_IDS) {
    const generated = generateBatchABrowserQuestions(sourceOptions(sourceId, { questionCount: getP01D3PatternSpecIdsForSource(sourceId).length }));
    assert.equal(generated.ok, true, JSON.stringify(generated.errors));
    for (const original of generated.questions) {
      const report = validateG5AU03FactorMultipleQuestion({ ...original, answerText: "錯誤答案" });
      assert.equal(report.ok, false, original.patternSpecId);
    }
  }
});

test("P01D3 produces two source worksheets, answer keys, paginated HTML and print metadata on the shared path", () => {
  for (const sourceId of G5A_U03_SOURCE_IDS) {
    const result = buildBatchABrowserWorksheetDocument(sourceOptions(sourceId));
    assert.equal(result.ok, true, `${sourceId}: ${JSON.stringify(result.errors)}`);
    const document = result.worksheetDocument;
    const expectedCount = getP01D3PatternSpecIdsForSource(sourceId).length * 2;
    assert.equal(document.batchA.sourceId, sourceId);
    assert.equal(document.generatedQuestions.length, expectedCount);
    assert.equal(document.answerKeyItems.length, expectedCount);
    assert.ok(document.questionPages.length > 0);
    assert.ok(document.answerKeyPages.length > 0);
    const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
    assert.match(html, /<!doctype html>/);
    assert.match(html, /worksheet-page--questions/);
    assert.match(html, /worksheet-page--answer-key/);
    assert.doesNotMatch(html, /\{[A-Za-z_][^}]*\}/);
  }
});

test("P01D3 completes all twenty-one W1 product bindings while public dropdown cutover remains deferred", () => {
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
  console.log(`P01D3_G5A_U03_READBACK=${JSON.stringify({ sourceIds: G5A_U03_SOURCE_IDS, admittedKnowledgePointIds: KP_IDS, patternSpecIds: G5A_U03_PATTERN_SPEC_IDS, inventoryMetrics: inventory.metrics })}`);
});
