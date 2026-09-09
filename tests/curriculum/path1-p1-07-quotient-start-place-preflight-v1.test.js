import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getPath1PublicWorksheetBlock } from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const readText = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const contract = readJson("data/curriculum/application/contracts/PATH1_P1_07_QUOTIENT_START_PLACE_PREFLIGHT_V1.json");
const matrix = readJson("data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json");
const g3bU01 = readJson("data/curriculum/knowledge/units/g3b_u01_3b01.knowledge-operation.json");
const sourcePatternTextsByPath = new Map([
  [
    "site/modules/curriculum/batch-a/source-pattern-index.js",
    readText("site/modules/curriculum/batch-a/source-pattern-index.js"),
  ],
  [
    "site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js",
    readText("site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js"),
  ],
]);
const cloudRegistry = readJson("data/curriculum/application/reviews/PATH1_CLOUD_SOURCE_CORPUS_REGISTRY_V2.json");
const cloudReview = readJson("data/curriculum/application/reviews/PATH1_P1_05_P1_07_CLOUD_SOURCE_PROVENANCE_RECONCILIATION_V1.json");

const primaryKps = [
  "kp_g3b_u01_2digit_division_place_value_cases",
  "kp_g3b_u01_3digit_division_place_value_cases",
];

const semanticParents = [
  "ps_g3b_u01_2digit_by_1digit_regroup_tens",
  "ps_g3b_u01_2digit_leading_digit_insufficient",
  "ps_g3b_u01_2digit_leading_digit_exact",
  "ps_g3b_u01_3digit_by_1digit_regroup_hundreds",
  "ps_g3b_u01_3digit_hundreds_insufficient",
  "ps_g3b_u01_3digit_hundreds_exact",
];

const semanticParentProducerPaths = {
  ps_g3b_u01_2digit_by_1digit_regroup_tens: "site/modules/curriculum/batch-a/source-pattern-index.js",
  ps_g3b_u01_2digit_leading_digit_insufficient: "site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js",
  ps_g3b_u01_2digit_leading_digit_exact: "site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js",
  ps_g3b_u01_3digit_by_1digit_regroup_hundreds: "site/modules/curriculum/batch-a/source-pattern-index.js",
  ps_g3b_u01_3digit_hundreds_insufficient: "site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js",
  ps_g3b_u01_3digit_hundreds_exact: "site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js",
};

test("P1-07 preflight consumes merged cloud provenance and remains planning-only", () => {
  assert.equal(contract.taskId, "PATH1_P1_07_QUOTIENT_START_PLACE_PREFLIGHT_V1");
  assert.equal(contract.resumeAuthority, "PATH1_P1_07_PUBLIC_PATH_CONTINUATION_PREFLIGHT_OR_CURRENT_PATH1_QUEUE_AUTHORITY");
  assert.equal(contract.cloudProvenanceReconciliationTaskId, "PATH1_P1_05_P1_07_CLOUD_SOURCE_PROVENANCE_RECONCILIATION_V1");
  assert.equal(contract.status, "P1_07_QUOTIENT_START_PLACE_PREFLIGHT_CLOUD_PROVENANCE_RECONCILED_NO_RUNTIME");
  assert.equal(contract.cloudProvenanceMergeSha, "0333cc608ad29a154eaedafb9eb2508332894a59");
  assert.equal(contract.operatorScope, "APPROVED_PREFLIGHT_ONLY");
  assert.equal(contract.implementationAllowed, false);
  assert.equal(contract.runtimeChanged, false);
  assert.equal(contract.publicCutoverAllowed, false);
  assert.equal(contract.currentQueueAuthority.previousCompletedBlock, "P1-06");
  assert.equal(contract.currentQueueAuthority.currentBlock, "P1-07");
  assert.equal(contract.currentQueueAuthority.nextBlock, "P1-08");
});

