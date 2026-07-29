# PGC-R04 Numeric Generation Gap Inventory

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R04_NumericGenerationFullFix
STATUS     = PASS
```

## Frozen scope

```text
NUMERIC_LIKE_TYPES                    = numeric|concept|operation_estimation|representation
CANDIDATE_ROUTES                      = 195
LEGAL_ROUTES                          = 193
ILLEGAL_ROUTES_EXCLUDED               = 2
HEALTHY_LEGAL_ROUTES                  = 112
R04_GAP_ROUTES                        = 81
CAPACITY_BELOW_20_ROUTES              = 69
DIVERSITY_DEFICIENT_ROUTES            = 36
CAPACITY_AND_DIVERSITY_OVERLAP         = 24
AFFECTED_SOURCES                      = 19
IMPLEMENTATION_REFERENCE_COVERAGE     = 81/81
BLOCKING_INVENTORY_GAPS               = 0
```

R04 owns numeric, concept, operation-estimation and representation quality gaps only. Application, reasoning, PBL and mixed routes remain outside this milestone.

## Source queue

| Source | Gap routes | Capacity <20 | Diversity | Min–max verified |
|---|---:|---:|---:|---:|
| `g5a_u02_5a02` | 11 | 11 | 0 | 8–16 |
| `g3a_u03_3a03` | 8 | 0 | 8 | 20–20 |
| `g3b_u09_3b09` | 6 | 6 | 4 | 8–8 |
| `g5a_u03_5a03a` | 6 | 6 | 0 | 1–14 |
| `g5a_u03_5a03a1` | 6 | 6 | 0 | 1–10 |
| `g6a_u01_6a01` | 6 | 6 | 0 | 1–9 |
| `g3a_u08_3a08` | 5 | 5 | 2 | 2–10 |
| `g4a_u08_4a08` | 5 | 5 | 0 | 5–17 |
| `g3a_u06_3a06` | 4 | 0 | 4 | 20–20 |
| `g3b_u07_3b07` | 4 | 4 | 4 | 6–12 |
| `g4b_u08_4b08` | 4 | 4 | 4 | 8–9 |
| `g5a_u04_5a04` | 4 | 4 | 4 | 6–9 |
| `g3b_u01_3b01` | 2 | 2 | 0 | 9–9 |
| `g3b_u04_3b04` | 2 | 2 | 0 | 3–3 |
| `g4a_u01_4a01` | 2 | 2 | 1 | 8–16 |
| `g4a_u09_4a09` | 2 | 2 | 2 | 8–8 |
| `g4b_u06_4b06` | 2 | 2 | 2 | 8–8 |
| `g4b_u01_4b01` | 1 | 1 | 0 | 12–12 |
| `g4b_u04_4b04` | 1 | 1 | 1 | 1–1 |

## First shortest repair

```text
SOURCE_ID        = g3a_u03_3a03
ROUTE_COUNT      = 8
NEXT_TASK_ID     = PGC-R04-A01_G3A_U03_SeedConsumptionAndCrossSeedDiversityFullFix
```

All affected routes already satisfy verified 20-question capacity; one seed-consumption or fixture-selection FullFix can remove the largest pure diversity cluster without changing public limits.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_CAPACITY_AWARE_PUBLIC_ROUTES_CONFORMANT
GOAL_DISTANCE_AFTER  = D1_NUMERIC_GAP_QUEUE_FROZEN
DISTANCE_REDUCED     = all numeric-like downstream quality gaps are frozen, source-grouped and mapped to implementation references
REMAINING_BLOCKERS   = [69_CAPACITY_ROUTES, 36_DIVERSITY_ROUTES, PGC-R05_APPLICATION_QUALITY, PGC-R06_TO_R08_PRODUCT_ACCEPTANCE]
NEXT_SHORTEST_STEP   = PGC-R04-A01_G3A_U03_SeedConsumptionAndCrossSeedDiversityFullFix
```

