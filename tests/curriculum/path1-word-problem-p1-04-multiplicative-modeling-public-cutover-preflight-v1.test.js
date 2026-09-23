import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildPath1ManualWorksheet,
  PATH1_P103_MODELING_PUBLIC_CUTOVER_GATE_ID,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";
import {
  buildPath1P104MultiplicativeModelingWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-04-multiplicative-modeling-worksheet.js";
import {
  PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
} from "../../site/modules/curriculum/learning-paths/path1-p1-04-multiplicative-modeling-patterns.js";
import {
  getPath1PublicWorksheetBlock,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  normalizePath1ManualQueryState,
  parsePath1ManualQueryState,
  PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
  PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
} from "../../site/assets/browser/state/path1-manual-query-state.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const contractPath = path.join(
  repoRoot,
  "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_04_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_PREFLIGHT_V1.json",
);
const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const validBlockIds = ["P1-01", "P1-02", "P1-03", "P1-04", "P1-05"];

function errorCodes(result) {
  return new Set((result?.errors ?? []).map((entry) => entry.code));
}

function warningCodes(result) {
  return new Set((result?.warnings ?? []).map((entry) => entry.code));
}

test("P1-04 public cutover preflight is planning-only and stops at implementation approval boundary", () => {
  assert.equal(contract.taskId, "PATH1_WORD_PROBLEM_P1_04_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_PREFLIGHT_V1");
  assert.equal(contract.status, "P1_04_PUBLIC_CUTOVER_PREFLIGHT_LOCKED_NO_PRODUCT_CHANGE");
  assert.equal(contract.operatorApproval, "APPROVED_FOR_PREFLIGHT_ONLY");
  assert.equal(contract.implementationAllowed, false);
  assert.equal(contract.publicCutoverApplied, false);
  assert.equal(contract.productRuntimeChanged, false);
  assert.equal(contract.visibleUiChanged, false);
  assert.equal(contract.queryStateChanged, false);
  assert.equal(contract.publicBindingChanged, false);
  assert.equal(contract.path1MatrixChanged, false);
  assert.equal(contract.implementationApprovalBoundary.separateApprovalRequired, true);
  assert.equal(
    contract.implementationApprovalBoundary.nextTask,
    "PATH1_WORD_PROBLEM_P1_04_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_IMPLEMENTATION_V1",
  );
  assert.equal(contract.implementationApprovalBoundary.stopAfterPreflightMerge, true);
});

test("P1-04 is already listed publicly, so cutover does not add a new Path1 block", () => {
  const block = getPath1PublicWorksheetBlock("P1-04");
  assert.ok(block);
  assert.deepEqual(block.knowledgePointIds, [
    "kp_g4a_u02_2digit_by_3digit",
    "kp_g4a_u02_3digit_by_2digit",
    "kp_g4b_u01_3digit_by_3digit",
    "kp_g4b_u01_4digit_by_3digit",
  ]);
  assert.equal(contract.currentState.p104PublicBlockAlreadyListed, true);
  assert.equal(contract.currentState.newPublicBlockExposureRequired, false);
});

test("future cutover is bounded to four public product files and preserves semantic/runtime authorities", () => {
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
});

