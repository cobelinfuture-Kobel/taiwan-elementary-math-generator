# S21F G3A U01 Deterministic Validator Contract

## Document Status

- Task scope: documentation / contract only
- Production impact: no validator code, generator code, GeneratedItem JSON, LiteracyItem JSON, or worksheet assets are created by this task
- Purpose: define the deterministic validator contract for G3A U01 "1萬以內的數／數到1萬" PatternSpecs — what a future validator must check before any candidate item can be stored, marked `computed`, or promoted into production use
- Reference mapping: `S21B_G3A_U01_10000Numbers_FormalPatternMapping.md`
- Reference policy: `S21C_G3A_U01_AIItemGenerationAndStoragePolicy.md` (S21C1)
- Reference policy: `S21D_G3A_U01_LiteracyItemRecursiveImprovementPolicy.md`
- Reference schema: `S21E_G3A_U01_PatternSpecSchemaAndSeedDesign.md` (S21E1 consistency patch)
- QA patch: `S21F1 ReadbackQA and Minor Contract Tightening` (included below)

---

## 1. Purpose

S21F is the **deterministic validator contract** for G3A U01. It specifies:

- What a deterministic validator must check.
- What input each validator hook expects.
- What answer model shape each hook validates.
- What answerStatus each hook may set.
- What error codes and warnings each hook may emit.
- When a candidate item is production eligible.
- When a visual dependency blocks deterministic validation.

S21F explicitly does **not**:

- Implement validator code.
- Implement generator code.
- Generate item banks.
- Create production GeneratedItem or LiteracyItem JSON.
- Create worksheets or worksheet templates.
- Inspect or OCR source PDFs.
- Promote visual items to `verified` without human review.
- Add validators for fractions, decimals, geometry, rate, speed, area, volume, probability, algebra, or negative numbers.
- Modify S21B, S21C, S21D, or S21E policy semantics.

---

## 2. Scope

S21F covers all 12 G3A U01 PatternSpecs defined in S21E §9:

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

## 3. Inputs and Dependencies

S21F depends on the following existing artifacts:

| Artifact | Role |
|---|---|
| `S21B_G3A_U01_10000Numbers_FormalPatternMapping` | Defines QuestionPatterns, ExampleItems, source evidence, and visual-gating rules. |
| `S21C_G3A_U01_AIItemGenerationAndStoragePolicy` (S21C1) | Defines `computed` vs `verified`, production gates G1–G8, validator checks V1–V12, AI rules, and runtime vs production storage distinction. |
| `S21D_G3A_U01_LiteracyItemRecursiveImprovementPolicy` | Defines LiteracyItem lifecycle, L1–L10 checks, human review rubric, semantic drift control, and answerStatus rules for recursive improvement. Not modified by S21F. |
| `S21E_G3A_U01_PatternSpecSchemaAndSeedDesign` (S21E1) | Defines PatternSpec schema fields, constraint model, answer model types, validator hook naming contract (H1–H19), 12-pattern seed table, runtime generation policy, and production storage promotion policy. |

---

## 4. Validator Contract Layers

The deterministic validator is organized as three contract layers, each building on the previous.

### 4A. PatternSpec Structural Validation

Before any semantic check, the validator must confirm the PatternSpec itself is structurally valid.

| Check | Requirement |
|---|---|
| PS1 | All required PatternSpec fields are present (per S21E §5.1). |
| PS2 | `patternSpecId` is a known, valid identifier. |
| PS3 | `questionKind` is one of the 8 valid kinds from S21B §6. |
| PS4 | `supportStatus` is one of `v1NumberSenseSupported`, `v1TextFallbackSupported`, or other valid values from S21E §13. |
| PS5 | `generationModeDefault` is compatible with `questionKind` and `allowedGenerationModes`. |
| PS6 | `constraints` object contains at least one recognized constraint group from S21E §6. |
| PS7 | `answerModel.answerModelType` matches one of the 11 defined types from S21E §7. |
| PS8 | `validatorHooks` is non-empty and each hook name is recognized from S21E §8. |
| PS9 | `sourceMetadata` and `provenance` fields are present per S21E §14. |

**Error codes for structural failures:**

| Code | Meaning |
|---|---|
| `E_SCHEMA_REQUIRED_FIELD` | A required PatternSpec field is missing. |
| `E_PATTERN_UNKNOWN` | `patternSpecId` is not recognized. |
| `E_PATTERN_HOOK_MISSING` | No validator hooks are declared for the pattern. |

### 4B. Domain Boundary Validation

Every candidate item must pass domain boundary checks before pattern-specific validation.

| Check | Requirement | Source |
|---|---|---|
| DB1 | All numeric values are within allowed range (per pattern `NumericRangeConstraint`). | S21C V2 |
| DB2 | No decimal values are present in the item. | S21C V11 |
| DB3 | No fractions are present. | S21C V11 |
| DB4 | No geometry formulas or area/volume calculations are present. | S21C V11 |
| DB5 | No speed, rate, or time-distance calculations are present. | S21C V11 |
| DB6 | No probability, statistics, algebra, or negative numbers are present. | S21C V11 |
| DB7 | No unsupported visual dependency is present without textFallback or explicit gating. | S21C V10 |
| DB8 | The item's `supportStatus` does not exceed the parent PatternSpec's `supportStatus`. | S21C V9 |

**Error codes for domain boundary failures:**

| Code | Meaning |
|---|---|
| `E_RANGE_OUT_OF_SCOPE` | Numeric value is outside the pattern's allowed range. |
| `E_FUTURE_DOMAIN_LEAKAGE` | Item introduces fractions, decimals, geometry, speed, probability, algebra, or negative numbers. |
| `E_VISUAL_DEPENDENCY_UNSTRUCTURED` | Visual dependency exists without textFallback or explicit gating. |
| `E_SUPPORT_STATUS_MISMATCH` | Item's supportStatus exceeds the parent PatternSpec's supportStatus. |

