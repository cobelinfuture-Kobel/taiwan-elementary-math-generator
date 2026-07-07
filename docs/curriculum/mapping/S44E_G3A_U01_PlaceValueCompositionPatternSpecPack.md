# S44E G3A-U01 PlaceValueCompositionPatternSpecPack

## 1. Scope

Source unit: `g3a_u01_3a01`
KP covered: `kp_g3a_u01_place_value_composition`
Source evidence: `S44A_IMG05`

S44E defines PatternSpecs for composing a number from 千/百/十/一 counts.

## 2. PatternSpec list

| patternSpecId | display | answerShape |
|---|---|---|
| ps_g3a_u01_place_value_standard_composition | 標準位值組合 | integer |
| ps_g3a_u01_place_value_nonstandard_composition | 非標準位值組合 | integer |
| ps_g3a_u01_place_value_partial_composition | 部分位值組合 | integer |

## 3. Core rule

For all composition specs:

`answer = thousands*1000 + hundreds*100 + tens*10 + ones`

The first implementation keeps the answer inside 1000-9999.

## 4. Variant rules

| spec | rule |
|---|---|
| standard_composition | each count is 0-9 |
| nonstandard_composition | at least one lower-place count may exceed 9, then normalize by weighted sum |
| partial_composition | prompt may omit zero-count places |

## 5. Validator contract

| check | error code |
|---|---|
| computed total is 1000-9999 | g3a_u01_composition_total_out_of_range |
| answer equals weighted unit sum | g3a_u01_composition_answer_mismatch |
| standard spec uses single-digit counts | g3a_u01_composition_standard_count_invalid |
| nonstandard spec contains a nonstandard count | g3a_u01_composition_nonstandard_missing |
| prompt slots are resolved | g3a_u01_composition_prompt_slot_unresolved |

## 6. Generator contract

Generator must produce deterministic standard, nonstandard, and partial composition tasks. Answer text is an Arabic numeral string.

## 7. Closeout

GOAL_DISTANCE_BEFORE = D2_G3A_U01_PLACE_VALUE_DECOMPOSITION_PATTERNSPEC_LOCKED
GOAL_DISTANCE_AFTER = D2_G3A_U01_PLACE_VALUE_COMPOSITION_PATTERNSPEC_LOCKED
DISTANCE_REDUCED = locked PatternSpecs for place-value composition
REMAINING_BLOCKERS = S44F-S44H PatternSpec packs pending; generator implementation pending
NEXT_SHORTEST_STEP = S44F_G3A_U01_PlaceValueUnitConversionPatternSpecPack
