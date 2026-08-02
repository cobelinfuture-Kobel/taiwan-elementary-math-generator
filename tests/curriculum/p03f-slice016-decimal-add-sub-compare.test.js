import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  auditG3BU09DecimalArithmeticSelectorProjection,
  G3B_U09_DECIMAL_ADD_SUB_KP_ID,
  G3B_U09_DECIMAL_COMPARE_KP_ID,
  G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS,
  G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g3b-u09-decimal-add-sub-compare-selector-projection.js";
import {
  auditP03F16PublicSelectorComposition,
  BATCH_A_SELECTOR_AVAILABILITY,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f16-extension.js";
import { validateP03F16PatternDefinitions } from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f16-extension.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f16.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f16.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f16.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f16-extension.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";

const SOURCE_ID = "g3b_u09_3b09";
const ALL_SPECS = [...G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS, ...G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS];
const OPTIONS = Object.freeze({
  sourceId: SOURCE_ID,
  selectedKnowledgePointIds: [G3B_U09_DECIMAL_ADD_SUB_KP_ID, G3B_U09_DECIMAL_COMPARE_KP_ID],
  questionMode: "numeric",
  questionCount: 18,
  generationSeed: "p03f16-focused",
  includeAnswerKey: true,
});
const authority = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice016-decimal-add-sub-compare-authority.json", import.meta.url), "utf8"));
const admissionManifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice016-product-admission.manifest.json", import.meta.url), "utf8"));
const d0Claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice016-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F16 frozen queue and predecessor are exact", () => {
  assert.equal(authority.queueAuthority.queuePosition, 16);
  assert.equal(authority.queueAuthority.sliceId, "p03e_q016_r7_g3b_u09_3b09_profile_decimal_c1");
  assert.equal(authority.queueAuthority.previousSliceD0Complete, true);
  assert.equal(authority.queueAuthority.previousSliceCloseoutEvidence.acceptedState, "PASS_D0_CLOSED");
  assert.equal(authority.sourceAuthority.sourceNodeId, SOURCE_ID);
});

test("P03F16 selector adds exactly two KPs and three specs", () => {
  assert.equal(auditG3BU09DecimalArithmeticSelectorProjection().ok, true);
  const audit = auditP03F16PublicSelectorComposition();
  assert.equal(audit.ok, true, audit.errors.join("\n"));
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(rows.length, 6);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SOURCE_ID].visibleCount, 6);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SOURCE_ID].hiddenPendingCount, 1);
  assert.deepEqual(rows.slice(-2).map((row) => row.knowledgePointId), [G3B_U09_DECIMAL_ADD_SUB_KP_ID, G3B_U09_DECIMAL_COMPARE_KP_ID]);
});

test("P03F16 PatternSpecs preserve capability boundary", () => {
  const result = validateP03F16PatternDefinitions();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.patternSpecCount, 3);
});

test("P03F16 shared plan resolves all three numeric PatternSpecs", () => {
  const plan = buildBatchABrowserPlan(OPTIONS);
  assert.equal(plan.sourceId, SOURCE_ID);
  assert.equal(plan.questionMode, "numeric");
  assert.deepEqual(plan.patternSpecIds, ALL_SPECS);
  assert.equal(plan.genericFallbackAllowed, false);
  assert.equal(plan.publicControls.globalContextAuthority, "NOT_APPLICABLE_FOR_SLICE016");
});

test("P03F16 generates 18 deterministic valid witnesses across all specs", () => {
  const result = generateBatchABrowserQuestions(OPTIONS);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 18);
  assert.deepEqual([...new Set(result.questions.map((q) => q.patternSpecId))], ALL_SPECS);
  for (const question of result.questions) {
    assert.equal(question.decimalPlaces, 1);
    assert.equal(question.globalContextProduction, null);
    assert.equal(question.metadata.productAdmissionTask, "P03F_W3DirectProductVerticalSlice016Implementation");
  }
  const validation = validateBatchABrowserQuestions(result.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
});

