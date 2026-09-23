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
| sourceUrl | `https://meow911.com/3a01/` |
| grade | `3` |
| semester | `upper` |
| unitCode | `U01` |
| language | `zh-Hant` |
| pageCount | `3` |
| manualReviewed | `true` |
| extractionConfidence | `medium_high` |
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
| examSegment | `beforeMidterm` |
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
| `numbers_within_10000` | Understand numbers from `0` to `10000` inclusive within unit expectations. |
| `four_digit_numbers` | Recognize and form four-digit numbers from `1000` to `9999`. |
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
| `pv_4digit_decompose` | `decompose` | `kp_g3a_u01_place_value_decompose` | Decompose a four-digit number into place-value parts or expanded notation. | `basic`, `place_value_direct` | `v1NumberSenseSupported` |
| `pv_4digit_compose` | `compose` | `kp_g3a_u01_place_value_compose` | Compose a four-digit number from thousands, hundreds, tens, and ones. | `basic`, `place_value_direct` | `v1NumberSenseSupported` |
| `rw_4digit_number_to_chinese` | `transcode` | `kp_g3a_u01_number_to_chinese` | Convert a four-digit numeral to Chinese wording. | `basic`, `language_mapping` | `v1NumberSenseSupported` |
| `rw_4digit_chinese_to_number` | `transcode` | `kp_g3a_u01_chinese_to_number` | Convert Chinese wording to a four-digit numeral. | `basic`, `language_mapping` | `v1NumberSenseSupported` |
| `rw_4digit_zero_reading` | `transcode` | `kp_g3a_u01_zero_reading` | Read or write four-digit numbers containing internal zeroes. | `intermediate`, `zero_handling` | `v1NumberSenseSupported` |
| `seq_4digit_place_step` | `sequence` | `kp_g3a_u01_place_sequence` | Continue a sequence using place-value jumps such as `+10`, `+100`, `-100`, or similar grade-appropriate steps. | `intermediate`, `sequence_step` | `v1NumberSenseSupported` |
| `seq_between_two_numbers` | `sequence` | `kp_g3a_u01_between_numbers` | Fill missing integers between two endpoints. | `basic`, `sequence_direct` | `v1NumberSenseSupported` |
| `cmp_4digit_compare` | `compare` | `kp_g3a_u01_number_compare` | Compare two four-digit numbers using `<`, `>`, or `=`. | `basic`, `comparison_direct` | `v1NumberSenseSupported` |
| `perm_4digit_max_min_from_digits` | `optimize_from_digits` | `kp_g3a_u01_digit_permutation` | Form the largest or smallest valid four-digit number from provided digits. | `intermediate`, `digit_constraint` | `v1NumberSenseSupported` |
| `numline_integer_reading` | `visual_reading` | `kp_g3a_u01_number_line_reading` | Read integer values from number-line layouts. | `intermediate`, `visual_interpretation` | `v1TextFallbackSupported` |
| `money_4digit_counting` | `visual_reading` | `kp_g3a_u01_money_counting` | Count money representations to determine a total amount. | `intermediate`, `representation_counting` | `v1TextFallbackSupported` |
| `money_4digit_payment` | `representation_payment` | `kp_g3a_u01_money_payment` | Choose or verify money combinations that match a target amount. | `intermediate`, `representation_composition` | `v1TextFallbackSupported` |

### Support note

- Visual-dependent patterns are marked `v1TextFallbackSupported` rather than full visual support.
- In v1, these patterns may be implemented first as text-described representations before any diagrammatic renderer exists.

## 8. ExampleItem

`ExampleItem` is the evidence or sample layer under `QuestionPattern`.

### ExampleItem definition

ExampleItem is a source-backed or derived sample item used for:

- source evidence
- pattern verification
- QA seed design
- future UI preview examples
- generator requirement clarification

ExampleItem is not:

- a KnowledgePoint
- a CanonicalSkill
- a CurriculumNode
- an authorization to implement generator code

### ExampleItem fields

| Field | Meaning |
| --- | --- |
| exampleId | Stable ID for the example item. |
| exampleType | Whether the example comes directly from source, is adapted, inferred, generated, or unavailable. |
| sourcePage | PDF page number when source-backed. |
| sourceLocation | Human-readable location such as page_2_type_01. |
| sourcePatternLabel | The pattern label shown in the PDF, if present. |
| linkedCurriculumNode | CurriculumNode ID. |
| linkedKnowledgePoint | KnowledgePoint ID. |
| linkedQuestionPattern | QuestionPattern ID. |
| prompt | The visible learner-facing prompt or short source excerpt. |
| answerFormat | numeric, structured, relation, text, visual, or mixed. |
| answer | Expected answer when clearly available. |
| answerStatus | verified, to_be_verified, omitted_for_template, or not_applicable. |
| difficultyTags | DifficultyTag IDs. |
| supportStatus | v1NumberSenseSupported or v1TextFallbackSupported. |
| visualDependency | none, source_visual, text_fallback, or future_visual_renderer. |
| notes | Optional notes. |

