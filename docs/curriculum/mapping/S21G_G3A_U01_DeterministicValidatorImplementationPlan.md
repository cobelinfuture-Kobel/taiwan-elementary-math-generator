# S21G G3A U01 Deterministic Validator Implementation Plan

## Document Status

- Task scope: documentation / implementation plan only
- Production impact: no validator code, no tests, no GeneratedItem JSON, no LiteracyItem JSON, no worksheet assets are created by this task
- Purpose: translate the S21F deterministic validator contract into a future code architecture, module layout, function boundary, validation pipeline, test fixture plan, and implementation sequence
- Reference contract: `S21F_G3A_U01_DeterministicValidatorContract.md` (S21F1 ReadbackQA)
- Reference schema: `S21E_G3A_U01_PatternSpecSchemaAndSeedDesign.md` (S21E1)
- Reference policy: `S21C_G3A_U01_AIItemGenerationAndStoragePolicy.md` (S21C1)
- Reference mapping: `S21B_G3A_U01_10000Numbers_FormalPatternMapping.md`

---

## 1. Purpose

S21G is the **pilot implementation plan** for the G3A U01 deterministic validator. It defines:

**Architecture note:** S21G uses G3A U01 as the first pilot pattern pack, but the actual validator implementation should be extracted into a **reusable global validator framework** plus **domain plugins** plus **unit pattern packs**. G3A U01 is the first pilot unit; it must not become a template that is duplicated for every one of the 79 curriculum nodes. H1–H19 are the pilot hook taxonomy: H1, H2, H15–H19 should become global/core hooks, and H3–H14 should become number-sense plugin hooks. S21H–S21N are first-framework staging tasks, not a template to repeat for every unit.

It defines:

- The proposed file and module layout for a future validator codebase.
- The public API surface and function boundaries.
- The validation pipeline order and inter-dependency rules.
- Hook-to-function mapping for all H1–H19 hooks.
- PatternSpec-to-validation-path mapping for all 12 patterns.
- Data model shapes (documentation only, no JSON files).
- Error/warning enum plan.
- AnswerStatus enforcement rules.
- Visual gating implementation rules.
- Chinese numeral formatter/parser plan.
- Sequence stepModel handling plan.
- Test fixture plan (groups and shapes, no actual tests).
- Implementation sequencing across future tasks (S21H–S21N).

S21G explicitly does **not**:

- Implement validator code.
- Create tests or test fixtures.
- Generate item banks or production JSON.
- Create worksheets or worksheet assets.
- Inspect or OCR source PDFs.
- Promote visual items beyond what S21F allows.
- Add validators for future domains.
- Modify S21B, S21C, S21D, S21E, or S21F policy semantics.
- Modify `src/`, `site/`, `tests/`, `package.json`, `package-lock.json`, schema files, deployment files, or generated worksheet output.

Actual implementation must happen in a later task, e.g.: `S21H_G3A_U01_DeterministicValidatorImplementation`.

---

## 2. Scope

S21G covers all 12 G3A U01 PatternSpecs and all 19 S21F validator hooks:

| # | PatternSpec ID | questionKind | supportStatus |
|---|---|---|---|
| 1 | `spec_pv_4digit_decompose` | `decompose` | `v1NumberSenseSupported` |
| 2 | `spec_pv_4digit_compose` | `compose` | `v1NumberSenseSupported` |
| 3 | `spec_rw_4digit_number_to_chinese` | `transcode` | `v1NumberSenseSupported` |
| 4 | `spec_rw_4digit_chinese_to_number` | `transcode` | `v1NumberSenseSupported` |
| 5 | `spec_rw_4digit_zero_reading` | `transcode` | `v1NumberSenseSupported` |
| 6 | `spec_seq_4digit_place_step` | `sequence` | `v1NumberSenseSupported` |
| 7 | `spec_seq_between_two_numbers` | `sequence` | `v1NumberSenseSupported` |
| 8 | `spec_cmp_4digit_compare` | `compare` | `v1NumberSenseSupported` |
| 9 | `spec_perm_4digit_max_min_from_digits` | `optimize_from_digits` | `v1NumberSenseSupported` |
| 10 | `spec_numline_integer_reading` | `visual_reading` | `v1TextFallbackSupported` |
| 11 | `spec_money_4digit_counting` | `visual_reading` | `v1TextFallbackSupported` |
| 12 | `spec_money_4digit_payment` | `representation_payment` | `v1TextFallbackSupported` |

---

## 3. Contract Inputs

S21G translates the following S21F contract elements into implementation design:

| Contract element | Count / detail | S21F reference |
|---|---|---|
| PatternSpecs | 12 | §2 |
| Validator hooks | 19 (H1–H19) | §5.1 |
| Validation layers | 3 (structural, domain, semantic) | §4 |
| Blocking error codes | 27 | §9.1 |
| Warning codes | 4 | §9.2 |
| Validation result object | 10 fields | §8 |
| Production gates | PG1–PG10 | §11 |
| Visual gating rules | 3 patterns gated | §11.2 |
| Answer status values | 7 | §7 |
| Answer status rules | Validator sets 5, must not set `verified`/`human_reviewed` | §7 |
| Runtime vs permanent storage | Runtime = transient, permanent = curated/QA/bank | §11.1 |

S21G does not redefine any of these. They are inherited as-is from S21F.

---

## 4. Proposed File/Module Layout

### 4.1 Pilot-local view (initial G3A U01 layout)

The following structure represents the **initial pilot-local view** for G3A U01. It is a concrete starting point but should be refactored into the scalable layout (§4.2) during S21H–S21M implementation.

```
src/curriculum/g3a/u01/validator/
├── index.js                              # Public API: validateG3AU01Item, etc.
├── validate-pattern-spec.js              # PS1–PS9 structural checks
├── validate-domain-boundary.js           # DB1–DB8 domain boundary checks
├── validate-answer-status.js             # AnswerStatus enforcement
├── validate-production-gate.js           # PG1–PG10 production eligibility
├── validation-pipeline.js                # Orchestrator: full 10-step pipeline
├── hooks/
│   ├── validate-numeric-range.js         # H1
│   ├── validate-digit-count.js           # H2
│   ├── validate-place-value-decomposition.js  # H3 (incl. digit-value subcase)
│   ├── validate-place-value-composition.js    # H4
│   ├── validate-chinese-number-reading.js     # H5
│   ├── validate-chinese-to-number.js          # H6
│   ├── validate-zero-reading.js               # H7
│   ├── validate-digit-arrangement-max-min.js  # H8
│   ├── validate-four-digit-comparison.js      # H9
│   ├── validate-sequence-step.js              # H10 (place-sequence)
│   ├── validate-between-numbers-sequence.js   # H11 (single-step)
│   ├── validate-money-total.js                # H12
│   ├── validate-money-exchange.js             # H13
│   ├── validate-number-line-text-fallback.js  # H14
│   ├── validate-support-status-compatibility.js      # H15
│   ├── validate-no-future-domain-leakage.js          # H16
│   ├── validate-no-unsupported-visual-dependency.js  # H17
│   ├── validate-unique-answer.js              # H18 (precheck + fallback)
│   └── validate-source-boundary.js            # H19
├── constants/
│   ├── error-codes.js                    # 27 blocking error codes
│   ├── warning-codes.js                  # 4 warning codes
│   ├── answer-status.js                  # 7 answer status values
│   └── pattern-spec-ids.js               # 12 PatternSpec ID constants
└── utils/
    ├── normalize-number.js               # Numeric normalization
    ├── parse-chinese-number.js           # zh-Hant → number parser
    ├── format-chinese-number.js          # number → zh-Hant formatter
    ├── normalize-money-denominations.js  # Money denomination normalization
    ├── sequence-utils.js                 # stepModel validation helpers
    └── validation-result.js              # Result object factory
```