test("P1-07 matrix authority is exact and P1-01 through P1-06 are not replanned", () => {
  const block = matrix.blocks.find((entry) => entry.blockId === "P1-07");
  assert.ok(block);
  assert.equal(block.title, "商的位值");
  assert.equal(block.blockType, "COMPOSITE_KP");
  assert.deepEqual(block.primaryKnowledgePointIds, primaryKps);
  assert.deepEqual(block.requiredPrerequisites.blockIds, ["P1-06"]);
  assert.deepEqual(block.optionalSupportingKnowledgePointIds, ["kp_g3b_u01_quotient_zero_cases"]);
  assert.equal(block.patternExpansion.length, 1);
  assert.equal(block.patternExpansion[0].kind, "DESCRIPTIVE_DIFFICULTY_EXPANSION");
  assert.equal(block.patternExpansion[0].id, "quotient_start_place_cases");
  assert.deepEqual(block.masteryGate.requiredKnowledgePointIds, primaryKps);
  assert.deepEqual(block.masteryGate.requiredPatternIds, ["quotient_start_place_cases"]);
  assert.ok(contract.scope.excluded.some((entry) => entry.includes("P1-01 through P1-06")));
});

test("G3B-U01 remains the canonical one-digit-divisor V1 arithmetic authority", () => {
  assert.equal(g3bU01.sourceId, "g3b_u01_3b01");
  assert.equal(g3bU01.unitCode, "3B-U01");
  assert.equal(g3bU01.title, "除法");
  assert.equal(g3bU01.knowledgeRegistryState, "VALIDATED_COMPLETE");
  assert.equal(contract.canonicalArithmeticAuthority.v1RuntimeDivisorEnvelope, "one-digit divisors 2..9 only");

  const unitKps = new Map(g3bU01.knowledgePoints.map((entry) => [entry.knowledgePointId, entry]));
  const twoDigit = unitKps.get(primaryKps[0]);
  const threeDigit = unitKps.get(primaryKps[1]);
  assert.ok(twoDigit);
  assert.ok(threeDigit);
  assert.equal(twoDigit.knowledgePointName, "二位數除以一位數商位判斷");
  assert.equal(threeDigit.knowledgePointName, "三位數除以一位數商位判斷");
  assert.ok(twoDigit.scope.includes("判斷商的位數"));
  assert.ok(threeDigit.scope.includes("判斷商的首位位置"));
  assert.ok(twoDigit.operationModels[0].numberConstraints.includes("10 <= dividend <= 99"));
  assert.ok(twoDigit.operationModels[0].numberConstraints.includes("2 <= divisor <= 9"));
  assert.ok(threeDigit.operationModels[0].numberConstraints.includes("100 <= dividend <= 999"));
  assert.ok(threeDigit.operationModels[0].numberConstraints.includes("2 <= divisor <= 9"));
  assert.ok(twoDigit.operationModels[0].validationInvariants.includes("division is exact"));
  assert.ok(threeDigit.operationModels[0].validationInvariants.includes("division is exact"));
});

test("existing G3B-U01 PatternSpecs are semantic parents and use their canonical producer paths", () => {
  assert.deepEqual(contract.canonicalArithmeticAuthority.existingSemanticParentPatternSpecIds, semanticParents);
  const bindingByPatternSpecId = new Map(g3bU01.existingQuestionBindings.map((entry) => [entry.questionId, entry]));

  for (const patternSpecId of semanticParents) {
    const binding = bindingByPatternSpecId.get(patternSpecId);
    assert.ok(binding, `${patternSpecId} must exist in canonical existingQuestionBindings`);
    const expectedSourcePath = semanticParentProducerPaths[patternSpecId];
    assert.equal(binding.sourcePath, expectedSourcePath, `${patternSpecId} canonical producer path`);
    const producerText = sourcePatternTextsByPath.get(binding.sourcePath);
    assert.ok(producerText, `${patternSpecId} producer file must be explicitly loaded`);
    assert.ok(producerText.includes(patternSpecId), `${patternSpecId} must exist in ${binding.sourcePath}`);
  }

  assert.equal(contract.newCanonicalKnowledgePointMinted, false);
  assert.equal(contract.newPatternSpecMaterialized, false);
  assert.equal(contract.representationDecision.mustReuseExistingSemanticParents, true);
  assert.equal(contract.representationDecision.newCanonicalKnowledgePointRequired, false);
});

