import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { classifyUnitValidationImpact } from "../../tools/governance/classify-unit-validation-impact.mjs";

const POLICY = JSON.parse(fs.readFileSync(".github/ci/unit-validation-policy.json", "utf8"));
const MANIFEST_PATH = "data/project/change-impact/TEST.impact.json";

function baseManifest(overrides = {}) {
  const base = {
    schemaVersion: "1.0.0",
    policyId: "UNIT_INCREMENTAL_VALIDATION_V1",
    taskId: "TEST_TASK",
    unitId: "g3a_u04_3a04",
    currentKnowledgePointId: "kp_test_leaf",
    currentScope: "KP_LEAF",
    unitExpectedKnowledgePointIds: ["kp_test_leaf", "kp_test_sibling"],
    unitKnowledgePointGateStatus: {
      kp_test_leaf: "PENDING",
      kp_test_sibling: "PENDING"
    },
    focusedValidationCheckName: "P04F leaf focused acceptance",
    changeImpact: {
      sharedExecutableChange: false,
      publicAuthorityCutover: false,
      legalRouteSemanticsChanged: false,
      affectedRoutes: "BOUNDED",
      globalReleaseCheckpoint: false,
      currentAuthorityChanged: false
    },
    expectedDerivedGate: "KP_FOCUSED"
  };
  return {
    ...base,
    ...overrides,
    changeImpact: {
      ...base.changeImpact,
      ...(overrides.changeImpact ?? {})
    }
  };
}

function classify(manifest, extraFiles = []) {
  return classifyUnitValidationImpact({
    policy: POLICY,
    changedFiles: [
      "data/curriculum/full-product/p04f/slice-test.json",
      "site/modules/curriculum/batch-a/p04f-leaf-runtime.js",
      MANIFEST_PATH,
      ...extraFiles
    ],
    manifest
  });
}

test("UIV01 valid KP leaf is focused-only and forbids full regression", () => {
  const result = classify(baseManifest());
  assert.equal(result.policyConformance, "PASS");
  assert.equal(result.currentScope, "KP_LEAF");
  assert.equal(result.derivedGate, "KP_FOCUSED");
  assert.equal(result.runFullRegression, false);
  assert.equal(result.runGlobalReplay, false);
});

test("UIV01 KP leaf cannot smuggle public-authority cutover", () => {
  assert.throws(
    () => classify(baseManifest({ changeImpact: { publicAuthorityCutover: true } })),
    (error) => error.code === "UIV_SCOPE_INFLATION"
  );
});

test("UIV01 changed shared executable path must be declared", () => {
  assert.throws(
    () => classify(baseManifest(), ["site/assets/browser/public-capability-ui.js"]),
    (error) => error.code === "UIV_SHARED_EXECUTABLE_FLAG_MISMATCH"
  );
});

test("UIV01 changed public authority path must be declared", () => {
  assert.throws(
    () => classify(baseManifest({ changeImpact: { sharedExecutableChange: true } }), ["site/modules/curriculum/public/public-ui-capability-binding-next.js"]),
    (error) => error.code === "UIV_PUBLIC_AUTHORITY_FLAG_MISMATCH"
  );
});

test("UIV01 unit integration requires every expected KP focused-pass and runs one full regression", () => {
  const manifest = baseManifest({
    currentScope: "UNIT_INTEGRATION",
    currentKnowledgePointId: null,
    unitKnowledgePointGateStatus: {
      kp_test_leaf: "FOCUSED_PASS",
      kp_test_sibling: "FOCUSED_PASS"
    },
    changeImpact: {
      publicAuthorityCutover: true,
      currentAuthorityChanged: true
    },
    expectedDerivedGate: "UNIT_INTEGRATION_GATE"
  });
  const result = classify(manifest);
  assert.equal(result.derivedGate, "UNIT_INTEGRATION_GATE");
  assert.equal(result.runFullRegression, true);
  assert.equal(result.runGlobalReplay, false);
});

test("UIV01 unit integration fails closed while any KP is pending", () => {
  const manifest = baseManifest({
    currentScope: "UNIT_INTEGRATION",
    currentKnowledgePointId: null,
    unitKnowledgePointGateStatus: {
      kp_test_leaf: "FOCUSED_PASS",
      kp_test_sibling: "PENDING"
    },
    changeImpact: {
      publicAuthorityCutover: true,
      currentAuthorityChanged: true
    },
    expectedDerivedGate: "UNIT_INTEGRATION_GATE"
  });
  assert.throws(
    () => classify(manifest),
    (error) => error.code === "UIV_UNIT_INTEGRATION_NOT_ELIGIBLE"
  );
});

