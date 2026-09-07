import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { getPath1PublicWorksheetBlock } from "../../site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const readText = (path) => fs.readFileSync(path, "utf8");

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_04_CAPABILITY_AND_TRANSFER_PREFLIGHT_V1.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const G4A_U02_PATH = "data/curriculum/knowledge/units/g4a_u02_4a02.knowledge-operation.json";
const INVENTORY_PATH = "data/curriculum/application/reviews/PATH1_WORD_PROBLEM_CAPABILITY_INVENTORY_V1.json";
const SOURCE_CORPUS_PATH = "data/curriculum/application/reviews/PATH1_WORD_PROBLEM_SOURCE_CORPUS_ADDITION_V1.json";
const P103_PUBLIC_CUTOVER_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_03_MULTIPLICATIVE_MODELING_PUBLIC_CUTOVER_IMPLEMENTATION_V1.json";
const P112_IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_12_INVERSE_EQUAL_GROUPS_IMPLEMENTATION_V1.json";
const G4A_PATTERN_PATH = "site/modules/curriculum/batch-a/source-pattern-g4a-u02-extension.js";
const G4A_GENERATOR_PATH = "site/modules/curriculum/batch-a/g4a-u02-numeric-generator.js";
const PUBLIC_BINDING_PATH = "site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const contract = readJson(CONTRACT_PATH);
const matrix = readJson(MATRIX_PATH);
const g4aU02 = readJson(G4A_U02_PATH);
const inventory = readJson(INVENTORY_PATH);
const sourceCorpus = readJson(SOURCE_CORPUS_PATH);
const p103PublicCutover = readJson(P103_PUBLIC_CUTOVER_PATH);
const p112Implementation = readJson(P112_IMPLEMENTATION_PATH);
const g4aPatternText = readText(G4A_PATTERN_PATH);
const g4aGeneratorText = readText(G4A_GENERATOR_PATH);

function findObject(root, predicate) {
  if (root && typeof root === "object") {
    if (!Array.isArray(root) && predicate(root)) return root;
    for (const value of Object.values(root)) {
      const match = findObject(value, predicate);
      if (match) return match;
    }
  }
  return null;
}

function p104Block() {
  return matrix.blocks.find((entry) => entry.blockId === "P1-04");
}

function knowledgePoint(id) {
  return g4aU02.knowledgePoints.find((entry) => entry.knowledgePointId === id);
}

test("P1-04 preflight is planning-only and advances the sequential word-problem mainline only", () => {
  assert.equal(contract.status, "P1_04_TRANSFER_PREFLIGHT_LOCKED_NO_RUNTIME");
  assert.equal(contract.operatorApproval, "APPROVED_PREFLIGHT_ONLY");
  assert.equal(contract.implementationAllowed, false);
  assert.equal(contract.runtimeChanged, false);
  assert.equal(contract.publicCutoverAllowed, false);
  assert.equal(contract.path1MatrixMutationAllowed, false);
  assert.equal(contract.canonicalKnowledgePointMutationAllowed, false);
  assert.equal(contract.canonicalRelationAuthorityMutationAllowed, false);
  assert.equal(contract.g3bU08NumericEnvelopeMutationAllowed, false);
  assert.equal(contract.roadmapSequence.mode, "PATH1_BLOCK_BY_BLOCK_WORD_PROBLEM_MODELING");
  assert.deepEqual(contract.roadmapSequence.completedBeforeThisTask, ["P1-01", "P1-02", "P1-03"]);
  assert.equal(contract.roadmapSequence.currentBlock, "P1-04");
  assert.equal(contract.roadmapSequence.nextBlockAfterCompletion, "P1-05");
  assert.equal(contract.roadmapSequence.p112Status, "IMPLEMENTED_BUT_DEFERRED_FOR_SEQUENCE_ALIGNMENT");
  assert.equal(contract.roadmapSequence.p112PublicCutoverAllowedNow, false);
});

test("P1-04 matrix authority is exactly the G4A-U02 two-digit-by-three-digit and three-digit-by-two-digit pair", () => {
  const block = p104Block();
  assert.ok(block);
  assert.equal(block.title, "多位數×多位數");
  assert.equal(block.blockType, "DIFFICULTY_EXPANSION");
  assert.deepEqual(block.primaryKnowledgePointIds, [
    "kp_g4a_u02_2digit_by_3digit",
    "kp_g4a_u02_3digit_by_2digit",
  ]);
  assert.deepEqual(block.requiredPrerequisites.blockIds, ["P1-03"]);
  assert.deepEqual(block.requiredPrerequisites.knowledgePointIds, ["kp_g4a_u02_2digit_by_2digit"]);
  assert.deepEqual(block.patternExpansion.map((entry) => entry.id), [
    "ps_g4a_u02_2digit_by_3digit",
    "ps_g4a_u02_3digit_by_2digit",
    "larger_operand_same_partial_product_rule",
  ]);
  assert.equal(block.patternExpansion[2].kind, "DESCRIPTIVE_DIFFICULTY_EXPANSION");
  assert.deepEqual(contract.currentState.path1Matrix.primaryKnowledgePointIds, block.primaryKnowledgePointIds);
  assert.deepEqual(contract.scope.matrixAuthoritativeArithmeticKnowledgePointIds, block.primaryKnowledgePointIds);
});

