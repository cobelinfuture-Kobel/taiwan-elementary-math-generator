# S50 G3A-U06 UI Registry / Selector Integration — Pending Readback

```text
CURRENT_MAJOR_TASK = S50_G3AU06_UIRegistrySelector_Integration
CURRENT_SUBTASK = expose four new G3A-U06 KnowledgePoints in selector registry
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3a_u06_3a06
```

## Scope

```text
IN_SCOPE = [
  "visible KnowledgePoint registry rows",
  "PatternGroup rows",
  "G3A-U06 selector availability count",
  "selector registry tests"
]
OUT_OF_SCOPE = [
  "source-unit mixed allocation route",
  "worksheet/browser generator routing",
  "PDF smoke"
]
```

## New Visible Rows

```text
kp_g3a_u06_division_with_remainder = 二位數除以一位數有餘數
kp_g3a_u06_quotative_division_packaging = 包含除：分裝
kp_g3a_u06_partitive_division_equal_sharing = 等分除：平分
kp_g3a_u06_parity_range_missing_digit = 奇偶數條件判斷
```

## Count Update

```text
G3A-U06 visibleCount: 2 -> 6
Batch A total visibleCount: 19 -> 23
```

## Files Updated

```text
site/modules/curriculum/registry/batch-a-selector-equation-extension.js
tests/curriculum/g3a-u06-new-kp-selector-registry.test.js
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U06_NEW_KP_STANDALONE_GENERATORS_CHECKS_TESTS_IMPLEMENTED_PENDING_READBACK
GOAL_DISTANCE_AFTER  = D1_G3A_U06_NEW_KP_SELECTOR_REGISTRY_CONNECTED_PENDING_READBACK
DISTANCE_REDUCED     = four new G3A-U06 KPs are now visible selector registry candidates with PatternGroup and PatternSpec links
REMAINING_BLOCKERS   = ["CI readback pending", "source-unit mixed allocation not yet connected", "worksheet route not yet connected", "PDF smoke deferred"]
NEXT_SHORTEST_STEP   = S51_G3AU06_MixedRandomAllocationOrderingQA
```
