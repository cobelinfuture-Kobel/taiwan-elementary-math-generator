# GLM-S09 Actual Column Geometry Audit and Renderer FullFix

## Trigger

Human preview evidence showed G5A-U02 reporting `2×6` and `3×5` in metadata while question cards remained one vertical column. The prior GLM checks verified requested/resolved layout metadata, pagination, overflow and overlap, but did not verify actual horizontal card geometry.

## Root cause

G5A-U02 is projected into the global exact-layout worksheet document, including shared `questionPages`. Classic preview nevertheless preferred the legacy `dynamicHtml` branch. That HTML retained its historical single-column structure and bypassed the shared `.worksheet-grid` renderer.

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
- require computed `.worksheet-grid` column count to equal the requested 1, 2 or 3 columns;
- metadata alone is not acceptance evidence.

The full matrix is 270 scenarios split into five shards. D0 remains unavailable until all 270 actual geometry scenarios pass.

## Supersession

GLM-S06, GLM-S07 and the unclosed GLM-S08 evidence remain useful for pagination, answer-key and deployed behavior, but they are not sufficient authority for actual column geometry. GLM-S09 is the controlling geometry authority.
