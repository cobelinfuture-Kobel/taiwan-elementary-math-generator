# S43C4 G3A-U02 Generator Validator Variant Plan

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C4_G3AU02GeneratorValidatorVariantPlan
TASK_STATUS = VARIANT_PLAN
WRITE_TYPE = docs_only
```

S43C4 plans the generator and validator variants needed for the three G3A-U02 P0 C-class fine PatternSpecs from S43C3.

This task does not create PatternSpec JSON, does not update registry JSON, and does not change generator, validator, renderer, resolver, tests, or HTML UI.

## Inputs

```text
S43C3 = fine PatternSpec implementation plan
S43C2 = G3A-U02 A/D registry seed materialization
Current browser generator = batch-a-browser-generator.js
Current browser validator = batch-a-browser-validator.js
Core expression generator = site/modules/core/generate-expression.js
```

## Current Runtime Readback

Current Batch A browser generation path:

```text
buildBatchABrowserPlan
→ generateBatchABrowserQuestions
→ getBatchABrowserPatternDefinition
→ generateExpressionQuestion or generateComparisonQuestion
→ validateBatchABrowserQuestion
```

The current expression generator supports operand ranges, operators, answer constraints, division special handling, duplicate rejection, and seeded random generation.

The current Batch A validator verifies source/pattern availability and answer correctness. It does not yet verify borrow profiles, missing digit uniqueness, or borrow-through-zero constraints.

## P0 Variant Targets

```text
P0_VARIANTS = [
  "ps_g3a_u02_sub_consecutive_borrow",
  "ps_g3a_u02_vertical_sub_missing_digit",
  "ps_g3a_u02_borrow_zero_middle_handling"
]
```

## Variant Family Decision

S43C4 should not extend the generic expression generator blindly.

Preferred implementation family for future work:

```text
G3A_U02_SUBTRACTION_CONSTRAINT_VARIANTS
```

This should be a constrained Batch A curriculum variant layer that wraps or sits beside the current expression generator, rather than changing all generic expression generation behavior.

Reason:

```text
The constraints are curriculum-specific:
- consecutive borrow profile
- vertical missing digit uniqueness
- borrow through middle zero

These should not affect ordinary Batch A expression generation unless a PatternSpec explicitly requests them.
```

## Required Shared Utility Layer

Future implementation should first add pure utility functions, independent of UI and worksheet rendering.

```text
analyzeSubtractionBorrowProfile(minuend, subtrahend)
hasConsecutiveBorrow(profile, minimumAdjacentColumns = 2)
hasBorrowThroughZero(minuend, subtrahend, profile)
solveSingleMissingDigitSubtraction(item)
isUniqueMissingDigitSolution(item)
```

Expected profile fields:

```text
borrowColumns = ones | tens | hundreds | thousands
adjacentBorrowRunLength
borrowThroughZero = true | false
zeroPositionsInMinuend = tens | hundreds
negativeResult = true | false
```

## Generator Variant Plan

### Variant 1 — Consecutive Borrow

```text
variantId = gen_g3a_u02_sub_consecutive_borrow
patternSpecId = ps_g3a_u02_sub_consecutive_borrow
questionKind = expression
answerModel = numericAnswer
```

Generation approach:

```text
1. Sample four-digit minuend/subtrahend candidates.
2. Reject negative results.
3. Compute borrow profile.
4. Accept only profiles with at least two adjacent borrow columns.
5. Return normal numeric expression question with borrow metadata attached.
```

Required metadata:

```text
metadata.algorithmConstraint = consecutive_borrow
metadata.borrowProfile = computed profile snapshot
metadata.knowledgePointId = kp_g3a_u02_sub_consecutive_borrow
```

### Variant 2 — Vertical Subtraction Missing Digit

```text
variantId = gen_g3a_u02_vertical_sub_missing_digit
patternSpecId = ps_g3a_u02_vertical_sub_missing_digit
questionKind = vertical_algorithm_missing_digit
answerModel = missingDigitAnswer
```

Generation approach:

```text
1. Generate a valid four-digit subtraction equation.
2. Choose exactly one digit position to hide from minuend, subtrahend, or result.
3. Solve the hidden digit by deterministic enumeration 0..9.
4. Accept only if exactly one digit satisfies the equation.
5. Return a vertical algorithm display model with one blank and a missingDigitAnswer model.
```

Required metadata:

```text
metadata.algorithmConstraint = vertical_missing_digit
metadata.hiddenDigit = { location, placeValue, answerDigit }
metadata.knowledgePointId = kp_g3a_u02_vertical_sub_missing_digit
```

### Variant 3 — Borrow Through Middle Zero

```text
variantId = gen_g3a_u02_borrow_zero_middle_handling
patternSpecId = ps_g3a_u02_borrow_zero_middle_handling
questionKind = expression
answerModel = numericAnswer
```

Generation approach:

```text
1. Sample four-digit minuend with tens or hundreds digit equal to 0.
2. Sample subtrahend so subtraction is nonnegative.
3. Compute borrow profile.
4. Accept only if borrowing must pass through the zero digit.
5. Reject cases where the minuend contains a zero but the zero is not part of the borrow path.
```

Required metadata:

```text
metadata.algorithmConstraint = borrow_through_zero
metadata.borrowProfile = computed profile snapshot
metadata.zeroHandling = { zeroPosition, borrowPassesThroughZero: true }
metadata.knowledgePointId = kp_g3a_u02_borrow_zero_middle_handling
```

## Validator Variant Plan

### Shared validator hooks

```text
validateSubtractionAnswer(question)
validateBorrowProfile(question, expectedConstraint)
validateBorrowThroughZero(question)
validateMissingDigitUniqueness(question)
validateG3AU02FineConstraint(question)
```

### Error codes to reserve

```text
g3a_u02_borrow_profile_missing
g3a_u02_consecutive_borrow_required
g3a_u02_borrow_through_zero_required
g3a_u02_middle_zero_required
g3a_u02_missing_digit_model_missing
g3a_u02_missing_digit_not_unique
g3a_u02_missing_digit_answer_incorrect
g3a_u02_negative_result_not_allowed
g3a_u02_operand_digit_count_invalid
```

### Consecutive Borrow validator

```text
1. Verify numeric answer correctness.
2. Verify both operands are four-digit integers.
3. Verify result is nonnegative.
4. Recompute borrow profile from operands.
5. Require adjacent borrow run length >= 2.
6. Reject if metadata says consecutive_borrow but recomputation disagrees.
```

### Missing Digit validator

```text
1. Verify exactly one hidden digit exists.
2. Verify hidden location is allowed.
3. Enumerate candidate digits 0..9.
4. Require exactly one valid candidate.
5. Verify submitted answer equals that unique digit.
6. Reject if the item requires unsupported visual rendering beyond vertical text layout.
```

### Borrow Through Zero validator

```text
1. Verify numeric answer correctness.
2. Verify four-digit operands and nonnegative result.
3. Verify minuend has a middle zero at tens or hundreds.
4. Recompute borrow profile.
5. Require the borrow path to pass through that zero.
6. Reject ordinary borrow cases where zero is irrelevant.
```

## Integration Boundary

Future implementation should add a dispatch layer in the Batch A browser generator / validator path:

```text
if patternSpecId is one of P0 fine G3A-U02 variants:
  use G3A-U02 subtraction variant generator / validator hooks
