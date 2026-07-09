S56G_G4A_U08_Phase2AImplementationTaskBreakdown

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題
status = IMPLEMENTATION_TASK_BREAKDOWN_COMPLETED_APPROVAL_REQUIRED
write_type = implementation_task_breakdown

operator_request:
- Goal: make Phase2A usable by UI users in HTML print flow.
- Break the implementation into ordered tasks.
- Arrange tasks in execution order.

accepted_contract_basis:
- Phase2A visible KPs = 4 lower-risk grouped KPs.
- Phase2A PatternSpecs = 12.
- Answer key style = equation + answer.
- Unit distribution target = 60% same-unit, 40% simple conversion overlay.
- Phase2B high-risk templates remain out of scope.

implementation_goal:
- User can open the HTML UI, select G4A-U08 Phase2A application-problem KPs, generate printable worksheets, and print/export through the existing HTML print/PDF flow.
- Generated worksheets contain Traditional Chinese application word problems.
- Answer key shows equation and final answer with unit.
- Internal validator verifies equation, unit, conversion, and answer consistency.

ordered_task_sequence:

1. S56G1_PreflightAndIntegrationScan
   - type = design_scan / code inspection
   - purpose = inspect existing Batch A selector, router, generator, validator, worksheet, and HTML print path before code changes.
   - likely_files_to_read:
     - site/modules/curriculum/registry/batch-a-selector-g4a-extension.js
     - site/modules/curriculum/batch-a/batch-a-browser-question-router.js
     - site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
     - site/modules/curriculum/batch-a/source-pattern-g4a-u08-extension.js
     - site/modules/curriculum/batch-a/g4a-u08-expression-generator.js
     - site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js
     - site/assets/browser/pipeline/build-worksheet-document.js
     - site/index.html and relevant UI modules if selector rendering is split.
   - output = implementation scan report with exact insertion points.
   - acceptance = no code change unless required for scan notes.

2. S56G2_Phase2ARegistryAndSelectorScaffold
   - type = implementation
   - purpose = expose 4 Phase2A visible KPs and 12 PatternSpecs in selector registry without breaking Phase1 G4A-U08.
   - changes:
     - add Phase2A KP rows / pattern group rows.
     - mark comparison/rate-difference KP as hidden_pending or not selectable.
     - ensure sourceId stays g4a_u08_4a08.
     - ensure labels are clear for UI users:
       1. 加減序列應用題
       2. 括號與組合量應用題
       3. 乘除序列應用題
       4. 乘除先於加減應用題
   - tests:
     - visible count increases by 4 only if Phase2A KPs are exposed in the same selector list.
     - hidden Phase2B KP not selectable.
     - each Phase2A KP has expected PatternSpec ids.
   - acceptance = UI selector can list/select Phase2A application KPs.

3. S56G3_Phase2ASourcePatternDefinitions
   - type = implementation
   - purpose = define the 12 Phase2A PatternSpecs and their metadata.
   - likely_file_strategy:
     - either extend source-pattern-g4a-u08-extension.js
     - or create source-pattern-g4a-u08-phase2a-extension.js and chain it from existing extension.
   - required definition fields:
     - patternSpecId
     - knowledgePointId
     - phase = Phase2A
     - kind = g4aU08ApplicationWordProblem
     - storyTemplateId
     - equationModelShape
     - allowedUnitDomains
     - operationOrderTags
     - answerModel = equation_plus_answer
   - tests:
     - all 12 PatternSpecs resolve.
     - all PatternSpecs map to exactly one of 4 Phase2A KPs.
   - acceptance = router/generator can request definitions for all 12 specs.

4. S56G4_UnitDomainAndConversionPolicyModule
   - type = implementation
   - purpose = centralize unit domains, labels, and conversion rules.
   - likely_file = site/modules/curriculum/batch-a/g4a-u08-application-units.js
   - required policy:
     - money and count_items conversionEligible = false.
     - capacity/weight/length/time conversionEligible = true.
     - one-step conversion only.
     - no decimal final answer.
     - conversionRequired target can be sampled at 40% for eligible templates.
   - tests:
     - allowed conversion rules pass.
     - decimal-producing conversions rejected.
     - unsupported conversions rejected.
   - acceptance = generator and validator share the same unit policy.

