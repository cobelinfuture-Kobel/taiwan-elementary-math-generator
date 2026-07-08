S50F_R4_G4A_U01_KPSelectorNpmTestReadback_PASS

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = PASS_PUBLIC_MAIN_NPM_TEST_AND_SELECTOR_UI_CONFIRMED
write_type = test_readback_marker

operator_readback:
- npm test on public/main after S50F_R2 visible-count fix completed.
- tests = 440
- pass = 440
- fail = 0
- cancelled = 0
- skipped = 0
- todo = 0
- duration_ms = 4837.867

prior_ui_readback:
- 4A-U01 本單元可選知識點：6
- G4A-U01 KnowledgePoints can be selected in the UI.

validated_scope:
- G4A-U01 Phase 1 KnowledgePoint selector projection no longer breaks npm test.
- S50F_R2 visible-count drift fix is confirmed clean by public/main test readback.
- UI selector projection is confirmed visible by operator readback.

not_yet_claimed:
- Browser PDF print/export smoke is not yet recorded.
- Answer-key PDF smoke is not yet recorded.
- Phase 2/Phase 3 source-image coverage remains deferred.

anti_scope_check:
- No new code modified by this readback marker.
- No Phase 2/Phase 3 work performed.
- No G4A-U02/G4A-U04/G4A-U08 work performed.
- No browser PDF artifact inspected in this marker.

GOAL_DISTANCE_BEFORE = D1_G4A_U01_KP_SELECTOR_UI_CONFIRMED_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U01_KP_SELECTOR_AND_PUBLIC_MAIN_TEST_PASS
DISTANCE_REDUCED = G4A-U01 selector projection is confirmed in UI and public/main npm test is clean at 440 pass / 0 fail.
REMAINING_BLOCKERS = ["G4A-U01 PDF print smoke not completed", "answer key PDF smoke not completed", "Phase 2/Phase 3 fine-grained source-image patterns deferred"]
NEXT_SHORTEST_STEP = S50G_G4A_U01_BrowserPDFPrintSmoke
