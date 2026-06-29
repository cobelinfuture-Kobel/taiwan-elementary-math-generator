# MathWorksheet-S2 Clean-Room Architecture Specification

## 1. Preflight

- Task scope: architecture specification only.
- Project: `math-worksheet-generator`
- Stage: S2
- Product direction: advanced integer expression worksheet generator for static GitHub Pages deployment.
- Runtime status: no runtime HTML, JavaScript, CSS, or tests are created in this stage.
- Clean-room constraint: this document defines original architecture for the target project and does not copy source, markup, CSS, wording, or algorithms from `references/oralcalc`.
- Reference boundary: `references/oralcalc` remains read-only context only.

## 2. Prior Artifact Inputs

Inputs used for this architecture specification:

- `math-worksheet-generator/docs/MathWorksheet-S1_OralcalcReference_DesignScan.md`
- current `math-worksheet-generator` file tree
- `references/oralcalc` only as prior design context already captured in S1

Current target project state observed:

- `math-worksheet-generator/docs/`
- `math-worksheet-generator/docs/MathWorksheet-S1_OralcalcReference_DesignScan.md`

S1 established several useful concept-level directions:

- print-first worksheet generation
- separation of advanced arithmetic settings from quick settings
- structured expression generation rather than plain string assembly
- clean-room separation from the reference implementation due to license uncertainty

This S2 document turns those directions into an explicit target architecture for V1.

## 3. V1 Product Definition

### Product identity

V1 is an advanced integer expression worksheet generator for printable practice sheets. It is not limited to grade-style addition/subtraction drills. Its primary unit is an arithmetic expression with 2 to 4 operands and 1 to 3 operator slots.

### V1 platform definition

- static GitHub Pages compatible
- browser-only execution
- no backend
- no login
- no cloud storage
- no external print service
- printable A4 worksheet output
- optional answer key page

### V1 number domain

- integer arithmetic only
- all generated final answers must be integers
- all generated intermediate results must be integers
- division is exact-integer only in V1

### V1 expression scope

Supported structures:

- `operand1 operator1 operand2`
- `operand1 operator1 operand2 operator2 operand3`
- `operand1 operator1 operand2 operator2 operand3 operator3 operand4`

Supported operators:

- addition: `+`
- subtraction: `-`
- multiplication: `×`
- division: `÷`

Supported configurable controls in architecture:

- global operator selection
- per-slot operator selection for `operator1`, `operator2`, `operator3`
- operand-position ranges for up to four operands
- final answer constraints
- intermediate-result constraints
- division feasibility rules
- parentheses mode
- precedence mode
- blank mode
- deduplication policy
- print layout settings

### V1 user outcome

The user can configure a worksheet, generate a set of valid arithmetic questions, preview them on screen, print them in worksheet layout, and optionally print a separate answer key.

## 4. Explicit Non-Goals

The following are out of scope for V1 and must not be implemented during S3 initial build unless scope is explicitly changed:

- decimals
- fractions
- mixed numbers
- percent arithmetic
- remainders in final answers
- decimal division output
- algebraic variables
- equations with unknown symbols beyond blank-mode rendering
- adaptive difficulty scoring
- user accounts
- cloud sync
- analytics
- external APIs
- server-side PDF generation
- collaborative editing
- curriculum tracking
- persistence beyond optional local browser state in a later stage

## 5. Future Extension Roadmap

### Planned domain evolution

- V1: `integer`
- V2: `decimal`
- V3: `fraction`
- V4: `mixedNumber`
- V4+: `percent`

### Architecture requirement for future growth

V1 must model numbers and evaluation in a way that does not force all future domains to masquerade as plain JavaScript numbers. The internal model must therefore reserve a neutral `NumberValue` concept and a domain-aware evaluation boundary.

### Planned future capability hooks

- division mode extension
  - exact integer
  - integer with remainder
  - decimal quotient
- domain-aware formatting
  - decimal precision formatting
  - fraction display
  - mixed-number display
  - percent display
- domain-aware validation
  - denominator validation
  - scale and precision rules
  - percent conversion rules

V1 does not implement these, but its schema and module boundaries must leave room for them.

## 6. Core Config Schema

### Root object: `WorksheetConfig`

Conceptual fields:

