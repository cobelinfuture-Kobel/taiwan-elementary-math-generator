# S96D G5A-U02 Arbitrary Regeneration

## Scope

S96D connects the S96C browser KnowledgePoint resolver to the canonical G5A-U02 generator, validator, worksheet builder and renderer.

The public site deploys only `site/`, so the runtime is generated from the canonical `src/curriculum/g5a-u02/browser-dynamic-entry.js` with esbuild. The generated bundle is committed at:

```text
site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js
```

The bundle is generated, not independently authored. This prevents a second browser-only generator from drifting away from the canonical source runtime.

## Runtime chain

```text
public KnowledgePoint IDs
→ S96C browser resolver
→ canonical PatternSpec IDs
→ S96D generated browser runtime bundle
→ S91 exact-count worksheet builder
→ canonical blocking validator
→ S92 deterministic Traditional Chinese A4 renderer
→ preview iframe / browser print
```

## Supported controls

```text
questionCount
knowledgePointIds
patternSpecIds (resolved internally)
generationSeed
includeAnswerKey
rowsPerPage
```

## Guarantees

- exact question count;
- only resolved canonical PatternSpecs are allocated;
- same seed gives the same output;
- different seeds vary generated questions;
- answer-key suppression removes answer records, pages and HTML section;
- blocking validation remains active;
- no generic fallback;
- no free-form AI;
- source-unit static production release remains available when no KP selection exists.

## Lifecycle

```text
selectorStatus              = pending_s96e
browserResolverStatus       = integrated
browserRegenerationStatus   = implemented_pending_selector
browserPipelineStatus       = dynamic_canonical_connected
productionUse               = forbidden_until_s96g_stress_pass
genericFallback             = false
freeFormAI                   = false
```

## Explicit boundary

S96D does not expose selector rows or URL query-state. Those are S96E and S96F. Dynamic HTML/PDF stress and production promotion remain S96G and S96H.
