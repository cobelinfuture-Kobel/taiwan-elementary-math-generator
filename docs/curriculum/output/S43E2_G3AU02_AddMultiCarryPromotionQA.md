# S43E2 G3A-U02 Add Multi-Carry Promotion QA

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E2_G3AU02_AddMultiCarryPromotionQA
TASK_STATUS = QA_GUARD_ADDED_STRICT_PROMOTION_BLOCKED_PENDING_TEST_READBACK
WRITE_TYPE = promotion_qa_test_plus_docs
```

S43E2 executes promotion QA for the first candidate selected by S43E1:

```text
FIRST_VISIBLE_PROMOTION_CANDIDATE = kp_g3a_u02_add_multi_carry
PATTERN_GROUP = pg_g3a_u02_add_multi_carry_seed
PATTERN_SPEC = ps_g3a_u02_4digit_add_multi_carry
SOURCE_ID = g3a_u02_3a02
```

This task does not promote the registry triplet, does not regenerate browser selector modules, does not enable HTML KnowledgePoint modes, and does not wire the resolver into worksheet generation.

## Files Created

```text
tests/curriculum/batch-a/g3a-u02-add-multi-carry-promotion-qa.test.js
docs/curriculum/output/S43E2_G3AU02_AddMultiCarryPromotionQA.md
```

## QA Readback Summary

### GATE 1 — PatternSpec readback

```text
STATUS = PASS_SEED_PATTERN_EXISTS
```

Readback:

```text
patternSpecId = ps_g3a_u02_4digit_add_multi_carry
sourceId = g3a_u02_3a02
kind = expression
operator = ADD only
ranges = [[1000, 4999], [1000, 4999]]
answerConstraint.max = 9999
answerConstraint.allowNegative = false
answerConstraint.requireInteger = true
```

Interpretation:

```text
The candidate can remain an A-class seed four-digit addition PatternSpec.
```

### GATE 2 — Generator smoke QA

```text
STATUS = STATIC_SEED_SUPPORT_CONFIRMED_RUNTIME_SMOKE_NOT_OBSERVED
```

Readback:

```text
PatternGroup.generatorSupportStatus = seed_supported
PatternGroup.htmlWorksheetStatus = seed_printable
PatternGroup.answerKeyStatus = seed_supported
```

No post-S43E2 local runtime generation readback was observed in this task.

### GATE 3 — Carry constraint QA

```text
STATUS = FAIL_STRICT_MULTI_CARRY_NOT_VERIFIED
```

Reason:

```text
The current PatternSpec bridge does not expose an explicit carryPolicy, algorithmConstraint, or validatorHooks field.
The current difficultyTags remain only ["batch_a_browser_bridge"].
The browser validator checks answer correctness and source/pattern availability, but it does not verify carry occurrence.
```

Decision:

```text
PROMOTION_LEVEL_DECISION = NO_PROMOTION
STRICT_MULTI_CARRY_PROMOTION = BLOCKED
SEED_VISIBLE_WITH_WARNING = NOT_APPROVED_IN_S43E2
```

S43E2 does not allow ambiguous promotion. The row must remain hidden until either:

```text
A. explicit carry policy / validator hook exists and strict carry QA passes, or
B. a separate seed-visible-with-warning policy task changes the display label and visibility contract explicitly.
```

### GATE 4 — Resolver positive fixture

```text
STATUS = NOT_EXECUTED_BLOCKED_BY_ZERO_VISIBLE_REGISTRY
```

Reason:

```text
The browser selector projection remains visibleCount = 0.
A true positive resolver fixture requires a QA-approved visible candidate or an isolated fixture that does not mutate production registry visibility.
```

### GATE 5 — Selector query survival

```text
STATUS = NOT_EXECUTED_BLOCKED_BY_ZERO_VISIBLE_REGISTRY
```

Reason:

```text
Query-state currently drops hidden / D IDs and sourceUnit remains the only safe mode. No visible KP exists yet.
```

### GATE 6 — Browser registry regen

```text
STATUS = NOT_EXECUTED_NO_REGISTRY_VISIBILITY_CHANGE
```

Reason:

```text
No registry triplet was promoted; therefore browser selector modules were not regenerated.
Current selector projection must remain visibleCount = 0, hiddenPendingCount = 2, notSelectableCount = 2.
```

## Promotion QA Guard Test Coverage

Added test:

```text
tests/curriculum/batch-a/g3a-u02-add-multi-carry-promotion-qa.test.js
```

It verifies:

```text
- ps_g3a_u02_4digit_add_multi_carry exists as a four-digit addition seed
- operator is ADD only
- ranges and answer constraints are consistent with current browser bridge
- kp_g3a_u02_add_multi_carry remains hidden / qa_pending
- pg_g3a_u02_add_multi_carry_seed remains hidden / qa_pending
- map_g3a_u02_add_multi_carry_seed remains internal_only / smoke_test_required / constraint_warning
- strict multi-carry promotion is blocked because carryPolicy / algorithmConstraint / validatorHooks are absent
- browser selector projection remains visibleCount = 0
- D-class G3A-U02 rows remain not_selectable
```

## Registry State Preserved

```text
KnowledgePointNode.htmlSelectableStatus = hidden
KnowledgePointNode.holdReason = qa_pending
PatternGroup.visibilityStatus = hidden
PatternGroup.holdReason = qa_pending
Mapping.htmlExposurePolicy = internal_only
Mapping.qaStatus = smoke_test_required
Mapping.holdReason = constraint_warning
Browser selector visibleCount = 0
HTML selector KP modes = disabled
```

## S43E2 Gate

```text
S43E2_GATE = PASS_PROMOTION_QA_GUARD_ADDED_STRICT_PROMOTION_BLOCKED_PENDING_TEST_READBACK

