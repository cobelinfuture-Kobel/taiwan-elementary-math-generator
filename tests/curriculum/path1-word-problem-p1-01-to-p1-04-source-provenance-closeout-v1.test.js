import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const REVIEW_PATH = "data/curriculum/application/reviews/PATH1_WORD_PROBLEM_P1_01_TO_P1_04_SOURCE_PROVENANCE_CLOSEOUT_V1.json";
const TRANSFER_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_EQUAL_GROUPS_TRANSFER_CONTRACT_V1.json";
const P103_IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_03_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1.json";
const P104_IMPLEMENTATION_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_P1_04_MULTIPLICATIVE_MODELING_IMPLEMENTATION_V1.json";
const CORPUS_PATH = "data/curriculum/application/reviews/PATH1_WORD_PROBLEM_SOURCE_CORPUS_ADDITION_V1.json";
const MATRIX_PATH = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const review = readJson(REVIEW_PATH);
const transfer = readJson(TRANSFER_PATH);
const p103 = readJson(P103_IMPLEMENTATION_PATH);
const p104 = readJson(P104_IMPLEMENTATION_PATH);
const corpus = readJson(CORPUS_PATH);
const matrix = readJson(MATRIX_PATH);

const byBlock = new Map(review.blockProvenance.map((entry) => [entry.blockId, entry]));
const matrixByBlock = new Map(matrix.blocks.map((entry) => [entry.blockId, entry]));

const expectedBlocks = ["P1-01", "P1-02", "P1-03", "P1-04"];
const expectedKps = {
  "P1-01": ["kp_g3a_u03_10_multiple_by_1digit"],
  "P1-02": ["kp_g3a_u03_2digit_by_1digit_carry", "kp_g3a_u03_3digit_by_1digit"],
  "P1-03": ["kp_g4a_u02_2digit_by_2digit"],
  "P1-04": ["kp_g4a_u02_2digit_by_3digit", "kp_g4a_u02_3digit_by_2digit"],
};

const expectedParents = [
  "ps_g3b_u08_total_daily_saving_accumulation",
  "ps_g3b_u08_total_score_per_success",
  "ps_g3b_u08_total_material_per_product",
  "ps_g3b_u08_total_items_per_package",
];

function sorted(values) {
  return [...values].sort();
}

test("source provenance closeout is bounded and non-runtime", () => {
  assert.equal(review.taskId, "PATH1_WORD_PROBLEM_P1_01_TO_P1_04_SOURCE_PROVENANCE_CLOSEOUT_V1");
  assert.equal(review.status, "P1_01_TO_P1_04_SOURCE_PROVENANCE_NORMALIZED_AND_CLOSED");
  assert.deepEqual(review.scope.includedPathBlocks, expectedBlocks);
  assert.equal(review.implementationAllowed, false);
  assert.equal(review.runtimeChanged, false);
  assert.equal(review.publicRouteChanged, false);
  assert.equal(review.sourceSemanticsChanged, false);
  assert.equal(review.canonicalKnowledgePointChanged, false);
  assert.equal(review.patternSpecChanged, false);
  assert.equal(review.validatorChanged, false);
  assert.equal(review.path1MatrixChanged, false);
  assert.ok(review.scope.excluded.includes("P1-05 implementation or source mining"));
  assert.ok(review.scope.excluded.includes("P1-12 public cutover or source reinterpretation"));
});

test("all provenance authority refs are repository-resolvable", () => {
  for (const authorityPath of Object.values(review.authorityRefs)) {
    assert.equal(fs.existsSync(authorityPath), true, authorityPath);
  }
});

test("P1-01 through P1-04 arithmetic KP provenance matches Path1 matrix", () => {
  assert.deepEqual(sorted([...byBlock.keys()]), sorted(expectedBlocks));
  for (const blockId of expectedBlocks) {
    const ledger = byBlock.get(blockId);
    const matrixBlock = matrixByBlock.get(blockId);
    assert.ok(ledger, blockId);
    assert.ok(matrixBlock, blockId);
    assert.deepEqual(ledger.arithmeticKnowledgePointIds, expectedKps[blockId], blockId);
    assert.deepEqual(matrixBlock.primaryKnowledgePointIds, expectedKps[blockId], blockId);
  }
});

test("P1-01 and P1-02 provenance matches the approved equal-groups transfer contract", () => {
  for (const blockId of ["P1-01", "P1-02"]) {
    const ledger = byBlock.get(blockId);
    const contract = transfer.pathBlockContracts.find((entry) => entry.blockId === blockId);
    assert.ok(contract, blockId);
    assert.deepEqual(ledger.arithmeticKnowledgePointIds, contract.arithmeticKnowledgePointIds, blockId);
    assert.equal(ledger.arithmeticSource.sourceId, "g3a_u03_3a03");
    assert.equal(ledger.arithmeticSource.driveFileId, "1cUa8Oi1VE2My9ZtCJwGvpBpfDAbhPOp2");
    assert.equal(ledger.semanticSourceId, "g3b_u08_3b08");
    assert.equal(ledger.schoolExamEvidence.status, "AGGREGATE_REPRESENTATION_BREADTH_ONLY");
    assert.equal(ledger.schoolExamEvidence.individualPinnedRuntimeEnvelopeWitness, null);
  }
  assert.equal(transfer.authorityRefs.primarySourceP101P102, "batchA_01-題型總覽-3a03-乘法.pdf");
  assert.equal(transfer.authorityRefs.primarySourceEqualGroups, "batchA_01-題型總覽-3b08-乘法與除法.pdf");
});

