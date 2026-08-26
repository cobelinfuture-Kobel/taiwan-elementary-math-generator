import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { classifyUnitValidationImpact } from "../../tools/governance/classify-unit-validation-impact.mjs";

const policy = JSON.parse(fs.readFileSync(".github/ci/unit-validation-policy.json", "utf8"));
const prGate = fs.readFileSync(".github/workflows/pr-gate.yml", "utf8");
const nodeTest = fs.readFileSync(".github/workflows/node-test.yml", "utf8");

function manifest(overrides = {}) {
  return {
    schemaVersion: "1.0.0",
    policyId: policy.policyId,
    taskId: "UIV02_TEST",
    currentScope: "KP_LEAF",
    expectedDerivedGate: "KP_FOCUSED",
    validationPlanPath: "data/project/validation-plans/UIV02_TEST.validation.json",
    unitExpectedKnowledgePointIds: ["kp_a"],
    unitKnowledgePointGateStatus: { kp_a: "PENDING" },
    currentKnowledgePointId: "kp_a",
    changeImpact: {
      sharedExecutableChange: false,
      publicAuthorityCutover: false,
      legalRouteSemanticsChanged: false,
      affectedRoutes: "BOUNDED",
      globalReleaseCheckpoint: false,
      currentAuthorityChanged: false,
    },
    ...overrides,
  };
}

test("Layer 3 PR Gate covers every PR to main and is read-only", () => {
  assert.match(prGate, /name: PR Gate/);
  assert.match(prGate, /pull_request:\n    branches: \[main\]/);
  assert.doesNotMatch(prGate, /pull_request:[\s\S]{0,200}paths:/);
  assert.match(prGate, /permissions:\n  contents: read/);
  assert.doesNotMatch(prGate, /git push|git commit|git rebase/);
});

test("Node Test no longer owns pull-request full regression", () => {
  assert.match(nodeTest, /name: Node Test Post-Merge/);
  assert.match(nodeTest, /push:\n    branches: \[main\]/);
  assert.doesNotMatch(nodeTest, /pull_request:/);
});

test("governance-only Layer 3 changes skip full regression", () => {
  const result = classifyUnitValidationImpact({
    policy,
    changedFiles: [
      ".github/workflows/pr-gate.yml",
      ".github/workflows/node-test.yml",
      "tools/governance/classify-unit-validation-impact.mjs",
      "tests/governance/gci-uiv02-layer3-ci-enforcement.test.js",
      "tests/curriculum/p03f-slice022-authority-preflight.test.js",
    ],
  });
  assert.equal(result.derivedGate, "GOVERNANCE_FOCUSED");
  assert.equal(result.runFullRegression, false);
  assert.equal(result.runGlobalReplay, false);
  assert.equal(result.validationPlanPath, null);
});

test("curriculum product change fails closed without one impact manifest", () => {
  assert.throws(
    () => classifyUnitValidationImpact({ policy, changedFiles: ["site/modules/curriculum/batch-a/example.js"] }),
    (error) => error.code === "UIV_IMPACT_MANIFEST_REQUIRED",
  );
});

test("KP leaf manifest requires a validation plan and produces focused lane without full regression", () => {
  const changedFiles = [
    "site/modules/curriculum/batch-a/example.js",
    "data/project/change-impact/UIV02_TEST.impact.json",
  ];
  const result = classifyUnitValidationImpact({ policy, changedFiles, manifest: manifest() });
  assert.equal(result.derivedGate, "KP_FOCUSED");
  assert.equal(result.runFullRegression, false);
  assert.equal(result.runGlobalReplay, false);
  assert.equal(result.validationPlanPath, "data/project/validation-plans/UIV02_TEST.validation.json");

  const withoutPlan = manifest();
  delete withoutPlan.validationPlanPath;
  assert.throws(
    () => classifyUnitValidationImpact({ policy, changedFiles, manifest: withoutPlan }),
    (error) => error.code === "UIV_VALIDATION_PLAN_PATH_REQUIRED",
  );
});

test("Unit integration requires all expected KPs focused-pass, a validation plan, and full regression once", () => {
  const m = manifest({
    currentScope: "UNIT_INTEGRATION",
    expectedDerivedGate: "UNIT_FULL_ONCE",
    unitExpectedKnowledgePointIds: ["kp_a", "kp_b"],
    unitKnowledgePointGateStatus: { kp_a: "FOCUSED_PASS", kp_b: "FOCUSED_PASS" },
    currentKnowledgePointId: null,
    changeImpact: {
      sharedExecutableChange: false,
      publicAuthorityCutover: true,
      legalRouteSemanticsChanged: false,
      affectedRoutes: "BOUNDED",
      globalReleaseCheckpoint: false,
      currentAuthorityChanged: true,
    },
  });
  const result = classifyUnitValidationImpact({
    policy,
    changedFiles: ["data/curriculum/registry/example.json", "data/project/change-impact/UIV02_TEST.impact.json"],
    manifest: m,
  });
  assert.equal(result.derivedGate, "UNIT_FULL_ONCE");
  assert.equal(result.runFullRegression, true);
  assert.equal(result.runGlobalReplay, false);
  assert.equal(result.validationPlanPath, m.validationPlanPath);
});

test("Any shared runtime change requires global certification and replay", () => {
  const m = manifest({
    currentScope: "SHARED_RUNTIME",
    expectedDerivedGate: "GLOBAL_CERTIFICATION",
    validationPlanPath: undefined,
    changeImpact: {
      sharedExecutableChange: true,
      publicAuthorityCutover: true,
      legalRouteSemanticsChanged: false,
      affectedRoutes: "BOUNDED",
      globalReleaseCheckpoint: false,
      currentAuthorityChanged: true,
    },
  });
  const result = classifyUnitValidationImpact({
    policy,
    changedFiles: ["site/modules/curriculum/public/example.js", "data/project/change-impact/UIV02_TEST.impact.json"],
    manifest: m,
  });
  assert.equal(result.derivedGate, "GLOBAL_CERTIFICATION");
  assert.equal(result.runFullRegression, true);
  assert.equal(result.runGlobalReplay, true);
  assert.equal(result.validationPlanPath, null);
});

test("PR Gate executes focused product plans for KP and Unit lanes and aggregates the result", () => {
  assert.match(prGate, /focused_product:/);
  assert.match(prGate, /name: Focused product validation/);
  assert.match(prGate, /run-unit-validation-plan\.mjs/);
  assert.match(prGate, /validation_plan_path/);
  assert.match(prGate, /requires_playwright_chromium/);
  assert.match(prGate, /PRODUCT_RESULT/);
  assert.match(prGate, /CURRENT_SCOPE.*KP_LEAF/);
  assert.match(prGate, /CURRENT_SCOPE.*UNIT_INTEGRATION/);
});

test("PR Gate fails closed when global replay is required but not aggregated", () => {
  assert.match(prGate, /GLOBAL_CERTIFICATION requires the canonical global browser replay gate/);
  assert.match(prGate, /if \[\[ \"\$RUN_GLOBAL_REPLAY\" == \"true\" \]\]; then/);
  assert.match(prGate, /exit 1/);
});
