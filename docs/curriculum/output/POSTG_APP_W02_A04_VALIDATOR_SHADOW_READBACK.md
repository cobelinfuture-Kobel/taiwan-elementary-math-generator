# POSTG-APP-W02-A04 Readback

## Scope

`POSTG-APP-W02-A04_ValidatorFixturesAndSharedRuntimeShadow`

This milestone executes deterministic positive and negative fixtures against the W02 A02/A03 candidate authorities. It does not connect the production generator, production validator, renderer, worksheet routes, public UI, or production admission.

## Expected execution matrix

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
```

## Runtime layers

- A02 candidate lineage.
- A03 proof and PBL lineage.
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

Expected diagnostic split:

```text
calculation fail                            = 61
calculation pass / interpretation fail      = 122
all misconception negatives                 = 183
```

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
REMAINING_BLOCKERS   = [WORKSHEET_SHADOW_PROJECTION_PENDING, PRODUCTION_EQUIVALENT_HTML_PDF_PENDING, HUMAN_REVIEW_PENDING, PRODUCTION_ADMISSION_PENDING]
NEXT_SHORTEST_STEP   = POSTG-APP-W02-A05_WorksheetShadowProjectionAndProductionAdmissionReview
```
