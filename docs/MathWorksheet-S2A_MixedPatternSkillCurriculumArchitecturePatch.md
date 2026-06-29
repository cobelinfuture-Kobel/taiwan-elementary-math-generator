# MathWorksheet-S2A Mixed Pattern Skill Curriculum Architecture Patch

## 1. Preflight

- Task scope: architecture patch only.
- Project: `math-worksheet-generator`
- Stage: S2A
- Patch intent: extend S2 without replacing it.
- Runtime status: no runtime HTML, JavaScript, CSS, or tests are created in this stage.
- Clean-room constraint: this patch defines original target architecture only and does not copy source, markup, CSS, wording, or algorithms from `references/oralcalc`.
- Reference boundary: `references/oralcalc` remains read-only context only.

## 2. Prior Artifact Inputs

Inputs used for this patch:

- `math-worksheet-generator/docs/MathWorksheet-S1_OralcalcReference_DesignScan.md`
- `math-worksheet-generator/docs/MathWorksheet-S2_CleanRoomArchitectureSpec.md`
- current `math-worksheet-generator` file tree

Current target project state observed:

- `math-worksheet-generator/docs/`
- `math-worksheet-generator/docs/MathWorksheet-S1_OralcalcReference_DesignScan.md`
- `math-worksheet-generator/docs/MathWorksheet-S2_CleanRoomArchitectureSpec.md`

S2 already defined:

- integer-only V1 scope
- expression-based worksheet generation
- config schema baseline
- expression/evaluation/pagination boundaries
- print and answer-key architecture

This S2A patch adds curriculum and mixed-pattern planning layers on top of that baseline.

## 3. Why S2A Is Needed

S2 is sufficient for a single advanced expression engine, but it does not yet define:

- multiple question patterns in one worksheet
- curriculum-aware preset architecture
- canonical skill and publisher mapping
- per-pattern difficulty metadata
- detailed support-status boundaries between V1 and future engines
- source reliability metadata for curriculum extraction and review

Without these additions, S3 risks implementing a narrow single-pattern generator that cannot cleanly support:

- mixed worksheets
- grade-level preset bundles
- publisher-specific ordering
- future diagnosis and wrong-question analysis

## 4. Relationship To S2

S2A extends S2. It does not supersede S2.

S3 implementation must follow these precedence rules:

1. S2 remains the base architecture for core worksheet generation.
2. S2A adds metadata, planning, curriculum, pattern, and support-status layers.
3. If S2 and S2A overlap, S3 must use the more specific S2A rule for:
   - mixed-pattern planning
   - curriculum preset modeling
   - skill tagging
   - support status
   - S3 schema and validation changes

Practical meaning:

- `WorksheetConfig` from S2 remains valid
- S3 must expand that schema with S2A pattern, tagging, curriculum, and support metadata
- V1 runtime generation still targets expression questions only

## 5. Mixed Pattern Generation Architecture

### Patch goal

The generator must be able to create either:

- a worksheet made from one question pattern
- a worksheet made from multiple question patterns in the same output

### New root planning fields

Add to `WorksheetConfig`:

```js
generationMode: "singlePattern" | "mixedPattern"
```

Add a pattern-planning section:

```js
patternPlan: {
  patternPool: PatternPool,
  allocation: PatternAllocation,
  mixedPatternMode: MixedPatternMode,
  worksheetOrdering: WorksheetOrdering
}
```

### Mixed-pattern requirements

The architecture must support:

- selecting multiple question patterns in one worksheet
- fixed per-pattern counts
- equal distribution
- weighted distribution as future-ready support
- grouped-by-pattern output
- shuffled output across patterns
- per-pattern failure reporting

### V1 support boundary

V1 should implement:

- `singlePattern`
- `mixedPattern`
- fixed counts
- equal distribution
- grouped output
- shuffled output
- per-pattern generation reporting

Weighted distribution may remain scaffold-only if needed, but the schema must reserve it now.

## 6. QuestionPattern Schema Extension

### `QuestionPattern`

`QuestionPattern` is the pattern-level template that maps curricular intent into generator constraints.

Suggested shape:

```js
QuestionPattern = {
  patternId: string,
  questionKind: QuestionKind,
  label: string,
  canonicalSkills: string[],
  patternTags: string[],
  difficultyTags: string[],
  supportStatus: string[],
  expressionTemplate: ExpressionPattern | null,
  generatorConfigPatch: object,
  notes: string | null
}
```

### `ExpressionPattern`

