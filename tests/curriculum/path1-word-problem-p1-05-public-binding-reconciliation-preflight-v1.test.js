import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  getPath1PublicWorksheetBlock,
} from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
import {
  buildPath1ManualWorksheet,
} from "../../site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";
import {
  normalizePath1ManualQueryState,
  PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
} from "../../site/assets/browser/state/path1-manual-query-state.js";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_05_PUBLIC_BINDING_RECONCILIATION_PREFLIGHT_V1.json";
const IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const BASE_BUILDER_PATH = "site/assets/browser/pipeline/build-path1-manual-worksheet.js";
const PUBLIC_BINDING_PATH = "site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
const PRACTICE_ENTRY_PATH = "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";
const G4B_U01_PATH = "data/curriculum/knowledge/units/g4b_u01_4b01.knowledge-operation.json";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const implementation = JSON.parse(fs.readFileSync(IMPLEMENTATION_PATH, "utf8"));
const matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, "utf8"));
const g4bU01 = JSON.parse(fs.readFileSync(G4B_U01_PATH, "utf8"));
const baseBuilderText = fs.readFileSync(BASE_BUILDER_PATH, "utf8");
const publicBindingText = fs.readFileSync(PUBLIC_BINDING_PATH, "utf8");
const practiceEntryText = fs.readFileSync(PRACTICE_ENTRY_PATH, "utf8");

const MATRIX_SINGLE = Object.freeze([
  "kp_g3a_u03_3digit_zero_middle_by_1digit",
]);
const EXTRA_G4B = Object.freeze([
  "kp_g4b_u01_multiplier_internal_zero",
  "kp_g4b_u01_trailing_zero_multiplication",
]);
const PUBLIC_THREE = Object.freeze([...MATRIX_SINGLE, ...EXTRA_G4B]);

function p105MatrixBlock() {
  return matrix.blocks.find((entry) => entry.blockId === "P1-05");
}

function g4bKnowledgePoint(id) {
  return g4bU01.knowledgePoints.find((entry) => entry.knowledgePointId === id);
}

test("reconciliation is planning-only and selects compatibility preservation plus modeling isolation", () => {
  assert.equal(contract.status, "P1_05_PUBLIC_BINDING_RECONCILIATION_LOCKED_NO_RUNTIME");
  assert.equal(contract.runtimeChanged, false);
  assert.equal(contract.publicBindingChanged, false);
  assert.equal(contract.path1MatrixChanged, false);
  assert.equal(contract.publicCutoverApplied, false);
  assert.equal(contract.visibleUiChanged, false);
  assert.equal(contract.queryStateChanged, false);
  assert.equal(contract.implementationChanged, false);
  assert.equal(
    contract.selectedReconciliation.strategy,
    "PRESERVE_EXISTING_ARITHMETIC_COMPATIBILITY_BREADTH_AND_SEPARATE_MODELING_AUTHORITY",
  );
  assert.equal(contract.selectedReconciliation.publicArithmeticBindingMutationRequiredForModelingCutover, false);
  assert.equal(contract.selectedReconciliation.path1MatrixMutationRequiredForModelingCutover, false);
  assert.equal(contract.selectedReconciliation.modelingMayInheritPublicArithmeticBindingKnowledgePointIds, false);
  assert.equal(contract.selectedReconciliation.modelingMustUseDedicatedP105Adapter, true);
});

test("Path1 matrix P1-05 authority remains exactly the single G3A-U03 zero-middle KP", () => {
  const block = p105MatrixBlock();
  assert.ok(block);
  assert.equal(block.blockId, "P1-05");
  assert.equal(block.title, "0 特殊情況");
  assert.equal(block.blockType, "DIRECT_KP");
  assert.deepEqual(block.primaryKnowledgePointIds, MATRIX_SINGLE);
  assert.ok(!block.primaryKnowledgePointIds.includes(EXTRA_G4B[0]));
  assert.ok(!block.primaryKnowledgePointIds.includes(EXTRA_G4B[1]));
  assert.deepEqual(contract.reconciliationProblem.matrixAuthoritativeKnowledgePointIds, MATRIX_SINGLE);
  assert.equal(contract.reconciliationProblem.matrixBlockType, "DIRECT_KP");
});

