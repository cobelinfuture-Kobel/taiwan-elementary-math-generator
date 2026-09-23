S50G_R3_G4A_U01_PrintLayoutFixNpmAndPDFReadback

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = TEST_PASS_PDF_SMOKE_FAILED_ON_ANSWER_KEY_PAGE_SPLIT
write_type = npm_and_uploaded_pdf_readback_review

operator_test_readback:
- npm test after S50G_R2 completed.
- tests = 443
- pass = 443
- fail = 0
- cancelled = 0
- skipped = 0
- todo = 0
- duration_ms = 4636.2113

operator_pdf_input:
- g4a_u01_同單位知識點混合_隨機.pdf
- g4a_u01_相同數字不同位值差.pdf
- g4a_u01_八位數位值組合.pdf
- g4a_u01_八位數位值分解.pdf
- g4a_u01_大數加減.pdf
- g4a_u01_1億以內數比大小.pdf
- g4a_u01_八位數比大小.pdf

inspection_method:
- Rendered uploaded PDFs to images per PDF workflow.
- Inspected parsed text and rendered pages for question count, answer-key presence, blank pages, and cross-page card splitting.
- No code modified by this review.

summary:
- npm test is clean at 443 pass / 0 fail.
- Short single-KP PDFs are print-usable with existing blank-page warning.
- Tall single-KP question pages improved: question-side pagination is now cleaner for same-digit, composition, and decomposition.
- However answer-key pages still split cards across pages for the tall prompt patterns.
- Mixed G4A-U01 PDF still has answer-key split fragments for tall pattern answer cards.
- Therefore S50G PDF smoke is not pass yet.

single_pdf_results:

1. g4a_u01_1億以內數比大小.pdf
- pages = 4
- blank_pages_detected = 1
- question_items = 40
- answer_key_items = 40
- layout_result = PASS_WITH_INITIAL_BLANK_PAGE_WARNING

2. g4a_u01_八位數比大小.pdf
- pages = 4
- blank_pages_detected = 1
- question_items = 40
- answer_key_items = 40
- layout_result = PASS_WITH_INITIAL_BLANK_PAGE_WARNING

3. g4a_u01_大數加減.pdf
- pages = 4
- blank_pages_detected = 1
- question_items = 40
- answer_key_items = 40
- layout_result = PASS_WITH_INITIAL_BLANK_PAGE_WARNING

4. g4a_u01_相同數字不同位值差.pdf
- pages = 6
- blank_pages_detected = 1
- question_side = PASS: questions 1-32 on page 2 and 33-40 on page 3.
- answer_side = FAIL_LAYOUT_PAGE_SPLIT: page 4 contains answer cards 1-28, while page 5 starts with dangling answer text for cards 25-28 before cards 29-32.

5. g4a_u01_八位數位值組合.pdf
- pages = 7
- blank_pages_detected = 1
- question_side = PASS: questions 1-20 on page 1 and 21-40 on page 2.
- answer_side = FAIL_LAYOUT_PAGE_SPLIT: page 4 contains cards 1-20 but page 5 contains dangling answer fragments for cards 17-20; page 6 contains cards 21-40 but page 7 contains dangling answer fragments for cards 37-40.

6. g4a_u01_八位數位值分解.pdf
- pages = 9
- blank_pages_detected = 1
- question_side = PASS: questions 1-16 on page 1, 17-32 on page 2, and 33-40 on page 3.
- answer_side = FAIL_LAYOUT_PAGE_SPLIT: page 5 cards 1-16 split into page 6 fragments; page 7 cards 17-32 split into page 8 fragments; page 9 contains 33-40.

mixed_pdf_result:
- g4a_u01_同單位知識點混合_隨機.pdf
- pages = 30
- question_items = 200
- answer_key_items = 200 by numbering, but answer key contains split fragments.
- blank_pages_detected = 14
- question_side = PASS: question pages contain 1-200.
- answer_side = FAIL_LAYOUT_PAGE_SPLIT: answer pages around 21/22, 23/24, and 25/26 contain dangling fragments for decomposition/composition answer cards.

blocking_findings:
- S50G_R2 fixed or improved question-side tall-card pagination, but not answer-key tall-card pagination.
- The answer-key version of tall cards is taller than the question-only version because it includes both prompt and answer text.
- The same rowsPerPage caps are still too aggressive for answer-key pages.
- Browser/CSS break-inside is still insufficient when a card is taller than available grid row height.

recommended_fix_path:
- S50G_R4_G4A_U01_AnswerKeyTallCardPrintLayoutFix
  - Add separate answer-key row caps for G4A-U01 tall prompt patterns.
  - Candidate caps:
    - same-digit place-value difference answer key: 4 columns x 6 rows or lower.
    - place-value composition answer key: 4 columns x 4 rows or lower.
    - place-value decomposition answer key: 4 columns x 3 rows or lower.
  - If one layout is used for both question and answer pages, normalize using the stricter answer-key caps when includeAnswerKey = true.
  - Add tests for answerKeyPages item counts and no dangling fragment pages.

anti_scope_check:
- No runtime code modified by this review.
- No generator math logic changed.
- No Phase 2/Phase 3 patterns added.
- No G4A-U02/G4A-U04/G4A-U08 work performed.

GOAL_DISTANCE_BEFORE = D1_G4A_U01_PRINT_LAYOUT_CARD_BREAK_FIX_APPLIED_AWAITING_TEST_AND_PDF_READBACK
GOAL_DISTANCE_AFTER = D1_G4A_U01_QUESTION_SIDE_PRINT_IMPROVED_ANSWER_KEY_SPLIT_BLOCKER_REMAINING
DISTANCE_REDUCED = npm test passed and PDF smoke narrowed the remaining print blocker from all tall cards to answer-key tall-card pagination.
REMAINING_BLOCKERS = ["G4A-U01 answer-key tall cards still split across pages", "mixed G4A-U01 answer-key pages still contain dangling fragments", "initial blank page warning persists", "Phase 2/Phase 3 fine-grained source-image patterns deferred"]
NEXT_SHORTEST_STEP = S50G_R4_G4A_U01_AnswerKeyTallCardPrintLayoutFix
STOP_REASON = pdf_smoke_failed
BLOCKER_TYPE = PRINT_LAYOUT_ANSWER_KEY_PAGE_SPLIT
LAST_COMPLETED_STATUS = S50G_R3_TEST_PASS_PDF_REVIEW_COMPLETE
REQUIRED_OPERATOR_ACTION = none if continuing within S50G print-layout scope; fix can proceed directly.
NEXT_RESUME_TASK = S50G_R4_G4A_U01_AnswerKeyTallCardPrintLayoutFix