For V1 question-kind `expression`:

```js
ExpressionPattern = {
  operandCount: 2 | 3 | 4,
  allowedOperatorsBySlot: Array<OperatorToken[]>,
  operandDigitConstraints: DigitConstraint[],
  answerConstraintPatch: object | null,
  intermediateConstraintPatch: object | null,
  divisionPattern: DivisionPattern | null,
  algorithmicComplexityPolicy: AlgorithmicComplexityPolicy | null
}
```

### Example pattern intent categories

Examples that must be representable at architecture level:

- 2-digit plus 1-digit addition
- 3-digit plus 1-digit addition
- 2-digit divided by 1-digit exact division
- 3-digit divided by 1-digit exact division
- 4-operand mixed operations
- multiplication/division mixed expressions
- grouped-parentheses expressions

These examples are pattern concepts, not hardcoded runtime assets at this stage.

## 7. PatternPool And PatternAllocation

### `PatternPool`

`PatternPool` is the list of eligible patterns for a worksheet request.

Suggested shape:

```js
PatternPool = {
  poolId: string,
  patterns: QuestionPattern[],
  selectionMode: "single" | "multiple"
}
```

### `PatternAllocation`

`PatternAllocation` defines how many questions each pattern should generate.

Suggested shape:

```js
PatternAllocation = {
  mode: "fixedCounts" | "equalDistribution" | "weightedDistribution",
  totalQuestionCount: number,
  fixedCounts: Array<{
    patternId: string,
    questionCount: number
  }>,
  weights: Array<{
    patternId: string,
    weight: number
  }>
}
```

### Allocation rules

- `fixedCounts` must sum to worksheet question count when `mode` is `fixedCounts`
- `equalDistribution` should derive counts automatically
- `weightedDistribution` is reserved if V1 does not implement the allocator yet
- only patterns with compatible `questionKind` and `supportStatus` may enter a V1 expression worksheet pool

### `MixedPatternMode`

Suggested shape:

```js
MixedPatternMode = {
  enabled: boolean,
  allowRepeatedPatterns: boolean,
  weightingEnabled: boolean
}
```

### `PatternLevelGenerationReport`

Each pattern needs its own generation result summary.

Suggested shape:

```js
PatternLevelGenerationReport = {
  patternId: string,
  requestedQuestionCount: number,
  generatedQuestionCount: number,
  totalAttempts: number,
  failureCount: number,
  warnings: ValidationError[],
  failureReasonCodes: string[]
}
```

## 8. WorksheetOrdering And Mixed Output Modes

### `WorksheetOrdering`

Suggested shape:

```js
WorksheetOrdering = {
  mode: "groupedByPattern" | "shuffleAcrossPatterns",
  stablePatternOrder: string[]
}
```

### Output modes

#### `groupedByPattern`

Questions are emitted in pattern blocks:

- pattern A questions first
- then pattern B
- then pattern C

Useful for:

- classroom drills by topic block
- review sheets with visible structure

#### `shuffleAcrossPatterns`

Questions from multiple patterns are mixed across the worksheet.

Useful for:

- mixed review practice
- exam-style sheets

### Ordering rule

Ordering is a post-generation document planning concern. It must not change the generated question's pattern identity or support metadata.

## 9. DigitConstraint And Difficulty Policy

### Problem this solves

S2 used raw numeric min/max ranges. That is not enough for curriculum-aligned pattern building because:

- 1-digit, 2-digit, 3-digit, 4-digit difficulty matters independently of raw range
- carry and borrow behavior must be modeled as instructional constraints
- division pattern difficulty depends on dividend/divisor/quotient digit structure

### `DigitConstraint`

Suggested shape:

```js
DigitConstraint = {
  target: "operand1" | "operand2" | "operand3" | "operand4" | "answer" | "intermediate",
  minDigits: number,
  maxDigits: number,
  allowZero: boolean,
  allowNegative: boolean
}
```

### `AlgorithmicComplexityPolicy`

Suggested shape:

```js
AlgorithmicComplexityPolicy = {
  additionCarry: CarryBorrowPolicy | null,
  subtractionBorrow: CarryBorrowPolicy | null,
  multiplicationCarry: MultiplicationCarryPolicy | null,
  notes: string | null
}
```

### `CarryBorrowPolicy`

For addition and subtraction:

```js
CarryBorrowPolicy =
  | "any"
  | "noCarry"
  | "requireCarry"
  | "singleCarry"
  | "multiCarry"
  | "noBorrow"
  | "requireBorrow"
  | "singleBorrow"
  | "multiBorrow"
```

