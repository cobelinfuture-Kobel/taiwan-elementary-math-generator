# S43C6 G3A-U02 Add Multi-Carry Strict Policy Decision

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C6_G3AU02_AddMultiCarryStrictPolicyDecision
TASK_STATUS = STRICT_CARRY_POLICY_PATH_SELECTED_NO_IMPLEMENTATION
WRITE_TYPE = docs_only_decision
```

## Roadmap Alignment

```text
ROADMAP_FILE = docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
ROADMAP_PHASE = S43C_G3AU02PrototypeAndFirstVisibleKPPath
ROADMAP_NEXT_EXPECTED_STEP = S43C6_G3AU02_AddMultiCarryStrictPolicyDecision
ROADMAP_ALIGNMENT = PASS
```

This task is roadmap-aligned and is a decision task only. It does not implement carry policy, does not change registry visibility, does not regenerate browser selector modules, and does not enable HTML KnowledgePoint modes.

## Inputs

```text
candidate knowledgePointId = kp_g3a_u02_add_multi_carry
candidate patternGroupId = pg_g3a_u02_add_multi_carry_seed
candidate patternSpecId = ps_g3a_u02_4digit_add_multi_carry
sourceId = g3a_u02_3a02
```

Previous QA state:

```text
PROMOTION_LEVEL_DECISION = NO_PROMOTION
STRICT_MULTI_CARRY_PROMOTION = BLOCKED
SEED_VISIBLE_WITH_WARNING = NOT_APPROVED_IN_S43C6B
CURRENT_VISIBLE_KP_COUNT = 0
CURRENT_SELECTOR_STATE = zero-visible sourceUnit-only safe mode
```

Current PatternSpec bridge readback:

```text
patternSpecId = ps_g3a_u02_4digit_add_multi_carry
sourceId = g3a_u02_3a02
title = 四位數加法
operator = ADD only
ranges = [[1000, 4999], [1000, 4999]]
answerMax = 9999
```

Current blocker:

```text
The PatternSpec bridge has no explicit carryPolicy / algorithmConstraint / validatorHooks.
The browser validator does not verify carry occurrence.
Therefore strict multi-carry cannot be promoted yet.
```

## Path Options Considered

### Path A — Strict carry-policy implementation and validator hook

```text
Decision = SELECTED
```

Meaning:

```text
The candidate remains semantically true to kp_g3a_u02_add_multi_carry.
The generator must generate only items with at least one carry occurrence.
The validator must be able to verify carry occurrence for the selected PatternSpec.
The registry row remains hidden until strict carry QA passes.
```

### Path B — Seed-visible-with-warning policy

```text
Decision = REJECTED_FOR_NOW
```

Reason:

```text
This would require changing the display and visibility contract from add_multi_carry to a weaker seed four-digit addition label.
It would make the first visible KP less semantically precise.
It risks normalizing coarse PatternSpec exposure before the first prototype proves strict constraint handling.
```

Path B remains available only through a future explicit roadmap revision or policy task if Path A proves infeasible.

### Path C — Abandon add_multi_carry and choose a lower-risk first visible KP

```text
Decision = REJECTED_FOR_NOW
```

Reason:

```text
The current materialized A-class G3A-U02 candidates are add_multi_carry and sub_multi_borrow.
Subtraction multi-borrow is higher risk because it must handle non-negative ordering and borrow-chain behavior.
No lower-risk A-class no-carry/single-carry candidate is currently materialized as a visible-ready PatternGroup.
Switching candidates now would expand scope and delay the prototype without solving the carry-policy gap.
```

## Final Decision

```text
S43C6_DECISION = PATH_A_STRICT_CARRY_POLICY
FIRST_VISIBLE_KP_CANDIDATE_REMAINS = kp_g3a_u02_add_multi_carry
STRICT_MULTI_CARRY_PROMOTION_REMAINS_BLOCKED_UNTIL_IMPLEMENTED_AND_QA_VERIFIED = true
SEED_VISIBLE_WITH_WARNING = not_selected
ALTERNATE_FIRST_KP = not_selected
REGISTRY_PROMOTION_ALLOWED_THIS_TASK = false
```

## Required Contract For S43C7

S43C7 must define a carry-policy contract before any implementation.

Minimum contract fields:

```text
carryPolicy.kind = addition_carry
carryPolicy.mode = at_least_one_carry
carryPolicy.operandPositions = [1, 2]
carryPolicy.base = 10
carryPolicy.scope = generated_question
carryPolicy.validatorRequired = true
```

Minimum helper contract:

```text
hasAdditionCarry(leftOperand, rightOperand, base = 10) -> boolean
```

Accepted strict condition:

```text
At least one digit column produces a carry from ones/tens/hundreds into the next place.
```

For two four-digit operands, valid strict examples:

```text
2358 + 1467  // ones carry 8 + 7 >= 10
4829 + 3194  // ones and tens carry may occur
```

Invalid strict examples:

```text
1234 + 1111  // no carry
2400 + 1200  // no carry
```

## Required Implementation Shape For S43C8 If Path A Remains Feasible

S43C8 may implement only after S43C7 contract is locked.

Recommended narrow implementation surface:

```text
- Add carryPolicy metadata to ps_g3a_u02_4digit_add_multi_carry in source-pattern-index bridge.
- Add Batch A bridge-level post-generation constraint filtering for addition carry.
- Add Batch A validator hook that verifies carryPolicy for generated questions.
- Do not modify unrelated global expression generator behavior unless unavoidable.
- Do not apply carryPolicy to other PatternSpecs in this task.
```

Expected runtime behavior after implementation:

```text
Every generated question for ps_g3a_u02_4digit_add_multi_carry must satisfy hasAdditionCarry(operand1, operand2).
Validator must reject a manually constructed no-carry question with this PatternSpec.
Existing sourceUnit generation must remain valid.
D rows remain not_selectable.
```

## Registry Promotion Boundary

Even after S43C6, these remain unchanged:

```text
KnowledgePointNode.htmlSelectableStatus = hidden
PatternGroup.visibilityStatus = hidden
Mapping.htmlExposurePolicy = internal_only
Mapping.qaStatus = smoke_test_required
Browser selector visibleCount = 0
HTML selector KP modes = disabled
```

Registry promotion is explicitly reserved for:

```text
S43C11_G3AU02_AddMultiCarryRegistryPromotionAfterQA
```

No registry promotion may occur before:

```text
- S43C7 contract locked
- S43C8 implementation if strict path selected
- S43C9 positive resolver fixture
- S43C10 visible-KP query survival patch
- test readback observed
```

## S43C6 Gate

```text
S43C6_GATE = PASS_STRICT_CARRY_POLICY_PATH_SELECTED_NO_IMPLEMENTATION

