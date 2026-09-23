import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { getR04KnowledgePointCapabilityMapping } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import * as currentSelector from "../../site/modules/curriculum/registry/batch-a-selector-p05f12-extension.js";

const preflight = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p05f/q013-g4a-u05-triangle-elements-naming-source-authority-preflight.json", import.meta.url),
  "utf8",
));
const r02Chunk = JSON.parse(readFileSync(
  new URL("../../data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-02.json", import.meta.url),
  "utf8",
));
const impact = JSON.parse(readFileSync(
  new URL("../../data/project/change-impact/P05F_W5_Q013_PREFLIGHT.impact.json", import.meta.url),
  "utf8",
));
const validation = JSON.parse(readFileSync(
  new URL("../../data/project/validation-plans/P05F_W5_Q013_PREFLIGHT.validation.json", import.meta.url),
  "utf8",
));

const EXPECTED_KP = "kp_g4a_u05_triangle_elements_naming";
const EXPECTED_CAPS = [
  "cap_geometry_diagram_representation",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
];
const SIBLINGS = [
  "kp_g4a_u05_triangle_side_classification",
  "kp_g4a_u05_triangle_angle_classification",
  "kp_g4a_u05_triangle_inequality",
  "kp_g4a_u05_congruent_triangle_correspondence",
];

test("P05F W5 Q013 frozen queue identity is exact and Q012 repaired D0 is satisfied", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[12];

  assert.equal(queue.queueFrozen, true);
  assert.equal(queue.queueRegistry.queueDigest, "a4dae65a1a907ba963a135fce84ba292b8486a12513ae8f1fa54fbf07a6598ae");
  assert.equal(slice.queuePosition, 13);
  assert.equal(slice.sliceId, "p05e_q013_r1_g4a_u05_4a05_profile_geometry_property_c1");
  assert.equal(slice.implementationTaskId, "P05F_W5DirectProductVerticalSlice013Implementation");
  assert.equal(slice.previousSliceId, "p05e_q012_r1_g3b_u05_3b05_profile_geometry_formula_c1");
  assert.equal(slice.previousSliceMustBeD0Complete, true);
  assert.equal(slice.primarySourceNodeId, "g4a_u05_4a05");
  assert.equal(slice.primaryRuntimeProfileId, "profile_geometry_property");
  assert.equal(slice.knowledgePointCount, 1);
  assert.deepEqual(slice.knowledgePointIds, [EXPECTED_KP]);
  assert.deepEqual(slice.requiredW5CapabilityIds, EXPECTED_CAPS);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds, [EXPECTED_KP]);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds, EXPECTED_CAPS);

  const predecessor = preflight.previousSliceD0Evidence;
  assert.equal(predecessor.implementationPrNumber, 818);
  assert.equal(predecessor.productMergeSha, "5cdc91357453069a69bdac2eb28aed4004f62562");
  assert.equal(predecessor.prGateRunId, "34105788545");
  assert.equal(predecessor.exactPagesRunId, "34105973743");
  assert.equal(predecessor.pagesDeploymentRunId, "34105973847");
  assert.equal(predecessor.status, "PASS_E6_D0_COMPLETE_AND_POSTMERGE_ATTRIBUTED_REPAIRED");
  assert.equal(predecessor.postMergeAttribution.repairPrNumber, 820);
  assert.equal(predecessor.postMergeAttribution.repairMergeSha, "d6070c58229bb74cd2e0a47373cc8b032486bd7b");
  assert.equal(predecessor.postMergeAttribution.preQ012BaselineFailureCount, 110);
  assert.equal(predecessor.postMergeAttribution.postRepairFailureCount, 110);
  assert.equal(predecessor.postMergeAttribution.postRepairNewFailureCountVsBaseline, 0);
  assert.equal(predecessor.postMergeAttribution.q012ProductImplementationChangedByRepair, false);
  assert.equal(predecessor.postMergeAttribution.closeoutStatus, "Q012_PASS_E6_D0_COMPLETE_AND_POSTMERGE_ATTRIBUTED_REPAIRED");
});

