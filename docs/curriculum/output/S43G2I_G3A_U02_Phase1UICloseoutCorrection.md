# S43G2I G3A-U02 Phase 1 UI Closeout Correction

## Correction Reason

S43G2G closed G3A-U02 Phase 1 as HTML print ready after programmatic worksheet build and HTML render QA.

Operator definition clarified that HTML print ready must include real front-end UI operation:

- user can choose the mode in the UI
- user can choose the KnowledgePoint in the UI
- user can generate preview from the UI state
- user can generate answer key from the UI state
- user can print from the UI state

Therefore, S43G2G status must be interpreted as programmatic print path PASS, not full user-facing UI PASS.

## Corrected Status

Previous effective interpretation:

- PASS_PHASE1_PROGRAMMATIC_PRINT_PATH
- UI_EXPOSURE_PENDING

After S43G2H local PASS:

- PASS_PHASE1_USER_FACING_UI_PRINT_PATH

## Evidence

S43G2H local readback:

- npm test: PASS 322/322
- git status: clean

S43G2H user-facing UI scope:

- same-unit KP mode is exposed in the HTML selector
- single-KP mode can select visible KP through UI interaction
- same-unit mixed mode is enabled when source visibleCount >= 2
- cross-unit mixed mode remains deferred
- static test contract prevents regression to disabled same-unit mode

## Result

G3A-U02 Phase 1 is now closed under the corrected definition:

G3A_U02_PHASE1_STATUS = PASS_USER_FACING_UI_PRINT_READY

## Explicit Non-Scope

The following remain outside Phase 1:

- kp_g3a_u02_estimate_nearest_thousand
- kp_g3a_u02_word_problem_estimation_add_sub
- cross-unit mixed KP mode
- Batch A productionUse release

## Goal Distance

GOAL_DISTANCE_BEFORE = D1_G3A_U02_PHASE1_PROGRAMMATIC_PRINT_PATH_PASS_UI_EXPOSURE_PENDING
GOAL_DISTANCE_AFTER  = D1_G3A_U02_PHASE1_USER_FACING_UI_PRINT_READY
DISTANCE_REDUCED     = corrected Phase 1 closeout definition and closed the front-end UI exposure blocker
REMAINING_BLOCKERS   = [
  "G3A-U02 estimation KP has no generator / validator / UI path yet",
  "G3A-U02 word-problem estimation KP has no template / generator / validator / UI path yet",
  "cross-unit mixed KP mode remains deferred",
  "Batch A productionUse still not allowed"
]
NEXT_SHORTEST_STEP   = S43G2J_G3A_U02_EstimateNearestThousandDesignScan
