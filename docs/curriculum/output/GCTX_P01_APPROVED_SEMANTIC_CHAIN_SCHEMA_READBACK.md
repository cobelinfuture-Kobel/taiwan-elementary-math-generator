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

## CI acceptance

```text
rebased head = 028bfcdfaeaf21229891d42234c20310f4aae1cb
triggered workflows = 19
successful workflows = 18
owned gate failures = 0
```

`S93 G5A-U02 Hidden HTML PDF Smoke` remained the sole failure. The same gate also failed on the current G5A-U02 S103 baseline head `f09d52089723a35c4662d50fae0ed33c8d20521d`. P01 changes exactly six GCTX schema, contract, documentation, marker and test files and changes no G5A-U02 runtime or renderer file. The failure is therefore recorded as inherited non-owned baseline parity and is not repaired in this task.

## Distance

```text
GOAL_DISTANCE_BEFORE = D3_GCTX_GLOBAL_OWNERSHIP_AND_RULE_VERSIONING_LOCKED
GOAL_DISTANCE_AFTER  = D3_GCTX_APPROVED_SEMANTIC_BINDING_SCHEMA_LOCKED
DISTANCE_REDUCED     = loose context-family selection replaced by exact approved semantic binding schema
REMAINING_BLOCKERS   = [P02 closure schema, source governance, semantic breadth, layout contracts, runtime implementation]
NEXT_SHORTEST_STEP   = GCTX-P02_ScenarioChainBoundedPBLAndCompleteProjectionContract
```
