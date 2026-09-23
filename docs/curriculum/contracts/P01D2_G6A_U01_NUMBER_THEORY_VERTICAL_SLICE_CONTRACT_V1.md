# P01D2 G6A-U01 Number-Theory Vertical Slice Contract V1

```text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID = P01D2_G6AU01NumberTheoryVerticalSlice
SOURCE_ID = g6a_u01_6a01
DELIVERY_WAVE = R05-W1
```

## Purpose

Admit the five G6A-U01 W1 KnowledgePoints through the existing full-product planner, shared deterministic number-theory runtime, validator, WorksheetDocument, answer key, HTML renderer, and Chromium PDF gate.

This milestone does not add application stories and does not change the protected 15-unit public source dropdown. Public UI cutover remains owned by `P01E_W1PublicUIHTMLPDFPrintCloseout`.

## Admitted KnowledgePoints

```text
kp_g6a_u01_prime_composite_classification
kp_g6a_u01_prime_factorization
kp_g6a_u01_short_division_common_factors
kp_g6a_u01_greatest_common_factor
kp_g6a_u01_least_common_multiple
```

## Materialization counts

```text
KnowledgePoints = 5
FormalMappings   = 5
PatternGroups    = 5
PatternSpecs     = 10
```

Each KnowledgePoint owns one PatternGroup and two deterministic PatternSpecs.

## Pattern coverage

```text
質數／合數／1分類
指定區間質數列舉
質因數乘積式
質因數指數式
共同質因數短除步驟
共同因數乘積與互質末端商
直接求最大公因數
由質因數指數求最大公因數
直接求最小公倍數
由質因數指數求最小公倍數
```

## Mathematical invariants

```text
1 is neither prime nor composite.
Every integer greater than 1 has a unique prime factorization up to order.
Short division preserves both original numbers and ends with coprime tails.
GCF uses the minimum shared prime exponents.
LCM uses the maximum prime exponents.
For positive a,b: gcd(a,b) × lcm(a,b) = a × b.
```

## Runtime lineage

```text
source evidence
→ canonical KP
→ FormalMapping / PatternGroup / PatternSpec
→ isolated full-product source authority
→ existing Batch A planner
→ shared number-theory runtime
→ stable full-product validator facade
→ existing WorksheetDocument and answer-key pagination
→ existing HTML renderer
→ Chromium PDF / overflow acceptance
```

## Required Gate

P01D2 closes only when:

```text
5/5 selector KnowledgePoints pass
5/5 PatternGroups pass
10/10 PatternSpecs pass
20 deterministic source-unit questions cover all 10 specs
single-KP generation passes for all 5 KPs
mathematical primitive invariants pass
tampered answers fail closed
worksheet and answer key each contain 20 items
HTML question and answer-key sections render
Chromium produces non-empty PDF
page overflow findings = 0
protected public source count remains 15
full-product source authority count becomes 17
P01A inventory becomes 9 admitted / 12 remaining
P01D1 regression remains green
full Node regression passes
milestone claim integrity passes
Golden anti-drift passes without exception
```

## Hard boundaries

```text
application story generation = forbidden
public dropdown cutover       = forbidden before P01E
parallel planner              = forbidden
parallel renderer             = forbidden
parallel PDF pipeline         = forbidden
W2-W8 implementation          = forbidden
recursive-improvement admin   = forbidden before P10
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_W1_4_ADMITTED_17_REMAINING
GOAL_DISTANCE_AFTER  = D2_W1_9_ADMITTED_12_REMAINING
NEXT_SHORTEST_STEP   = P01D3_G5AU03FactorMultipleVerticalSlice
```
