# PGC-R08 A04 A01 — Disabled Control Semantics Focused Reproduction

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A04-A01_DisabledControlSemanticsFocusedReproduction
STATUS = PASS_FOCUSED_REPRODUCTION_CLASSIFIED_HARNESS_POLICY_REPAIR_AUTHORIZED
```

## Exact browser evidence

```text
SOURCE_HEAD_SHA = 37a45718f7fbaee6f61c95edb867a39b1ab87df4
WORKFLOW_RUN_ID = 30599279607
WORKFLOW_JOB_ID = 91058282865
ARTIFACT_ID = 8781288076
ARTIFACT_DIGEST = sha256:99b6a55f6284ce4254386e55f3d27725137f94612b26a5ba76ce47766fcc9de1
REPORT_SHA256 = ccb92bd5b72fb53a525b2d9422e259c3d0c1e23015a3758b97b1912c274abc0c
SCREENSHOTS = 8
```

The focused Chromium job completed successfully and classified all eight frozen canaries through the real Classic public UI.

```text
TERMINAL_CANARIES = 8 / 8
QUESTION_TYPE_CONTROL_DISABLED = 4 / 4 DISABLED_CURRENT_VALUE_MATCH
CONTEXT_MODE_CONTROL_DISABLED = 4 / 4 DISABLED_CURRENT_VALUE_MATCH
ENABLED_SELECTION_PASS = 0
DISABLED_VALUE_MISMATCH = 0
SYSTEM_FAILURE = 0
```

## Classification

Both disabled-control failure families are harness-policy defects, not product-control defects.

For every canary, the target control was disabled because the public UI exposed only one legal value, and the current value already exactly matched the requested route authority. No canary showed a disabled control with a mismatched value.

```text
REPAIR_DECISION = HARNESS_DISABLED_CURRENT_VALUE_POLICY_CONFIRMED
PRODUCT_MUTATION_AUTHORIZED = false
HARNESS_MUTATION_AUTHORIZED = true
AFFECTED_FAMILY_REPLAY_ROUTE_COUNT = 180
```

The authorized harness behavior is:

1. Enabled control: select the requested value and verify settlement.
2. Disabled control with current value equal to requested value: accept without mutation and record authority conformance.
3. Disabled control with a different current value: fail closed with explicit mismatch evidence.

## CI diagnosis

The first PR wave added a temporary branch-only workflow. Governance inventory tests therefore detected one additional workflow (`111 != 110` and `114 != 113`). This was expected staging drift, not a browser or product failure. The temporary workflow has been removed before merge, and the focused artifact is now materialized as committed readback authority.

## Boundaries

```text
PUBLIC_UI_MUTATION = false
GENERATOR_MUTATION = false
VALIDATOR_MUTATION = false
RENDERER_MUTATION = false
CAPACITY_AUTHORITY_MUTATION = false
A03_BROWSER_HARNESS_MUTATION = false
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_R08_REPAIR_AUTHORITY_ORDER_AND_CANARY_MATRIX_FROZEN
GOAL_DISTANCE_AFTER  = D1_R08_DISABLED_CONTROL_HARNESS_POLICY_CONFIRMED_REPAIR_PENDING
DISTANCE_REDUCED     = both disabled-control families classified with 8/8 real-browser canaries and zero product mismatch evidence
REMAINING_BLOCKERS   = [DISABLED_CONTROL_HARNESS_POLICY_NOT_APPLIED_TO_180_ROUTES, FOUR_OTHER_REPAIR_PHASES_PENDING]
NEXT_SHORTEST_STEP   = PGC-R08-A04-A02_DisabledControlHarnessPolicyRepairAndFamilyReplay
```
