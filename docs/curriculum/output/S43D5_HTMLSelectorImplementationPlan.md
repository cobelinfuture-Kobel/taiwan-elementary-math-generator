# S43D5 HTML Selector Implementation Plan

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43D5_HTMLSelectorImplementationPlan
TASK_STATUS = IMPLEMENTATION_PLAN
WRITE_TYPE = docs_only
```

S43D5 plans the future HTML KnowledgePoint selector implementation sequence.

This task does not edit `site/index.html`, `main.js`, state/query modules, resolver modules, generator/validator code, registry JSON, browser registry modules, CSS, or tests.

## Inputs

```text
S43D1 = HTML KnowledgePoint selector design
S43D2 = browser registry delivery design
S43D3 = selector state and query-state design
S43D4 = visible PatternGroup resolver design
Current HTML = sourceId-only Batch A controls
Current main.js = sourceId-only event binding and worksheet generation
```

## Current HTML Readback

The current HTML Batch A control group contains only the source selector and help text:

```text
select id = batch-a-source-select
help id = batch-a-source-help
```

Current settings controls include question count, ordering, generation seed, answer key, columns, rows per page, regenerate, print, status, validation, preview metadata, and preview frame.

No KnowledgePoint selector DOM exists yet.

## Current Browser Controller Readback

Current `main.js` imports source-unit data and state setters for the sourceId-only path.

Existing DOM bindings include:

```text
batch-a-source-select
batch-a-source-help
batch-a-question-count-input
batch-a-ordering-select
batch-a-answer-key-input
generation-seed-input
columns-input
rows-per-page-input
regenerate-button
print-button
status-panel
validation-panel
preview-meta
preview-frame
```

Current regenerate flow:

```text
readControlsIntoState
-> writeQueryStateFromState
-> buildWorksheetDocumentFromState
-> renderPreviewFrame
```

S43D5 must not change this flow during planning.

## Implementation Goal

Future implementation should add a KnowledgePoint selector path while preserving the existing sourceId path.

```text
sourceUnit mode = existing behavior
singleKnowledgePoint mode = future selector-driven behavior after visible KP candidates exist
mixed modes = deferred until resolver QA exists
```

Initial implementation must be safe when current G3A-U02 has zero visible candidates.

## Required DOM Additions

Future `site/index.html` implementation should add a new control group after the source selector group and before question settings.

Recommended IDs:

```text
batch-a-selection-mode-select
batch-a-knowledge-point-panel
batch-a-knowledge-point-empty-state
batch-a-knowledge-point-availability-summary
batch-a-knowledge-point-warning-list
```

Recommended labels:

```text
出題模式
知識點選擇
目前此單元尚無已通過 QA 的可選知識點。請先使用單元出題，或等待 KnowledgePoint QA 完成。
已建立但尚未開放：N 個
不可在 S43 使用：N 個
```

## Initial UI State

Current expected selector availability for G3A-U02:

```text
visibleCount = 0
hiddenPendingCount = 2
notSelectableCount = 2
```

Therefore first implementation must render:

```text
selectionMode = sourceUnit
sourceUnit option enabled
singleKnowledgePoint option disabled
mixedKnowledgePointsSameUnit option disabled
mixedKnowledgePointsCrossUnit option disabled
knowledge point panel empty
availability summary visible
no selectable KP checkboxes/radios
```

## Mode Control Behavior

Future `batch-a-selection-mode-select` options:

```text
sourceUnit = 單元出題
singleKnowledgePoint = 單一知識點加強
mixedKnowledgePointsSameUnit = 同單元知識點混合
mixedKnowledgePointsCrossUnit = 跨單元知識點混合
```

Initial enablement:

```text
sourceUnit = enabled
singleKnowledgePoint = enabled only if visibleCount > 0
mixedKnowledgePointsSameUnit = disabled until resolver QA exists
mixedKnowledgePointsCrossUnit = disabled until cross-unit resolver QA exists
```

If a disabled mode is attempted through query-state, the UI must fall back safely and show a selector warning.

## KnowledgePoint Panel Behavior

Future panel behavior:

```text
Render visible KP candidates only.
Never render hidden/internal rows as input values.
Never render D-class rows as input values.
Never render PatternGroups with non-visible status as input values.
```

When visible candidates exist, each option may show:

```text
displayName
unitCode
sourceId
supportClass
PatternGroup count
QA status label
```

When no visible candidates exist, show empty-state copy and availability counts only.

## Main Controller Implementation Plan

Future `main.js` changes should be staged:

```text
1. Import browser-safe selector availability helpers from generated registry modules.
2. Add DOM references for selector mode, KP panel, empty state, summary, and warning list.
3. Add renderSelectorAvailability(state) for aggregate counts.
4. Add renderKnowledgePointOptions(state) that renders visible candidates only.
5. Extend syncControlsFromState to update selection mode and KP panel.
6. Extend readControlsIntoState to read selector-safe selected KP IDs only.
7. Extend bindControls to listen to selector controls.
8. Keep regenerate() flow unchanged until resolver integration exists.
```

No selector UI should call raw registry JSON.

## State / Query Integration Plan

HTML selector implementation must follow S43D3 state/query design.

Required state integration:

```text
state.batchA.selectionMode
state.batchA.selectedKnowledgePointIds
state.batchA.selectedPatternGroupIds
state.batchA.selectorAvailability
state.batchA.selectorWarnings
```

Required query behavior:

```text
sourceUnit mode removes kp/pg params
KP modes write kp/pg only after visibility validation
hidden/internal/D IDs from URL are dropped
D IDs are never written back
```

No HTML selector should consume these fields before state/query tests exist.

## Resolver Integration Plan

HTML selector implementation must not directly produce PatternSpec IDs.

Future flow:

```text
HTML selector
-> selector-safe state
-> visible PatternGroup resolver
-> resolved PatternSpec allocation
-> future worksheet generator path
```

Until resolver implementation exists:

```text
sourceUnit mode remains the only generation-capable mode
singleKnowledgePoint mode may render disabled or empty only
mixed modes remain disabled
```

## Worksheet Generation Plan

Future worksheet builder integration must be additive:

```text
batchASource mode -> current buildBatchABrowserPlan path
batchAKnowledgePoint mode -> visible PatternGroup resolver -> future generator path
```

Do not alter current sourceId generation semantics to support selector mode.

## Leakage Guard Requirements

Implementation must guard all UI entry points:

```text
rendering options
reading selected controls
query-state hydration
state setter
resolver handoff
regenerate flow
preview metadata
answer key metadata
```

Reject or hide if:

```text
supportClass = D
htmlSelectableStatus != selectable
visibilityStatus != visible
htmlExposurePolicy != eligible_after_qa
qaStatus != qa_verified
holdReason != null
patternSpecId = null
```

## Required Future Tests

Suggested test coverage before selector generation is enabled:

```text
sourceUnit default still works
HTML can render zero-visible selector safely
A hidden rows do not render as selectable
D rows do not render as selectable
query kp hidden row is dropped
query kp D row is dropped
selectionMode fallback works
singleKnowledgePoint remains disabled when visibleCount = 0
mixed modes remain disabled
regenerate still uses sourceUnit path by default
```

## Implementation Sequence

Safe future implementation order:

```text
S43D6 = Browser registry module generation implementation
S43D7 = Selector state/query implementation and tests
S43D8 = Visible PatternGroup resolver implementation and tests
S43D9 = HTML zero-visible selector UI implementation
S43D10 = HTML selector sourceUnit regression QA
```

Only after later QA promotion creates visible KP candidates should implementation proceed to:

```text
singleKnowledgePoint generation path
same-unit mixed generation path
cross-unit mixed generation path
```

## Out of Scope

```text
- editing HTML
- editing main.js
- editing config-state.js
- editing query-state.js
- generating browser registry modules
- implementing resolver
- enabling KP worksheet generation
- exposing hidden/internal rows
- exposing D rows
- promoting any KP to selectable
- implementing fine PatternSpec JSON
- implementing generator/validator variants
```

## S43D5 Gate

```text
S43D5_GATE = PASS_HTML_SELECTOR_IMPLEMENTATION_PLAN

