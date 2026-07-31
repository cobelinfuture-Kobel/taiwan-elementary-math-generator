import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const plan = JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04-A03-A00.route-identity-expressibility-plan.json", "utf8"));
const readback = JSON.parse(await readFile(plan.readbackPath, "utf8"));
const tool = await readFile("tools/curriculum/materialize-pgc-r08-a04-a03-route-identity-expressibility.mjs", "utf8");
const temporaryWorkflowPath = ".github/workflows/pgc-r08-a04-a03-a00-route-identity-expressibility.yml";

test("A03 A00 terminal readback joins all 793 legal runtime routes", () => {
  assert.equal(plan.status, "PASS_ROUTE_IDENTITY_EXPRESSIBILITY_CLASSIFIED");
  assert.equal(readback.status, "PASS_ROUTE_IDENTITY_EXPRESSIBILITY_CLASSIFIED");
  assert.equal(readback.summary.legalRouteCount, 793);
  assert.equal(readback.summary.runtimeRegistryRouteMatchCount, 793);
  assert.equal(readback.summary.runtimeMetadataMismatchCount, 0);
  assert.equal(readback.summary.runtimePublicPatternGroupAgreementCount, 793);
});

test("A03 A00 classifies every binding failure as exact PatternGroup selectable", () => {
  assert.equal(readback.summary.failedRouteCount, 136);
  assert.equal(readback.repairPartition.EXACT_PUBLIC_PATTERN_GROUP_SELECTION_REQUIRED, 136);
  assert.equal(readback.repairPartition.PUBLIC_EQUIVALENCE_CLASS_REQUIRED, 0);
  assert.equal(readback.summary.failedRoutesDisambiguatedByPatternGroupsCount, 54);
  assert.equal(readback.policyDecision.exactPatternGroupSelectionRepairAuthorized, true);
  assert.equal(readback.policyDecision.publicEquivalenceAcceptanceAuthorized, false);
  assert.equal(readback.policyDecision.affectedFamilyReplayRouteCount, 136);
});

test("A03 A00 uses runtime PatternGroup identity and preserves authority boundaries", () => {
  assert.match(tool, /PUBLIC_GENERATOR_CAPACITY_ROWS/);
  assert.match(tool, /publicPatternGroupIds/);
  assert.match(tool, /ROUTE_BINDING_NOT_CONVERGED/);
  assert.equal(readback.policyDecision.productMutationAuthorized, false);
  assert.equal(readback.policyDecision.capacityAuthorityMutationAuthorized, false);
  assert.equal(readback.policyDecision.perRoutePatchAuthorized, false);
});

test("A03 A00 exact evidence and hashes are frozen", () => {
  assert.equal(readback.sourceEvidence.headSha, "5b8819025e4615d6440bc5e93faef96af4ae4e6a");
  assert.equal(readback.sourceEvidence.workflowRunId, 30605355751);
  assert.equal(readback.sourceEvidence.artifactId, 8783385941);
  assert.equal(readback.hashes.legalRouteIdsSha256, "cfc77f036ed47ac9a12012c6b57c97414ba937e78e3e0f03d7fd8d9b6452cbed");
  assert.equal(readback.hashes.failedRouteIdsSha256, "e0c0f758743c6c9669f0bc4de92af6dc52e4cd8354bb0e492550fed9341f34f6");
  assert.equal(readback.hashes.failedRouteExpressibilitySha256, "c83382036c86067f4cd91c8a1d06656cff1a74600a4141e9041c8ec43203f7a3");
});

test("A03 A00 temporary workflow is removed before merge", async () => {
  await assert.rejects(access(temporaryWorkflowPath));
  assert.equal(readback.temporaryWorkflowRemovedBeforeMerge, true);
});
