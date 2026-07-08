S50G_R4_G4A_U01_AnswerKeyTallCardPrintLayoutFix

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = FIX_APPLIED_STATIC_READBACK_PASS_TEST_AND_PDF_READBACK_REQUIRED
write_type = answer_key_print_layout_fix_readback

scope_lock:
- Fix only S50G_R3 remaining blocker: G4A-U01 tall answer-key cards splitting across PDF pages.
- Do not change G4A-U01 generator math logic.
- Do not implement Phase 2/Phase 3 source-image patterns.
- Do not modify G4A-U02/G4A-U04/G4A-U08.

root_cause:
- S50G_R2 added question-side row caps for G4A-U01 tall prompt patterns.
- S50G_R3 PDF smoke showed the question side improved, but answer-key pages still split cards.
- Answer-key cards are taller because they include both prompt text and answer text.
- questionPages and answerKeyPages previously used the same printLayout.

fix_applied:
- site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
  - Added separate G4A_U01_TALL_TEXT_ANSWER_KEY_LAYOUT_PROFILES.
  - Added answer-key row caps:
    - ps_g4a_u01_same_digit_place_value_difference -> 4 columns x 6 rows = 24 answer cards/page.
    - ps_g4a_u01_place_value_composition_to_number -> 4 columns x 4 rows = 16 answer cards/page.
    - ps_g4a_u01_8digit_place_value_decomposition -> 4 columns x 3 rows = 12 answer cards/page.
  - Keeps existing question-side caps unchanged.
  - Computes answerKeyPrintLayout separately from printLayout.
  - Passes answerKeyPrintLayout to paginateAnswerKeyItems.
  - Adds answerKeyColumns / answerKeyRowsPerPage to printOptions and stores answerKeyPrintLayout in configSnapshot.
  - Adds layoutHints.avoidPageBreakInside to text answer-key items.

files_modified:
- site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
- tests/curriculum/batch-a/g4a-u01-phase1.test.js

test_coverage_added:
- same-digit place-value difference:
  - question pages = [32, 8]
  - answer-key pages = [24, 16]
  - answerKeyPrintLayout.rowsPerPage = 6
- place-value composition:
  - question pages = [20, 20]
  - answer-key pages = [16, 16, 8]
  - answerKeyPrintLayout.rowsPerPage = 4
- place-value decomposition:
  - question pages = [16, 16, 8]
  - answer-key pages = [12, 12, 12, 4]
  - answerKeyPrintLayout.rowsPerPage = 3

commits:
- c3d622a3afa77e8fe00fa0409e28675e02ad0856 fix(g4a-u01): cap tall answer key print rows
- 88484f5b74673e374ea11d1ca557b5a9d4e9b36f test(g4a-u01): cover tall answer key print layout caps

static_readback:
- batch-a-browser-worksheet.js confirms separate answer-key profiles and row caps.
- batch-a-browser-worksheet.js confirms answerKeyPrintLayout is computed separately and used for answerKeyPages.
- g4a-u01-phase1.test.js confirms expected page counts for question and answer-key pages.

validation_status:
- GitHub connector static write/read succeeded.
- workflow_runs = [] for commit 88484f5b74673e374ea11d1ca557b5a9d4e9b36f at inspection time.
- combined statuses = [] for commit 88484f5b74673e374ea11d1ca557b5a9d4e9b36f at inspection time.
- npm test is not claimed as passed until operator or Actions readback confirms.
- PDF print smoke is not claimed as passed until regenerated PDFs are inspected.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_next_pdf_smoke:
- Regenerate:
  - g4a_u01_相同數字不同位值差.pdf
  - g4a_u01_八位數位值組合.pdf
  - g4a_u01_八位數位值分解.pdf
  - g4a_u01_同單位知識點混合_隨機.pdf with includeAnswerKey = true

expected_pdf_result_after_fix:
- Same-digit answer pages should paginate 24 + 16 answer cards without dangling fragments.
- Composition answer pages should paginate 16 + 16 + 8 answer cards without dangling fragments.
- Decomposition answer pages should paginate 12 + 12 + 12 + 4 answer cards without dangling fragments.
- Mixed answer-key pages should no longer split composition/decomposition answer cards around previous fragment pages.

anti_scope_check:
- No G4A-U01 content generator logic changed.
- No validator logic changed.
- No Phase 2/Phase 3 patterns added.
- No G4A-U02/G4A-U04/G4A-U08 work performed.

GOAL_DISTANCE_BEFORE = D1_G4A_U01_QUESTION_SIDE_PRINT_IMPROVED_ANSWER_KEY_SPLIT_BLOCKER_REMAINING
GOAL_DISTANCE_AFTER = D1_G4A_U01_ANSWER_KEY_LAYOUT_FIX_APPLIED_AWAITING_TEST_AND_PDF_READBACK
DISTANCE_REDUCED = The remaining answer-key page-splitting blocker was addressed by separate answer-key print layouts and stricter row caps for tall G4A-U01 patterns.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after 88484f5", "Need regenerated tall-pattern PDFs", "Need regenerated mixed G4A-U01 answer-key PDF", "initial blank page warning persists", "Phase 2/Phase 3 fine-grained source-image patterns deferred"]
NEXT_SHORTEST_STEP = S50G_R5_G4A_U01_AnswerKeyLayoutFixNpmAndPDFReadback
STOP_REASON = awaiting_required_test_and_pdf_readback
BLOCKER_TYPE = TEST_AND_PDF_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S50G_R4_FIX_APPLIED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main at or after 88484f5, run npm test, then regenerate the three tall-pattern PDFs and one mixed answer-key PDF.
NEXT_RESUME_TASK = S50G_R5_G4A_U01_AnswerKeyLayoutFixNpmAndPDFReadback
