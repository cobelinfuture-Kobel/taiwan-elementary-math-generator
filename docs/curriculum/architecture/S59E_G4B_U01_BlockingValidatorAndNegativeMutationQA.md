# S59E — G4B-U01 Blocking Validator and Negative Mutation QA

```text
CURRENT_MAJOR_TASK = S59_G4B_U01_HorizontalWorksheetPublicPrintPath
CURRENT_SUBTASK = S59E_G4B_U01_BlockingValidatorAndNegativeMutationQA
TASK_STATUS = HIDDEN_VALIDATED_RUNTIME
```

## Runtime

```text
site/modules/curriculum/batch-a/g4b-u01-horizontal-validator.js
```

The validator consumes S59D hidden questions and enforces the exact 24 blocking codes and 2 nonblocking warnings frozen by S59B.

## Validation stages

```text
1. identity_and_scope
2. representation_and_language
3. answer_model
4. multiplication_contract or division_contract
5. style_warnings
```

Validation is blocking: any error produces `ok = false`. The validated generator wrappers throw and return no question when blocking validation fails. Generic fallback remains forbidden.

## Blocking coverage

The 24-code contract covers:

- source/unit/kind and PatternSpec/KP/group identity;
- horizontal-only and no-application presentation;
- operand ranges and digit counts;
- multiplication result and maximum result boundaries;
- internal-zero, trailing-zero role and power-of-ten scaling;
- nonzero divisor and exact division identity;
- quotient range and digit count;
- nonnegative remainder less than the original divisor;
- exact-division and required-remainder policies;
- common trailing-zero metadata, reduced division and restored original remainder;
- answer-model fields and no-fallback lifecycle.

## Nonblocking warnings

```text
G4B_U01_REPEATED_SIGNATURE_WARNING
G4B_U01_LOW_CARRY_COMPLEXITY_WARNING
```

Warnings never change `ok = true` to a blocking failure.

## QA

The test layer verifies:

- exact code parity with S59B;
- 30 positive generations per PatternSpec;
- validated single and 240-question batch wrappers;
- 1000-question zero-blocking stress;
- a targeted mutation matrix reaching all 24 blocking codes;
- unknown PatternSpec rejection;
- both warning codes remain nonblocking.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D2_G4B_U01_HIDDEN_DETERMINISTIC_GENERATOR_IMPLEMENTED
GOAL_DISTANCE_AFTER  = D1_G4B_U01_BLOCKING_VALIDATED_HIDDEN_RUNTIME
DISTANCE_REDUCED     = all 12 generated families now pass a dedicated 24-code blocking validator and every blocking code has targeted negative-mutation coverage
REMAINING_BLOCKERS   = ["Visible lifecycle promotion not implemented", "Resolver/canonical router not connected", "Worksheet, UI and print not connected"]
NEXT_SHORTEST_STEP   = S59F_G4B_U01_PromotionLifecycleAndVisibleSelectorProjection
AUTO_CONTINUE_DECISION = CONTINUE after PR and main CI pass
STOP_REASON = NONE
```
