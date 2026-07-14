# G4B-U04 R2 — Semantic Dedup, Layout and SDG Design Lock

```text
TASK = G4B_U04_R2_SemanticDedupLayoutAndSDGDesignLock
STATUS = DESIGN_LOCKED_PENDING_CI
SOURCE_ID = g4b_u04_4b04
SCOPE = DESIGN_ONLY
```

## 1. Goal

This design lock addresses the production-quality findings discovered after the G4B-U04 D0 worksheet audit without changing runtime behavior in this task.

```text
existing 12 KP / 12 PatternGroup / 17 PatternSpec authority
→ duplicate-control contract
→ semantic-plausibility contract
→ layout-control truthfulness contract
→ controlled SDG context contract
→ implementation sequence
```

No generator, validator, renderer, public UI, query state, registry count or production lifecycle is modified by this design-only milestone.

## 2. Current layout behavior

The public UI exposes:

```text
question columns      = 1..6
question rows per page = 1..20
```

G4B-U04 does not accept those values without limits. The renderer selects one of three safety profiles from generated content and then caps the requested question layout.

```text
compact concept/numeric
question = max 2 columns × 6 rows
answer   = fixed 2 columns × 8 rows

contextual/application/estimation
question = max 2 columns × 4 rows
answer   = fixed 1 column × 6 rows

inverse long-answer
question = max 1 column × 4 rows
answer   = fixed 1 column × 5 rows
```

Effective question layout is:

```text
resolvedColumns   = min(valid requestedColumns, profileMaxColumns)
resolvedRows      = min(valid requestedRowsPerPage, profileMaxRows)
```

Therefore the controls are adjustable only toward a lower-density layout. They cannot force a denser layout than the selected safety profile.

## 3. Layout decision

The safety caps remain mandatory. Long contextual and inverse-reasoning cards must not be forced into 4–6 columns merely because the generic public control accepts those values.

R2 implementation shall make the behavior explicit:

```text
layoutMode = auto_safe | custom_with_caps

default = auto_safe
```

### `auto_safe`

The selected content determines the complete renderer profile.

### `custom_with_caps`

The user may reduce the profile density but may not exceed profile caps.

```text
requested 1 column under contextual profile → resolved 1 column
requested 2 columns under contextual profile → resolved 2 columns
requested 4 columns under contextual profile → resolved 2 columns
requested 6 rows under inverse-long profile  → resolved 4 rows
```

The public preview must display the resolved values, not only the requested values.

Required preview metadata:

```text
套用版面：題目 1 欄 × 4 列；答案 1 欄 × 5 列
```

If a request is capped, the public UI shall show a non-blocking notice:

```text
已依長文字題型自動調整為安全版面。
```

Answer-key layouts remain profile-controlled in R2. User-adjustable answer-key columns and rows are explicitly outside scope because answer text can be substantially longer than question text.

## 4. Duplicate-control contract

The current worksheet generation report does not reject duplicate prompts. R2 must add a worksheet-level uniqueness gate.

### Canonical prompt signature

```text
normalize Unicode NFKC
→ trim
→ collapse whitespace
→ normalize punctuation spacing
→ preserve all numeric values and units
```

A worksheet may not contain two questions with the same normalized prompt signature.

### Pattern-specific restrictions

```text
symbol-reading prompt     = maximum 1 per worksheet
fixed inverse case        = may not repeat before case-pool exhaustion
same semantic role bundle = may not repeat under the same PatternSpec
```

When a collision occurs:

```text
resample up to bounded retry limit
→ use another allowlisted case/template
→ if unique capacity is insufficient, return a blocking generation error
```

Silent duplicate acceptance and generic fallback remain forbidden.

## 5. Semantic-plausibility contract

All contextual quantities must match the scale of the named object or setting.

Examples:

```text
classroom chairs / students = tens, not tens of thousands
school or auditorium seats  = hundreds to low thousands
city residents              = thousands to millions
packaged goods              = scale determined by container and unit
```

Required fixes include:

```text
31,561 classroom chairs → invalid semantic scale
"有 4,383 枝" → missing item noun
unformatted direct answers → public number-format inconsistency
```

Every controlled semantic template must provide:

