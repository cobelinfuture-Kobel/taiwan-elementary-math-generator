# G4B-U04 R3A — Long-Text Profile Print Density Optimization

```text
TASK = G4B_U04_R3A_LongTextProfilePrintDensityOptimization
STATUS = IMPLEMENTED_PENDING_CI_HTML_PDF
SOURCE_ID = g4b_u04_4b04
BASE = G4B_U04_R2_D0_PASS_ACCEPTED_AND_CLOSED
```

## 1. Trigger

A production worksheet with 200 mixed G4B-U04 questions requested `4 columns × 10 rows`, but the presence of any `possibleValuesAnswer` selected the inverse-long renderer profile for the whole worksheet.

```text
previous resolved question layout = 1 column × 4 rows
200 questions / 4 per page = 50 question pages
```

This density is safe but wastes paper for a mixed worksheet where most questions do not require a full-width card.

## 2. Locked scope

R3A changes only the inverse-long **question-sheet** cap:

```text
before = 1 column × 4 rows
candidate = 2 columns × 4 rows
```

The inverse-long answer-key cap remains:

```text
1 column × 5 rows
```

No KnowledgePoint, PatternGroup, PatternSpec, formula, answer model, generator semantics, validator semantics, context mode or query-state behavior changes.

## 3. Acceptance contract

The user-reported production case is reproduced exactly:

```text
question count = 200
selection = all 13 KnowledgePoints and 13 PatternGroups
question mode = mixed
requested layout = 4 columns × 10 rows
layout mode = custom_with_caps
answer key = off
```

Required result:

```text
resolved question layout = 2 columns × 4 rows
question pages = 25
previous question pages = 50
page reduction = 25 pages / 50 percent
answer pages = 0
```

## 4. Blocking quality gates

The candidate density is accepted only if all gates pass:

```text
Node Test
S42 Branch Test
Math CI Readback
S96D full-suite enforcement
S75 G4B-U04 HTML/PDF regression
R2D six-scenario layout HTML/PDF regression
R2F six-scenario production matrix
R3A 200-question paper-efficiency HTML/PDF smoke
```

The R3A PDF gate requires:

```text
200 rendered question cells
25 PDF pages exactly
all 25 pages nonblank
DOM overflow count = 0
PDF text bounding-box overflow count = 0
blocking validator errors = 0
duplicate normalized prompts = 0
Traditional Chinese title preserved
```

If `2 × 4` fails any containment gate, the profile change must not merge. The next design path is mixed-profile pagination rather than forcing an unsafe density.

## 5. Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_R2_D0_FUNCTIONAL_BUT_PAPER_DENSITY_INEFFICIENT

GOAL_DISTANCE_AFTER =
D1_G4B_U04_R3A_IMPLEMENTED_PENDING_HTML_PDF_ACCEPTANCE

DISTANCE_REDUCED =
Replaced the known 50-page candidate with a 25-page candidate and added a
blocking 200-question DOM/PDF acceptance gate.

REMAINING_BLOCKERS = [
  "R3A full CI",
  "R3A 200-question HTML/PDF containment",
  "implementation PR merge",
  "fresh-main closeout"
]

NEXT_SHORTEST_STEP =
G4B_U04_R3A_ImplementationCIAndPaperEfficiencyAcceptance

STOP_REASON = NONE
```
