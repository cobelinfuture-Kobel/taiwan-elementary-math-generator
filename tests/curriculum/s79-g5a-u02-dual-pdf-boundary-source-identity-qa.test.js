import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const SOURCE_PATH = new URL(
  "../../data/curriculum/registry/g5a_u02_dual_pdf_knowledge_point_candidates.json",
  import.meta.url,
);
const QA_PATH = new URL(
  "../../data/curriculum/registry/g5a_u02_dual_pdf_knowledge_point_candidate_qa.json",
  import.meta.url,
);

const source = JSON.parse(readFileSync(SOURCE_PATH, "utf8"));
const qa = JSON.parse(readFileSync(QA_PATH, "utf8"));

function decision(id) {
  return qa.boundaryDecisions.find((entry) => entry.knowledgePointId === id);
}

test("S79 reviews all 19 S78 candidates into 18 canonical boundaries", () => {
  assert.equal(qa.task, "S79_G5A_U02_DualPDFKnowledgePointBoundaryAndSourceIdentityQA");
  assert.equal(qa.sourceArtifact, "data/curriculum/registry/g5a_u02_dual_pdf_knowledge_point_candidates.json");
  assert.equal(source.knowledgePointCandidates.length, 19);
  assert.deepEqual(qa.summary, {
    reviewedCandidateCount: 19,
    acceptedDistinctCount: 18,
    mergedCount: 1,
    splitCount: 0,
    rejectedCount: 0,
    canonicalBoundaryCount: 18,
    canonicalClassCCount: 11,
    canonicalClassDCount: 7,
  });

  const sourceIds = source.knowledgePointCandidates.map((entry) => entry.knowledgePointId).sort();
  const decisionIds = qa.boundaryDecisions.map((entry) => entry.knowledgePointId).sort();
  assert.deepEqual(decisionIds, sourceIds);
  assert.equal(new Set(decisionIds).size, 19);
});

test("S79 merges only efficient factor-pair search into multiplication-pair enumeration", () => {
  const merged = qa.boundaryDecisions.filter((entry) => entry.decision === "merge_into");
  assert.equal(merged.length, 1);
  assert.deepEqual(merged[0], {
    knowledgePointId: "kp_g5a_u02_efficient_factor_pair_search",
    decision: "merge_into",
    canonicalSkillParent: "factor",
    skillVariant: "factor_enumeration_by_multiplication_pairs",
    boundaryRationale: merged[0].boundaryRationale,
    mergedInto: "kp_g5a_u02_factor_enumeration_by_multiplication_pairs",
  });
  assert.match(merged[0].boundaryRationale, /method constraints|multiplication-pair enumeration/);

  const mergeCheck = qa.duplicateBoundaryChecks.find((entry) => entry.result === "merge");
  assert.deepEqual(mergeCheck.pair, [
    "kp_g5a_u02_factor_enumeration_by_multiplication_pairs",
    "kp_g5a_u02_efficient_factor_pair_search",
  ]);
});

test("S79 canonical class counts follow accepted distinct rows", () => {
  const sourceById = new Map(
    source.knowledgePointCandidates.map((entry) => [entry.knowledgePointId, entry]),
  );
  const counts = { C: 0, D: 0 };
  for (const entry of qa.boundaryDecisions) {
    if (entry.decision !== "accept_as_distinct") continue;
    counts[sourceById.get(entry.knowledgePointId).candidateClass] += 1;
  }
  assert.deepEqual(counts, { C: 11, D: 7 });
});

test("S79 preserves distinct answer-shape and method boundaries", () => {
  assert.equal(
    decision("kp_g5a_u02_factor_enumeration_by_division").skillVariant,
    "factor_enumeration_by_division",
  );
  assert.equal(
    decision("kp_g5a_u02_factor_enumeration_by_multiplication_pairs").skillVariant,
    "factor_enumeration_by_multiplication_pairs",
  );
  assert.equal(
    decision("kp_g5a_u02_maximum_equal_grouping_gcf_application").decision,
    "accept_as_distinct",
  );
  assert.equal(
    decision("kp_g5a_u02_possible_equal_packaging_common_factor_application").decision,
    "accept_as_distinct",
  );
  assert.equal(
    decision("kp_g5a_u02_rectangle_equal_square_side_lengths").decision,
    "accept_as_distinct",
  );
  assert.equal(
    decision("kp_g5a_u02_square_tile_area_possibilities").decision,
    "accept_as_distinct",
  );
});

test("S79 resolves packet roles while retaining stable split-packet ids", () => {
  const resolution = qa.sourceIdentityResolution;
  assert.equal(resolution.status, "resolved_for_candidate_pipeline");
  assert.equal(resolution.parentUnitDecision.unitId, "g5a_u02");
  assert.equal(resolution.parentUnitDecision.canonicalUnitTitle, "因數與公因數");
  assert.equal(resolution.sourceIdentityPromotionBlocker, false);
  assert.equal(resolution.operatorDecisionRequired, false);

  assert.deepEqual(
    resolution.packetDecisions.map((entry) => entry.requestedSourceIdDecision),
    ["retain_g5a_u02_5a02a", "retain_g5a_u02_5a02a1"],
  );
  assert.equal(resolution.packetDecisions[0].canonicalPacketTitle, "因數");
  assert.equal(resolution.packetDecisions[0].canonicalPacketRole, "factor_core");
  assert.equal(resolution.packetDecisions[0].anomalyDisposition, "recorded_non_blocking");
  assert.equal(resolution.packetDecisions[0].metadataPatchRequired, false);

  assert.equal(resolution.packetDecisions[1].canonicalPacketTitle, "公因數");
  assert.equal(resolution.packetDecisions[1].canonicalPacketRole, "common_factor_gcf_extension");
  assert.equal(resolution.packetDecisions[1].anomalyDisposition, "resolved_by_packet_role_lock");
  assert.equal(resolution.packetDecisions[1].metadataPatchRequired, true);
  assert.deepEqual(resolution.packetDecisions[1].requiredMetadataCorrection, {
    displayTitle: "公因數",
    sourceUrl: "https://meow911.com/5a03b/",
  });
});

test("S79 keeps external-media and production boundaries closed", () => {
  assert.equal(qa.externalMediaDisposition.shortDivisionThumbnailObserved, true);
  assert.equal(qa.externalMediaDisposition.standaloneShortDivisionKnowledgePointAccepted, false);
  assert.equal(
    qa.boundaryDecisions.some((entry) => entry.knowledgePointId.includes("short_division")),
    false,
  );

  assert.deepEqual(qa.scopeBoundary, {
    sourceCandidateRegistryMutated: false,
    knowledgePointRowsPromoted: false,
    formalMappingCreated: false,
    patternSpecsCreated: false,
    generatorImplemented: false,
    validatorImplemented: false,
    publicSelectorEnabled: false,
    productionUse: "forbidden",
  });
  assert.equal(qa.nextGate, "S80_G5A_U02_FormalMappingCandidateDesign");
  assert.equal(qa.stopReason, "NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE");
});
