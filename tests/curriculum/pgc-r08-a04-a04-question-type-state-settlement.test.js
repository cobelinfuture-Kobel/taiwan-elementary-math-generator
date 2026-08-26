import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { buildQuestionTypeStateBootstrapUrl } from "../../tools/curriculum/pgc-r08-question-type-state-bootstrap.mjs";
import {
  exactPublicPatternGroupIdsForRoute,
  uiSelectablePatternGroupIdsForRoute,
} from "../../tools/curriculum/pgc-r08-exact-pattern-group-authority.mjs";
import { parseQueryState } from "../../site/assets/browser/state/query-state.js";

const plan = JSON.parse(await readFile(
  "data/curriculum/public-generation/PGC-R08-A04-A04.question-type-state-settlement-plan.json",
  "utf8",
));
const activeState = JSON.parse(await readFile(plan.activeStatePath, "utf8"));
const queue = JSON.parse(await readFile(plan.queuePath, "utf8"));
const readback = JSON.parse(await readFile(plan.readbackPath, "utf8"));
const overlay = JSON.parse(await readFile(plan.downstreamOverlayPath, "utf8"));
const bootstrapSource = await readFile(
  "tools/curriculum/pgc-r08-question-type-state-bootstrap.mjs",
  "utf8",
);
const runnerSource = await readFile(
  "tools/curriculum/run-pgc-r08-a04-a04-question-type-state-settlement-replay.mjs",
  "utf8",
);
const authoritySource = await readFile(
  "tools/curriculum/pgc-r08-exact-pattern-group-authority.mjs",
  "utf8",
);
const queryStateSource = await readFile(
  "site/assets/browser/state/query-state.js",
  "utf8",
);
const temporaryWorkflowPath = ".github/workflows/pgc-r08-a04-a04-question-type-state-settlement-replay.yml";

test("A04 closes the immutable nine-route settlement queue and later active state advances to terminal reconciliation", () => {
  assert.equal(queue.failureFamily, "QUESTION_TYPE_STATE_SETTLEMENT_TIMEOUT");
  assert.equal(queue.rows.length, 9);
  assert.equal(plan.targetRouteCount, 9);
  assert.equal(new Set(queue.rows.map((row) => row[1])).size, 9);
  assert.deepEqual(
    [...new Set(queue.rows.map((row) => row[1].split("_").slice(2, 5).join("_")))].sort(),
    ["g3a_u08_3a08", "g3b_u07_3b07", "g4b_u06_4b06", "g5a_u04_5a04"],
  );
  const family = activeState.closedFamilies.find(
    (entry) => entry.failureFamily === "QUESTION_TYPE_STATE_SETTLEMENT_TIMEOUT",
  );
  assert.ok(family);
  assert.equal(family.originalRouteCount, 9);
  assert.equal(family.endToEndPassCount, 8);
  assert.equal(family.transferredRouteCount, 1);
  assert.equal(activeState.reconciliation.nextRepairPosition, 6);
  assert.equal(activeState.reconciliation.terminal, true);
  assert.equal(activeState.reconciliation.nextTask, null);
});

test("nine explicit W3 application routes retain their runtime PatternGroup IDs in the UI projection", () => {
  for (const row of queue.rows) {
    const routeId = row[1];
    const runtimeIds = exactPublicPatternGroupIdsForRoute(routeId);
    const uiIds = uiSelectablePatternGroupIdsForRoute(routeId);
    assert.deepEqual(uiIds, runtimeIds, routeId);
    assert.ok(runtimeIds.length >= 1, routeId);
    assert.ok(runtimeIds.every((id) => id.endsWith("_application")), routeId);
    assert.ok(uiIds.every((id) => !id.endsWith("_numeric")), routeId);
  }
});

