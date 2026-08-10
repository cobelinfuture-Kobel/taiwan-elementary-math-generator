# PGC-R01 Capability Gap Report

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R01_PublicKnowledgePointCapabilityMatrix
STATUS     = PASS_WITH_DOWNSTREAM_GAPS
```

## Matrix summary

```text
PUBLIC_SOURCES                    = 31
VISIBLE_KNOWLEDGE_POINTS          = 225
VISIBLE_KP_SURFACE_ACCOUNTED      = 675 / 675
CAPABILITY_ROWS                   = 1413
UNIQUE_PATTERN_GROUPS             = 284
UNIQUE_PATTERN_SPECS              = 418
UI_OPTIONS_ACCOUNTED              = 168 / 168
BLOCKING_R01_GAPS                 = 0
R02_UI_BINDING_GAPS               = 56
R03_CAPACITY_UNVERIFIED           = 1413
```

Slice031 adds one source-backed numeric decimal-times-integer KnowledgePoint on Classic, fallback 404 and Pixel without admitting integer-times-decimal, decimal-times-decimal, application, estimation, depth or context surfaces.

## Gap classes

| Gap code | Count | Owner milestone |
|---|---:|---|
| `FALLBACK_404_KP_CAPABILITY_HIDDEN_BY_CONTROL_PARITY` | 34 | PGC-R02 |
| `FALLBACK_404_PUBLIC_CONTROL_PARITY_GAP` | 22 | PGC-R02 |

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_SLICE031_SOURCE_BACKED_RUNTIME_CANDIDATE
GOAL_DISTANCE_AFTER  = D1_SLICE031_CURRENT_R01_AUTHORITY_MATERIALIZED
DISTANCE_REDUCED     = current public source/KP capability authority now accounts for the Slice031 decimal-times-integer surface
REMAINING_BLOCKERS   = [PGC-R02_CURRENT_BINDING_RECONCILIATION, SLICE031_PRODUCT_ACCEPTANCE]
NEXT_SHORTEST_STEP   = PGC-R02 Slice031 current binding materialization
```

