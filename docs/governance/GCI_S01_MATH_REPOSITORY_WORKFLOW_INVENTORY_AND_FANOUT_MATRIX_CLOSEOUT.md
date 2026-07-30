# GCI-S01 Math Repository Workflow Inventory and Fan-out Matrix Closeout

```text
PROGRAM_ID = GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1
TASK_ID    = GCI-S01_MathRepositoryWorkflowInventoryAndFanoutMatrix
STATUS     = READY_FOR_FINAL_CI_AND_MERGE
FINAL_STATUS_AUTHORITY = PR #464 terminal checks and merge result
```

## Scope

This milestone exhaustively inventories the checked-out math repository workflow tree and locks workflow ownership and fan-out evidence. It does not modify workflow behavior, branch protection, required checks, workflow lifecycle, PGC production implementation, or another repository.

## Inventory authority

```text
INVENTORY_AS_OF_COMMIT                = a9e20ca65fc80f955175162cfe096249ac36c7a4
WORKFLOW_FILES                         = 109
TOP_LEVEL_PULL_REQUEST_WORKFLOWS       = 65
PULL_REQUEST_BRANCH_WRITERS            = 19
PULL_REQUEST_FULL_REGRESSION_WORKFLOWS = 23
LATE_JOB_LEVEL_SKIP_CANDIDATES         = 26
SHARED_EXACT_PATH_PATTERNS             = 73
```

The complete authority is deterministic-on-demand: `tools/governance/materialize-gci-s01-workflow-inventory.mjs` reconstructs every workflow row, trigger matrix, ownership matrix, late-skip candidate list, proposed lifecycle disposition, and exact shared-path overlap matrix from the checked-out tree. `.github/ci/workflow-inventory.s01.manifest.json` locks the exact UTF-8 serialization SHA-256, byte count, matrix row counts, ownership IDs, and reproduction command. The first terminal CI wave also emitted the complete serialized inventory as `GCI_S01_WORKFLOW_INVENTORY_BASE64`.

This avoids storing a second bulky derived snapshot while preserving exact reproducibility. The S00 schema and bootstrap registry remain unchanged; S02 consumes this authority when piloting the single PR gate.

## Findings

1. 65 top-level pull-request workflows exist against a target maximum of 1.
2. 19 pull-request workflows contain branch-write behavior against a target of 0.
3. 23 pull-request workflows execute `npm test`; `node-test` is the provisional PR authority.
4. 26 workflows use `github.head_ref` job-level gating and still create top-level skipped runs.
5. 73 exact pull-request path patterns have more than one workflow owner.

## Handshake evidence

```text
INITIAL_PUSH_WAVE             = 1
FIRST_TERMINAL_BARRIER        = PASS
FIRST_TERMINAL_FAILURE_COUNT  = 0
CONSOLIDATED_EVIDENCE_WAVE    = 1
EARLY_FAILURE_REPUSH          = false
WORKFLOW_BEHAVIOR_CHANGED     = false
BRANCH_PROTECTION_CHANGED     = false
REQUIRED_CHECKS_CHANGED       = false
LEGACY_WORKFLOWS_RETIRED      = 0
BOOTSTRAP_REGISTRY_PRESERVED  = true
```

No post-CI readback commit is created. Final terminal status and merge evidence are taken from PR #464, consistent with the prohibition on readback-only and status-only commits.

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D4_POLICY_LOCKED_WITH_BOOTSTRAP_PARTIAL_INVENTORY
GOAL_DISTANCE_AFTER  = D3_EXHAUSTIVE_MATH_WORKFLOW_OWNERSHIP_AND_FANOUT_AUTHORITY_LOCKED
DISTANCE_REDUCED     = complete workflow inventory, PR fan-out matrix, branch-writer ownership, full-regression ownership, late-skip candidates, and exact path-overlap authority
REMAINING_BLOCKERS   = [65 top-level PR workflows, 19 PR branch writers, 23 PR full-regression workflows, 26 late-skip candidates, 73 shared exact path patterns]
NEXT_SHORTEST_STEP   = GCI-S02_SinglePrGateOrchestratorPilot
```
