# S60M — Batch A All-Units Production Closeout

```text
TASK = S60M_BatchA_AllUnitsProductionCloseout
STATUS = PASS_CI_SYNCED_AND_MERGED
```

## Scope

S60M closes the shared **Batch A source-unit worksheet production path** for all 13 public units. It does not claim that every unit has the same advanced KnowledgePoint, semantic-template, or SDG feature depth.

```text
source-unit selectable
→ deterministic question generation
→ blocking validation
→ worksheet assembly
→ answer-key assembly
→ HTML preview
→ print output
```

The richer unit-specific routes remain additive:

- G3B-U04: numeric/application hybrid semantic route;
- G3B-U08: application semantic route;
- G4B-U01: horizontal multi-digit multiplication/division route;
- G5A-U08: numeric/application/reasoning, N/N+1 and daily-life/SDG route.

Source-unit mode remains the common production baseline for every Batch A unit.

## Authoritative 13 units

```text
g3a_u01_3a01
g3a_u02_3a02
g3a_u03_3a03
g3a_u06_3a06
g3b_u01_3b01
g3b_u04_3b04
g3b_u08_3b08
g4a_u01_4a01
g4a_u02_4a02
g4a_u04_4a04
g4a_u08_4a08
g4b_u01_4b01
g5a_u08_5a08
```

## Executable production matrix

The S60M gate runs all 13 units through:

```text
ordering = groupedByPattern / shuffleAcrossPatterns
answer key = enabled / disabled
question count = 24 per matrix cell
```

Aggregate matrix size:

```text
13 units × 2 ordering modes × 2 answer-key modes × 24 questions
= 1,248 generated production questions
```

Additional gates verify:

- exact question and answer counts;
- deterministic shuffled replay;
- answer-record and answer-page suppression;
- nonempty question and answer pages;
- current top-level S60J worksheet/renderer extension chain;
- Traditional Chinese HTML;
- no public curriculum IDs;
- no unresolved template placeholders.

## Public surfaces

```text
Classic
404 fallback
Pixel
```

The previous S49/S50 production gates remain the public UI and GitHub Pages baseline. S60M adds a current aggregate source-unit release gate after later G3B-U04, G3B-U08, G4B-U01 and G5A-U08 extensions.

## Lifecycle

```text
batch = A
sourceUnitCount = 13
productionUse = allowed
goalDistance = D0_BATCH_A_SOURCE_UNIT_WORKSHEET
```

This closeout is deliberately scoped to the Batch A source-unit production worksheet contract. Batch B/C/D/E remain outside production scope.

## CI and merge evidence

```text
implementation PR = #88
implementation merge commit = f8e4b51925522cd67b5d5cb086ffff7ff3fae7a4
PR Node Test = PASS
PR S42 Branch Test = PASS
PR Math CI Readback = PASS
PR G4B-U01 HTML/PDF Smoke = PASS
PR G4B-U01 Warning/Print Layout = PASS
PR G5A-U08 HTML/PDF Smoke = PASS
main CI run = 29188533414
main tests = 981
main pass = 981
main fail = 0
main working tree = clean
main CI readback commit = d3a3285ef8d4c009c1dfa1e9ce1b79da309e6496
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_BATCH_A_ALL_UNITS_IMPLEMENTED_WITH_UNIT_LEVEL_CLOSEOUTS_NOT_AGGREGATED
GOAL_DISTANCE_AFTER  = D0_BATCH_A_SOURCE_UNIT_WORKSHEET_PRODUCTION_CLOSED
DISTANCE_REDUCED     = Added and accepted a current executable 13-unit release matrix covering generation, validation, worksheet, answer-key, HTML and print prerequisites after all late unit extensions.
REMAINING_BLOCKERS   = []
NEXT_SHORTEST_STEP = S61_BatchBPlanningAndSourcePriorityLock
```
