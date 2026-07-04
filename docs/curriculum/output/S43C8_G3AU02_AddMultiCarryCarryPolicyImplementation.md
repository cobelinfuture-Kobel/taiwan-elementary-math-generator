# S43C8 G3A-U02 Add Multi-Carry CarryPolicy Implementation

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C8_G3AU02_AddMultiCarryCarryPolicyImplementation
TASK_STATUS = CARRY_POLICY_IMPLEMENTED_PENDING_TEST_READBACK
WRITE_TYPE = runtime_code_plus_tests_plus_docs
```

## Roadmap Alignment

```text
ROADMAP_FILE = docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
ROADMAP_PHASE = S43C_G3AU02PrototypeAndFirstVisibleKPPath
ROADMAP_NEXT_EXPECTED_STEP = S43C8_G3AU02_AddMultiCarryImplementationIfStrictPathSelected
ROADMAP_ALIGNMENT = PASS
```

S43C8 implements the strict carry-policy path selected in S43C6 and contracted in S43C7. This task does not promote registry visibility and does not enable HTML KnowledgePoint modes.

## Files Changed

```text
site/modules/curriculum/batch-a/carry-policy.js
site/modules/curriculum/batch-a/source-pattern-index.js
site/modules/curriculum/batch-a/batch-a-browser-generator.js
site/modules/curriculum/batch-a/batch-a-browser-validator.js
tests/curriculum/batch-a/g3a-u02-add-multi-carry-promotion-qa.test.js
tests/curriculum/batch-a/g3a-u02-add-multi-carry-carry-policy.test.js
docs/curriculum/output/S43C8_G3AU02_AddMultiCarryCarryPolicyImplementation.md
```

## Implementation Summary

### 1. Carry policy helper module

Added:

```text
site/modules/curriculum/batch-a/carry-policy.js
```

Exports:

```text
BATCH_A_CARRY_POLICY_ISSUE_CODES
hasAdditionCarry(leftOperand, rightOperand, base, options)
hasAdditionCarryIntoTenThousands(leftOperand, rightOperand, base)
extractBatchAExpressionOperandValues(expression)
validateBatchAQuestionCarryPolicy(definition, question)
```

The helper implements standard column-by-column addition carry with incoming carry included from lower place values.

Reserved issue codes implemented:

```text
batch_a_carry_policy_missing
batch_a_carry_policy_operator_unsupported
batch_a_carry_policy_operand_count_invalid
batch_a_addition_carry_required_not_satisfied
batch_a_addition_carry_overflow_not_allowed
```

### 2. Target PatternSpec carryPolicy metadata

Updated `ps_g3a_u02_4digit_add_multi_carry` to expose:

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

Non-target expression PatternSpecs expose `carryPolicy = null` and remain unaffected by the addition-carry hook.

### 3. Generation enforcement

Updated Batch A browser generation path:

```text
site/modules/curriculum/batch-a/batch-a-browser-generator.js
```

Behavior:

```text
- if definition.carryPolicy is absent, generation path remains unchanged
- if definition.carryPolicy is present, generator retries deterministic seed variants
- each generated candidate is checked with validateBatchAQuestionCarryPolicy
- no-carry candidates are rejected before being returned
- if no compliant candidate is produced, generation fails with batch_a_carry_policy_generation_exhausted
```

### 4. Validator enforcement

Updated Batch A browser validator:

```text
site/modules/curriculum/batch-a/batch-a-browser-validator.js
```

Behavior:

```text
- validates final answer correctness as before
- applies carryPolicy hook for PatternSpecs with carryPolicy
- rejects target PatternSpec questions without at least one checked-column carry
- rejects unsupported operator / operand-count cases for carryPolicy
- rejects carry into ten-thousands when not allowed
```

### 5. Tests

Updated existing promotion QA guard so the target PatternSpec is allowed to expose carryPolicy while registry remains hidden/internal.

Added focused test file:

```text
tests/curriculum/batch-a/g3a-u02-add-multi-carry-carry-policy.test.js
```

Coverage:

```text
- hasAdditionCarry true for 2358 + 1467
- hasAdditionCarry true for 4829 + 3194
- hasAdditionCarry true for 1099 + 1001 with incoming carry behavior
- hasAdditionCarry false for 1234 + 1111
- hasAdditionCarry false for 2400 + 1200
- target PatternSpec exposes locked carryPolicy metadata
- generated target PatternSpec questions all satisfy carryPolicy
- validator rejects no-carry manually constructed target PatternSpec question
- validator accepts valid carry target PatternSpec question
- non-target subtraction PatternSpec remains unaffected
```

## Registry and Selector Boundary Preserved

S43C8 intentionally does not change registry production visibility:

```text
KnowledgePointNode.htmlSelectableStatus = hidden
PatternGroup.visibilityStatus = hidden
Mapping.htmlExposurePolicy = internal_only
Mapping.qaStatus = smoke_test_required
Browser selector visibleCount = 0
HTML selector KP modes = disabled
```

Registry promotion remains reserved for:

```text
S43C11_G3AU02_AddMultiCarryRegistryPromotionAfterQA
```

## S43C8 Gate

```text
S43C8_GATE = PASS_CARRY_POLICY_IMPLEMENTED_PENDING_TEST_READBACK

PASS:
- roadmap alignment checked and passed
- carryPolicy helper implemented
- target PatternSpec carryPolicy metadata added
- generator carryPolicy filtering implemented
- validator carryPolicy hook implemented
- reserved issue codes implemented
- focused S43C8 tests added
- promotion QA guard updated for carryPolicy presence
- non-target PatternSpecs remain carryPolicy-null
- registry visibility unchanged
- browser selector visibleCount intentionally unchanged
- HTML KP modes not enabled

GAPS:
- post-S43C8 npm test / CI not observed
- runtime QA not yet operator-confirmed
- resolver positive visible-KP fixture not implemented
- visible-KP query survival not implemented
- registry triplet remains hidden/internal
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_CARRY_POLICY_CONTRACT_LOCKED
GOAL_DISTANCE_AFTER  = D1_CARRY_POLICY_IMPLEMENTED_PENDING_TEST_READBACK
DISTANCE_REDUCED     = strict carryPolicy now exists in runtime metadata, generation filtering, validator enforcement, and tests; first-KP promotion remains blocked until test readback and later resolver/query/registry gates

FirstVisibleKPContract               100% -> 100%
FirstVisibleKPImplementation           0% ->  80%
FirstVisibleKPRuntimeQA                0% ->  40%
FirstVisibleKPRegistryPromotion         0% ->   0%
KPHTMLSelectablePath                   45% ->  50%
S43Overall                             99% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43C8 npm test PASS 尚未 observed",
  "S43C8 runtime QA 尚未 operator-confirmed",
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
NEXT_SHORTEST_STEP = S43C8R1_CIOrLocalTestReadback
```

S43C8R1 should obtain post-S43C8 `npm test` or observable CI readback before moving to resolver fixture or registry promotion steps.