- `version`
- `productMode`
- `preset`
- `numberDomain`
- `expression`
- `answerConstraint`
- `intermediateConstraint`
- `division`
- `parentheses`
- `precedence`
- `blankMode`
- `uniqueness`
- `printLayout`
- `generation`
- `ui`

Suggested conceptual shape:

```js
WorksheetConfig = {
  version: "1",
  productMode: "preset" | "advanced",
  preset: PresetConfig | null,
  numberDomain: NumberDomainConfig,
  expression: {
    operandCount: 2 | 3 | 4,
    operandRanges: [
      OperandRangeConfig,
      OperandRangeConfig,
      OperandRangeConfig?,
      OperandRangeConfig?
    ],
    globalOperators: OperatorToken[],
    operatorSlots: [
      OperatorSlotConfig,
      OperatorSlotConfig?,
      OperatorSlotConfig?
    ]
  },
  answerConstraint: AnswerConstraintConfig,
  intermediateConstraint: IntermediateConstraintConfig,
  division: DivisionConfig,
  parentheses: ParenthesesConfig,
  precedence: PrecedenceConfig,
  blankMode: BlankModeConfig,
  uniqueness: UniquenessConfig,
  printLayout: PrintLayoutConfig,
  generation: {
    questionCount: number,
    maxAttemptsPerQuestion: number,
    maxTotalAttempts: number
  },
  ui: {
    showPreview: boolean,
    showAnswerKey: boolean
  }
}
```

### `NumberDomainConfig`

Purpose:

- identify active number domain for generation and evaluation

V1 conceptual fields:

- `kind`: `integer`
- `futureKindsAllowed`: metadata only, not runtime behavior

Suggested shape:

```js
NumberDomainConfig = {
  kind: "integer"
}
```

Future-compatible reserved shape:

```js
NumberDomainConfig = {
  kind: "integer" | "decimal" | "fraction" | "mixedNumber" | "percent",
  options: {}
}
```

### `OperandRangeConfig`

One config per operand position.

Fields:

- `position`
- `min`
- `max`
- `allowZero`
- `allowOne`

Optional reserved future fields:

- `excludeValues`
- `includeOnlyValues`
- `step`

Suggested shape:

```js
OperandRangeConfig = {
  position: 1 | 2 | 3 | 4,
  min: number,
  max: number,
  allowZero: boolean,
  allowOne: boolean
}
```

### `OperatorSlotConfig`

One config per operator position.

Fields:

- `slot`
- `allowedOperators`

Suggested shape:

```js
OperatorSlotConfig = {
  slot: 1 | 2 | 3,
  allowedOperators: OperatorToken[]
}
```

### `AnswerConstraintConfig`

Fields:

- `min`
- `max`
- `allowZero`
- `allowNegative`
- `requireInteger`

Suggested shape:

```js
AnswerConstraintConfig = {
  min: number,
  max: number,
  allowZero: boolean,
  allowNegative: boolean,
  requireInteger: true
}
```

### `IntermediateConstraintConfig`

Fields:

- `enabled`
- `min`
- `max`
- `allowNegative`
- `requireInteger`

Meaning:

- when `enabled` is `false`, only domain validity rules apply
- when `enabled` is `true`, every non-final evaluated step must fit the configured intermediate limits

Suggested shape:

```js
IntermediateConstraintConfig = {
  enabled: boolean,
  min: number | null,
  max: number | null,
  allowNegative: boolean,
  requireInteger: true
}
```

### `DivisionConfig`

Fields:

- `mode`
- `allowDivideByOne`
- `allowZeroDividend`
- `requireExactQuotient`

V1 allowed values:

- `mode: "exactIntegerOnly"`
- `allowDivideByOne: boolean`
- `allowZeroDividend: boolean`
- `requireExactQuotient: true`

Reserved future values:

- `mode: "integerRemainder"`
- `mode: "decimalQuotient"`

Suggested shape:

```js
DivisionConfig = {
  mode: "exactIntegerOnly",
  allowDivideByOne: boolean,
  allowZeroDividend: boolean,
  requireExactQuotient: true
}
```

### `ParenthesesConfig`

Fields:

- `mode`
- `specifiedPattern`

V1 architecture modes:

- `none`
- `random`
- `required`
- `specified`

V1 later implementation may support only:

- `none`
- `random`
- `required`

Reserved `specified` meaning:

- future mode to request a concrete grouping pattern

