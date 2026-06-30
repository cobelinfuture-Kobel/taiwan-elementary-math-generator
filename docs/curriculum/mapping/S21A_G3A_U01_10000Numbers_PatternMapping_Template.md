# S21A G3A U01 10000 Numbers Pattern Mapping Template

## Document Status

- Task scope: documentation/template only
- Production impact: no production generator code, UI code, tests, package files, or deployment files are changed by this task
- Purpose: define the first formal `UnitPatternMapping` template for Taiwan elementary math worksheet coverage using Grade 3 Upper Semester Unit 01 as the source example

## 1. SourceMetadata

| Field | Value |
| --- | --- |
| sourceContainerId | `S21A_G3A_U01_10000Numbers_PatternMapping_Template` |
| sourceFile | `題型總覽-3a01-10000以內的數.pdf` |
| sourceTitle | `1萬以內的數，數到1萬` |
| sourceType | `unit_pdf_container` |
| grade | `3` |
| semester | `upper` |
| unitCode | `U01` |
| language | `zh-Hant` |
| notes | The unit PDF is a source container, not a single knowledge point. |

### Source interpretation rule

- A Unit PDF aggregates multiple skills, representations, and question forms.
- A `CurriculumNode` maps to multiple `KnowledgePoint` entries.
- A `KnowledgePoint` maps to one or more `QuestionPattern` entries.
- A `QuestionPattern` is the future generator implementation unit.

## 2. CurriculumNode

| Field | Value |
| --- | --- |
| curriculumNodeId | `g3a_u01_numbers_within_10000` |
| domain | `number_sense` |
| grade | `3` |
| semester | `upper` |
| unit | `01` |
| canonicalTitle | `1萬以內的數／數到1萬` |
| supportStatus | `v1NumberSenseSupported` |
| sourceContainer | `S21A_G3A_U01_10000Numbers_PatternMapping_Template` |

### CurriculumNode statement

This node covers number sense within `10000`, including reading and writing four-digit numbers, place value, digit value, decomposition and composition, ordering and comparison, number-sequence tasks, number-line interpretation, and money-based representations.

## 3. PublisherMapping

| Publisher | Grade/Semester | Unit | Title |
| --- | --- | --- | --- |
| 康軒 | `3上` | `第1課` | `1萬以內的數` |
| 翰林 | `3上` | `第1課` | `1萬以內的數` |
| 南一 | `3上` | `第1課` | `數到1萬` |

## 4. CanonicalSkill

The following canonical skills are required for this unit mapping:

| CanonicalSkill ID | Summary |
| --- | --- |
| `numbers_within_10000` | Understand and operate on numbers from `0` to `9999` within unit expectations. |
| `four_digit_numbers` | Recognize and form four-digit numbers. |
| `place_value` | Understand ones, tens, hundreds, and thousands places. |
| `digit_value` | Interpret the value of a digit by its position. |
| `number_decomposition` | Break a number into place-value parts or additive parts. |
| `number_composition` | Compose a whole number from place-value parts or representations. |
| `number_reading_writing` | Convert between numerals and Chinese reading/writing forms. |
| `zero_in_four_digit_number` | Correctly interpret and read internal zeroes in four-digit numbers. |
| `number_comparison` | Compare numbers within `10000`. |
| `number_ordering` | Order numbers ascending, descending, or by sequence completion. |
| `number_line` | Read numbers from integer number-line contexts. |
| `place_value_sequence` | Advance or backtrack by place-value-based steps. |
| `money_representation` | Represent four-digit values using money contexts and denominations. |

## 5. KnowledgePoint

The source container expands into multiple knowledge points under one curriculum node.

| KnowledgePoint ID | CanonicalSkill | Description | Representative QuestionPatterns |
| --- | --- | --- | --- |
| `kp_g3a_u01_place_value_decompose` | `place_value`, `number_decomposition` | Decompose a four-digit number into thousands, hundreds, tens, and ones. | `pv_4digit_decompose` |
| `kp_g3a_u01_place_value_compose` | `place_value`, `number_composition` | Compose a four-digit number from place-value parts. | `pv_4digit_compose` |
| `kp_g3a_u01_number_to_chinese` | `number_reading_writing` | Convert four-digit numerals into Chinese reading or writing form. | `rw_4digit_number_to_chinese` |
| `kp_g3a_u01_chinese_to_number` | `number_reading_writing` | Convert Chinese number wording into numerals. | `rw_4digit_chinese_to_number` |
| `kp_g3a_u01_zero_reading` | `zero_in_four_digit_number` | Read and interpret four-digit numbers containing zero in internal positions. | `rw_4digit_zero_reading` |
| `kp_g3a_u01_place_sequence` | `place_value_sequence`, `number_ordering` | Continue sequences that change by place-value steps. | `seq_4digit_place_step` |
| `kp_g3a_u01_between_numbers` | `number_ordering` | Fill missing numbers between two bounds. | `seq_between_two_numbers` |
| `kp_g3a_u01_number_compare` | `number_comparison` | Compare two four-digit numbers using relational reasoning. | `cmp_4digit_compare` |
| `kp_g3a_u01_digit_permutation` | `four_digit_numbers`, `digit_value` | Build the largest or smallest valid four-digit number from given digits. | `perm_4digit_max_min_from_digits` |
| `kp_g3a_u01_number_line_reading` | `number_line` | Read integer values from a labeled or partially labeled number line. | `numline_integer_reading` |
| `kp_g3a_u01_money_counting` | `money_representation`, `number_composition` | Count a total amount from money representations. | `money_4digit_counting` |
| `kp_g3a_u01_money_payment` | `money_representation`, `number_decomposition` | Express or verify payment amounts using money denominations. | `money_4digit_payment` |

