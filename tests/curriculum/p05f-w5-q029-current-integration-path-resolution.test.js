import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import * as currentSelector from "../../site/modules/curriculum/registry/batch-a-selector-p05f28-extension.js";
import { G5A_U10A_P05F28_DEFERRED_SOLID_FAMILIES, G5A_U10A_P05F28_PATTERN_SPECS } from "../../site/modules/curriculum/registry/g5a-u10a-solid-net-correspondence-selector-projection-p05f28.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(read(relativePath));
const resolution = readJson("data/curriculum/full-product/p05f/q029-g5a-u10a1-cube-cuboid-net-current-integration-path-resolution.json");
const patternContract = readJson("data/curriculum/full-product/p05f/q029-g5a-u10a1-cube-cuboid-net-source-visual-pattern-contract.json");

const SOURCE = "g5a_u10_5a10a1";
const KP = "kp_g5a_u10a1_cube_cuboid_net";
const REQUIRED_W5 = [
  "cap_geometry_construction",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
  "cap_solid_geometry_representation",
  "cap_spatial_solid_reasoning",
];

test("Q029 integration resolution binds the exact frozen queue row", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status, "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueRegistryParity, true);
  const row = queue.queueEntries.find((entry) => entry.queuePosition === 29);
  assert.ok(row);
  assert.equal(row.sliceId, "p05e_q029_r2_g5a_u10_5a10a1_profile_spatial_solid_c1");
  assert.equal(row.implementationTaskId, "P05F_W5DirectProductVerticalSlice029Implementation");
  assert.equal(row.previousSliceId, "p05e_q028_r2_g5a_u10_5a10a_profile_spatial_solid_c1");
  assert.equal(row.primarySourceNodeId, SOURCE);
  assert.equal(row.primaryRuntimeProfileId, "profile_spatial_solid");
  assert.deepEqual(row.knowledgePointIds, [KP]);
  assert.deepEqual([...row.requiredW5CapabilityIds].sort(), [...REQUIRED_W5].sort());
  assert.equal(resolution.queueAuthority.sliceId, row.sliceId);
  assert.deepEqual(resolution.queueAuthority.knowledgePointIds, row.knowledgePointIds);
});

test("Q029 current selector baseline keeps the target hidden while reusing the existing source owner", () => {
  assert.equal(currentSelector.getVisibleBatchAKnowledgePoint(KP), null);
  assert.equal(resolution.sourceAndPatternAuthority.sourceCatalogMutationRequired, false);
  assert.equal(resolution.sourceAndPatternAuthority.sourceUnitExistingOwnerKnowledgePointId, "kp_g5a_u10a1_cube_cuboid_faces_edges_vertices");
  assert.equal(resolution.sourceAndPatternAuthority.sourceUnitOwnershipTransferAllowed, false);
});

test("Q029 advances the current P05F28 chain and dispatches before Q028", () => {
  const selectorAlias = read("site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js");
  const bindingAlias = read("site/modules/curriculum/public/public-ui-capability-binding-p04f33.js");
  const worksheetEntry = read("site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js");
  assert.match(selectorAlias, /batch-a-selector-p05f28-extension\\.js/);
  assert.match(bindingAlias, /public-ui-capability-binding-p05f28\\.js/);
  assert.match(worksheetEntry, /requestsP05F28/);
  assert.equal(resolution.integrationDecision.selectorStrategy, "CREATE_P05F29_EXTENSION_OVER_CURRENT_P05F28_CHAIN");
  assert.equal(resolution.integrationDecision.generatorStrategy, "CREATE_P05F29_GENERATOR_OVER_P05F28_AND_MATCH_ONLY_EXPLICIT_Q029_SELECTION");
  assert.equal(resolution.integrationDecision.worksheetStrategy, "CREATE_P05F29_WORKSHEET_EXTENSION_AND_DISPATCH_BEFORE_P05F28");
});

test("Q029 requires dedicated cube/cuboid-net semantics rather than widening Q028", () => {
  assert.deepEqual([...G5A_U10A_P05F28_DEFERRED_SOLID_FAMILIES].sort(), ["CUBE", "CUBOID"].sort());
  assert.ok(G5A_U10A_P05F28_PATTERN_SPECS.every((row) => row.cubeCuboidNetAllowed === false));
  assert.equal(resolution.integrationDecision.q028RendererDirectSemanticReuseAllowed, false);
  assert.equal(resolution.integrationDecision.rendererStrategy, "DEDICATED_CUBE_CUBOID_NET_RENDERER_REQUIRED");
  assert.deepEqual(patternContract.semanticContract.allowedSolidFamilies, ["CUBE", "CUBOID"]);
  assert.equal(patternContract.rendererDataContract.diagramKind, "CUBE_CUBOID_NET");
  assert.equal(patternContract.rendererDataContract.transformMayNotChangeTopologicalAnswer, true);
});

test("Q029 preserves predecessor and all excluded semantic owners", () => {
  assert.equal(resolution.predecessorEvidence.q028ImplementationPr, 889);
  assert.equal(resolution.predecessorEvidence.q028ImplementationMergeSha, "87c26b43c48832976bd63ba6d8dfff57116c278f");
  assert.equal(resolution.scopeGuard.q008ElementIdentityTouched, false);
  assert.equal(resolution.scopeGuard.q018EdgeLengthTouched, false);
  assert.equal(resolution.scopeGuard.q018FaceRelationshipTouched, false);
  assert.equal(resolution.scopeGuard.q028SolidNetSemanticsTouched, false);
  assert.equal(resolution.scopeGuard.q038CubeCuboidSpatialReasoningTouched, false);
  assert.equal(resolution.scopeGuard.surfaceAreaTouched, false);
  assert.equal(resolution.scopeGuard.volumeTouched, false);
  assert.equal(resolution.scopeGuard.viewpointTouched, false);
  assert.equal(resolution.scopeGuard.applicationContextTouched, false);
  assert.equal(resolution.scopeGuard.frozenQueueAuthorityTouched, false);
  assert.equal(resolution.scopeGuard.r02AuthorityTouched, false);
  assert.equal(resolution.scopeGuard.r04AuthorityTouched, false);
});
