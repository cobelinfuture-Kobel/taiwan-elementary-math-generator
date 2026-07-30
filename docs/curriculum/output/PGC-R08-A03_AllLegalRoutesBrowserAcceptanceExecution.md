# PGC-R08 A03 — All Legal Routes Browser Acceptance Execution

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A03_AllLegalRoutesBrowserAcceptanceExecution
STATUS = PENDING_ALL_16_SHARDS_BROWSER_EXECUTION
```

## Scope

Execute all 793 legal public capability routes through the real Classic UI. Each route requests 20 questions and must reach a terminal PASS or FAIL classification across the nine R08 gates. Route failures are collected for A04 and do not abort the remaining matrix; system failures or incomplete execution fail CI.

## Execution

```text
16 deterministic shards
793 legal routes
4 bounded browser workers
20 questions + 20 answer-key rows per route
Generate + Regenerate + HTML + Chromium PDF + Print
```

The first route is the A02 mixed-application early sentinel. The historical VERIFIED_LIMITED route at index 59 is executed at 20 and enters capacity evidence reconciliation when it passes.

## Artifact policy

Every route records question/answer/PDF identity hashes and gate results. One HTML/PDF sample per shard is retained, while every failure retains JSON and screenshot evidence.

## Boundary

No product UI, generator, validator, renderer, capacity authority, new workflow or Slice014 change.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_PUBLIC_GENERATE_BUTTON_HARNESS_QUALIFIED
GOAL_DISTANCE_AFTER  = D1_R08_ALL_LEGAL_ROUTE_BROWSER_EXECUTION_PENDING
DISTANCE_REDUCED     = complete 793-route terminal execution policy and 16-shard authority frozen
REMAINING_BLOCKERS   = [ALL_793_LEGAL_ROUTES_NOT_EXECUTED, FAILED_COMBINATION_QUEUE_NOT_MATERIALIZED]
NEXT_SHORTEST_STEP   = PGC-R08-A03_ExactHeadAllShardBrowserExecution
```