### 4C. Pattern-Specific Semantic Validation

After structural and domain checks pass, the item must pass the pattern-specific validator hook(s). See §5–§7 for detailed per-hook contracts.

---

## 5. Validator Hook Contracts

### 5.1 Hook naming and mapping

S21F uses the validator hook names defined in S21E §8. Each hook maps to one or more PatternSpecs. Hooks H1, H2, H15, H16, H17, H18, H19 are common to all patterns. Hooks H3–H14 are pattern-specific.

| Hook | Primary PatternSpec(s) | Type |
|---|---|---|
| H1 `validateNumericRange` | All | Structural / domain |
| H2 `validateDigitCount` | All with numeric values | Structural / domain |
| H3 `validatePlaceValueDecomposition` | `spec_pv_4digit_decompose` | Pattern-specific |
| H4 `validatePlaceValueComposition` | `spec_pv_4digit_compose` | Pattern-specific |
| H5 `validateChineseNumberReading` | `spec_rw_4digit_number_to_chinese`, `spec_rw_4digit_zero_reading` | Pattern-specific |
| H6 `validateChineseToNumber` | `spec_rw_4digit_chinese_to_number` | Pattern-specific |
| H7 `validateZeroReading` | `spec_rw_4digit_number_to_chinese`, `spec_rw_4digit_zero_reading` | Pattern-specific |
| H8 `validateDigitArrangementMaxMin` | `spec_perm_4digit_max_min_from_digits` | Pattern-specific |
| H9 `validateFourDigitComparison` | `spec_cmp_4digit_compare` | Pattern-specific |
| H10 `validateSequenceStep` | `spec_seq_4digit_place_step` | Pattern-specific |
| H11 `validateBetweenNumbersSequence` | `spec_seq_between_two_numbers` | Pattern-specific |
| H12 `validateMoneyTotal` | `spec_money_4digit_counting`, `spec_money_4digit_payment` | Pattern-specific |
| H13 `validateMoneyExchange` | `spec_money_4digit_payment` | Pattern-specific |
| H14 `validateNumberLineTextFallback` | `spec_numline_integer_reading` | Pattern-specific |
| H15 `validateSupportStatusCompatibility` | All | Structural / domain |
| H16 `validateNoFutureDomainLeakage` | All | Domain boundary |
| H17 `validateNoUnsupportedVisualDependency` | All with visual dependency | Domain boundary |
| H18 `validateUniqueAnswer` | All | Structural / domain |
| H19 `validateSourceBoundary` | All | Structural / domain |

---

## 6. Per-Hook Contract Specifications

### H1 — validateNumericRange

| Aspect | Specification |
|---|---|
| **Input contract** | A numeric value from the candidate item, plus the `NumericRangeConstraint` from the parent PatternSpec. |
| **Validation logic** | The value must be ≥ `minValue`, ≤ `maxValue`, and satisfy `allowZero`, `allowNegative`, and `integerOnly` constraints. |
| **Output** | `pass` or `fail` + error code `E_RANGE_OUT_OF_SCOPE`. |
| **Deterministic computability** | Yes — range check is purely arithmetic. |
| **Allowed answerStatus after pass** | `computed` |
| **Blocked conditions** | Value outside range. |

### H2 — validateDigitCount

| Aspect | Specification |
|---|---|
| **Input contract** | A numeric value from the candidate item, plus the `DigitConstraint` from the parent PatternSpec. |
| **Validation logic** | The number of digits must match `digitCount`. If `allowLeadingZero = false`, the first digit must not be 0. |
| **Output** | `pass` or `fail` + error code `E_FOUR_DIGIT_CONSTRAINT` or `E_INVALID_LEADING_ZERO`. |
| **Deterministic computability** | Yes. |
| **Allowed answerStatus after pass** | `computed` |

### H3 — validatePlaceValueDecomposition

| Aspect | Specification |
|---|---|
| **Input contract** | A four-digit number `n`, plus decomposition values `thousands`, `hundreds`, `tens`, `ones`, and `total`. |
| **Validation logic** | `n = thousands × 1000 + hundreds × 100 + tens × 10 + ones`. The `total` must equal `n`. Each place-value part must be a valid digit (0–9). The `thousands` digit must be ≥ 1 for a valid four-digit number unless the pattern explicitly allows values below 1000. **Digit-value prompts** (e.g., "2 表示多少" or "7 表示多少") asking what a specific digit in a given position is worth are handled as a subcase of this hook: the digit's positional value is computed as `digit × place_value` (e.g., 7 in thousands position → 7000). |
| **Output** | `pass` or `fail` + error code `E_PLACE_VALUE_SUM_MISMATCH`. |
| **Deterministic computability** | Yes. |
| **Allowed answerStatus after pass** | `computed` |
| **PatternSpec** | `spec_pv_4digit_decompose` |
| **answerModel** | `placeValueDecompositionAnswer` per S21E §7.2 |

### H4 — validatePlaceValueComposition

| Aspect | Specification |
|---|---|
| **Input contract** | Place-value parts (thousands, hundreds, tens, ones) and a composed candidate number. |
| **Validation logic** | `composed = thousands × 1000 + hundreds × 100 + tens × 10 + ones`. The result must be within the pattern's numeric range. Parts may be given in any order (`unordered_place_parts` composition mode). If a place is omitted, it is treated as 0. Non-canonical units (e.g., 13 tens) must be normalized to equivalent value before comparison if the PatternSpec allows such input. |
| **Output** | `pass` or `fail` + error code `E_PLACE_VALUE_SUM_MISMATCH`. |
| **Deterministic computability** | Yes. |
| **Allowed answerStatus after pass** | `computed` |
| **PatternSpec** | `spec_pv_4digit_compose` |
| **answerModel** | `placeValueCompositionAnswer` per S21E §7.3 |