test("current public P1-05 arithmetic binding has three KPs and defaults to canonical-KP generation", () => {
  const block = getPath1PublicWorksheetBlock("P1-05");
  assert.ok(block);
  assert.deepEqual(block.knowledgePointIds, PUBLIC_THREE);
  assert.equal(block.generationKind, "CANONICAL_KP");
  assert.deepEqual(contract.reconciliationProblem.currentPublicArithmeticBindingKnowledgePointIds, PUBLIC_THREE);
  assert.deepEqual(contract.reconciliationProblem.extraPublicArithmeticKnowledgePointIds, EXTRA_G4B);
  assert.equal(contract.reconciliationProblem.currentPublicBindingGenerationKind, "CANONICAL_KP_DEFAULT");
});

test("base arithmetic builder consumes public binding knowledgePointIds, so drift is deployed runtime behavior", () => {
  assert.match(baseBuilderText, /getPath1PublicWorksheetBlock/);
  assert.match(baseBuilderText, /block\.knowledgePointIds/);
  assert.match(baseBuilderText, /allocateCounts\(count, block\.knowledgePointIds\.length\)/);
  assert.match(publicBindingText, /kp_g4b_u01_multiplier_internal_zero/);
  assert.match(publicBindingText, /kp_g4b_u01_trailing_zero_multiplication/);
  assert.match(contract.reconciliationProblem.runtimeConsequence, /existing deployed arithmetic behavior/);
});

test("extra G4B-U01 KPs are distinct arithmetic capabilities and are not application/modeling authority", () => {
  const internalZero = g4bKnowledgePoint(EXTRA_G4B[0]);
  const trailingZero = g4bKnowledgePoint(EXTRA_G4B[1]);
  assert.ok(internalZero);
  assert.ok(trailingZero);
  assert.equal(internalZero.applicationCapability, "NOT_APPLICABLE");
  assert.equal(trailingZero.applicationCapability, "NOT_APPLICABLE");
  assert.match(internalZero.scope, /乘數/);
  assert.match(internalZero.scope, /中間0/);
  assert.match(trailingZero.scope, /尾0/);
  assert.equal(contract.selectedReconciliation.modelingForbiddenKnowledgePointIds.includes(internalZero.knowledgePointId), true);
  assert.equal(contract.selectedReconciliation.modelingForbiddenKnowledgePointIds.includes(trailingZero.knowledgePointId), true);
});

test("non-public P1-05 modeling implementation remains bounded to the matrix primary KP", () => {
  assert.equal(implementation.status, "P1_05_MODELING_IMPLEMENTATION_MATERIALIZED_NON_PUBLIC");
  assert.equal(implementation.publicCutoverApplied, false);
  assert.equal(implementation.publicBindingChanged, false);
  assert.equal(implementation.g4bU01ModelingExpanded, false);
  assert.equal(implementation.arithmeticAuthority.knowledgePointId, MATRIX_SINGLE[0]);
  assert.deepEqual(contract.selectedReconciliation.modelingAuthorityKnowledgePointIds, MATRIX_SINGLE);
  assert.deepEqual(contract.selectedReconciliation.modelingForbiddenKnowledgePointIds, EXTRA_G4B);
  assert.deepEqual(implementation.publicBindingBoundary.observedCompatibilityBreadthNotAdoptedForModeling, EXTRA_G4B);
});

test("reconciliation rejects both shrinking deployed arithmetic breadth and expanding modeling authority", () => {
  const options = Object.fromEntries(contract.optionsConsidered.map((entry) => [entry.optionId, entry]));
  assert.equal(options.A_SHRINK_PUBLIC_ARITHMETIC_BINDING_TO_MATRIX_SINGLE_KP.decision, "REJECT_FOR_P105_MODELING_CUTOVER_PATH");
  assert.equal(options.B_PRESERVE_ARITHMETIC_COMPATIBILITY_BREADTH_BUT_WALL_OFF_MODELING_AUTHORITY.decision, "SELECTED");
  assert.equal(options.C_EXPAND_PATH1_MATRIX_OR_MODELING_TO_G4B_U01_ZERO_KPS.decision, "REJECT");
  assert.equal(contract.compatibilityExceptionContract.notCurriculumAuthority, true);
  assert.equal(contract.compatibilityExceptionContract.notModelingAuthority, true);
  assert.equal(contract.compatibilityExceptionContract.doesNotAuthorizeG4BU01Modeling, true);
  assert.equal(contract.compatibilityExceptionContract.separateDebtRemains, true);
});

