# S60L — G5A-U08 Production Stress, HTML/PDF and D0 Closeout

```text
TASK = S60L_G5A_U08_ProductionStressHTMLPDFAndD0Closeout
STATUS = VERIFIED_ARTIFACT_PENDING_FINAL_PR_CI_AND_MERGE
```

## Production scope

```text
11 visible KnowledgePoints
17 visible PatternGroups
30 promoted PatternSpecs
10 application TemplateFamilies
8 SDG goals
6 core answer models
3 public UI surfaces
```

Production promotion changes G5A-U08 from `preview_only_pending_s60l` to:

```text
worksheetStatus = production_eligible
productionUse = allowed
```

The selector, resolver, canonical generator, blocking validator and public controls remain unchanged.

## Stress matrix

```text
public counts = 1, 11, 29, 72, 120, 200
aggregate stress = 5 batches × 200 = 1000 questions
ordering = grouped and deterministic shuffled
answer key = enabled and suppressed paths
```

Aggregate coverage reaches all KPs, groups, PatternSpecs, modes, N/N+1 depths, daily-life/SDG contexts, TemplateFamilies, SDG goals and core answer models.

## Verified HTML/PDF smoke

A fixed 120-question public mixed worksheet was generated through the same production browser worksheet path used by Classic and Pixel.

```text
question cells = 120
answer cells = 120
question pages = 15
answer pages = 20
expected PDF pages = 35
actual PDF pages = 35
rendered nonblank pages = 35 / 35
DOM overflow = 0
PDF text bounding-box overflow = 0
internal ID leakage = 0
unresolved placeholders = 0
CJK glyph rendering = PASS
PDF bytes = 508081
HTML SHA-256 = 3def772880349a324116ff593a606bbaa9f46b1c6ef887e8bd297043f7510c36
PDF SHA-256 = 6837b467ad5ac27198f59067178aa90c60a87eb74d9c511fe680944902f64033
```

Coverage in the fixed smoke:

```text
KnowledgePoints = 11 / 11
PatternGroups = 17 / 17
PatternSpecs = 30 / 30
TemplateFamilies = 10 / 10
SDG goals = 8 / 8
answer models = 6 / 6
modes = numeric, application, reasoning
depths = N, N+1
contexts = daily_life, sdg
```

The first two smoke failures were verification-tool defects rather than worksheet defects: CSS class selectors were counted as answer cards, and adjacent CSS braces were mistaken for semantic placeholders. The corrected tool counts actual `<article>` cards and detects only `{{identifier}}` placeholders. The full artifact workflow then passed without weakening coverage, internal-ID, DOM or PDF containment gates.

## Boundaries

```text
public maximum question count = 200
N+2 = not public
formal equation = not public
generic fallback = forbidden
blocking validation = required
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U08_PUBLIC_UI_PRINT_QUERY_STATE_ACCEPTED_PRODUCTION_CLOSEOUT_PENDING
GOAL_DISTANCE_AFTER  = D0_G5A_U08_PRODUCTION_PROMOTED_AND_PRINTABLE_PENDING_FINAL_PR_CI_AND_MERGE
DISTANCE_REDUCED     = Completed production promotion, public count/stress coverage, and a verified 120-question Traditional Chinese HTML/PDF bundle with full semantic and layout containment evidence.
REMAINING_BLOCKERS   = [
  "final PR CI on the human-authored evidence commit",
  "merge and main CI closeout"
]
NEXT_SHORTEST_STEP = S60M_BatchA_AllUnitsProductionCloseout
```