test("UIV01 bounded shared runtime change escalates to one full regression but not global replay", () => {
  const manifest = baseManifest({
    currentScope: "SHARED_RUNTIME",
    currentKnowledgePointId: null,
    changeImpact: { sharedExecutableChange: true },
    expectedDerivedGate: "SHARED_RUNTIME_BOUNDED"
  });
  const result = classify(manifest);
  assert.equal(result.derivedGate, "SHARED_RUNTIME_BOUNDED");
  assert.equal(result.runFullRegression, true);
  assert.equal(result.runGlobalReplay, false);
});

test("UIV01 unbounded shared runtime change becomes global certification", () => {
  const manifest = baseManifest({
    currentScope: "SHARED_RUNTIME",
    currentKnowledgePointId: null,
    changeImpact: {
      sharedExecutableChange: true,
      affectedRoutes: "UNBOUNDED"
    },
    expectedDerivedGate: "GLOBAL_CERTIFICATION"
  });
  const result = classify(manifest);
  assert.equal(result.derivedGate, "GLOBAL_CERTIFICATION");
  assert.equal(result.runFullRegression, true);
  assert.equal(result.runGlobalReplay, true);
  assert.equal(result.globalReplayExecutionStatus, "EXTERNAL_RELEASE_GATE_NOT_AGGREGATED_YET");
});

test("UIV01 global release requires explicit checkpoint", () => {
  const invalid = baseManifest({
    currentScope: "GLOBAL_RELEASE",
    currentKnowledgePointId: null,
    expectedDerivedGate: "GLOBAL_CERTIFICATION"
  });
  assert.throws(
    () => classify(invalid),
    (error) => error.code === "UIV_GLOBAL_RELEASE_CHECKPOINT_REQUIRED"
  );

  const valid = baseManifest({
    currentScope: "GLOBAL_RELEASE",
    currentKnowledgePointId: null,
    changeImpact: { globalReleaseCheckpoint: true },
    expectedDerivedGate: "GLOBAL_CERTIFICATION"
  });
  const result = classify(valid);
  assert.equal(result.runFullRegression, true);
  assert.equal(result.runGlobalReplay, true);
});

test("UIV01 curriculum product changes require exactly one changed impact manifest", () => {
  assert.throws(
    () => classifyUnitValidationImpact({
      policy: POLICY,
      changedFiles: ["site/modules/curriculum/batch-a/new-leaf-runtime.js"],
      manifest: null
    }),
    (error) => error.code === "UIV_IMPACT_MANIFEST_REQUIRED"
  );
});

test("UIV01 governance-only changes do not trigger full repository regression", () => {
  const result = classifyUnitValidationImpact({
    policy: POLICY,
    changedFiles: [
      ".github/ci/unit-validation-policy.json",
      "tools/governance/classify-unit-validation-impact.mjs",
      "tests/governance/gci-uiv01-unit-validation-policy.test.js"
    ],
    manifest: null
  });
  assert.equal(result.derivedGate, "GOVERNANCE_FOCUSED");
  assert.equal(result.runFullRegression, false);
  assert.equal(result.governanceChanged, true);
});

test("UIV01 non-curriculum legacy changes retain one full regression fallback", () => {
  const result = classifyUnitValidationImpact({
    policy: POLICY,
    changedFiles: ["README.md"],
    manifest: null
  });
  assert.equal(result.derivedGate, "LEGACY_FULL_REGRESSION");
  assert.equal(result.runFullRegression, true);
});

test("UIV01 current PR Gate owns conditional PR regression and Node Test is post-merge only", () => {
  const prGate = fs.readFileSync(".github/workflows/pr-gate.yml", "utf8");
  const nodeTest = fs.readFileSync(".github/workflows/node-test.yml", "utf8");

  assert.match(prGate, /^name: PR Gate$/m);
  assert.match(prGate, /^\s{2}contents: read$/m);
  assert.match(prGate, /classify-unit-validation-impact\.mjs/);
  assert.match(prGate, /needs\.classify_validation\.outputs\.run_full_regression == 'true'/);
  assert.equal((prGate.match(/(?:^|\s)npm\s+test(?:\s|$)/gm) ?? []).length, 1);
  assert.doesNotMatch(prGate, /\bgit\s+(?:commit|push|rebase)\b/);

  assert.match(nodeTest, /^name: Node Test Post-Merge$/m);
  assert.match(nodeTest, /^\s{2}push:$/m);
  assert.doesNotMatch(nodeTest, /^\s{2}pull_request:/m);
  assert.equal((nodeTest.match(/(?:^|\s)npm\s+test(?:\s|$)/gm) ?? []).length, 1);
  assert.doesNotMatch(nodeTest, /\bgit\s+(?:commit|push|rebase)\b/);
});
