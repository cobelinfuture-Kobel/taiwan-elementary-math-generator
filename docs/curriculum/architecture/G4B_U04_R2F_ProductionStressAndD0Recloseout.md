# G4B-U04 R2F — Production Stress and D0 Recloseout

```text
TASK = G4B_U04_R2F_ProductionStressAndD0Recloseout
STATUS = PASS_ACCEPTED_AND_CLOSED
SOURCE_ID = g4b_u04_4b04
BASE = R2A + R2B + R2C + R2D + R2E
FINAL_DISTANCE = D0_G4B_U04_R2_CLOSED
```

## 1. Goal

R2F is the final acceptance gate for the G4B-U04 R2 quality sequence.

```text
R2A semantic plausibility and number formatting
R2B prompt deduplication
R2C source-backed discount round-down
R2D layout resolution and readback
R2E controlled context modes
→ R2F production stress, HTML/PDF, deployed UI and D0 recloseout
```

R2F does not add KnowledgePoints, PatternGroups, PatternSpecs, formulas, answer models or semantic variants.

## 2. Canonical stress contract

The accepted local production stress matrix verifies:

```text
13 KnowledgePoints
13 PatternGroups
19 PatternSpecs
all five explicit question modes plus mixed
contextMode = mixed | daily_life | sdg
layoutMode = auto_safe | custom_with_caps
answer key on / off
1000-question canonical hard limit
```

Public stress counts are:

```text
1 + 19 + 68 + 120 + 200 + 600 = 1008 validated questions
```

Each worksheet independently passed:

```text
zero blocking validator errors
zero duplicate normalized prompts
exact question count
exact answer-key count
no generic context fallback
no free-form AI path
```

The 68-question grouped worksheet reached every effective authority node.

## 3. Controlled context stress

`daily_life` and `sdg` each passed a deterministic 120-question operation-estimation stress run.

```text
daily_life → 120 / 120 original controlled templates
sdg        → 120 / 120 allowlisted fictional SDG variants
```

Every SDG question preserved the R2E context contract and safety metadata:

```text
fictionalExerciseData = true
currentRealWorldStatistic = false
persuasion = false
fearBasedLanguage = false
sdgGoal ∈ {6, 7, 11, 12, 13, 15}
```

## 4. Layout stress

Inverse possible-values questions requested an intentionally excessive custom layout:

```text
requested = 6 columns × 20 rows
resolved  = 1 column × 4 rows
answer    = 1 column × 5 rows
```

The cap remained truthful in `layoutResolution` and emitted the required safe-layout notice.

## 5. HTML/PDF production matrix

The accepted artifact workflow produced six worksheets:

```text
mixed       × auto_safe
mixed       × custom_with_caps
daily_life  × auto_safe
daily_life  × custom_with_caps
sdg         × auto_safe
sdg         × custom_with_caps
```

The two mixed worksheets covered all 13 / 13 / 19 authority nodes. The four estimation worksheets isolated daily-life and SDG rendering under both layout modes.

Every artifact passed:

```text
Traditional Chinese title and answer pages
zero DOM overflow
all PDF pages nonblank
zero PDF text bounding-box overflow
zero internal-ID leakage
zero unresolved placeholders
zero duplicate prompts
zero blocking validator errors
```

## 6. Deployed Pages gate

The final deployed workflow verified the live teacher path:

```text
select 4B-U04
select all 13 KnowledgePoints and 13 PatternGroups
switch mixed / daily_life / sdg
verify contextMode query behavior and replay
switch auto_safe / custom_with_caps and replay
produce 68-question preview with answer key
verify 68 answer items and numbering consistency
invoke iframe print target
suppress answer key and regenerate
```

The deployed workflow writes independent evidence to:

```text
docs/ci/latest-g4b-u04-r2f-deployed-pages-smoke.json
```

Historical R1 deployed evidence remains separate.

## 7. Authority invariants

```text
KnowledgePoints = 13 unchanged
PatternGroups   = 13 unchanged
PatternSpecs    = 19 unchanged
productionUse   = allowed_deployed_ui_print
generic fallback = forbidden
free-form AI = forbidden
curriculum authority changed = false
formula changed = false
answer model changed = false
```

## 8. Final acceptance evidence

```text
R2F implementation PR          = #215
R2F implementation merge SHA   = 6b7679d7d9f46d1ff78051963e09cd7b9becacb9
R2F query authority repair PR  = #216
R2F nonvisual contract PR      = #217
R2F replay synchronization PR  = #218
R2F Classic hydration PR       = #219
final deployment SHA           = 5a58918d45b35d30a8b20342d168884ee8aed0ea
deployed authority commit      = 8191c7dc643d1f3cc2376527882c1ec00c8b00fa
deployed workflow run          = 29379930385
```

Final deployed authority reports:

```text
status = PASS
productionUse = allowed_deployed_ui_print
goalDistance = D0_G4B_U04_R2_CLOSED
knowledgePointCount = 13
selectedKnowledgePointCount = 13
selectedPatternGroupCount = 13
patternSpecCount = 19
patternGroupSelectionAuthority = query_state
queryStateReplay = pass
fullQuestionCount = 68
fullAnswerCount = 68
answerNumberSequenceConsistent = true
answerKeyOffQuestionCount = 12
answerKeyOffAnswerCount = 0
printCalled = true
consoleErrorCount = 0
pageErrorCount = 0
genericFallback = false
freeFormAI = false
```

## 9. Completion gate

All final gates passed:

```text
Node Test PASS
S42 Branch Test PASS
Math CI PASS
S96D full-suite enforcement PASS
R2F production matrix PASS
S75 HTML/PDF regression PASS
R2D HTML/PDF regression PASS
implementation and repair PRs merged
Pages deployment succeeded
R2F deployed Pages smoke PASS
fresh-main closeout prepared for merge
```

## 10. Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_R2E_CLOSED_NEXT_R2F

GOAL_DISTANCE_AFTER =
D0_G4B_U04_R2_CLOSED

DISTANCE_REDUCED =
Completed the final 1008-question canonical stress, controlled-context stress,
six-scenario HTML/PDF matrix, deployed query replay, Classic layout hydration,
68-question answer-key and print audit, and final production authority acceptance.

REMAINING_BLOCKERS = []

NEXT_SHORTEST_STEP =
NONE_WITHIN_G4B_U04_R2_APPROVED_SCOPE

STOP_REASON = NONE
```
