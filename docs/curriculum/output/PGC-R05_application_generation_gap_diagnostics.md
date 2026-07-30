# PGC-R05 Application Generation Runtime Gap Diagnostics

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R05_ApplicationGenerationFullFix_RuntimeGapDiagnostics
STATUS     = PASS_R05_D0_ALL_LEGAL_APPLICATION_ROUTES_CAPACITY_CONFORMANT_WITH_RETAINED_CROSS_SEED_QUALITY_GAPS
```

## Baseline

```text
APPLICATION_ROUTES             = 301
LEGAL_APPLICATION_ROUTES       = 211
ILLEGAL_APPLICATION_ROUTES     = 90
CONTRACT_VERIFIED_20_ROUTES    = 211
CONTRACT_LIMITED_ROUTES        = 0
CONTRACT_QUALITY_GAP_ROUTES    = 2
LIVE_20_PASS_ROUTES            = 211
LIVE_20_FAIL_ROUTES            = 0
REPAIR_ROUTES                  = 0
```

## Live failures by source

| Source | Live failing routes |
|---|---:|
| none | 0 |

## Scope boundary

- R05 owns legal public `application` routes only.
- R04 numeric routes are read-only protected baseline.
- Reasoning, mixed, and PBL remain owned by R06 or later.
- Existing Global Primary / canonical application authorities and the shared worksheet pipeline remain the only admitted producer-consumer lineage.

## Repair routes by source

| Source | Repair routes |
|---|---:|

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R05_APPLICATION_LIVE_GENERATION_PARTIALLY_CONFORMANT
GOAL_DISTANCE_AFTER  = D0_R05_APPLICATION_GENERATION_CONFORMANT_AND_CONTRACT_RECONCILED
DISTANCE_REDUCED     = 211/211 legal application routes have synchronized live runtime, 20-question capacity, per-worksheet prompt diversity, answer-key and public-surface limit evidence; 2 cross-seed quality gaps remain explicitly nonblocking
REMAINING_BLOCKERS   = [NONE]
NEXT_SHORTEST_STEP   = PGC-R06_ReasoningMixedPBLGenerationConformance
```

