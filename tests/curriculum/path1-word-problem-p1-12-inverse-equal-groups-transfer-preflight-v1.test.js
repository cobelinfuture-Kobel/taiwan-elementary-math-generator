import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_12_INVERSE_EQUAL_GROUPS_TRANSFER_PREFLIGHT_V1.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const KNOWLEDGE_OPERATION_PATH = "data/curriculum/knowledge/units/g3b_u08_3b08.knowledge-operation.json";
const PATTERN_SPEC_PATH = "data/curriculum/pattern_specs/S58C_G3B_U08_SemanticPatternSpecRegistry.json";
const SOURCE_CORPUS_PATH = "data/curriculum/application/reviews/PATH1_WORD_PROBLEM_SOURCE_CORPUS_ADDITION_V1.json";
const EARLY_TRANSFER_CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_EQUAL_GROUPS_TRANSFER_CONTRACT_V1.json";
const EARLY_TRANSFER_GENERATOR_PATH = "site/modules/curriculum/learning-paths/path1-equal-groups-transfer-generator.js";

const contract = readJson(CONTRACT_PATH);
const matrix = readJson(MATRIX_PATH);
const knowledgeOperation = readJson(KNOWLEDGE_OPERATION_PATH);
const patternRegistry = readJson(PATTERN_SPEC_PATH);
const sourceCorpus = readJson(SOURCE_CORPUS_PATH);
const earlyTransfer = readJson(EARLY_TRANSFER_CONTRACT_PATH);
const earlyTransferGenerator = fs.readFileSync(EARLY_TRANSFER_GENERATOR_PATH, "utf8");

function block(blockId) {
  return matrix.blocks.find((entry) => entry.blockId === blockId);
}

function knowledgePoint(knowledgePointId) {
  return knowledgeOperation.knowledgePoints.find((entry) => entry.knowledgePointId === knowledgePointId);
}

function operationModel(knowledgePointId, modelId) {
  return knowledgePoint(knowledgePointId)?.operationModels.find((entry) => entry.modelId === modelId);
}

function roleContract(unknownRole) {
  return contract.unknownRoleContracts.find((entry) => entry.unknownRole === unknownRole);
}

function patternGroup(knowledgePointId) {
  return patternRegistry.patternGroups.find((entry) => entry.primaryKnowledgePointId === knowledgePointId);
}

test("P1-12 preflight is planning-only and bounded to inverse equal groups", () => {
  assert.equal(contract.status, "P1_12_INVERSE_EQUAL_GROUPS_PREFLIGHT_LOCKED_NO_RUNTIME");
  assert.equal(contract.implementationAllowed, false);
  assert.equal(contract.runtimeChanged, false);
  assert.equal(contract.publicCutoverAllowed, false);
  assert.equal(contract.path1MatrixMutationAllowed, false);
  assert.equal(contract.newCanonicalKnowledgePointMinted, false);
  assert.equal(contract.newPatternSpecRequired, false);
  assert.equal(contract.taxonomyReplanningAllowed, false);
  assert.equal(contract.scope.includedPathBlock, "P1-12");
  assert.equal(contract.scope.relationId, "R03_EQUAL_GROUPS");
  assert.equal(contract.scope.canonicalInvariant, "totalAmount = amountPerGroup * groupCount");
  assert.deepEqual(contract.scope.includedUnknownRoles, ["totalAmount", "groupCount", "amountPerGroup"]);
  assert.equal(contract.scope.languageDifficulty, "LD0_DIRECT_ROLE_EXPLICIT");
});

test("P1-12 matrix remains the exact three-KP fusion authority", () => {
  const p112 = block("P1-12");
  assert.ok(p112);
  assert.equal(p112.title, "乘除互逆");
  assert.equal(p112.blockType, "COMPOSITE_KP");
  assert.deepEqual(p112.requiredPrerequisites.blockIds, ["P1-11"]);
  assert.deepEqual(p112.primaryKnowledgePointIds, [
    "kp_g3b_u08_total_from_groups",
    "kp_g3b_u08_group_count_from_total",
    "kp_g3b_u08_per_group_from_total",
  ]);
  assert.equal(p112.patternExpansion.length, 1);
  assert.equal(p112.patternExpansion[0].kind, "FUSION_PATTERN_CANDIDATE");
  assert.equal(p112.patternExpansion[0].id, "multiply_divide_inverse_relation");
  assert.equal(p112.fusionGate.mode, "REQUIRED");
  assert.deepEqual(p112.fusionGate.requiredBlockIds, ["P1-02", "P1-08"]);
  assert.deepEqual(p112.fusionGate.requiredKnowledgePointIds, p112.primaryKnowledgePointIds);
  assert.deepEqual(contract.p112AuthorityLock.primaryKnowledgePointIds, p112.primaryKnowledgePointIds);
  assert.deepEqual(contract.p112AuthorityLock.requiredFusionBlockIds, p112.fusionGate.requiredBlockIds);
});

