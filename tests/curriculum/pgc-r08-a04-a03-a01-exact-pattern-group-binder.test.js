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
const readback = JSON.parse(
  await readFile(
    "data/curriculum/public-generation/PGC-R08-A04-A03-A01.exact-pattern-group-binding-readback.json",
    "utf8",
  ),
);
const overlay = JSON.parse(
  await readFile(
    "data/curriculum/public-generation/PGC-R08-A04-A03-A01.downstream-reclassification-overlay.json",
    "utf8",
  ),
);
const activeState = JSON.parse(
  await readFile(
    "data/curriculum/public-generation/PGC-R08-A04.active-repair-state.json",
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

test("application registries project runtime aliases while current W3 groups retain explicit identity", () => {
  const rows = queueObjects();
  const w01Rows = rows.filter((row) =>
    row.publicPatternGroupIds.some((id) => id.startsWith("w01_app_")),
  );
  const w1Rows = rows.filter((row) =>
    row.publicPatternGroupIds.some((id) => id.startsWith("p01e_app_")),
  );
  const legacyApplicationVariantRows = rows.filter((row) =>
    row.publicPatternGroupIds.includes("pg_g3b_u04_consecutive_multiplication_application"),
  );

  assert.equal(w01Rows.length, 12);
  assert.ok(w1Rows.length > 0);
  assert.ok(legacyApplicationVariantRows.length > 0);
  for (const row of [...w01Rows, ...w1Rows]) {
    assert.ok(
      row.uiSelectablePatternGroupIds.every(
        (id) => !id.startsWith("w01_app_") && !id.startsWith("p01e_app_"),
      ),
      row.routeId,
    );
  }
  for (const row of legacyApplicationVariantRows) {
    assert.ok(
      row.uiSelectablePatternGroupIds.includes(
        "pg_g3b_u04_consecutive_multiplication_numeric",
      ),
      row.routeId,
    );
    assert.ok(
      !row.uiSelectablePatternGroupIds.includes(
        "pg_g3b_u04_consecutive_multiplication_application",
      ),
      row.routeId,
    );
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

test("A03 A01 terminal readback closes route binding and transfers only orthogonal failures", () => {
  assert.equal(plan.status, "PASS_136_ROUTE_BINDING_REPLAY_CLOSED");
  assert.equal(
    readback.status,
    "PASS_ROUTE_BINDING_FAMILY_CLOSED_WITH_9_ORTHOGONAL_TRANSFERS",
  );
  assert.equal(readback.replaySummary.targetRouteCount, 136);
  assert.equal(readback.replaySummary.terminalRouteCount, 136);
  assert.equal(readback.replaySummary.routeBindingResolvedCount, 136);
  assert.equal(readback.replaySummary.routeBindingStillFailedCount, 0);
  assert.equal(readback.replaySummary.fullNineGatePassCount, 127);
  assert.equal(readback.replaySummary.downstreamFailCount, 9);
  assert.equal(readback.replaySummary.browserConsoleErrorCount, 0);
  assert.equal(readback.replaySummary.browserPageErrorCount, 0);

  assert.equal(overlay.rows.length, 9);
  assert.equal(
    overlay.rows.filter((row) => row.toFailureFamily === "REGENERATE_IDENTITY_TIMEOUT").length,
    6,
  );
  assert.equal(
    overlay.rows.filter((row) => row.toFailureFamily === "CAPACITY_PROJECTION_SHORTFALL").length,
    3,
  );
  assert.ok(
    overlay.rows
      .filter((row) => row.toFailureFamily === "REGENERATE_IDENTITY_TIMEOUT")
      .every(
        (row) => row.remainingGateCode === "REGENERATE_PASS" && row.passedGateCodes.length === 8,
      ),
  );
  assert.deepEqual(
    overlay.rows
      .filter((row) => row.toFailureFamily === "CAPACITY_PROJECTION_SHORTFALL")
      .map((row) => row.projectedQuestionCount)
      .sort((left, right) => left - right),
    [8, 12, 12],
  );
});

test("active repair state advances to position 4 without double-counting capacity overlap", () => {
  assert.equal(activeState.status, "ACTIVE_AFTER_QUESTION_TYPE_STATE_SETTLEMENT_FAMILY_CLOSEOUT");
  assert.equal(activeState.current.cumulativePassRouteCount, 780);
  assert.equal(activeState.current.unresolvedFailedRouteCount, 13);
  assert.equal(activeState.current.closedOriginalFailureRouteCount, 324);
  assert.equal(activeState.reconciliation.pendingFailureFamiliesExcludingCapacityReconciliation, 10);
  assert.equal(activeState.reconciliation.activeCapacityShortfallRouteCount, 3);
  assert.equal(activeState.reconciliation.capacityReconciliationRouteCount, 38);
  assert.equal(activeState.reconciliation.capacityReconciliationOverlapWithPendingFailureCount, 3);
  assert.equal(activeState.reconciliation.nextRepairPosition, 4);
  assert.equal(
    activeState.reconciliation.nextTask,
    "PGC-R08-A04-A05_RegenerateIdentityTimeoutFocusedReproductionAnd10RouteRepair",
  );
  assert.equal(
    activeState.pendingFamilies.some(
      (family) => family.failureFamily === "ROUTE_BINDING_NOT_CONVERGED",
    ),
    false,
  );
  assert.equal(
    activeState.pendingFamilies.some(
      (family) => family.failureFamily === "QUESTION_TYPE_STATE_SETTLEMENT_TIMEOUT",
    ),
    false,
  );
});

test("temporary exact replay workflow is removed before merge", async () => {
  await assert.rejects(
    readFile(
      ".github/workflows/pgc-r08-a04-a03-a01-exact-pattern-group-replay.yml",
      "utf8",
    ),
    (error) => error?.code === "ENOENT",
  );
});