**Proposed parallel test location (not created by S21G):**

```
tests/curriculum/g3a/u01/validator/
├── test-validate-pattern-spec.js
├── test-validate-domain-boundary.js
├── test-validate-answer-status.js
├── test-validate-production-gate.js
├── test-validation-pipeline.js
├── test-hooks/
│   ├── test-validate-numeric-range.js
│   ├── test-validate-digit-count.js
│   ├── test-validate-place-value-decomposition.js
│   ├── ...
│   └── test-validate-source-boundary.js
├── fixtures/
│   ├── pattern-specs.js
│   ├── candidate-items.js
│   └── validation-results.js
└── test-utils/
    └── assert-hook-result.js
```

### 4.2 Preferred scalable layout (target architecture)

After the pilot phase, the implementation should be refactored into this scalable three-layer architecture. Do NOT create these files now.

**Global Validator Core** (`src/validation/core/`):

```
src/validation/core/
├── validation-result.js                          # Result object factory
├── validate-pattern-spec.js                      # PS1–PS9 structural checks
├── validate-domain-boundary.js                   # DB1–DB8 domain boundary checks
├── validate-answer-status.js                     # AnswerStatus enforcement
├── validate-production-gate.js                   # PG1–PG10 production eligibility
├── validation-pipeline.js                        # Orchestrator
├── constants/
│   ├── error-codes.js                            # 27 blocking error codes
│   ├── warning-codes.js                          # 4 warning codes
│   ├── answer-status.js                          # 7 answer status values
│   └── support-status.js                         # SupportStatus constants
└── hooks/
    ├── validate-numeric-range.js                 # H1
    ├── validate-digit-count.js                   # H2
    ├── validate-support-status-compatibility.js  # H15
    ├── validate-no-future-domain-leakage.js      # H16
    ├── validate-no-unsupported-visual-dependency.js  # H17
    ├── validate-unique-answer.js                 # H18
    └── validate-source-boundary.js               # H19
```

**Number Sense Plugin** (`src/validation/plugins/number-sense/`):

```
src/validation/plugins/number-sense/
├── hooks/
│   ├── validate-place-value-decomposition.js     # H3 (incl. digit-value subcase)
│   ├── validate-place-value-composition.js       # H4
│   ├── validate-chinese-number-reading.js        # H5
│   ├── validate-chinese-to-number.js             # H6
│   ├── validate-zero-reading.js                  # H7
│   ├── validate-digit-arrangement-max-min.js     # H8
│   ├── validate-four-digit-comparison.js         # H9
│   ├── validate-sequence-step.js                 # H10
│   ├── validate-between-numbers-sequence.js      # H11
│   ├── validate-money-total.js                   # H12
│   ├── validate-money-exchange.js                # H13
│   └── validate-number-line-text-fallback.js     # H14
└── utils/
    ├── normalize-number.js
    ├── parse-chinese-number.js
    ├── format-chinese-number.js
    ├── normalize-money-denominations.js
    └── sequence-utils.js
```

**G3A U01 Pilot Pattern Pack** (`src/curriculum/g3a/u01/pattern-pack/`):

```
src/curriculum/g3a/u01/pattern-pack/
├── pattern-specs.js                              # 12 PatternSpec definitions
├── validation-paths.js                           # Hook-to-pattern path mapping
└── fixtures/
    ├── candidate-items.js
    └── expected-results.js
```

**Tests** (mirror structure):

```
tests/validation/core/
tests/validation/plugins/number-sense/
tests/curriculum/g3a/u01/pattern-pack/
```

### 4.3 Responsibility split

| Layer | Responsibility | Examples | Reused across units? |
|---|---|---|---|
| **Global Validator Core** | Result object, error/warning enum, answerStatus enforcement, production gate, source boundary, future-domain leakage, visual dependency gate, pipeline orchestration. | `validation-result.js`, `validate-source-boundary.js`, `ERROR_CODES` | Yes — reused across all 79 curriculum nodes. |
| **Number Sense Plugin** | Place value, digit value, Chinese numerals, zero reading, comparison, sequence, money textFallback, number-line textFallback. | `validate-place-value-decomposition.js`, `format-chinese-number.js` | Yes — reused by G3A U01 and future number-sense units (e.g., G4A U01). |
| **Unit Pattern Pack** | PatternSpec IDs, validation path mapping, unit-specific fixtures and expected results. | `pattern-specs.js` (G3A U01), `validation-paths.js` | No — unit-specific, but lightweight (only PatternSpec data + path mapping). |

### 4.4 79-unit scaling policy

**Do NOT create a full S21B–S21N chain for every one of the 79 curriculum nodes.**

Long-term scaling policy:

- 79 nodes remain shallow `CurriculumNodeCandidate` until selected for deep mapping.
- Only V1 priority nodes receive deep mapping (S21B → PatternSpec → PatternPack).
- Deep mapping produces lightweight PatternSpec / PatternPack artifacts that reference the global core and domain plugins.
- Core validator and domain plugins are reused across all units.
- Future domains (geometry, measurement, charts, statistics, word problems, fractions, decimals, etc.) remain registry-only until their domain plugin engines are scheduled.

---

## 5. Public API Plan

The validator should expose the following public functions. These are design signatures only — no implementation code is created.

### 5.1 Primary entry point

**`validateG3AU01Item(candidateItem, patternSpec, options)`**

| Parameter | Type | Meaning |
|---|---|---|
| `candidateItem` | CandidateItem | The item to validate. |
| `patternSpec` | PatternSpec | The resolved PatternSpec for this item. |
| `options` | object (optional) | `{ mode?, runtimeOnly?, strictVisual? }` |

**Returns:** `ValidationResult`

This is the main orchestrator. It runs the full 10-step pipeline and returns a complete validation result.

### 5.2 Sub-functions

