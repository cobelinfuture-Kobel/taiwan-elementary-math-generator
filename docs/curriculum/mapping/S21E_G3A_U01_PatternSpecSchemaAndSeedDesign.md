# S21E G3A U01 PatternSpec Schema and Seed Design

## Document Status

- Task scope: documentation / schema design only
- Production impact: no generator code, validator code, GeneratedItem JSON files, LiteracyItem JSON files, or worksheet assets are created by this task
- Purpose: define the formal PatternSpec schema and seed design layer for G3A U01 "1萬以內的數／數到1萬", converting the S21B QuestionPattern layer into a reusable PatternSpec design that future generator and validator work can implement
- Reference mapping: `S21B_G3A_U01_10000Numbers_FormalPatternMapping.md`
- Reference policy: `S21C_G3A_U01_AIItemGenerationAndStoragePolicy.md` (S21C1)
- Reference policy: `S21D_G3A_U01_LiteracyItemRecursiveImprovementPolicy.md`

---

## 1. Purpose

S21E is the **PatternSpec schema and seed design layer** for G3A U01 "1萬以內的數／數到1萬". It defines the formal schema, constraints, answer models, validator hooks, source metadata rules, and acceptance criteria that future generator and validator tasks (S21F, S21G, S21H, S21I) must implement.

S21E explicitly does **not**:

- Implement generator code.
- Implement validator code.
- Create production GeneratedItem or LiteracyItem JSON files.
- Create PatternSpec JSON files.
- Create worksheet assets.
- Run OCR or inspect PDF visual content.
- Modify S21B mapping facts, S21C policy semantics, or S21D policy semantics.

S21E defines the **contract** that future implementation tasks must satisfy.

---

## 2. Scope

### 2.1 Included scope

S21E covers G3A U01 "1萬以內的數／數到1萬" (number sense within 10000). The following sub-domains are included:

| Sub-domain | Covered patterns |
|---|---|
| Number sense within 10000 | All 12 patterns |
| Place value | `pv_4digit_decompose`, `pv_4digit_compose` |
| Number reading/writing | `rw_4digit_number_to_chinese`, `rw_4digit_chinese_to_number` |
| Zero reading | `rw_4digit_zero_reading` |
| Digit arrangement | `perm_4digit_max_min_from_digits` |
| Comparison | `cmp_4digit_compare` |
| Sequence / skip-count / missing number | `seq_4digit_place_step`, `seq_between_two_numbers` |
| Money representation / text fallback | `money_4digit_counting`, `money_4digit_payment` |
| Number-line text fallback | `numline_integer_reading` |

### 2.2 Explicitly excluded

| Exclusion | Reason |
|---|---|
| Fractions, decimals, percentages | Future domain; outside G3A U01 scope |
| Geometry, area, volume | Outside G3A U01 number-sense scope |
| Speed, rate, time-distance | Outside scope |
| Probability, statistics | Outside scope |
| Algebra, variables, negative numbers | Outside scope |
| Unsupported visual-only generation | Must have textFallback or remain gated |
| OCR-derived source claims | OCR is not authority (S21B2 policy) |

---

## 3. Dependency and Source Boundary

S21E inherits rules from S21B, S21C/S21C1, and S21D.

### 3.1 Rules inherited from S21B

| Rule | Source |
|---|---|
| `QuestionPattern` is the source for PatternSpec seed design. | S21B §7 |
| `ExampleItem` is source evidence / sample / QA seed, not production inventory. | S21B §8 |
| OCR is not a source authority. Verification follows operator-provided visual verification notes. | S21B §Source PDF Access Note |
| All 12 QuestionPatterns have sourceBacked ExampleItems. | S21B §13 |
| 10 ExampleItems have verified answers; `money_4digit_counting` is `to_be_verified`; `numline_integer_reading` is `omitted_for_template`. | S21B §13 |
| Visual-dependent patterns are `v1TextFallbackSupported`, not full visual support. | S21B §7 |

### 3.2 Rules inherited from S21C/S21C1

| Rule | Source |
|---|---|
| `PatternSpec` = reusable pattern definition: constraints, valid answer ranges, difficulty parameters, linked curriculum metadata, validation rules. | S21C §3.1 |
| `GeneratedItem` = concrete generated item only after validator confirmation. | S21C §3.2 |
| `LiteracyItem` = contextual/fused item requiring deterministic validation plus human review. | S21C §3.3 |
| `computed` = validator-derived. Deterministic validator alone does not grant `verified`. | S21C1 §6.2 |
| `verified` = source evidence or human review. | S21C1 §6.2 |
| AI must not mark `sourceBacked` or `verified`. | S21C §8.2 |
| Runtime generated worksheet items do not require permanent GeneratedItem JSON storage. | S21C1 §5.1 |
| PatternSpec may reference ExampleItems but must not promote unverified visual items. | S21C §5 |
| Production storage = item bank, benchmark set, QA seed set, curated worksheet, LiteracyItem library. | S21C1 §5.1 |

### 3.3 Rules inherited from S21D

| Rule | Source |
|---|---|
| LiteracyItem requires math extraction, validator pass, human review, provenance, and answerStatus rules. | S21D §4, §7, §8, §15 |
| LiteracyItem recursive improvement has max 3 rounds, max 2 validator failures, max 2 human review failures, max 1 semantic drift event. | S21D §6 |
| LiteracyItem production requires `answerStatus = verified` after human review. | S21D §14 |
| S21D rules are inherited as-is; S21E does not modify them. | S21D §3 |

### 3.4 S21E-specific source boundary rules

- PatternSpec can be source-backed at **pattern level only** when the source QuestionPattern exists in S21B.
- PatternSpec does **not** make individual generated examples `sourceBacked`.
- Generated output from PatternSpec is `generatedFromPattern`, not `sourceBacked`.
- Generated output from PatternSpec carries `answerStatus = computed` after validator pass, never `verified` unless human-reviewed.
- Runtime items must not be marked `verified` or `sourceBacked`.

---

## 4. PatternSpec Design Goals

A PatternSpec must support the following capabilities:

| Goal | Description |
|---|---|
| Deterministic generation | From a PatternSpec + randomSeed, produce concrete items with one unambiguous answer. |
| Deterministic validation | Every generated item must be validatable against the PatternSpec constraints and answer model. |
| Difficulty control | DifficultyTags and constraint ranges must allow difficulty variation without pattern drift. |
| Answer derivation | The answer model must define how the correct answer is computed from the generated item. |
| Tag tracking | Every item must carry difficultyTags, canonicalSkillIds, and curriculumNodeId. |
| SupportStatus gating | Items must not exceed the supportStatus of their parent PatternSpec. |
| Source provenance | Every PatternSpec must cite its source QuestionPattern and ExampleItem references. |
| Runtime generation from randomSeed | Constraints + randomSeed must be sufficient to produce valid items without permanent storage. |
| Production storage only when needed | Items may remain transient unless promoted to a production storage category. |
| Future compatibility | PatternSpecs must be compatible with both GeneratedItem and LiteracyItem downstream. |

---

## 5. PatternSpec Schema

This section defines the full illustrative schema for a PatternSpec document. This is a design specification, not an actual JSON schema file.

### 5.1 Required fields

| Field | Type | Required | Meaning | Example value |
|---|---|---|---|---|
| `patternSpecId` | string | Yes | Unique stable identifier for this PatternSpec. | `spec_pv_4digit_decompose` |
| `version` | string | Yes | Semantic version of this PatternSpec definition. | `1.0.0` |
| `curriculumNodeId` | string | Yes | Linked CurriculumNode from S21B. | `g3a_u01_numbers_within_10000` |
| `sourceQuestionPatternId` | string | Yes | The S21B QuestionPattern ID this spec derives from. | `pv_4digit_decompose` |
| `sourceExampleItemRefs` | string[] | Yes | ExampleItem IDs from S21B that serve as source evidence for this pattern. | `["ex_g3a_u01_p2_type01_001"]` |
| `canonicalSkillIds` | string[] | Yes | Canonical skill IDs from S21B. | `["place_value", "number_decomposition"]` |
| `questionKind` | string | Yes | Learner-facing interaction style from S21B taxonomy. | `decompose` |
| `supportStatus` | string | Yes | Implementation support level. | `v1NumberSenseSupported` |
| `generationModeDefault` | string | Yes | Preferred generation mode for this pattern. | `rule_based` |
| `allowedGenerationModes` | string[] | Yes | All generation modes allowed for this pattern. | `["rule_based", "ai_draft"]` |
| `difficultyTags` | string[] | Yes | Difficulty tags from S21B taxonomy. | `["basic", "place_value_direct"]` |
| `constraints` | object | Yes | Constraint model governing valid generated items. See §6. | (constraint object) |
| `answerModel` | object | Yes | Answer shape and derivation rules. See §7. | (answer model object) |
| `validatorHooks` | string[] | Yes | Validator hook names that must pass for this pattern. See §8. | `["validateNumericRange", "validateDigitCount", "validatePlaceValueDecomposition"]` |
| `rendererRequirements` | object | Yes | What renderer capabilities are needed. | `{ "requiresVisualRenderer": false, "textFallbackAvailable": true }` |
| `textFallbackPolicy` | object | Yes | Rules for text-based fallback generation. | `{ "textFallbackRequired": false, "textFallbackDescription": null }` |
| `sourceMetadata` | object | Yes | Source traceability metadata. See §14. | (source metadata object) |
| `provenance` | object | Yes | Creation and version provenance. See §14. | (provenance object) |
| `runtimeGenerationPolicy` | object | Yes | Whether runtime generation from randomSeed is allowed. | `{ "allowRuntimeGeneration": true, "requiresPermanentStorage": false }` |
| `productionStoragePolicy` | object | Yes | Conditions under which items may be promoted to production storage. | `{ "allowProductionStorage": true, "requiresHumanReview": false }` |
| `lifecycleStatus` | string | Yes | Current lifecycle state of this PatternSpec. | `active` |
| `notes` | string | No | Optional design notes. | `"Leading zero is not allowed for four-digit numbers."` |

