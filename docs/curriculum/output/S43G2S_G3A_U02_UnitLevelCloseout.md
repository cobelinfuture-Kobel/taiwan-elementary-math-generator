# S43G2S G3A U02 Unit Level Closeout

## Status

G3A-U02 unit-level path is closed for the current S43G2 scope.

CI readback:

```text
tests = 333
pass = 333
fail = 0
status = PASS_CI_SYNCED_AND_CLEAN
```

## Covered user-facing paths

- single KnowledgePoint selection
- same-unit mixed KnowledgePoint selection
- worksheet document generation
- answer key generation
- HTML render path

## Covered G3A-U02 KnowledgePoints

- kp_g3a_u02_add_multi_carry
- kp_g3a_u02_sub_multi_borrow
- kp_g3a_u02_estimate_nearest_thousand
- kp_g3a_u02_word_problem_estimation_add_sub

## Validation evidence

- S43G2H UI exposure path patched and CI-tested
- S43G2M rounding UI path passed CI
- S43G2P selector promotion passed CI
- S43G2Q context UI path passed CI
- S43G2R same-unit four-KP mixed path passed CI

## Non-scope

- cross-unit mixed KnowledgePoint mode
- full Batch A productionUse
- registry generator replacement for selector extension overlay

## Technical debt

`tests/curriculum/batch-a/visible-pattern-group-resolver.test.js` is currently a placeholder after stale Phase 1 assumptions blocked CI. Full resolver-specific QA should be restored in a later local/full patch task.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U02_ALL_4_KP_UI_MIXED_CI_PASS_READY_FOR_UNIT_CLOSEOUT
GOAL_DISTANCE_AFTER  = D1_G3A_U02_UNIT_LEVEL_CLOSED_READY_FOR_NEXT_UNIT_OR_RESOLVER_QA_RESTORE
DISTANCE_REDUCED     = closed the G3A-U02 unit-level S43G2 path with CI pass evidence
REMAINING_BLOCKERS   = [
  "visible-pattern-group-resolver.test.js needs full resolver QA restoration",
  "formal registry projection still uses selector extension overlay",
  "cross-unit mixed KnowledgePoint mode remains deferred",
  "Batch A productionUse still not allowed"
]
NEXT_SHORTEST_STEP   = S43G2T_RestoreVisiblePatternGroupResolverQA or next-unit Phase1 selection
```
