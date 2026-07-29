# PGC-R04 Final 12 Public Route Producer Repair Readback

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R04_Final12PublicRouteProducerRepair
STATUS     = PASS_R04_AND_NODE_CANONICAL_BUNDLE_SYNCED_PENDING_S110_PRODUCT_GATE
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

R04 uses a dual seed contract instead of globally replacing protected product behavior:

```text
legacy / product seed = preserve reviewed P03F, S43 and S106 behavior
pgc-r04 seed namespace = consume expanded numeric parameter spaces
```

Reconciled authorities include:

```text
G3A-U03 locked three-factor operand shape
G4A-U01 bounded direct pool plus public shared-allocation capacity
G5A-U02 S106 square and nonsquare factor-structure source / bundle parity
P03F5 / P03F6 / P03F7 / P03F9 / P03F10 / P03F11 reviewed product witnesses
G4B-U04 approximation-symbol capacity registry = 24
```

## CI evidence

GitHub Actions workflow `PGC-R04 Numeric Generation FullFix` passed with:

```text
final legacy producer patch                 = PASS
final twelve-route patch                    = PASS
problem-type seed projection                = PASS
S102 common-factor seed projection V2       = PASS
protected legacy contract reconciliation    = PASS
final full-regression reconciliation        = PASS
canonical G5A-U02 browser bundle rebuild    = PASS
canonical bundle deterministic cmp          = PASS
remaining producer locator                  = PASS
runtime diagnostic materialization          = PASS
focused allocator acceptance                = PASS
focused diagnostic acceptance               = PASS
81-route × 20-question × 10-seed live gate = PASS
```

Full Node regression passed:

```text
TESTS = 2607
PASS  = 2607
FAIL  = 0
```

The final 200-question G4A-U01 mixed stress test verifies unique `question.id` values. Public route prompt uniqueness remains independently enforced by the R04 20-question × 10-seed route acceptance.

## Canonical browser bundle authority

The generated browser bundle is no longer directly edited by R04 patchers. The only admitted path is:

```text
canonical source patches
→ esbuild 0.25.5 using the S110 command line
→ deterministic second build and byte comparison
→ committed generated browser bundle
```

The synchronized generated bundle is committed at branch head `fd2f6edd8fa911aa7250492b0d7854c7d40c22be`. This readback commit triggers S110 byte parity, the all-22 item matrix, and HTML/PDF product acceptance against that exact artifact.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_FINAL_TWO_NUMERIC_ROUTES_PROMPT_COLLISION_AND_PROTECTED_CONTRACT_DRIFT
GOAL_DISTANCE_AFTER  = D1_ALL_R04_NUMERIC_ROUTES_AND_NODE_CONFORMANT_PENDING_S110_PRODUCT_GATE
DISTANCE_REDUCED     = final route collisions, protected-contract drift, full Node failures, and generated bundle authority drift are reconciled
REMAINING_BLOCKERS   = [S110_BUNDLE_PARITY_AND_HTML_PDF_PRODUCT_GATE]
NEXT_SHORTEST_STEP   = PGC-R04_S110ProductGateAndPRMerge
```