Suggested shape:

```js
ParenthesesConfig = {
  mode: "none" | "random" | "required" | "specified",
  specifiedPattern: null | "leftPair" | "rightPair" | "outerWrap"
}
```

### `PrecedenceConfig`

Fields:

- `mode`

Allowed modes:

- `standard`
- `leftToRightAddSubOnly`

Rule:

- `leftToRightAddSubOnly` is valid only when every allowed operator in every reachable slot is `+` or `-`

Suggested shape:

```js
PrecedenceConfig = {
  mode: "standard" | "leftToRightAddSubOnly"
}
```

### `BlankModeConfig`

Fields:

- `mode`
- `randomPool`

Modes:

- `solveFinalAnswer`
- `blankOperand1`
- `blankOperand2`
- `blankOperand3`
- `blankOperand4`
- `blankOperator`
- `random`

Rules:

- blanking an operand that does not exist for the current operand count is invalid
- `random` must pick only from positions that exist for the current expression

Suggested shape:

```js
BlankModeConfig = {
  mode: "solveFinalAnswer"
      | "blankOperand1"
      | "blankOperand2"
      | "blankOperand3"
      | "blankOperand4"
      | "blankOperator"
      | "random",
  randomPool: Array<string>
}
```

### `UniquenessConfig`

Fields:

- `preventExactDuplicates`
- `normalizeCommutativeAdd`
- `normalizeCommutativeMul`
- `maxDuplicateRetries`
- `maxGenerationAttempts`
- `onFailure`

Suggested shape:

```js
UniquenessConfig = {
  preventExactDuplicates: true,
  normalizeCommutativeAdd: true,
  normalizeCommutativeMul: true,
  maxDuplicateRetries: number,
  maxGenerationAttempts: number,
  onFailure: "stopWithError" | "returnPartialWithWarning"
}
```

### `PrintLayoutConfig`

Fields:

- `paperSize`
- `questionCount`
- `columns`
- `rowsPerPage`
- `showQuestionNumbers`
- `showAnswerKeyPage`
- `screenPreviewEnabled`
- `appendFillerRows`

Suggested shape:

```js
PrintLayoutConfig = {
  paperSize: "A4",
  questionCount: number,
  columns: number,
  rowsPerPage: number,
  showQuestionNumbers: boolean,
  showAnswerKeyPage: boolean,
  screenPreviewEnabled: boolean,
  appendFillerRows: boolean
}
```

### `PresetConfig`

Fields:

- `presetId`
- `label`
- `description`
- `configPatch`

Meaning:

- presets are named bundles that map into the advanced config model
- preset mode never owns a separate generation engine

Suggested shape:

```js
PresetConfig = {
  presetId: string,
  label: string,
  description: string,
  configPatch: object
}
```

## 7. Number Domain Model

### `NumberValue`

`NumberValue` is the neutral number container used by the core engine. In V1 it wraps integers, but the data model must not assume that future domains can be flattened to primitive numbers without loss.

Suggested conceptual shape:

```js
NumberValue = {
  kind: "integer" | "decimal" | "fraction" | "mixedNumber" | "percent",
  raw: object,
  canonicalText: string
}
```

### V1 integer specialization

For V1:

```js
NumberValue = {
  kind: "integer",
  raw: {
    value: number
  },
  canonicalText: string
}
```

### Domain design rules

- generator logic should pass `NumberValue` or domain-aware values across core boundaries
- formatting logic should not assume the same text rendering for every domain
- evaluation logic should resolve through domain-aware operators
- validation logic should reference domain capabilities

### Why this matters now

If V1 uses plain numeric primitives everywhere, later fraction or mixed-number support will force broad invasive rewrites. `NumberValue` keeps the extension boundary explicit from the start.

## 8. Expression Data Model

### `OperatorToken`

Suggested shape:

```js
OperatorToken = "+" | "-" | "×" | "÷"
```

The core may internally map these to operation identifiers:

```js
OperationKind = "add" | "sub" | "mul" | "div"
```

### `ExpressionNode`

Use a recursive tree instead of flat display text as the source of truth.

Suggested conceptual shape:

```js
ExpressionNode =
  | {
      type: "value",
      value: NumberValue,
      sourceOperandPosition: 1 | 2 | 3 | 4
    }
  | {
      type: "binary",
      operator: OperatorToken,
      left: ExpressionNode,
      right: ExpressionNode,
      groupingHint: string | null,
      evaluated: NumberValue | null
    }
```