5. S56G5_Phase2AApplicationGenerator_SameUnitCore
   - type = implementation
   - purpose = implement core generator for 12 templates with conversionRequired = false.
   - likely_file = site/modules/curriculum/batch-a/g4a-u08-application-generator.js
   - required output object:
     - sourceId
     - phase
     - kind
     - knowledgePointId
     - patternSpecId
     - storyTemplateId
     - unitDomain
     - unitLabel
     - finalUnitLabel
     - quantities
     - conversionRequired = false
     - conversionRule = null
     - equationModel
     - equationTokens
     - finalAnswer
     - finalAnswerWithUnit
     - answerText
     - promptText
     - operationOrderTags
     - metadata
   - tests:
     - each of 12 PatternSpecs can generate valid same-unit questions.
     - no prompt leaks ids.
     - equationTokens evaluate to finalAnswer.
     - finalUnitLabel correct.
   - acceptance = all 12 templates work without conversion.

6. S56G6_Phase2AApplicationGenerator_ConversionOverlay
   - type = implementation
   - purpose = add 40% conversion overlay for eligible unit domains/templates.
   - required behavior:
     - worksheet target conversionOverlayRate = 40%.
     - tolerance = 30%-50%.
     - conversion rule explicitly appears in prompt when conversionRequired = true.
     - answer key includes conversion line when useful.
     - no conversion for money/count_items.
   - tests:
     - mixed worksheet meets 60/40 distribution tolerance.
     - conversion items have valid convertedQuantities.
     - no decimal final answers.
     - no chained conversions.
   - acceptance = conversion overlay passes validator and remains readable.

7. S56G7_Phase2AValidator
   - type = implementation
   - purpose = extend validator to validate Phase2A application word problems.
   - likely_file_strategy:
     - add batch-a-browser-validator-g4a-u08-phase2a-extension.js
     - chain into existing g4a-u08 validator extension used by worksheet pipeline.
   - required checks:
     - sourceId/phase/kind
     - KP/PatternSpec mapping
     - allowed unitDomain/unitLabel
     - conversionRequired false/true contracts
     - conversion rule exactly one when required
     - equationTokens evaluate to finalAnswer
     - exact division
     - no negative/decimal answer
     - answerText/finalAnswerWithUnit consistency
     - prompt has no internal ids.
   - tests:
     - valid generated questions pass.
     - corrupted finalAnswer fails.
     - corrupted conversion rule fails.
     - mismatched unit fails.
     - leaked ids fail.
   - acceptance = validator protects semantic data contract.

8. S56G8_QuestionRouterAndWorksheetPipelineIntegration
   - type = implementation
   - purpose = route selected Phase2A PatternSpecs to application generator and ensure worksheet document carries answer-key equation data.
   - likely_files:
     - batch-a-browser-question-router.js
     - batch-a-browser-worksheet.js
     - build-worksheet-document.js if answer key shaping happens there.
   - required behavior:
     - Phase1 numeric and Phase2A application questions both still work.
     - same sourceId can route by PatternSpec kind/phase.
     - generatedQuestions and answerKeyItems include application fields.
   - tests:
     - same-unit selected KP worksheet builds.
     - mixed 4-KP worksheet builds.
     - Phase1 G4A-U08 numeric tests still pass.
   - acceptance = worksheet document can contain printable application questions.

9. S56G9_HTMLPrintAnswerKeyRendering
   - type = implementation
   - purpose = ensure HTML print/PDF output displays word problems and equation+answer answer key.
   - likely_files:
     - worksheet renderer / answer key renderer modules.
     - site CSS if line breaks need adjustment.
   - required print output:
     - question side: Chinese word problem only, no equation hidden answer.
     - answer side:
       - 換算：... when conversionRequired true and conversion line exists.
       - 算式：... = ...
       - 答案：... <unit>
   - layout constraints:
     - avoid card split where possible.
     - preserve readable Chinese line wrapping.
     - do not create answer-only orphan fragments.
   - tests:
     - answerKeyItems render equationText and final answer.
     - conversion answer-key line appears only when required.
   - acceptance = UI user can print meaningful application worksheets.

10. S56G10_UISelectorAndStateRegression
    - type = implementation/test
    - purpose = verify UI state can select Phase2A application KPs and generate output.
    - likely_files:
      - config-state tests.
      - selector state tests.
      - maybe index.html if visible labels or grouping need UI text.
    - tests:
      - selector includes 4 Phase2A KPs.
      - Phase2B high-risk KP not visible/selectable.
      - question count binding still works.
      - mixed same-unit KP mode works.
    - acceptance = UI selection path is stable.