test("current W3 query-state parser preserves application controls and application PatternGroups", () => {
  const fixtures = [
    { sourceId: "g3a_u08_3a08", knowledgePointId: "kp_g3a_u08_same_denominator_compare", patternGroupId: "pg_g3a_u08_same_denominator_compare_application" },
    { sourceId: "g3b_u07_3b07", knowledgePointId: "kp_g3b_u07_fraction_unit_conversion", patternGroupId: "pg_g3b_u07_fraction_unit_conversion_application" },
    { sourceId: "g4b_u06_4b06", knowledgePointId: "kp_g4b_u06_one_decimal_times_integer", patternGroupId: "pg_g4b_u06_one_decimal_times_integer_application" },
    { sourceId: "g5a_u04_5a04", knowledgePointId: "kp_g5a_u04_quotient_as_fraction_context", patternGroupId: "pg_g5a_u04_quotient_as_fraction_context_application" },
  ];

  for (const fixture of fixtures) {
    const params = new URLSearchParams({ sourceId: fixture.sourceId, selectionMode: "singleKnowledgePoint", questionMode: "application", contextMode: "global_primary" });
    params.append("kp", fixture.knowledgePointId);
    params.append("pg", fixture.patternGroupId);
    const parsed = parseQueryState(`?${params}`);
    assert.equal(parsed.sourceId, fixture.sourceId);
    assert.equal(parsed.selectionMode, "singleKnowledgePoint");
    assert.deepEqual(parsed.selectedKnowledgePointIds, [fixture.knowledgePointId]);
    assert.deepEqual(parsed.selectedPatternGroupIds, [fixture.patternGroupId]);
    assert.equal(parsed.questionMode, "application");
    assert.equal(parsed.contextMode, "global_primary");
  }
});

test("canonical bootstrap materializes the complete initial public state before navigation", () => {
  const url = buildQuestionTypeStateBootstrapUrl("http://127.0.0.1:4196/index.html?existing=1", {
    routeIndex: 54,
    routeId: "sample-route",
    sourceId: "g3a_u08_3a08",
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: ["kp_b", "kp_a", "kp_a"],
    uiSelectablePatternGroupIds: ["pg_b_application", "pg_a_application", "pg_a_application"],
    questionType: "application",
    depthMode: "N",
    contextMode: "daily_life",
    requestedQuestionCount: 20,
  });
  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get("existing"), "1");
  assert.equal(parsed.searchParams.get("sourceId"), "g3a_u08_3a08");
  assert.equal(parsed.searchParams.get("selectionMode"), "mixedKnowledgePointsSameUnit");
  assert.equal(parsed.searchParams.get("questionMode"), "application");
  assert.equal(parsed.searchParams.get("depthMode"), "N");
  assert.equal(parsed.searchParams.get("contextMode"), "daily_life");
  assert.deepEqual(parsed.searchParams.getAll("kp"), ["kp_a", "kp_b"]);
  assert.deepEqual(parsed.searchParams.getAll("pg"), ["pg_a_application", "pg_b_application"]);
  assert.equal(parsed.searchParams.get("questionCount"), "20");
});

test("repair is one shared query-state reconciliation and does not extend timeouts or patch routes", () => {
  assert.match(bootstrapSource, /CANONICAL_QUERY_STATE_BOOTSTRAPPED/);
  assert.match(bootstrapSource, /questionMode/);
  assert.match(bootstrapSource, /uiSelectablePatternGroupIds/);
  assert.doesNotMatch(bootstrapSource, /waitForTimeout/);
  assert.doesNotMatch(bootstrapSource, /pgc_r03_/);
  assert.match(authoritySource, /basePatternGroupId/);
  assert.match(authoritySource, /UI_GROUP_BY_APPLICATION_ALIAS/);
  assert.match(authoritySource, /CURRENT_W3_SOURCE_IDS/);
  assert.match(authoritySource, /legacyRenderedBasePatternGroupId/);
  assert.match(queryStateSource, /batch-a-selector-(?:p03f\d+|p04f1)-extension/);
  assert.match(queryStateSource, /getFullProductPublicControlProfile/);
  assert.match(queryStateSource, /normalizeFullProductPublicControlValue/);
  assert.doesNotMatch(queryStateSource, /getFifteenUnitPublicControlProfile/);
  assert.match(runnerSource, /wrapBrowserWithExactPatternGroupBinder/);
  assert.match(runnerSource, /wrapBrowserWithDisabledCurrentValueSelectionPolicy/);
  assert.match(runnerSource, /wrapBrowserWithQuestionTypeStateBootstrap/);
  assert.equal(plan.repairContract.timeoutExtensionForbidden, true);
  assert.equal(plan.repairContract.queryStateConsumerMutationAllowed, true);
  assert.deepEqual(plan.repairContract.productMutationScope, ["site/assets/browser/state/query-state.js"]);
  assert.equal(plan.repairContract.resolverMutationAllowed, false);
  assert.equal(plan.repairContract.capacityAuthorityMutationAllowed, false);
  assert.equal(plan.repairContract.historicalQueueMutationAllowed, false);
  assert.equal(plan.repairContract.perRoutePatchAllowed, false);
});

