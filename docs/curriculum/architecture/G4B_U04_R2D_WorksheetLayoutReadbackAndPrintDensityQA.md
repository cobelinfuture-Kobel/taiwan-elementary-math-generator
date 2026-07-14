# G4B-U04 R2D — Worksheet Layout Readback and Print Density QA

```text
TASK = G4B_U04_R2D_WorksheetLayoutReadbackAndPrintDensityQA
STATUS = IMPLEMENTED_PENDING_CI
SOURCE_ID = g4b_u04_4b04
BASE_DESIGN = G4B_U04_R2_SemanticDedupLayoutAndSDGDesignLock
```

## Scope

R2D implements only the approved G4B-U04 worksheet-layout contract:

- two public layout modes;
- renderer-profile density caps;
- requested versus resolved layout metadata;
- exact applied-layout readback in Classic and Pixel preview surfaces;
- a non-blocking cap notice;
- re-pagination after layout resolution;
- six-scenario Chromium HTML/PDF density QA.

R2D does not add KnowledgePoints, PatternGroups, PatternSpecs, formulas, generators, validators, SDG templates or context modes.

## Public layout modes

```text
auto_safe
custom_with_caps
```

`auto_safe` is the default. It applies the complete renderer profile selected by the generated question set and does not treat ignored generic columns/rows as a cap event.

`custom_with_caps` permits the operator to lower question density. Requests above the renderer profile are clamped to the profile maximum. There is no bypass path.

## Renderer profile authority

```text
compact
question = 2 columns × 6 rows
answer   = 2 columns × 8 rows

contextual
question = 2 columns × 4 rows
answer   = 1 column  × 6 rows

inverseLong
question = 1 column  × 4 rows
answer   = 1 column  × 5 rows
```

Question-page columns and rows may be lower than the profile maximum only in `custom_with_caps` mode.

Answer-page columns and rows are always profile-controlled. Public custom values never override answer density.

## Layout resolution contract

The shared resolver returns:

```text
schemaVersion
sourceId
profileId
layoutMode
layoutModeLabel
requestedQuestionLayout
profileQuestionCap
resolvedQuestionLayout
resolvedAnswerLayout
answerKeyProfileControlled
includeAnswerKey
capped
cappedFields
noticeCode
noticeText
appliedLayoutText
warnings
```

The exact public readback format is:

```text
套用版面：題目 {questionColumns} 欄 × {questionRows} 列；答案 {answerColumns} 欄 × {answerRows} 列
```

The exact capped notice is:

```text
已依長文字題型自動調整為安全版面。
```

The notice uses warning code:

```text
G4B_U04_LAYOUT_CAPPED_TO_PROFILE
```

It is non-blocking. Generation, validation, worksheet creation and print remain successful.

## Worksheet integration

R2D wraps the current public worksheet entry without replacing existing curriculum routing.

```text
current worksheet chain
→ G4B-U04 renderer profile selection
→ R2D layout resolution
→ question and answer re-pagination
→ WorksheetDocument readback metadata
→ preview metadata
→ print HTML/PDF
```

The resolved values are written to:

```text
worksheetDocument.layoutResolution
worksheetDocument.appliedLayoutText
worksheetDocument.layoutNoticeText
worksheetDocument.publicControls.layoutMode
worksheetDocument.metadata.layoutResolution
worksheetDocument.printOptions
worksheetDocument.batchA.layoutMode
worksheetDocument.g4bU04Summary
worksheetDocument.configSnapshot
worksheetDocument.summary
worksheetDocument.validationSummary.warnings
```

Non-G4B-U04 worksheet routes are returned unchanged.

## Public surface integration

### Classic and fallback

The dynamically mounted G4B-U04 control now includes:

```text
questionMode
layoutMode
```

Changing `layoutMode` uses the existing layout-control invalidation path, so the generated worksheet becomes stale, query state is rewritten, and the operator must regenerate before printing.

The outer preview metadata and the iframe HTML both display the applied layout. Requested and resolved values are also exposed through machine-readable body attributes.

### Pixel

Pixel mounts the same two layout modes. Changing the mode uses the existing columns-control synchronization and stale-print path.

Pixel preview metadata displays both the applied layout and the cap notice when applicable.

## Query-state contract

G4B-U04 supports:

```text
layoutMode=auto_safe
layoutMode=custom_with_caps
```

Unsupported values normalize to `auto_safe`.

The field round-trips only for G4B-U04. G5-only `depthMode` and `contextMode` remain absent from G4B-U04 query state.

## HTML/PDF acceptance matrix

The dedicated R2D workflow generates six scenarios:

```text
compact × auto_safe
compact × custom_with_caps lower density
contextual × auto_safe
contextual × custom_with_caps lower density
inverseLong × auto_safe
inverseLong × custom_with_caps over-cap request
```

For every scenario the workflow requires:

- exact question and answer counts;
- exact renderer profile;
- exact requested/resolved question values;
- exact profile-controlled answer values;
- applied-layout readback present;
- exact cap notice only in the capped case;
- zero DOM card overflow;
- preview readback hidden from print;
- exact expected PDF page count;
- every rendered page nonblank;
- zero PDF text bounding-box overflow;
- Traditional Chinese title extraction.

## Fixed boundaries

```text
KnowledgePoint count unchanged = 13
PatternGroup count unchanged = 13
PatternSpec count unchanged = 19
formula changes = none
generator changes = none
validator changes = none
renderer profile dimensions changed = none
SDG runtime changes = none
generic fallback = forbidden
free-form AI = forbidden
profile cap bypass = forbidden
```

## Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_R2C_CLOSED_NEXT_R2D

GOAL_DISTANCE_AFTER =
D1_G4B_U04_R2D_IMPLEMENTED_PENDING_CI

DISTANCE_REDUCED =
Connected the approved layout-mode contract to shared state, query state, worksheet pagination, Classic and Pixel readback, and a dedicated six-scenario HTML/PDF density gate.

REMAINING_BLOCKERS = [
  "R2D final-head CI not completed",
  "R2D HTML/PDF density smoke not completed",
  "R2D implementation PR not merged",
  "R2E controlled context materialization not completed",
  "R2F D0 recloseout not completed"
]

NEXT_SHORTEST_STEP =
G4B_U04_R2D_CIHTMLPDFAndCloseout

STOP_REASON = NONE
```