test("P1-03 and P1-04 pinned school-exam witnesses match approved implementation contracts", () => {
  const p103Ledger = byBlock.get("P1-03");
  const p104Ledger = byBlock.get("P1-04");

  assert.equal(p103Ledger.arithmeticSource.sourceId, "g4a_u02_4a02");
  assert.equal(p103Ledger.arithmeticSource.driveFileId, "1YSRxhxFCYo-ezfkT8lun33Wdosnaq1Cq");
  assert.equal(p103Ledger.schoolExamEvidence.sourceFileId, p103.sourceEvidenceBoundary.schoolExamWitness.sourceFileId);
  assert.equal(p103Ledger.schoolExamEvidence.roleProjection, p103.sourceEvidenceBoundary.schoolExamWitness.relationWitness);
  assert.deepEqual(p103Ledger.arithmeticKnowledgePointIds, [p103.implementation.arithmeticKnowledgePointId]);

  assert.equal(p104Ledger.arithmeticSource.sourceId, "g4a_u02_4a02");
  assert.equal(p104Ledger.arithmeticSource.driveFileId, "1YSRxhxFCYo-ezfkT8lun33Wdosnaq1Cq");
  assert.equal(p104Ledger.schoolExamEvidence.sourceFileId, p104.sourceEvidenceBoundary.schoolExamWitness.sourceFileId);
  assert.equal(p104Ledger.schoolExamEvidence.roleProjection, p104.sourceEvidenceBoundary.schoolExamWitness.relationWitness);
  assert.deepEqual(
    p104Ledger.arithmeticKnowledgePointIds,
    p104.implementation.arithmeticForms.map((entry) => entry.arithmeticKnowledgePointId),
  );
});

test("shared R03 source and parent PatternSpec lineage are explicit and do not widen authority", () => {
  assert.equal(review.sharedSemanticAuthority.relationId, "R03_EQUAL_GROUPS");
  assert.equal(review.sharedSemanticAuthority.relationKnowledgePointId, "kp_g3b_u08_total_from_groups");
  assert.equal(review.sharedSemanticAuthority.relationOperationModelId, "op_g3b_u08_total_from_groups");
  assert.equal(review.sharedSemanticAuthority.semanticSource.sourceId, "g3b_u08_3b08");
  assert.equal(review.sharedSemanticAuthority.semanticSource.driveFileId, "1L13Z2ny6OjayGpCyn_sFCCdXpsAtuZxY");
  assert.deepEqual(review.sharedSemanticAuthority.directParentPatternSpecIds, expectedParents);
  assert.equal(review.sourceAuthorityPolicy.sourcePresenceDoesNotExpandNumericAuthority, true);
  assert.equal(review.sourceAuthorityPolicy.sourcePresenceDoesNotMintCanonicalKnowledgePoint, true);
  assert.equal(review.sourceAuthorityPolicy.sourcePresenceDoesNotActivateRuntime, true);
  assert.equal(byBlock.get("P1-03").parentPatternAuthorityReusedForNumericEnvelope, false);
  assert.equal(byBlock.get("P1-04").parentPatternAuthorityReusedForNumericEnvelope, false);
});

test("registered supplementary corpus contains every pinned Li Teacher file", () => {
  const liCorpus = corpus.sourceCorpora.find((entry) => entry.sourceCorpusId === "LI_TEACHER_MATH_THINKING_G1_G6");
  assert.ok(liCorpus);
  const registeredIds = new Set(liCorpus.observedTopLevelFiles.map((entry) => entry.fileId));
  const pinnedIds = new Set(review.blockProvenance.flatMap((entry) => entry.liTeacherEvidence.fileIds));
  for (const fileId of pinnedIds) assert.equal(registeredIds.has(fileId), true, fileId);
});

test("known Batch A embedded-path mismatches remain provenance warnings, not source remaps", () => {
  const p101 = byBlock.get("P1-01");
  const p102 = byBlock.get("P1-02");
  assert.equal(p101.arithmeticSource.sourceCodeMismatchReview, true);
  assert.equal(p101.arithmeticSource.observedEmbeddedPath, "/3a04/");
  assert.equal(p101.arithmeticSource.resolvedSourceId, "g3a_u03_3a03");
  assert.equal(p102.arithmeticSource.sourceCodeMismatchReview, true);
  assert.equal(review.sharedSemanticAuthority.semanticSource.sourceCodeMismatchReview, true);
  assert.equal(review.sharedSemanticAuthority.semanticSource.observedEmbeddedPath, "/3b07/");
  assert.equal(review.sharedSemanticAuthority.semanticSource.resolvedSourceId, "g3b_u08_3b08");
});

test("closeout keeps P1-05 and P1-12 outside the provenance milestone", () => {
  assert.equal(review.closeout.nextShortestStep, "PATH1_WORD_PROBLEM_P1_05_CAPABILITY_AND_TRANSFER_PREFLIGHT_V1");
  assert.ok(!byBlock.has("P1-05"));
  assert.ok(!byBlock.has("P1-12"));
  assert.equal(review.closeout.newBlocker, "NONE_WITHIN_SOURCE_PROVENANCE_SCOPE");
});
