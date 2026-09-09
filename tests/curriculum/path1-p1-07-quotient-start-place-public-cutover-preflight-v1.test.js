import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPath1ManualWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";
import {
  buildPath1P107QuotientStartPlaceWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-07-quotient-start-place-worksheet.js";
import {
  PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
  PATH1_P1_07_THREE_DIGIT_KP_ID,
  PATH1_P1_07_TWO_DIGIT_KP_ID,
} from "../../site/modules/curriculum/learning-paths/path1-p1-07-quotient-start-place-patterns.js";
import {
  getPath1PublicWorksheetBlock,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
  PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  PATH1_MANUAL_P106_ESTIMATE_TRIAL_QUOTIENT_MODE,
  normalizePath1ManualQueryState,
  path1ManualBlockSupportsEqualGroupsTransfer,
  path1ManualBlockSupportsEstimateTrialQuotient,
  path1ManualBlockSupportsMultiplicativeModeling,
} from "../../site/assets/browser/state/path1-manual-query-state.js";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_P1_07_QUOTIENT_START_PLACE_PUBLIC_CUTOVER_PREFLIGHT_V1.json";
const IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_P1_07_QUOTIENT_START_PLACE_IMPLEMENTATION_V1.json";
const CLOUD_REVIEW_PATH = "data/curriculum/application/reviews/PATH1_P1_05_P1_07_CLOUD_SOURCE_PROVENANCE_RECONCILIATION_V1.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const HTML_PATH = "site/path1/index.html";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const implementation = JSON.parse(fs.readFileSync(IMPLEMENTATION_PATH, "utf8"));
const cloudReview = JSON.parse(fs.readFileSync(CLOUD_REVIEW_PATH, "utf8"));
const matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, "utf8"));
const html = fs.readFileSync(HTML_PATH, "utf8");
const validBlockIds = ["P1-01", "P1-02", "P1-03", "P1-04", "P1-05", "P1-06", "P1-07", "P1-08"];

function errorCodes(result) {
  return new Set((result?.errors ?? []).map((entry) => entry.code));
}

function warningCodes(result) {
  return new Set((result?.warnings ?? []).map((entry) => entry.code));
}

test("P1-07 public cutover preflight is planning-only and stops before implementation", () => {
  assert.equal(contract.taskId, "PATH1_P1_07_QUOTIENT_START_PLACE_PUBLIC_CUTOVER_PREFLIGHT_V1");
  assert.equal(contract.status, "P1_07_PUBLIC_CUTOVER_PREFLIGHT_LOCKED_NO_PRODUCT_CHANGE");
  assert.equal(contract.operatorApproval, "APPROVED_FOR_PREFLIGHT_ONLY");
  assert.equal(contract.implementationAllowed, false);
  assert.equal(contract.publicCutoverApplied, false);
  assert.equal(contract.productRuntimeChanged, false);
  assert.equal(contract.visibleUiChanged, false);
  assert.equal(contract.queryStateChanged, false);
  assert.equal(contract.publicBindingChanged, false);
  assert.equal(contract.path1MatrixChanged, false);
  assert.equal(contract.p107GeneratorChanged, false);
  assert.equal(contract.p107ValidatorChanged, false);
  assert.equal(contract.p107PatternSpecsChanged, false);
  assert.equal(contract.p107WorksheetAdapterChanged, false);
  assert.equal(contract.implementationApprovalBoundary.separateApprovalRequired, true);
  assert.equal(contract.implementationApprovalBoundary.stopAfterPreflightMerge, true);
  assert.equal(
    contract.implementationApprovalBoundary.nextTask,
    "PATH1_P1_07_QUOTIENT_START_PLACE_PUBLIC_CUTOVER_IMPLEMENTATION_V1",
  );
});

test("P1-07 matrix and public arithmetic binding are already exactly aligned", () => {
  const matrixBlock = matrix.blocks.find((entry) => entry.blockId === "P1-07");
  const publicBlock = getPath1PublicWorksheetBlock("P1-07");
  assert.ok(matrixBlock);
  assert.ok(publicBlock);
  assert.deepEqual(matrixBlock.primaryKnowledgePointIds, [
    PATH1_P1_07_TWO_DIGIT_KP_ID,
    PATH1_P1_07_THREE_DIGIT_KP_ID,
  ]);
  assert.deepEqual([...publicBlock.knowledgePointIds], matrixBlock.primaryKnowledgePointIds);
  assert.equal(contract.currentState.publicBindingExactlyMatchesMatrixPrimaryKps, true);
  assert.equal(contract.currentState.publicBindingReconciliationRequired, false);
  assert.equal(contract.currentState.p107PublicBlockAlreadyListed, true);
  assert.equal(contract.currentState.newPublicBlockExposureRequired, false);
});