### `GeneratedQuestion`

Core output before UI rendering.

Suggested shape:

```js
GeneratedQuestion = {
  id: string,
  expression: ExpressionNode,
  operandCount: 2 | 3 | 4,
  operatorsUsed: OperatorToken[],
  finalAnswer: NumberValue,
  intermediateResults: NumberValue[],
  blankTarget: BlankTarget,
  duplicateKey: string,
  metadata: {
    precedenceMode: string,
    parenthesesMode: string,
    presetId: string | null
  }
}
```

### `RenderedQuestion`

Formatter output for display and print.

Suggested shape:

```js
RenderedQuestion = {
  questionId: string,
  displayText: string,
  answerText: string,
  blankedDisplayText: string,
  questionNumberText: string | null
}
```

### `AnswerKeyItem`

Suggested shape:

```js
AnswerKeyItem = {
  questionId: string,
  questionNumber: number,
  promptText: string,
  answerText: string
}
```

### `WorksheetPage`

Suggested shape:

```js
WorksheetPage = {
  pageNumber: number,
  pageType: "questions" | "answerKey",
  rows: WorksheetRow[],
  fillerRowCount: number
}
```

### `WorksheetDocument`

Suggested shape:

```js
WorksheetDocument = {
  configSnapshot: WorksheetConfig,
  questionPages: WorksheetPage[],
  answerKeyPages: WorksheetPage[],
  generatedQuestions: GeneratedQuestion[],
  renderedQuestions: RenderedQuestion[],
  answerKeyItems: AnswerKeyItem[],
  report: GenerationReport
}
```

### `GenerationReport`

Suggested shape:

```js
GenerationReport = {
  requestedQuestionCount: number,
  generatedQuestionCount: number,
  totalAttempts: number,
  duplicateRejectCount: number,
  constraintRejectCount: number,
  validationWarnings: ValidationError[],
  generationWarnings: ValidationError[],
  operatorUsage: Record<string, number>,
  blankModeUsage: Record<string, number>
}
```

### `ValidationError`

Suggested shape:

```js
ValidationError = {
  code: string,
  severity: "error" | "warning",
  path: string,
  message: string
}
```

## 9. Generation Pipeline

### Pipeline overview

Generation should be a pure core pipeline:

1. normalize config
2. validate config
3. derive generation plan
4. build candidate expression structure
5. sample operands/operators
6. place parentheses if applicable
7. evaluate expression
8. check final and intermediate constraints
9. check blank-mode compatibility
10. compute duplicate key
11. accept or reject candidate
12. repeat until target count reached or attempt limits exceeded
13. format questions
14. paginate question pages
15. paginate answer key pages if enabled
16. return `WorksheetDocument`

### Recommended stage modules

- `config-schema`
- `default-config`
- `validate-config`
- `number-value`
- `operators`
- `expression-model`
- `evaluate-expression`
- `generate-expression`
- `generate-worksheet`
- `format-expression`
- `paginate-worksheet`
- `report`

### Core pipeline invariants

- no DOM API access
- no direct HTML generation
- deterministic input/output contracts
- validation errors are returned as structured objects
- failure to satisfy overly strict configs is reported cleanly

### Expression construction strategy

The architecture should support a staged candidate approach:

1. choose operand count
2. choose allowed operators for each active slot
3. choose a grouping pattern compatible with parentheses mode
4. build an expression tree skeleton
5. populate leaf operands from operand-position ranges
6. evaluate and reject if constraints fail

This keeps structure-generation separate from display concerns.

## 10. Evaluation and Constraint Rules

### Evaluation rules

- expression evaluation must operate on the tree model, not by evaluating a display string
- final answer must be a valid `NumberValue`
- every intermediate binary step may produce an intermediate result
- intermediate results are collected in evaluation order

### Integer-domain rules for V1

- every operand is an integer
- every intermediate result must be an integer
- final answer must be an integer
- division by zero is invalid
- non-exact division is invalid

### Final answer constraints

For every accepted question:

- final answer must be between `answerConstraint.min` and `answerConstraint.max`
- final answer zero must be rejected when `allowZero` is `false`
- final answer negative must be rejected when `allowNegative` is `false`

