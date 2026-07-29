# PGC-R05 Application Generation Runtime Gap Diagnostics

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R05_ApplicationGenerationFullFix_RuntimeGapDiagnostics
STATUS     = PASS_R05_APPLICATION_GAP_BASELINE_CI_VERIFIED_READY_TO_MERGE
```

## Baseline

```text
APPLICATION_ROUTES             = 301
LEGAL_APPLICATION_ROUTES       = 211
ILLEGAL_APPLICATION_ROUTES     = 90
CONTRACT_VERIFIED_20_ROUTES    = 128
CONTRACT_LIMITED_ROUTES        = 83
CONTRACT_QUALITY_GAP_ROUTES    = 21
LIVE_20_PASS_ROUTES            = 166
LIVE_20_FAIL_ROUTES            = 45
REPAIR_ROUTES                  = 85
```

The repair set is the union of contract and live-runtime evidence:

```text
LIVE_RUNTIME_FAILURE_ROUTES = 45
CONTRACT_ONLY_REPAIR_ROUTES = 40
CONTRACT_AND_LIVE_OVERLAP   = 44
LIVE_ONLY_REPAIR_ROUTES     = 1
```

Primary live failure classes:

```text
DUPLICATE_PROMPT          = 39 routes
BUILD_NOT_OK              = 6 routes
QUESTION_COUNT_MISMATCH   = 6 routes
ANSWER_COUNT_MISMATCH     = 6 routes
RUNTIME_ERRORS_PRESENT    = 6 routes
EMPTY_PROMPT              = 4 routes
```

The six build failures are bounded existing application authorities, not missing second pipelines:

```text
g3a_u08_3a08 = p03f2_unique_prompt_sampling_exhausted
g4b_u06_4b06 = p03f11_question_count_exceeds_unique_witnesses
g5a_u04_5a04 = p03f13_quotient_question_count_invalid
```

## Scope boundary

- R05 owns legal public `application` routes only.
- R04 numeric routes are read-only protected baseline.
- Reasoning, mixed, and PBL remain owned by R06 or later.
- Existing Global Primary / canonical application authorities and the shared worksheet pipeline remain the only admitted producer-consumer lineage.
- No new KnowledgePoint, PatternGroup, PatternSpec, generator, validator, renderer, or worksheet pipeline was created.

## Repair routes by source

| Source | Repair routes |
|---|---:|
| `g5a_u02_5a02` | 30 |
| `g5a_u08_5a08` | 16 |
| `g3b_u04_3b04` | 7 |
| `g3a_u08_3a08` | 4 |
| `g5a_u03_5a03a1` | 4 |
| `g6a_u01_6a01` | 4 |
| `g3b_u07_3b07` | 3 |
| `g3b_u08_3b08` | 3 |
| `g5a_u04_5a04` | 3 |
| `g3a_u03_3a03` | 2 |
| `g3b_u01_3b01` | 2 |
| `g4a_u08_4a08` | 2 |
| `g4b_u06_4b06` | 2 |
| `g3a_u02_3a02` | 1 |
| `g3a_u06_3a06` | 1 |
| `g5a_u03_5a03a` | 1 |

## CI evidence

GitHub Actions run `30451106436`, job `90573110840`:

```text
syntax-check                         = PASS
211 legal application-route baseline = PASS
focused R05 acceptance              = 5 / 5 PASS
full repository regression          = 2612 / 2612 PASS
baseline artifact materialization   = PASS
artifact commit                     = 9bd3ba46
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R04_PUBLIC_NUMERIC_GENERATION_CONFORMANT_APPLICATION_UNVERIFIED
GOAL_DISTANCE_AFTER  = D1_R05_APPLICATION_RUNTIME_GAPS_SOURCE_LOCATED_AND_CI_VERIFIED
DISTANCE_REDUCED     = every legal application route now has reproducible 20-question runtime, prompt-diversity, answer-key and authority-lineage evidence; 85 exact repair routes are classified
REMAINING_BLOCKERS   = [39_PROMPT_COLLISION_ROUTES, 6_BOUNDED_APPLICATION_BUILD_FAILURES, 40_CONTRACT_ONLY_STALE_LIMIT_ROUTES]
NEXT_SHORTEST_STEP   = PGC-R05_ApplicationProducerAndContextAllocatorFullFix
```
