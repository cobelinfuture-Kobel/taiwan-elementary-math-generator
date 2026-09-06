import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const readText = (path) => fs.readFileSync(path, "utf8");

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_03_CAPABILITY_AND_TRANSFER_PREFLIGHT_V1.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const G4A_U02_PATH = "data/curriculum/knowledge/units/g4a_u02_4a02.knowledge-operation.json";
const INVENTORY_PATH = "data/curriculum/application/reviews/PATH1_WORD_PROBLEM_CAPABILITY_INVENTORY_V1.json";
const SOURCE_CORPUS_PATH = "data/curriculum/application/reviews/PATH1_WORD_PROBLEM_SOURCE_CORPUS_ADDITION_V1.json";
const EARLY_TRANSFER_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_EQUAL_GROUPS_TRANSFER_CONTRACT_V1.json";
const P112_IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_12_INVERSE_EQUAL_GROUPS_IMPLEMENTATION_V1.json";
const P103_DIVERSITY_PATH = "site/modules/curriculum/learning-paths/path1-p1-03-diversity.js";
const P103_WORKSHEET_PATH = "site/assets/browser/pipeline/build-path1-manual-worksheet-p1-03-extension.js";
const PRACTICE_ENTRY_PATH = "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js";

const contract = readJson(CONTRACT_PATH);
const matrix = readJson(MATRIX_PATH);
const g4aU02 = readJson(G4A_U02_PATH);
const inventory = readJson(INVENTORY_PATH);
const sourceCorpus = readJson(SOURCE_CORPUS_PATH);
const earlyTransfer = readJson(EARLY_TRANSFER_PATH);
const p112Implementation = readJson(P112_IMPLEMENTATION_PATH);
const p103DiversityText = readText(P103_DIVERSITY_PATH);
const p103WorksheetText = readText(P103_WORKSHEET_PATH);
const practiceEntryText = readText(PRACTICE_ENTRY_PATH);

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

function p103Block() {
  return matrix.blocks.find((entry) => entry.blockId === "P1-03");
}

function p103KnowledgePoint() {
  return g4aU02.knowledgePoints.find((entry) => entry.knowledgePointId === "kp_g4a_u02_2digit_by_2digit");
}

test("P1-03 preflight is planning-only and returns the word-problem mainline to block-by-block order", () => {
  assert.equal(contract.status, "P1_03_TRANSFER_PREFLIGHT_LOCKED_NO_RUNTIME");
  assert.equal(contract.implementationAllowed, false);
  assert.equal(contract.runtimeChanged, false);
  assert.equal(contract.publicCutoverAllowed, false);
  assert.equal(contract.path1MatrixMutationAllowed, false);
  assert.equal(contract.canonicalKnowledgePointMutationAllowed, false);
  assert.equal(contract.canonicalRelationAuthorityMutationAllowed, false);
  assert.equal(contract.g3bU08NumericEnvelopeMutationAllowed, false);
  assert.equal(contract.roadmapSequence.mode, "PATH1_BLOCK_BY_BLOCK_WORD_PROBLEM_MODELING");
  assert.deepEqual(contract.roadmapSequence.completedBeforeThisTask, ["P1-01", "P1-02"]);
  assert.equal(contract.roadmapSequence.currentBlock, "P1-03");
  assert.equal(contract.roadmapSequence.nextBlockAfterCompletion, "P1-04");
  assert.equal(contract.roadmapSequence.p112Status, "IMPLEMENTED_BUT_DEFERRED_FOR_SEQUENCE_ALIGNMENT");
  assert.equal(contract.roadmapSequence.p112PublicCutoverAllowedNow, false);
});

