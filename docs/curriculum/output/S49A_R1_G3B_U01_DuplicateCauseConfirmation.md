S49A_R1_G3B_U01_DuplicateCauseConfirmation

sourceId = g3b_u01_3b01
unit = 3B-U01 除法
status = ROOT_CAUSE_CONFIRMED_DUPLICATE_COLLISION_NON_FATAL
write_type = root_cause_confirmation_report_only

operator_question:
- The duplicate issue looks like it may be caused by an insufficient item pool; if so, can it be left unfixed?

confirmation_result:
- The observed PDF duplicates are not answer errors.
- The observed PDF duplicates are not range errors.
- The observed PDF duplicates are not division constraint errors.
- The observed duplicates are exact-division expression collisions in a 200-question mixed worksheet.
- This can be treated as non-fatal / non-blocking only if the operator accepts exact-expression duplicates in large mixed worksheets.

root_cause_detail:
- G3B-U01 has two relevant generation paths.
- The lite G3B-U01 calculation generator has an explicit unique-pool model and capacity error message.
- However, the mixed calculation + word-problem browser path routes calculation entries through g3a-u06-division-ordering-generator.js.
- That mixed path generates each calculation allocation entry separately, then appends the resulting questions into the mixed output.
- Duplicate protection exists inside the per-entry planned division generator call, but the mixed path does not perform a final global duplicate-key suppression across all calculation entries after merging.
- Therefore the duplicate strings are better classified as cross-entry exact-expression collisions / limited exact-expression diversity under the current mixed allocation, not a semantic math failure.

supporting_code_facts:
- g3b-u01-division-generator.js re-exports g3b-u01-division-generator-lite.js.
- g3b-u01-division-generator-lite.js defines finite pools per PatternSpec and reports batch_a_g3b_u01_unique_pool_exhausted when generated unique count is below requested count.
- g3a-u06-division-ordering-generator.js identifies G3B-U01 mixed calculation + word-problem plans and calls generateCalculationEntryQuestions for calculation entries.
- generateCalculationEntryQuestions calls generateBaseG3AU06DivisionQuestions once per calculation allocation entry.
- generatePlannedDivisionQuestions has a local seen set inside each call.
- The mixed path appends each result.questions array into the global questions array without a final global duplicate-key pass.

current_pdf_evidence_from_S49A:
- question_item_count = 200
- answer_key_item_count = 200
- deterministic_answer_checks = 200 / 200 PASS
- answer_errors = 0
- remainder_expression_constraint_errors = 0
- division_by_zero_errors = 0
- non_integer_exact_division_expression_errors = 0
- normalized_duplicate_question_groups = 8

classification:
- severity = LOW_TO_MEDIUM
- closeout_blocker_if_strict_no_duplicate_policy = true
- acceptable_non_blocking_if_large_mixed_pdf_allows_limited_exact_expression_reuse = true

recommendation:
- If the project policy for 200-question mixed worksheets allows limited duplicate exact-expression strings, do not spend a FullFix here; record as accepted non-blocking and close G3B-U01.
- If the project policy requires zero normalized duplicate question strings, run S49B_G3B_U01_DuplicateExactDivisionOutputQualityFullFix.

anti_scope_check:
- No generator/validator/renderer code modified.
- No PDF regenerated.
- No G4A work performed.
- No unit closeout performed by this confirmation report.

GOAL_DISTANCE_BEFORE = D1_G3B_U01_PDF_REVIEW_COMPLETE_WITH_DUPLICATE_BLOCKER
GOAL_DISTANCE_AFTER = D1_G3B_U01_DUPLICATE_CAUSE_CONFIRMED_AWAITING_ACCEPT_OR_FIX_DECISION
DISTANCE_REDUCED = Duplicate issue is confirmed as cross-entry exact-expression collision / limited exact-expression diversity, not answer or scope failure.
REMAINING_BLOCKERS = ["operator must accept duplicate exact-expression strings as non-blocking or request S49B fix", "G3B-U01 blank PDF pages 15 and 30 accepted/deferred only if operator agrees", "G4A units still need output QA", "browser/PDF smoke later", "optional renderer-wide blank-page cleanup backlog"]
NEXT_SHORTEST_STEP = OPERATOR_DECISION_ACCEPT_G3B_U01_DUPLICATES_OR_RUN_S49B
