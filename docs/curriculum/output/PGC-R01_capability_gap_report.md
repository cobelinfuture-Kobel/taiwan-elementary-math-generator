# PGC-R01 Capability Gap Report

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R01_PublicKnowledgePointCapabilityMatrix
STATUS     = PASS_WITH_DOWNSTREAM_GAPS
```

## Matrix summary

```text
PUBLIC_SOURCES                    = 28
VISIBLE_KNOWLEDGE_POINTS          = 206
VISIBLE_KP_SURFACE_ACCOUNTED      = 618 / 618
VISIBLE_KP_SURFACE_CAPABILITY     = 584
VISIBLE_KP_SURFACE_EXPLICIT_GAP   = 34
CAPABILITY_ROWS                   = 1303
UNIQUE_PATTERN_GROUPS             = 261
UNIQUE_PATTERN_SPECS              = 378
UI_OPTIONS_ACCOUNTED              = 162 / 162
BLOCKING_R01_GAPS                 = 0
R02_UI_BINDING_GAPS               = 56
R03_CAPACITY_UNVERIFIED           = 1303
```

R01 does not fabricate a capability for the deprecated 404 surface. Application-only and reasoning-only KnowledgePoints that are selector-visible but cannot be configured there are recorded as explicit fail-closed R02 gaps.

## Gap classes

| Gap code | Count | Owner milestone |
|---|---:|---|
| `FALLBACK_404_KP_CAPABILITY_HIDDEN_BY_CONTROL_PARITY` | 34 | PGC-R02 |
| `FALLBACK_404_PUBLIC_CONTROL_PARITY_GAP` | 22 | PGC-R02 |

## Accepted findings

1. All 28 public sources and all 206 visible KnowledgePoints are accounted across all three public surfaces.
2. All 156 visible question-type UI options map to at least one capability row.
3. 404-only absence is explicit and fail-closed; it is not counted as a working capability.
4. Concept, representation, estimation and reasoning PatternGroup subtypes remain visible through their actual parent UI option.
5. Capacity remains unverified and is owned by PGC-R03.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_PUBLIC_SCOPE_FROZEN
GOAL_DISTANCE_AFTER  = D1_PUBLIC_CAPABILITY_MATRIX_MATERIALIZED
DISTANCE_REDUCED     = all public KP/type/form/group/spec/control/surface paths are represented by capability or explicit fail-closed absence
REMAINING_BLOCKERS   = [PGC-R02_DYNAMIC_UI_BINDING, PGC-R03_VERIFIED_CAPACITY, PGC-R04_TO_R08_PRODUCT_ACCEPTANCE]
NEXT_SHORTEST_STEP   = PGC-R02_KnowledgePointDrivenUICapabilityBinding
```

