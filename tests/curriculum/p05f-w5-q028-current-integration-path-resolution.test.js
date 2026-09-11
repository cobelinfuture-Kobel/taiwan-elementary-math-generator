import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";
import * as currentSelector from "../../site/modules/curriculum/registry/batch-a-selector-p05f27-extension.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(read(relativePath));
const resolution = readJson("data/curriculum/full-product/p05f/q028-g5a-u10a-solid-net-current-integration-path-resolution.json");

const SOURCE = "g5a_u10_5a10a";
const KP = "kp_g5a_u10a_solid_net_correspondence";
const REQUIRED_W5 = [
  "cap_geometry_construction",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
  "cap_solid_geometry_representation",
  "cap_spatial_solid_reasoning",
];

test("Q028 integration resolution binds the exact frozen queue row", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  assert.equal(queue.status, "W5_DIRECT_PRODUCT_VERTICAL_SLICE_QUEUE_FROZEN");
  assert.equal(queue.queueRegistryParity, true);
  const row = queue.queueEntries.find((entry) => entry.queuePosition === 28);
  assert.ok(row);
  assert.equal(row.sliceId, "p05e_q028_r2_g5a_u10_5a10a_profile_spatial_solid_c1");
  assert.equal(row.implementationTaskId, "P05F_W5DirectProductVerticalSlice028Implementation");
  assert.equal(row.previousSliceId, "p05e_q027_r2_g4b_u10_4b10_profile_spatial_solid_c1");
  assert.equal(row.primarySourceNodeId, SOURCE);
  assert.equal(row.primaryRuntimeProfileId, "profile_spatial_solid");
  assert.deepEqual(row.knowledgePointIds, [KP]);
  assert.deepEqual([...row.requiredW5CapabilityIds].sort(), [...REQUIRED_W5].sort());
  assert.equal(resolution.queueAuthority.sliceId, row.sliceId);
  assert.deepEqual(resolution.queueAuthority.knowledgePointIds, row.knowledgePointIds);
  assert.deepEqual([...resolution.queueAuthority.requiredW5CapabilityIds].sort(), [...row.requiredW5CapabilityIds].sort());
});

test("Q028 current selector baseline keeps solid-net hidden and preserves Q007 sourceUnit ownership boundary", () => {
  const availability = currentSelector.listBatchAKnowledgePointAvailabilityBySource(SOURCE);
  assert.ok(availability);
  assert.ok(availability.visibleKnowledgePointIds.includes("kp_g5a_u10a_solid_shape_classification"));
  assert.ok(availability.visibleKnowledgePointIds.includes("kp_g5a_u10a_prism_pyramid_elements"));
  assert.ok(availability.visibleKnowledgePointIds.includes("kp_g5a_u10a_solid_cross_section"));
  assert.ok(availability.hiddenPendingKnowledgePointIds.includes(KP));
  assert.ok(availability.notSelectableKnowledgePointIds.includes(KP));
  assert.equal(currentSelector.getVisibleBatchAKnowledgePoint(KP), null);
  assert.equal(resolution.integrationDecision.sourceUnitOwnershipKnowledgePointId, "kp_g5a_u10a_solid_shape_classification");
  assert.equal(resolution.integrationDecision.sourceUnitOwnershipTransferAllowed, false);
});

test("Q028 must advance the current cumulative selector and binding chain rather than fork from Q017", () => {
  const selectorAlias = read("site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js");
  const bindingAlias = read("site/modules/curriculum/public/public-ui-capability-binding-p04f33.js");
  const worksheetEntry = read("site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js");
  assert.match(selectorAlias, /batch-a-selector-p05f27-extension\.js/);
  assert.match(bindingAlias, /public-ui-capability-binding-p05f27\.js/);
  assert.match(worksheetEntry, /requestsP05F27/);
  assert.equal(resolution.integrationDecision.selectorStrategy, "CREATE_P05F28_EXTENSION_OVER_CURRENT_P05F27_CHAIN");
  assert.equal(resolution.integrationDecision.generatorStrategy, "CREATE_P05F28_GENERATOR_OVER_P05F27_AND_MATCH_ONLY_EXPLICIT_Q028_SELECTION");
  assert.equal(resolution.integrationDecision.worksheetStrategy, "CREATE_P05F28_WORKSHEET_EXTENSION_AND_DISPATCH_BEFORE_P05F27");
});

test("Q028 requires a dedicated solid-net renderer instead of widening the Q017 renderer implicitly", () => {
  const prismRenderer = read("site/modules/renderer/prism-pyramid-elements-diagram.js");
  const htmlRenderer = read("site/modules/renderer/html-renderer.js");
  assert.match(prismRenderer, /SOLID_CROSS_SECTION/);
  assert.doesNotMatch(prismRenderer, /SOLID_NET/);
  assert.doesNotMatch(htmlRenderer, /solid_net_correspondence_diagram/);
  assert.equal(resolution.integrationDecision.rendererStrategy, "DEDICATED_SOLID_NET_RENDERER_REQUIRED");
});

test("Q028 resolution preserves Q027 predecessor and forbids Q029 expansion", () => {
  const q027 = readJson("data/curriculum/full-product/p05f/q027-g4b-u10-layered-cube-volume-conservation-implementation.json");
  assert.equal(q027.taskId, "P05F_W5DirectProductVerticalSlice027Implementation");
  assert.equal(resolution.predecessorEvidence.q027ImplementationPr, 886);
  assert.equal(resolution.predecessorEvidence.q027ImplementationMergeSha, "3e7891427df879e3132375e55e6753ee386a204a");
  assert.equal(resolution.scopeGuard.q029OrLaterTouched, false);
  assert.equal(resolution.scopeGuard.frozenQueueAuthorityTouched, false);
  assert.equal(resolution.scopeGuard.r02AuthorityTouched, false);
  assert.equal(resolution.scopeGuard.r04AuthorityTouched, false);
});