PASS:
- current sourceId-only HTML read back
- current main.js DOM/control flow read back
- required future DOM IDs defined
- initial zero-visible UI behavior defined
- mode control behavior defined
- KP panel rendering rules defined
- main controller implementation sequence defined
- state/query integration plan aligned with S43D3
- resolver integration plan aligned with S43D4
- worksheet generation boundary preserved
- leakage guard requirements defined
- future tests listed
- no runtime/UI code changed

GAPS:
- browser registry modules not generated yet
- selector state/query implementation not implemented yet
- resolver not implemented yet
- HTML selector not implemented yet
- no KP is selectable yet
- selector tests not implemented yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_VISIBLE_PATTERN_GROUP_RESOLVER_DESIGNED
GOAL_DISTANCE_AFTER  = D2_HTML_SELECTOR_IMPLEMENTATION_PLAN_LOCKED
DISTANCE_REDUCED     = S43 now has an implementation sequence for adding the HTML KnowledgePoint selector without breaking sourceId generation or leaking hidden/not_selectable rows

VisiblePatternGroupResolverDesign 100% -> 100%
HTMLSelectorImplementationPlan      0% -> 100%
KPHTMLSelectablePath                0% ->   0%
S43Overall                         89% ->  91%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "browser registry modules 尚未 generated",
  "registry-to-browser transform tool 尚未 implemented",
  "selector state/query implementation 尚未 implemented",
  "selector state/query tests 尚未 implemented",
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
NEXT_SHORTEST_STEP = S43D6_BrowserRegistryModuleGenerationImplementation
```

S43D6 should implement the browser-safe registry module generation path before selector state/query or HTML UI implementation.
