# POSTG-APP-W02-A04 Readback

## Scope

`POSTG-APP-W02-A04_ValidatorFixturesAndSharedRuntimeShadow`

This milestone executes deterministic positive and negative fixtures against the W02 A02/A03 candidate authorities. It does not connect the production generator, production validator, renderer, worksheet routes, public UI, or production admission.

## Verified execution matrix

```text
61 A02 candidates × 3 single-application fixtures       = 183
61 A03 proofs × 1 positive N+1 fixture                  = 61
61 A03 proofs × 3 misconception negatives              = 183
61 A03 proofs × 1 counterfactual positive              = 61
61 A03 proofs × 1 cross-context positive               = 61
61 A03 proofs × 1 non-unique-answer negative           = 61
31 A03 PBL candidates × 2 dependency fixtures          = 62
-------------------------------------------------------------
Total fixtures                                          = 672
Positive fixtures                                       = 275
Negative fixtures                                       = 397
Actual positive passes                                  = 275
Actual expected rejects                                 = 397
Unexpected passes                                       = 0
Unexpected rejects                                      = 0
```

## Verified runtime coverage

```text
source nodes                     = 13
primary Macro contexts           = 16
alternate Macro contexts         = 2
operation families               = 22
answer shapes                    = 2
runtime adapters                 = 2
duplicate projection groups      = 1
```

Answer shapes:

- `COMPARISON_CHOICE`
- `QUANTITY_WITH_UNIT`

Adapters:

- `COMPARISON_CHOICE_RECONSTRUCTION`
- `GENERIC_QUANTITY_RECONSTRUCTION`

Operation families:

```text
common_group_total
decimal_add_sub
decimal_compare
decimal_measure_conversion
decimal_multiply
discrete_fraction_conversion
exact_grouping
fraction_accumulation
fraction_add_sub
fraction_bounds
fraction_compare
fraction_context_total
fraction_times_integer
interval_multiple_count
lcm
measurement_fraction
nearest_multiple
quotient_fraction_context
rate_total
rounding
segment_measure
square_tiling
```

## Runtime layers

- A02 candidate lineage.
- A03 proof and PBL lineage for proof-derived fixtures.
- A02-only lineage for single-application fixtures.
- Primary or alternate context chain.
- Given-role and answer-role coverage.
- Deterministic representative numeric recomputation.
- Answer role and answer unit.
- N-to-N+1 paired numeric identity.
- Misconception diagnostic classification.
- Counterfactual interpretation.
- Cross-context equivalence.
- Unique answer and witness cardinality.
- PBL dependency graph.
- Production guard.

## Misconception execution

Each of the 61 proofs contributes exactly three negative fixtures:

1. one act-specific misconception;
2. `OPERATION_KEYWORD_MATCHING` as a calculation failure;
3. `COMPUTED_NOT_INTERPRETED` as a calculation-pass/interpretation-fail case.

Verified diagnostic split:

```text
calculation fail                            = 61
calculation pass / interpretation fail      = 122
all misconception negatives                 = 183
```

## Fail-closed result distribution

```text
ANSWER_ROLE_MISMATCH                         = 61
ANSWER_UNIT_MISMATCH                         = 61
MISCONCEPTION_UNIT_ROLE_CONFUSION            = 23
MISCONCEPTION_CALCULATION_INVALID            = 61
INTERPRETATION_WITNESS_MISSING               = 61
ANSWER_NOT_UNIQUE                            = 61
PBL_DEPENDENCY_INVALID                       = 31
MISCONCEPTION_CONSTRAINT_IGNORED             = 11
MISCONCEPTION_COMPARISON_DIRECTION_REVERSAL  = 15
MISCONCEPTION_CONSERVATION_VIOLATION         = 9
MISCONCEPTION_QUOTIENT_ONLY                  = 2
MISCONCEPTION_RELATION_ORDER_REVERSAL        = 1
```

## Duplicate content parity

The duplicate PDF group `pdf_5ba57aff6a97` preserves normalized fixture projection parity across:

- `g4a_u06_4a06`
- `g4b_u03_4b03`

Result: `PASS`.

## Fixture boundary

Numeric witnesses are representative deterministic shadow witnesses. They prove adapter, lineage, role, unit, interpretation and dependency behavior in the shared shadow runtime. They do not claim exact production PatternSpec generation or pedagogical production admission.

## Production boundary

```text
production generator changed  = false
production validator changed  = false
renderer changed              = false
public UI changed             = false
worksheet output changed      = false
production admitted           = false
W01 E5 state changed          = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_N_PLUS_ONE_PROOF_MISCONCEPTION_AND_PBL_BLUEPRINTS_MAIN_VERIFIED
GOAL_DISTANCE_AFTER  = D2_VALIDATOR_FIXTURES_AND_SHARED_RUNTIME_SHADOW_MAIN_VERIFIED
DISTANCE_REDUCED     = Blueprint-only proof capability → executed deterministic positive/negative validator evidence
REMAINING_BLOCKERS   = [SHARED_WORKSHEET_PROJECTION_PENDING, PRODUCTION_EQUIVALENT_HTML_PDF_PENDING, HUMAN_REVIEW_PENDING, PRODUCTION_ADMISSION_PENDING, PUBLIC_UI_PENDING]
NEXT_SHORTEST_STEP   = POSTG-APP-W02-A05_SharedWorksheetProjectionContractAndW02ShadowProjection
```
