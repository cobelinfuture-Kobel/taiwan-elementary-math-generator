S55G_R1_G4A_U08_MultispecAllocationFix

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
status = FIX_APPLIED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = npm_failure_fix_report

operator_npm_readback_before_fix:
- tests = 487
- pass = 486
- fail = 1
- failing_test = G4A-U08 same-level left-to-right examples differ from common wrong grouping
- failure_detail = assert.ok(divMul) failed because the single-KP allocation did not generate the mul_div_left_to_right PatternSpec.

root_cause:
- visible-pattern-group-resolver.js intentionally expanded all PatternSpecs only for sources listed in MULTISPEC_ALLOCATION_SOURCE_IDS.
- Before the fix, MULTISPEC_ALLOCATION_SOURCE_IDS contained only g3a_u01_3a01.
- G4A-U08 visible KPs are intentionally multi-spec KPs:
  - kp_g4a_u08_parentheses_first has 2 PatternSpecs.
  - kp_g4a_u08_mul_div_before_add_sub has 2 PatternSpecs.
  - kp_g4a_u08_left_to_right_same_level has 2 PatternSpecs.
  - kp_g4a_u08_comprehensive_order_of_operations has 4 PatternSpecs.
- Because g4a_u08_4a08 was not in the multispec expansion allowlist, single-KP and same-unit KP allocation used only the first PatternSpec of each PatternGroup.
- That meant kp_g4a_u08_left_to_right_same_level generated add_sub_left_to_right but not mul_div_left_to_right in single-KP mode.

fix_applied:
- Modified site/modules/curriculum/batch-a/visible-pattern-group-resolver.js.
- Added g4a_u08_4a08 to MULTISPEC_ALLOCATION_SOURCE_IDS.
- Result: G4A-U08 single-KP and same-unit mixed modes allocate across all PatternSpecs attached to each selected PatternGroup.

expected_effect:
- The failing test should now find a divMul question from ps_g4a_u08_mul_div_left_to_right.
- Single-KP PDF for 同級運算由左至右 should include both:
  - 加減同級由左至右
  - 乘除同級由左至右
- Mixed G4A-U08 PDF should draw from all 10 PatternSpecs, not only the first PatternSpec under each KP.
- The previous expected test count does not change.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_test_result_after_fix:
- tests = 487
- pass = 487
- fail = 0

not_claimed:
- npm test after S55G_R1 has not been run.
- UI selector readback has not been confirmed after S55G_R1.
- PDFs have not been generated after S55G_R1.

GOAL_DISTANCE_BEFORE = D1_G4A_U08_PRINTABLE_UI_IMPLEMENTED_STATIC_READBACK_PASS_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U08_MULTISPEC_ALLOCATION_FIX_APPLIED_TEST_PENDING
DISTANCE_REDUCED = Cleared the implementation bug where multi-spec G4A-U08 KPs allocated only their first PatternSpec; printable single-KP and mixed modes should now cover the intended PatternSpec families.
REMAINING_BLOCKERS = ["Need npm test readback after S55G_R1", "Need UI selector readback showing 4 G4A-U08 KPs", "Need single-KP PDF smokes", "Need same-unit mixed PDF smoke and overlay ratio check"]
NEXT_SHORTEST_STEP = S55G_R2_G4A_U08_NpmAndUISelectorReadback
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S55G_R1_FIX_APPLIED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main and rerun npm test; after pass, confirm UI selector shows 4 G4A-U08 KPs.
NEXT_RESUME_TASK = S55G_R2_G4A_U08_NpmAndUISelectorReadback
