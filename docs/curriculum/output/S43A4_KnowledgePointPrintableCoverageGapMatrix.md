# S43A4 KnowledgePoint Printable Coverage Gap Matrix

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43A4_KnowledgePointPrintableCoverageGapMatrix
TASK_STATUS = GAP_MATRIX
WRITE_TYPE = docs_only
```

S43A4 classifies the 172 Batch A draft KnowledgePoint candidates from S43A3 into printable coverage classes.

This is not a production registry. It does not create or modify JSON registry files, PatternSpecs, generator code, validator code, renderer code, or HTML UI.

## Inputs

```text
primaryInput = docs/curriculum/output/S43A3_ExpectedKnowledgePointListDraftFor13Units.md
secondaryInput = docs/curriculum/output/S43A2_CurrentSourceToPatternSpecCoverageReadback.md
sourceAuthority = manual_visual_read_summary
```

## Printable Coverage Classes

```text
A = existing PatternSpec seed can print a coarse worksheet now
B = needs a new fine-grained PatternSpec, but existing expression / comparison style generator likely supports it
C = needs generator and/or validator variant before printable production
D = blocked for S43 printable path by visual, word-problem template, future-domain, or plannedOnly requirement
```

Important boundary:

```text
A does not mean KnowledgePoint-level HTML selection exists.
A only means the existing source-level browser PatternSpec can seed a future PatternGroup and can currently print a coarse worksheet through the S42 source-unit path.
```

## Summary Counts

```text
knowledgePointDraftRows = 172
A_existingSeedCoarsePrintable = 14
B_newFinePattern_existingGeneratorLikely = 37
C_needsGeneratorOrValidatorVariant = 86
D_blockedForS43Printable = 35
```

## Unit-Level Count Matrix

| sourceId | unit | total KP | A | B | C | D |
|---|---|---:|---:|---:|---:|---:|
| g3a_u01_3a01 | 3A-U01 10000以內的數 | 17 | 1 | 1 | 13 | 2 |
| g3a_u02_3a02 | 3A-U02 四位數的加減 | 9 | 2 | 0 | 5 | 2 |
| g3a_u03_3a03 | 3A-U03 乘法 | 9 | 1 | 3 | 3 | 2 |
| g3a_u06_3a06 | 3A-U06 二位數除以一位數 | 14 | 1 | 0 | 6 | 7 |
| g3b_u01_3b01 | 3B-U01 除法 | 20 | 1 | 4 | 12 | 3 |
| g3b_u04_3b04 | 3B-U04 兩步驟計算 | 12 | 1 | 4 | 0 | 7 |
| g3b_u08_3b08 | 3B-U08 乘法與除法 | 17 | 1 | 0 | 10 | 6 |
| g4a_u01_4a01 | 4A-U01 1億以內的數 | 17 | 1 | 4 | 11 | 1 |
| g4a_u02_4a02 | 4A-U02 整數的乘法 | 9 | 1 | 5 | 3 | 0 |
| g4a_u04_4a04 | 4A-U04 整數的除法 | 9 | 1 | 3 | 4 | 1 |
| g4a_u08_4a08 | 4A-U08 整數四則 | 14 | 1 | 4 | 8 | 1 |
| g4b_u01_4b01 | 4B-U01 多位數的乘與除 | 11 | 1 | 5 | 5 | 0 |
| g5a_u08_5a08 | 5A-U08 整數四則 | 14 | 1 | 4 | 6 | 3 |
| **Total** |  | **172** | **14** | **37** | **86** | **35** |

---

## Full Classification by Unit

### g3a_u01_3a01 — 3A-U01 10000以內的數

```text
A:
- kp_g3a_u01_4digit_compare

B:
- kp_g3a_u01_max_min_4digit

C:
- kp_g3a_u01_base10_table_4digit
- kp_g3a_u01_number_to_chinese
- kp_g3a_u01_chinese_to_number
- kp_g3a_u01_money_representation
- kp_g3a_u01_place_value_blank
- kp_g3a_u01_unknown_digit_reasoning
- kp_g3a_u01_number_line_addition
- kp_g3a_u01_number_line_subtraction
- kp_g3a_u01_place_value_decomposition
- kp_g3a_u01_place_value_composition
- kp_g3a_u01_4digit_read_write
- kp_g3a_u01_money_conversion_4digit
- kp_g3a_u01_integer_number_line