| Function | Purpose |
|---|---|
| `validatePatternSpec(patternSpec)` | Run PS1–PS9 structural checks. Returns `{ pass, errors }`. |
| `validateDomainBoundary(candidateItem, patternSpec)` | Run DB1–DB8 domain boundary checks. Returns `{ pass, errors }`. |
| `runValidatorHooks(candidateItem, patternSpec)` | Execute the pattern-specific hook path + H15–H19. Returns `{ hookResults[], computedAnswer?, answerStatus }`. |
| `validateProductionEligibility(validationResult, candidateItem, patternSpec)` | Apply PG1–PG10. Returns `{ eligible, failedGates[] }`. |
| `createValidationResult(partial)` | Assemble a complete ValidationResult object from partial inputs. |

### 5.3 Return shape

All functions return a `ValidationResult` following S21F §8:

```json
{
  "validationStatus": "pass | fail | warning",
  "answerStatus": "computed | to_be_verified | omitted_for_template | blocked_visual_dependency | invalid",
  "validatorHook": "validatePlaceValueDecomposition",
  "patternSpecId": "spec_pv_4digit_decompose",
  "computedAnswer": { /* answer model shape */ },
  "normalizedInput": { /* normalized input */ },
  "errorCodes": [],
  "warnings": [],
  "productionEligible": true,
  "notes": ""
}
```

---

## 6. Validation Pipeline

The future implementation must follow this 10-step pipeline order.

### 6.1 Pipeline steps

| Step | Action | Gate |
|---|---|---|
| 1 | Load / receive `candidateItem` and resolve `patternSpecId` → `patternSpec`. | — |
| 2 | Validate PatternSpec structure (PS1–PS9). | If fail → abort with `E_PATTERN_UNKNOWN` or `E_SCHEMA_REQUIRED_FIELD`. |
| 3 | Validate domain boundary (DB1–DB8). | If fail → accumulate errors; continue only if errors are non-blocking. |
| 4 | Determine primary validation path from `patternSpec.questionKind` and S21F §10 matrix. | — |
| 5 | Execute pattern-specific hooks (H3–H14) in the declared order. | If any hook fails → abort pattern-specific phase. |
| 6 | Execute common hooks (H15–H19). | Accumulate errors. |
| 7 | Compute `answerStatus` from hook results per S21F §7 rules. | Do not set `verified` or `human_reviewed` from validator. |
| 8 | Compute `computedAnswer` from deterministic hook output. | Only if all hooks passed. |
| 9 | Apply production gate PG1–PG10. | If any gate fails → `productionEligible = false`. |
| 10 | Assemble and return `ValidationResult`. | — |

### 6.2 Pipeline inter-dependency rules

| Rule | Description |
|---|---|
| R1 | Pattern-specific hooks (H3–H14) must NOT run if structural validation (step 2) fails. |
| R2 | Domain boundary errors (step 3) that are non-blocking (warnings) do not prevent pattern-specific hooks from running. |
| R3 | Common hooks H15–H19 always run after pattern-specific hooks, even if some pattern-specific hooks produced warnings. |
| R4 | `productionEligible` must be `false` if any blocking error code exists, regardless of whether hooks passed. |
| R5 | The deterministic validator must NEVER set `answerStatus = verified` or `answerStatus = human_reviewed`. |
| R6 | Visual-only items must NOT become `computed`, `verified`, or `sourceBacked`. |
| R7 | `sourceBacked` must NEVER be assigned by the deterministic validator. |
| R8 | Runtime-generated valid items may return `computed` but need not be persisted. |
| R9 | `productionEligible = true` requires ALL PG1–PG10 gates to pass. |

---

## 7. Hook-to-Function Mapping

Comprehensive mapping of all 19 S21F hooks to proposed implementation functions.

