# S59D — G4B-U01 Hidden Deterministic Horizontal Generator

```text
CURRENT_MAJOR_TASK = S59_G4B_U01_HorizontalWorksheetPublicPrintPath
CURRENT_SUBTASK = S59D_G4B_U01_HiddenDeterministicHorizontalGenerator
TASK_STATUS = HIDDEN_RUNTIME
```

## Runtime

```text
site/modules/curriculum/batch-a/g4b-u01-horizontal-generator.js
```

The generator consumes only the 12 hidden S59C PatternSpecs and produces pure horizontal calculation questions. It does not expose any selector, canonical route or production path.

## Supported families

```text
3-digit × 3-digit
4-digit × 3-digit
internal-zero multiplier
multiplier trailing zero
multiplicand trailing zero
both factors trailing zero
power-of-ten multiplication
3-digit ÷ 3-digit, one-digit quotient
4-digit ÷ 3-digit, two-digit quotient
4-digit ÷ 3-digit, one-digit quotient
trailing-zero exact division
trailing-zero division with restored original remainder
```

## Deterministic contracts

```text
single question replay = exact object equality
batch count = exact
allocation = balanced by selected PatternSpec
ordering = grouped or deterministic shuffled
maximum hidden batch count = 1000
validator failure = throw, no fallback
```

## Output lifecycle

Every question remains:

```text
kind = g4bU01HorizontalCalculation
phase = S59D
representation = horizontal_only
applicationText = false
selectorStatus = hidden
generatorRouting = hidden_only_not_canonical
productionUse = forbidden
```

## Arithmetic safeguards

- multiplication answers are exact safe integers and at most 9,999,999;
- each zero-position family enforces its exact factor role;
- quotient digit count matches the PatternSpec;
- every division satisfies `dividend = divisor × quotient + remainder`;
- every remainder satisfies `0 ≤ remainder < divisor`;
- exact trailing-zero division has zero remainder;
- restored-remainder division stores both reduced and original-scale remainder values.

## QA

The test layer covers:

- all 12 PatternSpecs;
- repeated-seed deterministic replay;
- 30–50 samples for zero-position and division boundaries;
- exact 240-question equal allocation;
- 257-question grouped/shuffled membership parity;
- 1000-question balanced stress;
- invalid selection, count, order and sequence rejection;
- arithmetic and lifecycle mutation blocking.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D2_G4B_U01_HIDDEN_PATTERNSPECS_MATERIALIZED
GOAL_DISTANCE_AFTER  = D2_G4B_U01_HIDDEN_DETERMINISTIC_GENERATOR_IMPLEMENTED
DISTANCE_REDUCED     = all 12 PatternSpecs can generate deterministic, exact-count, balanced horizontal questions including quotient/remainder and restored-remainder models
REMAINING_BLOCKERS   = ["Dedicated 24-code blocking validator not implemented", "Selector, canonical router, worksheet, UI and print not connected"]
NEXT_SHORTEST_STEP   = S59E_G4B_U01_BlockingValidatorAndNegativeMutationQA
AUTO_CONTINUE_DECISION = CONTINUE after PR and main CI pass
STOP_REASON = NONE
```