### H5 — validateChineseNumberReading

| Aspect | Specification |
|---|---|
| **Input contract** | A numeric value and a Chinese reading string. |
| **Validation logic** | The Chinese reading must follow Taiwan G3A zh-Hant convention. For numbers 1000–9999: 千–百–十–個 structure. Internal zeroes must use the consecutive-zero-as-single-零 rule (e.g., 5003 → `五千零三`, not `五千零零三`). Edge cases: 5030 → `五千零三十`, 5100 → `五千一百`. The output must be a single canonical form. Accepted variants, if any, must be declared in the PatternSpec `chineseNumberReading.allowedForms`. |
| **Output** | `pass` or `fail` + error code `E_CHINESE_NUMERAL_MISMATCH`. Warning `W_CHINESE_NUMERAL_VARIANT` if a non-canonical but accepted variant is used. |
| **Deterministic computability** | Yes — Chinese reading is deterministically computable from the numeric value given the zero rule. |
| **Allowed answerStatus after pass** | `computed` (not `verified`) |
| **PatternSpec(s)** | `spec_rw_4digit_number_to_chinese`, `spec_rw_4digit_zero_reading` |
| **answerModel** | `chineseNumberAnswer` per S21E §7.4 |

### H6 — validateChineseToNumber

| Aspect | Specification |
|---|---|
| **Input contract** | A Chinese wording string and a candidate numeric value. |
| **Validation logic** | Parse the Chinese string to a numeric value following Taiwan G3A convention. Accept canonical forms only unless the PatternSpec explicitly allows additional forms. Reject ambiguous or non-canonical strings. The parsed numeric value must match the candidate answer. |
| **Output** | `pass` or `fail` + error code `E_CHINESE_NUMERAL_PARSE` or `E_CHINESE_NUMERAL_AMBIGUOUS`. |
| **Deterministic computability** | Yes — parsing is deterministic given the allowed forms. |
| **Allowed answerStatus after pass** | `computed` |
| **PatternSpec** | `spec_rw_4digit_chinese_to_number` |
| **answerModel** | `scalarNumberAnswer` per S21E §7.1 |

### H7 — validateZeroReading

| Aspect | Specification |
|---|---|
| **Input contract** | A numeric value containing internal zeroes and a Chinese reading string. |
| **Validation logic** | The consecutive-zero-as-single-零 rule must be applied. For each group of consecutive internal zeroes, exactly one `零` must appear. The zero pattern must match Taiwan G3A convention: 5003 → `五千零三` (two consecutive zeroes → one 零); 5030 → `五千零三十` (zero in hundreds only); 5100 → `五千一百` (zero in tens only, no 零 needed because tens is followed only by zero and no non-zero ones digit follows — actually 5100 = 5千1百, no zero reading needed since hundreds is non-zero). |
| **Output** | `pass` or `fail` + error code `E_ZERO_READING_MISMATCH`. |
| **Deterministic computability** | Yes. |
| **Allowed answerStatus after pass** | `computed` |
| **PatternSpec(s)** | `spec_rw_4digit_number_to_chinese`, `spec_rw_4digit_zero_reading` |
| **answerModel** | `chineseNumberAnswer` per S21E §7.4 |

### H8 — validateDigitArrangementMaxMin

| Aspect | Specification |
|---|---|
| **Input contract** | A set of digits (e.g., `[0, 2, 5, 8]`) and candidate `max` and `min` values. |
| **Validation logic** | **Max:** Sort digits descending; the result is the largest possible four-digit number. **Min:** Sort digits ascending; the smallest non-zero digit must be placed in the thousands place; if zero is among the digits, it occupies the next positions. Leading zero is not allowed for a four-digit number. If the PatternSpec requires digits not to repeat, duplicate digits in input must be rejected. If the input contains more or fewer than 4 digits, the PatternSpec constraint must define the rule. |
| **Output** | `pass` or `fail` + error code `E_DIGIT_ARRANGEMENT_MAX` or `E_DIGIT_ARRANGEMENT_MIN` or `E_INVALID_LEADING_ZERO`. |
| **Deterministic computability** | Yes — max/min by digit permutation is deterministic. |
| **Allowed answerStatus after pass** | `computed` |
| **PatternSpec** | `spec_perm_4digit_max_min_from_digits` |
| **answerModel** | `maxMinDigitArrangementAnswer` per S21E §7.7 |

### H9 — validateFourDigitComparison

| Aspect | Specification |
|---|---|
| **Input contract** | Two values (A, B) as numerals or Chinese readings, and a candidate relational operator (`<`, `>`, `=`). |
| **Validation logic** | Normalize both sides to numeric values. If either side is a Chinese reading, apply H6 parsing rules. Compare the numeric values. The candidate relation must match. If `mixedRepresentationAllowed` is true (per ComparisonConstraint), mixed numeral/Chinese pairs are valid; otherwise reject. |
| **Output** | `pass` or `fail` + error code `E_COMPARISON_MISMATCH`. |
| **Deterministic computability** | Yes — comparison is deterministic after normalization. |
| **Allowed answerStatus after pass** | `computed` |
| **PatternSpec** | `spec_cmp_4digit_compare` |
| **answerModel** | `comparisonAnswer` per S21E §7.5 |

### H10 — validateSequenceStep (place-sequence)