### 5.2 Lifecycle status values

| Value | Meaning |
|---|---|
| `active` | PatternSpec is ready for generation use. |
| `draft` | PatternSpec is under design; not ready for production generation. |
| `deprecated` | PatternSpec has been retired; items may exist for audit only. |
| `plannedOnly` | PatternSpec is documented but not yet implemented. |

### 5.3 Supported generation modes per pattern

| Pattern | Default mode | Allowed modes |
|---|---|---|
| `pv_4digit_decompose` | `rule_based` | `rule_based`, `ai_draft` |
| `pv_4digit_compose` | `rule_based` | `rule_based`, `ai_draft` |
| `rw_4digit_number_to_chinese` | `rule_based` | `rule_based`, `ai_draft` |
| `rw_4digit_chinese_to_number` | `rule_based` | `rule_based`, `ai_draft` |
| `rw_4digit_zero_reading` | `rule_based` | `rule_based`, `ai_draft` |
| `seq_4digit_place_step` | `rule_based` | `rule_based`, `ai_draft` |
| `seq_between_two_numbers` | `rule_based` | `rule_based`, `ai_draft` |
| `cmp_4digit_compare` | `rule_based` | `rule_based`, `ai_draft` |
| `perm_4digit_max_min_from_digits` | `rule_based` | `rule_based`, `ai_draft` |
| `numline_integer_reading` | `ai_draft` | `ai_draft`, `manual_curated` (text fallback only) |
| `money_4digit_counting` | `ai_draft` | `ai_draft`, `manual_curated` (text fallback only) |
| `money_4digit_payment` | `rule_based` | `rule_based`, `ai_draft` |

---

## 6. Common Constraint Model

Each PatternSpec uses one or more of the following constraint groups. These are schema definitions, not executable code.

### 6A. NumericRangeConstraint

Controls the numeric range of generated values.

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `minValue` | number | Yes | Minimum allowed value (inclusive). | `0` |
| `maxValue` | number | Yes | Maximum allowed value (inclusive). | `10000` |
| `allowZero` | boolean | Yes | Whether 0 is a valid value. | `true` |
| `allowNegative` | boolean | Yes | Whether negative values are allowed. For G3A U01, always `false`. | `false` |
| `integerOnly` | boolean | Yes | Whether only integers are allowed. | `true` |

**Usage:** `pv_4digit_decompose`, `pv_4digit_compose`, `seq_4digit_place_step`, `seq_between_two_numbers`, `cmp_4digit_compare`, `money_4digit_payment`

**Example:**
```json
{
  "minValue": 1000,
  "maxValue": 9999,
  "allowZero": false,
  "allowNegative": false,
  "integerOnly": true
}
```

### 6B. DigitConstraint

Controls digit-level composition rules.

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `digitCount` | number (or `{min, max}`) | Yes | Number of digits allowed. | `4` or `{"min": 3, "max": 4}` |
| `allowLeadingZero` | boolean | Yes | Whether leading zero is allowed. For four-digit numbers, default `false`. | `false` |
| `requiredDigits` | number[] | No | Digits that must appear. | `[0]` |
| `forbiddenDigits` | number[] | No | Digits that must not appear. | `[]` |
| `zeroHandling` | string | Yes | Strategy for handling zero. | `"consecutive_zero_rule"` |

**Zero handling strategies:**

| Value | Meaning |
|---|---|
| `consecutive_zero_rule` | Consecutive internal zeroes are read as a single 零 (e.g., 5003 → 五千零三). |
| `position_zero_rule` | Each zero position is read individually. |
| `no_zero_allowed` | Zero is not allowed in any position. |
| `zero_allowed_but_not_required` | Zero may appear but has no special reading rule beyond the pattern's default. |

**Usage:** `rw_4digit_zero_reading`, `perm_4digit_max_min_from_digits`

**Example:**
```json
{
  "digitCount": 4,
  "allowLeadingZero": false,
  "requiredDigits": [],
  "forbiddenDigits": [],
  "zeroHandling": "consecutive_zero_rule"
}
```

### 6C. PlaceValueConstraint

Controls place-value decomposition and composition.

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `places` | string[] | Yes | Which place-value positions are used. | `["thousands", "hundreds", "tens", "ones"]` |
| `allowMissingPlace` | boolean | Yes | Whether a place can be omitted (treated as 0). | `true` |
| `requireZeroPlace` | boolean | No | Whether a zero place must be explicitly present in the prompt. | `false` |
| `compositionMode` | string | Yes | How composition is presented. | `"unordered_place_parts"` |
| `decompositionMode` | string | Yes | How decomposition is presented. | `"ordered_place_parts"` |

**Composition modes:**

| Value | Meaning |
|---|---|
| `unordered_place_parts` | Parts may be given in any order (e.g., "8 個一、5 個十、7 個千"). |
| `ordered_place_parts` | Parts are given in position order. |
| `expanded_notation` | Parts are given as additive terms (e.g., 7000 + 50 + 8). |

**Decomposition modes:**

| Value | Meaning |
|---|---|
| `ordered_place_parts` | Student fills each place in order. |
| `expanded_notation` | Student writes the expanded form. |

**Usage:** `pv_4digit_decompose`, `pv_4digit_compose`

**Example:**
```json
{
  "places": ["thousands", "hundreds", "tens", "ones"],
  "allowMissingPlace": true,
  "requireZeroPlace": false,
  "compositionMode": "unordered_place_parts",
  "decompositionMode": "ordered_place_parts"
}
```

### 6D. ChineseNumberReadingConstraint

Controls Chinese number reading/writing rules.

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `locale` | string | Yes | Locale for number reading. | `"zh-Hant-TW"` |
| `zeroRule` | string | Yes | How internal zeroes are read. | `"consecutive_zero_single_ling"` |
| `maxNumber` | number | Yes | Maximum number supported by this reading convention. | `10000` |
| `allowedForms` | string[] | No | Allowed reading forms. | `["standard_taiwan_g3a"]` |
| `disallowedForms` | string[] | No | Disallowed reading forms. | `["mainland_china_variant"]` |

**Zero rules:**

| Value | Meaning |
|---|---|
| `consecutive_zero_single_ling` | Consecutive internal zeroes → single 零. `5003` → `五千零三`. |
| `positional_zero_each` | Each zero position read separately. (Not standard G3A.) |

**Usage:** `rw_4digit_number_to_chinese`, `rw_4digit_chinese_to_number`, `rw_4digit_zero_reading`

**Example:**
```json
{
  "locale": "zh-Hant-TW",
  "zeroRule": "consecutive_zero_single_ling",
  "maxNumber": 10000,
  "allowedForms": ["standard_taiwan_g3a"],
  "disallowedForms": []
}
```

### 6E. ComparisonConstraint

Controls comparison patterns.

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `operandCount` | number | Yes | Number of values to compare. | `2` |
| `allowedRelations` | string[] | Yes | Relational operators allowed. | `["<", ">", "="]` |
| `mixedRepresentationAllowed` | boolean | Yes | Whether numeral-vs-Chinese-reading comparisons are allowed. | `true` |

**Usage:** `cmp_4digit_compare`

**Example:**
```json
{
  "operandCount": 2,
  "allowedRelations": ["<", ">", "="],
  "mixedRepresentationAllowed": true
}
```

### 6F. SequenceConstraint

Controls sequence and skip-counting patterns.

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `allowedSteps` | number[] | Yes | Step sizes that may be used. | `[1, 10, 100, 1000]` |
| `direction` | string[] | Yes | Allowed directions. | `["forward", "backward"]` |
| `length` | number (or `{min, max}`) | Yes | Number of items in the sequence. | `{"min": 3, "max": 5}` |
| `blankCount` | number (or `{min, max}`) | Yes | Number of blanks to fill. | `{"min": 1, "max": 4}` |
| `bounds` | object | Yes | NumericRangeConstraint for start/end values. | `{"minValue": 1, "maxValue": 10000}` |
| `stepPerItem` | string | Yes | Whether each item uses the same step or different steps. | `"single"` |

**Step-per-item modes:**

| Value | Meaning |
|---|---|
| `single` | All items in the sequence use the same step size. |
| `varying` | Each item may use a different step size from `allowedSteps`. |
| `place_sequence` | Steps follow place-value order: +1, +10, +100, +1000 (or reverse). |

**Usage:** `seq_4digit_place_step`, `seq_between_two_numbers`

**Example (place-step):**
```json
{
  "allowedSteps": [1, 10, 100, 1000],
  "direction": ["forward", "backward"],
  "length": {"min": 4, "max": 4},
  "blankCount": {"min": 4, "max": 4},
  "bounds": {"minValue": 1000, "maxValue": 9000, "allowZero": false, "allowNegative": false, "integerOnly": true},
  "stepPerItem": "place_sequence"
}
```

**Example (between-two-numbers):**
```json
{
  "allowedSteps": [1, 2, 5, 10, 100],
  "direction": ["forward"],
  "length": {"min": 3, "max": 8},
  "blankCount": {"min": 1, "max": 3},
  "bounds": {"minValue": 1, "maxValue": 10000, "allowZero": false, "allowNegative": false, "integerOnly": true},
  "stepPerItem": "single"
}
```

### 6G. MoneyConstraint

