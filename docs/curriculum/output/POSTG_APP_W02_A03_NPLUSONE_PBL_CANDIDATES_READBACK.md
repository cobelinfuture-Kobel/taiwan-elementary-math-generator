# POSTG-APP-W02-A03 Readback

## Scope

`POSTG-APP-W02-A03_NPlusOneProofMisconceptionAndPBLCandidateContract`

This milestone consumes the 61 W02 A02 single-application candidates. It does not instantiate numeric fixtures, execute misconception evidence, connect the production validator, render worksheets, change public UI, or grant production admission.

## Verified N+1 capability

```text
61 A02 single-application candidates
→ 61 N+1 interpretation-proof blueprints
→ 183 misconception candidates
→ 61 cross-context proof pairs
```

Each proof adds exactly one interpretive act while preserving the same numeric prerequisites and number domain. Every proof includes:

- one act-specific misconception;
- `OPERATION_KEYWORD_MATCHING`;
- `COMPUTED_NOT_INTERPRETED`;
- a counterfactual blueprint;
- a different-Macro cross-context proof candidate;
- a validator-delta candidate.

## Verified PBL capability

PBL task-set candidates are created only for A02 candidates classified `APPLICATION_REQUIRED`.

```text
PBL eligible APPLICATION_REQUIRED candidates = 31
PBL task-set candidates                       = 31
PBL3_LINEAR candidates                        = 19
PBL5_BOUNDED_DECISION candidates              = 12
APPLICATION_COMPATIBLE automatic PBL          = 0
```

This prevents forced PBL authoring for knowledge points that are merely compatible with life-context questions.

## Interpretive-act coverage

```text
UNIT_ROLE_INTERPRETATION      = 23
COMPARISON_DECISION           = 15
DUAL_CONSTRAINT_RESOLUTION    = 11
CONSERVATION_OR_TRANSFER      = 9
REMAINDER_INTERPRETATION      = 2
RELATION_CHAIN                = 1
```

## Duplicate content parity

The duplicate PDF content group `pdf_5ba57aff6a97` (`g4a_u06_4a06` and `g4b_u03_4b03`) preserves one normalized N+1 proof projection group and one normalized PBL projection group. Both parity gates pass.

## Boundary

- Numeric fixtures are not instantiated.
- Misconception, counterfactual and cross-context evidence are not executed.
- Unique-answer and witness validation remain pending.
- Generator and renderer remain disconnected.
- Public selection remains unchanged.
- Production admission remains false.

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_ATOMIC_CONTEXT_AND_SINGLE_APPLICATION_CANDIDATES_MAIN_VERIFIED
GOAL_DISTANCE_AFTER  = D2_N_PLUS_ONE_PROOF_MISCONCEPTION_AND_PBL_BLUEPRINTS_MAIN_VERIFIED
DISTANCE_REDUCED     = Single-Application Candidate → N+1 Proof + Misconception + PBL Candidate Contract
REMAINING_BLOCKERS   = [NUMERIC_FIXTURE_EXECUTION_PENDING, MISCONCEPTION_EXECUTION_PENDING, COUNTERFACTUAL_EXECUTION_PENDING, CROSS_CONTEXT_EXECUTION_PENDING, UNIQUE_ANSWER_VALIDATION_PENDING, SHARED_RUNTIME_PENDING, PRODUCTION_RUNTIME_PENDING]
NEXT_SHORTEST_STEP   = POSTG-APP-W02-A04_ValidatorFixturesAndSharedRuntimeShadow
```
