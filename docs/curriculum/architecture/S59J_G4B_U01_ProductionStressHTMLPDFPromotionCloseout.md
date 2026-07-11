# S59J — G4B-U01 Production Stress, HTML/PDF Promotion and Closeout

```text
CURRENT_MAJOR_TASK = S59_G4B_U01_HorizontalWorksheetPublicPrintPath
CURRENT_SUBTASK = S59J_G4B_U01_ProductionStressHTMLPDFPromotionCloseout
TASK_STATUS = FINAL_PRODUCTION_GATE_IN_PROGRESS
```

## Frozen scope

```text
sourceId = g4b_u01_4b01
visibleKnowledgePoints = 9
visiblePatternGroups = 9
promotedPatternSpecs = 12
representation = horizontal_only
applicationMode = false
verticalRepresentation = false
representationToggle = false
publicHiddenModeFlag = false
publicQuestionCount = 1..200
rendererProfile = g4b_u01_horizontal_numeric_v1
questionLayout = 3x8
answerLayout = 3x10
```

S59J does not add KnowledgePoints, PatternSpecs, application templates, vertical algorithms or missing-digit extension work.

## Promotion policy

The S59F base registry remains an immutable selector overlay:

```text
runtimeStatus = blocking_validated_hidden_not_canonical
validatorStatus = blocking_validator_accepted
worksheetStatus = not_eligible
productionUse = forbidden
```

Final production acceptance is carried by the S59H worksheet overlay. S59J records that both the base projection and production overlay have completed their downstream gates without mutating the hidden S59C PatternSpec authority.

## Required production matrix

```text
acceptedPublicCounts = [1, 9, 12, 72, 200]
rejectedOverLimitCounts = [201, 257, 600, 1000]
aggregateStress = 5 batches x 200 = 1000 questions
```

Every stress batch must:

- reach all nine visible PatternGroups;
- keep group allocation spread at most one;
- keep PatternSpec allocation spread within each group at most one;
- preserve horizontal-only output;
- preserve applicationText=false;
- retain resolver-derived canonical route metadata;
- pass the S59E arithmetic validator and S59H production lifecycle validator;
- produce no generic fallback output.

## Validator and regression gates

```text
blockingCodeCount = 24
warningCodeCount = 2
blockingFailureOutput = zero questions
warningBehavior = nonblocking
sourceUnitRegression = byte-for-byte delegation to pre-S59H path
```

## Public HTML/PDF smoke

The committed smoke bundle is generated through the same canonical public worksheet path:

```text
questions = 72
answers = 72
questionPages = 3
answerPages = 3
expectedPdfPages = 6
```

The dedicated GitHub Actions smoke job must:

1. install Noto CJK and a headless Chromium runtime;
2. generate the canonical HTML and pending manifest;
3. print the HTML to A4 PDF;
4. render all six PDF pages to PNG;
5. reject blank rendered pages;
6. extract 72 question and 72 answer expressions from the PDF;
7. verify the Traditional Chinese unit title;
8. write deterministic HTML/PDF hashes and byte count to the manifest;
9. upload the verified bundle for repository commit.

## Closeout condition

```text
GOAL_DISTANCE_BEFORE = D1_G4B_U01_PUBLIC_UI_PRINT_CONTROLS_ACCEPTED_FINAL_PROMOTION_PENDING
GOAL_DISTANCE_AFTER  = D0_G4B_U01_HORIZONTAL_WORKSHEET_PUBLICLY_PRINTABLE
```

D0 is permitted only after the verified HTML/PDF bundle is committed, all standard and smoke workflows pass, PR is merged, and main CI readback is clean.
