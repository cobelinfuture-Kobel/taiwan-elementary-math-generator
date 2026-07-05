# S43G3C G3A U03 Unit Level Closeout

## Status

G3A-U03 unit-level selector overlay path is closed for the current S43G3 scope.

CI readback:

```text
tests = 339
pass = 339
fail = 0
status = PASS_CI_SYNCED_AND_CLEAN
```

## Covered paths

- selector overlay exposure
- same-unit mixed KnowledgePoint selection
- worksheet document generation
- answer key generation
- HTML render path

## Covered G3A-U03 PatternSpecs

- ps_g3a_u03_2digit_by_1digit_carry
- ps_g3a_u03_10_multiple_by_1digit
- ps_g3a_u03_3digit_by_1digit
- ps_g3a_u03_consecutive_multiplication_two_step

## Non-scope

- master registry materialization
- cross-unit mixed KnowledgePoint mode
- Batch A productionUse

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U03_SELECTOR_PROMOTED_PENDING_UI_QA
GOAL_DISTANCE_AFTER  = D1_G3A_U03_UNIT_LEVEL_CLOSED_READY_FOR_NEXT_UNIT
DISTANCE_REDUCED     = promoted and CI-verified G3A-U03 selector, worksheet, answer key, and HTML render paths
REMAINING_BLOCKERS   = [
  "formal registry projection still uses selector extension overlay",
  "cross-unit mixed KnowledgePoint mode remains deferred",
  "Batch A productionUse still not allowed"
]
NEXT_SHORTEST_STEP   = S43G4_G3A_U06_Phase1SelectionScan
```
