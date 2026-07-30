# GCI-S03A Primary Regression Authority Transfer Closeout

```text
PROGRAM_ID = GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1
TASK_ID    = GCI-S03A_PrimaryRegressionAuthorityTransfer
STATUS     = IMPLEMENTED_PENDING_CI_TERMINAL_BARRIER
```

## Scope lock

This milestone modifies GitHub Actions governance only.

Included:

- promote `PR Gate` from governance-path pilot to every pull request targeting `main`;
- transfer authoritative pull-request `npm test` ownership to `PR Gate`;
- convert `Node Test` into a zero-cost compatibility bridge;
- create `Node Test Post-Merge` for main-push regression evidence;
- preserve S01 and S02 historical evidence while validating the live workflow state.

Excluded:

- product implementation, curriculum data, generator, validator, renderer, worksheet or UI;
- branch protection or required-check configuration;
- R05 self-mutating workflow retirement;
- P03F Slice005–013 workflow consolidation;
- other repositories.

## Before

```text
PR Gate Pilot = governance paths only + npm test
Node Test      = all PRs + npm test + legacy branch-specific acceptance
```

## After

```text
PR Gate        = all PRs + single authoritative npm test + aggregate
Node Test      = compatibility bridge only; no install and no npm test
Node Test Post-Merge = main push/manual npm test guard
```

## Safety rationale

Required-check and branch-protection evidence remains unverified. Removing the `Node Test` pull-request check immediately could leave an expected context pending. GCI-S03A therefore preserves the workflow and job name while removing its expensive regression workload. GCI-S04 will migrate required checks and then remove the bridge.

## Acceptance

```text
PR_GATE_ALL_PULL_REQUESTS            = REQUIRED
PR_GATE_CONTENTS_READ                = REQUIRED
PR_GATE_GIT_WRITE_COMMANDS            = 0
PR_GATE_NPM_TEST_OCCURRENCES          = 1
NODE_TEST_COMPAT_NPM_TEST_OCCURRENCES = 0
POST_MERGE_NPM_TEST_OCCURRENCES       = 1
FOCUSED_GCI_QA                        = REQUIRED
FULL_REPOSITORY_REGRESSION            = REQUIRED
CI_TERMINAL_BARRIER                   = REQUIRED
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D2_SINGLE_READ_ONLY_PR_GATE_PILOT_IMPLEMENTED_PENDING_LEGACY_RETIREMENT
GOAL_DISTANCE_AFTER  = D2_ALL_PR_ORCHESTRATOR_ACTIVE_WITH_PRIMARY_REGRESSION_AUTHORITY_TRANSFERRED
DISTANCE_REDUCED     = Every pull request now enters PR Gate, while the legacy Node Test check no longer duplicates npm test.
REMAINING_BLOCKERS   = [
  P03F_SLICE005_TO_013_TOP_LEVEL_PR_FANOUT,
  R05_SELF_MUTATING_PR_WORKFLOWS,
  OTHER_DUPLICATE_PR_FULL_REGRESSIONS,
  REQUIRED_CHECKS_NOT_MIGRATED,
  NODE_TEST_COMPATIBILITY_BRIDGE_STILL_ACTIVE
]
NEXT_SHORTEST_STEP   = GCI-S03B_P03FSlice005To013AffectedScopeConsolidation
```

## Task closeout rule

```text
1. DISTANCE SEGMENT SHORTENED =
   GOVERNANCE_PATH_PILOT -> ALL_PULL_REQUEST_ORCHESTRATOR

2. SYSTEM NODE ADVANCED =
   PR_GATE_ORCHESTRATOR -> PRIMARY_FULL_REGRESSION_AUTHORITY

3. BLOCKER REMOVED =
   NODE_TEST_DUPLICATE_PULL_REQUEST_FULL_REGRESSION

4. NEW BLOCKER ADDED =
   NONE; the compatibility bridge is an explicit existing required-check migration dependency.

5. NEXT SHORTEST EFFECTIVE STEP =
   GCI-S03B_P03FSlice005To013AffectedScopeConsolidation
```
