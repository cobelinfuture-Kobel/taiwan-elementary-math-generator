# S43G4C G3A U06 Unit Level Closeout

## Status

G3A-U06 unit-level selector overlay path is closed for the current S43G4 scope.

CI readback:

```text
tests = 340
pass = 340
fail = 0
status = PASS_CI_SYNCED_AND_CLEAN
```

## Covered paths

- selector overlay exposure
- same-unit mixed KnowledgePoint selection
- worksheet document generation
- answer key generation
- HTML render path

## Covered G3A-U06 PatternSpecs

- ps_g3a_u06_exact_division_check
- ps_g3a_u06_divisibility_exact_check

## Non-scope

- master registry materialization
- cross-unit mixed KnowledgePoint mode
- Batch A productionUse

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U06_SELECTOR_PROMOTED_PENDING_RENDER_QA
GOAL_DISTANCE_AFTER  = D1_G3A_U06_UNIT_LEVEL_CLOSED_READY_FOR_NEXT_UNIT
DISTANCE_REDUCED     = promoted and CI-verified G3A-U06 selector, worksheet, answer key, and HTML render paths
REMAINING_BLOCKERS   = [
  "formal registry projection still uses selector extension overlay",
  "cross-unit mixed KnowledgePoint mode remains deferred",
  "Batch A productionUse still not allowed"
]
NEXT_SHORTEST_STEP   = S43G5_G3B_U01_Phase1SelectionScan
```
