# PGC-R08 A04 A02 — Disabled-Control Harness Policy Repair and Family Replay

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A04-A02_DisabledControlHarnessPolicyRepairAndFamilyReplay
STATUS = PENDING_CLASSIFIED_180_ROUTE_BROWSER_ARTIFACT
```

## Authorized repair

A01 classified all eight exact-browser canaries as `DISABLED_CURRENT_VALUE_MATCH`. A02 therefore changes browser harness semantics only:

```text
ENABLED_CONTROL
→ select requested value and verify settlement

DISABLED_CONTROL + CURRENT_VALUE == REQUESTED_VALUE
→ accept without mutation

DISABLED_CONTROL + CURRENT_VALUE != REQUESTED_VALUE
→ fail closed with PGC_R08_DISABLED_CONTROL_VALUE_MISMATCH
```

## Replay scope

```text
QUESTION_TYPE_CONTROL_DISABLED = 176 routes
CONTEXT_MODE_CONTROL_DISABLED = 4 routes
TOTAL = 180 routes
WORKER_CONCURRENCY = 6
```

Every route reuses the canonical A03 nine-gate executor:

```text
UI_OPTIONS_PASS
GENERATE_BUTTON_PASS
QUESTION_COUNT_PASS
QUESTION_IDENTITY_PASS
ANSWER_VALIDATION_PASS
REGENERATE_PASS
HTML_PASS
PDF_PASS
ANSWER_KEY_PASS
```

## First two exact-head attempts

Both attempts used head `fa80f696441cd585c7ff85145e6539ff90899144` and produced the same terminal classification:

```text
EXECUTED = 180
TERMINAL = 180
DISABLED_CONTROL_SEMANTICS_PASS = 180
FULL_NINE_GATE_PASS = 179
DOWNSTREAM_FAILURE = 1
BROWSER_CONSOLE_ERRORS = 0
BROWSER_PAGE_ERRORS = 0
```

Exact artifacts:

```text
ATTEMPT_1_ARTIFACT_ID = 8782555787
ATTEMPT_1_DIGEST = sha256:36844f6a84e3bb16dc3edcd47e2ce17e4b313264a9c1cd69f46854a216458584

ATTEMPT_2_ARTIFACT_ID = 8782645885
ATTEMPT_2_DIGEST = sha256:48044c2861a89dee5c43ff12156157545e80347e5f371b149f67244a8c2d1cc6
```

The same route failed at the same later gate in both attempts:

```text
ROUTE_INDEX = 297
ROUTE_ID = pgc_r03_g4b_u06_4b06_application_243390fad850
SOURCE_ID = g4b_u06_4b06
DISABLED_CONTROL_GATE = PASS
GENERATE / 20 QUESTIONS / ANSWERS / HTML / PDF / ANSWER_KEY = PASS
REGENERATE_PASS = PENDING
ERROR = page.waitForFunction timeout after seed-B generation
```

This is not a residual disabled-control failure. It is a reproducible overlapping `REGENERATE_IDENTITY_TIMEOUT` and remains unresolved.

## Classified downstream handoff

A02 may close the disabled-control family only when:

1. all 180 routes reach `UI_OPTIONS_PASS`;
2. every full-journey failure is either absent or exactly the frozen route-297 handoff;
3. the route-297 handoff has all eight other gates at `PASS`, `REGENERATE_PASS=PENDING`, and zero browser errors;
4. the handoff is added to the later regenerate-family authority;
5. the final nine-gate obligation is retained.

Any other route or gate failure remains CI-blocking.

## Frozen boundaries

```text
PUBLIC_UI_MUTATION = false
GENERATOR_MUTATION = false
VALIDATOR_MUTATION = false
RENDERER_MUTATION = false
CAPACITY_AUTHORITY_MUTATION = false
PER_ROUTE_PATCH = false
FINAL_NINE_GATE_OBLIGATION_RELAXED = false
```

## Acceptance

```text
EXECUTED = 180
TERMINAL = 180
DISABLED_CONTROL_SEMANTICS_PASS = 180
FULL_NINE_GATE_PASS >= 179
CLASSIFIED_REGENERATE_HANDOFF <= 1
UNCLASSIFIED_FAILURE = 0
BROWSER_CONSOLE_ERRORS = 0
BROWSER_PAGE_ERRORS = 0
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_DISABLED_CONTROL_HARNESS_POLICY_CONFIRMED_REPAIR_PENDING
GOAL_DISTANCE_AFTER  = D1_R08_DISABLED_CONTROL_FAMILIES_REPLAY_AND_DOWNSTREAM_HANDOFF_PENDING
DISTANCE_REDUCED     = all 180 disabled-control routes now reach UI_OPTIONS_PASS; one reproducible later-family regeneration failure is retained instead of hidden
REMAINING_BLOCKERS   = [CLASSIFIED_180_ROUTE_ARTIFACT_PENDING, ROUTE_BINDING_FAMILY_PENDING, QUESTION_TYPE_SETTLEMENT_FAMILY_PENDING, REGENERATE_IDENTITY_FAMILY_PENDING_WITH_ROUTE_297_HANDOFF, CAPACITY_RECONCILIATION_PENDING, FULL_793_REPLAY_PENDING]
NEXT_SHORTEST_STEP   = READ_A02_CLASSIFIED_180_ROUTE_BROWSER_ARTIFACT_AND_MATERIALIZE_READBACK
```
