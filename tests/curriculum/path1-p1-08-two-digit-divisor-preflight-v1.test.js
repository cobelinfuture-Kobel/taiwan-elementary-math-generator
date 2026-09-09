import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_P1_08_TWO_DIGIT_DIVISOR_PREFLIGHT_V1.json";
const REVIEW_PATH = "data/curriculum/application/reviews/PATH1_P1_08_CLOUD_SOURCE_PROVENANCE_RECONCILIATION_V1.json";
const IMPACT_PATH = "data/project/change-impact/PATH1_P1_08_TWO_DIGIT_DIVISOR_PREFLIGHT_V1.impact.json";
const PLAN_PATH = "data/project/validation-plans/PATH1_P1_08_TWO_DIGIT_DIVISOR_PREFLIGHT_V1.validation.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const KNOWLEDGE_PATH = "data/curriculum/knowledge/units/g4a_u04_4a04.knowledge-operation.json";
const BINDING_PATH = "site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";
const PATTERN_PATH = "site/modules/curriculum/batch-a/source-pattern-g4a-u04-extension.js";
const GENERATOR_PATH = "site/modules/curriculum/batch-a/g4a-u04-division-generator.js";
const DISPATCHER_PATH = "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";
const GENERIC_BUILDER_PATH = "site/assets/browser/pipeline/build-path1-manual-worksheet.js";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const review = JSON.parse(fs.readFileSync(REVIEW_PATH, "utf8"));
const impact = JSON.parse(fs.readFileSync(IMPACT_PATH, "utf8"));
const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));
const matrixText = fs.readFileSync(MATRIX_PATH, "utf8");
const knowledgeText = fs.readFileSync(KNOWLEDGE_PATH, "utf8");
const bindingText = fs.readFileSync(BINDING_PATH, "utf8");
const patternText = fs.readFileSync(PATTERN_PATH, "utf8");
const generatorText = fs.readFileSync(GENERATOR_PATH, "utf8");
const dispatcherText = fs.readFileSync(DISPATCHER_PATH, "utf8");
const genericBuilderText = fs.readFileSync(GENERIC_BUILDER_PATH, "utf8");

const PRIMARY_KPS = [
  "kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "kp_g4a_u04_3digit_by_2digit_tens_sufficient",
  "kp_g4a_u04_3digit_by_2digit_tens_insufficient",
];
const PATTERNS = [
  "ps_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "ps_g4a_u04_3digit_by_2digit_tens_sufficient",
  "ps_g4a_u04_3digit_by_2digit_tens_insufficient",
];

test("P1-08 preflight is planning-only and explicitly forbids runtime expansion", () => {
  assert.equal(contract.taskId, "PATH1_P1_08_TWO_DIGIT_DIVISOR_PREFLIGHT_V1");
  assert.equal(contract.resumeAuthority, "PATH1_P1_08_PUBLIC_PATH_CONTINUATION_PREFLIGHT_OR_CURRENT_PATH1_QUEUE_AUTHORITY");
  assert.equal(contract.status, "P1_08_TWO_DIGIT_DIVISOR_PREFLIGHT_LOCKED_NO_RUNTIME");
  assert.equal(contract.operatorScope, "APPROVED_PREFLIGHT_ONLY");
  for (const key of [
    "implementationAllowed",
    "runtimeChanged",
    "publicCutoverAllowed",
    "publicBindingMutationAllowed",
    "path1MatrixChanged",
    "newCanonicalKnowledgePointMinted",
    "newRelationMinted",
    "newPatternSpecMaterialized",
    "dedicatedPracticeModePlanned",
  ]) assert.equal(contract[key], false, key);
  for (const value of Object.values(contract.antiScopeCreep)) assert.equal(value, false);
});

test("current Path1 queue locks P1-08 after completed P1-07 and before P1-09", () => {
  assert.equal(contract.queueAuthority.previousBlockId, "P1-07");
  assert.equal(contract.queueAuthority.currentBlockId, "P1-08");
  assert.equal(contract.queueAuthority.currentBlockTitle, "二位數除數");
  assert.deepEqual(contract.queueAuthority.requiredPrerequisiteBlockIds, ["P1-07"]);
  assert.equal(contract.queueAuthority.prerequisiteSatisfied, true);
  assert.equal(contract.queueAuthority.nextBlockId, "P1-09");
  assert.equal(contract.queueAuthority.replanCompletedBlocksAllowed, false);
  assert.match(matrixText, /"blockId"\s*:\s*"P1-08"/);
  assert.match(matrixText, /"title"\s*:\s*"二位數除數"/);
  for (const id of PRIMARY_KPS) assert.equal(matrixText.includes(id), true, id);
});

