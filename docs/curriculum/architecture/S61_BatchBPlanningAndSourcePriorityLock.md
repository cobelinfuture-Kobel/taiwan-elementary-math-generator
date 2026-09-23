# S61 — Batch B Planning and Source Priority Lock

```text
TASK = S61_BatchBPlanningAndSourcePriorityLock
STATUS = PASS_PLANNING_LOCKED
MODE = PLANNING_ONLY
```

## 1. Scope

S61 converts the existing Batch B assignment into one fixed implementation order for the 24 deterministic-future source units.

```text
Batch B source inventory
→ production-priority waves
→ first prototype source lock
→ next implementation entry
```

S61 does **not** perform PDF visual extraction, create KnowledgePoint rows, create PatternSpec rows, implement decimal or fraction arithmetic, or expose Batch B in the public worksheet UI.

## 2. Source authority

Priority and future implementation must use this authority order:

```text
1. Google Drive source PDF + human / ChatGPT visual verification notes
2. Frozen Batch B source-unit assignment
3. Existing stable generator / validator capabilities as feasibility evidence
4. OCR only as a draft aid; never as source authority
```

The first prototype source is confirmed:

```text
sourceId = g4b_u04_4b04
sourceTitle = 概數
sourceFile = meow911_4b04_source.pdf
originalFileName = 題型總覽-4b04-概數.pdf
sourceStored = true
manualReviewed = false
extractionStatus = pending
```

## 3. Priority model

The sequence is capability-oriented, not grade-oriented.

Priority rules:

1. Extend the current stable integer / number-sense path before introducing a new number domain.
2. Prefer deterministic unique-answer patterns before language-heavy or mixed-domain patterns.
3. Build prerequisite ladders before dependent units.
4. Preserve split source packets as distinct sourceIds.
5. Process mixed decimal/fraction operations only after both domain pipelines are stable.

## 4. Locked Batch B order

### Wave B0 — Integer number-sense bridge

| Priority | sourceId | Title | Reason |
|---:|---|---|---|
| 1 | `g4b_u04_4b04` | 概數 | Closest extension of the existing integer number-sense runtime; deterministic rounding; no decimal/fraction engine required. |

### Wave B1 — Integer number-theory ladder

| Priority | sourceId | Title | Reason |
|---:|---|---|---|
| 2 | `g5a_u02_5a02a` | 因數 | First factor source packet. |
| 3 | `g5a_u02_5a02a1` | 因數 | Split source packet; reviewed with, but not merged into, `5a02a`. |
| 4 | `g5a_u03_5a03a` | 倍數 | Prerequisite for common-multiple and LCM work. |
| 5 | `g5a_u03_5a03a1` | 公倍數 | Split source packet; depends on multiples. |
| 6 | `g6a_u01_6a01` | 最大公因數與最小公倍數 | Depends on the factor / multiple ladder. |

### Wave B2 — Decimal vertical slice

| Priority | sourceId | Title | Reason |
|---:|---|---|---|
| 7 | `g3b_u09_3b09` | 小數 | Decimal representation and basic place-value entry. |
| 8 | `g4a_u09_4a09` | 2位小數 | Extends decimal place value to hundredths. |
| 9 | `g5b_u05_5b05a` | 數的十進位結構 | Formalizes base-10 structure after basic decimal representation. |
| 10 | `g5a_u01_5a01` | 多位小數與加減 | First decimal arithmetic route. |
| 11 | `g4b_u06_4b06` | 小數乘法 | Earlier decimal multiplication source. |
| 12 | `g5b_u04_5b04` | 小數的乘法 | Upper-grade decimal multiplication extension. |
| 13 | `g5b_u06_5b06` | 整數小數除以整數 | Decimal division-by-integer bridge. |
| 14 | `g6a_u04_6a04` | 小數除法 | Full decimal division extension. |

### Wave B3 — Fraction vertical slice

| Priority | sourceId | Title | Reason |
|---:|---|---|---|
| 15 | `g3a_u08_3a08` | 分數 | Fraction representation entry. |
| 16 | `g3b_u07_3b07` | 分數的加減 | First same-domain fraction arithmetic route. |
| 17 | `g4a_u06_4a06` | 假分數與帶分數 | Representation conversion prerequisite. |
| 18 | `g4b_u03_4b03` | 假分數與帶分數 | Second curriculum source for the same representation family; remains a distinct sourceId. |
| 19 | `g4b_u08_4b08` | 等值分數 | Prerequisite for expansion, reduction and common denominators. |
| 20 | `g5a_u04_5a04` | 擴分約分通分 | Fraction-equivalence operation layer. |
| 21 | `g5a_u06_5a06` | 異分母分數加減 | Depends on common-denominator support. |
| 22 | `g5b_u02_5b02` | 分數的計算 | Upper-grade fraction operation integration. |
| 23 | `g6a_u02_6a02` | 分數除法 | Final pure-fraction arithmetic extension. |

### Wave B4 — Mixed-domain integration

| Priority | sourceId | Title | Reason |
|---:|---|---|---|
| 24 | `g6b_u01_6b01` | 小數與分數的計算 | Must remain last; requires accepted decimal and fraction pipelines. |

## 5. Count and uniqueness gate

```text
B0 = 1
B1 = 5
B2 = 8
B3 = 9
B4 = 1
------------
Total = 24
```

Gate requirements:

- 24 sourceIds appear exactly once;
- no Batch A/C/D/E sourceId appears;
- G5 split sources remain distinct;
- `g6b_u01_6b01` remains after all pure decimal and pure fraction sources;
- priority 1 remains `g4b_u04_4b04` unless new source evidence creates a blocker.

## 6. First prototype lock

```text
PROTOTYPE_SOURCE_ID = g4b_u04_4b04
PROTOTYPE_TITLE = 概數
PROTOTYPE_REASON = shortest deterministic extension from current integer number-sense production path
SOURCE_READY = true
VISUAL_REVIEW = pending
OCR_AUTHORITY = forbidden
```

The next task must visually inspect the PDF and create evidence-backed KnowledgePoint candidates. It must not infer internal subskills from the unit title alone.

## 7. Batch B production boundary

Batch B remains outside production use until each promoted source path passes:

```text
manual visual source extraction
→ KnowledgePoint registry
→ FormalMapping
→ PatternSpec
→ generator
→ blocking validator
→ worksheet + answer key
→ public selector / query-state QA
→ HTML/PDF print QA
→ production gate
```

No Batch B public selector, generator route, validator route or worksheet output is authorized by S61.

## 8. Distance and handoff

```text
GOAL_DISTANCE_BEFORE = D4_BATCH_B_SOURCE_INVENTORY_WITHOUT_PRODUCTION_ORDER
GOAL_DISTANCE_AFTER  = D4_BATCH_B_PRIORITY_LOCKED_AND_FIRST_SOURCE_READY
DISTANCE_REDUCED     = Removed the source-order and first-prototype decision blockers for all 24 Batch B units.
REMAINING_BLOCKERS   = [
  "g4b_u04 manual visual PDF verification",
  "KnowledgePoint extraction and reviewed source evidence",
  "planning-to-implementation approval gate"
]
NEXT_SHORTEST_STEP   = S62_G4B_U04_ManualPDFKnowledgePointExtraction
STOP_REASON          = PLANNING_TO_IMPLEMENTATION_APPROVAL_REQUIRED
```
