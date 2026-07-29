# PGC-R04 Final 12 Public Route Producer Repair Readback

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R04_Final12PublicRouteProducerRepair
STATUS     = PASS_R04_FOCUSED_AND_EXACT_LAYOUT_BOUND_SYNCED_PENDING_FINAL_S110_PRODUCT_GATE
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

## CI evidence

GitHub Actions workflow `PGC-R04 Numeric Generation FullFix` run `30449044100`, job `90566397339`, passed with:

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

The synchronized generated bundle and exact S106 layout-safe producer are committed at branch head `ec1dc416e047f077db40dbafd1c4b917256dec00`. This readback commit triggers the final S110 byte parity, all-22 item matrix, and HTML/PDF product acceptance against that exact canonical artifact lineage.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_FINAL_TWO_NUMERIC_ROUTES_PROMPT_COLLISION_AND_PROTECTED_CONTRACT_DRIFT
GOAL_DISTANCE_AFTER  = D1_ALL_R04_NUMERIC_ROUTES_NODE_AND_EXACT_LAYOUT_BOUND_CONFORMANT_PENDING_FINAL_S110_PRODUCT_GATE
DISTANCE_REDUCED     = final route collisions, protected-contract drift, full Node failures, generated bundle authority drift, and the exact S110 factor-pair 1x7 overflow boundary are reconciled
REMAINING_BLOCKERS   = [FINAL_S110_BUNDLE_MATRIX_HTML_PDF_PRODUCT_GATE]
NEXT_SHORTEST_STEP   = PGC-R04_FinalS110ReadbackAndPRMerge
```
