# GCI-PM01 Historical Post-Merge E2E Fan-out Bounded Cutover

```text
PROGRAM_ID = GLOBAL_GITHUB_CI_HANDSHAKE_STANDARD_V1
TASK_ID    = GCI-PM01_HistoricalPostMergeE2EFanoutBoundedCutover
STATUS     = PASS_POSTMERGE_FANOUT_BOUNDED_BASELINE_FAILURE_SET_PARITY_CONFIRMED
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

## Post-merge readback

The cutover was merged in PR #1038 as:

```text
CUTOVER_MERGE_SHA = 339f0ebc476cc28bd73550b4ad4ca72e27842be4
```

That push produced exactly four workflows:

```text
Milestone Claim Integrity
Node Test Post-Merge
Math CI Readback
Deploy GitHub Pages
```

No historical W5/W6/W7 slice post-merge E2E workflow was created. The target fan-out reduction therefore materialized:

```text
Q010 MERGE:
TOTAL PUSH WORKFLOWS = 41
SLICE E2E            = 38
HISTORICAL SLICE E2E = 37

GCI-PM01 CUTOVER MERGE:
TOTAL PUSH WORKFLOWS = 4
HISTORICAL SLICE E2E = 0
```

The repository-wide failures observed after the cutover are baseline-only. Exact failure-name set comparison against the immediately preceding Q010 merge proves no new full-regression failures were introduced:

```text
NODE TEST
BEFORE_RUN  = 35744405160
AFTER_RUN   = 35747943873
BEFORE_FAIL = 140
AFTER_FAIL  = 140
ADDED       = 0
REMOVED     = 0
EXACT_SET   = MATCH

MATH CI READBACK
BEFORE_RUN  = 35744405748
AFTER_RUN   = 35747943947
BEFORE_FAIL = 141
AFTER_FAIL  = 141
ADDED       = 0
REMOVED     = 0
EXACT_SET   = MATCH
```

Thus the post-merge full-regression failures are not attributable to GCI-PM01.

## Distance

```text
GOAL_DISTANCE_BEFORE = D0_PRODUCT_COMPLETE_WITH_UNBOUNDED_POSTMERGE_CI_FANOUT_BLOCKER
GOAL_DISTANCE_AFTER  = D0_PRODUCT_COMPLETE_WITH_BOUNDED_POSTMERGE_CI_AND_BASELINE_FAILURES_ATTRIBUTED
DISTANCE_REDUCED     = historical slice E2E fan-out removed; exact failure-set parity proves no regression was added
REMAINING_BLOCKERS   = [PREEXISTING_REPOSITORY_BASELINE_FAILURES_OUTSIDE_GCI_PM01_SCOPE]
NEXT_SHORTEST_STEP   = P07F_W7_Q011_SourceAuthorityPreflight
```

## Closeout

```text
1. DISTANCE SEGMENT SHORTENED =
   UNBOUNDED_POSTMERGE_FANOUT -> SINGLE_CURRENT_SLICE_SHARED_TRIGGER_OWNER

2. SYSTEM NODE ADVANCED =
   POSTMERGE_CI_GOVERNANCE -> TRIGGER_OWNERSHIP -> FAILURE_ATTRIBUTION

3. BLOCKER REMOVED =
   HISTORICAL_W5_W6_W7_SHARED_POINTER_E2E_FANOUT

4. NEW BLOCKER ADDED =
   NONE

5. NEXT SHORTEST EFFECTIVE STEP =
   P07F_W7_Q011_SourceAuthorityPreflight
```
