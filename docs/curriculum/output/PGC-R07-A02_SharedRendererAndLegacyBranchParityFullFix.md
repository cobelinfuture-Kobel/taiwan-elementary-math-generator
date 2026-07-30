# PGC-R07 A02 Shared Renderer and Legacy Branch Parity FullFix

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R07-A02_SharedRendererAndLegacyBranchParityFullFix
STATUS = READY_FOR_DEPLOYED_REPLAY
```

## Root cause

The first A01 gap was initially recorded as:

```text
PUBLIC_QUESTION_MODE_OPTION_MISSING
```

The deployed smoke sequence showed that the missing option was requested while the page was in:

```text
selectionMode = singleKnowledgePoint
questionType  = mixed
```

The current public capacity authority does not admit this intersection. `mixed` is admitted for G5A-U08 whole-unit and same-unit mixed-KP routes, not for a single-KP route. The shared UI binding correctly removed the illegal option.

Therefore the corrected classification is:

```text
ACCEPTANCE_HARNESS_SELECTION_MODE_CONTROL_MISMATCH
```

## FullFix

The existing GS01 compatibility runner now patches two obsolete assumptions in the legacy deployed harness:

1. preview metadata must contain required semantic segments but may contain later layout metadata;
2. the harness must not preselect `mixed/mixed/mixed` while `singleKnowledgePoint` is active.

The 36-row G5A-U08 control matrix remains unchanged and is still exercised after the browser switches to:

```text
mixedKnowledgePointsSameUnit
```

## Authority protection

```text
Product UI modified      = false
Capacity registry changed = false
Generator modified       = false
Validator modified       = false
Renderer modified        = false
Workflow added           = false
```

The repair does not re-expose an illegal route merely to satisfy a stale smoke test.

## Acceptance

Focused tests prove:

```text
singleKnowledgePoint + mixed            = hidden
sourceUnit + mixed                      = admitted
mixedKnowledgePointsSameUnit + mixed    = admitted
single-KP generation runs before mixed matrix selection
full mixed control matrix remains present
```

A02 cannot close on PR CI alone. After merge, the deployed GitHub Pages workflow must replay the corrected harness against `main`.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_R07_THREE_SURFACE_BASELINE_AND_REPAIR_QUEUE_MATERIALIZED
GOAL_DISTANCE_AFTER  = D1_R07_FIRST_GAP_IMPLEMENTATION_READY_FOR_DEPLOYED_REPLAY
DISTANCE_REDUCED     = first apparent UI gap reclassified and corrected at the acceptance-harness boundary without widening public route exposure
REMAINING_BLOCKERS   = [EXACT_HEAD_CI_PENDING, DEPLOYED_MAIN_REPLAY_PENDING, FALLBACK_404_BROWSER_BASELINE_MISSING, PIXEL_BROWSER_BASELINE_MISSING, RENDERER_BRANCH_PARITY_UNPROVEN, REAL_PRINT_AND_ANSWER_KEY_MATRIX_MISSING]
NEXT_SHORTEST_STEP   = PGC-R07-A02_MergeThenDeployedReplayAndParityReconciliation
```
