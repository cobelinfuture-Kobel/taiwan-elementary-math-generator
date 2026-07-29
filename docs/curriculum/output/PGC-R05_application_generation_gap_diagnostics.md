# PGC-R05 Application Generation Runtime Gap Diagnostics

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R05_ApplicationProducerAndContextAllocatorFullFix
MILESTONE  = G5A_U02_APPLICATION_DIVERSITY
STATUS     = PASS_G5A_U02_APPLICATION_DIVERSITY_CI_VERIFIED_READY_TO_MERGE
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

## Exact-head CI evidence

```text
EXACT_HEAD                           = a48c2edcb9fc4eaaab1f504b930ca5488d296fae
PGC_R05_RUN                          = 30456405796 = PASS
NODE_RUN                             = 30456406318 = PASS
R04_NUMERIC_RUN                      = 30456406385 = PASS
S97_SOURCE_AND_BUNDLE_PARITY         = 30456407013 = PASS
S101_SOURCE_BUNDLE_AND_REGRESSION    = 30456405961 = PASS
S104_768_ITEM_MATRIX                 = 30456406071 = PASS
S104_216_LAYOUTS_72_ANSWER_BOUNDARY  = PASS
S110_1408_ITEM_MATRIX                = 30456406534 = PASS
S110_396_LAYOUTS_132_ANSWER_BOUNDARY = PASS
S110_FULL_REPOSITORY_REGRESSION      = PASS
FULL_REPOSITORY_TESTS                = 2619 / 2619 PASS
```

## Scope boundary

- R05 owns legal public `application` routes only.
- R04 numeric routes remain read-only protected baseline.
- Reasoning, mixed, and PBL remain owned by R06 or later.
- No KnowledgePoint, PatternGroup, PatternSpec, validator, renderer, or worksheet pipeline was added.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R05_35_LIVE_APPLICATION_FAILURES
GOAL_DISTANCE_AFTER  = D1_R05_19_LIVE_APPLICATION_FAILURES
DISTANCE_REDUCED     = all 16 G5A-U02 prompt-collision routes now generate two complete unique 20-question worksheets through canonical source, browser bundle, HTML/PDF and full-regression lineage
REMAINING_BLOCKERS   = [19_LIVE_PROMPT_COLLISION_ROUTES, CONTRACT_CAPACITY_RECONCILIATION_AFTER_LIVE_REPAIRS]
NEXT_SHORTEST_STEP   = PGC-R05_G3B_U04_ApplicationDiversityFullFix
```
