# S44H G3A-U01 RangeReasoningPatternSpecPack

## 1. Scope

Source unit: `g3a_u01_3a01`
KP covered: `kp_g3a_u01_range_reasoning`
Source evidence: `S44A_IMG08`

S44H defines the first contract for four-digit condition and range reasoning. This pack is intentionally conservative because answer ambiguity risk is higher than the earlier G3A-U01 packs.

## 2. PatternSpec list

| patternSpecId | display | answerShape |
|---|---|---|
| ps_g3a_u01_4digit_range_compare_reasoning | 四位數範圍比較推理 | boolean_or_choice |
| ps_g3a_u01_4digit_serial_number_range | 編號範圍推理 | integer_or_choice |
| ps_g3a_u01_4digit_price_range_reasoning | 價格範圍推理 | integer_or_choice |

## 3. First implementation boundary

S44H is a contract only. First implementation should support only deterministic, single-answer prompts. Open-ended prompts that allow many correct answers remain out of scope until a later recursive improvement task.

## 4. Validator contract

| check | error code |
|---|---|
| condition set is deterministic | g3a_u01_range_reasoning_condition_ambiguous |
| answer belongs to valid range | g3a_u01_range_reasoning_answer_out_of_range |
| comparison statement is true/false as expected | g3a_u01_range_reasoning_compare_mismatch |
| serial number boundary is correct | g3a_u01_range_reasoning_serial_boundary_mismatch |
| price interval answer is valid | g3a_u01_range_reasoning_price_mismatch |

## 5. Generator contract

Generator must:
1. Use closed finite ranges.
2. Avoid prompts with multiple valid numeric answers unless answerShape explicitly supports a set.
3. Keep values inside 1000-9999 when four-digit reasoning is required.
4. Return a clear answer key item.

## 6. Deferred variants

| variant | reason deferred |
|---|---|
| open-ended possible-values prompts | may require set-valued answer and display model |
| multi-condition story prompts | needs stronger ambiguity validator |
| mixed max/min plus range prompt | should wait until arrangement PatternSpecs are implemented |

## 7. Closeout

GOAL_DISTANCE_BEFORE = D2_G3A_U01_DIGIT_ARRANGEMENT_PATTERNSPEC_LOCKED
GOAL_DISTANCE_AFTER = D2_G3A_U01_RANGE_REASONING_PATTERNSPEC_LOCKED
DISTANCE_REDUCED = locked conservative PatternSpec contract for four-digit range reasoning
REMAINING_BLOCKERS = generator implementation packs S44I-S44K pending; selector promotion pending
NEXT_SHORTEST_STEP = S44I_G3A_U01_GeneratorValidatorPack1
