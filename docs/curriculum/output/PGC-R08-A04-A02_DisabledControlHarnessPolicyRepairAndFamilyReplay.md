# PGC-R08 A04 A02 — Disabled Control Harness Policy Repair and Family Replay

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A04-A02_DisabledControlHarnessPolicyRepairAndFamilyReplay
STATUS = PENDING_CLASSIFIED_180_ROUTE_BROWSER_ARTIFACT
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

## Three exact reproductions

Three exact browser artifacts independently produced the same classification:

```text
ARTIFACT_1 = workflow-run 30602744902 / attempt 1 / artifact 8782555787
DIGEST_1   = sha256:36844f6a84e3bb16dc3edcd47e2ce17e4b313264a9c1cd69f46854a216458584

ARTIFACT_2 = workflow-run 30602744902 / attempt 2 / artifact 8782645885
DIGEST_2   = sha256:48044c2861a89dee5c43ff12156157545e80347e5f371b149f67244a8c2d1cc6

ARTIFACT_3 = workflow-run 30603122800 / artifact 8782694763
DIGEST_3   = sha256:657637d3c161612e1c45d577a2d093fe77eef84c21e09eb80b3569c7a93597e2
```

Each artifact reported:

```text
TERMINAL = 180 / 180
DISABLED_CURRENT_VALUE_MATCH = 180
DISABLED_VALUE_MISMATCH = 0
DISABLED_CONTROL_SEMANTICS_PASS = 180
FULL_NINE_GATE_PASS = 179
BROWSER_CONSOLE_ERRORS = 0
BROWSER_PAGE_ERRORS = 0
```

The same route failed at the same later gate each time:

```text
ROUTE_INDEX = 297
ROUTE_ID = pgc_r03_g4b_u06_4b06_application_243390fad850
SOURCE_ID = g4b_u06_4b06
ORIGINAL_QUEUE_FAMILY = CONTEXT_MODE_CONTROL_DISABLED
UI_OPTIONS_PASS = PASS
GENERATE_BUTTON_PASS = PASS
QUESTION_COUNT_PASS = PASS
QUESTION_IDENTITY_PASS = PASS
ANSWER_VALIDATION_PASS = PASS
HTML_PASS = PASS
PDF_PASS = PASS
ANSWER_KEY_PASS = PASS
REGENERATE_PASS = PENDING
ERROR = page.waitForFunction timeout after seed-B generation
```

This route is no longer a disabled-control failure. It is a reproducible overlapping `REGENERATE_IDENTITY_TIMEOUT` and must remain unresolved until the later regenerate-family repair.

## Classified handoff rule

A02 closes the two disabled-control families only when:

1. all 180 routes record `UI_OPTIONS_PASS`;
2. `DISABLED_VALUE_MISMATCH=0`;
3. at least 179 routes pass all nine gates;
4. any non-passing route is exactly route 297 with the eight listed gates at `PASS` and `REGENERATE_PASS=PENDING`;
5. no browser console or page errors exist;
6. the final nine-gate obligation for route 297 remains active.

An unlisted route or different failed gate is CI-blocking. This does not reduce the final R08 acceptance standard.

## Acceptance

```text
TERMINAL = 180 / 180
DISABLED_CONTROL_SEMANTICS_PASS = 180
DISABLED_CURRENT_VALUE_MATCH >= 180
DISABLED_VALUE_MISMATCH = 0
FULL_NINE_GATE_PASS >= 179
CLASSIFIED_REGENERATE_HANDOFF <= 1
UNCLASSIFIED_FAILURE = 0
BROWSER_CONSOLE_ERRORS = 0
BROWSER_PAGE_ERRORS = 0
```

A temporary branch-only workflow uploads the exact browser report and policy dispositions. It must be removed after artifact readback and before merge.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_DISABLED_CONTROL_HARNESS_POLICY_CONFIRMED_REPAIR_PENDING
GOAL_DISTANCE_AFTER  = D1_R08_DISABLED_CONTROL_180_ROUTE_CLASSIFIED_REPLAY_PENDING
DISTANCE_REDUCED     = all 180 affected routes now clear disabled-control semantics; route 297 is retained as a later-family regenerate blocker instead of hidden or misclassified
REMAINING_BLOCKERS   = [CLASSIFIED_180_ROUTE_BROWSER_ARTIFACT_PENDING, ROUTE_BINDING_FAMILY_PENDING, QUESTION_TYPE_SETTLEMENT_FAMILY_PENDING, REGENERATE_IDENTITY_FAMILY_PENDING_WITH_ROUTE_297_HANDOFF, CAPACITY_RECONCILIATION_PENDING, FULL_793_REPLAY_PENDING]
NEXT_SHORTEST_STEP   = READ_A02_CLASSIFIED_180_ROUTE_BROWSER_ARTIFACT_AND_CLOSE_DISABLED_CONTROL_FAMILIES
```
