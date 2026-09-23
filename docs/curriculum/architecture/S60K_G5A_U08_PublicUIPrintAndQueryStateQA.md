# S60K — G5A-U08 Public UI, Print and Query-State QA

```text
TASK = S60K_G5A_U08_PublicUIPrintAndQueryStateQA
STATUS = PASS_CI_SYNCED_AND_MERGED
```

## Public surfaces

```text
Classic
404 fallback
Pixel
```

All three surfaces use the S60I resolver-derived canonical route and S60J WorksheetDocument/renderer path.

## Public controls

```text
questionMode = mixed | numeric | application | reasoning
depthMode = mixed | N | N_PLUS_1
contextMode = mixed | daily_life | sdg
```

Controls are hidden for unrelated units and source-unit fallback mode. N+2 and formal-equation modes are absent from every public surface.

## Query-state and print lifecycle

Classic/404 preserve source, KP, PatternGroup, question mode, depth, context, count, ordering, answer-key, seed and layout. Only visible same-unit IDs survive. Invalid controls revert to approved defaults.

Any relevant control change marks the old preview and print output stale. Pixel includes the three G5A controls in both generation-state and print-stale watchers.

## Public-message policy

Public validation remains Traditional Chinese. Internal KP/group/spec/template/context/source identifiers are redacted. Unknown codes use generic Traditional Chinese guidance.

## QA and merge evidence

```text
implementation PR = #82
implementation merge commit = 32c0129e8d0fa3d24fdc2fc28b3230e911347535
main CI run = 29181053895
main tests = 970
main pass = 970
main fail = 0
main working tree = clean
```

The first PR run found one missing pre-existing Pixel Beta limitation sentence. The limitation remained valid and was restored; no test standard was weakened. The second PR run passed Node, S42, Math CI, G4B HTML/PDF smoke and the 14-page containment regression.

Validated behavior:

- 11 visible KPs, 17 groups and 30 PatternSpecs;
- Classic, fallback404 and Pixel control presence;
- URL round trip and stale/cross-unit ID sanitization;
- Classic and Pixel N+1 SDG generation;
- answer-key suppression;
- stale-preview and stale-print invalidation;
- Traditional Chinese messages and ID redaction;
- no N+2 or formal equation exposure.

## Lifecycle boundary

```text
productionUse = preview_only_pending_s60l
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U08_WORKSHEET_ANSWER_KEY_RENDERER_INTEGRATED_PUBLIC_UI_QA_PENDING
GOAL_DISTANCE_AFTER  = D1_G5A_U08_PUBLIC_UI_PRINT_QUERY_STATE_ACCEPTED_PRODUCTION_CLOSEOUT_PENDING
DISTANCE_REDUCED     = Connected and accepted public question type, N/N+1 depth and daily-life/SDG controls across Classic, fallback and Pixel with URL state and stale-print protection.
REMAINING_BLOCKERS   = [
  "S60L production stress, HTML/PDF smoke and D0 closeout"
]
NEXT_SHORTEST_STEP = S60L_G5A_U08_ProductionStressHTMLPDFAndD0Closeout
```
