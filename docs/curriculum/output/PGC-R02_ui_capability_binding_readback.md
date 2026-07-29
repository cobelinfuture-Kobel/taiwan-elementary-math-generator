# PGC-R02 KnowledgePoint-driven UI Capability Binding Readback

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R02_KnowledgePointDrivenUICapabilityBinding
STATUS     = PASS
```

## Capacity-aware accepted matrix

```text
PUBLIC_SOURCES                  = 26
VISIBLE_KNOWLEDGE_POINTS        = 193
PUBLIC_SURFACES                 = 3
QUESTION_TYPE_BINDING_ROWS      = 1089
VERIFIED_20_BINDINGS            = 702
VERIFIED_LIMITED_BINDINGS       = 387
MINIMUM_VERIFIED_QUESTION_COUNT = 1
MAXIMUM_VERIFIED_QUESTION_COUNT = 20
UNVERIFIED_CAPACITY_EXPOSURES   = 0
GAPS                            = 0
```

PGC-R03 removes illegal depth/context/scope intersections and applies the verified per-capability question-count ceiling. A ceiling below 20 is a truthful supported limit, not an unverified exposure.

```text
GOAL_DISTANCE_BEFORE = D1_KP_DRIVEN_UI_BINDING_CONFORMANT
GOAL_DISTANCE_AFTER  = D1_CAPACITY_AWARE_UI_BINDING_CONFORMANT
DISTANCE_REDUCED     = public controls now expose only legal routes and clamp question count to the verified route capacity
REMAINING_BLOCKERS   = [PGC-R04_NUMERIC_QUALITY, PGC-R05_APPLICATION_QUALITY, PGC-R06_TO_R08_PRODUCT_ACCEPTANCE]
NEXT_SHORTEST_STEP   = PGC-R04_NumericGenerationFullFix
```

