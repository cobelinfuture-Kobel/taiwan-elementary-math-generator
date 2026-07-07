# S44C G3A-U01 RepresentationPatternSpecPack

## 1. Scope

Source unit: `g3a_u01_3a01`
KPs covered:
- `kp_g3a_u01_number_to_chinese`
- `kp_g3a_u01_chinese_to_number`

S44C defines the PatternSpec contract for four-digit Arabic-number and Chinese-number conversion. It is documentation-only.

## 2. Source evidence

| source_ref | mapping |
|---|---|
| S44A_IMG01 | 數字寫成中文 |
| S44A_IMG02 | 中文寫成數字 |

## 3. PatternSpec list

| patternSpecId | KP | answerShape | zeroPolicy |
|---|---|---|---|
| ps_g3a_u01_4digit_number_to_chinese_basic | number_to_chinese | chinese_numeral_string | no_internal_zero_required |
| ps_g3a_u01_4digit_number_to_chinese_with_zero | number_to_chinese | chinese_numeral_string | internal_zero_required |
| ps_g3a_u01_chinese_to_4digit_number_basic | chinese_to_number | integer | no_internal_zero_required |
| ps_g3a_u01_chinese_to_4digit_number_with_zero | chinese_to_number | integer | internal_zero_required |

## 4. Numeric domain

| field | rule |
|---|---|
| min | 1000 |
| max | 9999 |
| leading zero | forbidden |
| digit count | four digits only |
| answer uniqueness | required |

## 5. Chinese numeral normalization rules

Canonical output should use formal elementary-school wording:

| number | expected canonical Chinese |
|---:|---|
| 2798 | 二千七百九十八 |
| 4006 | 四千零六 |
| 5080 | 五千零八十 |
| 7000 | 七千 |
| 9010 | 九千零一十 |

Rules:
1. 千/百/十/個位 are place-value positions.
2. Internal zero should be represented by one `零` when a nonzero lower place follows.
3. Trailing zero places are omitted.
4. No duplicate `零零` in canonical answer.
5. The system will start with canonical strings only; alternate human wording is out of scope for the first validator.

## 6. Prompt models

### ps_g3a_u01_4digit_number_to_chinese_basic

```json
{
  "kind": "numberToChinese",
  "promptTemplate": "把 {number} 寫成中文數字。",
  "answerModel": { "shape": "chinese_numeral_string" }
}
```

### ps_g3a_u01_4digit_number_to_chinese_with_zero

```json
{
  "kind": "numberToChinese",
  "promptTemplate": "把 {number} 寫成中文數字。",
  "constraints": { "internalZeroRequired": true },
  "answerModel": { "shape": "chinese_numeral_string" }
}
```

### ps_g3a_u01_chinese_to_4digit_number_basic

```json
{
  "kind": "chineseToNumber",
  "promptTemplate": "把「{chineseNumber}」寫成數字。",
  "answerModel": { "shape": "integer" }
}
```

### ps_g3a_u01_chinese_to_4digit_number_with_zero

```json
{
  "kind": "chineseToNumber",
  "promptTemplate": "把「{chineseNumber}」寫成數字。",
  "constraints": { "internalZeroRequired": true },
  "answerModel": { "shape": "integer" }
}
```

## 7. Validator contract

Required validator checks:

| check | error code |
|---|---|
| number is 1000-9999 | g3a_u01_representation_number_out_of_range |
| no leading zero answer | g3a_u01_representation_leading_zero |
| canonical Chinese answer matches number | g3a_u01_number_to_chinese_answer_mismatch |
| parsed Chinese numeral equals target number | g3a_u01_chinese_to_number_answer_mismatch |
| zero-policy constraint satisfied | g3a_u01_representation_zero_policy_mismatch |

## 8. Generator contract

Generator must:
1. Produce deterministic items from seed.
2. Avoid duplicate prompts inside one worksheet.
3. Cover both basic and internal-zero cases.
4. Provide `answerText` and `finalAnswer` for answer key generation.
5. Use display text suitable for worksheet renderer.

## 9. Closeout

GOAL_DISTANCE_BEFORE = D3_G3A_U01_KP_EXPANSION_CONTRACT_LOCKED
GOAL_DISTANCE_AFTER = D2_G3A_U01_REPRESENTATION_PATTERNSPEC_CONTRACT_LOCKED
DISTANCE_REDUCED = locked PatternSpecs and validator contract for number/Chinese numeral conversion
REMAINING_BLOCKERS = S44D-S44H PatternSpec packs pending; generator implementation pending
NEXT_SHORTEST_STEP = S44D_G3A_U01_PlaceValueDecompositionPatternSpecPack
