# S45 G3A-U06 New KP FormalMapping / PatternSpec DesignScan

```text
CURRENT_MAJOR_TASK = S45_G3AU06_NewKPFormalMapping_DesignScan
CURRENT_SUBTASK = define four new G3A-U06 KnowledgePoint / PatternSpec contracts
TASK_STATUS = DESIGNSCAN_COMPLETE
OUTPUT = FormalMapping and PatternSpec contract design for four new G3A-U06 KPs
SOURCE_ID = g3a_u06_3a06
SOURCE_UNIT = 3A-U06 二位數除以一位數
```

## 1. Scope Lock

This task only defines the four newly approved G3A-U06 KnowledgePoints and their contracts. It does not promote them to UI visibility by itself.

```text
IN_SCOPE = [
  "二位數除以一位數有餘數",
  "包含除：分裝",
  "等分除：平分",
  "奇偶數條件判斷"
]
OUT_OF_SCOPE = [
  "G3A-U06 existing exact division behavior changes",
  "G3A-U06 existing divisibility check behavior changes",
  "UI selector visibility promotion",
  "mixed-allocation QA",
  "worksheet/browser smoke"
]
```

## 2. Existing G3A-U06 Baseline

Existing production-visible G3A-U06 KPs remain unchanged:

```text
kp_g3a_u06_exact_division_check
  displayName = 二位數除以一位數整除
  patternSpecId = ps_g3a_u06_exact_division_check

kp_g3a_u06_divisibility_exact_check
  displayName = 整除檢查
  patternSpecId = ps_g3a_u06_divisibility_exact_check
```

The new KPs extend the same source unit but require distinct answer models.

## 3. New KnowledgePoint Registry Candidates

### 3.1 二位數除以一位數有餘數

```text
knowledgePointId = kp_g3a_u06_division_with_remainder
patternGroupId   = pg_g3a_u06_division_with_remainder
patternSpecId    = ps_g3a_u06_division_with_remainder
displayName      = 二位數除以一位數有餘數
supportClass     = B
canonicalSkillTag = integer_division_remainder
subskillTags     = ["two_digit", "one_digit", "remainder", "division"]
representationTags = ["numeric_expression"]
```

### 3.2 包含除：分裝

```text
knowledgePointId = kp_g3a_u06_quotative_division_packaging
patternGroupId   = pg_g3a_u06_quotative_division_packaging
patternSpecId    = ps_g3a_u06_quotative_division_packaging
displayName      = 包含除：分裝
supportClass     = B
canonicalSkillTag = division_word_problem
subskillTags     = ["quotative_division", "packaging", "items_per_group", "word_problem"]
representationTags = ["word_problem"]
```

### 3.3 等分除：平分

```text
knowledgePointId = kp_g3a_u06_partitive_division_equal_sharing
patternGroupId   = pg_g3a_u06_partitive_division_equal_sharing
patternSpecId    = ps_g3a_u06_partitive_division_equal_sharing
displayName      = 等分除：平分
supportClass     = B
canonicalSkillTag = division_word_problem
subskillTags     = ["partitive_division", "equal_sharing", "groups", "word_problem"]
representationTags = ["word_problem"]
```

### 3.4 奇偶數條件判斷

```text
knowledgePointId = kp_g3a_u06_parity_range_missing_digit
patternGroupId   = pg_g3a_u06_parity_range_missing_digit
patternSpecId    = ps_g3a_u06_parity_range_missing_digit
displayName      = 奇偶數條件判斷
supportClass     = B
canonicalSkillTag = parity_reasoning
subskillTags     = ["parity", "range_condition", "missing_digit", "multiple_answers"]
representationTags = ["reasoning_prompt"]
```

## 4. PatternSpec Contracts

### 4.1 ps_g3a_u06_division_with_remainder

```text
kind = divisionWithRemainder
ranges = [[10, 99], [2, 9]]
answerModel = {
  shape: "quotient_remainder",
  fields: ["quotient", "remainder"],
  display: "商 {quotient} 餘 {remainder}"
}
constraints = {
  dividend = divisor * quotient + remainder,
  quotient >= 1,
  0 < remainder < divisor,
  dividend in 10..99,
  divisor in 2..9
}
example = "34 ÷ 8 = ___ 餘 ___"
answer = "4 餘 2"
```

