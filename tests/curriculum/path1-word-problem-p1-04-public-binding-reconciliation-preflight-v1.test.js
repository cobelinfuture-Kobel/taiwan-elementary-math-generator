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

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_04_PUBLIC_BINDING_RECONCILIATION_PREFLIGHT_V1.json";
const IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_04_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const BASE_BUILDER_PATH = "site/assets/browser/pipeline/build-path1-manual-worksheet.js";
const PUBLIC_BINDING_PATH = "site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const implementation = JSON.parse(fs.readFileSync(IMPLEMENTATION_PATH, "utf8"));
const matrix = JSON.parse(fs.readFileSync(MATRIX_PATH, "utf8"));
const baseBuilderText = fs.readFileSync(BASE_BUILDER_PATH, "utf8");
const publicBindingText = fs.readFileSync(PUBLIC_BINDING_PATH, "utf8");

const MATRIX_PAIR = Object.freeze([
  "kp_g4a_u02_2digit_by_3digit",
  "kp_g4a_u02_3digit_by_2digit",
]);
const EXTRA_G4B = Object.freeze([
  "kp_g4b_u01_3digit_by_3digit",
  "kp_g4b_u01_4digit_by_3digit",
]);
const PUBLIC_FOUR = Object.freeze([...MATRIX_PAIR, ...EXTRA_G4B]);

function p104MatrixBlock() {
  return matrix.blocks.find((entry) => entry.blockId === "P1-04");
}

test("reconciliation is planning-only and selects compatibility preservation plus modeling isolation", () => {
  assert.equal(contract.status, "P1_04_PUBLIC_BINDING_RECONCILIATION_LOCKED_NO_RUNTIME");
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
  assert.equal(contract.selectedReconciliation.modelingMustUseDedicatedP104Adapter, true);
});

test("Path1 matrix P1-04 authority remains exactly the two G4A-U02 KPs and DIFFICULTY_EXPANSION", () => {
  const block = p104MatrixBlock();
  assert.ok(block);
  assert.equal(block.blockId, "P1-04");
  assert.equal(block.title, "多位數×多位數");
  assert.equal(block.blockType, "DIFFICULTY_EXPANSION");
  assert.deepEqual(block.primaryKnowledgePointIds, MATRIX_PAIR);
  assert.ok(!block.primaryKnowledgePointIds.includes(EXTRA_G4B[0]));
  assert.ok(!block.primaryKnowledgePointIds.includes(EXTRA_G4B[1]));
  assert.deepEqual(contract.reconciliationProblem.matrixAuthoritativeKnowledgePointIds, MATRIX_PAIR);
  assert.equal(contract.reconciliationProblem.matrixBlockType, "DIFFICULTY_EXPANSION");
});

test("current public P1-04 arithmetic binding has four KPs and defaults to CANONICAL_KP generation", () => {
  const block = getPath1PublicWorksheetBlock("P1-04");
  assert.ok(block);
  assert.deepEqual(block.knowledgePointIds, PUBLIC_FOUR);
  assert.equal(block.generationKind, "CANONICAL_KP");
  assert.deepEqual(contract.reconciliationProblem.currentPublicArithmeticBindingKnowledgePointIds, PUBLIC_FOUR);
  assert.deepEqual(contract.reconciliationProblem.extraPublicArithmeticKnowledgePointIds, EXTRA_G4B);
  assert.equal(contract.reconciliationProblem.currentPublicBindingGenerationKind, "CANONICAL_KP_DEFAULT");
});

test("base arithmetic builder consumes public binding knowledgePointIds, so drift is runtime behavior rather than metadata only", () => {
  assert.match(baseBuilderText, /getPath1PublicWorksheetBlock/);
  assert.match(baseBuilderText, /block\.knowledgePointIds/);
  assert.match(baseBuilderText, /knowledgePointIds/);
  assert.match(publicBindingText, /kp_g4b_u01_3digit_by_3digit/);
  assert.match(publicBindingText, /kp_g4b_u01_4digit_by_3digit/);
  assert.match(contract.reconciliationProblem.runtimeConsequence, /existing public arithmetic behavior/);
});

test("non-public P1-04 modeling implementation remains bounded to the matrix pair and does not adopt G4B-U01", () => {
  assert.equal(implementation.status, "P1_04_MODELING_IMPLEMENTATION_MATERIALIZED_NON_PUBLIC");
  assert.equal(implementation.publicCutoverApplied, false);
  assert.equal(implementation.publicBindingChanged, false);
  assert.equal(implementation.g4bU01ModelingExpanded, false);
  assert.deepEqual(
    implementation.implementation.arithmeticForms.map((entry) => entry.arithmeticKnowledgePointId),
    MATRIX_PAIR,
  );
  assert.deepEqual(contract.selectedReconciliation.modelingAuthorityKnowledgePointIds, MATRIX_PAIR);
  assert.deepEqual(contract.selectedReconciliation.modelingForbiddenKnowledgePointIds, EXTRA_G4B);
});

