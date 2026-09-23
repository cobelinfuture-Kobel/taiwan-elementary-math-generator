S54C0_G4A_U04_PrintableUITaskBreakdown

sourceId = g4a_u04_4a04
unit = 4A-U04 整數的除法
status = PRINTABLE_UI_TASK_BREAKDOWN_COMPLETED
write_type = implementation_task_breakdown

current_state:
- S54A SourceImagePatternScan completed.
- S54B PatternSpecContract completed.
- Seven visible KnowledgePoint candidates are locked for implementation.
- Next stage moves from planning into implementation and requires operator approval.

printable_ui_goal:
- A browser UI user can select G4A-U04.
- The UI shows 7 selectable KnowledgePoints.
- User can generate worksheet questions for single KP, same-unit mixed KPs, and source-unit mode.
- User can include answer key and print/download PDF from browser.
- PDF smoke confirms readable question pages and answer-key pages.

implementation_sequence:

S54C_G4A_U04_SourcePatternAndSelectorProjection
- Purpose: make G4A-U04 visible to the UI selection system.
- Files likely touched:
  - site/modules/curriculum/batch-a/source-pattern-g4a-u04-extension.js or equivalent pattern-index extension
  - site/modules/curriculum/registry/batch-a-selector-g4a-extension.js
  - selector count tests
- Output:
  - 7 PatternSpec definitions resolvable by sourceId g4a_u04_4a04.
  - 7 visible KnowledgePoints in G4A-U04 selector.
  - global Batch A visible count updated.
- Acceptance:
  - selector registry tests pass.
  - source-unit mode resolves all 7 PatternSpecs.
- Distance target: D2 -> D1 selector-visible partial.

S54D_G4A_U04_DivisionGeneratorImplementation
- Purpose: generate deterministic questions for all 7 G4A-U04 PatternSpecs.
- Files likely touched:
  - new generator module for G4A-U04 division
  - batch-a-browser-question-router.js
  - generator tests
- Output:
  - quotient/remainder questions for six long-division patterns.
  - verification-equation questions for remainder checking.
  - metadata fields: dividend, divisor, quotient, remainder, dividendDigits, divisorDigits, quotientStartPlace, firstDivisionUnit, coverageCase.
- Required coverage:
  - 4digit÷1digit thousand sufficient / insufficient / exact.
  - 2digit÷2digit with divisor multiple of 10.
  - 3digit÷2digit tens sufficient / insufficient.
  - remainder check with remainder > 0 and remainder < divisor.
  - internal quotient-zero and remainder-zero/nonzero cases where valid.
- Acceptance:
  - source-unit generation returns requested question count.
  - single-KP and same-unit generation return requested question count.
  - duplicate prompts are bounded.
- Distance target: generator usable state.

S54E_G4A_U04_DivisionValidatorImplementation
- Purpose: validate generated G4A-U04 division questions deterministically.
- Files likely touched:
  - batch-a-browser-validator-g4a-extension.js or new G4A-U04 validator extension
  - tests/curriculum/batch-a/g4a-u04-division.test.js
- Validator requirements:
  - quotient = floor(dividend / divisor).
  - remainder = dividend % divisor.
  - 0 <= remainder < divisor.
  - dividend = divisor × quotient + remainder.
  - first-place rule matches PatternSpec.
  - quotientStartPlace matches source case.
  - ten-multiple divisor pattern uses divisor in {10,20,...,90}.
  - verification pattern has remainder > 0 and correct check equation.
- Acceptance:
  - valid generated questions pass.
  - deliberately corrupted answer/remainder/start-place cases fail.
- Distance target: validator contract usable by worksheet pipeline.

S54F_G4A_U04_WorksheetPipelineAndRendererReadiness
- Purpose: make generated/validated G4A-U04 questions printable through worksheet pipeline.
- Files likely touched:
  - batch-a-browser-worksheet.js if division prompts need layout profile.
  - renderer tests if answer-key formatting requires quotient/remainder display.
- Output:
  - displayText / blankedDisplayText for each question.
  - answerText format includes quotient and remainder, e.g. 商 123，餘 4.
  - verification answer format includes divisor × quotient + remainder = dividend.
  - answer key pages are populated when includeAnswerKey is true.
- Acceptance:
  - buildWorksheetDocument works for single KP, same-unit mixed, and source-unit mode.
  - printOptions and answerKeyItems are correct.
  - no known answer-card split risk from long text prompts.
- Distance target: renderer can consume G4A-U04 output.

S54G_G4A_U04_NpmAndUISelectorReadback
- Purpose: operator/browser verification before PDF smoke.
- Required operator command:
  - git fetch public
  - git switch public-main
  - git reset --hard public/main
  - git clean -fd
  - npm test
- Expected UI result:
  - 4A-U04 本單元可選知識點：7
  - all 7 G4A-U04 KPs selectable.
