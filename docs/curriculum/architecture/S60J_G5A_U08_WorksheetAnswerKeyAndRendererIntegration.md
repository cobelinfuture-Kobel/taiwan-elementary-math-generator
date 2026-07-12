# S60J — G5A-U08 Worksheet, Answer Key and Renderer Integration

```text
TASK = S60J_G5A_U08_WorksheetAnswerKeyAndRendererIntegration
STATUS = PASS_CI_SYNCED_AND_MERGED
```

## Scope

S60J consumes only the S60I resolver-derived canonical runtime. It does not expose N+2, formal equation solving, arbitrary PatternSpec IDs, or final production release.

```text
11 visible KnowledgePoints
17 visible PatternGroups
30 promoted PatternSpecs
6 core answer models
2 renderer profiles
```

## Worksheet assembly

```text
S60I browser plan
→ visible resolver
→ canonical generator
→ blocking validator
→ S60J worksheet eligibility
→ question display models
→ answer-key items
→ independent pagination
→ G5A-U08 renderer
```

Question and answer counts remain exact. A blocking canonical or worksheet-model error returns no WorksheetDocument.

## Renderer profiles

### Numeric/reasoning profile

```text
question sheet = A4, 3 columns × 8 rows
answer key     = A4, 3 columns × 10 rows
```

### Mixed long-text profile

Used whenever a worksheet contains application text, equality judgement, average inverse/update, or allocation-transfer content.

```text
question sheet = A4, 2 columns × 4 rows
answer key     = A4, 1 column × 6 rows
```

All cards use `break-inside: avoid`. Long Traditional Chinese text wraps inside the card rather than crossing card boundaries.

## Answer models

Dedicated render paths exist for:

```text
numericAnswer
expressionAnswer
operatorSequenceAnswer
equalityJudgementAnswer
averageInverseAnswer
allocationTransferAnswer
```

Application answer rows show the user-facing expression, answer and unit through `answerText`. Missing-operator and equality-judgement items use dedicated response prompts and answer labels.

## Public-content boundary

The G5A-U08 renderer does not emit KnowledgePoint, PatternGroup, PatternSpec, promotion, or source-panel identifiers into visible HTML or data attributes.

Answer suppression removes answer-key items, answer-key pages and the answer-key HTML section.

## Lifecycle

```text
selectorStatus = visible
runtimeStatus = blocking_validated_canonical_runtime
worksheetStatus = worksheet_eligible
rendererStatus = worksheet_renderer_integrated
productionUse = preview_only_pending_s60l
```

S60J makes the canonical worksheet available for S60K UI/print QA but does not grant final production release.

## CI and merge evidence

```text
implementation PR = #80
implementation merge commit = e2b7846c7e9049817e11ba9a326af5a4388d2078
PR Node Test = PASS
PR S42 Branch Test = PASS
PR Math CI Readback = PASS
PR G4B-U01 HTML/PDF smoke = PASS
PR G4B-U01 14-page containment regression = PASS
main CI run = 29180316646
main tests = 961
main pass = 961
main fail = 0
main working tree = clean
```

The implementation added eight S60J worksheet/renderer tests while preserving every existing Batch A and G4B-U01 regression.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U08_PUBLIC_SELECTOR_AND_CANONICAL_RUNTIME_INTEGRATED_WORKSHEET_PENDING
GOAL_DISTANCE_AFTER  = D1_G5A_U08_WORKSHEET_ANSWER_KEY_RENDERER_INTEGRATED_PUBLIC_UI_QA_PENDING
DISTANCE_REDUCED     = Added exact-count WorksheetDocument assembly, six answer-model render paths and adaptive A4 profiles for numeric, reasoning and N+1 application content.
REMAINING_BLOCKERS   = [
  "S60K public UI/print/query-state QA",
  "S60L production stress, HTML/PDF smoke and D0 closeout"
]
NEXT_SHORTEST_STEP = S60K_G5A_U08_PublicUIPrintAndQueryStateQA
```
