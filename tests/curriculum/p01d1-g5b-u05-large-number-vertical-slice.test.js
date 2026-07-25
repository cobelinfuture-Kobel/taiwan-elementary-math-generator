import test from "node:test";
import assert from "node:assert/strict";

import {
  auditP01D1BatchASelectorComposition,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G5B_U05_PATTERN_SPEC_IDS,
  G5B_U05_SOURCE_ID,
  validateP01D1PatternDefinitions,
} from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p01d1-extension.js";
import {
  listBatchASourceUnits,
  listFullProductSourceUnits,
} from "../../site/modules/curriculum/batch-a/source-units.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import {
  chineseLargeToNumber,
  numberToChineseLarge,
  validateG5BU05LargeNumberQuestion,
} from "../../site/modules/curriculum/batch-a/g5b-u05-large-number-generator.js";
import {
  validateBatchABrowserPlan,
  validateBatchABrowserQuestions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import { materializeP01AW1ProductAdmissionInventory } from "../../src/curriculum/full-product/p01-w1-product-admission-inventory.mjs";

const KP_IDS = Object.freeze([
  "kp_g5b_u05a_large_number_place_value_extension",
  "kp_g5b_u05a_large_number_read_write",
  "kp_g5b_u05a_power_of_ten_scaling",
  "kp_g5b_u05a_large_number_decompose_compare",
]);
const DECIMAL_KP_ID = "kp_g5b_u05a_decimal_base10_structure";

function sourceUnitOptions(overrides = {}) {
  return {
    sourceId: G5B_U05_SOURCE_ID,
    selectionMode: "sourceUnit",
    questionCount: 16,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "p01d1-source-unit",
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
    ...overrides,
  };
}

test("P01D1 publishes exactly four W1 KnowledgePoints and eight PatternSpecs", () => {
  const selectorAudit = auditP01D1BatchASelectorComposition();
  const patternAudit = validateP01D1PatternDefinitions();
  assert.equal(selectorAudit.ok, true, JSON.stringify(selectorAudit.errors));
  assert.equal(patternAudit.ok, true, JSON.stringify(patternAudit.errors));
  assert.equal(selectorAudit.counts.addedKnowledgePoints, 4);
  assert.equal(selectorAudit.counts.patternGroups, 4);
  assert.equal(selectorAudit.counts.patternSpecs, 8);
  assert.equal(G5B_U05_PATTERN_SPEC_IDS.length, 8);
  for (const knowledgePointId of KP_IDS) {
    const row = getVisibleBatchAKnowledgePoint(knowledgePointId);
    const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
    assert.equal(row?.sourceId, G5B_U05_SOURCE_ID);
    assert.equal(groups.length, 1);
    assert.equal(groups[0].patternSpecIds.length, 2);
  }
  assert.equal(getVisibleBatchAKnowledgePoint(DECIMAL_KP_ID), null);
  assert.equal(listVisibleBatchAKnowledgePoints().some((row) => row.knowledgePointId === DECIMAL_KP_ID), false);
});

test("P01D1 exposes a separate sixteenth full-product source without changing protected source registries", () => {
  const protectedBaseline = listBatchASourceUnits({ includePublicCandidates: false });
  const protectedPublicFleet = listBatchASourceUnits({ includePublicCandidates: true });
  const fullProductSources = listFullProductSourceUnits();
  assert.equal(protectedBaseline.length, 13);
  assert.equal(protectedPublicFleet.length, 15);
  assert.equal(protectedPublicFleet.some((row) => row.sourceId === G5B_U05_SOURCE_ID), false);
  assert.equal(fullProductSources.length, 16);
  const source = fullProductSources.find((row) => row.sourceId === G5B_U05_SOURCE_ID);
  assert.equal(source?.unitCode, "5B-U05");
  assert.equal(source?.lifecycle, "full_product_w1_vertical_slice");
});

test("P01D1 Chinese large-number conversion round-trips through 萬、億、兆 sections", () => {
  const values = [100000000, 100000001, 305060708090, 800700600500400];
  for (const value of values) {
    const chinese = numberToChineseLarge(value);
    assert.equal(chineseLargeToNumber(chinese), value, `${value} -> ${chinese}`);
  }
  assert.equal(numberToChineseLarge(100000000), "一億");
  assert.equal(numberToChineseLarge(1000000000000), "一兆");
});

test("P01D1 source-unit plan and generator cover all eight PatternSpecs deterministically", () => {
  const options = sourceUnitOptions();
  const plan = buildBatchABrowserPlan(options);
  assert.equal(plan.sourceId, G5B_U05_SOURCE_ID);
  assert.deepEqual(plan.patternSpecIds, [...G5B_U05_PATTERN_SPEC_IDS]);
  assert.equal(validateBatchABrowserPlan(plan).ok, true);
  const first = generateBatchABrowserQuestions(options);
  const second = generateBatchABrowserQuestions(options);
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.equal(first.questions.length, 16);
  assert.deepEqual(first.questions, second.questions);
  assert.deepEqual([...new Set(first.questions.map((question) => question.patternSpecId))].sort(), [...G5B_U05_PATTERN_SPEC_IDS].sort());
  assert.equal(new Set(first.questions.map((question) => question.operation)).size, 8);
  const validation = validateBatchABrowserQuestions(first.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
  assert.equal(validation.validatorVersion, "p01d1-g5b-u05-large-number-v1");
});

test("P01D1 supports bounded single-KP selection through the shared visible resolver", () => {
  for (const knowledgePointId of KP_IDS) {
    const group = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)[0];
    const options = sourceUnitOptions({
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [knowledgePointId],
      selectedPatternGroupIds: [group.patternGroupId],
      questionCount: 4,
      generationSeed: `p01d1-${knowledgePointId}`,
    });
    const result = generateBatchABrowserQuestions(options);
    assert.equal(result.ok, true, `${knowledgePointId}: ${JSON.stringify(result.errors)}`);
    assert.equal(result.questions.length, 4);
    assert.equal(result.questions.every((question) => group.patternSpecIds.includes(question.patternSpecId)), true);
    assert.equal(result.questions.every((question) => question.metadata.knowledgePointId === knowledgePointId), true);
  }
});

test("P01D1 validator fails closed when a generated answer is tampered", () => {
  const generated = generateBatchABrowserQuestions(sourceUnitOptions({ questionCount: 8 }));
  assert.equal(generated.ok, true);
  const original = generated.questions[0];
  const tampered = { ...original, answerText: "錯誤答案" };
  const report = validateG5BU05LargeNumberQuestion(tampered);
  assert.equal(report.ok, false);
  assert.ok(report.errors.length > 0);
});

test("P01D1 produces worksheet, answer key, paginated HTML and print-ready metadata on the shared path", () => {
  const result = buildBatchABrowserWorksheetDocument(sourceUnitOptions({ questionCount: 16 }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.batchA.sourceId, G5B_U05_SOURCE_ID);
  assert.equal(document.generatedQuestions.length, 16);
  assert.equal(document.answerKeyItems.length, 16);
  assert.ok(document.questionPages.length > 0);
  assert.ok(document.answerKeyPages.length > 0);
  assert.equal(document.batchA.patternSpecIds.length, 8);
  assert.equal(document.generatedQuestions.every((question) => question.metadata.sourceId === G5B_U05_SOURCE_ID), true);
  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  assert.match(html, /<!doctype html>/);
  assert.match(html, /worksheet-page--questions/);
  assert.match(html, /worksheet-page--answer-key/);
  assert.doesNotMatch(html, /\{[A-Za-z_][^}]*\}/);
});

test("P01D1 updates the W1 inventory from 0 admitted patterns to four admitted patterns and 17 remaining slices", () => {
  const inventory = materializeP01AW1ProductAdmissionInventory();
  assert.equal(inventory.metrics.knowledgePointCount, 21);
  assert.equal(inventory.metrics.sourceNodeCount, 4);
  assert.equal(inventory.metrics.publicKnowledgePointVisibleCount, 4);
  assert.equal(inventory.metrics.publicPatternBindingPresentCount, 4);
  assert.equal(inventory.metrics.publicSourceSelectableCount, 1);
  assert.equal(inventory.metrics.admissionReadyExistingPublicPatternCount, 4);
  assert.equal(inventory.metrics.patternGroupOrSpecBindingRequiredCount, 0);
  assert.equal(inventory.metrics.publicProductVerticalSliceRequiredCount, 17);
  for (const knowledgePointId of KP_IDS) {
    const row = inventory.getRow(knowledgePointId);
    assert.equal(row.productGapState, "ADMISSION_READY_EXISTING_PUBLIC_PATTERN");
    assert.equal(row.currentProductCoverage.publicSourceSelectable, true);
    assert.equal(row.currentProductCoverage.patternSpecIds.length, 2);
  }

  console.log(`P01D1_G5B_U05_READBACK=${JSON.stringify({
    sourceId: G5B_U05_SOURCE_ID,
    admittedKnowledgePointIds: KP_IDS,
    excludedKnowledgePointId: DECIMAL_KP_ID,
    patternSpecIds: G5B_U05_PATTERN_SPEC_IDS,
    inventoryMetrics: inventory.metrics,
  })}`);
});
