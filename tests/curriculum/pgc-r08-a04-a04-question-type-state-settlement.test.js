import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildQuestionTypeStateBootstrapUrl } from "../../tools/curriculum/pgc-r08-question-type-state-bootstrap.mjs";

const plan = JSON.parse(await readFile(
  "data/curriculum/public-generation/PGC-R08-A04-A04.question-type-state-settlement-plan.json",
  "utf8",
));
const activeState = JSON.parse(await readFile(plan.activeStatePath, "utf8"));
const queue = JSON.parse(await readFile(plan.queuePath, "utf8"));
const bootstrapSource = await readFile(
  "tools/curriculum/pgc-r08-question-type-state-bootstrap.mjs",
  "utf8",
);
const runnerSource = await readFile(
  "tools/curriculum/run-pgc-r08-a04-a04-question-type-state-settlement-replay.mjs",
  "utf8",
);

test("A04 consumes position 3 and the immutable nine-route settlement queue", () => {
  assert.equal(activeState.reconciliation.nextRepairPosition, 3);
  assert.equal(
    activeState.reconciliation.nextTask,
    "PGC-R08-A04-A04_QuestionTypeStateSettlementFocusedReproductionAnd9RouteRepair",
  );
  assert.equal(queue.failureFamily, "QUESTION_TYPE_STATE_SETTLEMENT_TIMEOUT");
  assert.equal(queue.rows.length, 9);
  assert.equal(plan.targetRouteCount, 9);
  assert.equal(new Set(queue.rows.map((row) => row[1])).size, 9);
  assert.deepEqual(
    [...new Set(queue.rows.map((row) => row[1].split("_").slice(2, 5).join("_")))].sort(),
    ["g3a_u08_3a08", "g3b_u07_3b07", "g4b_u06_4b06", "g5a_u04_5a04"],
  );
});

test("canonical bootstrap materializes the complete initial public state before navigation", () => {
  const url = buildQuestionTypeStateBootstrapUrl("http://127.0.0.1:4196/index.html?existing=1", {
    routeIndex: 54,
    routeId: "sample-route",
    sourceId: "g3a_u08_3a08",
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: ["kp_b", "kp_a", "kp_a"],
    uiSelectablePatternGroupIds: ["pg_b", "pg_a", "pg_a"],
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
  assert.deepEqual(parsed.searchParams.getAll("pg"), ["pg_a", "pg_b"]);
  assert.equal(parsed.searchParams.get("questionCount"), "20");
});

test("repair is shared, query-state based, and does not extend timeouts or patch routes", () => {
  assert.match(bootstrapSource, /CANONICAL_QUERY_STATE_BOOTSTRAPPED/);
  assert.match(bootstrapSource, /questionMode/);
  assert.match(bootstrapSource, /uiSelectablePatternGroupIds/);
  assert.doesNotMatch(bootstrapSource, /waitForTimeout/);
  assert.doesNotMatch(bootstrapSource, /pgc_r03_/);
  assert.match(runnerSource, /wrapBrowserWithExactPatternGroupBinder/);
  assert.match(runnerSource, /wrapBrowserWithDisabledCurrentValueSelectionPolicy/);
  assert.match(runnerSource, /wrapBrowserWithQuestionTypeStateBootstrap/);
  assert.equal(plan.repairContract.timeoutExtensionForbidden, true);
  assert.equal(plan.repairContract.productMutationAllowed, false);
  assert.equal(plan.repairContract.capacityAuthorityMutationAllowed, false);
  assert.equal(plan.repairContract.historicalQueueMutationAllowed, false);
  assert.equal(plan.repairContract.perRoutePatchAllowed, false);
});
