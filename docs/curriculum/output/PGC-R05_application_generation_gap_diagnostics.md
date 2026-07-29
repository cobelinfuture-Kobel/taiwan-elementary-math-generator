# PGC-R05 Application Generation Runtime Gap Diagnostics

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R05_ApplicationGenerationFullFix_RuntimeGapDiagnostics
STATUS     = PASS_R05_APPLICATION_GAP_BASELINE_MATERIALIZED
```

## Baseline

```text
APPLICATION_ROUTES             = 301
LEGAL_APPLICATION_ROUTES       = 211
ILLEGAL_APPLICATION_ROUTES     = 90
CONTRACT_VERIFIED_20_ROUTES    = 128
CONTRACT_LIMITED_ROUTES        = 83
CONTRACT_QUALITY_GAP_ROUTES    = 21
LIVE_20_PASS_ROUTES            = 172
LIVE_20_FAIL_ROUTES            = 39
REPAIR_ROUTES                  = 85
```

## Scope boundary

- R05 owns legal public `application` routes only.
- R04 numeric routes are read-only protected baseline.
- Reasoning, mixed, and PBL remain owned by R06 or later.
- Existing Global Primary / canonical application authorities and the shared worksheet pipeline remain the only admitted producer-consumer lineage.

## Repair routes by source

| Source | Repair routes |
|---|---:|
| `g5a_u02_5a02` | 30 |
| `g5a_u08_5a08` | 16 |
| `g3b_u04_3b04` | 7 |
| `g3a_u08_3a08` | 4 |
| `g5a_u03_5a03a1` | 4 |
| `g6a_u01_6a01` | 4 |
| `g3b_u07_3b07` | 3 |
| `g3b_u08_3b08` | 3 |
| `g5a_u04_5a04` | 3 |
| `g3a_u03_3a03` | 2 |
| `g3b_u01_3b01` | 2 |
| `g4a_u08_4a08` | 2 |
| `g4b_u06_4b06` | 2 |
| `g3a_u02_3a02` | 1 |
| `g3a_u06_3a06` | 1 |
| `g5a_u03_5a03a` | 1 |

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R04_PUBLIC_NUMERIC_GENERATION_CONFORMANT_APPLICATION_UNVERIFIED
GOAL_DISTANCE_AFTER  = D1_R05_APPLICATION_RUNTIME_GAPS_SOURCE_LOCATED
DISTANCE_REDUCED     = every legal application route now has reproducible 20-question runtime, prompt-diversity, answer-key and authority-lineage evidence
REMAINING_BLOCKERS   = [APPLICATION_REPAIR_ROUTES_FROM_DIAGNOSTIC]
NEXT_SHORTEST_STEP   = PGC-R05_ApplicationProducerAndContextAllocatorFullFix
```