test("P05F W5 Q013 locks the current Drive source identity while treating stale metadata review as non-authoritative", () => {
  const source = preflight.sourceAuthority;
  assert.equal(preflight.status, "PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(source.sourceNodeId, "g4a_u05_4a05");
  assert.equal(source.r02SourceTitle, "三角形與全等");
  assert.equal(source.metadataSourceTitle, "三角形");
  assert.equal(source.sourcePdfTitle, "meow911_4a05_source.pdf");
  assert.equal(source.sourcePdfDriveFileId, "1FF9BVJfihtKH4pJTJJbDt2Sg1tGgO26v");
  assert.equal(source.sourceMetadataDriveFileId, "1xAdLHCPizeU1qqfxJV0KUFypDJWaxV15");
  assert.equal(source.verificationNotesDriveFileId, "1Mo15A_4T4fsCRf_LZO6f40RLdH5RA4HD");
  assert.equal(source.sourceUrlFromMetadata, "https://meow911.com/4a05/");
  assert.equal(source.embeddedHeaderUrlFromPdf, "https://meow911.com/4a06/");
  assert.equal(source.pageCount, 2);
  assert.deepEqual(source.reviewedPages, [1, 2]);
  assert.equal(source.currentDriveReadback.metadataManualReviewed, false);
  assert.equal(source.currentDriveReadback.metadataExtractionStatus, "pending");
  assert.equal(source.currentDriveReadback.verificationNotesStatus, "pending");
  assert.equal(source.currentDriveReadback.pdfTextReadbackUsedAsSemanticAuthority, false);
  assert.equal(source.sourceIdentityCrossCheck.embeddedHeaderUrlMismatchObserved, true);
  assert.equal(source.sourceIdentityCrossCheck.sourceRefAmbiguity, false);
});

test("P05F W5 Q013 locks the exact R02 triangle-elements candidate and all same-source siblings", () => {
  const source = r02Chunk.sourceRecords.find((row) => row.sourceNodeId === "g4a_u05_4a05");
  assert.ok(source);
  assert.equal(source.sourceTitle, "三角形與全等");
  assert.equal(source.sourcePdfTitle, "meow911_4a05_source.pdf");
  assert.equal(source.pageCount, 2);
  assert.deepEqual(source.reviewedPages, [1, 2]);

  const candidate = source.candidates.find((row) => row.knowledgePointId === EXPECTED_KP);
  assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh, "三角形構成要素");
  assert.equal(candidate.capabilityStatement, "學生能辨認並命名三角形的邊、角與頂點。");
  assert.equal(candidate.reasoningInvariant, "三條線段首尾相接形成封閉圖形，對應邊角名稱必須一致。");
  assert.equal(candidate.category, "geometry");
  assert.deepEqual(candidate.evidencePages, [1, 2]);
  assert.equal(candidate.applicationSuitability, "APPLICATION_COMPATIBLE");

  const locked = preflight.r02ReviewedCandidateAuthority;
  assert.equal(locked.knowledgePointId, candidate.knowledgePointId);
  assert.equal(locked.canonicalNameZh, candidate.canonicalNameZh);
  assert.equal(locked.capabilityStatement, candidate.capabilityStatement);
  assert.equal(locked.reasoningInvariant, candidate.reasoningInvariant);
  assert.equal(locked.applicationSuitability, candidate.applicationSuitability);

  const actualSiblingIds = source.candidates
    .map((row) => row.knowledgePointId)
    .filter((id) => id !== EXPECTED_KP);
  assert.deepEqual(actualSiblingIds, SIBLINGS);
  assert.deepEqual(preflight.q013ScopeLock.excludedKnowledgePointIdsFromSameSource, SIBLINGS);
});

test("P05F W5 Q013 preserves current product non-admission and does not pull future same-source queue semantics forward", () => {
  assert.ok(!currentSelector.getVisibleBatchAKnowledgePoint(EXPECTED_KP));
  for (const sibling of SIBLINGS) assert.ok(!currentSelector.getVisibleBatchAKnowledgePoint(sibling));

  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const laterSameSource = queue.queueEntries
    .slice(13)
    .filter((row) => row.primarySourceNodeId === "g4a_u05_4a05")
    .flatMap((row) => row.knowledgePointIds);
  assert.ok(laterSameSource.includes("kp_g4a_u05_triangle_side_classification"));
  assert.ok(laterSameSource.includes("kp_g4a_u05_triangle_inequality"));
  assert.deepEqual(preflight.q013ScopeLock.laterFrozenQueueSameSourceKnowledgePointIds, [
    "kp_g4a_u05_triangle_side_classification",
    "kp_g4a_u05_triangle_inequality",
  ]);
  assert.equal(preflight.q013ScopeLock.existingSameSourceProductSemanticsPresent, false);
  assert.equal(preflight.q013ScopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.q013ScopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.q013ScopeLock.q014OrLaterTouched, false);
  assert.equal(preflight.q013ScopeLock.frozenQueueAuthorityTouched, false);
});

