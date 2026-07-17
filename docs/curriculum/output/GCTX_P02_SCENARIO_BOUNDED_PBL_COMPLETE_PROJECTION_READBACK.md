# GCTX-P02 Readback

## Scope

```text
schema and contract only
no seed content
no runtime
no unit migration
no source governance implementation
no semantic breadth implementation
no renderer implementation
no G5A-U02 changes
```

## Locked decisions

1. Multi-question assets are classified as `common_scenario_independent`, `scenario_chain_dependent` or `bounded_pbl_closed`; a shared story alone is not PBL.
2. Every approved profile contains exactly two to five questions and is independently approved as a complete projection.
3. Question-count requests select a complete profile and cannot truncate or arbitrarily sample a larger chain.
4. Each subquestion references an approved P01 semantic binding and declares dependencies, consumed quantities, produced quantities and milestone coverage.
5. Each profile owns a closed quantity ledger and an acyclic dependency graph.
6. Every required milestone is covered by a question, visibly supplied stimulus, a deliberate merged question or a visible precomputed value.
7. Silent milestone removal is forbidden.
8. Bounded PBL requires a project goal, at least two required milestones, deterministic decision criteria and a terminal deliverable.
9. Bounded PBL is approved as a whole; runtime cannot assemble it from unrelated questions.
10. `single_page_complete` and explicitly approved `approved_two_page_complete` are the only semantic span declarations. Physical layout remains deferred.
11. Per-question and chain-level canonical answer recomputation remain blocking requirements.
12. P03 owns source governance; P04 owns semantic fingerprint, near-duplicate detection and breadth; GLM-APP owns physical layout.

## CI acceptance

```text
HEAD_SHA             = f9459d836bbd2b3af7e4045bd9742e526c2b4b48
WORKFLOWS_TOTAL      = 19
WORKFLOWS_SUCCESS    = 18
INHERITED_FAILURES   = 1
INHERITED_FAILURE    = S93 G5A-U02 Hidden HTML PDF Smoke
NEW_P02_FAILURES     = 0
BASELINE_PARITY      = ACCEPTED
```

Node Test、Math CI Readback、S42 Branch Test 與其餘非退化 gates 均成功。唯一失敗與 `main` 既有 S93 baseline 相同，且 P02 未修改任何 G5A-U02 檔案。

## Distance

```text
GOAL_DISTANCE_BEFORE = D3_GCTX_APPROVED_SEMANTIC_BINDING_SCHEMA_LOCKED
GOAL_DISTANCE_AFTER  = D2_GCTX_SCENARIO_AND_BOUNDED_PBL_CLOSURE_CONTRACT_LOCKED
DISTANCE_REDUCED     = added complete 2–5 question dependency, ledger, milestone and terminal-outcome ownership
REMAINING_BLOCKERS   = [source governance, semantic breadth, layout contracts, fixtures, validators, resolver, unit audits]
NEXT_SHORTEST_STEP   = GCTX-P03_SourceMiningCommonKnowledgeAndEvidenceGovernance
```
