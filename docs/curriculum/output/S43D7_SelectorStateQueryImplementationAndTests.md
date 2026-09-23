# S43D7 Selector State Query Implementation and Tests

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43D7_SelectorStateQueryImplementationAndTests
TASK_STATUS = PARTIAL_SELECTOR_STATE_IMPLEMENTED_QUERY_WRITE_BLOCKED
WRITE_TYPE = state_runtime_plus_tests_plus_docs
```

S43D7 partially implements selector state support and leakage tests. The query-state implementation portion was attempted but could not be written because repeated GitHub write attempts for `site/assets/browser/state/query-state.js` and a standalone query guard helper were blocked by platform safety checks.

## Files Modified / Created

```text
MODIFIED:
site/assets/browser/state/config-state.js

CREATED:
tests/site/selector-state.test.js
docs/curriculum/output/S43D7_SelectorStateQueryImplementationAndTests.md
```

## Implemented

```text
- WORKSHEET_MODES.BATCH_A_KNOWLEDGE_POINT added
- BATCH_A_SELECTION_MODES added
- SELECTOR_WARNING_CODES added
- selectorAvailability added to Batch A state
- selectorWarnings added to Batch A state
- selectedKnowledgePointIds added to Batch A state
- selectedPatternGroupIds added to Batch A state
- normalizeBatchASelectorState() added
- setBatchASelectionMode() added
- setBatchASelectedKnowledgePointIds() added
- setBatchASelectedPatternGroupIds() added
- getBatchAWorksheetPlan() now carries selector-safe fields
```

## Leakage Behavior Implemented in State Layer

Current G3A-U02 selector availability remains:

```text
visibleCount = 0
hiddenPendingCount = 2
notSelectableCount = 2
```

State normalization now falls back to sourceUnit when KP mode is requested without visible candidates.

Hidden A rows cannot survive selector normalization:

```text
kp_g3a_u02_add_multi_carry
kp_g3a_u02_sub_multi_borrow
```

D rows cannot survive selector normalization:

```text
kp_g3a_u02_estimate_nearest_thousand
kp_g3a_u02_word_problem_estimation_add_sub
```

## Tests Added

```text
tests/site/selector-state.test.js
```

Test coverage:

```text
- Batch A selector state defaults to sourceUnit mode
- current availability is visible=0, hidden=2, notSelectable=2
- hidden A-class KP IDs are dropped by selector normalization
- D-class KP IDs are dropped by selector normalization
- selector setters fall back safely when no visible candidates exist
- worksheet plan carries selector-safe fields without enabling KP generation
```

## Query-State Work Not Completed

Attempted but blocked:

```text
site/assets/browser/state/query-state.js update
site/assets/browser/state/selector-query-guard.js create
```

Reason:

```text
GitHub write calls were blocked by platform safety checks during query-state / query-guard JS writes.
```

Result:

```text
query-state main file still does not parse or write selectionMode / kp / pg.
query-state leakage tests were not added in this step.
```

## Scope Preserved

```text
HTML selector = not implemented
resolver = not implemented
generator/validator variants = not implemented
fine PatternSpec JSON = not materialized
no KP promoted to selectable
sourceId worksheet path = preserved
```

## S43D7 Gate

```text
S43D7_GATE = PARTIAL_SELECTOR_STATE_IMPLEMENTED_QUERY_STATE_BLOCKED

PASS:
- selector state constants implemented
- selector state default fields implemented
- selector availability preserved from browser-safe registry modules
- hidden A rows dropped by state normalization
- D rows dropped by state normalization
- worksheet plan carries selector-safe fields
- selector state tests added
- no KP promoted to selectable
- HTML selector not implemented
- resolver not implemented

BLOCKED:
- query-state.js guarded selectionMode/kp/pg parsing not implemented
- query-state.js guarded selectionMode/kp/pg writing not implemented
- query-state leakage tests not implemented
- CI / npm test status not observed in this environment
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_BROWSER_REGISTRY_MODULES_GENERATED
GOAL_DISTANCE_AFTER  = D1_SELECTOR_STATE_PARTIAL_IMPLEMENTED_QUERY_BLOCKED
DISTANCE_REDUCED     = selector-safe Batch A state now exists and rejects hidden/not_selectable KP selections at state normalization, but URL query-state remains blocked

BrowserRegistryImplementation       100% -> 100%
SelectorStateImplementation           0% ->  60%
SelectorQueryStateImplementation      0% ->   0%
KPResolverImplementation              0% ->   0%
KPHTMLSelectablePath                  0% ->   0%
S43Overall                           93% ->  94%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "query-state.js guarded selectionMode/kp/pg parsing 尚未 implemented",
  "query-state.js guarded selectionMode/kp/pg writing 尚未 implemented",
  "query-state leakage tests 尚未 implemented",
  "CI / npm test 尚未 observed",
  "VisiblePatternGroup resolver 尚未 implemented",
  "resolver tests 尚未 implemented",
  "HTML KnowledgePoint selector 尚未實作",
  "no KP is selectable yet",
  "fine PatternSpec JSON 尚未 materialized",
  "generator/validator variants 尚未 implemented"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43D7R1_QueryStateGuardPatchRetryAndCI
```

S43D7R1 should retry the query-state patch in a smaller, targeted form and obtain npm test / CI readback before moving to resolver implementation.
