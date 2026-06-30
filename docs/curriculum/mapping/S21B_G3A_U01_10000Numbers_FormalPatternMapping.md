# S21B G3A U01 10000 Numbers Formal Pattern Mapping

## Document Status

- Task scope: documentation/formal mapping only
- Production impact: no production generator code, UI code, tests, package files, schema files, deployment files, or runtime behavior are changed by this task
- Purpose: create the first formal `UnitPatternMapping` for Taiwan elementary math worksheet coverage using Grade 3 Upper Semester Unit 01 as the source example
- Reference template: `S21A_G3A_U01_10000Numbers_PatternMapping_Template.md`
- Patch version: S21B2 — consistency and visual-status normalization patch. Removed OCR-as-authority wording; fixes based on accepted visual verification notes.

## Source PDF Access Note

The local source PDF was available before S21B1 at:
`docs/curriculum/sources/g3a/u01/meow911_3a01_10000_numbers.pdf`

S21B1/S21B2 status:
- The mapping uses **operator-provided visual verification notes** as the authority for source-backed examples.
- All 12 QuestionPatterns now have sourceBacked ExampleItems.
- 10 ExampleItems have verified answers.
- `money_4digit_counting` remains `to_be_verified` because it requires visual denomination extraction from a money diagram.
- `numline_integer_reading` remains `omitted_for_template` because the answer depends on visual number-line positions.
- 0 `inferredExample` items remain.
- Visual answer extraction for visual-only patterns is intentionally deferred.

Section 13 (Coverage Summary) provides the full updated status of each pattern.

---

## 1. SourceMetadata

| Field | Value |
| --- | --- |
| sourceContainerId | `S21B_G3A_U01_10000Numbers_FormalPatternMapping` |
| sourceFile | `meow911_3a01_10000_numbers.pdf` |
| sourceTitle | `1萬以內的數，數到1萬` |
| sourceType | `unit_pdf_container` |
| sourceUrl | `https://meow911.com/3a01/` |
| grade | `3` |
| semester | `upper` |
| unitCode | `U01` |
| language | `zh-Hant` |
| pageCount | `3` |
| manualReviewed | `true` |
| extractionConfidence | `high` |
| notes | S21B2 normalized the S21B1 mapping to use operator-provided visual verification notes as the authority. All 12 QuestionPatterns now have sourceBacked ExampleItems; 10 answers are verified, 1 visual money-counting item remains to_be_verified, and 1 number-line item remains omitted_for_template. |

### Source interpretation rule

- A Unit PDF aggregates multiple skills, representations, and question forms.
- A `CurriculumNode` maps to multiple `KnowledgePoint` entries.
- A `KnowledgePoint` maps to one or more `QuestionPattern` entries.
- A `QuestionPattern` is the future generator implementation unit.
- An `ExampleItem` is source evidence / sample / QA seed, not a KnowledgePoint.

---

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
| sourceContainer | `S21B_G3A_U01_10000Numbers_FormalPatternMapping` |

### CurriculumNode statement

This node covers number sense within `10000`, including reading and writing four-digit numbers, place value, digit value, decomposition and composition, ordering and comparison, number-sequence tasks, number-line interpretation, and money-based representations.

---

## 3. PublisherMapping

| Publisher | Grade/Semester | Unit | Title |
| --- | --- | --- | --- |
| 康軒 | `3上` | `第1課` | `1萬以內的數` |
| 翰林 | `3上` | `第1課` | `1萬以內的數` |
| 南一 | `3上` | `第1課` | `數到1萬` |

---

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

---

## 5. KnowledgePoint

The source container expands into multiple knowledge points under one curriculum node.

