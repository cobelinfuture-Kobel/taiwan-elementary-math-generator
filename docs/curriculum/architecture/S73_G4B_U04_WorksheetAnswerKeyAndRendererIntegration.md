# S73 — G4B-U04 Worksheet, Answer Key and Renderer Integration

```text
TASK = S73_G4B_U04_WorksheetAnswerKeyAndRendererIntegration
STATUS = PASS_CI_SYNCED_AND_MERGED
SOURCE_ID = g4b_u04_4b04
```

## Scope

S73 connects the S72 public canonical runtime to WorksheetDocument assembly, answer-key records and a Traditional Chinese A4 renderer.

```text
S72 public selector and resolver
→ blocking-validated canonical questions
→ S73 WorksheetDocument
→ question pages
→ optional answer-key pages
→ G4B-U04 renderer profiles
```

Public UI/query-state QA, Chromium HTML/PDF smoke, production stress and D0 promotion remain outside this task.

## Authority coverage

```text
KnowledgePoints      = 12
PatternGroups        = 12
PatternSpecs         = 17
Class C              = 9
Class D              = 8
Answer model shapes  = 9
Renderer profiles    = 3
```

Mode coverage:

```text
concept               = 4
numeric               = 3
application           = 4
operation_estimation  = 4
reasoning             = 2
```

## Answer model integration

S73 has dedicated question and answer presentation for all nine authority shapes:

```text
classificationAnswer
symbolReadingAnswer
methodComparisonAnswer
methodChoiceAnswer
numericAnswer
moneyAmountAnswer
banknoteCountAnswer
digitSetAnswer
possibleValuesAnswer
```

The WorksheetDocument preserves the structured answer, final answer, answer text, answer unit and source canonical metadata. Internal KnowledgePoint, PatternGroup, PatternSpec, FormalMapping and template IDs are not rendered publicly.

## Worksheet contract

The builder requires:

- a successful S72 canonical route;
- blocking validator acceptance before WorksheetDocument creation;
- exact question/display-model counts;
- exact answer-record counts when answer pages are enabled;
- zero answer records and zero answer pages when disabled;
- question counts from 1 through 1000;
- Traditional Chinese question, response and answer labels;
- no generic fallback;
- zero WorksheetDocument on blocking failure.

Accepted questions receive the S73 worksheet overlay:

```text
phase                      = S73
productionUse              = preview_only_pending_s75
productionWorksheetStatus  = worksheet_candidate_pending_s74_s75
```

This overlay does not mutate the S68 hidden authority or the S72 public promotion registry.

## Renderer profiles

### Compact concept/numeric

```text
profile = g4b_u04_compact_concept_numeric_v1
question pages = A4, 2 columns × 6 rows
answer pages   = A4, 2 columns × 8 rows
```

### Contextual and estimation

```text
profile = g4b_u04_contextual_estimation_v1
question pages = A4, 2 columns × 4 rows
answer pages   = A4, 1 column × 6 rows
```

### Inverse long-answer

```text
profile = g4b_u04_inverse_long_answer_v1
question pages = A4, 1 column × 4 rows
answer pages   = A4, 1 column × 5 rows
```

Profile selection is based on generated content. Possible-original-value items select the inverse-long profile. Application, operation-estimation, method-comparison and digit-set content select the contextual profile. Remaining direct concept and numeric items select the compact profile.

## Pipeline integration

The public browser pipeline now imports:

```text
batch-a-browser-worksheet-s73-extension.js
html-renderer-s73-extension.js
```

Both extensions preserve prior routes by delegating unrelated WorksheetDocuments to the S60J chain unchanged.

## Acceptance

Executable QA covers:

1. exact 12/12/17 authority and nine answer shapes;
2. eligibility through 1000 questions;
3. one-per-PatternSpec mixed worksheet with all five modes;
4. Class C and D integration;
5. compact, contextual and inverse-long profile selection;
6. answer-key suppression;
7. Traditional Chinese question and answer HTML;
8. all nine answer-shape render paths;
9. internal-ID redaction;
10. unrelated route delegation;
11. invalid canonical selection returning zero WorksheetDocument;
12. lifecycle remaining preview-only pending S74/S75.

## Quality fixes

Before merge, three boundary fixes were applied:

- invalid G4B-U04 canonical scope now returns a zero-WorksheetDocument failure instead of delegating to a legacy route;
- answer HTML renders the authoritative `answerText` directly and does not append a duplicate unit;
- the full pre-existing site scaffold and browser regression test tail was preserved while updating the extension chain.

The first PR CI run found one test-contract defect in the unrelated-route delegation assertion: an optional renderer profile predicate returned `undefined`, but the test compared it directly with `false`. The assertion now normalizes the predicate to Boolean. Runtime behavior did not change.

## CI and merge evidence

```text
implementation PR          = #113
implementation merge       = 61a3a0a5245e0c8861b52a330e32aa3f303484f1
main CI run                = 29213515063
main CI readback commit    = 634f7afe142fe5193a7717c73b1570379477956c
tests                      = 1080
pass                       = 1080
fail                       = 0
working tree               = clean
```

## Lifecycle boundary

```text
selector visibility        = visible
canonical resolver         = connected
canonical runtime          = blocking_validated
worksheet eligible         = true
answer-key path             = connected
renderer connected          = true
public UI/query QA          = pending
HTML/PDF smoke              = pending
production use              = preview_only_pending_s75
D0 closeout                 = pending
```

## Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_PROMOTION_RESOLVER_AND_PUBLIC_SELECTOR_CONNECTED

GOAL_DISTANCE_AFTER =
D1_G4B_U04_WORKSHEET_ANSWER_KEY_AND_RENDERER_CONNECTED

DISTANCE_REDUCED =
Connected all five modes and nine answer models to exact-count WorksheetDocument,
answer-key pagination and three adaptive Traditional Chinese A4 renderer profiles.

REMAINING_BLOCKERS = [
  "Public UI and query-state QA not completed",
  "HTML/PDF smoke not completed",
  "Production stress and D0 closeout not completed"
]

NEXT_SHORTEST_STEP =
S74_G4B_U04_PublicUIPrintAndQueryStateQA

STOP_REASON =
NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```
