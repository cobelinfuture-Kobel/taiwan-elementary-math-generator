from __future__ import annotations

import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
DATA = ROOT / "data/curriculum/public-generation"
TESTS = ROOT / "tests/curriculum"
PLAN_PATH = DATA / "PGC-R08-A04-A06.capacity-shortfall-plan.json"
READBACK_PATH = DATA / "PGC-R08-A04-A06.capacity-shortfall-readback.json"
ACTIVE_PATH = DATA / "PGC-R08-A04.active-repair-state.json"
NEXT_TASK = "PGC-R08-A04-A07_FinalGlobalReconciliationAndD0Closeout"
HEAD_SHA = "5291b4b76afac35fb5d11f93d335b829acd6edf3"


def read_json(path: pathlib.Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: pathlib.Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def replace_test(path: pathlib.Path, title: str, replacement: str) -> None:
    text = path.read_text(encoding="utf-8")
    pattern = re.compile(r'test\("' + re.escape(title) + r'", \(\) => \{.*?\n\}\);', re.S)
    updated, count = pattern.subn(replacement, text, count=1)
    if count != 1:
        raise RuntimeError(f"test block not found: {path}: {title}")
    path.write_text(updated, encoding="utf-8")


plan = read_json(PLAN_PATH)
plan["status"] = "PASS_CAPACITY_SHORTFALL_3_OF_3"
plan["readbackPath"] = "data/curriculum/public-generation/PGC-R08-A04-A06.capacity-shortfall-readback.json"
plan["rootCause"] = {
    "classification": "CLASSIC_DEFAULT_PATTERN_GROUP_EXPANSION_BEFORE_W1_APPLICATION_ADMISSION",
    "evidence": {
        "directRouterQuestionCount": 20,
        "queryStatePipelineQuestionCount": 20,
        "classicExpandedPatternGroupCounts": [7, 5, 5],
        "productionAdmittedPatternGroupCounts": [4, 3, 2],
        "preRepairProjectedQuestionCounts": [11, 12, 8],
        "preRepairFailureCode": "P01E_APPLICATION_COVERAGE_INCOMPLETE",
    },
}
plan["repairContract"].update({
    "classicDefaultPatternGroupProjectionRequired": True,
    "productionAdmittedApplicationGroupsOnly": True,
    "knowledgePointSelectionPreserved": True,
    "questionCountPreserved": True,
})
plan["acceptance"].update({
    "fullRegression": {"tests": 2796, "pass": 2796, "fail": 0, "cancelled": 0, "skipped": 0},
    "workflowRunId": 30678331686,
    "workflowJobId": 91310045631,
    "nodeWorkflowRunId": 30678331706,
    "nodeWorkflowJobId": 91310082587,
    "validatedContentHeadSha": HEAD_SHA,
    "artifactId": 8811336066,
    "artifactDigest": "sha256:80344fb38e2539bf7e1c99ceaf364b2e87bc8a76dfd3f730f445ed1299c490be",
    "evidenceFinalized": False,
})
write_json(PLAN_PATH, plan)

readback = {
    "schemaName": "PGCR08A04A06CapacityShortfallReadbackV1",
    "schemaVersion": 1,
    "programId": plan["programId"],
    "taskId": plan["taskId"],
    "status": "PASS_CODE_FULL_REGRESSION_AND_EXACT_3_ROUTE_REPLAY",
    "planPath": "data/curriculum/public-generation/PGC-R08-A04-A06.capacity-shortfall-plan.json",
    "activeStatePath": "data/curriculum/public-generation/PGC-R08-A04.active-repair-state.json",
    "targetRouteCount": 3,
    "targetRouteIds": plan["targetRouteIds"],
    "workflowEvidence": {
        "workflowName": "PGC-R00 Public Generation Scope Freeze",
        "singleJobName": "scope-freeze",
        "workflowRunId": 30678331686,
        "workflowJobId": 91310045631,
        "validatedContentHeadSha": HEAD_SHA,
        "artifactId": 8811336066,
        "artifactDigest": "sha256:80344fb38e2539bf7e1c99ceaf364b2e87bc8a76dfd3f730f445ed1299c490be",
    },
    "nodeEvidence": {
        "workflowRunId": 30678331706,
        "workflowJobId": 91310082587,
        "diagnosticArtifactId": 8811336465,
        "diagnosticArtifactDigest": "sha256:431d25b4dc2584dc5ffa12db074f9f3e16f1bcc4ad48be26078b0fec4cf2ced7",
    },
    "fullRegression": {"tests": 2796, "pass": 2796, "fail": 0, "cancelled": 0, "skipped": 0},
    "exactReplay": {
        "targetRouteCount": 3,
        "terminalRouteCount": 3,
        "fullNineGatePassCount": 3,
        "failedRouteCount": 0,
        "questionCountPassCount": 3,
        "generateButtonPassCount": 3,
        "browserConsoleErrorCount": 0,
        "browserPageErrorCount": 0,
        "bootstrapEventCount": 3,
        "binderEventCount": 21,
        "controlEventCount": 9,
    },
    "repairSummary": {
        "classicSelectionProjection": "Classic default-expanded base PatternGroups project to production-admitted W1 application groups before current-router generation",
        "currentRouterQuestionAuthority": "All three routes consume the current Batch A browser router at twenty questions",
        "applicationAdmission": "Every generated question passes existing W1 global-context application admission",
        "capacityAuthority": "Unchanged",
    },
    "invariants": {
        "selectedKnowledgePointsPreserved": True,
        "requestedQuestionCountPreserved": True,
        "answersPreserved": True,
        "capacityAuthorityMutated": False,
        "generatorRuntimeMutated": False,
        "validatorMutated": False,
        "rendererMutated": False,
        "perRoutePatchUsed": False,
    },
    "routeStateDelta": {
        "cumulativePassRouteCountBefore": 790,
        "cumulativePassRouteCountAfter": 793,
        "unresolvedFailedRouteCountBefore": 3,
        "unresolvedFailedRouteCountAfter": 0,
        "closedOriginalFailureRouteCountBefore": 326,
        "closedOriginalFailureRouteCountAfter": 327,
        "reclassifiedUnresolvedRouteCountBefore": 3,
        "reclassifiedUnresolvedRouteCountAfter": 0,
    },
    "nextTask": NEXT_TASK,
}
write_json(READBACK_PATH, readback)

active = read_json(ACTIVE_PATH)
active["taskId"] = plan["taskId"]
active["status"] = "PASS_ALL_793_LEGAL_ROUTES_CLOSED"
active["sourceReadbackPath"] = readback["planPath"].replace("plan.json", "readback.json")
active["current"] = {
    "cumulativePassRouteCount": 793,
    "unresolvedFailedRouteCount": 0,
    "closedOriginalFailureRouteCount": 327,
    "reclassifiedUnresolvedRouteCount": 0,
}
active["closedFamilies"].append({
    "failureFamily": "CAPACITY_EVIDENCE_RECONCILIATION",
    "historicalReconciliationRouteCount": 35,
    "activeShortfallOverlayCount": 3,
    "endToEndPassCount": 3,
    "status": "CLOSED_ACTIVE_CAPACITY_SHORTFALL_BLOCKER_REMOVED",
    "readbackPath": "data/curriculum/public-generation/PGC-R08-A04-A06.capacity-shortfall-readback.json",
})
active["pendingFamilies"] = []
active["reconciliation"] = {
    "pendingFailedRouteCount": 0,
    "pendingFailureFamiliesExcludingCapacityReconciliation": 0,
    "activeCapacityShortfallRouteCount": 0,
    "capacityReconciliationRouteCount": 38,
    "capacityReconciliationOverlapWithPendingFailureCount": 0,
    "allLegalRoutesConformant": True,
    "nextRepairPosition": 6,
    "nextTask": NEXT_TASK,
}
write_json(ACTIVE_PATH, active)

replace_test(
    TESTS / "pgc-r08-a04-a02-disabled-control-family-replay.test.js",
    "A02 historical readback remains immutable while active state advances after A05",
    '''test("A02 historical readback remains immutable while active state advances through A06", () => {
  assert.equal(readback.replaySummary.endToEndPassRouteCount, 179);
  assert.equal(readback.transferredRoutes.length, 1);
  assert.equal(activeState.status, "PASS_ALL_793_LEGAL_ROUTES_CLOSED");
  assert.equal(activeState.current.cumulativePassRouteCount, 793);
  assert.equal(activeState.current.unresolvedFailedRouteCount, 0);
  assert.equal(activeState.current.closedOriginalFailureRouteCount, 327);
  assert.equal(activeState.pendingFamilies.length, 0);
  assert.equal(activeState.reconciliation.activeCapacityShortfallRouteCount, 0);
  assert.equal(activeState.reconciliation.pendingFailedRouteCount, 0);
  assert.equal(activeState.reconciliation.nextRepairPosition, 6);
  assert.equal(activeState.reconciliation.nextTask, "PGC-R08-A04-A07_FinalGlobalReconciliationAndD0Closeout");
});''',
)

replace_test(
    TESTS / "pgc-r08-a04-a03-a01-exact-pattern-group-binder.test.js",
    "active repair state advances through A05 without double-counting capacity overlap",
    '''test("active repair state closes all A06 capacity residuals without double-counting overlap", () => {
  assert.equal(activeState.status, "PASS_ALL_793_LEGAL_ROUTES_CLOSED");
  assert.equal(activeState.current.cumulativePassRouteCount, 793);
  assert.equal(activeState.current.unresolvedFailedRouteCount, 0);
  assert.equal(activeState.current.closedOriginalFailureRouteCount, 327);
  assert.equal(activeState.current.reclassifiedUnresolvedRouteCount, 0);
  assert.equal(activeState.reconciliation.pendingFailureFamiliesExcludingCapacityReconciliation, 0);
  assert.equal(activeState.reconciliation.activeCapacityShortfallRouteCount, 0);
  assert.equal(activeState.reconciliation.capacityReconciliationRouteCount, 38);
  assert.equal(activeState.reconciliation.capacityReconciliationOverlapWithPendingFailureCount, 0);
  assert.equal(activeState.reconciliation.nextRepairPosition, 6);
  assert.equal(activeState.reconciliation.nextTask, "PGC-R08-A04-A07_FinalGlobalReconciliationAndD0Closeout");
  assert.equal(activeState.pendingFamilies.length, 0);
});''',
)

replace_test(
    TESTS / "pgc-r08-a04-a04-question-type-state-settlement.test.js",
    "active state preserves A04 reconciliation while A05 closes the transferred regenerate family",
    '''test("active state preserves A04 history while A06 closes the final capacity residuals", () => {
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
});''',
)

replace_test(
    TESTS / "pgc-r08-a04-a05-regenerate-identity.test.js",
    "A05 committed readback records 10 of 10 nine-gate PASS and the next active family",
    '''test("A05 committed readback remains immutable while active state advances through A06", () => {
  assert.equal(readback.status, "PASS_CODE_FULL_REGRESSION_AND_EXACT_10_ROUTE_REPLAY");
  assert.deepEqual(readback.fullRegression, { tests: 2790, pass: 2790, fail: 0, cancelled: 0, skipped: 0 });
  assert.deepEqual(readback.exactReplay, {
    targetRouteCount: 10,
    terminalRouteCount: 10,
    fullNineGatePassCount: 10,
    regenerateIdentityResidualCount: 0,
    browserConsoleErrorCount: 0,
    browserPageErrorCount: 0,
    bootstrapEventCount: 10,
    binderEventCount: 42,
    controlEventCount: 32,
  });
  assert.equal(readback.invariants.validatorRulesUnchanged, true);
  assert.equal(readback.invariants.historicalQueueUnchanged, true);
  assert.equal(activeState.current.cumulativePassRouteCount, 793);
  assert.equal(activeState.current.unresolvedFailedRouteCount, 0);
  assert.equal(activeState.reconciliation.nextRepairPosition, 6);
  assert.equal(activeState.reconciliation.nextTask, "PGC-R08-A04-A07_FinalGlobalReconciliationAndD0Closeout");
});''',
)

a06_path = TESTS / "pgc-r08-a04-a06-capacity-shortfall.test.js"
a06 = a06_path.read_text(encoding="utf-8")
marker = '''const plan = JSON.parse(await readFile(
  "data/curriculum/public-generation/PGC-R08-A04-A06.capacity-shortfall-plan.json",
  "utf8",
));'''
if marker not in a06:
    raise RuntimeError("A06 plan marker missing")
a06 = a06.replace(marker, marker + '''
const readback = JSON.parse(await readFile(plan.readbackPath, "utf8"));
const activeState = JSON.parse(await readFile(plan.activeStatePath, "utf8"));''', 1)
a06 = a06.replace(
    'assert.equal(plan.status, "IMPLEMENTATION_PENDING_EXACT_REPLAY");',
    'assert.equal(plan.status, "PASS_CAPACITY_SHORTFALL_3_OF_3");',
    1,
)
closeout_marker = '\ntest("A06 repair is shared and does not mutate capacity, generator runtimes, validators, or renderer", () => {'
closeout_test = '''

test("A06 closeout records 3 of 3 nine-gate PASS and advances to final reconciliation", () => {
  assert.equal(readback.status, "PASS_CODE_FULL_REGRESSION_AND_EXACT_3_ROUTE_REPLAY");
  assert.deepEqual(readback.fullRegression, { tests: 2796, pass: 2796, fail: 0, cancelled: 0, skipped: 0 });
  assert.deepEqual(readback.exactReplay, {
    targetRouteCount: 3,
    terminalRouteCount: 3,
    fullNineGatePassCount: 3,
    failedRouteCount: 0,
    questionCountPassCount: 3,
    generateButtonPassCount: 3,
    browserConsoleErrorCount: 0,
    browserPageErrorCount: 0,
    bootstrapEventCount: 3,
    binderEventCount: 21,
    controlEventCount: 9,
  });
  assert.equal(activeState.status, "PASS_ALL_793_LEGAL_ROUTES_CLOSED");
  assert.equal(activeState.current.cumulativePassRouteCount, 793);
  assert.equal(activeState.current.unresolvedFailedRouteCount, 0);
  assert.equal(activeState.current.closedOriginalFailureRouteCount, 327);
  assert.equal(activeState.current.reclassifiedUnresolvedRouteCount, 0);
  assert.equal(activeState.pendingFamilies.length, 0);
  assert.equal(activeState.reconciliation.allLegalRoutesConformant, true);
  assert.equal(activeState.reconciliation.nextRepairPosition, 6);
  assert.equal(activeState.reconciliation.nextTask, "PGC-R08-A04-A07_FinalGlobalReconciliationAndD0Closeout");
});
'''
if closeout_marker not in a06:
    raise RuntimeError("A06 closeout marker missing")
a06 = a06.replace(closeout_marker, closeout_test + closeout_marker, 1)
a06_path.write_text(a06, encoding="utf-8")

print(json.dumps({
    "status": "PASS_A06_CLOSEOUT_MATERIALIZED",
    "plan": str(PLAN_PATH.relative_to(ROOT)),
    "readback": str(READBACK_PATH.relative_to(ROOT)),
    "activeState": str(ACTIVE_PATH.relative_to(ROOT)),
}, ensure_ascii=False, indent=2))
