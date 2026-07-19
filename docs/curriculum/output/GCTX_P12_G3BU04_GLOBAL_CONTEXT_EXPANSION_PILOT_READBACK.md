# GCTX-P12 G3B-U04 Global Context Expansion Pilot — Evidence-Level Correction

## Corrected status

```text
CANDIDATE_CONTENT_MERGED_RUNTIME_OUTPUT_NOT_INTEGRATED
ACTUAL_EVIDENCE_LEVEL=E2_CONTENT_AUTHORED
HUMAN_REVIEW_READY=false
```

PR #274 merged five new candidate question texts and their mathematical checks. It did not connect those candidates to the production-equivalent resolver, generator, worksheet renderer, HTML pipeline, or PDF pipeline.

The earlier status `PASS_MERGED_PENDING_HUMAN_REVIEW` was therefore too strong and has been withdrawn.

## What exists

The following five candidate contexts exist:

1. 班級園遊會籌備；
2. 戶外學習準備；
3. 運動練習預約；
4. 社區清潔準備；
5. 露營活動準備。

They preserve:

```text
KnowledgePoint  = kp_g3b_u04_add_then_divide
PatternSpec     = ps_g3b_u04_add_divide_joint_purchase_equal_share
Operation       = (a+b)/c
Question target = cost_per_person
Answer unit     = 元
```

Their standalone candidate preview and P01 structural validation remain valid as E2 evidence.

## What does not exist

```text
runtime integrated                    = false
production-equivalent generator used = false
production renderer used             = false
HTML output verified                  = false
PDF output verified                   = false
visible production output changed     = false
production selectable                 = false
runtime resolvable                    = false
human review ready                    = false
```

The standalone preview is not production-output evidence. The operator-provided worksheet PDF still contains the legacy contexts, so no worksheet or PDF change can be claimed.

## Historical CI interpretation

The earlier Node and Math CI runs proved only:

- candidate binding structure;
- candidate wording uniqueness;
- mathematical recomputation;
- candidate-level legacy-text exclusion;
- deterministic candidate preview generation.

They did not prove runtime, renderer, HTML, PDF, or production integration.

## Governance correction

P12 is now registered under:

```text
data/project/milestones/GCTX-P12.claim.json
```

The project-wide Milestone Claim Integrity gate blocks any future attempt to combine:

```text
actualEvidenceLevel = E2
runtimeIntegrated = false
pdfOutputVerified = false
visibleOutputChanged = false
humanReviewReady = true
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_G3BU04_CANDIDATE_TEXT_EXISTS
GOAL_DISTANCE_AFTER  = D2_GCTX_G3BU04_CANDIDATE_TEXT_EXISTS
DISTANCE_REDUCED     = 0
REMAINING_BLOCKERS   = [shadow runtime resolver, production-equivalent generator, production renderer, HTML visible-difference verification, PDF visible-difference verification, production-equivalent human review, production admission]
NEXT_SHORTEST_STEP   = GCTX-P12R_G3BU04GlobalContextPilotRuntimeRendererAndPDFFullFix
```

## Closeout

1. **Distance shortened:** none; this is a governance and status correction.
2. **System node advanced:** milestone claim integrity and task-state truthfulness.
3. **Blocker removed:** false Human Review readiness is removed.
4. **New blocker:** none; the existing runtime/renderer/PDF blockers are now represented accurately.
5. **Next shortest step:** connect the five candidate contexts to the production-equivalent pilot path and produce actual HTML/PDF evidence.

```text
STOP_REASON=NONE
LAST_COMPLETED_STATUS=CANDIDATE_CONTENT_MERGED_RUNTIME_OUTPUT_NOT_INTEGRATED
NEXT_RESUME_TASK=GCTX-P12R_G3BU04GlobalContextPilotRuntimeRendererAndPDFFullFix
```