### Intermediate result constraints

When `intermediateConstraint.enabled` is `true`:

- each intermediate result must be within configured min/max
- each intermediate result must respect negative allowance
- each intermediate result must remain integer-only

When `enabled` is `false`:

- only domain validity checks apply
- V1 still rejects invalid division and non-integer intermediate results

### Operand-position rules

Each operand leaf must respect its own position config:

- `operand1` uses only operand position 1 range
- `operand2` uses only operand position 2 range
- `operand3` uses only operand position 3 range when present
- `operand4` uses only operand position 4 range when present

Optional V1-specific restrictions:

- reject zero when that position disallows zero
- reject one when that position disallows one

### Operation-specific constraints

Subtraction:

- if configured, reject same-number subtraction where left and right operands are equal

Multiplication:

- if configured, reject any multiplication by 1

Division:

- divisor must never be zero
- if configured, reject division by 1
- quotient must be exact integer
- invalid intermediate division must reject the candidate question

## 11. Validation Rules

Validation should run before generation and may also emit feasibility warnings.

### Category 1: config shape validation

Examples:

- required root sections missing
- unknown enum value
- wrong field type
- `operandCount` outside `2..4`
- too many or too few operand ranges
- too many or too few operator slots

### Category 2: numeric range validation

Examples:

- `min > max`
- answer bounds invalid
- intermediate bounds invalid
- rows per page less than 1
- columns less than 1
- question count less than 1

### Category 3: operator availability validation

Examples:

- no global operators selected
- active slot has no allowed operators
- slot operators contain symbols not enabled globally
- operator slots exist beyond `operandCount - 1`

### Category 4: division feasibility validation

Examples:

- division allowed while every possible divisor is zero
- division by 1 disallowed while divisor range permits only 1
- exact integer division requested but no valid divisible combinations appear feasible

### Category 5: answer range feasibility validation

Examples:

- positive-only answers required but all allowed operator/range combinations force negatives
- zero answer disallowed while all feasible outcomes collapse to zero
- final answer range too narrow for any configured expression family

### Category 6: parentheses and precedence validation

Examples:

- `leftToRightAddSubOnly` selected while multiplication or division is reachable
- `specified` parentheses requested without a supported pattern
- parentheses requested for structures where no valid grouping exists

### Category 7: blank mode validation

Examples:

- `blankOperand4` requested for a 2-operand expression
- `blankOperator` requested but operator display mode unavailable
- `randomPool` contains unsupported blank targets

### Category 8: print layout validation

Examples:

- A4 paper size missing or unsupported
- rows and columns imply zero printable cells
- answer key enabled with impossible pagination settings

### Category 9: generation feasibility warnings

Warnings, not hard errors, when:

- duplicate prevention is likely to exhaust the search space
- exact division plus tight answer/operand ranges create a very small candidate pool
- operand restrictions plus blank mode make user expectations unclear
- high question count exceeds likely unique question capacity

## 12. Blank Mode Design

### Design goal

Blank mode must be a rendering concern backed by question metadata, not a destructive change to the mathematical truth of the expression.

### Blank targets

Conceptual target model:

```js
BlankTarget =
  | { type: "finalAnswer" }
  | { type: "operand", position: 1 | 2 | 3 | 4 }
  | { type: "operator", slot: 1 | 2 | 3 }
```

### V1 supported architecture modes

- `solveFinalAnswer`
- `blankOperand1`
- `blankOperand2`
- `blankOperand3`
- `blankOperand4`
- `blankOperator`
- `random`

### V1 likely first implementation subset

Later S3 can implement answer-only first, but the config and data model must already support all listed modes.

### Rendering rule

- original expression tree remains complete
- formatter replaces the chosen display token with a blank placeholder
- answer key uses the preserved underlying full expression

### Random blank rule

`random` should resolve into a concrete `BlankTarget` per question and record that choice in `GeneratedQuestion.blankTarget`.

## 13. Parentheses and Precedence Design

### Parentheses modes

- `none`: render structurally valid expressions without added grouping parentheses
- `random`: generator may apply a valid grouping pattern at random
- `required`: generator must produce a grouped expression
- `specified`: reserved future config for exact grouping request

### Grouping patterns to reserve conceptually

For 3 operands:

- `(a op b) op c`
- `a op (b op c)`