### ExampleItem taxonomy

| exampleType | Meaning |
| --- | --- |
| `sourceBacked` | Directly visible in the source PDF. |
| `sourceAdapted` | Adapted from a source PDF item while preserving the same pattern. |
| `inferredExample` | Created from a source pattern label but not directly present as a full source item. |
| `generatedExample` | Future system-generated example, not source evidence. |
| `noSourceExampleAvailable` | Used when a pattern exists but no source example is available. |

### ExampleItem rules

- Do not label `inferredExample`, `sourceAdapted`, or `generatedExample` as `sourceBacked`.
- If the PDF does not show enough information to verify the answer, set `answerStatus` to `to_be_verified`.
- If the example is included only to show format, set `answerStatus` to `omitted_for_template`.
- Formal extraction of every example belongs to `S21B` or later, not `S21A2`.

### Representative ExampleItems

This is a template patch, not a full source extraction. The rows below provide a small representative seed set only.

| exampleId | exampleType | sourcePage | sourceLocation | sourcePatternLabel | linkedCurriculumNode | linkedKnowledgePoint | linkedQuestionPattern | prompt | answerFormat | answer | answerStatus | difficultyTags | supportStatus | visualDependency | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ex_g3a_u01_p2_type01_001` | `sourceBacked` | `2` | `page_2_type_01` | `題型① 四位數位值分解` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_place_value_decompose` | `pv_4digit_decompose` | `7063 是 □ 個千、□ 個百、□ 個十、□ 個一，合起來是 □。` | `structured` | `{"thousands":7,"hundreds":0,"tens":6,"ones":3,"total":7063}` | `verified` | `basic`, `place_value_direct`, `zero_handling` | `v1NumberSenseSupported` | `none` | |
| `ex_g3a_u01_p2_type02_001` | `sourceBacked` | `2` | `page_2_type_02` | `題型② 四位數位值組合` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_place_value_compose` | `pv_4digit_compose` | `8 個一、5 個十、7 個千，合起來是 □。` | `numeric` | `7058` | `verified` | `basic`, `place_value_direct`, `zero_handling` | `v1NumberSenseSupported` | `none` | `No hundreds component is shown, so the hundreds digit is 0.` |
| `ex_g3a_u01_p3_type04_001` | `sourceBacked` | `3` | `page_3_type_04` | `題型④ 兩數間的規律` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_between_numbers` | `seq_between_two_numbers` | `□－2997－2998－□－□－3001` | `structured` | `{"blanks":[2996,2999,3000],"step":1}` | `verified` | `intermediate`, `sequence_step` | `v1NumberSenseSupported` | `none` | |
| `ex_g3a_u01_p3_type07_001` | `sourceBacked` | `3` | `page_3_type_07` | `題型⑦ 四位數比大小` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_number_compare` | `cmp_4digit_compare` | `6788 □ 6877` | `relation` | `<` | `verified` | `basic`, `comparison_direct` | `v1NumberSenseSupported` | `none` | |
| `ex_g3a_u01_p3_type08_001` | `sourceBacked` | `3` | `page_3_type_08` | `題型⑧ 四位數比大小` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_digit_permutation` | `perm_4digit_max_min_from_digits` | `用 0、2、5、8 排成的四位數中，數字不重複，最大的是 □，最小的是 □。` | `structured` | `{"max":8520,"min":2058}` | `verified` | `intermediate`, `digit_constraint` | `v1NumberSenseSupported` | `none` | `Leading zero is not allowed for a four-digit number.` |
| `ex_g3a_u01_p3_type09_001` | `sourceBacked` | `3` | `page_3_type_09` | `題型⑨ 整數數線` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_number_line_reading` | `numline_integer_reading` | `看數線上的箭頭所指的數。` | `visual` | | `omitted_for_template` | `intermediate`, `visual_interpretation` | `v1TextFallbackSupported` | `source_visual` | `Visual answer extraction belongs to S21B or later.` |
| `ex_g3a_u01_p3_type05_001` | `sourceBacked` | `3` | `page_3_type_05` | `題型⑤ 四位數錢幣換算` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_money_payment` | `money_4digit_payment` | `55 個 10 元可以換成 □ 張一百元？` | `numeric` | | `to_be_verified` | `intermediate`, `representation_composition` | `v1TextFallbackSupported` | `text_fallback` | `The source wording may imply exchange with remainder; verify in formal extraction before marking verified.` |

### ExampleItem coverage rule

