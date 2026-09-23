S56G2R_R10_G4A_U08_FinalSemanticSmokeAndCloseoutGate

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題 + Phase1 numeric mixed UI
status = FINAL_SEMANTIC_TIGHTENING_PATCH_APPLIED_LOCAL_TEST_READBACK_REQUIRED
write_type = final_semantic_smoke_and_closeout_gate

operator_local_readback:
- tests = 499
- pass = 499
- fail = 0
- duration_ms = 9676.9725

uploaded_pdf_reviewed:
- g4a_u08_同單位知識點混合_應用題_隨機排序.pdf

pdf_smoke_result:
- Numeric calculation questions and application word problems now appear together.
- The previous hybrid mixed-selection bug is considered functionally resolved in the PDF output.
- The previous severe semantic blockers are no longer present:
  - no near-total discount such as 原價12元折扣11元;
  - no far-away payment such as 付325元;
  - no same-unit 144L / 95kg / 140m class prompts;
  - no generic capacity/weight 材料包 blocker phrasing from the previous PDF.

remaining_minor_semantic_risks_observed:
- Some same-unit measured labels still need stronger protection at generator level to prevent future large L/kg/m outputs.
- Material-pack / unit-rate phrasing is now improved, but needs regression coverage to prevent prior PDF-smoke blockers from reappearing.
- These are treated as final hardening items before closeout rather than new Phase2B scope.

final_patch_applied_after_pdf_smoke:
- Updated site/modules/curriculum/batch-a/g4a-u08-application-generator.js.
- Created tests/curriculum/batch-a/g4a-u08-phase2a-semantic-tightening.test.js.

patch_details:
1. Same-unit labels tightened further.
   - capacity same-unit = mL only.
   - weight same-unit = g only.
   - length same-unit = cm/mm only.
   - L/kg/m stay available through explicit conversion overlays.

2. Payment helpers consolidated.
   - Payment choices now use a payment-above-cost helper.
   - Discount adjustment uses more plausible base/discount/payment ranges.

3. Prompt variants improved.
   - capacity divide-by-group uses 分裝 / 每杯倒入 wording.
   - weight divide-by-group uses 整理 / 裝袋 wording.
   - money scaling uses buy-unit phrasing.
   - count/time/measured scaling use different phrasing families instead of one repeated shell.

4. Regression guard added.
   - g4a-u08-phase2a-semantic-tightening.test.js blocks the previous PDF-smoke fragments:
     - 原價12元，活動折扣11元
     - 原價20元，活動折扣19元
     - 付325元 / 付165元
     - 每份豆漿原本需要157L
     - 每份飲用水原本需要157L
     - 每份作品需要144L
     - 每份作品需要95kg
     - 每份跑道標線原本需要140m
     - 每份材料包需要5組，每組用5mL的飲用水
     - 每份材料包需要2組，每組用5kg的飼料

closeout_decision:
- Do not close yet because code changed after the 499/499 local readback.
- Closeout gate requires:
  1. local npm test readback after this final patch;
  2. regenerated PDF smoke after local pass.

expected_local_readback:
- Previous test count = 499.
- New semantic tightening regression test adds 1 test.
- Expected after pull:
  - tests = 500
  - pass = 500
  - fail = 0

required_local_commands:
```powershell
git fetch public
git switch public-main
git reset --hard public/main
git clean -fd
npm test
```

GOAL_DISTANCE_BEFORE = D1_G4A_U08_PHASE2A_SEMANTIC_TIGHTENING_PATCH_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U08_FINAL_SEMANTIC_HARDENING_TEST_PENDING
DISTANCE_REDUCED = The regenerated mixed PDF confirmed numeric+application mixing and cleared the previous severe semantic blockers; final generator hardening and regression coverage were added before closeout.
REMAINING_BLOCKERS = ["Need local npm test readback after final hardening", "Need regenerated PDF smoke after local pass", "Need Phase2A closeout marker"]
NEXT_SHORTEST_STEP = S56G2R_R10_LocalRetest
STOP_REASON = awaiting_local_test_readback
BLOCKER_TYPE = LOCAL_TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S56G2R_R10_FINAL_SEMANTIC_HARDENING_PATCH_APPLIED
REQUIRED_OPERATOR_ACTION = Pull public/main, run local npm test, then paste tests/pass/fail output.
NEXT_RESUME_TASK = S56G2R_R10_LocalRetest
