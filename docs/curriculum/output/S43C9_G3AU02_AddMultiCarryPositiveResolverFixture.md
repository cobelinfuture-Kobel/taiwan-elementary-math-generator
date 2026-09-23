# S43C9 G3A-U02 Add Multi-Carry Positive Resolver Fixture

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C9_G3AU02_AddMultiCarryPositiveResolverFixture
TASK_STATUS = POSITIVE_RESOLVER_FIXTURE_IMPLEMENTED_PENDING_TEST_READBACK
WRITE_TYPE = resolver_testability_seam_plus_tests_plus_docs
```

## Roadmap Alignment

```text
ROADMAP_FILE = docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
ROADMAP_PHASE = S43C_G3AU02PrototypeAndFirstVisibleKPPath
ROADMAP_NEXT_EXPECTED_STEP = S43C9_G3AU02_AddMultiCarryPositiveResolverFixture
ROADMAP_ALIGNMENT = PASS
```

S43C9 follows S43C8R1 local PASS and adds a positive visible-KP resolver fixture. It does not promote the production registry and does not enable HTML KnowledgePoint modes.

## Files Changed

```text
site/modules/curriculum/batch-a/visible-pattern-group-resolver.js
tests/curriculum/batch-a/visible-pattern-group-resolver.test.js
docs/curriculum/output/S43C9_G3AU02_AddMultiCarryPositiveResolverFixture.md
```

## Implementation Summary

### 1. Resolver registryAccess fixture seam

Updated:

```text
site/modules/curriculum/batch-a/visible-pattern-group-resolver.js
```

The resolver now accepts an optional second argument:

```js
resolveVisiblePatternGroupSelection(input, options)
```

where `options.registryAccess` may provide fixture accessors:

```text
listVisibleBatchAKnowledgePoints
getVisibleBatchAKnowledgePoint
getVisiblePatternGroupsForKnowledgePoint
resolveVisiblePatternSpecIdsForKnowledgePoint
```

Production behavior remains unchanged because calls without `options.registryAccess` still use the generated selector projection module.

### 2. Positive S43C9 visible-KP fixture

Updated:

```text
tests/curriculum/batch-a/visible-pattern-group-resolver.test.js
```

Added a positive fixture for:

```text
knowledgePointId = kp_g3a_u02_add_multi_carry
patternGroupId = pg_g3a_u02_add_multi_carry_seed
patternSpecId = ps_g3a_u02_4digit_add_multi_carry
sourceId = g3a_u02_3a02
```

The fixture asserts the production selector projection remains zero-visible:

```text
BATCH_A_SELECTOR_AVAILABILITY.visibleCount = 0
```

Then the fixture injects a controlled visible registryAccess object and confirms the resolver returns:

```text
ok = true
worksheetMode = batchAKnowledgePoint
selectionMode = singleKnowledgePoint
sourceIds = [g3a_u02_3a02]
knowledgePointIds = [kp_g3a_u02_add_multi_carry]
patternGroupIds = [pg_g3a_u02_add_multi_carry_seed]
patternSpecIds = [ps_g3a_u02_4digit_add_multi_carry]
allocation = [{ patternGroupId, patternSpecId, questionCount: 7 }]
visibleAcceptedCount = 1
rejectedCount = 0
rejectionCodes = []
```

## Registry and Selector Boundary Preserved

S43C9 intentionally does not alter production visibility:

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

S43C9 only proves that the resolver positive path works when the future visible registry state is supplied through a controlled test fixture.

## S43C9 Gate

```text
S43C9_GATE = PASS_POSITIVE_RESOLVER_FIXTURE_IMPLEMENTED_PENDING_TEST_READBACK

PASS:
- roadmap alignment checked and passed
- optional registryAccess seam added to resolver
- default production registry access preserved
- positive visible-KP fixture added for kp_g3a_u02_add_multi_carry
- fixture resolves pg_g3a_u02_add_multi_carry_seed
- fixture resolves ps_g3a_u02_4digit_add_multi_carry
- resolver allocation verified for single visible KP
- fixture asserts production visibleCount remains 0
- no registry visibility changed
- browser selector modules not regenerated
- HTML KP modes not enabled

GAPS:
- post-S43C9 npm test / CI not observed
- future visible-KP query survival not implemented
- registry triplet remains hidden/internal
- browser selector visibleCount remains 0 until S43C11/S43C12
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_POST_CARRY_POLICY_LOCAL_TEST_READBACK_PASS
GOAL_DISTANCE_AFTER  = D1_POSITIVE_RESOLVER_FIXTURE_IMPLEMENTED_PENDING_TEST_READBACK
DISTANCE_REDUCED     = resolver positive path now has a controlled fixture proving the future visible add-multi-carry KP can resolve to its PatternGroup, PatternSpec, and allocation without production registry promotion

FirstVisibleKPImplementation         100% -> 100%
FirstVisibleKPRuntimeQA              100% -> 100%
FirstVisibleKPResolverFixture          0% ->  80%
FirstVisibleKPRegistryPromotion         0% ->   0%
KPHTMLSelectablePath                   55% ->  60%
S43Overall                             99% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43C9 npm test PASS 尚未 observed",
  "future visible-KP query survival 尚未 implemented",
  "registry triplet 尚未 promoted to selectable/visible/eligible_after_qa",
  "browser selector modules 尚未 regenerated with visibleCount = 1",
  "HTML KP modes 尚未 enabled for visible candidate",
  "S43E 13-unit KP expansion 尚未開始"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C9R1_CIOrLocalTestReadback
```

S43C9R1 should obtain post-S43C9 `npm test` or observable CI readback before moving to S43C10 visible-KP query survival patch.