### 4.2 ps_g3a_u06_quotative_division_packaging

```text
kind = divisionWordProblem
semanticModel = quotative_division
questionMeaning = "total items, fixed items per group, ask groupCount"
answerModel = {
  shape: "single_integer_with_unit",
  field: "groupCount",
  unitRole: "container"
}
constraints = {
  total = itemsPerGroup * groupCount,
  total in 10..99,
  itemsPerGroup in 2..9,
  groupCount >= 2
}
example = "把 12 個蘋果，每 3 個裝一盤，可以裝成幾盤？"
answer = "4 盤"
```

### 4.3 ps_g3a_u06_partitive_division_equal_sharing

```text
kind = divisionWordProblem
semanticModel = partitive_division
questionMeaning = "total items, fixed group count, ask itemsPerGroup"
answerModel = {
  shape: "single_integer_with_unit",
  field: "itemsPerGroup",
  unitRole: "item"
}
constraints = {
  total = groupCount * itemsPerGroup,
  total in 10..99,
  groupCount in 2..9,
  itemsPerGroup >= 2
}
example = "把 12 個蘋果，平分成 4 盤，每盤有幾個蘋果？"
answer = "3 個"
```

### 4.4 ps_g3a_u06_parity_range_missing_digit

```text
kind = parityRangeMissingDigit
answerModel = {
  shape: "multiple_integer_answers",
  answerOrder: "ascending",
  separator: "、"
}
constraints = {
  templateNumber = tensDigit * 10 + missingOnesDigit,
  tensDigit in 1..9,
  lowerBound < templateNumber < upperBound,
  parityTarget in ["odd", "even"],
  all possible answers must be enumerated,
  answerCount >= 1
}
example = "有 1 個偶數：3□；只知道 3□ < 37，而且 3□ > 30，這個偶數可能是多少？"
answer = "32、34、36"
```

## 5. Validator Contracts

```text
divisionWithRemainder validator:
- dividend/divisor/quotient/remainder are safe integers
- dividend in configured range
- divisor in configured range
- quotient >= 1
- 0 < remainder < divisor
- dividend === divisor * quotient + remainder
- answerText matches quotient/remainder model
```

```text
divisionWordProblem validator:
- semanticModel is one of quotative_division / partitive_division
- total/itemsPerGroup/groupCount are safe integers
- total === itemsPerGroup * groupCount
- quotative answer field is groupCount
- partitive answer field is itemsPerGroup
- promptText must contain the semantic cue:
  - quotative: 每 N 個...一盤 / 一袋 / 一盒
  - partitive: 平分成 N 盤 / 袋 / 盒
```

```text
parityRangeMissingDigit validator:
- all answer candidates are safe integers
- all answers satisfy strict bounds
- all answers match parityTarget
- all valid candidates from the missing-digit template are present
- no invalid or duplicated answer appears
- answerText follows ascending order
```

## 6. Implementation Order After S45

```text
S46 = 二位數除以一位數有餘數
S47 = 包含除：分裝
S48 = 等分除：平分
S49 = 奇偶數條件判斷
S50 = UI Registry / Selector 接入
S51 = Mixed Random / Allocation / Ordering QA
S52 = Worksheet / Browser / PDF Smoke
```

## 7. Distance Update

```text
GOAL_DISTANCE_BEFORE = D3_G3A_U06_NEW_KP_CANDIDATES_ONLY
GOAL_DISTANCE_AFTER  = D2_G3A_U06_NEW_KP_FORMAL_MAPPING_READY
DISTANCE_REDUCED     = four G3A-U06 new KP candidates now have stable IDs, PatternSpec IDs, answer models, constraints, examples, and validator contracts
REMAINING_BLOCKERS   = ["generators not implemented", "validators not implemented", "UI registry not connected", "PDF smoke not run"]
NEXT_SHORTEST_STEP   = S46_G3AU06_DivisionWithRemainder_Implementation
```
