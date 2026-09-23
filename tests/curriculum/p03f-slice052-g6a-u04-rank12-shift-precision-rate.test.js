import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  G6A_U04_P03F52_PRECISION_KP_ID,
  G6A_U04_P03F52_PRECISION_SPEC_ID,
  G6A_U04_P03F52_RATE_KP_ID,
  G6A_U04_P03F52_RATE_SPEC_ID,
  G6A_U04_P03F52_SHIFT_KP_ID,
  G6A_U04_P03F52_SHIFT_SPEC_ID,
  G6A_U04_P03F52_SOURCE_ID,
  auditG6AU04P03F52SelectorProjection,
} from "../../site/modules/curriculum/registry/g6a-u04-rank12-shift-precision-rate-selector-projection-p03f52.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP03F52PublicSelectorComposition,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f52-extension.js";
import {
  P03F52_SOURCE_PATTERN_EXTENSION,
  getBatchASourcePatternDefinition,
} from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f52-extension.js";
import {
  generateG6AU04P03F52Questions,
  validateG6AU04P03F52Question,
} from "../../site/modules/curriculum/batch-a/g6a-u04-rank12-shift-precision-rate-runtime-p03f52.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f52.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f52.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f52.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f52-extension.js";
import { PUBLIC_UI_SURFACES, resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding-p03f52.js";
import { G6A_U04_P03F51_SPEC_ID } from "../../site/modules/curriculum/registry/g6a-u04-rank11-decimal-divided-by-decimal-selector-projection-p03f51.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";

const readJson = (relativePath) => JSON.parse(readFileSync(new URL(relativePath, import.meta.url), "utf8"));
const authority = readJson("../../data/curriculum/full-product/p03f/slice052-g6a-u04-rank12-shift-precision-rate-authority.json");
const resolution = readJson("../../data/curriculum/full-product/p03f/slice052-g6a-u04-direct-source-witness-resolution.json");
const q051Claim = readJson("../../data/curriculum/final-milestone-claims/p03f-w3-slice051-e6-d0-v1.json");

const TARGET_KPS = [G6A_U04_P03F52_SHIFT_KP_ID, G6A_U04_P03F52_PRECISION_KP_ID, G6A_U04_P03F52_RATE_KP_ID];
const TARGET_SPECS = [G6A_U04_P03F52_SHIFT_SPEC_ID, G6A_U04_P03F52_PRECISION_SPEC_ID, G6A_U04_P03F52_RATE_SPEC_ID];

function decimalFraction(text) {
  const raw = String(text);
  const [whole, fraction = ""] = raw.split(".");
  return { numerator: BigInt(`${whole}${fraction}`), denominator: 10n ** BigInt(fraction.length) };
}
function equalRational(left, right) {
  return left.numerator * right.denominator === right.numerator * left.denominator;
}
function quotientRational(dividend, divisor) {
  return {
    numerator: dividend.numerator * divisor.denominator,
    denominator: dividend.denominator * divisor.numerator,
  };
}

test("P03F52 authority binds exact q052, resolved source evidence, and q053 exclusion", () => {
  assert.equal(q051Claim.status, "PASS_D0_CLOSED");
  assert.equal(resolution.status, "PASS_SOURCE_WITNESS_RESOLVED_WITH_OPERATOR_APPROVED_EXTENSIONS");
  assert.equal(authority.queueAuthority.queuePosition, 52);
  assert.equal(authority.queueAuthority.sliceId, "p03e_q052_r12_g6a_u04_6a04_profile_decimal_c1");
  assert.deepEqual(authority.queueAuthority.knowledgePointIds, TARGET_KPS);
  assert.deepEqual(authority.queueAuthority.reservedNextSliceKnowledgePointIds, ["kp_g6a_u04_decimal_division_rounding"]);
  assert.equal(authority.sourceAuthority.sourceSha256, "1e1790a2fe9a91e4d819d0c9ff93d3065dde536887d93c5e20323f7011df8f50");
  assert.equal(authority.sourceAuthority.decimalShiftDirectTextbookWitness, true);
  assert.equal(authority.sourceAuthority.quotientPrecisionZeroFillOperatorApprovedExtension, true);
  assert.equal(authority.sourceAuthority.rateApplicationOperatorApprovedExtension, true);
  assert.equal(authority.sourceAuthority.generatedExtensionExampleClaimedAsTextbook, false);
  assert.equal(authority.implementationBoundary.q053Included, false);
  assert.equal(authority.implementationBoundary.roundingIncluded, false);
});

test("P03F52 selector and source-pattern contracts expose exactly three new specs on 34/258 current authority", () => {
  assert.equal(auditG6AU04P03F52SelectorProjection().ok, true);
  assert.equal(auditP03F52PublicSelectorComposition().ok, true);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount, 34);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 258);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G6A_U04_P03F52_SOURCE_ID);
  assert.deepEqual([availability.visibleCount, availability.hiddenPendingCount, availability.notSelectableCount], [4, 1, 1]);
  assert.deepEqual(availability.hiddenPendingKnowledgePointIds, ["kp_g6a_u04_decimal_division_rounding"]);
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => TARGET_KPS.includes(row.knowledgePointId));
  assert.equal(rows.length, 3);
  assert.equal(P03F52_SOURCE_PATTERN_EXTENSION.addedPatternSpecCount, 3);
  for (const spec of TARGET_SPECS) assert.ok(getBatchASourcePatternDefinition(spec));
  assert.equal(getBatchASourcePatternDefinition(G6A_U04_P03F52_PRECISION_SPEC_ID).zeroFillOperatorApprovedExtension, true);
  assert.equal(getBatchASourcePatternDefinition(G6A_U04_P03F52_PRECISION_SPEC_ID).generatedExampleClaimedAsTextbook, false);
  assert.equal(getBatchASourcePatternDefinition(G6A_U04_P03F52_RATE_SPEC_ID).operatorApprovedExtension, true);
  assert.equal(getBatchASourcePatternDefinition(G6A_U04_P03F52_RATE_SPEC_ID).directTextbookConceptWitness, false);
});

