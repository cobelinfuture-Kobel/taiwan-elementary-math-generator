import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const DEFAULT_POLICY_PATH = ".github/ci/unit-validation-policy.json";
export const VALIDATION_PLAN_DIRECTORY = "data/project/validation-plans";

const ALLOWED_LANES = new Set(["KP_FOCUSED", "UNIT_FULL_ONCE"]);
const ALLOWED_STEP_KINDS = new Set(["NODE_TEST", "NODE_RUNNER"]);
const ALLOWED_RUNTIMES = new Set(["NODE_ONLY", "PLAYWRIGHT_CHROMIUM"]);
const CENTRALIZED_GATE_IDS = new Set([
  "FULL_NODE_REGRESSION_ONCE",
  "FULL_NODE_REGRESSION",
  "GLOBAL_BROWSER_REPLAY",
  "RELEASE_REQUIRED_E2E",
]);

function fail(code, detail = null) {
  const error = new Error(code);
  error.code = code;
  error.detail = detail;
  throw error;
}

function isSafeRepoRelativePath(value, prefix) {
  if (typeof value !== "string" || !value) return false;
  if (path.isAbsolute(value) || value.includes("\\") || value.split("/").includes("..")) return false;
  if (!value.startsWith(prefix)) return false;
  return /\.(?:js|mjs)$/.test(value);
}

export function requiredPlanGateIds(policy, lane) {
  const lanePolicy = policy?.lanes?.[lane];
  if (!lanePolicy) fail("UIV_PLAN_LANE_NOT_CONFIGURED", lane);
  return lanePolicy.requiredGates.filter((gateId) => !CENTRALIZED_GATE_IDS.has(gateId));
}

export function validateValidationPlan({ policy, plan, lane } = {}) {
  if (!policy || policy.policyId !== "UNIT_INCREMENTAL_VALIDATION_V1") fail("UIV_PLAN_POLICY_INVALID");
  if (!ALLOWED_LANES.has(lane)) fail("UIV_PLAN_LANE_INVALID", lane);
  if (!plan || typeof plan !== "object" || Array.isArray(plan)) fail("UIV_PLAN_INVALID");
  if (plan.schemaVersion !== "1.0.0") fail("UIV_PLAN_SCHEMA_VERSION_INVALID", plan.schemaVersion);
  if (plan.policyId !== policy.policyId) fail("UIV_PLAN_POLICY_ID_MISMATCH", plan.policyId);
  if (typeof plan.planId !== "string" || !plan.planId) fail("UIV_PLAN_ID_REQUIRED");
  if (typeof plan.unitId !== "string" || !plan.unitId) fail("UIV_PLAN_UNIT_ID_REQUIRED");
  if (!plan.lanes || typeof plan.lanes !== "object" || Array.isArray(plan.lanes)) fail("UIV_PLAN_LANES_REQUIRED");

  const steps = plan.lanes[lane];
  if (!Array.isArray(steps) || steps.length === 0) fail("UIV_PLAN_STEPS_REQUIRED", lane);
  const requiredGateIds = requiredPlanGateIds(policy, lane).sort();
  const actualGateIds = steps.map((step) => step?.gateId).sort();
  if (new Set(actualGateIds).size !== actualGateIds.length
    || JSON.stringify(actualGateIds) !== JSON.stringify(requiredGateIds)) {
    fail("UIV_PLAN_GATE_COVERAGE_MISMATCH", { lane, requiredGateIds, actualGateIds });
  }

  let requiresPlaywrightChromium = false;
  for (const step of steps) {
    if (!step || typeof step !== "object" || Array.isArray(step)) fail("UIV_PLAN_STEP_INVALID", step);
    if (!requiredGateIds.includes(step.gateId)) fail("UIV_PLAN_GATE_ID_INVALID", step.gateId);
    if (!ALLOWED_STEP_KINDS.has(step.kind)) fail("UIV_PLAN_STEP_KIND_INVALID", step.kind);
    const runtime = step.runtime ?? "NODE_ONLY";
    if (!ALLOWED_RUNTIMES.has(runtime)) fail("UIV_PLAN_RUNTIME_INVALID", runtime);
    if (runtime === "PLAYWRIGHT_CHROMIUM") requiresPlaywrightChromium = true;

    if (step.kind === "NODE_TEST") {
      if (!Array.isArray(step.paths) || step.paths.length === 0) fail("UIV_PLAN_NODE_TEST_PATHS_REQUIRED", step.gateId);
      for (const testPath of step.paths) {
        if (!isSafeRepoRelativePath(testPath, "tests/")) fail("UIV_PLAN_NODE_TEST_PATH_INVALID", testPath);
      }
      if (step.path !== undefined) fail("UIV_PLAN_NODE_TEST_SINGLE_PATH_FORBIDDEN", step.gateId);
    }

    if (step.kind === "NODE_RUNNER") {
      if (!isSafeRepoRelativePath(step.path, "tools/")) fail("UIV_PLAN_NODE_RUNNER_PATH_INVALID", step.path);
      if (step.paths !== undefined) fail("UIV_PLAN_NODE_RUNNER_PATHS_FORBIDDEN", step.gateId);
    }
  }

  return {
    policyConformance: "PASS",
    policyId: policy.policyId,
    planId: plan.planId,
    unitId: plan.unitId,
    lane,
    requiredGateIds,
    stepCount: steps.length,
    requiresPlaywrightChromium,
    steps,
  };
}

