# PGC-R08-A02 Public Generate Button Canary and Harness Qualification

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R08-A02_PublicGenerateButtonCanaryAndHarnessQualification
STATUS     = PENDING_REAL_BROWSER_CANARY
```

## Canary scope

A02 qualifies one reusable public-UI browser harness before the 793-route execution.

```text
TOTAL_CANARY_ROUTES = 7
POSITIVE_ROUTES     = 6
DIAGNOSTIC_ROUTES   = 1
```

The set covers:

```text
selectionMode:
- sourceUnit
- singleKnowledgePoint
- mixedKnowledgePointsSameUnit

questionType:
- application
- mixed
- numeric
- pbl
- concept
- operation_estimation
- reasoning

capacityStatus:
- VERIFIED_20
- VERIFIED_LIMITED
```

## Positive route gate

Each of the six `VERIFIED_20` routes must pass all nine gates through actual DOM controls:

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

The harness must prove the exact target capacity route appears in `data-capacity-route-ids`; option text alone is insufficient.

## Limited-capacity diagnostic

One legal `VERIFIED_LIMITED` route requests 20 but has verified maximum 6.

```text
ROUTE_ID = pgc_r03_g3a_u08_3a08_numeric_32207c12fa17
REQUESTED = 20
VERIFIED_MAX = 6
```

A02 passes only if the harness captures this exact gap without dropping the route. The gap becomes a product repair queue item for A04; it is not treated as a harness failure.

## Real browser journey

Every canary starts from a fresh page and performs:

```text
open Classic UI
→ select source
→ select mode and exact KnowledgePoint IDs
→ select question type / depth / context
→ prove exact capacity route binding
→ request 20 questions
→ Generate
→ verify preview and answer bijection
→ produce real Chromium A4 PDF
→ invoke Print target
→ change seed and Regenerate
→ verify question identity changes for positive routes
```

## Frozen boundary

```text
Product UI modified     = false
Generator modified      = false
Validator modified      = false
Renderer modified       = false
Capacity routes mutated = false
All 793 routes executed = false
New workflow retained   = false
Slice014 started        = false
```

## Goal distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_LEGAL_ROUTE_BROWSER_ACCEPTANCE_MATRIX_MATERIALIZED
GOAL_DISTANCE_AFTER  = D1_R08_PUBLIC_GENERATE_BUTTON_CANARY_PENDING_BROWSER_QUALIFICATION
DISTANCE_REDUCED     = selected a seven-route set-cover canary and implemented a reusable public-UI browser harness
REMAINING_BLOCKERS   = [CANARY_BROWSER_HARNESS_NOT_EXECUTED, ALL_793_LEGAL_ROUTES_NOT_EXECUTED, FAILED_COMBINATION_QUEUE_NOT_RECONCILED]
NEXT_SHORTEST_STEP   = PGC-R08-A02_ExactHeadCanaryBrowserExecution
```
