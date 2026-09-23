# S43D1 HTML KnowledgePoint Selector Design

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43D1_HTMLKnowledgePointSelectorDesign
TASK_STATUS = UI_DESIGN
WRITE_TYPE = docs_only
```

S43D1 designs the future HTML KnowledgePoint selector for Batch A. It does not implement UI, registry loaders, resolver logic, generator changes, validator changes, renderer changes, query-state changes, or tests.

## Inputs

```text
S43B4 = printable status and visibility policy lock
S43B5 = schema validation contract draft
S43C2 = G3A-U02 A/D registry seed materialization
S43C5 = G3A-U02 prototype QA plan
Current HTML path = sourceId-only Batch A worksheet controls
```

## Current UI Readback

The current HTML has a Batch A source selector only:

```text
select id = batch-a-source-select
help id = batch-a-source-help
```

Current state also has only one worksheet mode:

```text
WORKSHEET_MODES.BATCH_A_SOURCE = batchASource
```

Current query-state stores sourceId, questionCount, ordering, answerKey, generationSeed, columns, and rowsPerPage. It does not store KnowledgePoint IDs or PatternGroup IDs.

## Design Goal

Add a future KnowledgePoint selector path without breaking the existing sourceId worksheet path.

```text
Existing path:
sourceId -> source PatternSpecs -> generator -> validator -> worksheet

Future path:
sourceId or all Batch A -> visible KnowledgePoint selector -> PatternGroup resolver -> PatternSpec allocation -> generator -> validator -> worksheet
```

## Non-Negotiable Visibility Gate

A KnowledgePoint can appear in the HTML selector only when all aligned rows satisfy the S43B4 gate:

```text
KnowledgePointNode.htmlSelectableStatus = selectable
PatternGroup.visibilityStatus = visible
Mapping.htmlExposurePolicy = eligible_after_qa
Mapping.qaStatus = qa_verified
Mapping.patternSpecId != null
holdReason = null
supportClass != D
```

Any hidden/internal or not_selectable row must be hidden from the selector and rejected by query state / resolver input.

## Initial G3A-U02 Selector State

After S43C2, the current materialized G3A-U02 registry slice has:

```text
A rows = hidden/internal
D rows = not_selectable
C rows = not materialized
selectable_ready rows = 0
```

Therefore S43D1 design must expect the first implemented selector to show zero selectable G3A-U02 KnowledgePoints until a later explicit promotion task updates visibility after QA.

## Proposed UI Sections

### Section 1 — Mode

```text
id = batch-a-selection-mode
options:
- sourceUnit
- singleKnowledgePoint
- mixedKnowledgePointsSameUnit
- mixedKnowledgePointsCrossUnit
```

Initial implementation rule:

```text
sourceUnit remains default.
singleKnowledgePoint may become enabled only when at least one visible KP exists.
mixedKnowledgePointsSameUnit and mixedKnowledgePointsCrossUnit remain disabled until resolver QA exists.
```

### Section 2 — Source Unit Filter

Existing source selector remains:

```text
id = batch-a-source-select
```

Future behavior:

```text
sourceUnit mode = current behavior
singleKnowledgePoint mode = filters visible KPs by selected sourceId
same-unit mixed mode = filters selectable KPs by selected sourceId
cross-unit mixed mode = source selector becomes optional filter, not required
```

### Section 3 — KnowledgePoint List

Future container:

```text
id = batch-a-knowledge-point-panel
```

Each visible option should display:

```text
displayName
unitCode
supportClass
questionKind summary
available PatternGroup count
QA status label
```

Rows not passing the visibility gate should not render as selectable inputs.

### Section 4 — Blocked / Hidden Summary

Future read-only summary:

```text
id = batch-a-knowledge-point-availability-summary
```

Purpose:

```text
Show counts only, not selectable rows:
- visibleCount
- hiddenPendingCount
- notSelectableCount
```

This prevents leakage while explaining why no KP is selectable yet.

## Proposed State Extension

Future state shape:

```text
batchA.selectionMode = sourceUnit | singleKnowledgePoint | mixedKnowledgePointsSameUnit | mixedKnowledgePointsCrossUnit
batchA.selectedKnowledgePointIds = []
batchA.selectedPatternGroupIds = []
batchA.selectorAvailability = { visibleCount, hiddenPendingCount, notSelectableCount }
```

Default state:

```text
selectionMode = sourceUnit
selectedKnowledgePointIds = []
selectedPatternGroupIds = []
```

## Proposed Query-State Extension

Future query params:

```text
selectionMode=sourceUnit|singleKnowledgePoint|mixedKnowledgePointsSameUnit|mixedKnowledgePointsCrossUnit
kp=comma-separated KnowledgePoint IDs
pg=comma-separated PatternGroup IDs
```

Query parser guard:

```text
If any kp/pg ID fails the visibility gate, drop it and report a validation warning.
If all selected IDs are dropped, fall back to sourceUnit mode or show a safe validation error.
D rows must never survive query parsing.
```

## Registry Availability Design

The current registry JSON files live outside the site path:

```text
data/curriculum/registry/batch_a_knowledge_points.json
data/curriculum/registry/batch_a_pattern_groups.json
data/curriculum/registry/batch_a_knowledge_point_pattern_map.json
```

Future browser implementation must choose one safe delivery path:

```text
Option A: generate browser-safe JS registry modules under site/modules/curriculum/registry/
Option B: copy validated registry JSON into site/data/curriculum/registry/ during build/deploy
```

S43D1 recommends Option A for early implementation because the current site already imports browser-safe JS modules.

## Resolver Design

Future selector resolver should produce a worksheet plan with:

```text
selectionMode
sourceId or sourceIds
knowledgePointIds
patternGroupIds
patternSpecIds
allocation
visibilityValidation
```

Resolver rules:

```text
1. Load visible KnowledgePoint candidates only.
2. Resolve selected KP IDs to visible PatternGroups.
3. Resolve visible PatternGroups to QA-verified mappings.
4. Extract non-null PatternSpec IDs.
5. Allocate question counts across PatternGroups / PatternSpecs.
6. Reject if no eligible PatternSpec remains.
```

## Allocation Design

```text
singleKnowledgePoint:
- all questions go to one selected PatternGroup or its PatternSpecs

