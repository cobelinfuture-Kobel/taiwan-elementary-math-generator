# S96H G5A-U02 Dynamic Production Promotion and Closeout

## Scope

S96H promotes the S96A–S96G browser KnowledgePoint path after the dedicated dynamic Chromium HTML/PDF stress passed.

## Production chain

```text
18 public KnowledgePoints
→ shared Classic / 404 / Pixel selector
→ query-state KP / PatternGroup round-trip
→ canonical PatternSpec resolver
→ generated canonical browser runtime bundle
→ exact-count worksheet builder
→ blocking validator
→ Traditional Chinese A4 renderer
→ browser preview / print / PDF
```

## Production lifecycle

```text
selectorStatus            = public_knowledge_point_selection
browserResolverStatus     = production_integrated
browserRegenerationStatus = production_allowed
browserPipelineStatus     = public_dynamic_canonical_connected
htmlPdfStressStatus       = s96g_passed
productionUse             = allowed_dynamic_knowledge_point_release
genericFallback           = false
freeFormAI                 = false
```

## Verified scope

- 18 KnowledgePoints;
- 18 PatternGroups;
- 22 canonical PatternSpecs;
- single-KP and multi-KP same-unit generation;
- exact custom question count;
- deterministic seed replay and cross-seed variation;
- optional answer-key suppression;
- balanced canonical-only allocation;
- S96G 36-scenario dynamic audit;
- S96G 200-question and 200-answer Chromium A4 HTML/PDF stress;
- DOM overflow, PDF bbox, nonblank-page and CJK gates.

## Safety boundary

The release does not permit arbitrary PatternSpec injection, generic fallback, free-form AI, or non-canonical source content. Static canonical production remains available as the source-unit fallback when no KnowledgePoint is selected.

## Closeout rule

The closeout JSON and PASS marker may be written only after PR final-head CI passes, the PR is merged, and a public math CI readback points exactly to the S96H merge commit with zero failures and a clean working tree.
