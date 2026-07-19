# GCTX-P12 — G3B-U04 Global Context Expansion Pilot and Rendered Difference Gate

## 1. Milestone correction

P09–P11 completed legacy-context extraction, candidate reference admission, and human-review infrastructure. They did not create new learner-facing contexts and did not change public worksheet output.

P12 therefore does not continue the prior `legacy parity = completion` interpretation. Its acceptance evidence must contain rendered question text that is visibly different from the four legacy prompts.

```text
P09–P11 = LEGACY_CONTEXT_MIGRATION_AND_REVIEW_INFRASTRUCTURE_READY
P12     = NEW_VISIBLE_CONTEXT_CANDIDATES_RENDERED_FOR_HUMAN_REVIEW
```

P12 does not retroactively claim that P09–P11 changed production content.

## 2. Locked scope

P12 is limited to one existing mathematical authority:

```text
KnowledgePoint  = kp_g3b_u04_add_then_divide
PatternSpec     = ps_g3b_u04_add_divide_joint_purchase_equal_share
ContextFamily   = gctx_cf_g3b_u04_add_divide_joint_purchase_equal_share
Operation       = (a+b)/c
Question target = cost_per_person
Answer unit     = TWD
```

The existing PatternSpec, KnowledgePoint, quantity-role mapping, event order, question target, validator authority, and answer-unit policy are preserved.

The pilot introduces five exact semantic variants:

1. class festival preparation;
2. field-learning preparation;
3. sports-practice booking;
4. community-cleanup preparation;
5. camping-activity preparation.

Each variant owns a different event purpose, activity/place scope, actor relationship, pair of cost objects, language variant, and semantic fingerprint.

## 3. Why these are semantic variants, not runtime mutation

GCTX-P01 allows deterministic selection only among pre-approved components. It forbids runtime replacement of the context family, semantic slots, event flow, and question role.

P12 complies by materializing five complete candidate `ApprovedSemanticBinding`-shaped records. The generator is not permitted to improvise a context or transform a legacy binding at runtime.

```text
allowed after approval:
select one exact admitted semantic variant
select one admitted language variant
select one admitted numeric profile

forbidden:
free-form context invention
noun-only reskin treated as breadth
context-family replacement at runtime
event-flow mutation
question-target mutation
generic fallback
```

The five variants remain in the existing exact shared-cost context family because their mathematical meaning is still:

```text
two shared costs
→ combine the costs
→ divide by the same payer group
→ ask cost per person
```

Their breadth is created by complete fixed activity bindings, not by pretending that each surface topic is a different mathematical family.

## 4. Learner-visible difference evidence

P12 includes a standalone review artifact:

```text
docs/curriculum/output/GCTX_P12_G3BU04_GLOBAL_CONTEXT_EXPANSION_PILOT_PREVIEW.html
```

The artifact displays:

- one legacy baseline prompt;
- five new rendered prompts;
- the same numeric witness `(60 + 90) ÷ 5 = 30`;
- the changed semantic axes for each prompt;
- the current candidate-only boundary.

The rendered prompts contain no legacy sandwich, notebook, ticket, or tent prompt copy.

## 5. Deterministic validation

The P12 builder performs four classes of blocking checks.

### 5.1 P01 structural validation

Every new binding is passed through the existing P09 `validateP01CandidateBinding` validator. A binding is blocked for missing slots, quantities, event references, unit-flow edges, question-role references, validation hooks, answer policy, or candidate lifecycle state.

### 5.2 Visible-content validation

Each rendered question must visibly contain:

- both costs `a` and `b`;
- payer count `c`;
- the per-person payment target;
- the admitted fixed language template.

Legacy prompt phrases are blocking.

### 5.3 Mathematical recomputation

The validator independently recomputes:

```text
answer = (a+b)/c
```

It blocks non-positive quantities, non-integral results, equation drift, answer drift, and answer-unit drift.

### 5.4 Semantic-breadth evidence

The five records must have unique:

- event-purpose IDs;
- place/activity asset IDs;
- actor asset IDs;
- cost-object pairs;
- semantic fingerprints;
- rendered prompts;
- context-domain IDs.

A noun-only reskin cannot satisfy this gate.

## 6. Human review boundary

P12 creates five review packets. Each packet contains the actual rendered prompt, equation, quantities, answer, mathematical witness, changed axes, and preserved axes.

Every review decision remains null:

```text
semanticReview.status     = pending_human_review
semanticReview.decision   = null
mathematicalReview.status = pending_human_review
mathematicalReview.decision = null
```

Automatic approval is forbidden. Until P13 records a human decision, all five bindings remain:

```text
lifecycleStatus   = candidate
productionSelectable = false
runtimeResolvable    = false
```

## 7. Explicit non-scope

P12 does not change:

- the formal approved-binding registry;
- public selector choices;
- the canonical G3B-U04 resolver;
- the production generator route;
- the worksheet renderer;
- public HTML/PDF output;
- the 32 legacy PatternSpecs or 117 legacy family-context variants;
- other curriculum units.

The preview artifact is review evidence, not production output.

## 8. Acceptance target

```text
P01 candidate bindings              = 5
P01 binding errors                  = 0
rendered prompts                    = 5
unique rendered prompts             = 5
unique context domains              = 5
unique semantic fingerprints        = 5
legacy prompts in candidate output  = 0
mathematical recomputation errors   = 0
production-selectable bindings      = 0
runtime-resolvable bindings         = 0
human review packets                = 5
human decisions                     = 0
```

## 9. Distance readback

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_G3BU04_LEGACY_CONTEXT_STRUCTURE_READY
GOAL_DISTANCE_AFTER  = D2_GCTX_G3BU04_NEW_VISIBLE_CONTEXT_PILOT_PENDING_CI_AND_HUMAN_REVIEW
DISTANCE_REDUCED     = five exact learner-visible context candidates, P01 bindings, mathematical witnesses, and rendered review evidence now exist beyond the four legacy prompts
REMAINING_BLOCKERS   = [CI acceptance, merge, human semantic review, human mathematical review, formal production admission, runtime resolver integration, public HTML/PDF verification]
NEXT_SHORTEST_STEP   = GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission
```

## 10. Task-closeout interpretation

1. **Distance segment shortened:** legacy-only candidate evidence → new rendered context candidates.
2. **System node advanced:** Global Context candidate registry and review-evidence node.
3. **Blocker removed:** no learner-visible new context existed for the pilot PatternSpec.
4. **New blocker added:** the five exact rendered prompts require human semantic and mathematical approval before production admission.
5. **Next shortest effective step:** P13 human review and formal production admission for these five records only.