## 6. QuestionKind

`QuestionKind` is the learner-facing interaction style. Multiple patterns may share one kind.

| QuestionKind ID | Description |
| --- | --- |
| `decompose` | Break a whole number into structured parts. |
| `compose` | Build a whole number from given parts. |
| `transcode` | Convert between numeral form and Chinese wording. |
| `sequence` | Continue or fill missing numbers in a sequence. |
| `compare` | Decide relative size between values. |
| `optimize_from_digits` | Construct maximum or minimum values under digit constraints. |
| `visual_reading` | Read a value from a visual representation such as a number line or money diagram. |
| `representation_payment` | Match or form an amount using currency-style denominations. |

## 7. QuestionPattern

`QuestionPattern` is the future generator implementation unit.

| QuestionPattern ID | QuestionKind | Linked KnowledgePoint | Summary | Suggested DifficultyTags | SupportStatus |
| --- | --- | --- | --- | --- | --- |
| `pv_4digit_decompose` | `decompose` | `kp_g3a_u01_place_value_decompose` | Decompose a four-digit number into place-value parts or expanded notation. | `basic`, `place-value-direct` | `v1NumberSenseSupported` |
| `pv_4digit_compose` | `compose` | `kp_g3a_u01_place_value_compose` | Compose a four-digit number from thousands, hundreds, tens, and ones. | `basic`, `place-value-direct` | `v1NumberSenseSupported` |
| `rw_4digit_number_to_chinese` | `transcode` | `kp_g3a_u01_number_to_chinese` | Convert a four-digit numeral to Chinese wording. | `basic`, `language-mapping` | `v1NumberSenseSupported` |
| `rw_4digit_chinese_to_number` | `transcode` | `kp_g3a_u01_chinese_to_number` | Convert Chinese wording to a four-digit numeral. | `basic`, `language-mapping` | `v1NumberSenseSupported` |
| `rw_4digit_zero_reading` | `transcode` | `kp_g3a_u01_zero_reading` | Read or write four-digit numbers containing internal zeroes. | `intermediate`, `zero-handling` | `v1NumberSenseSupported` |
| `seq_4digit_place_step` | `sequence` | `kp_g3a_u01_place_sequence` | Continue a sequence using place-value jumps such as `+10`, `+100`, `-100`, or similar grade-appropriate steps. | `intermediate`, `sequence-step` | `v1NumberSenseSupported` |
| `seq_between_two_numbers` | `sequence` | `kp_g3a_u01_between_numbers` | Fill missing integers between two endpoints. | `basic`, `sequence-direct` | `v1NumberSenseSupported` |
| `cmp_4digit_compare` | `compare` | `kp_g3a_u01_number_compare` | Compare two four-digit numbers using `<`, `>`, or `=`. | `basic`, `comparison-direct` | `v1NumberSenseSupported` |
| `perm_4digit_max_min_from_digits` | `optimize_from_digits` | `kp_g3a_u01_digit_permutation` | Form the largest or smallest valid four-digit number from provided digits. | `intermediate`, `digit-constraint` | `v1NumberSenseSupported` |
| `numline_integer_reading` | `visual_reading` | `kp_g3a_u01_number_line_reading` | Read integer values from number-line layouts. | `intermediate`, `visual-interpretation` | `v1TextFallbackSupported` |
| `money_4digit_counting` | `visual_reading` | `kp_g3a_u01_money_counting` | Count money representations to determine a total amount. | `intermediate`, `representation-counting` | `v1TextFallbackSupported` |
| `money_4digit_payment` | `representation_payment` | `kp_g3a_u01_money_payment` | Choose or verify money combinations that match a target amount. | `intermediate`, `representation-composition` | `v1TextFallbackSupported` |

### Support note

- Visual-dependent patterns are marked `v1TextFallbackSupported` rather than full visual support.
- In v1, these patterns may be implemented first as text-described representations before any diagrammatic renderer exists.

## 8. DifficultyTag

Difficulty tags are cross-pattern metadata, not curriculum nodes.

