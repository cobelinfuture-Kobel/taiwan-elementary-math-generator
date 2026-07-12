# S59J-R1 — G4B-U01 Public Warning and Print Layout FullFix

```text
CURRENT_MAJOR_TASK = S59_G4B_U01_HorizontalWorksheetPublicPrintPath
CURRENT_SUBTASK = S59J_R1_G4B_U01_PublicWarningAndPrintLayout_FullFix
TASK_STATUS = PASS_CI_SYNCED_AND_MERGED
```

## Trigger

Operator inspection of a 120-question public worksheet exposed three production defects that were not covered by the original S59J smoke:

1. repeated English nonblocking validator warnings were rendered directly in the public UI;
2. long quotient/remainder write-in placeholders crossed three-column question-card boundaries;
3. the fixed 3-column × 10-row answer-key layout clipped the last row at the A4 page bottom.

The arithmetic generator and answer validator remained correct. The FullFix therefore changed only public warning projection, preview/print rendering and the associated regression gate.

## FullFix

### Public warning projection

- G4B-U01 warnings are deduplicated by severity and code before reaching Classic, 404 fallback or Pixel UI;
- `G4B_U01_LOW_CARRY_COMPLEXITY_WARNING` is localized to Traditional Chinese;
- `G4B_U01_REPEATED_SIGNATURE_WARNING` is localized to Traditional Chinese;
- warning severity remains nonblocking;
- blocking validator errors and zero-output behavior are unchanged.

### Question and answer layout

- remainder write-in placeholders are compacted for three-column question pages;
- answer-key prompts no longer repeat unnecessary write-in blanks;
- answer cards use a compact two-row grid with prompt and answer separated;
- the answer layout remains 3 columns × 10 rows but now fits within A4;
- the public UI now labels column and row inputs as question-page controls and explains that answer pages use a fixed compact layout.

### Runtime integration

- browser worksheet generation advances from the S59H wrapper to the S59J-R1 warning wrapper;
- browser preview and print advance from the S59H renderer to the S59J-R1 renderer;
- Classic, 404 fallback and Pixel continue to consume the same canonical worksheet document;
- unrelated source units delegate unchanged to the prior chain.

## Regression evidence

The accepted regression reproduces the reported operator configuration:

```text
questionCount = 120
question columns = 3
question rows per page = 4
answer key = enabled
question pages = 10
answer pages = 4
total PDF pages = 14
```

Accepted checks:

- 120 question records and 120 answer records;
- all 12 promoted PatternSpecs reached;
- public warnings deduplicated and localized;
- zero DOM prompt/answer containment overflows;
- 14/14 PDF pages rendered nonblank;
- zero PDF text bounding-box overflows;
- final answer page includes items 91–120 without clipping;
- original S59J HTML/PDF smoke remains green;
- PR CI: 873 tests, 873 pass, 0 fail, working tree clean;
- main CI: 873 tests, 873 pass, 0 fail, working tree clean.

## Accepted references

```text
IMPLEMENTATION_PR = 64
IMPLEMENTATION_HEAD_SHA = 35fc3619add49ecdb338fd915743fa0a620e4068
IMPLEMENTATION_MERGE_COMMIT = e8207b5e9d40d81d6fd1353b70b911bdfb7ac9d4
PR_MATH_CI_RUN = 29174637820
PR_LAYOUT_RUN = 29174637833
PR_LAYOUT_ARTIFACT_ID = 8254515236
PR_LAYOUT_ARTIFACT_DIGEST = sha256:680315999cc66391e673a86431bb16e0aefa29804d0a9b6b9196d901d43e5487
MAIN_MATH_CI_RUN = 29174722150
MAIN_CI_READBACK_COMMIT = f87e8ab23b1c6edd817744a335894709efa6d62e
```

## Non-scope

```text
PatternSpec changes = none
generator arithmetic changes = none
blocking validator changes = none
application mode = forbidden
vertical representation = forbidden
representation toggle = forbidden
public question limit = unchanged at 1..200
```

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_G4B_U01_PUBLIC_WARNING_AND_PRINT_LAYOUT_FULLFIX_REQUIRED
GOAL_DISTANCE_AFTER  = D0_G4B_U01_PUBLIC_WARNING_AND_PRINT_LAYOUT_FULLFIX_ACCEPTED
DISTANCE_REDUCED     = removed public English warning leakage, compacted remainder prompts, eliminated answer-page clipping, and installed a 120-question 14-page containment regression gate
REMAINING_BLOCKERS   = []
NEXT_SHORTEST_STEP   = NONE_G4B_U01_CORE_UNIT_CLOSED
AUTO_CONTINUE_DECISION = STOP_UNIT_CLOSED
STOP_REASON          = UNIT_REACHED_D0
BLOCKER_TYPE         = NONE
LAST_COMPLETED_STATUS = S59J_R1_PASS_CI_SYNCED_AND_MERGED
REQUIRED_OPERATOR_ACTION = NONE
NEXT_RESUME_TASK     = SELECT_NEXT_BATCH_A_UNIT
```
