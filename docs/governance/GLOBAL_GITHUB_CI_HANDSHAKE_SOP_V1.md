# GLOBAL_GITHUB_CI_HANDSHAKE_SOP_V1

```text
PROGRAM_ID = GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1
TASK_ID    = GCI-S00_OrganizationWideHandshakePolicyAndWorkflowRegistrySchemaLock
VERSION    = 1.0.0
STATUS     = POLICY_LOCKED
```

## 1. Purpose

This SOP defines a repository-independent GitHub CI handshake model that prevents repeated workflow fan-out, duplicate full regressions, CI self-mutation, status-only commits, and fragmented remediation pushes.

The standard applies to future pull-request CI design across projects. GCI-S00 only locks policy and registry structure. It does not modify existing workflow behavior, branch protection, required checks, production implementation, or workflow lifecycle.

## 2. Normative state machine

```text
LOCAL_PREPARATION
  -> READY_FOR_SINGLE_PUSH
  -> CI_RUNNING
  -> CI_TERMINAL_BARRIER
  -> READY_TO_MERGE | REMEDIATION_REQUIRED
  -> CONSOLIDATED_FIX
  -> SINGLE_REPUSH
  -> MERGED
  -> POST_MERGE_READBACK
  -> CLOSED
```

A pull request must not transition from `CI_RUNNING` directly to a new remediation push because one early check failed. All relevant checks must first reach a terminal state.

Terminal states are:

```text
success
failure
cancelled
skipped
neutral
```

## 3. Hard policy limits

```text
MAX_TOP_LEVEL_PR_WORKFLOWS          = 1
MAX_REQUIRED_PR_CHECKS              = 3
FULL_REGRESSION_AUTHORITY_COUNT     = 1
PR_BRANCH_WRITER_COUNT              = 0
NORMAL_PUSH_WAVES                   = 1
REMEDIATION_PUSH_WAVES_PER_CYCLE    = 1
STATUS_ONLY_COMMITS                 = FORBIDDEN
READBACK_ONLY_COMMITS               = FORBIDDEN
HASH_ONLY_COMMITS                   = FORBIDDEN
CI_SELF_MUTATING_COMMITS            = FORBIDDEN
```

These are target invariants. Existing repositories may temporarily contain recorded nonconformities, but every nonconformity must have a successor workflow and a retirement task.

## 4. Local preparation gate

Before the first PR-triggering push, the task owner must complete:

- scope freeze;
- implementation and deterministic generated artifacts;
- focused tests;
- schema and syntax validation;
- formatter or static checks when applicable;
- diff review;
- readback and closeout draft;
- known failure inventory from local or pre-PR evidence.

The following are prohibited:

- pushing an empty bootstrap only to obtain CI feedback;
- splitting implementation, tests, generated JSON, readback, and closeout into separate normal push waves;
- leaving deterministic materialization to a pull-request workflow when it can be completed before PR creation.

## 5. Pull-request workflow permissions

Pull-request workflows must be read-only by default:

```yaml
permissions:
  contents: read
```

Allowed pull-request actions:

- checkout;
- dependency installation;
- build;
- test;
- validation;
- annotations;
- uploading diagnostic artifacts.

Forbidden pull-request actions:

- `git commit`;
- `git push`;
- `git rebase`;
- moving or updating the PR branch;
- writing deterministic authorities back to the repository;
- creating status-only, readback-only, or hash-only commits.

Generated diagnostics produced in CI must be uploaded as artifacts. Repository writes belong either before PR creation or after merge under an explicitly post-merge workflow.

## 6. Full regression ownership

Exactly one pull-request workflow owns the repository-wide full regression.

Focused checks, milestone checks, slice checks, and contract checks must not independently rerun the full suite. They may run scoped tests and feed their result into the aggregate gate.

The target model is:

```text
detect_changes
  -> focused_checks
  -> affected_scope_matrix
  -> one_full_regression
  -> aggregate_gate
```