test("G4A-U02 arithmetic authority admits both P1-04 ordered forms but no application capability", () => {
  const twoByThree = knowledgePoint("kp_g4a_u02_2digit_by_3digit");
  const threeByTwo = knowledgePoint("kp_g4a_u02_3digit_by_2digit");
  assert.ok(twoByThree);
  assert.ok(threeByTwo);
  assert.equal(twoByThree.applicationCapability, "NOT_APPLICABLE");
  assert.equal(threeByTwo.applicationCapability, "NOT_APPLICABLE");
  assert.equal(twoByThree.existingApplicationQuestionCount, 0);
  assert.equal(threeByTwo.existingApplicationQuestionCount, 0);

  const a = twoByThree.operationModels[0];
  const b = threeByTwo.operationModels[0];
  assert.equal(a.modelId, "op_g4a_u02_2digit_by_3digit");
  assert.equal(b.modelId, "op_g4a_u02_3digit_by_2digit");
  assert.ok(a.canonicalExpressions.includes("product = twoDigitFactor * threeDigitFactor"));
  assert.ok(b.canonicalExpressions.includes("product = threeDigitFactor * twoDigitFactor"));
  assert.deepEqual(a.unknownRoles, ["product"]);
  assert.deepEqual(b.unknownRoles, ["product"]);
  assert.ok(a.numberConstraints.includes("10 <= twoDigitFactor <= 99"));
  assert.ok(a.numberConstraints.includes("100 <= threeDigitFactor <= 999"));
  assert.ok(b.numberConstraints.includes("100 <= threeDigitFactor <= 999"));
  assert.ok(b.numberConstraints.includes("10 <= twoDigitFactor <= 99"));
});

test("existing P1-04 PatternSpecs preserve arithmetic form order and ordinary zero-digit coverage without creating a P1-05 modeling capability", () => {
  assert.match(g4aPatternText, /ps_g4a_u02_2digit_by_3digit/);
  assert.match(g4aPatternText, /ps_g4a_u02_3digit_by_2digit/);
  assert.match(g4aPatternText, /partialProductsRequired: true/);
  assert.match(g4aPatternText, /zero_in_operand/);
  assert.match(g4aPatternText, /multiplier_multiple_of_10/);
  assert.match(g4aGeneratorText, /DISPLAY_FLIP_PATTERN_IDS/);
  assert.match(g4aGeneratorText, /ps_g4a_u02_2digit_by_3digit/);
  assert.equal(contract.currentState.numericRuntime.ordinaryZeroDigitsMayAppearWithinExistingArithmeticPatterns, true);
  assert.equal(contract.currentState.numericRuntime.zeroSpecificCapabilityBelongsToNextBlock, "P1-05");
  assert.equal(contract.antiScopeCreep.p105ImplementationAllowed, false);
});

test("existing capability inventory requires the same R03/R05 relation kernel with a larger executor and blocks direct canonical reuse", () => {
  const row = findObject(inventory, (entry) => entry.blockId === "P1-04" && Array.isArray(entry.arithmeticKPs));
  assert.ok(row);
  assert.deepEqual(row.arithmeticKPs, [
    "kp_g4a_u02_2digit_by_3digit",
    "kp_g4a_u02_3digit_by_2digit",
  ]);
  assert.equal(row.recommendedTransfer, "same R03/R05 relation kernel with larger arithmetic executor");
  assert.equal(row.authorityCandidate, "EXISTING_RELATION_AUTHORITY_WITH_NUMERIC_ENVELOPE_EXTENSION_REQUIRED");
  assert.match(row.numericEnvelopeAssessment, /BLOCKED_FOR_DIRECT_REUSE/);
  assert.match(row.numericEnvelopeAssessment, /multi-digit second factor/);
  assert.equal(row.inverseUnknownShift, "DEFER_TO_P1_12");
  assert.equal(row.implementationStatus, "NOT_AUTHORIZED");
  assert.deepEqual(contract.currentState.previousInventoryAssessment, {
    recommendedTransfer: row.recommendedTransfer,
    authorityCandidate: row.authorityCandidate,
    numericEnvelopeAssessment: row.numericEnvelopeAssessment,
    inverseUnknownShift: row.inverseUnknownShift,
    implementationStatus: row.implementationStatus,
  });
});

