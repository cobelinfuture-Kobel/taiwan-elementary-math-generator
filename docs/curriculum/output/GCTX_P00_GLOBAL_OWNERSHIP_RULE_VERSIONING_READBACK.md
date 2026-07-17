# GCTX-P00 Readback

## Scope

```text
planning contract only
no runtime
no registry seed
no unit migration
no renderer implementation
no S101–S104 file changes
```

## Locked decisions

1. Six authority layers are separated: source/evidence, shared context, unit semantic binding, ScenarioChain/BoundedPBL, layout and runtime selection.
2. Runtime randomness selects only approved bindings and complete projections.
3. Numeric variation and surface-language variation do not count as new PBL chains.
4. Four-question PBL chains cannot be truncated to two questions.
5. Numeric layout remains `3×1–5`, `2×1–6`, `1×1–7`.
6. Application pages use atomic semantic-block packing with at least five scoring items and final-page rebalance.
7. Question sheets contain number, prompt, required visuals and unlabeled writing space only.
8. Answer keys contain the full prompt and visually distinct answer without writing space.
9. Missing external PBL and teacher-answer-key samples are handled by executable positive/negative fixtures, HTML/PDF acceptance and existing-unit pilots.
10. Ruleset changes require versioning, impact analysis, affected-unit matrix, migration notes and impacted regression.

## Distance

```text
GOAL_DISTANCE_BEFORE = D4_GCTX_REQUIREMENTS_AND_CORPUS_DISCUSSION
GOAL_DISTANCE_AFTER  = D3_GCTX_GLOBAL_OWNERSHIP_AND_RULE_VERSIONING_LOCKED_PENDING_CI
DISTANCE_REDUCED     = discussion converted into one versioned governance authority
REMAINING_BLOCKERS   = [CI acceptance, merge]
NEXT_SHORTEST_STEP   = GCTX-P01_ApprovedSemanticChainSchema
```