test("P03F52 decimal-shift generator preserves exact same-power-of-ten scaling", () => {
  const result = generateG6AU04P03F52Questions({
    sourceId: G6A_U04_P03F52_SOURCE_ID,
    patternSpecIds: [G6A_U04_P03F52_SHIFT_SPEC_ID],
    questionMode: "numeric",
    questionCount: 18,
    generationSeed: "p03f52-shift-focused",
  });
  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 18);
  for (const question of result.questions) {
    assert.equal(validateG6AU04P03F52Question(question).ok, true);
    assert.equal(question.shiftPlaces, question.divisorScale);
    assert.equal(question.answerText, String(question.shiftPlaces));
    assert.equal(String(question.scaledDivisor).includes("."), false);
    const before = quotientRational(decimalFraction(question.decimalDividend), decimalFraction(question.decimalDivisor));
    const after = quotientRational(decimalFraction(question.scaledDividend), decimalFraction(question.scaledDivisor));
    assert.equal(equalRational(before, after), true);
    assert.equal(question.metadata.directTextbookConceptWitness, true);
    assert.equal(question.metadata.operatorApprovedExtension, false);
    assert.equal(question.metadata.q053RoundingExpansion, false);
  }
});

test("P03F52 quotient-precision generator pads exact values without rounding or textbook overclaim", () => {
  const result = generateG6AU04P03F52Questions({
    sourceId: G6A_U04_P03F52_SOURCE_ID,
    patternSpecIds: [G6A_U04_P03F52_PRECISION_SPEC_ID],
    questionMode: "numeric",
    questionCount: 18,
    generationSeed: "p03f52-precision-focused",
  });
  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 18);
  for (const question of result.questions) {
    assert.equal(validateG6AU04P03F52Question(question).ok, true);
    assert.ok(question.requestedScale > question.exactScale);
    assert.equal((question.answerText.split(".")[1] ?? "").length, question.requestedScale);
    assert.ok(question.answerText.endsWith("0"));
    assert.equal(equalRational(decimalFraction(question.answerText), decimalFraction(question.exactQuotient)), true);
    assert.equal(question.metadata.directPrecisionTextbookWitness, true);
    assert.equal(question.metadata.zeroFillOperatorApprovedExtension, true);
    assert.equal(question.metadata.generatedExampleClaimedAsTextbook, false);
    assert.equal(question.metadata.roundingApplied, false);
    assert.equal(question.metadata.truncationApplied, false);
    assert.equal(question.metadata.q053RoundingExpansion, false);
  }
});

test("P03F52 rate-application generator is bounded exact curriculum extension", () => {
  const result = generateG6AU04P03F52Questions({
    sourceId: G6A_U04_P03F52_SOURCE_ID,
    patternSpecIds: [G6A_U04_P03F52_RATE_SPEC_ID],
    questionMode: "application",
    questionCount: 18,
    generationSeed: "p03f52-rate-focused",
  });
  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 18);
  for (const question of result.questions) {
    assert.equal(validateG6AU04P03F52Question(question).ok, true);
    assert.ok(question.groupScale >= 1);
    assert.equal(equalRational(quotientRational(decimalFraction(question.totalAmount), decimalFraction(question.groupCount)), decimalFraction(question.unitAmount)), true);
    assert.equal(question.metadata.operatorApprovedExtension, true);
    assert.equal(question.metadata.directTextbookConceptWitness, false);
    assert.equal(question.metadata.generatedExampleClaimedAsTextbook, false);
    assert.equal(question.metadata.exactReconstructionRequired, true);
    assert.equal(question.metadata.q053RoundingExpansion, false);
  }
});

