# PGC-R05 Application Generation Runtime Gap Diagnostics

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R05_ApplicationProducerAndContextAllocatorFullFix
MILESTONE  = G5A_U02_APPLICATION_DIVERSITY
STATUS     = PASS_G5A_U02_16_ROUTE_RUNTIME_AND_BUNDLE_SYNCED_PENDING_EXACT_HEAD_PRODUCT_GATES
```

## Current application baseline

```text
APPLICATION_ROUTES             = 301
LEGAL_APPLICATION_ROUTES       = 211
ILLEGAL_APPLICATION_ROUTES     = 90
LIVE_20_PASS_ROUTES            = 192
LIVE_20_FAIL_ROUTES            = 19
G5A_U02_LIVE_FAILURES          = 0
```

## G5A-U02 repair

The 16 G5A-U02 live failures were prompt collisions across five existing Class D producer families. R05 now carries an explicit `pgc-r05-application-diversity-v1` profile through browser entry, hidden worksheet generation, canonical Class D generation, semantic regeneration, and the generated browser bundle.

```text
EQUAL_PARTITION_ALL_SEGMENT_COUNTS        = PASS_20X2
EQUAL_PARTITION_CONSTRAINED_RECIPIENTS    = PASS_20X2
MAXIMUM_EQUAL_GROUPING                    = PASS_20X2
POSSIBLE_EQUAL_PACKAGING_COUNTS           = PASS_20X2
RECTANGLE_AND_SQUARE_TILE_DIMENSIONS      = PASS_20X2
LEGACY_PRODUCT_SEED_BEHAVIOR_PRESERVED    = true
NEW_PATTERN_SPECS                         = 0
SECOND_GENERATOR                          = false
```

## CI evidence

```text
PGC_R05_RUN                 = 30455429207
PGC_R05_JOB                 = 90587668277
CANONICAL_SOURCE_PATCH      = PASS
CANONICAL_BUNDLE_REBUILD    = PASS
DETERMINISTIC_BUNDLE_CMP    = PASS
211_ROUTE_MATERIALIZATION   = PASS
FOCUSED_G5A_U02_ROUTES      = 16 / 16 PASS
FULL_REPOSITORY_TESTS       = 2619 / 2619 PASS
CANONICAL_SYNC_COMMIT       = 66c8f929
```

## Scope boundary

- R05 owns legal public `application` routes only.
- R04 numeric routes remain read-only protected baseline.
- Reasoning, mixed, and PBL remain owned by R06 or later.
- No KnowledgePoint, PatternGroup, PatternSpec, validator, renderer, or worksheet pipeline was added.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R05_35_LIVE_APPLICATION_FAILURES
GOAL_DISTANCE_AFTER  = D1_R05_19_LIVE_APPLICATION_FAILURES_PENDING_EXACT_HEAD_PRODUCT_GATES
DISTANCE_REDUCED     = all 16 G5A-U02 prompt-collision routes now generate two complete unique 20-question worksheets through canonical source and bundle lineage
REMAINING_BLOCKERS   = [19_LIVE_PROMPT_COLLISION_ROUTES, EXACT_HEAD_G5A_U02_PRODUCT_GATES]
NEXT_SHORTEST_STEP   = PGC-R05_G5AU02ExactHeadProductGateAndMerge
```