PASS:
- first candidate QA executed for kp_g3a_u02_add_multi_carry
- PatternSpec seed readback passed
- registry triplet hidden/internal status verified
- D-class prohibition verified
- strict multi-carry promotion blocked by explicit guard
- no registry visibility changed
- no browser selector module regenerated
- no HTML selector mode enabled
- no KP worksheet generation enabled

BLOCKED:
- strict carry occurrence is not QA-verified
- no explicit carryPolicy / algorithmConstraint / validatorHooks exists on PatternSpec bridge
- browser validator does not verify carry occurrence
- resolver positive fixture not executed
- visible-KP query survival not implemented
- post-S43E2 npm test / CI not observed
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_FIRST_VISIBLE_KP_PROMOTION_PLAN_LOCKED
GOAL_DISTANCE_AFTER  = D1_FIRST_VISIBLE_KP_QA_GUARD_ADDED_PROMOTION_BLOCKED
DISTANCE_REDUCED     = S43 now has executable QA guard coverage preventing unsafe first-KP promotion; the candidate remains blocked until carry constraint support exists

FirstVisibleKPPromotionPlanning       100% -> 100%
FirstVisibleKPQA                        0% ->  45%
FirstVisibleKPRegistryPromotion         0% ->   0%
KPHTMLSelectablePath                   35% ->  38%
S43Overall                             99% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43E2 npm test PASS 尚未 observed",
  "strict carry constraint for ps_g3a_u02_4digit_add_multi_carry 尚未 QA-verified",
  "explicit carryPolicy / algorithmConstraint / validatorHooks 尚未 exists",
  "browser validator 尚未驗證 carry occurrence",
  "resolver positive visible-KP fixture 尚未 implemented",
  "future visible-KP query survival 尚未 implemented",
  "registry triplet 尚未 promoted to selectable/visible/eligible_after_qa",
  "browser selector modules 尚未 regenerated with visibleCount = 1",
  "HTML KP modes 尚未 enabled for visible candidate",
  "fine PatternSpec JSON 尚未 materialized",
  "generator/validator variants 尚未 implemented"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43E2R1_CIOrLocalTestReadback
```

S43E2R1 should obtain `npm test` or GitHub CI readback after adding the promotion QA guard test. The next implementation decision should not promote the row until test readback is available and a carry-policy path is explicitly selected.
