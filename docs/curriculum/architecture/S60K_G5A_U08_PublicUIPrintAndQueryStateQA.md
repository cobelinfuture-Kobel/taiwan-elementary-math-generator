# S60K — G5A-U08 Public UI, Print and Query-State QA

```text
TASK = S60K_G5A_U08_PublicUIPrintAndQueryStateQA
STATUS = IMPLEMENTED_PENDING_CI
```

## Public surfaces

```text
Classic
404 fallback
Pixel
```

All three surfaces use the S60I resolver-derived canonical route and the S60J WorksheetDocument/renderer path.

## Public controls

G5A-U08 knowledge-point mode exposes:

```text
questionMode = mixed | numeric | application | reasoning
depthMode = mixed | N | N_PLUS_1
contextMode = mixed | daily_life | sdg
```

The controls are not shown for other source units or source-unit fallback mode. N+2 and formal-equation modes are absent from every public surface.

## Query-state contract

Classic and 404 preserve:

```text
sourceId
selectionMode
kp
pg
questionMode
depthMode
contextMode
questionCount
ordering
answerKey
generationSeed
columns
rowsPerPage
```

Only visible G5A-U08 KnowledgePoint and PatternGroup IDs survive parsing. Stale, hidden, cross-unit and invalid IDs are dropped. Unsupported control values revert to approved defaults.

## UI and print lifecycle

Any source, KnowledgePoint, PatternGroup, question mode, depth, context, question count, ordering, seed, answer-key or layout change marks the previous preview stale and disables printing until regeneration.

Pixel adds the three G5A controls to both generation-state and print-stale watchers. Classic and Pixel therefore cannot print an old worksheet after a control change.

## Public-message policy

Public validation output is Traditional Chinese. Internal KnowledgePoint, PatternGroup, PatternSpec, TemplateFamily, ContextVariant and source identifiers are redacted. Unknown codes fall back to generic Traditional Chinese guidance rather than exposing raw codes.

## QA

- 11 visible KnowledgePoints, 17 groups and 30 PatternSpecs;
- Classic, fallback404 and Pixel control presence;
- URL round trip for KP/group/mode/depth/context;
- stale and cross-unit ID sanitization;
- invalid N+2/equation-like values reset to defaults;
- Classic and Pixel N+1 SDG worksheet generation;
- shared S60J long-text renderer path;
- answer-key suppression on both UI versions;
- stale-preview and stale-print invalidation;
- Traditional Chinese public messages and internal-ID redaction;
- unrelated source-unit state remains unchanged.

## Lifecycle boundary

```text
productionUse = preview_only_pending_s60l
```

S60K proves the public controls and print path but does not grant final production release. Production stress, generated HTML/PDF smoke and D0 closeout remain S60L.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U08_WORKSHEET_ANSWER_KEY_RENDERER_INTEGRATED_PUBLIC_UI_QA_PENDING
GOAL_DISTANCE_AFTER  = D1_G5A_U08_PUBLIC_UI_PRINT_QUERY_STATE_INTEGRATED_PENDING_CI
DISTANCE_REDUCED     = Connected question type, N/N+1 depth and daily-life/SDG context controls across Classic, fallback and Pixel, including URL state and stale-print protection.
REMAINING_BLOCKERS   = [
  "S60K PR CI and merge",
  "S60L production stress, HTML/PDF smoke and D0 closeout"
]
NEXT_SHORTEST_STEP = S60L_G5A_U08_ProductionStressHTMLPDFAndD0Closeout
```