| KnowledgePoint ID | CanonicalSkill | Description | SourceEvidence | Representative QuestionPatterns |
| --- | --- | --- | --- | --- |
| `kp_g3a_u01_place_value_decompose` | `place_value`, `number_decomposition` | Decompose a four-digit number into thousands, hundreds, tens, and ones. | `page_2_type_01` (verified by accepted visual verification notes) | `pv_4digit_decompose` |
| `kp_g3a_u01_place_value_compose` | `place_value`, `number_composition` | Compose a four-digit number from place-value parts. | `page_2_type_02` (verified by accepted visual verification notes) | `pv_4digit_compose` |
| `kp_g3a_u01_number_to_chinese` | `number_reading_writing` | Convert four-digit numerals into Chinese reading or writing form. | `page_2_type_03` (verified by accepted visual verification notes: 5301→五千三百零一, 5030→五千零三十, 5100→五千一百, 5003→五千零三) | `rw_4digit_number_to_chinese` |
| `kp_g3a_u01_chinese_to_number` | `number_reading_writing` | Convert Chinese number wording into numerals. | `page_2_type_03` (verified by accepted visual verification notes: 七千六百零一→7601, 七千零六十→7060, 七千零六→7006) | `rw_4digit_chinese_to_number` |
| `kp_g3a_u01_zero_reading` | `zero_in_four_digit_number` | Read and interpret four-digit numbers containing zero in internal positions. | `page_2_type_03` (verified by accepted visual verification notes: 5030, 5003, 7060, 7006 include zero-reading patterns) | `rw_4digit_zero_reading` |
| `kp_g3a_u01_place_sequence` | `place_value_sequence`, `number_ordering` | Continue sequences that change by place-value steps. | `page_1` (verified by accepted visual verification notes: 2985 with +1/+10/+100/+1000 and 4985 with -1/-10/-100/-1000) | `seq_4digit_place_step` |
| `kp_g3a_u01_between_numbers` | `number_ordering` | Fill missing numbers between two bounds. | `page_3_type_04` (verified by accepted visual verification notes) | `seq_between_two_numbers` |
| `kp_g3a_u01_number_compare` | `number_comparison` | Compare two four-digit numbers using relational reasoning. | `page_3_type_07` (verified by accepted visual verification notes) | `cmp_4digit_compare` |
| `kp_g3a_u01_digit_permutation` | `four_digit_numbers`, `digit_value` | Build the largest or smallest valid four-digit number from given digits. | `page_3_type_08` (verified by accepted visual verification notes) | `perm_4digit_max_min_from_digits` |
| `kp_g3a_u01_number_line_reading` | `number_line` | Read integer values from a labeled or partially labeled number line. | `page_3_type_09` (source-backed visual number-line panel confirmed; answer omitted_for_template) | `numline_integer_reading` |
| `kp_g3a_u01_money_counting` | `money_representation`, `number_composition` | Count a total amount from money representations. | `page_3_type_06` (source-backed visual panel confirmed; answer to_be_verified) | `money_4digit_counting` |
| `kp_g3a_u01_money_payment` | `money_representation`, `number_decomposition` | Express or verify payment amounts using money denominations. | `page_3_type_05` (verified by accepted visual verification notes: 55個10元→□張一百元; 23張一百元→□張一千元; 3張一千元→□張一百元) | `money_4digit_payment` |

---

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

---

## 7. QuestionPattern

`QuestionPattern` is the future generator implementation unit.

