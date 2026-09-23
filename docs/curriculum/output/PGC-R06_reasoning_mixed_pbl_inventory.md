# PGC-R06 Reasoning / Mixed / PBL Route Inventory

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R06-A00_ReasoningMixedPBLRouteInventoryAndRepairQueueFreeze
STATUS     = PASS_R06_A00_SCOPE_AND_REPAIR_QUEUE_FROZEN
```

## Frozen scope

```text
REPAIR_QUESTION_TYPES       = reasoning, mixed, pbl
R06_ROUTE_COUNT             = 659
LEGAL_R06_ROUTE_COUNT       = 389
PUBLICLY_EXPOSED_R06_ROUTES = 659
REPAIR_QUEUE_COUNT          = 133
CONFORMANT_ROUTE_COUNT      = 256
R04_R05_MIXED_OVERLAP       = 65
SLICE014_STARTED            = false
```

Numeric/application routes using same-unit mixed-KP selection are read-only overlap. R06 must not reopen R04/R05 capacity or diversity decisions.

## Route counts by question type

- `mixed`: 456
- `pbl`: 26
- `reasoning`: 177

## Repair queue by source

- `g3b_u04_3b04`: 1
- `g4a_u08_4a08`: 1
- `g4b_u04_4b04`: 3
- `g5a_u02_5a02`: 98
- `g5a_u08_5a08`: 30

## First queue entries

1. `pgc_r03_g5a_u02_5a02_mixed_026e20925977` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
2. `pgc_r03_g5a_u02_5a02_mixed_031eefeb7711` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
3. `pgc_r03_g5a_u02_5a02_mixed_0414b52fd538` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
4. `pgc_r03_g5a_u02_5a02_mixed_05ee727bddbc` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
5. `pgc_r03_g5a_u02_5a02_mixed_06a21fe6f5ab` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
6. `pgc_r03_g5a_u02_5a02_mixed_08db83f2b8b4` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
7. `pgc_r03_g5a_u02_5a02_mixed_0af558cd57e7` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
8. `pgc_r03_g5a_u02_5a02_mixed_108a1e1e1feb` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
9. `pgc_r03_g5a_u02_5a02_mixed_11dc78975064` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
10. `pgc_r03_g5a_u02_5a02_mixed_14b4855a8de3` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
11. `pgc_r03_g5a_u02_5a02_mixed_155b7a11a4d1` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
12. `pgc_r03_g5a_u02_5a02_mixed_1a05bd4b0d85` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
13. `pgc_r03_g5a_u02_5a02_mixed_1a0befab7c87` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
14. `pgc_r03_g5a_u02_5a02_mixed_1e3c38a51eb2` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
15. `pgc_r03_g5a_u02_5a02_mixed_29f71ea95f6c` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
16. `pgc_r03_g5a_u02_5a02_mixed_2b5fbc4d23b5` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
17. `pgc_r03_g5a_u02_5a02_mixed_2f3620879b26` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
18. `pgc_r03_g5a_u02_5a02_mixed_319cdba8c6af` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
19. `pgc_r03_g5a_u02_5a02_mixed_336c253725d2` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
20. `pgc_r03_g5a_u02_5a02_mixed_3682c45e7772` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_R05_APPLICATION_D0_R06_SCOPE_UNMATERIALIZED
GOAL_DISTANCE_AFTER  = D1_R06_REASONING_MIXED_PBL_SCOPE_AND_QUEUE_FROZEN
DISTANCE_REDUCED     = public reasoning/mixed/PBL routes are separated from R04/R05 read-only overlap and ordered into one deterministic repair queue
REMAINING_BLOCKERS   = [R06_ROUTE_RUNTIME_GAPS]
NEXT_SHORTEST_STEP   = PGC-R06-A01_BoundedCapacityReasoningMixedPBLRouteFullFix
```