test("terminal readback closes state settlement and transfers one orthogonal regenerate failure", () => {
  assert.equal(plan.status, "PASS_QUESTION_TYPE_STATE_SETTLEMENT_FAMILY_CLOSED");
  assert.equal(readback.status, "PASS_QUESTION_TYPE_STATE_SETTLEMENT_FAMILY_CLOSED_WITH_1_REGENERATE_TRANSFER");
  assert.equal(readback.sourceEvidence.workflowRunId, 30626667157);
  assert.equal(readback.sourceEvidence.artifactId, 8791684671);
  assert.equal(readback.replaySummary.targetRouteCount, 9);
  assert.equal(readback.replaySummary.terminalRouteCount, 9);
  assert.equal(readback.replaySummary.uiOptionsPassCount, 9);
  assert.equal(readback.replaySummary.questionTypeStateSettlementResidualCount, 0);
  assert.equal(readback.replaySummary.fullNineGatePassCount, 8);
  assert.equal(readback.replaySummary.downstreamFailCount, 1);
  assert.equal(readback.replaySummary.disabledValueMismatchDispositionCount, 0);
  assert.equal(readback.replaySummary.browserConsoleErrorCount, 0);
  assert.equal(readback.replaySummary.browserPageErrorCount, 0);

  assert.equal(overlay.rows.length, 1);
  const transferred = overlay.rows[0];
  assert.equal(transferred.routeIndex, 296);
  assert.equal(transferred.toFailureFamily, "REGENERATE_IDENTITY_TIMEOUT");
  assert.equal(transferred.remainingGateCode, "REGENERATE_PASS");
  assert.equal(transferred.passedGateCodes.length, 8);
  assert.equal(transferred.perRoutePatchAuthorized, false);
});

test("active state preserves A04 history while A06 closes the final capacity residuals", () => {
  assert.equal(activeState.status, "PASS_ALL_793_LEGAL_ROUTES_CLOSED");
  assert.equal(activeState.current.cumulativePassRouteCount, 793);
  assert.equal(activeState.current.unresolvedFailedRouteCount, 0);
  assert.equal(activeState.current.closedOriginalFailureRouteCount, 327);
  assert.equal(activeState.current.reclassifiedUnresolvedRouteCount, 0);
  assert.equal(activeState.reconciliation.pendingFailureFamiliesExcludingCapacityReconciliation, 0);
  assert.equal(activeState.reconciliation.activeCapacityShortfallRouteCount, 0);
  assert.equal(activeState.reconciliation.capacityReconciliationRouteCount, 38);
  assert.equal(activeState.reconciliation.capacityReconciliationOverlapWithPendingFailureCount, 0);
  const closedRegenerate = activeState.closedFamilies.find((family) => family.failureFamily === "REGENERATE_IDENTITY_TIMEOUT");
  assert.ok(closedRegenerate);
  assert.equal(closedRegenerate.endToEndPassCount, 10);
  const closedCapacity = activeState.closedFamilies.find((family) => family.failureFamily === "CAPACITY_EVIDENCE_RECONCILIATION");
  assert.ok(closedCapacity);
  assert.equal(closedCapacity.endToEndPassCount, 3);
  assert.equal(activeState.pendingFamilies.length, 0);
});

test("temporary settlement replay workflow is removed before merge", async () => {
  await assert.rejects(access(temporaryWorkflowPath), (error) => error?.code === "ENOENT");
  assert.equal(readback.decisions.temporaryWorkflowRemovedBeforeMerge, true);
});
