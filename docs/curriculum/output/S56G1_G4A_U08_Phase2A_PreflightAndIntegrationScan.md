S56G1_G4A_U08_Phase2A_PreflightAndIntegrationScan

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題
status = PREFLIGHT_AND_INTEGRATION_SCAN_COMPLETED
write_type = implementation_scan_report

preflight:
- Operator approved implementation start.
- Contract source = S56F_G4A_U08_Phase2APatternSpecContract.md.
- Target = UI user can select Phase2A application KPs and generate HTML print/PDF worksheets.
- Scope remains Phase2A only.

files_inspected:
- site/modules/curriculum/registry/batch-a-selector-g4a-extension.js
- site/modules/curriculum/batch-a/source-pattern-g4a-u08-extension.js
- site/modules/curriculum/batch-a/batch-a-browser-question-router.js
- site/modules/curriculum/batch-a/g4a-u08-expression-generator.js
- site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js
- site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
- site/assets/browser/state/config-state.js
- site/assets/browser/pipeline/build-worksheet-document.js
- site/modules/core/worksheet-formatting.js
- tests/site/selector-state.test.js
- tests/curriculum/batch-a/g4a-u08-order-of-operations.test.js

insertion_points:
1. Registry / selector
   - File: site/modules/curriculum/registry/batch-a-selector-g4a-extension.js
   - Current G4A-U08 has 4 Phase1 visible KPs.
   - Phase2A can be added as 4 more visible rows using the existing row tuple structure.
   - Existing availability counts will need test updates.

2. Pattern definitions
   - File: site/modules/curriculum/batch-a/source-pattern-g4a-u08-extension.js
   - Current file defines 10 Phase1 numeric PatternSpecs.
   - Phase2A 12 PatternSpecs can be added to the same extension or a chained phase2a extension.
   - Safer initial implementation: extend same file so getBatchABrowserPatternDefinition can resolve both Phase1 and Phase2A specs.

3. Router
   - File: site/modules/curriculum/batch-a/batch-a-browser-question-router.js
   - Current G4A-U08 route sends any g4a_u08_4a08 options to expression generator.
   - Phase2A application route must be checked before the expression route and detect app PatternSpecs from the resolver plan.

4. Unit policy
   - New file recommended: site/modules/curriculum/batch-a/g4a-u08-application-units.js
   - Shared by generator and validator.

5. Application generator
   - New file recommended: site/modules/curriculum/batch-a/g4a-u08-application-generator.js
   - Should build plan from resolver selection and generate only Phase2A app specs.

6. Validator
   - Existing file can be extended directly or chained through a new phase2a validator extension.
   - Safer initial implementation: extend batch-a-browser-validator-g4a-u08-extension.js to validate both Phase1 numeric expressions and Phase2A application questions.

7. Worksheet / answer key
   - File: site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
   - Current text question path can render promptText/blankedDisplayText and answerText.
   - Needs application-aware answer key text formatter for conversion/equation/answer lines.
   - Needs layout profile for long application prompts.

8. UI state / HTML print path
   - buildWorksheetDocumentFromState delegates to batch-a-browser-worksheet.js and should not need direct modification if worksheetDocument shape remains compatible.
   - Selector state should work once registry exposes visible KPs.

9. Tests
   - Existing selector visible count must be updated from 79 to 83 after exposing 4 Phase2A KPs.
   - Existing G4A-U08 test expecting exactly 4 visible KPs must be updated to distinguish Phase1 numeric KPs from Phase2A app KPs.
   - New Phase2A tests needed for registry, generator, validator, worksheet, conversion ratio, answer key equation+answer.

scan_result:
- No repository blocker found.
- Implementation can proceed in ordered milestones.
- Recommended next implementation chunk combines S56G2/S56G3/S56G4/S56G5/S56G7/S56G8/S56G9/S56G10 enough to make HTML print path testable, then request npm readback.

GOAL_DISTANCE_BEFORE = D2_G4A_U08_PHASE2A_HTML_PRINT_IMPLEMENTATION_SEQUENCE_DEFINED
GOAL_DISTANCE_AFTER = D2_G4A_U08_PHASE2A_INSERTION_POINTS_SCANNED
DISTANCE_REDUCED = Located exact selector, pattern-definition, router, generator, validator, worksheet, and test insertion points for Phase2A HTML print implementation.
REMAINING_BLOCKERS = ["Need code implementation", "Need npm test after implementation", "Need generated HTML print/PDF smoke after implementation"]
NEXT_SHORTEST_STEP = S56G2_to_S56G10_Phase2AInitialImplementation
STOP_REASON = NONE
BLOCKER_TYPE = NONE
LAST_COMPLETED_STATUS = S56G1_PREFLIGHT_AND_INTEGRATION_SCAN_COMPLETED
REQUIRED_OPERATOR_ACTION = NONE
NEXT_RESUME_TASK = S56G2_to_S56G10_Phase2AInitialImplementation
