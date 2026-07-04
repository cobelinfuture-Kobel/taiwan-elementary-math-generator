# S43C12 Browser Registry Module Regeneration

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C12_BrowserRegistryModuleRegeneration
TASK_STATUS = BROWSER_REGISTRY_REGEN_IMPLEMENTED_PENDING_TEST_READBACK
WRITE_TYPE = generated_browser_registry_modules_plus_tests_plus_docs
```

## Roadmap Alignment

```text
ROADMAP_FILE = docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
ROADMAP_PHASE = S43C_G3AU02PrototypeAndFirstVisibleKPPath
ROADMAP_NEXT_EXPECTED_STEP = S43C12_BrowserRegistryModuleRegeneration
ROADMAP_ALIGNMENT = PASS
```

S43C12 follows S43C11/S43C11R1. It regenerates browser registry projection from the promoted raw registry triplet. It does not enable HTML KnowledgePoint modes and does not expand to the remaining Batch A units.

## Files Changed

```text
site/modules/curriculum/registry/batch-a-knowledge-points.js
site/modules/curriculum/registry/batch-a-pattern-groups.js
site/modules/curriculum/registry/batch-a-knowledge-point-pattern-map.js
site/modules/curriculum/registry/batch-a-selector-candidates.js
tests/curriculum/batch-a/browser-registry-modules.test.js
tests/site/query-state-selector.test.js
tests/curriculum/batch-a/visible-pattern-group-resolver.test.js
docs/curriculum/output/S43C12_BrowserRegistryModuleRegeneration.md
```

## Regeneration Target

```text
visibleKnowledgePointId = kp_g3a_u02_add_multi_carry
visiblePatternGroupId = pg_g3a_u02_add_multi_carry_seed
visiblePatternSpecId = ps_g3a_u02_4digit_add_multi_carry
sourceId = g3a_u02_3a02
```

## Browser Projection Result

Updated:

```text
site/modules/curriculum/registry/batch-a-selector-candidates.js
```

Expected projection after S43C12:

```text
BATCH_A_SELECTOR_AVAILABILITY.visibleCount = 1
BATCH_A_SELECTOR_AVAILABILITY.hiddenPendingCount = 1
BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount = 2
bySourceId.g3a_u02_3a02.visibleCount = 1
bySourceId.g3a_u02_3a02.hiddenPendingCount = 1
bySourceId.g3a_u02_3a02.notSelectableCount = 2
```

`VISIBLE_KNOWLEDGE_POINTS` now contains only:

```text
kp_g3a_u02_add_multi_carry
```

and resolves to:

```text
patternGroupId = pg_g3a_u02_add_multi_carry_seed
patternSpecId = ps_g3a_u02_4digit_add_multi_carry
qaStatusLabel = qa_verified
```

## Protection Preserved

```text
kp_g3a_u02_sub_multi_borrow remains hidden and not visible in selector candidates
kp_g3a_u02_estimate_nearest_thousand remains not_selectable and not visible in selector candidates
kp_g3a_u02_word_problem_estimation_add_sub remains not_selectable and not visible in selector candidates
```

## Tests Updated

```text
tests/curriculum/batch-a/browser-registry-modules.test.js
tests/site/query-state-selector.test.js
tests/curriculum/batch-a/visible-pattern-group-resolver.test.js
```

Test expectation changes:

```text
- browser registry tests now expect visibleCount = 1 / hiddenPendingCount = 1 / notSelectableCount = 2
- visible add-multi-carry KP must resolve to its PatternGroup and PatternSpec
- hidden subtract A-row and D rows must remain invisible
- production query-state now preserves add-multi-carry singleKnowledgePoint params
- query-state still rejects D-row params
- resolver now resolves production visible add-multi-carry KP
- S43C9 fixture injection remains valid as regression coverage
```

## HTML Boundary Preserved

S43C12 intentionally does not enable HTML KnowledgePoint modes.

```text
HTML KP modes = not enabled
site/index.html = not modified
site/assets/browser/main.js = not modified
```

HTML mode enablement remains reserved for:

```text
S43C13_G3AU02_HTMLSingleVisibleKPEnablement
```

## S43C12 Gate

```text
S43C12_GATE = PASS_BROWSER_REGISTRY_REGEN_IMPLEMENTED_PENDING_TEST_READBACK

PASS:
- roadmap alignment checked and passed
- four generated browser registry modules updated from promoted raw registry state
- selector projection visibleCount updated to 1
- hiddenPendingCount updated to 1
- notSelectableCount remains 2
- only add-multi-carry KP is visible
- subtract multi-borrow remains hidden
- D rows remain not selectable and invisible
- query-state expectations updated for production visible KP
- resolver tests updated for production visible KP
- HTML KP modes not enabled
- Batch A 13-unit expansion not started

GAPS:
- post-S43C12 npm test / CI not observed
- HTML KP modes remain disabled until S43C13
- S43E 13-unit KP expansion not started
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_REGISTRY_TRIPLET_PROMOTED_LOCAL_TEST_READBACK_PASS
GOAL_DISTANCE_AFTER  = D1_BROWSER_SELECTOR_VISIBLE_COUNT_ONE_PENDING_TEST_READBACK
DISTANCE_REDUCED     = promoted raw registry triplet is now reflected in browser selector projection with visibleCount = 1 while hidden/D protections remain intact

FirstVisibleKPRegistryPromotion       100% -> 100%
BrowserRegistryVisibleCountOne          0% -> 100%
HTMLSingleVisibleKPEnablement           0% ->   0%
KPHTMLSelectablePath                   85% ->  90%
S43Overall                             99% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43C12 npm test PASS 尚未 observed",
  "HTML KP modes 尚未 enabled for visible candidate",
  "S43E 13-unit KP expansion 尚未開始"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C12R1_CIOrLocalTestReadback
```

S43C12R1 should obtain post-S43C12 `npm test` or observable CI readback before moving to S43C13 HTML single-visible-KP enablement.
