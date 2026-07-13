# S87 G5A-U02 Class D Semantic Generator and Blocking Validator

```text
TASK = S87_G5A_U02_ClassDSemanticGeneratorAndBlockingValidator
STATUS = IMPLEMENTED_PENDING_CI
UNIT_ID = g5a_u02
UNIT_TITLE = 因數與公因數
```

## Scope

S87 implements deterministic hidden semantic generators and blocking validators for the eight S84 Class D PatternSpecs.

Included PatternSpecs:

- equal partition: all segment counts;
- equal partition: range-constrained recipients;
- remainder transfer under divisor relation;
- maximum equal grouping;
- possible equal packaging counts;
- rectangle-to-equal-square side lengths;
- square-tile area possibilities;
- source-bound multi-constraint digit code.

Excluded:

- source metadata correction;
- hidden projection binding for Class D;
- canonical resolver;
- public selector;
- worksheet integration;
- production use.

## Controlled semantics

Every generated item carries exactly one S84 template family and a fixed `semanticRole`. Free-form AI semantics and generic fallback are forbidden.

The digit-code runtime is source-bound to the unique tuple `1725`. The remainder-transfer runtime requires the larger divisor to be a multiple of the smaller divisor and requires the known remainder to be smaller than the smaller divisor.

## Runtime artifacts

```text
src/curriculum/g5a-u02/class-d-semantic-generator-validator.js
tests/curriculum/g5a-u02-class-d-semantic-generator-validator.test.js
```

## Blocking coverage

The validator recomputes canonical answers from item data and blocks:

- unknown or Class C PatternSpec IDs;
- template-family drift or missing semantic role;
- non-divisor partition/packaging answers;
- non-maximum equal grouping answers;
- invalid remainder divisor relation, range, or transferred remainder;
- rectangle side lengths that are not common divisors;
- tile areas not derived from valid square sides;
- any digit tuple other than source solution `1725`;
- lifecycle promotion, production use, free-form AI, or generic fallback.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_CLASS_C_RUNTIME_BOUND_TO_HIDDEN_PROJECTION
GOAL_DISTANCE_AFTER  = D1_G5A_U02_ALL_22_PATTERNS_HAVE_HIDDEN_RUNTIME_PENDING_CLASS_D_PROJECTION_QA
DISTANCE_REDUCED     = The remaining eight Class D semantic/application PatternSpecs now have deterministic generators and blocking validators.
REMAINING_BLOCKERS   = Class D hidden projection binding; metadata correction; canonical resolver; public selector; worksheet integration; production gate.
NEXT_SHORTEST_STEP   = S88_G5A_U02_ClassDRuntimeQAAndHiddenProjectionBinding
```
