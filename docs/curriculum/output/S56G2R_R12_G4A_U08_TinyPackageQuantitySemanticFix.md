S56G2R_R12_G4A_U08_TinyPackageQuantitySemanticFix

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題 + Phase1 numeric mixed UI
status = TINY_PACKAGE_QUANTITY_FIX_APPLIED_LOCAL_TEST_READBACK_REQUIRED
write_type = final_pdf_smoke_semantic_fix_report

uploaded_pdf_reviewed:
- g4a_u08_同單位知識點混合_隨機排序.pdf

pdf_smoke_result:
- Hybrid numeric + application mixed worksheet is working.
- The PDF contains 200 questions.
- Numeric calculation questions and application word problems both appear.
- Severe previously fixed blockers remain absent:
  - no near-total discounts such as 原價12元折扣11元;
  - no far-away payment such as 付325元;
  - no same-unit 144L / 95kg / 140m class prompts;
  - no generic capacity/weight 材料包 phrasing.

remaining_semantic_issue_found:
- A small set of divide-by-group application prompts used tiny package/container quantities:
  - 每份需要5杯，每杯倒入5mL.
  - 每份需要2袋，每袋裝5g.
  - 每份需要4袋，每袋裝5g.
- These are arithmetically valid but not natural life quantities for Grade 4 word problems.
- Therefore closeout was not created.

files_modified:
- site/modules/curriculum/batch-a/g4a-u08-application-generator.js
- tests/curriculum/batch-a/g4a-u08-phase2a-semantic-tightening.test.js

patch_applied:
1. Added domain-specific per-group values for divide-by-group templates.
   - capacity: 50 mL
   - weight: 50 g
   - length: 20 cm/mm
   - time: 10 min/sec
   - money: 10 元
   - count_items: 5 items

2. Reworded capacity and weight package prompts.
   - capacity now uses 小杯 wording instead of bare 杯.
   - weight now uses 小袋 wording instead of bare 袋.
   - 5mL and 5g package quantities are no longer generated for these domains.

3. Kept arithmetic constraints.
   - Exact divisibility preserved by building totals from groups × perGroup × factor.
   - No Phase2B added.
   - No new KP or PatternSpec added.
   - No conversion policy expansion.

4. Expanded semantic regression guard.
   - Added blockers for:
     - 每份需要5杯，每杯倒入5mL
     - 每份需要2袋，每袋裝5g
     - 每份需要4袋，每袋裝5g
     - 每小杯倒入5mL
     - 每小袋裝5g

expected_local_readback:
- Test count should remain 499 because an existing regression test was updated, not a new test added.
- Expected after pull:
  - tests = 499
  - pass = 499
  - fail = 0

required_local_commands:
```powershell
git fetch public
git switch public-main
git reset --hard public/main
git clean -fd
npm test
```

closeout_gate:
- Closeout remains pending until local test passes and the regenerated PDF smoke confirms tiny package quantities are gone.

GOAL_DISTANCE_BEFORE = D1_G4A_U08_FINAL_HARDENING_LOCAL_PASS_PDF_SMOKE_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U08_TINY_PACKAGE_QUANTITY_FIX_TEST_PENDING
DISTANCE_REDUCED = Final PDF smoke confirmed mixed generation works and identified one remaining semantic issue; tiny package quantities were patched with domain-specific per-group values and regression guards.
REMAINING_BLOCKERS = ["Need local npm test readback after tiny package fix", "Need regenerated PDF smoke after local pass", "Need Phase2A closeout marker"]
NEXT_SHORTEST_STEP = S56G2R_R12_LocalRetest
STOP_REASON = awaiting_local_test_readback
BLOCKER_TYPE = LOCAL_TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S56G2R_R12_TINY_PACKAGE_QUANTITY_FIX_APPLIED
REQUIRED_OPERATOR_ACTION = Pull public/main, run local npm test, then paste tests/pass/fail output.
NEXT_RESUME_TASK = S56G2R_R12_LocalRetest