test("canonical G4A-U04 source authority and all three primary KP mappings already exist", () => {
  assert.equal(contract.canonicalSourceAuthority.sourceId, "g4a_u04_4a04");
  assert.equal(contract.canonicalSourceAuthority.unitId, "4A-U04");
  assert.equal(contract.canonicalSourceAuthority.authorityStatus, "GOLDEN_CONFORMANT");
  assert.equal(contract.canonicalSourceAuthority.knowledgeRegistryState, "VALIDATED_COMPLETE");
  assert.deepEqual(contract.canonicalSourceAuthority.primaryKnowledgePointIds, PRIMARY_KPS);
  assert.equal(contract.knowledgePointContracts.length, 3);
  assert.equal(contract.formalMapping.length, 3);
  for (const id of PRIMARY_KPS) assert.equal(knowledgeText.includes(id), true, id);
  for (const id of PATTERNS) {
    assert.equal(knowledgeText.includes(id), true, `${id}:knowledge`);
    assert.equal(patternText.includes(id), true, `${id}:pattern`);
  }
  assert.equal(generatorText.includes("g4a_u04"), true);
});

test("primary PDF evidence is interpreted narrowly and adjacent Path1 semantics remain separated", () => {
  assert.equal(contract.canonicalSourceAuthority.primarySource.fileName, "batchA_02-題型總覽-4a04-整數的除法.pdf");
  assert.equal(contract.canonicalSourceAuthority.primarySource.googleDriveFileId, "1KgODz4ieK6XTFlV9OlqqXLtuDksP0t1f");
  assert.deepEqual(contract.canonicalSourceAuthority.primarySource.reviewedPages, [1, 2]);
  assert.equal(contract.sourceInterpretation.primaryCapability, "TWO_DIGIT_DIVISOR_ARITHMETIC_EXECUTION");
  assert.equal(contract.adjacentBoundaries["P1-06"].includes("estimateTrialQuotient"), true);
  assert.equal(contract.adjacentBoundaries["P1-07"].includes("quotientStartPlace"), true);
  assert.equal(contract.adjacentBoundaries["P1-09"].includes("larger-dividend"), true);
  assert.equal(contract.adjacentBoundaries["P1-11"].includes("remainder/checking"), true);
  assert.equal(contract.deferredEvidence.divisionCheckWithRemainder.includes("NOT_P108_PRIMARY_MASTERY"), true);
  assert.equal(contract.deferredEvidence.missingDigitDivisionReasoning.includes("DEFERRED"), true);
});

test("all three mandatory cloud evidence lanes were reviewed without overriding canonical authority", () => {
  assert.equal(review.allMandatoryLanesReviewed, true);
  const byId = new Map(review.lanes.map((lane) => [lane.sourceCorpusId, lane]));
  assert.equal(byId.size, 3);
  assert.equal(byId.get("TAIWAN_G3_G6_LEARNING_MAPS").evidenceStatus, "CURRICULUM_BOUNDARY_ONLY");
  assert.equal(byId.get("LI_TEACHER_MATH_THINKING_G1_G6").evidenceStatus, "NO_DIRECT_WITNESS");
  assert.equal(byId.get("MULTI_SCHOOL_EXAM_CORPUS_G03_G09").evidenceStatus, "DIRECT_WITNESS");
  assert.equal(byId.get("TAIWAN_G3_G6_LEARNING_MAPS").reviewedFileIds.includes("1B4lCR5BQngMGVNIMN-DGcfqMfC7y0jWI"), true);
  assert.equal(byId.get("LI_TEACHER_MATH_THINKING_G1_G6").reviewedFileIds.length, 2);
  assert.equal(byId.get("MULTI_SCHOOL_EXAM_CORPUS_G03_G09").reviewedFileIds.length, 3);
  for (const key of [
    "newKnowledgePointFromCloudEvidence",
    "newPatternSpecFromCloudEvidence",
    "newRelationFromCloudEvidence",
    "numericEnvelopeExpandedByCloudEvidence",
    "publicRouteActivatedByCloudEvidence",
    "masterySemanticsChangedByCloudEvidence",
  ]) assert.equal(review.reconciliation[key], false, key);
});

