S50G_R1_G4A_U01_Phase1SingleKPPDFSmokeReview

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = PDF_SMOKE_COMPLETED_WITH_LAYOUT_BLOCKERS
write_type = uploaded_pdf_smoke_review

operator_input:
- g4a_u01_1億以內數比大小.pdf
- g4a_u01_八位數比大小.pdf
- g4a_u01_相同數字不同位值差.pdf
- g4a_u01_八位數位值組合.pdf
- g4a_u01_八位數位值分解.pdf
- g4a_u01_大數加減.pdf

scope_lock:
- Inspect S50 Phase 1 single-KnowledgePoint PDFs.
- Check question count, range/shape constraints, duplicates, blank pages, page splitting, and layout smoke.
- Do not modify code in this task.
- Do not inspect Phase 2/Phase 3 patterns.

summary:
- Six Phase 1 PDFs were inspected.
- All six contain 40 question numbers with no missing item numbers.
- Deterministic content constraints are structurally valid for all six PDFs.
- No duplicate prompt keys were detected in the parsed question sets.
- No answer key pages were present in the uploaded PDFs, so answer-key smoke remains unverified.
- Layout blockers were found in the tall prompt patterns.

pdf_results:

1. ps_g4a_u01_within_100million_compare / 1億以內數比大小
- pages = 2
- blank_pages_detected = 1
- question_items = 40
- range_errors = 0
- duplicate_prompts = 0
- result = PASS_WITH_BLANK_PAGE_WARNING

2. ps_g4a_u01_compare_8digit / 八位數比大小
- pages = 2
- blank_pages_detected = 1
- question_items = 40
- range_errors = 0
- duplicate_prompts = 0
- result = PASS_WITH_BLANK_PAGE_WARNING

3. ps_g4a_u01_large_number_add_sub / 大數加減
- pages = 2
- blank_pages_detected = 1
- question_items = 40
- operator_distribution = 20 addition / 20 subtraction
- arithmetic_range_errors = 0
- duplicate_prompts = 0
- result = PASS_WITH_BLANK_PAGE_WARNING

4. ps_g4a_u01_same_digit_place_value_difference / 相同數字不同位值差
- pages = 2
- question_items = 40
- prompt_parse_count = 40
- repeated_digit_occurrence_errors = 0
- duplicate_prompts = 0
- layout_issue = page break splits items 33-36: page 1 shows item numbers 33-36 near the bottom while page 2 starts with their prompt text without item numbers.
- result = FAIL_LAYOUT_PAGE_SPLIT

5. ps_g4a_u01_place_value_composition_to_number / 八位數位值組合
- pages = 2
- question_items = 40
- phrase_count 合起來是 = 40
- parsed_full_items = 37 because page-split fragments prevent clean full-item parse for some split cards
- range_errors = 0 for parsed items
- duplicate_values = 0
- layout_issue = page break splits items 21-24: page 1 shows item numbers only at bottom and page 2 starts with their body text without item numbers.
- result = FAIL_LAYOUT_PAGE_SPLIT

6. ps_g4a_u01_8digit_place_value_decomposition / 八位數位值分解
- pages = 3
- question_items = 40
- value_count = 40
- range_errors = 0
- duplicate_values = 0
- layout_issue = multiple cards are split across pages; page 3 contains only dangling prompt fragments such as ___個十、___個一.
- result = FAIL_LAYOUT_PAGE_SPLIT

blocking_findings:
- Same-digit place-value-difference, place-value-composition, and place-value-decomposition PDFs are not print-clean because cards can split across page boundaries.
- Decomposition is the most severe: it creates a third page containing only dangling card fragments.
- The three shorter patterns are usable for question-side smoke but contain an initial blank page; this remains a known browser/PDF pagination warning.
- Uploaded PDFs did not include answer keys; answer-key print smoke still needs a separate run.

recommended_fix_path:
- S50G_R2_G4A_U01_PrintLayoutCardBreakFix
  - Prevent worksheet question cards from splitting across printed pages.
  - Add or enforce break-inside: avoid / page-break-inside: avoid for question cards.
  - If needed, reduce card height / font size / rows-per-page for long text patterns.
  - Add print-layout smoke tests for tall G4A-U01 prompt models.
- After fix, regenerate the three failed PDFs and one answer-key-enabled mixed PDF.

anti_scope_check:
- No code modified by this report.
- No Phase 2/Phase 3 G4A-U01 features added.
- No G4A-U02/G4A-U04/G4A-U08 work performed.

GOAL_DISTANCE_BEFORE = D1_G4A_U01_KP_SELECTOR_AND_PUBLIC_MAIN_TEST_PASS
GOAL_DISTANCE_AFTER = D1_G4A_U01_PHASE1_PDF_SMOKE_BLOCKED_BY_CARD_PAGE_SPLIT
DISTANCE_REDUCED = Phase 1 single-KP PDF smoke isolated the remaining print blocker to card page-splitting in tall G4A-U01 prompt patterns; content constraints themselves pass.
REMAINING_BLOCKERS = ["G4A-U01 tall prompt cards split across PDF pages", "G4A-U01 answer-key PDF smoke not completed", "initial blank page persists in shorter PDFs", "Phase 2/Phase 3 fine-grained source-image patterns deferred"]
NEXT_SHORTEST_STEP = S50G_R2_G4A_U01_PrintLayoutCardBreakFix
