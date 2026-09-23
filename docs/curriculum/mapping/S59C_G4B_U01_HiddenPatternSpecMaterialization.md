# S59C — G4B-U01 Hidden PatternSpec Materialization

```text
CURRENT_MAJOR_TASK = S59_G4B_U01_HorizontalWorksheetPublicPrintPath
CURRENT_SUBTASK = S59C_G4B_U01_HiddenPatternSpecMaterialization
TASK_STATUS = HIDDEN_MATERIALIZATION
```

## Materialized authority

```text
data/curriculum/pattern_specs/S59C_G4B_U01_HorizontalPatternSpecRegistry.json
```

The authority contains:

```text
patternGroups = 9
patternSpecs = 12
visiblePatternSpecs = 0
routedPatternSpecs = 0
productionPatternSpecs = 0
```

The browser-neutral immutable projection is:

```text
site/modules/curriculum/batch-a/source-pattern-g4b-u01-horizontal-extension.js
```

## Lifecycle lock

Every new PatternSpec is:

```text
representation = horizontal_only
applicationTextAllowed = false
generatorStatus = hidden_not_implemented
validatorStatus = contract_only_not_runtime
runtimeProjectionStatus = materialized_not_routed
selectorStatus = hidden
canonicalRouting = disabled
productionUse = forbidden
```

The existing `ps_g4b_u01_multiplier_trailing_zero` identifier is preserved, but S59C does not change its public availability or route behavior.

## QA

The S59C tests enforce:

- 9 unique PatternGroups;
- 12 unique PatternSpecs;
- exact normalized authority/projection parity;
- exact identity and answer-model parity with S59B FormalMappings;
- immutable runtime projection;
- zero selector, canonical-route or production activation;
- unknown PatternSpec lookup returns `null`.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D2_G4B_U01_TAG_FORMAL_MAPPING_AND_BOUNDARIES_LOCKED
GOAL_DISTANCE_AFTER  = D2_G4B_U01_HIDDEN_PATTERNSPECS_MATERIALIZED
DISTANCE_REDUCED     = materialized 9 hidden PatternGroups and 12 hidden PatternSpecs with a drift-checkable browser-neutral projection
REMAINING_BLOCKERS   = ["Generator runtime not implemented", "Blocking validator runtime not implemented", "Selector, canonical router, worksheet, UI and print not connected"]
NEXT_SHORTEST_STEP   = S59D_G4B_U01_HiddenDeterministicHorizontalGenerator
AUTO_CONTINUE_DECISION = CONTINUE after PR and main CI pass
STOP_REASON = NONE
```
