const HEX40 = /^[0-9a-f]{40}$/i;

function fail(code, detail = null) {
  const error = new Error(code);
  error.code = code;
  error.detail = detail;
  throw error;
}

function requireBooleanFields(impact) {
  for (const key of [
    "sharedExecutableChange",
    "publicAuthorityCutover",
    "legalRouteSemanticsChanged",
    "globalReleaseCheckpoint",
    "currentAuthorityChanged",
  ]) {
    if (typeof impact?.[key] !== "boolean") fail("UIV_IMPACT_BOOLEAN_FIELD_INVALID", { key, value: impact?.[key] });
  }
  if (!["BOUNDED", "UNBOUNDED", "UNKNOWN"].includes(impact?.affectedRoutes)) {
    fail("UIV_AFFECTED_ROUTES_INVALID", impact?.affectedRoutes);
  }
}

function assertExpectedKnowledgePoints(record) {
  const ids = record.expectedKnowledgePointIds;
  const status = record.knowledgePointGateStatus;
  if (!Array.isArray(ids) || ids.length === 0 || new Set(ids).size !== ids.length) {
    fail("UIV_EXPECTED_KP_SET_INVALID", ids);
  }
  if (!status || typeof status !== "object" || Array.isArray(status)) {
    fail("UIV_KP_STATUS_MAP_INVALID", status);
  }
  const keys = Object.keys(status).sort();
  const expected = [...ids].sort();
  if (JSON.stringify(keys) !== JSON.stringify(expected)) {
    fail("UIV_KP_STATUS_KEYS_MISMATCH", { expected, actual: keys });
  }
  for (const [id, value] of Object.entries(status)) {
    if (!["PENDING", "FOCUSED_PASS", "BLOCKED"].includes(value)) {
      fail("UIV_KP_STATUS_INVALID", { id, value });
    }
  }
}

function allKnowledgePointsFocusedPass(record) {
  assertExpectedKnowledgePoints(record);
  return record.expectedKnowledgePointIds.every((id) => record.knowledgePointGateStatus[id] === "FOCUSED_PASS");
}

export function deriveValidationLane({ policy, state, currentScope, changeImpact }) {
  if (!policy || policy.policyId !== "UNIT_INCREMENTAL_VALIDATION_V1") fail("UIV_POLICY_INVALID", policy?.policyId);
  requireBooleanFields(changeImpact);

  const globalEscalation = changeImpact.sharedExecutableChange
    || changeImpact.legalRouteSemanticsChanged
    || changeImpact.globalReleaseCheckpoint
    || ["UNBOUNDED", "UNKNOWN"].includes(changeImpact.affectedRoutes);

  if (currentScope === "KP_LEAF") {
    const violated = [];
    if (changeImpact.sharedExecutableChange) violated.push("sharedExecutableChange");
    if (changeImpact.publicAuthorityCutover) violated.push("publicAuthorityCutover");
    if (changeImpact.legalRouteSemanticsChanged) violated.push("legalRouteSemanticsChanged");
    if (changeImpact.globalReleaseCheckpoint) violated.push("globalReleaseCheckpoint");
    if (changeImpact.currentAuthorityChanged) violated.push("currentAuthorityChanged");
    if (changeImpact.affectedRoutes !== "BOUNDED") violated.push("affectedRoutes");
    if (violated.length) fail("UIV_SCOPE_INFLATION", violated);
    if (state !== "KP_VALIDATING" && state !== "KP_READY" && state !== "KP_FOCUSED_PASS") {
      fail("UIV_KP_SCOPE_STATE_MISMATCH", { state });
    }
    return "KP_FOCUSED";
  }

  if (currentScope === "GLOBAL_RELEASE") {
    if (!changeImpact.globalReleaseCheckpoint) fail("UIV_GLOBAL_RELEASE_CHECKPOINT_REQUIRED");
    return "GLOBAL_CERTIFICATION";
  }

  if (currentScope === "SHARED_RUNTIME") {
    if (!changeImpact.sharedExecutableChange) fail("UIV_SHARED_RUNTIME_FLAG_REQUIRED");
    return "GLOBAL_CERTIFICATION";
  }

  if (currentScope === "UNIT_INTEGRATION") {
    if (state !== "UNIT_KPS_COMPLETE" && state !== "UNIT_INTEGRATING" && state !== "UNIT_VALIDATED") {
      fail("UIV_UNIT_SCOPE_STATE_MISMATCH", { state });
    }
    if (changeImpact.sharedExecutableChange) fail("UIV_UNIT_INTEGRATION_SHARED_RUNTIME_RECLASSIFY_REQUIRED");
    if (changeImpact.globalReleaseCheckpoint) fail("UIV_UNIT_INTEGRATION_GLOBAL_RELEASE_RECLASSIFY_REQUIRED");
    if (globalEscalation) return "GLOBAL_CERTIFICATION";
    return "UNIT_FULL_ONCE";
  }

  fail("UIV_CURRENT_SCOPE_INVALID", currentScope);
}