- Acceptance:
  - npm pass.
  - UI confirms 7 visible KPs.
- Distance target: implementation passes local CI and browser selector is usable.

S54H_G4A_U04_SingleKPPDFSmoke
- Purpose: verify each single KP can be printed/read as a PDF.
- PDFs to generate:
  1. g4a_u04_4位數除以1位數_千位夠除.pdf
  2. g4a_u04_4位數除以1位數_千位不夠除.pdf
  3. g4a_u04_4位數除以1位數_千位整除.pdf
  4. g4a_u04_2位數除以2位數_除數是10的倍數.pdf
  5. g4a_u04_3位數除以2位數_十位夠除.pdf
  6. g4a_u04_3位數除以2位數_十位不夠除.pdf
  7. g4a_u04_除法驗算_有餘數.pdf
- Smoke checks:
  - question count = requested count.
  - answer key count = question count.
  - quotient/remainder answer recomputes correctly.
  - verification equations recompute correctly.
  - exact duplicate prompts bounded.
  - layout readable; no orphan answer fragments.
- Acceptance:
  - each single-KP PDF passes.
- Distance target: single-KP printable state.

S54I_G4A_U04_MixedPDFSmokeAndLayoutFix
- Purpose: verify same-unit mixed worksheet output.
- PDF to generate:
  - g4a_u04_同單位知識點混合_隨機排序.pdf
- Smoke checks:
  - all 7 pattern families appear.
  - mixed ordering interleaves pattern families when random/shuffle mode is selected.
  - answer correctness = 0 errors.
  - answer key count = question count.
  - no answer-card page split / orphan fragments.
  - horizontal prompt sufficiency is evaluated; if not readable, create layout/scaffold fix task.
- Possible fix branches:
  - S54I_R1 DuplicatePoolFix if unique pools are too small.
  - S54I_R2 AnswerKeyLayoutFix if answer cards split.
  - S54I_R3 LongDivisionScaffoldFix if horizontal prompt is insufficient for source-alignment.
- Acceptance:
  - mixed PDF passes without blocking layout/content bugs.
- Distance target: mixed printable UI state.

S54J_G4A_U04_PrintReadyCloseout
- Purpose: formal closeout after UI print readiness is proven.
- Requires:
  - npm pass.
  - UI selector pass.
  - seven single-KP PDF smokes pass or explicitly accepted subset pass if operator chooses mixed-only QA.
  - same-unit mixed PDF smoke pass.
  - known non-blocking renderer-wide artifacts recorded separately.
- Output:
  - docs/curriculum/output/S54J_G4A_U04_UNIT_CLOSEOUT_PASS.marker
- Distance target: D0 G4A-U04 unit closed and available for downstream worksheet output / future cross-unit composition.

critical_path_summary:
1. S54C Selector + PatternSpecs visible in UI.
2. S54D Generator.
3. S54E Validator.
4. S54F Worksheet/answer-key pipeline.
5. S54G npm + UI selector readback.
6. S54H single-KP PDF smoke.
7. S54I mixed PDF smoke and layout fixes if needed.
8. S54J print-ready closeout.

anti_scope_creep_guard:
- Do not add extra G4A-U04 KPs beyond the seven source-image KPs unless PDF QA proves the current grouping is insufficient.
- Do not move to G4A-U08 until G4A-U04 reaches S54J or a blocker requires stopping.
- Do not implement full long-division visual scaffold unless horizontal output fails PDF QA or operator explicitly requires scaffold output.

GOAL_DISTANCE_BEFORE = D2_G4A_U04_PATTERN_SPEC_CONTRACT_COMPLETED
GOAL_DISTANCE_AFTER = D2_G4A_U04_PRINTABLE_UI_TASK_SEQUENCE_LOCKED
DISTANCE_REDUCED = The route from PatternSpec contract to UI-printable worksheet output is now decomposed into ordered milestones with acceptance gates and blocker branches.
REMAINING_BLOCKERS = ["Need operator approval to begin S54C implementation", "Need generator/validator/selector implementation", "Need npm/UI/PDF validation", "Need decide during PDF QA whether horizontal prompts are sufficient or long-division scaffold is required"]
NEXT_SHORTEST_STEP = S54C_G4A_U04_SourcePatternAndSelectorProjection
STOP_REASON = planning_to_implementation_requires_operator_approval
BLOCKER_TYPE = OPERATOR_APPROVAL_REQUIRED
LAST_COMPLETED_STATUS = S54C0_PRINTABLE_UI_TASK_BREAKDOWN_COMPLETED
REQUIRED_OPERATOR_ACTION = Approve S54C implementation sequence, or revise task order/scope before code changes.
NEXT_RESUME_TASK = S54C_G4A_U04_SourcePatternAndSelectorProjection
