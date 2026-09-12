import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import { materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const preflight = readJson("data/curriculum/full-product/p05f/q029-g5a-u10a1-cube-cuboid-net-source-derivation-preflight.json");
const q028 = readJson("data/curriculum/full-product/p05f/q028-g5a-u10a-solid-net-source-semantic-pattern-contract.json");
const q008 = readJson("data/curriculum/full-product/p05f/q008-g5a-u10a1-cube-cuboid-faces-edges-vertices-source-authority-preflight.json");
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");

const SOURCE = "g5a_u10_5a10a1";
const KP = "kp_g5a_u10a1_cube_cuboid_net";
const REQUIRED_W5 = [
  "cap_geometry_construction",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
  "cap_solid_geometry_representation",
  "cap_spatial_solid_reasoning",
];

test("Q029 derivation binds the exact frozen queue-position-29 row", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status, "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueRegistryParity, true);
  assert.equal(queue.queueFrozen, true);
  const row = queue.queueEntries.find((entry) => entry.queuePosition === 29);
  assert.ok(row);
  assert.equal(row.sliceId, "p05e_q029_r2_g5a_u10_5a10a1_profile_spatial_solid_c1");
  assert.equal(row.implementationTaskId, "P05F_W5DirectProductVerticalSlice029Implementation");
  assert.equal(row.previousSliceId, "p05e_q028_r2_g5a_u10_5a10a_profile_spatial_solid_c1");
  assert.equal(row.primarySourceNodeId, SOURCE);
  assert.deepEqual(row.supportingSourceNodeIds, [SOURCE]);
  assert.equal(row.intraWavePrerequisiteRank, 2);
  assert.equal(row.primaryRuntimeProfileId, "profile_spatial_solid");
  assert.equal(row.chunkIndex, 1);
  assert.equal(row.knowledgePointCount, 1);
  assert.deepEqual(row.knowledgePointIds, [KP]);
  assert.deepEqual([...row.requiredW5CapabilityIds].sort(), [...REQUIRED_W5].sort());
  assert.equal(row.targetEvidenceLevel, "E6_D0_COMPLETE");
  assert.equal(preflight.queueAuthority.queueDigest, queue.derivedRegistrySnapshot.queueDigest);
  assert.equal(preflight.queueAuthority.sliceId, row.sliceId);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds, row.knowledgePointIds);
  assert.deepEqual([...preflight.queueAuthority.requiredW5CapabilityIds].sort(), [...row.requiredW5CapabilityIds].sort());
});

test("Q029 source derives uniquely from Q028 deferred ownership plus R02 source binding", () => {
  assert.equal(q028.semanticContract.deferredQueuePosition, 29);
  assert.equal(q028.semanticContract.deferredKnowledgePointId, KP);
  assert.deepEqual(q028.semanticContract.explicitlyDeferredSolidFamilies, ["CUBE", "CUBOID"]);
  const source = r02.sourceRecords.find((row) => row.sourceNodeId === SOURCE);
  assert.ok(source);
  const candidate = source.candidates.find((row) => row.knowledgePointId === KP);
  assert.ok(candidate);
  assert.equal(candidate.canonicalNameZh, "正方體長方體展開圖");
  assert.equal(candidate.capabilityStatement, "學生能判斷或完成可摺成立體的展開圖。");
  assert.equal(candidate.reasoningInvariant, "六個面摺疊後不得重疊且所有相鄰邊正確接合。");
  assert.deepEqual(candidate.evidencePages, [1, 2]);
  assert.equal(preflight.r02ReviewedCandidateAuthority.sourceNodeId, SOURCE);
  assert.equal(preflight.r02ReviewedCandidateAuthority.knowledgePointId, KP);
  assert.equal(preflight.r02ReviewedCandidateAuthority.reasoningInvariant, candidate.reasoningInvariant);
});

test("Q029 reuses verified G5A-U10a1 source identity and preserves the known non-blocking header alias", () => {
  assert.equal(q008.sourceAuthority.sourceNodeId, SOURCE);
  assert.equal(q008.sourceAuthority.sourcePdfDriveFileId, "1LVpCn7I1t17SpWbwCXLfHjghTBQ7lwL5");
  assert.equal(q008.sourceAuthority.sourceIdentityAnomaly.sourceRefAmbiguity, false);
  assert.equal(preflight.sourceAuthority.sourceNodeId, q008.sourceAuthority.sourceNodeId);
  assert.equal(preflight.sourceAuthority.sourcePdfDriveFileId, q008.sourceAuthority.sourcePdfDriveFileId);
  assert.equal(preflight.sourceAuthority.sourceMetadataDriveFileId, q008.sourceAuthority.sourceMetadataDriveFileId);
  assert.equal(preflight.sourceAuthority.verificationNotesDriveFileId, q008.sourceAuthority.verificationNotesDriveFileId);
  assert.equal(preflight.sourceAuthority.sourceIdentityReuse.sourceRefAmbiguity, false);
  assert.equal(preflight.preflightDecision.manualSourceChoiceRequired, false);
  assert.equal(preflight.preflightDecision.sourceRefAmbiguity, false);
});

test("Q029 maps to spatial-solid plus construction modifier and exact frozen W5 capability closure", () => {
  const r04 = materializeR04SharedRuntimeCapabilityMatrix();
  const mapping = r04.getMapping(KP);
  assert.ok(mapping);
  assert.equal(mapping.primaryRuntimeProfileId, "profile_spatial_solid");
  assert.equal(mapping.classificationRuleId, "rule_spatial_solid");
  assert.ok(mapping.appliedModifierIds.includes("mod_geometry_construction"));
  for (const id of [
    "cap_spatial_solid_reasoning",
    "cap_geometry_domain_validator",
    "cap_solid_geometry_representation",
    "cap_geometry_construction",
    "cap_geometry_property_reasoning",
  ]) assert.ok(mapping.requiredRuntimeCapabilityIds.includes(id), id);
  assert.deepEqual([...preflight.runtimeCapabilityAuthority.exactFrozenQueueRequiredW5CapabilityIds].sort(), [...REQUIRED_W5].sort());
});

test("Q029 derivation remains planning-only and does not widen Q028 or sibling G5A-U10a1 semantics", () => {
  assert.deepEqual(preflight.scopeLock.includedKnowledgePointIds, [KP]);
  assert.deepEqual(preflight.scopeLock.excludedSameSourceKnowledgePointIds, ["kp_g5a_u10a1_cube_cuboid_spatial_reasoning"]);
  assert.equal(preflight.scopeLock.q028SolidNetSemanticsMustRemainUnchanged, true);
  assert.equal(preflight.scopeLock.sourceUnitOwnershipTransferAllowed, false);
  assert.equal(preflight.scopeLock.applicationImplementationAllowedByThisPreflight, false);
  assert.equal(preflight.scopeLock.implementationAllowedByThisPreflight, false);
  assert.equal(preflight.scopeLock.publicProductAdmissionAllowedByThisPreflight, false);
  assert.equal(preflight.sourceAuthority.exactQ029PdfVisualConfirmationPerformedByThisMilestone, false);
  assert.equal(preflight.preflightDecision.exactQ029PdfVisualConfirmationStillRequiredBeforePatternContract, true);
});
