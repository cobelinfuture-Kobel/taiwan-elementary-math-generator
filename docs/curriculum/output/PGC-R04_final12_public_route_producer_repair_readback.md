# PGC-R04 Final 12 Public Route Producer Repair Readback

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R04_Final12PublicRouteProducerRepair
STATUS     = PASS_FOCUSED_R04_CI_PENDING_LATEST_HEAD_FULL_REGRESSION
```

## Frozen scope

This readback covers only public `numeric`, `concept`, and `operation_estimation` routes owned by PGC-R04. It does not admit application, reasoning, mixed, PBL, Slice014, new KnowledgePoints, new PatternGroups, new PatternSpecs, or a second generator/validator/renderer/worksheet pipeline.

## Final producer repair

The final two failing routes were:

- `kp_g5a_u02_common_factor_enumeration`
- `kp_g5a_u02_greatest_common_factor`

Both continue to use the existing G5A-U02 S102 producer. Their seed projection is now injective over 90 deterministic slots:

```text
slot            = (seed - 1) mod 90
commonBase      = 2 + (slot mod 9)
leftMultiplier  = 101 + 2 * slot
rightMultiplier = leftMultiplier + 1
a                = commonBase * leftMultiplier
b                = commonBase * rightMultiplier
```

Locked invariants:

```text
UNIQUE_VISIBLE_PAIRS = 90 / 90
MAXIMUM_OPERAND      = 2800
GCD(a, b)            = commonBase
SAME_SEED_REPLAY     = deterministic
SECOND_GENERATOR     = false
```

## Focused CI evidence

GitHub Actions workflow `PGC-R04 Numeric Generation FullFix` passed:

```text
final legacy producer patch                 = PASS
final twelve-route patch                    = PASS
problem-type seed projection                = PASS
S102 common-factor seed projection V2       = PASS
remaining producer locator                  = PASS
runtime diagnostic materialization          = PASS
focused allocator acceptance                = PASS
focused diagnostic acceptance               = PASS
81-route × 20-question × 10-seed live gate = PASS
```

The workflow committed the deterministic runtime and diagnostic artifacts after its initial PR merge-ref Node workflow had already started. Therefore this readback commit exists to trigger a full regression against the latest synchronized branch head.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_FINAL_TWO_NUMERIC_ROUTES_PROMPT_COLLISION
GOAL_DISTANCE_AFTER  = D1_ALL_R04_NUMERIC_ROUTES_FOCUSED_CONFORMANT_PENDING_FULL_REGRESSION
DISTANCE_REDUCED     = the final two G5A-U02 public numeric routes now produce 20 unique prompts across all ten acceptance seeds
REMAINING_BLOCKERS   = [LATEST_HEAD_FULL_NODE_AND_PRODUCT_REGRESSION]
NEXT_SHORTEST_STEP   = PGC-R04_LatestHeadFullRegressionAndPRMerge
```
