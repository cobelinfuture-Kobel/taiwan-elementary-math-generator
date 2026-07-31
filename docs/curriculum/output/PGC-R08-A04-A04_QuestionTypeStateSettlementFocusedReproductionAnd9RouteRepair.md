# PGC-R08 A04 A04 — Question Type State Settlement Closeout

```text
PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1
TASK_ID = PGC-R08-A04-A04_QuestionTypeStateSettlementFocusedReproductionAnd9RouteRepair
STATUS = PASS_QUESTION_TYPE_STATE_SETTLEMENT_FAMILY_CLOSED_WITH_1_REGENERATE_TRANSFER
```

## Scope

The frozen position-3 queue contained nine `QUESTION_TYPE_STATE_SETTLEMENT_TIMEOUT` routes across:

- G3A-U08: 4
- G3B-U07: 2
- G4B-U06: 1
- G5A-U04: 2

Historical queues were not modified.

## Root cause

`config-state.js` and the public capability resolver already consumed current full-product W3 profiles and selector registries. `query-state.js` still consumed fifteen-unit control profiles and a pre-W3 selector registry, so application controls and explicit application PatternGroups were normalized away during initial page state creation.

## Shared repair

- reconciled `query-state.js` with current full-product public control profiles;
- reconciled query selector access with `batch-a-selector-p03f13-extension.js`;
- retained explicit W3 application PatternGroup IDs;
- retained the canonical pre-navigation bootstrap, exact PatternGroup binder, and disabled-current-value policy;
- did not modify resolver, capacity authority, generator, validator, renderer, or historical queues;
- did not extend timeouts or add per-route patches.

## Exact browser evidence

```text
HEAD_SHA          = c84804bce18f9ce2008f913496d619b819d1b09d
WORKFLOW_RUN_ID   = 30626667157
WORKFLOW_JOB_ID   = 91143415705
ARTIFACT_ID       = 8791684671
ARTIFACT_DIGEST   = sha256:125d5f9e1b3981d0ddff0dda45750804ba5925dc74df18aa8bbf247166a5a5bb
REPORT_SHA256     = 4fe19fb5b520354cf05f750b11d67bf7b6bfc9c89e9fbee213beac88c4366fbd
```

```text
TARGET_ROUTES                         = 9
TERMINAL_ROUTES                       = 9
UI_OPTIONS_PASS                       = 9
QUESTION_TYPE_STATE_SETTLEMENT_RESIDUAL = 0
FULL_NINE_GATE_PASS                   = 8
DOWNSTREAM_TRANSFER                   = 1
DISABLED_VALUE_MISMATCH               = 0
BROWSER_CONSOLE_ERRORS                = 0
BROWSER_PAGE_ERRORS                   = 0
```

Route 296 passed UI, generation, count, identity, answer, HTML, PDF, and answer-key gates. It timed out only at `REGENERATE_PASS` and was transferred to the existing regenerate family.

## Active state

```text
CUMULATIVE_PASS_ROUTES = 780
UNRESOLVED_ROUTES      = 13
REGENERATE_ROUTES      = 10
ACTIVE_CAPACITY_SHORTFALL_ROUTES = 3
CAPACITY_RECONCILIATION_QUEUE    = 38
NEXT_REPAIR_POSITION   = 4
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D1_R08_QUESTION_TYPE_STATE_SETTLEMENT_OPEN_9
GOAL_DISTANCE_AFTER  = D1_R08_QUESTION_TYPE_STATE_SETTLEMENT_CLOSED_REGENERATE_NEXT
DISTANCE_REDUCED     = all nine question-type state-settlement routes were resolved by one shared query-state consumer reconciliation
REMAINING_BLOCKERS   = [REGENERATE_IDENTITY_TIMEOUT_10, CAPACITY_EVIDENCE_RECONCILIATION_38_WITH_3_ACTIVE_SHORTFALLS]
NEXT_SHORTEST_STEP   = PGC-R08-A04-A05_RegenerateIdentityTimeoutFocusedReproductionAnd10RouteRepair
```
