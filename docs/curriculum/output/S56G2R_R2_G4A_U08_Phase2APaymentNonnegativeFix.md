S56G2R_R2_G4A_U08_Phase2APaymentNonnegativeFix

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題
status = FIX_APPLIED_STATIC_READBACK_PASS_LOCAL_TEST_READBACK_REQUIRED
write_type = local_failure_fix_report

operator_local_readback_before_fix:
- tests = 495
- pass = 494
- fail = 1
- cancelled = 0
- skipped = 0
- todo = 0

remaining_failure:
- test file = tests/curriculum/batch-a/g4a-u08-phase2a-application.test.js
- failing test = G4A-U08 Phase2A single-KP generation validates each application group
- failing assertion = validateBatchABrowserQuestions(result.questions).ok expected true but returned false

root_cause:
- The remaining validation failure was consistent with the Phase2A payment/change template allowing a negative final answer.
- Template involved:
  - ps_g4a_u08_app_payment_minus_unit_cost_times_quantity
  - model = payment - unitPrice × quantity
- Previous payment choices included 100 元.
- With unitPrice up to 25 and quantity up to 6, cost could reach 150, so payment - cost could be negative.
- Phase2A validator correctly rejects negative final answers.

fix_applied:
- Updated site/modules/curriculum/batch-a/g4a-u08-application-generator.js.
- Changed payment choices for tpl_app_payment_minus_unit_cost_times_quantity from:
  - [100, 200, 500]
- to:
  - [200, 500, 1000]
- This preserves clean money values while guaranteeing nonnegative change for the current unitPrice/quantity ranges.

scope_integrity:
- Phase2B not implemented.
- No comparison/rate-difference KP exposed.
- No two-cost-component template added.
- No large-overlay application template added.
- No chained conversion added.
- No decimal/fraction answers added.
- No renderer changes in this fix.

expected_local_readback:
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

S56G2R_R2_gate_static:
- payment/change nonnegative range fixed: PASS
- local npm readback: PENDING

GOAL_DISTANCE_BEFORE = D1_G4A_U08_PHASE2A_LOCAL_FAILURE_FIX_APPLIED_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U08_PHASE2A_PAYMENT_NEGATIVE_FIX_APPLIED_TEST_PENDING
DISTANCE_REDUCED = Remaining local failure was reduced to a payment/change negative-answer risk; payment values were raised to maintain nonnegative final answers under current template ranges.
REMAINING_BLOCKERS = ["Need local npm test readback", "Need equation+answer HTML answer-key rendering", "Need regenerated HTML print/PDF smoke after rendering", "Need Phase2A closeout after UI/PDF smoke"]
NEXT_SHORTEST_STEP = S56G2R_R2_LocalRetest
STOP_REASON = awaiting_local_test_readback
BLOCKER_TYPE = LOCAL_TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S56G2R_R2_FIX_APPLIED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, run local npm test, then paste tests/pass/fail output.
NEXT_RESUME_TASK = S56G2R_R2_LocalRetest
