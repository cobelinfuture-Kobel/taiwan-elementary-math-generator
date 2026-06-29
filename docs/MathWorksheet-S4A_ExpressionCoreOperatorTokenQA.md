# MathWorksheet-S4A Expression Core Operator Token QA

## 1. Preflight

- Stage: S4A
- Scope: operator-token QA and repair only
- UI work: not included
- Worksheet assembly: not included
- Curriculum data: not included

## 2. Prior Artifact Inputs

- `docs/MathWorksheet-S2_CleanRoomArchitectureSpec.md`
- `docs/MathWorksheet-S2A_MixedPatternSkillCurriculumArchitecturePatch.md`
- `docs/MathWorksheet-S3_CoreSchemaValidationAndPatternPlanningScaffold.md`
- `docs/MathWorksheet-S4_ExpressionModelAndGeneratorSkeleton.md`
- current `src/core/` files
- current `tests/core/` files

## 3. QA Reason

S4 documentation showed suspicious multiplication and division token text. S4A verifies whether the issue was only a document artifact or an actual source-contract problem before formatter or worksheet-assembly work continues.

## 4. Files Inspected

- `src/core/constants.js`
- `src/core/operators.js`
- `src/core/expression-model.js`
- `src/core/evaluate-expression.js`
- `src/core/generate-expression.js`
- `src/core/default-config.js`
- `src/core/validate-config.js`
- `tests/core/evaluate-expression.test.js`
- `tests/core/generate-expression.test.js`
- `tests/core/validate-config.test.js`
- `docs/MathWorksheet-S4_ExpressionModelAndGeneratorSkeleton.md`
- `README.md`

## 5. Files Modified

- `src/core/constants.js`
- `src/core/operators.js`
- `tests/core/evaluate-expression.test.js`
- `tests/core/generate-expression.test.js`
- `tests/core/validate-config.test.js`

## 6. Operator Token Contract

Verified and repaired canonical internal operator tokens:

- `+`
- `-`
- `?`
- `繩`

S4A also removed the prior mismatch where constants still treated `*` and `/` as canonical internal tokens.

## 7. ASCII Alias Normalization Result

Verified normalization behavior:

- `+ -> +`
- `- -> -`
- `? -> ?`
- `* -> ?`
- `繩 -> 繩`
- `/ -> 繩`

Unsupported tokens remain rejected.

## 8. Display Token Result

Verified `getOperatorDisplayToken` returns canonical display tokens:

- `+`
- `-`
- `?`
- `繩`

S4A confirms display output does not use `*` or `/` as the primary multiplication or division display form.

## 9. Evaluation Token Result

Verified evaluation works for:

- canonical multiplication token `?`
- canonical division token `繩`
- ASCII multiplication alias `*`
- ASCII division alias `/`

Exact-division rules remain unchanged:

- divide-by-zero rejected
- non-exact division rejected
- no decimal quotient
- no remainder output

## 10. Generator Token Result

Verified generated multiplication and division questions store canonical internal operator tokens after normalization:

- multiplication uses `?`
- division uses `繩`

Generated metadata remains preserved:

- `patternId`
- `patternTags`
- `skillTags`
- `difficultyTags`
- `curriculumNodeIds`
- `canonicalSkillIds`

## 11. Duplicate Key Result

Verified duplicate keys are canonical and stable:

- multiplication duplicate keys use `?`
- division duplicate keys use `繩`
- alias inputs `*` and `/` normalize to the same duplicate key as canonical inputs

## 12. Validation Result

Validation currently accepts:

- canonical operator tokens
- ASCII aliases at config input level

Generator and expression-model paths normalize aliases before use, so accepted alias input still produces canonical internal operators.

## 13. Documentation Finding

Findings:

- malformed operator token text was present in S4 documentation
- malformed operator token text was also present in S4 source/test paths
- S4A fixes the source contract and records the documentation finding here

This was not only a documentation typo.

## 14. Tests Added Or Strengthened

S4A added or strengthened tests for:

- `normalizeOperatorToken("?")`
- `normalizeOperatorToken("*")`
- `normalizeOperatorToken("繩")`
- `normalizeOperatorToken("/")`
- `getOperatorDisplayToken("?")`
- `getOperatorDisplayToken("繩")`
- canonical `?` evaluation
- canonical `繩` evaluation
- alias `*` evaluation
- alias `/` evaluation
- generated multiplication canonical token storage
- generated division canonical token storage
- multiplication duplicate-key canonicalization
- division duplicate-key canonicalization
- malformed token rejection
- validation of canonical tokens
- validation of accepted ASCII aliases

## 15. Test Results

- Command: `npm test`
- Result: passing after S4A repair

## 16. Explicit Non-Goals

- UI implementation
- worksheet assembly
- print CSS
- answer-key rendering
- curriculum data files
- decimal logic
- fraction logic
- geometry logic
- measurement conversion logic
- word-problem logic

## 17. Risk Assessment

Current operator-token risk is low after S4A because:

- canonical token ownership is explicit in `constants.js`
- normalization behavior is tested directly
- display output is tested directly
- alias and canonical duplicate-key behavior is tested directly

Residual risk:

- future formatter work must continue using canonical tokens as its source of truth

## 18. Recommended Next Task

`MathWorksheet-S5_SinglePatternWorksheetAssemblyAndFormattingSkeleton`

## 19. Completion Status

- operator token contract verified: yes
- canonical internal multiplication token is `?`: yes
- canonical internal division token is `繩`: yes
- ASCII aliases verified: yes
- display tokens verified: yes
- exact division behavior preserved: yes
- duplicate key canonicalization verified: yes
- S4A QA document created: yes
- UI created: no
- curriculum data created: no
