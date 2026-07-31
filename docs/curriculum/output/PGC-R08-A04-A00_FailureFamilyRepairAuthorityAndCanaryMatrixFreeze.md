# PGC-R08 A04 A00 — Failure Family Repair Authority and Canary Matrix Freeze

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A04-A00_FailureFamilyRepairAuthorityAndCanaryMatrixFreeze
STATUS = FROZEN_PENDING_FOCUSED_REPRODUCTION
BASE_MERGE_SHA = b08bb13df355158b1d634970a0d6857359007610
```

## Scope

A03 classified all 793 legal browser routes and materialized 327 failures into five SHA-bound families plus 35 capacity-evidence reconciliation routes. A00 converts those queues into one diagnostic-first repair order. It does not modify the public UI, generator, validator, renderer or capacity authority.

```text
FAILED_ROUTES = 327
FAILURE_FAMILIES = 5
FAILURE_CANARIES = 17
CAPACITY_RECONCILIATION_ROUTES = 35
CAPACITY_CANARIES = 5
```

## Frozen repair order

1. Disabled question/context controls: 180 routes.
2. Route binding convergence: 136 routes.
3. Question-type state settlement: 9 routes.
4. Regenerate identity: 2 routes.
5. Capacity evidence reconciliation: 35 routes.
6. Full 793-route browser replay.

## Diagnostic-first rule

```text
PER_ROUTE_PATCH = forbidden
PRODUCT_MUTATION_BEFORE_FAMILY_CLASSIFICATION = forbidden
FAMILY_REPAIR = required
AFFECTED_FAMILY_REPLAY = required
FULL_793_REPLAY = required
```

A disabled control may be treated as a harness issue only when its existing public value already equals the requested authority and the harness does not bypass product capability. A product fix is authorized only after a focused canary proves a legal route cannot be reached through supported public controls.

## Canary coverage

- Route binding: 4 routes covering early mixed-application, G5A-U08 mixed, reasoning, and late G6A application.
- Question-type disabled: 4 routes covering numeric, application, mixed, and source-unit selection.
- State settlement: 3 application routes across G3A, G3B and G5A.
- Context disabled: all 4 affected source-unit routes.
- Regenerate identity: both affected routes.
- Capacity evidence: 5 routes covering prior verified maxima 1, 6, 8, 9 and 15.

Authority: `data/curriculum/public-generation/PGC-R08-A04-A00.failure-family-repair-canary-matrix.json`.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_REPAIR_AND_RECONCILIATION_QUEUES_MATERIALIZED
GOAL_DISTANCE_AFTER  = D1_R08_REPAIR_AUTHORITY_ORDER_AND_CANARY_MATRIX_FROZEN
DISTANCE_REDUCED     = 327 failures converted into five bounded diagnostic families with representative canaries and one repair order
REMAINING_BLOCKERS   = [FIVE_FAILURE_FAMILIES_NOT_REPRODUCED, THIRTY_FIVE_CAPACITY_ROUTES_NOT_RECONCILED]
NEXT_SHORTEST_STEP   = PGC-R08-A04-A01_DisabledControlSemanticsFocusedReproduction
```
