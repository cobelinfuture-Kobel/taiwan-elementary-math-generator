# PGC-R04-A01 G3A-U03 Seed Consumption and Cross-seed Diversity Acceptance

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R04-A01_G3A_U03_SeedConsumptionAndCrossSeedDiversityFullFix
STATUS     = PASS
```

## Acceptance

```text
TARGET_ROUTES                    = 8
VERIFIED_20_ROUTES               = 8
DIVERSE_ROUTES                   = 8
SAME_SEED_REPLAY_PASS_ROUTES     = 8
DUPLICATE_PROMPT_ROUTES          = 0
RESOLVED_R04_GAP_ROUTES          = 8
REMAINING_R04_GAP_ROUTES         = 73
REMAINING_DIVERSITY_GAP_ROUTES   = 28
REMAINING_CAPACITY_GAP_ROUTES    = 69
BLOCKING_FAILURES                = 0
```

All six numeric PatternSpecs now consume generationSeed through deterministic full-cycle pool permutations. Source-unit and same-unit mixed routes inherit the same behavior without a second Generator path.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_NUMERIC_GAP_QUEUE_FROZEN
GOAL_DISTANCE_AFTER  = D1_G3A_U03_NUMERIC_DIVERSITY_CONFORMANT
DISTANCE_REDUCED     = 8 G3A-U03 numeric routes move from fixture-selector diversity debt to deterministic cross-seed diversity
REMAINING_BLOCKERS   = [69_CAPACITY_ROUTES, 28_DIVERSITY_ROUTES, PGC-R05_APPLICATION_QUALITY, PGC-R06_TO_R08_PRODUCT_ACCEPTANCE]
NEXT_SHORTEST_STEP   = PGC-R04-A02_G3A_U06_SeedConsumptionAndCrossSeedDiversityFullFix
```