```text
item noun
classifier
unit
plausible numeric range
answer unit
context domain
```

## 6. SDG decision

SDG is not a KnowledgePoint and must not create a parallel curriculum skill hierarchy.

```text
KnowledgePoint = mathematical learning objective
SDG context     = controlled semantic context dimension
```

SDG variants apply only to existing Class D application and operation-estimation PatternSpecs. Concept, direct numeric and inverse-rounding PatternSpecs do not receive forced SDG wording.

### Public context modes

```text
contextMode = mixed | daily_life | sdg
```

Default remains `mixed`.

Recommended allocation in mixed mode:

```text
daily_life = approximately 2/3
sdg        = approximately 1/3
```

This is a diversity target, not a hard per-worksheet guarantee for very small question counts.

### Allowlisted SDG domains

R2 may use age-appropriate fictional scenarios associated with:

```text
SDG 6  clean water and water conservation
SDG 7  renewable energy and electricity saving
SDG 11 sustainable transport and community facilities
SDG 12 recycling, reuse and responsible packaging
SDG 13 tree planting and emissions-reduction activities
SDG 15 habitat and forest restoration activities
```

### Approved mathematical mappings

```text
floor complete groups
→ complete recycling bundles or full collection boxes

ceiling minimum required
→ minimum water tanks, recycling bins or transport trips

round then add/subtract
→ estimated collected material, water saved, riders or planted trees

round then multiply
→ repeated weekly/monthly conservation totals

round then divide
→ equal allocation among classes, teams or community groups
```

### SDG safety rules

```text
all quantities are fictional exercise data
no claim is presented as a current real-world statistic
no political persuasion or moral grading
no fear-based climate language
no free-form AI generation
all templates are allowlisted and validator-backed
units and scale must remain plausible
```

SDG context labels may be stored in metadata, but an SDG number or badge does not need to appear in every student-facing prompt.

## 7. KnowledgePoint and PatternSpec boundary

This design does not increase KP count merely to add SDG wording.

The previously identified source-backed discount-price gap remains separate:

```text
discount price rounded down to denomination
→ payment amount after unconditional round-down
→ banknote count after unconditional round-down
```

Those are mathematical pattern additions and may justify PatternSpec and KnowledgePoint refinement. SDG variants alone do not.

## 8. Implementation order

```text
R2A semantic plausibility and number-format fixes
R2B worksheet-level prompt deduplication
R2C source-backed discount round-down PatternSpecs and KP refinement
R2D resolved layout mode and public applied-layout readback
R2E controlled SDG template variants and contextMode
R2F full worksheet, answer-key, HTML/PDF and deployed UI recloseout
```

Only one implementation stage may be executed at a time.

## 9. Acceptance gates for the eventual R2 release

```text
0 exact duplicate prompts in canonical stress worksheets
0 semantically implausible context ranges
0 missing item nouns or answer units
100% public numeric formatting consistency
requested/resolved layout values visible and truthful
no profile cap bypass
SDG context resolves only to allowlisted templates
contextMode query round-trip passes
all existing non-SDG routes remain compatible
all answers remain blocking-validator accepted
HTML/PDF overflow count = 0
```

## 10. Distance

```text
GOAL_DISTANCE_BEFORE = D1_G4B_U04_QUALITY_PATCH_NOT_FORMALLY_LOCKED
GOAL_DISTANCE_AFTER  = D1_G4B_U04_R2_SEMANTIC_LAYOUT_SDG_CONTRACT_LOCKED

DISTANCE_REDUCED =
Locked the exact behavior required for truthful row/column controls,
worksheet deduplication, semantic plausibility and controlled SDG variants.

REMAINING_BLOCKERS = [
  "R2A semantic plausibility and number-format implementation not completed",
  "R2B prompt deduplication not implemented",
  "R2C source-backed discount PatternSpecs not implemented",
  "R2D resolved layout UI readback not implemented",
  "R2E SDG context templates and control not implemented",
  "R2F production recloseout not completed"
]

NEXT_SHORTEST_STEP =
G4B_U04_R2A_SemanticPlausibilityAndNumberFormatPatch

STOP_REASON = NONE
```
