# S74 — G4B-U04 Public UI, Print and Query-State QA

```text
TASK = S74_G4B_U04_PublicUIPrintAndQueryStateQA
STATUS = PASS_IMPLEMENTED_PENDING_CI
SOURCE_ID = g4b_u04_4b04
```

## Scope

S74 connects the S73 worksheet and renderer path to all public browser surfaces and verifies public configuration persistence.

```text
G4B-U04 public source option
→ KnowledgePoint / PatternGroup selection
→ six question modes
→ query-state sanitization and round trip
→ Classic / fallback 404 / Pixel controls
→ WorksheetDocument preview
→ stale-preview and stale-print invalidation
```

Chromium HTML/PDF smoke, production stress and D0 closeout remain outside S74.

## Public authority

```text
Public source units  = 14
KnowledgePoints      = 12
PatternGroups        = 12
PatternSpecs         = 17
Question modes       = 6
Renderer profiles    = 3
Public surfaces      = 3
```

Question modes:

```text
mixed
concept
numeric
application
operation_estimation
reasoning
```

No arbitrary PatternSpec injection and no generic fallback are exposed.

## Public source selector

`g4b_u04_4b04` is now part of the public source-unit inventory as:

```text
unitCode = 4B-U04
label    = 概數
domain   = rounding_approximation
```

This makes the unit available to both the Classic source selector and the Pixel grade/semester registry bridge.

## Classic and fallback surfaces

Classic and fallback 404 share the same browser runtime. S74 mounts a dedicated Traditional Chinese G4B-U04 question-mode control on both surfaces.

The control is visible only when:

```text
sourceId = g4b_u04_4b04
selectionMode != sourceUnit
```

It mirrors the selected mode into the existing browser state pipeline, so the established regeneration, query update, preview invalidation and print disabling behavior remains authoritative.

## Pixel surface

Pixel receives a dedicated G4B-U04 mode selector through a surface adapter. The adapter uses the same canonical browser state field and dispatches the existing worksheet-stale path.

Changing the G4B-U04 question mode therefore:

1. invalidates the previous generated worksheet;
2. invalidates the previous printable output;
3. requires regeneration before print becomes available again.

## Query-state contract

S74 serializes and parses:

```text
sourceId
selectionMode
kp
pg
questionMode
questionCount
ordering
answerKey
generationSeed
columns
rowsPerPage
```

For G4B-U04:

- valid question modes round-trip unchanged;
- unsupported modes normalize to `mixed`;
- cross-unit or invisible KnowledgePoint and PatternGroup IDs are dropped;
- selector warnings remain public-safe;
- G5A-U08-only `depthMode` and `contextMode` are not emitted.

## Config-state isolation

The browser config wrapper now resolves public controls by source:

- G4B-U04 accepts its six question modes;
- G5A-U08 retains question, depth and context modes;
- switching from a G4B-only mode to G5A normalizes the incompatible value to the G5A default;
- unrelated units receive no unit-specific public controls.

## Worksheet and print acceptance

Executable QA covers:

1. 12/12/17 public authority counts;
2. all six public question-mode values;
3. valid query-state parse and write round trip;
4. unsupported mode and cross-unit ID sanitization;
5. Classic canonical worksheet generation;
6. Pixel canonical worksheet generation;
7. all five explicit non-mixed mode routes;
8. answer-page suppression on both Classic and Pixel paths;
9. source-switch control normalization;
10. dynamic control mounting on Classic, fallback and Pixel;
11. stale-print watcher integration;
12. Traditional Chinese messages with internal-ID redaction;
13. existing renderer and worksheet delegation regression;
14. the 14-source public inventory.

## Lifecycle boundary

```text
selector visibility        = visible
query-state QA              = connected
Classic controls            = connected
fallback 404 controls       = connected
Pixel controls              = connected
preview stale protection    = connected
print stale protection      = connected
HTML/PDF smoke              = pending
production stress           = pending
production use              = preview_only_pending_s75
D0 closeout                 = pending
```

## Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_WORKSHEET_ANSWER_KEY_AND_RENDERER_CONNECTED

GOAL_DISTANCE_AFTER =
D1_G4B_U04_PUBLIC_UI_PRINT_AND_QUERY_STATE_QA_CONNECTED

DISTANCE_REDUCED =
Exposed G4B-U04 on all three public surfaces, connected six-mode public state,
query round trip, answer suppression and stale preview/print protection.

REMAINING_BLOCKERS = [
  "G4B-U04 Chromium HTML/PDF smoke not completed",
  "Production stress not completed",
  "D0 closeout not completed"
]

NEXT_SHORTEST_STEP =
S75_G4B_U04_ProductionStressHTMLPDFAndD0Closeout

STOP_REASON =
NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```
