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
REPAIR_QUEUE_COUNT          = 148
CONFORMANT_ROUTE_COUNT      = 241
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
- `g4b_u04_4b04`: 18
- `g5a_u02_5a02`: 98
- `g5a_u08_5a08`: 30

## First queue entries

1. `pgc_r03_g4b_u04_4b04_mixed_473626f19ede` — g4b_u04_4b04 / mixed / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
2. `pgc_r03_g4b_u04_4b04_mixed_7852d15a264d` — g4b_u04_4b04 / mixed / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
3. `pgc_r03_g4b_u04_4b04_mixed_8ba934385ecd` — g4b_u04_4b04 / mixed / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
4. `pgc_r03_g4b_u04_4b04_mixed_9793ac06b033` — g4b_u04_4b04 / mixed / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
5. `pgc_r03_g4b_u04_4b04_mixed_9b10d25462b6` — g4b_u04_4b04 / mixed / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
6. `pgc_r03_g4b_u04_4b04_mixed_a45f804b3a31` — g4b_u04_4b04 / mixed / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
7. `pgc_r03_g4b_u04_4b04_mixed_a56e4df5f965` — g4b_u04_4b04 / mixed / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
8. `pgc_r03_g4b_u04_4b04_mixed_a623c0374400` — g4b_u04_4b04 / mixed / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
9. `pgc_r03_g4b_u04_4b04_mixed_d81c71e11157` — g4b_u04_4b04 / mixed / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
10. `pgc_r03_g4b_u04_4b04_reasoning_4ab8363fe09f` — g4b_u04_4b04 / reasoning / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
11. `pgc_r03_g4b_u04_4b04_reasoning_a61c663f2ea9` — g4b_u04_4b04 / reasoning / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
12. `pgc_r03_g4b_u04_4b04_reasoning_bf41bdbb6ea8` — g4b_u04_4b04 / reasoning / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
13. `pgc_r03_g4b_u04_4b04_reasoning_e0adbd44db8b` — g4b_u04_4b04 / reasoning / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
14. `pgc_r03_g4b_u04_4b04_reasoning_fbdaee663f87` — g4b_u04_4b04 / reasoning / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
15. `pgc_r03_g4b_u04_4b04_reasoning_fed3e04e2432` — g4b_u04_4b04 / reasoning / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
16. `pgc_r03_g5a_u02_5a02_mixed_026e20925977` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
17. `pgc_r03_g5a_u02_5a02_mixed_031eefeb7711` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
18. `pgc_r03_g5a_u02_5a02_mixed_0414b52fd538` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20
19. `pgc_r03_g5a_u02_5a02_mixed_05ee727bddbc` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT
20. `pgc_r03_g5a_u02_5a02_mixed_06a21fe6f5ab` — g5a_u02_5a02 / mixed / CAPACITY_BELOW_20, CROSS_SEED_ITEM_DIVERSITY_DEFICIENT

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_R05_APPLICATION_D0_R06_SCOPE_UNMATERIALIZED
GOAL_DISTANCE_AFTER  = D1_R06_REASONING_MIXED_PBL_SCOPE_AND_QUEUE_FROZEN
DISTANCE_REDUCED     = public reasoning/mixed/PBL routes are separated from R04/R05 read-only overlap and ordered into one deterministic repair queue
REMAINING_BLOCKERS   = [R06_ROUTE_RUNTIME_GAPS]
NEXT_SHORTEST_STEP   = PGC-R06-A01_BoundedCapacityReasoningMixedPBLRouteFullFix
```

