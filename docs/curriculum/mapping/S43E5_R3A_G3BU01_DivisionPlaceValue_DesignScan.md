# S43E5 R3A G3B-U01 Division Place-Value DesignScan

```text
CURRENT_MAJOR_TASK = S43E5_G3B_U01_KPExpansion
CURRENT_SUBTASK = S43E5_R3A_G3BU01_DivisionPlaceValue_DesignScan
TASK_STATUS = DESIGN_LOCK_IMPLEMENTED_PENDING_READBACK
SOURCE_ID = g3b_u01_3b01
UNIT = 3B-U01 除法
```

## 1. Scope Lock

```text
IN_SCOPE = [
  "final UI KnowledgePoint design for G3B-U01",
  "existing KP rename/merge policy",
  "PatternSpec-level place-value case split",
  "generator / validator contract for exact division and remainder division",
  "HTML selector, mixed allocation, worksheet, and PDF smoke path"
]
OUT_OF_SCOPE = [
  "vertical long-division layout renderer",
  "worked-solution step rendering",
  "visual base-ten block rendering",
  "AI bulk item generation",
  "cross-unit mixed worksheets beyond normal selector support"
]
```

## 2. Final UI KnowledgePoints

```text
1. kp_g3b_u01_2digit_division_place_value_cases
   displayName = 二位數除以一位數商位判斷

2. kp_g3b_u01_3digit_by_1digit_regroup_hundreds
   displayName = 三位數除以一位數
   role = general exact-division pool, kept from existing S43E5

3. kp_g3b_u01_3digit_division_place_value_cases
   displayName = 三位數除以一位數商位判斷

4. kp_g3b_u01_quotient_zero_cases
   displayName = 商中有 0 的除法

5. kp_g3b_u01_division_with_remainder
   displayName = 有餘數除法
```

## 3. Existing KP Merge / Rename Rule

```text
Old visible KP:
kp_g3b_u01_2digit_by_1digit_regroup_tens = 二位數除以一位數退位

R3 decision:
This old KP is not kept as a separate UI row.
It is absorbed into:
kp_g3b_u01_2digit_division_place_value_cases = 二位數除以一位數商位判斷
```

```text
Old visible KP:
kp_g3b_u01_3digit_by_1digit_regroup_hundreds = 三位數除以一位數

R3 decision:
Keep as a general exact-division pool.
Add targeted 3-digit place-value and zero-quotient KPs beside it.
```

## 4. PatternSpec Map

### 4.1 二位數除以一位數商位判斷

```text
kp_g3b_u01_2digit_division_place_value_cases
  -> pg_g3b_u01_2digit_division_place_value_cases
  -> ps_g3b_u01_2digit_by_1digit_regroup_tens
  -> ps_g3b_u01_2digit_leading_digit_insufficient
  -> ps_g3b_u01_2digit_ones_quotient_zero
  -> ps_g3b_u01_2digit_leading_digit_exact
```

Subcase contracts:

```text
ps_g3b_u01_2digit_leading_digit_insufficient:
  dividend 10..99, divisor 2..9, exact quotient, tens digit of dividend < divisor

ps_g3b_u01_2digit_ones_quotient_zero:
  dividend 10..99, divisor 2..9, exact quotient, quotient ones digit = 0

ps_g3b_u01_2digit_leading_digit_exact:
  dividend 10..99, divisor 2..9, exact quotient, tens digit of dividend >= divisor and tens digit % divisor = 0
```

### 4.2 三位數除以一位數

```text
kp_g3b_u01_3digit_by_1digit_regroup_hundreds
  -> pg_g3b_u01_3digit_by_1digit_regroup_hundreds
  -> ps_g3b_u01_3digit_by_1digit_regroup_hundreds
```

### 4.3 三位數除以一位數商位判斷

```text
kp_g3b_u01_3digit_division_place_value_cases
  -> pg_g3b_u01_3digit_division_place_value_cases
  -> ps_g3b_u01_3digit_hundreds_insufficient
  -> ps_g3b_u01_3digit_tens_quotient_zero
  -> ps_g3b_u01_3digit_ones_quotient_zero
  -> ps_g3b_u01_3digit_hundreds_exact
```

Subcase contracts:

```text
ps_g3b_u01_3digit_hundreds_insufficient:
  dividend 100..999, divisor 2..9, exact quotient, hundreds digit of dividend < divisor

ps_g3b_u01_3digit_tens_quotient_zero:
  dividend 100..999, divisor 2..9, exact quotient, quotient tens digit = 0

ps_g3b_u01_3digit_ones_quotient_zero:
  dividend 100..999, divisor 2..9, exact quotient, quotient ones digit = 0

ps_g3b_u01_3digit_hundreds_exact:
  dividend 100..999, divisor 2..9, exact quotient, hundreds digit of dividend >= divisor and hundreds digit % divisor = 0
```

### 4.4 商中有 0 的除法

```text
kp_g3b_u01_quotient_zero_cases
  -> pg_g3b_u01_quotient_zero_cases
  -> ps_g3b_u01_2digit_ones_quotient_zero
  -> ps_g3b_u01_3digit_tens_quotient_zero
  -> ps_g3b_u01_3digit_ones_quotient_zero
```

### 4.5 有餘數除法

```text
kp_g3b_u01_division_with_remainder
  -> pg_g3b_u01_division_with_remainder
  -> ps_g3b_u01_2digit_division_with_remainder
  -> ps_g3b_u01_3digit_division_with_remainder
```

Remainder contract:

```text
dividend = divisor * quotient + remainder
0 < remainder < divisor
answerText = quotient + " 餘 " + remainder
```

## 5. Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_G3B_U01_R2_BROWSER_PDF_SMOKE_PASS_TEST_READBACK_PENDING
GOAL_DISTANCE_AFTER  = D2_G3B_U01_R3_FORMAL_MAPPING_PATTERN_SPEC_CONTRACT_LOCKED
DISTANCE_REDUCED     = G3B-U01 R3 moved from operator concept to formal UI KP / PatternSpec / validator contract design
REMAINING_BLOCKERS   = ["implementation pending", "npm test pending", "browser PDF smoke pending"]
NEXT_SHORTEST_STEP   = S43E5_R3B_G3BU01_ExistingKPRenameAndRegistryPatch
```
