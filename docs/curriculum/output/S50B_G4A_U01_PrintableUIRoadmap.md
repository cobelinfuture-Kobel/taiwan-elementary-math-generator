S50B_G4A_U01_PrintableUIRoadmap

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = PRINTABLE_UI_ROADMAP_COMPLETED
write_type = roadmap_and_task_order_only
terminal_goal = UI user can select g4a_u01_4a01, generate mixed questions, include answer key, and print/export PDF

scope_lock:
- Plan the shortest implementation sequence from current G4A-U01 state to UI-printable worksheet output.
- Use S50A source image scan and current Batch A browser architecture as planning inputs.
- Do not modify generator, validator, renderer, UI, or worksheet output in this task.
- Do not start G4A-U02/G4A-U04/G4A-U08.
- Do not broaden to cross-unit fusion yet.

current_state:
- Batch A includes g4a_u01_4a01 as 4A-U01 1億以內的數.
- S43E8 already recorded 17 broad G4A-U01 KnowledgePoints.
- Existing runtime PatternSpecs currently include:
  - ps_g4a_u01_compare_8digit
  - ps_g4a_u01_within_100million_compare
  - ps_g4a_u01_large_number_add_sub
- Current source-unit plan uses getBatchAPatternSpecIdsForSource(sourceId), so every materialized source-pattern definition for g4a_u01_4a01 is part of the source-unit generation pool unless specifically routed/filtered.
- Current generic Batch A browser generator can already handle comparison and expression patterns, but not all image-observed G4A-U01 answer models.
- S50A refined the image evidence into 17 fine-grained KnowledgePoint / PatternSpec candidates.

implementation_strategy:
- Do not attempt all 17 fine-grained candidates in the first printable milestone.
- First printable milestone should cover a stable representative subset from the three visible image task groups:
  - 題型4 八位數比大小 / comparison core
  - 題型1 八位數分解組合 / place-value core
  - 題型3 大數的加減 / large-number add-sub core
- Defer high-complexity reading/writing, Chinese-number parsing, and word-problem variants until the core worksheet can generate and print cleanly.

phase_1_minimum_printable_scope:
- Include 6 PatternSpecs:
  - ps_g4a_u01_compare_8digit
  - ps_g4a_u01_within_100million_compare
  - ps_g4a_u01_large_number_add_sub
  - ps_g4a_u01_8digit_place_value_decomposition
  - ps_g4a_u01_place_value_composition_to_number
  - ps_g4a_u01_same_digit_place_value_difference
- Rationale:
  - First three already match current comparison/expression architecture or are existing runtime definitions.
  - Last three implement the most important 題型1 place-value core without requiring Chinese-number parsing.
  - This gives UI output across compare, place-value, and add/sub before expanding to missing digit and reading/writing variants.

phase_2_extension_scope:
- Add 5 PatternSpecs after phase 1 passes print QA:
  - ps_g4a_u01_nonstandard_place_value_composition
  - ps_g4a_u01_place_value_card_unit_model_composition
  - ps_g4a_u01_compare_first_different_place
  - ps_g4a_u01_missing_digit_comparison_possible_digits
  - ps_g4a_u01_missing_digit_comparison_extreme_digit
- Rationale:
  - These capture the more reasoning-heavy parts of 題型1 and 題型4.
  - They require new answer models but not full Chinese-number parser support.

phase_3_extension_scope:
- Add 6 PatternSpecs after phase 2 passes print QA:
  - ps_g4a_u01_numeric_vs_chinese_number_compare
  - ps_g4a_u01_large_number_reading_writing_conversion
  - ps_g4a_u01_wan_mixed_notation_subtraction
  - ps_g4a_u01_comparison_word_problem_total
  - ps_g4a_u01_large_number_unit_word_problem_add_subtract
  - ps_g4a_u01_boundary_number_difference
- Rationale:
  - These require Chinese-number parsing/formatting, contextual units, or multi-step word-problem semantics.
  - They should not block first UI-printable release of G4A-U01.

ordered_tasks_until_ui_printable:

S50C_G4A_U01_Phase1PatternSpecContract
- write_type = FormalMapping / PatternSpec contract document
- output:
  - freeze Phase 1 six PatternSpecs
  - define answerModel for each pattern
  - define generator contract and validator contract
  - define duplicate policy and range policy
- acceptance:
  - every Phase 1 PatternSpec has source_task_group, answer_model, validation rule, and expected output shape
- distance_target = D2 stable PatternSpec contract

S50D_G4A_U01_Phase1GeneratorValidatorImplementation
- write_type = code implementation
- output:
  - implement missing place-value generators for decomposition, composition, same-digit value difference
  - extend or route G4A-U01 source-unit generation so Phase 1 specs can generate
  - extend validator support for G4A-U01 text/place-value question shapes
