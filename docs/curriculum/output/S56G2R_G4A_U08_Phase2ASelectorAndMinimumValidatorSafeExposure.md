S56G2R_G4A_U08_Phase2ASelectorAndMinimumValidatorSafeExposure

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題
status = IMPLEMENTED_STATIC_READBACK_PASS_LOCAL_TEST_READBACK_REQUIRED
write_type = safe_selector_validator_exposure_implementation_report

validation_policy_update:
- Operator requested switching validation readback to local validation.
- This milestone does not require GitHub Actions validation readback.
- Required readback is local npm test after pulling public/main.

scope:
- Safe-expose Phase2A application KPs only after minimum deterministic validator support is present.
- Keep Phase2B hidden/out of scope.
- Do not implement full equation+answer HTML renderer in this milestone; that remains the next implementation step.

existing_safe_exposure_confirmed:
1. site/modules/curriculum/registry/batch-a-selector-g4a-extension.js
   - Exposes 4 Phase2A application visible KPs:
     - kp_g4a_u08_app_add_sub_sequence / 加減序列應用題
     - kp_g4a_u08_app_parentheses_grouping / 括號與組合量應用題
     - kp_g4a_u08_app_mul_div_sequence / 乘除序列應用題
     - kp_g4a_u08_app_mul_div_before_add_sub / 乘除先於加減應用題
   - Maps those 4 KPs to 12 Phase2A application PatternSpecs.

2. site/modules/curriculum/batch-a/source-pattern-g4a-u08-phase2a-extension.js
   - Defines 12 Phase2A PatternSpecs.
   - phase = Phase2A.
   - kind = g4aU08ApplicationWordProblem.
   - answerModel = equation_plus_answer.

3. site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js
   - Validates Phase2A application word-problem questions before numeric G4A-U08 fallback.
   - Checks sourceId / phase / kind.
   - Checks knowledgePointId / storyTemplateId / patternSpecId consistency.
   - Checks unitDomain / unitLabel / finalUnitLabel legality.
   - Checks conversionRequired false/true branches.
   - Checks allowed conversion rule and factor.
   - Checks equationTokens recompute to finalAnswer.
   - Checks exact division, no negative result, integer final answer.
   - Checks finalAnswerWithUnit / answerText consistency.
   - Checks prompt internal id leakage.

4. tests/site/selector-state.test.js
   - Current visible KP count = 83.
   - G4A-U08 visible count = 8.

files_modified_this_step:
- site/modules/curriculum/batch-a/g4a-u08-application-generator.js
- tests/curriculum/batch-a/g4a-u08-phase2a-application.test.js

fix_applied_this_step:
- Stabilized Phase2A application division templates before local validation.
- tpl_app_multiply_then_share now uses clean division groups and per-box quantities so boxes × perBox ÷ groups remains exact.
- tpl_app_subtract_divided_amount_or_add_divided_amount now uses clean division groups and keeps displayed total aligned with the equation total.
- Removed an unused sequence counter from the generation loop.

regression_tests_strengthened_this_step:
- Phase2A exposes four application KPs and twelve PatternSpecs.
- Each Phase2A single-KP application group generates valid word problems.
- Mixed application equations recompute and keep equation-plus-answer fields.
- Mixed application worksheet builds answer key and conversion overlay.
- Validator rejects corrupted finalAnswer, unitLabel, and conversionRule.
- shuffleAcrossPatterns changes application render order.

not_implemented_in_this_step:
- Phase2B comparison/rate-difference KP.
- two-cost-component template.
- large-overlay application template.
- chained conversion.
- decimal/fraction answers.
- full HTML answer-key rendering upgrade.
- PDF smoke.

expected_local_readback:
- Previous operator-confirmed baseline before Phase2A implementation sequence: tests 489 / pass 489 / fail 0.
- Phase2A application regression file now contains 6 tests.
- Expected after pull if no unrelated upstream test changes:
  - tests = 495
  - pass = 495
  - fail = 0

required_local_commands:
```powershell
git fetch public
git switch public-main
git reset --hard public/main
git clean -fd
npm test
```

S56G2R_gate_static:
- 4 Phase2A KPs exposed: PASS
- 12 Phase2A PatternSpecs reachable through selector rows: PASS
- Minimum Phase2A application validator active: PASS
- Selector visible counts updated: PASS
- Phase2A generator exact-division stabilization applied: PASS
- Phase2A application regression tests strengthened: PASS
- Local npm readback: PENDING

GOAL_DISTANCE_BEFORE = D2_G4A_U08_PHASE2A_PREFLIGHT_SCAN_COMPLETED_REALIGNED
GOAL_DISTANCE_AFTER = D1_G4A_U08_PHASE2A_SELECTOR_VALIDATOR_SAFE_EXPOSURE_LOCAL_TEST_PENDING
DISTANCE_REDUCED = Phase2A moved from preflight realignment to safe selector/validator exposure with deterministic application generation tests and local validation path defined.
REMAINING_BLOCKERS = ["Need local npm test readback", "Need equation+answer HTML answer-key rendering", "Need regenerated HTML print/PDF smoke after rendering", "Need Phase2A closeout after UI/PDF smoke"]
NEXT_SHORTEST_STEP = S56G3_G4A_U08_Phase2AAnswerKeyRenderingAfterLocalPass
STOP_REASON = awaiting_local_test_readback
BLOCKER_TYPE = LOCAL_TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S56G2R_IMPLEMENTED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, run local npm test, then paste tests/pass/fail output.
NEXT_RESUME_TASK = S56G3_G4A_U08_Phase2AAnswerKeyRenderingAfterLocalPass
