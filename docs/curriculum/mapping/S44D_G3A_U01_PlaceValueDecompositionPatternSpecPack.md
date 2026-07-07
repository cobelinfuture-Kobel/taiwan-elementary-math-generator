# S44D G3A-U01 PlaceValueDecompositionPatternSpecPack

## 1. Scope

Source unit: `g3a_u01_3a01`
KP covered: `kp_g3a_u01_digit_place_value_decomposition`
Source evidence: `S44A_IMG04`

S44D defines PatternSpecs for decomposing four-digit numbers and identifying the value of a digit by place.

## 2. PatternSpec list

| patternSpecId | display | answerShape |
|---|---|---|
| ps_g3a_u01_4digit_place_value_full_decomposition | 四位數完整位值分解 | place_value_tuple |
| ps_g3a_u01_4digit_digit_value_identification | 指定位數數字表示多少 | integer_or_unit_phrase |
| ps_g3a_u01_4digit_same_digit_different_place | 相同數字在不同位值的意義 | comparison_tuple |

## 3. Domain rules

| field | rule |
|---|---|
| number range | 1000-9999 |
| places | thousands, hundreds, tens, ones |
| zero digits | allowed |
| decomposition | thousandsCount, hundredsCount, tensCount, onesCount |

## 4. Prompt models

### Full decomposition

Prompt: `{number} 是幾個千、幾個百、幾個十、幾個一合起來的？`

Answer model:

```json
{
  "shape": "place_value_tuple",
  "fields": ["thousands", "hundreds", "tens", "ones"]
}
```

### Digit value identification

Prompt: `{number} 中的 {digit} 在 {placeName}，表示多少？`

Answer examples:
- `3個千`
- `7個百`
- `6個十`
- `5個一`

### Same digit different place

Prompt: `{number} 中兩個 {digit} 分別表示什麼？`

Use only numbers containing the same nonzero digit at two distinct places.

## 5. Validator contract

| check | error code |
|---|---|
| number has four digits | g3a_u01_place_value_number_invalid |
| decomposition matches each digit | g3a_u01_place_value_decomposition_mismatch |
| requested digit exists at place | g3a_u01_place_value_digit_place_mismatch |
| same digit appears at least twice | g3a_u01_place_value_same_digit_missing |
| answer fields are complete | g3a_u01_place_value_answer_shape_invalid |

## 6. Generator contract

Generator must produce:
1. Full decomposition tasks with mixed zero/nonzero digits.
2. Digit value identification tasks across all four places.
3. Same-digit-different-place tasks with nonzero repeated digits.
4. Deterministic output by seed.
5. Worksheet-safe prompt and answer strings.

## 7. Closeout

GOAL_DISTANCE_BEFORE = D2_G3A_U01_REPRESENTATION_PATTERNSPEC_CONTRACT_LOCKED
GOAL_DISTANCE_AFTER = D2_G3A_U01_PLACE_VALUE_DECOMPOSITION_PATTERNSPEC_LOCKED
DISTANCE_REDUCED = locked PatternSpecs for four-digit place-value decomposition and digit-value identification
REMAINING_BLOCKERS = S44E-S44H PatternSpec packs pending; generator implementation pending
NEXT_SHORTEST_STEP = S44E_G3A_U01_PlaceValueCompositionPatternSpecPack
