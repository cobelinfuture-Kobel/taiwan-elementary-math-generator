import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  decideFullRegressionExecution,
  deriveValidationLane,
  transitionUnitValidationState,
} from "../../tools/governance/unit-validation-state-machine.mjs";

const POLICY = JSON.parse(fs.readFileSync(".github/ci/unit-validation-policy.json", "utf8"));
const MACHINE = JSON.parse(fs.readFileSync(".github/ci/unit-validation-state-machine.json", "utf8"));
const SHA_A = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const SHA_B = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

function impact(overrides = {}) {
  return {
    sharedExecutableChange: false,
    publicAuthorityCutover: false,
    legalRouteSemanticsChanged: false,
    affectedRoutes: "BOUNDED",
    globalReleaseCheckpoint: false,
    currentAuthorityChanged: false,
    ...overrides,
  };
}

function record(overrides = {}) {
  return {
    schemaVersion: "1.0.0",
    machineId: MACHINE.machineId,
    unitId: "g3a_u02_3a02",
    state: "UNIT_DISCOVERED",
    expectedKnowledgePointIds: ["kp_a", "kp_b"],
    knowledgePointGateStatus: { kp_a: "PENDING", kp_b: "PENDING" },
    currentKnowledgePointId: null,
    lastExactHeadSha: null,
    lastDerivedLane: null,
    blocker: null,
    transitionHistory: [],
    evidenceLedger: [],
    ...overrides,
  };
}

function evidence(evidenceId, gateId, exactHeadSha = SHA_A) {
  return { evidenceId, gateId, lane: null, exactHeadSha, status: "PASS" };
}

test("Layer 1 and Layer 2 remain active while Layer 3 PR routing is active", () => {
  assert.equal(POLICY.layerStatus.layer1HandshakePolicy, "LOCKED");
  assert.equal(POLICY.layerStatus.layer2ValidationStateMachine, "ACTIVE");
  assert.equal(POLICY.layerStatus.layer3GitHubCiEnforcement, "ACTIVE_PR_ROUTING_REQUIRED_CHECK_PENDING");
  assert.ok(MACHINE.layerBoundary.layer3OwnsLater.includes("GITHUB_ACTIONS_ROUTING"));
  assert.ok(MACHINE.layerBoundary.layer3OwnsLater.includes("MERGE_BLOCKING"));
});

test("KP leaf derives focused lane and forbids full regression", () => {
  assert.equal(deriveValidationLane({ policy: POLICY, state: "KP_VALIDATING", currentScope: "KP_LEAF", changeImpact: impact() }), "KP_FOCUSED");
  assert.deepEqual(
    decideFullRegressionExecution({ policy: POLICY, lane: "KP_FOCUSED", exactHeadSha: SHA_A, evidenceLedger: [] }),
    { action: "FORBIDDEN", runFullRegression: false, reason: "LANE_FORBIDS_FULL_REGRESSION" },
  );
});

test("KP leaf cannot inflate scope through authority or shared-runtime flags", () => {
  assert.throws(
    () => deriveValidationLane({ policy: POLICY, state: "KP_VALIDATING", currentScope: "KP_LEAF", changeImpact: impact({ publicAuthorityCutover: true }) }),
    (error) => error.code === "UIV_SCOPE_INFLATION",
  );
  assert.throws(
    () => deriveValidationLane({ policy: POLICY, state: "KP_VALIDATING", currentScope: "KP_LEAF", changeImpact: impact({ sharedExecutableChange: true }) }),
    (error) => error.code === "UIV_SCOPE_INFLATION",
  );
});

test("Unit mainline advances one KP at a time and cannot skip completeness", () => {
  let r = transitionUnitValidationState({ machine: MACHINE, policy: POLICY, record: record(), event: "LOCK_UNIT_AUTHORITY", request: { exactHeadSha: SHA_A } });
  assert.equal(r.state, "KP_READY");
  r = transitionUnitValidationState({ machine: MACHINE, policy: POLICY, record: r, event: "START_KP_VALIDATION", request: { exactHeadSha: SHA_A, currentKnowledgePointId: "kp_a", currentScope: "KP_LEAF", changeImpact: impact() } });
  r = transitionUnitValidationState({ machine: MACHINE, policy: POLICY, record: r, event: "PASS_KP_FOCUSED_GATE", request: { exactHeadSha: SHA_A, evidence: [evidence("kp-a-pass", "KP_FOCUSED_GATE")] } });
  assert.throws(
    () => transitionUnitValidationState({ machine: MACHINE, policy: POLICY, record: r, event: "CONFIRM_ALL_KPS_FOCUSED_PASS", request: { exactHeadSha: SHA_A } }),
    (error) => error.code === "UIV_UNIT_KPS_NOT_COMPLETE",
  );
  r = transitionUnitValidationState({ machine: MACHINE, policy: POLICY, record: r, event: "SELECT_NEXT_KP", request: { exactHeadSha: SHA_A } });
  r = transitionUnitValidationState({ machine: MACHINE, policy: POLICY, record: r, event: "START_KP_VALIDATION", request: { exactHeadSha: SHA_A, currentKnowledgePointId: "kp_b", currentScope: "KP_LEAF", changeImpact: impact() } });
  r = transitionUnitValidationState({ machine: MACHINE, policy: POLICY, record: r, event: "PASS_KP_FOCUSED_GATE", request: { exactHeadSha: SHA_A, evidence: [evidence("kp-b-pass", "KP_FOCUSED_GATE")] } });
  r = transitionUnitValidationState({ machine: MACHINE, policy: POLICY, record: r, event: "CONFIRM_ALL_KPS_FOCUSED_PASS", request: { exactHeadSha: SHA_A } });
  assert.equal(r.state, "UNIT_KPS_COMPLETE");
});

