# PGC-R08 A02 — Public Generate Button Canary and Harness Qualification

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A02_PublicGenerateButtonCanaryAndHarnessQualification
STATUS = PENDING_CONSOLIDATED_CANARY_REMEDIATION_CI
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

Full Node regression, PGC-R00 and POSTG passed. Only the branch-specific Chromium canary step failed.

## Consolidated finding 1 — application mixed-KP binding

The first application witness used:

```text
pgc_r03_g3a_u01_3a01_application_078745248eea
```

The visible control selected `application`, but the retained PatternGroup state bound the numeric route. A02 does not silently remove this legal route and does not modify the product. The exact route remains in the 793-row A01 matrix and is promoted to the first A03 shard as an early sentinel.

For harness qualification, the application witness is replaced by the legal source-unit route:

```text
pgc_r03_g3a_u01_3a01_application_235abe098270
```

This isolates harness qualification from one route-specific binding question while preserving that question for the complete run.

## Consolidated finding 2 — VERIFIED_LIMITED semantics

The route:

```text
pgc_r03_g3a_u08_3a08_numeric_32207c12fa17
```

has historical `verifiedMaxQuestionCount = 6`, but the real public UI kept the exact route binding and produced 20 questions. Therefore `VERIFIED_LIMITED` is treated as a prior exact-evidence floor, not a required public UI clamp.

A02 now requires this route to pass all nine gates at 20 questions and records:

```text
LIVE_20_REQUALIFICATION_PASS
```

No capacity contract is mutated in A02. The witness enters a nonblocking capacity-evidence reconciliation queue for the complete A03 execution.

## Seven canaries

```text
6 baseline VERIFIED_20 positive routes
1 VERIFIED_LIMITED live-20 requalification route
7 / 7 must pass all nine gates
```

Coverage remains:

```text
question types  = application, mixed, numeric, pbl, concept, operation_estimation, reasoning
selection modes = sourceUnit, singleKnowledgePoint, mixedKnowledgePointsSameUnit
capacity status = VERIFIED_20, VERIFIED_LIMITED
```

## Browser control convergence

The remediation runner applies a deterministic convergence protocol:

1. select source and selection mode;
2. select exact KnowledgePoints;
3. select question type;
4. re-apply exact KnowledgePoints after question-type projection;
5. apply depth/context where applicable;
6. deselect incompatible PatternGroups;
7. select compatible PatternGroups until the exact capacity route is bound;
8. require the exact route ID from `data-capacity-route-ids` before Generate.

## Nine gates

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

Every canary requires 20 questions, 20 answer-key items, real Chromium A4 PDF, Print target invocation, a changed question identity after seed change, and zero browser console/page errors.

## Boundary

```text
product changes       = forbidden
capacity mutation     = forbidden
all-793 execution     = forbidden in A02
new workflow          = forbidden
Slice014              = frozen through PGC-R09
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_CANARY_BROWSER_EVIDENCE_PARTIALLY_PROVEN_REMEDIATION_REQUIRED
GOAL_DISTANCE_AFTER  = D1_R08_PUBLIC_GENERATE_BUTTON_CANARY_PENDING_REQUALIFICATION_CI
DISTANCE_REDUCED     = first-wave failures classified without product mutation; mixed application retained for A03 and limited capacity converted to live-20 requalification
REMAINING_BLOCKERS   = [CONSOLIDATED_CANARY_REMEDIATION_CI_NOT_RUN, ALL_793_LEGAL_ROUTES_NOT_EXECUTED]
NEXT_SHORTEST_STEP   = PGC-R08-A02_ConsolidatedCanaryRemediationExactHeadCI
```
