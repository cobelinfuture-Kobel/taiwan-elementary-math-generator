# PGC-R08 A04 A03 — Route Binding Convergence Focused Reproduction

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A04-A03_RouteBindingConvergenceFocusedReproductionAndRepair
STATUS = PENDING_FOCUSED_BROWSER_ARTIFACT
```

## Scope

Reproduce four frozen canaries from the `ROUTE_BINDING_NOT_CONVERGED` family before authorizing any public UI, binding-authority or harness mutation.

```text
FAMILY_ROUTE_COUNT = 136
CANARY_COUNT = 4
PRODUCT_MUTATION = false
CAPACITY_AUTHORITY_MUTATION = false
PER_ROUTE_PATCH = false
```

## Canaries

```text
1   G3A-U01 mixed-KP application
570 G5A-U08 single-KP mixed daily-life
735 G5A-U08 mixed-KP reasoning mixed-context
784 G6A-U01 single-KP application
```

## Evidence contract

For every public interaction, capture:

```text
source / selection mode / question type / depth / context
selected KnowledgePoints
all PatternGroup datasets
selected / compatible / disabled / hidden PatternGroups
capacity route IDs
first target appearance and later target loss
admitted disabled-control policy dispositions
```

The focused artifact classifies each canary as an already-bound route, greedy PatternGroup overshoot, missing public route projection, empty capacity binding, unsettled UI state, or system failure.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_DISABLED_CONTROL_FAMILIES_CLOSED_ROUTE_BINDING_REPAIR_NEXT
GOAL_DISTANCE_AFTER  = D1_R08_ROUTE_BINDING_FAILURE_CLASSIFICATION_PENDING_BROWSER_EVIDENCE
DISTANCE_REDUCED     = exact four-canary public binding trace contract materialized
REMAINING_BLOCKERS   = [ROUTE_BINDING_NOT_CONVERGED_136_NOT_CLASSIFIED, QUESTION_TYPE_STATE_SETTLEMENT_TIMEOUT_9, REGENERATE_IDENTITY_TIMEOUT_3, CAPACITY_EVIDENCE_RECONCILIATION_35]
NEXT_SHORTEST_STEP   = READ_A03_ROUTE_BINDING_FOCUSED_BROWSER_ARTIFACT_AND_SELECT_FAMILY_REPAIR
```
