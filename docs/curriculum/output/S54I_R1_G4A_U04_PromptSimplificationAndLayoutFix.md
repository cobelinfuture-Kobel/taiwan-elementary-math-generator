S54I_R1_G4A_U04_PromptSimplificationAndLayoutFix

sourceId = g4a_u04_4a04
unit = 4A-U04 整數的除法
status = FIX_APPLIED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = prompt_simplification_and_pdf_layout_fix_report

operator_observation:
- General division question prompts should not include KnowledgePoint/source-case wording.
- Required display shape for normal division: 4539 ÷ 3 = ______.
- Mixed PDF filename issue was operator-side naming; mixed ordering is not a current blocker.
- Division-check question should show: 516 ÷ 15 = 商 34，餘 6。如何驗算？
- Division-check answer key should show the verification equation, e.g. 15 × 34 + 6 = 516.

uploaded_pdf_context:
- Uploaded PDF still showed source-case labels inside every normal division prompt, e.g. 4位數除以1位數：千位整除：8428 ÷ 4 = ______.
- Uploaded PDF also showed verification prompts with a half-filled equation, e.g. 驗算：15 × 34 + 6 = ______.
- These are now treated as prompt-format blockers, not arithmetic blockers.

fix_applied:
1. Prompt simplification
   - Updated site/modules/curriculum/batch-a/g4a-u04-division-generator.js.
   - Long-division prompts now render only: dividend ÷ divisor = ______.
   - Source-case labels remain in metadata/selector/PatternSpec, not in the student-facing prompt.
   - Verification prompts now render: dividend ÷ divisor = 商 quotient，餘 remainder。如何驗算？
   - Verification answerText remains: divisor × quotient + remainder = dividend.

2. Safe PDF layout profile
   - Updated site/modules/curriculum/batch-a/batch-a-browser-worksheet.js.
   - Added G4A_U04_SOURCE_ID.
   - Added G4A_U04_SAFE_LAYOUT_PROFILES.
   - Added G4A_U04_SAFE_ANSWER_KEY_LAYOUT_PROFILES.
   - G4A-U04 output now uses avoidPageBreakInside hints.
   - Mixed G4A-U04 output is capped to safer page grids:
     - question pages: at most 3 columns; rows capped by the most restrictive selected G4A-U04 profile.
     - answer-key pages: at most 3 columns; rows capped by the most restrictive selected G4A-U04 profile.

new_regression_tests:
- Updated tests/curriculum/batch-a/g4a-u04-division.test.js.
- Added test: G4A-U04 long-division prompts are bare horizontal expressions.
- Added test: G4A-U04 verification prompts ask how to check.
- Added test: G4A-U04 same-unit mixed worksheet uses safe page-break layout.
- Existing math correctness, first-place rule, answer-key, duplicate-rate, and shuffle tests remain.

expected_test_delta:
- Previous expected test count after S54C-S54F = 474.
- New tests added in S54I_R1 = 2 net additional tests compared with previous g4a-u04 suite.
- Expected npm result after pull = tests 476, pass 476, fail 0.

not_claimed:
- npm test after S54I_R1 has not been run.
- Regenerated PDFs have not been inspected.
- The earlier PDF card-split/layout blocker is not cleared until regenerated PDF smoke passes.
- The earlier ten-insufficient content issue must be rechecked on regenerated PDFs after prompt simplification.

required_next_pdfs_after_test_pass:
- g4a_u04_同單位知識點混合_正確檔名.pdf or equivalent updated mixed PDF.
- Prefer also regenerate at least:
  - g4a_u04_3位數除以2位數_十位不夠除.pdf
  - g4a_u04_除法驗算_有餘數.pdf
  - one 4位數除以1位數 single-KP PDF.

expected_pdf_acceptance_checks:
- Normal division prompts contain only equations like a ÷ b = ______.
- No source-case wording appears inside each normal division prompt.
- Verification prompts use 如何驗算？ and do not pre-fill the check equation blank.
- Answer key keeps prompt and answer together; no orphan answer fragments.
- 十位不夠除 regenerated PDF contains only firstTwoDividendDigits < divisor cases.
- Recomputed quotient/remainder and verification answers = 0 errors.

GOAL_DISTANCE_BEFORE = D1_G4A_U04_PROMPT_REQUIREMENT_CLARIFIED
GOAL_DISTANCE_AFTER = D1_G4A_U04_PROMPT_AND_LAYOUT_FIX_APPLIED_TEST_PENDING
DISTANCE_REDUCED = User-facing prompt requirements were converted into generator and worksheet layout changes with regression tests; source labels are removed from student prompts and verification prompts now ask how to check.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after S54I_R1", "Need regenerated G4A-U04 mixed PDF smoke", "Need regenerated 十位不夠除 PDF smoke", "Need confirm no card/page split or orphan answer fragments", "Need confirm horizontal-only prompt format is accepted"]
NEXT_SHORTEST_STEP = S54I_R2_G4A_U04_NpmRetestAndRegeneratedPDFSmoke
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S54I_R1_FIX_APPLIED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, run npm test, then regenerate G4A-U04 PDFs for smoke review.
NEXT_RESUME_TASK = S54I_R2_G4A_U04_NpmRetestAndRegeneratedPDFSmoke
