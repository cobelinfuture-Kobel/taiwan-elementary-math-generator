# S46 G3A-U06 Division With Remainder — Pending Readback

```text
CURRENT_MAJOR_TASK = S46_G3AU06_DivisionWithRemainder_Implementation
CURRENT_SUBTASK = implement PatternSpec contract, generator, local checker, and tests for 二位數除以一位數有餘數
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3a_u06_3a06
KNOWLEDGE_POINT_ID = kp_g3a_u06_division_with_remainder
PATTERN_SPEC_ID = ps_g3a_u06_division_with_remainder
```

## Scope

```text
IN_SCOPE = [
  "PatternSpec contract availability",
  "standalone generator for quotient / remainder questions",
  "standalone checker for quotient / remainder constraints",
  "automated tests"
]
OUT_OF_SCOPE = [
  "UI registry visibility",
  "worksheet route integration",
  "mixed allocation",
  "browser PDF smoke"
]
```

## Implementation

```text
1. Added PatternSpec contract to source-pattern-submiddle-extension.js.
2. Added generator module: site/modules/curriculum/batch-a/g3a-u06-remainder-generator.js.
3. Added checker module: site/modules/curriculum/batch-a/g3a-u06-remainder-check.js.
4. Added test file: tests/curriculum/g3a-u06-division-with-remainder.test.js.
```

## Contract

```text
kind = divisionWithRemainder
dividend range = 10..99
divisor range = 2..9
quotient >= 1
0 < remainder < divisor
dividend = divisor * quotient + remainder
answerText shape = "{quotient} 餘 {remainder}"
blankedDisplayText shape = "{dividend} ÷ {divisor} = ___ 餘 ___"
```

## Validation Required

```text
Math CI Readback must pass.
Expected local npm test count increases by 2 tests.
UI and PDF smoke are deferred to S50-S52.
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_G3A_U06_NEW_KP_FORMAL_MAPPING_READY
GOAL_DISTANCE_AFTER  = D1_G3A_U06_DIVISION_WITH_REMAINDER_GENERATOR_CHECKER_TESTS_IMPLEMENTED
DISTANCE_REDUCED     = 二位數除以一位數有餘數 advanced from mapping contract to generator/checker/test implementation
REMAINING_BLOCKERS   = ["CI readback pending", "not yet visible in UI", "worksheet route not yet connected", "PDF smoke deferred"]
NEXT_SHORTEST_STEP   = S47_G3AU06_QuotativeDivisionPackaging_Implementation
```
