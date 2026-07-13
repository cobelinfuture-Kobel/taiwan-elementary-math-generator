# S74 — G4B-U04 Public UI, Print and Query-State QA

```text
TASK = S74_G4B_U04_PublicUIPrintAndQueryStateQA
STATUS = PASS_CI_SYNCED_AND_MERGED
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
Browser-visible source options = 14
Legacy release registry        = 13, unchanged
KnowledgePoints                = 12
PatternGroups                  = 12
PatternSpecs                   = 17
Question modes                 = 6
Renderer profiles              = 3
Public surfaces                = 3
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

## Public source selector and registry isolation

`g4b_u04_4b04` is available on the browser surfaces as:

```text
unitCode = 4B-U04
label    = 概數
domain   = rounding_approximation
```

The source is mounted as a promotion overlay rather than being inserted into the legacy 13-source release registry.

This boundary is deliberate:

- Classic and fallback inject the promoted option through the S74 surface adapter;
- Pixel resolves the promoted option only on the live browser surface;
- `listBatchASourceUnits()`, the S50 Pixel release snapshot and legacy Node-side filter contracts remain unchanged at 13 sources;
- existing release gates therefore do not treat the newly promoted unit as a legacy generic source.

## Classic and fallback surfaces

Classic and fallback 404 share the same browser runtime. S74 mounts a dedicated Traditional Chinese G4B-U04 question-mode control on both surfaces.

The control is visible only when:

```text
sourceId = g4b_u04_4b04
selectionMode != sourceUnit
```

It mirrors the selected mode into the existing browser state pipeline, so the established regeneration, query update, preview invalidation and print disabling behavior remains authoritative.

The adapter also supports a direct query-state entry where the source option is not present in the legacy static list: it injects the promoted source, restores the requested source and mode after main initialization, and leaves unrelated source behavior unchanged.

## Pixel surface

Pixel receives a dedicated G4B-U04 mode selector through a surface adapter. The adapter uses the same canonical browser state field and dispatches the existing worksheet-stale path.

Changing the G4B-U04 question mode therefore:

1. invalidates the previous generated worksheet;
2. invalidates the previous printable output;
3. requires regeneration before print becomes available again.

The Pixel registry bridge keeps its existing 13-source release snapshot but supplies an S74 browser-surface projection for grade 4, lower semester. This prevents the promoted source from contaminating old release inventory assertions while still making it selectable in the live UI.

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
14. 14 browser-visible source options while preserving all 13 legacy release registry entries.

## CI-driven boundary corrections

Three CI rounds identified one architectural boundary in progressively narrower form:

1. adding G4B-U04 directly to `listBatchASourceUnits()` caused legacy source-unit generators and exact 13-source assertions to consume a promotion-only source;
2. adding it directly to `listPixelSourceOptions()` changed the S50 Pixel release snapshot;
3. adding it to the shared Pixel grade/semester filter changed the exact legacy filter contract.

The accepted implementation keeps all legacy registry APIs stable and exposes G4B-U04 only through browser-surface promotion resolution. These were integration-boundary corrections; the S68–S73 generator, validator, resolver, worksheet and renderer behavior was not changed.

## GitHub and CI evidence

```text
Implementation PR          = 115
Implementation merge       = 7be97632d57dd07c7143caca8205f67bea8466bf
Final PR CI run            = 29215153437
Final PR tests/pass/fail   = 1092 / 1092 / 0
Fresh-main CI run          = 29215310754
Fresh-main readback commit = bdf093aa2b61d27b5f9fa96dadf179ce28d45b94
Fresh-main tests/pass/fail = 1092 / 1092 / 0
Working tree               = clean
```

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
Exposed G4B-U04 on all three public browser surfaces, connected six-mode public state,
query round trip, answer suppression and stale preview/print protection while preserving
legacy 13-source release registries.

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
