# S91 — G5A-U02 Hidden Worksheet Allocation and Answer-Key Integration

```text
TASK = S91_G5A_U02_HiddenWorksheetAllocationAndAnswerKeyIntegration
STATUS = IMPLEMENTED_PENDING_CI
UNIT = G5A-U02 因數與公因數
```

## Scope

S91 connects the S90 hidden canonical resolver to an internal WorksheetDocument assembly path.

```text
22 hidden PatternSpecs
→ S90 canonical resolver
→ exact-count deterministic allocation
→ blocking-validated generated questions
→ question records without answer leakage
→ optional structured answer-key records
→ question / answer-key pagination
```

This milestone does not expose a public selector and does not connect a renderer, browser pipeline, HTML output or PDF output.

## Authority coverage

```text
PatternSpecs          = 22
Class C routes        = 14
Class D routes        = 8
Answer-model shapes   = 16
Source identities     = 2
```

Supported answer-model shapes:

```text
relationClassificationAnswer
integerListAnswer
factorPairListAnswer
orderedFactorRelationAnswer
missingValueMapAnswer
selectionSetAnswer
booleanAnswer
integerListWithUnitAnswer
problemTypeLabelAnswer
structuredInferenceAnswer
booleanSetAnswer
remainderAnswer
integerAnswer
lengthListAnswer
areaListAnswer
digitTupleAnswer
```

## Allocation contract

S91 uses `canonical_round_robin` allocation.

- selected PatternSpec IDs must be unique and canonical;
- question count must be between 1 and 1000;
- default selection contains all 22 PatternSpecs in canonical source order;
- the generated sequence repeats the selected IDs in order until the exact requested count is reached;
- `patternCounts` must sum to the exact question count;
- generation seeds are deterministic from `baseSeed` and question position;
- no generic fallback is permitted.

The allocation layer can therefore create:

- one question per PatternSpec;
- bounded focused worksheets using a selected subset;
- larger mixed worksheets whose distribution differs by at most one item between selected routes.

## Blocking generation contract

Every allocated position is generated through:

```text
generateG5AU02Canonical(patternSpecId)
→ validateG5AU02Canonical(item)
```

A WorksheetDocument is produced only when every generated item passes canonical blocking validation and the exact question count is met.

On any blocking error:

```text
ok = false
worksheetDocument = null
```

Partial worksheets are forbidden.

## Question records

Question records preserve canonical instructional identity:

```text
questionNumber
patternSpecId
formalMappingId
patternGroupId
knowledgePointId
implementationClass
mode
answerModelId
prompt
responseLabel
sourceIds
```

Question records intentionally exclude:

```text
answer
structuredAnswer
answerText
```

The validator blocks any answer leakage into the question side.

## Answer-key records

When `includeAnswerKey = true`, S91 creates exactly one answer record for every question:

```text
questionNumber
patternSpecId
answerModelId
structuredAnswer
answerText
```

`structuredAnswer` preserves the generator answer object. `answerText` provides a deterministic Traditional Chinese presentation for all 16 answer-model shapes.

When `includeAnswerKey = false`:

```text
answerKeyRecords = []
answerKeyPages   = []
```

Any retained answer record or answer page is a blocking error.

## Pagination

S91 paginates data records but does not render them.

Defaults:

```text
questionRowsPerPage = 8
answerRowsPerPage   = 12
```

Both values are configurable between 1 and 100. Flattened page records must exactly equal their source record arrays; pagination drift is blocked.

## Validation coverage

Executable QA verifies:

1. exact 22 / 14 / 8 authority coverage;
2. all 16 answer-model shapes have deterministic formatting;
3. exact round-robin allocation and count totals;
4. invalid count, duplicate selection and unknown ID rejection;
5. one generated question and answer for every PatternSpec;
6. Class C and Class D coverage;
7. deterministic repeated builds for the same seed;
8. exact counts above 22 routes;
9. complete answer-key suppression;
10. question-answer leakage rejection;
11. canonical mapping, group, KP, mode, answer-model and source parity;
12. answer record mismatch rejection;
13. pagination drift rejection;
14. renderer scope breach rejection;
15. deep-freeze immutability.

## Lifecycle boundary

```text
worksheetStatus  = hidden_exact_count_integrated
answerKeyStatus  = hidden_integrated_optional
selectorStatus   = hidden
canonicalRouting = internal_explicit_only
rendererStatus   = not_connected
productionUse    = forbidden
genericFallback  = forbidden
freeFormAI       = forbidden
```

S91 does not modify the S84 hidden projection, S88 runtime bindings, S89 source metadata authority or S90 canonical resolver identity.

## Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G5A_U02_CANONICAL_RESOLVER_VERIFIED_AND_CLOSED

GOAL_DISTANCE_AFTER =
D1_G5A_U02_HIDDEN_WORKSHEET_AND_ANSWER_KEY_IMPLEMENTED_PENDING_CI

DISTANCE_REDUCED =
Connected all 22 canonical routes and 16 answer-model shapes to exact-count
hidden WorksheetDocument assembly, blocking validation, answer separation,
optional answer-key records and deterministic pagination.

REMAINING_BLOCKERS = [
  "PR CI and fresh-main closeout pending",
  "Public selector remains hidden",
  "Renderer / HTML / PDF are not connected",
  "Production use remains forbidden"
]

NEXT_SHORTEST_STEP =
S91R1_G5A_U02_HiddenWorksheetAllocationAndAnswerKeyIntegration_CIReadbackAndMerge
```
