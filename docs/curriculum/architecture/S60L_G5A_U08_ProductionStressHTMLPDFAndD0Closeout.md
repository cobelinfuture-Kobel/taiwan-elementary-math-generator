# S60L — G5A-U08 Production Stress, HTML/PDF and D0 Closeout

```text
TASK = S60L_G5A_U08_ProductionStressHTMLPDFAndD0Closeout
STATUS = IMPLEMENTED_PENDING_CI_AND_ARTIFACT
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

Aggregate coverage must reach all KPs, groups, PatternSpecs, modes, N/N+1 depths, daily-life/SDG contexts, TemplateFamilies, SDG goals and core answer models.

## HTML/PDF smoke

A fixed 120-question public mixed worksheet is generated through the same production browser worksheet path used by Classic and Pixel.

Required verification:

- 120 question cells and 120 answer cells;
- all 11 KPs, 17 groups and 30 PatternSpecs;
- all 10 TemplateFamilies, 8 SDGs and 6 answer models;
- Traditional Chinese font and title extraction;
- expected PDF page count equals actual page count;
- every rendered page nonblank;
- zero DOM overflow;
- zero PDF text bounding-box overflow;
- no internal IDs, unresolved placeholders, N+2 or formal-equation leakage;
- SHA-256 and byte size recorded in manifest.

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
GOAL_DISTANCE_AFTER  = D0_G5A_U08_PRODUCTION_PROMOTED_AND_PRINTABLE_PENDING_CI_ARTIFACT
DISTANCE_REDUCED     = Added final production promotion, count/stress coverage, fixed 120-question HTML/PDF verification and immutable D0 acceptance evidence.
REMAINING_BLOCKERS   = [
  "S60L PR CI",
  "verified HTML/PDF artifact",
  "merge and main CI closeout"
]
NEXT_SHORTEST_STEP = S60M_BatchA_AllUnitsProductionCloseout
```
