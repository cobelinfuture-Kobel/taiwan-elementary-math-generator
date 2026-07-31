# PGC-R08 A04 A02 — Disabled Control Harness Policy Repair and Family Replay

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A04-A02_DisabledControlHarnessPolicyRepairAndFamilyReplay
STATUS = PENDING_180_ROUTE_BROWSER_ARTIFACT
```

## Scope

Apply the A01-authorized disabled-control selection policy to a shared browser adapter and replay all 180 routes from the two affected repair families through the existing nine-gate `executeRoute` path.

```text
QUESTION_TYPE_CONTROL_DISABLED = 176
CONTEXT_MODE_CONTROL_DISABLED = 4
TARGET_ROUTE_COUNT = 180
WORKER_CONCURRENCY = 6
PRODUCT_MUTATION = false
CAPACITY_AUTHORITY_MUTATION = false
```

## Policy

```text
ENABLED_CONTROL = select requested value and verify settlement
DISABLED_CURRENT_VALUE_MATCH = accept without mutation
DISABLED_VALUE_MISMATCH = fail closed
```

The adapter wraps Playwright pages. It does not modify the public UI, source authority, generator, validator, renderer or route definitions.

## Acceptance

```text
TERMINAL = 180 / 180
PASS = 180
FAIL = 0
ALL_NINE_GATES_PASS = 180
BROWSER_CONSOLE_ERRORS = 0
BROWSER_PAGE_ERRORS = 0
```

A temporary branch-only workflow uploads the exact browser report and policy dispositions. It must be removed after artifact readback and before merge.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_DISABLED_CONTROL_HARNESS_POLICY_CONFIRMED_REPAIR_PENDING
GOAL_DISTANCE_AFTER  = D1_R08_DISABLED_CONTROL_180_ROUTE_REPLAY_PENDING
DISTANCE_REDUCED     = shared harness policy implemented and all affected routes scheduled for full nine-gate replay
REMAINING_BLOCKERS   = [DISABLED_CONTROL_180_ROUTE_BROWSER_REPLAY_NOT_TERMINAL, FOUR_OTHER_REPAIR_PHASES_PENDING]
NEXT_SHORTEST_STEP   = READ_A02_180_ROUTE_BROWSER_ARTIFACT_AND_CLOSE_DISABLED_CONTROL_FAMILIES
```
