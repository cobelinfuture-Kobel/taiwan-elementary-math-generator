import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const contract = readJson("data/curriculum/full-product/p05f/q029-g5a-u10a1-cube-cuboid-net-source-visual-pattern-contract.json");
const preflight = readJson("data/curriculum/full-product/p05f/q029-g5a-u10a1-cube-cuboid-net-source-derivation-preflight.json");
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");

const KP = "kp_g5a_u10a1_cube_cuboid_net";
const SOURCE = "g5a_u10_5a10a1";

test("Q029 visual contract preserves exact frozen source/KP/profile identity", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const row = queue.queueEntries.find((entry) => entry.queuePosition === 29);
  assert.ok(row);
  assert.equal(queue.queueFrozen, true);
  assert.equal(queue.queueRegistryParity, true);
  assert.equal(contract.queueAuthority.queueDigest, queue.derivedRegistrySnapshot.queueDigest);
  assert.equal(contract.queueAuthority.sliceId, row.sliceId);
  assert.equal(contract.queueAuthority.primarySourceNodeId, SOURCE);
  assert.equal(contract.queueAuthority.primaryRuntimeProfileId, "profile_spatial_solid");
  assert.deepEqual(contract.queueAuthority.knowledgePointIds, [KP]);
  assert.deepEqual(contract.queueAuthority.knowledgePointIds, preflight.queueAuthority.knowledgePointIds);
});

test("Q029 exact PDF visual readback admits only cube/cuboid net evidence from page 1", () => {
  assert.equal(contract.sourceAuthority.sourcePdfDriveFileId, "1LVpCn7I1t17SpWbwCXLfHjghTBQ7lwL5");
  assert.deepEqual(contract.sourceAuthority.reviewedPages, [1, 2]);
  assert.equal(contract.sourceAuthority.reviewMethod, "Q029_EXACT_PDF_RENDER_FULL_PAGE_VISUAL_CONFIRMATION");
  const p1 = contract.sourceAuthority.directVisualEvidence.page1;
  for (const panel of ["正方體的展開圖", "找出正確的長方體展開圖"]) {
    assert.ok(p1.observedPanels.includes(panel), panel);
  }
  for (const concept of [
    "VALID_CUBE_NET_STRUCTURES",
    "CUBE_NET_FACE_ADJACENCY_AFTER_FOLDING",
    "SELECT_VALID_CUBOID_NET_FROM_CANDIDATES",
    "CUBOID_NET_FOLDABILITY",
  ]) assert.ok(p1.q029DirectlySupportedConcepts.includes(concept), concept);
});

test("Q029 page-2 visual evidence is explicitly separated from surface-area viewpoint face-number and application semantics", () => {
  const p2 = contract.sourceAuthority.directVisualEvidence.page2;
  assert.deepEqual(p2.q029DirectlySupportedConcepts, []);
  for (const guard of [
    "SURFACE_AREA_IS_NOT_Q029",
    "VIEWPOINT_COLOR_MAPPING_IS_NOT_Q029",
    "DICE_OPPOSITE_FACE_NUMBER_RELATION_IS_NOT_Q029",
    "APPLICATION_MEASUREMENT_IS_NOT_Q029",
  ]) assert.ok(p2.scopeSeparationEvidence.includes(guard), guard);
  assert.equal(contract.semanticContract.surfaceAreaRelationsAllowed, false);
  assert.equal(contract.semanticContract.volumeRelationsAllowed, false);
  assert.equal(contract.semanticContract.viewpointRepresentationAllowed, false);
  assert.equal(contract.semanticContract.faceNumberOrColorAssignmentAllowed, false);
  assert.equal(contract.semanticContract.applicationContextImplementationAllowed, false);
});

test("Q029 binds the exact R02 cube/cuboid-net capability and invariant", () => {
  const source = r02.sourceRecords.find((row) => row.sourceNodeId === SOURCE);
  assert.ok(source);
  const candidate = source.candidates.find((row) => row.knowledgePointId === KP);
  assert.ok(candidate);
  assert.equal(contract.r02ReviewedCandidateAuthority.canonicalNameZh, candidate.canonicalNameZh);
  assert.equal(contract.r02ReviewedCandidateAuthority.capabilityStatement, candidate.capabilityStatement);
  assert.equal(contract.r02ReviewedCandidateAuthority.reasoningInvariant, candidate.reasoningInvariant);
  assert.equal(candidate.capabilityStatement, "學生能判斷或完成可摺成立體的展開圖。");
  assert.equal(candidate.reasoningInvariant, "六個面摺疊後不得重疊且所有相鄰邊正確接合。");
});

test("Q029 PatternContract is bounded to three net tasks with direct-vs-derived evidence declared", () => {
  const specs = contract.patternContract.patternSpecs;
  assert.equal(specs.length, 3);
  assert.deepEqual(specs.map((row) => row.patternSpecId), [
    "ps_g5a_u10a1_cube_net_foldability",
    "ps_g5a_u10a1_cuboid_net_foldability",
    "ps_g5a_u10a1_cube_cuboid_net_completion",
  ]);
  assert.equal(specs[0].evidenceClass, "DIRECT_VISUAL_SOURCE_SUPPORTED");
  assert.equal(specs[1].evidenceClass, "DIRECT_VISUAL_SOURCE_SUPPORTED");
  assert.equal(specs[2].evidenceClass, "R02_CAPABILITY_AND_REASONING_INVARIANT_SUPPORTED");
  assert.equal(specs[2].sourceShowsMissingFaceGeometryCompletionDirectly, false);
  assert.equal(specs[2].derivedCompletionAllowed, true);
  assert.equal(contract.patternContract.questionMode, "diagram");
  assert.equal(contract.patternContract.maxQuestionCount, 240);
});

test("Q029 validator and implementation boundaries stay fail-closed and planning-only", () => {
  assert.equal(contract.validatorContract.failClosed, true);
  assert.equal(contract.validatorContract.genericFallbackAllowed, false);
  assert.equal(contract.validatorContract.freeFormAIAllowed, false);
  for (const check of [
    "EXACT_SIX_FACE_TOPOLOGY",
    "NO_OVERLAP_FOR_VALID_NET",
    "REQUIRED_EDGE_ADJACENCY_CLOSURE",
    "CUBOID_OPPOSITE_FACE_DIMENSION_COMPATIBILITY",
  ]) assert.ok(contract.validatorContract.requiredChecks.includes(check), check);
  assert.equal(contract.scopeGuard.q028SolidNetSemanticsTouched, false);
  assert.equal(contract.scopeGuard.q038CubeCuboidSpatialReasoningTouched, false);
  assert.equal(contract.implementationBoundary.generatorMaterializedByThisMilestone, false);
  assert.equal(contract.implementationBoundary.rendererMaterializedByThisMilestone, false);
  assert.equal(contract.implementationBoundary.worksheetMaterializedByThisMilestone, false);
  assert.equal(contract.implementationBoundary.publicCutoverPerformedByThisMilestone, false);
  assert.equal(contract.implementationBoundary.implementationAllowedByThisMilestone, false);
  assert.equal(contract.nextTaskRequiresSeparateImplementationApproval, true);
});
