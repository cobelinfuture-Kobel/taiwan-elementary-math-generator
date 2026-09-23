# PGC-R08 A03 — All Legal Routes Browser Acceptance Execution

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A03_ReadTerminalAllRouteArtifactAndMaterializeRepairQueue
STATUS = PASS_TERMINAL_ARTIFACT_READ_AND_QUEUES_MATERIALIZED
PR = #486
EXACT_HEAD_SHA = 3e4e843163fdc67d777657fdc329e35c9a9bbc23
WORKFLOW_RUN_ID = 30594944965
ARTIFACT_ID = 8780383150
ARTIFACT_DIGEST = sha256:19c65c4afb5e1e1e0de9a97ead36c7d5dd845713d0d2ad34c53f080e348a659e
```

## Terminal browser execution

```text
LEGAL_ROUTES = 793
TERMINAL_ROUTES = 793
PASS = 466
FAIL = 327
VERIFIED_20_PASS = 431
VERIFIED_LIMITED_LIVE_20_PASS = 35
SHARDS = 16
HTML_SAMPLES = 16
PDF_SAMPLES = 16
BROWSER_CONSOLE_ERRORS = 0
BROWSER_PAGE_ERRORS = 0
FINAL_CHECKPOINT_AUTHORITATIVE = true
```

The exact-head Node workflow completed successfully. Every legal route reached a terminal classification. The artifact retained one deterministic PASS HTML/PDF sample per shard and JSON plus screenshot evidence for every failed route.

## Repair queue

The 327 failed routes are materialized as five repair families. They are not treated as 327 independent product patches. A04 must reproduce each family with focused canaries before changing production code.

| Failure family | Routes | First affected gate | Disposition |
|---|---:|---|---|
| `ROUTE_BINDING_NOT_CONVERGED` | 136 | `UI_OPTIONS_PASS` | focused binding/control-sequence reproduction |
| `QUESTION_TYPE_CONTROL_DISABLED` | 176 | `UI_OPTIONS_PASS` | focused control-enablement reproduction |
| `QUESTION_TYPE_STATE_SETTLEMENT_TIMEOUT` | 9 | `UI_OPTIONS_PASS` | focused state-settlement reproduction |
| `CONTEXT_MODE_CONTROL_DISABLED` | 4 | `UI_OPTIONS_PASS` | focused context-control reproduction |
| `REGENERATE_IDENTITY_TIMEOUT` | 2 | `REGENERATE_PASS` | focused regenerate reproduction |

Canonical index: `data/curriculum/public-generation/PGC-R08-A03.repair-queue.json`.

The index binds five hashed family queue files under `data/curriculum/public-generation/pgc-r08-a03-repair-queue/`. This is the only repair authority; A04 must not create per-route parallel patches.

## Capacity evidence reconciliation

Thirty-five routes previously classified `VERIFIED_LIMITED` produced 20 questions and passed the complete browser journey. A03 does not mutate the canonical capacity authority; it materializes an A04 reconciliation queue.

Authority: `data/curriculum/public-generation/PGC-R08-A03.capacity-evidence-reconciliation-queue.json`.

## Mandatory handoffs

```text
A02 mixed-application sentinel, route index 1 = FAIL / ROUTE_BINDING_NOT_CONVERGED
A02 limited-capacity sentinel, route index 59 = PASS / LIVE_20_REQUALIFICATION
```

## Integrity hashes

```text
REPORT_SHA256 = 6054c5d2b6e8c96c81ab12972e3ce0a16ae4432e4be1bae55941405a6169e58b
CHECKPOINT_SHA256 = 3330bde69950e15a9aa7f503a6eac8a50a7e23b8f83db7ffff46a658fb69821e
ROUTE_RESULTS_CSV_SHA256 = ee0ff15119496563d1e7d3a39f79ae8d2ebf4d79ac6d265a2e518f0f95116d78
FAILED_COMBINATION_REPORT_SHA256 = 835e9dd5bc6725ac949bb9fda93c9272b9b484e5b59ad4eb133b3ed9aad5b36f
```

## Boundary

No product UI, generator, validator, renderer, capacity authority, KnowledgePoint, PatternGroup, PatternSpec or Slice014 mutation is performed by this readback. Temporary A03 Node workflow wiring is removed before merge.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_ALL_LEGAL_ROUTES_EXECUTED_TERMINAL_ARTIFACT_AVAILABLE
GOAL_DISTANCE_AFTER  = D1_R08_TERMINAL_RESULTS_READ_REPAIR_AND_RECONCILIATION_QUEUES_MATERIALIZED
DISTANCE_REDUCED     = exact-head 793-route evidence converted into deterministic A04 work queues
REMAINING_BLOCKERS   = [A03_REPAIR_QUEUE_327, CAPACITY_EVIDENCE_RECONCILIATION_QUEUE_35]
NEXT_SHORTEST_STEP   = PGC-R08-A04_FailedCombinationRepairAndReconciliation
```