test("dedicated P1-04 modeling worksheet is usable but still non-public", () => {
  const result = buildPath1P104MultiplicativeModelingWorksheet({
    blockId: "P1-04",
    practiceMode: PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
    questionCount: 20,
    generationSeed: "p104-public-cutover-preflight",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 20);
  assert.equal(result.worksheetDocument.configSnapshot.metadata.path1BlockId, "P1-04");
  assert.equal(
    result.worksheetDocument.configSnapshot.metadata.practiceMode,
    PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  );
  assert.equal(result.worksheetDocument.configSnapshot.metadata.publicCutoverApplied, false);
  assert.equal(result.worksheetDocument.configSnapshot.metadata.g4bU01ModelingExpanded, false);
  assert.equal(
    result.worksheetDocument.configSnapshot.metadata.masteryCredit,
    "NONE_UNTIL_SEPARATE_MASTERY_INTEGRATION_APPROVAL",
  );
});

test("current public practice entry still supports P1-03 modeling but rejects P1-04 modeling", () => {
  const p103 = buildPath1ManualWorksheet({
    blockId: "P1-03",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
    questionCount: 1,
    generationSeed: "p104-public-cutover-preflight:p103-preservation",
  });
  assert.equal(p103.ok, true, JSON.stringify(p103.errors));
  assert.equal(p103.worksheetDocument.configSnapshot.metadata.publicCutoverApplied, true);
  assert.equal(
    p103.worksheetDocument.configSnapshot.metadata.publicCutoverGateId,
    PATH1_P103_MODELING_PUBLIC_CUTOVER_GATE_ID,
  );

  const p104 = buildPath1ManualWorksheet({
    blockId: "P1-04",
    practiceMode: PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
    questionCount: 1,
    generationSeed: "p104-public-cutover-preflight:current-entry",
  });
  assert.equal(p104.ok, false);
  assert.ok(errorCodes(p104).has("PATH1_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED"));
});

test("current query state accepts the shared mode for P1-03 but still normalizes P1-04 to arithmetic", () => {
  const p103 = normalizePath1ManualQueryState({
    path1BlockId: "P1-03",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  }, { validBlockIds });
  assert.equal(p103.practiceMode, PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE);
  assert.equal(p103.warnings.length, 0);

  const p104 = normalizePath1ManualQueryState({
    path1BlockId: "P1-04",
    practiceMode: PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  }, { validBlockIds });
  assert.equal(p104.path1BlockId, "P1-04");
  assert.equal(p104.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
  assert.ok(warningCodes(p104).has("PATH1_PUBLIC_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED"));

  const parsed = parsePath1ManualQueryState(
    `?path1BlockId=P1-04&practiceMode=${PATH1_P1_04_MULTIPLICATIVE_MODELING_PRACTICE_MODE}`,
    { validBlockIds },
  );
  assert.equal(parsed.path1BlockId, "P1-04");
  assert.equal(parsed.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
});

test("P1-04 arithmetic compatibility route remains available before cutover", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-04",
    practiceMode: PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
    questionCount: 20,
    generationSeed: "p104-public-cutover-preflight:arithmetic-preservation",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 20);
  assert.equal(result.worksheetDocument.configSnapshot.metadata.path1BlockId, "P1-04");
  assert.equal(result.worksheetDocument.configSnapshot.metadata.practiceMode, "arithmetic");
});

test("P1-01/P1-02 equal-groups transfer remains accepted and P1-04 remains excluded from it", () => {
  for (const blockId of ["P1-01", "P1-02"]) {
    const normalized = normalizePath1ManualQueryState({
      path1BlockId: blockId,
      practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
    }, { validBlockIds });
    assert.equal(normalized.practiceMode, PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE);
    assert.equal(normalized.warnings.length, 0);
  }
  const p104 = normalizePath1ManualQueryState({
    path1BlockId: "P1-04",
    practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  }, { validBlockIds });
  assert.equal(p104.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
  assert.ok(warningCodes(p104).has("PATH1_PUBLIC_TRANSFER_MODE_BLOCK_NOT_SUPPORTED"));
});

test("cutover contract locks one shared mode with block-aware P1-03/P1-04 dispatch and distinct gate ids", () => {
  assert.equal(contract.cutoverDecision.publicPracticeModeId, "multiplicativeModelingTransfer");
  assert.deepEqual(contract.cutoverDecision.supportedBlockIdsAfterCutover, ["P1-03", "P1-04"]);
  assert.equal(
    contract.cutoverDecision.dispatchMap["P1-03"],
    "site/assets/browser/pipeline/build-path1-p1-03-multiplicative-modeling-worksheet.js",
  );
  assert.equal(
    contract.cutoverDecision.dispatchMap["P1-04"],
    "site/assets/browser/pipeline/build-path1-p1-04-multiplicative-modeling-worksheet.js",
  );
  assert.equal(contract.publicMetadataProjection.p103PublicCutoverGateId, "PATH1_P103_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_V1");
  assert.equal(contract.publicMetadataProjection.p104PublicCutoverGateId, "PATH1_P104_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_V1");
  assert.notEqual(
    contract.publicMetadataProjection.p103PublicCutoverGateId,
    contract.publicMetadataProjection.p104PublicCutoverGateId,
  );
});

test("P1-04 modeling authority stays on the matrix pair and forbids the two G4B-U01 compatibility KPs", () => {
  assert.deepEqual(contract.p104ModelingAuthority.matrixAuthoritativeKnowledgePointIds, [
    "kp_g4a_u02_2digit_by_3digit",
    "kp_g4a_u02_3digit_by_2digit",
  ]);
  assert.deepEqual(contract.p104ModelingAuthority.forbiddenModelingKnowledgePointIds, [
    "kp_g4b_u01_3digit_by_3digit",
    "kp_g4b_u01_4digit_by_3digit",
  ]);
  assert.equal(contract.p104ModelingAuthority.relationId, "R03_EQUAL_GROUPS");
  assert.equal(contract.p104ModelingAuthority.unknownRole, "totalAmount");
  assert.equal(contract.p104ModelingAuthority.semanticCommutativeRoleSwapAllowed, false);
  assert.equal(contract.p104ModelingAuthority.unitConversionAllowed, false);
  assert.equal(contract.p104ModelingAuthority.multiRelationAllowed, false);
  assert.equal(contract.p104ModelingAuthority.inverseUnknownRolesAllowed, false);
  assert.equal(contract.p104ModelingAuthority.numericEnvelopeExpansionAllowed, false);
});

test("current HTML uses one multiplicativeModelingTransfer option; future P1-04 cutover must not duplicate it", () => {
  const html = fs.readFileSync(path.join(repoRoot, "site/path1/index.html"), "utf8");
  const matches = html.match(/<option value="multiplicativeModelingTransfer">/g) ?? [];
  assert.equal(matches.length, 1);
  assert.match(html, /P1-03 使用二位數×二位數乘法建模/);
  assert.equal(contract.cutoverDecision.doNotCreateP104SpecificQueryModeId, true);
});
