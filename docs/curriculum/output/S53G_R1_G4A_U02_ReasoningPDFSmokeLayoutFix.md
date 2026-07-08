S53G_R1_G4A_U02_ReasoningPDFSmokeLayoutFix

sourceId = g4a_u02_4a02
unit = 4A-U02 整數的乘法
status = FIX_APPLIED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = reasoning_pdf_smoke_review_and_layout_fix

uploaded_pdfs_reviewed:
- g4a_u02_數字卡排列最大最小乘積.pdf
- g4a_u02_接近整百乘法策略.pdf
- g4a_u02_同單位知識點混合2_隨機排序.pdf

inspection_method:
- Rendered all uploaded PDFs to PNG using PDF render workflow.
- Extracted page text with PDF text extraction.
- Parsed digit-card answers and recomputed max/min products by exhaustive search.
- Parsed near-hundred answers and recomputed n × 99 / n × 101 from the decomposition.
- Visually inspected mixed answer-key pages around the page boundary.

correctness_findings:
- Digit-card single-KP PDF: 24 questions, 24 answer items, answer_errors = 0.
- Near-hundred single-KP PDF: 24 questions, 24 answer items, answer_errors = 0.
- Mixed all-9 PDF: 150 questions, parsed digit-card answer items = 16, parsed near-hundred answer items = 16, recomputed reasoning answer errors = 0.
- Numeric answer spot/parsing checks did not identify arithmetic errors in the uploaded mixed PDF.

accepted_findings:
- Digit-card prompt wording correctly uses: 從六張數字卡中選出五張各用一次.
- Digit-card max/min search respects no-leading-zero cases.
- Near-hundred strategy correctly uses 99 as n × 100 - n and 101 as n × 100 + n.
- Mixed all-9 question side contains 150 numbered questions.
- Mixed all-9 output interleaves numeric and reasoning patterns.

blocking_pdf_layout_finding:
- The mixed all-9 PDF answer key has answer-card page split around items 43-45.
- Page 14 shows answer-key item cards 43-45 starting at the bottom with prompts only.
- Page 15 contains only detached answer fragments: 336, 0, 70830.
- This is a renderer/layout blocker because answer-key cards are split across pages and page 15 has orphaned answers without item numbers or prompts.
- Page 20 is a blank page artifact and remains non-blocking by itself, but page 15 orphan fragments are blocking.

root_cause:
- G4A-U02 reasoning text cards were not included in the worksheet layout profile system.
- The mixed answer key attempted to keep 15 answer cards per page under the user-selected 3 × 5 layout.
- Mixed reasoning + answer text made the effective answer-key card height larger than the printable page capacity.
- Existing avoid-split logic only covered G3A-U02 long text and G4A-U01 tall text, not G4A-U02 reasoning cards.

fix_applied:
- Updated site/modules/curriculum/batch-a/batch-a-browser-worksheet.js.
- Added G4A_U02_SOURCE_ID.
- Added G4A_U02_TALL_TEXT_LAYOUT_PROFILES for:
  - ps_g4a_u02_digit_card_arrangement_product_max_min
  - ps_g4a_u02_near_hundred_multiplication_strategy
- Added G4A_U02_TALL_TEXT_ANSWER_KEY_LAYOUT_PROFILES with answer-key rowsPerPage capped at 4 for 3-column layouts.
- Added G4A-U02 reasoning cards to avoidPageBreakInside layout hints.
- Added shared resolveTallTextProfile helper.

new_test_coverage:
- Updated tests/curriculum/batch-a/g4a-u02-numeric.test.js.
- Added test: G4A-U02 all-KP mixed worksheet uses safe reasoning answer-key layout.
- Test asserts:
  - answerKeyColumns <= 3
  - answerKeyRowsPerPage <= 4
  - pageBreakMode = avoidLongTextCards

not_closed:
- G4A-U02 unit closeout is not allowed yet because the uploaded mixed PDF has a blocking answer-key layout split and regenerated PDFs are required after the fix.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_result:
- Test count should increase from 464 to 465 because one layout regression test was added.
- pass should be 465, fail should be 0.

expected_pdf_regeneration_after_test_pass:
- Regenerate:
  - g4a_u02_數字卡排列最大最小乘積.pdf
  - g4a_u02_接近整百乘法策略.pdf
  - g4a_u02_同單位知識點混合2_隨機排序.pdf
- Recheck that the mixed answer key has no orphan answer-fragment page like page 15 in the failed upload.

GOAL_DISTANCE_BEFORE = D1_G4A_U02_REASONING_DIGIT_CARD_POOL_FIX_APPLIED_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U02_REASONING_PDF_LAYOUT_FIX_APPLIED_TEST_PENDING
DISTANCE_REDUCED = The reasoning PDF smoke found one blocking mixed answer-key layout defect and the fix was applied with a new regression test; unit closeout remains pending retest and regenerated PDF smoke.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after S53G_R1", "Need regenerated reasoning PDFs and all-9 mixed PDF", "Need confirm mixed answer key no longer has orphan answer fragments", "optional renderer-wide blank-page cleanup backlog"]
NEXT_SHORTEST_STEP = S53G_R2_G4A_U02_RetestedReasoningPDFSmoke
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S53G_R1_FIX_APPLIED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, rerun npm test, then regenerate the two reasoning PDFs and one all-9 mixed PDF.
NEXT_RESUME_TASK = S53G_R2_G4A_U02_RetestedReasoningPDFSmoke
