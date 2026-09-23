# S44B G3A-U01 KnowledgePointExpansionContract

## 1. Scope

Source unit: `g3a_u01_3a01`
Unit title: `10000以內的數`
Precondition: S44A source image scan exists and normalized the operator images into KP candidates.

S44B locks the G3A-U01 expansion KnowledgePoint contract. It is documentation-only and does not update runtime registry modules.

## 2. Expansion target

Before S44 expansion, G3A-U01 has one visible KP:

| knowledgePointId | displayName | status |
|---|---|---|
| kp_g3a_u01_4digit_compare | 四位數比大小 | existing visible KP |

S44B locks seven new KPs, making the target G3A-U01 KP set equal to eight KPs.

## 3. Locked G3A-U01 KP set

| order | knowledgePointId | displayName | canonicalSkillTag | representationTag | sourceRefs |
|---:|---|---|---|---|---|
| 1 | kp_g3a_u01_4digit_compare | 四位數比大小 | integer_comparison | numeric_expression | existing |
| 2 | kp_g3a_u01_number_to_chinese | 四位數數字轉中文數字 | number_representation | conversion_prompt | S44A_IMG01 |
| 3 | kp_g3a_u01_chinese_to_number | 中文數字轉四位數 | number_representation | conversion_prompt | S44A_IMG02 |
| 4 | kp_g3a_u01_digit_place_value_decomposition | 四位數位值分解與位值判讀 | place_value | decomposition_prompt | S44A_IMG04 |
| 5 | kp_g3a_u01_place_value_composition | 四位數位值組合 | place_value | composition_prompt | S44A_IMG05 |
| 6 | kp_g3a_u01_place_value_unit_conversion | 四位數位值換算：十、百、千、金錢 | place_value | unit_conversion_prompt | S44A_IMG06, S44A_IMG07 |
| 7 | kp_g3a_u01_digit_arrangement_max_min | 指定數字組成最大 / 最小四位數 | place_value_reasoning | arrangement_prompt | S44A_IMG03 |
| 8 | kp_g3a_u01_range_reasoning | 四位數條件範圍推理 | place_value_reasoning | reasoning_prompt | S44A_IMG08 |

## 4. Implementation batches

| batch | KPs | reason |
|---|---|---|
| Pack1 | number_to_chinese, chinese_to_number, decomposition, composition | most deterministic and suitable for first generator/validator pack |
| Pack2 | unit_conversion, digit_arrangement_max_min | requires exchange rules and no-leading-zero arrangement rules |
| Pack3 | range_reasoning | highest ambiguity risk; needs stricter validator contract |

## 5. Non-KP template dimensions

The following should not become separate KPs unless future evidence requires it:

| dimension | status | note |
|---|---|---|
| money context | template dimension | belongs under `place_value_unit_conversion` |
| zero inside four-digit number | PatternSpec constraint | applies to number/chinese conversion |
| standard vs nonstandard counts | PatternSpec variant | belongs under `place_value_composition` |
| max-only or min-only prompt | PatternSpec variant | belongs under `digit_arrangement_max_min` |

## 6. Promotion target

After all S44 implementation and QA tasks pass, selector target becomes:

| sourceId | previous visibleCount | target visibleCount |
|---|---:|---:|
| g3a_u01_3a01 | 1 | 8 |

Batch A target visible count becomes 34 + 7 = 41, assuming no other source changes.

## 7. Closeout

GOAL_DISTANCE_BEFORE = D3_G3A_U01_KP_CANDIDATES_FROM_SOURCE_IMAGES
GOAL_DISTANCE_AFTER = D3_G3A_U01_KP_EXPANSION_CONTRACT_LOCKED
DISTANCE_REDUCED = locked seven new G3A-U01 KnowledgePoints and one existing KP into an eight-KP target set
REMAINING_BLOCKERS = PatternSpec packs not defined; generators not implemented; selector promotion not done
NEXT_SHORTEST_STEP = S44C_G3A_U01_RepresentationPatternSpecPack
