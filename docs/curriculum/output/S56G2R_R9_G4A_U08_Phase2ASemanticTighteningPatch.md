S56G2R_R9_G4A_U08_Phase2ASemanticTighteningPatch

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題 + Phase1 numeric mixed UI
status = SEMANTIC_TIGHTENING_PATCH_APPLIED_LOCAL_TEST_READBACK_REQUIRED
write_type = pdf_semantic_audit_and_patch_report

operator_local_readback:
- tests = 498
- pass = 498
- fail = 0
- duration_ms = 9715.8391

uploaded_pdf_reviewed:
- g4a_u08_同單位知識點混合_應用題_隨機排序.pdf

pdf_audit_result_before_patch:
- Numeric and application questions now appear together in the 200-question mixed PDF.
- The hybrid router fix is functionally confirmed by the PDF content.
- Closeout is still blocked because semantic issues remain in user-facing application problems.

semantic_blockers_found:
1. Discount/payment semantic issue.
   - Examples in uploaded PDF:
     - 公車站每張車票原價12元，活動折扣11元。付325元，找回多少元？
     - 校外教學每張門票原價20元，活動折扣19元。付165元，找回多少元？
   - Problem: discount nearly equals original price and payment is far from adjusted price.

2. Same-unit measured quantities too large.
   - Examples in uploaded PDF:
     - 生日會每份作品需要144L的果汁...
     - 午餐廚房每份作品需要95kg的白米...
     - 教室飲水區每份飲用水原本需要157L...
     - 運動場每份跑道標線原本需要140m...
   - Problem: mathematically valid but not suitable as ordinary Grade 4 life contexts.

3. Material-pack wording still artificial for capacity/weight contexts.
   - Examples in uploaded PDF:
     - 每份材料包需要5組，每組用5mL的飲用水。
     - 每份材料包需要2組，每組用5kg的飼料。
   - Problem: generic 材料包 shell reads like a template instead of a life problem.

4. Repetitive scaling shell remains visible.
   - Examples use 在{scene}中，n份{item}共需要x，照這樣計算...
   - Problem: semantically valid but too repetitive at 200 questions.

functional_status:
- Hybrid numeric + application mixed generation is not the blocker anymore.
- PDF semantic quality is the blocker.
- Unit closeout remains NOT ALLOWED until retest and regenerated PDF smoke pass.

files_modified:
- site/modules/curriculum/batch-a/g4a-u08-application-generator.js
- tests/curriculum/batch-a/g4a-u08-phase2a-semantic-tightening.test.js

patch_applied:
1. Payment/discount template tightened.
   - Money adjustment branch now uses realistic base prices.
   - Discounts are capped to a smaller portion of base price.
   - Payment is chosen just above adjusted price from ordinary payment values.

2. Same-unit measured labels tightened.
   - Same-unit capacity now uses mL only.
   - Same-unit weight now uses g only.
   - Same-unit length now uses cm/mm only.
   - L/kg/m remain available through explicit conversion overlays only.

3. Quantity ranges tightened.
   - Same-unit measured values reduced for application templates.
   - Money unit-rate values reduced for more plausible prices.
   - Payment-minus-unit-cost uses the same payment-above-cost helper.

4. Material-pack prompts rewritten by domain.
   - capacity: 分裝小杯 wording.
   - weight: 整理 / 裝袋 wording.
   - count_items: 整理 item wording.
   - Avoids generic 材料包 wording for capacity/weight contexts.

5. Scaling prompts diversified.
   - money uses buying/counting phrasing.
   - count_items uses 整理 n 組.
   - time uses 安排 n 次.
   - measured domains use 準備 n 份.

regression_test_added:
- Created g4a-u08-phase2a-semantic-tightening.test.js.
- Guards against PDF-smoke blockers including:
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

not_closed_reason:
- Patch has not yet received local npm readback.
- Regenerated PDF smoke is still required after local pass.
- Therefore closeout marker was not created.

expected_local_readback:
- Previous test count = 498.
- New semantic tightening regression test adds 1 test.
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

GOAL_DISTANCE_BEFORE = D1_G4A_U08_HYBRID_MIXED_FIX_APPLIED_SEMANTIC_BLOCKER_REMAINS
GOAL_DISTANCE_AFTER = D1_G4A_U08_PHASE2A_SEMANTIC_TIGHTENING_PATCH_TEST_PENDING
DISTANCE_REDUCED = The regenerated hybrid PDF confirmed numeric+application mixing works, then exposed remaining semantic blockers; the generator now tightens payment, unit labels, measured quantities, material-pack wording, and scale prompts.
REMAINING_BLOCKERS = ["Need local npm test readback for semantic tightening", "Need regenerated PDF smoke after local pass", "Need equation+answer HTML answer-key rendering", "Need Phase2A closeout"]
NEXT_SHORTEST_STEP = S56G2R_R9_LocalRetest
STOP_REASON = awaiting_local_test_readback
BLOCKER_TYPE = LOCAL_TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S56G2R_R9_SEMANTIC_TIGHTENING_PATCH_APPLIED
REQUIRED_OPERATOR_ACTION = Pull public/main, run local npm test, then paste tests/pass/fail output.
NEXT_RESUME_TASK = S56G2R_R9_LocalRetest