| QuestionPattern ID | QuestionKind | Linked KnowledgePoint | Summary | Suggested DifficultyTags | SupportStatus | SourceEvidencePage | ExampleItem Coverage |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `pv_4digit_decompose` | `decompose` | `kp_g3a_u01_place_value_decompose` | Decompose a four-digit number into place-value parts or expanded notation. | `basic`, `place_value_direct` | `v1NumberSenseSupported` | `page_2_type_01` | 1 sourceBacked (verified) |
| `pv_4digit_compose` | `compose` | `kp_g3a_u01_place_value_compose` | Compose a four-digit number from thousands, hundreds, tens, and ones. | `basic`, `place_value_direct` | `v1NumberSenseSupported` | `page_2_type_02` | 1 sourceBacked (verified) |
| `rw_4digit_number_to_chinese` | `transcode` | `kp_g3a_u01_number_to_chinese` | Convert a four-digit numeral to Chinese wording. | `basic`, `language_mapping` | `v1NumberSenseSupported` | `page_2_type_03` | 1 sourceBacked (verified) |
| `rw_4digit_chinese_to_number` | `transcode` | `kp_g3a_u01_chinese_to_number` | Convert Chinese wording to a four-digit numeral. | `basic`, `language_mapping` | `v1NumberSenseSupported` | `page_2_type_03` | 1 sourceBacked (verified) |
| `rw_4digit_zero_reading` | `transcode` | `kp_g3a_u01_zero_reading` | Read or write four-digit numbers containing internal zeroes. | `intermediate`, `zero_handling` | `v1NumberSenseSupported` | `page_2_type_03` | 1 sourceBacked (verified) |
| `seq_4digit_place_step` | `sequence` | `kp_g3a_u01_place_sequence` | Continue a sequence using place-value jumps such as `+1`, `+10`, `+100`, `+1000` from a starting number. | `intermediate`, `sequence_step` | `v1NumberSenseSupported` | `page_1` | 1 sourceBacked (verified) |
| `seq_between_two_numbers` | `sequence` | `kp_g3a_u01_between_numbers` | Fill missing integers between two endpoints. | `basic`, `sequence_direct` | `v1NumberSenseSupported` | `page_3_type_04` | 1 sourceBacked (verified) |
| `cmp_4digit_compare` | `compare` | `kp_g3a_u01_number_compare` | Compare two four-digit numbers using `<`, `>`, or `=`. | `basic`, `comparison_direct` | `v1NumberSenseSupported` | `page_3_type_07` | 1 sourceBacked (verified) |
| `perm_4digit_max_min_from_digits` | `optimize_from_digits` | `kp_g3a_u01_digit_permutation` | Form the largest or smallest valid four-digit number from provided digits. | `intermediate`, `digit_constraint` | `v1NumberSenseSupported` | `page_3_type_08` | 1 sourceBacked (verified) |
| `numline_integer_reading` | `visual_reading` | `kp_g3a_u01_number_line_reading` | Read integer values from number-line layouts. | `intermediate`, `visual_interpretation` | `v1TextFallbackSupported` | `page_3_type_09` | 1 sourceBacked (omitted_for_template, visual) |
| `money_4digit_counting` | `visual_reading` | `kp_g3a_u01_money_counting` | Count money representations to determine a total amount. | `intermediate`, `representation_counting` | `v1TextFallbackSupported` | `page_3_type_06` | 1 sourceBacked (to_be_verified, visual diagram) |
| `money_4digit_payment` | `representation_payment` | `kp_g3a_u01_money_payment` | Choose or verify money combinations that match a target amount. | `intermediate`, `representation_composition` | `v1TextFallbackSupported` | `page_3_type_05` | 1 sourceBacked (verified) |

### Support note

- Visual-dependent patterns are marked `v1TextFallbackSupported` rather than full visual support.
- In v1, these patterns may be implemented first as text-described representations before any diagrammatic renderer exists.

---

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
| sourcePage | PDF page number when source-backed or inferred. |
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
| needsHumanReview | true if the example requires human PDF inspection before promotion to verified. Defaults to false. |
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
- If the example is `inferredExample` and has not been verified against the PDF, set `needsHumanReview = true`.
- Formal extraction of every example belongs to `S21B` or later, not `S21A2`.

### Representative ExampleItems — Source-Backed (Verified)

These 10 ExampleItems are source-backed by accepted visual verification notes. Their answers are either directly visible or deterministically derived from visible source items.

