S55I_G4A_U08_PDFSmoke_Findings

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
status = PDF_SMOKE_REVIEWED_WITH_ONE_RATIO_BLOCKER
write_type = regenerated_pdf_smoke_findings

uploaded_pdfs_reviewed:
- g4a_u08_括號優先計算.pdf
- g4a_u08_乘除先於加減.pdf
- g4a_u08_同級運算由左至右.pdf
- g4a_u08_四則與括號綜合計算.pdf
- g4a_u08_同單位知識點混合_隨機排序.pdf

pdf_render_review:
- Rendered all uploaded PDFs to PNG via PDF render workflow.
- Single-KP PDFs have 6 pages each:
  - question pages = 1-2
  - blank page before answer key = 3
  - answer-key pages = 4-5
  - trailing blank page = 6
- Mixed PDF has 22 pages:
  - question pages = 1-10
  - blank page before answer key = 11
  - answer-key pages = 12-21
  - trailing blank page = 22
- No card split or answer-only orphan fragment was observed in rendered page review.
- Blank pages remain renderer pagination artifacts and are not treated as unit-content blockers.

content_smoke_summary:
- g4a_u08_括號優先計算.pdf:
  - question_count = 30
  - answer_key_count = 30
  - recomputed_answer_errors = 0
  - exact_duplicate_prompts = 0
  - label_leaks = 0
  - family_counts = { parentheses_add_sub: 15, parentheses_mul_div: 15 }
- g4a_u08_乘除先於加減.pdf:
  - question_count = 30
  - answer_key_count = 30
  - recomputed_answer_errors = 0
  - exact_duplicate_prompts = 0
  - label_leaks = 0
  - family_counts = { mul_before_add_sub: 15, div_before_add_sub: 15 }
- g4a_u08_同級運算由左至右.pdf:
  - question_count = 30
  - answer_key_count = 30
  - recomputed_answer_errors = 0
  - exact_duplicate_prompts = 0
  - label_leaks = 0
  - family_counts = { add_sub_left_to_right: 15, mul_div_left_to_right: 15 }
- g4a_u08_四則與括號綜合計算.pdf:
  - question_count = 30
  - answer_key_count = 30
  - recomputed_answer_errors = 0
  - exact_duplicate_prompts = 0
  - label_leaks = 0
  - large_add_sub_overlay_count = 14
  - large_add_sub_overlay_rate = 46.7%
- g4a_u08_同單位知識點混合_隨機排序.pdf:
  - question_count = 150
  - answer_key_count = 150
  - recomputed_answer_errors = 0
  - exact_duplicate_prompts = 0
  - label_leaks = 0
  - large_add_sub_overlay_count = 30
  - large_add_sub_overlay_rate = 20.0%

number_control_smoke:
- All reviewed expressions have exact division where division appears.
- No negative intermediate/final result was detected.
- No decimal intermediate/final result was detected.
- Final answers remain <= 9999.
- Multiplication/division size remained within the implemented caps in the uploaded PDFs.

pass_findings:
- Student prompts are horizontal expressions with blank answer lines.
- No visible KP/source-case labels leak into prompts.
- All reviewed answer keys recompute correctly.
- Single-KP PDFs for 括號優先計算, 乘除先於加減, and 同級運算由左至右 are content-smoke pass.
- Mixed same-unit PDF is content-smoke pass, including 20% large add/sub overlay rate.

ratio_blocker:
- The single-KP PDF for 四則與括號綜合計算 has 14 large add/sub overlay items out of 30.
- This is 46.7%, which is higher than the operator policy target of about 20% large add/sub overlay.
- Root cause is expected from current allocation: the comprehensive KP owns four PatternSpecs, two normal and two large-overlay, so even allocation makes the overlay rate close to 50% for this single KP.
- This does not affect the mixed source-unit PDF, which is already 20% overlay.
- However, it does affect single-KP practice for 四則與括號綜合計算 and should be fixed before formal closeout if the 20% overlay policy is intended to apply to single-KP worksheets too.

recommended_fix:
- S55I_R1_G4A_U08_ComprehensiveOverlayRatioFix
- Adjust G4A-U08 allocation so selected PatternSpecs containing both normal and large overlay families keep large_add_sub_overlay near 20%.
- Expected after fix for 30-question 四則與括號綜合計算 PDF:
  - normal comprehensive questions ≈ 24
  - large add/sub overlay questions ≈ 6
  - acceptable overlay tolerance = 10%-30%
- Preserve source-unit mixed 150-question output at 20% overlay.

not_claimed:
- npm test pass after S55G_R1 was not provided in the latest operator message.
- Formal closeout is not claimed.
- PDF smoke is not PASS_CLOSEOUT_READY because of the single-KP comprehensive overlay-ratio blocker.

GOAL_DISTANCE_BEFORE = D1_G4A_U08_MULTISPEC_ALLOCATION_FIX_APPLIED_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U08_PDF_SMOKE_REVIEWED_RATIO_FIX_REQUIRED
DISTANCE_REDUCED = Reviewed regenerated PDFs and cleared answer correctness, prompt-format, duplicate, and mixed-ratio concerns; isolated one remaining single-KP overlay-ratio blocker.
REMAINING_BLOCKERS = ["Need npm test readback after S55G_R1/S55I_R1", "Need fix 四則與括號綜合計算 single-KP overlay rate from 46.7% toward 20%", "Need regenerate 四則與括號綜合計算 PDF after fix", "Need final mixed PDF smoke after fix"]
NEXT_SHORTEST_STEP = S55I_R1_G4A_U08_ComprehensiveOverlayRatioFix
STOP_REASON = ratio_policy_fix_required_before_closeout
BLOCKER_TYPE = CONTENT_RATIO_BLOCKER
LAST_COMPLETED_STATUS = S55I_PDF_SMOKE_REVIEWED_WITH_ONE_RATIO_BLOCKER
REQUIRED_OPERATOR_ACTION = Confirm whether the 20% large add/sub overlay policy must also apply to the single-KP 四則與括號綜合計算 worksheet. If yes, run S55I_R1 fix.
NEXT_RESUME_TASK = S55I_R1_G4A_U08_ComprehensiveOverlayRatioFix
