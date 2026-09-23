import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildPath1ManualWorksheet,
  PATH1_P103_MODELING_PUBLIC_CUTOVER_GATE_ID,
  PATH1_P104_MODELING_PUBLIC_CUTOVER_GATE_ID,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";
import {
  buildPath1P105MultiplicativeModelingWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-05-zero-special-multiplicative-modeling-worksheet.js";
import {
  getPath1PublicWorksheetBlock,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  normalizePath1ManualQueryState,
  parsePath1ManualQueryState,
  PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
  PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  path1ManualBlockSupportsMultiplicativeModeling,
} from "../../site/assets/browser/state/path1-manual-query-state.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const CONTRACT_PATH = path.join(
  repoRoot,
  "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_PREFLIGHT_V1.json",
);
const IMPLEMENTATION_PATH = path.join(
  repoRoot,
  "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1.json",
);
const QUERY_STATE_PATH = path.join(repoRoot, "site/assets/browser/state/path1-manual-query-state.js");
const PRACTICE_ENTRY_PATH = path.join(repoRoot, "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js");
const CONTROLLER_PATH = path.join(repoRoot, "site/assets/browser/path1-manual.js");
const HTML_PATH = path.join(repoRoot, "site/path1/index.html");

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const implementation = JSON.parse(fs.readFileSync(IMPLEMENTATION_PATH, "utf8"));
const queryStateText = fs.readFileSync(QUERY_STATE_PATH, "utf8");
const practiceEntryText = fs.readFileSync(PRACTICE_ENTRY_PATH, "utf8");
const controllerText = fs.readFileSync(CONTROLLER_PATH, "utf8");
const html = fs.readFileSync(HTML_PATH, "utf8");
const validBlockIds = ["P1-01", "P1-02", "P1-03", "P1-04", "P1-05", "P1-06"];

const P105_MATRIX_KP = "kp_g3a_u03_3digit_zero_middle_by_1digit";
const P105_EXTRA_G4B = [
  "kp_g4b_u01_multiplier_internal_zero",
  "kp_g4b_u01_trailing_zero_multiplication",
];

function errorCodes(result) {
  return new Set((result?.errors ?? []).map((entry) => entry.code));
}

function warningCodes(result) {
  return new Set((result?.warnings ?? []).map((entry) => entry.code));
}

test("P1-05 public cutover preflight is planning-only and stops before product implementation", () => {
  assert.equal(contract.taskId, "PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_PREFLIGHT_V1");
  assert.equal(contract.status, "P1_05_PUBLIC_CUTOVER_PREFLIGHT_LOCKED_NO_PRODUCT_CHANGE");
  assert.equal(contract.operatorApproval, "APPROVED_FOR_PREFLIGHT_ONLY");
  assert.equal(contract.implementationAllowed, false);
  assert.equal(contract.publicCutoverApplied, false);
  assert.equal(contract.productRuntimeChanged, false);
  assert.equal(contract.visibleUiChanged, false);
  assert.equal(contract.queryStateChanged, false);
  assert.equal(contract.publicBindingChanged, false);
  assert.equal(contract.path1MatrixChanged, false);
  assert.equal(contract.p105GeneratorChanged, false);
  assert.equal(contract.p105ValidatorChanged, false);
  assert.equal(contract.p105PatternSpecsChanged, false);
  assert.equal(contract.implementationApprovalBoundary.separateApprovalRequired, true);
  assert.equal(contract.implementationApprovalBoundary.stopAfterPreflightMerge, true);
  assert.equal(
    contract.implementationApprovalBoundary.nextTask,
    "PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_IMPLEMENTATION_V1",
  );
});

test("P1-05 is already in the public block list with existing three-KP arithmetic compatibility breadth", () => {
  const block = getPath1PublicWorksheetBlock("P1-05");
  assert.ok(block);
  assert.deepEqual(block.knowledgePointIds, [P105_MATRIX_KP, ...P105_EXTRA_G4B]);
  assert.equal(block.generationKind, "CANONICAL_KP");
  assert.equal(contract.currentState.p105PublicBlockAlreadyListed, true);
  assert.equal(contract.currentState.newPublicBlockExposureRequired, false);
  assert.deepEqual(
    contract.currentState.publicArithmeticCompatibilityException.p105ArithmeticKnowledgePointIds,
    [P105_MATRIX_KP, ...P105_EXTRA_G4B],
  );
  assert.equal(contract.currentState.publicArithmeticCompatibilityException.modelingMayInheritTheseThreeIds, false);
});

