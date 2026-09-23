# S59I — G4B-U01 Public UI and Print Controls QA

```text
CURRENT_MAJOR_TASK = S59_G4B_U01_HorizontalWorksheetPublicPrintPath
CURRENT_SUBTASK = S59I_G4B_U01_PublicUIAndPrintControlsQA
TASK_STATUS = PUBLIC_UI_PRINT_QA
```

## Scope

S59I verifies that the S59H production worksheet path is usable through all public browser surfaces without adding a unit-specific public mode.

```text
surfaces = [Classic, 404 fallback, Pixel]
visibleKnowledgePoints = 9
visiblePatternGroups = 9
promotedPatternSpecs = 12
publicApplicationGroups = 0
representation = horizontal_only
verticalMode = false
representationToggle = false
publicHiddenModeFlag = false
publicQuestionCount = 1..200
```

## Public workflow

```text
select unit
→ select one or more KnowledgePoints
→ select visible horizontal PatternGroups
→ set question count
→ choose grouped or shuffled order
→ enable or disable answer key
→ generate canonical worksheet preview
→ print current non-stale preview
```

Classic and 404 fallback share the same controller path. Pixel uses its own state and action controllers but consumes the same S59H canonical worksheet builder and renderer.

## FullFix

The public query-state lifecycle allowlist previously ended at G3B-U08/G4A units. S59I adds `g4b_u01_4b01`, allowing valid G4B-U01 KnowledgePoint and PatternGroup selections to survive URL serialization and parsing. Stale, hidden and cross-unit IDs still reset to source-unit mode.

Public Traditional Chinese messages now cover:

- resolver and canonical-route failures;
- production count and eligibility failures;
- all 24 S59E arithmetic blocking codes;
- horizontal-only, no-application and no-fallback boundaries;
- restored-remainder validation.

Raw error codes and internal KP/group/spec identifiers are never displayed.

## QA coverage

The S59I test layer verifies:

- exact public 9-KP / 9-group / 12-spec projection;
- valid Classic query-state round trip;
- stale and cross-unit query-state sanitization;
- Classic 72-question all-family generation;
- Pixel 72-question all-family generation;
- answer-key suppression on Classic and Pixel;
- stale preview and stale print invalidation after control changes;
- deterministic grouped and shuffled generation with equal membership;
- Classic, 404 and Pixel generation/print control bindings;
- no-wrap horizontal renderer and internal-ID redaction;
- Traditional Chinese public error messages;
- no application, vertical, hidden or representation-toggle mode.

## Distance update

```text
GOAL_DISTANCE_BEFORE = D1_G4B_U01_CANONICAL_WORKSHEET_RENDERER_PUBLIC_QA_PENDING
GOAL_DISTANCE_AFTER  = D1_G4B_U01_PUBLIC_UI_PRINT_CONTROLS_ACCEPTED_FINAL_PROMOTION_PENDING
DISTANCE_REDUCED     = verified that Classic, 404 fallback and Pixel can preserve selection, generate canonical horizontal worksheets, control answers, invalidate stale output and print the current preview without exposing unsupported modes or internal ids
REMAINING_BLOCKERS   = ["Final count matrix and aggregate stress pending", "Final HTML/PDF artifact verification pending", "Production promotion closeout pending"]
NEXT_SHORTEST_STEP   = S59J_G4B_U01_ProductionStressHTMLPDFPromotionCloseout
AUTO_CONTINUE_DECISION = CONTINUE after PR and main CI pass
STOP_REASON = NONE
```