test("P1-03 matrix authority is exactly two-digit by two-digit after P1-02", () => {
  const block = p103Block();
  assert.ok(block);
  assert.equal(block.title, "二位數×二位數");
  assert.equal(block.blockType, "DIRECT_KP");
  assert.deepEqual(block.primaryKnowledgePointIds, ["kp_g4a_u02_2digit_by_2digit"]);
  assert.deepEqual(block.requiredPrerequisites.blockIds, ["P1-02"]);
  assert.deepEqual(block.requiredPrerequisites.knowledgePointIds, ["kp_g3a_u03_3digit_by_1digit"]);
  assert.equal(block.patternExpansion.length, 1);
  assert.equal(block.patternExpansion[0].kind, "EXISTING_PATTERN_REF");
  assert.equal(block.patternExpansion[0].id, "ps_g4a_u02_2digit_by_2digit");
  assert.deepEqual(contract.currentState.path1Matrix.primaryKnowledgePointIds, block.primaryKnowledgePointIds);
});

test("G4A-U02 authorizes P1-03 arithmetic but has no application capability", () => {
  const kp = p103KnowledgePoint();
  assert.ok(kp);
  assert.equal(kp.applicationCapability, "NOT_APPLICABLE");
  assert.equal(kp.existingApplicationQuestionCount, 0);
  assert.equal(kp.operationModels.length, 1);
  const model = kp.operationModels[0];
  assert.equal(model.modelId, "op_g4a_u02_2digit_by_2digit");
  assert.ok(model.canonicalExpressions.includes("product = leftFactor * rightFactor"));
  assert.ok(model.canonicalExpressions.includes("product = onesPartialProduct + tensPartialProduct"));
  assert.deepEqual(model.unknownRoles, ["product"]);
  assert.ok(model.numberConstraints.includes("10 <= leftFactor,rightFactor <= 99"));
  assert.equal(contract.currentState.arithmeticAuthority.applicationCapability, "NOT_APPLICABLE");
});