| Aspect | Specification |
|---|---|
| **Input contract** | Sequence values array, `stepModel` with `mode = "place_sequence"`, direction, and SequenceConstraint from PatternSpec. |
| **Validation logic** | Each successive value must differ from the previous by the step declared in `stepModel.steps`. For place-sequence: the step list is `[1, 10, 100, 1000]` (forward) or `[-1, -10, -100, -1000]` (backward). The resulting values must stay within the declared bounds. The number of values must equal the declared `length`. The `stepModel.mode` must be `place_sequence`. Reject if `stepModel` uses `step` instead of `steps` for this mode. |
| **Output** | `pass` or `fail` + error code `E_SEQUENCE_STEP_MISMATCH` or `E_STEP_MODEL_INVALID` or `E_SEQUENCE_RANGE_OUT_OF_SCOPE`. |
| **Deterministic computability** | Yes — sequence generation from a starting value and step list is deterministic. |
| **Allowed answerStatus after pass** | `computed` |
| **PatternSpec** | `spec_seq_4digit_place_step` |
| **answerModel** | `sequenceAnswer` with `stepModel.mode = "place_sequence"` per S21E §7.6 |

### H11 — validateBetweenNumbersSequence

| Aspect | Specification |
|---|---|
| **Input contract** | Sequence values array, `stepModel` with `mode = "single"`, direction, and SequenceConstraint from PatternSpec. Endpoint values and filled values. |
| **Validation logic** | Every adjacent pair in the filled sequence must differ by exactly `stepModel.step`. The `stepModel.mode` must be `"single"`. All values must stay within the declared bounds. Blank positions must be filled with unique values. |
| **Output** | `pass` or `fail` + error code `E_SEQUENCE_STEP_MISMATCH` or `E_STEP_MODEL_INVALID` or `E_SEQUENCE_RANGE_OUT_OF_SCOPE`. |
| **Deterministic computability** | Yes — between-numbers fill with a declared step is deterministic. |
| **Allowed answerStatus after pass** | `computed` |
| **PatternSpec** | `spec_seq_between_two_numbers` |
| **answerModel** | `sequenceAnswer` with `stepModel.mode = "single"` per S21E §7.6 |

### H12 — validateMoneyTotal

| Aspect | Specification |
|---|---|
| **Input contract** | Denomination counts (e.g., `[{"unit": "張", "value": 100, "count": 5}]`), a candidate total, and MoneyConstraint from PatternSpec. |
| **Validation logic** | `total = Σ (denomination.value × count)`. The total must be within `totalMax`. Only denominations listed in `allowedDenominations` may appear. The total must match the candidate answer. |
| **Visual dependency rule** | If the candidate item derives its denomination counts from a visual money diagram without explicit structured data, the item cannot be deterministically validated. The item must be blocked with `E_VISUAL_DEPENDENCY_UNSTRUCTURED` and answerStatus must remain `to_be_verified` or `blocked_visual_dependency`. |
| **Output** | `pass` or `fail` + error code `E_MONEY_DENOMINATION_INVALID` or `E_MONEY_TOTAL_MISMATCH` or `E_VISUAL_DEPENDENCY_UNSTRUCTURED`. |
| **Deterministic computability** | Yes — when denomination counts are explicit. No — when counts require visual extraction. |
| **Allowed answerStatus after pass** | `computed` (text-fallback items only). `blocked_visual_dependency` for visual-only items. |
| **PatternSpec(s)** | `spec_money_4digit_counting`, `spec_money_4digit_payment` |
| **answerModel** | `moneyTotalAnswer` per S21E §7.8 |

### H13 — validateMoneyExchange

| Aspect | Specification |
|---|---|
| **Input contract** | Source denomination count, target denomination, candidate exchange count, optional remainder, and MoneyConstraint. |
| **Validation logic** | `source_total = source.count × source.value`. `exchange_count = floor(source_total / target.value)`. `remainder_value = source_total - exchange_count × target.value`. If `remainderAllowed = false`, remainder must be 0. The candidate exchange count and remainder must match. Only denominations from `allowedDenominations` may appear. |
| **Output** | `pass` or `fail` + error code `E_MONEY_EXCHANGE_MISMATCH` or `E_MONEY_DENOMINATION_INVALID`. |
| **Deterministic computability** | Yes. |
| **Allowed answerStatus after pass** | `computed` |
| **PatternSpec** | `spec_money_4digit_payment` |
| **answerModel** | `moneyExchangeAnswer` per S21E §7.9 |

### H14 — validateNumberLineTextFallback

| Aspect | Specification |
|---|---|
| **Input contract** | A number-line text fallback description containing explicit numeric scale, tick interval, start value, end value, and target position or movement, plus a candidate position value. |
| **Validation logic** | **Text-fallback path:** If the item provides explicit tick spacing, start, end, and target position as structured data, the validator computes the expected position deterministically and compares it to the candidate answer. **Visual-only path:** If the item references a number-line image or PDF visual without explicit structured data, the validator must block the item. Do not infer tick scale or position from PDF visuals. |
| **Output** | `pass` or `fail` + error code `E_NUMBERLINE_VISUAL_DEPENDENCY` or `E_NUMBERLINE_POSITION_MISMATCH`. Warning `W_TEXT_FALLBACK_ONLY`. |
| **Deterministic computability** | Yes — when structured data is provided. No — when visual-only. |
| **Allowed answerStatus after pass** | `computed` (text-fallback items only). `blocked_visual_dependency` or `omitted_for_template` for visual-only items. |
| **PatternSpec** | `spec_numline_integer_reading` |
| **answerModel** | `numberLinePositionAnswer` per S21E §7.10, or `omittedTemplateAnswer` per S21E §7.11 |

### H15–H19: Common Hooks

#### H15 — validateSupportStatusCompatibility