Controls money representation patterns.

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `allowedDenominations` | object[] | Yes | Denominations that may appear. | `[{"unit": "張", "value": 1000}, {"unit": "張", "value": 100}, {"unit": "個", "value": 10}, {"unit": "個", "value": 1}]` |
| `totalMax` | number | Yes | Maximum total value. | `10000` |
| `exchangeAllowed` | boolean | Yes | Whether exchange/conversion between denominations is required. | `true` |
| `remainderAllowed` | boolean | Yes | Whether a remainder may exist after exchange. | `true` |
| `visualDependency` | string | Yes | Whether the pattern depends on visual money diagrams. | `"text_fallback"` or `"source_visual"` |
| `textFallbackRequired` | boolean | Yes | Whether a text fallback description is required. | `true` |

**Usage:** `money_4digit_counting`, `money_4digit_payment`

**Example (payment, text-fallback):**
```json
{
  "allowedDenominations": [
    {"unit": "張", "value": 1000},
    {"unit": "張", "value": 100},
    {"unit": "個", "value": 10},
    {"unit": "個", "value": 1}
  ],
  "totalMax": 10000,
  "exchangeAllowed": true,
  "remainderAllowed": true,
  "visualDependency": "text_fallback",
  "textFallbackRequired": true
}
```

### 6H. NumberLineConstraint

Controls number-line reading patterns.

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `tickSpacing` | number (or number[]) | Yes | Spacing between tick marks. | `10` or `[100, 10, 1]` |
| `startValue` | number | Yes | Start value of the number line. | `0` |
| `endValue` | number | Yes | End value of the number line. | `10000` |
| `labeledTicks` | string | Yes | Which ticks have labels. | `"endpoints"`, `"every_nth"`, `"custom"` |
| `missingTickPolicy` | string | Yes | How missing ticks are handled. | `"text_fallback_required"` |
| `textFallbackRequired` | boolean | Yes | Whether text fallback is required. Always `true` for v1. | `true` |

**Labeled-tick modes:**

| Value | Meaning |
|---|---|
| `endpoints` | Only start and end ticks are labeled. |
| `every_nth` | Every nth tick is labeled. |
| `custom` | A specific set of ticks is labeled. |

**Missing-tick policies:**

| Value | Meaning |
|---|---|
| `text_fallback_required` | Missing labeled ticks must be described in text. |
| `omitted_for_template` | Pattern is format-only; no answer expected. |
| `visual_renderer_required` | A visual renderer is needed; v1 cannot support. |

**Usage:** `numline_integer_reading`

**Example:**
```json
{
  "tickSpacing": 100,
  "startValue": 0,
  "endValue": 10000,
  "labeledTicks": "endpoints",
  "missingTickPolicy": "text_fallback_required",
  "textFallbackRequired": true
}
```

### 6I. VisualDependencyConstraint

Controls visual dependency gating.

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `requiresVisualRenderer` | boolean | Yes | Whether a visual renderer is required. | `true` for number-line / money diagrams |
| `textFallbackAvailable` | boolean | Yes | Whether a text-based fallback exists. | `true` |
| `humanReviewRequired` | boolean | Yes | Whether human review is required before production. | `true` for `money_4digit_counting` |
| `answerStatusLimit` | string | Yes | Maximum answerStatus allowed without human review. | `"computed"` or `"to_be_verified"` |

**Usage:** `numline_integer_reading`, `money_4digit_counting`

**Example:**
```json
{
  "requiresVisualRenderer": true,
  "textFallbackAvailable": true,
  "humanReviewRequired": true,
  "answerStatusLimit": "to_be_verified"
}
```

---

## 7. Answer Model Types

Each PatternSpec uses exactly one answer model type. The answer model defines the shape of the expected answer and the validator hook used.

### 7.1 scalarNumberAnswer

**Shape:** A single numeric value.

```json
{
  "answerModelType": "scalarNumberAnswer",
  "shape": {
    "value": "number"
  },
  "example": { "value": 7058 },
  "compatiblePatterns": ["pv_4digit_compose", "rw_4digit_chinese_to_number"],
  "validatorHook": "validateNumericRange"
}
```

### 7.2 placeValueDecompositionAnswer

**Shape:** Decomposed place-value parts plus a total.

```json
{
  "answerModelType": "placeValueDecompositionAnswer",
  "shape": {
    "thousands": "number",
    "hundreds": "number",
    "tens": "number",
    "ones": "number",
    "total": "number"
  },
  "example": { "thousands": 7, "hundreds": 0, "tens": 6, "ones": 3, "total": 7063 },
  "compatiblePatterns": ["pv_4digit_decompose"],
  "validatorHook": "validatePlaceValueDecomposition"
}
```

### 7.3 placeValueCompositionAnswer

**Shape:** A single composed number.

```json
{
  "answerModelType": "placeValueCompositionAnswer",
  "shape": {
    "value": "number"
  },
  "example": { "value": 7058 },
  "compatiblePatterns": ["pv_4digit_compose"],
  "validatorHook": "validatePlaceValueComposition"
}
```

### 7.4 chineseNumberAnswer

**Shape:** A zh-Hant Chinese number reading string.

```json
{
  "answerModelType": "chineseNumberAnswer",
  "shape": {
    "chinese": "string"
  },
  "example": { "chinese": "五千三百零一" },
  "compatiblePatterns": ["rw_4digit_number_to_chinese", "rw_4digit_zero_reading"],
  "validatorHook": "validateChineseNumberReading"
}
```

### 7.5 comparisonAnswer

**Shape:** A relational operator.

```json
{
  "answerModelType": "comparisonAnswer",
  "shape": {
    "relation": "string"
  },
  "example": { "relation": "<" },
  "compatiblePatterns": ["cmp_4digit_compare"],
  "validatorHook": "validateFourDigitComparison"
}
```

### 7.6 sequenceAnswer

**Shape:** An array of values with a step model describing how each successive value is derived.

```json
{
  "answerModelType": "sequenceAnswer",
  "shape": {
    "values": "number[]",
    "stepModel": {
      "mode": "single | varying | place_sequence",
      "step": "number | null",
      "steps": "number[] | null"
    },
    "direction": "string"
  },
  "example": {
    "values": [2986, 2996, 3096, 4096],
    "stepModel": {
      "mode": "place_sequence",
      "step": null,
      "steps": [1, 10, 100, 1000]
    },
    "direction": "forward"
  },
  "compatiblePatterns": ["seq_4digit_place_step", "seq_between_two_numbers"],
  "validatorHook": "validateSequenceStep"
}
```

**`stepModel.mode` usage by pattern:**

| Pattern | `stepModel.mode` | `stepModel.step` | `stepModel.steps` |
|---|---|---|---|
| `seq_4digit_place_step` | `place_sequence` | `null` | `[1, 10, 100, 1000]` (or reverse) |
| `seq_between_two_numbers` | `single` | fixed step (e.g., `1`, `10`) | `null` |
| (reserved for future) | `varying` | — | — |

`stepModel.mode = "varying"` is reserved for future sequence patterns and is not required for current G3A U01 production generation.

### 7.7 maxMinDigitArrangementAnswer

**Shape:** A max and min number from digit permutation.

```json
{
  "answerModelType": "maxMinDigitArrangementAnswer",
  "shape": {
    "max": "number",
    "min": "number"
  },
  "example": { "max": 8520, "min": 2058 },
  "compatiblePatterns": ["perm_4digit_max_min_from_digits"],
  "validatorHook": "validateDigitArrangementMaxMin"
}
```

### 7.8 moneyTotalAnswer

**Shape:** A money total with possible remainder.

```json
{
  "answerModelType": "moneyTotalAnswer",
  "shape": {
    "total": "number",
    "denominationBreakdown": "object (optional)",
    "remainder": "object (optional)"
  },
  "example": { "total": 550, "denominationBreakdown": {"hundred_bills": 5, "ten_coins": 5}, "remainder": {"value": 50, "unit": "元"} },
  "compatiblePatterns": ["money_4digit_counting", "money_4digit_payment"],
  "validatorHook": "validateMoneyTotal"
}
```

### 7.9 moneyExchangeAnswer

**Shape:** Exchange result with optional remainder.

```json
{
  "answerModelType": "moneyExchangeAnswer",
  "shape": {
    "targetDenomination": "object",
    "count": "number",
    "remainder": "object (optional)"
  },
  "example": { "targetDenomination": {"unit": "張", "value": 100}, "count": 5, "remainder": {"count": 5, "unit": "個", "value": 10, "totalRemainder": 50} },
  "compatiblePatterns": ["money_4digit_payment"],
  "validatorHook": "validateMoneyExchange"
}
```

### 7.10 numberLinePositionAnswer

**Shape:** A numeric value read from a number-line position, or `omitted_for_template`.

```json
{
  "answerModelType": "numberLinePositionAnswer",
  "shape": {
    "value": "number | null"
  },
  "example": { "value": null },
  "compatiblePatterns": ["numline_integer_reading"],
  "validatorHook": "validateNumberLineTextFallback"
}
```

### 7.11 omittedTemplateAnswer

**Shape:** Intentionally empty; used when the pattern serves as a format placeholder.

```json
{
  "answerModelType": "omittedTemplateAnswer",
  "shape": {
    "value": null,
    "reason": "string"
  },
  "example": { "value": null, "reason": "Visual answer extraction intentionally deferred." },
  "compatiblePatterns": ["numline_integer_reading"],
  "validatorHook": "validateSourceBoundary"
}
```

---

## 8. Validator Hook Naming Contract

This section defines validator hook names and their contracts. It does **not** implement validator code.

### 8.1 Hook list

