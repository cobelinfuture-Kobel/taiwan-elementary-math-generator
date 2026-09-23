# PGC-R05 Capacity Contract Reconciliation and D0 Closeout

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R05_CapacityContractReconciliationAndD0Closeout
STATUS     = PASS_R05_D0_CAPACITY_CONTRACT_RECONCILED_AND_ALL_LIVE_APPLICATION_ROUTES_CONFORMANT_WITH_RETAINED_CROSS_SEED_QUALITY_GAPS
```

## Application authority

```text
LEGAL_APPLICATION_ROUTES       = 211
VERIFIED_20_APPLICATION_ROUTES = 211
LIMITED_APPLICATION_ROUTES     = 0
ZERO_CAPACITY_APPLICATION      = 0
DIVERSITY_GAP_APPLICATION      = 2
RECONCILED_ROUTE_COUNT         = 211
UPDATED_BINDING_COUNT          = 135
```

## Frozen boundary

- Non-application route hash preserved: true
- Illegal application route hash preserved: true
- Unrelated binding hash preserved: true
- No generator, validator, renderer, Global Context, PatternSpec, PatternGroup or KnowledgePoint authority was replaced.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R05_211_OF_211_LIVE_APPLICATION_ROUTES_CONFORMANT_PENDING_CONTRACT_RECONCILIATION
GOAL_DISTANCE_AFTER  = D0_R05_APPLICATION_GENERATION_CONFORMANT_AND_CONTRACT_RECONCILED
DISTANCE_REDUCED     = 211/211 legal application routes now have synchronized live runtime, capacity contract, quality status, public-surface limits and deterministic readback evidence
REMAINING_BLOCKERS   = [NONE]
NEXT_SHORTEST_STEP   = PGC-R06_ReasoningMixedPBLGenerationConformance
```

