import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const REGISTRY_PATH = new URL(
  "../../data/curriculum/registry/g5a_u02_dual_pdf_knowledge_point_candidates.json",
  import.meta.url,
);
const registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf8"));
const candidates = registry.knowledgePointCandidates;

function candidate(id) {
  return candidates.find((entry) => entry.knowledgePointId === id);
}

test("S78 records two manually reviewed source packets and 19 unique candidates", () => {
  assert.equal(registry.task, "S78_G5A_U02_DualPDFManualKnowledgePointExtraction");
  assert.equal(registry.sources.length, 2);
  assert.equal(registry.sources.every((source) => source.pageCount === 2), true);
  assert.equal(registry.sources.every((source) => source.manualReviewed === true), true);
  assert.equal(candidates.length, 19);
  assert.equal(new Set(candidates.map((entry) => entry.knowledgePointId)).size, 19);
});

test("S78 preserves both requested source ids while blocking promotion on identity drift", () => {
  assert.deepEqual(registry.sources.map((source) => source.requestedSourceId), [
    "g5a_u02_5a02a",
    "g5a_u02_5a02a1",
  ]);
  assert.equal(registry.sourceIdentityStatus, "needs_reconciliation_before_promotion");
  assert.equal(registry.promotionEligible, false);
  assert.deepEqual(
    registry.sources.flatMap((source) => source.sourceIdentityAnomalies.map((entry) => entry.code)),
    ["source_url_code_mismatch", "source_title_and_url_scope_mismatch"],
  );
  assert.equal(registry.sources.every((source) => source.identityDisposition === "preserve_current_source_id_pending_reconciliation"), true);
});

test("S78 recognizes the second packet as common-factor content rather than duplicate factor content", () => {
  const second = registry.sources[1];
  assert.equal(second.uploadedFileName, "題型總覽-5a02a1-因數.pdf");
  assert.equal(second.displayedTitle, "公因數");
  assert.equal(second.displayedUrl, "https://meow911.com/5a03b/");
  assert.equal(candidate("kp_g5a_u02_common_factor_concept").sourceEvidence[0].packetId, second.packetId);
  assert.equal(candidate("kp_g5a_u02_greatest_common_factor").sourceEvidence.every((entry) => entry.packetId === second.packetId), true);
});

test("S78 freezes Class C and D candidate counts", () => {
  const counts = candidates.reduce((output, entry) => {
    output[entry.candidateClass] = (output[entry.candidateClass] ?? 0) + 1;
    return output;
  }, {});
  assert.deepEqual(counts, { C: 12, D: 7 });
  assert.deepEqual(registry.scope.candidateClassCounts, { C: 12, D: 7 });
});

test("every S78 candidate has evidence, tags and an answer-model candidate", () => {
  const packetIds = new Set(registry.sources.map((source) => source.packetId));
  for (const entry of candidates) {
    assert.equal(entry.displayName.length > 0, true, entry.knowledgePointId);
    assert.equal(entry.description.length > 0, true, entry.knowledgePointId);
    assert.equal(entry.domainTags.length > 0, true, entry.knowledgePointId);
    assert.equal(entry.answerModelCandidate.length > 0, true, entry.knowledgePointId);
    assert.equal(entry.sourceEvidence.length > 0, true, entry.knowledgePointId);
    for (const evidence of entry.sourceEvidence) {
      assert.equal(packetIds.has(evidence.packetId), true, entry.knowledgePointId);
      assert.equal([1, 2].includes(evidence.page), true, entry.knowledgePointId);
      assert.equal(evidence.panel.length > 0, true, entry.knowledgePointId);
      assert.equal(evidence.detail.length > 0, true, entry.knowledgePointId);
    }
  }
});

test("S78 cross-packet candidates cite both packets", () => {
  for (const id of registry.sharedCrossPacketCandidates) {
    const packetIds = new Set(candidate(id).sourceEvidence.map((entry) => entry.packetId));
    assert.equal(packetIds.size, 2, id);
  }
  assert.deepEqual(registry.sharedCrossPacketCandidates, [
    "kp_g5a_u02_number_theory_problem_type_discrimination",
    "kp_g5a_u02_common_factor_enumeration",
  ]);
});

test("S78 does not create a KnowledgePoint solely from the embedded video thumbnail", () => {
  assert.equal(registry.externalMediaBoundary.embeddedVideoThumbnailObserved, true);
  assert.equal(registry.externalMediaBoundary.candidateCreatedSolelyFromExternalVideo, false);
  assert.equal(candidates.some((entry) => entry.knowledgePointId.includes("short_division")), false);
});

test("S78 remains candidate-only and production forbidden", () => {
  assert.equal(registry.scope.candidateLifecycle, "candidate_only");
  assert.equal(registry.scope.formalMappingMaterialized, false);
  assert.equal(registry.scope.patternSpecMaterialized, false);
  assert.equal(registry.scope.generatorImplemented, false);
  assert.equal(registry.scope.validatorImplemented, false);
  assert.equal(registry.scope.selectorVisible, false);
  assert.equal(registry.scope.productionUse, "forbidden");
  assert.equal(registry.handoff.nextTask, "S79_G5A_U02_DualPDFKnowledgePointBoundaryAndSourceIdentityQA");
  assert.equal(registry.handoff.operatorDecisionRequiredBeforePromotion, true);
});