mixedKnowledgePointsSameUnit:
- distribute across selected KPs from same sourceId

mixedKnowledgePointsCrossUnit:
- distribute across selected KPs from multiple sourceIds
- must preserve per-source provenance in worksheetDocument
```

Initial implementation should start with singleKnowledgePoint only after at least one KP becomes visible.

## HTML Leakage Guard

Future implementation must prevent leakage in all entry points:

```text
UI render
query parser
state setter
resolver
worksheet builder
answer key builder
print preview metadata
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

## UX Copy Requirements

When no KnowledgePoints are selectable:

```text
目前此單元尚無已通過 QA 的可選知識點。請先使用單元出題，或等待 KnowledgePoint QA 完成。
```

For hidden/internal rows, UI may show aggregate count only:

```text
已建立但尚未開放：N 個
不可在 S43 使用：N 個
```

It must not expose hidden/internal row IDs as selectable values.

## Implementation Order After S43D1

```text
S43D2 = Browser registry delivery design / module bridge
S43D3 = Selector state and query-state design
S43D4 = Resolver design for visible PatternGroups
S43D5 = HTML selector implementation plan
```

No selector implementation should start before the browser registry delivery path is decided.

## Out of Scope

```text
- implementing HTML selector
- changing index.html
- changing main.js
- changing config-state.js
- changing query-state.js
- creating browser registry modules
- promoting any KP to selectable
- enabling mixed KP worksheet generation
- implementing generator/validator variants
```

## S43D1 Gate

```text
S43D1_GATE = PASS_HTML_KNOWLEDGEPOINT_SELECTOR_DESIGN

PASS:
- current sourceId-only UI state identified
- selector modes designed
- visibility gate preserved
- initial G3A-U02 selectable count recognized as 0
- query-state extension designed with guard
- registry browser-delivery issue identified
- resolver design drafted
- leakage guard drafted
- implementation order after D1 defined
- no runtime/UI code changed

GAPS:
- browser registry delivery path not implemented
- selector state/query implementation not implemented
- resolver not implemented
- HTML selector not implemented
- no KP is selectable yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_G3AU02_PROTOTYPE_QA_PLAN_LOCKED
GOAL_DISTANCE_AFTER  = D2_HTML_KNOWLEDGEPOINT_SELECTOR_DESIGNED
DISTANCE_REDUCED     = S43 now has a gated HTML selector design that preserves sourceId flow and prevents hidden/not_selectable registry leakage

G3A_U02_PrototypeQAPlan           100% -> 100%
HTMLKnowledgePointSelectorDesign    0% -> 100%
BrowserRegistryDelivery             0% ->   0%
KPResolverPath                       0% ->   0%
KPHTMLSelectablePath                 0% ->   0%
S43Overall                          79% ->  82%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "browser registry delivery path 尚未 implemented",
  "selector state/query implementation 尚未 implemented",
  "KnowledgePoint resolver 尚未 implemented",
  "HTML KnowledgePoint selector 尚未實作",
  "no KP is selectable yet",
  "tests 尚未 implemented",
  "fine PatternSpec JSON 尚未 materialized",
  "generator/validator variants 尚未 implemented"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43D2_BrowserRegistryDeliveryDesign
```

S43D2 should decide how registry data becomes safely available to the browser site before any selector UI implementation.