| S21F Hook | Proposed function | Module path | Input | Output | Blocking errors |
|---|---|---|---|---|---|
| H1 `validateNumericRange` | `validateNumericRange(itemValue, constraint)` | `hooks/validate-numeric-range.js` | Numeric value, NumericRangeConstraint | `{ pass, error? }` | `E_RANGE_OUT_OF_SCOPE` |
| H2 `validateDigitCount` | `validateDigitCount(itemValue, constraint)` | `hooks/validate-digit-count.js` | Numeric value, DigitConstraint | `{ pass, error? }` | `E_FOUR_DIGIT_CONSTRAINT`, `E_INVALID_LEADING_ZERO` |
| H3 `validatePlaceValueDecomposition` | `validatePlaceValueDecomposition(n, parts, constraint)` | `hooks/validate-place-value-decomposition.js` | Four-digit number, decomposition parts, PlaceValueConstraint | `{ pass, error?, computedAnswer? }` | `E_PLACE_VALUE_SUM_MISMATCH` |
| H4 `validatePlaceValueComposition` | `validatePlaceValueComposition(parts, candidate, constraint)` | `hooks/validate-place-value-composition.js` | Place-value parts, candidate composed number, PlaceValueConstraint | `{ pass, error?, computedAnswer? }` | `E_PLACE_VALUE_SUM_MISMATCH` |
| H5 `validateChineseNumberReading` | `validateChineseNumberReading(n, chineseText, constraint)` | `hooks/validate-chinese-number-reading.js` | Numeric value, Chinese reading string, ChineseNumberReadingConstraint | `{ pass, error?, computedAnswer?, warning? }` | `E_CHINESE_NUMERAL_MISMATCH` (warning: `W_CHINESE_NUMERAL_VARIANT`) |
| H6 `validateChineseToNumber` | `validateChineseToNumber(chineseText, candidate, constraint)` | `hooks/validate-chinese-to-number.js` | Chinese wording string, candidate numeric value, ChineseNumberReadingConstraint | `{ pass, error?, computedAnswer? }` | `E_CHINESE_NUMERAL_PARSE`, `E_CHINESE_NUMERAL_AMBIGUOUS` |
| H7 `validateZeroReading` | `validateZeroReading(n, chineseText, zeroRule)` | `hooks/validate-zero-reading.js` | Numeric value with internal zeroes, Chinese reading string, zero rule | `{ pass, error? }` | `E_ZERO_READING_MISMATCH` |
| H8 `validateDigitArrangementMaxMin` | `validateDigitArrangementMaxMin(digits, max, min, constraint)` | `hooks/validate-digit-arrangement-max-min.js` | Digit set, candidate max/min values, DigitConstraint | `{ pass, error?, computedAnswer? }` | `E_DIGIT_ARRANGEMENT_MAX`, `E_DIGIT_ARRANGEMENT_MIN`, `E_INVALID_LEADING_ZERO` |
| H9 `validateFourDigitComparison` | `validateFourDigitComparison(a, b, relation, constraint)` | `hooks/validate-four-digit-comparison.js` | Two values (numerals or Chinese), candidate relation, ComparisonConstraint | `{ pass, error?, computedAnswer? }` | `E_COMPARISON_MISMATCH` |
| H10 `validateSequenceStep` | `validateSequenceStep(values, stepModel, direction, constraint)` | `hooks/validate-sequence-step.js` | Sequence values array, stepModel (mode=place_sequence), direction, SequenceConstraint | `{ pass, error?, computedAnswer? }` | `E_SEQUENCE_STEP_MISMATCH`, `E_STEP_MODEL_INVALID`, `E_SEQUENCE_RANGE_OUT_OF_SCOPE` |
| H11 `validateBetweenNumbersSequence` | `validateBetweenNumbersSequence(endpoints, filledValues, stepModel, constraint)` | `hooks/validate-between-numbers-sequence.js` | Endpoint values, filled values, stepModel (mode=single), SequenceConstraint | `{ pass, error?, computedAnswer? }` | `E_SEQUENCE_STEP_MISMATCH`, `E_STEP_MODEL_INVALID`, `E_SEQUENCE_RANGE_OUT_OF_SCOPE` |
| H12 `validateMoneyTotal` | `validateMoneyTotal(denominations, total, constraint)` | `hooks/validate-money-total.js` | Denomination counts, candidate total, MoneyConstraint | `{ pass, error?, computedAnswer? }` | `E_MONEY_DENOMINATION_INVALID`, `E_MONEY_TOTAL_MISMATCH`, `E_VISUAL_DEPENDENCY_UNSTRUCTURED` |
| H13 `validateMoneyExchange` | `validateMoneyExchange(source, target, count, remainder, constraint)` | `hooks/validate-money-exchange.js` | Source denomination, target denomination, candidate count/remainder, MoneyConstraint | `{ pass, error?, computedAnswer? }` | `E_MONEY_EXCHANGE_MISMATCH`, `E_MONEY_DENOMINATION_INVALID` |
| H14 `validateNumberLineTextFallback` | `validateNumberLineTextFallback(textFallback, position, constraint)` | `hooks/validate-number-line-text-fallback.js` | Number-line text fallback description, candidate position, NumberLineConstraint | `{ pass, error?, computedAnswer?, warning? }` | `E_NUMBERLINE_VISUAL_DEPENDENCY`, `E_NUMBERLINE_POSITION_MISMATCH` (warning: `W_TEXT_FALLBACK_ONLY`) |
| H15 `validateSupportStatusCompatibility` | `validateSupportStatusCompatibility(itemStatus, patternStatus)` | `hooks/validate-support-status-compatibility.js` | Item supportStatus, PatternSpec supportStatus | `{ pass, error? }` | `E_SUPPORT_STATUS_MISMATCH` |
| H16 `validateNoFutureDomainLeakage` | `validateNoFutureDomainLeakage(itemContent)` | `hooks/validate-no-future-domain-leakage.js` | Item content (prompt, answer, description) | `{ pass, error? }` | `E_FUTURE_DOMAIN_LEAKAGE` |
| H17 `validateNoUnsupportedVisualDependency` | `validateNoUnsupportedVisualDependency(item, constraint)` | `hooks/validate-no-unsupported-visual-dependency.js` | Item content, VisualDependencyConstraint | `{ pass, error? }` | `E_VISUAL_DEPENDENCY_UNSTRUCTURED` |
| H18 `validateUniqueAnswer` | `validateUniqueAnswer(itemPrompt, answerModel, constraints)` | `hooks/validate-unique-answer.js` | Item prompt, answer model, constraints | `{ pass, error? }` | `E_ANSWER_NOT_UNIQUE` |
| H19 `validateSourceBoundary` | `validateSourceBoundary(provenance, answerStatus, sourceRefs)` | `hooks/validate-source-boundary.js` | Item provenance, answerStatus, source evidence refs | `{ pass, error? }` | `E_PROVENANCE_STATUS_VIOLATION` |

### 7.1 S21F1 constraints on hook behavior

| Constraint | Hook(s) affected | Implementation rule |
|---|---|---|
| H3 includes digit-value subcase | H3 | Compute `digit × place_value` for prompts like "2 表示多少". |
| H5+H7 compound path | H5, H7 | H5 runs first; if pass, H7 runs on the same Chinese string and numeric value. |
| H13+H12 compound path | H13, H12 | H13 runs first (exchange); if the item also provides a pure total, H12 runs second. |
| H18 is precheck + fallback | H18 | Check for obvious structural ambiguity deterministically; borderline cases return `pass` with warning `W_HUMAN_REVIEW_RECOMMENDED`. |
| H14 visual gate | H14 | Block visual-only items without structured data. |

---

## 8. PatternSpec-to-Validation-Path Mapping

Each of the 12 PatternSpecs maps to a specific validation path. "Primary validation path" follows S21F1 wording.

| patternSpecId | questionKind | supportStatus | primary validation path | hooks in order | expected answerStatus (after pass) | production gate behavior |
|---|---|---|---|---|---|---|
| `spec_pv_4digit_decompose` | `decompose` | `v1NumberSenseSupported` | Place-value decomposition | H1, H2, H3, H15, H16, H17, H18, H19 | `computed` | Eligible (PG1–PG10). No human review required. |
| `spec_pv_4digit_compose` | `compose` | `v1NumberSenseSupported` | Place-value composition | H1, H2, H4, H15, H16, H17, H18, H19 | `computed` | Eligible (PG1–PG10). No human review required. |
| `spec_rw_4digit_number_to_chinese` | `transcode` | `v1NumberSenseSupported` | Chinese number reading + zero check | H1, H2, H5, H7, H15, H16, H17, H18, H19 | `computed` | Eligible (PG1–PG10). No human review required. |
| `spec_rw_4digit_chinese_to_number` | `transcode` | `v1NumberSenseSupported` | Chinese-to-number parsing | H1, H2, H6, H15, H16, H17, H18, H19 | `computed` | Eligible (PG1–PG10). No human review required. |
| `spec_rw_4digit_zero_reading` | `transcode` | `v1NumberSenseSupported` | Chinese number reading + zero check | H1, H2, H5, H7, H15, H16, H17, H18, H19 | `computed` | Eligible (PG1–PG10). No human review required. |
| `spec_seq_4digit_place_step` | `sequence` | `v1NumberSenseSupported` | Place-sequence step validation | H1, H2, H10, H15, H16, H17, H18, H19 | `computed` | Eligible (PG1–PG10). No human review required. |
| `spec_seq_between_two_numbers` | `sequence` | `v1NumberSenseSupported` | Between-numbers fill validation | H1, H2, H11, H15, H16, H17, H18, H19 | `computed` | Eligible (PG1–PG10). No human review required. |
| `spec_cmp_4digit_compare` | `compare` | `v1NumberSenseSupported` | Four-digit comparison | H1, H2, H9, H15, H16, H17, H18, H19 | `computed` | Eligible (PG1–PG10). No human review required. |
| `spec_perm_4digit_max_min_from_digits` | `optimize_from_digits` | `v1NumberSenseSupported` | Digit arrangement max/min | H1, H2, H8, H15, H16, H17, H18, H19 | `computed` | Eligible (PG1–PG10). No human review required. |
| `spec_numline_integer_reading` | `visual_reading` | `v1TextFallbackSupported` | Number-line text-fallback | H1, H2, H14, H15, H16, H17, H18, H19 | `computed` (text-fallback); `blocked_visual_dependency` or `omitted_for_template` (visual-only) | Conditional. Only text-fallback items eligible after human review (PG10). Visual-only items must be blocked. |
| `spec_money_4digit_counting` | `visual_reading` | `v1TextFallbackSupported` | Money total with visual gate | H1, H2, H12, H15, H16, H17, H18, H19 | `computed` (text-fallback); `blocked_visual_dependency` or `to_be_verified` (visual-only) | Conditional. Only text-fallback items eligible after human review (PG10). Visual-only items must be blocked. |
| `spec_money_4digit_payment` | `representation_payment` | `v1TextFallbackSupported` | Money exchange + total validation | H1, H2, H13, H12, H15, H16, H17, H18, H19 | `computed` | Eligible (PG1–PG10). Text-fallback deterministic; no human review required per S21E. Visual dependency without textFallback → blocked. |

