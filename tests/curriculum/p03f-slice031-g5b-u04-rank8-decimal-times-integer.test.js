import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  G5B_U04_P03F31_GROUP_ID,
  G5B_U04_P03F31_KP_ID,
  G5B_U04_P03F31_SOURCE_ID,
  G5B_U04_P03F31_SPEC_ID,
  P03F31_REQUIRED_CAPABILITY_IDS,
  auditG5BU04P03F31SelectorProjection,
} from "../../site/modules/curriculum/registry/g5b-u04-rank8-decimal-times-integer-selector-projection-p03f31.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f31-extension.js";
import {
  P03F31_SOURCE_WITNESS_FIXTURE,
  generateG5BU04P03F31Questions,
  validateG5BU04P03F31Question,
} from "../../site/modules/curriculum/batch-a/g5b-u04-rank8-decimal-times-integer-runtime-p03f31.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { resolvePublicUiCapabilityBinding, PUBLIC_UI_SURFACES } from "../../site/modules/curriculum/public/public-ui-capability-binding-p03f31.js";
import { listCurrentPixelSourceOptions, listPixelKnowledgePointsForSource } from "../../site/pixel/pixel-registry-bridge.js";
import { CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS } from "../../site/modules/curriculum/batch-a/source-units.js";
import { buildPublicGenerationCapabilityMatrixV6 } from "../../tools/curriculum/materialize-pgc-r01-public-capability-matrix-v6.mjs";
import { buildPgcR02UiCapabilityBindingContractR05 } from "../../tools/curriculum/materialize-pgc-r02-ui-capability-binding-r05.mjs";

const predecessor = JSON.parse(fs.readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice030-e6-d0-v1.json", import.meta.url), "utf8"));
const plan = (overrides = {}) => ({
  sourceId: G5B_U04_P03F31_SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G5B_U04_P03F31_KP_ID],
  selectedPatternGroupIds: [G5B_U04_P03F31_GROUP_ID],
  patternSpecIds: [G5B_U04_P03F31_SPEC_ID],
  questionMode: "numeric",
  questionCount: 24,
  generationSeed: "p03f31-source-witness-acceptance",
  includeAnswerKey: true,
  ordering: "groupedByPattern",
  printLayout: { paperSize:"A4", columns:2, rowsPerPage:4, showQuestionNumbers:true, showAnswerKeyPage:true },
  ...overrides,
});

test("P03F31 consumes queue position 31 only after Slice030 D0", () => {
  assert.equal(predecessor.status, "PASS_D0_CLOSED");
  assert.equal(predecessor.goalDistance, "D0");
  assert.equal(predecessor.nextResumeTask, "P03F_W3DirectProductVerticalSlice031Implementation");
});

test("P03F31 historical selector admits exactly one numeric source-backed KP", () => {
  const audit = auditG5BU04P03F31SelectorProjection();
  assert.equal(audit.ok, true, JSON.stringify(audit.errors));
  assert.deepEqual(audit.counts, { knowledgePoints:1, patternGroups:1, patternSpecs:1, numeric:1, application:0 });
  assert.deepEqual(P03F31_REQUIRED_CAPABILITY_IDS, ["cap_decimal_arithmetic","cap_decimal_domain_validator","cap_decimal_number_system"]);
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G5B_U04_P03F31_SOURCE_ID);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].knowledgePointId, G5B_U04_P03F31_KP_ID);
  assert.equal(rows[0].questionMode, "numeric");
  assert.equal(rows[0].applicationClassification, "APPLICATION_COMPATIBLE_FUTURE_QUEUE_RESERVED");
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5B_U04_P03F31_SOURCE_ID);
  assert.equal(availability.visibleCount, 1);
  assert.equal(availability.hiddenPendingCount, 0);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 225);
});

test("P03F31 current source and Pixel inventories expand monotonically through Slice049", () => {
  assert.equal(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.length, 33);
  assert.ok(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.some((row) => row.sourceId === G5B_U04_P03F31_SOURCE_ID));
  assert.equal(listCurrentPixelSourceOptions().length, 33);
  const pixelKps = listPixelKnowledgePointsForSource(G5B_U04_P03F31_SOURCE_ID);
  assert.equal(pixelKps.length, 5);
  assert.ok(pixelKps.some((row) => row.knowledgePointId === G5B_U04_P03F31_KP_ID));
  assert.ok(pixelKps.some((row) => row.knowledgePointId === "kp_g5b_u04_integer_times_decimal"));
  assert.ok(pixelKps.some((row) => row.knowledgePointId === "kp_g5b_u04_decimal_times_decimal"));
  assert.ok(pixelKps.some((row) => row.knowledgePointId === "kp_g5b_u04_decimal_multiplication_application"));
  assert.ok(pixelKps.some((row) => row.knowledgePointId === "kp_g5b_u04_decimal_multiplication_estimation"));
});

