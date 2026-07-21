# Global Context Ontology Facet Fusion V1

```text
CONTRACT_ID = GLOBAL_CONTEXT_ONTOLOGY_FACET_FUSION_V1
PROGRAM_ID = POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1
TASK_ID = POSTG-APP-M01_GlobalContextOntologyFacetFusionPopulationAndLegacyMapping
STATUS = BOOTSTRAP_POPULATION_AND_SHADOW_RESOLVER_PENDING_CI
PRODUCTION_ADMISSION_CHANGE = false
```

## 1. Purpose

This milestone turns the hierarchy-only global-context contract into a connectable authority package.

The canonical model is:

```text
Macro Context Domain
→ Meso Situation Family
→ Micro Event Scenario
→ Atomic Task Episode
+ SDG Goal
+ Temporal Lens
+ Geography Lens
+ Theme Facets
+ Data Freshness
→ Surface Realization
→ Numeric Instance
```

The hierarchy describes the event. Facets describe cross-cutting viewpoints. Neither owns mathematics.

## 2. Priority override

This task is intentionally executed before the master controller:

```text
POSTG-APP-M01
→ produces connectable context authority
→ POSTG-APP-M00 consumes that authority
```

The numeric order is retained for program naming, but dependency order is authoritative.

## 3. Why facets are required

`ANCIENT`, `HISTORICAL`, `CURRENT_AFFAIRS`, and `SDG_01..SDG_17` are not one flat list of macro domains.

Examples:

```text
commerce_budget + ANCIENT
→ ancient market exchange

culture_history + HISTORICAL
→ historic architecture measurement

water_energy + CURRENT_AFFAIRS + SDG_06
→ source-controlled water education snapshot

transport_mobility + CURRENT_AFFAIRS + SDG_11
→ source-controlled public transit snapshot
```

A facet combination does not automatically create a new ontology node. It becomes usable only through an admitted Atomic Task Episode and Context Binding.

## 4. Canonical registries

Extraction order:

```text
global-context-authority-index.json
→ global-context-hierarchy-ontology.json
→ global-context-facet-registry.json
→ global-context-fusion-population-index.json
→ population shards
→ global-context-legacy-mapping.json
→ global-context-current-affairs-source-registry.json
→ application context bindings
```

## 5. Bootstrap population

M01 establishes a deterministic non-production population:

```text
Macro domains       = 16
Meso situations     = 48
Micro scenarios     = 48
Atomic episodes     = 96
Facet definitions   = 48
Legacy families     = 18 explicitly mapped
Production admitted = 0
```

The 96 Atomic Task Episodes are materialized deterministically from 48 situation seeds and two episode profiles:

```text
DIRECT_QUANTITY
CONSTRAINT_DECISION
```

This is a reusable bootstrap, not the final context universe.

## 6. Facet axes

```text
SDG_GOAL
TEMPORAL_LENS
GEOGRAPHY_LENS
THEME
DATA_FRESHNESS
```

Temporal lenses:

```text
ANCIENT
HISTORICAL
MODERN
CONTEMPORARY
CURRENT_AFFAIRS
FUTURE
```

Current-affairs use requires a source snapshot and validity policy. General application items use fictional practice numbers unless a separate data-interpretation contract admits real data.

## 7. Legacy mapping

All 18 GS02 families must resolve through:

```text
legacyContextFamilyId
→ macroContextId
→ mesoSituationId
→ microScenarioId
→ atomicEpisodeIds
→ surfaceTemplateIds
→ facetRefs
```

Automatic hierarchy inference is forbidden. Legacy templates remain surface realizations and do not become ontology nodes.

## 8. Resolver contract

The read-only resolver must:

1. load every population shard;
2. materialize deterministic hierarchy nodes;
3. validate parent-child closure;
4. validate facet references;
5. validate exact coverage of all 18 legacy families;
6. resolve a legacy family to a complete hierarchy chain;
7. query Atomic Task Episodes by macro, SDG, time, geography, or theme;
8. return no production-admitted node in M01.

The resolver does not generate questions and does not change production runtime.

## 9. Current-affairs safety

```text
news-only authority = forbidden
social-only authority = forbidden
real-time statistics copied into general items = forbidden
fictional exercise data default = true
validity window required = true
expired fallback = allowlisted evergreen fictionalization only
```

## 10. Non-expansion rules

The following do not create new context identity:

```text
changed number
changed person name
changed color
noun-only substitution
surface wording only
random seed
```

A new node requires a new event mechanism, actor relationship, constraint model, target role, interpretive act, or decision model.

## 11. M01 scope boundary

Allowed:

```text
facet registries
bootstrap hierarchy population
legacy 18-family mapping
current-affairs source authority import
read-only resolver and validator
CI fixtures
authority-index integration
```

Forbidden:

```text
question generation
PatternSpec production admission
application binding production admission
renderer changes
public UI changes
POSTG-APP unit expansion
automatic Cartesian facet generation
```

## 12. Acceptance

```text
16 macro domains materialize
48 meso situations materialize
48 micro scenarios materialize
96 atomic episodes materialize
48 facets resolve
18/18 legacy families map exactly once
ancient, historical, current-affairs, and SDG queries return candidates
all parent and facet references resolve
production-admitted context count remains 0
POSTG-APP-M00 can consume one canonical resolver output
```
