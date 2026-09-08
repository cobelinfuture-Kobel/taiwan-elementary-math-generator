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
const sourcePatternText = readText("site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js");

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

test("P1-07 preflight locks the current queue and remains planning-only", () => {
  assert.equal(contract.taskId, "PATH1_P1_07_QUOTIENT_START_PLACE_PREFLIGHT_V1");
  assert.equal(contract.resumeAuthority, "PATH1_P1_07_PUBLIC_PATH_CONTINUATION_PREFLIGHT_OR_CURRENT_PATH1_QUEUE_AUTHORITY");
  assert.equal(contract.status, "P1_07_QUOTIENT_START_PLACE_PREFLIGHT_LOCKED_NO_RUNTIME");
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

test("G3B-U01 canonical source authority supports both primary quotient-place KPs", () => {
  assert.equal(g3bU01.sourceId, "g3b_u01_3b01");
  assert.equal(g3bU01.unitCode, "3B-U01");
  assert.equal(g3bU01.title, "除法");
  assert.equal(g3bU01.knowledgeRegistryState, "VALIDATED_COMPLETE");

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

test("existing G3B-U01 PatternSpecs are semantic parents rather than newly minted canonical authority", () => {
  assert.deepEqual(contract.canonicalArithmeticAuthority.existingSemanticParentPatternSpecIds, semanticParents);
  for (const patternSpecId of semanticParents) {
    assert.ok(sourcePatternText.includes(patternSpecId), patternSpecId);
  }
  assert.equal(contract.newCanonicalKnowledgePointMinted, false);
  assert.equal(contract.newPatternSpecMaterialized, false);
  assert.equal(contract.representationDecision.mustReuseExistingSemanticParents, true);
  assert.equal(contract.representationDecision.newCanonicalKnowledgePointRequired, false);
});

test("formal mapping covers the four source-backed quotient start-place cases", () => {
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
});

test("P1-07 local representation candidates stay bounded to quotient start-place and digit-count practice", () => {
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
  assert.equal(contract.optionalSupportingBoundary.status, "DEFERRED_FROM_P107_PRIMARY_V1");
});

test("public arithmetic binding is aligned and no public cutover is performed by preflight", () => {
  const binding = getPath1PublicWorksheetBlock("P1-07");
  assert.ok(binding);
  assert.deepEqual([...binding.knowledgePointIds], primaryKps);
  assert.deepEqual(contract.publicBindingReconciliation.currentPublicBindingKnowledgePointIds, primaryKps);
  assert.equal(contract.publicBindingReconciliation.status, "ALIGNED_NO_BINDING_DRIFT");
  assert.equal(contract.publicBindingReconciliation.publicBindingChangeRequired, false);
  assert.equal(contract.publicBindingMutationAllowed, false);
  assert.equal(contract.publicCutoverAllowed, false);
});

test("adjacent division boundaries remain fail-closed", () => {
  assert.match(contract.boundaryWithAdjacentBlocks["P1-06"], /estimation|估|trial/i);
  assert.match(contract.boundaryWithAdjacentBlocks["P1-08"], /two-digit-divisor|二位數除數/i);
  assert.match(contract.boundaryWithAdjacentBlocks["P1-11"], /remainder/i);
  assert.match(contract.boundaryWithAdjacentBlocks["P1-12"], /inverse equal-groups|relation/i);
  const checks = contract.futureValidatorContract.requiredChecks.join("\n");
  assert.match(checks, /one-digit integer from 2 through 9/);
  assert.match(checks, /division is exact/);
  assert.match(checks, /no two-digit divisor/);
  assert.match(checks, /no.*remainder interpretation/i);
  assert.match(checks, /no.*word-problem relation/i);
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
});

test("P1-07 preflight is KP_FOCUSED and implementation requires separate approval", () => {
  assert.equal(contract.validationPolicy.currentScope, "KP_LEAF");
  assert.equal(contract.validationPolicy.sharedExecutableChange, false);
  assert.equal(contract.validationPolicy.publicAuthorityCutover, false);
  assert.equal(contract.validationPolicy.legalRouteSemanticsChanged, false);
  assert.equal(contract.validationPolicy.affectedRoutes, "BOUNDED");
  assert.equal(contract.validationPolicy.derivedGate, "KP_FOCUSED");
  assert.equal(contract.validationPolicy.fullRepositoryRegressionRequired, false);
  assert.equal(contract.validationPolicy.globalBrowserReplayRequired, false);
  assert.equal(contract.futureImplementationContract.implementationRequiresSeparateOperatorApproval, true);
  assert.equal(contract.distance.goalDistanceBefore, "D3_P107_MATRIX_KP_MAPPING_EXISTS_NO_PATH1_LOCAL_PATTERN_VALIDATOR_CONTRACT");
  assert.equal(contract.distance.goalDistanceAfter, "D2_P107_SOURCE_MAPPING_PATTERN_VALIDATOR_CONTRACT_LOCKED_NO_RUNTIME");
  assert.equal(contract.distance.nextShortestStep, "PATH1_P1_07_QUOTIENT_START_PLACE_IMPLEMENTATION_V1");
});
