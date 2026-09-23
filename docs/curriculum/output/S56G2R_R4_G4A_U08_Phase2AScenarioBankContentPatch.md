S56G2R_R4_G4A_U08_Phase2AScenarioBankContentPatch

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題
status = IMPLEMENTED_STATIC_READBACK_PASS_LOCAL_TEST_READBACK_REQUIRED
write_type = scenario_bank_content_patch_report

operator_feedback_addressed:
- Existing generated PDFs were too repetitive.
- Contexts over-cycled 飲料 / 藥粉 / 道路 / 課程時間.
- Some prompts were semantically unnatural, such as 道路分成三批, 盒道路, 盒課程時間, 標準門票, 每次使用門票.
- Content quality was not acceptable for user-facing HTML print/PDF smoke.

files_modified:
- site/modules/curriculum/batch-a/g4a-u08-application-generator.js
- tests/curriculum/batch-a/g4a-u08-phase2a-application.test.js

implementation_changes:
1. Added scenario banks by unit domain.
   - money: 校外教學, 文具店, 麵包店, 園遊會, 公車站, 明信片小店.
   - count_items: 圖書館活動, 美術課, 班級獎勵, 運動會, 自然課, 積木角.
   - capacity: 運動會補給站, 生日會, 午餐廚房, 教室飲水區, 園藝課, 早餐店.
   - weight: 烘焙社, 午餐廚房, 市場採買, 資源回收, 寵物照顧, 郵局寄件.
   - length: 美術課, 園藝課, 布置教室, 童軍活動, 木工角, 運動場.
   - time: 閱讀課, 籃球隊, 資訊課, 科學社, 家政課, 平板充電站.

2. Rewrote prompt rendering to start from life scenes.
   - Old direction: unitDomain -> noun -> fixed sentence shell.
   - New direction: scene/item/action -> unit quantity -> equation model.

3. Removed known weak phrase patterns.
   - 道路分成三批.
   - 盒道路.
   - 盒課程時間.
   - 標準門票.
   - 每次使用門票.
   - 道路共有.
   - 課程時間共有.

4. Kept arithmetic contract unchanged.
   - 4 Phase2A visible KPs unchanged.
   - 12 PatternSpecs unchanged.
   - 60% same-unit / 40% conversion target unchanged.
   - One-step conversion only.
   - Exact division, no negative, no decimal.

5. Added semantic regression coverage.
   - New test checks forbidden phrase absence.
   - New test requires at least 10 scenario scenes and 12 scenario items in a 60-question mixed worksheet.
   - Existing validator/generation tests remain.

expected_local_readback:
- Previous passing target before adding semantic test was 495 tests.
- New semantic regression test adds 1 test.
- Expected after pull:
  - tests = 496
  - pass = 496
  - fail = 0

required_local_commands:
```powershell
git fetch public
git switch public-main
git reset --hard public/main
git clean -fd
npm test
```

S56G2R_R4_gate_static:
- scenario bank implemented = PASS
- invalid phrase regression added = PASS
- diversity regression added = PASS
- local npm readback = PENDING

GOAL_DISTANCE_BEFORE = D1_G4A_U08_PHASE2A_CONTENT_QUALITY_BLOCKER_IDENTIFIED
GOAL_DISTANCE_AFTER = D1_G4A_U08_PHASE2A_SCENARIO_BANK_CONTENT_PATCH_TEST_PENDING
DISTANCE_REDUCED = Phase2A application generation moved from repetitive unit-domain substitution toward life-scene scenario rendering while preserving the arithmetic and validator contracts.
REMAINING_BLOCKERS = ["Need local npm test readback", "Need regenerate PDFs and inspect content diversity", "Need equation+answer HTML answer-key rendering", "Need Phase2A closeout"]
NEXT_SHORTEST_STEP = S56G2R_R4_LocalRetest
STOP_REASON = awaiting_local_test_readback
BLOCKER_TYPE = LOCAL_TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S56G2R_R4_IMPLEMENTED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, run local npm test, then paste tests/pass/fail output.
NEXT_RESUME_TASK = S56G2R_R4_LocalRetest
