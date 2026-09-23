# S43G2G G3A-U02 Phase 1 Closeout

## Phase 1 Definition

G3A-U02 Phase 1 scope is limited to two A-class KnowledgePoints:

- kp_g3a_u02_add_multi_carry
- kp_g3a_u02_sub_multi_borrow

Phase 1 completion requirements:

- add multi-carry selectable
- subtraction multi-borrow/selectable via subtraction_regroup runtime policy
- each KP can be selected alone
- same-unit mixed KP selection works
- worksheet generation works
- answer key generation works
- HTML render/print path is covered by QA

## Status

TASK_STATUS = PASS_PHASE1_HTML_PRINT_READY

## Completed Milestones

- S43G2A0 existing subtraction source-level smoke QA: PASS
- S43G2A1 subtraction regroup policy design: PASS
- S43G2A2 subtraction regroup runtime policy implementation: PASS
- S43G2A3 validator accept/reject QA: PASS
- S43G2A4 registry promotion: PASS
- S43G2A5 selector projection regen: PASS
- S43G2D second single-KP smoke QA: PASS
- S43G2E same-unit mixed KP smoke QA: PASS
- S43G2F HTML print and answer key QA: PASS

## Final Local Validation

- npm test: PASS 320/320
- git status: clean

## Result

G3A-U02 Phase 1 now supports:

- single selection: add multi-carry
- single selection: subtraction multi-borrow
- same-unit mixed selection: add + subtraction
- worksheet output
- answer key output
- HTML render path for questions and answer key

## Explicit Non-Scope

The following remain outside this Phase 1 closeout:

- kp_g3a_u02_estimate_nearest_thousand
- kp_g3a_u02_word_problem_estimation_add_sub
- cross-unit mixed KP mode
- Batch A productionUse release

## Goal Distance

GOAL_DISTANCE_BEFORE = D1_G3A_U02_PHASE1_HTML_PRINT_QA_PATCHED_PENDING_LOCAL_TEST
GOAL_DISTANCE_AFTER  = D1_G3A_U02_PHASE1_HTML_PRINT_READY_NOT_BATCH_A_PRODUCTION
DISTANCE_REDUCED     = closed G3A-U02 Phase 1 from selector promotion to HTML printable mixed worksheet path
REMAINING_BLOCKERS   = [
  "Batch A cross-unit mixed KP mode remains deferred",
  "Batch A productionUse still not allowed",
  "remaining Batch A units still require Phase-style promotion and QA",
  "G3A-U02 D-class estimation and word-problem KPs remain out of Phase 1 scope"
]
NEXT_SHORTEST_STEP   = S43G3_CrossUnitMultiKPPreconditionScan or next-unit Phase1 selection, depending operator goal