| # | Hook name | Purpose | Input assumptions | Output | Related S21C checks |
|---|---|---|---|---|---|
| H1 | `validateNumericRange` | Confirm all numeric values are within allowed range. | Item values, NumericRangeConstraint from PatternSpec. | pass/fail + `RANGE_OUT_OF_SCOPE` error code. | V2 |
| H2 | `validateDigitCount` | Confirm the number of digits matches the pattern requirement. | Item value, DigitConstraint. | pass/fail + `INVALID_DIGIT_COUNT` or `LEADING_ZERO_NOT_ALLOWED`. | V3 |
| H3 | `validatePlaceValueDecomposition` | Confirm decomposition parts sum to the total and match place-value positions. | Decomposition parts, total, PlaceValueConstraint. | pass/fail + `PLACE_VALUE_MISMATCH`. | V1 |
| H4 | `validatePlaceValueComposition` | Confirm the composed number matches the sum of place-value parts. | Place-value parts, composed number, PlaceValueConstraint. | pass/fail + `PLACE_VALUE_MISMATCH`. | V1 |
| H5 | `validateChineseNumberReading` | Confirm Chinese reading follows Taiwan G3A zh-Hant convention. | Numeric value, Chinese reading string, ChineseNumberReadingConstraint. | pass/fail + `CHINESE_READING_MISMATCH`. | V4 |
| H6 | `validateChineseToNumber` | Confirm Chinese wording converts correctly to a numeric value. | Chinese wording, expected numeric value, ChineseNumberReadingConstraint. | pass/fail + `CHINESE_READING_MISMATCH`. | V4 |
| H7 | `validateZeroReading` | Confirm internal zeroes are read according to the consecutive-zero-as-single-零 rule. | Numeric value, Chinese reading string, zero rule. | pass/fail + `ZERO_READING_MISMATCH`. | V4 |
| H8 | `validateDigitArrangementMaxMin` | Confirm max/min arrangement is correct and leading zero is not allowed for four-digit numbers. | Digit set, max value, min value, DigitConstraint. | pass/fail + `INVALID_DIGIT_COUNT` or `LEADING_ZERO_NOT_ALLOWED`. | V1, V3 |
| H9 | `validateFourDigitComparison` | Confirm relational operator matches numeric comparison. | Value A, value B, relation, ComparisonConstraint. | pass/fail + `COMPARISON_MISMATCH`. | V5 |
| H10 | `validateSequenceStep` | Validate sequence steps according to `stepModel.mode`: either a single fixed step (`mode = "single"`) or a place-sequence step list (`mode = "place_sequence"`). | Sequence values, stepModel, direction, SequenceConstraint. | pass/fail + `SEQUENCE_STEP_MISMATCH`. | V6 |
| H11 | `validateBetweenNumbersSequence` | Validate fixed-step between-number sequences using `stepModel.mode = "single"`. Confirm blanks are filled correctly between endpoints. | Endpoint values, filled values, stepModel (mode = "single"), SequenceConstraint. | pass/fail + `SEQUENCE_STEP_MISMATCH`. | V6 |
| H12 | `validateMoneyTotal` | Confirm total computed from denominations matches the expected answer. | Denomination counts, total, MoneyConstraint. | pass/fail + `MONEY_TOTAL_MISMATCH`. | V7 |
| H13 | `validateMoneyExchange` | Confirm exchange arithmetic is correct and remainder is valid. | Source denominations, target denomination, count, remainder, MoneyConstraint. | pass/fail + `MONEY_EXCHANGE_MISMATCH`. | V7 |
| H14 | `validateNumberLineTextFallback` | Confirm number-line position can be described in text and the answer is derivable from the text fallback. | Text fallback description, expected position value, NumberLineConstraint. | pass/fail + `UNSUPPORTED_VISUAL_DEPENDENCY`. | V10 |
| H15 | `validateSupportStatusCompatibility` | Confirm item's supportStatus does not exceed the parent PatternSpec's supportStatus. | Item supportStatus, PatternSpec supportStatus. | pass/fail + `SUPPORT_STATUS_MISMATCH`. | V9 |
| H16 | `validateNoFutureDomainLeakage` | Confirm item does not introduce fractions, decimals, geometry, speed, area, volume, probability, algebra, or negative numbers. | Item content. | pass/fail + `FUTURE_DOMAIN_LEAKAGE`. | V11 |
| H17 | `validateNoUnsupportedVisualDependency` | Confirm visual items have an explicit textFallback or remain gated. | Item content, VisualDependencyConstraint. | pass/fail + `UNSUPPORTED_VISUAL_DEPENDENCY`. | V10 |
| H18 | `validateUniqueAnswer` | Confirm item has exactly one unambiguous correct answer. | Item prompt, answer model, constraints. | pass/fail + `AMBIGUOUS_ANSWER`. | V12 |
| H19 | `validateSourceBoundary` | Confirm item does not falsely claim sourceBacked or verified; confirm source traceability. | Item provenance, answerStatus, source evidence. | pass/fail + `SOURCE_BOUNDARY_VIOLATION`. | Source boundary rules (§3) |

### 8.2 Hook to pattern mapping

| Pattern | Required hooks |
|---|---|
| `pv_4digit_decompose` | H1, H2, H3, H15, H16, H18, H19 |
| `pv_4digit_compose` | H1, H2, H4, H15, H16, H18, H19 |
| `rw_4digit_number_to_chinese` | H1, H2, H5, H7, H15, H16, H18, H19 |
| `rw_4digit_chinese_to_number` | H1, H2, H6, H15, H16, H18, H19 |
| `rw_4digit_zero_reading` | H1, H2, H5, H7, H15, H16, H18, H19 |
| `seq_4digit_place_step` | H1, H2, H10, H15, H16, H18, H19 |
| `seq_between_two_numbers` | H1, H2, H11, H15, H16, H18, H19 |
| `cmp_4digit_compare` | H1, H2, H9, H15, H16, H18, H19 |
| `perm_4digit_max_min_from_digits` | H1, H2, H8, H15, H16, H18, H19 |
| `numline_integer_reading` | H1, H14, H15, H16, H17, H18, H19 |
| `money_4digit_counting` | H1, H12, H15, H16, H17, H18, H19 |
| `money_4digit_payment` | H1, H12, H13, H15, H16, H18, H19 |

---

## 9. G3A U01 PatternSpec Seed Table

This table maps all 12 S21B QuestionPatterns to their proposed PatternSpec seeds.

| sourceQuestionPatternId | proposedPatternSpecId | questionKind | supportStatus | defaultGenerationMode | answerModelType | primaryConstraints | validatorHooks | humanReviewRequired? | productionStorageAllowed? | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `pv_4digit_decompose` | `spec_pv_4digit_decompose` | `decompose` | `v1NumberSenseSupported` | `rule_based` | `placeValueDecompositionAnswer` | NumericRange, PlaceValue | H1, H2, H3, H15, H16, H18, H19 | No | Yes | Verified source-backed example exists. |
| `pv_4digit_compose` | `spec_pv_4digit_compose` | `compose` | `v1NumberSenseSupported` | `rule_based` | `placeValueCompositionAnswer` | NumericRange, PlaceValue | H1, H2, H4, H15, H16, H18, H19 | No | Yes | Includes zero-handling edge case (missing hundreds place). |
| `rw_4digit_number_to_chinese` | `spec_rw_4digit_number_to_chinese` | `transcode` | `v1NumberSenseSupported` | `rule_based` | `chineseNumberAnswer` | NumericRange, Digit, ChineseNumberReading | H1, H2, H5, H7, H15, H16, H18, H19 | No | Yes | Taiwan G3A zh-Hant convention. |
| `rw_4digit_chinese_to_number` | `spec_rw_4digit_chinese_to_number` | `transcode` | `v1NumberSenseSupported` | `rule_based` | `scalarNumberAnswer` | NumericRange, Digit, ChineseNumberReading | H1, H2, H6, H15, H16, H18, H19 | No | Yes | Reverse direction of above. |
| `rw_4digit_zero_reading` | `spec_rw_4digit_zero_reading` | `transcode` | `v1NumberSenseSupported` | `rule_based` | `chineseNumberAnswer` | NumericRange, Digit (zeroHandling=consecutive_zero_rule), ChineseNumberReading | H1, H2, H5, H7, H15, H16, H18, H19 | No | Yes | Consecutive-zero single-零 rule enforced. |
| `seq_4digit_place_step` | `spec_seq_4digit_place_step` | `sequence` | `v1NumberSenseSupported` | `rule_based` | `sequenceAnswer` | NumericRange, Sequence (stepPerItem=place_sequence) | H1, H2, H10, H15, H16, H18, H19 | No | Yes | +1/+10/+100/+1000 or reverse. |
| `seq_between_two_numbers` | `spec_seq_between_two_numbers` | `sequence` | `v1NumberSenseSupported` | `rule_based` | `sequenceAnswer` | NumericRange, Sequence (stepPerItem=single) | H1, H2, H11, H15, H16, H18, H19 | No | Yes | Fill blanks between endpoints. |
| `cmp_4digit_compare` | `spec_cmp_4digit_compare` | `compare` | `v1NumberSenseSupported` | `rule_based` | `comparisonAnswer` | NumericRange, Comparison | H1, H2, H9, H15, H16, H18, H19 | No | Yes | Supports numeral-vs-Chinese mixed comparisons. |
| `perm_4digit_max_min_from_digits` | `spec_perm_4digit_max_min_from_digits` | `optimize_from_digits` | `v1NumberSenseSupported` | `rule_based` | `maxMinDigitArrangementAnswer` | NumericRange, Digit (allowLeadingZero=false) | H1, H2, H8, H15, H16, H18, H19 | No | Yes | Leading-zero rule enforced. |
| `numline_integer_reading` | `spec_numline_integer_reading` | `visual_reading` | `v1TextFallbackSupported` | `ai_draft` | `numberLinePositionAnswer` / `omittedTemplateAnswer` | NumberLine, VisualDependency (textFallbackAvailable=true) | H1, H14, H15, H16, H17, H18, H19 | Yes — `human_reviewed` required before production | Conditional (text-fallback only) | Visual answer omitted_for_template; textFallback items require review. |
| `money_4digit_counting` | `spec_money_4digit_counting` | `visual_reading` | `v1TextFallbackSupported` | `ai_draft` | `moneyTotalAnswer` | NumericRange, Money (visualDependency=text_fallback), VisualDependency | H1, H12, H15, H16, H17, H18, H19 | Yes — `human_reviewed` required before production | Conditional (text-fallback only) | Visual panel answer to_be_verified; text-fallback items may proceed after review. |
| `money_4digit_payment` | `spec_money_4digit_payment` | `representation_payment` | `v1TextFallbackSupported` | `rule_based` | `moneyExchangeAnswer` / `moneyTotalAnswer` | NumericRange, Money (visualDependency=text_fallback) | H1, H12, H13, H15, H16, H18, H19 | No | Yes | Verified text-fallback pattern. Remainder handling documented. |

