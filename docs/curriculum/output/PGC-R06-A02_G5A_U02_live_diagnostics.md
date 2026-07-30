# PGC-R06 A02 G5A-U02 Live Diagnostics

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R06-A02_BoundedCapacityReasoningMixedPBLRouteFullFix
STATUS     = PASS_R06_A02_G5AU02_65_OF_98_ROUTES_LIVE_20_CONFORMANT_WITH_CLASSIFIED_FAILURES
```

## Live results

```text
TARGET_QUEUE_ROUTES = 98
LIVE_20_PASS        = 65
LIVE_20_FAIL        = 33
CAPACITY_STALE_PASS = 53
```

## Failures by runtime error

- none

## Failures by depth/context

- depth `basic`: 7
- depth `extended`: 14
- depth `mixed`: 12
- context `abstract_math`: 10
- context `daily_life`: 7
- context `mixed`: 16

## First failed routes

- `pgc_r03_g5a_u02_5a02_mixed_05ee727bddbc` — singleKnowledgePoint / mixed / mixed / mixed — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_06a21fe6f5ab` — singleKnowledgePoint / mixed / extended / mixed — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_08db83f2b8b4` — singleKnowledgePoint / mixed / extended / mixed — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_0af558cd57e7` — singleKnowledgePoint / mixed / mixed / mixed — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_155b7a11a4d1` — sourceUnit / mixed / basic / daily_life — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_1e3c38a51eb2` — singleKnowledgePoint / mixed / basic / mixed — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_2f3620879b26` — mixedKnowledgePointsSameUnit / mixed / extended / daily_life — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_319cdba8c6af` — singleKnowledgePoint / mixed / extended / mixed — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_336c253725d2` — singleKnowledgePoint / mixed / mixed / abstract_math — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_3a795d0898ab` — singleKnowledgePoint / mixed / mixed / abstract_math — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_420c0a74a1ac` — singleKnowledgePoint / mixed / extended / abstract_math — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_4da24bd603ce` — sourceUnit / mixed / extended / mixed — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_713966a43bbd` — singleKnowledgePoint / mixed / mixed / abstract_math — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_7283aeb2bf61` — mixedKnowledgePointsSameUnit / mixed / basic / daily_life — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_72b3c79eb4a1` — singleKnowledgePoint / mixed / basic / daily_life — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_7717949b5db2` — singleKnowledgePoint / mixed / extended / mixed — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_866d481e5723` — singleKnowledgePoint / mixed / mixed / mixed — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_8f70482689c0` — singleKnowledgePoint / mixed / extended / daily_life — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_b1cff96674de` — singleKnowledgePoint / mixed / basic / mixed — DUPLICATE_PROMPT
- `pgc_r03_g5a_u02_5a02_mixed_b2ef31937ed9` — singleKnowledgePoint / mixed / basic / abstract_math — DUPLICATE_PROMPT

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R06_REPAIR_QUEUE_133
GOAL_DISTANCE_AFTER  = D1_R06_G5A_U02_LIVE_65_OF_98_CLASSIFIED
DISTANCE_REDUCED     = all 98 queued G5A-U02 routes now have two-seed public-pipeline evidence and producer-family failure classification
REMAINING_BLOCKERS   = [G5A_U02_LIVE_CAPACITY_FAILURES]
NEXT_SHORTEST_STEP   = PGC-R06-A02_G5AU02_DUPLICATE_PROMPT_FullFix
```