test("P1-05 multiplicativeModelingTransfer is not yet public before the separate cutover preflight", () => {
  const validBlockIds = ["P1-01", "P1-02", "P1-03", "P1-04", "P1-05"];
  const normalized = normalizePath1ManualQueryState({
    path1BlockId: "P1-05",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  }, { validBlockIds });
  assert.equal(normalized.path1BlockId, "P1-05");
  assert.equal(normalized.practiceMode, "arithmetic");
  assert.ok(normalized.warnings.some((entry) => entry.code === "PATH1_PUBLIC_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED"));

  const result = buildPath1ManualWorksheet({
    blockId: "P1-05",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
    questionCount: 1,
    generationSeed: "p105-binding-reconciliation-no-public-cutover",
  });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED");
  assert.doesNotMatch(practiceEntryText, /buildPath1P105MultiplicativeModelingWorksheet/);
  assert.equal(contract.futurePublicModelingRouteContract.publicCutoverImplementationAllowedNow, false);
});

test("future P1-05 modeling route must dispatch directly to dedicated adapter and preserve arithmetic compatibility", () => {
  const future = contract.futurePublicModelingRouteContract;
  assert.equal(future.candidatePracticeMode, "multiplicativeModelingTransfer");
  assert.equal(future.supportedBlockId, "P1-05");
  assert.equal(future.dispatchTarget, "site/assets/browser/pipeline/build-path1-p1-05-zero-special-multiplicative-modeling-worksheet.js");
  assert.equal(future.mustNotRouteThrough, PUBLIC_BINDING_PATH);
  assert.equal(future.mustNotUseBaseArithmeticAllocationForModeling, true);
  assert.equal(future.mustPreserveP105ArithmeticModeAsCurrentlyDeployed, true);
  assert.equal(future.mustPreserveP103P104ModelingRoutes, true);
  assert.equal(future.mustPreserveP101P102EqualGroupsTransfer, true);
});

test("semantic and numeric authority remain unchanged by binding reconciliation", () => {
  assert.equal(contract.protectedSemantics.arithmeticKnowledgePointId, MATRIX_SINGLE[0]);
  assert.equal(contract.protectedSemantics.relationId, "R03_EQUAL_GROUPS");
  assert.equal(contract.protectedSemantics.canonicalInvariant, "totalAmount = amountPerGroup * groupCount");
  assert.equal(contract.protectedSemantics.unknownRole, "totalAmount");
  assert.equal(contract.protectedSemantics.semanticCommutativeRoleSwapAllowed, false);
  assert.equal(contract.protectedSemantics.unitConversionAllowed, false);
  assert.equal(contract.protectedSemantics.multiRelationAllowed, false);
  assert.equal(contract.protectedSemantics.inverseUnknownRolesIncluded, false);
  assert.equal(contract.protectedSemantics.g4bU01ModelingIncluded, false);
  assert.equal(implementation.arithmeticAuthority.operandPairCapacityBeforeContextProjection, 648);
});

test("next milestone is a separate P1-05 public cutover preflight, not implementation", () => {
  assert.equal(contract.antiScopeCreep.publicBindingMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.publicRouteMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.queryStateMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.uiMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.generatorMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.validatorMutationAllowed, false);
  assert.equal(contract.antiScopeCreep.patternSpecMutationAllowed, false);
  assert.equal(contract.acceptanceContract.fullRegressionRequired, false);
  assert.equal(contract.acceptanceContract.globalReplayRequired, false);
  assert.equal(
    contract.distance.nextShortestStep,
    "PATH1_WORD_PROBLEM_P1_05_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_PREFLIGHT_V1",
  );
});
