# S90 G5A-U02 Canonical Resolver Integration

## Scope

This milestone adds one hidden canonical resolver over the existing G5A-U02 authority chain:

- 22 S84 hidden PatternSpecs;
- 14 S86 Class C hidden bindings;
- 8 S88 Class D hidden bindings;
- S89 canonical source metadata.

No public selector, worksheet, renderer, HTML/PDF, or production promotion is included.

## Resolver contract

`resolveG5AU02CanonicalRoute(patternSpecId)` resolves exactly one known PatternSpec to:

- implementation class C or D;
- FormalMapping;
- PatternGroup;
- KnowledgePoint;
- answer model;
- canonical hidden binding;
- canonical source metadata.

Unknown IDs, empty IDs, missing bindings, and unresolved evidence are blocking. There is no generic fallback and no free-form AI path.

`generateG5AU02Canonical` dispatches explicitly to the Class C or Class D hidden binding. `validateG5AU02Canonical` recomputes the canonical route and then invokes the corresponding blocking validator.

## Lifecycle

- resolverStatus: `canonical_hidden_integrated`
- selectorStatus: `hidden`
- canonicalRouting: `internal_explicit_only`
- productionUse: `forbidden`
- genericFallback: `forbidden`
- freeFormAI: `forbidden`

## Acceptance gates

- exactly 22 routes;
- exactly 14 Class C and 8 Class D routes;
- exact PatternSpec / FormalMapping / PatternGroup / KnowledgePoint / answer-model parity;
- all routes resolve at least one canonical source;
- all 22 routes generate and validate deterministically;
- route mutation and missing-route cases block;
- hidden lifecycle is deeply frozen.

## Deferred

- public selector exposure;
- worksheet allocation and renderer integration;
- production lifecycle promotion.