test("P1-08 already binds to the public generic arithmetic route; no dedicated mode is preflighted", () => {
  assert.equal(contract.existingRuntimeDecision.publicBindingAlignedWithMatrix, true);
  assert.equal(contract.existingRuntimeDecision.allThreeCanonicalPatternSpecsAlreadyExist, true);
  assert.equal(contract.existingRuntimeDecision.canonicalG4aU04GeneratorAlreadyExists, true);
  assert.equal(contract.existingRuntimeDecision.genericPath1ArithmeticRouteAlreadyExists, true);
  assert.equal(contract.existingRuntimeDecision.p108CurrentlyUsesGenericArithmeticRoute, true);
  assert.equal(contract.existingRuntimeDecision.newDedicatedPracticeModeRequired, false);
  assert.equal(contract.existingRuntimeDecision.newLocalPatternFamilyRequired, false);
  assert.equal(contract.existingRuntimeDecision.newGeneratorRequired, false);
  assert.equal(bindingText.includes('block("P1-08", "二位數除數"'), true);
  for (const id of PRIMARY_KPS) assert.equal(bindingText.includes(id), true, id);
  assert.equal(dispatcherText.includes("twoDigitDivisor"), false);
  assert.equal(genericBuilderText.includes("buildPath1ManualWorksheet"), true);
});

test("next shortest step is bounded acceptance of the existing generic arithmetic route, not implementation", () => {
  assert.equal(contract.futureAcceptanceContract.taskId, "PATH1_P1_08_TWO_DIGIT_DIVISOR_GENERIC_ARITHMETIC_ACCEPTANCE_V1");
  assert.equal(contract.futureAcceptanceContract.implementationAllowedByThisPreflight, false);
  assert.deepEqual(contract.futureAcceptanceContract.requiredQuestionCounts, [1, 20, 120]);
  assert.equal(contract.futureAcceptanceContract.runtimeMutationIfAcceptanceFails.startsWith("NOT_AUTHORIZED"), true);
  assert.equal(contract.distance.goalDistanceBefore, "D1_P108_GENERIC_ARITHMETIC_ROUTE_EXISTS_SOURCE_AUTHORITY_PREFLIGHT_NOT_LOCKED");
  assert.equal(contract.distance.goalDistanceAfterTarget, "D1_P108_SOURCE_AUTHORITY_LOCKED_GENERIC_ARITHMETIC_ACCEPTANCE_PENDING");
  assert.equal(contract.distance.nextShortestStep, "PATH1_P1_08_TWO_DIGIT_DIVISOR_GENERIC_ARITHMETIC_ACCEPTANCE_V1");
});

test("incremental validation is exactly KP_FOCUSED and does not request repository/global replay", () => {
  assert.equal(impact.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(impact.currentScope, "KP_LEAF");
  assert.equal(impact.expectedDerivedGate, "KP_FOCUSED");
  assert.deepEqual(impact.unitExpectedKnowledgePointIds, PRIMARY_KPS);
  assert.deepEqual(Object.keys(impact.unitKnowledgePointGateStatus), PRIMARY_KPS);
  for (const id of PRIMARY_KPS) {
    assert.equal(impact.unitKnowledgePointGateStatus[id], "PENDING", id);
  }
  assert.equal(impact.changeImpact.sharedExecutableChange, false);
  assert.equal(impact.changeImpact.publicAuthorityCutover, false);
  assert.equal(impact.changeImpact.currentAuthorityChanged, false);
  assert.equal(contract.validation.fullRepositoryRegressionRequired, false);
  assert.equal(contract.validation.globalBrowserReplayRequired, false);
  const lane = plan.lanes.KP_FOCUSED;
  assert.deepEqual(lane.map((entry) => entry.gateId), [
    "FOCUSED_TEST",
    "TARGETED_BROWSER_E2E",
    "DIRECT_DEPENDENCY_CONTRACTS",
  ]);
});