D:
- kp_g3a_u01_number_line_drawing
- kp_g3a_u01_between_numbers_pattern
```

Reasoning:

```text
Existing compare PatternSpec can seed one coarse printable group.
Most place-value / read-write / money / number-line tasks need number-sense generator or validator variants.
Number-line drawing and pattern sequence are not S43 printable without visual / pattern engine support.
```

### g3a_u02_3a02 — 3A-U02 四位數的加減

```text
A:
- kp_g3a_u02_add_multi_carry
- kp_g3a_u02_sub_multi_borrow

B:
- none

C:
- kp_g3a_u02_sub_consecutive_borrow
- kp_g3a_u02_vertical_add_missing_digit
- kp_g3a_u02_vertical_sub_missing_digit
- kp_g3a_u02_sub_missing_middle_digit
- kp_g3a_u02_borrow_zero_middle_handling

D:
- kp_g3a_u02_estimate_nearest_thousand
- kp_g3a_u02_word_problem_estimation_add_sub
```

Reasoning:

```text
Existing add/sub PatternSpecs can seed coarse printables, but carry/borrow is not explicitly enforced yet.
Missing-digit and zero-middle-borrow tasks need validator/generator variants.
Estimation is plannedOnly and word-problem estimation needs a word-problem template.
```

### g3a_u03_3a03 — 3A-U03 乘法

```text
A:
- kp_g3a_u03_2digit_by_1digit_carry

B:
- kp_g3a_u03_multiple_of_10_by_1digit
- kp_g3a_u03_3digit_by_1digit
- kp_g3a_u03_consecutive_multiplication

C:
- kp_g3a_u03_base10_multiplication_principle
- kp_g3a_u03_3digit_by_1digit_missing_digit
- kp_g3a_u03_vertical_multiplication_missing_digit

D:
- kp_g3a_u03_2digit_round10_then_multiply
- kp_g3a_u03_3digit_round100_then_multiply
```

Reasoning:

```text
Simple multiplication ranges are likely existing expression-generator compatible after new fine PatternSpec rows.
Base10 principle and missing-digit vertical tasks need variants.
Rounding/estimation tasks remain plannedOnly for S43.
```

### g3a_u06_3a06 — 3A-U06 二位數除以一位數

```text
A:
- kp_g3a_u06_exact_divisibility_check

B:
- none

C:
- kp_g3a_u06_estimate_quotient_by_multiplication
- kp_g3a_u06_long_division_method
- kp_g3a_u06_division_with_remainder
- kp_g3a_u06_division_missing_digit
- kp_g3a_u06_zero_and_one_division
- kp_g3a_u06_number_line_even_range_reasoning

D:
- kp_g3a_u06_even_odd_judgment
- kp_g3a_u06_division_language_conversion
- kp_g3a_u06_containment_and_equal_sharing
- kp_g3a_u06_division_as_fraction
- kp_g3a_u06_answer_unit_change
- kp_g3a_u06_division_word_problem
- kp_g3a_u06_remainder_context_reasoning
```

Reasoning:

```text
Existing exact division seed is printable at coarse level.
Remainder, missing-digit, zero/divide-by-one, and number-line reasoning require generator/validator variants.
Word-problem, fraction, and plannedOnly rows are blocked for S43 printable path.
```

### g3b_u01_3b01 — 3B-U01 除法

```text
A:
- kp_g3b_u01_3digit_by_1digit_high_place_insufficient

B:
- kp_g3b_u01_divide_then_add
- kp_g3b_u01_add_then_divide
- kp_g3b_u01_divide_then_subtract
- kp_g3b_u01_subtract_then_divide