test("reconciliation rejects both shrinking deployed arithmetic breadth and expanding curriculum authority", () => {
  const options = Object.fromEntries(contract.optionsConsidered.map((entry) => [entry.optionId, entry]));
  assert.equal(options.A_SHRINK_PUBLIC_ARITHMETIC_BINDING_TO_MATRIX_PAIR.decision, "REJECT_FOR_P104_MODELING_CUTOVER_PATH");
  assert.equal(options.B_PRESERVE_ARITHMETIC_COMPATIBILITY_BREADTH_BUT_WALL_OFF_MODELING_AUTHORITY.decision, "SELECTED");
  assert.equal(options.C_EXPAND_PATH1_MATRIX_TO_G4B_U01.decision, "REJECT");
  assert.equal(contract.compatibilityExceptionContract.notCurriculumAuthority, true);
  assert.equal(contract.compatibilityExceptionContract.notModelingAuthority, true);
  assert.equal(contract.compatibilityExceptionContract.doesNotAuthorizeG4BU01Modeling, true);
  assert.equal(contract.compatibilityExceptionContract.separateDebtRemains, true);
});

test("P1-04 multiplicativeModelingTransfer is not yet a public route before the separate cutover preflight", () => {
  const validBlockIds = ["P1-01", "P1-02", "P1-03", "P1-04"];
  const normalized = normalizePath1ManualQueryState({
    path1BlockId: "P1-04",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
  }, { validBlockIds });
  assert.equal(normalized.path1BlockId, "P1-04");
  assert.equal(normalized.practiceMode, "arithmetic");
  assert.ok(normalized.warnings.some((entry) => entry.code === "PATH1_PUBLIC_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED"));

  const result = buildPath1ManualWorksheet({
    blockId: "P1-04",
    practiceMode: PATH1_MANUAL_P103_MULTIPLICATIVE_MODELING_MODE,
    questionCount: 1,
    generationSeed: "p104-binding-reconciliation-no-public-cutover",
  });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PATH1_P103_MODELING_MODE_BLOCK_NOT_SUPPORTED");
  assert.equal(contract.futurePublicModelingRouteContract.publicCutoverImplementationAllowedNow, false);
});

test("future P1-04 modeling route must dispatch directly to the dedicated adapter and preserve arithmetic compatibility", () => {
  const future = contract.futurePublicModelingRouteContract;
  assert.equal(future.candidatePracticeMode, "multiplicativeModelingTransfer");
  assert.equal(future.supportedBlockId, "P1-04");
  assert.equal(future.dispatchTarget, "site/assets/browser/pipeline/build-path1-p1-04-multiplicative-modeling-worksheet.js");
  assert.equal(future.mustNotRouteThrough, PUBLIC_BINDING_PATH);
  assert.equal(future.mustNotUseBaseArithmeticAllocationForModeling, true);
  assert.equal(future.mustPreserveP104ArithmeticModeAsCurrentlyDeployed, true);
  assert.equal(future.mustPreserveP103ModelingRoute, true);
  assert.equal(future.mustPreserveP101P102EqualGroupsTransfer, true);
});

test("semantic and numeric authority remain unchanged by binding reconciliation", () => {
  assert.equal(contract.protectedSemantics.relationId, "R03_EQUAL_GROUPS");
  assert.equal(contract.protectedSemantics.canonicalInvariant, "totalAmount = amountPerGroup * groupCount");
  assert.equal(contract.protectedSemantics.unknownRole, "totalAmount");
  assert.equal(contract.protectedSemantics.semanticCommutativeRoleSwapAllowed, false);
  assert.equal(contract.protectedSemantics.unitConversionAllowed, false);
  assert.equal(contract.protectedSemantics.multiRelationAllowed, false);
  assert.equal(contract.protectedSemantics.r05Included, false);
  assert.equal(contract.protectedSemantics.inverseUnknownRolesIncluded, false);
  assert.deepEqual(contract.protectedSemantics.arithmeticForms.map((entry) => entry.arithmeticKnowledgePointId), MATRIX_PAIR);
});

test("next milestone is a separate P1-04 public cutover preflight, not implementation", () => {
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
    "PATH1_WORD_PROBLEM_P1_04_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_PREFLIGHT_V1",
  );
});
