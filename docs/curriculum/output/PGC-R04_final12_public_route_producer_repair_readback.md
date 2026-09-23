# PGC-R04 Final 12 Public Route Producer Repair Readback

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R04_Final12PublicRouteProducerRepair
STATUS     = PASS_R04_S110_PRODUCT_GATE_CLOSED_READY_TO_MERGE
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

## S110 layout-bound producer reconciliation

S110 run `30443620512` proved that bundle byte parity, the 1408-item all-22 matrix, and full repository regression passed. Its only remaining product failure was one real 1x7 question-card overflow in `ps_g5a_u02_factor_pair_enumeration`; the raw partial-answer-page differences were already normalized and were not the blocker.

The first bounded repair removed 19-row search tables. S110 run `30448410138` then established the exact boundary: 17-row cards overflow the approved 1x7 projection, while 16-row cards remain within the card boundary. R04 therefore keeps the complete S106 target pool for factor-order/symmetry and missing-factor reconstruction, while factor-pair enumeration selects the existing-pool subset satisfying:

```text
floor(sqrt(target)) <= 16
LAYOUT_SAFE_TARGET_COUNT = 93
```

This preserves well above the required 20 unique targets, deterministic replay, S106 validator semantics, the shared producer, and the canonical bundle build path without weakening the 1x7 product gate.

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

## Final CI evidence

GitHub Actions workflow `PGC-R04 Numeric Generation FullFix` run `30449044100`, job `90566397339`, passed:

```text
canonical source patchers                    = PASS
canonical G5A-U02 browser bundle rebuild    = PASS
canonical bundle deterministic cmp          = PASS
focused allocator acceptance                = PASS
focused diagnostic acceptance               = PASS
81-route × 20-question × 10-seed live gate = PASS
```

GitHub Actions workflow `G5A-U02 S110 All22 Integrated D0 Acceptance` run `30449184468` passed all load-bearing jobs:

```text
JOB 90566892816 all22-item-bundle-predecessor-gates             = PASS
- committed browser bundle byte parity                          = PASS
- 1408-item all-22 integrated matrix                            = PASS
- accepted predecessor focused gates                            = PASS

JOB 90566892741 all22-actual-layout-answer-boundary-html-pdf     = PASS
- 396-layout HTML/PDF acceptance                                = PASS
- 132-answer-boundary acceptance                                = PASS
- exact matrix totals                                           = PASS

JOB 90566892772 full-repository-regression                       = PASS
- tests                                                         = 2607
- pass                                                          = 2607
- fail                                                          = 0
```

## Canonical browser bundle authority

The generated browser bundle is no longer directly edited by R04 patchers. The only admitted path is:

```text
canonical source patches
→ esbuild 0.25.5 using the S110 command line
→ deterministic second build and byte comparison
→ committed generated browser bundle
```

The synchronized generated bundle and exact S106 layout-safe producer are committed in the PR lineage rooted at `ec1dc416e047f077db40dbafd1c4b917256dec00`; the final S110 run validated the subsequent readback-only head without runtime changes.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_ALL_R04_NUMERIC_ROUTES_NODE_AND_EXACT_LAYOUT_BOUND_CONFORMANT_PENDING_FINAL_S110_PRODUCT_GATE
GOAL_DISTANCE_AFTER  = D0_R04_PUBLIC_NUMERIC_GENERATION_CONFORMANT
DISTANCE_REDUCED     = S110 bundle parity, 1408-item matrix, 396 layouts, 132 answer boundaries, HTML/PDF, predecessor gates, and 2607-test full regression all passed
REMAINING_BLOCKERS   = []
NEXT_SHORTEST_STEP   = PGC-R04_PR446_SquashMergeAndMainReadback
```
