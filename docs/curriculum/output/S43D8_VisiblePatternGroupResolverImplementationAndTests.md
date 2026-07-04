# S43D8 Visible PatternGroup Resolver Implementation and Tests

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43D8_VisiblePatternGroupResolverImplementationAndTests
TASK_STATUS = IMPLEMENTED_READBACK_PENDING_CI
WRITE_TYPE = resolver_runtime_plus_tests_plus_docs
```

S43D8 implements the visible PatternGroup resolver as a pure function module using the browser-safe selector registry modules from S43D6.

## Files Created

```text
site/modules/curriculum/batch-a/visible-pattern-group-resolver.js
tests/curriculum/batch-a/visible-pattern-group-resolver.test.js
docs/curriculum/output/S43D8_VisiblePatternGroupResolverImplementationAndTests.md
```

## Implemented Resolver Module

```text
site/modules/curriculum/batch-a/visible-pattern-group-resolver.js
```

Exports:

```text
BATCH_A_RESOLVER_SELECTION_MODES
BATCH_A_RESOLVER_ERROR_CODES
resolveVisiblePatternGroupSelection(input)
```

The resolver depends only on browser-safe selector registry helpers:

```text
listVisibleBatchAKnowledgePoints()
getVisibleBatchAKnowledgePoint(knowledgePointId)
getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId)
```

## Resolver Behavior Implemented

```text
sourceUnit mode:
- returns ok = true
- worksheetMode = batchASource
- returns control to existing sourceId path
- does not resolve KP IDs, PatternGroup IDs, PatternSpec IDs, or allocation

singleKnowledgePoint mode:
- requires visible KnowledgePoint candidates
- current zero-visible state returns safe failure

mixedKnowledgePointsSameUnit mode:
- implemented as a resolver path, but current zero-visible state returns safe failure

mixedKnowledgePointsCrossUnit mode:
- returns kp_resolver_cross_unit_not_supported_yet before cross-unit QA exists
```

## Current Zero-Visible Boundary Preserved

Current browser selector projection remains:

```text
visibleCount = 0
hiddenPendingCount = 2
notSelectableCount = 2
```

Therefore current KP-mode resolver requests return:

```text
ok = false
patternSpecIds = []
allocation = []
error includes kp_resolver_no_visible_kp
```

Hidden A rows do not resolve:

```text
kp_g3a_u02_add_multi_carry
kp_g3a_u02_sub_multi_borrow
```

D rows do not resolve:

```text
kp_g3a_u02_estimate_nearest_thousand
kp_g3a_u02_word_problem_estimation_add_sub
```

## Error Codes Implemented

```text
kp_resolver_selection_mode_invalid
kp_resolver_no_visible_kp
kp_resolver_kp_not_visible
kp_resolver_pattern_group_not_visible
kp_resolver_pattern_group_not_linked_to_kp
kp_resolver_mapping_not_qa_verified
kp_resolver_pattern_spec_missing
kp_resolver_all_candidates_rejected
kp_resolver_mixed_same_unit_source_mismatch
kp_resolver_cross_unit_not_supported_yet
kp_resolver_allocation_not_applicable
```

## Tests Added

```text
tests/curriculum/batch-a/visible-pattern-group-resolver.test.js
```

Test coverage:

```text
- sourceUnit mode returns safe handoff to existing sourceId path
- singleKnowledgePoint mode fails safely in current zero-visible state
- hidden A-row IDs do not resolve to PatternSpec IDs
- D-row IDs do not resolve to PatternSpec IDs
- unknown selection mode returns deterministic error
- cross-unit mode remains deferred before cross-unit resolver QA
```

## Scope Preserved

```text
HTML selector = not implemented
worksheet builder integration = not implemented
generator/validator variants = not implemented
fine PatternSpec JSON = not materialized
no KP promoted to selectable
sourceId worksheet path = preserved
```

## S43D8 Gate

```text
S43D8_GATE = PASS_VISIBLE_PATTERN_GROUP_RESOLVER_IMPLEMENTED_READBACK_PENDING_CI

PASS:
- resolver pure function module created
- resolver uses browser-safe selector modules, not raw registry JSON
- sourceUnit handoff preserves existing sourceId path
- current zero-visible KP mode returns safe failure
- hidden A rows do not resolve to PatternSpec IDs
- D rows do not resolve to PatternSpec IDs
- deterministic resolver error codes implemented
- resolver tests added
- HTML selector not implemented
- worksheet builder integration not implemented
- no KP promoted to selectable

GAPS:
- CI / npm test status not observed after S43D8 changes
- future visible-KP query survival is not implemented yet
- positive visible-KP resolver fixture not possible until explicit QA promotion creates visible candidates
- HTML selector not implemented yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_LOCAL_TEST_READBACK_PASS
GOAL_DISTANCE_AFTER  = D1_VISIBLE_PATTERN_GROUP_RESOLVER_IMPLEMENTED_PENDING_TEST_READBACK
DISTANCE_REDUCED     = S43 now has a resolver implementation and tests that can safely reject hidden/not_selectable KP selections and preserve sourceUnit handoff

TestReadbackKnown                    100% -> 100%
KPResolverImplementation               0% -> 100%
KPResolverTestReadback                 0% ->   0%
KPHTMLSelectablePath                   0% ->   0%
S43Overall                            96% ->  97%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "npm test PASS after S43D8 尚未 observed",
  "future visible-KP query survival 尚未 implemented",
  "positive visible-KP resolver fixture 尚未 possible until QA promotion",
  "HTML KnowledgePoint selector 尚未實作",
  "no KP is selectable yet",
  "fine PatternSpec JSON 尚未 materialized",
  "generator/validator variants 尚未 implemented"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43D8R1_CIOrLocalTestReadback
```

S43D8R1 should obtain `npm test` or GitHub CI readback after the resolver module and resolver tests before any worksheet-builder or HTML selector integration.