test("current public P1-04 arithmetic binding has extra G4B-U01 breadth that this modeling preflight does not adopt", () => {
  const binding = getPath1PublicWorksheetBlock("P1-04");
  assert.ok(binding);
  assert.deepEqual(binding.knowledgePointIds, [
    "kp_g4a_u02_2digit_by_3digit",
    "kp_g4a_u02_3digit_by_2digit",
    "kp_g4b_u01_3digit_by_3digit",
    "kp_g4b_u01_4digit_by_3digit",
  ]);
  assert.deepEqual(contract.observedPublicBindingScopeDrift.currentPublicBindingKnowledgePointIds, binding.knowledgePointIds);
  assert.deepEqual(contract.observedPublicBindingScopeDrift.extraPublicBindingKnowledgePointIds, [
    "kp_g4b_u01_3digit_by_3digit",
    "kp_g4b_u01_4digit_by_3digit",
  ]);
  assert.equal(contract.observedPublicBindingScopeDrift.status, "OBSERVED_NOT_ADOPTED_FOR_P104_MODELING_TRANSFER");
  assert.equal(contract.observedPublicBindingScopeDrift.nonPublicImplementationBlockedByThisDrift, false);
  assert.equal(contract.observedPublicBindingScopeDrift.publicCutoverRequiresSeparateBindingDecision, true);
  assert.equal(contract.observedPublicBindingScopeDrift.bindingMutationAllowedInThisTask, false);
  assert.ok(contract.futureImplementationArchitecture.mustNotModify.includes(PUBLIC_BINDING_PATH));
});

test("future P1-04 transfer is a Path1-local role-ordered R03 projection over exactly two arithmetic forms", () => {
  assert.equal(contract.transferDecision.decision, "AUTHORIZE_FUTURE_PATH1_LOCAL_ROLE_ORDERED_R03_PROJECTION_NOT_DIRECT_G3BU08_REUSE");
  assert.equal(contract.transferDecision.primaryRelationId, "R03_EQUAL_GROUPS");
  assert.equal(contract.transferDecision.newCanonicalKnowledgePointRequired, false);
  assert.equal(contract.transferDecision.newRelationFamilyRequired, false);
  assert.equal(contract.transferDecision.directReuseOfExistingG3BU08PatternSpecs, false);
  assert.equal(contract.transferDecision.futurePath1LocalPatternSpecsRequired, true);
  assert.equal(contract.relationProjectionContract.canonicalInvariant, "totalAmount = amountPerGroup * groupCount");
  assert.deepEqual(contract.relationProjectionContract.allowedUnknownRoles, ["totalAmount"]);
  assert.deepEqual(contract.relationProjectionContract.forbiddenUnknownRoles, ["groupCount", "amountPerGroup"]);
  assert.equal(contract.relationProjectionContract.semanticCommutativeRoleSwapAllowed, false);

  const forms = contract.path1LocalNumericEnvelopeAuthority.arithmeticForms;
  assert.equal(forms.length, 2);
  assert.deepEqual(forms.map((entry) => entry.formId), ["P104_2D_BY_3D", "P104_3D_BY_2D"]);
  assert.equal(forms[0].amountPerGroup, "integer 10..99");
  assert.equal(forms[0].groupCount, "integer 100..999");
  assert.equal(forms[1].amountPerGroup, "integer 100..999");
  assert.equal(forms[1].groupCount, "integer 10..99");
  assert.equal(forms[0].totalAmount, "amountPerGroup * groupCount; integer 1000..98901");
  assert.equal(forms[1].totalAmount, "amountPerGroup * groupCount; integer 1000..98901");
  assert.ok(forms.every((entry) => entry.semanticRoleSwapAllowed === false));
  assert.equal(contract.path1LocalNumericEnvelopeAuthority.doesNotModifyG3BU08CanonicalEnvelope, true);
});

