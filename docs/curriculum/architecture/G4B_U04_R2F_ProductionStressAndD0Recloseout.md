# G4B-U04 R2F — Production Stress and D0 Recloseout

```text
TASK = G4B_U04_R2F_ProductionStressAndD0Recloseout
STATUS = IMPLEMENTED_PENDING_CI_DEPLOYED_AUTHORITY
SOURCE_ID = g4b_u04_4b04
BASE = R2A + R2B + R2C + R2D + R2E
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

The local production stress matrix must verify:

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

Each worksheet independently requires:

```text
zero blocking validator errors
zero duplicate normalized prompts
exact question count
exact answer-key count
no generic context fallback
no free-form AI path
```

The 68-question grouped worksheet must reach every effective authority node.

## 3. Controlled context stress

`daily_life` and `sdg` each receive a deterministic 120-question operation-estimation stress run.

```text
daily_life → 120 / 120 original controlled templates
sdg        → 120 / 120 allowlisted fictional SDG variants
```

Every SDG question must preserve the R2E context contract and safety metadata:

```text
fictionalExerciseData = true
currentRealWorldStatistic = false
persuasion = false
fearBasedLanguage = false
sdgGoal ∈ {6, 7, 11, 12, 13, 15}
```

## 4. Layout stress

Inverse possible-values questions request an intentionally excessive custom layout:

```text
requested = 6 columns × 20 rows
resolved  = 1 column × 4 rows
answer    = 1 column × 5 rows
```

The cap must be truthful in `layoutResolution` and accompanied by the safe-layout notice.

## 5. HTML/PDF production matrix

The artifact workflow produces six worksheets:

```text
mixed       × auto_safe
mixed       × custom_with_caps
daily_life  × auto_safe
daily_life  × custom_with_caps
sdg         × auto_safe
sdg         × custom_with_caps
```

The two mixed worksheets cover all 13 / 13 / 19 authority nodes. The four estimation worksheets isolate daily-life and SDG rendering under both layout modes.

Every artifact requires:

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

After implementation merge and GitHub Pages deployment, the R2F deployed workflow verifies the live teacher path:

```text
select 4B-U04
select all 13 KnowledgePoints and 13 PatternGroups
switch mixed / daily_life / sdg
verify contextMode query behavior and replay
switch layout mode and replay
produce 68-question preview with answer key
invoke iframe print target
suppress answer key and regenerate
```

The deployed workflow writes independent evidence to:

```text
docs/ci/latest-g4b-u04-r2f-deployed-pages-smoke.json
```

Historical R1 deployed evidence is not overwritten.

## 7. Authority invariants

```text
KnowledgePoints = 13 unchanged
PatternGroups   = 13 unchanged
PatternSpecs    = 19 unchanged
productionUse   = allowed
base distance   = D0_G4B_U04
generic fallback = forbidden
free-form AI = forbidden
```

## 8. Completion gate

R2F reaches final D0 only after:

```text
Node Test PASS
S42 Branch Test PASS
Math CI PASS
S96D full-suite enforcement PASS
R2F production matrix PASS
existing S75 and R2D HTML/PDF regressions PASS
implementation PR merged
Pages deployment succeeded
R2F deployed Pages smoke PASS
fresh-main closeout PR merged
```

## 9. Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_R2E_CLOSED_NEXT_R2F

GOAL_DISTANCE_AFTER =
D1_G4B_U04_R2F_IMPLEMENTED_PENDING_CI_DEPLOYED_AUTHORITY

DISTANCE_REDUCED =
Added the final canonical stress, controlled-context stress, six-scenario
HTML/PDF matrix and deployed teacher-path audit required to reclose G4B-U04 at D0.

REMAINING_BLOCKERS = [
  "R2F implementation CI",
  "R2F HTML/PDF matrix",
  "R2F implementation merge",
  "GitHub Pages deployment",
  "R2F deployed Pages smoke",
  "fresh-main D0 closeout"
]

NEXT_SHORTEST_STEP =
G4B_U04_R2F_ImplementationCIAndArtifactAcceptance

STOP_REASON = NONE
```
