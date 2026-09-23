# GCTX-P10 G3B-U04 Remaining Exact Semantic Binding Extraction

## 1. Milestone

P10 completes candidate binding extraction for all remaining G3B-U04 semantic PatternSpecs.

```text
P09 pilot:       1 PatternSpec /   4 bindings
P10 new:        31 PatternSpecs / 113 bindings
Combined:       32 PatternSpecs / 117 bindings
```

The combined candidate registry covers 9 KnowledgePoints and 77 legacy context domains.

## 2. Authority model

Every binding is derived from the matching legacy PatternSpec and resolved scenario profile. The extractor verifies agreement on:

- template family;
- KnowledgePoint;
- semantic signature;
- equation shape;
- unknown role;
- quantity-role bindings;
- allowed context domain;
- ownership model;
- unit-flow model;
- realism profile;
- required constraints;
- semantic validator.

The P09 pilot bindings are reused unchanged. They are not regenerated through the generic path.

## 3. Generic normalization

For each of the remaining 113 domain variants, P10 creates:

1. fixed semantic slots from the resolved placeholder binding;
2. one exact given quantity role for every legacy equation symbol;
3. one answer-target role matching the legacy unknown role;
4. an input-introduction event;
5. a canonical semantic-operation event preserving the exact operation signature and semantic signature;
6. a terminal question event;
7. unit-flow edges;
8. legacy constraints as semantic guards;
9. blocking semantic and mathematical validation hooks;
10. fixed candidate lifecycle and fail-closed randomness.

This normalization does not authorize runtime semantic assembly.

## 4. Complete registry acceptance

```text
PatternSpecs = 32
Bindings = 117
Pilot bindings retained = 4
New bindings = 113
KnowledgePoints = 9
Context domains = 77
P01 structural/reference-valid bindings = 117
Legacy-parity bindings = 117
Formal approved-registry entries = 0
Production-selectable bindings = 0
Errors = 0
```

## 5. Candidate boundary

All entries remain:

```text
lifecycleStatus = candidate
reviewEvidence.approvalState = candidate
production selectable = false
runtime resolvable = false
```

The generated common-knowledge, language and numeric-profile references are candidate references. They must pass cross-registry admission before any formal approval.

## 6. Blocking behavior

P10 blocks on:

- missing P08 admission;
- missing or duplicate PatternSpec/domain pair;
- authority disagreement;
- unresolved P01 slot/event/quantity/question reference;
- missing legacy constraint, validator, ownership, unit-flow or realism evidence;
- mutation of a P09 pilot binding;
- any false production or approval claim;
- formal approved-registry population.

## 7. Scope boundary

```text
no runtime behavior change
no formal approved-registry change
no production selection
no legacy authority deletion or rewrite
no renderer or public-control change
```

## 8. Distance

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_FIRST_EXACT_BINDING_FAMILY_MERGED
GOAL_DISTANCE_AFTER  = D2_GCTX_G3BU04_FULL_CANDIDATE_BINDING_REGISTRY_PENDING_CI
DISTANCE_REDUCED     = all 32 G3B-U04 semantic PatternSpecs are projected into 117 fixed-domain P01-schema candidate bindings with legacy authority parity
REMAINING_BLOCKERS   = [CI, merge, reference-registry admission, human review, formal production admission, validator, resolver, legacy adapter]
NEXT_SHORTEST_STEP   = GCTX-P11_G3BU04CandidateReferenceRegistryAdmissionAndReviewGate
```
