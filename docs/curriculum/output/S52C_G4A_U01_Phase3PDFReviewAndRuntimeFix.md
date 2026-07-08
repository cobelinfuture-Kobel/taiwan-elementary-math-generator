S52C_G4A_U01_Phase3PDFReviewAndRuntimeFix

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = IMPLEMENTED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = pdf_review_plus_runtime_fix_report

operator_request:
1. Check Phase 3 PDFs.
2. Boundary-number difference has only 8 unique items; this is acceptable, but the UI must show this as a non-blocking message.
3. Same-unit mixed KnowledgePoint generation must not fail globally when one pool is saturated.
4. shuffleAcrossPatterns in same-unit mixed mode must actually change output order.

uploaded_pdf_review:
- g4a_u01_最大最小位數邊界差.pdf
  - pages = 2
  - question_count = 8
  - answer_key_count = 8
  - arithmetic_errors = 0
  - finding = PASS_CONTENT, LIMITED_POOL_EXPECTED
- g4a_u01_大數單位加減應用題.pdf
  - pages = 10
  - question_count = 60
  - answer_key_count = 60
  - arithmetic_errors = 0
  - blank_pages = 5, 10
  - finding = PASS_CONTENT_WITH_KNOWN_BLANK_PAGES
- g4a_u01_比較型應用題求總和.pdf
  - pages = 10
  - question_count = 60
  - answer_key_count = 60
  - arithmetic_errors = 0
  - blank_pages = 5, 10
  - out_of_scope_answer_values = 2
    - item 7 answer = 109175331
    - item 33 answer = 100459276
  - finding = FAIL_RANGE_POLICY_NEEDS_FIX
- g4a_u01_萬單位混合記法減法.pdf
  - pages = 10
  - question_count = 60
  - answer_key_count = 60
  - arithmetic_errors = 0
  - blank_pages = 5, 10
  - finding = PASS_CONTENT_WITH_KNOWN_BLANK_PAGES
- g4a_u01_數字與中文數詞比大小.pdf
  - pages = 10
  - question_count = 60
  - answer_key_count = 60
  - comparison_answer_errors = 0
  - blank_pages = 5, 10
  - finding = PASS_CONTENT_WITH_KNOWN_BLANK_PAGES
- g4a_u01_大數讀寫轉換.pdf
  - pages = 10
  - question_count = 60
  - answer_key_count = 60
  - parse_answer_errors = 0
  - nonstandard_chinese_number_style = 1
    - item 1 answer contained 零一十 style: 一千八百零二萬八千零一十一
  - blank_pages = 5, 10
  - finding = PASS_ARITHMETIC_NEEDS_FORMAT_FIX

fixes_implemented:
- Added site/modules/curriculum/batch-a/g4a-u01-phase3-runtime-fix-generator.js.
- Routed G4A-U01 generation through the runtime wrapper.
- Converted boundary unique-pool exhaustion from blocking error to non-blocking warning.
- Allowed single boundary-difference worksheets to produce all 8 available questions and keep print enabled.
- Added same-unit mixed-mode saturation/backfill so other selected KnowledgePoints can fill the requested count when the boundary pool saturates.
- Added deterministic shuffleAcrossPatterns for G4A-U01, because the original G4A generator returned grouped allocation order.
- Normalized Chinese-number output to avoid 零一十 style.
- Filtered comparison-total word problems with answer > 99,999,999 and backfilled valid alternatives.
- Updated worksheet document builder to surface non-blocking generation warnings in the UI validation panel.

files_modified_or_created:
- site/modules/curriculum/batch-a/g4a-u01-phase3-runtime-fix-generator.js
- site/modules/curriculum/batch-a/batch-a-browser-question-router.js
- site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
- tests/curriculum/batch-a/g4a-u01-phase3-runtime-fix.test.js

test_coverage_added:
- Boundary-difference single-KP request for 10 questions produces 8 questions with warning.
- Same-unit mixed mode with 200 questions backfills boundary shortage and remains ok.
- shuffleAcrossPatterns changes G4A-U01 mixed render order.
- Reading/writing conversion output no longer contains 零一十.
- Comparison-total word problem answers remain <= 99,999,999.

not_claimed:
- npm test has not been run in this environment.
- Regenerated fixed PDFs have not yet been inspected.
- Existing blank pages 5/10 in 60-question PDF outputs are still treated as known non-blocking pagination artifacts unless later targeted.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_manual_ui_check_after_pull:
- Single KnowledgePoint = 最大最小位數邊界差, questionCount = 10 should generate 8 questions, show a warning, and keep Print enabled.
- Same-unit mixed KnowledgePoints, questionCount = 200 should generate successfully instead of failing due boundary pool saturation.
- Same-unit mixed KnowledgePoints with shuffleAcrossPatterns should visibly interleave PatternSpecs instead of rendering grouped order.
- 大數讀寫轉換 should no longer show 零一十 style.
- 比較型應用題求總和 should not produce answers above 99,999,999.

GOAL_DISTANCE_BEFORE = D1_G4A_U01_PHASE3_IMPLEMENTED_STATIC_READBACK_PASS_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U01_PHASE3_RUNTIME_FIX_IMPLEMENTED_TEST_PENDING
DISTANCE_REDUCED = Phase 3 moved from initial implementation with PDF/UI runtime defects to a patched generator/worksheet path with static readback and targeted tests added.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after S52C", "Need regenerated Phase 3 PDF smoke after S52C", "optional renderer-wide blank-page cleanup backlog"]
NEXT_SHORTEST_STEP = S52D_G4A_U01_Phase3RuntimeFixNpmTestReadback
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S52C_IMPLEMENTED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, run npm test, then regenerate the affected G4A-U01 Phase 3 PDFs.
NEXT_RESUME_TASK = S52D_G4A_U01_Phase3RuntimeFixNpmTestReadback