---

## 10. PatternSpec Illustrative JSON Examples

These are **illustrative examples only**. No actual PatternSpec JSON files are created by this task.

### 10A. `spec_pv_4digit_decompose` PatternSpec

```json
{
  "patternSpecId": "spec_pv_4digit_decompose",
  "version": "1.0.0",
  "curriculumNodeId": "g3a_u01_numbers_within_10000",
  "sourceQuestionPatternId": "pv_4digit_decompose",
  "sourceExampleItemRefs": ["ex_g3a_u01_p2_type01_001"],
  "canonicalSkillIds": ["place_value", "number_decomposition"],
  "questionKind": "decompose",
  "supportStatus": "v1NumberSenseSupported",
  "generationModeDefault": "rule_based",
  "allowedGenerationModes": ["rule_based", "ai_draft"],
  "difficultyTags": ["basic", "place_value_direct"],
  "constraints": {
    "numericRange": {
      "minValue": 1000,
      "maxValue": 9999,
      "allowZero": false,
      "allowNegative": false,
      "integerOnly": true
    },
    "digit": {
      "digitCount": 4,
      "allowLeadingZero": false,
      "zeroHandling": "zero_allowed_but_not_required"
    },
    "placeValue": {
      "places": ["thousands", "hundreds", "tens", "ones"],
      "allowMissingPlace": false,
      "requireZeroPlace": false,
      "decompositionMode": "ordered_place_parts"
    }
  },
  "answerModel": {
    "answerModelType": "placeValueDecompositionAnswer",
    "shape": {
      "thousands": "number",
      "hundreds": "number",
      "tens": "number",
      "ones": "number",
      "total": "number"
    },
    "example": { "thousands": 7, "hundreds": 0, "tens": 6, "ones": 3, "total": 7063 }
  },
  "validatorHooks": [
    "validateNumericRange",
    "validateDigitCount",
    "validatePlaceValueDecomposition",
    "validateSupportStatusCompatibility",
    "validateNoFutureDomainLeakage",
    "validateUniqueAnswer",
    "validateSourceBoundary"
  ],
  "rendererRequirements": {
    "requiresVisualRenderer": false,
    "textFallbackAvailable": true
  },
  "textFallbackPolicy": {
    "textFallbackRequired": false,
    "textFallbackDescription": null
  },
  "sourceMetadata": {
    "sourceMappingFile": "S21B_G3A_U01_10000Numbers_FormalPatternMapping.md",
    "sourceQuestionPatternId": "pv_4digit_decompose",
    "sourceExampleItemRefs": ["ex_g3a_u01_p2_type01_001"],
    "sourceBackedStatus": "pattern_level_source_backed",
    "answerStatusFromSource": "verified",
    "extractionMethod": "operator_provided_visual_verification_notes",
    "humanVerificationRequired": false,
    "sourceBoundaryNotes": "Source-backed at pattern level. Generated examples are generatedFromPattern, not sourceBacked."
  },
  "provenance": {
    "createdBy": "S21E_PatternSpecSchemaAndSeedDesign",
    "createdAt": "2026-06-30T00:00:00Z",
    "policyVersion": "S21C1",
    "schemaVersion": "1.0.0",
    "priorPolicyRefs": ["S21B", "S21C1", "S21D"]
  },
  "runtimeGenerationPolicy": {
    "allowRuntimeGeneration": true,
    "requiresPermanentStorage": false
  },
  "productionStoragePolicy": {
    "allowProductionStorage": true,
    "requiresHumanReview": false,
    "promotionCategories": ["item_bank", "benchmark_set", "qa_seed_set", "curated_worksheet"]
  },
  "lifecycleStatus": "active",
  "notes": "Leading zero is not applicable since the decomposed number is always a valid four-digit number (1000–9999). Zero-handling edge cases occur when internal digits are 0 (e.g., 7063 has 0 hundreds)."
}
```

### 10B. `spec_rw_4digit_zero_reading` PatternSpec

```json
{
  "patternSpecId": "spec_rw_4digit_zero_reading",
  "version": "1.0.0",
  "curriculumNodeId": "g3a_u01_numbers_within_10000",
  "sourceQuestionPatternId": "rw_4digit_zero_reading",
  "sourceExampleItemRefs": ["ex_g3a_u01_p2_type03_003"],
  "canonicalSkillIds": ["zero_in_four_digit_number", "number_reading_writing"],
  "questionKind": "transcode",
  "supportStatus": "v1NumberSenseSupported",
  "generationModeDefault": "rule_based",
  "allowedGenerationModes": ["rule_based", "ai_draft"],
  "difficultyTags": ["intermediate", "zero_handling"],
  "constraints": {
    "numericRange": {
      "minValue": 1000,
      "maxValue": 9999,
      "allowZero": false,
      "allowNegative": false,
      "integerOnly": true
    },
    "digit": {
      "digitCount": 4,
      "allowLeadingZero": false,
      "zeroHandling": "consecutive_zero_rule"
    },
    "chineseNumberReading": {
      "locale": "zh-Hant-TW",
      "zeroRule": "consecutive_zero_single_ling",
      "maxNumber": 10000,
      "allowedForms": ["standard_taiwan_g3a"],
      "disallowedForms": []
    }
  },
  "answerModel": {
    "answerModelType": "chineseNumberAnswer",
    "shape": { "chinese": "string" },
    "example": { "chinese": "五千零三" }
  },
  "validatorHooks": [
    "validateNumericRange",
    "validateDigitCount",
    "validateChineseNumberReading",
    "validateZeroReading",
    "validateSupportStatusCompatibility",
    "validateNoFutureDomainLeakage",
    "validateUniqueAnswer",
    "validateSourceBoundary"
  ],
  "rendererRequirements": {
    "requiresVisualRenderer": false,
    "textFallbackAvailable": true
  },
  "textFallbackPolicy": {
    "textFallbackRequired": false,
    "textFallbackDescription": null
  },
  "sourceMetadata": {
    "sourceMappingFile": "S21B_G3A_U01_10000Numbers_FormalPatternMapping.md",
    "sourceQuestionPatternId": "rw_4digit_zero_reading",
    "sourceExampleItemRefs": ["ex_g3a_u01_p2_type03_003"],
    "sourceBackedStatus": "pattern_level_source_backed",
    "answerStatusFromSource": "verified",
    "extractionMethod": "operator_provided_visual_verification_notes",
    "humanVerificationRequired": false,
    "sourceBoundaryNotes": "Source-backed at pattern level. 5003 → 五千零三 demonstrates consecutive-zero-as-single-零 rule."
  },
  "provenance": {
    "createdBy": "S21E_PatternSpecSchemaAndSeedDesign",
    "createdAt": "2026-06-30T00:00:00Z",
    "policyVersion": "S21C1",
    "schemaVersion": "1.0.0",
    "priorPolicyRefs": ["S21B", "S21C1", "S21D"]
  },
  "runtimeGenerationPolicy": {
    "allowRuntimeGeneration": true,
    "requiresPermanentStorage": false
  },
  "productionStoragePolicy": {
    "allowProductionStorage": true,
    "requiresHumanReview": false,
    "promotionCategories": ["item_bank", "benchmark_set", "qa_seed_set", "curated_worksheet"]
  },
  "lifecycleStatus": "active",
  "notes": "Zero-reading examples must include at least one internal zero. Edge cases: 5003 (two consecutive zeroes → 五千零三), 5030 (五千零三十), 5100 (五千一百, single zero at tens)."
}
```

### 10C. `spec_seq_4digit_place_step` PatternSpec

