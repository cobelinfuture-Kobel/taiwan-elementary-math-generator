import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPath1ManualWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";
import {
  buildPath1P106EstimateTrialQuotientWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-06-estimate-trial-quotient-worksheet.js";
import {
  PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
  PATH1_P1_06_TENS_INSUFFICIENT_KP_ID,
  PATH1_P1_06_TENS_SUFFICIENT_KP_ID,
  getPath1P106WholeTenEstimate,
} from "../../site/modules/curriculum/learning-paths/path1-p1-06-estimate-trial-quotient-patterns.js";
import {
  getPath1PublicWorksheetBlock,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
  PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  normalizePath1ManualQueryState,
  path1ManualBlockSupportsEqualGroupsTransfer,
  path1ManualBlockSupportsMultiplicativeModeling,
} from "../../site/assets/browser/state/path1-manual-query-state.js";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PUBLIC_CUTOVER_PREFLIGHT_V1.json";
const IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_IMPLEMENTATION_V1.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const HTML_PATH = "site/path1/index.html";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const implementation = JSON.parse(fs.readFileSync(IMPLEMENTATION_PATH, "utf8"));
const matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, "utf8"));
const html = fs.readFileSync(HTML_PATH, "utf8");
const validBlockIds = ["P1-01", "P1-02", "P1-03", "P1-04", "P1-05", "P1-06", "P1-07"];

function errorCodes(result) {
  return new Set((result?.errors ?? []).map((entry) => entry.code));
}

function warningCodes(result) {
  return new Set((result?.warnings ?? []).map((entry) => entry.code));
}

test("P1-06 public cutover preflight is planning-only and stops before implementation", () => {
  assert.equal(contract.taskId, "PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PUBLIC_CUTOVER_PREFLIGHT_V1");
  assert.equal(contract.status, "P1_06_PUBLIC_CUTOVER_PREFLIGHT_LOCKED_NO_PRODUCT_CHANGE");
  assert.equal(contract.operatorApproval, "APPROVED_FOR_PREFLIGHT_ONLY");
  assert.equal(contract.implementationAllowed, false);
  assert.equal(contract.publicCutoverApplied, false);
  assert.equal(contract.productRuntimeChanged, false);
  assert.equal(contract.visibleUiChanged, false);
  assert.equal(contract.queryStateChanged, false);
  assert.equal(contract.publicBindingChanged, false);
  assert.equal(contract.path1MatrixChanged, false);
  assert.equal(contract.p106GeneratorChanged, false);
  assert.equal(contract.p106ValidatorChanged, false);
  assert.equal(contract.p106PatternSpecsChanged, false);
  assert.equal(contract.p106WorksheetAdapterChanged, false);
  assert.equal(contract.implementationApprovalBoundary.separateApprovalRequired, true);
  assert.equal(contract.implementationApprovalBoundary.stopAfterPreflightMerge, true);
  assert.equal(
    contract.implementationApprovalBoundary.nextTask,
    "PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PUBLIC_CUTOVER_IMPLEMENTATION_V1",
  );
});

test("P1-06 matrix and public arithmetic binding are already exactly aligned", () => {
  const matrixBlock = matrix.blocks.find((entry) => entry.blockId === "P1-06");
  const publicBlock = getPath1PublicWorksheetBlock("P1-06");
  assert.ok(matrixBlock);
  assert.ok(publicBlock);
  assert.deepEqual(matrixBlock.primaryKnowledgePointIds, [
    PATH1_P1_06_TENS_SUFFICIENT_KP_ID,
    PATH1_P1_06_TENS_INSUFFICIENT_KP_ID,
  ]);
  assert.deepEqual([...publicBlock.knowledgePointIds], matrixBlock.primaryKnowledgePointIds);
  assert.equal(contract.currentState.publicBindingExactlyMatchesMatrixPrimaryKps, true);
  assert.equal(contract.currentState.publicBindingReconciliationRequired, false);
  assert.equal(contract.currentState.p106PublicBlockAlreadyListed, true);
  assert.equal(contract.currentState.newPublicBlockExposureRequired, false);
});

