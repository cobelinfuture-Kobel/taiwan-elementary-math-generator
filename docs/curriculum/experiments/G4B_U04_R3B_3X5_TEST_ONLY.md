# G4B-U04 R3B — 3×5 Test-Only Density Experiment

```text
TASK = G4B_U04_R3B_3X5_TestOnlyExperiment
STATUS = TEST_ONLY_NOT_PRODUCTION
SOURCE_ID = g4b_u04_4b04
QUESTION_LAYOUT = 3 columns × 5 rows
ANSWER_LAYOUT = unchanged / outside this experiment
QUESTION_COUNT = 200
ANSWER_KEY = off
EXPECTED_QUESTION_PAGES = 14
```

## Scope

This experiment does not modify the production renderer profile.

It generates the current 200-question G4B-U04 worksheet, then re-paginates only the question display models with an experimental A4 `3 × 5` layout. The result is rendered to standalone HTML/PDF artifacts for containment review.

## Blocking checks

```text
question count = 200
question capacity per full page = 15
question pages = ceil(200 / 15) = 14
answer pages = 0
DOM overflow = 0
PDF pages = 14
all PDF pages nonblank
PDF text bounding-box overflow = 0
```

## Decision rule

- PASS does not change production.
- The generated PDF must be reviewed before any production profile change.
- FAIL stops the candidate; no fallback production edit is attempted in the same milestone.