C:
- kp_g3b_u01_quotient_estimation
- kp_g3b_u01_quotient_place_ones_tens
- kp_g3b_u01_remainder_less_than_divisor
- kp_g3b_u01_2digit_by_1digit_high_place_insufficient
- kp_g3b_u01_2digit_by_1digit_ones_insufficient
- kp_g3b_u01_2digit_by_1digit_remainder_cases
- kp_g3b_u01_3digit_by_1digit_tens_insufficient
- kp_g3b_u01_3digit_by_1digit_ones_insufficient
- kp_g3b_u01_tens_and_ones_insufficient
- kp_g3b_u01_quotient_zero_placeholder
- kp_g3b_u01_middle_zero_or_missing_digit
- kp_g3b_u01_division_estimation

D:
- kp_g3b_u01_equal_sharing_division
- kp_g3b_u01_containment_division
- kp_g3b_u01_division_unit_conversion
```

Reasoning:

```text
One exact-division seed exists, but its regroup constraint is not yet explicit.
Two-step numeric expression rows are likely existing expression-generator compatible.
Most division algorithm subcases need explicit quotient-place / remainder / zero-placeholder hooks.
Equal-sharing, containment, and unit-conversion context rows need word-problem templates.
```

### g3b_u04_3b04 — 3B-U04 兩步驟計算

```text
A:
- kp_g3b_u04_consecutive_multiplication

B:
- kp_g3b_u04_add_then_divide
- kp_g3b_u04_subtract_then_divide
- kp_g3b_u04_divide_then_add
- kp_g3b_u04_divide_then_subtract

C:
- none

D:
- kp_g3b_u04_multiple_word_problem
- kp_g3b_u04_line_diagram_two_step_word_problem
- kp_g3b_u04_equal_sharing_then_add_sub
- kp_g3b_u04_containment_then_add_sub
- kp_g3b_u04_multiplication_context
- kp_g3b_u04_multiple_relation_chain
- kp_g3b_u04_multi_layer_multiple_reasoning
```

Reasoning:

```text
Two-step numeric rows can likely use expression PatternSpecs.
Context, line-diagram, multiple-relation, and word-problem rows are blocked until word-problem / visual support exists.
```

### g3b_u08_3b08 — 3B-U08 乘法與除法

```text
A:
- kp_g3b_u08_inverse_no_calculation

B:
- none

C:
- kp_g3b_u08_add_sub_inverse_transposition
- kp_g3b_u08_addition_commutative
- kp_g3b_u08_unknown_by_inverse
- kp_g3b_u08_mul_div_inverse_transposition
- kp_g3b_u08_multiplication_commutative
- kp_g3b_u08_inverse_vertical_unknown
- kp_g3b_u08_multiplication_check_division
- kp_g3b_u08_division_check_no_remainder
- kp_g3b_u08_division_check_with_remainder
- kp_g3b_u08_unknown_dividend

D:
- kp_g3b_u08_unit_price_unit_amount
- kp_g3b_u08_average_per_share
- kp_g3b_u08_equal_share_containment
- kp_g3b_u08_division_sentence
- kp_g3b_u08_shopping_estimation
- kp_g3b_u08_better_buy_compare
```

Reasoning:

```text
The current seed only gives a coarse exact-division inverse-check bridge.
Unknowns, commutativity, transposition, and remainder checks need generator/validator variants.
Shopping, unit-price, equal-share, and comparison contexts need word-problem templates.
```

### g4a_u01_4a01 — 4A-U01 1億以內的數

```text
A:
- kp_g4a_u01_8digit_compare

B:
- kp_g4a_u01_100million_compare
- kp_g4a_u01_make_5digit_from_digits
- kp_g4a_u01_unknown_digit_max_min
- kp_g4a_u01_large_number_add_sub

C:
- kp_g4a_u01_base10_table_100k
- kp_g4a_u01_decomposition_100k
- kp_g4a_u01_composition_100k
- kp_g4a_u01_reading_100k
- kp_g4a_u01_base10_table_100million
- kp_g4a_u01_3digit_sectioning
- kp_g4a_u01_4digit_sectioning
- kp_g4a_u01_100million_read_write
- kp_g4a_u01_large_number_vertical_calculation
- kp_g4a_u01_middle_zero_read_write
- kp_g4a_u01_8digit_decompose_compose

