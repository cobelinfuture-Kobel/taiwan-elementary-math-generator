# G06 School Exam Template V1.1 — M1 Selection Contract Preflight

## Status

```text
TASK = G06_SCHOOL_EXAM_TEMPLATE_V11_M1_SelectionContractPreflight
STATUS = PASS_CONTRACT_LOCKED_PLANNING_ONLY
AUTHORITY_MAIN = b68b4285cb730794bb645baa3df27a02bc580a12
RUNTIME_MUTATION = NONE
```

## What current main already supports

The browser state already defines four selector tokens:

- `sourceUnit`
- `singleKnowledgePoint`
- `mixedKnowledgePointsSameUnit`
- `mixedKnowledgePointsCrossUnit`

The current Classic UI exposes the cross-unit token but disables it. Same-unit mixed mode is enabled only when the current source has at least two visible KPs and its current availability admits same-unit mixing.

Query-state parsing already understands the cross-unit token and deliberately does not source-scope KP IDs for that mode. That means URL/state vocabulary exists, but this does **not** imply runtime support.

## Runtime boundary found

The generic visible PatternGroup resolver recognizes `mixedKnowledgePointsCrossUnit` but fails closed with:

```text
kp_resolver_cross_unit_not_supported_yet
```

So M4 cannot be implemented by simply turning on the disabled option.

The current shared same-unit aggregation path is reusable as an architectural model: it balances question count across selected KPs, dispatches each KP through an existing `singleKnowledgePoint` leaf runtime, preserves leaf runtime ownership, aggregates the resulting WorksheetDocument records, and does not mutate semantic authority.

## Exact V1.1 top-level exam modes

| Exam mode | User-facing meaning | Existing runtime token | Runtime status |
|---|---|---|---|
| `SINGLE_UNIT` | 單一單元 | `sourceUnit` | ready |
| `MIXED_KP_SAME_UNIT` | 同單元混合知識點 | `mixedKnowledgePointsSameUnit` | ready where current public capability admits it |
| `MIXED_KP_CROSS_UNIT` | 跨單元混合知識點 | `mixedKnowledgePointsCrossUnit` | fail-closed today; M4 adapter required |

`singleKnowledgePoint` is **not** a fourth top-level exam mode. It remains an existing specialized practice mode and becomes the preferred internal leaf dispatch shape for future cross-unit composition.

## Cross-unit V1.1 boundary

M4 is locked to:

```text
same grade
+ same semester
+ two or more source units
+ two or more visible/public KPs
```

No cross-grade composition, no cross-semester composition, no hidden/unresolved KP, and no synthetic composite KP.

The future coordinator must group each selected KP under its real owning `sourceId`, call existing single-KP leaf runtimes, fail closed if any leaf fails, preserve per-question `sourceId` / `knowledgePointId` / Pattern lineage, and aggregate only after leaf validation succeeds.

## Current exam-template gap

The current `/exam-template/` route is still source-unit-only. It imports source-unit/question-count/order/seed/answer/layout setters, but does not import the selector setters. Therefore M2 is the shortest implementation step: wire the already-working source-unit contract into an explicit `SINGLE_UNIT` exam composition mode without touching layout or generator behavior.

## Frozen boundaries for M1

No changes were made to:

- Generator
- Validator
- Renderer
- selector runtime
- worksheet runtime
- KnowledgePoint authority
- PatternSpec authority
- exam layout

## Distance

```text
GOAL_DISTANCE_BEFORE = D1
GOAL_DISTANCE_AFTER  = D1
DISTANCE_REDUCED     = planning ambiguity removed; runtime distance not claimed
REMAINING_BLOCKERS   = [M2, M3, M4, M5, M6, M7]
NEXT_SHORTEST_STEP   = G06_SCHOOL_EXAM_TEMPLATE_V11_M2_SingleUnitRuntime
```
