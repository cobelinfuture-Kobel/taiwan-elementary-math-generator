S53F_R1_G4A_U02_DigitCardUniquePoolFix

sourceId = g4a_u02_4a02
unit = 4A-U02 整數的乘法
status = FIX_APPLIED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = npm_failure_fix_report

operator_test_readback:
- tests = 464
- pass = 463
- fail = 1
- failed_file = tests/curriculum/batch-a/g4a-u02-numeric.test.js
- failed_test = G4A-U02 mixed worksheet duplicate rate stays bounded
- failure_code = g4a_u02_unique_pool_exhausted
- failing_pattern = ps_g4a_u02_digit_card_arrangement_product_max_min
- failure_detail = requires 16 questions but generated 8 unique prompts

root_cause:
- S53F added the digit-card reasoning PatternSpec into all-9 same-unit mixed generation.
- The all-9 mixed 150-question test allocates 16 questions to ps_g4a_u02_digit_card_arrangement_product_max_min.
- The digit-card generator had only 8 fixed digit-card sets.
- Prompt-level duplicate guard correctly rejected repeated digit-card prompts after 8 unique items.
- Therefore the failure is a real reasoning-pool capacity bug, not a test defect.

fix_applied:
- Updated site/modules/curriculum/batch-a/g4a-u02-numeric-generator.js.
- Expanded DIGIT_CARD_SETS from 8 sets to 24 deterministic sets.
- The digit-card reasoning pool now supports at least the 16 items required by the 150-question all-9 mixed worksheet test.
- Kept the duplicate guard active.
- Updated digit-card prompt wording from '六張數字卡各一次' to '從六張數字卡中選出五張各用一次' because a 三位數 × 二位數 expression uses five digit slots.
- Kept exhaustive max/min product search and no-leading-zero guard unchanged.

scope_integrity:
- Numeric accepted behavior is unchanged.
- Operand order rules remain unchanged.
- Near-hundred strategy behavior is unchanged.
- No new visible KnowledgePoints were added.
- G4A-U02 visible count remains expected = 9.
- Batch A global visible count remains expected = 68.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_result:
- The g4a_u02_unique_pool_exhausted failure for ps_g4a_u02_digit_card_arrangement_product_max_min should be cleared.
- Test count should remain 464 unless new test files are added elsewhere.

next_after_pass:
- Generate reasoning PDF: 數字卡排列最大最小乘積.
- Generate reasoning PDF: 接近整百乘法策略.
- Generate all-9 G4A-U02 same-unit mixed PDF.
- Inspect answer correctness, text length, duplicate rate, and mixed interleave.

GOAL_DISTANCE_BEFORE = D1_G4A_U02_REASONING_IMPLEMENTED_STATIC_READBACK_PASS_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U02_REASONING_DIGIT_CARD_POOL_FIX_APPLIED_TEST_PENDING
DISTANCE_REDUCED = The S53F npm blocker was isolated to digit-card reasoning pool capacity and fixed while preserving duplicate guard and accepted numeric behavior.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after S53F_R1", "Need reasoning single-KP PDFs", "Need all-9 mixed PDF smoke", "optional renderer-wide blank-page cleanup backlog"]
NEXT_SHORTEST_STEP = S53G_G4A_U02_ReasoningNpmRetestAndPDFSmoke
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S53F_R1_FIX_APPLIED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, rerun npm test, then generate the two reasoning PDFs and one all-9 mixed PDF after pass.
NEXT_RESUME_TASK = S53G_G4A_U02_ReasoningNpmRetestAndPDFSmoke
