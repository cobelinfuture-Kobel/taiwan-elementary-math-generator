# GCTX-P05 Readback

## Scope

```text
synthetic test fixtures only
no production PBL chain
no real-world claim
no runtime selection
no unit migration
no validator implementation
no renderer implementation
```

## Materialized corpus

```text
positive chain fixtures   = 20
pairwise fixtures         = 5
breadth profile fixtures  = 10
positive breadth profiles = 1
negative breadth profiles = 9
```

## Positive breadth metrics

```text
PBL_ARCHETYPE_COUNT          = 5
PBL_SEMANTIC_FAMILY_COUNT    = 16
PBL_APPROVED_CHAIN_COUNT     = 20
SURFACE_VARIANT_COUNT        = 450
NUMERIC_INSTANCE_CAPACITY    = 41000
CONTEXT_DOMAIN_COUNT         = 5
EVENT_FLOW_SIGNATURE_COUNT   = 20
DECISION_MODEL_COUNT         = 20
TOTAL_PROPOSED_CHAIN_COUNT   = 22
NEAR_DUPLICATE_CANDIDATES    = 2
REJECTED_DUPLICATES          = 2
NEAR_DUPLICATE_RATE          = 0.090909
UNIQUE_APPROVED_FINGERPRINTS = true
```

All twenty positive chain fixtures have unique canonical eight-dimensional identity keys.

## Pairwise expectations

```text
exact surface reskin       = 100    exact_semantic_duplicate   blocking
near duplicate             = 87.25  near_duplicate             blocking
same-family distinct chain = 59.5   same_family_distinct_chain pass
semantic-family distinct   = 18     distinct_family            pass
archetype distinct         = 20.5   distinct_archetype         pass
```

The exact-reskin fixture changes actor, place, object, language, numeric profile and seed while preserving the same canonical identity.

## Breadth blocking coverage

Negative profiles cover:

- insufficient archetype breadth;
- insufficient semantic-family breadth;
- insufficient approved-chain breadth;
- insufficient context-domain coverage;
- insufficient event-flow breadth;
- insufficient decision-model breadth;
- excessive near-duplicate rate;
- approved fingerprint collision;
- numeric capacity used as an invalid substitute for a missing semantic chain.

The numeric-substitution fixture uses:

```text
approved chain count      = 19
numeric instance capacity = 1,000,000
```

It remains production-ineligible.

## Safety boundary

Every fixture declares:

```text
fixtureOnly = true
productionAdmissible = false
runtimeSelectable = false
```

Synthetic P02 projection IDs and P03 evidence IDs exist only to exercise traceability fields. They are not production records.

## CI acceptance

```text
ACCEPTED_HEAD_SHA      = 43fa7dd0ae37595cfdfe4b6eaae4d5263ed67a0c
WORKFLOWS_TOTAL        = 19
WORKFLOWS_SUCCESS      = 18
INHERITED_FAILURES     = 1
INHERITED_FAILURE      = S93 G5A-U02 Hidden HTML PDF Smoke
NEW_P05_FAILURES       = 0
NODE_TEST_RUN          = 2331
MATH_CI_READBACK_RUN   = 2001
PRODUCTION_STRESS_RUN  = 335
BASELINE_PARITY        = ACCEPTED
```

Node Test、Math CI Readback、S95 Production Stress、S42 Branch Test 與其餘非退化 gates 均成功。唯一失敗與 `main` 既有 S93 baseline 相同；P05 未修改任何 G5A-U02 檔案。

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_PBL_SEMANTIC_BREADTH_AND_DEDUP_CONTRACT_LOCKED
GOAL_DISTANCE_AFTER  = D2_GCTX_REPRESENTATIVE_FIXTURE_CORPUS_LOCKED
DISTANCE_REDUCED     = replayable positive and negative evidence materialized for semantic identity, duplicate classification and breadth gates
REMAINING_BLOCKERS   = [validator contracts, layout contracts, resolver, production population, unit audits]
NEXT_SHORTEST_STEP   = GCTX-P06_ValidatorAndBlockingCodeContract
```
