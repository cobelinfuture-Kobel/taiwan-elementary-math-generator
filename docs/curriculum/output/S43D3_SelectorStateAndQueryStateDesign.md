# S43D3 Selector State and Query-State Design

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43D3_SelectorStateAndQueryStateDesign
TASK_STATUS = STATE_QUERY_DESIGN
WRITE_TYPE = docs_only
```

S43D3 designs future selector state and query-state changes for the HTML KnowledgePoint selector.

This task does not update config-state.js, query-state.js, HTML, resolver, generator, validator, renderer, registry JSON, or browser registry modules.

## Inputs

```text
S43D1 = HTML KnowledgePoint selector design
S43D2 = browser registry delivery design
Current state file = site/assets/browser/state/config-state.js
Current query file = site/assets/browser/state/query-state.js
```

## Current State Readback

Current worksheet mode:

```text
WORKSHEET_MODES.BATCH_A_SOURCE = "batchASource"
```

Current Batch A state fields:

```text
sourceId
questionCount
ordering
includeAnswerKey
generationSeed
columns
rowsPerPage
```

Current query-state fields:

```text
sourceId
questionCount
ordering
answerKey
generationSeed
columns
rowsPerPage
```

There is currently no state or query support for:

```text
selectionMode
selectedKnowledgePointIds
selectedPatternGroupIds
selectorAvailability
selectorWarnings
```

## Design Goal

Add selector state and query-state without breaking the existing source-unit path.

```text
Default behavior must remain sourceUnit / batchASource.
All KP and PatternGroup IDs from query-state must pass browser-safe visibility validation before entering state.
D rows, hidden rows, and internal-only rows must not survive query parsing as selected values.
```

## Worksheet Mode Design

Future enum:

```text
WORKSHEET_MODES = {
  BATCH_A_SOURCE: "batchASource",
  BATCH_A_KNOWLEDGE_POINT: "batchAKnowledgePoint"
}
```

Mode meaning:

```text
batchASource = current sourceId-only worksheet path
batchAKnowledgePoint = selector-driven worksheet path using visible KP / PatternGroup candidates
```

Initial implementation rule:

```text
batchASource remains default.
batchAKnowledgePoint may be set only when selectionMode is not sourceUnit and at least one visible KP candidate exists.
```

## Selection Mode Design

Future enum:

```text
BATCH_A_SELECTION_MODES = {
  SOURCE_UNIT: "sourceUnit",
  SINGLE_KNOWLEDGE_POINT: "singleKnowledgePoint",
  MIXED_KNOWLEDGE_POINTS_SAME_UNIT: "mixedKnowledgePointsSameUnit",
  MIXED_KNOWLEDGE_POINTS_CROSS_UNIT: "mixedKnowledgePointsCrossUnit"
}
```

Initial enablement rule:

```text
sourceUnit = enabled immediately
singleKnowledgePoint = disabled until at least one visible KP exists
mixedKnowledgePointsSameUnit = disabled until resolver QA exists
mixedKnowledgePointsCrossUnit = disabled until cross-unit resolver QA exists
```

## Future BatchA State Shape

```text
batchA.sourceId
batchA.questionCount
batchA.ordering
batchA.includeAnswerKey
batchA.generationSeed
batchA.columns
batchA.rowsPerPage
batchA.selectionMode
batchA.selectedKnowledgePointIds
batchA.selectedPatternGroupIds
batchA.selectorAvailability
batchA.selectorWarnings
```

Default values:

```text
selectionMode = sourceUnit
selectedKnowledgePointIds = []
selectedPatternGroupIds = []
selectorAvailability = { visibleCount: 0, hiddenPendingCount: 0, notSelectableCount: 0, bySourceId: {} }
selectorWarnings = []
```

## State Normalization Rules

```text
1. If selectionMode is absent, default to sourceUnit.
2. If selectionMode is sourceUnit, selectedKnowledgePointIds and selectedPatternGroupIds must be cleared.
3. If selectedKnowledgePointIds contains non-visible KP IDs, drop them and add selector warning.
4. If selectedPatternGroupIds contains non-visible PatternGroup IDs, drop them and add selector warning.
5. If all selected IDs are dropped, return to sourceUnit mode unless UI explicitly chooses an empty KP mode.
6. D-class rows must never be stored in selectedKnowledgePointIds or selectedPatternGroupIds.
7. Hidden/internal rows may count in selectorAvailability but must not be selected.
```

## Query-State Extension Design

Future query params:

```text
selectionMode = sourceUnit | singleKnowledgePoint | mixedKnowledgePointsSameUnit | mixedKnowledgePointsCrossUnit
kp = comma-separated KnowledgePoint IDs
pg = comma-separated PatternGroup IDs
```

Existing query params remain unchanged:

```text
sourceId
questionCount
ordering
answerKey
generationSeed
columns
rowsPerPage
```

Backward compatibility:

```text
URLs without selectionMode behave exactly as current sourceId URLs.
URLs with unknown selectionMode fall back to sourceUnit.
URLs with kp/pg but selectionMode absent fall back to sourceUnit unless a later parser explicitly opts into batchAKnowledgePoint mode.
```

## Query Parsing Guard

Future parseQueryState must use browser-safe selector helpers from S43D2.

Guard algorithm:

```text
1. Parse sourceId and existing numeric/layout params as today.
2. Parse selectionMode.
3. Parse kp and pg as arrays of IDs.
4. If selectionMode = sourceUnit, ignore kp and pg.
5. If selectionMode is a KP mode, validate every kp/pg ID against visible selector candidates.
6. Drop IDs that are not visible or not QA-verified.
7. Add selectorWarnings for dropped IDs without exposing hidden/not_selectable row details.
8. If no eligible IDs remain, fall back to sourceUnit or safe empty KP mode.
```

## Query Writing Rules

Future writeQueryStateFromState should:

```text
1. Always write existing sourceId/questionCount/ordering/answerKey/generationSeed/columns/rowsPerPage.
2. Write selectionMode only when not sourceUnit, or if explicit mode persistence is desired.
3. Write kp only from selectedKnowledgePointIds after visibility validation.
4. Write pg only from selectedPatternGroupIds after visibility validation.
5. Never write dropped, hidden, internal-only, or D-class IDs.
6. Remove kp/pg params when sourceUnit mode is active.
```

## Selector Warning Design

Future selectorWarnings should be safe to display:

```text
{ code: "selector_id_dropped", count: 2 }
{ code: "selector_mode_fallback", from: "singleKnowledgePoint", to: "sourceUnit" }
{ code: "no_visible_knowledge_points", sourceId: "g3a_u02_3a02" }
```

Do not include hidden/internal/D row IDs in warning messages.

## Current G3A-U02 Expected State

Given S43C2 and S43D2:

```text
visibleCount = 0
hiddenPendingCount = 2
notSelectableCount = 2
```

Expected default state:

```text
worksheetMode = batchASource
selectionMode = sourceUnit
selectedKnowledgePointIds = []
selectedPatternGroupIds = []
selectorWarnings = []
```

If URL contains:

```text
?selectionMode=singleKnowledgePoint&kp=kp_g3a_u02_add_multi_carry
```

Expected guarded result:

```text
selectionMode = sourceUnit or safe empty KP mode
selectedKnowledgePointIds = []
selectorWarnings includes selector_id_dropped or no_visible_knowledge_points
```

Reason: current A rows are hidden/internal, not selectable.

If URL contains a D row ID:

```text
?selectionMode=singleKnowledgePoint&kp=kp_g3a_u02_word_problem_estimation_add_sub
```

Expected guarded result:

```text
selectedKnowledgePointIds = []
D ID is dropped
D ID is not written back to URL
D row details are not exposed as selectable data
```

## State Transition Design

### sourceUnit -> singleKnowledgePoint

Allowed only when:

```text
visibleCount > 0
selected visible KP exists
resolver can resolve at least one PatternSpec ID
```

### singleKnowledgePoint -> sourceUnit

Always allowed.

Effects:

```text
clear selectedKnowledgePointIds
clear selectedPatternGroupIds
clear selectorWarnings except informational messages
keep sourceId and worksheet settings
```

### singleKnowledgePoint -> mixed modes

Deferred until resolver QA exists.

## Resolver Hand-off Contract

State should hand off only selector-safe values:

```text
selectionMode
sourceId
selectedKnowledgePointIds
selectedPatternGroupIds
questionCount
ordering
generationSeed
includeAnswerKey
```

Resolver must still revalidate visibility; state validation is not sufficient as the only guard.

## Implementation Boundary

Future implementation should happen in this order:

```text
1. Add constants for selection modes.
2. Add default fields to createBatchAStateFromConfig.
3. Add selector-safe normalization helpers.
4. Extend parseQueryState with guarded kp/pg parsing.
5. Extend writeQueryStateFromState with guarded kp/pg writing.
6. Add tests for sourceUnit backward compatibility.
7. Add tests for hidden/D query leakage rejection.
```

No HTML selector should consume these state fields until query/state tests exist.

## Out of Scope

```text
- editing config-state.js
- editing query-state.js
- creating selector constants
- creating browser registry modules
- implementing resolver
- implementing UI controls
- promoting any KP to selectable
- supporting mixed KP generation
```

## S43D3 Gate

```text
S43D3_GATE = PASS_SELECTOR_STATE_QUERY_STATE_DESIGN

