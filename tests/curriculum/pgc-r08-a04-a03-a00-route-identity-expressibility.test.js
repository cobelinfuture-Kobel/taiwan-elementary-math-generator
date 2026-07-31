import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const plan = JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04-A03-A00.route-identity-expressibility-plan.json", "utf8"));
const tool = await readFile("tools/curriculum/materialize-pgc-r08-a04-a03-route-identity-expressibility.mjs", "utf8");
const workflow = await readFile(".github/workflows/pgc-r08-a04-a03-a00-route-identity-expressibility.yml", "utf8");

test("A03 A00 freezes the 793 legal routes and 136 binding failures", () => {
  assert.equal(plan.frozenCounts.legalRouteCount, 793);
  assert.equal(plan.frozenCounts.routeBindingFailureCount, 136);
  assert.equal(plan.acceptance.runtimeRegistryRouteMatchCount, 793);
  assert.equal(plan.acceptance.runtimeMetadataMismatchCount, 0);
  assert.equal(plan.acceptance.failedRouteClassifiedCount, 136);
});

test("A03 A00 uses runtime PatternGroup identity and active repair authority", () => {
  assert.match(tool, /PUBLIC_GENERATOR_CAPACITY_ROWS/);
  assert.match(tool, /publicPatternGroupIds/);
  assert.match(tool, /ROUTE_BINDING_NOT_CONVERGED/);
  assert.match(tool, /EXACT_PUBLIC_PATTERN_GROUP_SELECTION_REQUIRED/);
  assert.match(tool, /PUBLIC_EQUIVALENCE_CLASS_REQUIRED/);
});

test("A03 A00 is diagnostic-only and the temporary workflow is read-only", () => {
  assert.equal(plan.boundaries.publicUiMutationAllowed, false);
  assert.equal(plan.boundaries.browserHarnessMutationAllowed, false);
  assert.equal(plan.boundaries.capacityAuthorityMutationAllowed, false);
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
  assert.match(workflow, /upload-artifact@v4/);
  assert.doesNotMatch(workflow, /git push|git commit/);
});