test("dedicated P1-07 quotient-start-place worksheet is usable and remains semantically non-public", () => {
  const result = buildPath1P107QuotientStartPlaceWorksheet({
    blockId: "P1-07",
    practiceMode: PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
    questionCount: 20,
    generationSeed: "p107-public-cutover-preflight",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 20);
  const metadata = result.worksheetDocument.configSnapshot.metadata;
  assert.equal(metadata.path1BlockId, "P1-07");
  assert.equal(metadata.practiceMode, "quotientStartPlace");
  assert.equal(metadata.questionMode, "numeric");
  assert.equal(metadata.representationLayer, "quotient_start_place_cases");
  assert.equal(metadata.publicCutoverApplied, false);
  assert.equal(metadata.wordProblemModelingUsed, false);
  assert.equal(metadata.divisorEstimationUsed, false);
  assert.equal(metadata.remainderContextInterpretationUsed, false);
  assert.equal(metadata.twoDigitDivisorRepresentationUsed, false);
  assert.equal(metadata.quotientZeroCaseUsed, false);
  assert.equal(metadata.masteryCredit, "NONE_UNTIL_SEPARATE_MASTERY_INTEGRATION_APPROVAL");
  assert.equal(implementation.publicCutoverApplied, false);
});

test("three-lane cloud provenance and deferred runtime boundaries remain locked", () => {
  const p107 = cloudReview.reconciliations.find((entry) => entry.blockId === "P1-07");
  assert.ok(p107);
  assert.equal(contract.sourceProvenanceBoundary.allThreeCloudEvidenceLanesRemainMandatory, true);
  assert.equal(contract.sourceProvenanceBoundary.learningMapsUse, "CURRICULUM_PROGRESSION_BOUNDARY");
  assert.equal(contract.sourceProvenanceBoundary.liTeacherUse, "NO_DIRECT_WITNESS_NO_PATTERN_ADMISSION");
  assert.equal(contract.sourceProvenanceBoundary.schoolExamUse, "DIRECT_QUOTIENT_DIGIT_COUNT_REPRESENTATION_WITNESS");
  assert.equal(contract.sourceProvenanceBoundary.twoDigitDivisorExamEvidencePresent, true);
  assert.equal(contract.sourceProvenanceBoundary.twoDigitDivisorRuntimeAdmitted, false);
  assert.equal(contract.sourceProvenanceBoundary.quotientZeroPrimaryV1, false);
  assert.equal(implementation.twoDigitDivisorRuntimeAdmitted, false);
  assert.equal(implementation.quotientZeroPrimaryV1, false);
  assert.equal(p107.schoolExamEvidence.evidenceStatus, "DIRECT_WITNESS");
});

test("public wrapper transition is fail-safe before cutover and P1-07-only after cutover", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-07",
    practiceMode: PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
    questionCount: 1,
    generationSeed: "p107-public-transition",
  });
  if (result.ok) {
    const metadata = result.worksheetDocument.configSnapshot.metadata;
    assert.equal(metadata.path1BlockId, "P1-07");
    assert.equal(metadata.practiceMode, "quotientStartPlace");
    assert.equal(metadata.publicCutoverApplied, true);
    assert.equal(metadata.publicCutoverGateId, "PATH1_P107_QUOTIENT_START_PLACE_PUBLIC_CUTOVER_V1");
  } else {
    assert.ok(errorCodes(result).has("PATH1_PRACTICE_MODE_NOT_SUPPORTED"));
  }
});

