# PGC-R08-A00 Public Generate Button End-to-End Authority and Matrix Freeze

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID    = PGC-R08-A00_PublicGenerateButtonEndToEndAuthorityAndMatrixFreeze
PR         = 483
STATUS     = PASS_R08_A00_PUBLIC_GENERATE_BUTTON_E2E_SCOPE_FROZEN
```

## Selected program

```text
PGC-R08_PublicGenerateButtonEndToEndAcceptance
```

R08 directly validates the actual public UI user journey. It does not accept direct Node execution, unit-test-only evidence, committed PDFs, metadata declarations, or PatternSpec existence as substitutes for browser operation.

## Preconditions

R07 is D0 closed on `main`:

```text
SURFACE_PROJECTION_GATE  = 12 / 12
RENDERER_BRANCH_GATE      = 4 / 4
ACCEPTANCE_DIMENSION_GATE = 7 / 7
REAL_CHROMIUM_PDF_COUNT   = 14
REPAIR_QUEUE_COUNT        = 0
```

Because R07 already proves Classic, fallback 404 and Pixel projection parity, R08 executes each canonical legal capability route once through Classic instead of multiplying the route matrix by three surfaces.

## Frozen matrix authority

```text
PUBLIC_SOURCE_COUNT       = 26
VISIBLE_KP_COUNT          = 193
CAPACITY_ROUTE_COUNT      = 1155
LEGAL_ROUTE_COUNT         = 793
ILLEGAL_ROUTE_COUNT       = 362
VERIFIED_20_ROUTE_COUNT   = 724
VERIFIED_LIMITED_COUNT    = 69
ZERO_CAPACITY_ROUTE_COUNT = 0
DIVERSITY_GAP_ROUTE_COUNT = 0
HARD_BLOCKER_COUNT        = 0
QUESTION_COUNT_PER_ROUTE  = 20
EXECUTION_SURFACE         = CLASSIC
ENTRY_PATH                = site/index.html
```

## Per-route public user journey

```text
OPEN_PUBLIC_UI
→ SELECT_KNOWLEDGE_POINT
→ SELECT_QUESTION_TYPE
→ SELECT_QUESTION_FORM
→ SELECT_DEPTH
→ SELECT_CONTEXT
→ INPUT_20_QUESTIONS
→ PRESS_GENERATE
→ CHECK_GENERATED_RESULT
→ PRESS_REGENERATE
→ OPEN_PREVIEW
→ EXECUTE_PRINT
→ VERIFY_ANSWER_KEY
```

## Nine blocking gates

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

Every legal route must generate exactly 20 questions and 20 answer-key items. Regenerate must preserve the selected capability route while changing the question identity. Browser console and page errors must remain zero.

## Required outputs

```text
data/curriculum/public-generation/public_generate_button_acceptance.json
docs/curriculum/output/public_capability_e2e_matrix.csv
docs/curriculum/output/failed_combination_report.md
tmp/browser_acceptance_artifacts/
```

## Ordered milestones

```text
A00  authority and matrix freeze
A01  legal-route browser acceptance matrix materialization
A02  public Generate-button canary and harness qualification
A03  all 793 legal routes browser execution
A04  failed-combination FullFix and replay
A05  final reconciliation and closeout
```

## Exact-head evidence

```text
ACCEPTED_HEAD_SHA        = 4ca1c2de53f8571c21238e24cc23640a7c9cb67f
NODE_WORKFLOW_RUN_ID     = 30563639136
NODE_WORKFLOW_RUN_NUMBER = 4409
PGC_R00_RUN_ID           = 30563638497
PGC_R00_RUN_NUMBER       = 189
FULL_REGRESSION          = 2717 / 2717 PASS
PGC_R00_GATE             = PASS
BROWSER_EXECUTION        = NOT_APPLICABLE_A00_SCOPE_FREEZE
```

## A00 non-actions

```text
Browser matrix execution  = forbidden
Route count mutation      = forbidden
Generator modification    = forbidden
Validator replacement     = forbidden
Renderer replacement      = forbidden
UI visual redesign        = forbidden
New workflow              = forbidden
Slice014                  = forbidden through R09
```

## Goal distance

```text
GOAL_DISTANCE_BEFORE = D1_R07_D0_CLOSED_PUBLIC_GENERATE_BUTTON_ALL_ROUTE_E2E_UNPROVEN
GOAL_DISTANCE_AFTER  = D1_R08_PUBLIC_GENERATE_BUTTON_E2E_SCOPE_AND_MATRIX_CONTRACT_FROZEN
DISTANCE_REDUCED     = selected R08 and froze the 793-route real public UI journey, nine blocking gates and browser artifact contract
REMAINING_BLOCKERS   = [LEGAL_ROUTE_BROWSER_MATRIX_NOT_MATERIALIZED, PUBLIC_GENERATE_BUTTON_CANARY_NOT_QUALIFIED, ALL_793_LEGAL_ROUTES_NOT_EXECUTED, FAILED_COMBINATION_QUEUE_NOT_RECONCILED]
NEXT_SHORTEST_STEP   = PGC-R08-A01_LegalRouteBrowserAcceptanceMatrixMaterialization
```
