# S43C3 G3A-U02 Fine PatternSpec Implementation Plan

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C3_G3AU02FinePatternSpecImplementationPlan
TASK_STATUS = IMPLEMENTATION_PLAN
WRITE_TYPE = docs_only
```

S43C3 plans fine PatternSpec work for the G3A-U02 P0 C-class prototype rows.

This task does not create PatternSpec JSON, does not update registries, and does not change generator, validator, renderer, resolver, tests, or HTML UI.

## Inputs

```text
S43C2 = G3A-U02 A/D registry seed materialization
S43C1 = G3A-U02 prototype registry materialization plan
S43B1-B5 = locked schemas, visibility policy, validation contract
currentSeedPatternSpecs = ps_g3a_u02_4digit_add_multi_carry, ps_g3a_u02_4digit_sub_multi_borrow
```

## Current Runtime Gap

The existing browser bridge PatternSpecs encode operator, ranges, answer constraints, and skill tags.

The current G3A-U02 seed PatternSpecs are coarse:

```text
ps_g3a_u02_4digit_add_multi_carry = four-digit addition seed
ps_g3a_u02_4digit_sub_multi_borrow = four-digit subtraction seed
```

They do not yet prove explicit carry/borrow constraints. Therefore the P0 C rows require new fine PatternSpec contracts plus generator/validator work in later tasks.

## P0 C-Class Scope

Only these three rows are in S43C3 P0 scope:

```text
kp_g3a_u02_sub_consecutive_borrow
kp_g3a_u02_vertical_sub_missing_digit
kp_g3a_u02_borrow_zero_middle_handling
```

Deferred C rows remain out of S43C3 implementation planning:

```text
kp_g3a_u02_vertical_add_missing_digit
kp_g3a_u02_sub_missing_middle_digit
```

## Planned Fine PatternSpecs

| KnowledgePoint | Planned PatternSpec ID | Purpose | Status |
|---|---|---|---|
| kp_g3a_u02_sub_consecutive_borrow | ps_g3a_u02_sub_consecutive_borrow | four-digit subtraction requiring borrow chain across at least two adjacent place values | planned |
| kp_g3a_u02_vertical_sub_missing_digit | ps_g3a_u02_vertical_sub_missing_digit | vertical subtraction with one hidden digit to solve | planned |
| kp_g3a_u02_borrow_zero_middle_handling | ps_g3a_u02_borrow_zero_middle_handling | subtraction requiring borrow through a middle zero | planned |

## Required PatternSpec Contract Additions

Future fine PatternSpecs need fields beyond the current coarse browser seed model:

```text
algorithmConstraint
borrowConstraint
missingDigitConstraint
placeValueConstraint
verticalLayoutRequired
answerModel
validatorHooks
```

These fields should remain pattern-level metadata until S43C4 defines generator/validator behavior.

## PatternSpec 1 — Consecutive Borrow

```text
patternSpecId = ps_g3a_u02_sub_consecutive_borrow
knowledgePointId = kp_g3a_u02_sub_consecutive_borrow
operator = SUBTRACT
operandRange = 1000..9999 minus 1000..9999
answerConstraint = nonnegative integer under 10000
borrowConstraint = consecutive_borrow
minimumBorrowColumns = 2
representation = vertical_algorithm
answerModel = numericAnswer
```

Required behavior:

```text
Generated minuend/subtrahend pair must force borrowing in at least two adjacent lower place-value columns.
Validator must reject ordinary subtraction samples that do not trigger the required borrow chain.
```

## PatternSpec 2 — Vertical Subtraction Missing Digit

```text
patternSpecId = ps_g3a_u02_vertical_sub_missing_digit
knowledgePointId = kp_g3a_u02_vertical_sub_missing_digit
operator = SUBTRACT
operandRange = 1000..9999 minus 1000..9999
answerConstraint = nonnegative integer under 10000
missingDigitConstraint = exactly_one_hidden_digit
allowedHiddenLocations = minuend | subtrahend | result
representation = vertical_algorithm
answerModel = missingDigitAnswer
```

Required behavior:

```text
Generated item must hide exactly one digit in a valid vertical subtraction equation.
The hidden digit must be uniquely recoverable.
Validator must verify the missing digit, not only the final numeric result.
```

## PatternSpec 3 — Borrow Through Middle Zero

```text
patternSpecId = ps_g3a_u02_borrow_zero_middle_handling
knowledgePointId = kp_g3a_u02_borrow_zero_middle_handling
operator = SUBTRACT
operandRange = 1000..9999 minus 1000..9999
answerConstraint = nonnegative integer under 10000
borrowConstraint = borrow_through_zero
zeroPosition = tens_or_hundreds
representation = vertical_algorithm
answerModel = numericAnswer
```

Required behavior:

```text
Generated minuend must contain a middle zero in the borrow path.
Subtraction must force borrowing through that zero.
Validator must reject samples where the zero exists but no borrow-through-zero behavior is required.
```

## Generator Implications for S43C4

S43C4 must decide whether to implement a new generator family or extend the current expression generator with constrained sampling.

Minimum required generator capabilities:

```text
- sample four-digit subtraction pairs with nonnegative answers
- detect borrow columns
- force consecutive borrow columns
- force borrow-through-zero cases
- create exactly-one-missing-digit vertical subtraction items
- preserve unique answer for missing-digit cases
```

## Validator Implications for S43C4

Minimum required validator capabilities:

```text
- verify numeric subtraction answer
- compute borrow-column profile
- confirm consecutive borrow constraint
- confirm borrow-through-zero constraint
- validate missing digit answer separately from final numeric answer
- emit deterministic error codes for constraint mismatch
```

## Registry Implication

C3 does not update registry JSON.

Future C4/C5 or implementation tasks may add C rows only after the generator/validator contract is clear.

Until then:

```text
C rows remain unmaterialized in registry JSON
A rows remain hidden/internal
D rows remain not_selectable
selectable_ready rows remain 0
```

## Out of Scope

```text
- vertical_add_missing_digit
- sub_missing_middle_digit
- estimation
- word problems
- HTML selector work
- cross-unit selection
- all 13-unit expansion
```

## S43C3 Gate

```text
S43C3_GATE = PASS_G3AU02_FINE_PATTERNSPEC_PLAN

