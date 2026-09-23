# GCTX-P10 G3B-U04 Remaining Exact Semantic Binding Extraction — Readback

## Status

```text
PASS_ACCEPTED_PENDING_MERGE
```

## Accepted complete registry

| Metric | Result |
|---|---:|
| PatternSpecs | 32 |
| Candidate bindings | 117 |
| P09 pilot bindings retained | 4 |
| New P10 bindings | 113 |
| KnowledgePoints | 9 |
| Context domains | 77 |
| P01 structural/reference-valid bindings | 117 |
| Legacy-parity bindings | 117 |
| Formal approved-registry entries | 0 |
| Production-selectable bindings | 0 |
| Errors | 0 |

## Authority preservation

Every fixed-domain binding retains its own:

```text
template family
KnowledgePoint
semantic signature
operation signature
unknown role
quantity-role mapping
required constraints
semantic validator
ownership model
unit-flow model
realism profile
resolved scenario ID
```

The four P09 pilot bindings are reused unchanged. The other 113 bindings use the generic normalization path but are individually compared against their legacy PatternSpec and scenario authority.

## CI evidence

```text
Node Test run 29653242899 = PASS
Math CI Readback run 29653242924 = PASS
Owned gate failures = 0
```

## Scope boundary

```text
runtime behavior changed = false
formal approved registry changed = false
production selectable = false
legacy authority deleted or rewritten = false
renderer changed = false
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_FIRST_EXACT_BINDING_FAMILY_MERGED
GOAL_DISTANCE_AFTER  = D2_GCTX_G3BU04_FULL_CANDIDATE_BINDING_REGISTRY_ACCEPTED_PENDING_MERGE
DISTANCE_REDUCED     = all 32 G3B-U04 semantic PatternSpecs now have 117 fixed-domain P01-schema candidate bindings with legacy parity
REMAINING_BLOCKERS   = [merge, reference-registry admission, human semantic/mathematical review, formal production admission, runtime validator, runtime resolver, legacy adapter]
NEXT_SHORTEST_STEP   = GCTX-P11_G3BU04CandidateReferenceRegistryAdmissionAndReviewGate
```