test("P03F31 replays the manually verified source witness through shared decimal arithmetic", () => {
  assert.deepEqual(P03F31_SOURCE_WITNESS_FIXTURE, { decimalCoefficient:672, integerFactor:18, scale:3 });
  const result = generateG5BU04P03F31Questions(plan());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 24);
  assert.equal(new Set(result.questions.map((row) => row.blankedDisplayText)).size, 24);
  const witness = result.questions[0];
  assert.equal(witness.promptText, "0.672 × 18 = ？");
  assert.equal(witness.answerText, "12.096");
  assert.equal(witness.finalAnswer.coefficient, "12096");
  assert.equal(witness.finalAnswer.scale, 3);
  assert.equal(witness.finalAnswer.arithmeticModel, "COEFFICIENT_PRODUCT_SCALE_SUM");
  assert.equal(witness.metadata.sourceReviewMethod, "FULL_PAGE_VISUAL_READBACK_NO_OCR_AUTHORITY");
  for (const question of result.questions) {
    assert.equal(validateG5BU04P03F31Question(question).ok, true);
    assert.equal(question.decimalScale, 3);
    assert.ok(question.integerFactor >= 2 && question.integerFactor <= 20);
    assert.equal(question.questionMode, "numeric");
    assert.equal(question.globalContextProduction, null);
    assert.deepEqual(question.metadata.requiredCapabilityIds, P03F31_REQUIRED_CAPABILITY_IDS);
  }
});

test("P03F31 validator rejects arithmetic, domain and future-mode tampering", () => {
  const question = generateG5BU04P03F31Questions(plan({ questionCount:1 })).questions[0];
  assert.equal(validateG5BU04P03F31Question({ ...question, product:"99" }).ok, false);
  assert.equal(validateG5BU04P03F31Question({ ...question, decimalScale:2 }).ok, false);
  assert.equal(validateG5BU04P03F31Question({ ...question, integerFactor:0 }).ok, false);
  assert.equal(validateG5BU04P03F31Question({ ...question, questionMode:"application" }).ok, false);
});

test("P03F31 public resolver exposes numeric only on all public surfaces", () => {
  for (const surfaceId of Object.values(PUBLIC_UI_SURFACES)) {
    const binding = resolvePublicUiCapabilityBinding({ sourceId:G5B_U04_P03F31_SOURCE_ID, surfaceId, selectionMode:"singleKnowledgePoint", selectedKnowledgePointIds:[G5B_U04_P03F31_KP_ID] });
    assert.equal(binding.blocked, false, `${surfaceId}: ${binding.blockedReasons.join("|")}`);
    assert.deepEqual(binding.availableQuestionTypeOptions.map((row) => row.value), ["numeric"]);
    assert.deepEqual(binding.compatiblePatternGroupIds, [G5B_U04_P03F31_GROUP_ID]);
    assert.deepEqual(binding.depthOptions, []);
    assert.deepEqual(binding.contextOptions, []);
  }
});

test("P03F31 stable worksheet entry produces printable questions and answer key", () => {
  const result = buildBatchABrowserWorksheetDocument(plan());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.batchA.sourceId, G5B_U04_P03F31_SOURCE_ID);
  assert.equal(result.worksheetDocument.generatedQuestions.length, 24);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 24);
  assert.equal(result.worksheetDocument.questionPages.length, 3);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 3);
  assert.equal(result.worksheetDocument.metadata.applicationExpansion, false);
});

test("P03F31 remains fully accounted after R01 V6 advances current authority to Slice032", () => {
  const matrix = buildPublicGenerationCapabilityMatrixV6();
  assert.equal(matrix.summary.publicSourceCount, 32);
  assert.equal(matrix.summary.publicVisibleKnowledgePointCount, 226);
  assert.equal(matrix.summary.blockingGapCount, 0, JSON.stringify(matrix.gaps.filter((gap) => gap.severity === "blocking_r01")));
  const rows = matrix.capabilities.filter((row) => row.knowledgePointId === G5B_U04_P03F31_KP_ID);
  assert.equal(rows.length, 3);
  assert.deepEqual(new Set(rows.map((row) => row.surfaceId)), new Set(Object.values(PUBLIC_UI_SURFACES)));
  assert.ok(rows.every((row) => row.patternSpecId === G5B_U04_P03F31_SPEC_ID && row.questionType === "NUMERIC"));
});

test("P03F31 remains fully bound after R02 R05 advances current binding to Slice032", () => {
  const contract = buildPgcR02UiCapabilityBindingContractR05();
  assert.equal(contract.status, "PASS", JSON.stringify(contract.gaps));
  assert.equal(contract.summary.publicSourceCount, 32);
  assert.equal(contract.summary.visibleKnowledgePointCount, 226);
  assert.equal(contract.summary.gapCount, 0);
  const rows = contract.bindings.filter((row) => row.sourceId === G5B_U04_P03F31_SOURCE_ID);
  assert.equal(rows.length, 6);
  assert.ok(rows.every((row) => row.questionType === "numeric" && row.compatiblePatternSpecIds.includes(G5B_U04_P03F31_SPEC_ID)));
});

test("P03F31 historical corpus does not admit later G5B-U04 decimal multiplication capabilities", () => {
  const corpus = JSON.stringify({
    selector:listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===G5B_U04_P03F31_SOURCE_ID),
    capabilities:buildPublicGenerationCapabilityMatrixV6().capabilities.filter((row)=>row.sourceId===G5B_U04_P03F31_SOURCE_ID),
  });
  assert.doesNotMatch(corpus, /kp_g5b_u04_integer_times_decimal/);
  assert.doesNotMatch(corpus, /kp_g5b_u04_decimal_times_decimal/);
  assert.doesNotMatch(corpus, /kp_g5b_u04_decimal_multiplication_application/);
  assert.doesNotMatch(corpus, /kp_g5b_u04_decimal_multiplication_estimation/);
});