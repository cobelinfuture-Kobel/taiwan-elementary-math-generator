# S43D6 Browser Registry Module Generation Implementation

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43D6_BrowserRegistryModuleGenerationImplementation
TASK_STATUS = IMPLEMENTED_READBACK_PENDING_CI
WRITE_TYPE = runtime_tool_plus_generated_modules_plus_tests_plus_docs
```

S43D6 implements the browser-safe registry module generation path required before selector state/query or HTML selector implementation.

## Files Created

```text
tools/curriculum/build-browser-registry-modules.js
site/modules/curriculum/registry/batch-a-knowledge-points.js
site/modules/curriculum/registry/batch-a-pattern-groups.js
site/modules/curriculum/registry/batch-a-knowledge-point-pattern-map.js
site/modules/curriculum/registry/batch-a-selector-candidates.js
tests/curriculum/batch-a/browser-registry-modules.test.js
```

## Scope Boundary

```text
IN_SCOPE:
- registry JSON loader
- browser-safe JS module generator
- generated registry projection modules
- selector-candidate safe projection module
- delivery tests for current G3A-U02 zero-visible state

OUT_OF_SCOPE:
- HTML selector UI
- selector state/query implementation
- resolver implementation
- generator/validator variants
- fine PatternSpec JSON
- promotion of any KP to selectable
```

## Implemented Delivery Model

```text
data/curriculum/registry/*.json = authoritative source
site/modules/curriculum/registry/*.js = browser-safe generated projection
```

The generated selector-candidates module exposes only selector-safe helpers:

```text
BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA
BATCH_A_SELECTOR_AVAILABILITY
listVisibleBatchAKnowledgePoints()
listBatchAKnowledgePointAvailabilityBySource(sourceId)
getVisibleBatchAKnowledgePoint(knowledgePointId)
getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId)
```

## Current G3A-U02 Projection

```text
visibleCount = 0
hiddenPendingCount = 2
notSelectableCount = 2
```

Hidden A rows are not visible selector candidates:

```text
kp_g3a_u02_add_multi_carry
kp_g3a_u02_sub_multi_borrow
```

D rows are not visible selector candidates:

```text
kp_g3a_u02_estimate_nearest_thousand
kp_g3a_u02_word_problem_estimation_add_sub
```

## Build Command

Direct command:

```text
node tools/curriculum/build-browser-registry-modules.js
```

Package script update was not applied in this step because the GitHub update_file attempt for `package.json` was blocked by platform safety checks. The direct node command remains available.

## Tests Added

```text
tests/curriculum/batch-a/browser-registry-modules.test.js
```

Test coverage:

```text
- registry module row counts = 4 / 4 / 4
- selector visible count = 0
- availability summary = 0 / 2 / 2
- hidden A rows are not visible candidates
- D rows are not visible candidates
- source registry projection computes same availability as generated module
```

## S43D6 Gate

```text
S43D6_GATE = PASS_BROWSER_REGISTRY_MODULE_GENERATION_IMPLEMENTED_READBACK_PENDING_CI

PASS:
- transform tool created
- four browser-safe registry modules generated
- selector-candidates module exposes visible-only helper API
- current G3A-U02 visibleCount = 0 preserved
- hidden A rows not exposed as visible candidates
- D rows not exposed as visible candidates
- delivery tests added
- HTML selector not implemented
- state/query not implemented
- resolver not implemented
- no KP promoted to selectable

GAPS:
- CI / npm test status not observed in this environment
- package.json npm script not added due platform-blocked package.json update
- selector state/query implementation not implemented yet
- resolver not implemented yet
- HTML selector not implemented yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_HTML_SELECTOR_IMPLEMENTATION_PLAN_LOCKED
GOAL_DISTANCE_AFTER  = D1_BROWSER_REGISTRY_MODULES_GENERATED
DISTANCE_REDUCED     = S43 now has concrete browser-safe registry modules and tests, enabling future selector state/query implementation without raw registry JSON leakage

HTMLSelectorImplementationPlan     100% -> 100%
BrowserRegistryImplementation        0% -> 100%
SelectorStateQueryImplementation     0% ->   0%
KPResolverImplementation             0% ->   0%
KPHTMLSelectablePath                 0% ->   0%
S43Overall                          91% ->  93%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "CI / npm test 尚未 observed",
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
NEXT_SHORTEST_STEP = S43D7_SelectorStateQueryImplementationAndTests
```

S43D7 should implement selector state/query fields and leakage tests using the browser-safe registry modules created in S43D6.