S3 should normalize this into distinct typed fields rather than one overloaded runtime string if preferred, but the architecture must preserve these policy values.

### `MultiplicationCarryPolicy`

Suggested values:

- `any`
- `noMultiplicationCarry`
- `multiplicationWithCarry`
- `multiStepCarry`

### S3 rule

S3 schema and validation must distinguish:

- raw min/max constraints
- digit count constraints
- algorithmic carry/borrow complexity

These are separate dimensions and must not be collapsed into one field.

## 10. DivisionPattern Architecture

### `DivisionPattern`

Suggested shape:

```js
DivisionPattern = {
  dividendDigits: {
    min: number,
    max: number
  },
  divisorDigits: {
    min: number,
    max: number
  },
  quotientDigits: {
    min: number,
    max: number
  },
  exactOnly: boolean,
  allowRemainderFuture: boolean,
  quotientHasZeroFuture: boolean,
  longDivisionFormatFuture: boolean
}
```

### V1 boundary

V1 implements:

- exact integer division only
- no remainder output
- no decimal quotient output

Future-only reserved fields:

- remainder support
- quotient with zero-specific policy
- long division layout mode

### S3 rule

S3 validation must reject any active configuration that implies:

- non-exact division in V1
- remainder-answer output
- decimal division output
- long-division layout request

## 11. Skill Tag / Knowledge Point Architecture

### Goal

The worksheet system needs a canonical knowledge-point layer that is independent from:

- publisher wording
- grade/semester placement
- question pattern shape
- support status

### Required tag families

The tag system must distinguish:

- curriculum location
- canonical knowledge point
- question pattern
- difficulty constraint
- question kind
- support status

### Core tag objects

- `TagRegistry`
- `SkillTag`
- `CanonicalSkill`
- `SkillAlias`
- `CommonSkillMap`
- `QuestionPatternTag`
- `DifficultyTag`
- `CurriculumTag`
- `SupportStatusTag`

### V1 boundary

V1 should carry skill tags as metadata even if only expression-generation skills are actively generatable.

## 12. TagRegistry

### `TagRegistry`

Suggested shape:

```js
TagRegistry = {
  canonicalSkills: CanonicalSkill[],
  skillAliases: SkillAlias[],
  questionPatternTags: QuestionPatternTag[],
  difficultyTags: DifficultyTag[],
  curriculumTags: CurriculumTag[],
  supportStatusTags: SupportStatusTag[]
}
```

### Registry purpose

- central source of tag identity
- avoids duplicated or inconsistent tag spelling
- allows future diagnostics and reporting

### S3 rule

S3 should scaffold schema slots for these tags even if registry data files are not implemented yet.

## 13. CanonicalSkill And SkillAlias

### `CanonicalSkill`

Suggested shape:

```js
CanonicalSkill = {
  skillId: string,
  label: string,
  questionKinds: QuestionKind[],
  supportStatus: string[],
  notes: string | null
}
```

### Required canonical skill examples

The registry must reserve at least:

- `number_place_value`
- `integer_addition`
- `integer_subtraction`
- `integer_add_sub_mixed`
- `integer_multiplication`
- `integer_division`
- `integer_mul_div_mixed`
- `integer_mixed_operations`
- `operation_precedence`
- `parentheses_operations`
- `decimal_basic`
- `decimal_add_sub`
- `decimal_multiplication`
- `decimal_division`
- `fraction_basic`
- `fraction_add_sub`
- `equivalent_fraction`
- `fraction_simplification`
- `common_denominator`
- `fraction_multiplication`
- `fraction_division`
- `factor_multiple`
- `common_factor`
- `common_multiple`
- `gcd`
- `lcm`
- `prime_factorization`
- `measurement_length`
- `measurement_mass`
- `measurement_capacity`
- `measurement_time`
- `measurement_volume`
- `geometry_angle`
- `geometry_triangle`
- `geometry_quadrilateral`
- `geometry_circle`
- `geometry_area`
- `geometry_perimeter`
- `geometry_volume`
- `geometry_surface_area`
- `ratio_percent`
- `speed`
- `statistics_chart`
- `pattern_sequence`
- `word_problem_strategy`

### `SkillAlias`

Suggested shape:

```js
SkillAlias = {
  aliasId: string,
  sourceText: string,
  normalizedText: string,
  canonicalSkillId: string,
  sourceMetadataId: string | null
}
```

