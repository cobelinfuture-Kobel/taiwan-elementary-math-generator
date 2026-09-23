# S59F — G4B-U01 Promotion Lifecycle and Visible Selector Projection

```text
CURRENT_MAJOR_TASK = S59_G4B_U01_HorizontalWorksheetPublicPrintPath
CURRENT_SUBTASK = S59F_G4B_U01_PromotionLifecycleAndVisibleSelectorProjection
TASK_STATUS = VISIBLE_SELECTOR_PROJECTED_RESOLVER_NOT_INTEGRATED
```

## Scope

S59F adds an overlay-only lifecycle promotion and visible selector projection for the nine approved horizontal G4B-U01 KnowledgePoints. The hidden S59C authority remains unchanged.

```text
VISIBLE_KNOWLEDGE_POINTS = 9
VISIBLE_PATTERN_GROUPS = 9
PROMOTED_PATTERN_SPECS = 12
VISIBLE_APPLICATION_GROUPS = 0
REPRESENTATION_TOGGLE = false
```

## Promotion lifecycle

```text
selectorStatus = visible
runtimeStatus = blocking_validated_hidden_not_canonical
validatorStatus = blocking_validator_accepted
worksheetStatus = not_eligible
productionUse = forbidden
```

S59F exposes selector metadata only. Resolver behavior, browser-state integration, canonical routing, worksheet eligibility and production use remain unchanged until later gates.

## Visible selector behavior

Each approved KnowledgePoint exposes exactly one visible PatternGroup:

```text
representationTag = numeric_expression
representationTags = [numeric_expression, horizontal_expression]
allocationPolicy = balanced_by_pattern_spec
```

No application mode, vertical mode, hidden flag or representation toggle is added.

## Authority preservation

The materialized S59C PatternGroups and PatternSpecs remain:

```text
visibilityStatus / selectorStatus = hidden
canonicalRouting = disabled
productionUse = forbidden
```

Promotion is represented only by:

```text
data/curriculum/registry/promotions/S59F_G4B_U01_HorizontalPromotionRegistry.json
site/modules/curriculum/registry/g4b-u01-horizontal-promotion.js
site/modules/curriculum/registry/batch-a-selector-g4b-u01-horizontal-extension.js
```

## QA

The S59F tests enforce:

- exact JSON/runtime promotion identity parity;
- 9 unique promoted KnowledgePoints;
- 9 unique promoted PatternGroups;
- 12 unique promoted PatternSpecs;
- hidden authority remains immutable and production-forbidden;
- selector adds exactly nine G4B-U01 rows without global duplicate IDs;
- each KnowledgePoint exposes one horizontal numeric PatternGroup;
- no word-problem, vertical or representation-toggle path;
- source availability increments correctly;
- unrelated selector behavior delegates unchanged.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_G4B_U01_BLOCKING_VALIDATED_HIDDEN_RUNTIME
GOAL_DISTANCE_AFTER  = D1_G4B_U01_VISIBLE_SELECTOR_PROJECTED_RESOLVER_PENDING
DISTANCE_REDUCED     = promoted nine validated KnowledgePoints and twelve PatternSpecs into an auditable visible-selector overlay without changing hidden authority or production routing
REMAINING_BLOCKERS   = ["Resolver and browser state not integrated", "Canonical route not connected", "Worksheet, UI and print not connected"]
NEXT_SHORTEST_STEP   = S59G_G4B_U01_ResolverBrowserStateAndCanonicalRouterIntegration
AUTO_CONTINUE_DECISION = CONTINUE after PR and main CI pass
STOP_REASON = NONE
```