---

## 9. Data Model Plan

The following object shapes are proposed for future implementation. These are documentation-only; no JSON files are created.

### 9.1 CandidateItem

```json
{
  "itemId": "string",
  "patternSpecId": "string",
  "curriculumNodeId": "g3a_u01_numbers_within_10000",
  "linkedPatternIds": ["pv_4digit_decompose"],
  "canonicalSkillIds": ["place_value", "number_decomposition"],
  "questionKind": "decompose",
  "supportStatus": "v1NumberSenseSupported",
  "generationMode": "rule_based",
  "difficultyTags": ["basic", "place_value_direct"],
  "prompt": "7063 是 □ 個千、□ 個百、□ 個十、□ 個一，合起來是 □。",
  "candidateAnswer": { "thousands": 7, "hundreds": 0, "tens": 6, "ones": 3, "total": 7063 },
  "answerModelType": "placeValueDecompositionAnswer",
  "constraints": { /* constraint object */ },
  "visualDependency": "none | text_fallback | source_visual",
  "provenance": {
    "generatedFrom": "spec_pv_4digit_decompose",
    "generationMode": "rule_based",
    "randomSeed": 42,
    "generatedAt": "2026-07-01T00:00:00Z"
  },
  "answerStatus": "to_be_verified",
  "sourceBacked": false,
  "runtimeOnly": true,
  "notes": ""
}
```

### 9.2 PatternSpec

See S21E §5.1 for full field definitions. Required fields for validation:

- `patternSpecId`
- `version`
- `curriculumNodeId`
- `questionKind`
- `supportStatus`
- `generationModeDefault`
- `allowedGenerationModes`
- `constraints`
- `answerModel`
- `validatorHooks`
- `sourceMetadata`
- `provenance`
- `runtimeGenerationPolicy`
- `productionStoragePolicy`

### 9.3 ValidationContext

Internal context object passed through the pipeline:

```json
{
  "candidateItem": { /* CandidateItem */ },
  "patternSpec": { /* PatternSpec */ },
  "options": {
    "mode": "strict | lenient",
    "runtimeOnly": true,
    "strictVisual": true
  },
  "pipelineState": {
    "currentStep": 5,
    "structuralPassed": true,
    "domainPassed": true
  },
  "accumulatedErrors": [],
  "accumulatedWarnings": [],
  "hookResults": [],
  "computedAnswer": null,
  "normalizedInput": null
}
```

### 9.4 ValidationResult

See S21F §8 for the full result shape. Exported from `utils/validation-result.js`.

### 9.5 HookResult

Internal shape for each hook execution:

```json
{
  "hookName": "validatePlaceValueDecomposition",
  "passed": true,
  "errorCode": null,
  "warningCode": null,
  "computedAnswer": { "thousands": 7, "hundreds": 0, "tens": 6, "ones": 3, "total": 7063 },
  "normalizedInput": { "originalValue": 7063 },
  "notes": ""
}
```

### 9.6 ProductionGateResult

```json
{
  "eligible": true,
  "failedGates": [],
  "answerStatus": "computed",
  "notes": ""
}
```

---

## 10. Error and Warning Enum Plan

The future implementation must use the 27 blocking error codes and 4 warning codes from S21F1 §9 exactly. No new codes may be added unless a later task explicitly patches S21F.

### 10.1 Implementation rule

Implementation error constants must be **manually generated** from S21F §9, not inferred from test failures.

### 10.2 Proposed constant shape

```javascript
// constants/error-codes.js (proposed, not created)
const ERROR_CODES = {
  E_SCHEMA_REQUIRED_FIELD: 'E_SCHEMA_REQUIRED_FIELD',
  E_PATTERN_UNKNOWN: 'E_PATTERN_UNKNOWN',
  E_PATTERN_HOOK_MISSING: 'E_PATTERN_HOOK_MISSING',
  E_RANGE_OUT_OF_SCOPE: 'E_RANGE_OUT_OF_SCOPE',
  E_FOUR_DIGIT_CONSTRAINT: 'E_FOUR_DIGIT_CONSTRAINT',
  E_INVALID_LEADING_ZERO: 'E_INVALID_LEADING_ZERO',
  E_PLACE_VALUE_SUM_MISMATCH: 'E_PLACE_VALUE_SUM_MISMATCH',
  E_DIGIT_ARRANGEMENT_MAX: 'E_DIGIT_ARRANGEMENT_MAX',
  E_DIGIT_ARRANGEMENT_MIN: 'E_DIGIT_ARRANGEMENT_MIN',
  E_CHINESE_NUMERAL_MISMATCH: 'E_CHINESE_NUMERAL_MISMATCH',
  E_CHINESE_NUMERAL_PARSE: 'E_CHINESE_NUMERAL_PARSE',
  E_CHINESE_NUMERAL_AMBIGUOUS: 'E_CHINESE_NUMERAL_AMBIGUOUS',
  E_ZERO_READING_MISMATCH: 'E_ZERO_READING_MISMATCH',
  E_COMPARISON_MISMATCH: 'E_COMPARISON_MISMATCH',
  E_SEQUENCE_STEP_MISMATCH: 'E_SEQUENCE_STEP_MISMATCH',
  E_SEQUENCE_RANGE_OUT_OF_SCOPE: 'E_SEQUENCE_RANGE_OUT_OF_SCOPE',
  E_STEP_MODEL_INVALID: 'E_STEP_MODEL_INVALID',
  E_MONEY_DENOMINATION_INVALID: 'E_MONEY_DENOMINATION_INVALID',
  E_MONEY_TOTAL_MISMATCH: 'E_MONEY_TOTAL_MISMATCH',
  E_MONEY_EXCHANGE_MISMATCH: 'E_MONEY_EXCHANGE_MISMATCH',
  E_NUMBERLINE_VISUAL_DEPENDENCY: 'E_NUMBERLINE_VISUAL_DEPENDENCY',
  E_NUMBERLINE_POSITION_MISMATCH: 'E_NUMBERLINE_POSITION_MISMATCH',
  E_VISUAL_DEPENDENCY_UNSTRUCTURED: 'E_VISUAL_DEPENDENCY_UNSTRUCTURED',
  E_SUPPORT_STATUS_MISMATCH: 'E_SUPPORT_STATUS_MISMATCH',
  E_FUTURE_DOMAIN_LEAKAGE: 'E_FUTURE_DOMAIN_LEAKAGE',
  E_ANSWER_NOT_UNIQUE: 'E_ANSWER_NOT_UNIQUE',
  E_PROVENANCE_STATUS_VIOLATION: 'E_PROVENANCE_STATUS_VIOLATION',
};
```

