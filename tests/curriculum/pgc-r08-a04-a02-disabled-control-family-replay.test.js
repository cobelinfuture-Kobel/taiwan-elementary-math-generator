import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DISABLED_CONTROL_POLICY_CODES,
  installDisabledCurrentValueSelectionPolicy,
} from "../../tools/curriculum/pgc-r08-browser-control-selection-policy.mjs";

const plan = JSON.parse(await readFile("data/curriculum/public-generation/PGC-R08-A04-A02.disabled-control-harness-family-replay-plan.json", "utf8"));
const sourceReadback = JSON.parse(await readFile(plan.sourceReadbackPath, "utf8"));
const queues = await Promise.all(plan.targetFamilyQueuePaths.map(async (path) => JSON.parse(await readFile(path, "utf8"))));
const runner = await readFile("tools/curriculum/run-pgc-r08-a04-a02-disabled-control-family-replay.mjs", "utf8");
const workflow = await readFile(".github/workflows/pgc-r08-a04-a02-disabled-control-family-replay.yml", "utf8");

function mockPage({ disabled, initialValue }) {
  let value = initialValue;
  let mutationCount = 0;
  const page = {
    selectOption: async (_selector, requested) => {
      mutationCount += 1;
      value = requested;
      return [requested];
    },
    locator: () => ({
      isDisabled: async () => disabled,
      inputValue: async () => value,
    }),
  };
  return { page, getValue: () => value, getMutationCount: () => mutationCount };
}

test("PGC-R08 A04 A02 targets exactly both 180-route disabled-control families", () => {
  assert.equal(sourceReadback.repairDecision.harnessMutationAuthorized, true);
  assert.equal(queues.length, 2);
  assert.equal(queues.reduce((sum, queue) => sum + queue.rows.length, 0), 180);
  assert.deepEqual(queues.map((queue) => queue.failureFamily).sort(), plan.targetFamilies.toSorted());
  assert.equal(plan.acceptance.terminalRouteCount, 180);
  assert.equal(plan.acceptance.disabledControlSemanticsPassCount, 180);
  assert.equal(plan.acceptance.minimumFullJourneyPassCount, 179);
  assert.equal(plan.acceptance.maximumClassifiedDownstreamHandoffCount, 1);
  assert.equal(plan.acceptance.unclassifiedFailureCount, 0);
});

test("enabled control uses normal selection", async () => {
  const dispositions = [];
  const mock = mockPage({ disabled: false, initialValue: "numeric" });
  installDisabledCurrentValueSelectionPolicy(mock.page, { onDisposition: (event) => dispositions.push(event) });
  await mock.page.selectOption("#type", "application");
  assert.equal(mock.getValue(), "application");
  assert.equal(mock.getMutationCount(), 1);
  assert.equal(dispositions[0].disposition, DISABLED_CONTROL_POLICY_CODES.ENABLED_SELECTION);
});

test("disabled control with matching current authority passes without mutation", async () => {
  const dispositions = [];
  const mock = mockPage({ disabled: true, initialValue: "numeric" });
  installDisabledCurrentValueSelectionPolicy(mock.page, { onDisposition: (event) => dispositions.push(event) });
  assert.deepEqual(await mock.page.selectOption("#type", "numeric"), ["numeric"]);
  assert.equal(mock.getMutationCount(), 0);
  assert.equal(dispositions[0].disposition, DISABLED_CONTROL_POLICY_CODES.DISABLED_CURRENT_VALUE_MATCH);
});

test("disabled control with mismatched value fails closed", async () => {
  const mock = mockPage({ disabled: true, initialValue: "numeric" });
  installDisabledCurrentValueSelectionPolicy(mock.page);
  await assert.rejects(
    mock.page.selectOption("#type", "application"),
    (error) => error?.message === "PGC_R08_BROWSER_DISABLED_CONTROL_VALUE_MISMATCH" && error?.details?.actualValue === "numeric",
  );
  assert.equal(mock.getMutationCount(), 0);
});

test("A02 creates the shared A03 output directories before executing routes", () => {
  assert.match(runner, /const CORE_SAMPLE = path\.join\(CORE_OUT, "samples"\)/);
  assert.match(runner, /const CORE_FAILURE = path\.join\(CORE_OUT, "failures"\)/);
  assert.match(runner, /mkdir\(CORE_SAMPLE, \{ recursive: true \}\)/);
  assert.match(runner, /mkdir\(CORE_FAILURE, \{ recursive: true \}\)/);
});

test("A02 reuses the existing nine-gate executeRoute path and branch-only read-only workflow", () => {
  assert.match(runner, /executeRoute/);
  assert.match(runner, /wrapBrowserWithDisabledCurrentValueSelectionPolicy/);
  assert.match(runner, /allNineGatesPassCount/);
  assert.match(workflow, /pgc-r08-a04-a02-disabled-control-family-replay/);
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
  assert.match(workflow, /upload-artifact@v4/);
});

test("A02 admits only the exact three-times-reproduced route-297 regenerate handoff", () => {
  assert.equal(plan.overlappingFailurePolicy.finalNineGateObligationRetained, true);
  assert.equal(plan.overlappingFailurePolicy.unlistedFailure, "CI_BLOCKING");
  assert.equal(plan.overlappingFailurePolicy.allowedHandoffs.length, 1);
  const [handoff] = plan.overlappingFailurePolicy.allowedHandoffs;
  assert.equal(handoff.routeIndex, 297);
  assert.equal(handoff.routeId, "pgc_r03_g4b_u06_4b06_application_243390fad850");
  assert.equal(handoff.downstreamFailureFamily, "REGENERATE_IDENTITY_TIMEOUT");
  assert.equal(handoff.requiredPendingGateCode, "REGENERATE_PASS");
  assert.equal(handoff.exactReproductionCount, 3);
  assert.equal(handoff.evidenceRefs.length, 3);
  assert.deepEqual(handoff.requiredPassedGateCodes.toSorted(), [
    "ANSWER_KEY_PASS",
    "ANSWER_VALIDATION_PASS",
    "GENERATE_BUTTON_PASS",
    "HTML_PASS",
    "PDF_PASS",
    "QUESTION_COUNT_PASS",
    "QUESTION_IDENTITY_PASS",
    "UI_OPTIONS_PASS",
  ]);
  assert.match(runner, /classifyAllowedHandoff/);
  assert.match(runner, /unclassifiedFailures/);
  assert.match(runner, /PASS_DISABLED_CONTROL_FAMILIES_WITH_CLASSIFIED_DOWNSTREAM_HANDOFF/);
  assert.match(runner, /finalNineGateObligationRetained/);
});
