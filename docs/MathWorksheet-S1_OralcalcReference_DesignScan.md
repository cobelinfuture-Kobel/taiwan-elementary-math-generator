# MathWorksheet-S1 Oralcalc Reference Design Scan

## 1. Preflight

- Task scope: DesignScan only.
- Target project: `math-worksheet-generator`
- Reference project: `references/oralcalc`
- Reference constraint: inspected as read-only material only.
- Clean-room constraint: no reference source code is copied into the target project.
- Implementation constraint for this stage: no runtime HTML, JavaScript, or CSS created for the new project.

## 2. Files Inspected

- `references/oralcalc/README.md`
- `references/oralcalc/index.html`
- `references/oralcalc/index.css`
- `references/oralcalc/index.js`
- `references/oralcalc/bootstrap/` for layout dependency context only

Additional repository checks:

- top-level file listing under `references/oralcalc`
- license-related filename/content scan under `references/oralcalc`

## 3. Reference Project Summary

### High-level purpose

`oralcalc` is a browser-based arithmetic worksheet generator focused on printable oral/mental calculation practice. The page combines:

- a parameter-heavy setup UI
- a client-side question generator
- a print-oriented worksheet layout

The `README.md` is minimal and mainly identifies the project as an oral calculation generator and points to a deployed demo. Some text appears to be stored or rendered with broken encoding, so the README is not a reliable source for detailed behavior.

### Primary technologies observed

- Single-page document in `index.html`
- Vue-based state binding in `index.js`
- Bootstrap 3 layout/components for modal, grid, tabs, panels, forms, and buttons
- Custom CSS in `index.css`
- Browser print flow via `window.print()`

### Important non-core elements in the reference

The reference also includes behaviors that are not appropriate to treat as core worksheet-generator requirements:

- Baidu analytics script embedded in `index.html`
- Bmob SDK usage and cloud/account/counter logic in `index.js`
- legacy IE print ActiveX fallback code

These are incidental to the reference implementation and should not shape the clean-room target unless explicitly re-approved later.

## 4. UI Layout Analysis

### Overall page structure

The page is organized into two major zones:

1. A command/configuration area inside `div.cmdbar.noprint`
2. A worksheet rendering table outside that command bar

Within the command bar, the visible structure is:

- Bootstrap panel with heading, body, and footer
- inline quick controls for worksheet-wide settings
- a button that opens a large Bootstrap modal for detailed generator settings
- a summary alert showing generated result counts

The worksheet rendering area is a table-based print layout with:

- repeating header area in `thead`
- page chunks rendered as repeated `tbody > tr`
- nested table used as the visible worksheet grid

### Modal-driven detailed settings

Detailed configuration is concentrated in a large modal dialog rather than on the main page. This keeps the main screen focused on worksheet-wide controls, while advanced arithmetic rules stay behind a configuration button.

### UI controls observed

#### Operation type selection

Observed in `index.html` as checkbox-style button toggles bound to:

- `isadd`
- `issub`
- `ismul`
- `isdiv`

This allows one or multiple operation families to be active at once.

#### Item count / operand count

Two different concepts appear in the UI and should be kept separate in the clean-room design:

- `count`: total number of questions to generate
- `itemcount`: number of operands/terms participating inside one expression

The reference constrains `itemcount` in script watchers to a small range and enables more advanced behaviors only when expression length is greater than two operands.

#### Rule selection

Observed controls:

- `rule`: selects worksheet answer/blanking mode
- `whichcond`: selects which position should be blank when the chosen rule requires it

From structure and string behavior, the reference supports at least:

- blanking the final answer
- blanking one operand at a chosen or random position

#### Detailed arithmetic settings

The modal contains several layers of arithmetic configuration:

- per-operator enablement for each operator slot in a multi-step expression via `range_op`
- left/right/random composition strategy via `strategy`
- adjacent-operator constraints
  - `diff_operator_adjacent`
  - `dissimilarity_operator_adjacent`
- optional parentheses-related controls
- per-operation operand ranges
  - `range_add`
  - `range_sub`
  - `range_mul`
  - `range_div`
- per-operation result ranges
  - `result_add`
  - `result_sub`
  - `result_mul`
  - `result_div`
- operation-specific arithmetic behavior flags
  - `carry` for addition carry handling
  - `borrow` for subtraction borrowing
  - `nomod` for division exactness / remainder handling

#### Print-related controls

Worksheet-wide print/display controls are on the main panel rather than in the modal:

- `cols`: number of worksheet columns
- `pagerows`: rows per printed page
- `appendemptyrows`: whether to pad the last page with empty rows
- `cellPadding`
- `cellSpacing`
- `fontfamily`
- `fontsize`

The page also exposes:

- `doGen` button to generate questions
- `doPrint` button to print

### Layout dependency on Bootstrap

Bootstrap is used for structural composition rather than algorithmic behavior:

- grid system: `container`, `row`, `col-md-*`
- modal
- tabs
- panel
- button groups
- forms and input groups
- glyphicons

Reusable concept:

- split simple controls and advanced settings

Non-reusable implementation detail:

- exact Bootstrap-based markup, class composition, and panel/tab/modal structure should not be copied directly.

## 5. Print Layout Analysis

### `@media print`

The reference defines a print media block in `index.css` that switches the page from interactive app mode into worksheet output mode.

Observed behaviors:

- hides the configuration bar by targeting `.noprint`
- shows rows marked `.printonly`
- lets the main app width become auto for printing

### `@page`

The stylesheet includes an `@page` block with explicit paper size declarations. Two size lines are present, with the later declaration overriding the earlier one in normal CSS interpretation.

Implication:

- the reference is directly tuning paper dimensions for print output rather than leaving page size entirely to browser defaults

Clean-room takeaway:

- explicit page sizing may be useful, but the exact values and declaration pattern should be re-designed and validated independently

### `noprint` handling

The command/configuration bar is wrapped in an element with `noprint`, then hidden in print mode. This cleanly separates editor controls from printable content.

This is a strong reusable concept.

### `print-only` handling

Rows with class `printonly` are hidden on screen and shown only when printing. In the reference, these appear to support blank filler rows so printed pages keep a consistent grid height.

This is also a strong reusable concept.

### Page-break handling

The reference defines:

- `.break_before { page-break-before: always; }`
- `.break_after { page-break-after: always; }`

The rendered page container rows apply `break_before` for pages after the first. This means pagination is handled structurally in the generated table, not by relying on natural browser flow alone.

Clean-room takeaway:

- explicit pagination markers are useful for stable print output
- the exact table-row approach should be reconsidered instead of copied

## 6. Question Generation Flow Analysis

### Where generation starts

Generation begins from the `doGen` method in `index.js`.

Observed responsibilities there:

- precompute helper value pools for multiplication/division
- validate current settings
- reset generation report counters
- clear previous results
- loop `count` times
- call `genOneFormula()` for each worksheet item
- push generated items into `res`

### How operation types are selected

Operation family selection is driven by UI booleans:

- `isadd`
- `issub`
- `ismul`
- `isdiv`

The `op()` method creates an allowed operator list from those booleans and randomly selects from that list.

For multi-step expressions, `genOperator(index, prev_operator)` adds another control layer. Based on the surrounding code and UI, each operator position can also be restricted by `range_op`, and adjacency rules can reject or alter unsuitable combinations.

### How operands and operators are controlled

The reference generation flow is not a simple "pick two numbers and evaluate" loop. It is a constrained expression builder with these observed stages:

1. `genOneFormula()` creates an array of step descriptors for a multi-operator expression.
2. Each descriptor tracks:
   - operator
   - orientation (`lor`, meaning whether the nested expression sits on the left or right)
   - target result
   - left operand
   - right operand
3. `randomLOR()` chooses whether recursive nesting grows from the left, right, or a fixed side according to `strategy`.
4. `genItemResult()` chooses an allowed intermediate result for the current step.
5. `genItemLOR()` and `genItemLORByRange()` derive an operand value that fits the result, range, and arithmetic constraints.
6. `calcItem2Value()` derives the complementary operand from the chosen result and known operand.

Constraint inputs include:

- global operation-family enablement
- per-slot operator enablement
- operand min/max ranges per operation
- result min/max ranges per operation
- carry / borrow / exact-division rules
- no-zero and divisibility constraints
- adjacent-operator restrictions
- optional parentheses/autofix logic

### How answers are derived

The reference derives answers as part of generation, not as a post-pass over plain text.

Observed answer flow:

- each expression step has a computed `result`
- final rendered worksheet text comes from `formulaToString(items)`
- the display rule decides whether the blank is:
  - the final answer
  - one operand position
- when not blanked, the final answer shown comes from the first item result in the expression chain

The reference also performs a consistency check by evaluating the assembled expression numerically and reconciling the stored result if necessary.

### Rendering path

After generation:

- raw generated structures are stored in `res`
- `formulaToString()` converts each item into printable text
- the worksheet table lays those strings into rows and columns according to `cols`, `pagerows`, and optional empty-row padding

## 7. Reusable Concepts

The following ideas are reusable as concepts for a clean-room implementation:

- Separate quick worksheet controls from advanced arithmetic rules.
- Support multiple operation families in one worksheet.
- Distinguish question count from operands-per-question.
- Model arithmetic settings at multiple levels:
  - worksheet-wide
  - operation-family-specific
  - per-operator-slot for multi-step expressions
- Treat print as a first-class product requirement, not as an afterthought.
- Use a print-hidden config area and print-only filler elements.
- Let worksheet layout be controlled by columns and rows-per-page.
- Pre-validate impossible arithmetic settings before generation.
- Generate structured expression data first, then render printable strings from that structure.
- Represent blanking rules separately from expression-generation rules.
- Keep reporting/summary metrics for generated question mix and rule outcomes.

