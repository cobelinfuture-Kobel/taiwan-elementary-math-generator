import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(read(relativePath));

const RESOLUTION_PATH = "data/curriculum/full-product/p05f/q029-g5a-u10a1-cube-cuboid-net-current-integration-path-resolution.json";
const resolution = readJson(RESOLUTION_PATH);
const KP = "kp_g5a_u10a1_cube_cuboid_net";
const SOURCE = "g5a_u10_5a10a1";

test("Q029 current integration resolution preserves exact frozen identity and predecessor", () => {
  assert.equal(resolution.status, "CURRENT_INTEGRATION_PATH_RESOLVED");
  assert.equal(resolution.queueAuthority.queuePosition, 29);
  assert.equal(resolution.queueAuthority.sliceId, "p05e_q029_r2_g5a_u10_5a10a1_profile_spatial_solid_c1");
  assert.equal(resolution.queueAuthority.previousSliceId, "p05e_q028_r2_g5a_u10_5a10a_profile_spatial_solid_c1");
  assert.equal(resolution.queueAuthority.primarySourceNodeId, SOURCE);
  assert.equal(resolution.queueAuthority.primaryRuntimeProfileId, "profile_spatial_solid");
  assert.deepEqual(resolution.queueAuthority.knowledgePointIds, [KP]);
});

test("Q029 resolves from the actual current P05F28 selector and capability aliases", () => {
  const selectorAlias = read("site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js");
  const capabilityAlias = read("site/modules/curriculum/public/public-ui-capability-binding-p04f33.js");
  assert.match(selectorAlias, /batch-a-selector-p05f28-extension\.js/);
  assert.match(capabilityAlias, /public-ui-capability-binding-p05f28\.js/);
  assert.equal(resolution.currentIntegrationBaseline.legacyBrowserSelectorAliasCurrentlyTargets, "site/modules/curriculum/registry/batch-a-selector-p05f28-extension.js");
  assert.equal(resolution.currentIntegrationBaseline.legacyBrowserCapabilityAliasCurrentlyTargets, "site/modules/curriculum/public/public-ui-capability-binding-p05f28.js");
});

test("Q029 dedicated renderer decision prevents Q028 semantic widening", () => {
  const q028Renderer = read("site/modules/renderer/solid-net-correspondence-diagram.js");
  assert.match(q028Renderer, /\["PRISM","PYRAMID","CYLINDER","CONE"\]/);
  assert.doesNotMatch(q028Renderer, /"CUBE"/);
  assert.doesNotMatch(q028Renderer, /"CUBOID"/);
  assert.equal(resolution.reuseAssessment.q028SolidNetRendererReusableWithoutMutation, false);
  assert.equal(resolution.reuseAssessment.dedicatedQ029RendererRequired, true);
  assert.equal(resolution.integrationDecision.rendererStrategy, "CREATE_DEDICATED_CUBE_CUBOID_NET_RENDERER_AND_ADD_EXACT_HTML_DISPATCH");
});

test("Q029 integration plan remains bounded and protects existing product semantics", () => {
  assert.equal(resolution.integrationDecision.selectorStrategy, "CREATE_P05F29_EXTENSION_OVER_CURRENT_P05F28_CHAIN");
  assert.equal(resolution.integrationDecision.sourceUnitOwnershipTransferAllowed, false);
  assert.equal(resolution.integrationDecision.sameUnitMixedAdmission, false);
  assert.equal(resolution.integrationDecision.crossUnitMixedAdmission, false);
  assert.equal(resolution.integrationDecision.genericFallbackAllowed, false);
  assert.equal(resolution.integrationDecision.freeFormAIAllowed, false);
  for (const key of [
    "q008ElementIdentityTouched",
    "q018EdgeLengthTouched",
    "q018FaceRelationshipTouched",
    "q028SolidNetSemanticsTouched",
    "q038CubeCuboidSpatialReasoningTouched",
    "surfaceAreaTouched",
    "volumeTouched",
    "viewpointTouched",
    "applicationContextTouched",
    "frozenQueueAuthorityTouched",
    "r02AuthorityTouched",
    "r04AuthorityTouched"
  ]) assert.equal(resolution.scopeGuard[key], false, key);
});