### Modeling rule

- publisher-specific or extracted titles do not become canonical skills directly
- they map through `SkillAlias` to canonical skill ids

## 14. CommonSkillMap

### Goal

`CommonSkillMap` is the canonical mapping layer across publishers.

### `CommonSkillMap`

Suggested shape:

```js
CommonSkillMap = {
  mapId: string,
  entries: Array<{
    publisherKey: string,
    publisherTitle: string,
    canonicalSkillId: string,
    sourceMetadataId: string | null
  }>
}
```

### Purpose

- preserve publisher-specific labels
- normalize equivalent content into common skill ids
- support cross-publisher search and coverage comparison

### Example rule

Different publisher titles that refer to mixed integer operations should map to:

- `canonicalSkillId: "integer_mixed_operations"`

## 15. Curriculum Preset Architecture

### Goal

Curriculum presets should let the product target:

- grade
- semester
- publisher sequence
- exam segment
- curriculum node

without treating curriculum titles as generator rules directly.

### `CurriculumPreset`

Suggested shape:

```js
CurriculumPreset = {
  presetId: string,
  publisherKey: "kangxuan" | "hanlin" | "nanyi",
  grade: 3 | 4 | 5 | 6,
  semester: "upper" | "lower",
  examSegment: "beforeMidterm" | "afterMidterm" | "fullSemester",
  nodeIds: string[],
  derivedPatternPool: string[],
  derivedConfigPatch: object
}
```

### `CurriculumNode`

A curriculum node is not a generator pattern. It is a curriculum location that maps to one or more canonical skills.

Suggested shape:

```js
CurriculumNode = {
  nodeId: string,
  publisherKey: "kangxuan" | "hanlin" | "nanyi",
  grade: 3 | 4 | 5 | 6,
  semester: "upper" | "lower",
  itemType: CurriculumItemType,
  displayOrder: number,
  title: string,
  normalizedTitle: string,
  canonicalSkillIds: string[],
  supportStatus: string[],
  sourceMetadataId: string | null,
  notes: string | null
}
```

## 16. CurriculumNode And CurriculumItemType

### `CurriculumItemType`

Allowed values:

- `mainUnit`
- `subTopic`
- `bridgeSkill`
- `reviewSkill`
- `extensionSkill`

### Modeling rules

- a textbook unit title is not the same as a question pattern
- same unit names across grades may represent different difficulty levels
- indented or highlighted items should be modeled by curriculum item type, not auto-promoted to full units
- exam markers are not normal units
- each curriculum node can map to multiple canonical skills
- each canonical skill can map to multiple question patterns

## 17. PublisherSequence

### Goal

Publisher ordering must be modeled separately from canonical skill identity.

### `PublisherSequence`

Suggested shape:

```js
PublisherSequence = {
  publisherKey: "kangxuan" | "hanlin" | "nanyi",
  grade: 3 | 4 | 5 | 6,
  semester: "upper" | "lower",
  orderedNodeIds: string[]
}
```

### Architecture rule

- `CommonSkillMap` is the canonical meaning layer
- `PublisherSequence` is the ordering layer
- neither replaces the other

## 18. CurriculumCoverageMatrix

### Goal

Compare cross-publisher coverage without assuming identical sequencing.

### `CurriculumCoverageMatrix`

Suggested shape:

```js
CurriculumCoverageMatrix = {
  matrixId: string,
  grade: 3 | 4 | 5 | 6,
  semester: "upper" | "lower",
  rows: Array<{
    canonicalSkillId: string,
    publishers: {
      kangxuan: string[],
      hanlin: string[],
      nanyi: string[]
    },
    supportStatus: string[]
  }>
}
```

### Purpose

- identify which publisher nodes cover a canonical skill
- compare timing and sequence across publishers
- preserve skills that are future-only or scaffold-only

## 19. ExamCheckpoint And ExamSegment

### `ExamCheckpoint`

Allowed values:

- `midterm`
- `final`

### `ExamSegment`

Allowed values:

- `beforeMidterm`
- `afterMidterm`
- `fullSemester`

### Modeling rule

- checkpoints are schedule markers, not instructional units
- exam segments are filters over curriculum sequence
- curriculum presets may derive node ranges from these markers

## 20. QuestionKind Architecture

### Goal

Future non-expression topics must not be forced into the expression generator.

### `QuestionKind`

Allowed values:

- `expression`
- `rounding`
- `patternSequence`
- `relationship`
- `measurementConversion`
- `geometryFormula`
- `visualGeometry`
- `chartData`
- `wordProblem`

