# S75 — G4B-U04 Production Stress, HTML/PDF and D0 Closeout

```text
TASK = S75_G4B_U04_ProductionStressHTMLPDFAndD0Closeout
STATUS = PASS_CI_SYNCED_AND_MERGED
SOURCE_ID = g4b_u04_4b04
DISTANCE = D0_G4B_U04
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

No KnowledgePoint, PatternGroup, PatternSpec, generator, answer model or semantic template family was added, removed, merged or split.

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

The overlay does not rewrite hidden source PatternSpecs or the S73 preview lifecycle. It records the accepted production projection after the S75 stress and artifact gates passed.

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

Every successful build satisfied:

- requested question count equals generated question count;
- display-model count equals question count;
- answer-key count equals question count when enabled;
- blocking validation error count equals zero;
- no generic fallback;
- no arbitrary PatternSpec injection;
- no internal curriculum identifier in public prompt or answer text.

The canonical hard limit was separately verified by rejecting a 1001-question request with zero worksheet output.

## Determinism and explicit modes

S75 replayed the same 68-question shuffled seed twice and obtained identical prompt, answer and ordering projections.

Separate production builds passed for:

```text
concept
numeric
application
operation_estimation
reasoning
```

Each explicit-mode build contained only the requested canonical mode and remained blocking-validator clean.

## Verified HTML/PDF bundle

The committed smoke uses 68 questions because 68 provides four allocations for each of the 17 promoted PatternSpecs while keeping the PDF artifact bounded.

```text
questionCount             = 68
answerKeyItemCount        = 68
questionPageCount         = 17
answerKeyPageCount        = 14
actualPdfPageCount        = 31
nonblankRenderedPageCount = 31
ordering                  = groupedByPattern
questionMode              = mixed
selectionMode             = mixedKnowledgePointsSameUnit
rendererProfileId         = g4b_u04_inverse_long_answer_v1
```

Coverage reached:

```text
KnowledgePoints      = 12 / 12
PatternGroups        = 12 / 12
PatternSpecs         = 17 / 17
Question modes       = 5 / 5
Answer shapes        = 9 / 9
Render kinds         = 11
Class C questions    = 36
Class D questions    = 32
Long-text questions  = 36
```

Mode distribution:

```text
concept              = 16
numeric              = 12
application          = 16
operation_estimation = 16
reasoning            = 8
```

Artifact integrity:

```text
HTML question cells       = 68
HTML answer cells         = 68
DOM overflow              = 0
PDF bbox overflow         = 0
Internal-ID leak          = 0
Unresolved placeholder    = 0
Blank rendered pages      = 0
CJK glyph rendering       = pass
PDF bytes                 = 401307
HTML SHA-256              = b1f8f4de42fdaccd9fcb1a324f3af6a164b4e4046d06848afed44814f9a80b64
PDF SHA-256               = 3ad7cf4629a1a5e9ca415018deed4049087e567e58c5c84e8e04ccb2f903eb5c
```

The normalized PDF text contains `概數` and `答案頁`, and the final answer page is nonblank.

## CI and merge evidence

Implementation PR:

```text
PR                    = 117
PR head               = f9d58cb447ea3d6c25b50d1f363cbe92cc38bde3
implementation merge  = e30a22a0d322d0b20075df73cd802d6ef2dc6499
PR Math CI run        = 29217220270
PR S75 smoke run      = 29217220427
PR tests              = 1101
PR pass               = 1101
PR fail               = 0
PR working tree       = clean
```

Fresh-main verification:

```text
main verified SHA     = e30a22a0d322d0b20075df73cd802d6ef2dc6499
main Math CI run      = 29217320409
main tests            = 1101
main pass             = 1101
main fail             = 0
main working tree     = clean
main readback commit  = 3a9956e59fe38c9188dc3fbb1ae5cb75f6cf4f30
```

All prior triggered regression and HTML/PDF workflows also passed.

## Boundary

```text
KnowledgePoint scope changed        = false
PatternSpec scope changed           = false
Generator math changed              = false
Validator math changed              = false
Resolver allocation changed         = false
Public UI control set changed       = false
Renderer semantic content changed   = false
Renderer containment fix required   = false
Production promotion overlay added  = true
Stress QA added                     = true
HTML/PDF artifact gate added        = true
Verified smoke bundle committed     = true
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_PUBLIC_UI_PRINT_AND_QUERY_STATE_QA_CONNECTED

GOAL_DISTANCE_AFTER =
D0_G4B_U04_PRODUCTION_READY_AND_CLOSED

DISTANCE_REDUCED =
Completed production promotion, 1052-question aggregate stress, all-authority reachability,
deterministic mode QA, committed Traditional Chinese HTML/PDF verification, PR merge and fresh-main CI.
G4B-U04 can now generate, validate, render, preview and print production worksheets with answer pages.

REMAINING_BLOCKERS = []

NEXT_SHORTEST_STEP =
S76_BatchB_NextSourcePriorityLock

STOP_REASON =
NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```
