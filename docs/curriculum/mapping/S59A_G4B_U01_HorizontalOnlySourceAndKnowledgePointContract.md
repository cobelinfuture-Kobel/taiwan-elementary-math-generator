# S59A — G4B-U01 Horizontal-Only Source and KnowledgePoint Contract

```text
CURRENT_MAJOR_TASK = S59_G4B_U01_HorizontalWorksheetPublicPrintPath
CURRENT_SUBTASK = S59A_G4B_U01_HorizontalOnlySourceAndKnowledgePointContract
TASK_STATUS = DESIGN_CONTRACT
OUTPUT = one authoritative source-to-KnowledgePoint contract plus static contract QA
```

## 1. Scope lock

```text
SOURCE_ID = g4b_u01_4b01
UNIT = 4B-U01 多位數的乘與除
OUTPUT_MODE = horizontal_only
APPLICATION_PROBLEMS_REQUIRED = false
APPLICATION_PROBLEMS_ALLOWED_IN_CORE = false
VERTICAL_RENDERING_ALLOWED = false
VERTICAL_SOURCE_DIAGRAMS = evidence_only
PUBLIC_MISSING_DIGIT_ALLOWED = false
CROSS_UNIT_FUSION_ALLOWED = false
GENERIC_FALLBACK_ALLOWED = false
```

The core unit is a pure horizontal calculation path. The source PDF uses vertical diagrams to explain algorithms, but no public vertical worksheet format is permitted. Application problems are not source-supported and are not required for core D0 closeout.

## 2. Source authority

```text
fileName = 題型總覽-4b01-多位數的乘與除.pdf
pageCount = 2
byteSize = 503240
sha256 = 8e187794305d2a19ede4fe085eb493f67593621d653a4706a71cf5700d3be05b
pageHeaderUrl = https://meow911.com/4b01/
sourceReadback = operator_supplied_pdf_manual_visual_read
repositoryPolicy = PDF binary not committed; fingerprint and panel evidence committed
```

## 3. Fourteen source panels

| Evidence | Page/panel | Source label | Public disposition |
|---|---:|---|---|
| `src_g4b_u01_p1_panel01` | 1/1 | ×幾位數、乘積就會有幾排 | Evidence only: vertical partial-product structure |
| `src_g4b_u01_p1_panel02` | 1/2 | 3位數×3位數 | Map to 3-digit × 3-digit KP |
| `src_g4b_u01_p1_panel03` | 1/3 | 4位數×3位數 | Map to 4-digit × 3-digit KP |
| `src_g4b_u01_p1_panel04` | 1/4 | 乘數中間有0 | Map to internal-zero multiplier KP |
| `src_g4b_u01_p1_panel05` | 1/5 | 乘數尾巴有0 | Map to trailing-zero multiplication KP |
| `src_g4b_u01_p1_panel06` | 1/6 | 被乘數尾巴有0 | Map to trailing-zero multiplication KP |
| `src_g4b_u01_p1_panel07` | 1/7 | 被乘數與乘數尾巴都有0 | Map to trailing-zero multiplication KP |
| `src_g4b_u01_p1_panel08` | 1/8 | 3位數÷3位數 | Map to one-digit quotient KP |
| `src_g4b_u01_p1_panel09` | 1/9 | 4位數÷3位數（不退位） | Normalize as two-digit quotient KP |
| `src_g4b_u01_p1_panel10` | 1/10 | 4位數÷3位數（退位） | Normalize as one-digit quotient KP |
| `src_g4b_u01_p2_panel01` | 2/1 | 被除數與除數尾巴都有0，整除 | Map to exact trailing-zero division KP |
| `src_g4b_u01_p2_panel02` | 2/2 | 被除數與除數尾巴都有0，有餘數 | Map to remainder-scale restoration KP |
| `src_g4b_u01_p2_panel03` | 2/3 | 尾巴有0的乘法簡化計算 | Map to power-of-ten multiplication family |
| `src_g4b_u01_p2_panel04` | 2/4 | 3位數×3位數直式乘法內填未知數 | Deferred extension; not a core public KP |