| Aspect | Specification |
|---|---|
| **Input** | Item `supportStatus`, parent PatternSpec `supportStatus`. |
| **Validation** | Item must not claim `v1NumberSenseSupported` if parent is `v1TextFallbackSupported`. |
| **Output** | `pass` / `fail` + `E_SUPPORT_STATUS_MISMATCH`. |
| **Deterministic** | Yes. |

#### H16 — validateNoFutureDomainLeakage

| Aspect | Specification |
|---|---|
| **Input** | Item content (prompt, answer, description). |
| **Validation** | No fractions, decimals, geometry, speed, area, volume, probability, algebra, or negative numbers may appear. |
| **Output** | `pass` / `fail` + `E_FUTURE_DOMAIN_LEAKAGE`. |
| **Deterministic** | Yes — keyword and structure check. |

#### H17 — validateNoUnsupportedVisualDependency

| Aspect | Specification |
|---|---|
| **Input** | Item content, `VisualDependencyConstraint` from PatternSpec. |
| **Validation** | If `requiresVisualRenderer = true` and `textFallbackAvailable = false`, block the item. If `textFallbackAvailable = true` but the item provides no explicit text fallback, block the item. |
| **Output** | `pass` / `fail` + `E_VISUAL_DEPENDENCY_UNSTRUCTURED`. |
| **Deterministic** | Yes — gating check. |

#### H18 — validateUniqueAnswer

| Aspect | Specification |
|---|---|
| **Input** | Item prompt, answer model, constraints. |
| **Validation** | The item must have exactly one unambiguous correct answer. Multiple interpretations that yield different correct answers = fail. |
| **Output** | `pass` / `fail` + `E_ANSWER_NOT_UNIQUE`. |
| **Deterministic computability** | No — this is **a deterministic precheck plus human-review fallback gate**, not a fully deterministic semantic validator. The validator checks for obvious structural ambiguity (e.g., multiple mathematically distinct answers); borderline cases are escalated to human review. |

#### H19 — validateSourceBoundary

| Aspect | Specification |
|---|---|
| **Input** | Item `provenance`, `answerStatus`, source evidence references. |
| **Validation** | Item must not claim `sourceBacked` unless linked to a verified S21B ExampleItem. Item must not claim `verified` unless source evidence or human review exists. AI-generated items must not claim `sourceBacked`. |
| **Output** | `pass` / `fail` + `E_PROVENANCE_STATUS_VIOLATION`. |
| **Deterministic** | Yes — provenance check. |

---

## 7. Answer Status Contract

The validator must respect the following answerStatus semantics from S21C1 §6.2 and S21D §13.

| answerStatus | Meaning | Who assigns? | Validator may set? |
|---|---|---|---|
| `verified` | Answer confirmed by source evidence or human review. | Human reviewer / source evidence | **No** — deterministic validator alone must never set `verified`. |
| `computed` | Answer produced by deterministic generator logic and passed the deterministic validator. | Validator | **Yes** — validator outputs `computed` after pass. |
| `to_be_verified` | Answer is believed correct but awaits human or source verification. | Human / system default | **Yes** — validator may set when it cannot deterministically verify (e.g., visual dependency). |
| `omitted_for_template` | Answer intentionally omitted; item serves as format placeholder only. | System / human | **Yes** — for template items. |
| `human_reviewed` | Answer has passed human review. | Human reviewer | **No** — validator must never set this. |
| `blocked_visual_dependency` | Cannot be deterministically validated because required visual information is not represented as structured data. | Validator | **Yes** — validator sets when visual dependency blocks computation. |
| `invalid` | Contract violation or incorrect answer. | Validator | **Yes** — validator sets on failure. |

---

## 8. Validation Result Object Contract

This is an illustrative shape only. No actual JSON files are created.

```json
{
  "validationStatus": "pass | fail | warning",
  "answerStatus": "computed | to_be_verified | omitted_for_template | blocked_visual_dependency | invalid",
  "validatorHook": "validatePlaceValueDecomposition",
  "patternSpecId": "spec_pv_4digit_decompose",
  "computedAnswer": {
    "thousands": 7,
    "hundreds": 0,
    "tens": 6,
    "ones": 3,
    "total": 7063
  },
  "normalizedInput": {
    "originalValue": 7063
  },
  "errorCodes": [],
  "warnings": [],
  "productionEligible": true,
  "notes": ""
}
```

**Field meanings:**

| Field | Meaning |
|---|---|
| `validationStatus` | Overall validation result. `pass` = all checks passed. `fail` = at least one blocking error. `warning` = passed with non-blocking warnings. |
| `answerStatus` | The validator-assigned answer status per §7. |
| `validatorHook` | Name of the primary hook that was executed. |
| `patternSpecId` | The PatternSpec ID this item was validated against. |
| `computedAnswer` | The deterministically computed correct answer. |
| `normalizedInput` | The input after normalization to the form the validator used. |
| `errorCodes` | List of error codes (blocking). |
| `warnings` | List of warning codes (non-blocking). |
| `productionEligible` | Whether the item qualifies for production storage per §9 gate contract. |
| `notes` | Optional human-readable notes. |

---

## 9. Error Code Taxonomy

### 9.1 Error codes (blocking)

