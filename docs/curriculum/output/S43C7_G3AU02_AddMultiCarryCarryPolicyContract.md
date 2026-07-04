# S43C7 G3A-U02 Add Multi-Carry CarryPolicy Contract

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C7_G3AU02_AddMultiCarryCarryPolicyContract
TASK_STATUS = CARRY_POLICY_CONTRACT_LOCKED_NO_IMPLEMENTATION
WRITE_TYPE = docs_only_contract
```

## Roadmap Alignment

```text
ROADMAP_FILE = docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
ROADMAP_PHASE = S43C_G3AU02PrototypeAndFirstVisibleKPPath
ROADMAP_NEXT_EXPECTED_STEP = S43C7_G3AU02_AddMultiCarryCarryPolicyOrSeedVisibleContract
ROADMAP_ALIGNMENT = PASS
```

Roadmap sequence allows S43C7 after S43C6 and before any S43C8 implementation. This contract chooses the strict carry-policy branch already selected by S43C6.

## Non-Scope

```text
- no runtime implementation
- no source-pattern-index modification
- no generator modification
- no validator modification
- no registry triplet promotion
- no browser selector module regeneration
- no HTML KnowledgePoint mode enablement
- no positive resolver fixture yet
```

## Target PatternSpec

```text
sourceId = g3a_u02_3a02
knowledgePointId = kp_g3a_u02_add_multi_carry
patternGroupId = pg_g3a_u02_add_multi_carry_seed
patternSpecId = ps_g3a_u02_4digit_add_multi_carry
operator = ADD only
operand count = 2
operand ranges = [[1000, 4999], [1000, 4999]]
answerMax = 9999
```

## CarryPolicy Object Contract

S43C8 must add a `carryPolicy` object to the target browser PatternSpec bridge only.

```js
carryPolicy: {
  kind: "addition_carry",
  mode: "at_least_one_carry",
  operandPositions: [1, 2],
  base: 10,
  scope: "generated_question",
  validatorRequired: true,
  checkedColumns: ["ones", "tens", "hundreds"],
  allowCarryIntoTenThousands: false
}
```

### Field semantics

```text
kind = addition_carry
  Only addition carry detection is in scope. Subtraction borrow is not included.

mode = at_least_one_carry
  A question passes if at least one checked column creates a carry into the next place.

operandPositions = [1, 2]
  The carry check uses operand 1 and operand 2 only. Extra operands are out of scope for this PatternSpec.

base = 10
  Decimal place-value addition only.

scope = generated_question
  The constraint applies to each generated question, not just to a worksheet-level sample.

validatorRequired = true
  Validator must reject questions for this PatternSpec when carryPolicy is not satisfied.

checkedColumns = ["ones", "tens", "hundreds"]
  Carries from ones to tens, tens to hundreds, and hundreds to thousands are allowed evidence.

allowCarryIntoTenThousands = false
  Since answerMax = 9999, generated questions must not require carry from thousands into ten-thousands.
```

## Helper Contract

S43C8 must implement or expose a deterministic helper equivalent to:

```js
hasAdditionCarry(leftOperand, rightOperand, base = 10, options = {}) -> boolean
```

Minimum expected behavior:

```text
INPUT:
- leftOperand: integer
- rightOperand: integer
- base: integer, default 10
- options.checkedColumns: optional place-column list; default ["ones", "tens", "hundreds"]
- options.allowCarryIntoTenThousands: optional boolean; default false

OUTPUT:
- true if at least one checked column has digitLeft + digitRight + incomingCarry >= base
- false otherwise
```

Important carry definition:

```text
Carry is column-by-column standard vertical addition carry.
Incoming carry from a previous lower column must be included when evaluating the next column.
```

This means:

```text
1099 + 1001:
ones: 9 + 1 = 10, carry yes

tens: 9 + 0 + incoming 1 = 10, carry yes

hundreds: 0 + 0 + incoming 1 = 1, no new carry

result: true
```

## Column Index Contract

```text
ones column      = 10^0
tens column      = 10^1
hundreds column  = 10^2
thousands column = 10^3
```

For S43C8 strict add-multi-carry implementation:

```text
checkedColumns = ones, tens, hundreds
thousands column carry is not accepted because it would exceed answerMax = 9999
```

If a candidate has only a thousands-column overflow:

```text
6000 + 5000 = 11000
```

it must be rejected because it violates both carryPolicy boundary and answerMax.

## Acceptance Examples

### Valid strict examples

```text
2358 + 1467 = 3825
ones: 8 + 7 = 15 → carry
PASS

4829 + 3194 = 8023
ones: 9 + 4 = 13 → carry
tens: 2 + 9 + 1 = 12 → carry
PASS

1099 + 1001 = 2100
ones: 9 + 1 = 10 → carry
tens: 9 + 0 + 1 = 10 → carry
PASS

4095 + 1086 = 5181
ones: 5 + 6 = 11 → carry
tens: 9 + 8 + 1 = 18 → carry
hundreds: 0 + 0 + 1 = 1 → no new carry
PASS
```

### Invalid no-carry examples

```text
1234 + 1111 = 2345
no checked column produces carry
FAIL

2400 + 1200 = 3600
no checked column produces carry
FAIL

3001 + 1002 = 4003
no checked column produces carry
FAIL
```

### Invalid overflow examples

```text
6000 + 5000 = 11000
thousands overflow and answerMax violation
FAIL