test("P03F16 add/sub uses decimal arithmetic while compare does not", () => {
  const result = generateBatchABrowserQuestions(OPTIONS);
  for (const question of result.questions) {
    if (G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS.includes(question.patternSpecId)) {
      assert.equal(question.metadata.requiredCapabilityIds.includes("cap_decimal_arithmetic"), true);
      assert.equal(question.resultDecimal, question.answerText);
    } else {
      assert.equal(question.metadata.requiredCapabilityIds.includes("cap_decimal_arithmetic"), false);
      assert.equal(["<", "=", ">"].includes(question.answerText), true);
    }
  }
});

test("P03F16 validator fails closed on answer and decimal-place tampering", () => {
  const result = generateBatchABrowserQuestions(OPTIONS);
  const answerTamper = { ...result.questions[0], answerText: "99.9", finalAnswer: "99.9" };
  assert.equal(validateBatchABrowserQuestions([answerTamper]).ok, false);
  const placeTamper = { ...result.questions[1], decimalPlaces: 2 };
  assert.equal(validateBatchABrowserQuestions([placeTamper]).ok, false);
});

test("P03F16 shared worksheet produces questions and answer key without application expansion", () => {
  const result = buildBatchABrowserWorksheetDocument(OPTIONS);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 18);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 18);
  assert.equal(result.worksheetDocument.summary.applicationQuestionCount, 0);
  assert.equal(result.worksheetDocument.metadata.applicationExpansion, false);
});

test("P03F16 current Pixel snapshot exposes six G3B-U09 KPs", () => {
  const snapshot = getCurrentPixelRegistrySnapshot();
  assert.equal(snapshot.bySourceId[SOURCE_ID].visibleKnowledgePoints.length, 6);
});

test("P03F16 D0 closeout binds exact E6, final CI and merged closeout evidence without starting Slice017", () => {
  assert.equal(admissionManifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(admissionManifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(admissionManifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(admissionManifest.expectedCounts.knowledgePointCount, 2);
  assert.equal(admissionManifest.expectedCounts.patternSpecCount, 3);
  assert.equal(admissionManifest.expectedCounts.questionWitnessCount, 18);
  assert.equal(admissionManifest.expectedCounts.answerKeyWitnessCount, 18);
  assert.equal(admissionManifest.exactAcceptance.implementationPrNumber, 515);
  assert.equal(admissionManifest.exactAcceptance.implementationMergeSha, "8309237a9819a9fe102b5cef90aed443bff37808");
  assert.equal(admissionManifest.exactAcceptance.acceptanceWorkflowRunId, 30757687493);
  assert.equal(admissionManifest.exactAcceptance.acceptanceArtifactId, 8836453290);
  assert.equal(admissionManifest.exactAcceptance.acceptanceVisualReview, "PASS");
  assert.equal(admissionManifest.exactAcceptance.acceptanceSemanticReview, "PASS");
  assert.equal(admissionManifest.exactAcceptance.acceptanceAnswerKeyReview, "PASS");
  assert.equal(admissionManifest.exactAcceptance.temporaryAcceptanceWorkflowRetired, true);
  assert.equal(admissionManifest.exactAcceptance.finalNodeWorkflowConclusion, "success");
  assert.equal(admissionManifest.exactAcceptance.closeoutPrNumber, 516);
  assert.equal(admissionManifest.exactAcceptance.closeoutNodeConclusion, "success");
  assert.equal(admissionManifest.exactAcceptance.closeoutMergeSha, "51c8cbf7f86ed07383e062e6dfade636f31d5b48");
  assert.equal(admissionManifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(admissionManifest.mainlineBoundary.nextTask, "P03F_W3DirectProductVerticalSlice017Implementation");
  assert.equal(d0Claim.status, "PASS_D0_CLOSED");
  assert.equal(d0Claim.goalDistance, "D0");
  assert.equal(d0Claim.closeoutEvidence.mainReadback, "PASS");
  assert.equal(d0Claim.productResult.d0Complete, true);
  assert.equal(d0Claim.boundaries.slice017Started, false);
});