For 4 operands:

- `((a op b) op c) op d`
- `(a op b) op (c op d)`
- `a op ((b op c) op d)`
- `a op (b op (c op d))`

V1 does not need to support every pattern immediately, but the model should not prevent them.

### Parentheses safety rule

Parentheses must never be inserted as display-only decoration that changes meaning without matching the evaluated tree. The tree is authoritative; printed parentheses are a rendering of that tree.

### Precedence modes

#### `standard`

Rules:

- parentheses first
- multiplication/division second
- addition/subtraction last

This is the default and valid for all operator combinations.

#### `leftToRightAddSubOnly`

Rules:

- allowed only when all reachable operators are `+` or `-`
- evaluation order follows left-to-right structure

This avoids teaching incorrect precedence when multiplication/division is included.

## 14. Deduplication and Failure Handling

### Deduplication goals

- prevent exact duplicate questions
- treat commutative variants as duplicates where appropriate
- keep subtraction and division order-sensitive

### Duplicate key strategy

Use canonical duplicate keys generated from the structured expression, not from raw display text alone.

Recommended rules:

- exact duplicate prevention always uses full normalized tree
- for addition-only subexpressions, order may be normalized when `normalizeCommutativeAdd` is `true`
- for multiplication-only subexpressions, order may be normalized when `normalizeCommutativeMul` is `true`
- subtraction and division remain order-sensitive

### Failure handling

Generator must enforce:

- `maxAttemptsPerQuestion`
- `maxTotalAttempts`
- `maxDuplicateRetries`

On exhaustion:

- stop cleanly
- return structured error or partial result according to `uniqueness.onFailure`
- include a human-readable message explaining that settings are too strict

Suggested failure message intent:

- requested question count could not be met
- constraints are too restrictive
- reduce uniqueness strictness or widen ranges/operator choices

## 15. Preset Mode UI Specification

### Preset mode purpose

Preset mode is for parents/teachers who want quick worksheet templates without opening every advanced control.

### Preset mode behavior

- present a small list of curated templates
- each template maps to a `configPatch`
- user can adjust a limited set of high-value controls after preset selection

### Preset mode controls

Recommended visible controls:

- preset selector
- question count
- answer key on/off
- columns
- rows per page
- generate button
- print button

Optional preset categories:

- basic integer addition
- within-20 addition
- within-100 mixed add/subtract
- multiplication focus
- exact division focus
- mixed integer expression challenge

The examples can be original target-product wording later; they must not copy reference wording.

### Preset mode architecture rule

Preset mode is a simplified UI over the same `WorksheetConfig`, not a separate config system.

## 16. Advanced Mode UI Specification

### Advanced mode purpose

Advanced mode exposes full control over expression construction and worksheet output.

### Advanced mode sections

Recommended sections:

1. expression structure
2. operator selection
3. operand ranges
4. answer constraints
5. intermediate constraints
6. division rules
7. parentheses and precedence
8. blank mode
9. uniqueness and generation limits
10. print layout

### Advanced mode controls

Expression structure:

- operand count selector: 2, 3, 4

Operator selection:

- global operator toggles
- per-slot operator toggles for slot 1, 2, 3

Operand ranges:

- operand1 min/max
- operand2 min/max
- operand3 min/max
- operand4 min/max
- allow zero
- allow one
- disallow same-number subtraction
- disallow multiply by 1
- disallow divide by 1

Answer and intermediate constraints:

- final answer min/max
- allow zero final answer
- allow negative final answer
- intermediate constraint enable toggle
- intermediate min/max
- allow negative intermediate

Division:

- exact integer division only indicator in V1
- divisor zero protection

Parentheses and precedence:

- parentheses mode
- precedence mode

Blank mode:

- final answer
- operand positions
- operator
- random

Print layout:

- question count
- columns
- rows per page
- show question numbers
- answer key toggle

### Advanced mode architecture rule

The UI may be complex, but the logic behind it must remain a thin layer over pure core modules.

## 17. Print Layout Specification

### Print goals

- A4 output
- stable pagination
- visually separated screen preview and print modes
- no browser-external service dependency

### Print config inputs

- question count
- columns
- rows per page
- show question numbers
- answer key on/off
- append filler rows on/off

### Print model

Questions should be paginated into a document model before rendering:

