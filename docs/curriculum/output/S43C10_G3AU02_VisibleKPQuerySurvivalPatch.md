# S43C10 G3A-U02 Visible KP Query Survival Patch

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C10_G3AU02_VisibleKPQuerySurvivalPatch
TASK_STATUS = QUERY_SURVIVAL_PATCH_IMPLEMENTED_PENDING_TEST_READBACK
WRITE_TYPE = query_state_patch_plus_tests_plus_docs
```

## Roadmap Alignment

```text
ROADMAP_FILE = docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
ROADMAP_PHASE = S43C_G3AU02PrototypeAndFirstVisibleKPPath
ROADMAP_NEXT_EXPECTED_STEP = S43C10_G3AU02_VisibleKPQuerySurvivalPatch
ROADMAP_ALIGNMENT = PASS
```

S43C10 follows S43C9R1 local PASS and implements future visible-KP query survival. It does not promote the production registry, regenerate browser selector modules, or enable HTML KnowledgePoint modes.

## Files Changed

```text
site/assets/browser/state/query-state.js
tests/site/query-state-selector.test.js
docs/curriculum/output/S43C10_G3AU02_VisibleKPQuerySurvivalPatch.md
```

## Implementation Summary

### 1. Query-state selectorAccess seam

Updated:

```text
site/assets/browser/state/query-state.js
```

`parseQueryState(search, options)` now accepts optional selector access through:

```js
parseQueryState(search, {
  selectorAccess: {
    getSelectorAvailability,
    getVisibleBatchAKnowledgePoint,
    getVisiblePatternGroupsForKnowledgePoint
  }
})
```

Production behavior remains unchanged because calls without `selectorAccess` use the generated selector projection module.

### 2. Zero-visible fallback preserved

When production selector availability remains:

```text
visibleCount = 0
```

then selector query params still fall back to:

```text
selectionMode = sourceUnit
selectedKnowledgePointIds = []
selectedPatternGroupIds = []
```

and warnings still include:

```text
no_visible_knowledge_points
selector_mode_fallback
selector_id_dropped
```

This preserves the S43D zero-visible safety behavior.

### 3. Future visible-KP query survival implemented

When selector access exposes the future visible add-multi-carry KP, query state now preserves:

```text
selectionMode = singleKnowledgePoint
selectedKnowledgePointIds = [kp_g3a_u02_add_multi_carry]
selectedPatternGroupIds = [pg_g3a_u02_add_multi_carry_seed]
```

for a query like:

```text
?sourceId=g3a_u02_3a02&selectionMode=singleKnowledgePoint&kp=kp_g3a_u02_add_multi_carry&pg=pg_g3a_u02_add_multi_carry_seed&questionCount=7
```

### 4. Invalid / non-visible ID rejection preserved

Even if selector access has one future visible KP, non-visible IDs such as D-row IDs are dropped and the mode falls back to sourceUnit.

### 5. Query writer now supports future KP mode

`writeQueryStateFromState(state)` continues to omit selector params when `selectionMode = sourceUnit`.

When `selectionMode` is a KP mode, it writes:

```text
selectionMode=<mode>
kp=<knowledgePointId>
pg=<patternGroupId>
```

This allows future single-visible-KP URLs to round-trip after registry promotion.

## Test Summary

Updated:

```text
tests/site/query-state-selector.test.js
```

Coverage added / preserved:

```text
- sourceUnit query backward compatibility
- zero-visible hidden A-row selector params drop to sourceUnit
- zero-visible D-row selector params drop to sourceUnit
- future visible single-KP query params survive with selectorAccess fixture
- future selectorAccess still drops non-visible D-row IDs
- writeQueryStateFromState omits selector params in sourceUnit mode
- writeQueryStateFromState writes selector params for future single visible KP state
```

## Registry and Selector Boundary Preserved

S43C10 intentionally does not alter production visibility:

```text
KnowledgePointNode.htmlSelectableStatus = hidden
PatternGroup.visibilityStatus = hidden
Mapping.htmlExposurePolicy = internal_only
Mapping.qaStatus = smoke_test_required
Browser selector visibleCount = 0
HTML selector KP modes = disabled
```

Registry promotion remains reserved for:

```text
S43C11_G3AU02_AddMultiCarryRegistryPromotionAfterQA
```

S43C10 only proves query survival behavior for the future visible state through a controlled selectorAccess test fixture.

## S43C10 Gate

```text
S43C10_GATE = PASS_VISIBLE_KP_QUERY_SURVIVAL_PATCH_IMPLEMENTED_PENDING_TEST_READBACK

PASS:
- roadmap alignment checked and passed
- parseQueryState selectorAccess seam added
- default production selector projection preserved
- current zero-visible fallback preserved
- future visible single-KP query parse survival added
- future visible single-KP query write survival added
- non-visible IDs still rejected/dropped
- query-state tests updated
- no registry visibility changed
- browser selector modules not regenerated
- HTML KP modes not enabled

GAPS:
- post-S43C10 npm test / CI not observed
- registry triplet remains hidden/internal
- browser selector visibleCount remains 0 until S43C11/S43C12
- HTML KP modes remain disabled until S43C13
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_POSITIVE_RESOLVER_FIXTURE_LOCAL_TEST_READBACK_PASS
GOAL_DISTANCE_AFTER  = D1_VISIBLE_KP_QUERY_SURVIVAL_PATCH_IMPLEMENTED_PENDING_TEST_READBACK
DISTANCE_REDUCED     = future visible add-multi-carry KP query params can now survive parse/write under controlled selectorAccess while production zero-visible safety remains intact

FirstVisibleKPResolverFixture        100% -> 100%
FirstVisibleKPQuerySurvival             0% ->  80%
FirstVisibleKPRegistryPromotion         0% ->   0%
KPHTMLSelectablePath                   65% ->  70%
S43Overall                             99% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43C10 npm test PASS 尚未 observed",
  "registry triplet 尚未 promoted to selectable/visible/eligible_after_qa",
  "browser selector modules 尚未 regenerated with visibleCount = 1",
  "HTML KP modes 尚未 enabled for visible candidate",
  "S43E 13-unit KP expansion 尚未開始"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C10R1_CIOrLocalTestReadback
```

S43C10R1 should obtain post-S43C10 `npm test` or observable CI readback before moving to S43C11 registry promotion.
