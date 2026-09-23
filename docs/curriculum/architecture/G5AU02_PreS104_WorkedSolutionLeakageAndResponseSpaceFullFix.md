# G5AU02 Pre-S104 Worked-Solution Leakage and Response-Space FullFix — Accepted

## Authority

The operator identified that two S100 question families exposed completed calculations inside the learner question area:

```text
factor_relation_dual_witness
trial_division_table
```

Forbidden learner-visible examples included:

```text
乘 4×16=64≠66；除 66÷4=16 餘 2
1/15/0✓、2/7/1×、3/5/0✓
```

These strings are worked solutions rather than givens. They consumed response space and disclosed all or part of the answer.

This FullFix was accepted through PR #255 and merged at:

```text
fc9001155e4286335ffa3c58d926be467c00476c
```

## Locked scope

```text
G5A-U02 S100 learner prompt serialization
G5A-U02 public answer-key projection
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

## Accepted boundary rule

Canonical witness data remains available to validators and answer-key production. It is not serialized as completed arithmetic in the student question section.

```text
question section = task + necessary givens + blank scaffold
answer section   = concise task + worked arithmetic + result
```

The two self-contained method scaffolds do not receive an additional generic `答：` line.

## Factor-relation question scaffold

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

The answer section contains the complete multiplication witness, division witness and judgement.

## Trial-division question scaffold

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

The answer section contains completed divisor, quotient, remainder and exactness records followed by the complete factor set.

## Accepted regeneration evidence

```text
question count                              = 60 / 60 PASS
answer count                                = 60 / 60 PASS
canonical pattern count                     = 22 / 22 PASS
PDF page count                              = 20 A4
factor-relation worked-solution leak count  = 0
trial-division worked-solution leak count   = 0
factor-relation response-space missing      = 0
trial-division response-space missing       = 0
redundant generic answer-label count        = 0
question answer leakage count               = 0
DOM cell/page overflow count                = 0
PDF bbox overflow count                     = 0
blank PDF page count                        = 0
manual visual PDF readback                  = PASS
```

## Test and release evidence

```text
focused worked-solution tests          = 6 / 6 PASS
complete Node regression               = 1651 / 1651 PASS
S100 source method                     = 384 / 384 PASS
S97 source visibility                  = 120 / 120 PASS
S101 representation                    = 192 / 192 PASS
GLM-S05 exact layout                   = PASS
Pre-S104 public semantic HTML/PDF       = PASS
S95 production 200-question stress     = PASS
S96G dynamic 200-question HTML/PDF      = PASS
S96I live browser                      = PASS
S96Q public-control DOM                = PASS
S96R 24-combination matrix             = PASS
```

## Fixed boundaries

- Canonical mathematical witness data remains internal and validator-available.
- Student prompts receive only the task, necessary givens and blank response scaffold.
- Worked arithmetic is answer-key-only.
- Factor-relation and trial-division answer pages contain complete methods rather than bare final answers.
- The two self-contained method scaffolds suppress the redundant generic `答：` line.
- Other G5A-U02 patterns retain their established response labels.
- S101-S103 behavior remains unchanged.
- S104 remains unimplemented.
- P1/P2 remain frozen.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_PRE_S104_PUBLIC_SEMANTIC_REGENERATION_ACCEPTED_BUT_WORKED_SOLUTION_LEAK_FOUND
GOAL_DISTANCE_AFTER  = D1_G5A_U02_PRE_S104_QUESTION_ANSWER_BOUNDARY_ACCEPTED
DISTANCE_REDUCED = removed worked solutions from learner questions, restored usable response space and isolated complete methods to the answer key
D0_ELIGIBLE = false
NEXT_SHORT_STEP = G5AU02-S104_P0IntegratedSemanticRendererHTMLPDFAcceptance
NEXT_STEP_REQUIRES_IMPLEMENTATION_APPROVAL = true
```
