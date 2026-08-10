# PGC-R02 KnowledgePoint-driven UI Capability Binding Readback

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R02_KnowledgePointDrivenUICapabilityBinding
STATUS     = PASS
```

## Capacity-aware accepted matrix

```text
PUBLIC_SOURCES                  = 31
VISIBLE_KNOWLEDGE_POINTS        = 225
PUBLIC_SURFACES                 = 3
QUESTION_TYPE_BINDING_ROWS      = 1218
VERIFIED_20_BINDINGS            = 0
VERIFIED_LIMITED_BINDINGS       = 1062
STRUCTURAL_FALLBACK_BINDINGS    = 156
MINIMUM_VERIFIED_QUESTION_COUNT = 240
MAXIMUM_VERIFIED_QUESTION_COUNT = 240
UNVERIFIED_CAPACITY_EXPOSURES   = 0
GAPS                            = 0
```

Slice031 preserves the accepted R03/R06 capacity and terminal lineage, then adds six structural-fallback bindings for the new numeric-only decimal-times-integer source/KP across sourceUnit/singleKP and three public surfaces.

```text
GOAL_DISTANCE_BEFORE = D1_CAPACITY_AWARE_UI_BINDING_CONFORMANT
GOAL_DISTANCE_AFTER  = D1_SLICE031_CAPACITY_AWARE_UI_BINDING_CONFORMANT
DISTANCE_REDUCED     = Slice031 joins the current public binding authority without invalidating R06 terminal evidence
REMAINING_BLOCKERS   = [SLICE031_PRODUCT_ACCEPTANCE, CURRENT_ROUTE_RECONCILIATION]
NEXT_SHORTEST_STEP   = PGC-R04_NumericGenerationFullFix
```