Total: **27 blocking error codes**.

### 10.3 Proposed warning constant shape

```javascript
// constants/warning-codes.js (proposed, not created)
const WARNING_CODES = {
  W_CHINESE_NUMERAL_VARIANT: 'W_CHINESE_NUMERAL_VARIANT',
  W_TEXT_FALLBACK_ONLY: 'W_TEXT_FALLBACK_ONLY',
  W_HUMAN_REVIEW_RECOMMENDED: 'W_HUMAN_REVIEW_RECOMMENDED',
  W_RUNTIME_GENERATED_NOT_STORED: 'W_RUNTIME_GENERATED_NOT_STORED',
};
```

Total: **4 warning codes**.

---

## 11. AnswerStatus Enforcement Plan

The implementation must enforce hard rules on which answerStatus values the validator may and may not set.

### 11.1 Allowed assignments (validator may set)

| answerStatus | When to set |
|---|---|
| `computed` | All hooks passed, answer deterministically computed. |
| `to_be_verified` | Visual dependency blocks deterministic computation; item needs human/source verification. |
| `omitted_for_template` | Pattern is a format placeholder with no expected answer. |
| `blocked_visual_dependency` | Visual dependency exists without structured data; deterministic validation not possible. |
| `invalid` | Any hook failed with a blocking error; answer is contract-violating or incorrect. |

### 11.2 Forbidden assignments (validator must NOT set)

| answerStatus | Why forbidden |
|---|---|
| `verified` | Requires source evidence or human review (S21C1 §6.2). Validator alone cannot grant this. |
| `human_reviewed` | Requires human reviewer approval (S21D §4). Validator cannot simulate human judgment. |

### 11.3 Additional rules

| Rule | Description |
|---|---|
| `sourceBacked` must never be assigned by the deterministic validator. | Only items directly visible in source PDF are `sourceBacked` (S21B taxonomy). |
| Runtime-generated valid items may return `computed` but need not be persisted. | Runtime items are transient per S21C1 §5.1. |
| Production eligibility is separate from validationStatus. | An item can have `validationStatus = pass` but `productionEligible = false` if a production gate fails. |

---

## 12. Visual Gating Implementation Plan

Implementation must enforce explicit behavior for the three visual-dependent patterns.

### 12.1 `spec_numline_integer_reading`

| Condition | Behavior |
|---|---|
| Structured tick scale, start, end, and target position provided as data | Use H14 text-fallback path. Compute position deterministically. |
| Visual-only (image/PDF reference, no structured data) | Block with `E_NUMBERLINE_VISUAL_DEPENDENCY`. Set `answerStatus = blocked_visual_dependency` or `omitted_for_template`. |
| Do NOT infer tick scale or position from images. | Visual extraction is out of scope. |

### 12.2 `spec_money_4digit_counting`

| Condition | Behavior |
|---|---|
| Explicit denomination counts provided as structured data | Use H12 to compute total deterministically. |
| Money diagram/image only, no explicit counts | Block with `E_VISUAL_DEPENDENCY_UNSTRUCTURED`. Set `answerStatus = blocked_visual_dependency` or `to_be_verified`. |
| Do NOT count coins or bills from images. | Visual extraction is out of scope. |

### 12.3 `spec_money_4digit_payment`

| Condition | Behavior |
|---|---|
| Text-described denomination quantities | Use H13 + H12 text-fallback deterministic path. Eligible for production storage without human review. |
| Visual dependency without structured data | Block using H17. Set `E_VISUAL_DEPENDENCY_UNSTRUCTURED`. |

### 12.4 General visual gating rule (all patterns)

If H17 detects `requiresVisualRenderer = true` and `textFallbackAvailable = false`, the item must be blocked regardless of pattern. If `textFallbackAvailable = true` but no explicit text fallback is provided in the candidate item, the item must also be blocked.

---

## 13. Chinese Numeral Implementation Plan

A future parser/formatter module is required for H5, H6, and H7. This section defines the planned function signatures and canonical cases. No implementation code is created.

### 13.1 Proposed functions

**`formatChineseNumber(n, options)`**

| Parameter | Meaning |
|---|---|
| `n` | Integer in range 1000–9999. |
| `options.locale` | Must be `"zh-Hant-TW"`. |
| `options.zeroRule` | Must be `"consecutive_zero_single_ling"`. |

Returns a canonical zh-Hant Chinese reading string.

**Required canonical output cases:**

| n | Expected output | Notes |
|---|---|---|
| 5003 | `五千零三` | Two consecutive zeroes → single 零. |
| 5030 | `五千零三十` | Zero in hundreds position. |
| 5100 | `五千一百` | Zero in tens only; no 零 needed (since hundreds=1 is non-zero). |
| 5301 | `五千三百零一` | Standard transcode. |
| 7601 | `七千六百零一` | All positions non-zero except tens. |
| 7060 | `七千零六十` | Zero in hundreds. |
| 7006 | `七千零六` | Two consecutive zeroes → single 零. |

**`parseChineseNumber(text, options)`**

| Parameter | Meaning |
|---|---|
| `text` | Chinese wording string. |
| `options.locale` | Must be `"zh-Hant-TW"`. |
| `options.allowedForms` | Array of accepted form identifiers. |

Returns the numeric value, or an error code:

- `E_CHINESE_NUMERAL_PARSE` if the text cannot be parsed.
- `E_CHINESE_NUMERAL_AMBIGUOUS` if multiple numeric interpretations exist.

**`validateZeroReading(n, text)`**

True/false check: does `text` correctly apply the consecutive-zero-as-single-零 rule for `n`?

### 13.2 Scope constraints

- Support only four-digit numbers (1000–9999).
- Do not support decimals, fractions, or numbers > 9999.
- Do not support non-G3A numeral domains (e.g., 萬, 億).

---

## 14. Sequence Implementation Plan

The implementation must preserve the S21E/S21F `stepModel` structure.

### 14.1 H10: Place-sequence validation