export function decideFullRegressionExecution({ policy, lane, exactHeadSha, evidenceLedger = [] }) {
  if (!policy?.lanes?.[lane]) fail("UIV_LANE_INVALID", lane);
  if (!HEX40.test(exactHeadSha ?? "")) fail("UIV_EXACT_HEAD_SHA_INVALID", exactHeadSha);
  const lanePolicy = policy.lanes[lane];
  if (!lanePolicy.fullRegression) {
    return { action: "FORBIDDEN", runFullRegression: false, reason: "LANE_FORBIDS_FULL_REGRESSION" };
  }
  const priorPass = evidenceLedger.find((row) =>
    row?.exactHeadSha === exactHeadSha
    && row?.status === "PASS"
    && row?.gateId === "FULL_NODE_REGRESSION"
  );
  if (priorPass) {
    return {
      action: "REUSE_EXISTING_EVIDENCE",
      runFullRegression: false,
      evidenceId: priorPass.evidenceId,
      reason: "SAME_EXACT_HEAD_PASS_MUST_REUSE",
    };
  }
  return { action: "RUN_REQUIRED", runFullRegression: true, reason: "NO_PASS_EVIDENCE_FOR_EXACT_HEAD" };
}

function findTransition(machine, from, event) {
  const row = machine.transitions.find((candidate) => candidate.from === from && candidate.event === event);
  if (!row) fail("UIV_ILLEGAL_STATE_TRANSITION", { from, event });
  return row;
}

function requirePassEvidence(evidence, expectedGateId, exactHeadSha) {
  const row = (evidence ?? []).find((candidate) => candidate.gateId === expectedGateId && candidate.status === "PASS");
  if (!row) fail("UIV_REQUIRED_GATE_EVIDENCE_MISSING", expectedGateId);
  if (row.exactHeadSha !== exactHeadSha) fail("UIV_EVIDENCE_EXACT_HEAD_MISMATCH", { expected: exactHeadSha, actual: row.exactHeadSha });
  return row;
}

