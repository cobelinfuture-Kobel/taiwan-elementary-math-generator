# GCTX-P06 Readback

## Scope

```text
schema and contract only
no blocking-code runtime registry
no validator implementation
no runtime behavior
no unit migration
no renderer implementation
no production population
```

## Seven-stage pipeline

```text
1. ruleset_and_request
2. p02_chain_closure
3. p03_evidence_admission
4. p04_fingerprint_canonicalization
5. p04_pairwise_similarity
6. p04_breadth_gate
7. production_admission
```

Every stage must execute, cannot mutate input and passes only with zero stage blocking errors.

## Blocking-code registry

```text
P02 closure codes      = 12
P03 evidence codes     = 19
P04 fingerprint codes  = 5
P04 pairwise codes     = 5
P04 breadth codes      = 10
P06 internal codes     = 7
---------------------------
Recognized total       = 58
```

Every blocking code has exactly one stage owner. Unknown codes fail closed through `GCTX_VALIDATOR_UNKNOWN_BLOCKING_CODE`.

## Warning registry

```text
PBL_TARGET_CHAIN_BAND_NOT_REACHED
GCTX_EVIDENCE_REVIEW_DUE_SOON
PBL_SURFACE_VARIETY_BELOW_TARGET
PBL_NUMERIC_CAPACITY_BELOW_TARGET
```

All four warnings are nonblocking and cannot alter `valid` or `productionEligible`.

## Deterministic result rules

```text
valid = blockingErrors.length === 0
        AND every stage passed
```

```text
productionEligible = validationMode === production_gate
                     AND valid === true
                     AND all upstream production gates pass
```

Any blocking error or failed stage forces `productionEligible = false`. Authoring and population modes also force it to false.

## Replay rules

The same replay key and input digest must produce:

- identical output digest;
- identical issue ordering;
- identical classifications;
- identical production eligibility.

Issues sort by stage order, code, path and entity ID. Duplicate identity is `stageId|code|path|entityId`.

## P05 acceptance matrix

```text
positive chains = 20
pairwise fixtures = 5
breadth profiles = 10
pairwise scores = [100, 87.25, 59.5, 18, 20.5]
negative breadth profiles = 9
```

The positive profile must pass; every negative profile must fail with declared blocking codes. Numeric capacity cannot replace semantic-chain breadth. Fixture-only records remain production-ineligible.

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_REPRESENTATIVE_FIXTURE_CORPUS_LOCKED
GOAL_DISTANCE_AFTER  = D2_GCTX_VALIDATOR_AND_BLOCKING_CODE_CONTRACT_LOCKED_PENDING_CI
DISTANCE_REDUCED     = P02/P03/P04 governance and P05 fixtures converted into one deterministic seven-stage validation contract
REMAINING_BLOCKERS   = [CI acceptance, merge, PatternSpec eligibility audit, layout contracts, validator implementation, resolvers, population, unit migrations]
NEXT_SHORTEST_STEP   = GCTX-P07_ExistingPatternSpecSemanticEligibilityAudit
```