| Aspect | Implementation rule |
|---|---|
| `stepModel.mode` | Must be `"place_sequence"`. |
| Step source | Use `stepModel.steps`, NOT `stepModel.step`. |
| Valid step lists | `[1, 10, 100, 1000]` (forward) or `[-1, -10, -100, -1000]` (backward). |
| Invalid input | If `stepModel` uses `step` instead of `steps` → `E_STEP_MODEL_INVALID`. |
| Range check | Each successive value must stay within declared bounds → else `E_SEQUENCE_RANGE_OUT_OF_SCOPE`. |

### 14.2 H11: Between-numbers sequence validation

| Aspect | Implementation rule |
|---|---|
| `stepModel.mode` | Must be `"single"`. |
| Step source | Use `stepModel.step`, NOT `stepModel.steps`. |
| Step validation | Every adjacent pair in the filled sequence must differ by exactly `stepModel.step`. |
| Invalid input | If `stepModel.mode` is not `"single"` → `E_STEP_MODEL_INVALID`. |
| Uniqueness | Blank positions must be filled with unique values. |

### 14.3 Step model helper

Proposed utility: `sequence-utils.js`

```javascript
// Proposed function signatures (not implemented):
function validateStepModel(stepModel, expectedMode)
// → throws E_STEP_MODEL_INVALID if mode mismatch or required field missing

function computeSequence(start, stepModel, length, direction)
// → returns array of values

function fillBetweenNumbers(start, end, stepModel)
// → returns array of all values including blanks
```

---

## 15. Test Fixture Plan

This section defines future test groups and example fixture shapes. **No actual test files are created.**

### 15.1 Test group catalog

| Group | Goal | Example fixture shape | Expected result | Related hook(s) | Expected error codes |
|---|---|---|---|---|---|
| A. Structural validation | Confirm PS1–PS9 catch malformed PatternSpecs. | PatternSpec missing `validatorHooks`. | `fail` + `E_SCHEMA_REQUIRED_FIELD` | — | `E_SCHEMA_REQUIRED_FIELD`, `E_PATTERN_UNKNOWN`, `E_PATTERN_HOOK_MISSING` |
| B. Domain boundary | Confirm DB1–DB8 catch out-of-scope items. | Item with decimal value `3.5`. | `fail` + `E_FUTURE_DOMAIN_LEAKAGE` | H16 | `E_RANGE_OUT_OF_SCOPE`, `E_FUTURE_DOMAIN_LEAKAGE`, `E_VISUAL_DEPENDENCY_UNSTRUCTURED`, `E_SUPPORT_STATUS_MISMATCH` |
| C. Place value decomposition | Confirm H3 validates decomposition correctly. | `n=7063`, parts: `{thousands:7, hundreds:0, tens:6, ones:3, total:7063}`. | `pass` + `computed` | H3 | `E_PLACE_VALUE_SUM_MISMATCH` |
| D. Digit-value subcase | Confirm H3 handles "2 表示多少". | Prompt asks value of digit 7 in thousands position of 7063. | `computedAnswer = 7000` | H3 | — |
| E. Place value composition | Confirm H4 composes from unordered parts. | Parts: `{ones:8, tens:5, thousands:7}` (no hundreds). | `composed = 7058` | H4 | `E_PLACE_VALUE_SUM_MISMATCH` |
| F. Chinese number reading | Confirm H5 formats 5003 → `五千零三`. | `n=5003`, expected=`五千零三`. | `pass` + `computed` | H5 | `E_CHINESE_NUMERAL_MISMATCH` |
| G. Chinese-to-number | Confirm H6 parses `七千六百零一` → 7601. | `text=七千六百零一`, expected=7601. | `pass` + `computed` | H6 | `E_CHINESE_NUMERAL_PARSE`, `E_CHINESE_NUMERAL_AMBIGUOUS` |
| H. Zero reading | Confirm H7 rejects `五千零零三` for 5003. | `n=5003`, text=`五千零零三`. | `fail` + `E_ZERO_READING_MISMATCH` | H7 | `E_ZERO_READING_MISMATCH` |
| I. Comparison | Confirm H9 validates `6788 < 6877`. | `a=6788, b=6877, relation= "<"`. | `pass` + `computed` | H9 | `E_COMPARISON_MISMATCH` |
| J. Digit arrangement | Confirm H8 computes max/min from `[0,2,5,8]`. | digits=`[0,2,5,8]`, max=8520, min=2058. | `pass` + `computed` | H8 | `E_DIGIT_ARRANGEMENT_MAX`, `E_DIGIT_ARRANGEMENT_MIN`, `E_INVALID_LEADING_ZERO` |
| K. Sequence stepModel | Confirm H10/H11 use stepModel correctly. | place-sequence: start=2985, stepModel `{mode:place_sequence, steps:[1,10,100,1000]}`. | values=`[2986,2996,3096,4096]` | H10, H11 | `E_SEQUENCE_STEP_MISMATCH`, `E_STEP_MODEL_INVALID`, `E_SEQUENCE_RANGE_OUT_OF_SCOPE` |
| L. Money total | Confirm H12 computes total from denominations. | `[{"unit":"張","value":100,"count":5}]` → 500. | `pass` + `computed` | H12 | `E_MONEY_DENOMINATION_INVALID`, `E_MONEY_TOTAL_MISMATCH` |
| M. Money exchange | Confirm H13 computes exchange correctly. | 55×10元 → 100元鈔票, count=5, remainder=50. | `pass` + `computed` | H13 | `E_MONEY_EXCHANGE_MISMATCH` |
| N. Number-line textFallback | Confirm H14 validates structured data. | Tick spacing=100, start=0, end=10000, target=3700. | `pass` + `computed` | H14 | `E_NUMBERLINE_VISUAL_DEPENDENCY`, `E_NUMBERLINE_POSITION_MISMATCH` |
| O. Visual dependency blocking | Confirm H17 blocks visual-only items. | Money counting item with no explicit counts, has `source_visual` dependency. | `fail` + `blocked_visual_dependency` | H17, H12 | `E_VISUAL_DEPENDENCY_UNSTRUCTURED` |
| P. AnswerStatus enforcement | Confirm validator does not set `verified`. | Any item passing all hooks. | `answerStatus = computed`, never `verified`. | — | — |
| Q. Production gate | Confirm PG1–PG10 when `humanReviewRequired = true`. | Item passes validation but PatternSpec requires human review. | `productionEligible = false` until human review (PG10). | — | — |
| R. Provenance/source boundary | Confirm H19 rejects false `sourceBacked`. | AI-generated item claims `sourceBacked = true`. | `fail` + `E_PROVENANCE_STATUS_VIOLATION` | H19 | `E_PROVENANCE_STATUS_VIOLATION` |

---

## 16. Implementation Sequencing

Future implementation stages use G3A U01 as the pilot unit. These are **first-framework staging tasks**, not a template to repeat for every curriculum node.