| exampleId | exampleType | sourcePage | sourceLocation | sourcePatternLabel | linkedCurriculumNode | linkedKnowledgePoint | linkedQuestionPattern | prompt | answerFormat | answer | answerStatus | difficultyTags | supportStatus | visualDependency | needsHumanReview | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ex_g3a_u01_p2_type01_001` | `sourceBacked` | `2` | `page_2_type_01` | `題型① 四位數位值分解` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_place_value_decompose` | `pv_4digit_decompose` | `7063 是 □ 個千、□ 個百、□ 個十、□ 個一，合起來是 □。` | `structured` | `{"thousands":7,"hundreds":0,"tens":6,"ones":3,"total":7063}` | `verified` | `basic`, `place_value_direct`, `zero_handling` | `v1NumberSenseSupported` | `none` | `false` | Source-backed by accepted visual verification notes. |
| `ex_g3a_u01_p2_type02_001` | `sourceBacked` | `2` | `page_2_type_02` | `題型② 四位數位值組合` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_place_value_compose` | `pv_4digit_compose` | `8 個一、5 個十、7 個千，合起來是 □。` | `numeric` | `7058` | `verified` | `basic`, `place_value_direct`, `zero_handling` | `v1NumberSenseSupported` | `none` | `false` | Source-backed by accepted visual verification notes. No hundreds component, so hundreds digit is 0. |
| `ex_g3a_u01_p2_type03_001` | `sourceBacked` | `2` | `page_2_type_03` | `題型③ 四位數讀寫` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_number_to_chinese` | `rw_4digit_number_to_chinese` | `5301 讀作 □。` | `text` | `五千三百零一` | `verified` | `basic`, `language_mapping` | `v1NumberSenseSupported` | `none` | `false` | Promoted from inferredExample based on accepted visual verification notes. Chinese reading follows standard Taiwan G3A convention. |
| `ex_g3a_u01_p2_type03_002` | `sourceBacked` | `2` | `page_2_type_03` | `題型③ 四位數讀寫` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_chinese_to_number` | `rw_4digit_chinese_to_number` | `七千六百零一寫成數字是 □。` | `numeric` | `7601` | `verified` | `basic`, `language_mapping` | `v1NumberSenseSupported` | `none` | `false` | Promoted from inferredExample based on accepted visual verification notes. |
| `ex_g3a_u01_p2_type03_003` | `sourceBacked` | `2` | `page_2_type_03` | `題型③ 四位數讀寫` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_zero_reading` | `rw_4digit_zero_reading` | `5003 讀作 □。` | `text` | `五千零三` | `verified` | `intermediate`, `zero_handling` | `v1NumberSenseSupported` | `none` | `false` | Promoted from inferredExample based on accepted visual verification notes. Demonstrates internal-zero reading pattern (two consecutive zeroes read as single 零). |
| `ex_g3a_u01_p1_seq_001` | `sourceBacked` | `1` | `page_1_place_step` | `位值步驟累加` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_place_sequence` | `seq_4digit_place_step` | `2985 依序向右累加 +1、+10、+100、+1000，填入空格。` | `structured` | `{"values":[2986,2996,3096,4096],"steps":[1,10,100,1000]}` | `verified` | `intermediate`, `sequence_step` | `v1NumberSenseSupported` | `none` | `false` | Promoted from inferredExample based on accepted visual verification notes. Answer is deterministically derived from the visible source item. |
| `ex_g3a_u01_p3_type04_001` | `sourceBacked` | `3` | `page_3_type_04` | `題型④ 兩數間的規律` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_between_numbers` | `seq_between_two_numbers` | `□－2997－2998－□－□－3001` | `structured` | `{"blanks":[2996,2999,3000],"step":1}` | `verified` | `intermediate`, `sequence_step` | `v1NumberSenseSupported` | `none` | `false` | Source-backed by accepted visual verification notes. Pattern label confirmed as 題型④. |
| `ex_g3a_u01_p3_type07_001` | `sourceBacked` | `3` | `page_3_type_07` | `題型⑦ 四位數比大小` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_number_compare` | `cmp_4digit_compare` | `6788 □ 6877` | `relation` | `<` | `verified` | `basic`, `comparison_direct` | `v1NumberSenseSupported` | `none` | `false` | Source-backed by accepted visual verification notes. |
| `ex_g3a_u01_p3_type08_001` | `sourceBacked` | `3` | `page_3_type_08` | `題型⑧ 四位數排大小` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_digit_permutation` | `perm_4digit_max_min_from_digits` | `用 0、2、5、8 排成的四位數中，數字不重複，最大的是 □，最小的是 □。` | `structured` | `{"max":8520,"min":2058}` | `verified` | `intermediate`, `digit_constraint` | `v1NumberSenseSupported` | `none` | `false` | Source-backed by accepted visual verification notes. Leading zero is not allowed for a four-digit number. |
| `ex_g3a_u01_p3_type05_001` | `sourceBacked` | `3` | `page_3_type_05` | `題型⑤ 四位數錢幣換算` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_money_payment` | `money_4digit_payment` | `55 個 10 元可以換成 □ 張一百元？` | `structured` | `{"hundred_bills":5,"remainder_10_coins":5,"remainder_value":50}` | `verified` | `intermediate`, `representation_composition` | `v1TextFallbackSupported` | `text_fallback` | `false` | Source-backed by accepted visual verification notes. 55 × 10 = 550 元，可換成 5 張 100 元，剩 5 個 10 元 (50 元)。Source asks only for hundred-bill count; remainder documented for completeness. |

### Representative ExampleItems — Source-Backed (to_be_verified or omitted_for_template)

These 2 ExampleItems are confirmed as present in the source PDF via accepted visual verification notes, but their answers depend on visual interpretation that cannot be deterministically resolved from text extraction alone.

| exampleId | exampleType | sourcePage | sourceLocation | sourcePatternLabel | linkedCurriculumNode | linkedKnowledgePoint | linkedQuestionPattern | prompt | answerFormat | answer | answerStatus | difficultyTags | supportStatus | visualDependency | needsHumanReview | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ex_g3a_u01_p3_type06_001` | `sourceBacked` | `3` | `page_3_type_06` | `題型⑥ 錢幣數量` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_money_counting` | `money_4digit_counting` | `圖出買這台螢幕需要的錢。螢幕價格：5398元。` | `numeric` | | `to_be_verified` | `intermediate`, `representation_counting` | `v1TextFallbackSupported` | `source_visual` | `true` | Source-backed visual panel confirmed by accepted visual verification notes. Answer requires visual denomination extraction from the money diagram; keep to_be_verified until a human extracts the exact denomination counts. |
| `ex_g3a_u01_p3_type09_001` | `sourceBacked` | `3` | `page_3_type_09` | `題型⑨ 整數數線` | `g3a_u01_numbers_within_10000` | `kp_g3a_u01_number_line_reading` | `numline_integer_reading` | `看數線上的箭頭所指的數。` | `visual` | | `omitted_for_template` | `intermediate`, `visual_interpretation` | `v1TextFallbackSupported` | `source_visual` | `false` | Source-backed visual number-line panel confirmed by accepted visual verification notes. Answer positions are visual and intentionally not extracted in this mapping. |

### ExampleItem coverage rule

For a formal mapping document, each `QuestionPattern` should ideally have at least one representative `ExampleItem`. This mapping achieves full coverage: 12 QuestionPatterns, 12 ExampleItems (10 sourceBacked verified, 1 sourceBacked to_be_verified, 1 sourceBacked omitted_for_template). Zero inferredExample items remain after S21B2 verification.

---

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

All DifficultyTag IDs use `snake_case` only. No kebab-case tags remain.

---

## 10. SupportStatus

Support status is implementation-state metadata. It must stay separate from curriculum semantics.

| SupportStatus | Meaning |
| --- | --- |
| `v1NumberSenseSupported` | Pattern is a strong candidate for direct v1 generator support using text-first number-sense logic. |
| `v1TextFallbackSupported` | Pattern belongs to the unit and should be mapped now, but v1 support is limited to text fallback or non-visual approximation. |

### Current unit-level interpretation

- `CurriculumNode`: `g3a_u01_numbers_within_10000` is classified as `v1NumberSenseSupported`.
- Individual patterns may still downgrade to `v1TextFallbackSupported` when the prompt depends on visual layouts such as money icons or number lines.

---

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
| formalMappingCoverage | Each `QuestionPattern` in this formal mapping must have at least one representative `ExampleItem` or an explicit `noSourceExampleAvailable` / `to_be_verified` status. All 12 patterns in this mapping have coverage. |

### Non-goal for this task

- No production generator, renderer, UI, test, package, or deployment changes are included here.
- This document is a formal mapping artifact only.

---

## 12. QA Checklist

- Confirm file is documentation only and does not modify production code or test assets.
- Confirm S21B2 uses operator-provided visual verification notes as the authority.
- Confirm no OCR is run by this task.
- Confirm no OCR scripts or rendered-page temporary artifacts are created.
- Confirm local source PDF path is `docs/curriculum/sources/g3a/u01/meow911_3a01_10000_numbers.pdf`.
- Confirm formal mapping file is at `docs/curriculum/mapping/S21B_G3A_U01_10000Numbers_FormalPatternMapping.md`.
- Confirm S21A template was not modified during this task.
- Confirm all sourceBacked examples are supported by accepted visual verification notes.
- Confirm no inferredExample is promoted without accepted visual verification note support.
- Confirm unresolved visual examples remain to_be_verified or omitted_for_template.
- Confirm `money_4digit_counting` has `needsHumanReview = true`.
- Confirm all `SourceMetadata` fields are present, including `sourceUrl`, `pageCount`, `manualReviewed`, `extractionConfidence`.
- Confirm `CurriculumNode` includes `examSegment = beforeMidterm`.
- Confirm all 13 canonical skills are present.
- Confirm all 12 `KnowledgePoint` entries are present with S21B2-normalized source evidence annotations.
- Confirm all 12 `QuestionPattern` entries are present with updated coverage status.
- Confirm every `QuestionPattern` has at least one ExampleItem or a documented exception (full coverage achieved).
- Confirm `sourceBacked` examples include `sourcePage` and `sourceLocation`.
- Confirm 0 `inferredExample` items remain — all promoted to `sourceBacked`.
- Confirm no `sourceBacked` example is inferred or generated.
- Confirm 10 of 12 ExampleItems have verified answers; 1 to_be_verified; 1 omitted_for_template.
- Confirm Coverage Summary totals match ExampleItem tables.
- Confirm `DifficultyTag` IDs use `snake_case` only; no kebab-case tags remain.
- Confirm no mojibake appears anywhere in the document.
- Confirm no production code, tests, UI, package, schema, deployment, or generated output files were changed.

---

## 13. Coverage Summary

| QuestionPattern ID | Has ExampleItem | ExampleItem Count | Source-Backed Count | Inferred Count | Needs Review Count | SupportStatus | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `pv_4digit_decompose` | yes | 1 | 1 | 0 | 0 | `v1NumberSenseSupported` | Verified by accepted visual verification notes. Ready for generator QA seed use. |
| `pv_4digit_compose` | yes | 1 | 1 | 0 | 0 | `v1NumberSenseSupported` | Verified by accepted visual verification notes. Includes zero-handling edge case. |
| `rw_4digit_number_to_chinese` | yes | 1 | 1 | 0 | 0 | `v1NumberSenseSupported` | Verified by accepted visual verification notes. Promoted from inferredExample. |
| `rw_4digit_chinese_to_number` | yes | 1 | 1 | 0 | 0 | `v1NumberSenseSupported` | Verified by accepted visual verification notes. Promoted from inferredExample. |
| `rw_4digit_zero_reading` | yes | 1 | 1 | 0 | 0 | `v1NumberSenseSupported` | Verified by accepted visual verification notes. Promoted from inferredExample. |
| `seq_4digit_place_step` | yes | 1 | 1 | 0 | 0 | `v1NumberSenseSupported` | Verified by accepted visual verification notes. Promoted from inferredExample. |
| `seq_between_two_numbers` | yes | 1 | 1 | 0 | 0 | `v1NumberSenseSupported` | Verified by accepted visual verification notes. |
| `cmp_4digit_compare` | yes | 1 | 1 | 0 | 0 | `v1NumberSenseSupported` | Verified by accepted visual verification notes. |
| `perm_4digit_max_min_from_digits` | yes | 1 | 1 | 0 | 0 | `v1NumberSenseSupported` | Verified by accepted visual verification notes. Leading-zero rule documented. |
| `numline_integer_reading` | yes | 1 | 1 | 0 | 0 | `v1TextFallbackSupported` | Source-backed visual number-line panel. Answer omitted_for_template; visual answer extraction intentionally deferred. |
| `money_4digit_counting` | yes | 1 | 1 | 0 | 1 | `v1TextFallbackSupported` | Source-backed visual panel. Answer to_be_verified; requires human visual denomination extraction. |
| `money_4digit_payment` | yes | 1 | 1 | 0 | 0 | `v1TextFallbackSupported` | Verified by accepted visual verification notes. Remainder documented for completeness. |

### Summary Totals

| Metric | Count |
| --- | --- |
| Total QuestionPatterns | 12 |
| Total ExampleItems | 12 |
| sourceBacked | 12 |
| inferredExample | 0 |
| Verified (answerStatus = verified) | 10 |
| To be verified (answerStatus = to_be_verified) | 1 |
| Omitted for template (visual) | 1 |
| Needs human PDF review | 1 |
| Coverage rate | 100% |