```json
{
  "patternSpecId": "spec_seq_4digit_place_step",
  "version": "1.0.0",
  "curriculumNodeId": "g3a_u01_numbers_within_10000",
  "sourceQuestionPatternId": "seq_4digit_place_step",
  "sourceExampleItemRefs": ["ex_g3a_u01_p1_seq_001"],
  "canonicalSkillIds": ["place_value_sequence", "number_ordering"],
  "questionKind": "sequence",
  "supportStatus": "v1NumberSenseSupported",
  "generationModeDefault": "rule_based",
  "allowedGenerationModes": ["rule_based", "ai_draft"],
  "difficultyTags": ["intermediate", "sequence_step"],
  "constraints": {
    "numericRange": {
      "minValue": 1000,
      "maxValue": 9000,
      "allowZero": false,
      "allowNegative": false,
      "integerOnly": true
    },
    "sequence": {
      "allowedSteps": [1, 10, 100, 1000],
      "direction": ["forward", "backward"],
      "length": {"min": 4, "max": 4},
      "blankCount": {"min": 4, "max": 4},
      "bounds": {"minValue": 1, "maxValue": 10000, "allowZero": false, "allowNegative": false, "integerOnly": true},
      "stepPerItem": "place_sequence"
    }
  },
  "answerModel": {
    "answerModelType": "sequenceAnswer",
    "shape": {
      "values": "number[]",
      "stepModel": {
        "mode": "single | varying | place_sequence",
        "step": "number | null",
        "steps": "number[] | null"
      },
      "direction": "string"
    },
    "example": {
      "values": [2986, 2996, 3096, 4096],
      "stepModel": {
        "mode": "place_sequence",
        "step": null,
        "steps": [1, 10, 100, 1000]
      },
      "direction": "forward"
    }
  },
  "validatorHooks": [
    "validateNumericRange",
    "validateDigitCount",
    "validateSequenceStep",
    "validateSupportStatusCompatibility",
    "validateNoFutureDomainLeakage",
    "validateUniqueAnswer",
    "validateSourceBoundary"
  ],
  "rendererRequirements": {
    "requiresVisualRenderer": false,
    "textFallbackAvailable": true
  },
  "textFallbackPolicy": {
    "textFallbackRequired": false,
    "textFallbackDescription": null
  },
  "sourceMetadata": {
    "sourceMappingFile": "S21B_G3A_U01_10000Numbers_FormalPatternMapping.md",
    "sourceQuestionPatternId": "seq_4digit_place_step",
    "sourceExampleItemRefs": ["ex_g3a_u01_p1_seq_001"],
    "sourceBackedStatus": "pattern_level_source_backed",
    "answerStatusFromSource": "verified",
    "extractionMethod": "operator_provided_visual_verification_notes",
    "humanVerificationRequired": false,
    "sourceBoundaryNotes": "Source-backed at pattern level. Starting number must allow all four steps without exceeding 10000."
  },
  "provenance": {
    "createdBy": "S21E_PatternSpecSchemaAndSeedDesign",
    "createdAt": "2026-06-30T00:00:00Z",
    "policyVersion": "S21C1",
    "schemaVersion": "1.0.0",
    "priorPolicyRefs": ["S21B", "S21C1", "S21D"]
  },
  "runtimeGenerationPolicy": {
    "allowRuntimeGeneration": true,
    "requiresPermanentStorage": false
  },
  "productionStoragePolicy": {
    "allowProductionStorage": true,
    "requiresHumanReview": false,
    "promotionCategories": ["item_bank", "benchmark_set", "qa_seed_set", "curated_worksheet"]
  },
  "lifecycleStatus": "active",
  "notes": "Starting range capped at 9000 to ensure +1000 step stays within 10000 for forward sequences. For backward sequences, starting range must be ≥ (1000 + sum of steps)."
}
```

### 10D. `spec_money_4digit_payment` PatternSpec

```json
{
  "patternSpecId": "spec_money_4digit_payment",
  "version": "1.0.0",
  "curriculumNodeId": "g3a_u01_numbers_within_10000",
  "sourceQuestionPatternId": "money_4digit_payment",
  "sourceExampleItemRefs": ["ex_g3a_u01_p3_type05_001"],
  "canonicalSkillIds": ["money_representation", "number_decomposition"],
  "questionKind": "representation_payment",
  "supportStatus": "v1TextFallbackSupported",
  "generationModeDefault": "rule_based",
  "allowedGenerationModes": ["rule_based", "ai_draft"],
  "difficultyTags": ["intermediate", "representation_composition"],
  "constraints": {
    "numericRange": {
      "minValue": 0,
      "maxValue": 10000,
      "allowZero": true,
      "allowNegative": false,
      "integerOnly": true
    },
    "money": {
      "allowedDenominations": [
        {"unit": "張", "value": 1000},
        {"unit": "張", "value": 100},
        {"unit": "個", "value": 10},
        {"unit": "個", "value": 1}
      ],
      "totalMax": 10000,
      "exchangeAllowed": true,
      "remainderAllowed": true,
      "visualDependency": "text_fallback",
      "textFallbackRequired": true
    }
  },
  "answerModel": {
    "answerModelType": "moneyExchangeAnswer",
    "shape": {
      "targetDenomination": "object",
      "count": "number",
      "remainder": "object (optional)"
    },
    "example": {
      "targetDenomination": {"unit": "張", "value": 100},
      "count": 5,
      "remainder": {"count": 5, "unit": "個", "value": 10, "totalRemainder": 50}
    }
  },
  "validatorHooks": [
    "validateNumericRange",
    "validateMoneyTotal",
    "validateMoneyExchange",
    "validateSupportStatusCompatibility",
    "validateNoFutureDomainLeakage",
    "validateUniqueAnswer",
    "validateSourceBoundary"
  ],
  "rendererRequirements": {
    "requiresVisualRenderer": false,
    "textFallbackAvailable": true
  },
  "textFallbackPolicy": {
    "textFallbackRequired": true,
    "textFallbackDescription": "All money payment prompts must use text-described denomination quantities. Visual money diagrams are not required for v1 support."
  },
  "sourceMetadata": {
    "sourceMappingFile": "S21B_G3A_U01_10000Numbers_FormalPatternMapping.md",
    "sourceQuestionPatternId": "money_4digit_payment",
    "sourceExampleItemRefs": ["ex_g3a_u01_p3_type05_001"],
    "sourceBackedStatus": "pattern_level_source_backed",
    "answerStatusFromSource": "verified",
    "extractionMethod": "operator_provided_visual_verification_notes",
    "humanVerificationRequired": false,
    "sourceBoundaryNotes": "Source-backed at pattern level. Source asks only for hundred-bill count; remainder documented for completeness."
  },
  "provenance": {
    "createdBy": "S21E_PatternSpecSchemaAndSeedDesign",
    "createdAt": "2026-06-30T00:00:00Z",
    "policyVersion": "S21C1",
    "schemaVersion": "1.0.0",
    "priorPolicyRefs": ["S21B", "S21C1", "S21D"]
  },
  "runtimeGenerationPolicy": {
    "allowRuntimeGeneration": true,
    "requiresPermanentStorage": false
  },
  "productionStoragePolicy": {
    "allowProductionStorage": true,
    "requiresHumanReview": false,
    "promotionCategories": ["item_bank", "benchmark_set", "qa_seed_set", "curated_worksheet"]
  },
  "lifecycleStatus": "active",
  "notes": "Text-fallback deterministic pattern. Exchange examples: 55×10=550元→5張100元+剩5個10元. Remainder should be optional: some source questions ask only for the main exchange count."
}
```

### 10E. `spec_numline_integer_reading` TextFallback-Only PatternSpec

```json
{
  "patternSpecId": "spec_numline_integer_reading",
  "version": "1.0.0",
  "curriculumNodeId": "g3a_u01_numbers_within_10000",
  "sourceQuestionPatternId": "numline_integer_reading",
  "sourceExampleItemRefs": ["ex_g3a_u01_p3_type09_001"],
  "canonicalSkillIds": ["number_line"],
  "questionKind": "visual_reading",
  "supportStatus": "v1TextFallbackSupported",
  "generationModeDefault": "ai_draft",
  "allowedGenerationModes": ["ai_draft", "manual_curated"],
  "difficultyTags": ["intermediate", "visual_interpretation"],
  "constraints": {
    "numericRange": {
      "minValue": 0,
      "maxValue": 10000,
      "allowZero": true,
      "allowNegative": false,
      "integerOnly": true
    },
    "numberLine": {
      "tickSpacing": 100,
      "startValue": 0,
      "endValue": 10000,
      "labeledTicks": "endpoints",
      "missingTickPolicy": "text_fallback_required",
      "textFallbackRequired": true
    },
    "visualDependency": {
      "requiresVisualRenderer": true,
      "textFallbackAvailable": true,
      "humanReviewRequired": true,
      "answerStatusLimit": "to_be_verified"
    }
  },
  "answerModel": {
    "answerModelType": "numberLinePositionAnswer",
    "shape": { "value": "number | null" },
    "example": { "value": null }
  },
  "validatorHooks": [
    "validateNumericRange",
    "validateNumberLineTextFallback",
    "validateSupportStatusCompatibility",
    "validateNoFutureDomainLeakage",
    "validateNoUnsupportedVisualDependency",
    "validateUniqueAnswer",
    "validateSourceBoundary"
  ],
  "rendererRequirements": {
    "requiresVisualRenderer": true,
    "textFallbackAvailable": true
  },
  "textFallbackPolicy": {
    "textFallbackRequired": true,
    "textFallbackDescription": "Number-line questions must use text-described positions until a visual renderer exists. Example text fallback: '數線上從 0 到 10000，每隔 100 標一個刻度。箭頭指在刻度 3700 的位置。'"
  },
  "sourceMetadata": {
    "sourceMappingFile": "S21B_G3A_U01_10000Numbers_FormalPatternMapping.md",
    "sourceQuestionPatternId": "numline_integer_reading",
    "sourceExampleItemRefs": ["ex_g3a_u01_p3_type09_001"],
    "sourceBackedStatus": "pattern_level_source_backed",
    "answerStatusFromSource": "omitted_for_template",
    "extractionMethod": "operator_provided_visual_verification_notes",
    "humanVerificationRequired": true,
    "sourceBoundaryNotes": "Source-backed visual number-line panel. Answer positions are visual and intentionally deferred. Text-fallback items require human review."
  },
  "provenance": {
    "createdBy": "S21E_PatternSpecSchemaAndSeedDesign",
    "createdAt": "2026-06-30T00:00:00Z",
    "policyVersion": "S21C1",
    "schemaVersion": "1.0.0",
    "priorPolicyRefs": ["S21B", "S21C1", "S21D"]
  },
  "runtimeGenerationPolicy": {
    "allowRuntimeGeneration": false,
    "requiresPermanentStorage": false,
    "notes": "Runtime generation is disabled until a visual renderer or text-fallback generation path is implemented and reviewed."
  },
  "productionStoragePolicy": {
    "allowProductionStorage": true,
    "requiresHumanReview": true,
    "promotionCategories": ["benchmark_set", "qa_seed_set", "curated_worksheet"],
    "notes": "Only text-fallback items that have passed human review may be promoted. Visual-only items must remain to_be_verified or omitted_for_template."
  },
  "lifecycleStatus": "active",
  "notes": "Gated pattern. v1 support is limited to text-fallback descriptions. No visual number-line renderer exists. Items must be human-reviewed before production. The source example is omitted_for_template because the answer depends on visual number-line positions."
}
```

