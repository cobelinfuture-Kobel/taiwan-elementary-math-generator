# PGC-R02 KnowledgePoint-driven UI Capability Binding Readback

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R02_KnowledgePointDrivenUICapabilityBinding
STATUS     = PASS
```

## Capacity-aware accepted matrix

```text
PUBLIC_SOURCES                  = 29
VISIBLE_KNOWLEDGE_POINTS        = 212
PUBLIC_SURFACES                 = 3
QUESTION_TYPE_BINDING_ROWS      = 1167
VERIFIED_20_BINDINGS            = 0
VERIFIED_LIMITED_BINDINGS       = 1077
STRUCTURAL_FALLBACK_BINDINGS    = 90
MINIMUM_VERIFIED_QUESTION_COUNT = 240
MAXIMUM_VERIFIED_QUESTION_COUNT = 240
UNVERIFIED_CAPACITY_EXPOSURES   = 0
GAPS                            = 0
```

PGC-R03 removes illegal depth/context/scope intersections and applies the verified per-capability question-count ceiling. Later direct-product slices may use the already accepted structural fallback under the global 240 ceiling until the capacity registry is rematerialized; this does not mutate historical PGC-R03 route evidence.

```text
GOAL_DISTANCE_BEFORE = D1_KP_DRIVEN_UI_BINDING_CONFORMANT
GOAL_DISTANCE_AFTER  = D1_CAPACITY_AWARE_UI_BINDING_CONFORMANT
DISTANCE_REDUCED     = public controls now expose only legal routes and clamp question count to the accepted global runtime ceiling
REMAINING_BLOCKERS   = [PGC-R04_NUMERIC_QUALITY, PGC-R05_APPLICATION_QUALITY, PGC-R06_TO_R08_PRODUCT_ACCEPTANCE]
NEXT_SHORTEST_STEP   = PGC-R04_NumericGenerationFullFix
```