test("P05F W5 Q013 preserves the exact geometry-property runtime capability mapping", () => {
  const mapping = getR04KnowledgePointCapabilityMapping(EXPECTED_KP);
  assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId, "profile_geometry_property");
  assert.equal(mapping.classificationRuleId, "rule_geometry_property");
  assert.deepEqual(mapping.appliedModifierIds, []);

  const runtime = preflight.runtimeCapabilityAuthority;
  assert.equal(runtime.profileId, "profile_geometry_property");
  assert.deepEqual(runtime.profileRequiredCapabilityIds, [
    "cap_geometry_property_reasoning",
    "cap_geometry_domain_validator",
    "cap_geometry_diagram_representation",
  ]);
  assert.deepEqual(runtime.perKnowledgePointMappings, [{
    knowledgePointId: EXPECTED_KP,
    classificationRuleId: "rule_geometry_property",
    appliedModifierIds: [],
  }]);
  assert.deepEqual(runtime.unionAppliedModifierIds, []);
  assert.deepEqual(runtime.modifierAddedRequiredCapabilityIds, []);
  assert.deepEqual(runtime.exactFrozenQueueRequiredW5CapabilityIds, EXPECTED_CAPS);
});

test("P05F W5 Q013 scope lock admits naming only and excludes classification, inequality, congruence, construction, and application", () => {
  assert.deepEqual(preflight.q013ScopeLock.includedKnowledgePointIds, [EXPECTED_KP]);
  for (const relation of [
    "IDENTIFY_TRIANGLE_SIDES",
    "IDENTIFY_TRIANGLE_ANGLES",
    "IDENTIFY_TRIANGLE_VERTICES",
    "NAME_TRIANGLE_ELEMENTS_CONSISTENTLY",
    "PRESERVE_CLOSED_THREE_SEGMENT_TRIANGLE_STRUCTURE",
  ]) assert.ok(preflight.q013ScopeLock.includedRelations.includes(relation));
  for (const relation of [
    "CLASSIFY_TRIANGLE_BY_EQUAL_SIDE_COUNT",
    "CLASSIFY_TRIANGLE_BY_ANGLE_TYPE",
    "APPLY_TRIANGLE_INEQUALITY",
    "MATCH_CONGRUENT_TRIANGLE_CORRESPONDING_SIDES",
    "MATCH_CONGRUENT_TRIANGLE_CORRESPONDING_ANGLES",
    "GEOMETRY_CONSTRUCTION",
    "APPLICATION_CONTEXT",
  ]) assert.ok(preflight.q013ScopeLock.excludedRelations.includes(relation));
  assert.equal(preflight.q013ScopeLock.requiresGeometryDiagramRepresentation, true);
  assert.equal(preflight.q013ScopeLock.requiresGeometryDomainValidator, true);
  assert.equal(preflight.q013ScopeLock.requiresGeometryPropertyReasoning, true);
  assert.equal(preflight.q013ScopeLock.applicationImplementationAllowedByThisPreflight, false);
});

test("P05F W5 Q013 preflight validation remains SHARED_RUNTIME_BOUNDED and implementation-gated", () => {
  assert.equal(impact.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(impact.taskId, "P05F_W5_Q013_PREFLIGHT");
  assert.equal(impact.expectedDerivedGate, "SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.publicAuthorityCutover, false);
  assert.equal(impact.changeImpact.legalRouteSemanticsChanged, false);
  assert.equal(impact.changeImpact.affectedRoutes, "BOUNDED");
  assert.equal(impact.changeImpact.globalReleaseCheckpoint, false);

  const lane = validation.lanes.SHARED_RUNTIME_BOUNDED;
  assert.deepEqual(lane.map((gate) => gate.gateId), ["GLOBAL_CONTRACTS", "TARGETED_ROUTE_REPLAY"]);
  assert.equal(preflight.validationBoundary.fullRepositoryRegression, "FORBIDDEN_FOR_THIS_PREFLIGHT");
  assert.equal(preflight.validationBoundary.globalBrowserReplay, "FORBIDDEN_FOR_THIS_PREFLIGHT");
  assert.equal(preflight.preflightDecision.sourceAuthoritySufficientForQ013ImplementationPlanning, true);
  assert.equal(preflight.preflightDecision.previousSliceD0Satisfied, true);
  assert.equal(preflight.preflightDecision.runtimeCapabilityContractLocked, true);
  assert.equal(preflight.preflightDecision.sameSourceSiblingProtectionLocked, true);
  assert.equal(preflight.preflightDecision.nextTaskRequiresSeparateImplementationApproval, true);
  assert.equal(preflight.preflightDecision.nextTask, "P05F_W5DirectProductVerticalSlice013Implementation");
});
