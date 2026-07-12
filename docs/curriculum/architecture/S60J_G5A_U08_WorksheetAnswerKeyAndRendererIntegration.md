# S60J — G5A-U08 Worksheet, Answer Key and Renderer Integration

```text
TASK = S60J_G5A_U08_WorksheetAnswerKeyAndRendererIntegration
STATUS = IMPLEMENTED_PENDING_CI
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

Question and answer counts must remain exact. A blocking canonical or worksheet-model error returns no WorksheetDocument.

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

All cards use `break-inside: avoid`. Long Traditional Chinese text wraps inside the card; it is not clipped or split across cards.

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

Application answer rows show the canonical user-facing expression, final answer and unit through `answerText`. Missing-operator and equality-judgement items have dedicated response prompts and answer labels.

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

S60J makes the canonical worksheet available for the next UI/print QA gate but does not grant final production release.

## QA

- exact question and answer counts;
- numeric-only worksheet profile;
- N+1 SDG application profile;
- mixed numeric/application worksheet;
- operator sequence, equality judgement and average reasoning models;
- answer suppression;
- Traditional Chinese renderer and internal-ID non-disclosure;
- unrelated renderer delegation unchanged;
- existing G4B-U01 PDF containment regression remains required.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U08_PUBLIC_SELECTOR_AND_CANONICAL_RUNTIME_INTEGRATED_WORKSHEET_PENDING
GOAL_DISTANCE_AFTER  = D1_G5A_U08_WORKSHEET_ANSWER_KEY_RENDERER_INTEGRATED_PENDING_CI
DISTANCE_REDUCED     = Added exact-count WorksheetDocument assembly, six answer-model render paths and adaptive A4 profiles for numeric, reasoning and N+1 application content.
REMAINING_BLOCKERS   = [
  "S60J PR CI and merge",
  "S60K public UI/print/query-state QA",
  "S60L production stress, HTML/PDF smoke and D0 closeout"
]
NEXT_SHORTEST_STEP = S60K_G5A_U08_PublicUIPrintAndQueryStateQA
```
