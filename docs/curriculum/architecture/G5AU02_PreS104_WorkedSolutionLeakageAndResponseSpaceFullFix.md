# G5AU02 Pre-S104 Worked-Solution Leakage and Response-Space FullFix

## Authority

The operator identified that two S100 question families exposed completed calculations inside the learner question area:

```text
factor_relation_dual_witness
trial_division_table
```

Examples of forbidden learner-visible content:

```text
乘 4×16=64≠66；除 66÷4=16 餘 2
1/15/0✓、2/7/1×、3/5/0✓
```

These strings are worked solutions, not givens. They consume response space and disclose all or part of the answer.

## Locked scope

```text
G5A-U02 S100 learner prompt serialization
G5A-U02 public worksheet regeneration
worked-solution leakage audit
response-space acceptance
```

Frozen:

```text
canonical mathematical witnesses
validators
answer models
S101-S103 behavior
S104 integrated acceptance
P1/P2
other units
```

## Boundary rule

Canonical witness data remains available to validators and answer-key production. It must not be serialized as completed arithmetic in the student question section.

```text
question section = task + necessary givens + blank scaffold
answer section   = worked arithmetic + result
```

## Factor-relation scaffold

Learner-visible form:

```text
用乘法和除法判斷 4 是否為 66 的因數，並寫出理由。
乘法：________________________________
除法：________________________________
判斷：________________________________
```

Forbidden in the question section:

```text
4×16=64
66÷4=16 餘 2
```

## Trial-division scaffold

Only the divisor is prefilled. Quotient, remainder and exact-divisibility judgement remain blank.

```text
除數 1：商 ______，餘數 ______，是否整除 ______
除數 2：商 ______，餘數 ______，是否整除 ______
除數 3：商 ______，餘數 ______，是否整除 ______
因數：________________________________
```

Forbidden in the question section:

```text
1/15/0✓
2/7/1×
3/5/0✓
```

## Blocking acceptance

```text
factor-relation worked-solution leak count = 0
trial-division worked-solution leak count = 0
factor-relation response-space missing count = 0
trial-division response-space missing count = 0
question answer leakage count = 0
DOM overflow count = 0
PDF bbox overflow count = 0
blank PDF page count = 0
full Node regression = PASS
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_PRE_S104_PUBLIC_SEMANTIC_REGENERATION_ACCEPTED_BUT_WORKED_SOLUTION_LEAK_FOUND
GOAL_DISTANCE_TARGET = D1_G5A_U02_PRE_S104_QUESTION_ANSWER_BOUNDARY_ACCEPTED
D0_ELIGIBLE = false
NEXT_SHORT_STEP = G5AU02-S104_P0IntegratedSemanticRendererHTMLPDFAcceptance
```
