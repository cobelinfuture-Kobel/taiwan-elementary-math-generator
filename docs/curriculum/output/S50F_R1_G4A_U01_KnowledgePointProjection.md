S50F_R1_G4A_U01_KnowledgePointProjection

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = IMPLEMENTED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = code_implementation_plus_static_readback_report

scope_lock:
- Expose only S50 Phase 1 G4A-U01 KnowledgePoints in the UI selector.
- Do not add Phase 2/Phase 3 Chinese-number, missing-digit comparison, or word-problem patterns.
- Do not change generator semantics beyond selector projection routing.
- Do not modify renderer or PDF output.
- Do not start G4A-U02/G4A-U04/G4A-U08.

implemented_knowledge_points:
- kp_g4a_u01_compare_8digit -> ps_g4a_u01_compare_8digit
- kp_g4a_u01_within_100million_compare -> ps_g4a_u01_within_100million_compare
- kp_g4a_u01_large_number_add_sub -> ps_g4a_u01_large_number_add_sub
- kp_g4a_u01_8digit_place_value_decomposition -> ps_g4a_u01_8digit_place_value_decomposition
- kp_g4a_u01_place_value_composition_to_number -> ps_g4a_u01_place_value_composition_to_number
- kp_g4a_u01_same_digit_place_value_difference -> ps_g4a_u01_same_digit_place_value_difference

files_created:
- site/modules/curriculum/registry/batch-a-selector-g4a-extension.js
- tests/curriculum/batch-a/g4a-u01-kp-selector-projection.test.js

files_modified:
- site/modules/curriculum/registry/batch-a-selector-extension.js
- site/modules/curriculum/batch-a/visible-pattern-group-resolver.js

implementation_summary:
- Added a G4A-U01 selector projection extension containing six visible Phase 1 KnowledgePoints and PatternGroups.
- Updated selector extension export chain so UI imports see the G4A-U01 projection.
- Updated visible-pattern-group resolver to import the full selector extension chain instead of stopping at the equation extension.
- Added tests for:
  - G4A-U01 visible KnowledgePoint availability = 6
  - single-KnowledgePoint worksheet generation
  - same-unit mixed-KnowledgePoint worksheet generation across all six Phase 1 PatternSpecs

static_readback:
- batch-a-selector-g4a-extension.js readback confirms six G4A-U01 rows and source availability visibleCount = 6.
- batch-a-selector-extension.js readback confirms export now points to batch-a-selector-g4a-extension.js.
- visible-pattern-group-resolver.js readback confirms registry import now uses batch-a-selector-extension.js.
- g4a-u01-kp-selector-projection.test.js readback confirms the intended availability and worksheet generation coverage.

validation_status:
- GitHub connector static write/read succeeded.
- workflow_runs = [] for commit 39dc5ea07766d26c1113179be8dc5d663424872b at inspection time.
- combined statuses = [] for commit 39dc5ea07766d26c1113179be8dc5d663424872b at inspection time.
- npm test is not claimed as passed until operator or Actions readback confirms.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_ui_result_after_pull:
- Left-side KnowledgePoint availability for 4A-U01 should show 本單元可選知識點：6.
- Selection mode should allow 單一知識點加強 and 同單元知識點混合.
- The six visible G4A-U01 Phase 1 KnowledgePoints should appear in the selector.

anti_scope_check:
- No Phase 2/Phase 3 G4A-U01 features added.
- No UI layout or renderer changes.
- No G4A-U02/G4A-U04/G4A-U08 work.
- No PDF/browser smoke artifact created.

GOAL_DISTANCE_BEFORE = D1_G4A_U01_SOURCE_UNIT_GENERATION_VISIBLE_BUT_KP_SELECTOR_EMPTY
GOAL_DISTANCE_AFTER = D1_G4A_U01_KP_SELECTOR_PROJECTION_IMPLEMENTED_AWAITING_TEST_READBACK
DISTANCE_REDUCED = G4A-U01 Phase 1 KnowledgePoint selector projection has been implemented and statically verified; the UI should no longer show zero selectable KnowledgePoints after pull and test pass.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after 39dc5ea", "Need UI screenshot confirming G4A-U01 selector shows 6 KnowledgePoints", "G4A-U01 PDF print smoke not completed", "Phase 2/Phase 3 fine-grained source-image patterns deferred"]
NEXT_SHORTEST_STEP = S50F_R2_G4A_U01_KnowledgePointProjectionTestReadback
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S50F_R1_IMPLEMENTED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main at or after 39dc5ea and run npm test; then refresh UI and confirm G4A-U01 KnowledgePoint selector count.
NEXT_RESUME_TASK = S50F_R2_G4A_U01_KnowledgePointProjectionTestReadback
