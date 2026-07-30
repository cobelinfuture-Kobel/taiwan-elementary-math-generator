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

The deployed smoke performed these actions consecutively:

```text
select source G5A-U08
→ select singleKnowledgePoint
→ immediately request mixed/mixed/mixed
```

The shared capability UI schedules its option projection through a microtask. Static resolver evidence confirms that the browser-default G5A-U08 KP, whole-unit route and same-unit mixed-KP route all admit `mixed`. Therefore the missing DOM option was not a capacity gap and not an illegal route.

The corrected classification is:

```text
ACCEPTANCE_HARNESS_PRE_BINDING_SYNCHRONIZATION_RACE
```

## FullFix

The existing GS01 compatibility runner now patches two obsolete assumptions in the legacy deployed harness:

1. preview metadata must contain required semantic segments but may contain later layout metadata;
2. the harness must not request `mixed/mixed/mixed` before the selected source, selection mode and KP surface have converged.

Single-KP generation now uses the controls projected by the shared capacity binding. The 36-row G5A-U08 control matrix remains unchanged and is still exercised after the browser switches to:

```text
mixedKnowledgePointsSameUnit
```

## Authority protection

```text
Product UI modified       = false
Capacity registry changed = false
Generator modified        = false
Validator modified        = false
Renderer modified         = false
Workflow added            = false
```

The repair corrects the acceptance lifecycle and does not change product capacity merely to satisfy a timing-sensitive smoke step.

## Acceptance

Focused tests prove:

```text
browser-default single KP resolver + mixed = admitted
sourceUnit + mixed                          = admitted
mixedKnowledgePointsSameUnit + mixed        = admitted
pre-convergence mixed selection             = removed
single-KP generation precedes mixed matrix selection
full 36-row mixed control matrix             = preserved
```

A02 cannot close on PR CI alone. After merge, the deployed GitHub Pages workflow must replay the corrected harness against `main`.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_R07_THREE_SURFACE_BASELINE_AND_REPAIR_QUEUE_MATERIALIZED
GOAL_DISTANCE_AFTER  = D1_R07_FIRST_GAP_IMPLEMENTATION_READY_FOR_DEPLOYED_REPLAY
DISTANCE_REDUCED     = first apparent UI gap reclassified as a pre-binding synchronization race and corrected without changing public route capacity
REMAINING_BLOCKERS   = [EXACT_HEAD_CI_PENDING, DEPLOYED_MAIN_REPLAY_PENDING, FALLBACK_404_BROWSER_BASELINE_MISSING, PIXEL_BROWSER_BASELINE_MISSING, RENDERER_BRANCH_PARITY_UNPROVEN, REAL_PRINT_AND_ANSWER_KEY_MATRIX_MISSING]
NEXT_SHORTEST_STEP   = PGC-R07-A02_MergeThenDeployedReplayAndParityReconciliation
```
