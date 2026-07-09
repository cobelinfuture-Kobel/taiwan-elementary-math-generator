S55I_R5_G4A_U08_RegeneratedPDFSmoke_PASS_NPM_PENDING

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
status = REGENERATED_PDF_SMOKE_PASS_NPM_READBACK_REQUIRED
write_type = regenerated_pdf_smoke_pass_report

uploaded_pdfs_reviewed:
- g4a_u08_括號優先計算.pdf
- g4a_u08_乘除先於加減.pdf
- g4a_u08_同級運算由左至右.pdf
- g4a_u08_四則與括號綜合計算.pdf
- g4a_u08_同單位知識點混合_隨機排序.pdf

pdf_render_review:
- Rendered all uploaded PDFs to PNG via PDF render workflow.
- Single-KP PDFs rendered_page_count = 6 each.
- Single-KP visible content:
  - question pages = 1-2
  - blank page before answer key = 3
  - answer-key pages = 4-5
  - trailing blank page = 6
- Mixed PDF rendered_page_count = 22.
- Mixed PDF visible content:
  - question pages = 1-10
  - blank page before answer key = 11
  - answer-key pages = 12-21
  - trailing blank page = 22
- No card split or answer-only orphan fragment was observed in rendered page review.
- Blank pages remain known renderer pagination artifacts and are not treated as unit-content blockers.

content_smoke_summary:
- g4a_u08_括號優先計算.pdf:
  - question_count = 30
  - answer_key_count = 30
  - recomputed_answer_errors = 0
  - exact_duplicate_prompts = 0
  - label_leaks = 0
  - large_add_sub_overlay_count = 0
  - detected_shape_signatures = 8
- g4a_u08_乘除先於加減.pdf:
  - question_count = 30
  - answer_key_count = 30
  - recomputed_answer_errors = 0
  - exact_duplicate_prompts = 0
  - label_leaks = 0
  - large_add_sub_overlay_count = 0
  - detected_shape_signatures = 8
- g4a_u08_同級運算由左至右.pdf:
  - question_count = 30
  - answer_key_count = 30
  - recomputed_answer_errors = 0
  - exact_duplicate_prompts = 0
  - label_leaks = 0
  - large_add_sub_overlay_count = 0
  - detected_shape_signatures = 6
- g4a_u08_四則與括號綜合計算.pdf:
  - question_count = 30
  - answer_key_count = 30
  - recomputed_answer_errors = 0
  - exact_duplicate_prompts = 0
  - label_leaks = 0
  - large_add_sub_overlay_count = 6
  - large_add_sub_overlay_rate = 20.0%
  - detected_shape_signatures = 15
- g4a_u08_同單位知識點混合_隨機排序.pdf:
  - question_count = 150
  - answer_key_count = 150
  - recomputed_answer_errors = 0
  - exact_duplicate_prompts = 0
  - label_leaks = 0
  - large_add_sub_overlay_count = 30
  - large_add_sub_overlay_rate = 20.0%
  - detected_shape_signatures = 34

number_control_smoke:
- All reviewed expressions have exact division where division appears.
- No negative intermediate/final result was detected.
- No decimal intermediate/final result was detected.
- Final answers remain <= 9999.
- Multiplication/division operation results remained within implemented caps in the uploaded PDFs.

variation_smoke:
- 括號優先計算 no longer uses only the original fixed shells; detected 8 expression-shape signatures.
- 乘除先於加減 no longer fixes multiplication/division in one position; detected 8 expression-shape signatures.
- 同級運算由左至右 includes add/sub and mul/div left-to-right chains; detected 6 expression-shape signatures.
- 四則與括號綜合計算 has broad mixed expression coverage; detected 15 expression-shape signatures.
- Mixed PDF detected 34 expression-shape signatures across 150 questions.

pass_findings:
- Student prompts are horizontal expressions with blank answer lines.
- No visible KP/source-case labels leak into prompts.
- All reviewed answer keys recompute correctly.
- Exact duplicate prompts were not detected.
- The previous single-KP comprehensive overlay-ratio blocker is cleared: 6/30 = 20%.
- Mixed same-unit overlay ratio remains 30/150 = 20%.
- Expression-position monotony is cleared in this PDF smoke.

remaining_blocker:
- npm test pass after S55I_R4 was not provided with the uploaded PDFs.
- Formal unit closeout is therefore not claimed in this marker.

expected_required_npm_readback:
- tests = 489
- pass = 489
- fail = 0

closeout_condition:
- If operator provides the expected npm readback, G4A-U08 can be closed with S55J_G4A_U08_UNIT_CLOSEOUT_PASS.marker.

GOAL_DISTANCE_BEFORE = D1_G4A_U08_MULTIPLICATION_CAP_FIX_APPLIED_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U08_REGENERATED_PDF_SMOKE_PASS_NPM_PENDING
DISTANCE_REDUCED = Regenerated PDF smoke cleared answer correctness, prompt format, duplicate, layout, variation, and overlay-ratio blockers; only npm readback remains before formal closeout.
REMAINING_BLOCKERS = ["Need npm test readback: tests 489, pass 489, fail 0", "Need final closeout marker after npm readback"]
NEXT_SHORTEST_STEP = S55J_G4A_U08_UnitCloseoutAfterNpmReadback
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S55I_R5_REGENERATED_PDF_SMOKE_PASS_NPM_PENDING
REQUIRED_OPERATOR_ACTION = Provide npm test readback after S55I_R4/S55I_R5. Expected: tests 489, pass 489, fail 0.
NEXT_RESUME_TASK = S55J_G4A_U08_UnitCloseoutAfterNpmReadback