For a formal mapping document, each `QuestionPattern` should ideally have at least one representative `ExampleItem`. However, this template patch only defines the `ExampleItem` layer and provides a small representative seed set. Complete example coverage belongs to `S21B` or later.

## 9. DifficultyTag

Difficulty tags are cross-pattern metadata, not curriculum nodes.

| DifficultyTag | Meaning |
| --- | --- |
| `basic` | Direct single-step prompt with low ambiguity. |
| `intermediate` | Requires one additional inference step, constraint handling, or zero/place-value care. |
| `place_value_direct` | Direct mapping between digit position and value. |
| `language_mapping` | Requires correct reading/writing conversion in Chinese number language. |
| `zero_handling` | Requires special handling of internal zeroes in four-digit numbers. |
| `sequence_step` | Requires understanding of a repeating or place-based numerical step. |
| `sequence_direct` | Requires counting forward or backward within obvious bounds. |
| `comparison_direct` | Requires comparing magnitude using place-value logic. |
| `digit_constraint` | Requires constructing a valid number under digit reuse/placement constraints. |
| `visual_interpretation` | Requires extracting value from a spatial or pictorial representation. |
| `representation_counting` | Requires aggregating denomination-based quantities. |
| `representation_composition` | Requires composing a target amount from denomination options. |

## 10. SupportStatus

Support status is implementation-state metadata. It must stay separate from curriculum semantics.

| SupportStatus | Meaning |
| --- | --- |
| `v1NumberSenseSupported` | Pattern is a strong candidate for direct v1 generator support using text-first number-sense logic. |
| `v1TextFallbackSupported` | Pattern belongs to the unit and should be mapped now, but v1 support is limited to text fallback or non-visual approximation. |

### Current unit-level interpretation

- `CurriculumNode`: `g3a_u01_numbers_within_10000` is classified as `v1NumberSenseSupported`.
- Individual patterns may still downgrade to `v1TextFallbackSupported` when the prompt depends on visual layouts such as money icons or number lines.

## 11. GeneratorRequirement

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
| exampleItemLinking | Every `ExampleItem` must link to exactly one `CurriculumNode`, one `KnowledgePoint`, and one `QuestionPattern`. |
| sourceEvidence | `sourceBacked` examples must include `sourcePage` and `sourceLocation`. |
| exampleTypeIntegrity | `inferredExample`, `sourceAdapted`, and `generatedExample` must not be labeled as `sourceBacked`. |
| answerStatus | Examples with uncertain or visually dependent answers must use `to_be_verified` or `omitted_for_template`. |
| qaSeedUse | `ExampleItem` entries may be used as future QA seeds but do not authorize generator implementation. |

### Non-goal for this task

- No production generator, renderer, UI, test, package, or deployment changes are included here.
- This document is a mapping/template artifact only.

## 12. QA Checklist

- Confirm the file is documentation only and does not modify production code or test assets.
- Confirm `SourceMetadata` identifies the PDF as a source container rather than a single knowledge point.
- Confirm `SourceMetadata` includes `sourceUrl`.
- Confirm `SourceMetadata` includes `pageCount`.
- Confirm `SourceMetadata` includes `manualReviewed`.
- Confirm `SourceMetadata` includes `extractionConfidence`.
- Confirm `CurriculumNode` ID is exactly `g3a_u01_numbers_within_10000`.
- Confirm `CurriculumNode` includes `examSegment` set to `beforeMidterm`.
- Confirm `domain` is exactly `number_sense`.
- Confirm unit support status is exactly `v1NumberSenseSupported`.
- Confirm `numbers_within_10000` includes `10000`.
- Confirm `four_digit_numbers` is scoped to `1000` to `9999`.
- Confirm `DifficultyTag` IDs use `snake_case` consistently.
- Confirm no kebab-case `DifficultyTag` IDs remain.
- Confirm no mojibake remains in Representative ExampleItems.
- Confirm verified ExampleItems have non-empty answers.
- Confirm unverified or visual examples use `to_be_verified` or `omitted_for_template`.
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
- Confirm the `ExampleItem` section exists.
- Confirm `ExampleItem` is explicitly not a `KnowledgePoint`.
- Confirm the `exampleType` taxonomy is present.
- Confirm `sourceBacked` examples include `sourcePage` and `sourceLocation`.
- Confirm every representative `ExampleItem` links to `CurriculumNode`, `KnowledgePoint`, and `QuestionPattern`.
- Confirm visual examples use `v1TextFallbackSupported` where appropriate.
- Confirm uncertain visual or image-derived answers use `to_be_verified` or `omitted_for_template`.
- Confirm `S21A2` does not attempt full extraction of every PDF example.
- Confirm no production code, tests, UI, package, schema, or deployment files were changed.