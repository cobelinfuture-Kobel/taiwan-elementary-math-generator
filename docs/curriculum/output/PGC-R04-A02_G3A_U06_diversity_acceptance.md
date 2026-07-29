# PGC-R04-A02 G3A-U06 Seed Consumption and Cross-seed Diversity Acceptance

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R04-A02_G3A_U06_SeedConsumptionAndCrossSeedDiversityFullFix
STATUS     = PASS
```

```text
TARGET_ROUTES                  = 4
VERIFIED_20_ROUTES             = 4
DIVERSE_ROUTES                 = 4
SAME_SEED_REPLAY_PASS_ROUTES   = 4
DUPLICATE_PROMPT_ROUTES        = 0
RESOLVED_R04_GAP_ROUTES        = 4
CUMULATIVE_RESOLVED_GAP_ROUTES = 12
REMAINING_R04_GAP_ROUTES       = 69
REMAINING_DIVERSITY_GAPS       = 24
REMAINING_CAPACITY_GAPS        = 69
BLOCKING_FAILURES              = 0
```

The existing remainder, quotative, partitive and parity makers remain unchanged. Their sequence input is now selected by the shared G3A-U06 division router using a deterministic full-cycle seed permutation.

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U03_NUMERIC_DIVERSITY_CONFORMANT
GOAL_DISTANCE_AFTER  = D1_G3A_U06_NUMERIC_DIVERSITY_CONFORMANT
DISTANCE_REDUCED     = 4 G3A-U06 numeric routes move from fixture-selector diversity debt to deterministic cross-seed diversity
REMAINING_BLOCKERS   = [69_CAPACITY_ROUTES, 24_DIVERSITY_ROUTES, PGC-R05_APPLICATION_QUALITY, PGC-R06_TO_R08_PRODUCT_ACCEPTANCE]
NEXT_SHORTEST_STEP   = PGC-R04-A03_NumericCapacityAndDiversityQueueReprioritization
```