test("all three operator-mandated cloud evidence lanes are explicitly evaluated for P1-07", () => {
  assert.equal(cloudRegistry.mandatoryLaneEvaluationPolicy.allThreeLanesMustBeEvaluated, true);
  assert.deepEqual(cloudRegistry.mandatoryEvidenceLanes.map((entry) => entry.sourceCorpusId), [
    "TAIWAN_G3_G6_LEARNING_MAPS",
    "LI_TEACHER_MATH_THINKING_G1_G6",
    "MULTI_SCHOOL_EXAM_CORPUS_G03_G09",
  ]);
  assert.equal(contract.mandatoryCloudEvidence.allThreeLanesEvaluated, true);
  assert.equal(contract.mandatoryCloudEvidence.learningMaps.sourceCorpusId, "TAIWAN_G3_G6_LEARNING_MAPS");
  assert.equal(contract.mandatoryCloudEvidence.liTeacher.sourceCorpusId, "LI_TEACHER_MATH_THINKING_G1_G6");
  assert.equal(contract.mandatoryCloudEvidence.schoolExams.sourceCorpusId, "MULTI_SCHOOL_EXAM_CORPUS_G03_G09");
  assert.equal(contract.mandatoryCloudEvidence.learningMaps.evidenceStatus, "CURRICULUM_BOUNDARY_ONLY");
  assert.equal(contract.mandatoryCloudEvidence.liTeacher.evidenceStatus, "NO_DIRECT_WITNESS");
  assert.equal(contract.mandatoryCloudEvidence.schoolExams.evidenceStatus, "DIRECT_WITNESS");
});

test("learning maps establish the one-digit to two-digit divisor curriculum progression without changing V1 runtime", () => {
  assert.deepEqual(contract.mandatoryCloudEvidence.learningMaps.reviewedFileIds, [
    "1OpYq57SRbQhfrkvqucR5eL2FJzd71SNd",
    "1B4lCR5BQngMGVNIMN-DGcfqMfC7y0jWI",
  ]);
  const text = contract.mandatoryCloudEvidence.learningMaps.observedWitnesses.join("\n");
  assert.match(text, /二、三位數除以一位數/);
  assert.match(text, /二到四位數÷二位數/);
  assert.match(contract.mandatoryCloudEvidence.learningMaps.authorityUse, /progression/i);
});

test("Li Teacher lane records explicit no-direct-witness rather than being silently omitted", () => {
  const li = contract.mandatoryCloudEvidence.liTeacher;
  assert.deepEqual(li.reviewedFileIds, [
    "1q3TLW8vYlDC-zO2N2zOKT5aUJ0Q6snq8",
    "1YGF0ffKRpDglm2cg2-Tr8Ejmr2ktt-x3",
    "1WfE-POEKk-7kjMv7uytdwkq0jy9hf4kR",
    "1ewWwnh4GayBL9dC-GPLZAJaDJ7egsHKU",
  ]);
  assert.match(li.observedWitnessesOrNoWitnessReason, /No reviewed direct 商是幾位數/);
  assert.match(li.authorityUse, /no P1-07 Pattern admission/i);
});

test("multi-school exams directly support quotient digit-count representation including two-digit divisors", () => {
  const exams = contract.mandatoryCloudEvidence.schoolExams;
  assert.deepEqual(exams.reviewedFileIds, [
    "1ZcSC_R_O-ffR4VdC8mT4o8r8m9D0zKHE",
    "1WlXVM_G-gk_A9gvjof2j0C4cekL8umdw",
    "1ZLTZRGPTIFlYe9hIZBelgb-niUc8h1jx",
  ]);
  const text = exams.observedWitnesses.join("\n");
  assert.match(text, /573÷57/);
  assert.match(text, /302÷42/);
  assert.match(text, /□36÷78/);
  assert.match(exams.authorityUse, /two-digit-divisor surfaces/i);

  const reviewP107 = cloudReview.reconciliations.find((entry) => entry.blockId === "P1-07");
  assert.ok(reviewP107);
  assert.equal(reviewP107.schoolExamEvidence.evidenceStatus, "DIRECT_WITNESS");
});

