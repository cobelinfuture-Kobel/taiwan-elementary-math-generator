# PGC-R07 A02 Shared Renderer and Legacy Branch Parity FullFix

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R07-A02_SharedRendererAndLegacyBranchParityFullFix
STATUS = PASS_CAPACITY_AWARE_DEPLOYED_BROWSER_PARITY
```

## Root cause

A01 first observed `PUBLIC_QUESTION_MODE_OPTION_MISSING`. The complete diagnosis showed two legacy acceptance defects:

1. control values were requested before the capability UI had converged after source or selection-mode changes;
2. the legacy 36-row matrix treated `normalizeG5AU08ResolverPlan` as public admission authority and forced router-generatable intersections that the current fail-closed public capacity registry does not expose.

The final classification is:

```text
LEGACY_ROUTER_MATRIX_PUBLIC_CAPACITY_AUTHORITY_DRIFT
+ ACCEPTANCE_CONTROL_TRANSITION_RACE
```

The confirmed example is G5A-U08 same-unit mixed selection:

```text
mixed question type   = admitted
numeric question type = not admitted by current public capacity authority
```

## FullFix

The existing GS01 compatibility runner now:

```text
1. accepts extended preview metadata while retaining required semantic fields;
2. removes pre-convergence control preselection;
3. classifies all 36 rows through resolvePublicUiCapabilityBinding;
4. generates only public-admitted rows;
5. verifies non-admitted exact intersections are not exposed;
6. uses convergence-safe question/depth/context transitions;
7. derives query replay controls from an admitted matrix row.
```

The 36-row coverage count remains unchanged. Negative rows are now accepted only as `not_exposed`, not by forcibly selecting hidden controls and expecting a runtime error.

## Authority protection

```text
Product UI modified       = false
Capacity registry changed = false
Generator modified        = false
Validator modified        = false
Renderer modified         = false
Workflow added            = false
```

## Acceptance

```text
Focused GS01 contract                  = PASS
Live deployed GitHub Pages browser     = PASS
Capacity-aware 36-row audit            = PASS
Query replay                           = PASS
Answer-key on/off                      = PASS
Preview and print target invocation    = PASS
Console errors                         = 0
Page errors                            = 0
```

The successful PR-head deployed run is GitHub Actions run `30553672858`.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_R07_THREE_SURFACE_BASELINE_AND_REPAIR_QUEUE_MATERIALIZED
GOAL_DISTANCE_AFTER  = D1_R07_CLASSIC_CAPACITY_AWARE_PREVIEW_PRINT_PARITY_PASS
DISTANCE_REDUCED     = Classic G5A-U08 deployed acceptance now follows the shared public capacity authority and completes browser preview, answer-key and print-path verification
REMAINING_BLOCKERS   = [FALLBACK_404_BROWSER_BASELINE_MISSING, PIXEL_BROWSER_BASELINE_MISSING, RENDERER_BRANCH_PARITY_UNPROVEN, REAL_CHROMIUM_PDF_MATRIX_MISSING]
NEXT_SHORTEST_STEP   = PGC-R07-A03_RealChromiumPrintAndAnswerKeyMatrix
```

## Task closeout

```text
1. Distance segment shortened = Classic deployed control mismatch to capacity-aware live browser PASS
2. System nodes advanced = public binding / preview / answer key / print invocation acceptance
3. Blocker removed = first R07 repair-queue item and legacy router-only smoke authority
4. New blocker added = none
5. Next shortest effective step = materialize real Chromium print and answer-key parity matrix
```