test("dedicated P1-06 estimate worksheet is usable and remains semantically non-public", () => {
  const result = buildPath1P106EstimateTrialQuotientWorksheet({
    blockId: "P1-06",
    practiceMode: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
    questionCount: 20,
    generationSeed: "p106-public-cutover-preflight",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 20);
  const metadata = result.worksheetDocument.configSnapshot.metadata;
  assert.equal(metadata.path1BlockId, "P1-06");
  assert.equal(metadata.practiceMode, "estimateTrialQuotient");
  assert.equal(metadata.questionMode, "numeric");
  assert.equal(metadata.representationLayer, "estimate_trial_quotient");
  assert.equal(metadata.publicCutoverApplied, false);
  assert.equal(metadata.wordProblemModelingUsed, false);
  assert.equal(metadata.quotientPlaceTeachingUsed, false);
  assert.equal(metadata.remainderContextInterpretationUsed, false);
  assert.equal(metadata.masteryCredit, "NONE_UNTIL_SEPARATE_MASTERY_INTEGRATION_APPROVAL");
  assert.equal(implementation.publicCutoverApplied, false);
});

test("P1-06 source-backed estimate boundary remains locked", () => {
  assert.equal(getPath1P106WholeTenEstimate(11), 10);
  assert.equal(getPath1P106WholeTenEstimate(38), 40);
  assert.equal(getPath1P106WholeTenEstimate(47), 50);
  assert.equal(getPath1P106WholeTenEstimate(92), 90);
  assert.equal(getPath1P106WholeTenEstimate(45), null);
  assert.equal(getPath1P106WholeTenEstimate(40), null);
  assert.deepEqual(contract.p106Authority.generatedEstimateDivisorOnesDigits, [1, 2, 3, 4, 6, 7, 8, 9]);
  assert.equal(contract.p106Authority.endingFiveTieConventionUsed, false);
  assert.equal(contract.p106Authority.endingZeroEstimateWitnessGenerated, false);
  assert.equal(contract.p106Authority.wordProblemModelingAllowed, false);
  assert.equal(contract.p106Authority.quotientPlaceTeachingAllowed, false);
  assert.equal(contract.p106Authority.remainderContextInterpretationAllowed, false);
});

test("public wrapper transition is fail-safe before cutover and block-gated after cutover", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-06",
    practiceMode: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
    questionCount: 1,
    generationSeed: "p106-public-transition",
  });
  if (result.ok) {
    const metadata = result.worksheetDocument.configSnapshot.metadata;
    assert.equal(metadata.path1BlockId, "P1-06");
    assert.equal(metadata.practiceMode, "estimateTrialQuotient");
    assert.equal(metadata.publicCutoverApplied, true);
    assert.equal(metadata.publicCutoverGateId, "PATH1_P106_ESTIMATE_TRIAL_QUOTIENT_PUBLIC_CUTOVER_V1");
  } else {
    assert.ok(errorCodes(result).has("PATH1_PRACTICE_MODE_NOT_SUPPORTED"));
  }
});

test("query-state transition never lets estimateTrialQuotient leak to another block", () => {
  const p106 = normalizePath1ManualQueryState({
    path1BlockId: "P1-06",
    practiceMode: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
  }, { validBlockIds });
  assert.equal(p106.path1BlockId, "P1-06");
  assert.ok([
    PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
    PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
  ].includes(p106.practiceMode));
  if (p106.practiceMode === PATH1_MANUAL_DEFAULT_PRACTICE_MODE) {
    assert.ok(warningCodes(p106).has("PATH1_PUBLIC_PRACTICE_MODE_QUERY_FALLBACK"));
  } else {
    assert.equal(p106.warnings.length, 0);
  }

  for (const blockId of ["P1-05", "P1-07"]) {
    const normalized = normalizePath1ManualQueryState({
      path1BlockId: blockId,
      practiceMode: PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PRACTICE_MODE,
    }, { validBlockIds });
    assert.equal(normalized.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
    const codes = warningCodes(normalized);
    assert.ok(
      codes.has("PATH1_PUBLIC_PRACTICE_MODE_QUERY_FALLBACK")
      || codes.has("PATH1_PUBLIC_P106_ESTIMATE_MODE_BLOCK_NOT_SUPPORTED"),
    );
  }
});

test("existing text-modeling public mode support remains unchanged around P1-06", () => {
  assert.equal(path1ManualBlockSupportsEqualGroupsTransfer("P1-01"), true);
  assert.equal(path1ManualBlockSupportsEqualGroupsTransfer("P1-02"), true);
  assert.equal(path1ManualBlockSupportsEqualGroupsTransfer("P1-06"), false);
  for (const blockId of ["P1-03", "P1-04", "P1-05"]) {
    assert.equal(path1ManualBlockSupportsMultiplicativeModeling(blockId), true);
  }
  assert.equal(path1ManualBlockSupportsMultiplicativeModeling("P1-06"), false);

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

test("future implementation is bounded to four public product files and preserves P1-06 authorities", () => {
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
  assert.equal(contract.antiScopeCreep.p106GeneratorMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.p106ValidatorMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.p106WorksheetAdapterMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.p107OrLaterMutationAllowed, false);
});

test("HTML transition allows zero or one P1-06 estimate option but never duplicates it", () => {
  const matches = html.match(/<option value="estimateTrialQuotient">/g) ?? [];
  assert.ok(matches.length <= 1);
  if (matches.length === 1) assert.match(html, /估商與試商練習/);
  assert.equal(contract.cutoverDecision.publicPracticeModeId, "estimateTrialQuotient");
  assert.equal(contract.cutoverDecision.supportedBlockIdsAfterCutover.length, 1);
  assert.equal(contract.cutoverDecision.supportedBlockIdsAfterCutover[0], "P1-06");
});

test("next milestone is separate implementation approval, not automatic public cutover", () => {
  assert.equal(contract.focusedAcceptanceContract.deployedPagesRequiredAfterImplementation, true);
  assert.equal(contract.focusedAcceptanceContract.fullRepositoryRegressionRequired, false);
  assert.equal(contract.focusedAcceptanceContract.globalBrowserReplayRequired, false);
  assert.equal(contract.focusedAcceptanceContract.expectedLane, "SHARED_RUNTIME_BOUNDED");
  assert.equal(
    contract.distance.nextShortestStep,
    "PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PUBLIC_CUTOVER_IMPLEMENTATION_V1",
  );
});
