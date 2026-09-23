S52F_G4A_U01_ArrangementKPNpmFailureFix

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = FIX_APPLIED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = failure_readback_fix_report

operator_test_readback:
- tests = 453
- pass = 451
- fail = 2
- failed_file = tests/curriculum/batch-a/g4a-u01-phase1.test.js

failures:
1. G4A-U01 Phase 2 refined place-value prompts match source-image semantics
- expected relation modes = [difference, sum]
- actual relation modes = [difference]

2. G4A-U01 Phase 3 models expose Chinese, wan, boundary, and word-problem semantics
- expected conversion directions = [numeric_to_chinese, chinese_to_numeric]
- actual conversion directions = [numeric_to_chinese]

root_cause:
- S52C/S52E runtime wrapper generated non-arrangement PatternSpecs through single-question base calls.
- The base G4A-U01 generator receives questionCount = 1 for each candidate call, so the inner base sequenceNumber is always 1.
- In the base generator, same-digit relation mode and reading-writing conversion direction were controlled by inner sequenceNumber.
- Therefore same-digit always normalized to difference and reading-writing always normalized to numeric_to_chinese in source-unit tests after the wrapper path.

fix_applied:
- Updated site/modules/curriculum/batch-a/g4a-u01-phase3-runtime-fix-generator.js.
- Runtime wrapper now passes its outer sequenceNumber into normalization.
- Added normalizeSameDigitQuestion(question, sequenceNumber):
  - odd sequenceNumber => difference
  - even sequenceNumber => sum
  - recomputes promptText/displayText/blankedDisplayText/answerText/finalAnswer.
- Updated normalizeReadingWritingQuestion(question, sequenceNumber):
  - odd sequenceNumber => numeric_to_chinese
  - even sequenceNumber => chinese_to_numeric
  - recomputes promptText/displayText/blankedDisplayText/answerText/finalAnswer.
- normalizeQuestion now accepts sequenceNumber and preserves alternating modes even when base generation is called one candidate at a time.
- Runtime IDs are now made unique by wrapper sequenceNumber for normalized candidates.

static_readback:
- The same-digit mode no longer depends on base inner sequenceNumber.
- The reading-writing mode no longer depends on base inner sequenceNumber.
- The fix is localized to G4A-U01 runtime wrapper.
- No PatternSpec/selector count changes.
- No Phase 3 PDF generation result is claimed until regenerated PDFs are checked.

latest_commit:
- 68d7abb701bf31466b5f8207218672da73b0c708 fix(g4a-u01): preserve alternating semantic modes in wrapper

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_test_result:
- tests should remain 453 or more depending on any new commits.
- the two known failures should be cleared.

GOAL_DISTANCE_BEFORE = D1_G4A_U01_ARRANGEMENT_KP_IMPLEMENTED_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U01_ARRANGEMENT_KP_TEST_FAILURE_FIX_APPLIED
DISTANCE_REDUCED = The S52E npm failure root cause was isolated and fixed in the G4A-U01 runtime wrapper; validation now waits for a fresh public/main npm test readback.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after S52F fix", "Need regenerated PDF smoke containing arrangement KP", "optional renderer-wide blank-page cleanup backlog"]
NEXT_SHORTEST_STEP = S52G_G4A_U01_ArrangementKPNpmRetestReadback
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S52F_FIX_APPLIED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main at commit 68d7abb701bf31466b5f8207218672da73b0c708 or newer and rerun npm test.
NEXT_RESUME_TASK = S52G_G4A_U01_ArrangementKPNpmRetestReadback
