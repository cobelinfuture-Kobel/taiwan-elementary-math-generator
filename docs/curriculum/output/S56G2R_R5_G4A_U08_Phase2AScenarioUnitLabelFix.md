S56G2R_R5_G4A_U08_Phase2AScenarioUnitLabelFix

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題
status = FIX_APPLIED_STATIC_READBACK_PASS_LOCAL_TEST_READBACK_REQUIRED
write_type = local_failure_fix_report

operator_local_readback_before_fix:
- tests = 496
- pass = 495
- fail = 1
- cancelled = 0
- skipped = 0
- todo = 0

remaining_failure:
- test file = tests/curriculum/batch-a/g4a-u08-phase2a-application.test.js
- failing test = G4A-U08 Phase2A single-KP generation validates each application group
- failing assertion = validateBatchABrowserQuestions(result.questions).ok expected true but returned false

root_cause:
- The R4 scenario-bank patch introduced more natural count-item prompts such as 毛巾 and 筆記本.
- The generator also uses count_items unit labels 條 and 本 for these life scenarios.
- The shared unit-domain registry still allowed only the older count_items labels:
  - 個, 箱, 盒, 包, 片, 張, 支, 顆, 人, 班.
- Therefore the validator correctly rejected generated questions whose unitLabel/finalUnitLabel was 條 or 本.
- This was not an arithmetic bug; it was a registry/generator contract mismatch after improving semantic scenarios.

fix_applied:
- Updated site/modules/curriculum/batch-a/g4a-u08-application-units.js.
- Added count_items unit labels:
  - 條
  - 本
- This aligns the unit-domain registry with the Phase2A scenario bank while keeping conversionEligible = false for count_items.

scope_integrity:
- Phase2B not implemented.
- No comparison/rate-difference KP exposed.
- No two-cost-component template added.
- No large-overlay application template added.
- No chained conversion added.
- No decimal/fraction answers added.
- No HTML renderer changes in this fix.

expected_local_readback:
- tests = 496
- pass = 496
- fail = 0

required_local_commands:
```powershell
git fetch public
git switch public-main
git reset --hard public/main
git clean -fd
npm test
```

S56G2R_R5_gate_static:
- count_items unit registry expanded for scenario labels: PASS
- local npm readback: PENDING

GOAL_DISTANCE_BEFORE = D1_G4A_U08_PHASE2A_SCENARIO_BANK_CONTENT_PATCH_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U08_PHASE2A_SCENARIO_UNIT_LABEL_FIX_TEST_PENDING
DISTANCE_REDUCED = The remaining local validator failure was narrowed to a unit-domain registry mismatch introduced by the scenario-bank content patch; count-item labels now match the improved life scenarios.
REMAINING_BLOCKERS = ["Need local npm test readback", "Need regenerate PDFs and inspect content diversity", "Need equation+answer HTML answer-key rendering", "Need Phase2A closeout"]
NEXT_SHORTEST_STEP = S56G2R_R5_LocalRetest
STOP_REASON = awaiting_local_test_readback
BLOCKER_TYPE = LOCAL_TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S56G2R_R5_FIX_APPLIED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, run local npm test, then paste tests/pass/fail output.
NEXT_RESUME_TASK = S56G2R_R5_LocalRetest