else:
  keep current Batch A browser bridge behavior unchanged
```

Do not mutate generic expression generation semantics for all existing patterns.

## Registry Promotion Boundary

S43C4 does not update registry rows.

Future implementation may only promote C rows after all of the following exist:

```text
fine PatternSpec row exists
PatternGroup references the fine PatternSpec
Mapping.patternSpecId is non-null
Generator variant implemented
Validator variant implemented
Unit/smoke tests pass
htmlExposurePolicy still internal_only until selector QA
```

## Test Planning Boundary

Future test work should include positive, negative, and boundary cases:

```text
positive consecutive borrow
negative no-borrow / single-borrow rejected
positive missing digit unique answer
negative missing digit ambiguous rejected
positive borrow-through-zero
negative zero-present-but-not-used rejected
metadata mismatch rejected
answer incorrect rejected
```

S43C4 does not implement these tests.

## Out of Scope

```text
- adding fine PatternSpec JSON
- materializing C rows in registry JSON
- implementing generator variants
- implementing validator variants
- updating HTML selector
- changing sourceId selection behavior
- cross-unit KP selection
- deferred C rows
```

## S43C4 Gate

```text
S43C4_GATE = PASS_G3AU02_GENERATOR_VALIDATOR_VARIANT_PLAN

PASS:
- P0 generator variant family selected
- three generator variant behaviors planned
- shared borrow/missing-digit utility layer planned
- three validator variant behaviors planned
- deterministic error codes reserved
- integration boundary with current browser bridge defined
- registry promotion boundary defined
- test boundary drafted
- no runtime code changed

GAPS:
- fine PatternSpec JSON not materialized yet
- C rows not materialized in registry JSON yet
- generator variants not implemented yet
- validator variants not implemented yet
- validation tests not implemented yet
- HTML KnowledgePoint selector not implemented yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_G3AU02_FINE_PATTERNSPEC_PLAN_LOCKED
GOAL_DISTANCE_AFTER  = D2_G3AU02_GENERATOR_VALIDATOR_VARIANT_PLAN_LOCKED
DISTANCE_REDUCED     = S43 now has a bounded generator/validator variant plan for G3A-U02 P0 fine constraints without changing runtime behavior yet

G3A_U02_FinePatternSpecPlan       100% -> 100%
G3A_U02_GeneratorValidatorPlan      0% -> 100%
G3A_U02_RegistryRows               44% ->  44%
G3A_U02_RuntimeImplementation       0% ->   0%
KPHTMLSelectablePath                0% ->   0%
S43Overall                         73% ->  76%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "fine PatternSpec JSON 尚未 materialized",
  "G3A-U02 C 類 rows 尚未 materialized",
  "generator variants 尚未 implemented",
  "validator variants 尚未 implemented",
  "validation test file 尚未 implemented",
  "carry/borrow explicit constraint 尚未 QA verified",
  "HTML KnowledgePoint selector 尚未實作",
  "per-KP printable QA 尚未建立"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C5_G3AU02PrototypeQAPlan
```

S43C5 should define the QA plan for G3A-U02 prototype before any runtime implementation or selector exposure.