11. S56G11_NpmRegressionAndStaticReadback
    - type = validation
    - command = npm test
    - expected = all tests pass; exact count will be updated after implementation.
    - output = static implementation readback doc with changed files, tests added, and expected local command.
    - acceptance = user can pull and run npm test.

12. S56G12_RegeneratedHTMLPrintPDFSmoke
    - type = PDF/UI smoke
    - required PDFs:
      - g4a_u08_phase2a_加減序列應用題.pdf
      - g4a_u08_phase2a_括號與組合量應用題.pdf
      - g4a_u08_phase2a_乘除序列應用題.pdf
      - g4a_u08_phase2a_乘除先於加減應用題.pdf
      - g4a_u08_phase2a_同階段混合_隨機排序.pdf
    - smoke checks:
      - prompts are Traditional Chinese application word problems.
      - no template ids/KP ids leak.
      - answer key includes equation + answer.
      - conversion items include conversion line where needed.
      - 60/40 same-unit/conversion ratio within tolerance.
      - arithmetic recomputation errors = 0.
      - no layout blocker.
    - acceptance = PDF smoke pass.

13. S56G13_Phase2AUnitCloseout
    - type = closeout
    - prerequisites:
      - npm pass readback.
      - PDF smoke pass.
      - UI selector confirmed.
    - output = S56*_G4A_U08_PHASE2A_CLOSEOUT_PASS.marker
    - acceptance = Phase2A reaches D0 for HTML print usable application word problems.

recommended_execution_order:
1. S56G1_PreflightAndIntegrationScan
2. S56G2_Phase2ARegistryAndSelectorScaffold
3. S56G3_Phase2ASourcePatternDefinitions
4. S56G4_UnitDomainAndConversionPolicyModule
5. S56G5_Phase2AApplicationGenerator_SameUnitCore
6. S56G6_Phase2AApplicationGenerator_ConversionOverlay
7. S56G7_Phase2AValidator
8. S56G8_QuestionRouterAndWorksheetPipelineIntegration
9. S56G9_HTMLPrintAnswerKeyRendering
10. S56G10_UISelectorAndStateRegression
11. S56G11_NpmRegressionAndStaticReadback
12. S56G12_RegeneratedHTMLPrintPDFSmoke
13. S56G13_Phase2AUnitCloseout

anti_scope_creep_boundaries:
- Do not implement Phase2B in this sequence.
- Do not implement comparison/rate-difference visible KP.
- Do not implement two-cost-component or large-overlay application templates.
- Do not implement chained unit conversion.
- Do not implement decimal/fraction answers.
- Do not redesign the entire worksheet renderer beyond what is required for equation+answer key.

first_implementation_milestone_recommendation:
- Start with S56G1 only.
- If scan finds clean insertion points, continue to S56G2/S56G3.
- Do not jump directly to full generator before registry/source definitions are stable.

GOAL_DISTANCE_BEFORE = D2_G4A_U08_PHASE2A_PATTERN_SPEC_CONTRACT_COMPLETED
GOAL_DISTANCE_AFTER = D2_G4A_U08_PHASE2A_HTML_PRINT_IMPLEMENTATION_SEQUENCE_DEFINED
DISTANCE_REDUCED = Phase2A contract was converted into an ordered UI/HTML-print implementation plan with 13 milestones, dependencies, acceptance checks, and anti-scope-creep boundaries.
REMAINING_BLOCKERS = ["Need operator approval to start S56G1 implementation sequence", "Need implementation", "Need npm test after implementation", "Need generated HTML print/PDF smoke after implementation"]
NEXT_SHORTEST_STEP = S56G1_PreflightAndIntegrationScan
STOP_REASON = implementation_sequence_defined_approval_required
BLOCKER_TYPE = OPERATOR_APPROVAL_REQUIRED
LAST_COMPLETED_STATUS = S56G_TASK_BREAKDOWN_COMPLETED
REQUIRED_OPERATOR_ACTION = Approve starting S56G1_PreflightAndIntegrationScan, then proceed milestone-by-milestone.
NEXT_RESUME_TASK = S56G1_PreflightAndIntegrationScan
