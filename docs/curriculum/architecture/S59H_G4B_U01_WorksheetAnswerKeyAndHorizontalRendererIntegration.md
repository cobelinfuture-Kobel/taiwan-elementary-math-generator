# S59H — G4B-U01 Worksheet, Answer Key and Horizontal Renderer Integration

```text
CURRENT_MAJOR_TASK = S59_G4B_U01_HorizontalWorksheetPublicPrintPath
CURRENT_SUBTASK = S59H_G4B_U01_WorksheetAnswerKeyAndHorizontalRendererIntegration
TASK_STATUS = CANONICAL_WORKSHEET_RENDERER_INTEGRATED_PUBLIC_CONTROLS_QA_PENDING
```

## Scope

S59H promotes the S59G canonical horizontal runtime into the production worksheet path. It adds a separate worksheet lifecycle overlay and preserves the S59C hidden authority and S59F selector overlay unchanged.

```text
visibleKnowledgePoints = 9
visiblePatternGroups = 9
promotedPatternSpecs = 12
routeKind = g4b_u01_pure_horizontal
blockingValidator = required
worksheetStatus = production_eligible
productionUse = allowed
publicQuestionCount = 1..200
```

## Worksheet generation chain

```text
public browser state
→ visible PatternGroup resolver
→ S59G group-then-family canonical allocation
→ S59D deterministic generator
→ S59E 24-code arithmetic validator
→ S59H production lifecycle validator
→ worksheet document
→ horizontal renderer
```

No blocking failure may produce a worksheet or fall back to another generator.

## Worksheet contract

The worksheet preserves:

- prompt and blanked horizontal expression;
- complete equation model;
- answer text;
- quotient and original-scale remainder where applicable;
- KnowledgePoint, PatternGroup and PatternSpec provenance;
- promotion and renderer profile identifiers;
- answer-key records;
- exact allocation and validation reports.

## Renderer profile

```text
profileId = g4b_u01_horizontal_numeric_v1
question layout = A4 portrait, 3 columns × 8 rows
answer layout = A4 portrait, 3 columns × 10 rows
expression wrapping = forbidden
card splitting = forbidden
pageBreakMode = avoidLongTextCards
```

The renderer applies tabular numeric alignment and no-wrap behavior only to G4B-U01 S59H documents. Unrelated renderer output delegates unchanged.

## Public boundary retained

S59H does not add or change:

- application mode;
- vertical representation;
- representation toggle;
- hidden mode flag;
- public print-control behavior;
- resolver or canonical-router behavior;
- final HTML/PDF production acceptance.

## QA

The S59H tests cover:

- promotion JSON/runtime projection parity;
- production eligibility and 200-question public limit;
- 72-question worksheet reaching all 12 PatternSpecs;
- 3×8 question and 3×10 answer pagination;
- prompt/equation/answer/provenance preservation;
- production lifecycle mutations;
- answer-key suppression;
- no-wrap renderer output and internal-ID redaction.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_G4B_U01_CANONICAL_VALIDATED_RUNTIME_WORKSHEET_PENDING
GOAL_DISTANCE_AFTER  = D1_G4B_U01_CANONICAL_WORKSHEET_RENDERER_PUBLIC_QA_PENDING
DISTANCE_REDUCED     = connected the canonical validated runtime to a production-eligible worksheet, answer-key contract and horizontal no-wrap renderer profile
REMAINING_BLOCKERS   = ["Classic/404/Pixel public controls not fully verified", "Stale-print and query-state QA pending", "Final stress and HTML/PDF promotion pending"]
NEXT_SHORTEST_STEP   = S59I_G4B_U01_PublicUIAndPrintControlsQA
AUTO_CONTINUE_DECISION = CONTINUE after PR and main CI pass
STOP_REASON = NONE
```
