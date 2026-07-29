# PGC-R01 Capability Gap Report

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R01_PublicKnowledgePointCapabilityMatrix
STATUS     = FAIL_CLOSED_BLOCKING_GAPS
```

## Matrix summary

```text
PUBLIC_SOURCES             = 26
VISIBLE_KNOWLEDGE_POINTS   = 193
KP_SURFACE_PAIRS           = 547 / 579
CAPABILITY_ROWS            = 1222
UNIQUE_PATTERN_GROUPS      = 246
UNIQUE_PATTERN_SPECS       = 350
UI_OPTIONS_ACCOUNTED       = 156 / 156
BLOCKING_R01_GAPS          = 34
R02_UI_BINDING_GAPS        = 22
R03_CAPACITY_UNVERIFIED    = 1222
```

Legacy mode normalization recovered 9 UI options. KP-surface normalization added 61 subtype rows; remaining missing KP-surface pairs: 34.

## Gap classes

| Gap code | Count | Owner milestone |
|---|---:|---|
| `FALLBACK_404_PUBLIC_CONTROL_PARITY_GAP` | 22 | PGC-R02 |
| `PUBLIC_KP_SURFACE_WITHOUT_CAPABILITY` | 34 | PGC-R01 |

## Accepted findings

1. All 26 public sources and all 193 visible KnowledgePoints are represented on Classic, fallback 404 and Pixel.
2. All visible question-type UI options are accounted for.
3. Concept, representation, estimation and reasoning PatternGroup subtypes remain visible in the matrix while mapping to the parent UI option actually exposed by each surface.
4. The 404 fallback profile parity gaps remain explicit and move to PGC-R02.
5. Capacity remains unverified and moves to PGC-R03.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_PUBLIC_SCOPE_FROZEN
GOAL_DISTANCE_AFTER  = D1_PUBLIC_CAPABILITY_MATRIX_MATERIALIZED
DISTANCE_REDUCED     = every public KP/type/form/group/spec/control/surface path is machine-readable and accounted
REMAINING_BLOCKERS   = [PGC-R02_DYNAMIC_UI_BINDING, PGC-R03_VERIFIED_CAPACITY, PGC-R04_TO_R08_PRODUCT_ACCEPTANCE]
NEXT_SHORTEST_STEP   = PGC-R02_KnowledgePointDrivenUICapabilityBinding
```

