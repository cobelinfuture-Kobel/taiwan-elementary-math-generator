# GLM-S01 — Current 15-Unit Layout Behavior Audit

```text
TASK = GLM-S01_Current15UnitLayoutBehaviorAudit
STATUS = BASELINE_CAPTURED_REPRODUCED_PENDING_FULL_CI
DEPENDS_ON = GLM-S00_PublicCompletedUnitInventoryAnd18LayoutContract
PUBLIC_UNIT_COUNT = 15
APPROVED_LAYOUT_COUNT_PER_UNIT = 18
SCENARIO_COUNT = 270
AUDIT_LAYER = WORKSHEET_DOCUMENT_BEFORE_DOM_PDF
```

## 1. Purpose

GLM-S01 measures the current production code path without repairing it. It answers whether every public unit preserves each approved requested layout at the worksheet-document layer.

This milestone does not claim browser, DOM or PDF acceptance. Those remain GLM-S03 and later.

## 2. Public-path execution

For every unit/layout pair, the audit:

1. creates a fresh public config state;
2. selects the source unit in `sourceUnit` mode;
3. requests 18 questions without an answer key;
4. applies the approved columns and rows;
5. enables `custom_with_caps` where G4B-U04 requires explicit custom activation;
6. invokes the same top-level `buildWorksheetDocumentFromState` pipeline used by Classic;
7. reads the resolved layout from the highest available authority:
   - `layoutResolution.resolvedQuestionLayout`;
   - otherwise `printOptions`;
   - otherwise `configSnapshot.printLayout`;
8. records renderer profile, applied-layout readback, issue codes and generation state.

The deterministic seed is scoped by source ID and layout ID.

## 3. Closed classification set

```text
PASS                requested and resolved layout match exactly
SILENTLY_CAPPED     resolved columns or rows are lower than requested
IGNORED             layout readback is absent or resolves to another non-cap value
GENERATION_BLOCKED  the public worksheet pipeline returns no valid document
```

The broader GLM-S00 result-code vocabulary remains reserved for later browser/PDF layers:

```text
OVERFLOW
OVERLAP
BLANK_PAGE
QUERY_REPLAY_FAIL
SOURCE_SWITCH_FAIL
```

GLM-S01 must not fabricate DOM/PDF results from document-layer evidence.

## 4. Reproduced baseline

The dedicated workflow completed twice with the same classification totals. The accepted reproduced run is:

```text
workflow = GLM-S01 Current 15-Unit Layout Behavior Audit
run      = 29476490045
artifact = 8366744280
manifest = sha256:9b4a4449a284ec422c7d3272111deeed714af809739926b6383a9629cf595d31
```

Global results:

| Classification | Scenarios |
|---|---:|
| PASS | 225 |
| SILENTLY_CAPPED | 8 |
| GENERATION_BLOCKED | 19 |
| IGNORED | 18 |
| **Total** | **270** |

Unit-level result:

```text
11 units = 18 / 18 exact document layouts
4 units  = document-layer gaps
```

The eleven exact units are 3A-U01, 3A-U02, 3A-U03, 3A-U06, 3B-U01, 3B-U04, 3B-U08, 4A-U04, 4A-U08, 4B-U01 and 5A-U08.

## 5. Gap units

### 4A-U01 — 1億以內的數

```text
PASS               = 12
SILENTLY_CAPPED    = 5
GENERATION_BLOCKED = 1
```

Non-PASS layouts:

```text
3×5, 2×5, 2×6, 1×5, 1×6, 1×7
```

Five layouts are silently capped to four rows. The deterministic 1×6 scenario is blocked by `batch_a_g4a_u01_first_difference_missing`, `batch_a_g4a_u01_first_difference_invalid` and `batch_a_answer_incorrect`. S02 must separate the renderer cap from the seed-specific generation defect.

### 4A-U02 — 整數的乘法

```text
PASS            = 15
SILENTLY_CAPPED = 3
```

Non-PASS layouts:

```text
2×6, 1×6, 1×7
```

All three are capped to five rows.

### 4B-U04 — 概數

```text
GENERATION_BLOCKED = 18
```

The existing R4 18-layout PASS applies to the promoted knowledge-point canonical route. The public `sourceUnit` path used by the global selector baseline rejects all layouts with:

```text
G4B_U04_CANONICAL_SELECTION_MODE_INVALID
G4B_U04_CANONICAL_KP_NOT_PROMOTED
G4B_U04_CANONICAL_GROUP_NOT_RESOLVED
G4B_U04_CANONICAL_PATTERN_NOT_PROMOTED
```

Therefore the earlier unit-level R4 PASS cannot close the global selector contract.

### 5A-U02 — 因數與公因數

```text
IGNORED = 18
```

The static public candidate exposes no question-layout readback authority. Every request generates 22 questions and 22 one-question pages despite the audit requesting 18 questions and variable layouts. The recorded issue is `g5a_u02_public_canonical_static_release`.

## 6. Evidence

Full scenario evidence is generated at:

```text
docs/curriculum/output/glm-s01-current-layout-behavior-audit/current.json
```

It is uploaded as a workflow artifact. The persistent compact authority is:

```text
docs/curriculum/output/GLM_S01_CURRENT_15_UNIT_LAYOUT_BEHAVIOR_BASELINE.json
```

The evidence contains:

- all 270 scenario records in the workflow artifact;
- classification totals;
- per-unit exact-layout and non-PASS layout counts;
- renderer-profile IDs;
- requested and resolved layout authorities;
- generation issue codes and captured exceptions;
- the next required task.

## 7. Acceptance

GLM-S01 PASS means the baseline is complete and trustworthy, not that all units already support all layouts.

```text
actual scenarios = 270
public units = 15
layouts per unit = 18
unclassified scenarios = 0
manifest schema and evidence fields = valid
baseline reproduced = true
```

A non-PASS layout classification is expected evidence and does not make the audit harness fail. Harness exceptions are recorded as `GENERATION_BLOCKED` with `GLM_S01_HARNESS_EXCEPTION` evidence and must be investigated before implementation planning.

## 8. Scope boundary

No layout resolver, pagination, renderer profile, query state, browser control, curriculum generator or validator is changed by GLM-S01.

No per-unit fix is allowed in this milestone.

## 9. Continuation

S02 must cover all 15 units, with priority on the four gap units. It must determine each unit's longest and most restrictive public question shapes, renderer/profile row caps, response-area behavior and source-mode route requirements.

```text
GLM-S02_UnitRendererProfileAndWorstCaseQuestionAudit
→ classify question-shape families and current caps
→ establish worst-case samples for all 15 units
→ isolate generation defects from layout defects
```

GLM-S03 then adds HTML/PDF containment evidence. GLM-S04 may be designed only after S01–S03 establish the actual gaps.

## 10. Distance

```text
GOAL_DISTANCE_BEFORE = D1_GLOBAL_15_UNIT_18_LAYOUT_CONTRACT_LOCKED_PENDING_BASELINE
GOAL_DISTANCE_AFTER  = D1_GLOBAL_DOCUMENT_LAYOUT_BASELINE_CAPTURED_PENDING_RENDERER_AND_PDF_AUDIT
DISTANCE_REDUCED     = reproducible 270-scenario baseline; 225 exact, 8 capped, 19 blocked, 18 ignored
REMAINING_BLOCKERS   = full CI acceptance, S02 worst-case audit, S03 HTML/PDF baseline, S04-S08
NEXT_SHORT_STEP      = GLM-S02_UnitRendererProfileAndWorstCaseQuestionAudit
STOP_REASON          = NONE
```