### V1 boundary

V1 implementation target:

- `expression` only

Future-only categories remain metadata-supported but not generatable in V1.

## 21. Measurement And Geometry Future Boundaries

### Future architecture objects

- `MeasurementPattern`
- `GeometryConcept`
- `GeometryComputation`

### Suggested shapes

```js
MeasurementPattern = {
  patternId: string,
  measurementType: string,
  requiresFormulaEngine: boolean,
  supportStatus: string[]
}
```

```js
GeometryConcept = {
  conceptId: string,
  topic: string,
  requiresVisualEngine: boolean,
  supportStatus: string[]
}
```

```js
GeometryComputation = {
  computationId: string,
  topic: string,
  requiresFormulaEngine: boolean,
  requiresVisualEngine: boolean,
  supportStatus: string[]
}
```

### Measurement examples to preserve

- `length_mm_cm_m_km`
- `capacity_ml_l`
- `mass_g_kg`
- `time_min_hour_day`
- `volume_cm3`

### Geometry examples to preserve

- shape recognition
- classification
- properties
- perimeter
- area
- volume
- surface area
- circle circumference
- circle area

### Boundary rule

These topics should remain visible in curriculum metadata even though V1 does not implement their engines.

## 22. CurriculumSupportStatus

### Goal

Support must not be modeled as a simple boolean.

### Required support statuses

- `v1ExpressionSupported`
- `v1ScaffoldOnly`
- `v1FormulaSupportedLater`
- `futureDecimalDomain`
- `futureFractionDomain`
- `futureMeasurementEngine`
- `futureGeometryFormulaEngine`
- `requiresVisualGenerator`
- `requiresChartDataEngine`
- `requiresWordProblemTemplate`
- `plannedOnly`
- `excluded`

### `CurriculumSupportStatus`

Suggested shape:

```js
CurriculumSupportStatus = {
  statusId: string,
  severity: "supported" | "partial" | "future" | "excluded",
  description: string
}
```

### Why this matters

This prevents mistaken behavior such as:

- treating every curriculum node as V1-generatable
- collapsing future decimal or fraction topics into the integer engine
- hiding future geometry and measurement topics from curriculum coverage views

## 23. SourceMetadata And Review Status

### Goal

Curriculum mapping data may be extracted manually from screenshots or source tables. That requires reliability metadata.

### `SourceMetadata`

Suggested shape:

```js
SourceMetadata = {
  sourceId: string,
  sourceType: "screenshot" | "manualEntry" | "publisherIndex" | "other",
  sourceName: string,
  screenshotBatch: string | null,
  publisher: "kangxuan" | "hanlin" | "nanyi" | null,
  grade: 3 | 4 | 5 | 6 | null,
  semester: "upper" | "lower" | null,
  extractedTitle: string,
  normalizedTitle: string,
  extractionConfidence: "low" | "medium" | "high",
  reviewedByHuman: boolean,
  notes: string | null
}
```

### Boundary rule

- `SourceMetadata` is important for curriculum integrity
- it is not required by the runtime worksheet generator loop in V1
- it should still be part of the data architecture

## 24. Data Flow From Curriculum To Generated Question

### Required forward flow

The intended flow is:

`CurriculumNode`
-> `CanonicalSkill`
-> `SkillTag`
-> `QuestionPattern`
-> `GeneratorConfigPatch`
-> `WorksheetConfig`
-> `GeneratedQuestion`
-> skill-tagged worksheet output
-> `AnswerKey`
-> `PatternLevelGenerationReport`

### Interpretation

- curriculum nodes identify educational placement
- canonical skills normalize meaning
- patterns translate skill intent into generator constraints
- config patches merge into worksheet generation inputs
- generated questions retain pattern and skill metadata

## 25. Future Wrong-Question Analysis Flow

### Required reverse flow

Future analysis should be able to trace:

`GeneratedQuestion`
-> `patternTags`
-> `difficultyTags`
-> `canonicalSkill`
-> `curriculumNodes`
-> diagnosis or review recommendation

### Why this matters now

If generated questions do not carry pattern and skill metadata from the start, later wrong-question analysis will require a redesign instead of an extension.

## 26. Required Changes For S3

S3 must use S2A when scaffolding schema and validation.

### Schema changes required in S3

Add to config/data scaffolding:

- `generationMode`
- `patternPlan`
- `QuestionPattern`
- `PatternPool`
- `PatternAllocation`
- `MixedPatternMode`
- `WorksheetOrdering`
- `PatternLevelGenerationReport`
- `DigitConstraint`
- `AlgorithmicComplexityPolicy`
- `DivisionPattern`
- `TagRegistry`
- `CanonicalSkill`
- `SkillAlias`
- `CommonSkillMap`
- `CurriculumPreset`
- `CurriculumNode`
- `PublisherSequence`
- `CurriculumCoverageMatrix`
- `CurriculumSupportStatus`
- `SourceMetadata`
- `QuestionKind`

### Validation changes required in S3

S3 validation must add categories for:

- mixed-pattern allocation consistency
- pattern pool compatibility with question kind
- V1 support-status gating
- curriculum preset integrity
- canonical skill reference validity
- publisher sequence node validity
- exam segment node slicing
- digit-constraint validity
- division-pattern validity

### Runtime boundary rule for S3

S3 should scaffold these data structures even if many remain metadata-only in the first implementation slice.

## 27. Updated Proposed File Structure

This is an updated target structure for later implementation stages only.

```text
math-worksheet-generator/
  docs/
    MathWorksheet-S1_OralcalcReference_DesignScan.md
    MathWorksheet-S2_CleanRoomArchitectureSpec.md
    MathWorksheet-S2A_MixedPatternSkillCurriculumArchitecturePatch.md
  src/
    core/
      config-schema.js
      default-config.js
      validate-config.js
      number-value.js
      random.js
      operators.js
      expression-model.js
      evaluate-expression.js
      generate-expression.js
      generate-worksheet.js
      allocate-patterns.js
      format-expression.js
      paginate-worksheet.js
      report.js
    curriculum/
      canonical-skills.js
      skill-aliases.js
      question-patterns.js
      curriculum-presets.js
      publisher-sequences.js
      coverage-matrix.js
      support-status.js
    ui/
      app-state.js
      preset-mode.js
      advanced-mode.js
      curriculum-mode.js
      form-bindings.js
      preview-renderer.js
      print-renderer.js
    styles/
      screen.css
      print.css
    data/
      presets.js
  tests/
    core/
      validate-config.test.js
      evaluate-expression.test.js
      generate-expression.test.js
      allocate-patterns.test.js
      paginate-worksheet.test.js
  index.html
  README.md
```

### Boundary note

This is a target structure only. S2A does not create any of these runtime files.

## 28. Explicit Non-Goals

The following remain out of scope for V1 implementation even after this patch:

- decimal generation
- fraction generation
- visual geometry generation
- chart generation
- word-problem natural language generation
- measurement conversion engine
- OCR
- student accounts
- cloud sync
- wrong-question database
- runtime curriculum data ingestion
- curriculum screenshot parsing

## 29. S3 Readiness Checklist Addendum

- S3 uses S2A as an extension to S2, not as a replacement.
- S3 schema includes mixed-pattern planning objects.
- S3 schema includes question-kind and support-status fields.
- S3 schema includes digit-constraint and division-pattern fields.
- S3 scaffolds tag registry and canonical skill ids.
- S3 scaffolds curriculum preset and publisher sequence ids.
- S3 validation blocks unsupported non-expression V1 patterns.
- S3 validation blocks unsupported decimal, fraction, geometry, measurement, and word-problem generation requests.
- S3 generated-question model reserves pattern, skill, difficulty, and curriculum metadata.
- S3 report model reserves per-pattern report output.
- no curriculum data files are created prematurely in S3 unless explicitly requested.

## 30. Recommended Next Task

Recommended next task name:

`MathWorksheet-S3_CoreSchemaValidationAndPatternPlanningScaffold`

Recommended scope:

- scaffold core schema files using S2 plus S2A
- add mixed-pattern planning schema
- add validation for pattern allocation and V1 support-status gating
- scaffold metadata model types for patterns, skills, and curriculum references
- keep runtime generation limited to V1 expression support

## 31. Completion Status

- S2A architecture patch created: yes
- mixed-pattern generation defined: yes
- `QuestionPattern` / `PatternPool` / `PatternAllocation` defined: yes
- skill tag and knowledge-point architecture defined: yes
- canonical skill mapping defined: yes
- publisher sequence handling defined: yes
- curriculum coverage matrix defined: yes
- curriculum support statuses defined: yes
- source metadata defined: yes
- V1 vs future boundaries defined: yes
- required S3 schema and validation changes defined: yes
- reference project modified: no
- runtime code created: no
- curriculum data files created: no
