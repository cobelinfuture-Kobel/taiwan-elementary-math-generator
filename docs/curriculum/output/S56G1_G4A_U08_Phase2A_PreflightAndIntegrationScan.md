S56G1_G4A_U08_Phase2A_PreflightAndIntegrationScan

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題
status = PREFLIGHT_AND_INTEGRATION_SCAN_COMPLETED_WITH_REALIGNMENT_REQUIRED
write_type = preflight_integration_scan

operator_approval:
- Operator approved starting implementation after S56G task breakdown.
- Per breakdown, first milestone is S56G1_PreflightAndIntegrationScan.

scope_lock:
- This milestone performs code inspection and insertion-point confirmation only.
- No production code is changed in this milestone.
- Phase2B remains out of scope.
- No comparison/rate-difference KP, two-cost-component template, large-overlay application template, chained conversion, decimal/fraction answer, or broad renderer redesign is implemented here.

files_inspected:
- site/modules/curriculum/registry/batch-a-selector-g4a-extension.js
- site/modules/curriculum/batch-a/batch-a-browser-question-router.js
- site/modules/curriculum/batch-a/source-pattern-g4a-u08-phase2a-extension.js
- site/modules/curriculum/batch-a/g4a-u08-application-units.js
- site/modules/curriculum/batch-a/g4a-u08-application-generator.js
- site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js
- site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
- tests/site/selector-state.test.js

scan_findings:
1. Router partial integration already exists.
   - batch-a-browser-question-router.js already imports canGenerateG4AU08ApplicationQuestions / generateG4AU08ApplicationQuestions.
   - Router already attempts G4A-U08 application generation before numeric G4A-U08 expression generation.
   - This means S56G8 is partially present, but not yet safe end-to-end because validator / selector exposure are incomplete.

2. Phase2A source PatternSpec definitions already exist.
   - source-pattern-g4a-u08-phase2a-extension.js already defines 12 Phase2A PatternSpec ids.
   - Each definition contains phase = Phase2A, kind = g4aU08ApplicationWordProblem, knowledgePointId, storyTemplateId, equationModelShape, allowedUnitDomains, operationOrderTags, and equation_plus_answer answerModel.
   - This means S56G3 is mostly present.

3. Unit-domain and conversion module already exists.
   - g4a-u08-application-units.js already defines conversion target rate = 0.4.
   - It defines money/count_items/capacity/weight/length/time domains.
   - It defines allowed conversion rules for capacity, weight, length, and time.
   - This means S56G4 is mostly present.

4. Phase2A application generator already exists.
   - g4a-u08-application-generator.js imports Phase2A PatternSpec ids, unit conversion helpers, and visible PatternGroup resolver.
   - It includes application template selection by storyTemplateId and outputs application word problem fields.
   - This means S56G5 and part of S56G6 are already partially present.

5. Selector registry does not expose Phase2A application KPs yet.
   - batch-a-selector-g4a-extension.js currently exposes only the 4 numeric G4A-U08 KPs:
     - 括號優先計算
     - 乘除先於加減
     - 同級運算由左至右
     - 四則與括號綜合計算
   - The 4 Phase2A application KPs are not yet visible in selector rows:
     - 加減序列應用題
     - 括號與組合量應用題
     - 乘除序列應用題
     - 乘除先於加減應用題
   - This means S56G2 is not complete.

6. Phase2A validator is missing from the active validator chain.
   - batch-a-browser-validator-g4a-u08-extension.js currently recognizes only numeric G4A-U08 PatternSpecs.
   - It validates kind = g4aU08OrderOfOperationsExpression.
   - It does not validate kind = g4aU08ApplicationWordProblem.
   - batch-a-browser-worksheet.js imports this validator and rejects worksheet creation when validation fails.
   - Therefore exposing Phase2A KPs before validator support would create a UI path that can generate but then fail worksheet validation.
   - This means S56G7 must be implemented before or together with safe selector exposure.

7. Answer-key rendering needs Phase2A handling.
   - Current text-question answer key uses answerText only.
   - Phase2A contract requires equation + answer, and conversion line when conversionRequired is true.
   - This means S56G9 is not complete.

8. Existing selector-state test has current visible count = 79 and g4a_u08 visibleCount = 4.
   - Exposing 4 Phase2A KPs will require count updates to 83 total and 8 for G4A-U08, plus dedicated Phase2A selector tests.

integration_risk:
- The repo is not at a clean sequential S56G2-only state because S56G3/S56G4/S56G5/S56G6/S56G8 are already partially present.
- The safe next implementation cannot simply expose the 4 KPs in the selector.
- If selector exposure happens before validator support, UI users may select Phase2A KPs and hit validation failure in the worksheet pipeline.

required_realignment:
- S56G2 registry exposure must be coupled with at least minimum S56G7 validator support and S56G10 selector regression tests.
- S56G9 answer key rendering can follow after validator minimum pass, but before PDF smoke.
- Recommended immediate next implementation milestone:
  - S56G2R_G4A_U08_Phase2ASelectorAndMinimumValidatorSafeExposure
- This merged milestone should:
  1. expose 4 Phase2A KPs in selector registry;
  2. add application PatternSpec ids to resolver/selector expectations;
  3. extend G4A-U08 validator to validate Phase2A application questions minimally but deterministically;
  4. update visible selector counts/tests;
  5. add initial application generation/validation tests;
  6. keep answer-key rendering improvement as the next milestone if tests pass.

anti_scope_creep_check:
- Phase2B not implemented.
- No comparison/rate-difference KP exposed.
- No two-cost-component or large-overlay application templates exposed.
- No chained conversion.
- No decimal/fraction answers.
- No renderer redesign in this scan.

S56G1_gate:
- Existing insertion points inspected: PASS
- Existing partial Phase2A code identified: PASS
- Missing selector exposure identified: PASS
- Missing validator support identified: PASS
- Answer-key rendering gap identified: PASS
- Safe next implementation milestone defined: PASS

GOAL_DISTANCE_BEFORE = D2_G4A_U08_PHASE2A_HTML_PRINT_IMPLEMENTATION_SEQUENCE_DEFINED
GOAL_DISTANCE_AFTER = D2_G4A_U08_PHASE2A_PREFLIGHT_SCAN_COMPLETED_REALIGNED
DISTANCE_REDUCED = Implementation entry was inspected; existing partial generator/source/unit/router pieces were identified, and the unsafe selector-before-validator dependency was isolated before code exposure.
REMAINING_BLOCKERS = ["Need safe selector exposure with minimum validator support", "Need selector count/test updates", "Need equation+answer rendering", "Need npm test after implementation", "Need regenerated HTML print/PDF smoke after implementation"]
NEXT_SHORTEST_STEP = S56G2R_G4A_U08_Phase2ASelectorAndMinimumValidatorSafeExposure
STOP_REASON = dependency_realignment_required_before_code_exposure
BLOCKER_TYPE = IMPLEMENTATION_ORDER_REALIGNMENT_REQUIRED
LAST_COMPLETED_STATUS = S56G1_PREFLIGHT_AND_INTEGRATION_SCAN_COMPLETED
REQUIRED_OPERATOR_ACTION = None; continue with S56G2R because implementation approval was already granted, but do not expose selector without minimum validator in the same implementation step.
NEXT_RESUME_TASK = S56G2R_G4A_U08_Phase2ASelectorAndMinimumValidatorSafeExposure
