S50E_R2_G4A_U01_PublicMainCIFix

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = FIX_APPLIED_AWAITING_LOCAL_OR_ACTIONS_READBACK
write_type = ci_failure_fix_readback

public_repo_context:
- repository = cobelinfuture-Kobel/taiwan-elementary-math-generator
- branch = main
- operator confirmed this public project is the correct CI target.
- public/main local test before this fix reported 437 tests, 429 pass, 8 fail.

failed_test_groups_before_fix:
- G3A-U03 validator regression:
  - S43G5L G3A U03 mixed mode interleaves six KPs and dedupes questions
  - S43G5H multiplication missing digit inference validates non-same-place blanks
- G4A-U01 Phase 1 regression:
  - G4A-U01 Phase 1 questions pass Batch A validator
  - G4A-U01 Phase 1 worksheet document builds with answer key
  - S42B19 Batch A browser bridge grouped/shuffled/no-answer-key source smoke for g4a_u01_4a01
  - Batch A controls - G4A U01 source supports comparison and large-number expression patterns

root_causes:
- batch-a-browser-validator.js called validateMultiplicationMissingDigitQuestion(question, errors), but the callee contract is validateMultiplicationMissingDigitQuestion(definition, question, errors).
- g4a-u01-phase1-generator.js used createGeneratedQuestionSkeleton for large-number add/sub expression questions. That skeleton preserves pattern/skill tags but does not preserve metadata.sourceId, causing batch_a_question_source_mismatch for G4A-U01 expression questions.

fixes_applied:
- site/modules/curriculum/batch-a/batch-a-browser-validator.js
  - Restored multiplication missing digit validation call to validateMultiplicationMissingDigitQuestion(definition, question, errors).
- site/modules/curriculum/batch-a/g4a-u01-phase1-generator.js
  - Added question.metadata.sourceId = g4a_u01_4a01 for generated large-number add/sub expression questions.

commits:
- a4d0ead46ef24a7299ab2b59f698905e1361f36d fix(g4a-u01): preserve expression source metadata
- 8203ba8217214121caa2cb427f2ab482d62e1600 fix(batch-a): preserve multiplication missing digit validator signature

validation_status:
- GitHub connector static write/read succeeded.
- workflow_runs = [] for commit 8203ba8217214121caa2cb427f2ab482d62e1600 at inspection time.
- combined statuses = [] for commit 8203ba8217214121caa2cb427f2ab482d62e1600 at inspection time.
- npm test is not claimed as passed until operator or Actions readback confirms.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_result_after_fix:
- The 8 previously reported failures should be removed if no new regression appears.

anti_scope_check:
- No Phase 2/Phase 3 G4A-U01 features added.
- No UI layout or renderer changes.
- No G4A-U02/G4A-U04/G4A-U08 work.
- Fix is limited to public/main CI blockers discovered during S50E.

GOAL_DISTANCE_BEFORE = D1_G4A_U01_PHASE1_PUBLIC_MAIN_LOCAL_QA_FAIL_8
GOAL_DISTANCE_AFTER = D1_G4A_U01_PHASE1_PUBLIC_MAIN_FIX_APPLIED_AWAITING_TEST_READBACK
DISTANCE_REDUCED = Two root causes behind the 8 public/main test failures were fixed: G3A-U03 validator signature regression and G4A-U01 expression metadata source mismatch.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after 8203ba8", "G4A-U01 UI browser generation not smoke-tested", "G4A-U01 PDF print smoke not completed"]
NEXT_SHORTEST_STEP = S50E_R3_G4A_U01_PublicMainNpmTestReadback
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S50E_R2_FIX_APPLIED
REQUIRED_OPERATOR_ACTION = Pull public/main at or after 8203ba8 and run npm test.
NEXT_RESUME_TASK = S50E_R3_G4A_U01_PublicMainNpmTestReadback