| Stage | Proposed task name | Scope |
|---|---|---|
| S21H | `S21H_GlobalValidatorCoreInfrastructure` | Global core constants (`error-codes.js`, `warning-codes.js`, `answer-status.js`, `support-status.js`), validation result helpers (`validation-result.js`), structural validator (`validate-pattern-spec.js`), domain boundary validator (`validate-domain-boundary.js`). Answer status enforcement module. H1, H2, H15, H16, H17, H18, H19 core hooks. |
| S21I | `S21I_NumberSensePlugin_PlaceValueAndComparison` | Number-sense plugin hooks: H3 (`validatePlaceValueDecomposition` with digit-value subcase), H4 (`validatePlaceValueComposition`), H8 (`validateDigitArrangementMaxMin`), H9 (`validateFourDigitComparison`). Utility modules: `normalize-number.js`. |
| S21J | `S21J_NumberSensePlugin_ChineseNumerals` | Chinese numeral hooks: H5 (`validateChineseNumberReading`), H6 (`validateChineseToNumber`), H7 (`validateZeroReading`). Utility modules: `parse-chinese-number.js`, `format-chinese-number.js`. |
| S21K | `S21K_NumberSensePlugin_Sequences` | Sequence hooks: H10 (`validateSequenceStep` — place-sequence), H11 (`validateBetweenNumbersSequence` — single-step). Utility module: `sequence-utils.js`. StepModel enforcement preserved. |
| S21L | `S21L_NumberSensePlugin_MoneyAndNumberLineTextFallback` | Money hooks: H12 (`validateMoneyTotal`), H13 (`validateMoneyExchange`). Number-line hook: H14 (`validateNumberLineTextFallback`). Utility modules: `normalize-money-denominations.js`. Visual blocking behavior preserved. |
| S21M | `S21M_ValidationPipelineAndG3AU01PatternPackIntegration` | Global pipeline orchestrator (`validation-pipeline.js`), plugin hook resolver, production gate validator (`validate-production-gate.js`). G3A U01 pattern pack integration (`pattern-specs.js`, `validation-paths.js`). End-to-end `validateG3AU01Item()` entry point. |
| S21N | `S21N_ValidatorFrameworkAndG3AU01PilotTests` | Tests for global core, number-sense plugin, and G3A U01 pattern pack (18 test groups A–R). No future-domain tests. |

---

## 17. Non-Goals

S21G explicitly does **not**:

| # | Non-goal |
|---|---|
| 1 | Implement validator code. |
| 2 | Create tests or test fixtures. |
| 3 | Generate GeneratedItem or LiteracyItem JSON. |
| 4 | Create worksheets or worksheet assets. |
| 5 | Inspect or OCR source PDFs. |
| 6 | Add validators for fractions, decimals, geometry, rate, speed, area, volume, probability, algebra, or negative numbers. |
| 7 | Add a visual renderer or image extraction capability. |
| 8 | Create student wrong-answer analytics or grading logic. |
| 9 | Modify S21B, S21C, S21D, S21E, or S21F policy semantics. |
| 10 | Modify `src/`, `site/`, `tests/`, `package.json`, `package-lock.json`, schema files, deployment files, or generated worksheet output. |

---

## 18. QA Checklist

| # | Criterion | Status |
|---|---|---|
| QA1 | All 12 PatternSpecs included in validation path mapping. | ✓ |
| QA2 | All H1–H19 hooks mapped to proposed functions and module paths. | ✓ |
| QA3 | S21F1 constraints preserved: H3 digit-value subcase, H5+H7 compound, H13+H12 compound, H18 precheck+fallback. | ✓ |
| QA4 | 27 blocking error codes preserved from S21F1 §9.1. | ✓ |
| QA5 | 4 warning codes preserved from S21F1 §9.2. | ✓ |
| QA6 | AnswerStatus rules preserved: validator may set 5 values, must not set `verified`/`human_reviewed`. | ✓ |
| QA7 | Visual gating preserved: `numline_integer_reading` and `money_4digit_counting` remain gated; `money_4digit_payment` text-fallback deterministic. | ✓ |
| QA8 | `stepModel` structure preserved: H10 uses `steps`/`place_sequence`, H11 uses `step`/`single`. | ✓ |
| QA9 | Runtime vs permanent storage distinction preserved. | ✓ |
| QA10 | Pipeline order defined with inter-dependency rules (R1–R9). | ✓ |
| QA11 | Test fixture plan defined with 18 groups (A–R), no actual tests created. | ✓ |
| QA12 | Implementation sequencing defined across 7 stages (S21H–S21N). | ✓ |
| QA13 | Chinese numeral plan includes canonical cases for 5003, 5030, 5100, 5301. | ✓ |
| QA14 | No code modified. | ✓ |
| QA15 | No tests created. | ✓ |
| QA16 | No generated data created. | ✓ |
| QA17 | No source PDFs touched. | ✓ |
| QA18 | Created file: `docs/curriculum/mapping/S21G_G3A_U01_DeterministicValidatorImplementationPlan.md`. | ✓ |

---

## Appendix A: Cross-Reference — S21F Hook Mapping

| S21F Hook | S21G section |
|---|---|
| H1 `validateNumericRange` | §7 (hook-to-function), §12 (visual gating) |
| H2 `validateDigitCount` | §7 |
| H3 `validatePlaceValueDecomposition` | §7, §7.1 (digit-value subcase) |
| H4 `validatePlaceValueComposition` | §7 |
| H5 `validateChineseNumberReading` | §7, §7.1 (H5+H7 compound), §13 (Chinese numeral plan) |
| H6 `validateChineseToNumber` | §7, §13 |
| H7 `validateZeroReading` | §7, §7.1 (H5+H7 compound), §13 |
| H8 `validateDigitArrangementMaxMin` | §7 |
| H9 `validateFourDigitComparison` | §7 |
| H10 `validateSequenceStep` | §7, §14 (sequence plan) |
| H11 `validateBetweenNumbersSequence` | §7, §14 |
| H12 `validateMoneyTotal` | §7, §7.1 (H13+H12 compound), §12 |
| H13 `validateMoneyExchange` | §7, §7.1 (H13+H12 compound), §12 |
| H14 `validateNumberLineTextFallback` | §7, §12 |
| H15 `validateSupportStatusCompatibility` | §7 |
| H16 `validateNoFutureDomainLeakage` | §7 |
| H17 `validateNoUnsupportedVisualDependency` | §7, §12 |
| H18 `validateUniqueAnswer` | §7, §7.1 (precheck+fallback) |
| H19 `validateSourceBoundary` | §7 |

## Appendix B: Cross-Reference — S21F1 Constraints Preserved

| Constraint | S21G section |
|---|---|
| H3 digit-value subcase (`digit × place_value`) | §7.1, §15 group D |
| H5+H7 compound validation path | §7.1, §8 |
| H13+H12 compound validation path | §7.1, §8 |
| H18 deterministic precheck + human-review fallback | §7.1 |
| 27 blocking error codes (not 28) | §10 |
| QA10 "primary validation path" (not "single hook") | §8 |
| PG10 allows `verified` or `human_reviewed` | §11, §15 group Q |