A post-merge deployment workflow may run its own deployment guard. That guard is not a second PR full-regression authority and must be classified separately in the registry.

## 7. Affected-scope execution

Per-slice or per-milestone validation should use one matrix or reusable workflow selected by change detection. A repository should not retain one permanent top-level PR workflow for each historical slice.

Job-level `if` conditions are not a substitute for trigger consolidation when many top-level workflows are still created and immediately skipped.

## 8. CI terminal barrier and failure inventory

After CI starts, the operator or agent must wait until all relevant checks are terminal. Then one `CI_FAILURE_INVENTORY` is created with these classifications:

```text
PRODUCTION_FAILURE
TEST_EXPECTATION_FAILURE
STALE_READBACK
GENERATED_ARTIFACT_DRIFT
WORKFLOW_CONFIGURATION_FAILURE
UNRELATED_FANOUT
INFRASTRUCTURE_FLAKE
```

No remediation push is allowed before the inventory is complete.

## 9. Consolidated remediation

All known failures in one CI wave must be corrected in one consolidated remediation push whenever technically possible.

Forbidden pattern:

```text
fix A -> push
fix B -> push
fix C -> push
```

Required pattern:

```text
wait for terminal barrier
-> collect all failures
-> diagnose once
-> create one consolidated correction
-> single repush
```

A new failure wave may justify one additional consolidated remediation cycle. It must not be decomposed into status or readback commits.

## 10. Required checks and branch protection

The preferred required check is one stable aggregate check name:

```text
PR Gate / aggregate
```

At most two additional required checks may be used for independent concerns such as security or release policy.

A check that may never be created because of a path filter must not be the only required gate for unrelated pull requests.

GCI-S00 does not change branch protection. Required-check migration is reserved for GCI-S04 after the replacement gate has proven equivalent coverage.

## 11. Workflow lifecycle

Every workflow must be registered with one lifecycle:

```text
ACTIVE_REQUIRED
ACTIVE_OPTIONAL
WORKFLOW_DISPATCH_ONLY
POST_MERGE_ONLY
DEPRECATED
RETIRED
```

Every workflow must declare:

- trigger classes;
- path scope;
- required-check status and evidence state;
- PR branch write behavior;
- PR full-regression role;
- successor workflow;
- retirement task or condition;
- policy disposition.

A predecessor must not be retired before a validated successor exists.

## 12. Registry authority

The repository registry is stored at:

```text
.github/ci/workflow-registry.json
```

Its schema is stored at:

```text
.github/ci/workflow-registry.schema.json
```

The registry is the machine-readable source for workflow lifecycle reconciliation. S00 permits a `BOOTSTRAP_PARTIAL` inventory. GCI-S01 must replace it with an exhaustive inventory and fan-out matrix.

## 13. Closeout metrics

Every CI-governance milestone must report:

```text
CI_HANDSHAKE_STATUS
TOP_LEVEL_PR_WORKFLOWS
REQUIRED_CHECKS
FULL_REGRESSION_AUTHORITIES
PR_BRANCH_WRITERS
NORMAL_PUSH_WAVES
REMEDIATION_PUSH_WAVES
TERMINAL_FAILURES_COLLECTED_TOGETHER
CONSOLIDATED_REMEDIATION
LEGACY_WORKFLOWS_RETIRED
STOP_REASON
NEXT_RESUME_TASK
```

## 14. S00 scope boundary

GCI-S00 may:

- create this SOP;
- lock the workflow registry schema;
- create a bootstrap registry for the math repository;
- create registry/schema QA;
- create an S00 closeout record.

GCI-S00 must not:

- modify existing workflow behavior;
- modify branch protection;
- retire workflows;
- modify PGC production implementation;
- enter another repository.

## 15. Next milestone

```text
NEXT_SHORTEST_STEP =
GCI-S01_MathRepositoryWorkflowInventoryAndFanoutMatrix
```