---

## 11. Runtime Generation Policy

### 11.1 Definition

Runtime generation produces worksheet items from a `PatternSpec` + `randomSeed` at worksheet generation time, without requiring permanent `GeneratedItem` JSON storage.

### 11.2 Rules

| Rule | Description |
|---|---|
| R1 | A PatternSpec + randomSeed may generate runtime worksheet items. |
| R2 | Runtime items must pass the deterministic validator before output. |
| R3 | Runtime items do not require permanent GeneratedItem JSON storage. |
| R4 | Runtime items must not be marked `verified` or `sourceBacked`. |
| R5 | Runtime deterministic answers should be `computed` if persisted to storage. |
| R6 | If not persisted, answer metadata may remain transient (no `answerStatus` stored). |
| R7 | Runtime generation is allowed only for patterns with `runtimeGenerationPolicy.allowRuntimeGeneration = true`. |
| R8 | Runtime generation must respect all PatternSpec constraints. |
| R9 | Runtime generation must produce a deterministic correct answer. |
| R10 | Runtime items must not exceed the supportStatus of their parent PatternSpec. |

### 11.3 Patterns eligible for runtime generation

| Pattern | Runtime generation allowed? | Notes |
|---|---|---|
| `spec_pv_4digit_decompose` | Yes | Deterministic, no visual dependency. |
| `spec_pv_4digit_compose` | Yes | Deterministic, no visual dependency. |
| `spec_rw_4digit_number_to_chinese` | Yes | Deterministic, text output. |
| `spec_rw_4digit_chinese_to_number` | Yes | Deterministic, text-to-number conversion. |
| `spec_rw_4digit_zero_reading` | Yes | Deterministic, zero-reading rules. |
| `spec_seq_4digit_place_step` | Yes | Deterministic, step computation. |
| `spec_seq_between_two_numbers` | Yes | Deterministic, between-numbers fill. |
| `spec_cmp_4digit_compare` | Yes | Deterministic, comparison. |
| `spec_perm_4digit_max_min_from_digits` | Yes | Deterministic, digit permutation. |
| `spec_money_4digit_payment` | Yes | Deterministic, text-fallback money exchange. |
| `spec_money_4digit_counting` | Conditional | Only if text-fallback items are implemented and reviewed. |
| `spec_numline_integer_reading` | No | Disabled until text-fallback path is implemented and reviewed. |

---

## 12. Production Storage Promotion Policy

### 12.1 Promotion categories

A runtime or generated item may be promoted to production storage for:

| Category | Description |
|---|---|
| Curated item bank | Reusable question inventory for worksheet generators. |
| Benchmark set | Calibrated difficulty anchor items for QA and evaluation. |
| QA seed set | Items used to validate generator output quality. |
| Recurring worksheet source | Pre-authored items for specific worksheets or exercise sets. |
| Manual review selected | Items specifically chosen by a human reviewer for production. |
| Validator regression seed | Items used to test and maintain validator correctness. |
| LiteracyItem parent / fusion seed | Items used as parent seeds for LiteracyItem fusion generation. |

### 12.2 Prerequisites for promotion

Before any item can be promoted to production storage, all of the following must be satisfied:

| # | Requirement |
|---|---|
| P1 | A PatternSpec exists for the item's parent pattern. |
| P2 | The item has passed all required validator hooks (pass/fail, not partial). |
| P3 | The item's supportStatus is compatible with its PatternSpec supportStatus. |
| P4 | No future-domain leakage exists (V11, H16). |
| P5 | No source boundary violation exists (H19). |
| P6 | `answerStatus = computed` for deterministic GeneratedItem. |
| P7 | `answerStatus = verified` only if human/source reviewed (S21C1 §6.2). |
| P8 | If `humanReviewRequired` per PatternSpec, human review has been completed. |
| P9 | The item has exactly one unambiguous correct answer (V12, H18). |
| P10 | Production storage policy for the parent PatternSpec allows promotion. |

### 12.3 Visual item promotion restriction

No visual item may be promoted to `verified` from PatternSpec alone. Visual items must:

- Have a textFallback if they are to be promoted, OR
- Remain `to_be_verified` or `omitted_for_template` until human review is complete.

---

## 13. SupportStatus Mapping

### 13.1 Support status values

| Status | Meaning |
|---|---|
| `v1NumberSenseSupported` | Pattern is a strong candidate for direct v1 generator support using text-first number-sense logic. |
| `v1TextFallbackSupported` | Pattern belongs to the unit and should be mapped now, but v1 support is limited to text fallback or non-visual approximation. |
| `requiresHumanReview` | Items from this pattern require human review before production storage. |
| `unsupportedVisualOnly` | Pattern depends on visual rendering that v1 does not support. |
| `futureDomainOnly` | Pattern requires skills not yet covered in the curriculum scope. |
| `plannedOnly` | Pattern is documented but not yet implemented; all items are draft or placeholder. |

### 13.2 Pattern-to-status mapping

| Pattern | SupportStatus | Clarification |
|---|---|---|
| `pv_4digit_decompose` | `v1NumberSenseSupported` | Fully deterministic, no visual dependency. |
| `pv_4digit_compose` | `v1NumberSenseSupported` | Fully deterministic, no visual dependency. |
| `rw_4digit_number_to_chinese` | `v1NumberSenseSupported` | Fully deterministic, text output. |
| `rw_4digit_chinese_to_number` | `v1NumberSenseSupported` | Fully deterministic, text-to-number. |
| `rw_4digit_zero_reading` | `v1NumberSenseSupported` | Deterministic zero-reading rules. |
| `seq_4digit_place_step` | `v1NumberSenseSupported` | Deterministic step computation. |
| `seq_between_two_numbers` | `v1NumberSenseSupported` | Deterministic between-numbers fill. |
| `cmp_4digit_compare` | `v1NumberSenseSupported` | Deterministic comparison. |
| `perm_4digit_max_min_from_digits` | `v1NumberSenseSupported` | Deterministic digit permutation. |
| `numline_integer_reading` | `v1TextFallbackSupported` | Text-fallback / omitted-template gated unless renderer and review exist. |
| `money_4digit_counting` | `v1TextFallbackSupported` | Visual-gated; textFallback only unless human review completes visual denomination extraction. |
| `money_4digit_payment` | `v1TextFallbackSupported` | Text-fallback deterministic. No visual dependency for v1 implementation. |

---

## 14. SourceMetadata and Provenance

### 14.1 Required sourceMetadata fields

Every PatternSpec must carry these source traceability fields:

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `sourceMappingFile` | string | Yes | S21B mapping file this PatternSpec derives from. | `S21B_G3A_U01_10000Numbers_FormalPatternMapping.md` |
| `sourceQuestionPatternId` | string | Yes | S21B QuestionPattern ID. | `pv_4digit_decompose` |
| `sourceExampleItemRefs` | string[] | Yes | ExampleItem IDs from S21B that serve as source evidence. | `["ex_g3a_u01_p2_type01_001"]` |
| `sourceBackedStatus` | string | Yes | Whether the PatternSpec is source-backed at the pattern level. One of: `pattern_level_source_backed`, `pattern_level_not_source_backed`. | `pattern_level_source_backed` |
| `answerStatusFromSource` | string | Yes | The answerStatus of the source ExampleItem(s). | `verified` |
| `extractionMethod` | string | Yes | How source evidence was extracted. | `operator_provided_visual_verification_notes` |
| `humanVerificationRequired` | boolean | Yes | Whether human review is required before production use. | `false` |
| `sourceBoundaryNotes` | string | Yes | Notes about source boundary constraints for this pattern. | `Source-backed at pattern level. Generated examples are generatedFromPattern, not sourceBacked.` |

### 14.2 Required provenance fields

Every PatternSpec must carry these creation and version provenance fields:

| Field | Type | Required | Meaning | Example |
|---|---|---|---|---|
| `createdBy` | string | Yes | Task or person that created this PatternSpec. | `S21E_PatternSpecSchemaAndSeedDesign` |
| `createdAt` | string | Yes | ISO 8601 timestamp of creation. | `2026-06-30T00:00:00Z` |
| `policyVersion` | string | Yes | S21C policy version active at creation. | `S21C1` |
| `schemaVersion` | string | Yes | Version of the PatternSpec schema used. | `1.0.0` |
| `priorPolicyRefs` | string[] | Yes | Prior policy and mapping documents referenced. | `["S21B", "S21C1", "S21D"]` |

### 14.3 Source boundary clarifications