4999 + 4999 = 9998
ones/tens/hundreds carry exists, but thousands receives carry without overflowing beyond 9999
PASS because answer is within 9999 and checked columns carry exists
```

Note: `4999 + 4999 = 9998` has carries through checked columns and remains within answerMax. It is valid even though the thousands digit changes because no ten-thousands place is produced.

## Generator Contract For S43C8

S43C8 strict implementation must ensure:

```text
For every generated question with patternSpecId = ps_g3a_u02_4digit_add_multi_carry:
- operator list is ADD only
- operand count is 2
- operands are integers
- operands are within configured ranges
- final answer is integer
- final answer <= 9999
- final answer is non-negative
- hasAdditionCarry(operand1, operand2, 10, carryPolicy) = true
```

Recommended implementation surface:

```text
Batch A bridge-level post-generation constraint filtering is preferred.
Global expression generator should not be modified unless strictly necessary.
CarryPolicy must not be applied to unrelated PatternSpecs.
```

Generator failure behavior:

```text
If no valid carry-satisfying candidate can be generated within max attempts, generation must fail with a deterministic issue code instead of silently degrading to no-carry addition.
```

Reserved generator issue code:

```text
batch_a_carry_policy_generation_exhausted
```

## Validator Contract For S43C8

S43C8 validator hook must ensure:

```text
For every generated or supplied question with patternSpecId = ps_g3a_u02_4digit_add_multi_carry:
- parse/recover the two operands used by the expression
- confirm operator is ADD
- confirm carryPolicy exists
- run hasAdditionCarry(operand1, operand2, carryPolicy.base, carryPolicy)
- reject if false
```

Reserved validator issue codes:

```text
batch_a_carry_policy_missing
batch_a_carry_policy_operator_unsupported
batch_a_carry_policy_operand_count_invalid
batch_a_addition_carry_required_not_satisfied
batch_a_addition_carry_overflow_not_allowed
```

Severity:

```text
All carryPolicy violations are blocking errors for this PatternSpec.
Warnings are not sufficient for strict carry-policy path.
```

## Test Contract For S43C8

S43C8 must add tests that cover at least:

```text
1. hasAdditionCarry true for 2358 + 1467
2. hasAdditionCarry true for 4829 + 3194
3. hasAdditionCarry true for 1099 + 1001, proving incoming carry is included
4. hasAdditionCarry false for 1234 + 1111
5. hasAdditionCarry false for 2400 + 1200
6. target PatternSpec exposes carryPolicy
7. generated sample set for target PatternSpec all satisfy carryPolicy
8. validator rejects no-carry manually constructed target PatternSpec question
9. validator accepts valid carry target PatternSpec question
10. non-target PatternSpecs remain unaffected
```

## Registry and Selector Boundary

S43C7 does not alter production visibility.

The following must remain true until S43C11:

```text
KnowledgePointNode.htmlSelectableStatus = hidden
PatternGroup.visibilityStatus = hidden
Mapping.htmlExposurePolicy = internal_only
Mapping.qaStatus = smoke_test_required
Browser selector visibleCount = 0
HTML selector KP modes = disabled
```

S43C8 may add implementation and tests only. S43C8 may not promote registry rows.

## S43C7 Gate

```text
S43C7_GATE = PASS_CARRY_POLICY_CONTRACT_LOCKED_NO_IMPLEMENTATION

PASS:
- roadmap alignment checked and passed
- strict carry-policy path contract locked
- carryPolicy object shape defined
- helper contract defined
- column and incoming-carry behavior defined
- acceptance and rejection examples defined
- generator contract defined
- validator contract defined
- reserved issue codes defined
- S43C8 test contract defined
- registry and selector boundaries preserved
- no runtime code changed
- no registry visibility changed

GAPS:
- post-S43C7 npm test / CI not observed
- carryPolicy not implemented
- validator hook not implemented
- strict carry occurrence not QA-verified by runtime tests
- registry triplet remains hidden/internal
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_STRICT_CARRY_POLICY_PATH_SELECTED
GOAL_DISTANCE_AFTER  = D1_CARRY_POLICY_CONTRACT_LOCKED
DISTANCE_REDUCED     = strict carry-policy path now has an implementation-ready contract for generator filtering, validator hooks, issue codes, and tests while preserving hidden registry state

FirstVisibleKPPathDecision           100% -> 100%
FirstVisibleKPContract                 0% -> 100%
FirstVisibleKPImplementation           0% ->   0%
FirstVisibleKPRegistryPromotion         0% ->   0%
KPHTMLSelectablePath                   42% ->  45%
S43Overall                             99% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43C7 npm test PASS 尚未 observed",
  "S43C8 carryPolicy implementation 尚未 completed",
  "explicit carryPolicy / validatorHooks 尚未 implemented in runtime",
  "browser validator 尚未驗證 carry occurrence",
  "strict carry constraint for ps_g3a_u02_4digit_add_multi_carry 尚未 runtime QA-verified",
  "resolver positive visible-KP fixture 尚未 implemented",
  "future visible-KP query survival 尚未 implemented",
  "registry triplet 尚未 promoted to selectable/visible/eligible_after_qa",
  "browser selector modules 尚未 regenerated with visibleCount = 1",
  "HTML KP modes 尚未 enabled for visible candidate",
  "S43E 13-unit KP expansion 尚未開始"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C8_G3AU02_AddMultiCarryCarryPolicyImplementation
```

S43C8 may implement the strict carry-policy path defined here, but it must still not promote registry visibility.
