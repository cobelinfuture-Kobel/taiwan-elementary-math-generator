# GCKG R06 Legacy Compatibility Migration Readback

```text
PROGRAM_ID = GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1
TASK_ID = R06_LegacyCompatibilityMigration
STATUS = PASS_R06_LEGACY_COMPATIBILITY_SHADOW_MIGRATION
MAINLINE_INTEGRATION_STATUS = ADAPTER_CONNECTED
```

## Result

```text
public product units                    = 15
legacy source nodes                     = 16
protected canonical KnowledgePoints     = 156
production-authority identity mode      = EXACT_ID
Global-model reconciliation cases       = 9
production consumer changed             = false
```

The executable runtime and validator emit the authoritative PatternSpec/question-binding and S43 alias counts.

## Compatibility behavior

```text
15_UNITS_REBUILD_REQUIRED              = false
15_UNITS_CURRENT_PRODUCTION_USE        = preserved
LEGACY_SOURCE_IDS_PRESERVED            = true
LEGACY_KP_IDS_PRESERVED                = true
LEGACY_PATTERN_IDS_PRESERVED           = true
S43_PARTIAL_REGISTRY_ROLE              = compatibility_alias_only
VISIBLE_OUTPUT_CHANGE_EXPECTED         = false
```

## Nine reconciliations

All nine R05 Global-model differences are resolved by a legacy scope fence. Existing approved legacy patterns retain D0 production use. New Global patterns remain blocked until their complete prerequisite and capability contracts are admitted.

## Boundary

```text
production consumer changed = false
dual-read cutover performed = false
parallel runtime created    = false
production cutover allowed  = false
next task                   = R07_AuthoritativeConsumerCutover
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2
GOAL_DISTANCE_AFTER  = D2
DISTANCE_REDUCED     = The existing 15-unit D0 identities and PatternSpec bindings are now attached to the Global KP/capability/delivery authorities with nine scope-fenced reconciliations and no product rebuild.
REMAINING_BLOCKERS   = [R07 dual-read parity and production consumer cutover, contract-only capability implementation for later waves]
NEXT_SHORTEST_STEP   = R07_AuthoritativeConsumerCutover
```
