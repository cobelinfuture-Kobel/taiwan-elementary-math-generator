# S43C5 G3A-U02 Prototype QA Plan

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C5_G3AU02PrototypeQAPlan
TASK_STATUS = QA_PLAN
WRITE_TYPE = docs_only
```

S43C5 defines the QA plan for the G3A-U02 prototype before any runtime implementation, C-class registry materialization, or HTML selector exposure.

This task does not create test files, does not create PatternSpec JSON, does not update registry JSON, and does not change generator, validator, renderer, resolver, or HTML UI.

## Inputs

```text
S43C2 = G3A-U02 A/D registry seed materialization
S43C3 = G3A-U02 fine PatternSpec implementation plan
S43C4 = G3A-U02 generator/validator variant plan
```

## QA Scope

S43C5 defines QA coverage for six layers:

```text
QA1 = registry and schema readback QA
QA2 = fine PatternSpec contract QA
QA3 = generator variant QA
QA4 = validator variant QA
QA5 = worksheet pipeline QA
QA6 = visibility / leakage QA
```

## Prototype QA Targets

### A-class seed rows already materialized

```text
kp_g3a_u02_add_multi_carry
kp_g3a_u02_sub_multi_borrow
```

QA expectation:

```text
They may remain hidden/internal.
They may use existing coarse PatternSpecs.
They must not be promoted to selectable until seed QA and explicit carry/borrow constraint review pass.
```

### D-class not-selectable rows already materialized

```text
kp_g3a_u02_estimate_nearest_thousand
kp_g3a_u02_word_problem_estimation_add_sub
```

QA expectation:

```text
They must remain not_selectable.
They must not appear in selector, resolver input, query state, mixed selection, worksheet output, or answer key output.
```

### P0 C-class rows planned but not materialized

```text
kp_g3a_u02_sub_consecutive_borrow
kp_g3a_u02_vertical_sub_missing_digit
kp_g3a_u02_borrow_zero_middle_handling
```

QA expectation:

```text
They may be implemented only after fine PatternSpec + generator + validator work exists.
They must remain hidden/internal until QA pass.
```

## QA1 Registry and Schema Readback QA

Required checks:

```text
- batch_a_knowledge_points.json parses as JSON
- batch_a_pattern_groups.json parses as JSON
- batch_a_knowledge_point_pattern_map.json parses as JSON
- each row has required S43B1/B2/B3 fields
- sourceScope includes g3a_u02_3a02
- A rows are hidden/internal
- D rows are not_selectable
- selectable_ready count = 0 before HTML selector implementation
```

Gate:

```text
QA1_GATE = PASS only if all existing G3A-U02 registry rows satisfy schema and visibility rules.
```

## QA2 Fine PatternSpec Contract QA

Required checks for future fine PatternSpec rows:

```text
- ps_g3a_u02_sub_consecutive_borrow includes consecutive_borrow constraint
- ps_g3a_u02_vertical_sub_missing_digit includes exactly_one_hidden_digit constraint
- ps_g3a_u02_borrow_zero_middle_handling includes borrow_through_zero constraint
- all three reference sourceId g3a_u02_3a02
- all three remain internal until QA pass
```

Gate:

```text
QA2_GATE = PASS only after planned fine PatternSpecs exist and match S43C3 constraints.
```

## QA3 Generator Variant QA

### Consecutive borrow positive cases

```text
Expected generated question:
- four-digit subtraction
- nonnegative result
- at least two adjacent borrow columns
- metadata.algorithmConstraint = consecutive_borrow
```

### Consecutive borrow negative cases

```text
Reject:
- no-borrow cases
- single-borrow cases
- negative-result cases
- metadata claiming consecutive_borrow when recomputed profile disagrees
```

### Missing digit positive cases

```text
Expected generated question:
- vertical subtraction layout
- exactly one hidden digit
- unique digit solution by enumeration 0..9
- answerModel = missingDigitAnswer
```

### Missing digit negative cases

```text
Reject:
- no hidden digit
- multiple hidden digits
- ambiguous missing digit
- submitted answer not equal to unique digit
```

### Borrow through zero positive cases

```text
Expected generated question:
- four-digit subtraction
- minuend has tens or hundreds digit equal to 0
- borrow path passes through that zero
- metadata.algorithmConstraint = borrow_through_zero
```

### Borrow through zero negative cases

```text
Reject:
- no middle zero
- zero exists but is not in borrow path
- ordinary borrow unrelated to zero
- negative-result cases
```

Gate:

```text
QA3_GATE = PASS only if generator produces positive examples and avoids/rejects negative examples for all three P0 variants.
```

## QA4 Validator Variant QA

Required validator checks:

```text
- recompute numeric answer from operands
- recompute borrow profile from operands
- validate consecutive borrow profile
- validate borrow-through-zero profile
- validate missing digit uniqueness by enumeration
- reject answer mismatch
- reject metadata mismatch
- emit deterministic error codes from S43C4
```

Required reserved error-code coverage:

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

Gate:

```text
QA4_GATE = PASS only if valid P0 questions pass and invalid P0 questions fail with deterministic error codes.
```

## QA5 Worksheet Pipeline QA

Future worksheet QA must verify:

```text
- generated questions enter worksheetDocument.generatedQuestions
- display models are created without breaking existing S42 renderer path
- answer key items exist for numericAnswer rows
- missingDigitAnswer rows have an answer key representation
- grouped ordering works for one PatternGroup
- no C row becomes visible before selector QA
```

Gate:

```text
QA5_GATE = PASS only after worksheet generation and answer key paths work for implemented P0 variants.
```

## QA6 Visibility / Leakage QA

Required leakage checks:

```text
- D rows never appear in HTML selector
- D rows cannot be selected through query state
- D rows cannot be passed directly into resolver to generate worksheets
- hidden/internal A rows are not selectable until QA promotion
- C rows are not selectable until fine PatternSpec + generator + validator + QA pass
- mixed worksheet selection cannot bypass visibility gate
```

Gate:

```text
QA6_GATE = PASS only if unsupported, hidden, and not_selectable rows cannot leak into worksheet generation.
```

## Required Test Files for Future Implementation

Suggested future test files:

```text
tests/curriculum/batch-a/g3a-u02-subtraction-borrow-profile.test.js
tests/curriculum/batch-a/g3a-u02-fine-generator.test.js
tests/curriculum/batch-a/g3a-u02-fine-validator.test.js
tests/curriculum/batch-a/g3a-u02-registry-visibility.test.js
tests/curriculum/batch-a/g3a-u02-worksheet-pipeline.test.js
```

These are future implementation targets. S43C5 does not create them.

## Minimum Future Runtime Gate

Before any G3A-U02 C-class row may be promoted from hidden/internal to selector-visible, future implementation must prove:

```text
npm test PASS
QA1 PASS
QA2 PASS
QA3 PASS
QA4 PASS
QA5 PASS
QA6 PASS
selectable_ready count is changed only by explicit promotion task
D rows remain not_selectable
```

## Out of Scope

```text
- implementing tests
- implementing generator variants
- implementing validator variants
- creating fine PatternSpec JSON
- materializing C rows in registry JSON
- exposing any KnowledgePoint in HTML
- cross-unit selection
- deferred C rows
```

## S43C5 Gate

```text
S43C5_GATE = PASS_G3AU02_PROTOTYPE_QA_PLAN