| DifficultyTag | Meaning |
| --- | --- |
| `basic` | Direct single-step prompt with low ambiguity. |
| `intermediate` | Requires one additional inference step, constraint handling, or zero/place-value care. |
| `place-value-direct` | Direct mapping between digit position and value. |
| `language-mapping` | Requires correct reading/writing conversion in Chinese number language. |
| `zero-handling` | Requires special handling of internal zeroes in four-digit numbers. |
| `sequence-step` | Requires understanding of a repeating or place-based numerical step. |
| `sequence-direct` | Requires counting forward or backward within obvious bounds. |
| `comparison-direct` | Requires comparing magnitude using place-value logic. |
| `digit-constraint` | Requires constructing a valid number under digit reuse/placement constraints. |
| `visual-interpretation` | Requires extracting value from a spatial or pictorial representation. |
| `representation-counting` | Requires aggregating denomination-based quantities. |
| `representation-composition` | Requires composing a target amount from denomination options. |

## 9. SupportStatus

Support status is implementation-state metadata. It must stay separate from curriculum semantics.

| SupportStatus | Meaning |
| --- | --- |
| `v1NumberSenseSupported` | Pattern is a strong candidate for direct v1 generator support using text-first number-sense logic. |
| `v1TextFallbackSupported` | Pattern belongs to the unit and should be mapped now, but v1 support is limited to text fallback or non-visual approximation. |

### Current unit-level interpretation

- `CurriculumNode`: `g3a_u01_numbers_within_10000` is classified as `v1NumberSenseSupported`.
- Individual patterns may still downgrade to `v1TextFallbackSupported` when the prompt depends on visual layouts such as money icons or number lines.

## 10. GeneratorRequirement

This section defines future implementation requirements only. It does not authorize generator code changes in this task.

| Requirement Area | Requirement |
| --- | --- |
| patternRegistry | Each `QuestionPattern` must be treated as an independent implementation target. |
| curriculumLinking | Generator metadata must retain links from `CurriculumNode` to `KnowledgePoint` to `QuestionPattern`. |
| locale | Chinese number wording must follow Taiwan elementary usage in `zh-Hant`. |
| zeroRules | Reading and writing logic must correctly handle internal zeroes in four-digit numbers. |
| comparisonLogic | Comparison patterns must use valid four-digit ranges and avoid ambiguous equal/unequal distractors unless intentionally specified. |
| sequenceControl | Sequence patterns must declare step size, direction, blank positions, and bounds. |
| digitConstraintRules | Max/min permutation patterns must define whether leading zero is allowed; default for four-digit numbers is not allowed. |
| visualFallback | Number-line and money patterns must support a text fallback before any full visual renderer exists. |
| answerDeterminism | Every generated item must have one unambiguous correct answer. |
| difficultyMetadata | Generated items should carry `DifficultyTag` metadata for QA sampling and future balancing. |

### Non-goal for this task

- No production generator, renderer, UI, test, package, or deployment changes are included here.
- This document is a mapping/template artifact only.

## 11. QA Checklist

- Confirm the file is documentation only and does not modify production code or test assets.
- Confirm `SourceMetadata` identifies the PDF as a source container rather than a single knowledge point.
- Confirm `CurriculumNode` ID is exactly `g3a_u01_numbers_within_10000`.
- Confirm `domain` is exactly `number_sense`.
- Confirm unit support status is exactly `v1NumberSenseSupported`.
- Confirm all required canonical skills are present:
  - `numbers_within_10000`
  - `four_digit_numbers`
  - `place_value`
  - `digit_value`
  - `number_decomposition`
  - `number_composition`
  - `number_reading_writing`
  - `zero_in_four_digit_number`
  - `number_comparison`
  - `number_ordering`
  - `number_line`
  - `place_value_sequence`
  - `money_representation`
- Confirm each `KnowledgePoint` maps to one or more `QuestionPattern` entries.
- Confirm all required `QuestionPattern` IDs are present:
  - `pv_4digit_decompose`
  - `pv_4digit_compose`
  - `rw_4digit_number_to_chinese`
  - `rw_4digit_chinese_to_number`
  - `rw_4digit_zero_reading`
  - `seq_4digit_place_step`
  - `seq_between_two_numbers`
  - `cmp_4digit_compare`
  - `perm_4digit_max_min_from_digits`
  - `numline_integer_reading`
  - `money_4digit_counting`
  - `money_4digit_payment`
- Confirm visual-dependent patterns are marked `v1TextFallbackSupported`:
  - `numline_integer_reading`
  - `money_4digit_counting`
  - `money_4digit_payment`
- Confirm the document explicitly distinguishes `SourceMetadata`, `CurriculumNode`, `KnowledgePoint`, `QuestionPattern`, `DifficultyTag`, and `SupportStatus`.
- Confirm the document states that `QuestionPattern` is the future generator implementation unit.
