# G4B-U04 R2D — Worksheet Layout Readback and Print Density QA

```text
TASK = G4B_U04_R2D_WorksheetLayoutReadbackAndPrintDensityQA
STATUS = PASS_CI_SYNCED_AND_MERGED
SOURCE_ID = g4b_u04_4b04
BASE_DESIGN = G4B_U04_R2_SemanticDedupLayoutAndSDGDesignLock
IMPLEMENTATION_PR = 210
IMPLEMENTATION_MERGE_SHA = 0bbbcbeb85c29672c9fd1685a72187a74e9592f0
```

## Scope and fixed boundary

R2D closes the approved G4B-U04 worksheet-layout segment only:

- `layoutMode = auto_safe | custom_with_caps`;
- requested versus resolved layout metadata;
- renderer-profile caps;
- question and answer re-pagination;
- Classic, fallback and Pixel applied-layout readback;
- non-blocking cap notice;
- six-scenario Chromium HTML/PDF density QA.

The following authority remains unchanged:

```text
KnowledgePoints = 13
PatternGroups   = 13
PatternSpecs    = 19
formula changes = none
generator changes = none
validator changes = none
renderer-profile dimensions changed = none
SDG runtime changes = none
generic fallback = forbidden
free-form AI = forbidden
```

## Layout modes and profile authority

`auto_safe` applies the complete profile selected by generated content. Generic requested columns and rows are recorded but do not create a cap warning.

`custom_with_caps` may lower question density. It cannot exceed the selected profile maximum.

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

Answer-page density remains profile-controlled in both modes.

## Public readback contract

Exact applied-layout text:

```text
套用版面：題目 {questionColumns} 欄 × {questionRows} 列；答案 {answerColumns} 欄 × {answerRows} 列
```

Exact capped notice:

```text
已依長文字題型自動調整為安全版面。
```

Warning code:

```text
G4B_U04_LAYOUT_CAPPED_TO_PROFILE
```

The warning is non-blocking. Preview displays it; printed output hides the preview-only readback.

Resolved information is stored in:

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

## R2D1 compatibility repair

The first CI run exposed three downstream contract drifts. R2D1 repaired them without changing layout semantics.

### S72 lifecycle isolation

The S72/R2C promotion lifecycle remains immutable:

```text
worksheetStatus = not_eligible
productionUse   = forbidden
```

R2D is a downstream layout lifecycle. Its overlay is not inserted into the base promotion authority registry list and does not change production eligibility.

### Legacy preview metadata compatibility

Worksheets without `layoutMode` retain the original metadata shape:

```text
questionMode|depthMode|contextMode
```

The fourth field and `data-public-layout-mode` are emitted only for output that actually has a layout mode.

### Worksheet-chain delegation

The browser pipeline imports the R2D wrapper, and the wrapper delegates the existing S76J worksheet chain. R2D does not bypass prior curriculum routing or renderer selection.

## Public controls

Classic, fallback and Pixel expose the same two layout modes. G4B-U04 query state round-trips:

```text
layoutMode=auto_safe
layoutMode=custom_with_caps
```

Unsupported values normalize to `auto_safe`. G5-only depth and context fields remain absent from the G4B-U04 query contract.

## HTML/PDF acceptance matrix

The dedicated workflow verified:

```text
compact × auto_safe
compact × custom_with_caps lower density
contextual × auto_safe
contextual × custom_with_caps lower density
inverseLong × auto_safe
inverseLong × custom_with_caps over-cap request
```

Every scenario passed:

- exact renderer profile;
- exact requested and resolved values;
- profile-controlled answer values;
- applied-layout readback;
- exact cap notice only in the capped scenario;
- zero DOM overflow;
- preview readback hidden from print;
- exact PDF page count;
- every PDF page nonblank;
- zero PDF text bounding-box overflow;
- Traditional Chinese extraction.

## Final-head acceptance

```text
FINAL_HEAD = 56f6b8951c1d1e22a49813cfbdbd3d5bd8e0506f

Node Test                                  29344616341 PASS
S42 Branch Test                            29344616258 PASS
Math CI Readback                           29344616860 PASS
S96D Focused + full-suite enforcement      29344616095 PASS
S75 68-question HTML/PDF smoke             29344616402 PASS
R2D six-scenario Layout HTML/PDF smoke     29344616215 PASS

DOM overflow count                         0
PDF bounding-box overflow count            0
S72 lifecycle mutation                     0
legacy metadata regression                 0
```

## Distance

```text
GOAL_DISTANCE_BEFORE =
D1_G4B_U04_R2C_CLOSED_NEXT_R2D

GOAL_DISTANCE_AFTER =
D1_G4B_U04_R2D_CLOSED_NEXT_R2E

DISTANCE_REDUCED =
Closed the truthful layout-control segment from public state and query parameters through profile-capped worksheet pagination, Classic and Pixel readback, and verified HTML/PDF output while preserving S72 authority and legacy preview metadata contracts.

REMAINING_BLOCKERS = [
  "R2E controlled SDG context materialization not completed",
  "R2F D0 recloseout not completed"
]

NEXT_SHORTEST_STEP =
G4B_U04_R2E_ControlledSDGTemplateVariantsAndContextMode

STOP_REASON = NONE
```
