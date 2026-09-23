S56G2R_R1_G4A_U08_Phase2ALocalFailureFix

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題
status = FIX_APPLIED_STATIC_READBACK_PASS_LOCAL_TEST_READBACK_REQUIRED
write_type = local_failure_fix_report

operator_local_readback_before_fix:
- tests = 495
- pass = 484
- fail = 11
- cancelled = 0
- skipped = 0
- todo = 0

failure_clusters:
1. selector visible count drift
   - Several older selector tests still expected global visibleCount = 79.
   - Phase2A exposure adds 4 visible KPs, so current intended global visibleCount is 83.

2. duplicate G4A-U08 Phase2A selector exposure
   - G4A-U08 visibleCount returned 12 instead of intended 8.
   - Cause: Phase2A application KPs were present in both:
     - batch-a-selector-g4a-extension.js
     - batch-a-selector-g4a-u08-phase2a-extension.js
   - Intended stack is:
     - batch-a-selector-g4a-extension.js keeps only 4 numeric G4A-U08 KPs.
     - batch-a-selector-g4a-u08-phase2a-extension.js adds only 4 Phase2A application KPs.
   - Intended G4A-U08 visibleCount = 8.

3. Phase2A application validator rejection
   - The application validator now contains special handling for tpl_app_divide_by_group_product unitLabel/finalUnitLabel = 份.
   - This preserves deterministic validation for the special result unit while not changing Phase2B scope.

files_modified_by_fix:
- site/modules/curriculum/registry/batch-a-selector-g4a-extension.js
  - Removed duplicate Phase2A application rows.
  - Kept numeric G4A-U08 rows only.
- tests/curriculum/batch-a/g3a-u01-kp-expansion.test.js
- tests/curriculum/batch-a/g3a-u02-missing-digit.test.js
- tests/curriculum/batch-a/g3a-u02-rounding-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u02-word-problem-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u03-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u03-supplementary-kp.test.js
- tests/curriculum/batch-a/g3b-u01-kp-expansion.test.js
  - Updated local visible-count expectation from 79 to 83.

static_expected_state_after_fix:
- BATCH_A_SELECTOR_AVAILABILITY.visibleCount = 83.
- g4a_u08_4a08 visibleCount = 8.
- G4A-U08 numeric KPs = 4.
- G4A-U08 Phase2A application KPs = 4.
- Phase2A PatternSpecs = 12.

local_validation_required:
- Pull public/main.
- Run npm test locally.
- Expected if no unrelated upstream changes:
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

not_implemented_in_this_fix:
- Phase2B comparison/rate-difference KP.
- two-cost-component template.
- large-overlay application template.
- chained conversion.
- decimal/fraction answers.
- equation+answer HTML answer-key rendering.
- PDF smoke.

S56G2R_R1_gate_static:
- duplicate Phase2A selector exposure removed: PASS
- older selector count tests updated to 83: PASS
- G4A-U08 intended visibleCount restored to 8: PASS
- local npm readback: PENDING

GOAL_DISTANCE_BEFORE = D1_G4A_U08_PHASE2A_SELECTOR_VALIDATOR_SAFE_EXPOSURE_LOCAL_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U08_PHASE2A_LOCAL_FAILURE_FIX_APPLIED_TEST_PENDING
DISTANCE_REDUCED = Local blocker was narrowed from 11 failures to selector-count drift plus duplicate Phase2A selector exposure; duplicate rows were removed and stale test expectations were updated.
REMAINING_BLOCKERS = ["Need local npm test readback", "Need equation+answer HTML answer-key rendering", "Need regenerated HTML print/PDF smoke after rendering", "Need Phase2A closeout after UI/PDF smoke"]
NEXT_SHORTEST_STEP = S56G2R_R1_LocalRetest
STOP_REASON = awaiting_local_test_readback
BLOCKER_TYPE = LOCAL_TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S56G2R_R1_FIX_APPLIED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, run local npm test, then paste tests/pass/fail output.
NEXT_RESUME_TASK = S56G2R_R1_LocalRetest
