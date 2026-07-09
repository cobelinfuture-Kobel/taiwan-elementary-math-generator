S56G2R_G4A_U08_Phase2ASelectorAndMinimumValidatorSafeExposure

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題
status = IMPLEMENTED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = implementation_readback

scope:
- Safe-expose Phase2A application KPs only after adding minimum deterministic validator support.
- Keep Phase2B hidden/out of scope.
- Do not implement equation+answer renderer in this milestone; that remains S56G9.

files_modified:
1. site/modules/curriculum/registry/batch-a-selector-g4a-extension.js
   - Exposed 4 Phase2A application visible KPs:
     - kp_g4a_u08_app_add_sub_sequence / 加減序列應用題
     - kp_g4a_u08_app_parentheses_grouping / 括號與組合量應用題
     - kp_g4a_u08_app_mul_div_sequence / 乘除序列應用題
     - kp_g4a_u08_app_mul_div_before_add_sub / 乘除先於加減應用題
   - Mapped those 4 KPs to the existing 12 Phase2A application PatternSpecs.

2. site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js
   - Added Phase2A application validator path for kind = g4aU08ApplicationWordProblem.
   - Validates:
     - sourceId / phase / kind
     - knowledgePointId / storyTemplateId / patternSpecId consistency
     - unitDomain / unitLabel / finalUnitLabel legality
     - conversionRequired false/true branches
     - allowed conversion rule and factor
     - equationTokens recompute to finalAnswer
     - exact division / no negative / integer final answer
     - finalAnswerWithUnit / answerText consistency
     - prompt internal id leakage
   - Keeps existing numeric G4A-U08 validator path intact.

3. tests/site/selector-state.test.js
   - Updated current visible KP count from 79 to 83.
   - Updated G4A-U08 visible count from 4 to 8.

4. tests/curriculum/batch-a/g4a-u08-order-of-operations.test.js
   - Updated visible-KP test to distinguish 4 numeric KPs and 4 Phase2A application KPs.
   - Preserved existing numeric source-unit / expression / overlay / mixed worksheet tests.

files_created:
1. tests/curriculum/batch-a/g4a-u08-phase2a-application.test.js
   - Added Phase2A application safe-exposure tests:
     - 4 app KPs expose 12 PatternSpecs.
     - application generator produces valid word problems.
     - conversion rate stays within 30%-50% tolerance for app add/sub selection.
     - validator rejects corrupted application answers and bad conversion rules.
     - mixed application worksheet builds safely with 48 generated questions and 48 answer key items.

ci_status:
- GitHub combined status for latest implementation commit returned no statuses.
- Therefore CI readback is not available from connector in this run.
- Local/public-main npm readback is required.

expected_local_readback:
- Previous user readback before this milestone: tests 489 / pass 489 / fail 0.
- This milestone adds 4 new tests.
- Expected after pull:
  - tests 493
  - pass 493
  - fail 0

recommended_operator_command:
```powershell
git fetch public
git switch public-main
git reset --hard public/main
git clean -fd
npm test
```

known_remaining_scope:
- S56G9 equation+answer answer-key rendering is still pending.
- PDF smoke is still pending.
- Phase2B remains out of scope.

anti_scope_creep_check:
- Phase2B not implemented.
- No comparison/rate-difference KP exposed.
- No two-cost-component or large-overlay application templates exposed.
- No chained conversion.
- No decimal/fraction answers.
- No renderer redesign.

S56G2R_gate_static:
- 4 Phase2A KPs exposed: PASS
- 12 Phase2A PatternSpecs reachable through selector rows: PASS
- Minimum Phase2A application validator implemented: PASS
- Selector visible counts updated: PASS
- Phase2A application tests added: PASS
- CI/npm readback: PENDING

GOAL_DISTANCE_BEFORE = D2_G4A_U08_PHASE2A_PREFLIGHT_SCAN_COMPLETED_REALIGNED
GOAL_DISTANCE_AFTER = D1_G4A_U08_PHASE2A_SELECTOR_VALIDATOR_STATIC_IMPLEMENTED
DISTANCE_REDUCED = Phase2A moved from contract/partial-generator state to UI-selectable static implementation with minimum deterministic validator coverage. It is not yet D0 because npm readback, equation+answer rendering, and PDF smoke are pending.
REMAINING_BLOCKERS = ["Need npm test readback", "Need S56G9 equation+answer answer-key rendering", "Need generated HTML print/PDF smoke", "Need Phase2A closeout marker after QA"]
NEXT_SHORTEST_STEP = S56G2R_TestReadback
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S56G2R_STATIC_IMPLEMENTATION_COMPLETED
REQUIRED_OPERATOR_ACTION = Pull public/main and run npm test, then paste tests/pass/fail output.
NEXT_RESUME_TASK = S56G2R_TestReadback
