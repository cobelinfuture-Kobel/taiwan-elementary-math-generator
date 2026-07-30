# GCI-S01 Math Repository Workflow Inventory and Fan-out Closeout

```text
PROGRAM_ID = GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1
TASK_ID    = GCI-S01_MathRepositoryWorkflowInventoryAndFanoutMatrix
STATUS     = PASS_EXHAUSTIVE_INVENTORY_MATERIALIZED_PENDING_FINAL_CI
```

## Scope lock

This milestone inventories the math repository CI surface and materializes governance evidence only. It does not modify workflow behavior, branch protection, required checks, workflow lifecycle state, or PGC production implementation.

## Authority snapshot

```text
INVENTORY_AS_OF_COMMIT            = 364900d8cc151b13aada07c135e5275c3e31546b
WORKFLOW_FILE_COUNT               = 110
PULL_REQUEST_WORKFLOW_COUNT       = 66
PR_BRANCH_WRITER_COUNT            = 20
PR_FULL_REGRESSION_WORKFLOW_COUNT = 24
LATE_SKIP_CANDIDATE_COUNT         = 27
SHARED_EXACT_PATH_PATTERN_COUNT   = 79
```

The inventory was derived from every `.yml` and `.yaml` file under `.github/workflows` in the authority snapshot. The three detailed JSON authorities are deterministically Brotli-compressed and accompanied by SHA-256 evidence in `.github/ci/gci-s01/evidence-manifest.json`.

## Materialized evidence

```text
.github/ci/gci-s01/workflow-inventory.json.br
.github/ci/gci-s01/workflow-fanout-matrix.json.br
.github/ci/gci-s01/workflow-ownership-readback.json.br
.github/ci/gci-s01/evidence-manifest.json
```

## Ownership readback

```text
POLICY_TARGET_TOP_LEVEL_PR_WORKFLOWS = 1
OBSERVED_TOP_LEVEL_PR_WORKFLOWS      = 66

POLICY_TARGET_PR_BRANCH_WRITERS      = 0
OBSERVED_PR_BRANCH_WRITERS           = 20

POLICY_TARGET_FULL_REGRESSION_OWNER  = 1
OBSERVED_PR_FULL_REGRESSION_RUNNERS  = 24

BOOTSTRAP_PR_AUTHORITY               = node-test
```

The S00 bootstrap registry remains unchanged and keeps `node-test` as the sole current `PR_AUTHORITY`. S01 records the other 23 PR workflows that execute `npm test` in the exhaustive ownership readback; no existing workflow is changed or retired.

## Fan-out findings

The exhaustive matrix records 79 exact path patterns owned by more than one pull-request workflow. It also records 27 workflows that use `github.head_ref` gating after the top-level workflow has already been created. These are evidence inputs for S02; S01 does not alter trigger behavior.

## Open nonconformities

```text
GCI-NC-001 = 20 PR branch writers
GCI-NC-002 = 24 PR full-regression runners
GCI-NC-003 = 66 top-level PR workflows
GCI-NC-004 = 27 late job-level skip candidates
GCI-NC-005 = 79 shared exact PR path patterns
GCI-NC-006 = required-check / branch-protection evidence unverified
```

## Acceptance

```text
SCHEMA_REGISTRY_QA                 = REQUIRED
EXHAUSTIVE_INVENTORY_REPLAY_QA     = REQUIRED
FANOUT_MATRIX_EQUIVALENCE_QA       = REQUIRED
OWNERSHIP_READBACK_EQUIVALENCE_QA  = REQUIRED
FULL_REPOSITORY_REGRESSION         = REQUIRED
CI_TERMINAL_BARRIER                = REQUIRED
CONSOLIDATED_FINAL_PUSH_COUNT      = 1
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D3_MACHINE_READABLE_POLICY_AND_BOOTSTRAP_REGISTRY_LOCKED
GOAL_DISTANCE_AFTER  = D3_EXHAUSTIVE_MATH_WORKFLOW_AUTHORITY_AND_FANOUT_EVIDENCE_LOCKED
DISTANCE_REDUCED     = Bootstrap partial registry augmented by a complete 110-workflow authority,
                       with exact trigger, path-overlap, branch-writer, regression-owner,
                       late-skip and lifecycle-disposition evidence.
REMAINING_BLOCKERS   = [
  SINGLE_PR_GATE_ORCHESTRATOR_NOT_IMPLEMENTED,
  PR_BRANCH_WRITERS_STILL_ACTIVE,
  DUPLICATE_FULL_REGRESSIONS_STILL_ACTIVE,
  REQUIRED_CHECKS_NOT_VERIFIED_OR_MIGRATED
]
NEXT_SHORTEST_STEP   = GCI-S02_SinglePrGateOrchestratorPilot
```

## Task closeout rule

```text
1. DISTANCE SEGMENT SHORTENED =
   BOOTSTRAP_PARTIAL -> EXHAUSTIVE_REPOSITORY_AUTHORITY

2. SYSTEM NODE ADVANCED =
   CI_HANDSHAKE_POLICY -> WORKFLOW_REGISTRY -> FANOUT_AND_OWNERSHIP_EVIDENCE

3. BLOCKER REMOVED =
   UNKNOWN_WORKFLOW_SURFACE

4. NEW BLOCKER ADDED =
   NONE; six observed nonconformities are existing conditions now made explicit.

5. NEXT SHORTEST EFFECTIVE STEP =
   GCI-S02_SinglePrGateOrchestratorPilot
```
