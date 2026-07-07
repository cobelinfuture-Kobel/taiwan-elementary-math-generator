# S44F G3A-U01 PlaceValueUnitConversionPatternSpecPack

## 1. Scope

Source unit: `g3a_u01_3a01`
KP covered: `kp_g3a_u01_place_value_unit_conversion`
Source evidence: `S44A_IMG06`, `S44A_IMG07`

S44F defines PatternSpecs for conversion between 十、百、千 units and money-context place-value exchange.

## 2. PatternSpec list

| patternSpecId | display | answerShape |
|---|---|---|
| ps_g3a_u01_tens_to_hundreds_conversion | 幾個十換成幾個百 | quotient_remainder |
| ps_g3a_u01_hundreds_to_thousands_conversion | 幾個百換成幾個千 | quotient_remainder |
| ps_g3a_u01_money_place_value_exchange | 錢幣位值換算 | quotient_remainder |

## 3. Conversion rules

| conversion | rule |
|---|---|
| tens to hundreds | hundreds = floor(tens / 10), tensLeft = tens % 10 |
| hundreds to thousands | thousands = floor(hundreds / 10), hundredsLeft = hundreds % 10 |
| money exchange | 10元, 100元, 1000元 follow the same place-value base-10 exchange |

## 4. Validator contract

| check | error code |
|---|---|
| source count is positive integer | g3a_u01_unit_conversion_count_invalid |
| quotient and remainder match base-10 exchange | g3a_u01_unit_conversion_answer_mismatch |
| remainder is smaller than 10 | g3a_u01_unit_conversion_remainder_invalid |
| money prompt uses valid denominations | g3a_u01_money_conversion_unit_invalid |

## 5. Generator contract

Generator must:
1. Produce deterministic exchange tasks.
2. Include exact and remainder exchange cases.
3. Use answer text that can show both quotient and leftover units.
4. Preserve elementary money wording for money prompts.

## 6. Closeout

GOAL_DISTANCE_BEFORE = D2_G3A_U01_PLACE_VALUE_COMPOSITION_PATTERNSPEC_LOCKED
GOAL_DISTANCE_AFTER = D2_G3A_U01_PLACE_VALUE_UNIT_CONVERSION_PATTERNSPEC_LOCKED
DISTANCE_REDUCED = locked PatternSpecs for place-value and money unit conversion
REMAINING_BLOCKERS = S44G-S44H PatternSpec packs pending; generator implementation pending
NEXT_SHORTEST_STEP = S44G_G3A_U01_DigitArrangementMaxMinPatternSpecPack
