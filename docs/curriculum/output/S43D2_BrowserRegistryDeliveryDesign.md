# S43D2 Browser Registry Delivery Design

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43D2_BrowserRegistryDeliveryDesign
TASK_STATUS = DELIVERY_DESIGN
WRITE_TYPE = docs_only
```

S43D2 decides how Batch A KnowledgePoint registry data should become safely available to the browser site.

This task does not create browser registry modules, does not copy JSON into the site folder, does not update HTML/state/query/resolver code, and does not promote any KnowledgePoint to selectable.

## Inputs

```text
S43D1 = HTML KnowledgePoint selector design
S43B4 = visibility policy lock
S43B5 = schema validation contract
S43C2 = G3A-U02 A/D registry seed materialization
Current browser modules = site/modules/curriculum/batch-a/source-units.js and source-pattern-index.js
```

## Current Site Delivery Readback

The browser site currently imports static JavaScript modules under `site/modules`.

Existing source-unit delivery:

```text
site/modules/curriculum/batch-a/source-units.js
```

Existing browser PatternSpec delivery:

```text
site/modules/curriculum/batch-a/source-pattern-index.js
```

The current source-unit module exports 13 Batch A source units and lookup helpers. The current PatternSpec index exports browser-safe PatternSpec definitions and maps sourceId to PatternSpec IDs.

## Current Registry Source Readback

The authoritative S43 registry source files currently live outside the site path:

```text
data/curriculum/registry/batch_a_knowledge_points.json
data/curriculum/registry/batch_a_pattern_groups.json
data/curriculum/registry/batch_a_knowledge_point_pattern_map.json
```

Current registry scope:

```text
sourceScope = ["g3a_u02_3a02"]
registryStatus = partial_materialization
```

Current visibility state:

```text
A rows = hidden/internal
D rows = not_selectable
selectable_ready rows = 0
```

## Delivery Decision

```text
DECISION = Option A: browser-safe generated JavaScript registry modules
```

Future browser delivery should create validated JS modules under:

```text
site/modules/curriculum/registry/
```

Recommended future files:

```text
site/modules/curriculum/registry/batch-a-knowledge-points.js
site/modules/curriculum/registry/batch-a-pattern-groups.js
site/modules/curriculum/registry/batch-a-knowledge-point-pattern-map.js
site/modules/curriculum/registry/batch-a-selector-candidates.js
```

Do not load raw `data/curriculum/registry/*.json` directly from the browser in the first implementation.

## Rejected Option B

```text
Option B = copy validated registry JSON into site/data/curriculum/registry/
```

Rejected for first implementation because:

```text
- current site already uses JS module imports
- JS modules can freeze exported data
- JS modules can expose only selector-safe projections
- raw JSON delivery makes accidental hidden/not_selectable leakage easier
- no build/deploy copy pipeline is currently locked for registry JSON
```

Option B can be reconsidered later only after registry validation and deploy-copy policy exist.

## Source of Truth Policy

```text
data/curriculum/registry/*.json = authoritative registry source
site/modules/curriculum/registry/*.js = generated browser-safe projection
```

Rules:

```text
1. Browser modules must not become the source of truth.
2. Browser modules must be regenerated from validated registry JSON.
3. Manual edits to generated browser modules should be forbidden in future workflow.
4. Generated modules must preserve schemaVersion and sourceScope metadata.
```

## Safe Projection Policy

The browser-safe projection must separate internal data from selector candidates.

Allowed exports:

```text
BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA
BATCH_A_SELECTOR_AVAILABILITY
listVisibleBatchAKnowledgePoints()
listBatchAKnowledgePointAvailabilityBySource(sourceId)
getVisibleBatchAKnowledgePoint(knowledgePointId)
getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId)
```

Forbidden exports for selector code:

```text
raw hidden rows as selectable options
raw D-class not_selectable rows as selectable options
unverified mappings
rows with holdReason != null
rows with patternSpecId = null as selectable mappings
```

## Visibility Projection Rule

A KnowledgePoint can appear in `listVisibleBatchAKnowledgePoints()` only if all conditions pass:

```text
KnowledgePointNode.htmlSelectableStatus = selectable
PatternGroup.visibilityStatus = visible
Mapping.htmlExposurePolicy = eligible_after_qa
Mapping.qaStatus = qa_verified
Mapping.patternSpecId != null
holdReason = null on all linked rows
supportClass != D
```

For the current G3A-U02 registry slice, this produces:

```text
visibleCount = 0
hiddenPendingCount = 2
notSelectableCount = 2
```

## Availability Summary Rule

The browser may display aggregate counts:

```text
visibleCount
hiddenPendingCount
notSelectableCount
bySourceId
```

The browser must not expose hidden/internal row IDs as selectable values.

D rows may be counted only as notSelectableCount. Their IDs must not be sent to the selector as available option values.

## Generated Module Shape

Future generated module should use frozen data and copy-on-read helpers:

```text
const REGISTRY_METADATA = Object.freeze({...})
const SELECTOR_AVAILABILITY = Object.freeze({...})
const VISIBLE_KNOWLEDGE_POINTS = Object.freeze([...])

export function listVisibleBatchAKnowledgePoints() {
  return VISIBLE_KNOWLEDGE_POINTS.map(clone)
}
```

Reason:

```text
- current source-units module already uses Object.freeze and returns shallow copies
- selector callers should not mutate registry state
```

## Delivery Build Step Design

Future implementation should add a deterministic transform tool:

```text
tools/curriculum/build-browser-registry-modules.js
```

Inputs:

```text
data/curriculum/registry/batch_a_knowledge_points.json
data/curriculum/registry/batch_a_pattern_groups.json
data/curriculum/registry/batch_a_knowledge_point_pattern_map.json
```

Outputs:

```text
site/modules/curriculum/registry/batch-a-knowledge-points.js
site/modules/curriculum/registry/batch-a-pattern-groups.js
site/modules/curriculum/registry/batch-a-knowledge-point-pattern-map.js
site/modules/curriculum/registry/batch-a-selector-candidates.js
```

Precondition:

```text
S43B5 validation contract passes before module generation.
```

## Delivery QA Design

Future delivery QA must check:

```text
- generated modules import successfully in Node ESM
- metadata sourceScope preserved
- visible selector list excludes A hidden/internal rows
- visible selector list excludes D not_selectable rows
- availability summary reports current G3A-U02 counts correctly
- no row with holdReason != null appears as visible
- no mapping with patternSpecId = null appears as visible
```

Required current expected result:

```text
G3A-U02 visible selector candidates = 0
```

## Integration Boundary

Future selector code should depend on browser-safe selector-candidate helpers, not raw JSON.

```text
HTML selector -> selector-candidates module -> visible candidates only -> resolver
```

The existing sourceId path must remain unchanged:

```text
sourceId -> BATCH_A_SOURCE_PATTERN_INDEX -> current generator/validator path
```

## Out of Scope

```text
- creating generated browser registry modules
- creating transform tool
- creating delivery tests
- changing site/index.html
- changing config-state.js
- changing query-state.js
- implementing selector resolver
- promoting any KP to selectable
```

## S43D2 Gate

```text
S43D2_GATE = PASS_BROWSER_REGISTRY_DELIVERY_DESIGN

PASS:
- current site JS-module delivery pattern identified
- authoritative registry source path identified
- Option A selected for browser-safe JS modules
- Option B rejected for first implementation
- source-of-truth policy locked
- safe projection policy locked
- current G3A-U02 expected visibleCount = 0 locked
- generated module shape drafted
- delivery transform tool design drafted
- delivery QA design drafted
- existing sourceId path preserved
- no runtime/UI code changed

GAPS:
- browser registry modules not generated yet
- transform tool not implemented yet
- delivery QA tests not implemented yet
- selector state/query implementation not implemented yet
- resolver not implemented yet
- HTML selector not implemented yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_HTML_KNOWLEDGEPOINT_SELECTOR_DESIGNED
GOAL_DISTANCE_AFTER  = D2_BROWSER_REGISTRY_DELIVERY_DESIGNED
DISTANCE_REDUCED     = S43 now has a safe browser registry delivery decision that prevents raw hidden/not_selectable registry rows from leaking into selector code

HTMLKnowledgePointSelectorDesign  100% -> 100%
BrowserRegistryDelivery             0% -> 100%
BrowserRegistryImplementation       0% ->   0%
KPResolverPath                       0% ->   0%
KPHTMLSelectablePath                 0% ->   0%
S43Overall                          82% ->  85%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "browser registry modules 尚未 generated",
  "registry-to-browser transform tool 尚未 implemented",
  "delivery QA tests 尚未 implemented",
  "selector state/query implementation 尚未 implemented",
  "KnowledgePoint resolver 尚未 implemented",
  "HTML KnowledgePoint selector 尚未實作",
  "no KP is selectable yet",
  "fine PatternSpec JSON 尚未 materialized",
  "generator/validator variants 尚未 implemented"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43D3_SelectorStateAndQueryStateDesign
```

S43D3 should design state and query-state changes using the browser-safe registry delivery contract from S43D2.
