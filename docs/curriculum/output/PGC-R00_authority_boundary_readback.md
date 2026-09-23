# PGC-R00 Public Generation Scope and Authority Freeze

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R00_PublicGenerationScopeAndAuthorityFreeze
STATUS     = FROZEN_PENDING_CI_AND_MERGE
BASELINE   = main@9b6da19193c784cba146369c2e1159756b754b5a
```

## Scope decision

The audit unit is every generation route that a public user can reach, not an individual W3 slice or one reviewed PDF artifact.

The frozen scope includes:

- Classic: `site/index.html`;
- public 404 fallback: `site/404.html`;
- Pixel beta: `site/pixel/index.html`;
- source-unit, single-KP and same-unit mixed-KP selection;
- source-specific public controls;
- current source/KP/PatternGroup/PatternSpec projection;
- shared question router, generator, validator and worksheet assembly;
- global-primary application route and admitted PBL route;
- HTML preview, iframe print and browser PDF;
- Chromium PDF acceptance as internal evidence;
- compatibility aliases and historical selector snapshots that remain in the repository.

## Current public authority

```text
PUBLIC_SOURCE_AUTHORITY = CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS
PUBLIC_SOURCE_COUNT     = 26
PUBLIC_SELECTOR         = batch-a-selector-p03f13-extension.js
PUBLIC_GENERATION_ENTRY = buildWorksheetDocumentFromState
PUBLIC_PRINT_ROUTE      = iframe window.print / browser PDF
W3_PRODUCT_ADMISSIONS   = 16
```

The browser consumes the P03F13 selector successor. The P01E selector snapshot remains available to non-browser historical inventory tests and is therefore classified `INTERNAL_ONLY`, not counted as a second public product authority.

`FULL_PRODUCT_PUBLIC_SOURCE_UNITS` remains a historical P01E alias while `CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS` is the current browser authority. The alias is classified `DUPLICATE_AUTHORITY` so R01 does not double-count its rows.

## Surface classification

| Surface | Route ID | Classification | Decision |
|---|---|---|---|
| Classic | `surface.classic.index` | `PUBLIC_ACTIVE` | Canonical public entry |
| 404 fallback | `surface.classic.404_fallback` | `PUBLIC_DEPRECATED` | Publicly reachable compatibility surface; must be tested but is not canonical |
| Pixel | `surface.pixel.beta` | `PUBLIC_ACTIVE` | Public beta using shared product data and pipeline |
| Cross-unit KP mode | `selector.mixed_knowledge_points_cross_unit` | `HIDDEN_CANDIDATE` | Disabled and excluded from public capability claims |
| Slice014 | `queue.w3.slice014` | `HIDDEN_CANDIDATE` | Explicitly unstarted and frozen through R09 |

## Authority lineage

```text
CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS
→ batch-a-selector-p03f13-extension.js
→ full-product-public-control-profiles.js
→ buildWorksheetDocumentFromState
→ current question router / generator / validator extension chain
→ WorksheetDocument
→ renderPreviewFrame
→ printPreviewFrame
→ browser PDF
```

Application mode additionally passes through:

```text
r07-authoritative-consumer-cutover.js
→ GLOBAL_PRIMARY authority
```

PBL mode additionally passes through:

```text
fifteen-unit-public-pbl-worksheet.js
```

These are controlled branches of the same public worksheet product path, not independent worksheet pipelines.

## R00 acceptance

```text
UNIQUE_ROUTE_IDS                         = PASS
HIDDEN_KP_EXCLUDED_FROM_PRODUCT_CLAIMS  = PASS
CURRENT_PUBLIC_SOURCE_COUNT             = 26
SLICE014_STARTED                        = false
NEW_PATTERN_TYPE_ADDED                  = false
GENERATOR_MODIFIED                      = false
VALIDATOR_MODIFIED                      = false
SECOND_RUNTIME_PIPELINE_ADDED           = false
```

## Artifacts

```text
data/curriculum/public-generation/public_generation_scope.json
data/curriculum/public-generation/public_route_registry.csv
docs/curriculum/output/PGC-R00_authority_boundary_readback.md
tests/curriculum/pgc-r00-public-generation-scope.test.js
.github/workflows/pgc-r00-public-generation-scope.yml
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D1_PUBLIC_SCOPE_NOT_FROZEN
GOAL_DISTANCE_AFTER  = D1_PUBLIC_SCOPE_FROZEN_PENDING_CI_AND_MERGE
DISTANCE_REDUCED     = public route and authority ambiguity removed; 26-source product boundary is machine-readable
REMAINING_BLOCKERS   = [R00_CI_AND_MERGE, R01_CAPABILITY_MATRIX_NOT_MATERIALIZED]
NEXT_SHORTEST_STEP   = PGC-R01_PublicKnowledgePointCapabilityMatrix
```

## Anti-scope-creep readback

No new KnowledgePoint, PatternGroup, PatternSpec, generator, validator, context family, UI option or renderer behavior is introduced. W3 Slice014 remains unstarted.