test("P03F52 browser planning preserves q051 numeric path and isolates application mode", () => {
  const numericPlan = buildBatchABrowserPlan({
    sourceId: G6A_U04_P03F52_SOURCE_ID,
    selectionMode: "sourceUnit",
    questionMode: "numeric",
    questionCount: 24,
    generationSeed: "p03f52-source-numeric",
  });
  assert.equal(validateBatchABrowserPlan(numericPlan).ok, true);
  assert.ok(numericPlan.patternSpecIds.includes(G6A_U04_P03F51_SPEC_ID));
  assert.ok(numericPlan.patternSpecIds.includes(G6A_U04_P03F52_SHIFT_SPEC_ID));
  assert.ok(numericPlan.patternSpecIds.includes(G6A_U04_P03F52_PRECISION_SPEC_ID));
  assert.equal(numericPlan.patternSpecIds.includes(G6A_U04_P03F52_RATE_SPEC_ID), false);
  const numericGeneration = generateBatchABrowserQuestions({ plan: numericPlan, questionCount: 24, generationSeed: "p03f52-source-numeric" });
  assert.equal(numericGeneration.ok, true);
  assert.equal(validateBatchABrowserQuestions(numericGeneration.questions).ok, true);

  const appPlan = buildBatchABrowserPlan({
    sourceId: G6A_U04_P03F52_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [G6A_U04_P03F52_RATE_KP_ID],
    questionMode: "application",
    questionCount: 12,
    generationSeed: "p03f52-rate-plan",
  });
  assert.equal(validateBatchABrowserPlan(appPlan).ok, true);
  assert.deepEqual(appPlan.patternSpecIds, [G6A_U04_P03F52_RATE_SPEC_ID]);
});

test("P03F52 public binding exposes four G6A-U04 KPs with numeric and application surfaces", () => {
  const sourceBinding = resolvePublicUiCapabilityBinding({
    sourceId: G6A_U04_P03F52_SOURCE_ID,
    surfaceId: PUBLIC_UI_SURFACES.CLASSIC,
    selectionMode: "sourceUnit",
  });
  assert.equal(sourceBinding.blocked, false);
  assert.equal(sourceBinding.selectedKnowledgePointCount, 4);
  assert.deepEqual(new Set(sourceBinding.availableQuestionTypeOptions.map((row) => row.value)), new Set(["numeric", "application"]));
  assert.equal(sourceBinding.questionType, "numeric");

  const rateBinding = resolvePublicUiCapabilityBinding({
    sourceId: G6A_U04_P03F52_SOURCE_ID,
    surfaceId: PUBLIC_UI_SURFACES.PIXEL,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [G6A_U04_P03F52_RATE_KP_ID],
  });
  assert.equal(rateBinding.blocked, false);
  assert.equal(rateBinding.questionType, "application");
  assert.equal(rateBinding.operatorApprovedExtension, true);
});

test("P03F52 worksheet adapter renders exact numeric and application routes without q053 leakage", () => {
  const numeric = buildBatchABrowserWorksheetDocument({
    sourceId: G6A_U04_P03F52_SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [G6A_U04_P03F52_SHIFT_KP_ID, G6A_U04_P03F52_PRECISION_KP_ID],
    questionMode: "numeric",
    questionCount: 24,
    generationSeed: "p03f52-worksheet-numeric",
    includeAnswerKey: true,
  });
  assert.equal(numeric.ok, true);
  assert.equal(numeric.worksheetDocument.questionCount, 24);
  assert.equal(numeric.worksheetDocument.answerKeyItems.length, 24);
  assert.equal(numeric.worksheetDocument.metadata.slice053Expansion, false);
  assert.equal(numeric.worksheetDocument.metadata.roundingExpansion, false);
  assert.equal(numeric.worksheetDocument.metadata.zeroFillOperatorApprovedExtension, true);

  const application = buildBatchABrowserWorksheetDocument({
    sourceId: G6A_U04_P03F52_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [G6A_U04_P03F52_RATE_KP_ID],
    questionMode: "application",
    questionCount: 12,
    generationSeed: "p03f52-worksheet-application",
    includeAnswerKey: true,
  });
  assert.equal(application.ok, true);
  assert.equal(application.worksheetDocument.questionCount, 12);
  assert.equal(application.worksheetDocument.answerKeyItems.length, 12);
  assert.equal(application.worksheetDocument.summary.applicationQuestionCount, 12);
  assert.equal(application.worksheetDocument.metadata.rateApplicationOperatorApprovedExtension, true);
  assert.equal(application.worksheetDocument.metadata.generatedExtensionExampleClaimedAsTextbook, false);
  assert.equal(application.worksheetDocument.metadata.slice053Expansion, false);
});

test("P03F52 current Pixel authority is 34/259 and G6A-U04 is 5/0/0", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 35);
  assert.equal(pixel.visibleKnowledgePointCount, 260);
  const source = pixel.bySourceId[G6A_U04_P03F52_SOURCE_ID];
  assert.ok(source);
  assert.equal(source.visibleKnowledgePoints.length, 5);
  assert.equal(source.hiddenPendingCount, 0);
  assert.equal(source.notSelectableCount, 0);
  assert.deepEqual(new Set(source.visibleKnowledgePoints.map((row) => row.knowledgePointId)), new Set(["kp_g6a_u04_decimal_divided_by_decimal", ...TARGET_KPS, "kp_g6a_u04_decimal_division_rounding"]));
});
