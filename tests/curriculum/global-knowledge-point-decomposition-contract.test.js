import test from "node:test";
import assert from "node:assert/strict";

import {
  validateGlobalKnowledgePointDecompositionContract,
  validateKnowledgePointCandidate,
} from "../../tools/curriculum/validate-global-knowledge-point-decomposition-contract.mjs";

function validCandidate() {
  return {
    knowledgePointId: "kp_integer_multiplication_equal_groups",
    canonicalNameZh: "等組乘法總量",
    capabilityStatement: "學生能由每組數量與組數求出全部總量。",
    indispensableConcepts: ["等組", "每組數量", "組數與總量關係"],
    reasoningInvariant: "以相同每組量重複指定組數，總量等於每組量乘以組數。",
    misconceptionFamilies: ["把每組量與組數相加", "交換未知量角色"],
    validatorCapability: {
      validatorCapabilityId: "valcap_equal_groups_total",
      acceptanceCriteria: ["答案等於每組量乘以組數", "數量角色保持一致"],
      rejectionCodes: ["KP_EQUAL_GROUPS_TOTAL_MISMATCH", "KP_QUANTITY_ROLE_MISMATCH"],
    },
    allowedVariationAxes: ["unknown_shift", "context_projection", "difficulty_parameterization"],
    sourceRefs: [
      {
        sourceNodeId: "g3a_u03_3a03",
        evidenceRole: "PRIMARY_EVIDENCE",
        evidenceRefs: ["source:g3a_u03_3a03"],
      },
    ],
    legacyBatchRefs: ["A"],
    candidateStatus: "CANDIDATE_ONLY",
    prerequisiteDeclaration: {
      mode: "DEFERRED_TO_R03",
      directPrerequisiteKnowledgePointIds: [],
    },
    runtimeCapabilityDeclaration: {
      mode: "DEFERRED_TO_R04",
      requiredRuntimeCapabilityIds: [],
    },
    mainlineBinding: {
      productBaselineMergeSha: "9846627e1263d9dfb3e9e2318989cc5ae94c35dd",
      existingConsumerEntryPoint: "site/assets/browser/pipeline/build-worksheet-document.js",
      productionCutoverAllowed: false,
    },
  };
}

test("R01 contract binds 79 source nodes to the merged 15-unit D0 mainline without cutover", () => {
  const result = validateGlobalKnowledgePointDecompositionContract();
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.deepEqual(result.metrics, {
    sourceNodeCount: 79,
    completedPublicUnitCount: 15,
    completedBatchAUnitCount: 13,
    completedBatchBUnitCount: 2,
    requiredCandidateFieldCount: 14,
    productionCutoverAllowed: false,
    existingConsumerEntryPoint: "site/assets/browser/pipeline/build-worksheet-document.js",
  });
});

test("R01 candidate contract accepts an independently teachable and validator-bound capability", () => {
  const result = validateKnowledgePointCandidate(validCandidate());
  assert.deepEqual(result, { ok: true, errors: [] });
});

test("R01 candidate contract rejects title-only pseudo-KP and premature graph/runtime/cutover claims", () => {
  const candidate = validCandidate();
  candidate.capabilityStatement = candidate.canonicalNameZh;
  candidate.prerequisiteDeclaration = {
    mode: "MATERIALIZED",
    directPrerequisiteKnowledgePointIds: ["kp_integer_addition"],
  };
  candidate.runtimeCapabilityDeclaration = {
    mode: "MATERIALIZED",
    requiredRuntimeCapabilityIds: ["integer_generator"],
  };
  candidate.mainlineBinding.productionCutoverAllowed = true;

  const result = validateKnowledgePointCandidate(candidate);
  assert.equal(result.ok, false);
  const codes = new Set(result.errors.map((row) => row.code));
  assert.equal(codes.has("GKP_TITLE_ONLY_CAPABILITY_FORBIDDEN"), true);
  assert.equal(codes.has("GKP_R01_PREREQUISITE_SCOPE_VIOLATION"), true);
  assert.equal(codes.has("GKP_R01_RUNTIME_SCOPE_VIOLATION"), true);
  assert.equal(codes.has("GKP_MAINLINE_BINDING_INVALID"), true);
});

test("R01 candidate contract treats Batch A-E only as legacy provenance", () => {
  const candidate = validCandidate();
  candidate.legacyBatchRefs = ["A", "C", "E"];
  assert.equal(validateKnowledgePointCandidate(candidate).ok, true);

  candidate.legacyBatchRefs = ["F"];
  const result = validateKnowledgePointCandidate(candidate);
  assert.equal(result.ok, false);
  assert.equal(result.errors.some((row) => row.code === "GKP_LEGACY_BATCH_REFS_INVALID"), true);
});
