# S75 — G4B-U04 Production Stress, HTML/PDF and D0 Closeout

```text
TASK = S75_G4B_U04_ProductionStressHTMLPDFAndD0Closeout
STATUS = IMPLEMENTED_PENDING_HTML_PDF_CI
SOURCE_ID = g4b_u04_4b04
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
productionUse                 = allowed
distance                      = D0_G4B_U04
htmlPdfStatus                 = production_smoke_required
requiredNextGate              = S76_BatchB_NextSourcePriorityLock
```

The overlay does not rewrite hidden source PatternSpecs or the S73 preview lifecycle. It records the accepted production projection after the S75 stress and artifact gates pass.

## Node stress contract

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

Every successful build must satisfy:

- requested question count equals generated question count;
- display-model count equals question count;
- answer-key count equals question count when enabled;
- blocking validation error count equals zero;
- no generic fallback;
- no arbitrary PatternSpec injection;
- no internal curriculum identifier in public prompt or answer text.

The canonical hard limit is separately verified by rejecting a 1001-question request with zero worksheet output.

## Coverage smoke

The committed smoke uses 68 questions because 68 provides four allocations for each of the 17 promoted PatternSpecs while keeping the PDF artifact bounded.

```text
questionCount    = 68
answerKeyItems   = 68
ordering         = groupedByPattern
questionMode     = mixed
selectionMode    = mixedKnowledgePointsSameUnit
```

The smoke must reach:

- all 12 KnowledgePoints;
- all 12 PatternGroups;
- all 17 PatternSpecs;
- concept, numeric, application, operation_estimation and reasoning modes;
- all 9 answer-model shapes;
- both Class C and Class D implementations;
- compact, contextual and inverse-long render content through the authoritative mixed worksheet.

## HTML acceptance

The generated HTML must:

- use `lang="zh-Hant"`;
- contain 68 question cells and 68 answer cells;
- contain no internal KP, PatternGroup, PatternSpec, FormalMapping or template IDs;
- contain no unresolved template placeholders;
- retain Traditional Chinese title and answer-page labels;
- use the S73 G4B-U04 renderer with debug data attributes disabled.

## Chromium and PDF acceptance

The dedicated workflow must:

1. install Chromium, Noto CJK, Poppler, Pillow and pypdf;
2. run the complete Node test suite;
3. regenerate the canonical HTML and manifest;
4. reject any rendered G4B-U04 cell with DOM overflow;
5. print A4 PDF with CSS page size and background enabled;
6. render every PDF page to PNG;
7. reject missing or blank rendered pages;
8. reject every PDF word bounding box outside its A4 page;
9. verify normalized PDF text contains `概數` and `答案頁`;
10. verify the final answer page is nonblank;
11. write SHA-256, byte count and final visual evidence to the manifest;
12. commit the first verified HTML/PDF/manifest bundle to the S75 branch.

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

Each explicit-mode build must contain only the requested canonical mode and remain blocking-validator clean.

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

Renderer CSS may be adjusted only when Chromium or PDF containment supplies concrete failure evidence. Such a fix may change layout containment, but not question meaning, answer meaning or curriculum authority.

## Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_PUBLIC_UI_PRINT_AND_QUERY_STATE_QA_CONNECTED

GOAL_DISTANCE_AFTER =
PENDING_S75_HTML_PDF_CI

DISTANCE_REDUCED =
Production overlay, 1052-question stress contract and canonical HTML/PDF gate implemented.
Final D0 acceptance waits for verified Chromium/PDF artifacts and fresh-main CI.

REMAINING_BLOCKERS = [
  "S75 Chromium HTML/PDF smoke has not passed",
  "Verified smoke bundle has not been committed",
  "Implementation PR and fresh-main CI have not passed"
]

NEXT_SHORTEST_STEP =
Run S75 branch workflow, commit the verified smoke bundle, merge, read back main CI and close at D0.
```
