S56G2R_R7_G4A_U08_Phase2ASemanticAndHighCountFix

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題
status = IMPLEMENTED_STATIC_READBACK_PASS_LOCAL_TEST_READBACK_REQUIRED
write_type = semantic_and_high_count_fix_report

precondition:
- Operator local validation before this task:
  - tests = 496
  - pass = 496
  - fail = 0
- S56G2R_R6 audit confirmed remaining user-facing blockers:
  - no hard 30-question UI/code cap found;
  - possible high-count unique-prompt exhaustion;
  - remaining semantic/action-polarity issues;
  - stale mixed PDFs still need regeneration.

files_modified:
- site/modules/curriculum/batch-a/g4a-u08-application-generator.js
- tests/curriculum/batch-a/g4a-u08-phase2a-application.test.js

implementation_changes:
1. Scenario-specific unit-label policy tightened.
   - Count-item scenarios now carry their own labels:
     - 書籤 / 貼紙 / 獎勵卡 / 實驗卡 = 張
     - 毛巾 = 條
     - 積木 = 個
   - This prevents mismatches such as 條的積木, 張的積木, 本的積木, 本的獎勵卡, 包的獎勵卡.

2. Action polarity fixed for add/sub templates.
   - Scenario entries now distinguish addVerb, restoreVerb, and consumeVerb.
   - a - b + c templates use restoreVerb instead of a generic action verb.
   - Length scenarios no longer use 再鋸 as an increase action; 木條 uses 接上一段 / 補上一段 for positive changes and 鋸下 for subtraction.

3. Time wording improved.
   - Same-unit time labels now use 分 / 秒, while 時 appears only through conversion overlay.
   - Continuous-subtraction time prompts use 完成 instead of 用掉時間.

4. Connector-safe phrasing added.
   - Unit-rate templates now use 在{scene}中，{knownUnits}份{item}... instead of concatenations such as 運動會2份毛巾 or 園藝課5份澆花水.

5. Quantity ranges tightened.
   - Payment/change chooses a payment just above cost from 50/100/200/500 instead of overusing 1000.
   - Exact-division templates use divisibility-safe totals.
   - Same-unit time avoids 200時 style quantities.
   - Large implausible quantities such as 4000L / 5000kg / 2400m are guarded by semantic tests.

6. High-count generation diagnostics strengthened.
   - Per-pattern generation attempts increased to max(questionCount * 10, 150).
   - unique_pool_exhausted error now reports the max attempts used.

regression_tests_added_or_strengthened:
- Expanded forbidden semantic phrase guard:
  - 道路分成三批, 盒道路, 盒課程時間, 標準門票, 每次使用門票, 道路共有, 課程時間共有
  - 再鋸, 運動會2份, 園藝課5份, 籃球隊4份
  - 條的積木, 張的積木, 本的積木, 本的獎勵卡, 包的獎勵卡
  - 200時, 4000L, 5000kg, 2400m
- Added high-count test:
  - each of the 4 Phase2A KPs must generate and validate 120 questions;
  - mixed Phase2A must build a 200-question worksheet;
  - high-count outputs must also pass forbidden-phrase checks.

not_implemented_in_this_step:
- Phase2B comparison/rate-difference KP.
- two-cost-component template.
- large-overlay application template.
- chained conversion.
- decimal/fraction answers.
- equation+answer HTML answer-key rendering.
- PDF smoke / regenerated PDF inspection.

expected_local_readback:
- Previous test count = 496.
- New high-count regression test adds 1 test.
- Expected after pull:
  - tests = 497
  - pass = 497
  - fail = 0

required_local_commands:
```powershell
git fetch public
git switch public-main
git reset --hard public/main
git clean -fd
npm test
```

S56G2R_R7_gate_static:
- scenario-specific unit labels implemented: PASS
- action-polarity mapping implemented: PASS
- time same-unit wording tightened: PASS
- connector-safe unit-rate phrasing implemented: PASS
- high-count generation test added: PASS
- local npm readback: PENDING

GOAL_DISTANCE_BEFORE = D1_G4A_U08_PHASE2A_COUNT_AND_SEMANTIC_AUDIT_FIX_REQUIRED
GOAL_DISTANCE_AFTER = D1_G4A_U08_PHASE2A_SEMANTIC_HIGH_COUNT_FIX_TEST_PENDING
DISTANCE_REDUCED = Phase2A application generator now has scenario-specific labels, action polarity, safer quantities, explicit high-count generation coverage, and stronger semantic regression guards.
REMAINING_BLOCKERS = ["Need local npm test readback", "Need regenerate PDFs and inspect content diversity", "Need equation+answer HTML answer-key rendering", "Need Phase2A closeout"]
NEXT_SHORTEST_STEP = S56G2R_R7_LocalRetest
STOP_REASON = awaiting_local_test_readback
BLOCKER_TYPE = LOCAL_TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S56G2R_R7_IMPLEMENTED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, run local npm test, then paste tests/pass/fail output.
NEXT_RESUME_TASK = S56G2R_R7_LocalRetest
