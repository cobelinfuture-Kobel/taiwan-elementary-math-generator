# S96 G5A-U02 Browser Arbitrary Regeneration and KnowledgePoint Selection — Design Scan

## Scope

S96 extends the completed S95 canonical static production release into a browser-side dynamic generation path. It must reuse the existing S90 canonical resolver, S91 worksheet builder, S92 renderer and S93 browser/PDF verification chain. No second generator or fallback path is permitted.

## Current authority

- 22 canonical PatternSpecs are implemented and blocking-validated.
- 18 PatternGroups map to 18 distinct KnowledgePoints.
- 14 PatternSpecs use implementation Class C and 8 use Class D.
- S91 already accepts arbitrary `questionCount`, `baseSeed`, `includeAnswerKey` and a selected `patternSpecIds` subset.
- S95 public UI currently serves only the fixed 22-question canonical artifact.

## Root cause of zero visible KnowledgePoints

The existing website has no public G5A-U02 KnowledgePoint projection. The canonical rows remain hidden and the public source-unit projection exposes only the fixed static worksheet. Therefore the selector correctly reports zero selectable KnowledgePoints.

## S96 execution order

1. Materialize a public outer projection for all 18 canonical KnowledgePoints without mutating hidden S90-S92 lifecycle contracts.
2. Resolve one or more selected KnowledgePoint IDs into a deduplicated canonical PatternSpec list.
3. Add a browser runtime adapter that calls the existing S91 builder with `questionCount`, `generationSeed`, `includeAnswerKey` and selected PatternSpecs.
4. Render the resulting document with the existing S92 renderer.
5. Register the 18 rows in the shared website KnowledgePoint selector and query-state path.
6. Support single-KP and same-unit multi-KP average allocation.
7. Run browser, HTML/PDF, determinism, seed-variation and answer-suppression stress QA.
8. Promote dynamic browser regeneration only after exact fresh-main evidence.

## Milestone completed by this change

This change completes the first executable S96 milestone:

```text
18 KnowledgePoints
→ 18 PatternGroups
→ 22 canonical PatternSpecs
→ public projection contract
→ single/multi-KP PatternSpec resolver
```

It deliberately does not yet connect the projection to the browser selector or dynamic worksheet runtime.

## Lifecycle boundary

```text
projectionStatus          = public_projection_materialized
selectorStatus            = pending_browser_selector_integration
browserRegenerationStatus = pending_runtime_integration
productionUse             = forbidden_until_s96_stress_pass
genericFallback           = false
freeFormAI                 = false
```

## Next shortest step

`S96C_G5A_U02_BrowserDynamicWorksheetRuntimeIntegration`
