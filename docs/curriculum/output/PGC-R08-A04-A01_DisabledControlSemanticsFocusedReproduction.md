# PGC-R08 A04 A01 — Disabled Control Semantics Focused Reproduction

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A04-A01_DisabledControlSemanticsFocusedReproduction
STATUS = PENDING_FOCUSED_BROWSER_ARTIFACT
```

## Scope

Run the eight frozen A00 canaries for the two disabled-control families through the real Classic public UI, stopping before route binding and generation.

```text
QUESTION_TYPE_CONTROL_DISABLED_CANARIES = 4
CONTEXT_MODE_CONTROL_DISABLED_CANARIES = 4
WORKER_CONCURRENCY = 4
PRODUCT_MUTATION = false
CAPACITY_AUTHORITY_MUTATION = false
```

## Terminal classifications

- `DISABLED_CURRENT_VALUE_MATCH`: the public control is disabled, but already represents the requested route value.
- `ENABLED_SELECTION_PASS`: the control is enabled and can be selected during focused reproduction.
- `DISABLED_VALUE_MISMATCH`: the disabled control represents a different value; this is product or authority mismatch evidence.
- `SYSTEM_FAILURE`: browser, server, selector or option failure; CI blocking.

This milestone does not repair the product. It distinguishes a harness `selectOption` policy defect from a real public-control capability defect.

## Artifact

The branch-only focused workflow uploads:

```text
tmp/pgc-r08-a04-a01-disabled-control-reproduction/report.json
tmp/pgc-r08-a04-a01-disabled-control-reproduction/screenshots/
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_REPAIR_AUTHORITY_ORDER_AND_CANARY_MATRIX_FROZEN
GOAL_DISTANCE_AFTER  = D1_R08_DISABLED_CONTROL_SEMANTICS_FOCUSED_EVIDENCE_PENDING
DISTANCE_REDUCED     = eight real-browser canaries prepared to classify the 180-route disabled-control cluster
REMAINING_BLOCKERS   = [DISABLED_CONTROL_SEMANTICS_NOT_CLASSIFIED, FOUR_OTHER_REPAIR_PHASES_PENDING]
NEXT_SHORTEST_STEP   = READ_A01_FOCUSED_BROWSER_ARTIFACT_AND_CLASSIFY_REPAIR
```
