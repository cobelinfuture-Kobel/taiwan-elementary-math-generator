# PGC-R03 Capacity-aware Legal Route Reconciliation

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R03_CapacityAwareLegalRouteAndPerCapabilityUiLimitReconciliation
STATUS     = PASS_WITH_DOWNSTREAM_GAPS
```

## Reconciled capacity

```text
HISTORICAL_R02_BINDINGS        = 1152
CURRENT_LEGAL_BINDINGS         = 1089
ROUTES                         = 1155
LEGAL_ROUTES                   = 793
ILLEGAL_ROUTES_REMOVED         = 362
VERIFIED_20_ROUTES             = 519
VERIFIED_LIMITED_ROUTES        = 270
ZERO_CAPACITY_ROUTES_HIDDEN    = 4
DIVERSITY_GAP_ROUTES           = 91
CURRENT_UNVERIFIED_EXPOSURES   = 0
HARD_BLOCKERS                  = 0
```

Illegal control intersections are not treated as weak generators. They are removed from the public route set. Legal routes retain their measured maximum; fixed fixture routes may remain usable while their diversity debt is transferred to PGC-R04 or PGC-R05.

## Downstream gaps

- `CAPACITY_BELOW_20`: 270
- `CROSS_SEED_ITEM_DIVERSITY_DEFICIENT`: 91
- `ZERO_SAFE_CAPACITY`: 4

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_GENERATOR_CAPACITY_FAIL_CLOSED
GOAL_DISTANCE_AFTER  = D1_CAPACITY_AWARE_PUBLIC_ROUTES_CONFORMANT
DISTANCE_REDUCED     = illegal routes are removed and every exposed route is clamped to its verified safe question count
REMAINING_BLOCKERS   = [PGC-R04_NUMERIC_QUALITY, PGC-R05_APPLICATION_QUALITY, PGC-R06_TO_R08_PRODUCT_ACCEPTANCE]
NEXT_SHORTEST_STEP   = PGC-R04_NumericGenerationFullFix
```

