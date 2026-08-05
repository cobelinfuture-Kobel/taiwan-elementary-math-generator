import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  auditG3BU07SameDenominatorSelectorProjection,
  G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID,
  G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID,
  G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS,
  G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g3b-u07-same-denominator-selector-projection.js";
import {
  auditP03F15PublicSelectorComposition,
  BATCH_A_SELECTOR_AVAILABILITY,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f15-extension.js";
import { validateP03F15PatternDefinitions } from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f15-extension.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f15.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f15.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f15.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f15-extension.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";

const SOURCE_ID = "g3b_u07_3b07";
const ALL_SPECS = [...G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS, ...G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS];
const OPTIONS = Object.freeze({
  sourceId: SOURCE_ID,
  selectedKnowledgePointIds: [G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID, G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID],
  questionMode: "numeric",
  questionCount: 16,
  generationSeed: "p03f15-focused",
  includeAnswerKey: true,
});

const authority = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice015-same-denominator-fraction-authority.json", import.meta.url), "utf8"));
const admissionManifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice015-product-admission.manifest.json", import.meta.url), "utf8"));
const d0Claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice015-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F15 predecessor authority is reconciled to Slice014 formal D0 closeout", () => {
  assert.equal(authority.status, "IMPLEMENTATION_COMPLETE_PREDECESSOR_D0_RECONCILED_ACCEPTANCE_PENDING");
  assert.equal(authority.queueAuthority.previousSliceMustBeD0Complete, true);
  assert.equal(authority.queueAuthority.previousSliceD0Complete, true);
  assert.equal(authority.queueAuthority.previousSliceCloseoutEvidence.closeoutPr, 511);
  assert.equal(authority.queueAuthority.previousSliceCloseoutEvidence.closeoutMergeSha, "7d8021c78e0a2f6464edb709e6c6dd82de14ff5a");
  assert.equal(authority.queueAuthority.previousSliceCloseoutEvidence.acceptedState, "ADMITTED_D0");
});

test("P03F15 frozen selector adds exactly two G3B-U07 KPs and four specs", () => {
  assert.equal(auditG3BU07SameDenominatorSelectorProjection().ok, true);
  const audit = auditP03F15PublicSelectorComposition();
  assert.equal(audit.ok, true, audit.errors.join("\n"));
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(rows.length, 4);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SOURCE_ID].visibleCount, 4);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SOURCE_ID].hiddenPendingCount, 4);
  assert.deepEqual(rows.slice(-2).map((row) => row.knowledgePointId), [G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID, G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID]);
});

test("P03F15 PatternSpecs preserve same-denominator and capability boundaries", () => {
  const result = validateP03F15PatternDefinitions();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.patternSpecCount, 4);
});

test("P03F15 shared plan resolves all four numeric PatternSpecs", () => {
  const plan = buildBatchABrowserPlan(OPTIONS);
  assert.equal(plan.sourceId, SOURCE_ID);
  assert.equal(plan.questionMode, "numeric");
  assert.deepEqual(plan.patternSpecIds, ALL_SPECS);
  assert.equal(plan.genericFallbackAllowed, false);
  assert.equal(plan.publicControls.globalContextAuthority, "NOT_APPLICABLE_FOR_SLICE015");
});

test("P03F15 generates and validates deterministic witnesses across all PatternSpecs", () => {
  const result = generateBatchABrowserQuestions(OPTIONS);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 16);
  assert.deepEqual([...new Set(result.questions.map((q) => q.patternSpecId))], ALL_SPECS);
  for (const question of result.questions) {
    assert.equal(question.leftDenominator, question.denominator);
    assert.equal(question.rightDenominator, question.denominator);
    assert.equal(question.globalContextProduction, null);
    assert.equal(question.metadata.productAdmissionTask, "P03F_W3DirectProductVerticalSlice015Implementation");
  }
  const validation = validateBatchABrowserQuestions(result.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
});

test("P03F15 add/sub preserves denominator and compare-one rewrites 1 as d/d", () => {
  const result = generateBatchABrowserQuestions(OPTIONS);
  for (const question of result.questions) {
    if (G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS.includes(question.patternSpecId)) {
      assert.equal(question.resultDenominator, question.denominator);
      assert.equal(question.metadata.requiredCapabilityIds.includes("cap_fraction_arithmetic"), true);
    }
    if (question.patternSpecId === G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS[1]) {
      assert.equal(question.wholeOneRewrite, true);
      assert.equal(question.rightNumerator, question.denominator);
    }
  }
});

