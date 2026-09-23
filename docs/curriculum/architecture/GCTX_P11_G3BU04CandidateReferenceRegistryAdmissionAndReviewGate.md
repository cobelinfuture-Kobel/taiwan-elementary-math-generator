# GCTX-P11 G3B-U04 Candidate Reference Registry Admission and Review Gate

## 1. Milestone

P11 resolves every reference used by the 117 G3B-U04 candidate semantic bindings and prepares one deterministic human review packet per binding.

It does not execute human review, approve any reference, populate the formal approved-binding registry, enable runtime resolution, or modify worksheet rendering.

## 2. Candidate registries

P11 derives six closed candidate registries:

```text
context_family
semantic_variant
common_knowledge
language_variant
numeric_profile
answer_unit
```

Every entry records:

- candidate lifecycle and approval state;
- source and unit ownership;
- all consuming binding IDs;
- all consuming PatternSpec IDs;
- source-evidence IDs;
- production and runtime prohibitions.

## 3. Cross-registry gate

For every binding, P11 requires exact resolution of:

- `contextFamilyId`;
- `semanticVariantId`;
- every `commonKnowledgeId`;
- every `languageVariantId`;
- every `numericProfileId`;
- every allowed answer-unit ID.

Missing or multiply-owned references block the gate.

## 4. Human review packets

P11 produces 117 review packets. Each packet includes binding identity, KP, PatternSpec, context family, semantic variant, context domain, operation signature, question target, and source evidence.

Semantic review checks:

```text
context_family_fit
slot_coherence
event_flow_coherence
question_target_alignment
language_naturalness
grade_age_appropriateness
```

Mathematical review checks:

```text
operation_signature_preserved
quantity_role_mapping_preserved
unit_flow_valid
answer_unit_valid
canonical_recomputation_valid
```

Every check begins as `pending`. Reviewer ID, review-evidence ID, and decision remain null. Automatic approval or rejection is forbidden.

## 5. Acceptance

```text
candidate bindings = 117
context families = 32
semantic variants = 117
language variants = 117
numeric profiles = 32
review packets = 117
unresolved references = 0
semantic reviews pending = 117
mathematical reviews pending = 117
approved references = 0
approved bindings = 0
formal approved registry entries = 0
errors = 0
```

Common-knowledge and answer-unit counts are computed from the exact binding reference set and locked after first CI readback.

## 6. Scope boundary

```text
no human review executed
no automatic review decision
no formal approval
no runtime behavior change
no production selection
no renderer or public-control change
```

## 7. Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_G3BU04_FULL_CANDIDATE_BINDING_REGISTRY_MERGED
GOAL_DISTANCE_AFTER  = D2_GCTX_G3BU04_REFERENCE_ADMISSION_AND_REVIEW_GATE_PENDING_CI
DISTANCE_REDUCED     = every candidate reference becomes resolvable and 117 deterministic human review packets are created without false approval
REMAINING_BLOCKERS   = [CI, merge, human semantic review, human mathematical review, formal production admission, validator, resolver, legacy adapter]
NEXT_SHORTEST_STEP   = GCTX-P12_G3BU04HumanSemanticAndMathematicalReviewExecution
```
