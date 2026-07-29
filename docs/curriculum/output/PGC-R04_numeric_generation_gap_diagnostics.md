# PGC-R04 Numeric Generation Runtime Gap Diagnostics

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R04_NumericGenerationFullFix_RuntimeGapDiagnostics
STATUS     = PASS_DIAGNOSTIC_EVIDENCE_MATERIALIZED
```

## Baseline

```text
NUMERIC_LIKE_ROUTES        = 195
LEGAL_NUMERIC_LIKE_ROUTES  = 193
VERIFIED_20_ROUTES         = 124
LIMITED_ROUTES             = 69
QUALITY_GAP_ROUTES         = 40
DIAGNOSED_GAP_ROUTES       = 81
```

## Gap ownership

- R04 owns `numeric`, `concept`, and `operation_estimation` routes only.
- Application routes remain owned by PGC-R05.
- Reasoning, mixed, and PBL routes remain owned by PGC-R06 or later product acceptance.
- The existing public worksheet pipeline is the only runtime consumer used by this diagnostic.

## Routes by source

| Source | Gap routes |
|---|---:|
| `g5a_u02_5a02` | 11 |
| `g3a_u03_3a03` | 8 |
| `g3b_u09_3b09` | 6 |
| `g5a_u03_5a03a` | 6 |
| `g5a_u03_5a03a1` | 6 |
| `g6a_u01_6a01` | 6 |
| `g3a_u08_3a08` | 5 |
| `g4a_u08_4a08` | 5 |
| `g3a_u06_3a06` | 4 |
| `g3b_u07_3b07` | 4 |
| `g4b_u08_4b08` | 4 |
| `g5a_u04_5a04` | 4 |
| `g3b_u01_3b01` | 2 |
| `g3b_u04_3b04` | 2 |
| `g4a_u01_4a01` | 2 |
| `g4a_u09_4a09` | 2 |
| `g4b_u06_4b06` | 2 |
| `g4b_u01_4b01` | 1 |
| `g4b_u04_4b04` | 1 |

## Final acceptance checkpoint

```text
TWO_SEED_DIAGNOSTIC_ROUTES_PASS = 81 / 81
LIVE_20X10_ROUTES_PASS           = 79 / 81
REMAINING_LIVE_ROUTES            = 2
REMAINING_PATTERN_SPECS          = [
  ps_g5a_u02_common_factor_enumeration,
  ps_g5a_u02_greatest_common_factor
]
S102_SEED_PROJECTION_PATCH       = READY_PENDING_CI
```

The remaining two routes share the existing G5A-U02 S102 common-factor runtime. The approved repair preserves its PatternSpecs, answer models, factor-set witnesses and validators while replacing collision-prone RNG pair selection with a deterministic 900-slot seed projection. Any twenty consecutive item seeds map to twenty different operand pairs; the two multipliers are consecutive, so the greatest common factor is exactly the selected common base and both operands remain below 9999.

## Next step

```text
GOAL_DISTANCE_BEFORE = D1_NUMERIC_20X10_TWO_ROUTES_REMAINING
GOAL_DISTANCE_AFTER  = D1_S102_DETERMINISTIC_SEED_PROJECTION_PENDING_CI
DISTANCE_REDUCED     = all numeric gaps except two S102 routes pass the live 20-question x 10-seed contract; the final shared producer repair is implemented
REMAINING_BLOCKERS   = [S102_PATCH_EXECUTION_AND_LIVE_20X10_CI, FULL_NODE_REGRESSION, R00_SCOPE_FREEZE]
NEXT_SHORTEST_STEP   = PGC-R04_S102Live20x10AndFullRegressionAcceptance
```