test("canonical G3B-U08 operation models authorize exactly the three unknown-role rotations", () => {
  const total = operationModel("kp_g3b_u08_total_from_groups", "op_g3b_u08_total_from_groups");
  const groupCount = operationModel("kp_g3b_u08_group_count_from_total", "op_g3b_u08_group_count_from_total");
  const perGroup = operationModel("kp_g3b_u08_per_group_from_total", "op_g3b_u08_per_group_from_total");

  assert.ok(total?.canonicalExpressions.includes("totalAmount = amountPerGroup * groupCount"));
  assert.deepEqual(total.unknownRoles, ["totalAmount"]);
  assert.ok(total.numberConstraints.includes("groupCount is a positive one-digit integer"));
  assert.ok(total.numberConstraints.includes("totalAmount <= 999"));

  assert.ok(groupCount?.canonicalExpressions.includes("groupCount = totalAmount / amountPerGroup"));
  assert.deepEqual(groupCount.unknownRoles, ["groupCount"]);
  assert.ok(groupCount.numberConstraints.includes("totalAmount % amountPerGroup = 0"));
  assert.ok(groupCount.validationInvariants.includes("semantic relation is quotative division"));

  assert.ok(perGroup?.canonicalExpressions.includes("amountPerGroup = totalAmount / groupCount"));
  assert.deepEqual(perGroup.unknownRoles, ["amountPerGroup"]);
  assert.ok(perGroup.numberConstraints.includes("totalAmount % groupCount = 0"));
  assert.ok(perGroup.validationInvariants.includes("semantic relation is partitive division"));

  assert.equal(roleContract("totalAmount").operation, "multiplication");
  assert.equal(roleContract("groupCount").operation, "quotative_division");
  assert.equal(roleContract("amountPerGroup").operation, "partitive_division");
  assert.equal(contract.roleRotationContract.exactDivisionRequiredForDivisionRoles, true);
  assert.equal(contract.roleRotationContract.keywordToOperationSelectionAllowed, false);
});

test("P1-12 V1 reuses the existing 12 G3B-U08 PatternSpecs with four per unknown role", () => {
  const expectations = [
    ["totalAmount", "kp_g3b_u08_total_from_groups"],
    ["groupCount", "kp_g3b_u08_group_count_from_total"],
    ["amountPerGroup", "kp_g3b_u08_per_group_from_total"],
  ];
  const all = [];
  for (const [unknownRole, knowledgePointId] of expectations) {
    const role = roleContract(unknownRole);
    const group = patternGroup(knowledgePointId);
    assert.ok(group);
    assert.equal(role.relationKnowledgePointId, knowledgePointId);
    assert.equal(role.patternSpecIds.length, 4);
    assert.deepEqual(role.patternSpecIds, group.patternSpecIds);
    for (const patternSpecId of role.patternSpecIds) {
      const spec = patternRegistry.patternSpecs.find((entry) => entry.patternSpecId === patternSpecId);
      assert.ok(spec, patternSpecId);
      assert.equal(spec.knowledgePointId, knowledgePointId);
      all.push(patternSpecId);
    }
  }
  assert.equal(new Set(all).size, 12);
  assert.equal(contract.existingPatternSpecReuseDecision.strategy, "REUSE_EXISTING_12_G3BU08_PATTERN_SPECS");
  assert.equal(contract.existingPatternSpecReuseDecision.patternSpecCount, 12);
  assert.equal(contract.existingPatternSpecReuseDecision.newPatternSpecRequired, false);
  assert.equal(contract.existingPatternSpecReuseDecision.newContextFamilyRequired, false);
});