- calculate cells per page as `columns * rowsPerPage`
- place questions row-major into the page grid
- pad the final page if filler rows are enabled

### Screen vs print boundary

Screen preview:

- interactive
- can show layout preview
- can show validation and summary

Print output:

- hides editor controls
- shows only worksheet document pages
- may include separate answer key pages

### Print CSS boundary

All print-specific decisions belong later in a dedicated print stylesheet and print renderer. The core generator must know page structure, but not CSS.

## 18. Answer Key Specification

### Answer key purpose

Provide a printable verification page or pages separate from the main worksheet.

### Answer key inputs

- enabled/disabled by `printLayout.showAnswerKeyPage`
- generated questions
- blank targets

### Answer key behavior

- one answer item per generated question
- shows question number if numbering is enabled
- shows complete resolved answer, not the blanked display form
- may render either:
  - prompt plus answer
  - number plus answer only

The exact visual format can be chosen in S3, but the data model must already support both.

### Answer key pagination

Answer key pages are paginated independently from question pages. This avoids mixing practice content and answers in the same printable flow unless a future option explicitly allows it.

## 19. Proposed Clean-Room File Structure

This is the target implementation structure for later stages only. Do not create these runtime files in S2.

```text
math-worksheet-generator/
  docs/
    MathWorksheet-S1_OralcalcReference_DesignScan.md
    MathWorksheet-S2_CleanRoomArchitectureSpec.md
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
      format-expression.js
      paginate-worksheet.js
      report.js
    ui/
      app-state.js
      preset-mode.js
      advanced-mode.js
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
      paginate-worksheet.test.js
  index.html
  README.md
```

### File responsibility notes

- `core/` holds pure logic only
- `ui/` maps user interaction to config and rendering
- `styles/` keeps screen and print concerns separated
- `data/presets.js` holds preset definitions as config patches
- `tests/core/` targets deterministic core behavior

## 20. Implementation Boundaries

### Core engine boundary

Must remain pure and DOM-free:

- config validation
- number-domain handling
- expression construction
- operator selection
- operand sampling
- evaluation
- constraint checks
- deduplication
- report generation

### Formatter boundary

Responsibilities:

- expression to display string
- blanked question rendering
- answer rendering
- answer key text generation
- future localization hooks

Non-responsibilities:

- DOM updates
- CSS decisions

### Pagination boundary

Responsibilities:

- questions-per-page calculation
- row and column placement
- filler row planning
- answer key page planning

Non-responsibilities:

- arithmetic evaluation
- DOM styling

### UI boundary

Responsibilities:

- preset mode controls
- advanced mode controls
- generate action
- print action
- preview state
- validation display
- generation summary display

Non-responsibilities:

- arithmetic truth
- duplicate policy logic
- expression evaluation

### Print boundary

Responsibilities:

- print-only document rendering
- CSS media print behavior
- screen/print visibility split

Non-responsibilities:

- generation logic
- validation logic

## 21. S3 Implementation Readiness Checklist

- S2 architecture document exists and is approved.
- V1 integer-only scope is explicit.
- future number-domain extension points are explicit.
- root config schema is defined.
- expression tree model is defined.
- evaluation boundary is defined.
- validation categories are defined.
- blank-mode architecture is defined.
- parentheses and precedence rules are defined.
- deduplication policy is defined.
- print layout model is defined.
- answer key model is defined.
- file structure target is defined.
- implementation boundaries between `core`, `ui`, `styles`, and pagination are defined.
- no runtime code has been created prematurely.

## 22. Recommended Next Task

Recommended next task name:

`MathWorksheet-S3_CoreSchemaAndValidationScaffold`

Recommended S3 scope:

- create runtime project skeleton files
- implement `default-config.js`
- implement `config-schema.js`
- implement `validate-config.js`
- define operator and number-domain constants
- add first core validation tests
- do not build full UI yet beyond the minimal scaffold needed to exercise config validation

## 23. Completion Status

- S2 architecture specification created: yes
- V1 integer-only scope defined: yes
- future decimal/fraction extension points defined: yes
- config schema defined: yes
- expression model defined: yes
- validation rules defined: yes
- generation pipeline defined: yes
- print layout defined: yes
- UI mode boundaries defined: yes
- implementation boundaries defined: yes
- S3 readiness checklist included: yes
- reference project modified: no
- runtime code created: no

