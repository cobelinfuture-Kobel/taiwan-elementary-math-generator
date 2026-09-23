# PGC-R06 A01 G4B-U04 Bounded Capacity Live Diagnostics

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R06-A01_BoundedCapacityReasoningMixedPBLRouteFullFix
STATUS     = PASS_R06_A01_G4BU04_ALL_15_BOUNDED_ROUTES_LIVE_20_CONFORMANT_PENDING_CONTRACT_RECONCILIATION
```

## Live acceptance

```text
TARGET_ROUTES          = 15
LIVE_20_PASS_ROUTES    = 15
LIVE_20_FAIL_ROUTES    = 0
MIXED_ROUTES           = 9
REASONING_ROUTES       = 6
PBL_ROUTES_MODIFIED    = 0
R04_R05_ROUTES_MODIFIED = 0
```

## Route results

| Route | KP | Type | Context | Before | Live |
|---|---|---|---|---:|---:|
| `pgc_r03_g4b_u04_4b04_mixed_473626f19ede` | `kp_g4b_u04_approximation_symbol_reading` | mixed | sdg | 1 | 20 |
| `pgc_r03_g4b_u04_4b04_mixed_7852d15a264d` | `kp_g4b_u04_inverse_rounding_possible_original` | mixed | mixed | 12 | 20 |
| `pgc_r03_g4b_u04_4b04_mixed_8ba934385ecd` | `kp_g4b_u04_inverse_rounding_possible_original` | mixed | sdg | 12 | 20 |
| `pgc_r03_g4b_u04_4b04_mixed_9793ac06b033` | `kp_g4b_u04_inverse_rounding_possible_original` | mixed | daily_life | 12 | 20 |
| `pgc_r03_g4b_u04_4b04_mixed_9b10d25462b6` | `kp_g4b_u04_inverse_rounding_unknown_digit` | mixed | sdg | 12 | 20 |
| `pgc_r03_g4b_u04_4b04_mixed_a45f804b3a31` | `kp_g4b_u04_approximation_symbol_reading` | mixed | daily_life | 1 | 20 |
| `pgc_r03_g4b_u04_4b04_mixed_a56e4df5f965` | `kp_g4b_u04_approximation_symbol_reading` | mixed | mixed | 1 | 20 |
| `pgc_r03_g4b_u04_4b04_mixed_a623c0374400` | `kp_g4b_u04_inverse_rounding_unknown_digit` | mixed | daily_life | 12 | 20 |
| `pgc_r03_g4b_u04_4b04_mixed_d81c71e11157` | `kp_g4b_u04_inverse_rounding_unknown_digit` | mixed | mixed | 12 | 20 |
| `pgc_r03_g4b_u04_4b04_reasoning_4ab8363fe09f` | `kp_g4b_u04_inverse_rounding_unknown_digit` | reasoning | sdg | 12 | 20 |
| `pgc_r03_g4b_u04_4b04_reasoning_a61c663f2ea9` | `kp_g4b_u04_inverse_rounding_unknown_digit` | reasoning | mixed | 12 | 20 |
| `pgc_r03_g4b_u04_4b04_reasoning_bf41bdbb6ea8` | `kp_g4b_u04_inverse_rounding_possible_original` | reasoning | daily_life | 12 | 20 |
| `pgc_r03_g4b_u04_4b04_reasoning_e0adbd44db8b` | `kp_g4b_u04_inverse_rounding_possible_original` | reasoning | mixed | 12 | 20 |
| `pgc_r03_g4b_u04_4b04_reasoning_fbdaee663f87` | `kp_g4b_u04_inverse_rounding_unknown_digit` | reasoning | daily_life | 12 | 20 |
| `pgc_r03_g4b_u04_4b04_reasoning_fed3e04e2432` | `kp_g4b_u04_inverse_rounding_possible_original` | reasoning | sdg | 12 | 20 |

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R06_148_REPAIR_ROUTES_FROZEN
GOAL_DISTANCE_AFTER  = D1_R06_G4B_U04_15_BOUNDED_ROUTES_LIVE_20_CONFORMANT_PENDING_CONTRACT_RECONCILIATION
DISTANCE_REDUCED     = 15/15 G4B-U04 bounded mixed/reasoning routes now have two 20-question live worksheets with unique prompts and complete answer keys
REMAINING_BLOCKERS   = [R06_A01_CAPACITY_CONTRACT_RECONCILIATION]
NEXT_SHORTEST_STEP   = PGC-R06-A01_CapacityContractReconciliationAndCloseout
```