PASS:
- QA1-QA6 layers defined
- A seed QA expectations defined
- D not_selectable QA expectations defined
- P0 C-class QA expectations defined
- positive and negative generator cases drafted
- validator error-code coverage drafted
- worksheet pipeline QA drafted
- leakage QA drafted
- future test file targets listed
- no runtime code changed

GAPS:
- tests not implemented yet
- fine PatternSpec JSON not materialized yet
- C rows not materialized in registry JSON yet
- generator variants not implemented yet
- validator variants not implemented yet
- HTML KnowledgePoint selector not implemented yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_G3AU02_GENERATOR_VALIDATOR_VARIANT_PLAN_LOCKED
GOAL_DISTANCE_AFTER  = D2_G3AU02_PROTOTYPE_QA_PLAN_LOCKED
DISTANCE_REDUCED     = S43 now has a QA gate for G3A-U02 registry, fine PatternSpec, generator, validator, worksheet, and leakage behavior before runtime implementation

G3A_U02_GeneratorValidatorPlan    100% -> 100%
G3A_U02_PrototypeQAPlan             0% -> 100%
G3A_U02_RuntimeImplementation       0% ->   0%
KPHTMLSelectablePath                0% ->   0%
S43Overall                         76% ->  79%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "tests 尚未 implemented",
  "fine PatternSpec JSON 尚未 materialized",
  "G3A-U02 C 類 rows 尚未 materialized",
  "generator variants 尚未 implemented",
  "validator variants 尚未 implemented",
  "HTML KnowledgePoint selector 尚未實作",
  "per-KP printable QA 尚未建立"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43D1_HTMLKnowledgePointSelectorDesign
```

S43D1 should design the HTML selector without exposing hidden/internal or not_selectable rows. Runtime implementation of the P0 variants should remain a separate later implementation path.
