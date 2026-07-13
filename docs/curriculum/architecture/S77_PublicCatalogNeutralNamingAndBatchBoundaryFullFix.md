# S77 — Public Catalog Neutral Naming and Batch Boundary FullFix

```text
TASK = S77_PublicCatalogNeutralNamingAndBatchBoundaryFullFix
STATUS = PASS_CI_SYNCED_AND_MERGED
MODE = IMPLEMENTATION
```

## Scope

S77 removes learner-facing `Batch A` terminology from the Classic, fallback 404 and Pixel public surfaces after the Batch B G4B-U04 source entered the same catalog.

The public product is one curriculum catalog. Batch A and Batch B remain internal source-assignment and release waves.

## Public changes

- document and hero titles become `台灣小學數學練習題產生器`;
- Classic/fallback eyebrow becomes `Taiwan Elementary Math Worksheet`;
- the unit section becomes `單元選擇`;
- worksheet-control accessibility labels become neutral;
- initial unit help and preview text become neutral;
- Pixel no longer says that it uses only Batch A units.

## Compatibility boundary

The following remain unchanged:

- `batch-a-*` DOM ids;
- `batchA*` form names and query-state keys;
- module paths and exported API names;
- source registry and selector projection;
- generation seed defaults;
- generator, validator, worksheet and renderer behavior;
- Classic/Pixel routing and saved deep links.

This is a visible-label and accessibility FullFix, not an internal naming migration.

## Acceptance

1. No visible text node on Classic, fallback 404 or Pixel contains `Batch A`.
2. Neutral title, unit heading and preview text are present.
3. Existing compatibility ids and module entry points remain present.
4. No source, query-state, generator, validator or output behavior changes.
5. Existing full test and HTML/PDF smoke suites pass.

## CI and merge evidence

```text
implementation PR        = #122
implementation merge     = 61ce256982e798d3ca4b91ee0271bf43ae3f6e59
final PR Math CI run     = 29222094269
fresh-main Math CI run   = 29222310972
fresh-main readback      = 7a798893d433cd394760b64a0ed8d225f511b623
tests                    = 1110
pass                     = 1110
fail                     = 0
working tree             = clean
```

The first PR attempt correctly failed one stale legacy assertion that still expected the old public title. The correction changed only test expectations; runtime behavior was already correct. The final PR and all Node, S42, G4B-U01, G5A-U08 and G4B-U04 HTML/PDF smoke workflows passed.

## Distance

```text
GOAL_DISTANCE_BEFORE = D4_BATCH_B_NEXT_SOURCE_LOCKED_PUBLIC_CATALOG_MISLABELED
GOAL_DISTANCE_AFTER  = D4_BATCH_B_NEXT_SOURCE_LOCKED_PUBLIC_CATALOG_NEUTRAL
DISTANCE_REDUCED     = Removed the production-facing Batch A label defect without changing catalog or runtime semantics.
REMAINING_BLOCKERS   = [
  "g5a_u02_5a02a and g5a_u02_5a02a1 PDF source identity and KnowledgePoint extraction"
]
NEXT_SHORTEST_STEP   = S78_G5A_U02_DualPDFManualKnowledgePointExtraction
STOP_REASON          = NONE
```
