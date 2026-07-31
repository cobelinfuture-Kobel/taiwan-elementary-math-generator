import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const plan = JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04-A03-A00.route-identity-expressibility-plan.json", "utf8"));
const authority = JSON.parse(await readFile(plan.finalAuthorityPath, "utf8"));
const tool = await readFile("tools/curriculum/materialize-pgc-r08-a04-a03-route-identity-expressibility.mjs", "utf8");
const temporaryWorkflowPath = ".github/workflows/pgc-r08-a04-a03-a00-route-identity-expressibility.yml";

test("A03 A00 exact CI evidence joins all legal routes and classifies all binding failures", () => {
  assert.equal(plan.status, "PASS_ROUTE_IDENTITY_EXPRESSIBILITY_FROZEN");
  assert.equal(authority.sourceEvidence.headSha, "5b8819025e4615d6440bc5e93faef96af4ae4e6a");
  assert.equal(authority.sourceEvidence.workflowRunId, 30605355751);
  assert.equal(authority.sourceEvidence.artifactId, 8783385941);
  assert.equal(authority.summary.legalRouteCount, 793);
  assert.equal(authority.summary.runtimeRegistryRouteMatchCount, 793);
  assert.equal(authority.summary.runtimeMetadataMismatchCount, 0);
  assert.equal(authority.summary.failedRouteCount, 136);
});

test("A03 A00 proves exact PatternGroup selection is sufficient with no public equivalence class", () => {
  assert.equal(authority.summary.failedPublicFieldAmbiguousRouteCount, 54);
  assert.equal(authority.summary.failedPublicFieldUniqueRouteCount, 82);
  assert.equal(authority.summary.failedRoutesDisambiguatedByPatternGroupsCount, 54);
  assert.equal(authority.summary.failedExactPatternGroupSelectableRouteCount, 136);
  assert.equal(authority.summary.failedPublicEquivalenceClassRouteCount, 0);
  assert.equal(authority.decision.exactPatternGroupSelectionRepairAuthorized, true);
  assert.equal(authority.decision.publicEquivalenceAcceptanceAuthorized, false);
});

test("A03 A00 repair contract forbids greedy and per-route repairs", () => {
  assert.equal(authority.repairContract.enrichEveryBrowserRowWithPublicPatternGroupIds, true);
  assert.equal(authority.repairContract.selectExactPublicPatternGroupSet, true);
  assert.equal(authority.repairContract.greedyFirstCompatibleSelectionForbidden, true);
  assert.equal(authority.decision.productMutationAuthorized, false);
  assert.equal(authority.decision.perRoutePatchAuthorized, false);
  assert.match(tool, /PUBLIC_GENERATOR_CAPACITY_ROWS/);
});

test("A03 A00 temporary diagnostic workflow is removed before merge", async () => {
  await assert.rejects(access(temporaryWorkflowPath), (error) => error?.code === "ENOENT");
  assert.equal(authority.temporaryWorkflowRemovedBeforeMerge, true);
});
