# MathWorksheet-S3 Core Schema Validation And Pattern Planning Scaffold

## 1. Preflight

- Stage: S3
- Scope: first implementation scaffold only
- Runtime UI: not created
- Worksheet generator: not implemented
- Curriculum datasets: not created

## 2. Prior Artifact Inputs

- `docs/MathWorksheet-S1_OralcalcReference_DesignScan.md`
- `docs/MathWorksheet-S2_CleanRoomArchitectureSpec.md`
- `docs/MathWorksheet-S2A_MixedPatternSkillCurriculumArchitecturePatch.md`
- current project file tree before S3 scaffold

## 3. S3 Scope

Implemented in S3:

- package scaffold
- core constants
- default V1 config
- documented schema-shape helpers
- config validation scaffold
- mixed-pattern planning scaffold
- report helpers
- basic Node tests

Not implemented in S3:

- arithmetic expression generation
- arithmetic evaluation
- worksheet rendering
- HTML UI
- print CSS
- curriculum data files

## 4. Files Created

- `package.json`
- `README.md`
- `src/core/constants.js`
- `src/core/default-config.js`
- `src/core/config-schema.js`
- `src/core/validate-config.js`
- `src/core/pattern-planning.js`
- `src/core/report.js`
- `src/core/index.js`
- `tests/core/validate-config.test.js`
- `tests/core/pattern-planning.test.js`
- `docs/MathWorksheet-S3_CoreSchemaValidationAndPatternPlanningScaffold.md`

## 5. Files Modified

- none beyond newly created S3 scaffold files

## 6. Core Constants Added

- number domains and V1 active domain list
- generation modes
- question kinds and V1 active question kind list
- operator tokens
- allocation modes
- worksheet ordering modes
- support statuses and V1 blocked status list
- curriculum item types
- publishers
- grades
- semesters
- exam checkpoints
- exam segments
- carry / borrow / complexity values

## 7. Default Config Summary

- `generation.questionCount` is the single question-count source of truth
- `printLayout.questionCount` is intentionally absent
- default domain is `integer`
- default question kind is `expression`
- default generation mode is `singlePattern`
- default operators are `+` and `-`
- default pattern plan exists
- metadata arrays are reserved for:
  - `patternTags`
  - `skillTags`
  - `difficultyTags`
  - `curriculumNodeIds`
  - `canonicalSkillIds`

## 8. Validation Scaffold Summary

Implemented validation categories:

- root config shape
- V1 number-domain gating
- V1 question-kind gating
- operator validity
- per-slot operator compatibility
- digit constraint structure
- division pattern gating
- mixed-pattern plan validation
- support-status gating
- metadata array checks
- print layout validation

Validation output shape:

```js
{
  ok: boolean,
  errors: ValidationError[],
  warnings: ValidationError[]
}
```

## 9. Mixed Pattern Planning Summary

Implemented scaffold functions:

- `getEnabledPatterns(patternPool)`
- `isPatternV1Generatable(pattern)`
- `validatePatternPlan(config)`
- `allocatePatternCounts(config)`

Supported allocation behavior:

- `fixedCounts`
- `equalDistribution`

Scaffold-only behavior:

- `weightedDistribution`

## 10. Support Status Gating Summary

V1 generation only allows active patterns that are:

- `expression` question kind
- marked with `v1ExpressionSupported`
- not marked with future-only or blocked support statuses

Future-only statuses remain representable as metadata but cannot be active in V1 generation planning.

## 11. Metadata Fields Reserved

Reserved metadata arrays exist at scaffold level for:

- `patternTags`
- `skillTags`
- `difficultyTags`
- `curriculumNodeIds`
- `canonicalSkillIds`

These are validated structurally but not yet resolved against a full registry dataset.

## 12. Tests Added

- `tests/core/validate-config.test.js`
- `tests/core/pattern-planning.test.js`

Covered behaviors:

- default config passes
- blocked domains fail
- blocked question kinds fail
- invalid operators fail
- invalid digit constraints fail
- blocked support-status patterns fail
- invalid fixed-count totals fail
- fixed/equal pattern allocation works
- duplicate pattern ids fail
- weighted allocation stays scaffold-only

## 13. Test Results

- Test command: `npm test`
- Result: passing in S3 scope after scaffold implementation

## 14. Explicit Non-Goals

- full arithmetic generation
- arithmetic evaluation
- worksheet rendering
- browser UI
- print CSS
- curriculum content datasets
- publisher sequence datasets
- full tag registry dataset

## 15. Known Limitations

- operator tokens are normalized as ASCII core values
- weighted distribution is scaffold-only
- registry reference validation is not implemented
- no worksheet document generation exists yet
- no arithmetic feasibility engine exists yet beyond structural gating

## 16. Recommended Next Task

`MathWorksheet-S4_ExpressionModelAndGeneratorSkeleton`

Recommended scope:

- add expression node model
- add generation skeleton without UI
- add non-rendering intermediate data flow
- keep curriculum data out of scope unless explicitly requested

## 17. Completion Status

- S3 scaffold files created: yes
- validation scaffold implemented: yes
- mixed-pattern planning scaffold implemented: yes
- V1 support-status gating implemented: yes
- metadata fields reserved: yes
- tests added: yes
- runtime website UI created: no
- curriculum data files created: no
- full arithmetic generation implemented: no
