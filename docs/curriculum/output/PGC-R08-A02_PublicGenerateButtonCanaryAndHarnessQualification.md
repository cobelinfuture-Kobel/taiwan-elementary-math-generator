# PGC-R08 A02 — Public Generate Button Canary and Harness Qualification

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A02_PublicGenerateButtonCanaryAndHarnessQualification
STATUS = PASS_R08_A02_PUBLIC_GENERATE_BUTTON_CANARY_HARNESS_QUALIFIED
```

## Scope

A02 qualifies a reusable real-browser harness before the 793-route execution. It changes no product UI, generator, validator, renderer, capacity authority, KnowledgePoint, PatternGroup or PatternSpec.

## First-wave evidence

```text
HEAD_SHA       = 225ed9ecdabcf16213a8ce6ba52c637d824b1c52
NODE_RUN       = 30566725234
ARTIFACT_ID    = 8769214934
ARTIFACT_SHA256= 417386f1ea7450ebfdf906b4cd06150ac13bd2fbb8ad0e3427011a377927e51a
CANARY_PASS    = 5 / 7
```

Full Node regression, PGC-R00 and POSTG passed. The first browser wave exposed two harness-contract findings rather than product defects.

## Consolidated finding 1 — application mixed-KP binding

The first application witness used `pgc_r03_g3a_u01_3a01_application_078745248eea`. The visible control selected `application`, but the retained PatternGroup state bound the numeric route. A02 does not silently remove this legal route and does not modify the product. The route remains in the 793-row A01 matrix and becomes the first A03 early sentinel.

For harness qualification, the application witness was replaced by the legal source-unit route `pgc_r03_g3a_u01_3a01_application_235abe098270`.

## Consolidated finding 2 — VERIFIED_LIMITED semantics

Route `pgc_r03_g3a_u08_3a08_numeric_32207c12fa17` has historical `verifiedMaxQuestionCount = 6`, but the public UI retained the exact route binding and produced 20 questions. Therefore `VERIFIED_LIMITED` is a prior exact-evidence floor, not a required public UI clamp.

A02 required this route to pass all nine gates at 20 questions and recorded `LIVE_20_REQUALIFICATION_PASS`. No capacity contract was mutated. The witness enters the A03 capacity-evidence reconciliation queue.

## Browser control convergence

The accepted runner:

1. selects source and selection mode;
2. selects exact KnowledgePoints;
3. selects question type;
4. reapplies exact KnowledgePoints after question-type projection;
5. applies depth/context where applicable;
6. deselects incompatible PatternGroups;
7. selects compatible PatternGroups until the exact capacity route is bound;
8. requires the exact route ID from `data-capacity-route-ids` before Generate.

## Accepted remediation evidence

```text
ACCEPTED_HEAD                  = 8ab6b88512ae0d6ec7e075b0c1b7a2c5a192460b
NODE_RUN                       = 30589551864 / #4423
PGC_R00_RUN                    = 30589551796
POSTG_RUN                      = 30589551782
ARTIFACT_ID                    = 8777892286
ARTIFACT_SHA256                = 787e82b7806cb4452d1ce7852dec724cadb648244c05c759d3aead2c4c3d1c7f
CANARY_GATE                    = 7 / 7
LIVE_20_REQUALIFICATION       = 1 / 1
REAL_CHROMIUM_PDF             = 7
BROWSER_CONSOLE_ERRORS        = 0
BROWSER_PAGE_ERRORS           = 0
PRODUCT_REPAIR_QUEUE          = 0
CAPACITY_EVIDENCE_QUEUE       = 1
```

All seven routes produced 20 questions, 20 answer-key records, a real Chromium A4 PDF, a working Print target and a distinct regenerated question identity. All nine gates passed for every route.

## Boundary

```text
product changes       = forbidden / unchanged
capacity mutation     = forbidden / unchanged
all-793 execution     = deferred to A03
new workflow          = forbidden
Slice014              = frozen through PGC-R09
```

## Closeout distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_CANARY_BROWSER_EVIDENCE_PARTIALLY_PROVEN_REMEDIATION_REQUIRED
GOAL_DISTANCE_AFTER  = D1_R08_PUBLIC_GENERATE_BUTTON_HARNESS_QUALIFIED
DISTANCE_REDUCED     = seven real-browser canaries passed all nine gates; one historical VERIFIED_LIMITED route was requalified at twenty questions without product or capacity mutation
REMAINING_BLOCKERS   = [ALL_793_LEGAL_ROUTES_NOT_EXECUTED, A03_EARLY_SENTINEL_NOT_REPLAYED, CAPACITY_EVIDENCE_RECONCILIATION_PENDING_A03]
NEXT_SHORTEST_STEP   = PGC-R08-A03_AllLegalRoutesBrowserAcceptanceExecution
```
