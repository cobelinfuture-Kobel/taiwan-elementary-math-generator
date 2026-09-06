import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildPath1ManualWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";
import {
  buildPath1P103MultiplicativeModelingWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-p1-03-multiplicative-modeling-worksheet.js";
import {
  PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
} from "../../site/modules/curriculum/learning-paths/path1-p1-03-multiplicative-modeling-patterns.js";
import {
  normalizePath1ManualQueryState,
  parsePath1ManualQueryState,
  PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
  PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
} from "../../site/assets/browser/state/path1-manual-query-state.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const contractPath = path.join(
  repoRoot,
  "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_03_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_PREFLIGHT_V1.json",
);
const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
const validBlockIds = ["P1-01", "P1-02", "P1-03", "P1-04"];

function errorCodes(result) {
  return new Set((result?.errors ?? []).map((entry) => entry.code));
}

function warningCodes(result) {
  return new Set((result?.warnings ?? []).map((entry) => entry.code));
}

test("P1-03 public cutover preflight is planning-only and locks the separate implementation boundary", () => {
  assert.equal(contract.taskId, "PATH1_WORD_PROBLEM_P1_03_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_PREFLIGHT_V1");
  assert.equal(contract.status, "P1_03_PUBLIC_CUTOVER_PREFLIGHT_LOCKED_NO_PRODUCT_CHANGE");
  assert.equal(contract.implementationAllowed, false);
  assert.equal(contract.publicCutoverApplied, false);
  assert.equal(contract.productRuntimeChanged, false);
  assert.equal(contract.implementationApprovalBoundary.separateApprovalRequired, true);
  assert.equal(
    contract.implementationApprovalBoundary.nextTask,
    "PATH1_WORD_PROBLEM_P1_03_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_IMPLEMENTATION_V1",
  );
  assert.equal(contract.implementationApprovalBoundary.stopAfterPreflightMerge, true);
});

test("future public cutover is bounded to four exact product files", () => {
  assert.deepEqual(contract.futureImplementationPlan.allowedProductFiles, [
    "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js",
    "site/assets/browser/state/path1-manual-query-state.js",
    "site/assets/browser/path1-manual.js",
    "site/path1/index.html",
  ]);
  for (const relativePath of contract.futureImplementationPlan.allowedProductFiles) {
    assert.equal(fs.existsSync(path.join(repoRoot, relativePath)), true, relativePath);
  }
  for (const relativePath of contract.futureImplementationPlan.mustNotModify.filter((entry) => !entry.includes(" runtime") && !entry.includes(" public route") && !entry.includes("Classic"))) {
    assert.equal(fs.existsSync(path.join(repoRoot, relativePath)), true, relativePath);
  }
});

test("dedicated P1-03 modeling runtime is already usable but still marks itself non-public", () => {
  const result = buildPath1P103MultiplicativeModelingWorksheet({
    blockId: "P1-03",
    practiceMode: PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
    questionCount: 20,
    generationSeed: "p103-public-cutover-preflight",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 20);
  assert.equal(result.worksheetDocument.configSnapshot.metadata.path1BlockId, "P1-03");
  assert.equal(result.worksheetDocument.configSnapshot.metadata.practiceMode, PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE);
  assert.equal(result.worksheetDocument.configSnapshot.metadata.publicCutoverApplied, false);
  assert.equal(
    result.worksheetDocument.configSnapshot.metadata.masteryCredit,
    "NONE_UNTIL_SEPARATE_MASTERY_INTEGRATION_APPROVAL",
  );
});

test("current public practice entry has not cut over P1-03 modeling yet", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-03",
    practiceMode: PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
    questionCount: 1,
    generationSeed: "p103-public-cutover-preflight-current-entry",
  });
  assert.equal(result.ok, false);
  assert.ok(errorCodes(result).has("PATH1_PRACTICE_MODE_NOT_SUPPORTED"));
});

test("current public query state still rejects P1-03 multiplicativeModelingTransfer and normalizes to arithmetic", () => {
  const normalized = normalizePath1ManualQueryState({
    path1BlockId: "P1-03",
    practiceMode: PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE,
  }, { validBlockIds });
  assert.equal(normalized.path1BlockId, "P1-03");
  assert.equal(normalized.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
  assert.ok(warningCodes(normalized).has("PATH1_PUBLIC_PRACTICE_MODE_QUERY_FALLBACK"));

  const parsed = parsePath1ManualQueryState(
    `?path1BlockId=P1-03&practiceMode=${PATH1_P1_03_MULTIPLICATIVE_MODELING_PRACTICE_MODE}`,
    { validBlockIds },
  );
  assert.equal(parsed.path1BlockId, "P1-03");
  assert.equal(parsed.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
});

test("existing P1-01/P1-02 equal-groups public contract remains accepted and P1-03 remains excluded from it", () => {
  for (const blockId of ["P1-01", "P1-02"]) {
    const normalized = normalizePath1ManualQueryState({
      path1BlockId: blockId,
      practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
    }, { validBlockIds });
    assert.equal(normalized.practiceMode, PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE);
    assert.equal(normalized.warnings.length, 0);

    const result = buildPath1ManualWorksheet({
      blockId,
      practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
      questionCount: 1,
      generationSeed: `p103-public-cutover-preflight:${blockId}`,
    });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
  }

  const p103 = normalizePath1ManualQueryState({
    path1BlockId: "P1-03",
    practiceMode: PATH1_MANUAL_EQUAL_GROUPS_TRANSFER_MODE,
  }, { validBlockIds });
  assert.equal(p103.practiceMode, PATH1_MANUAL_DEFAULT_PRACTICE_MODE);
  assert.ok(warningCodes(p103).has("PATH1_PUBLIC_TRANSFER_MODE_BLOCK_NOT_SUPPORTED"));
});

test("P1-03 arithmetic public route remains available and unchanged before cutover", () => {
  const result = buildPath1ManualWorksheet({
    blockId: "P1-03",
    practiceMode: PATH1_MANUAL_DEFAULT_PRACTICE_MODE,
    questionCount: 20,
    generationSeed: "p103-public-cutover-preflight:arithmetic-preservation",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 20);
  assert.equal(result.worksheetDocument.configSnapshot.metadata.path1BlockId, "P1-03");
  assert.equal(result.worksheetDocument.configSnapshot.metadata.practiceMode, "arithmetic");
});

test("locked public-cutover invariants preserve P1-03 semantics and numeric envelope", () => {
  assert.equal(contract.semanticAndNumericInvariants.relationId, "R03_EQUAL_GROUPS");
  assert.equal(contract.semanticAndNumericInvariants.canonicalInvariant, "totalAmount = amountPerGroup * groupCount");
  assert.equal(contract.semanticAndNumericInvariants.unknownRole, "totalAmount");
  assert.equal(contract.semanticAndNumericInvariants.semanticCommutativeRoleSwapAllowed, false);
  assert.equal(contract.semanticAndNumericInvariants.unitConversionAllowed, false);
  assert.equal(contract.semanticAndNumericInvariants.multiRelationAllowed, false);
  assert.equal(contract.semanticAndNumericInvariants.inverseUnknownRolesAllowed, false);
  assert.equal(contract.antiScopeCreep.newKnowledgePointAllowed, false);
  assert.equal(contract.antiScopeCreep.newRelationAllowed, false);
  assert.equal(contract.antiScopeCreep.newPatternSpecAllowed, false);
  assert.equal(contract.antiScopeCreep.numericEnvelopeExpansionAllowed, false);
});