All 14 panels are accounted for. No new application source evidence is invented.

## 4. Nine approved public KnowledgePoints

1. `kp_g4b_u01_3digit_by_3digit` — 三位數乘三位數
2. `kp_g4b_u01_4digit_by_3digit` — 四位數乘三位數
3. `kp_g4b_u01_multiplier_internal_zero` — 乘數中間有0的乘法
4. `kp_g4b_u01_trailing_zero_multiplication` — 尾0乘法與位值簡算
5. `kp_g4b_u01_3digit_div_3digit` — 三位數除以三位數
6. `kp_g4b_u01_4digit_div_3digit_2digit_quotient` — 四位數除以三位數，商為兩位數
7. `kp_g4b_u01_4digit_div_3digit_1digit_quotient` — 四位數除以三位數，商為一位數
8. `kp_g4b_u01_trailing_zero_division_exact` — 尾0除法，整除
9. `kp_g4b_u01_trailing_zero_division_remainder_restore` — 尾0除法，有餘數及餘數還原

## 5. Twelve core PatternSpec candidates

```text
ps_g4b_u01_3digit_by_3digit
ps_g4b_u01_4digit_by_3digit
ps_g4b_u01_multiplier_internal_zero
ps_g4b_u01_multiplier_trailing_zero
ps_g4b_u01_multiplicand_trailing_zero
ps_g4b_u01_both_factors_trailing_zero
ps_g4b_u01_power10_multiplication
ps_g4b_u01_3digit_div_3digit
ps_g4b_u01_4digit_div_3digit_2digit_quotient
ps_g4b_u01_4digit_div_3digit_1digit_quotient
ps_g4b_u01_trailing_zero_division_exact
ps_g4b_u01_trailing_zero_division_remainder_restore
```

The existing runtime id `ps_g4b_u01_multiplier_trailing_zero` is preserved. S59A does not materialize the remaining candidate records or modify runtime behavior.

## 6. Historical S43E12 disposition

```text
historicalArtifact = data/curriculum/registry/unit_expansions/S43E12_G4B_U01_KPExpansion.json
status = retained_as_historical_overlay_not_rewritten
```

S43E12 remains valid historical evidence that the unit received preliminary registry coverage. It is not the current source-derived public scope authority because it included unsupported rows such as application, area/group model, estimation and vertical algorithm concepts. S59A narrows the core to the operator-approved horizontal calculation path.

## 7. Deferred, non-blocking extensions

```text
g4b_u01_horizontal_missing_digit
  source = page 2 panel 4
  coreCloseoutBlocker = false

g4b_u01_application_problems
  source = none in supplied PDF
  coreCloseoutBlocker = false
```

Neither extension may enter the core selector before a separate approved contract, answer model, generator and validator path exist.

## 8. Static QA gate

The S59A test must verify:

```text
14 unique source evidence rows
page distribution = 10 + 4
9 unique public KnowledgePoints
12 unique PatternSpec candidates
all PatternSpecs map to an approved KP
all source panels have an explicit disposition
0 application core KPs
0 vertical public KPs
historical S43E12 overlay is not rewritten
```

## 9. Distance closeout target

```text
GOAL_DISTANCE_BEFORE = D4_G4B_U01_SOURCE_AUDITED_SCOPE_NOT_FROZEN
GOAL_DISTANCE_AFTER  = D3_G4B_U01_HORIZONTAL_SOURCE_KP_CONTRACT_FROZEN
DISTANCE_REDUCED     = fingerprinted the source, accounted for all 14 panels, and froze nine public horizontal-only KPs plus twelve candidate PatternSpecs
REMAINING_BLOCKERS   = ["Tag Registry and FormalMapping boundaries not defined", "PatternSpecs not materialized", "Generator/Validator/Worksheet/UI/print not implemented"]
NEXT_SHORTEST_STEP   = S59B_G4B_U01_TagRegistryFormalMappingAndBoundaryDesign
AUTO_CONTINUE_DECISION = CONTINUE after PR and main CI pass
STOP_REASON = NONE
```