test("previous Path1 inventory explicitly blocks direct G3B-U08 reuse for P1-03", () => {
  const row = findObject(inventory, (entry) => entry.blockId === "P1-03" && entry.arithmeticKPs);
  assert.ok(row);
  assert.deepEqual(row.arithmeticKPs, ["kp_g4a_u02_2digit_by_2digit"]);
  assert.equal(row.recommendedTransfer, "same R03/R05 relation kernel; do not create a new relation merely because operands are larger");
  assert.equal(row.authorityCandidate, "EXISTING_RELATION_AUTHORITY_WITH_NUMERIC_ENVELOPE_EXTENSION_REQUIRED");
  assert.match(row.numericEnvelopeAssessment, /BLOCKED_FOR_DIRECT_REUSE/);
  assert.match(row.numericEnvelopeAssessment, /one-digit groupCount/);
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

test("existing P1-03 runtime remains numeric-only before modeling implementation", () => {
  assert.match(p103DiversityText, /C0_DIRECT_TWO_DIGIT_BY_TWO_DIGIT/);
  assert.match(p103DiversityText, /C1_PARTIAL_PRODUCTS_DECOMPOSITION_PRODUCT/);
  assert.match(p103DiversityText, /applicationPromptUsed: false/);
  assert.match(p103DiversityText, /relationPromptUsed: false/);
  assert.match(p103DiversityText, /mode: "numeric"/);
  assert.match(p103WorksheetText, /buildPath1P103DiversityItems/);
  assert.equal(contract.currentState.currentP103Runtime.questionMode, "numeric");
  assert.equal(contract.currentState.currentP103Runtime.applicationPromptUsed, false);
  assert.equal(contract.currentState.currentP103Runtime.relationPromptUsed, false);
});

test("early P1-01/P1-02 transfer remains total-only and its narrower numeric authority is not widened", () => {
  assert.deepEqual(earlyTransfer.scope.includedPathBlocks, ["P1-01", "P1-02"]);
  assert.ok(earlyTransfer.scope.excludedPathBlocks.includes("P1-03"));
  assert.deepEqual(earlyTransfer.relationContract.allowedUnknownRoles, ["totalAmount"]);
  assert.deepEqual(earlyTransfer.relationContract.forbiddenUnknownRoles, ["groupCount", "amountPerGroup"]);
  assert.equal(earlyTransfer.relationContract.forbiddenUnknownRoleDisposition, "DEFER_TO_P1_12");
  assert.match(earlyTransfer.arithmeticToRelationRoleBinding.reason, /groupCount 為一位正整數/);
  assert.ok(earlyTransfer.futureValidatorInvariants.includes("groupCount must stay within the existing one-digit relation boundary"));
  assert.ok(earlyTransfer.futureValidatorInvariants.includes("totalAmount must not exceed 999"));
  assert.equal(contract.path1LocalNumericEnvelopeAuthority.doesNotModifyG3BU08CanonicalEnvelope, true);
});

test("P1-03 future transfer uses a Path1-local R03 projection over the existing arithmetic envelope", () => {
  assert.equal(contract.transferDecision.decision, "AUTHORIZE_FUTURE_PATH1_LOCAL_RELATION_PROJECTION_NOT_DIRECT_G3BU08_REUSE");
  assert.equal(contract.transferDecision.primaryRelationId, "R03_EQUAL_GROUPS");
  assert.equal(contract.transferDecision.newCanonicalKnowledgePointRequired, false);
  assert.equal(contract.transferDecision.newRelationFamilyRequired, false);
  assert.equal(contract.transferDecision.directReuseOfExistingG3BU08PatternSpecs, false);
  assert.equal(contract.transferDecision.futurePath1LocalPatternSpecsRequired, true);
  assert.equal(contract.relationProjectionContract.canonicalInvariant, "totalAmount = amountPerGroup * groupCount");
  assert.deepEqual(contract.relationProjectionContract.allowedUnknownRoles, ["totalAmount"]);
  assert.deepEqual(contract.relationProjectionContract.forbiddenUnknownRoles, ["groupCount", "amountPerGroup"]);
  assert.equal(contract.relationProjectionContract.arithmeticRoleProjection.leftFactor, "amountPerGroup");
  assert.equal(contract.relationProjectionContract.arithmeticRoleProjection.rightFactor, "groupCount");
  assert.equal(contract.relationProjectionContract.arithmeticRoleProjection.product, "totalAmount");
  assert.equal(contract.relationProjectionContract.arithmeticRoleProjection.commutativeSemanticRoleSwapAllowed, false);
  assert.equal(contract.path1LocalNumericEnvelopeAuthority.constraints.amountPerGroup, "integer 10..99");
  assert.equal(contract.path1LocalNumericEnvelopeAuthority.constraints.groupCount, "integer 10..99");
  assert.equal(contract.path1LocalNumericEnvelopeAuthority.constraints.totalAmount, "amountPerGroup * groupCount; integer 100..9801");
  assert.equal(contract.path1LocalNumericEnvelopeAuthority.constraints.unknownRole, "totalAmount only");
});

test("operator-approved corpora are registered and P1-03 source evidence is bounded", () => {
  const corpusIds = sourceCorpus.sourceCorpora.map((entry) => entry.sourceCorpusId);
  const folderIds = sourceCorpus.sourceCorpora.map((entry) => entry.folderId);
  assert.ok(corpusIds.includes("LI_TEACHER_MATH_THINKING_G1_G6"));
  assert.ok(corpusIds.includes("MULTI_SCHOOL_EXAM_CORPUS_G03_G09"));
  assert.ok(folderIds.includes("1VHxb5jEkw_xP683wP528HEYFC-_zFIKk"));
  assert.ok(folderIds.includes("1m8ljMOMb0ugFQCsC76Q1hX9UMRj0Hxpr"));

  const school = contract.sourceEvidence.positiveWitnesses.find((entry) => entry.sourceFileId === "1knMV1ZIQ5dnUsfV28VuSbuZgBvLE1jrM");
  assert.ok(school);
  assert.equal(school.relationId, "R03_EQUAL_GROUPS");
  assert.deepEqual(school.roleBindings, { amountPerGroup: 28, groupCount: 60, totalAmount: 1680 });
  assert.equal(school.equation, "28 * 60 = 1680");

  const liTeacher = contract.sourceEvidence.positiveWitnesses.find((entry) => entry.sourceFileId === "1WfE-POEKk-7kjMv7uytdwkq0jy9hf4kR");
  assert.ok(liTeacher);
  assert.match(liTeacher.use, /structural reasoning evidence only/);

  const negatives = contract.sourceEvidence.negativeBoundaryWitnesses;
  assert.ok(negatives.some((entry) => /multi-relation\/two-step/.test(entry.exclusionReason)));
  assert.ok(negatives.some((entry) => /P1-03 two-digit × two-digit/.test(entry.exclusionReason)));
  assert.ok(negatives.some((entry) => /two-step normalization\/scaling/.test(entry.exclusionReason)));
});

test("four future PatternSpec families are source-bounded R03 direct-total candidates only", () => {
  assert.equal(contract.futurePatternSpecCandidateFamilies.length, 4);
  assert.ok(contract.futurePatternSpecCandidateFamilies.every((entry) => entry.status === "APPROVED_FOR_FUTURE_IMPLEMENTATION"));
  assert.deepEqual(contract.futurePatternSpecCandidateFamilies.map((entry) => entry.candidateFamilyId), [
    "P103_R03_ITEMS_PER_PACKAGE_TOTAL",
    "P103_R03_MATERIAL_PER_PRODUCT_TOTAL",
    "P103_R03_SCORE_PER_EVENT_TOTAL",
    "P103_R03_AMOUNT_PER_PERIOD_TOTAL",
  ]);
  assert.equal(contract.transferDecision.secondaryRelationAssessment.relationId, "R05_RATE_MEASURE_PRODUCT");
  assert.equal(contract.transferDecision.secondaryRelationAssessment.status, "DEFERRED_FROM_P1_03_V1_IMPLEMENTATION");
});

test("P1-12 is frozen for sequence alignment and public P1-03 cutover remains out of scope", () => {
  assert.equal(p112Implementation.publicCutoverApplied, false);
  assert.equal(p112Implementation.visibleUiChanged, false);
  assert.equal(contract.roadmapSequence.p112Status, "IMPLEMENTED_BUT_DEFERRED_FOR_SEQUENCE_ALIGNMENT");
  assert.equal(contract.roadmapSequence.p112PublicCutoverAllowedNow, false);
  assert.equal(contract.futureImplementationArchitecture.publicCutover, "SEPARATE_LATER_MILESTONE");
  assert.match(practiceEntryText, /PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE/);
  assert.doesNotMatch(practiceEntryText, /multiplicativeModelingTransfer/);
  assert.ok(contract.futureImplementationArchitecture.mustNotModify.includes(PRACTICE_ENTRY_PATH));
});

test("implementation remains a separate approval boundary", () => {
  assert.equal(contract.futureImplementationArchitecture.selectedStrategy, "PATH1_LOCAL_P103_MULTIPLICATIVE_MODELING_TRANSFER");
  assert.equal(contract.futureImplementationArchitecture.candidatePracticeMode, "multiplicativeModelingTransfer");
  assert.equal(contract.futureImplementationArchitecture.masteryCredit, "NONE_UNTIL_SEPARATE_MASTERY_INTEGRATION_APPROVAL");
  assert.ok(contract.implementationEntryCriteria.includes("explicit operator approval to cross planning-to-implementation boundary"));
  assert.equal(contract.futureFocusedAcceptance.fullRegressionRequired, false);
  assert.equal(contract.futureFocusedAcceptance.globalReplayRequired, false);
  assert.equal(contract.distance.goalDistanceBefore, "D3_P103_ARITHMETIC_AUTHORITY_WITH_MODELING_GAP_AND_ENVELOPE_BLOCKER");
  assert.equal(contract.distance.goalDistanceAfterTarget, "D2_P103_TRANSFER_RELATION_AND_PATH1_LOCAL_NUMERIC_ENVELOPE_PREFLIGHT_LOCKED");
  assert.equal(contract.distance.nextShortestStep, "PATH1_WORD_PROBLEM_P1_03_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1");
});