| Code | Family | Meaning |
|---|---|---|
| `E_SCHEMA_REQUIRED_FIELD` | Schema | A required field is missing from the PatternSpec. |
| `E_PATTERN_UNKNOWN` | Schema | `patternSpecId` is not recognized. |
| `E_PATTERN_HOOK_MISSING` | Schema | No validator hooks are declared for the pattern. |
| `E_RANGE_OUT_OF_SCOPE` | Range | Numeric value is outside the allowed range. |
| `E_FOUR_DIGIT_CONSTRAINT` | Digit | Number does not have exactly 4 digits. |
| `E_INVALID_LEADING_ZERO` | Digit | Leading zero is not allowed for a four-digit number. |
| `E_PLACE_VALUE_SUM_MISMATCH` | Place Value | Decomposition or composition parts do not sum to the total. |
| `E_DIGIT_ARRANGEMENT_MAX` | Digit | Max arrangement is incorrect. |
| `E_DIGIT_ARRANGEMENT_MIN` | Digit | Min arrangement is incorrect or has an invalid leading zero. |
| `E_CHINESE_NUMERAL_MISMATCH` | Chinese Reading | Chinese reading does not match the expected form. |
| `E_CHINESE_NUMERAL_PARSE` | Chinese Reading | Chinese wording could not be parsed to a numeric value. |
| `E_CHINESE_NUMERAL_AMBIGUOUS` | Chinese Reading | Chinese wording is ambiguous (multiple possible numeric interpretations). |
| `E_ZERO_READING_MISMATCH` | Zero Reading | Internal zeroes are not read according to the consecutive-zero rule. |
| `E_COMPARISON_MISMATCH` | Comparison | Relational operator does not match the numeric comparison. |
| `E_SEQUENCE_STEP_MISMATCH` | Sequence | Sequence step does not match the declared step size. |
| `E_SEQUENCE_RANGE_OUT_OF_SCOPE` | Sequence | A sequence value exceeds the allowed numeric range. |
| `E_STEP_MODEL_INVALID` | Sequence | The `stepModel` structure is inconsistent (e.g., wrong mode for pattern, missing required field). |
| `E_MONEY_DENOMINATION_INVALID` | Money | A denomination used is not in the allowed list. |
| `E_MONEY_TOTAL_MISMATCH` | Money | Computed total does not match the expected answer. |
| `E_MONEY_EXCHANGE_MISMATCH` | Money | Exchange count or remainder does not match computed value. |
| `E_NUMBERLINE_VISUAL_DEPENDENCY` | Number Line | Number-line answer depends on visual rendering without structured data. |
| `E_NUMBERLINE_POSITION_MISMATCH` | Number Line | Computed position does not match the expected answer. |
| `E_VISUAL_DEPENDENCY_UNSTRUCTURED` | Visual | Visual dependency exists without textFallback or structured data. |
| `E_SUPPORT_STATUS_MISMATCH` | Status | Item's supportStatus exceeds the parent PatternSpec's supportStatus. |
| `E_FUTURE_DOMAIN_LEAKAGE` | Scope | Item introduces out-of-scope skills. |
| `E_ANSWER_NOT_UNIQUE` | Ambiguity | Item has more than one plausible correct answer. |
| `E_PROVENANCE_STATUS_VIOLATION` | Provenance | Item falsely claims `sourceBacked` or `verified`. |

### 9.2 Warning codes (non-blocking)

| Code | Meaning |
|---|---|
| `W_CHINESE_NUMERAL_VARIANT` | A non-canonical but accepted Chinese reading variant was used. |
| `W_TEXT_FALLBACK_ONLY` | Item uses text fallback; visual renderer is not available. |
| `W_HUMAN_REVIEW_RECOMMENDED` | Item passed deterministic validation but contains subjective content that may benefit from human review. |
| `W_RUNTIME_GENERATED_NOT_STORED` | Item is runtime-generated and will not be persisted. |

---

## 10. Pattern-to-Validator Matrix

Comprehensive matrix covering all 12 G3A U01 PatternSpecs.

| patternSpecId | questionKind | supportStatus | primary validatorHook | answerModel type | deterministic computability | allowed answerStatus after pass | blocked conditions | production eligible after pass? |
|---|---|---|---|---|---|---|---|---|
| `spec_pv_4digit_decompose` | `decompose` | `v1NumberSenseSupported` | `validatePlaceValueDecomposition` (H3) | `placeValueDecompositionAnswer` | Yes | `computed` | None | Yes |
| `spec_pv_4digit_compose` | `compose` | `v1NumberSenseSupported` | `validatePlaceValueComposition` (H4) | `placeValueCompositionAnswer` | Yes | `computed` | None | Yes |
| `spec_rw_4digit_number_to_chinese` | `transcode` | `v1NumberSenseSupported` | `validateChineseNumberReading` (H5) + `validateZeroReading` (H7) | `chineseNumberAnswer` | Yes | `computed` | None | Yes |
| `spec_rw_4digit_chinese_to_number` | `transcode` | `v1NumberSenseSupported` | `validateChineseToNumber` (H6) | `scalarNumberAnswer` | Yes | `computed` | None | Yes |
| `spec_rw_4digit_zero_reading` | `transcode` | `v1NumberSenseSupported` | `validateChineseNumberReading` (H5) + `validateZeroReading` (H7) | `chineseNumberAnswer` | Yes | `computed` | None | Yes |
| `spec_seq_4digit_place_step` | `sequence` | `v1NumberSenseSupported` | `validateSequenceStep` (H10) | `sequenceAnswer` (`stepModel.mode = "place_sequence"`) | Yes | `computed` | `stepModel.mode` not `place_sequence`; range exceeded | Yes |
| `spec_seq_between_two_numbers` | `sequence` | `v1NumberSenseSupported` | `validateBetweenNumbersSequence` (H11) | `sequenceAnswer` (`stepModel.mode = "single"`) | Yes | `computed` | `stepModel.mode` not `single`; range exceeded | Yes |
| `spec_cmp_4digit_compare` | `compare` | `v1NumberSenseSupported` | `validateFourDigitComparison` (H9) | `comparisonAnswer` | Yes | `computed` | Unparseable mixed representation without accepted forms | Yes |
| `spec_perm_4digit_max_min_from_digits` | `optimize_from_digits` | `v1NumberSenseSupported` | `validateDigitArrangementMaxMin` (H8) | `maxMinDigitArrangementAnswer` | Yes | `computed` | Duplicate digits when not allowed; leading zero in result | Yes |
| `spec_numline_integer_reading` | `visual_reading` | `v1TextFallbackSupported` | `validateNumberLineTextFallback` (H14) | `numberLinePositionAnswer` / `omittedTemplateAnswer` | **Conditional** — text-fallback items only | `computed` (text-fallback); `blocked_visual_dependency` or `omitted_for_template` (visual-only) | No explicit structured data; visual-only without textFallback | Conditional (text-fallback only, after human review) |
| `spec_money_4digit_counting` | `visual_reading` | `v1TextFallbackSupported` | `validateMoneyTotal` (H12) | `moneyTotalAnswer` | **Conditional** — text-fallback items only | `computed` (text-fallback); `blocked_visual_dependency` or `to_be_verified` (visual-only) | Visual money diagram without explicit denomination counts | Conditional (text-fallback only, after human review) |
| `spec_money_4digit_payment` | `representation_payment` | `v1TextFallbackSupported` | `validateMoneyExchange` (H13) + `validateMoneyTotal` (H12) | `moneyExchangeAnswer` / `moneyTotalAnswer` | Yes — text-fallback deterministic | `computed` | Visual dependency without textFallback | Yes (text-fallback deterministic; no human review required per S21E) |