PASS:
- roadmap alignment checked and passed
- current candidate confirmed
- Path A / B / C compared
- Path A selected
- seed-visible-with-warning rejected for current prototype
- alternate candidate path rejected for current prototype
- S43C7 contract requirements defined
- S43C8 implementation boundary defined
- no registry visibility changed
- no browser selector module regenerated
- no HTML KP mode enabled
- no runtime code changed

GAPS:
- post-S43C6 npm test / CI not observed
- carry-policy contract not yet written as implementation contract artifact
- carryPolicy / validator hook not implemented
- strict carry occurrence still not QA-verified
- registry triplet remains hidden/internal
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_S43_ROADMAP_LOCKED_AND_TASK_CODE_DRIFT_CORRECTED
GOAL_DISTANCE_AFTER  = D1_STRICT_CARRY_POLICY_PATH_SELECTED
DISTANCE_REDUCED     = first visible-KP path ambiguity removed; S43 can now proceed through a strict carry-policy contract instead of unsafe promotion or weak seed visibility

RoadmapControl                       100% -> 100%
FirstVisibleKPPathDecision             0% -> 100%
FirstVisibleKPContract                 0% ->   0%
FirstVisibleKPRegistryPromotion         0% ->   0%
KPHTMLSelectablePath                   40% ->  42%
S43Overall                             99% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43C6 npm test PASS 尚未 observed",
  "S43C7 carry-policy contract 尚未 locked",
  "explicit carryPolicy / algorithmConstraint / validatorHooks 尚未 implemented",
  "browser validator 尚未驗證 carry occurrence",
  "strict carry constraint for ps_g3a_u02_4digit_add_multi_carry 尚未 QA-verified",
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
NEXT_SHORTEST_STEP = S43C7_G3AU02_AddMultiCarryCarryPolicyContract
```

S43C7 must lock the carry-policy contract before any runtime implementation or registry promotion.
