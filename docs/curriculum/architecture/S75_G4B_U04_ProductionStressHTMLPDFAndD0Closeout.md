# S75 — G4B-U04 Production Stress, HTML/PDF and D0 Closeout

```text
TASK = S75_G4B_U04_ProductionStressHTMLPDFAndD0Closeout
STATUS = PASS_CI_SYNCED_AND_MERGED
SOURCE_ID = g4b_u04_4b04
DISTANCE = D0_G4B_U04
PRODUCTION_USE = allowed
```

## Scope lock

S75 is the final production gate for the existing G4B-U04 authority.

```text
S74 public UI / query / print candidate
→ production count and aggregate stress
→ all-KP / all-group / all-PatternSpec reachability
→ all five explicit question modes
→ deterministic replay
→ Chromium DOM containment
→ A4 PDF generation
→ rendered-page / PDF bounding-box verification
→ production promotion overlay
→ D0 closeout
```

S75 does not add, remove, merge or split KnowledgePoints, PatternGroups, PatternSpecs, generators, answer models or semantic template families.

## Production authority

```text
KnowledgePoints   = 12
PatternGroups     = 12
PatternSpecs      = 17
Question modes    = 5 explicit + mixed
Answer shapes     = 9
Renderer profiles = 3
Implementation    = Class C + Class D
```

The S72 base promotion, S73 worksheet/answer/renderer overlay and S74 public-surface adapters remain immutable inputs. S75 adds a separate production promotion overlay.

## Production lifecycle

```text
productionPromotionOverlayId = s75_g4b_u04_production_promotion
status                       = production_promoted_d0_closed
productionUse                = allowed
distance                     = D0_G4B_U04
htmlPdfStatus                = production_smoke_passed
requiredNextGate             = S76_BatchB_NextSourcePriorityLock
```

## Node stress acceptance

Public count matrix:

```text
1 / 12 / 17 / 34 / 68 / 120 / 200
```

Additional canonical stress:

```text
600 questions
```

Cumulative validated output:

```text
452 public-matrix questions + 600 additional questions = 1052 questions
```

Every successful build satisfies:

- requested question count equals generated question count;
- display-model count equals question count;
- answer-key count equals question count when enabled;
- blocking validation error count equals zero;
- no generic fallback;
- no arbitrary PatternSpec injection;
- no internal curriculum identifier in public prompt or answer text.

The canonical hard limit is separately verified by rejecting a 1001-question request with zero worksheet output.

## Coverage smoke

The committed smoke uses 68 questions, providing four allocations for each of the 17 promoted PatternSpecs.

```text
questionCount    = 68
answerKeyItems   = 68
ordering         = groupedByPattern
questionMode     = mixed
selectionMode    = mixedKnowledgePointsSameUnit
questionPages    = 17
answerKeyPages   = 14
PDF pages        = 31
```

The smoke reaches:

- all 12 KnowledgePoints;
- all 12 PatternGroups;
- all 17 PatternSpecs;
- concept, numeric, application, operation_estimation and reasoning modes;
- all 9 answer-model shapes;
- both Class C and Class D implementations;
- all required G4B-U04 render kinds.

## HTML/PDF artifact acceptance

Committed artifacts:

```text
docs/curriculum/output/smoke/S75_G4B_U04_PublicWorksheet.html
docs/curriculum/output/smoke/S75_G4B_U04_PublicWorksheet.pdf
docs/curriculum/output/smoke/S75_G4B_U04_PublicWorksheet.manifest.json
```

Verified manifest result:

```text
status                         = production_html_pdf_smoke_pass
question cells                 = 68
answer cells                   = 68
expected / actual PDF pages    = 31 / 31
rendered / nonblank pages      = 31 / 31
PDF bounding-box overflow      = 0
internal ID leaks              = 0
unresolved placeholders        = 0
Traditional Chinese font       = Noto Sans CJK TC
CJK glyph rendering            = pass
visual verification            = all_pages_nonblank_and_bbox_contained
HTML SHA-256                    = b1f8f4de42fdaccd9fcb1a324f3af6a164b4e4046d06848afed44814f9a80b64
PDF SHA-256                     = 3ad7cf4629a1a5e9ca415018deed4049087e567e58c5c84e8e04ccb2f903eb5c
PDF bytes                       = 401307
```

Dedicated branch artifact workflow:

```text
workflow = S75 G4B-U04 HTML PDF Smoke
run      = 29217220427
result   = success
```

## Determinism and explicit modes

S75 replays the same 68-question shuffled seed twice and requires identical prompt, answer and ordering projections.

Separate production builds verify:

```text
concept
numeric
application
operation_estimation
reasoning
```

Each explicit-mode build contains only the requested canonical mode and remains blocking-validator clean.

## Implementation and fresh-main CI evidence

```text
IMPLEMENTATION_PR             = #117
IMPLEMENTATION_PR_STATUS      = MERGED
IMPLEMENTATION_MERGE_COMMIT   = e30a22a0d322d0b20075df73cd802d6ef2dc6499
PR_NODE_TEST_RUN              = 29217220218
PR_MATH_CI_RUN                = 29217220270
PR_ARTIFACT_RUN               = 29217220427
FRESH_MAIN_CI_RUN             = 29217320409
FRESH_MAIN_READBACK_COMMIT    = 3a9956e59fe38c9188dc3fbb1ae5cb75f6cf4f30
TESTS                         = 1101
PASS                          = 1101
FAIL                          = 0
WORKING_TREE                  = clean
```

## Boundary

```text
KnowledgePoint scope changed        = false
PatternSpec scope changed           = false
Generator math changed              = false
Validator math changed              = false
Resolver allocation changed         = false
Public UI control set changed       = false
Renderer semantic content changed   = false
Production promotion overlay added  = true
Stress QA added                     = true
HTML/PDF artifact gate added        = true
```

The closeout lifecycle update records the verified artifact state. It does not change question semantics, answer semantics, curriculum authority, generator arithmetic or validator arithmetic.

## Distance closeout

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_PUBLIC_UI_PRINT_AND_QUERY_STATE_QA_CONNECTED

GOAL_DISTANCE_AFTER =
D0_G4B_U04

DISTANCE_REDUCED =
Completed the production promotion, 1,052-question validated stress,
1001-request hard-limit rejection, verified 68-question/68-answer Traditional
Chinese HTML/PDF bundle, branch artifact CI, implementation merge and fresh-main CI.

REMAINING_BLOCKERS = []

NEXT_SHORTEST_STEP =
S76_BatchB_NextSourcePriorityLock

STOP_REASON =
NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```
