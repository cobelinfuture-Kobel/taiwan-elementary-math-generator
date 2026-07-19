# GCTX-P12 — G3B-U04 Candidate Context Content Architecture

## Correct evidence classification

```text
ACTUAL_EVIDENCE_LEVEL = E2_CONTENT_AUTHORED
STATUS = CANDIDATE_CONTENT_MERGED_RUNTIME_OUTPUT_NOT_INTEGRATED
```

P09–P11 normalized legacy semantic authorities and prepared candidate structures. P12 added five new fixed candidate question texts for one existing PatternSpec. It did not connect those candidates to the production-equivalent resolver, generator, renderer, HTML, or PDF pipeline.

The earlier label `NEW_VISIBLE_CONTEXT_CANDIDATES_RENDERED_FOR_HUMAN_REVIEW` is withdrawn because the only rendered artifact was a standalone preview.

## Locked mathematical authority

```text
KnowledgePoint  = kp_g3b_u04_add_then_divide
PatternSpec     = ps_g3b_u04_add_divide_joint_purchase_equal_share
ContextFamily   = gctx_cf_g3b_u04_add_divide_joint_purchase_equal_share
Operation       = (a+b)/c
Question target = cost_per_person
Answer unit     = TWD
```

## Candidate contexts

1. class festival preparation;
2. field-learning preparation;
3. sports-practice booking;
4. community-cleanup preparation;
5. camping-activity preparation.

They differ across event purpose, activity/place scope, actor relationship, cost-object pair, language variant, and semantic fingerprint. Their candidate mathematical recomputation remains valid.

## Standalone preview boundary

```text
docs/curriculum/output/GCTX_P12_G3BU04_GLOBAL_CONTEXT_EXPANSION_PILOT_PREVIEW.html
```

This file is classified as:

```text
standalone_candidate_preview_not_production_evidence
```

It may demonstrate authored wording. It cannot prove:

- canonical resolver integration;
- production-equivalent generation;
- worksheet renderer integration;
- HTML output acceptance;
- PDF output acceptance;
- visible change in the generated worksheet;
- Human Review readiness;
- production admission.

## Current claims

```text
dataStructureReady                 = true
contentAuthored                    = true
runtimeIntegrated                  = false
productionEquivalentGeneratorUsed = false
productionRendererUsed             = false
htmlOutputVerified                 = false
pdfOutputVerified                  = false
visibleOutputChanged               = false
humanReviewReady                   = false
productionAdmitted                 = false
d0Complete                         = false
```

These claims are registered in:

```text
data/project/milestones/GCTX-P12.claim.json
```

## Human Review boundary

P12 is not ready for production-equivalent Human Review. Candidate wording review is also not requested by the current task state.

Human Review may become ready only after the exact production-equivalent resolver, generator, renderer, HTML, and PDF artifacts are generated and hashed under E4.

## Next implementation path

```text
candidate content
→ shadow runtime resolver
→ production-equivalent generator
→ production renderer
→ HTML visible-difference gate
→ PDF visible-difference gate
→ production-equivalent Human Review
→ production admission
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_G3BU04_CANDIDATE_TEXT_EXISTS
GOAL_DISTANCE_AFTER  = D2_GCTX_G3BU04_CANDIDATE_TEXT_EXISTS
DISTANCE_REDUCED     = 0
REMAINING_BLOCKERS   = [shadow runtime resolver, production-equivalent generator, production renderer, HTML visible-difference verification, PDF visible-difference verification, production-equivalent human review, production admission]
NEXT_SHORTEST_STEP   = GCTX-P12R_G3BU04GlobalContextPilotRuntimeRendererAndPDFFullFix
```