test("formal mapping keeps four canonical V1 cases while acknowledging separately deferred two-digit-divisor semantic transfer evidence", () => {
  assert.equal(contract.formalMapping.capabilityId, "QUOTIENT_START_PLACE_AND_DIGIT_COUNT_CLASSIFICATION");
  const cases = new Map(contract.formalMapping.caseRules.map((entry) => [entry.caseId, entry]));
  assert.deepEqual(cases.get("P107_2DIGIT_LEADING_INSUFFICIENT"), {
    caseId: "P107_2DIGIT_LEADING_INSUFFICIENT",
    condition: "tensDigit < divisor",
    expectedStartPlace: "ONES",
    expectedQuotientDigits: 1,
  });
  assert.deepEqual(cases.get("P107_2DIGIT_LEADING_SUFFICIENT"), {
    caseId: "P107_2DIGIT_LEADING_SUFFICIENT",
    condition: "tensDigit >= divisor",
    expectedStartPlace: "TENS",
    expectedQuotientDigits: 2,
  });
  assert.deepEqual(cases.get("P107_3DIGIT_HUNDREDS_INSUFFICIENT"), {
    caseId: "P107_3DIGIT_HUNDREDS_INSUFFICIENT",
    condition: "hundredsDigit < divisor",
    expectedStartPlace: "TENS",
    expectedQuotientDigits: 2,
  });
  assert.deepEqual(cases.get("P107_3DIGIT_HUNDREDS_SUFFICIENT"), {
    caseId: "P107_3DIGIT_HUNDREDS_SUFFICIENT",
    condition: "hundredsDigit >= divisor",
    expectedStartPlace: "HUNDREDS",
    expectedQuotientDigits: 3,
  });
  assert.equal(contract.formalMapping.twoDigitDivisorSemanticTransferEvidence.supportedBySchoolExamCorpus, true);
  assert.equal(contract.formalMapping.twoDigitDivisorSemanticTransferEvidence.admittedToV1Runtime, false);
});

test("P1-07 local representation candidates remain bounded to the canonical one-digit-divisor V1 layer", () => {
  assert.equal(contract.representationDecision.strategy, "PATH1_LOCAL_QUOTIENT_START_PLACE_REPRESENTATION_LAYER");
  assert.deepEqual(contract.representationDecision.candidateLocalPatternSpecIds, [
    "P107_2DIGIT_START_PLACE_SELECT",
    "P107_2DIGIT_QUOTIENT_DIGIT_COUNT",
    "P107_3DIGIT_START_PLACE_SELECT",
    "P107_3DIGIT_QUOTIENT_DIGIT_COUNT",
  ]);
  assert.equal(contract.representationDecision.newRelationRequired, false);
  assert.equal(contract.representationDecision.newContextFamilyRequired, false);
  assert.equal(contract.representationDecision.quotientZeroCasesPrimaryInV1, false);
  assert.equal(contract.representationDecision.twoDigitDivisorRepresentationExtension.status, "DEFERRED_REQUIRES_SEPARATE_APPROVAL");
  assert.equal(contract.representationDecision.twoDigitDivisorRepresentationExtension.semanticEvidencePresent, true);
  assert.equal(contract.representationDecision.twoDigitDivisorRepresentationExtension.materializedInThisPreflight, false);
});

test("P1-07 versus P1-08 boundary separates semantic capability ownership from arithmetic execution ownership", () => {
  assert.match(contract.boundaryWithAdjacentBlocks["P1-06"], /estimation|trial/i);
  assert.match(contract.boundaryWithAdjacentBlocks["P1-08"], /P1-07 owns quotient-start-place/);
  assert.match(contract.boundaryWithAdjacentBlocks["P1-08"], /representation evidence only/);
  assert.match(contract.boundaryWithAdjacentBlocks["P1-08"], /P1-08 owns full two-digit-divisor arithmetic execution/);
  assert.match(contract.boundaryWithAdjacentBlocks["P1-11"], /remainder/i);
  assert.match(contract.boundaryWithAdjacentBlocks["P1-12"], /inverse equal-groups|relation/i);
});