test("operator-approved corpora are registered and P1-04 evidence admits one clean direct-total witness while excluding multi-relation surfaces", () => {
  const corpusIds = sourceCorpus.sourceCorpora.map((entry) => entry.sourceCorpusId);
  const folderIds = sourceCorpus.sourceCorpora.map((entry) => entry.folderId);
  assert.ok(corpusIds.includes("LI_TEACHER_MATH_THINKING_G1_G6"));
  assert.ok(corpusIds.includes("MULTI_SCHOOL_EXAM_CORPUS_G03_G09"));
  assert.ok(folderIds.includes("1VHxb5jEkw_xP683wP528HEYFC-_zFIKk"));
  assert.ok(folderIds.includes("1m8ljMOMb0ugFQCsC76Q1hX9UMRj0Hxpr"));

  const school = contract.sourceEvidence.positiveWitnesses.find((entry) => entry.sourceFileId === "1x_dh_7JMpxdiWI7Yc_4R0KOwWdQapoOO");
  assert.ok(school);
  assert.equal(school.relationId, "R03_EQUAL_GROUPS");
  assert.equal(school.arithmeticFormId, "P104_2D_BY_3D");
  assert.deepEqual(school.roleBindings, { amountPerGroup: 60, groupCount: 110, totalAmount: 6600 });
  assert.equal(school.equation, "60 * 110 = 6600");

  const liTeacher = contract.sourceEvidence.positiveWitnesses.find((entry) => entry.sourceFileId === "1WfE-POEKk-7kjMv7uytdwkq0jy9hf4kR");
  assert.ok(liTeacher);
  assert.match(liTeacher.use, /structural reasoning evidence only/);

  const negatives = contract.sourceEvidence.negativeBoundaryWitnesses;
  assert.ok(negatives.some((entry) => /R08 multi-relation/.test(entry.exclusionReason)));
  assert.ok(negatives.some((entry) => /three-factor multiplicative chain/.test(entry.exclusionReason)));
  assert.ok(negatives.some((entry) => /two-step normalization\/scaling/.test(entry.exclusionReason)));
});

test("four future context families are bounded R03 direct-total candidates crossed with both arithmetic forms", () => {
  const families = contract.futurePatternSpecCandidateFamilies;
  assert.equal(families.length, 4);
  assert.ok(families.every((entry) => entry.status === "APPROVED_FOR_FUTURE_IMPLEMENTATION"));
  assert.deepEqual(families.map((entry) => entry.candidateFamilyId), [
    "P104_R03_ITEMS_PER_PACKAGE_TOTAL",
    "P104_R03_MATERIAL_PER_PRODUCT_TOTAL",
    "P104_R03_SCORE_PER_EVENT_TOTAL",
    "P104_R03_AMOUNT_PER_PERIOD_TOTAL",
  ]);
  for (const family of families) {
    assert.deepEqual(family.allowedArithmeticFormIds, ["P104_2D_BY_3D", "P104_3D_BY_2D"]);
  }
  assert.equal(contract.transferDecision.secondaryRelationAssessment.relationId, "R05_RATE_MEASURE_PRODUCT");
  assert.equal(contract.transferDecision.secondaryRelationAssessment.status, "CONTEXT_OVERLAP_ACKNOWLEDGED_BUT_DEFERRED_FROM_P1_04_V1");
});

test("P1-03 public D0 authority remains preserved, P1-12 remains non-public, and implementation is a separate approval boundary", () => {
  assert.equal(p103PublicCutover.publicCutoverApplied, true);
  assert.equal(p103PublicCutover.p104Changed, false);
  assert.equal(p103PublicCutover.p112PublicRouteChanged, false);
  assert.equal(p112Implementation.publicCutoverApplied, false);
  assert.equal(p112Implementation.visibleUiChanged, false);
  assert.equal(contract.futureImplementationArchitecture.publicCutover, "SEPARATE_LATER_MILESTONE_AFTER_BINDING_DECISION");
  assert.equal(contract.futureImplementationArchitecture.masteryCredit, "NONE_UNTIL_SEPARATE_MASTERY_INTEGRATION_APPROVAL");
  assert.ok(contract.implementationEntryCriteria.includes("explicit operator approval is provided to cross the planning-to-implementation boundary"));
  assert.equal(contract.futureFocusedAcceptance.fullRegressionRequired, false);
  assert.equal(contract.futureFocusedAcceptance.globalReplayRequired, false);
  assert.equal(contract.distance.goalDistanceBefore, "D3_P104_ARITHMETIC_AUTHORITY_WITH_MODELING_GAP_PUBLIC_BINDING_SCOPE_DRIFT_AND_ENVELOPE_BLOCKER");
  assert.equal(contract.distance.goalDistanceAfterTarget, "D2_P104_TRANSFER_RELATION_ROLE_ORDERED_NUMERIC_ENVELOPE_AND_BINDING_BOUNDARY_PREFLIGHT_LOCKED");
  assert.equal(contract.distance.distanceReduced, "D3_TO_D2");
  assert.equal(contract.distance.nextShortestStep, "PATH1_WORD_PROBLEM_P1_04_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1");
});
