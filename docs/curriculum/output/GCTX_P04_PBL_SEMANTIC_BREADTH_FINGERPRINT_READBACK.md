# GCTX-P04 Readback

## Scope

```text
schema and contract only
no archetype seed
no semantic-family seed
no PBL chain seed
no fingerprint population
no runtime
no unit migration
no validator implementation
no renderer implementation
```

## Locked decisions

1. One million numeric variants of one project structure still count as one semantic chain.
2. PBL identity uses exactly eight dimensions: archetype, goal, milestones, event flow, quantity dependency graph, decision model, mathematical composition and terminal deliverable.
3. Numbers, numeric profiles, seeds, actor/place/object names, language variants, wording, cosmetic nouns, domain labels and source URLs are excluded from semantic identity.
4. Canonical fingerprints preserve ordered milestones and event flow, canonicalize dependency graphs, sort unordered tags and exclude raw wording and numeric values.
5. Weighted similarity totals 100 and records all eight component scores.
6. Exact semantic duplicates score 100 and are blocking.
7. Near duplicates score 80 to below 100, are blocking and cannot receive a waiver.
8. Same-family distinct chains score 50 to below 80 and require at least two material identity changes.
9. A new semantic family requires material changes in at least two family-defining dimensions.
10. Changing the archetype label alone is insufficient; a distinct archetype requires another material identity change.
11. Every candidate is compared with every approved chain in the unit and the global same-family index.
12. Surface variants and numeric capacity are tracked separately and never count toward approved-chain breadth.
13. A production unit requires at least 4 archetypes, 12 semantic families, 20 approved chains, 3 context domains, 4 event-flow signatures and 3 decision models.
14. The target range is 30 to 40 approved chains; the 20-chain minimum is blocking, while the target band is not independently blocking.
15. Near-duplicate rate must not exceed 20%, and all approved fingerprints must be unique.
16. Domain coverage and chain breadth are separate; the same chain recontextualized across domains counts once.
17. Every fingerprint references approved P02 complete projections and approved P03 evidence.
18. P05 owns representative positive and negative fixtures; P06 owns executable validator contracts.

## CI acceptance

```text
ACCEPTED_HEAD_SHA      = 3a42b5c209981696a1a1040f0a186cf198d62678
WORKFLOWS_TOTAL        = 19
WORKFLOWS_SUCCESS      = 18
INHERITED_FAILURES     = 1
INHERITED_FAILURE      = S93 G5A-U02 Hidden HTML PDF Smoke
NEW_P04_FAILURES       = 0
NODE_TEST_RUN          = 2326
MATH_CI_READBACK_RUN   = 1996
PRODUCTION_STRESS_RUN  = 331
BASELINE_PARITY        = ACCEPTED
```

Node Test、Math CI Readback、S95 Production Stress、S42 Branch Test 與其餘非退化 gates 均成功。唯一失敗與 `main` 既有 S93 baseline 相同；P04 未修改任何 G5A-U02 檔案。

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_SOURCE_EVIDENCE_GOVERNANCE_LOCKED
GOAL_DISTANCE_AFTER  = D2_GCTX_PBL_SEMANTIC_BREADTH_AND_DEDUP_CONTRACT_LOCKED
DISTANCE_REDUCED     = genuine PBL semantic-chain breadth separated from surface and numeric capacity with blocking duplicate gates
REMAINING_BLOCKERS   = [representative fixtures, layout contracts, validators, resolver, population, unit audits]
NEXT_SHORTEST_STEP   = GCTX-P05_RepresentativePositiveNegativeFixtureCorpus
```
