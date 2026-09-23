# GCI-S02 Single PR Gate Orchestrator Pilot Closeout

```text
PROGRAM_ID = GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1
TASK_ID    = GCI-S02_SinglePrGateOrchestratorPilot
STATUS     = IMPLEMENTED_PENDING_CI_TERMINAL_BARRIER
```

## Scope lock

This milestone changes GitHub Actions governance only.

Included:

- a read-only `PR Gate Pilot` workflow;
- governance-path pull-request triggering;
- change detection;
- focused GCI governance QA;
- exactly one full repository regression inside the pilot workflow;
- one stable aggregate check;
- deterministic pilot contract and tests.

Excluded:

- PGC production implementation;
- generator, validator, renderer, worksheet, UI, curriculum or source data;
- branch protection and required-check settings;
- retirement or trigger modification of existing workflows;
- any repository other than the math repository.

## Pilot topology

```text
pull_request on GitHub Actions governance paths
→ detect_changes
→ focused_governance
→ full_regression
→ PR Gate / aggregate
```

## Policy conformance

```text
CONTENTS_PERMISSION              = read
PR_BRANCH_WRITE                  = false
GIT_COMMIT_PUSH_REBASE           = absent
CONCURRENCY_CANCEL_IN_PROGRESS   = true
PILOT_FULL_REGRESSION_COUNT      = 1
AGGREGATE_CHECK_NAME             = PR Gate / aggregate
LEGACY_WORKFLOWS_MODIFIED        = false
BRANCH_PROTECTION_MODIFIED       = false
```

S02 intentionally runs beside the existing legacy workflows. Their pull-request triggers and duplicate regressions remain unchanged until `GCI-S03_LegacyWorkflowRetirement`.

## Historical evidence rule

S01 remains the immutable 110-workflow pre-pilot snapshot. Its replay explicitly excludes `.github/workflows/pr-gate.yml`. The live S02 inventory must contain 111 workflows and identify `pr-gate` as `PILOT_ORCHESTRATOR`.

## Acceptance

```text
FOCUSED_GCI_GOVERNANCE_QA = REQUIRED
FULL_REPOSITORY_REGRESSION = REQUIRED
PR_GATE_AGGREGATE          = REQUIRED
CI_TERMINAL_BARRIER        = REQUIRED
PR_BRANCH_WRITES           = 0
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D3_EXHAUSTIVE_MATH_WORKFLOW_AUTHORITY_AND_FANOUT_EVIDENCE_LOCKED
GOAL_DISTANCE_AFTER  = D2_SINGLE_READ_ONLY_PR_GATE_PILOT_IMPLEMENTED_PENDING_LEGACY_RETIREMENT
DISTANCE_REDUCED     = The repository now has one read-only orchestrator candidate with a stable aggregate check,
                       change detection, focused governance QA and one internal full-regression path.
REMAINING_BLOCKERS   = [
  LEGACY_PULL_REQUEST_WORKFLOWS_STILL_ACTIVE,
  LEGACY_PR_BRANCH_WRITERS_STILL_ACTIVE,
  DUPLICATE_FULL_REGRESSIONS_OUTSIDE_PR_GATE_STILL_ACTIVE,
  REQUIRED_CHECKS_NOT_MIGRATED
]
NEXT_SHORTEST_STEP   = GCI-S03_LegacyWorkflowRetirement
```

## Task closeout rule

```text
1. DISTANCE SEGMENT SHORTENED =
   INVENTORY_ONLY -> EXECUTABLE_SINGLE_GATE_PILOT

2. SYSTEM NODE ADVANCED =
   WORKFLOW_REGISTRY -> PR_GATE_ORCHESTRATOR

3. BLOCKER REMOVED =
   SINGLE_PR_GATE_ORCHESTRATOR_NOT_IMPLEMENTED

4. NEW BLOCKER ADDED =
   NONE

5. NEXT SHORTEST EFFECTIVE STEP =
   GCI-S03_LegacyWorkflowRetirement
```