test("operator-approved source corpora are registered as supplementary evidence without authority expansion", () => {
  const ids = sourceCorpus.sourceCorpora.map((entry) => entry.sourceCorpusId);
  assert.ok(ids.includes("LI_TEACHER_MATH_THINKING_G1_G6"));
  assert.ok(ids.includes("MULTI_SCHOOL_EXAM_CORPUS_G03_G09"));
  const folderIds = sourceCorpus.sourceCorpora.map((entry) => entry.folderId);
  assert.ok(folderIds.includes("1VHxb5jEkw_xP683wP528HEYFC-_zFIKk"));
  assert.ok(folderIds.includes("1m8ljMOMb0ugFQCsC76Q1hX9UMRj0Hxpr"));

  assert.equal(contract.supplementarySourceEvidence.policy.canonicalRelationAuthorityWins, true);
  assert.equal(contract.supplementarySourceEvidence.policy.schoolExamAggregateSupportsRepresentationBreadthOnly, true);
  assert.equal(contract.supplementarySourceEvidence.policy.liTeacherSupportsProblemSolvingStructureOnly, true);
  assert.equal(contract.supplementarySourceEvidence.policy.sourcePresenceDoesNotExpandNumericAuthority, true);
  assert.equal(contract.supplementarySourceEvidence.policy.sourcePresenceDoesNotAutoAuthorizeRuntime, true);
});

test("source evidence admits direct exact-role surfaces but explicitly excludes remainder, conversion and constraint systems", () => {
  const positive = contract.supplementarySourceEvidence.positiveWitnesses;
  assert.ok(positive.some((entry) => entry.sourceFileId === "17l0Snzp4JqOnn88fouvzscBMMxUX-tSm" && entry.unknownRole === "amountPerGroup"));
  assert.ok(positive.some((entry) => entry.sourceFileId === "1iizCKnjiScWXe7i4DFQ_ZyQTKY9M2Z5e" && entry.unknownRole === "amountPerGroup"));
  assert.ok(positive.some((entry) => entry.sourceFileId === "1knMV1ZIQ5dnUsfV28VuSbuZgBvLE1jrM" && entry.unknownRole === "totalAmount"));
  assert.ok(positive.some((entry) => entry.sourceFileId === "1q3TLW8vYlDC-zO2N2zOKT5aUJ0Q6snq8"));

  const negative = contract.supplementarySourceEvidence.negativeBoundaryWitnesses;
  assert.ok(negative.some((entry) => /remainder interpretation/.test(entry.exclusionReason)));
  assert.ok(negative.some((entry) => /implicit unit conversion/.test(entry.exclusionReason)));
  assert.ok(negative.some((entry) => /multi-relation\/constraint-system/.test(entry.exclusionReason)));
  assert.ok(contract.scope.excluded.includes("remainder floor/ceil interpretation"));
  assert.ok(contract.scope.excluded.includes("implicit unit conversion"));
  assert.ok(contract.scope.excluded.includes("multi-relation composition"));
});

test("early P1-01/P1-02 transfer remains totalAmount-only and defers inverse roles to P1-12", () => {
  assert.deepEqual(earlyTransfer.relationContract.allowedUnknownRoles, ["totalAmount"]);
  assert.deepEqual(earlyTransfer.relationContract.forbiddenUnknownRoles, ["groupCount", "amountPerGroup"]);
  assert.equal(earlyTransfer.relationContract.forbiddenUnknownRoleDisposition, "DEFER_TO_P1_12");
  assert.match(earlyTransferGenerator, /PATH1_EQUAL_GROUPS_TRANSFER_RELATION_KP_ID = "kp_g3b_u08_total_from_groups"/);
  assert.match(earlyTransferGenerator, /unknownRole: "totalAmount"/);
  assert.ok(contract.futureImplementationArchitecture.mustNotModify.includes(EARLY_TRANSFER_GENERATOR_PATH));
});

test("future implementation is a separate Path1-local P1-12 adapter and still requires approval", () => {
  assert.equal(contract.futureImplementationArchitecture.selectedStrategy, "PATH1_LOCAL_P1_12_INVERSE_EQUAL_GROUPS_ADAPTER");
  assert.equal(contract.futureImplementationArchitecture.candidatePracticeMode, "inverseEqualGroupsTransfer");
  assert.equal(contract.futureImplementationArchitecture.masteryCredit, "NONE_UNTIL_SEPARATE_MASTERY_INTEGRATION_APPROVAL");
  assert.ok(contract.implementationEntryCriteria.includes("explicit approval to cross planning-to-implementation boundary"));
  assert.equal(contract.focusedFutureImplementationAcceptance.fullRegressionRequired, false);
  assert.equal(contract.focusedFutureImplementationAcceptance.globalReplayRequired, false);
  assert.equal(contract.distance.nextShortestStep, "PATH1_WORD_PROBLEM_P1_12_INVERSE_EQUAL_GROUPS_IMPLEMENTATION_V1");
});