## 8. Non-Copy / License Risk Notes

### Observed license risk

A scan of `references/oralcalc` did not reveal a confirmed top-level project license file for the reference project itself. Third-party bundled assets do contain their own license notices, but that does not establish reuse rights for the reference project's original application code, UI markup, wording, or styling.

### What must not be copied directly

Do not copy directly from `references/oralcalc` into `math-worksheet-generator`:

- `index.html` structure or markup
- `index.css` rules
- `index.js` logic, algorithms, data structures, helper functions, or naming
- Chinese/English UI wording verbatim
- worksheet header text
- exact settings taxonomy/order if it mirrors the reference too closely
- table layout markup
- modal/tab/panel organization
- analytics script
- Bmob integration code
- any bundled third-party files from the reference repo

### What is safe to reuse at the idea level

Safe concept-level reuse:

- printable arithmetic worksheet generator
- configurable arithmetic constraints
- blank-the-answer or blank-an-operand worksheet modes
- page-aware worksheet layout
- structured generation pipeline

Required clean-room rule:

- re-specify behavior in original product language and implement new code from this design document, not from the reference source.

## 9. Proposed Clean-Room Target Architecture

### Product direction

Build `math-worksheet-generator` as a static GitHub Pages application with no backend dependency. Keep the architecture intentionally simple:

- static HTML entry point later
- modular client-side JavaScript
- print-specific CSS
- optional import/export of presets using URL state or local JSON later

### Recommended clean-room modules

#### 1. Settings schema

Purpose:

- define the allowed configuration model
- provide defaults
- validate bounds and enum values

Suggested responsibilities:

- worksheet settings
- print settings
- operation enablement
- per-operation operand/result constraints
- blanking rules
- generation strategy flags

#### 2. Validation engine

Purpose:

- reject impossible or contradictory settings before generation begins

Examples:

- no operation selected
- min greater than max
- exact division requested but no valid divisors possible
- rows/columns/page settings outside allowed range

#### 3. Expression model

Purpose:

- define neutral internal data structures for generated questions

Suggested data shapes:

- `WorksheetConfig`
- `QuestionSpec`
- `ExpressionNode`
- `RenderedQuestion`
- `GenerationReport`

#### 4. Generator engine

Purpose:

- produce question objects from validated config

Suggested submodules:

- random utilities
- operator selection
- operand sampling
- constraint solving
- answer derivation
- report aggregation

#### 5. Formatter

Purpose:

- convert structured expressions into display strings
- later support multiple display styles

Examples:

- inline text expression
- spaced print expression
- answer key formatting

#### 6. Pagination / layout planner

Purpose:

- map generated questions into print pages independently from DOM rendering

Suggested outputs:

- page count
- rows per page
- cells per row
- optional filler cells/rows

#### 7. UI layer

Purpose:

- bind form controls to config
- call validation and generation
- render worksheet preview

Important:

- this should be implemented later from the clean-room plan, not from reference markup

### Architectural principles

- Pure generation logic should not depend on DOM APIs.
- Print layout planning should be separable from arithmetic generation.
- Config schema and validation should be explicit, not implicit in watchers alone.
- Avoid analytics, cloud SDKs, and auth features in the initial GitHub Pages version.
- Prefer deterministic module boundaries so later tests can cover generation logic without browser rendering.

## 10. Proposed File Structure For `math-worksheet-generator`

This is a proposal for the next implementation stage, not something to create now.

```text
math-worksheet-generator/
  docs/
    MathWorksheet-S1_OralcalcReference_DesignScan.md
  src/
    core/
      config-schema.js
      default-config.js
      validate-config.js
      random.js
      operators.js
      expression-model.js
      generate-worksheet.js
      format-expression.js
      paginate-worksheet.js
      report.js
    ui/
      app-state.js
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
      generate-worksheet.test.js
      paginate-worksheet.test.js
  index.html
  README.md
```

Notes:

- `src/core` stays framework-light and testable.
- `src/ui` stays thin and orchestrates user interaction only.
- `styles/print.css` should own print-specific behavior instead of mixing everything together.

## 11. Recommended Next Task

Recommended next task name:

`MathWorksheet-S2_CleanRoomArchitectureSpec`

Recommended scope for that next task:

- define the target config schema in detail
- define question data structures
- define worksheet pagination data structures
- define validation rules and error messages
- define clean-room UI information architecture
- define implementation boundaries for `core`, `ui`, and `styles`

Do not start runtime coding until that architecture spec is written and reviewed.

## 12. Completion Status

- DesignScan document created: yes
- Required reference files inspected: yes
- Reference observations separated from clean-room planning: yes
- Reusable concepts section included: yes
- Non-copy/license-risk section included: yes
- Recommended next task included: yes
- Reference project modified: no