function assertPathExists(repoPath) {
  if (!fs.existsSync(repoPath)) fail("UIV_PLAN_EXECUTION_PATH_NOT_FOUND", repoPath);
}

function runNode(args, gateId) {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.error) fail("UIV_PLAN_EXECUTION_ERROR", { gateId, message: result.error.message });
  if (result.status !== 0) fail("UIV_PLAN_GATE_FAILED", { gateId, exitCode: result.status });
}

export function executeValidationPlan({ policy, plan, lane } = {}) {
  const validation = validateValidationPlan({ policy, plan, lane });
  for (const step of validation.steps) {
    if (step.kind === "NODE_TEST") {
      for (const testPath of step.paths) assertPathExists(testPath);
      runNode(["--test", ...step.paths], step.gateId);
      continue;
    }
    assertPathExists(step.path);
    runNode([step.path], step.gateId);
  }
  return validation;
}

function parseArgs(args) {
  const out = {};
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = args[i + 1];
    if (!next || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

function writeGithubOutput(filePath, result) {
  if (!filePath) return;
  const rows = {
    plan_id: result.planId,
    unit_id: result.unitId,
    lane: result.lane,
    requires_playwright_chromium: String(result.requiresPlaywrightChromium),
  };
  fs.appendFileSync(filePath, Object.entries(rows).map(([key, value]) => `${key}=${value}\n`).join(""));
}

export function runCli(args = process.argv.slice(2)) {
  const options = parseArgs(args);
  const policyPath = options.policy ?? DEFAULT_POLICY_PATH;
  const planPath = options.plan;
  const lane = options.lane;
  if (typeof planPath !== "string" || !planPath.startsWith(`${VALIDATION_PLAN_DIRECTORY}/`) || !planPath.endsWith(".validation.json")) {
    fail("UIV_VALIDATION_PLAN_PATH_INVALID", planPath);
  }
  if (!fs.existsSync(planPath)) fail("UIV_VALIDATION_PLAN_NOT_FOUND", planPath);
  const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  const result = options["validate-only"]
    ? validateValidationPlan({ policy, plan, lane })
    : executeValidationPlan({ policy, plan, lane });
  writeGithubOutput(options["github-output"], result);
  process.stdout.write(`${JSON.stringify({ ...result, steps: undefined }, null, 2)}\n`);
  return result;
}

const isCli = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) {
  try {
    runCli();
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ code: error.code ?? "UIV_PLAN_UNKNOWN_FAILURE", detail: error.detail ?? error.message }, null, 2)}\n`);
    process.exitCode = 1;
  }
}
