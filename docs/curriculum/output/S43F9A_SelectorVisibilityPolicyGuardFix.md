# S43F9A — SelectorVisibilityPolicyGuardFix

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43F9A_SelectorVisibilityPolicyGuardFix
TASK_STATUS = PATCH_APPLIED_PENDING_LOCAL_TEST
```

## Problem

```text
Local npm test failed 311/312.
Failing test expected source-projection hidden/notSelectable counts from the older G3A-U02-only selector scope.
Source registries now include G3A-U01 hidden and D rows, so source-projection totals increased.
```

## Fix

```text
Updated tests/curriculum/batch-a/browser-registry-modules.test.js
```

The guard now checks:

```text
visibleCount = 1
hiddenPendingCount = 7
notSelectableCount = 4
visibleKnowledgePoints = [kp_g3a_u02_add_multi_carry]
```

## Scope Guard

```text
Runtime Alpha5 projection remains in source-pattern-index.js.
Browser selector visible KP policy remains unchanged.
No C-class or D-class selector exposure was added.
```

## Gate

```text
S43F9A_GATE = PATCH_APPLIED_PENDING_LOCAL_TEST
NEXT_LOCAL_COMMANDS = git fetch public; git switch --detach public/main; npm test; git status
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_S43F_ALPHA_RUNTIME_PROJECTED_BUT_SELECTOR_VISIBILITY_REGRESSION_FOUND
GOAL_DISTANCE_AFTER = D1_S43F_ALPHA_RUNTIME_PROJECTED_SELECTOR_GUARD_PATCHED_PENDING_TEST
DISTANCE_REDUCED = corrected the selector QA contract to protect visible KP count while accepting expanded hidden source registry rows
```