D:
- kp_g4a_u01_between_numbers_pattern
```

Reasoning:

```text
Comparison and large-number add/sub can likely reuse existing comparison/expression paths after fine PatternSpecs.
Read/write, sectioning, decomposition/composition, and middle-zero reading require number-sense variants.
Pattern sequence remains plannedOnly.
```

### g4a_u02_4a02 — 4A-U02 整數的乘法

```text
A:
- kp_g4a_u02_2digit_by_2digit

B:
- kp_g4a_u02_3digit_by_1digit_review
- kp_g4a_u02_multiple_of_10_multiplication
- kp_g4a_u02_1digit_by_2digit
- kp_g4a_u02_1digit_by_3digit
- kp_g4a_u02_10multiple_by_10multiple

C:
- kp_g4a_u02_base10_multiplication_principle
- kp_g4a_u02_4digit_by_1digit_missing_digit
- kp_g4a_u02_vertical_place_alignment

D:
- none
```

Reasoning:

```text
Most multiplication range variants can be supported by expression PatternSpecs.
Base10 principle, missing digit, and vertical alignment need variants.
```

### g4a_u04_4a04 — 4A-U04 整數的除法

```text
A:
- kp_g4a_u04_4digit_by_1digit_thousands_enough

B:
- kp_g4a_u04_2digit_by_2digit
- kp_g4a_u04_divisor_multiple_of_10
- kp_g4a_u04_3digit_by_2digit

C:
- kp_g4a_u04_4digit_by_1digit_thousands_insufficient
- kp_g4a_u04_4digit_by_1digit_thousands_exact
- kp_g4a_u04_remainder_less_than_divisor
- kp_g4a_u04_quotient_estimation

D:
- kp_g4a_u04_division_learning_progression
```

Reasoning:

```text
Exact division seed exists for a coarse four-digit by one-digit route.
Two-digit divisor variants can likely use expression constraints after fine PatternSpecs.
Highest-place insufficiency, exact high-place behavior, remainder, and quotient estimation need validator/generator variants.
Learning progression is not a printable question pattern.
```

### g4a_u08_4a08 — 4A-U08 整數四則

```text
A:
- kp_g4a_u08_add_sub_left_to_right

B:
- kp_g4a_u08_add_sub_symbol_position
- kp_g4a_u08_multiply_then_divide
- kp_g4a_u08_divide_then_multiply
- kp_g4a_u08_mixed_operations_without_parentheses

C:
- kp_g4a_u08_rearrange_numbers_for_easier_calculation
- kp_g4a_u08_minus_to_front
- kp_g4a_u08_parentheses_first
- kp_g4a_u08_consecutive_subtraction_parentheses
- kp_g4a_u08_mul_div_commutative_associative
- kp_g4a_u08_add_sub_with_multiply_divide_precedence
- kp_g4a_u08_parentheses_and_operation_order
- kp_g4a_u08_mul_div_before_add_sub

D:
- kp_g4a_u08_two_step_word_problem
```

Reasoning:

```text
Simple numeric mixed-operation rows can use expression path after fine PatternSpecs.
Parentheses, precedence, rearrangement, and laws require validator/generator variants.
Word problem row is blocked until template support exists.
```

### g4b_u01_4b01 — 4B-U01 多位數的乘與除

```text
A:
- kp_g4b_u01_multiplier_trailing_zero

B:
- kp_g4b_u01_3digit_by_3digit
- kp_g4b_u01_4digit_by_3digit
- kp_g4b_u01_3digit_by_3digit_division
- kp_g4b_u01_4digit_by_3digit_no_regroup
- kp_g4b_u01_4digit_by_3digit_regroup

C:
- kp_g4b_u01_product_row_count_by_digits
- kp_g4b_u01_multiplier_middle_zero
- kp_g4b_u01_multiplicand_trailing_zero
- kp_g4b_u01_both_operands_trailing_zero
- kp_g4b_u01_mul_div_vertical_place_alignment