test("Unit integration derives one full-regression lane only after all expected KPs focused-pass", () => {
  const complete = record({ state: "UNIT_KPS_COMPLETE", knowledgePointGateStatus: { kp_a: "FOCUSED_PASS", kp_b: "FOCUSED_PASS" } });
  const r = transitionUnitValidationState({
    machine: MACHINE,
    policy: POLICY,
    record: complete,
    event: "START_UNIT_INTEGRATION",
    request: { exactHeadSha: SHA_A, currentScope: "UNIT_INTEGRATION", changeImpact: impact({ publicAuthorityCutover: true, currentAuthorityChanged: true }) },
  });
  assert.equal(r.lastDerivedLane, "UNIT_FULL_ONCE");
  assert.equal(decideFullRegressionExecution({ policy: POLICY, lane: r.lastDerivedLane, exactHeadSha: SHA_A, evidenceLedger: [] }).action, "RUN_REQUIRED");
});

test("Same exact-head full regression PASS must be reused", () => {
  const ledger = [evidence("full-pass-a", "FULL_NODE_REGRESSION", SHA_A)];
  const decision = decideFullRegressionExecution({ policy: POLICY, lane: "UNIT_FULL_ONCE", exactHeadSha: SHA_A, evidenceLedger: ledger });
  assert.equal(decision.action, "REUSE_EXISTING_EVIDENCE");
  assert.equal(decision.runFullRegression, false);
  const changedHead = decideFullRegressionExecution({ policy: POLICY, lane: "UNIT_FULL_ONCE", exactHeadSha: SHA_B, evidenceLedger: ledger });
  assert.equal(changedHead.action, "RUN_REQUIRED");
});

test("Any shared runtime change derives GLOBAL_CERTIFICATION per mandatory source authority", () => {
  assert.equal(
    deriveValidationLane({ policy: POLICY, state: "KP_VALIDATING", currentScope: "SHARED_RUNTIME", changeImpact: impact({ sharedExecutableChange: true }) }),
    "GLOBAL_CERTIFICATION",
  );
  assert.equal(
    deriveValidationLane({ policy: POLICY, state: "KP_VALIDATING", currentScope: "SHARED_RUNTIME", changeImpact: impact({ sharedExecutableChange: true, affectedRoutes: "UNBOUNDED" }) }),
    "GLOBAL_CERTIFICATION",
  );
  assert.equal(
    deriveValidationLane({ policy: POLICY, state: "UNIT_INTEGRATING", currentScope: "UNIT_INTEGRATION", changeImpact: impact({ legalRouteSemanticsChanged: true }) }),
    "GLOBAL_CERTIFICATION",
  );
});

test("Unit integration PASS consumes required exact-head evidence and closeout cannot trigger a new regression", () => {
  let r = record({ state: "UNIT_INTEGRATING", knowledgePointGateStatus: { kp_a: "FOCUSED_PASS", kp_b: "FOCUSED_PASS" }, lastDerivedLane: "UNIT_FULL_ONCE" });
  const rows = [
    evidence("unit-integration", "UNIT_INTEGRATION_TEST"),
    evidence("full", "FULL_NODE_REGRESSION"),
    evidence("contracts", "GLOBAL_CONTRACTS"),
    evidence("browser", "UNIT_TARGETED_BROWSER_MATRIX"),
  ];
  r = transitionUnitValidationState({ machine: MACHINE, policy: POLICY, record: r, event: "PASS_UNIT_INTEGRATION_GATE", request: { exactHeadSha: SHA_A, evidence: rows } });
  const closed = transitionUnitValidationState({ machine: MACHINE, policy: POLICY, record: r, event: "CLOSE_UNIT_D0", request: { exactHeadSha: SHA_A } });
  assert.equal(closed.state, "UNIT_D0");
  assert.equal(closed.evidenceLedger.filter((row) => row.gateId === "FULL_NODE_REGRESSION").length, 1);
});

test("Illegal state jumps and wrong-head evidence fail closed", () => {
  assert.throws(
    () => transitionUnitValidationState({ machine: MACHINE, policy: POLICY, record: record({ state: "KP_READY" }), event: "START_UNIT_INTEGRATION", request: { exactHeadSha: SHA_A, currentScope: "UNIT_INTEGRATION", changeImpact: impact() } }),
    (error) => error.code === "UIV_ILLEGAL_STATE_TRANSITION",
  );
  const validating = record({ state: "KP_VALIDATING", currentKnowledgePointId: "kp_a" });
  assert.throws(
    () => transitionUnitValidationState({ machine: MACHINE, policy: POLICY, record: validating, event: "PASS_KP_FOCUSED_GATE", request: { exactHeadSha: SHA_A, evidence: [evidence("wrong-head", "KP_FOCUSED_GATE", SHA_B)] } }),
    (error) => error.code === "UIV_EVIDENCE_EXACT_HEAD_MISMATCH",
  );
});
