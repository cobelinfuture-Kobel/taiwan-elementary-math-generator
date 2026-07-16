# GLM-S01 — Current 15-Unit Layout Behavior Audit

```text
TASK = GLM-S01_Current15UnitLayoutBehaviorAudit
STATUS = IMPLEMENTED_PENDING_CI_EVIDENCE
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

## 4. Evidence

The audit writes:

```text
docs/curriculum/output/glm-s01-current-layout-behavior-audit/current.json
```

The manifest contains:

- all 270 scenario records;
- classification totals;
- per-unit exact-layout and non-PASS layout counts;
- renderer-profile IDs;
- requested and resolved layout authorities;
- generation issue codes and captured exceptions;
- the next required task.

The dedicated workflow uploads the manifest as an artifact even when later validation fails.

## 5. Acceptance

GLM-S01 PASS means the baseline is complete and trustworthy, not that all units already support all layouts.

```text
actual scenarios = 270
public units = 15
layouts per unit = 18
unclassified scenarios = 0
manifest schema and evidence fields = valid
```

A non-PASS layout classification is expected evidence and does not make the audit harness fail. Harness exceptions are recorded as `GENERATION_BLOCKED` with `GLM_S01_HARNESS_EXCEPTION` evidence and must be investigated before implementation planning.

## 6. Scope boundary

No layout resolver, pagination, renderer profile, query state, browser control, curriculum generator or validator is changed by GLM-S01.

No per-unit fix is allowed in this milestone.

## 7. Continuation

The manifest drives:

```text
GLM-S02_UnitRendererProfileAndWorstCaseQuestionAudit
→ identify each unit's longest and most restrictive public question shapes
→ map current renderer-profile caps and response-area behavior
```

GLM-S03 then adds HTML/PDF containment evidence. GLM-S04 may be designed only after S01–S03 establish the actual gaps.

## 8. Distance

```text
GOAL_DISTANCE_BEFORE = D1_GLOBAL_15_UNIT_18_LAYOUT_CONTRACT_LOCKED_PENDING_BASELINE
GOAL_DISTANCE_AFTER  = D1_GLOBAL_DOCUMENT_LAYOUT_BASELINE_CAPTURED_PENDING_RENDERER_AND_PDF_AUDIT
DISTANCE_REDUCED     = deterministic 270-scenario public worksheet-document audit implemented
REMAINING_BLOCKERS   = CI evidence, S02 worst-case audit, S03 HTML/PDF baseline, S04-S08
NEXT_SHORT_STEP      = GLM-S02_UnitRendererProfileAndWorstCaseQuestionAudit
STOP_REASON          = NONE
```