test("query-state transition never lets quotientStartPlace leak to another block", () => {
  const p107 = normalizePath1ManualQueryState({
    path1BlockId: "P1-07",
    practiceMode: PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
  }, { validBlockIds });
  assert.equal(p107.path1BlockId, "P1-07");
  assert.ok([
    PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
    PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
  ].includes(p107.practiceMode));
  if (p107.practiceMode === PATH1_MANUAL_DEFAULT_PRACTICE_MODE) {
    assert.ok(warningCodes(p107).has("PATH1_PUBLIC_PRACTICE_MODE_QUERY_FALLBACK"));
  } else {
    assert.equal(p107.warnings.length, 0);
  }

  for (const blockId of ["P1-06", "P1-08"]) {
    const normalized = normalizePath1ManualQueryState({
      path1BlockId: blockId,
      practiceMode: PATH1_P1_07_QUOTIENT_START_PLACE_PRACTICE_MODE,
    }, { validBlockIds });
    assert.equal(normalized.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
    const codes = warningCodes(normalized);
    assert.ok(
      codes.has("PATH1_PUBLIC_PRACTICE_MODE_QUERY_FALLBACK")
      || codes.has("PATH1_PUBLIC_P107_QUOTIENT_PLACE_MODE_BLOCK_NOT_SUPPORTED"),
    );
  }
});

test("existing public practice-mode support remains unchanged around P1-07", () => {
  assert.equal(path1ManualBlockSupportsEqualGroupsTransfer("P1-01"), true);
  assert.equal(path1ManualBlockSupportsEqualGroupsTransfer("P1-02"), true);
  for (const blockId of ["P1-03", "P1-04", "P1-05"]) {
    assert.equal(path1ManualBlockSupportsMultiplicativeModeling(blockId), true);
  }
  assert.equal(path1ManualBlockSupportsEstimateTrialQuotient("P1-06"), true);
  assert.equal(path1ManualBlockSupportsEstimateTrialQuotient("P1-07"), false);

  const p106 = normalizePath1ManualQueryState({
    path1BlockId: "P1-06",
    practiceMode: PATH1_MANUAL_P106_ESTIMATE_TRIAL_QUOTIENT_MODE,
  }, { validBlockIds });
  assert.equal(p106.practiceMode, PATH1_MANUAL_P106_ESTIMATE_TRIAL_QUOTIENT_MODE);

  const p105 = normalizePath1ManualQueryState({
    path1BlockId: "P1-05",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  }, { validBlockIds });
  assert.equal(p105.practiceMode, PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE);

  const p102 = normalizePath1ManualQueryState({
    path1BlockId: "P1-02",
    practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  }, { validBlockIds });
  assert.equal(p102.practiceMode, PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE);
});

test("future implementation is bounded to four public product files and preserves P1-07 authorities", () => {
  assert.deepEqual(contract.futureImplementationPlan.allowedProductFiles, [
    "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js",
    "site/assets/browser/state/path1-manual-query-state.js",
    "site/assets/browser/path1-manual.js",
    "site/path1/index.html",
  ]);
  for (const relativePath of contract.futureImplementationPlan.allowedProductFiles) {
    assert.equal(fs.existsSync(path.resolve(relativePath)), true, relativePath);
  }
  for (const relativePath of contract.futureImplementationPlan.mustNotModify) {
    assert.equal(fs.existsSync(path.resolve(relativePath)), true, relativePath);
  }
  assert.equal(contract.antiScopeCreep.publicBindingMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.path1MatrixMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.p107GeneratorMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.p107ValidatorMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.p107WorksheetAdapterMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.twoDigitDivisorRuntimeExpansionAllowed, false);
  assert.equal(contract.antiScopeCreep.quotientZeroPrimaryExpansionAllowed, false);
});

test("HTML transition allows zero or one P1-07 quotient-start-place option but never duplicates it", () => {
  const matches = html.match(/<option value="quotientStartPlace">/g) ?? [];
  assert.ok(matches.length <= 1);
  if (matches.length === 1) assert.match(html, /商的位值練習/);
  assert.equal(contract.cutoverDecision.publicPracticeModeId, "quotientStartPlace");
  assert.deepEqual(contract.cutoverDecision.supportedBlockIdsAfterCutover, ["P1-07"]);
});

test("next milestone is separate public cutover implementation approval", () => {
  assert.equal(contract.focusedAcceptanceContract.deployedPagesRequiredAfterImplementation, true);
  assert.equal(contract.focusedAcceptanceContract.fullRepositoryRegressionRequired, false);
  assert.equal(contract.focusedAcceptanceContract.globalBrowserReplayRequired, false);
  assert.equal(contract.focusedAcceptanceContract.expectedLane, "SHARED_RUNTIME_BOUNDED");
  assert.equal(
    contract.distance.nextShortestStep,
    "PATH1_P1_07_QUOTIENT_START_PLACE_PUBLIC_CUTOVER_IMPLEMENTATION_V1",
  );
});