test("P03F15 validator fails closed on denominator and answer tampering", () => {
  const result = generateBatchABrowserQuestions(OPTIONS);
  const denominatorTamper = { ...result.questions[0], rightDenominator: result.questions[0].denominator + 1 };
  assert.equal(validateBatchABrowserQuestions([denominatorTamper]).ok, false);
  const answerTamper = { ...result.questions[1], answerText: "999/999", finalAnswer: "999/999" };
  assert.equal(validateBatchABrowserQuestions([answerTamper]).ok, false);
});

test("P03F15 shared worksheet produces questions and answer key without application expansion", () => {
  const result = buildBatchABrowserWorksheetDocument(OPTIONS);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 16);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 16);
  assert.equal(result.worksheetDocument.summary.applicationQuestionCount, 0);
  assert.equal(result.worksheetDocument.metadata.applicationExpansion, false);
});

test("P03F15 current Pixel snapshot exposes eight G3B-U07 KPs", () => {
  const snapshot = getCurrentPixelRegistrySnapshot();
  assert.equal(snapshot.bySourceId[SOURCE_ID].visibleKnowledgePoints.length, 8);
});

test("P03F15 D0 closeout binds exact E6, closeout CI and main readback without starting Slice016", () => {
  assert.equal(admissionManifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(admissionManifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(admissionManifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(admissionManifest.expectedCounts.knowledgePointCount, 2);
  assert.equal(admissionManifest.expectedCounts.patternSpecCount, 4);
  assert.equal(admissionManifest.expectedCounts.questionWitnessCount, 16);
  assert.equal(admissionManifest.expectedCounts.answerKeyWitnessCount, 16);
  assert.equal(admissionManifest.exactAcceptance.implementationPrNumber, 510);
  assert.equal(admissionManifest.exactAcceptance.implementationMergeSha, "eeee493823ddc8012e6e515b9fe2dd15b6baa1a8");
  assert.equal(admissionManifest.exactAcceptance.acceptanceWorkflowRunId, 30751107013);
  assert.equal(admissionManifest.exactAcceptance.acceptanceArtifactId, 8834471973);
  assert.equal(admissionManifest.exactAcceptance.acceptanceVisualReview, "PASS");
  assert.equal(admissionManifest.exactAcceptance.acceptanceSemanticReview, "PASS");
  assert.equal(admissionManifest.exactAcceptance.acceptanceAnswerKeyReview, "PASS");
  assert.equal(admissionManifest.exactAcceptance.temporaryAcceptanceWorkflowRetired, true);
  assert.equal(admissionManifest.exactAcceptance.finalNodeWorkflowConclusion, "success");
  assert.equal(admissionManifest.exactAcceptance.closeoutPrNumber, 513);
  assert.equal(admissionManifest.exactAcceptance.closeoutNodeWorkflowRunId, 30755351795);
  assert.equal(admissionManifest.exactAcceptance.closeoutNodeWorkflowJobId, 91516451417);
  assert.equal(admissionManifest.exactAcceptance.closeoutNodeConclusion, "success");
  assert.equal(admissionManifest.exactAcceptance.closeoutMergeSha, "abad6089e08d016dc62fe12f64f0f60bd334af59");
  assert.equal(admissionManifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(admissionManifest.mainlineBoundary.nextTask, "P03F_W3DirectProductVerticalSlice016Implementation");
  assert.equal(d0Claim.status, "PASS_D0_CLOSED");
  assert.equal(d0Claim.goalDistance, "D0");
  assert.equal(d0Claim.closeoutEvidence.prNumber, 513);
  assert.equal(d0Claim.closeoutEvidence.nodeWorkflowRunId, 30755351795);
  assert.equal(d0Claim.closeoutEvidence.nodeConclusion, "success");
  assert.equal(d0Claim.closeoutEvidence.mainReadback, "PASS");
  assert.equal(d0Claim.productResult.d0Complete, true);
  assert.equal(d0Claim.boundaries.slice016Started, false);
});
