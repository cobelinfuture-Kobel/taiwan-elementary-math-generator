# GLM-S09 Actual Column Geometry Audit and Renderer FullFix

## Trigger

Human preview evidence showed G5A-U02 reporting `2×6` and `3×5` in metadata while question cards remained one vertical column. The prior GLM checks verified requested/resolved layout metadata, pagination, overflow and overlap, but did not verify actual horizontal card geometry.

## Root cause

G5A-U02 is projected into the global exact-layout worksheet document, including shared `questionPages`. Classic preview nevertheless preferred the legacy `dynamicHtml` branch. That HTML retained its historical single-column structure and bypassed the shared exact-layout renderer.

## FullFix

For any worksheet document satisfying all of the following:

- `layoutResolution.layoutMode === exact_approved_matrix`
- `layoutResolution.layoutExact === true`
- at least one projected `questionPage`

Classic preview must use `renderWorksheetDocumentToHtml`. Legacy dynamic/static HTML is not allowed to override global exact-layout geometry.

## Actual geometry acceptance

For all 15 public units and all 18 approved layouts:

- inspect visible question cards with `getBoundingClientRect()`;
- cluster card left-edge X coordinates with a two-pixel tolerance;
- require `min(requestedColumns, cardsOnPage)` X clusters per question page;
- require the computed renderer grid column count to equal the requested 1, 2 or 3 columns;
- accept both the shared `.worksheet-page__grid` renderer and the G4B-U04 specialized `.g4b-u04-grid` renderer as DOM containers, while applying the same X-coordinate and computed-CSS authority;
- metadata alone is not acceptance evidence.

The full matrix is 270 scenarios split into five shards.

## CI evidence

- Contract regression: PASS.
- Five geometry shards: PASS.
- Actual geometry aggregate: `270 / 270` PASS, `0` failures.
- Full Node regression: `1564 / 1564` PASS, `0` failures.
- Focused G5A-U02 regressions lock `2×6` and `3×5` to the exact-layout renderer instead of legacy single-column dynamic HTML.

## Harness correction history

The first harness revision incorrectly assumed every renderer used `.worksheet-cell--question` and `.worksheet-page__grid`. G4B-U04 intentionally uses `.g4b-u04-cell--question` and `.g4b-u04-grid`; this caused 18 false failures in one shard. The corrected harness observes both renderer DOM contracts but never substitutes metadata for geometry.

## Result

```text
GLM_S09_STATUS = PASS_CI_READY_TO_MERGE
PUBLIC_UNITS = 15
LAYOUTS_PER_UNIT = 18
ACTUAL_GEOMETRY_SCENARIOS = 270
ACTUAL_GEOMETRY_PASS = 270
ACTUAL_GEOMETRY_FAIL = 0
FULL_REGRESSION_TESTS = 1564
FULL_REGRESSION_PASS = 1564
FULL_REGRESSION_FAIL = 0
D0_ELIGIBLE = true
```

## Supersession

GLM-S06, GLM-S07 and the unclosed GLM-S08 evidence remain useful for pagination, answer-key and deployed behavior, but they are not sufficient authority for actual column geometry. GLM-S09 is the controlling geometry authority.
