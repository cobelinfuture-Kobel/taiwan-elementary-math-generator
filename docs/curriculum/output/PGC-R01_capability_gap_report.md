# PGC-R01 Capability Gap Report

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R01_PublicKnowledgePointCapabilityMatrix
STATUS     = PASS_WITH_DOWNSTREAM_GAPS
```

## Matrix summary

```text
PUBLIC_SOURCES                    = 32
VISIBLE_KNOWLEDGE_POINTS          = 226
VISIBLE_KP_SURFACE_ACCOUNTED      = 678 / 678
CAPABILITY_ROWS                   = 1419
UNIQUE_PATTERN_GROUPS             = 285
UNIQUE_PATTERN_SPECS              = 420
UI_OPTIONS_ACCOUNTED              = 171 / 171
BLOCKING_R01_GAPS                 = 0
R02_UI_BINDING_GAPS               = 56
R03_CAPACITY_UNVERIFIED           = 1419
```

Slice032 adds exactly one G6B-U01 decimal/fraction conversion KnowledgePoint with two numeric PatternSpecs on Classic, fallback 404 and Pixel. Compare, mixed arithmetic, application, estimation and Global Context remain reserved.

## Gap classes

| Gap code | Count | Owner milestone |
|---|---:|---|
| `FALLBACK_404_KP_CAPABILITY_HIDDEN_BY_CONTROL_PARITY` | 34 | PGC-R02 |
| `FALLBACK_404_PUBLIC_CONTROL_PARITY_GAP` | 22 | PGC-R02 |

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_SLICE032_RUNTIME_CONNECTED_CURRENT_AUTHORITY_PENDING
GOAL_DISTANCE_AFTER  = D1_SLICE032_CURRENT_R01_AUTHORITY_MATERIALIZED
DISTANCE_REDUCED     = current public capability authority now accounts for exact decimal/fraction conversion on 32 sources / 226 visible KPs
REMAINING_BLOCKERS   = [PGC-R02_CURRENT_BINDING_RECONCILIATION, SLICE032_PRODUCT_ACCEPTANCE]
NEXT_SHORTEST_STEP   = PGC-R02 Slice032 current binding materialization
```