PASS:
- current sourceId-only state/query shape identified
- future worksheet mode extension designed
- selectionMode enum designed
- BatchA selector state fields designed
- query params kp/pg designed
- query parsing guard designed
- query writing guard designed
- G3A-U02 zero-visible expected behavior defined
- D-row leakage rejection defined
- resolver hand-off contract drafted
- no runtime/UI code changed

GAPS:
- config-state.js not implemented
- query-state.js not implemented
- selector state tests not implemented
- browser registry modules not generated yet
- resolver not implemented yet
- HTML selector not implemented yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_BROWSER_REGISTRY_DELIVERY_DESIGNED
GOAL_DISTANCE_AFTER  = D2_SELECTOR_STATE_QUERY_STATE_DESIGNED
DISTANCE_REDUCED     = S43 now has state and query-state rules that preserve sourceId compatibility and prevent hidden/not_selectable KP leakage

BrowserRegistryDelivery           100% -> 100%
SelectorStateQueryDesign            0% -> 100%
SelectorStateQueryImplementation    0% ->   0%
KPResolverPath                      0% ->   0%
KPHTMLSelectablePath                0% ->   0%
S43Overall                         85% ->  87%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "selector state/query implementation 尚未 implemented",
  "selector state/query tests 尚未 implemented",
  "browser registry modules 尚未 generated",
  "registry-to-browser transform tool 尚未 implemented",
  "KnowledgePoint resolver 尚未 implemented",
  "HTML KnowledgePoint selector 尚未實作",
  "no KP is selectable yet",
  "fine PatternSpec JSON 尚未 materialized",
  "generator/validator variants 尚未 implemented"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43D4_VisiblePatternGroupResolverDesign
```

S43D4 should design the resolver that converts selector-safe KP / PatternGroup state into PatternSpec allocation without exposing hidden or not_selectable rows.