export function transitionUnitValidationState({ machine, policy, record, event, request = {} }) {
  if (!machine || machine.machineId !== "UNIT_VALIDATION_STATE_MACHINE_V1") fail("UIV_STATE_MACHINE_INVALID", machine?.machineId);
  if (!policy || policy.policyId !== machine.policyId) fail("UIV_STATE_MACHINE_POLICY_MISMATCH");
  if (!machine.states.includes(record?.state)) fail("UIV_CURRENT_STATE_INVALID", record?.state);
  if (!HEX40.test(request.exactHeadSha ?? "")) fail("UIV_EXACT_HEAD_SHA_INVALID", request.exactHeadSha);

  assertExpectedKnowledgePoints(record);

  if (event === "RECORD_GATE_FAILURE") {
    if (!request.blocker) fail("UIV_GATE_FAILURE_BLOCKER_REQUIRED");
    return {
      ...record,
      lastExactHeadSha: request.exactHeadSha,
      blocker: request.blocker,
      transitionHistory: [...(record.transitionHistory ?? [])],
    };
  }

  const transition = findTransition(machine, record.state, event);
  const next = structuredClone(record);
  next.transitionHistory = [...(record.transitionHistory ?? [])];
  next.evidenceLedger = [...(record.evidenceLedger ?? [])];

  switch (event) {
    case "LOCK_UNIT_AUTHORITY": {
      break;
    }
    case "START_KP_VALIDATION": {
      const kpId = request.currentKnowledgePointId;
      if (!record.expectedKnowledgePointIds.includes(kpId)) fail("UIV_CURRENT_KP_NOT_EXPECTED", kpId);
      if (record.knowledgePointGateStatus[kpId] === "FOCUSED_PASS") fail("UIV_CURRENT_KP_ALREADY_FOCUSED_PASS", kpId);
      next.currentKnowledgePointId = kpId;
      const lane = deriveValidationLane({
        policy,
        state: "KP_VALIDATING",
        currentScope: request.currentScope,
        changeImpact: request.changeImpact,
      });
      if (lane !== "KP_FOCUSED") fail("UIV_KP_VALIDATION_LANE_INVALID", lane);
      next.lastDerivedLane = lane;
      break;
    }
    case "PASS_KP_FOCUSED_GATE": {
      if (!record.currentKnowledgePointId) fail("UIV_CURRENT_KP_REQUIRED");
      const evidence = requirePassEvidence(request.evidence, "KP_FOCUSED_GATE", request.exactHeadSha);
      next.knowledgePointGateStatus[record.currentKnowledgePointId] = "FOCUSED_PASS";
      next.evidenceLedger.push(evidence);
      break;
    }
    case "SELECT_NEXT_KP": {
      if (allKnowledgePointsFocusedPass(record)) fail("UIV_ALL_KPS_ALREADY_FOCUSED_PASS");
      next.currentKnowledgePointId = null;
      break;
    }
    case "CONFIRM_ALL_KPS_FOCUSED_PASS": {
      if (!allKnowledgePointsFocusedPass(record)) fail("UIV_UNIT_KPS_NOT_COMPLETE");
      next.currentKnowledgePointId = null;
      break;
    }
    case "START_UNIT_INTEGRATION": {
      if (!allKnowledgePointsFocusedPass(record)) fail("UIV_UNIT_INTEGRATION_NOT_ELIGIBLE");
      const lane = deriveValidationLane({
        policy,
        state: "UNIT_INTEGRATING",
        currentScope: request.currentScope,
        changeImpact: request.changeImpact,
      });
      next.lastDerivedLane = lane;
      next.currentKnowledgePointId = null;
      break;
    }
    case "PASS_UNIT_INTEGRATION_GATE": {
      const lane = record.lastDerivedLane;
      if (!["UNIT_FULL_ONCE", "GLOBAL_CERTIFICATION"].includes(lane)) {
        fail("UIV_UNIT_VALIDATION_LANE_INVALID", lane);
      }
      const lanePolicy = policy.lanes[lane];
      for (const gateId of lanePolicy.requiredGates) {
        if (gateId === "FULL_NODE_REGRESSION_ONCE" || gateId === "FULL_NODE_REGRESSION") {
          const decision = decideFullRegressionExecution({
            policy,
            lane,
            exactHeadSha: request.exactHeadSha,
            evidenceLedger: [...next.evidenceLedger, ...(request.evidence ?? [])],
          });
          if (decision.action === "RUN_REQUIRED") {
            requirePassEvidence(request.evidence, "FULL_NODE_REGRESSION", request.exactHeadSha);
          }
        } else {
          requirePassEvidence(request.evidence, gateId, request.exactHeadSha);
        }
      }
      for (const row of request.evidence ?? []) {
        if (!next.evidenceLedger.some((existing) => existing.evidenceId === row.evidenceId)) next.evidenceLedger.push(row);
      }
      break;
    }
    case "CLOSE_UNIT_D0": {
      const fullRegressionDecision = record.lastDerivedLane
        ? decideFullRegressionExecution({
            policy,
            lane: record.lastDerivedLane,
            exactHeadSha: request.exactHeadSha,
            evidenceLedger: record.evidenceLedger,
          })
        : null;
      if (fullRegressionDecision?.action === "RUN_REQUIRED") {
        fail("UIV_D0_CLOSEOUT_CANNOT_TRIGGER_NEW_FULL_REGRESSION", fullRegressionDecision);
      }
      break;
    }
    default:
      fail("UIV_EVENT_UNHANDLED", event);
  }

  next.state = transition.to;
  next.lastExactHeadSha = request.exactHeadSha;
  next.blocker = null;
  next.transitionHistory.push({
    from: transition.from,
    event,
    to: transition.to,
    exactHeadSha: request.exactHeadSha,
    evidenceIds: (request.evidence ?? []).map((row) => row.evidenceId),
  });
  return next;
}
