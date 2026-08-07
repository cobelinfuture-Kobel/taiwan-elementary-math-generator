import test from "node:test";
import assert from "node:assert/strict";

import {
  G4B_U08_P03F27_HIDDEN_APPLICATION_SPEC_IDS,
  G4B_U08_P03F27_KP_IDS,
  G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS,
  G4B_U08_P03F27_SELECTOR_PROJECTION,
  auditG4BU08P03F27SelectorProjection,
} from "../../site/modules/curriculum/registry/g4b-u08-rank8-fraction-selector-projection-p03f27.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP03F27PublicSelectorComposition,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f27-extension.js";
import {
  P03F27_FRACTION_CAPABILITY_IDS,
  validateP03F27PatternDefinitions,
} from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f27-extension.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f27.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f27.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f27.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f27-extension.js";

const SOURCE_ID = "g4b_u08_4b08";
const BASE_OPTIONS = Object.freeze({
  sourceId: SOURCE_ID,
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: G4B_U08_P03F27_KP_IDS,
  selectedPatternGroupIds: [
    "pg_g4b_u08_fraction_compare_cross_product_numeric",
    "pg_g4b_u08_unlike_denominator_add_sub_numeric",
  ],
  patternSpecIds: G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS,
  questionMode: "numeric",
  questionCount: 24,
  generationSeed: "p03f27-focused",
  includeAnswerKey: true,
});

test("P03F27 selector projection adds exactly two numeric KPs to existing G4B-U08", () => {
  assert.deepEqual(auditG4BU08P03F27SelectorProjection().errors, []);
  assert.deepEqual(auditP03F27PublicSelectorComposition().errors, []);
  assert.equal(G4B_U08_P03F27_SELECTOR_PROJECTION.knowledgePointCount, 2);
  assert.equal(G4B_U08_P03F27_SELECTOR_PROJECTION.patternGroupCount, 2);
  assert.equal(G4B_U08_P03F27_SELECTOR_PROJECTION.patternSpecCount, 2);
  assert.equal(G4B_U08_P03F27_SELECTOR_PROJECTION.applicationPatternSpecCount, 0);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 218);
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);
  assert.equal(availability.visibleCount, 5);
  assert.equal(availability.hiddenPendingCount, 2);
  assert.equal(listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID).length, 5);
  assert.ok(G4B_U08_P03F27_HIDDEN_APPLICATION_SPEC_IDS.every((id) => !G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS.includes(id)));
});

test("P03F27 pattern definitions require all three shared fraction capabilities", () => {
  assert.deepEqual(validateP03F27PatternDefinitions().errors, []);
  assert.deepEqual(P03F27_FRACTION_CAPABILITY_IDS, [
    "cap_fraction_arithmetic",
    "cap_fraction_domain_validator",
    "cap_fraction_number_system",
  ]);
});

test("P03F27 browser plan is bounded numeric-only and fail-closes generic fallback", () => {
  const plan = buildBatchABrowserPlan(BASE_OPTIONS);
  assert.equal(plan.sourceId, SOURCE_ID);
  assert.equal(plan.questionMode, "numeric");
  assert.equal(plan.genericFallbackAllowed, false);
  assert.deepEqual(plan.patternSpecIds, G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS);
  assert.deepEqual(plan.requestedKnowledgePointIds, G4B_U08_P03F27_KP_IDS);
  assert.equal(plan.publicControls.globalContextAuthority, "NOT_APPLICABLE_FOR_PUBLIC_SLICE027");
  assert.deepEqual(validateBatchABrowserPlan(plan).errors, []);
});

test("P03F27 generates and validates 24 exact-rational questions across both PatternSpecs", () => {
  const generation = generateBatchABrowserQuestions(BASE_OPTIONS);
  assert.equal(generation.ok, true, JSON.stringify(generation.errors));
  assert.equal(generation.questions.length, 24);
  assert.deepEqual([...new Set(generation.questions.map((q) => q.patternSpecId))].sort(), [...G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS].sort());
  assert.deepEqual([...new Set(generation.questions.map((q) => q.operation))].sort(), ["fraction_add_sub", "fraction_compare"]);
  assert.ok(generation.questions.every((q) => q.questionMode === "numeric" && q.globalContextProduction == null));
  assert.ok(generation.questions.every((q) => P03F27_FRACTION_CAPABILITY_IDS.every((cap) => q.metadata.requiredCapabilityIds.includes(cap))));
  assert.ok(generation.questions.every((q) => q.leftDenominator > 0 && q.rightDenominator > 0 && q.leftDenominator !== q.rightDenominator));
  const validation = validateBatchABrowserQuestions(generation.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
  assert.deepEqual(validation.errors, []);
});

test("P03F27 comparison includes equality and non-equality witnesses", () => {
  const generation = generateBatchABrowserQuestions({ ...BASE_OPTIONS, patternSpecIds: [G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS[0]], questionCount: 20 });
  const answers = new Set(generation.questions.map((q) => q.answerText));
  assert.ok(answers.has("="));
  assert.ok(answers.has("<") || answers.has(">"));
});

test("P03F27 add/sub witnesses are exact, reduced and nonnegative on subtraction", () => {
  const generation = generateBatchABrowserQuestions({ ...BASE_OPTIONS, patternSpecIds: [G4B_U08_P03F27_NUMERIC_PATTERN_SPEC_IDS[1]], questionCount: 20 });
  assert.equal(generation.ok, true, JSON.stringify(generation.errors));
  assert.ok(generation.questions.some((q) => q.arithmeticOperation === "add"));
  assert.ok(generation.questions.some((q) => q.arithmeticOperation === "sub"));
  for (const q of generation.questions) {
    assert.ok(q.resultDenominator > 0);
    assert.equal(q.finalAnswer, q.answerText);
    if (q.arithmeticOperation === "sub") assert.ok(q.resultNumerator >= 0);
  }
});

test("P03F27 worksheet uses shared pagination and keeps answers aligned", () => {
  const result = buildBatchABrowserWorksheetDocument(BASE_OPTIONS);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const doc = result.worksheetDocument;
  assert.equal(doc.questionCount, 24);
  assert.equal(doc.questionDisplayModels.length, 24);
  assert.equal(doc.answerKeyItems.length, 24);
  assert.equal(doc.summary.applicationQuestionCount, 0);
  assert.equal(doc.metadata.hiddenApplicationLineagePreserved, true);
  assert.equal(doc.metadata.worksheetAdapter.sharedPagination, true);
  assert.equal(doc.metadata.worksheetAdapter.sharedRenderer, true);
  assert.equal(doc.metadata.worksheetAdapter.parallelPipeline, false);
  assert.deepEqual(doc.metadata.knowledgePointIds, G4B_U08_P03F27_KP_IDS);
  for (let index = 0; index < 24; index += 1) {
    assert.equal(doc.questionDisplayModels[index].questionId, doc.answerKeyItems[index].questionId);
    assert.equal(doc.questionDisplayModels[index].answerText, doc.answerKeyItems[index].answerText);
  }
});
