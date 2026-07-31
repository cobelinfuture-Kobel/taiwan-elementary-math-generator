# PGC-R08 A04 A03 — Route Binding Convergence Repair Closeout

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A04-A03_RouteBindingConvergenceFocusedReproductionAndRepair
STATUS = PASS_ROUTE_BINDING_FAMILY_CLOSED
```

## Result

```text
TARGET_ROUTES               = 136
TERMINAL_ROUTES             = 136
ROUTE_BINDING_RESOLVED      = 136
ROUTE_BINDING_STILL_FAILED  = 0
FULL_NINE_GATE_PASS         = 127
DOWNSTREAM_RECLASSIFIED     = 9
BROWSER_CONSOLE_ERRORS      = 0
BROWSER_PAGE_ERRORS         = 0
```

The shared structural fallback had preserved the global `1 / 20 / 240` question-count policy while overwriting exact question-type route identity. The repair makes the exact capacity row authoritative for question type, depth, context, PatternGroup identity and capacity route IDs. Structural fallback may only provide PatternGroup visibility.

No capacity authority JSON or route-specific product branch was added.

## Downstream transfer

```text
REGENERATE_IDENTITY_TIMEOUT = 6
CAPACITY_PROJECTION_SHORTFALL = 3
```

The six regenerate routes passed all gates except different-seed identity. The three capacity routes bound correctly but generated only `12/20`, `12/20`, and `8/20`; they are added as an overlay to the capacity reconciliation phase.

## Reconciliation

```text
CUMULATIVE_PASS             = 772 / 793
UNRESOLVED_FAILED_ROUTES    = 21
QUESTION_TYPE_SETTLEMENT    = 9
REGENERATE_IDENTITY         = 9
CAPACITY_SHORTFALL_FAILURE  = 3
CAPACITY_RECONCILIATION     = 38
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_ROUTE_BINDING_ROOT_CAUSE_PROVEN
GOAL_DISTANCE_AFTER  = D1_R08_ROUTE_BINDING_CLOSED_21_FAILURES_REMAIN
DISTANCE_REDUCED     = all 136 historical route-binding failures closed by one shared resolver repair
REMAINING_BLOCKERS   = [QUESTION_TYPE_STATE_SETTLEMENT_TIMEOUT_9, REGENERATE_IDENTITY_TIMEOUT_9, CAPACITY_PROJECTION_SHORTFALL_3, CAPACITY_EVIDENCE_RECONCILIATION_38, FULL_793_ROUTE_REPLAY_PENDING]
NEXT_SHORTEST_STEP   = PGC-R08-A04-A04_QuestionTypeStateSettlementFocusedReproductionAndRepair
```
