S50G_R2_G4A_U01_PrintLayoutCardBreakFix

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = FIX_APPLIED_STATIC_READBACK_PASS_TEST_AND_PDF_READBACK_REQUIRED
write_type = print_layout_fix_readback

scope_lock:
- Fix only S50G_R1 PDF smoke blocker: G4A-U01 tall prompt cards splitting across printed pages.
- Do not change G4A-U01 generator math logic.
- Do not implement Phase 2/Phase 3 source-image patterns.
- Do not modify G4A-U02/G4A-U04/G4A-U08.

root_cause:
- The PDF smoke showed that CSS break-inside alone was insufficient for tall G4A-U01 prompt cards when the logical page contained too many grid rows.
- The default Batch A browser print layout allowed 4 columns x 10 rows = 40 cells per logical page.
- For tall prompt cards, browser pagination could split individual cards across PDF pages.

fix_applied:
- site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
  - Added G4A-U01 tall-text print layout profiles:
    - ps_g4a_u01_same_digit_place_value_difference -> 4 columns x 8 rows = 32 cards/page.
    - ps_g4a_u01_place_value_composition_to_number -> 4 columns x 5 rows = 20 cards/page.
    - ps_g4a_u01_8digit_place_value_decomposition -> 4 columns x 4 rows = 16 cards/page.
  - Added source/pattern detection for G4A-U01 tall text questions.
  - Normalizes printLayout by lowering rowsPerPage when these patterns are present.
  - Keeps pageBreakMode = avoidLongTextCards through longTextCardPolicy.
  - Marks displayModel.layoutHints.avoidPageBreakInside = true for G4A-U01 tall prompt cards.

files_modified:
- site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
- tests/curriculum/batch-a/g4a-u01-phase1.test.js

test_coverage_added:
- same-digit tall prompt: 40 questions -> rowsPerPage 8 -> question page counts [32, 8].
- composition tall prompt: 40 questions -> rowsPerPage 5 -> question page counts [20, 20].
- decomposition tall prompt: 40 questions -> rowsPerPage 4 -> question page counts [16, 16, 8].
- decomposition answer-key pagination is also checked at 3 pages.

commits:
- cfd00d3f9bd03409a780455f3ca163da8a2dae8c test(g4a-u01): use selector plan for tall prompt print layout caps

validation_status:
- GitHub connector static write/read succeeded.
- workflow_runs = [] for commit cfd00d3f9bd03409a780455f3ca163da8a2dae8c at inspection time.
- combined statuses = [] for commit cfd00d3f9bd03409a780455f3ca163da8a2dae8c at inspection time.
- npm test is not claimed as passed until operator or Actions readback confirms.
- PDF print smoke is not claimed as passed until the three previously failed PDFs are regenerated and inspected.

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
- Also regenerate one mixed G4A-U01 Phase 1 PDF with includeAnswerKey = true.

expected_pdf_result_after_fix:
- same-digit place-value difference should paginate as 32 + 8 questions instead of splitting 33-36.
- place-value composition should paginate as 20 + 20 questions instead of splitting 21-24.
- place-value decomposition should paginate as 16 + 16 + 8 questions instead of producing dangling page fragments.
- Answer-key pages should be present when includeAnswerKey = true.

anti_scope_check:
- No G4A-U01 content generator logic changed.
- No validator logic changed.
- No Phase 2/Phase 3 patterns added.
- No G4A-U02/G4A-U04/G4A-U08 work performed.

GOAL_DISTANCE_BEFORE = D1_G4A_U01_PHASE1_PDF_SMOKE_BLOCKED_BY_CARD_PAGE_SPLIT
GOAL_DISTANCE_AFTER = D1_G4A_U01_PRINT_LAYOUT_CARD_BREAK_FIX_APPLIED_AWAITING_TEST_AND_PDF_READBACK
DISTANCE_REDUCED = The page-splitting blocker was addressed by adaptive print-layout row caps for the three tall G4A-U01 Phase 1 prompt patterns.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after cfd00d3", "Need regenerated PDFs for the three previously failed tall patterns", "Need mixed G4A-U01 Phase 1 PDF with answer key", "initial blank page warning still needs recheck", "Phase 2/Phase 3 fine-grained source-image patterns deferred"]
NEXT_SHORTEST_STEP = S50G_R3_G4A_U01_PrintLayoutFixNpmAndPDFReadback
STOP_REASON = awaiting_required_test_and_pdf_readback
BLOCKER_TYPE = TEST_AND_PDF_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S50G_R2_FIX_APPLIED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main at or after cfd00d3, run npm test, then regenerate the three tall-pattern PDFs and one mixed answer-key PDF.
NEXT_RESUME_TASK = S50G_R3_G4A_U01_PrintLayoutFixNpmAndPDFReadback
