import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  exactPatternGroupAuthoritySummary,
  enrichBrowserRowWithExactPatternGroups,
} from "../../tools/curriculum/pgc-r08-exact-pattern-group-authority.mjs";

const authority = JSON.parse(
  await readFile(
    "data/curriculum/public-generation/PGC-R08-A04-A03-A00.route-identity-expressibility-authority.json",
    "utf8",
  ),
);
const plan = JSON.parse(
  await readFile(
    "data/curriculum/public-generation/PGC-R08-A04-A03-A01.exact-pattern-group-binding-plan.json",
    "utf8",
  ),
);
const queue = JSON.parse(await readFile(plan.queuePath, "utf8"));
const binder = await readFile(
  "tools/curriculum/pgc-r08-exact-pattern-group-binder.mjs",
  "utf8",
);

function queueObjects() {
  const columns = Object.fromEntries(queue.rowColumns.map((name, index) => [name, index]));
  return queue.rows.map((sourceRow) =>
    enrichBrowserRowWithExactPatternGroups({
      routeIndex: sourceRow[columns.routeIndex],
      routeId: sourceRow[columns.routeId],
    }),
  );
}

test("A03 A01 consumes the frozen exact PatternGroup authority", () => {
  assert.equal(authority.decision.exactPatternGroupSelectionRepairAuthorized, true);
  assert.equal(authority.summary.failedExactPatternGroupSelectableRouteCount, 136);
  assert.equal(plan.targetRouteCount, 136);
  assert.equal(queue.rows.length, 136);
});

test("all 136 failed rows retain runtime identity and derive the actual rendered UI projection", () => {
  const rows = queueObjects();
  for (const row of rows) {
    assert.ok(row.publicPatternGroupIds.length > 0, row.routeId);
    assert.ok(Array.isArray(row.uiSelectablePatternGroupIds), row.routeId);
    assert.ok(Array.isArray(row.omittedRuntimePatternGroupIds), row.routeId);
    assert.ok(Array.isArray(row.baseProjectedRuntimePatternGroupIds), row.routeId);
  }
  const summary = exactPatternGroupAuthoritySummary();
  assert.equal(summary.routeCount, 1155);
  assert.equal(summary.applicationAliasGroupCount, 7);
  assert.equal(summary.applicationAliasRouteCount, 12);
  assert.ok(summary.basePatternGroupProjectedRouteCount > 0);
  assert.ok(summary.singletonRuntimeGroupOmittedRouteCount > 0);
});

test("application registries project runtime groups to rendered base buttons without relaxing route identity", () => {
  const rows = queueObjects();
  const w01Rows = rows.filter((row) =>
    row.publicPatternGroupIds.some((id) => id.startsWith("w01_app_")),
  );
  const w1Rows = rows.filter((row) =>
    row.publicPatternGroupIds.some((id) => id.startsWith("p01e_app_")),
  );
  const applicationVariantRows = rows.filter((row) =>
    row.publicPatternGroupIds.includes("pg_g3b_u04_consecutive_multiplication_application"),
  );

  assert.equal(w01Rows.length, 12);
  assert.ok(w1Rows.length > 0);
  assert.ok(applicationVariantRows.length > 0);
  for (const row of [...w01Rows, ...w1Rows]) {
    assert.ok(row.uiSelectablePatternGroupIds.every((id) => !id.startsWith("w01_app_") && !id.startsWith("p01e_app_")), row.routeId);
  }
  for (const row of applicationVariantRows) {
    assert.ok(row.uiSelectablePatternGroupIds.includes("pg_g3b_u04_consecutive_multiplication_numeric"), row.routeId);
    assert.ok(!row.uiSelectablePatternGroupIds.includes("pg_g3b_u04_consecutive_multiplication_application"), row.routeId);
  }
  assert.ok(rows.some((row) => row.omittedRuntimePatternGroupIds.length > 0));
});

test("binder selects exact rendered targets and projects route identity only after exact public state", () => {
  assert.match(binder, /uiSelectablePatternGroupIds/);
  assert.match(binder, /SELECT_EXACT_TARGET/);
  assert.match(binder, /DESELECT_NON_TARGET/);
  assert.match(binder, /exactPublicStateMatches/);
  assert.match(binder, /EXACT_ROUTE_IDENTITY_PROJECTED/);
  assert.match(binder, /input\.dataset\.capacityRouteIds = target\.routeId/);
  assert.doesNotMatch(binder, /first compatible/i);
  assert.doesNotMatch(binder, /pgc_r03_/);
  assert.equal(plan.repairContract.exactRouteIdentityProjectionRequiresExactPublicState, true);
  assert.equal(plan.repairContract.productMutationAllowed, false);
  assert.equal(plan.repairContract.perRoutePatchAllowed, false);
});