- likely_files:
  - site/modules/curriculum/batch-a/source-pattern-index.js or source-pattern-submiddle-extension.js
  - site/modules/curriculum/batch-a/batch-a-browser-generator.js or a dedicated g4a-u01 generator module
  - site/modules/curriculum/batch-a/batch-a-browser-validator.js
  - tests/curriculum/batch-a/*
- acceptance:
  - npm test passes
  - programmatic generation of g4a_u01_4a01 with 30/100 questions succeeds
  - no answer errors in deterministic audit
- distance_target = D1 generator/validator usable

S50E_G4A_U01_Phase1LocalGenerationQA
- write_type = QA report
- output:
  - run unit tests and local generation smoke
  - check distribution across six Phase 1 patterns
  - check answer models and duplicate question strings
  - check range boundaries: 0 to 99,999,999 where applicable; 10,000,000 to 99,999,999 for eight-digit compare/decomposition
- acceptance:
  - tests pass
  - generation returns ok=true
  - answer audit passes
  - duplicate policy satisfied or accepted explicitly
- distance_target = D1 local QA pass

S50F_G4A_U01_UIProjectionAndSelectorReadiness
- write_type = UI/source projection update or readiness report
- output:
  - confirm g4a_u01_4a01 appears in UI source-unit selector
  - confirm selected sourceId resolves Phase 1 PatternSpecs
  - confirm user controls questionCount, ordering, seed, includeAnswerKey apply to G4A-U01
- acceptance:
  - browser route can select g4a_u01_4a01
  - generate button does not produce validator errors for 30/100 question smoke
- distance_target = D1 UI-generate ready

S50G_G4A_U01_BrowserPDFPrintSmoke
- write_type = browser/PDF smoke report
- output:
  - operator/browser generates PDF with g4a_u01_4a01
  - inspect PDF page count, question count, answer-key count, blank pages, clipping, duplicates, answer correctness
- recommended smoke sizes:
  - 30 questions first
  - 100 questions next
  - 150 or 200 questions only after 100 passes
- acceptance:
  - UI user can print/export PDF
  - answer key visible when included
  - no answer errors
  - no layout clipping
  - blank pages may be accepted as known non-blocking only if operator explicitly accepts them
- distance_target = D0 for Phase 1 printable G4A-U01

S50H_G4A_U01_UnitCloseoutOrPhase2Decision
- write_type = closeout marker or phase-extension decision
- output options:
  - close G4A-U01 Phase 1 as UI-printable if output QA passes and operator accepts limited scope
  - or proceed to Phase 2 before unit closeout if operator requires fuller coverage from source images
- acceptance:
  - PASS_ACCEPTED_AND_CLOSED marker if Phase 1 printable is accepted
  - otherwise NEXT_SHORT_STEP = S51A_G4A_U01_Phase2PatternSpecContract

phase_2_after_phase_1_printable:
S51A_G4A_U01_Phase2PatternSpecContract
S51B_G4A_U01_Phase2GeneratorValidatorImplementation
S51C_G4A_U01_Phase2BrowserPDFSmoke
S51D_G4A_U01_Phase2CloseoutOrPhase3Decision

phase_3_after_phase_2_printable:
S52A_G4A_U01_ChineseNumberAndWordProblemContract
S52B_G4A_U01_ChineseParserFormatterAndWordProblemImplementation
S52C_G4A_U01_FullSourceImageCoverageBrowserPDFSmoke
S52D_G4A_U01_FullUnitCloseout

ui_printable_definition:
- User can select sourceId g4a_u01_4a01 in the Batch A UI.
- User can set questionCount, ordering, generationSeed, and includeAnswerKey.
- User can click generate and receive non-empty worksheet questions.
- Validator panel has no blocking errors.
- Print button is enabled.
- Exported/printed PDF has visible questions and visible answer key if included.
- Answer audit passes for the generated sample.
- Known blank-page pagination can be accepted as non-blocking by operator, but clipping and answer errors are blockers.

shortest_path_decision:
- The shortest path to UI-printable is Phase 1 only, not all 17 image-derived candidates.
- Phase 1 gives representative G4A-U01 output across compare, place-value, and add/sub.
- Phase 2 and Phase 3 should be queued after first printable success, not bundled into the first implementation task.

risk_register:
- Risk 1: Chinese-number parsing/formatting could expand scope; keep it Phase 3.
- Risk 2: place-value answer models are text-like and may need dedicated renderer formatting; contain in Phase 1 with simple numeric/decomposition display.
- Risk 3: existing expression generator may produce duplicate or negative subtraction results unless range/answer policies are tightened.
- Risk 4: source-unit auto-inclusion can expose any newly materialized pattern; add tests to ensure new definitions are intended for G4A-U01 source-unit output.
- Risk 5: PDF blank pages are a known deferred issue; do not block Phase 1 unless clipping or missing answer key occurs.

operator_decisions_needed_later:
- Whether Phase 1 printable is enough to close G4A-U01 temporarily, or whether Phase 2/3 must be completed before unit closeout.
- Whether limited duplicate exact question strings in large worksheets are acceptable for G4A-U01, similar to G3B-U01.
- Whether blank-page pagination remains accepted non-blocking for G4A-U01.

anti_scope_check:
- No code modified.
- No generator/validator/renderer changed.
- No worksheet output generated.
- No G4A-U02/G4A-U04/G4A-U08 work performed.
- No cross-unit fusion work performed.

GOAL_DISTANCE_BEFORE = D2_G4A_U01_SOURCE_IMAGE_PATTERN_SCAN_COMPLETE
GOAL_DISTANCE_AFTER = D2_G4A_U01_PRINTABLE_UI_ROADMAP_COMPLETE
DISTANCE_REDUCED = G4A-U01 now has an ordered implementation path from PatternSpec contract to generator/validator, UI selection, browser PDF smoke, and closeout decision.
REMAINING_BLOCKERS = ["Phase 1 PatternSpec contract not yet written", "Phase 1 generator/validator not implemented", "G4A-U01 UI browser generation not smoke-tested", "G4A-U01 PDF print smoke not completed", "Need clearer original source/PDF for exact item-level evidence", "browser/PDF smoke later", "optional renderer-wide blank-page cleanup backlog"]
NEXT_SHORTEST_STEP = S50C_G4A_U01_Phase1PatternSpecContract