PASS:
- 3 P0 C-class KnowledgePoints selected
- 3 planned fine PatternSpec IDs defined
- borrow-chain, missing-digit, and borrow-through-zero constraints described
- generator implications listed
- validator implications listed
- C rows remain unmaterialized
- no runtime implementation introduced

GAPS:
- generator/validator variant plan not written yet
- no fine PatternSpec JSON implemented yet
- no validation tests implemented yet
- C rows not materialized in registry JSON yet
- no HTML KnowledgePoint selector exists yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_G3AU02_A_D_REGISTRY_SEEDS_MATERIALIZED
GOAL_DISTANCE_AFTER  = D2_G3AU02_FINE_PATTERNSPEC_PLAN_LOCKED
DISTANCE_REDUCED     = S43 now has a concrete fine PatternSpec plan for the P0 C-class G3A-U02 prototype constraints before generator/validator design

G3A_U02_RegistryRows              44% ->  44%
G3A_U02_FinePatternSpecPlan        0% -> 100%
G3A_U02_GeneratorValidatorPlan     0% ->   0%
KPHTMLSelectablePath               0% ->   0%
S43Overall                        70% ->  73%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "S43C4 generator/validator variant plan 尚未 written",
  "fine PatternSpec JSON 尚未 implemented",
  "Validation test file 尚未 implemented",
  "G3A-U02 C 類 rows 尚未 materialized",
  "carry/borrow explicit constraint 尚未 QA verified",
  "HTML KnowledgePoint selector 尚未實作",
  "per-KP printable QA 尚未建立"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C4_G3AU02GeneratorValidatorVariantPlan
```
