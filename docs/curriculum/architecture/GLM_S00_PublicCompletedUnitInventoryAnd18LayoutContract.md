# GLM-S00 — Public Completed Unit Inventory and 18-Layout Contract

```text
TASK = GLM-S00_PublicCompletedUnitInventoryAnd18LayoutContract
STATUS = DESIGN_LOCKED_PENDING_CI
SCOPE = ALL_PUBLIC_COMPLETED_UNITS
PUBLIC_UNIT_COUNT = 15
APPROVED_LAYOUT_COUNT_PER_UNIT = 18
BASE_SCENARIO_COUNT = 270
BOUNDARY_ANSWER_SCENARIO_COUNT = 90
```

## 1. Corrected goal

The previous G4B-U04 R4 acceptance proves only that G4B-U04 supports the approved inverse-long layout matrix. It does not prove that every unit visible in the public Classic selector supports the same matrix.

The global goal is therefore:

```text
Every public completed unit
× every approved question-page layout
→ exact requested layout
→ truthful preview/query readback
→ printable HTML/PDF without clipping or overlap
```

This task does not accept a unit-level PASS as a global PASS.

## 2. Public unit inventory

The contract covers the 15 units currently exposed through the public Classic unit selector:

| # | Source ID | Unit | Title |
|---:|---|---|---|
| 1 | `g3a_u01_3a01` | 3A-U01 | 10000以內的數 |
| 2 | `g3a_u02_3a02` | 3A-U02 | 四位數的加減 |
| 3 | `g3a_u03_3a03` | 3A-U03 | 乘法 |
| 4 | `g3a_u06_3a06` | 3A-U06 | 二位數除以一位數 |
| 5 | `g3b_u01_3b01` | 3B-U01 | 除法 |
| 6 | `g3b_u04_3b04` | 3B-U04 | 兩步驟計算 |
| 7 | `g3b_u08_3b08` | 3B-U08 | 乘法與除法 |
| 8 | `g4a_u01_4a01` | 4A-U01 | 1億以內的數 |
| 9 | `g4a_u02_4a02` | 4A-U02 | 整數的乘法 |
| 10 | `g4a_u04_4a04` | 4A-U04 | 整數的除法 |
| 11 | `g4a_u08_4a08` | 4A-U08 | 整數四則 |
| 12 | `g4b_u01_4b01` | 4B-U01 | 多位數的乘與除 |
| 13 | `g4b_u04_4b04` | 4B-U04 | 概數 |
| 14 | `g5a_u02_5a02` | 5A-U02 | 因數與公因數 |
| 15 | `g5a_u08_5a08` | 5A-U08 | 整數四則 |

The inventory is authoritative for this task sequence. A later public release must update this contract and expand the matrix before global D0 can remain valid.

## 3. Approved question-page matrix

Only these 18 layouts are production-approved:

```text
3×1  3×2  3×3  3×4  3×5
2×1  2×2  2×3  2×4  2×5  2×6
1×1  1×2  1×3  1×4  1×5  1×6  1×7
```

Equivalent column-specific ranges:

| Columns | Approved rows | Maximum questions per full page |
|---:|---:|---:|
| 3 | 1–5 | 15 |
| 2 | 1–6 | 12 |
| 1 | 1–7 | 7 |

Four to six columns and rows above the approved limit may remain accepted by low-level legacy state during migration, but they are not approved production layouts and cannot count as a PASS.

## 4. Exact-layout contract

For every public unit and approved layout:

- requested columns and rows must be preserved exactly;
- resolved columns and rows must equal the request;
- silent capping is forbidden;
- ignoring the requested layout is forbidden;
- preview metadata must report the applied layout truthfully;
- query-state reload must restore the same source and layout;
- changing units must not allow stale unit-specific state to reclaim the source selector;
- question-page pagination must not affect the independently controlled answer-key layout.

If a question shape cannot fit an approved layout, the failure must be explicit and classified. A unit may not silently substitute another layout.

## 5. Acceptance dimensions

The 270-scenario base matrix is:

```text
15 public units × 18 approved layouts = 270 scenarios
```

Each scenario must record:

- source ID;
- requested and resolved layout;
- generated question count;
- question page count;
- answer page count;
- DOM overflow count;
- inter-card overlap count;
- blank PDF page count;
- PDF text bounding-box overflow count;
- truncated or split question count;
- query replay result;
- source-switch isolation result;
- console and page errors.

Baseline result codes are closed to:

```text
PASS
SILENTLY_CAPPED
IGNORED
OVERFLOW
OVERLAP
BLANK_PAGE
QUERY_REPLAY_FAIL
SOURCE_SWITCH_FAIL
GENERATION_BLOCKED
```

## 6. Boundary answer-key matrix

After base repair, the maximum boundaries are tested with answers on and off:

```text
15 units × {3×5, 2×6, 1×7} × 2 answer states = 90 scenarios
```

Question and answer numbering must remain exact and the answer layout remains independently profile-controlled.

## 7. Task sequence

```text
GLM-S00  public unit inventory and 18-layout contract
GLM-S01  current 15-unit layout behavior audit
GLM-S02  unit renderer profile and worst-case question audit
GLM-S03  270-scenario HTML/PDF baseline
GLM-S04  global layout architecture design
GLM-S05  global 18-layout FullFix
GLM-S06  270-scenario post-fix acceptance
GLM-S07  answer-key and maximum-boundary stress
GLM-S08  deployed Classic UI and D0 closeout
```

FullFix is required for implementation. Per-unit temporary patches, silent caps and minimal fixes are outside scope.

## 8. Completion gate

```text
GLM-S00 PASS requires:
- the 15-unit inventory matches the public source registry;
- the 18-layout set is exact and duplicate-free;
- base scenario count equals 270;
- answer-boundary scenario count equals 90;
- G4B-U04 unit-level authority is not treated as global authority;
- next task is GLM-S01_Current15UnitLayoutBehaviorAudit.
```

## 9. Distance

```text
GOAL_DISTANCE_BEFORE = D1_GLOBAL_LAYOUT_SCOPE_UNDEFINED_AND_G4B_UNIT_PASS_MISAPPLIED
GOAL_DISTANCE_AFTER  = D1_GLOBAL_15_UNIT_18_LAYOUT_CONTRACT_LOCKED_PENDING_BASELINE
DISTANCE_REDUCED     = public inventory, exact matrix, acceptance dimensions and task sequence materialized
REMAINING_BLOCKERS   = S01 through S08 not completed
NEXT_SHORT_STEP      = GLM-S01_Current15UnitLayoutBehaviorAudit
STOP_REASON          = NONE
```