test("dedicated P1-05 modeling worksheet is usable and remains non-public before cutover", () => {
  const result = buildPath1P105MultiplicativeModelingWorksheet({
    blockId: "P1-05",
    practiceMode: "multiplicativeModelingTransfer",
    questionCount: 20,
    generationSeed: "p105-public-cutover-preflight",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 20);
  const metadata = result.worksheetDocument.configSnapshot.metadata;
  assert.equal(metadata.path1BlockId, "P1-05");
  assert.equal(metadata.practiceMode, "multiplicativeModelingTransfer");
  assert.equal(metadata.publicCutoverApplied, false);
  assert.equal(metadata.publicBindingReconciled, false);
  assert.equal(metadata.g4bU01ModelingExpanded, false);
  assert.equal(metadata.masteryCredit, "NONE_UNTIL_SEPARATE_MASTERY_INTEGRATION_APPROVAL");
  assert.equal(implementation.arithmeticAuthority.knowledgePointId, P105_MATRIX_KP);
  assert.deepEqual(implementation.publicBindingBoundary.observedCompatibilityBreadthNotAdoptedForModeling, P105_EXTRA_G4B);
});

test("current public wrapper keeps P1-03/P1-04 modeling live but rejects P1-05 modeling", () => {
  for (const [blockId, expectedGate] of [
    ["P1-03", PATH1_P103_MODELING_PUBLIC_CUTOVER_GATE_ID],
    ["P1-04", PATH1_P104_MODELING_PUBLIC_CUTOVER_GATE_ID],
  ]) {
    const result = buildPath1ManualWorksheet({
      blockId,
      practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
      questionCount: 1,
      generationSeed: `p105-preflight:${blockId}`,
    });
    assert.equal(result.ok, true, `${blockId}:${JSON.stringify(result.errors)}`);
    assert.equal(result.worksheetDocument.configSnapshot.metadata.publicCutoverApplied, true);
    assert.equal(result.worksheetDocument.configSnapshot.metadata.publicCutoverGateId, expectedGate);
  }

  const p105 = buildPath1ManualWorksheet({
    blockId: "P1-05",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
    questionCount: 1,
    generationSeed: "p105-preflight:current-wrapper-reject",
  });
  assert.equal(p105.ok, false);
  assert.ok(errorCodes(p105).has("PATH1_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED"));
  assert.doesNotMatch(practiceEntryText, /buildPath1P105MultiplicativeModelingWorksheet/);
});

test("current query state accepts P1-03/P1-04 modeling but normalizes P1-05 modeling to arithmetic", () => {
  for (const blockId of ["P1-03", "P1-04"]) {
    const normalized = normalizePath1ManualQueryState({
      path1BlockId: blockId,
      practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
    }, { validBlockIds });
    assert.equal(normalized.practiceMode, PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE);
    assert.equal(normalized.warnings.length, 0);
    assert.equal(path1ManualBlockSupportsMultiplicativeModeling(blockId), true);
  }

  const p105 = normalizePath1ManualQueryState({
    path1BlockId: "P1-05",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  }, { validBlockIds });
  assert.equal(p105.path1BlockId, "P1-05");
  assert.equal(p105.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
  assert.ok(warningCodes(p105).has("PATH1_PUBLIC_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED"));
  assert.equal(path1ManualBlockSupportsMultiplicativeModeling("P1-05"), false);

  const parsed = parsePath1ManualQueryState(
    "?path1BlockId=P1-05&practiceMode=multiplicativeModelingTransfer",
    { validBlockIds },
  );
  assert.equal(parsed.path1BlockId, "P1-05");
  assert.equal(parsed.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
});

test("future cutover keeps one shared mode and extends only its supported-block set to P1-05", () => {
  assert.equal(contract.cutoverDecision.publicPracticeModeId, "multiplicativeModelingTransfer");
  assert.equal(contract.cutoverDecision.publicPracticeModeLabel, "文字建模練習");
  assert.equal(contract.cutoverDecision.reuseExistingModeId, true);
  assert.equal(contract.cutoverDecision.doNotCreateP105SpecificQueryModeId, true);
  assert.deepEqual(contract.cutoverDecision.supportedBlockIdsAfterCutover, ["P1-03", "P1-04", "P1-05"]);
  assert.equal(contract.cutoverDecision.dispatchMap["P1-05"], "site/assets/browser/pipeline/build-path1-p1-05-zero-special-multiplicative-modeling-worksheet.js");
  assert.equal(contract.cutoverDecision.unsupportedBlocksFailSafeTo, "arithmetic");
  assert.equal(contract.cutoverDecision.unsupportedBlocksMustEmitWarning, true);
  assert.equal(contract.cutoverDecision.p105ArithmeticCompatibilityBreadthUnchanged, true);
});

test("future public metadata must give P1-05 its own cutover gate identity", () => {
  const projection = contract.publicMetadataProjection;
  assert.equal(projection.p103PublicCutoverGateId, PATH1_P103_MODELING_PUBLIC_CUTOVER_GATE_ID);
  assert.equal(projection.p104PublicCutoverGateId, PATH1_P104_MODELING_PUBLIC_CUTOVER_GATE_ID);
  assert.equal(projection.p105PublicCutoverGateId, "PATH1_P105_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_V1");
  assert.equal(new Set([
    projection.p103PublicCutoverGateId,
    projection.p104PublicCutoverGateId,
    projection.p105PublicCutoverGateId,
  ]).size, 3);
  assert.equal(projection.worksheetConfigSnapshotPublicCutoverApplied, true);
  assert.equal(projection.publicRoute, "path1-manual");
  assert.equal(projection.generatedItemMetadataMustRemainSemanticallyUnmodified, true);
});

test("future implementation is bounded to the same four public product files and cannot alter modeling authorities", () => {
  assert.deepEqual(contract.futureImplementationPlan.allowedProductFiles, [
    "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js",
    "site/assets/browser/state/path1-manual-query-state.js",
    "site/assets/browser/path1-manual.js",
    "site/path1/index.html",
  ]);
  for (const relativePath of contract.futureImplementationPlan.allowedProductFiles) {
    assert.equal(fs.existsSync(path.join(repoRoot, relativePath)), true, relativePath);
  }
  for (const relativePath of contract.futureImplementationPlan.mustNotModify) {
    assert.equal(fs.existsSync(path.join(repoRoot, relativePath)), true, relativePath);
  }
  assert.equal(contract.antiScopeCreep.publicBindingMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.path1MatrixMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.p105GeneratorMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.p105ValidatorMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.p105WorksheetAdapterMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.g4bU01ModelingExpansionAllowed, false);
});

test("P1-05 modeling authority remains zero-middle G3A-U03 plus R03 total-unknown only", () => {
  const authority = contract.p105ModelingAuthority;
  assert.equal(authority.arithmeticKnowledgePointId, P105_MATRIX_KP);
  assert.equal(authority.arithmeticOperationModelId, "op_g3a_u03_zero_middle_by_1digit");
  assert.equal(authority.relationId, "R03_EQUAL_GROUPS");
  assert.equal(authority.canonicalInvariant, "totalAmount = amountPerGroup * groupCount");
  assert.equal(authority.unknownRole, "totalAmount");
  assert.deepEqual(authority.forbiddenModelingKnowledgePointIds, P105_EXTRA_G4B);
  assert.equal(authority.semanticCommutativeRoleSwapAllowed, false);
  assert.equal(authority.unitConversionAllowed, false);
  assert.equal(authority.multiRelationAllowed, false);
  assert.equal(authority.inverseUnknownRolesAllowed, false);
  assert.equal(authority.numericEnvelopeExpansionAllowed, false);
});

test("current UI has one modeling option and future P1-05 cutover must extend availability/help rather than duplicate it", () => {
  const matches = html.match(/<option value="multiplicativeModelingTransfer">/g) ?? [];
  assert.equal(matches.length, 1);
  assert.match(html, /P1-03 使用二位數×二位數乘法建模/);
  assert.match(html, /P1-04 使用多位數×多位數乘法建模/);
  assert.doesNotMatch(html, /P1-05 使用/);
  assert.match(controllerText, /P1-03、P1-04 的文字建模模式不支援此 Block/);
  assert.match(queryStateText, /new Set\(\["P1-03", "P1-04"\]\)/);
  assert.equal(contract.cutoverDecision.doNotCreateP105SpecificQueryModeId, true);
});

test("equalGroupsTransfer remains P1-01/P1-02 only and P1-05 must not alias to it", () => {
  for (const blockId of ["P1-01", "P1-02"]) {
    const normalized = normalizePath1ManualQueryState({
      path1BlockId: blockId,
      practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
    }, { validBlockIds });
    assert.equal(normalized.practiceMode, PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE);
    assert.equal(normalized.warnings.length, 0);
  }
  const p105 = normalizePath1ManualQueryState({
    path1BlockId: "P1-05",
    practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  }, { validBlockIds });
  assert.equal(p105.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
  assert.ok(warningCodes(p105).has("PATH1_PUBLIC_TRANSFER_MODE_BLOCK_NOT_SUPPORTED"));
  assert.equal(contract.cutoverDecision.doNotAliasToEqualGroupsTransfer, true);
});

test("next milestone is implementation approval, not automatic product cutover", () => {
  assert.equal(contract.focusedAcceptanceContract.deployedPagesRequiredAfterImplementation, true);
  assert.equal(contract.focusedAcceptanceContract.fullRepositoryRegressionRequired, false);
  assert.equal(contract.focusedAcceptanceContract.globalBrowserReplayRequired, false);
  assert.equal(
    contract.distance.nextShortestStep,
    "PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_IMPLEMENTATION_V1",
  );
});
