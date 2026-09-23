import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  requiredPlanGateIds,
  validateValidationPlan,
} from "../../tools/governance/run-unit-validation-plan.mjs";

const policy = JSON.parse(fs.readFileSync(".github/ci/unit-validation-policy.json", "utf8"));

function validPlan() {
  return {
    schemaVersion: "1.0.0",
    policyId: policy.policyId,
    planId: "unit-test-plan",
    unitId: "g4x_u01",
    lanes: {
      KP_FOCUSED: [
        {
          gateId: "FOCUSED_TEST",
          kind: "NODE_TEST",
          paths: ["tests/curriculum/example-focused.test.js"],
        },
        {
          gateId: "TARGETED_BROWSER_E2E",
          kind: "NODE_RUNNER",
          path: "tools/curriculum/run-example-browser-e2e.mjs",
          runtime: "PLAYWRIGHT_CHROMIUM",
        },
        {
          gateId: "DIRECT_DEPENDENCY_CONTRACTS",
          kind: "NODE_TEST",
          paths: ["tests/curriculum/example-dependency.test.js"],
        },
      ],
      SHARED_RUNTIME_BOUNDED: [
        {
          gateId: "GLOBAL_CONTRACTS",
          kind: "NODE_TEST",
          paths: ["tests/curriculum/example-global-contract.test.js"],
        },
        {
          gateId: "TARGETED_ROUTE_REPLAY",
          kind: "NODE_RUNNER",
          path: "tools/curriculum/run-example-targeted-route-replay.mjs",
          runtime: "PLAYWRIGHT_CHROMIUM",
        },
      ],
      UNIT_FULL_ONCE: [
        {
          gateId: "UNIT_INTEGRATION_TEST",
          kind: "NODE_TEST",
          paths: ["tests/curriculum/example-unit-integration.test.js"],
        },
        {
          gateId: "GLOBAL_CONTRACTS",
          kind: "NODE_TEST",
          paths: ["tests/curriculum/example-global-contract.test.js"],
        },
        {
          gateId: "UNIT_TARGETED_BROWSER_MATRIX",
          kind: "NODE_RUNNER",
          path: "tools/curriculum/run-example-unit-browser-matrix.mjs",
          runtime: "PLAYWRIGHT_CHROMIUM",
        },
      ],
    },
  };
}

test("focused validation plan coverage is derived from policy required gates", () => {
  assert.deepEqual(requiredPlanGateIds(policy, "KP_FOCUSED").sort(), [
    "DIRECT_DEPENDENCY_CONTRACTS",
    "FOCUSED_TEST",
    "TARGETED_BROWSER_E2E",
  ]);
  assert.deepEqual(requiredPlanGateIds(policy, "SHARED_RUNTIME_BOUNDED").sort(), [
    "GLOBAL_CONTRACTS",
    "TARGETED_ROUTE_REPLAY",
  ]);
  assert.deepEqual(requiredPlanGateIds(policy, "UNIT_FULL_ONCE").sort(), [
    "GLOBAL_CONTRACTS",
    "UNIT_INTEGRATION_TEST",
    "UNIT_TARGETED_BROWSER_MATRIX",
  ]);
});

test("KP focused plan requires focused tests, targeted browser E2E, and dependency contracts", () => {
  const result = validateValidationPlan({ policy, plan: validPlan(), lane: "KP_FOCUSED" });
  assert.equal(result.policyConformance, "PASS");
  assert.equal(result.stepCount, 3);
  assert.equal(result.requiresPlaywrightChromium, true);
});

test("Bounded shared-runtime plan requires global contracts plus targeted route replay without centralized regression", () => {
  const result = validateValidationPlan({ policy, plan: validPlan(), lane: "SHARED_RUNTIME_BOUNDED" });
  assert.equal(result.policyConformance, "PASS");
  assert.equal(result.stepCount, 2);
  assert.equal(result.requiresPlaywrightChromium, true);
  assert.doesNotMatch(result.requiredGateIds.join(" "), /FULL_NODE_REGRESSION|GLOBAL_BROWSER_REPLAY/);
});

test("Unit integration plan excludes centralized full regression while covering the other required gates", () => {
  const result = validateValidationPlan({ policy, plan: validPlan(), lane: "UNIT_FULL_ONCE" });
  assert.equal(result.policyConformance, "PASS");
  assert.equal(result.stepCount, 3);
  assert.doesNotMatch(result.requiredGateIds.join(" "), /FULL_NODE_REGRESSION/);
});

test("missing targeted browser E2E fails closed", () => {
  const plan = validPlan();
  plan.lanes.KP_FOCUSED = plan.lanes.KP_FOCUSED.filter((step) => step.gateId !== "TARGETED_BROWSER_E2E");
  assert.throws(
    () => validateValidationPlan({ policy, plan, lane: "KP_FOCUSED" }),
    (error) => error.code === "UIV_PLAN_GATE_COVERAGE_MISMATCH",
  );
});

test("arbitrary shell step kinds are forbidden", () => {
  const plan = validPlan();
  plan.lanes.KP_FOCUSED[0].kind = "SHELL";
  assert.throws(
    () => validateValidationPlan({ policy, plan, lane: "KP_FOCUSED" }),
    (error) => error.code === "UIV_PLAN_STEP_KIND_INVALID",
  );
});

test("validation plans cannot escape tests or tools path boundaries", () => {
  const plan = validPlan();
  plan.lanes.KP_FOCUSED[0].paths = ["../secret.test.js"];
  assert.throws(
    () => validateValidationPlan({ policy, plan, lane: "KP_FOCUSED" }),
    (error) => error.code === "UIV_PLAN_NODE_TEST_PATH_INVALID",
  );

  const second = validPlan();
  second.lanes.KP_FOCUSED[1].path = "site/unsafe-runner.mjs";
  assert.throws(
    () => validateValidationPlan({ policy, plan: second, lane: "KP_FOCUSED" }),
    (error) => error.code === "UIV_PLAN_NODE_RUNNER_PATH_INVALID",
  );
});
