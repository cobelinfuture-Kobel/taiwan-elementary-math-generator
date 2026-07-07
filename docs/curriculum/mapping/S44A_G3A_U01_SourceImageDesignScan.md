# S44A G3A-U01 SourceImageDesignScan

## 1. Scope

Source unit: `g3a_u01_3a01`
Unit title: `10000以內的數`
Current visible KP before S44: `kp_g3a_u01_4digit_compare`

This scan converts the 8 operator-provided images into source evidence and KnowledgePoint candidates. The task is documentation-only. No runtime, registry, generator, validator, renderer, or test file is modified by S44A.

## 2. Source image evidence inventory

| source_ref | observed title / prompt | extracted structure | candidate KP |
|---|---|---|---|
| S44A_IMG01 | 數字寫成中文 | four place-value digits are mapped to 千位/百位/十位/個位, then written as Chinese numerals | number_to_chinese |
| S44A_IMG02 | 中文寫成數字 | Chinese place-value words are mapped back into 千位/百位/十位/個位 digits | chinese_to_number |
| S44A_IMG03 | 用 0、1、6、9 四個數字來組合四位數 | arrange four digits to form the largest and smallest valid 4-digit numbers | digit_arrangement_max_min |
| S44A_IMG04 | 四位數位值分解 | decompose a 4-digit number into 千/百/十/一 and identify digit value by position | digit_place_value_decomposition |
| S44A_IMG05 | 四位數位值組合 | compose numbers from counts of 千/百/十/一, including nonstandard counts such as 13個十 or 18個百 | place_value_composition |
| S44A_IMG06 | 四位數錢幣換算 | exchange 10元, 100元, 1000元 units using place-value equivalence | place_value_unit_conversion |
| S44A_IMG07 | 四位數錢幣換算 | duplicate of S44A_IMG06; same source concept, not a separate KP | place_value_unit_conversion |
| S44A_IMG08 | 四位數比大小 / 條件推理 | compare, arrange, and reason about 4-digit values under constraints | range_reasoning |

## 3. Normalized candidate KnowledgePoints

S44A proposes 7 new candidate KPs plus the existing compare KP.

| candidate_id | display_name | source_refs | role |
|---|---|---|---|
| kp_g3a_u01_number_to_chinese | 四位數數字轉中文數字 | S44A_IMG01 | new |
| kp_g3a_u01_chinese_to_number | 中文數字轉四位數 | S44A_IMG02 | new |
| kp_g3a_u01_digit_arrangement_max_min | 指定數字組成最大 / 最小四位數 | S44A_IMG03 | new |
| kp_g3a_u01_digit_place_value_decomposition | 四位數位值分解與位值判讀 | S44A_IMG04 | new |
| kp_g3a_u01_place_value_composition | 四位數位值組合 | S44A_IMG05 | new |
| kp_g3a_u01_place_value_unit_conversion | 四位數位值換算：十、百、千、金錢 | S44A_IMG06, S44A_IMG07 | new |
| kp_g3a_u01_range_reasoning | 四位數條件範圍推理 | S44A_IMG08 | new |
| kp_g3a_u01_4digit_compare | 四位數比大小 | existing prior source | existing |

## 4. Representation grouping

| group | KPs | implementation risk |
|---|---|---|
| representation conversion | number_to_chinese, chinese_to_number | medium: Chinese zero rules must be deterministic |
| place value | decomposition, composition, unit_conversion | medium: nonstandard counts need normalization |
| arrangement and reasoning | digit_arrangement_max_min, range_reasoning, compare | high for range_reasoning; low for max/min |

## 5. Duplicate source handling

S44A_IMG06 and S44A_IMG07 are the same money/unit-conversion worksheet image. They should remain separate source observations but map to one KP candidate: `kp_g3a_u01_place_value_unit_conversion`.

## 6. Out-of-scope for S44A

- No registry update.
- No PatternSpec schema.
- No generator or validator.
- No selector promotion.
- No PDF smoke.

## 7. Closeout

GOAL_DISTANCE_BEFORE = D4_G3A_U01_IMAGE_SOURCES_ONLY
GOAL_DISTANCE_AFTER = D3_G3A_U01_KP_CANDIDATES_FROM_SOURCE_IMAGES
DISTANCE_REDUCED = converted eight source images into normalized source evidence and KP candidates
REMAINING_BLOCKERS = KP contract not yet locked; PatternSpecs not yet defined; generators not yet implemented
NEXT_SHORTEST_STEP = S44B_G3A_U01_KnowledgePointExpansionContract
