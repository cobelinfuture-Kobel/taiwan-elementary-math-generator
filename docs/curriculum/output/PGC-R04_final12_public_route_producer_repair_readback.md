# PGC-R04 Final 12 Public Route Producer Repair Readback

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R04_Final12PublicRouteProducerRepair
STATUS     = PASS_FOCUSED_R04_AND_LEGACY_RECONCILIATION_PENDING_LATEST_HEAD_FULL_REGRESSION
```

## Frozen scope

This readback covers only public `numeric`, `concept`, and `operation_estimation` routes owned by PGC-R04. It does not admit application, reasoning, mixed, PBL, Slice014, new KnowledgePoints, new PatternGroups, new PatternSpecs, or a second generator/validator/renderer/worksheet pipeline.

## Final producer repair

The final two failing routes were:

- `kp_g5a_u02_common_factor_enumeration`
- `kp_g5a_u02_greatest_common_factor`

Both continue to use the existing G5A-U02 S102 producer. Their seed projection is injective over 90 deterministic slots:

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

## Protected contract reconciliation

R04 now uses a dual seed contract instead of globally replacing protected product behavior:

```text
legacy / product seed = preserve reviewed P03F, S43 and S106 behavior
pgc-r04 seed namespace = consume expanded numeric parameter spaces
```

Reconciled authorities include:

```text
G3A-U03 locked three-factor operand shape
G4A-U01 canonical eight-question boundary pool
G5A-U02 S106 square and nonsquare factor-structure coverage
P03F5 / P03F6 / P03F7 / P03F9 / P03F10 / P03F11 reviewed product witnesses
G4B-U04 approximation-symbol capacity registry = 24
```

## Focused CI evidence

GitHub Actions workflow `PGC-R04 Numeric Generation FullFix` passed on the synchronized branch head:

```text
final legacy producer patch                 = PASS
final twelve-route patch                    = PASS
problem-type seed projection                = PASS
S102 common-factor seed projection V2       = PASS
protected legacy contract reconciliation    = PASS
remaining producer locator                  = PASS
runtime diagnostic materialization          = PASS
focused allocator acceptance                = PASS
focused diagnostic acceptance               = PASS
81-route × 20-question × 10-seed live gate = PASS
```

This commit triggers full Node and product regression against the synchronized runtime, tests and generated diagnostic authority.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_FINAL_TWO_NUMERIC_ROUTES_PROMPT_COLLISION_AND_PROTECTED_CONTRACT_DRIFT
GOAL_DISTANCE_AFTER  = D1_ALL_R04_NUMERIC_ROUTES_FOCUSED_CONFORMANT_PENDING_LATEST_HEAD_FULL_REGRESSION
DISTANCE_REDUCED     = final G5A-U02 collisions are removed and protected legacy product contracts are isolated from the R04 seed namespace
REMAINING_BLOCKERS   = [LATEST_HEAD_FULL_NODE_AND_PRODUCT_REGRESSION]
NEXT_SHORTEST_STEP   = PGC-R04_LatestHeadFullRegressionAndPRMerge
```
