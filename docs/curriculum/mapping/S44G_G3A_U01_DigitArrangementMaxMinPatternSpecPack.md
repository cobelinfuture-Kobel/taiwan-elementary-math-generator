# S44G G3A-U01 DigitArrangementMaxMinPatternSpecPack

## 1. Scope

Source unit: `g3a_u01_3a01`
KP covered: `kp_g3a_u01_digit_arrangement_max_min`
Source evidence: `S44A_IMG03`

S44G defines PatternSpecs for making the largest and smallest four-digit numbers from four given digits.

## 2. PatternSpec list

| patternSpecId | display | answerShape |
|---|---|---|
| ps_g3a_u01_digit_arrangement_max_4digit | 組成最大四位數 | integer |
| ps_g3a_u01_digit_arrangement_min_4digit_no_leading_zero | 組成最小四位數 | integer |
| ps_g3a_u01_digit_arrangement_max_min_pair | 同題回答最大與最小 | max_min_pair |

## 3. Domain rules

| field | rule |
|---|---|
| input digits | four digits |
| repeated digits | first implementation: not repeated |
| zero handling | zero may appear, but cannot be thousands digit |
| output | valid four-digit integer |

## 4. Algorithm contract

Largest number:
1. Sort digits descending.
2. Join digits.
3. Output integer.

Smallest number:
1. Choose the smallest nonzero digit as thousands digit.
2. Sort remaining digits ascending.
3. Join digits.
4. Output integer.

## 5. Validator contract

| check | error code |
|---|---|
| exactly four input digits | g3a_u01_digit_arrangement_digit_count_invalid |
| output uses every digit exactly once | g3a_u01_digit_arrangement_digit_usage_mismatch |
| thousands digit is not zero | g3a_u01_digit_arrangement_leading_zero |
| max answer is correct | g3a_u01_digit_arrangement_max_mismatch |
| min answer is correct | g3a_u01_digit_arrangement_min_mismatch |

## 6. Generator contract

Generator must include:
1. digit sets with zero;
2. digit sets without zero;
3. max-only prompts;
4. min-only prompts;
5. max-min pair prompts.

## 7. Closeout

GOAL_DISTANCE_BEFORE = D2_G3A_U01_PLACE_VALUE_UNIT_CONVERSION_PATTERNSPEC_LOCKED
GOAL_DISTANCE_AFTER = D2_G3A_U01_DIGIT_ARRANGEMENT_PATTERNSPEC_LOCKED
DISTANCE_REDUCED = locked PatternSpecs for four-digit max/min digit arrangement
REMAINING_BLOCKERS = S44H PatternSpec pack pending; generator implementation pending
NEXT_SHORTEST_STEP = S44H_G3A_U01_RangeReasoningPatternSpecPack
