S52E_G4A_U01_DigitArrangementKnowledgePointImplementation

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = IMPLEMENTED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = missing_knowledge_point_implementation_plus_pdf_smoke_report

operator_request:
- If the mixed PDF is structurally fine, add the missing arrangement KnowledgePoint.
- Missing KnowledgePoint: use specified digits once to form the maximum and minimum five-digit number.
- Include both pure numeric prompts and short word-problem prompts.
- Word-problem wording should be shorter than the provided source examples.

uploaded_mixed_pdf_smoke:
- file = g4a_u01_同單位知識點混合_隨機.pdf
- pages = 42
- question_pages = 1-17
- answer_key_pages = 19-41
- blank_pages = 18, 42
- question_count = 200
- answer_key_count = 200
- finding = PASS_STRUCTURAL_SMOKE_WITH_KNOWN_TRAILING_BLANK_PAGE
- shuffle finding = PASS_VISUAL_INTERLEAVE_SMOKE; early pages show mixed PatternSpecs rather than grouped-only output.
- missing content finding = arrangement max-min digit construction was not present before this task.

new_pattern_spec:
- patternSpecId = ps_g4a_u01_digit_arrangement_max_min
- kind = g4aU01DigitArrangementMaxMin
- title = 指定數字排列最大最小
- canonicalSkillId = place_value_reasoning
- skillTags = [place_value_reasoning, digit_arrangement, max_min, no_leading_zero]
- answerModel = max_min_pair { maxNumber, minNumber }

new_selector_projection:
- knowledgePointId = kp_g4a_u01_digit_arrangement_max_min
- patternGroupId = pg_g4a_u01_digit_arrangement_max_min
- displayName = 指定數字排列最大最小
- G4A-U01 visible KnowledgePoints = 18
- Batch A global visible KnowledgePoints = 59

implemented_prompt_shapes:
1. numeric:
   - 用 1、3、6、7、9 這五個數字各一次，組成五位數。最大的數是多少？最小的數是多少？
   - If 0 appears, add: （萬位數字不能為 0）
2. short word problem:
   - 光纖長度用 1、3、6、7、9 各一次組成五位數cm。最大幾公分？最小幾公分？
   - 芒果箱號用 0、2、4、5、8 各一次組成五位數g。最大幾公克？最小幾公克？萬位不能為0。
   - 滴灌量用 1、4、5、7、8 各一次組成五位數ml。最大幾毫升？最小幾毫升？
   - 成分重量用 0、3、4、6、9 各一次組成五位數mg。最大幾毫克？最小幾毫克？萬位不能為0。
   - 機台間距用 2、3、5、6、7 各一次組成五位數mm。最大幾毫米？最小幾毫米？

implementation_summary:
- Added source PatternSpec definition.
- Added selector KnowledgePoint row.
- Extended G4A runtime wrapper to generate digit-arrangement questions.
- Added numeric and short word-problem modes.
- Added no-leading-zero min-number construction.
- Added extended validator wrapper for g4aU01DigitArrangementMaxMin.
- Updated worksheet validation to use the extended validator.
- Updated G4A and selector tests for 18/59 visible counts.

files_modified_or_created:
- site/modules/curriculum/batch-a/source-pattern-index.js
- site/modules/curriculum/registry/batch-a-selector-g4a-extension.js
- site/modules/curriculum/batch-a/g4a-u01-phase3-runtime-fix-generator.js
- site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-extension.js
- site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
- tests/curriculum/batch-a/g4a-u01-phase1.test.js
- tests/curriculum/batch-a/g4a-u01-kp-selector-projection.test.js
- tests/site/selector-state.test.js
- tests/curriculum/batch-a/g3a-u01-kp-expansion.test.js
- tests/curriculum/batch-a/g3a-u02-missing-digit.test.js
- tests/curriculum/batch-a/g3a-u02-rounding-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u02-word-problem-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u03-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u03-supplementary-kp.test.js
- tests/curriculum/batch-a/g3b-u01-kp-expansion.test.js

test_coverage_added_or_updated:
- Source-unit generation now expects 18 G4A-U01 PatternSpecs.
- Validator coverage includes arrangement questions.
- Selector projection expects 18 G4A-U01 visible KnowledgePoints and 59 Batch A global visible KnowledgePoints.
- Single-KP arrangement selector generates only ps_g4a_u01_digit_arrangement_max_min.
- Same-unit mix includes the new arrangement PatternSpec.
- Arrangement tests assert both numeric and wordProblem modes, correct maxNumber, correct minNumber, and no leading-zero minimum.

not_claimed:
- npm test has not been run in this environment.
- Regenerated PDF containing the new arrangement KnowledgePoint has not yet been inspected.
- Existing blank pages 18 and 42 in the uploaded 200-question mixed PDF are recorded as known non-blocking pagination artifacts unless targeted later.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_manual_ui_check_after_pull:
- 4A-U01 本單元可選知識點 should become 18.
- New visible KP: 指定數字排列最大最小.
- Single-KP generation should produce pure numeric and short word-problem arrangement prompts.
- Same-unit mixed generation should include ps_g4a_u01_digit_arrangement_max_min.
- Shuffle mode should continue to interleave PatternSpecs.

GOAL_DISTANCE_BEFORE = D1_G4A_U01_PHASE3_RUNTIME_FIX_IMPLEMENTED_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U01_ARRANGEMENT_KP_IMPLEMENTED_TEST_PENDING
DISTANCE_REDUCED = G4A-U01 missing source-derived arrangement KnowledgePoint moved from absent to PatternSpec + selector + generator + validator + tests implemented.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after S52E", "Need regenerated PDF smoke containing arrangement KP", "optional renderer-wide blank-page cleanup backlog"]
NEXT_SHORTEST_STEP = S52F_G4A_U01_ArrangementKPNpmTestReadback
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S52E_IMPLEMENTED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main and run npm test; then confirm UI shows 18 G4A-U01 KnowledgePoints and regenerate a PDF including 指定數字排列最大最小.
NEXT_RESUME_TASK = S52F_G4A_U01_ArrangementKPNpmTestReadback