---

## 11. Production Gate Contract

A candidate item is **production eligible** only when ALL of the following conditions are met:

| # | Condition | Checked by |
|---|---|---|
| PG1 | The parent PatternSpec exists and is structurally valid (PS1–PS9). | PatternSpec structural validation |
| PG2 | The item passes all required validator hooks with `validationStatus = pass`. | Validator |
| PG3 | The item has exactly one unambiguous correct answer. | H18 |
| PG4 | No future-domain leakage exists. | H16 |
| PG5 | The item's `supportStatus` is compatible with the parent PatternSpec. | H15 |
| PG6 | No unsupported visual dependency exists (or it is explicitly gated as `blocked_visual_dependency`). | H17 |
| PG7 | `answerStatus` is `computed`, `verified`, or `human_reviewed`. | Validator / human |
| PG8 | The item does not claim `sourceBacked` unless linked to verified source evidence. | H19 |
| PG9 | The item does not claim `verified` without source evidence or human review. | H19 |
| PG10 | If the parent PatternSpec requires human review (`humanReviewRequired = true`), human review has been completed and `answerStatus` is `verified` or `human_reviewed` according to the source/provenance policy. The deterministic validator alone must never set `verified` or `human_reviewed`. | Human reviewer |

### 11.1 Runtime generation distinction

Per S21C1 §5.1 and S21E §11:

- Runtime worksheet-only generated items may be produced from PatternSpec + randomSeed without permanent GeneratedItem JSON storage.
- Runtime items must still pass all validator hooks.
- Runtime items carry `answerStatus = computed` if deterministically validatable, but this status may remain transient (not persisted).
- Runtime items must not be marked `verified` or `sourceBacked`.
- Permanent GeneratedItem storage is optional and reserved for curated, reused, audited, or QA-seed items.

### 11.2 Visual item gate

No visual item may be promoted to `verified` from deterministic validation alone. Visual items must:

- Have explicit structured data (text fallback) for deterministic validation, OR
- Be blocked as `blocked_visual_dependency` with `answerStatus = to_be_verified` or `omitted_for_template`.

---

## 12. Non-Goals

S21F explicitly does **not**:

| # | Non-goal |
|---|---|
| 1 | Implement validator code. |
| 2 | Implement generator code. |
| 3 | Generate item banks. |
| 4 | Create production GeneratedItem or LiteracyItem JSON. |
| 5 | Create worksheets or worksheet templates. |
| 6 | Inspect or OCR source PDFs. |
| 7 | Verify visual items from images or diagrams. |
| 8 | Create student wrong-answer analytics or grading logic. |
| 9 | Add validators for fractions, decimals, geometry, rate, speed, area, volume, probability, algebra, or negative numbers. |
| 10 | Modify S21B, S21C, S21D, or S21E policy semantics. |
| 11 | Modify `src/`, `site/`, `tests/`, `package.json`, `package-lock.json`, schema files, deployment files, or generated worksheet output. |

---

## 13. QA Checklist

| # | Criterion | Status |
|---|---|---|
| QA1 | All 12 S21E PatternSpecs mapped to validator hooks. | ✓ |
| QA2 | `answerStatus = computed` vs `verified` separation preserved from S21C1 §6.2. | ✓ |
| QA3 | `stepModel` structure preserved from S21E1 §7.6. | ✓ |
| QA4 | Visual fallback boundaries preserved: `numline_integer_reading` and `money_4digit_counting` remain gated behind textFallback + human review. | ✓ |
| QA5 | No new generated items created. | ✓ |
| QA6 | No source PDFs modified. | ✓ |
| QA7 | No code modified. | ✓ |
| QA8 | No future-domain leakage in validator contract. | ✓ |
| QA9 | No OCR artifacts created. | ✓ |
| QA10 | All 12 patterns have exactly one primary validation path; some paths contain multiple hooks (e.g., H5+H7, H13+H12). | ✓ |
| QA11 | Hooks H10 and H11 reference `stepModel`, not loose `step` / `steps`. | ✓ |
| QA12 | 27 blocking error codes and 4 warning codes defined. | ✓ |
| QA13 | Validation result object contract defined (illustrative only). | ✓ |
| QA14 | Production gate contract defined with 10 conditions. | ✓ |
| QA15 | Runtime generation vs production storage distinction preserved. | ✓ |
| QA16 | Created file: `docs/curriculum/mapping/S21F_G3A_U01_DeterministicValidatorContract.md`. | ✓ |

