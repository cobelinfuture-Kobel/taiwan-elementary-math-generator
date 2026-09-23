# S43C13 G3A-U02 HTML Single Visible-KP Enablement

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C13_G3AU02_HTMLSingleVisibleKPEnablement
TASK_STATUS = HTML_SINGLE_VISIBLE_KP_ENABLEMENT_IMPLEMENTED_PENDING_TEST_READBACK
WRITE_TYPE = html_ui_plus_runtime_generator_plus_tests_plus_docs
```

## Roadmap Alignment

```text
ROADMAP_FILE = docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
ROADMAP_PHASE = S43C_G3AU02PrototypeAndFirstVisibleKPPath
ROADMAP_NEXT_EXPECTED_STEP = S43C13_G3AU02_HTMLSingleVisibleKPEnablement
ROADMAP_ALIGNMENT = PASS
```

S43C13 follows S43C12/S43C12R1. It enables the HTML path for the one verified visible G3A-U02 KnowledgePoint while preserving sourceUnit mode and keeping same-unit/cross-unit mixed KP modes disabled.

## Files Changed

```text
site/index.html
site/assets/browser/main.js
site/assets/browser/state/config-state.js
site/modules/curriculum/batch-a/batch-a-browser-generator.js
site/modules/curriculum/batch-a/batch-a-browser-validator.js
site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
tests/site/html-zero-visible-selector.test.js
tests/curriculum/batch-a/html-single-visible-kp-worksheet.test.js
docs/curriculum/output/S43C13_G3AU02_HTMLSingleVisibleKPEnablement.md
```

## HTML Selector Enablement

`site/index.html` now leaves `singleKnowledgePoint` enabled while keeping unsupported mixed modes disabled:

```text
sourceUnit = enabled
singleKnowledgePoint = enabled
mixedKnowledgePointsSameUnit = disabled
mixedKnowledgePointsCrossUnit = disabled
```

## Browser UI State Behavior

`site/assets/browser/main.js` now:

```text
- reads visible KnowledgePoints from the generated browser selector projection
- enables singleKnowledgePoint only when the selected source has visibleCount > 0
- keeps mixed same-unit / cross-unit modes disabled
- renders the visible KnowledgePoint summary in the KnowledgePoint panel
- when singleKnowledgePoint mode is selected, binds the only visible G3A-U02 KP and its visible PatternGroup into config state
- preserves sourceUnit behavior when sourceUnit is selected or no visible KP exists
```

Target automatic binding:

```text
knowledgePointId = kp_g3a_u02_add_multi_carry
patternGroupId = pg_g3a_u02_add_multi_carry_seed
patternSpecId = ps_g3a_u02_4digit_add_multi_carry
```

## State Contract

`site/assets/browser/state/config-state.js` now exposes an atomic selector setter:

```text
setBatchASelectorSelection(state, {
  selectionMode,
  selectedKnowledgePointIds,
  selectedPatternGroupIds
})
```

This prevents the UI from temporarily selecting `singleKnowledgePoint` without its required visible KnowledgePoint and PatternGroup ids.

## Runtime Generation Path

`site/modules/curriculum/batch-a/batch-a-browser-generator.js` now supports both paths:

```text
sourceUnit path:
  patternSpecIds = getBatchAPatternSpecIdsForSource(sourceId)
  allocation = generated from source pattern pool

singleKnowledgePoint path:
  resolver = resolveVisiblePatternGroupSelection(...)
  patternSpecIds = resolver.patternSpecIds
  allocation = resolver.allocation
```

The single visible KP path therefore generates only:

```text
ps_g3a_u02_4digit_add_multi_carry
```

## Worksheet Metadata

`site/modules/curriculum/batch-a/batch-a-browser-worksheet.js` now records KP-mode metadata:

```text
generationContext.generationMode = batchAKnowledgePoint
configSnapshot.selectionMode = singleKnowledgePoint
configSnapshot.selectedKnowledgePointIds = [kp_g3a_u02_add_multi_carry]
configSnapshot.selectedPatternGroupIds = [pg_g3a_u02_add_multi_carry_seed]
batchA.knowledgePointIds = [kp_g3a_u02_add_multi_carry]
batchA.patternGroupIds = [pg_g3a_u02_add_multi_carry_seed]
batchA.patternSpecIds = [ps_g3a_u02_4digit_add_multi_carry]
```

## Tests Added / Updated

Updated:

```text
tests/site/html-zero-visible-selector.test.js
```

Added:

```text
tests/curriculum/batch-a/html-single-visible-kp-worksheet.test.js
```

Test coverage now checks:

```text
- index.html enables sourceUnit and singleKnowledgePoint only
- static HTML does not render visible/hidden/D ids directly
- main.js binds visible-KP selector state without hardcoding registry ids
- single visible KP plan uses resolver allocation
- single visible KP generation produces only add-multi-carry questions
- worksheet document records single-KP metadata
- sourceUnit generation remains unaffected
```

## Protection Preserved

```text
kp_g3a_u02_sub_multi_borrow remains hidden and unavailable to HTML selection
kp_g3a_u02_estimate_nearest_thousand remains D / not_selectable
kp_g3a_u02_word_problem_estimation_add_sub remains D / not_selectable
mixedKnowledgePointsSameUnit remains disabled
mixedKnowledgePointsCrossUnit remains disabled
S43E 13-unit expansion not started
```

## S43C13 Gate

```text
S43C13_GATE = PASS_HTML_SINGLE_VISIBLE_KP_ENABLEMENT_IMPLEMENTED_PENDING_TEST_READBACK

PASS:
- roadmap alignment checked and passed
- singleKnowledgePoint HTML option enabled
- mixed same-unit / cross-unit KP modes remain disabled
- UI reads visible KPs from generated browser selector projection
- UI binds the only visible KP automatically for single-KP mode
- generator supports resolver allocation for single-KP mode
- worksheet metadata records KP-mode provenance
- sourceUnit generation path preserved
- hidden subtract A-row remains unavailable to selector
- D rows remain unavailable to selector
- S43E 13-unit expansion not started

GAPS:
- post-S43C13 npm test / CI not observed
- S43C14 single visible KP smoke QA not yet executed
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_BROWSER_SELECTOR_VISIBLE_COUNT_ONE_LOCAL_TEST_READBACK_PASS
GOAL_DISTANCE_AFTER  = D1_HTML_SINGLE_VISIBLE_KP_ENABLEMENT_PENDING_TEST_READBACK
DISTANCE_REDUCED     = HTML can now select the verified single visible G3A-U02 KnowledgePoint and route it through resolver-backed generation while preserving sourceUnit and hidden/D protections

BrowserRegistryVisibleCountOne        100% -> 100%
HTMLSingleVisibleKPEnablement           0% -> 100%
SingleVisibleKPSmokeQA                  0% ->   0%
KPHTMLSelectablePath                   93% ->  96%
S43Overall                             99% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43C13 npm test PASS 尚未 observed",
  "S43C14 single visible KP smoke QA 尚未 executed",
  "S43E 13-unit KP expansion 尚未開始"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C13R1_CIOrLocalTestReadback
```

S43C13R1 should obtain post-S43C13 `npm test` or observable CI readback before S43C14 single visible KP smoke QA.
