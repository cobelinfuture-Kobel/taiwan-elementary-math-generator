# GCTX-P01 Readback

## Scope

```text
schema and contract only
no seed content
no runtime
no unit migration
no ScenarioChain / BoundedPBL closure
no renderer implementation
```

## Locked decisions

1. Each approved semantic binding owns exactly one `contextFamilyId` and one `semanticVariantId`.
2. Plural `contextFamilyIds[]` selection is forbidden because it enables implicit runtime Cartesian composition.
3. Semantic slots, event flow, quantity roles, unit flow and question role are explicit and immutable at runtime.
4. Runtime variation is limited to approved `languageVariantIds[]` and `numericProfileIds[]`.
5. Context family replacement, slot mutation, event-flow mutation, question-role mutation and generic fallback are blocking.
6. Semantic and mathematical validator hooks are both required; canonical answer recomputation remains blocking.
7. ScenarioChain, BoundedPBL, dependency graph, required milestones, terminal deliverable and question-count projections remain exclusively deferred to P02.
8. Historical PR #243 is design input only and is not production authority.

## Distance

```text
GOAL_DISTANCE_BEFORE = D3_GCTX_GLOBAL_OWNERSHIP_AND_RULE_VERSIONING_LOCKED
GOAL_DISTANCE_AFTER  = D3_GCTX_APPROVED_SEMANTIC_BINDING_SCHEMA_LOCKED_PENDING_CI
DISTANCE_REDUCED     = loose context-family selection replaced by exact approved semantic binding schema
REMAINING_BLOCKERS   = [CI acceptance, merge, P02 closure schema, source governance, layout contracts, runtime implementation]
NEXT_SHORTEST_STEP   = GCTX-P02_ScenarioChainBoundedPBLAndCompleteProjectionContract
```