---

## S21F1 ReadbackQA and Minor Contract Tightening

### Checks performed

1. **Error code count consistency**: Counted blocking error codes in §9.1 table. Found **27** codes, not 28 as originally stated. Corrected QA12 and all summary references from 28 to 27.

2. **Digit-value contract clarification**: Source S21B ExampleItems include prompts like "2 表示多少" and "7 表示多少" (digit-value interpretation). Confirmed these are handled as a subcase of H3 `validatePlaceValueDecomposition`. Added explicit note in H3 validation logic: "Digit-value prompts are handled as a subcase of this hook: the digit's positional value is computed as `digit × place_value`."

3. **Primary hook wording**: QA10 originally said "exactly one primary validatorHook", but patterns like `rw_4digit_number_to_chinese` use H5+H7 and `money_4digit_payment` uses H13+H12. Revised QA10 to: "All 12 patterns have exactly one primary validation path; some paths contain multiple hooks (e.g., H5+H7, H13+H12)."

4. **PG10 answerStatus semantics**: PG10 originally required `answerStatus = verified` after human review, but the answer status contract (§7) allows both `verified` and `human_reviewed` after human review. Tightened PG10 to: "If `humanReviewRequired = true`, human review has been completed and `answerStatus` is `verified` or `human_reviewed` according to the source/provenance policy. The deterministic validator alone must never set `verified` or `human_reviewed`."

5. **H18 deterministic scope clarification**: H18 originally said "Deterministic computability: No — requires semantic interpretation." Clarified as: "a deterministic precheck plus human-review fallback gate, not a fully deterministic semantic validator." This clarifies that H18 is still part of the deterministic contract — it performs a structural precheck and escalates borderline cases.

### Issues found

| # | Issue | Severity | Resolution |
|---|---|---|---|
| 1 | Error code count claimed 28, actual count 27 | Minor | Corrected to 27 |
| 2 | Digit-value prompts ("2 表示多少") not explicitly addressed | Minor | Added subcase note to H3 |
| 3 | QA10 said "exactly one primary validatorHook" but some patterns use multiple hooks | Minor | Revised to "primary validation path" |
| 4 | PG10 required `answerStatus = verified` but `human_reviewed` is also valid after human review | Minor | Broadened to include `human_reviewed` |
| 5 | H18 said "No" for deterministic computability without qualification | Minor | Clarified as precheck + fallback gate |

### Fixes applied

1. **QA12**: Changed "28 error codes" → "27 blocking error codes"
2. **H3 validation logic**: Added digit-value subcase note
3. **QA10**: Revised from "exactly one primary validatorHook" → "exactly one primary validation path; some paths contain multiple hooks"
4. **PG10**: Broadened answerStatus from `verified` only → `verified` or `human_reviewed`; added validator restriction note
5. **H18 deterministic computability**: Clarified as "deterministic precheck plus human-review fallback gate"

### Policy preservation confirmed

- `verified` / `computed` distinction: preserved (§7)
- Visual gating: unchanged (`numline_integer_reading` and `money_4digit_counting` remain gated behind textFallback + human review)
- `stepModel` structure: preserved (H10/H11 unchanged)
- Answer status rules: deterministic validator may set `computed`, `to_be_verified`, `omitted_for_template`, `blocked_visual_dependency`, `invalid`; may NOT set `verified` or `human_reviewed`
- No code, generated data, or source PDFs modified
- No new domain scope added

### Final QA status

**S21F1_STATUS = PASS**

---

## Appendix A: Cross-Reference — S21E Hook Naming

| S21E Hook # | Hook name | S21F reference |
|---|---|---|
| H1 | `validateNumericRange` | §6 H1 |
| H2 | `validateDigitCount` | §6 H2 |
| H3 | `validatePlaceValueDecomposition` | §6 H3 |
| H4 | `validatePlaceValueComposition` | §6 H4 |
| H5 | `validateChineseNumberReading` | §6 H5 |
| H6 | `validateChineseToNumber` | §6 H6 |
| H7 | `validateZeroReading` | §6 H7 |
| H8 | `validateDigitArrangementMaxMin` | §6 H8 |
| H9 | `validateFourDigitComparison` | §6 H9 |
| H10 | `validateSequenceStep` | §6 H10 |
| H11 | `validateBetweenNumbersSequence` | §6 H11 |
| H12 | `validateMoneyTotal` | §6 H12 |
| H13 | `validateMoneyExchange` | §6 H13 |
| H14 | `validateNumberLineTextFallback` | §6 H14 |
| H15 | `validateSupportStatusCompatibility` | §6 H15 |
| H16 | `validateNoFutureDomainLeakage` | §6 H16 |
| H17 | `validateNoUnsupportedVisualDependency` | §6 H17 |
| H18 | `validateUniqueAnswer` | §6 H18 |
| H19 | `validateSourceBoundary` | §6 H19 |

## Appendix B: Cross-Reference — S21C1 Key Rules Preserved

| Rule | S21F section |
|---|---|
| `computed` = validator-derived; does not grant `verified`. | §7 |
| `verified` = source evidence or human review. | §7 |
| AI must not mark `sourceBacked` or `verified`. | §11.1 |
| Runtime generation does not require permanent JSON storage. | §11.1 |
| Production storage = curated, reused, audited, QA-seed items. | §11.1 |
| Visual/textFallback patterns remain gated. | §6, §10, §11.2 |
| G3A U01 scope = number sense within 10000. | §4B |