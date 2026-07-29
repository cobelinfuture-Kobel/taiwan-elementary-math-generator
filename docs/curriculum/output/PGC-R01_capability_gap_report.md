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
CAPABILITY_ROWS            = 1161
UNIQUE_PATTERN_GROUPS      = 234
UNIQUE_PATTERN_SPECS       = 334
UI_OPTIONS_ACCOUNTED       = 147 / 156
BLOCKING_R01_GAPS          = 9
R02_UI_BINDING_GAPS        = 22
R03_CAPACITY_UNVERIFIED    = 1161
```

仍有 9 個 R01 blocking gap；不得宣告完整 capability authority。

## Gap classes

| Gap code | Count | Owner milestone |
|---|---:|---|
| `FALLBACK_404_PUBLIC_CONTROL_PARITY_GAP` | 22 | PGC-R02 |
| `PUBLIC_UI_OPTION_WITHOUT_CAPABILITY` | 9 | PGC-R01 |

## Important findings

1. Classic and Pixel are profile-driven public surfaces.
2. The public 404 fallback does not mount the shared `public-control-ui.js`; outside G5A-U08 it exposes only the default numeric path. This is recorded as an R02 UI-binding parity gap rather than silently claiming parity.
3. Every capability retains `declaredUiMaxQuestionCount = 200`, but verified capacity remains null until PGC-R03 performs cross-seed capacity proof.
4. Hidden KnowledgePoints and Slice014 are absent from the matrix.
5. PBL capabilities are represented by their admitted runtime PatternSpec witness and complete-task-set form.

## Blocking gap detail

- `PUBLIC_UI_OPTION_WITHOUT_CAPABILITY`: `{"code":"PUBLIC_UI_OPTION_WITHOUT_CAPABILITY","severity":"blocking_r01","sourceId":"g3b_u04_3b04","surfaceId":"CLASSIC","questionTypeOption":"numeric"}`
- `PUBLIC_UI_OPTION_WITHOUT_CAPABILITY`: `{"code":"PUBLIC_UI_OPTION_WITHOUT_CAPABILITY","severity":"blocking_r01","sourceId":"g3b_u04_3b04","surfaceId":"FALLBACK_404","questionTypeOption":"numeric"}`
- `PUBLIC_UI_OPTION_WITHOUT_CAPABILITY`: `{"code":"PUBLIC_UI_OPTION_WITHOUT_CAPABILITY","severity":"blocking_r01","sourceId":"g3b_u04_3b04","surfaceId":"PIXEL","questionTypeOption":"numeric"}`
- `PUBLIC_UI_OPTION_WITHOUT_CAPABILITY`: `{"code":"PUBLIC_UI_OPTION_WITHOUT_CAPABILITY","severity":"blocking_r01","sourceId":"g3b_u08_3b08","surfaceId":"CLASSIC","questionTypeOption":"numeric"}`
- `PUBLIC_UI_OPTION_WITHOUT_CAPABILITY`: `{"code":"PUBLIC_UI_OPTION_WITHOUT_CAPABILITY","severity":"blocking_r01","sourceId":"g3b_u08_3b08","surfaceId":"FALLBACK_404","questionTypeOption":"numeric"}`
- `PUBLIC_UI_OPTION_WITHOUT_CAPABILITY`: `{"code":"PUBLIC_UI_OPTION_WITHOUT_CAPABILITY","severity":"blocking_r01","sourceId":"g3b_u08_3b08","surfaceId":"PIXEL","questionTypeOption":"numeric"}`
- `PUBLIC_UI_OPTION_WITHOUT_CAPABILITY`: `{"code":"PUBLIC_UI_OPTION_WITHOUT_CAPABILITY","severity":"blocking_r01","sourceId":"g4b_u01_4b01","surfaceId":"CLASSIC","questionTypeOption":"numeric"}`
- `PUBLIC_UI_OPTION_WITHOUT_CAPABILITY`: `{"code":"PUBLIC_UI_OPTION_WITHOUT_CAPABILITY","severity":"blocking_r01","sourceId":"g4b_u01_4b01","surfaceId":"FALLBACK_404","questionTypeOption":"numeric"}`
- `PUBLIC_UI_OPTION_WITHOUT_CAPABILITY`: `{"code":"PUBLIC_UI_OPTION_WITHOUT_CAPABILITY","severity":"blocking_r01","sourceId":"g4b_u01_4b01","surfaceId":"PIXEL","questionTypeOption":"numeric"}`

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_PUBLIC_SCOPE_FROZEN
GOAL_DISTANCE_AFTER  = D1_CAPABILITY_MATRIX_FAIL_CLOSED
DISTANCE_REDUCED     = public KP / type / form / PatternGroup / PatternSpec / controls / surface lineage is machine-readable
REMAINING_BLOCKERS   = [PGC-R02_DYNAMIC_UI_BINDING, PGC-R03_VERIFIED_CAPACITY, PGC-R04_TO_R08_PRODUCT_ACCEPTANCE]
NEXT_SHORTEST_STEP   = PGC-R02_KnowledgePointDrivenUICapabilityBinding
```