| Rule | Clarification |
|---|---|
| PatternSpec can be source-backed at pattern level only when the source QuestionPattern exists in S21B. | All 12 G3A U01 patterns satisfy this. |
| PatternSpec does not make generated examples `sourceBacked`. | Individual generated items are `generatedFromPattern`, never `sourceBacked`. |
| Generated output from PatternSpec is `generatedFromPattern`, not `sourceBacked`. | Provenance field `generatedFrom` references the PatternSpec, not the source PDF. |
| Generated items carry `answerStatus = computed` after validator pass. | Per S21C1 §6.2. |
| `answerStatus = verified` only after human/source review. | Per S21C1 §6.2. |

---

## 15. Error Codes and QA Expectations

Error code families for future validator QA. These are code identifiers, not executable checks.

### 15.1 Error code catalog

| Code | Family | Meaning | Triggered by hook(s) |
|---|---|---|---|
| `RANGE_OUT_OF_SCOPE` | Range | Numeric value is outside allowed range. | H1 |
| `INVALID_DIGIT_COUNT` | Digit | Number of digits does not match pattern requirement. | H2 |
| `LEADING_ZERO_NOT_ALLOWED` | Digit | Leading zero is present in a four-digit number. | H2, H8 |
| `PLACE_VALUE_MISMATCH` | Place Value | Decomposition or composition does not match place-value logic. | H3, H4 |
| `CHINESE_READING_MISMATCH` | Chinese Reading | Chinese reading does not follow Taiwan G3A convention. | H5, H6 |
| `ZERO_READING_MISMATCH` | Zero Reading | Internal zeroes are not read correctly. | H7 |
| `COMPARISON_MISMATCH` | Comparison | Relational operator does not match numeric comparison. | H9 |
| `SEQUENCE_STEP_MISMATCH` | Sequence | Sequence step does not match declared step size or direction. | H10, H11 |
| `MONEY_TOTAL_MISMATCH` | Money | Total computed from denominations does not match expected answer. | H12 |
| `MONEY_EXCHANGE_MISMATCH` | Money | Exchange arithmetic is incorrect or remainder is invalid. | H13 |
| `UNSUPPORTED_VISUAL_DEPENDENCY` | Visual | Item depends on visual rendering without textFallback or review. | H14, H17 |
| `FUTURE_DOMAIN_LEAKAGE` | Scope | Item introduces out-of-scope skills (fractions, decimals, geometry, etc.). | H16 |
| `SOURCE_BOUNDARY_VIOLATION` | Provenance | Item falsely claims sourceBacked or verified. | H19 |
| `AMBIGUOUS_ANSWER` | Ambiguity | Item has more than one plausible correct answer. | H18 |
| `SUPPORT_STATUS_MISMATCH` | Status | Item's supportStatus exceeds parent PatternSpec's supportStatus. | H15 |
| `MISSING_PATTERN_REF` | Reference | Item references a PatternSpec or QuestionPattern that does not exist. | Cross-reference check |

### 15.2 QA expectations

Future validator implementations should:

- Produce exactly one error code per failing check where possible.
- Accumulate multiple error codes when multiple checks fail.
- Include a human-readable error message with each error code.
- Include the item ID, PatternSpec ID, and failing value in error reports.
- Distinguish between blocking errors (prevent production) and warning errors (allow draft).

---

## 16. Relationship to Future Tasks

S21E does **not** execute the following downstream tasks. It defines the contract they must implement.

| Future task | Description | Dependency on S21E |
|---|---|---|
| `S21F_G3A_U01_DeterministicValidatorContract` | Define the deterministic validator contract for hooks H1–H19 defined in §8; no implementation code required. | Must preserve the validator hook naming contract and define validator input/output/error semantics. |
| `S21G_G3A_U01_PatternSpecJSONSeedCreation` | Create actual PatternSpec JSON files based on the illustrative examples in §10. | Must follow the schema defined in §5 and the seed table in §9. |
| `S21H_G3A_U01_RuntimeGenerationDesign` | Design and implement runtime generation from PatternSpec + randomSeed. | Must follow the runtime generation policy in §11. |
| `S21I_G3A_U01_LiteracyItemSchemaAndReviewQueueDesign` | Design LiteracyItem schema and human review queue for G3A U01. | Must follow S21D policy and S21E answer model types. |

S21E itself does **not** execute any of these tasks. It provides the schema, constraints, answer models, hooks, seed designs, and policies that those tasks must implement.

---

## 17. Non-Goals

S21E explicitly does **not**:

| # | Non-goal |
|---|---|
| 1 | Generate production items (GeneratedItem or LiteracyItem). |
| 2 | Create PatternSpec JSON files. |
| 3 | Implement validator code. |
| 4 | Implement generator code. |
| 5 | Create worksheet assets or worksheet templates. |
| 6 | Run OCR or inspect PDFs. |
| 7 | Create temporary scripts, rendered images, extraction tools, or generated data files. |
| 8 | Modify S21B mapping facts. |
| 9 | Modify S21C/S21C1 policy semantics. |
| 10 | Modify S21D policy semantics. |
| 11 | Promote visual items to production without human review. |
| 12 | Produce GeneratedItem or LiteracyItem banks. |
| 13 | Modify `src/`, `site/`, `tests/`, `package.json`, `package-lock.json`, schema files, deployment files, or generated worksheet output. |

---

## 18. Acceptance Criteria

The S21E document must satisfy all of the following:

| # | Criterion | Status |
|---|---|---|
| AC1 | Define PatternSpec schema fields with type, required?, meaning, and example for each field. | ✓ |
| AC2 | Define common constraint model with groups A–I (NumericRange, Digit, PlaceValue, ChineseNumberReading, Comparison, Sequence, Money, NumberLine, VisualDependency). | ✓ |
| AC3 | Define answer model types (11 types) with shape, example, compatible patterns, and validator hook. | ✓ |
| AC4 | Define validator hook names (19 hooks) with purpose, input assumptions, output, and related S21C checks. | ✓ |
| AC5 | Cover all 12 G3A U01 patterns in the seed table. | ✓ |
| AC6 | Include 5 illustrative JSON examples (pv_4digit_decompose, rw_4digit_zero_reading, seq_4digit_place_step, money_4digit_payment, numline_integer_reading) — illustrative only, no files created. | ✓ |
| AC7 | Preserve S21C1 verified/computed distinction. | ✓ |
| AC8 | Preserve S21D LiteracyItem human review rules. | ✓ |
| AC9 | Preserve runtime vs production storage distinction. | ✓ |
| AC10 | Preserve visual/textFallback gating. | ✓ |
| AC11 | Include sourceMetadata/provenance rules. | ✓ |
| AC12 | Define error code families (16 codes). | ✓ |
| AC13 | Define runtime generation policy. | ✓ |
| AC14 | Define production storage promotion policy. | ✓ |
| AC15 | Define supportStatus mapping for all 12 patterns. | ✓ |
| AC16 | Define relationship to future tasks (S21F–S21I). | ✓ |
| AC17 | State non-goals explicitly. | ✓ |
| AC18 | Modify no code. | ✓ |
| AC19 | Create no production data files. | ✓ |
| AC20 | Create only the target file: `docs/curriculum/mapping/S21E_G3A_U01_PatternSpecSchemaAndSeedDesign.md`. | ✓ |

---

## Appendix A: Cross-Reference — S21C1 Key Rules Preserved

| Rule ID | Rule | S21E section |
|---|---|---|
| A1 | `verified` = source evidence or human review. Deterministic validator alone does not grant `verified`. | §3.2, §12, §14 |
| A2 | `computed` = deterministic generator logic + validator pass. Validator-derived, not source-derived. | §3.2, §11, §12 |
| A3 | AI must not mark `verified` without source evidence or human review. | §3.2 |
| A4 | AI must not mark `sourceBacked`. | §3.2, §14 |
| A5 | LiteracyItems require validator + human review before production. | §3.3 |
| A6 | Runtime generation does not require permanent JSON storage. | §11 |
| A7 | Production storage = item bank, benchmark, QA seed, curated worksheet, LiteracyItem library. | §12 |
| A8 | ExampleItem ≠ production item. | §3.1 |
| A9 | OCR is not authority. | §3.1 |
| A10 | Visual/textFallback patterns remain gated. | §6I, §9, §13 |
| A11 | G3A U01 scope = number sense within 10000. | §2 |
| A12 | Tag fusion follows S21C §9 allowed/disallowed fusion examples. | §3.2 |

## Appendix B: Cross-Reference — S21D Key Rules Preserved

| Rule ID | Rule | S21E section |
|---|---|---|
| B1 | LiteracyItem recursive improvement lifecycle with 12 states. | §3.3 (not modified by S21E) |
| B2 | Max 3 revision rounds, max 2 validator failures, max 2 human review failures, max 1 semantic drift event. | §3.3 (not modified by S21E) |
| B3 | Math extraction with 15 required fields. | §3.3 (not modified by S21E) |
| B4 | L1–L10 LiteracyItem-specific validator checks in addition to V1–V12. | §3.3 (not modified by S21E) |
| B5 | 12-category human review rubric with blocking categories. | §3.3 (not modified by S21E) |
| B6 | Structured revision note schema with mustPreserve, mayChange, mustAvoid. | §3.3 (not modified by S21E) |
| B7 | Semantic drift control with 8 protected fields. | §3.3 (not modified by S21E) |
| B8 | Complete status transition table with allowed and disallowed transitions. | §3.3 (not modified by S21E) |
| B9 | Provenance and audit trail with required fields. | §3.3 (not modified by S21E) |
| B10 | 11 immediate rejection triggers and 6 deprecation triggers. | §3.3 (not modified by S21E) |