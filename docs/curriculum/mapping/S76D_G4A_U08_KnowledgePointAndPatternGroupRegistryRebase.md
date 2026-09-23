# S76D G4A-U08 KnowledgePoint and PatternGroup Registry Rebase

```text
TASK = S76D_G4A_U08_KnowledgePointAndPatternGroupRegistryRebase
STATUS = IMPLEMENTED_PENDING_CI
SOURCE_ID = g4a_u08_4a08
MODE = hidden registry rebase only
```

## Result

S76D materializes the S76A source authority as a hidden, non-routed registry:

- 15 KnowledgePoints;
- 11 numeric KnowledgePoints;
- 4 application KnowledgePoints;
- 28 PatternGroups;
- 4 extension PatternGroups;
- existing four application KnowledgePoint IDs preserved as compatibility anchors.

## Main correction

The former coarse application categories are no longer treated as sufficient reasoning identities. The registry separates:

- add-add, add-subtract, subtract-add and subtract-subtract;
- adjusted-amount payment, grouped-divisor and difference-scale-overlay roles;
- multiply-then-share, unit-rate-then-scale and divide-then-divide;
- single-cost payment, divided-amount adjustment and cost overlay;
- comparison chain, equal-value unit price, relative difference and two-cost-component payment as hidden extensions.

This stage does not reclassify existing PatternSpecs. That is reserved for S76E.

## Lifecycle

The S76D registry is deliberately hidden:

```text
selectorVisibility = hidden
canonicalRouting = disabled
patternSpecMaterialization = pending_s76e
productionUse = forbidden_for_rebase_registry
```

The existing G4A-U08 production path is unchanged. Historical Phase1 + Phase2A D0 evidence remains valid for its accepted subset.

## Files

```text
data/curriculum/registry/S76D_G4A_U08_KnowledgePointPatternGroupRegistry.json
tests/curriculum/g4a-u08-s76d-kp-pattern-group-registry.test.js
```

## Acceptance

Executable QA verifies:

- exact 15-KP and 28-PatternGroup counts;
- unique IDs and complete KP references;
- explicit separation of previously over-merged multiplication/division roles;
- four extension groups remain hidden and unrouted;
- no grade-5-only distributive-law, average, unknown-operator, N+1 or SDG objectives enter G4A-U08;
- generator, validator, selector, worksheet and renderer scope remain unchanged.

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_G4A_U08_IMPLEMENTATION_SCOPE_LOCKED
GOAL_DISTANCE_AFTER  = D2_G4A_U08_HIDDEN_KP_PATTERN_GROUP_REGISTRY_REBASED
DISTANCE_REDUCED     = Source-authority KnowledgePoints and reasoning-role PatternGroups are now executable registry data instead of planning-only prose.
REMAINING_BLOCKERS   = Existing PatternSpecs still use old coarse classification; canonical item adapter and validator contracts are not yet rebased; extension generators are not implemented.
NEXT_SHORTEST_STEP   = S76E_G4A_U08_ExistingPatternSpecReclassification
STOP_REASON          = NONE_PENDING_CI
```