test("public arithmetic binding remains aligned and no public cutover is performed by preflight", () => {
  const binding = getPath1PublicWorksheetBlock("P1-07");
  assert.ok(binding);
  assert.deepEqual([...binding.knowledgePointIds], primaryKps);
  assert.deepEqual(contract.publicBindingReconciliation.currentPublicBindingKnowledgePointIds, primaryKps);
  assert.equal(contract.publicBindingReconciliation.status, "ALIGNED_NO_BINDING_DRIFT");
  assert.equal(contract.publicBindingReconciliation.publicBindingChangeRequired, false);
  assert.equal(contract.publicBindingMutationAllowed, false);
  assert.equal(contract.publicCutoverAllowed, false);
});

test("future V1 validator is fail-closed against unapproved two-digit-divisor runtime leakage", () => {
  const checks = contract.futureValidatorContract.requiredChecks.join("\n");
  assert.match(checks, /V1 runtime divisor is a one-digit integer from 2 through 9/);
  assert.match(checks, /division is exact/);
  assert.match(checks, /two-digit-divisor quotient-place evidence must not leak into V1 runtime/);
  assert.match(checks, /no divisor estimation/);
  assert.match(checks, /remainder interpretation/);
  assert.match(checks, /word-problem relation/);
  assert.equal(contract.futureImplementationContract.v1DivisorEnvelope, "2..9 one-digit divisors only");
  assert.equal(contract.futureImplementationContract.twoDigitDivisorRepresentationExtensionAllowed, false);
});

test("primary source evidence keeps quotient-zero as optional support rather than P1-07 V1 primary scope", () => {
  assert.equal(contract.primarySourceEvidence.sourceId, "g3b_u01_3b01");
  assert.equal(contract.canonicalArithmeticAuthority.sourceFileName, "batchA_01-題型總覽-3b01-除法.pdf");
  assert.deepEqual(contract.primarySourceEvidence.pageWitnesses.map((entry) => entry.page), [1, 2]);
  const evidenceText = JSON.stringify(contract.primarySourceEvidence.pageWitnesses);
  assert.match(evidenceText, /商寫在個位/);
  assert.match(evidenceText, /商寫在十位/);
  assert.match(evidenceText, /最高位不夠除/);
  assert.match(evidenceText, /最高位夠除/);
  assert.equal(contract.optionalSupportingBoundary.knowledgePointId, "kp_g3b_u01_quotient_zero_cases");
  assert.equal(contract.optionalSupportingBoundary.status, "DEFERRED_FROM_P107_PRIMARY_V1");
});

test("P1-07 preflight uses policy-required KP_FOCUSED gates and implementation still requires separate approval", () => {
  assert.equal(contract.validationPolicy.currentScope, "KP_LEAF");
  assert.equal(contract.validationPolicy.sharedExecutableChange, false);
  assert.equal(contract.validationPolicy.publicAuthorityCutover, false);
  assert.equal(contract.validationPolicy.legalRouteSemanticsChanged, false);
  assert.equal(contract.validationPolicy.affectedRoutes, "BOUNDED");
  assert.equal(contract.validationPolicy.derivedGate, "KP_FOCUSED");
  assert.deepEqual(contract.validationPolicy.requiredGateIds, [
    "FOCUSED_TEST",
    "TARGETED_BROWSER_E2E",
    "DIRECT_DEPENDENCY_CONTRACTS",
  ]);
  assert.equal(contract.validationPolicy.fullRepositoryRegressionRequired, false);
  assert.equal(contract.validationPolicy.globalBrowserReplayRequired, false);
  assert.equal(contract.futureImplementationContract.implementationRequiresSeparateOperatorApproval, true);
  assert.equal(contract.distance.goalDistanceAfter, "D2_P107_THREE_LANE_SOURCE_MAPPING_PATTERN_VALIDATOR_BOUNDARY_LOCKED_NO_RUNTIME");
  assert.equal(contract.distance.nextShortestStep, "PATH1_P1_07_QUOTIENT_START_PLACE_IMPLEMENTATION_V1");
});