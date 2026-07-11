# S59G — G4B-U01 Resolver, Browser State and Canonical Router Integration

```text
CURRENT_MAJOR_TASK = S59_G4B_U01_HorizontalWorksheetPublicPrintPath
CURRENT_SUBTASK = S59G_G4B_U01_ResolverBrowserStateAndCanonicalRouterIntegration
TASK_STATUS = CANONICAL_RUNTIME_INTEGRATED_WORKSHEET_GATE_PENDING
```

## Scope

S59G connects the nine visible S59F KnowledgePoints and PatternGroups to the canonical public runtime. It reuses the generic public browser state and visible resolver, then applies a G4B-U01 group-then-family allocation adapter before canonical generation.

```text
selectionModes = [singleKnowledgePoint, mixedKnowledgePointsSameUnit]
browserStateFields = [selectionMode, selectedKnowledgePointIds, selectedPatternGroupIds, questionCount, ordering, includeAnswerKey]
allocation = balanced_by_group_then_family
representation = horizontal_only
applicationMode = false
representationToggle = false
publicHiddenModeFlag = false
genericFallback = false
```

## Canonical route

```text
routeKind = g4b_u01_pure_horizontal
resolver = visiblePatternGroupResolver
runtimeGenerator = S59D deterministic generator
blockingValidator = S59E 24-code validator
promotionRegistry = s59f_g4b_u01_horizontal_promotion
productionUse = canonical_runtime_only
worksheetEligibility = unchanged / pending S59H
```

The canonical route accepts only resolver-derived promoted KnowledgePoints, PatternGroups and PatternSpecs. Public `selectedPatternSpecIds` are not consumed; family membership is derived from visible PatternGroups. Stale groups, cross-unit selections and invalid resolver results are blocked.

## Generator and validator sequence

For every allocated item:

```text
visible resolver allocation
→ S59D hidden deterministic generation
→ S59E blocking validation
→ lifecycle promotion to S59G canonical runtime
→ canonical lifecycle validation
→ output
```

Any blocking error produces zero canonical questions. The route never falls back to the generic source-unit generator.

## Lifecycle output

Each accepted question carries:

```text
phase = S59G
selectorStatus = visible
visibilityStatus = visible
productionUse = canonical_runtime_only
generatorRouting = canonical_resolver_allocation
representation = horizontal_only
applicationText = false
canonicalRoute.kind = g4b_u01_pure_horizontal
```

Source-unit mode remains delegated to the existing source-unit route.

## QA

The S59G test layer covers:

- one-KP automatic group resolution and four-family allocation;
- mixed same-unit group-first and family-second fairness;
- browser-state round trip for count, ordering and answer-key controls;
- exact canonical count and mandatory validator application;
- deterministic shuffled output;
- stale and cross-unit selection rejection;
- arbitrary public PatternSpec injection ignored in favor of visible resolver derivation;
- validator failure returns zero output with no fallback;
- source-unit mode remains legacy.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_G4B_U01_VISIBLE_SELECTOR_PROJECTED_RESOLVER_PENDING
GOAL_DISTANCE_AFTER  = D1_G4B_U01_CANONICAL_VALIDATED_RUNTIME_WORKSHEET_PENDING
DISTANCE_REDUCED     = connected visible KP/group selection and generic browser state to exact group-then-family allocation, deterministic generation, mandatory blocking validation and a no-fallback canonical horizontal route
REMAINING_BLOCKERS   = ["Canonical worksheet and answer-key contract not connected", "Renderer and public print controls not verified", "Final HTML/PDF promotion not completed"]
NEXT_SHORTEST_STEP   = S59H_G4B_U01_WorksheetAnswerKeyAndHorizontalRendererIntegration
AUTO_CONTINUE_DECISION = CONTINUE after PR and main CI pass
STOP_REASON = NONE
```
