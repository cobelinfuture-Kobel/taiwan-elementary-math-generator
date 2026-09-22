# GCI-PM01 Historical Post-Merge E2E Fan-out Bounded Cutover

```text
PROGRAM_ID = GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1
TASK_ID    = GCI-PM01_HistoricalPostMergeE2EFanoutBoundedCutover
STATUS     = IMPLEMENTED_PENDING_PR_GATE
```

## Scope lock

This milestone changes only post-merge GitHub Actions trigger ownership for the historical W5/W6/W7 direct-product slice E2E workflows that were observed to fan out on the P07F W7 Q010 merge.

It does not modify generator, validator, renderer behavior, worksheet behavior, curriculum authority, frozen queue identity, source evidence, branch protection, or the Q010 deployed E2E body.

## Observed blocker

Q010 merge `61dbbb11c77c5da0c2c905b1dcf059310ddcf507` produced 41 push workflow runs. 38 were W5/W6/W7 slice post-merge E2E workflows: one current Q010 workflow plus 37 historical slice workflows.

The historical workflows were being awakened by mutable shared current-path triggers such as the public selector pointer, public capability pointer, aggregate generator, aggregate worksheet, and a shared renderer.

Q010 itself reached `PASS_E6_D0_COMPLETE` in run `35744406174`; the fan-out is therefore an operational CI ownership problem, not a Q010 semantic/product failure.

## Cutover

The 37 historical workflows observed in the Q010 fan-out keep their slice-owned push paths and E2E bodies, but no longer watch:

```text
site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js
site/modules/curriculum/public/public-ui-capability-binding-p04f33.js
site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js
site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js
site/modules/renderer/sector-elements-diagram.js
```

They also no longer trigger merely because their own historical workflow YAML is edited.

The current slice workflow remains:

```text
.github/workflows/p07f-w7-q010-live-pages-e2e.yml
```

and is the only W5/W6/W7 slice E2E allowed to own those volatile shared trigger paths.

## Successor rule

When Q011 becomes the current W7 slice, the same implementation PR must demote Q010 shared triggers and move the single-current owner authority to Q011. Governance QA fails if two slice workflows own the volatile shared paths.

## Expected fan-out

```text
OBSERVED_Q010_SLICE_E2E_FANOUT = 38
HISTORICAL_SLICE_E2E           = 37
CURRENT_SLICE_E2E              = 1

TARGET_SHARED_POINTER_FANOUT:
historical slice E2E = 0
current slice E2E    = 1

EXPECTED_SLICE_E2E_REDUCTION = 37
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D0_PRODUCT_COMPLETE_WITH_UNBOUNDED_POSTMERGE_CI_FANOUT_BLOCKER
GOAL_DISTANCE_AFTER  = D0_PRODUCT_COMPLETE_WITH_SINGLE_CURRENT_SLICE_SHARED_TRIGGER_OWNER_PENDING_CI
DISTANCE_REDUCED     = operational CI blocker reduced; product semantics unchanged
REMAINING_BLOCKERS   = [PR_GATE_NOT_YET_TERMINAL, CUTOVER_NOT_YET_MERGED]
NEXT_SHORTEST_STEP   = PR Gate -> merge -> post-merge fan-out readback -> resume W7 Q011 source-authority preflight
```
