# S77 — Public Catalog Neutral Naming and Batch Boundary FullFix

```text
TASK = S77_PublicCatalogNeutralNamingAndBatchBoundaryFullFix
STATUS = IMPLEMENTED_PENDING_CI
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

## Distance

```text
GOAL_DISTANCE_BEFORE = D4_BATCH_B_NEXT_SOURCE_LOCKED_PUBLIC_CATALOG_MISLABELED
GOAL_DISTANCE_AFTER  = D4_BATCH_B_NEXT_SOURCE_LOCKED_PUBLIC_CATALOG_NEUTRAL
DISTANCE_REDUCED     = Removed the production-facing Batch A label defect without changing catalog or runtime semantics.
REMAINING_BLOCKERS   = [
  "g5a_u02_5a02a and g5a_u02_5a02a1 PDF source identity and KnowledgePoint extraction"
]
NEXT_SHORTEST_STEP   = S78_G5A_U02_DualPDFManualKnowledgePointExtraction
```