D:
- none
```

Reasoning:

```text
Core multi-digit multiplication/division can likely use expression PatternSpecs.
Row-count, middle-zero, trailing-zero handling beyond current seed, and place alignment need variants or explicit constraints.
```

### g5a_u08_5a08 — 5A-U08 整數四則

```text
A:
- kp_g5a_u08_consecutive_subtraction

B:
- kp_g5a_u08_integer_mixed_operations
- kp_g5a_u08_add_sub_associative
- kp_g5a_u08_add_sub_mul_div_mixed
- kp_g5a_u08_consecutive_division

C:
- kp_g5a_u08_same_multiplier_two_products_sum
- kp_g5a_u08_same_multiplier_two_products_difference
- kp_g5a_u08_reverse_distributive_property
- kp_g5a_u08_commutative_associative
- kp_g5a_u08_distributive_property_simplification
- kp_g5a_u08_large_number_add_sub_simplification

D:
- kp_g5a_u08_distributive_property_word_sum_diff
- kp_g5a_u08_shopping_discount_change_word_problem
- kp_g5a_u08_average_pack_then_add_sub_word_problem
```

Reasoning:

```text
Basic mixed numeric operations can use expression path after fine PatternSpecs.
Distributive-property transformations and simplification need validator/generator variants.
Word-problem rows require templates.
```

---

## Implementation Implication

S43 should not try to make all 172 KP draft rows printable at once.

Recommended immediate implementation strategy after S43A closeout:

```text
1. Use A rows as PatternGroup seed rows.
2. Select a small P0 slice from B/C inside g3a_u02_3a02 for prototype.
3. Keep D rows hidden from HTML until the required future engine/template exists.
```

## S43A4 Gate

```text
S43A4_GATE = PASS_PRINTABLE_COVERAGE_GAP_MATRIX

PASS:
- 172 / 172 draft KnowledgePoint rows classified into A/B/C/D
- 13 / 13 source units have printable coverage gap counts
- A rows are explicitly limited to coarse source-level seed printability
- D rows are explicitly blocked from S43 HTML selection
- no UI / generator / validator implementation introduced

GAPS:
- KnowledgePointNode schema not locked yet
- PatternGroup schema not locked yet
- KnowledgePointPatternMap schema not locked yet
- A rows not yet materialized as PatternGroup JSON
- B/C rows not yet converted to fine PatternSpec implementation tasks
- D rows not yet encoded as hidden/blocked in HTML selector rules
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D3_EXPECTED_KP_DRAFT_IDS_CREATED_FOR_13_UNITS
GOAL_DISTANCE_AFTER  = D3_KP_PRINTABLE_GAP_MATRIX_CLASSIFIED
DISTANCE_REDUCED     = 172 KP draft rows now have printable coverage classes, separating immediately reusable coarse seeds from fine-pattern, variant, and blocked work

ExpectedKPDraft                   100% -> 100%
PrintableCoverageClassification     0% -> 100%
KnowledgePointSchema                0% ->   0%
PatternGroupSchema                  0% ->   0%
PatternGroupRegistry                0% ->   0%
KPHTMLSelectablePath                0% ->   0%
S43Overall                         22% ->  28%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "KnowledgePointNode schema 尚未鎖定",
  "PatternGroup schema 尚未鎖定",
  "KnowledgePointPatternMap schema 尚未鎖定",
  "172 個 KP draft rows 尚未進 JSON registry",
  "A 類 PatternSpec seeds 尚未 materialize 為 PatternGroup JSON",
  "B/C 類尚未拆成 PatternSpec / generator / validator implementation tasks",
  "D 類尚未寫入 HTML hidden/blocked policy",
  "HTML KnowledgePoint selector 尚未實作",
  "per-KP printable QA 尚未建立"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43A5_S43ImplementationOrderDecision
```

S43A5 should decide the first implementation slice after inventory:

```text
Recommended candidate = g3a_u02_3a02 P0 prototype
Reason = has 2 A seeds, 5 C fine constraints, and 2 D blocked rows; best tests A/B/C/D handling and future HTML KP selector behavior.
```
