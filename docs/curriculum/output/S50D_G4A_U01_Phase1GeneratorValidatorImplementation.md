S50D_G4A_U01_Phase1GeneratorValidatorImplementation

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = IMPLEMENTED_STATIC_READBACK_PASS_TEST_EXECUTION_BLOCKED
write_type = code_implementation_plus_static_readback_report

scope_lock:
- Implement only S50C Phase 1 six PatternSpecs.
- Do not implement Phase 2/Phase 3 Chinese-number, missing-digit comparison, or word-problem patterns.
- Do not modify renderer or UI layout.
- Do not start G4A-U02/G4A-U04/G4A-U08.

implemented_phase1_patterns:
- ps_g4a_u01_compare_8digit
- ps_g4a_u01_within_100million_compare
- ps_g4a_u01_large_number_add_sub
- ps_g4a_u01_8digit_place_value_decomposition
- ps_g4a_u01_place_value_composition_to_number
- ps_g4a_u01_same_digit_place_value_difference

files_modified:
- site/modules/curriculum/batch-a/source-pattern-index.js
- site/modules/curriculum/batch-a/batch-a-browser-question-router.js
- site/modules/curriculum/batch-a/batch-a-browser-validator.js

files_created:
- site/modules/curriculum/batch-a/g4a-u01-phase1-generator.js
- tests/curriculum/batch-a/g4a-u01-phase1.test.js

implementation_summary:
- Added three new G4A-U01 place-value PatternSpec definitions to the Batch A source-pattern index.
- Added a dedicated G4A-U01 Phase 1 generator.
- Routed g4a_u01_4a01 source-unit generation through the dedicated generator when the plan is limited to Phase 1 PatternSpecs.
- Added validator support for:
  - g4aU01PlaceValueDecomposition
  - g4aU01PlaceValueComposition
  - g4aU01SameDigitPlaceValueDifference
- Added Node test coverage for:
  - all six Phase 1 patterns being generated
  - Batch A validator pass
  - printable text answer fields for place-value questions
  - worksheet document creation with answer key

static_readback:
- source-pattern-index.js readback confirms six G4A-U01 Phase 1 pattern definitions are materialized.
- g4a-u01-phase1-generator.js readback confirms sourceId, six PatternSpec IDs, comparison generation, large-number add/sub generation, place-value decomposition/composition, same-digit place-value difference, duplicate suppression, and allocation logic.
- batch-a-browser-validator.js readback confirms routing for the three new G4A-U01 place-value kinds.
- batch-a-browser-question-router.js was updated to route G4A-U01 Phase 1 plans before the default generator path.

validation_attempt:
- Attempted local fallback command:
  git clone --depth 1 https://github.com/cobelinfuture-Kobel/taiwan-elementary-math-generator.git /mnt/data/taiwan-elementary-math-generator && cd /mnt/data/taiwan-elementary-math-generator && npm test
- Result:
  failed before tests because the container could not resolve github.com.
- GitHub connector workflow check:
  workflow_runs = [] for the latest test commit at the time of inspection.
  combined statuses = [] for the latest test commit at the time of inspection.
- Therefore npm test is not claimed as passed.

risk_note:
- This task is implementation-complete by GitHub static readback, but not execution-validated.
- The next step must run npm test or equivalent generation smoke in an environment with repository checkout access.
- Browser/PDF print smoke remains later.

anti_scope_check:
- No renderer code modified.
- No UI layout modified.
- No worksheet output generated.
- No G4A-U02/G4A-U04/G4A-U08 work performed.
- No Phase 2/Phase 3 patterns implemented.

GOAL_DISTANCE_BEFORE = D2_G4A_U01_PHASE1_PATTERN_SPEC_CONTRACT_COMPLETE
GOAL_DISTANCE_AFTER = D1_G4A_U01_PHASE1_IMPLEMENTED_STATIC_READBACK_PASS_TEST_EXECUTION_BLOCKED
DISTANCE_REDUCED = G4A-U01 Phase 1 PatternSpecs were materialized into source-pattern definitions, dedicated generator routing, validator support, and test coverage; execution validation remains blocked by unavailable test environment.
REMAINING_BLOCKERS = ["npm test or local generation smoke must run in a repository checkout", "G4A-U01 UI browser generation not smoke-tested", "G4A-U01 PDF print smoke not completed", "Need clearer original source/PDF for exact item-level evidence", "browser/PDF smoke later", "optional renderer-wide blank-page cleanup backlog"]
NEXT_SHORTEST_STEP = S50E_G4A_U01_Phase1LocalGenerationQA
STOP_REASON = tool_environment_cannot_run_required_test_checkout
BLOCKER_TYPE = TEST_EXECUTION_ENVIRONMENT
LAST_COMPLETED_STATUS = S50D_IMPLEMENTED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Run npm test or provide a reachable checkout/test result; alternatively paste browser generation result for g4a_u01_4a01 30-question smoke.
NEXT_RESUME_TASK = S50E_G4A_U01_Phase1LocalGenerationQA
