# PGC-R02 KnowledgePoint-driven UI Capability Binding Readback

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R02_KnowledgePointDrivenUICapabilityBinding
STATUS     = PASS
```

## Accepted matrix

```text
PUBLIC_SOURCES                = 26
VISIBLE_KNOWLEDGE_POINTS      = 193
PUBLIC_SURFACES               = 3
BASE_UI_CASES                 = 243
SURFACE_UI_CASES              = 729
QUESTION_TYPE_BINDING_ROWS    = 1152
SURFACE_PARITY_CASES          = 243
BLOCKED_BINDINGS              = 0
UNVERIFIED_CAPACITY_EXPOSURES = 0
GAPS                          = 0
```

## Binding policy

- KnowledgePoint selection determines available question types.
- Question type determines compatible PatternGroups and PatternSpecs.
- Depth and context controls appear only for compatible semantic modes.
- PBL remains source-unit-only.
- Classic, deprecated 404 fallback and Pixel use the same pure resolver.
- Until PGC-R03 proves route capacity, all public surfaces fail closed at 20 questions.
- Cross-unit mixed KnowledgePoint mode remains disabled.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_PUBLIC_CAPABILITY_MATRIX_MATERIALIZED
GOAL_DISTANCE_AFTER  = D1_KP_DRIVEN_UI_BINDING_CONFORMANT
DISTANCE_REDUCED     = public selectors expose only capability-compatible type/form/depth/context/count combinations
REMAINING_BLOCKERS   = [PGC-R03_VERIFIED_CAPACITY, PGC-R04_TO_R08_PRODUCT_ACCEPTANCE]
NEXT_SHORTEST_STEP   = PGC-R03_PublicGeneratorCapacityContract
```

