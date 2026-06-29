# MathWorksheet-S4 Expression Model And Generator Skeleton

## 1. Preflight

- Stage: S4
- Scope: integer expression core only
- UI work: not included
- Print layout work: not included
- Curriculum datasets: not included

## 2. Prior Artifact Inputs

- `docs/MathWorksheet-S1_OralcalcReference_DesignScan.md`
- `docs/MathWorksheet-S2_CleanRoomArchitectureSpec.md`
- `docs/MathWorksheet-S2A_MixedPatternSkillCurriculumArchitecturePatch.md`
- `docs/MathWorksheet-S3_CoreSchemaValidationAndPatternPlanningScaffold.md`
- current `src/core/` files
- current `tests/core/` files

## 3. S4 Scope

Implemented in S4:

- integer `NumberValue` wrapper
- operator normalization and exact-division helpers
- expression node constructors and collectors
- tree-based integer evaluator
- deterministic random helper
- single-pattern V1 expression generation skeleton
- final answer constraint checks
- generated question metadata preservation
- focused Node test coverage

Not implemented in S4:

- browser UI
- worksheet rendering
- print layout rendering
- curriculum data files
- decimal or fraction arithmetic
- full mixed worksheet generation

## 4. Files Created

- `src/core/number-value.js`
- `src/core/operators.js`
- `src/core/expression-model.js`
- `src/core/evaluate-expression.js`
- `src/core/generate-expression.js`
- `src/core/random.js`
- `tests/core/number-value.test.js`
- `tests/core/evaluate-expression.test.js`
- `tests/core/generate-expression.test.js`
- `docs/MathWorksheet-S4_ExpressionModelAndGeneratorSkeleton.md`

## 5. Files Modified

- `src/core/index.js`
- `src/core/validate-config.js`
- `src/core/report.js`
- `README.md`

## 6. NumberValue Model

S4 adds a V1 integer-only `NumberValue` shape:

```js
{
  kind: "integer",
  raw: { value: number },
  canonicalText: string
}
```

Implemented helpers:

- `createIntegerValue`
- `isIntegerValue`
- `getIntegerRawValue`
- `numberValueToCanonicalText`
- `assertIntegerValue`

Rules enforced:

- safe integers only
- invalid values throw structured errors with codes
- no decimal or fraction branches

## 7. Operator Helpers

S4 adds integer operator helpers with normalization between:

- `+`
- `-`
- `?` and `*`
- `繩` and `/`

Implemented behavior:

- exact integer division only
- division by zero rejection
- display-token mapping for duplicate-key and rendering-adjacent metadata

## 8. ExpressionNode Model

S4 implements:

- value nodes with operand-source position tracking
- binary nodes with normalized operator tokens
- operand collection
- operator collection
- generated-question skeleton construction

Metadata preserved on generated questions:

- `patternId`
- `patternTags`
- `skillTags`
- `difficultyTags`
- `curriculumNodeIds`
- `canonicalSkillIds`
- `precedenceMode`
- `parenthesesMode`

## 9. Evaluation Skeleton

S4 evaluation is tree-based and pure:

- evaluates `ExpressionNode`, not display text
- rejects invalid nodes
- rejects divide-by-zero
- rejects non-exact division
- collects intermediate integer results in evaluation order
- returns structured validation-style errors

## 10. Single-Pattern Generator Skeleton

Implemented generator entry points:

- `generateQuestionFromPattern`
- `generateQuestionsForPattern`
- `buildExpressionFromPattern`
- `buildDuplicateKey`
- `createGenerationFailure`

Current S4 generation coverage:

- V1 integer only
- question kind `expression` only
- `v1ExpressionSupported` patterns only
- reliable 2-operand generation
- left-associative tree scaffolding for larger operand counts
- exact-division candidate construction for 2-operand division

## 11. Answer Constraint Handling

S4 enforces final-answer checks for:

- `min`
- `max`
- `allowZero`
- `allowNegative`
- `requireInteger`

Constraint failures reject candidates and continue until attempt limits are reached.

## 12. Metadata Preservation

Pattern metadata is copied onto `GeneratedQuestion.metadata` without mutating the source pattern.

Preserved arrays are cloned:

- `patternTags`
- `skillTags`
- `difficultyTags`
- `curriculumNodeIds`
- `canonicalSkillIds`

## 13. Random Seed Handling

S4 adds deterministic random helpers:

- `createSeededRandom`
- `randomIntBetween`
- `pickOne`

Seed behavior:

- number and string seeds are deterministic
- `null` / unsupported seeds fall back to `Math.random`
- tests use seeded generation

## 14. Tests Added

- `tests/core/number-value.test.js`
- `tests/core/evaluate-expression.test.js`
- `tests/core/generate-expression.test.js`

Coverage includes:

- integer value creation and rejection
- canonical text
- add/subtract/multiply/divide evaluation
- division failure paths
- intermediate result collection
- tree-vs-display evaluation boundary
- 2-operand generation for all four operators
- support-status and question-kind rejection
- answer constraint rejection paths
- metadata preservation
- deterministic seed behavior

## 15. Test Results

- Command: `npm test`
- Result: passing after S4 implementation

## 16. Explicit Non-Goals

- HTML UI
- worksheet rendering
- print CSS
- answer-key rendering
- curriculum data files
- publisher sequence files
- decimal logic
- fraction logic
- geometry logic
- measurement logic
- word-problem logic

## 17. Known Limitations

- generator currently targets single-pattern expression generation only
- multi-pattern worksheet assembly is still not implemented
- 3/4 operand generation uses simple left-associative scaffolding
- intermediate-constraint filtering is not yet implemented beyond integer validity
- duplicate normalization does not yet collapse commutative variants

## 18. Recommended Next Task

`MathWorksheet-S5_SinglePatternWorksheetAssemblyAndFormattingSkeleton`

## 19. Completion Status

- S4 core expression model files created: yes
- integer `NumberValue` helper implemented: yes
- operator helpers with exact-division protection implemented: yes
- expression node helpers implemented: yes
- tree-based integer evaluator implemented: yes
- single-pattern generator skeleton implemented: yes
- final answer constraints enforced: yes
- generated-question metadata preserved: yes
- seeded random tests added: yes
- UI created: no
- curriculum data created: no
