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

## Final validation checkpoint

```text
ROUND_3_DIAGNOSTIC_ROUTES = 81
ROUND_3_PASS_20_ROUTES     = 65
ROUND_3_REMAINING_ROUTES   = 16
FINAL_PRODUCER_FIX_HEAD    = 14ed2f3b23b0a92cfb76b950c063c24a26f54066
FINAL_VALIDATION_STATUS    = PENDING_CI
```

The final producer patch covers the remaining G3A-U03 multiplication pools, G3B-U04 consecutive multiplication, G4A-U01 boundary-difference surfaces, G4B-U04 approximation-symbol capacity, G5A-U03 factor/multiple and common-multiple parameter spaces, G6A-U01 LCM parameterization, and G3A-U08 unit-fraction accumulation. The R04 workflow must re-materialize all 81 original diagnostic routes and fail closed unless every legal numeric-like route can generate twenty validated, prompt-unique questions for the required seeds.

## Next step

```text
GOAL_DISTANCE_BEFORE = D1_NUMERIC_RUNTIME_GAPS_SOURCE_LOCATED
GOAL_DISTANCE_AFTER  = D1_FINAL_NUMERIC_PRODUCER_FIX_PENDING_CI
DISTANCE_REDUCED     = 65 of 81 diagnosed numeric gaps are already verified at twenty questions; the final sixteen producer routes now have targeted FullFixes
REMAINING_BLOCKERS   = [FINAL_R04_CI_AND_FULL_REGRESSION]
NEXT_SHORTEST_STEP   = PGC-R04_FinalFocusedAndFullRegressionAcceptance
```
