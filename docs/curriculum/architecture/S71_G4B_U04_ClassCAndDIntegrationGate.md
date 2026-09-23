# S71 — G4B-U04 Class C and D Integration Gate

```text
TASK = S71_G4B_U04_ClassCAndDIntegrationGate
STATUS = PASS_CI_SYNCED_AND_MERGED
SOURCE_ID = g4b_u04_4b04
```

## Scope

S71 integrates the independently completed S69 Class C runtime and S70 Class D runtime behind one authority-driven hidden gate.

```text
S68 authority: 17 PatternSpecs
├─ S69 Class C: 9 PatternSpecs
└─ S70 Class D: 8 PatternSpecs
          ↓
S71 authority-driven router
          ↓
mixed deterministic batch
          ↓
delegated Class C / Class D blocking validation
          ↓
zero accepted output on any blocking error
```

S71 does not expose a public selector, connect a canonical resolver, create a WorksheetDocument, render HTML/PDF or allow production use.

## Authority coverage

```text
KnowledgePoints               = 12
PatternGroups                 = 12
PatternSpecs                  = 17
Class C PatternSpecs          = 9
Class D PatternSpecs          = 8
answer models                 = 9
controlled template families = 9
```

Mode distribution:

```text
concept               = 4
numeric               = 3
application           = 4
operation_estimation  = 4
reasoning             = 2
-------------------------
total                 = 17
```

The canonical order comes from S68 `patternOrder`. The Class C and Class D sets are disjoint and their union equals all 17 authoritative PatternSpecs.

## Integration generation

S71 exports:

```text
generateG4BU04IntegratedQuestion()
generateG4BU04IntegratedBatch()
```

Routing is derived from the authoritative PatternSpec, not from caller-provided class metadata:

```text
implementationClass = C
→ S69 deterministic generator

implementationClass = D
→ S70 controlled-semantic generator
```

The gate supports two hidden coverage modes:

```text
fullAuthority    = all 17 authoritative PatternSpecs; default
selectedPatterns = explicit hidden subset for later resolver consumption
```

Neither mode is a public selector.

Batch guarantees:

- exact question counts from 1 through 1000;
- deterministic seed replay;
- canonical PatternSpec ordering;
- balanced PatternSpec allocation;
- derived Class C / D allocation;
- derived five-mode allocation;
- grouped and deterministic shuffled ordering;
- unique question IDs;
- no generic fallback.

## Integration validation

S71 exports:

```text
validateG4BU04IntegratedQuestion()
validateG4BU04IntegratedBatch()
```

Each question is routed to the validator required by its authoritative PatternSpec:

```text
Class C authority → S69 blocking validator
Class D authority → S70 blocking validator
```

The unified result preserves delegated blocking codes and adds integration-only errors for:

- missing or invalid batch shape;
- source or unit drift;
- invalid, duplicate, incomplete or noncanonical PatternSpec sets;
- full-authority coverage gaps;
- question-count drift;
- PatternSpec allocation drift;
- Class C / D allocation drift;
- mode allocation drift;
- duplicate question IDs;
- authority-class mismatch;
- cross-class generator routing;
- hidden lifecycle drift;
- grouped-order drift;
- deterministic replay mismatch.

```text
shared S67 blocking codes = 44
integration-only codes    = 14
validator stages          = 8
```

Any delegated or integration blocking error causes:

```text
acceptedQuestions = []
```

## Acceptance matrix

Executable QA covers:

1. exact 17-pattern authority partition: C=9, D=8;
2. 12 KnowledgePoints and 12 PatternGroups;
3. all five modes and all nine answer models;
4. every PatternSpec generated and validated through the correct class route;
5. 17-question full-authority smoke with one question per PatternSpec;
6. hidden selected-pattern mixed C/D smoke;
7. deterministic balanced 1000-question grouped stress;
8. deterministic balanced 1000-question shuffled stress;
9. cross-class routing mutations;
10. Class C and Class D delegated error propagation;
11. question-count, allocation, duplicate-ID and ordering mutations;
12. full-authority coverage mutations;
13. lifecycle/public/worksheet/renderer/production mutations;
14. exact shared and integration blocking-code registries.

## CI-driven correction

The first PR run failed before runtime assertions because one mutation test used `array.at(-1)` as an assignment target, which is invalid JavaScript syntax. The test was rewritten with an explicit `lastIndex` swap. No S69, S70 or S71 runtime semantic was changed by this correction.

## CI and merge evidence

```text
implementation PR       = #109
implementation merge    = e02caa8d76234f2ef08da4e51482870ba2f01993
main CI run             = 29198287473
main CI readback commit = ee83eacc0d497b58631e40be59da87fbaefd26cb
tests                   = 1056
pass                    = 1056
fail                    = 0
working tree            = clean
```

## Lifecycle boundary

```text
Class C runtime            = implemented_hidden
Class D runtime            = implemented_hidden
Class C + D integration    = implemented_hidden
selector visibility        = hidden
canonical resolver         = not connected
canonical routing          = disabled
worksheet eligible         = false
answer-key path            = not connected
renderer connected         = false
HTML/PDF smoke             = not implemented
production use             = forbidden
```

## Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_CLASS_C_AND_D_RUNTIME_IMPLEMENTED_HIDDEN

GOAL_DISTANCE_AFTER =
D1_G4B_U04_CLASS_C_AND_D_INTEGRATION_GATE_LOCKED_HIDDEN

DISTANCE_REDUCED =
Unified all 17 PatternSpecs behind an authority-driven mixed generator,
class-safe validator router, deterministic allocation and batch zero-output gate.

REMAINING_BLOCKERS = [
  "Canonical resolver and promotion contract not connected",
  "Public selector not enabled",
  "Worksheet, answer key and renderer path not connected",
  "HTML/PDF production stress and D0 closeout not completed"
]

NEXT_SHORTEST_STEP =
S72_G4B_U04_PromotionResolverAndPublicSelectorIntegration

STOP_REASON =
NEXT_STEP_OUTSIDE_CURRENT_USER_APPROVED_SCOPE
```
