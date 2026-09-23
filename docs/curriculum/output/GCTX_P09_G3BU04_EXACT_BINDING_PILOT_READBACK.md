# GCTX-P09 G3B-U04 Exact Semantic Binding Extraction Pilot — Readback

## Status

```text
PASS_ACCEPTED_PENDING_MERGE
```

## Accepted extraction

| Metric | Result |
|---|---:|
| PatternSpecs | 1 |
| Fixed-domain candidate bindings | 4 |
| Context domains | 4 |
| P01 structural/reference-valid bindings | 4 |
| Legacy-parity bindings | 4 |
| Formal approved-registry entries | 0 |
| Production-selectable bindings | 0 |
| Errors | 0 |

## Fixed domains

```text
food
school_supplies
tickets
equipment_rental
```

Each domain is embedded in its own semantic variant, language variant, slot assets and legacy aliases. Runtime context-family or domain replacement remains forbidden.

## Preserved authority

```text
operation = (a+b)/c
a = first_shared_cost
b = second_shared_cost
c = payer_count
answer target = cost_per_person
validator = S57_G3B_U04_SemanticValidationContract
answer unit = TWD required
```

The four legacy constraints are preserved as semantic guards, and canonical answer recomputation is blocking.

## CI evidence

```text
Node Test run 29652846599 = PASS
Math CI Readback run 29652846571 = PASS
Owned gate failures = 0
```

## Scope boundary

```text
runtime behavior changed = false
formal approved registry changed = false
production selectable = false
unit authority deleted or rewritten = false
renderer changed = false
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D2_GCTX_BINDING_ADMISSION_AND_LEGACY_NORMALIZATION_MERGED
GOAL_DISTANCE_AFTER  = D2_GCTX_FIRST_EXACT_BINDING_FAMILY_ACCEPTED_PENDING_MERGE
DISTANCE_REDUCED     = one admitted G3B-U04 PatternSpec now has four fixed-domain P01-schema candidate bindings with exact legacy parity
REMAINING_BLOCKERS   = [merge, 31 remaining G3B-U04 PatternSpecs, cross-registry admission, human semantic review, production admission, runtime validator, runtime resolver]
NEXT_SHORTEST_STEP   = GCTX-P10_G3BU04RemainingExactSemanticBindingExtraction
```
