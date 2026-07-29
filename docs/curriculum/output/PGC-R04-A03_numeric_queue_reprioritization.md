# PGC-R04-A03 Numeric Capacity and Diversity Queue Reprioritization

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R04-A03_NumericCapacityAndDiversityQueueReprioritization
STATUS     = PASS
```

```text
CUMULATIVE_RESOLVED_GAP_ROUTES       = 12
REMAINING_GAP_ROUTES                 = 69
REMAINING_CAPACITY_GAP_ROUTES        = 69
REMAINING_DIVERSITY_GAP_ROUTES       = 24
CAPACITY_AND_DIVERSITY_OVERLAP       = 24
REMAINING_AFFECTED_SOURCES           = 17
BLOCKING_REPRIORITIZATION_GAPS       = 0
```

After A01 and A02 there are no pure diversity-only source clusters. The queue therefore switches from seed-consumption fixes to capacity expansion while keeping capacity-plus-diversity clusters separate.

## Remaining source queue

| Source | Class | Routes | Capacity | Diversity | Verified range |
|---|---|---:|---:|---:|---:|
| `g5a_u02_5a02` | CAPACITY_ONLY | 11 | 11 | 0 | 8–16 |
| `g3b_u09_3b09` | MIXED_CAPACITY_QUALITY | 6 | 6 | 4 | 8–8 |
| `g5a_u03_5a03a` | CAPACITY_ONLY | 6 | 6 | 0 | 1–14 |
| `g5a_u03_5a03a1` | CAPACITY_ONLY | 6 | 6 | 0 | 1–10 |
| `g6a_u01_6a01` | CAPACITY_ONLY | 6 | 6 | 0 | 1–9 |
| `g3a_u08_3a08` | MIXED_CAPACITY_QUALITY | 5 | 5 | 2 | 2–10 |
| `g4a_u08_4a08` | CAPACITY_ONLY | 5 | 5 | 0 | 5–17 |
| `g3b_u07_3b07` | CAPACITY_AND_DIVERSITY | 4 | 4 | 4 | 6–12 |
| `g4b_u08_4b08` | CAPACITY_AND_DIVERSITY | 4 | 4 | 4 | 8–9 |
| `g5a_u04_5a04` | CAPACITY_AND_DIVERSITY | 4 | 4 | 4 | 6–9 |
| `g3b_u01_3b01` | CAPACITY_ONLY | 2 | 2 | 0 | 9–9 |
| `g3b_u04_3b04` | CAPACITY_ONLY | 2 | 2 | 0 | 3–3 |
| `g4a_u01_4a01` | MIXED_CAPACITY_QUALITY | 2 | 2 | 1 | 8–16 |
| `g4a_u09_4a09` | CAPACITY_AND_DIVERSITY | 2 | 2 | 2 | 8–8 |
| `g4b_u06_4b06` | CAPACITY_AND_DIVERSITY | 2 | 2 | 2 | 8–8 |
| `g4b_u01_4b01` | CAPACITY_ONLY | 1 | 1 | 0 | 12–12 |
| `g4b_u04_4b04` | CAPACITY_AND_DIVERSITY | 1 | 1 | 1 | 1–1 |

## Selected next source

```text
SOURCE_ID    = g5a_u02_5a02
DEFECT_CLASS = CAPACITY_ONLY
ROUTE_COUNT  = 11
NEXT_TASK_ID = PGC-R04-A04_G5A_U02_NumericCapacityExpansionFullFix
```

Largest remaining capacity-only source cluster. Repairing one shared G5A-U02 generation authority can raise 11 routes without mixing in unresolved cross-seed diversity work.

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U06_NUMERIC_DIVERSITY_CONFORMANT
GOAL_DISTANCE_AFTER  = D1_NUMERIC_CAPACITY_QUEUE_REPRIORITIZED
DISTANCE_REDUCED     = resolved diversity-only clusters are removed and the remaining 69 routes are partitioned into capacity-only versus capacity-plus-diversity repair lanes
REMAINING_BLOCKERS   = [69_CAPACITY_ROUTES, 24_DIVERSITY_ROUTES, PGC-R05_APPLICATION_QUALITY, PGC-R06_TO_R08_PRODUCT_ACCEPTANCE]
NEXT_SHORTEST_STEP   = PGC-R04-A04_G5A_U02_NumericCapacityExpansionFullFix
```

