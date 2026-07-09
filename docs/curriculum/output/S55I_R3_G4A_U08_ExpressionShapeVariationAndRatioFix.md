S55I_R3_G4A_U08_ExpressionShapeVariationAndRatioFix

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
status = FIX_APPLIED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = content_variation_and_ratio_fix_report

preflight:
- S55I PDF smoke found answer correctness and prompt format passed.
- S55I found a single-KP comprehensive large-add/sub overlay ratio blocker: 14/30 = 46.7%.
- Operator additionally identified a content-variation blocker: operation positions were too fixed and too monotonous.
- Operator approved S55I_R3 implementation.

scope_lock:
- Preserve the 4 visible G4A-U08 KnowledgePoints.
- Preserve horizontal expression prompt format: expression = ______.
- Preserve exact division only.
- Preserve nonnegative integer final/intermediate results.
- Preserve small multiplication/division constraints.
- Do not add worked steps to the answer key.
- Do not introduce decimals, fractions, negative answers, or algebraic transposition.

files_modified:
- site/modules/curriculum/batch-a/g4a-u08-expression-generator.js
- tests/curriculum/batch-a/g4a-u08-order-of-operations.test.js

fix_1_expression_shape_variation:
- Added shapeVariant metadata to generated G4A-U08 questions.
- Replaced fixed shells with multiple deterministic templates per expression family.
- Parentheses-first now has varied bracket positions and shapes, including leading, middle, and mixed factor forms.
- Multiplication/division-before-add/sub now varies the operator position instead of always using a + b × c - d or a + b ÷ c - d.
- Same-level left-to-right now includes more add/sub and mul/div chains, including a + b - c and a ÷ b ÷ c.
- Comprehensive expressions now include no-parentheses mixed forms, with-parentheses mixed forms, and large-add/sub overlays with varied operator positions.

fix_2_overlay_ratio:
- Replaced simple even allocation with G4A-U08 overlay-aware allocation.
- When selected PatternSpecs contain both normal and large-add/sub overlay specs, allocation targets 20% overlay.
- For source-unit mixed mode this preserves the expected 20% overlay rate.
- For single-KP 四則與括號綜合計算 with 30 questions, expected allocation becomes:
  - normal comprehensive = 24 questions
  - large add/sub overlay = 6 questions
  - overlay rate = 20%

new_regression_tests:
- G4A-U08 single-KP generation uses varied expression shapes.
- G4A-U08 comprehensive single-KP overlay rate stays near 20%, exactly 6/30 in the deterministic smoke test.

existing_test_coverage_preserved:
- G4A-U08 exposes four visible KPs.
- Source-unit generation produces ten PatternSpecs.
- Expressions recompute by standard precedence.
- Prompt format remains horizontal and label-free.
- Same-level left-to-right examples differ from common wrong grouping.
- Validator rejects corrupted answer and trace.
- Number-control constraints hold.
- Source-unit overlay rate remains 20%.
- Same-unit mixed worksheet builds an answer key.
- Duplicate rate remains bounded.
- shuffleAcrossPatterns changes render order.

not_claimed:
- npm test has not been run after S55I_R3.
- PDFs have not been regenerated after S55I_R3.
- PDF smoke after S55I_R3 has not been performed.
- Formal closeout is not claimed.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_test_result:
- Previous expected test count after S55G_R1 = 487.
- S55I_R3 adds 2 tests.
- Expected tests after pull = 489.
- Expected pass = 489.
- Expected fail = 0.

expected_pdf_regeneration_after_test_pass:
- g4a_u08_括號優先計算.pdf
- g4a_u08_乘除先於加減.pdf
- g4a_u08_同級運算由左至右.pdf
- g4a_u08_四則與括號綜合計算.pdf
- g4a_u08_同單位知識點混合_隨機排序.pdf

expected_pdf_smoke_after_fix:
- answer recomputation errors = 0.
- prompt label leaks = 0.
- exact duplicate prompts = 0 or bounded.
- each single-KP PDF shows visibly varied operator positions.
- 四則與括號綜合計算 single-KP overlay rate is near 20% and no longer near 50%.
- mixed PDF overlay rate remains near 20%.
- mixed PDF shows all 4 visible KP families and all 10 PatternSpecs if enough questions are generated.
- no card split / answer-only orphan fragment.

GOAL_DISTANCE_BEFORE = D1_G4A_U08_EXPRESSION_SHAPE_VARIATION_GAP_CONFIRMED
GOAL_DISTANCE_AFTER = D1_G4A_U08_VARIATION_AND_RATIO_FIX_APPLIED_TEST_PENDING
DISTANCE_REDUCED = Implemented expression-shape variation and overlay-aware allocation, addressing both the monotony blocker and the single-KP comprehensive overlay-ratio blocker.
REMAINING_BLOCKERS = ["Need npm test readback after S55I_R3", "Need regenerated G4A-U08 PDFs after S55I_R3", "Need PDF smoke to confirm expression variety and overlay ratio", "Need final closeout marker after PDF smoke pass"]
NEXT_SHORTEST_STEP = S55I_R4_G4A_U08_NpmRetestAndRegeneratedPDFSmoke
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S55I_R3_FIX_APPLIED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, run npm test, then regenerate the five G4A-U08 PDFs if tests pass.
NEXT_RESUME_TASK = S55I_R4_G4A_U08_NpmRetestAndRegeneratedPDFSmoke
