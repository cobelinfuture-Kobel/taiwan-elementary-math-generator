S55A_G4A_U08_TaskSequencePlan

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
status = TASK_SEQUENCE_PLAN_COMPLETED
write_type = implementation_task_sequence_plan

current_state:
- G4A-U04 is closed as PASS_ACCEPTED_AND_CLOSED.
- Operator provided G4A-U08 source images and clarified the teaching target.
- The target is horizontal expression calculation for operation order, not large-number arithmetic practice.
- Current phase is planning only; implementation requires later operator approval.

operator_clarifications:
1. Core rule set:
   - If parentheses exist, evaluate parentheses first.
   - If no parentheses, multiplication/division have priority over addition/subtraction.
   - Addition/subtraction are processed after multiplication/division.
   - Same-level operations must be processed left to right.
2. Display form:
   - Horizontal calculation questions are acceptable for this stage.
3. Number-size policy:
   - Multiplication/division should stay small to avoid distracting from operation-order reasoning.
   - Addition/subtraction may include larger numbers because Grade 4 can handle numbers below 10000.
   - Large add/sub overlay should be about 20%.
   - Most questions should still focus on process/order, not multi-digit calculation load.

formal_kp_candidates:
1. kp_g4a_u08_parentheses_first
   - displayName = 括號優先計算
   - coreRule = expressions with parentheses must evaluate parentheses first.
   - examples:
     - 15 - (4 + 7) =
     - 24 ÷ (2 × 4) =
     - 23 + 2 × (4 - 2) =

2. kp_g4a_u08_mul_div_before_add_sub
   - displayName = 乘除先於加減
   - coreRule = if no parentheses override the expression, multiplication/division are evaluated before addition/subtraction.
   - examples:
     - 23 + 2 × 4 - 2 =
     - 23 + 4 ÷ 2 - 2 =
     - 18 - 3 × 4 + 5 =

3. kp_g4a_u08_left_to_right_same_level
   - displayName = 同級運算由左至右
   - coreRule = addition/subtraction of the same level and multiplication/division of the same level are processed left to right.
   - examples:
     - 15 - 3 - 7 =
     - 20 - 6 + 2 =
     - 24 ÷ 2 ÷ 4 =
     - 30 ÷ 5 × 2 =

4. kp_g4a_u08_comprehensive_order_of_operations
   - displayName = 四則與括號綜合計算
   - coreRule = apply parentheses first, then multiplication/division left-to-right, then addition/subtraction left-to-right.
   - examples:
     - 23 + 4 ÷ 2 - 2 × 3 =
     - 23 + 4 ÷ (4 - 2) × 3 =
     - 20 - 2 × (5 - 1) =

strategy_notes_not_primary_kp:
- 數字前面的符號要一起看.
- 把容易算的先湊在一起.
- 減號可以跟著數字一起看.
- These are teaching explanations/solution strategies, not primary visible KPs for the first printable implementation.

number_control_policy:
- normal_process_rate = 0.80
- large_add_sub_overlay_rate = 0.20
- allowNegative = false
- allowDecimal = false
- divisionMode = exact_only
- finalAnswerRange = [0, 9999]
- intermediateRange = [0, 9999]
- normal add/sub operand max = 100
- large add/sub operand max = 9999
- multiplication/division should remain small:
  - multiplication factors usually one-digit by one-digit or two-digit by one-digit.
  - multiplication product usually <= 200, rare overlay <= 500.
  - division is exact; divisor usually one-digit or simple two-digit; quotient usually <= 100.

anti_scope_creep_policy:
- Do not make this unit a large-number arithmetic unit.
- Do not introduce fractions or decimals.
- Do not introduce negative answers.
- Do not implement algebraic transposition/移項.
- Do not split every teaching sentence into a visible KP.
- Large add/sub is a difficulty overlay, not an independent KP.

recommended_task_sequence:

S55B_G4A_U08_FormalKPAndPatternSpecContract
- Purpose: turn the four KP candidates into formal PatternSpec contracts.
- Define answer model, expression grammar, allowed operators, parentheses rules, left-to-right rules, exact division requirements, and numeric range constraints.
- Decide exact PatternSpec count, likely 8 to 10 candidates:
  1. parentheses_add_sub
  2. parentheses_mul_div
  3. mul_before_add_sub
  4. div_before_add_sub
  5. add_sub_left_to_right
  6. mul_div_left_to_right
  7. mixed_mul_div_add_sub_no_parentheses
  8. mixed_with_parentheses
  9. large_add_sub_overlay_no_parentheses
  10. large_add_sub_overlay_with_parentheses
- Acceptance: operator confirms KP granularity and PatternSpec list before implementation.

S55C_G4A_U08_SourcePatternAndSelectorProjection
- Purpose: expose G4A-U08 in the UI selector.
- Add source pattern definitions and selector rows for the confirmed KPs.
- Update global visible KP count and selector tests.
- Acceptance:
  - G4A-U08 visible KP count equals confirmed KP count, likely 4.
  - All visible KPs resolve to PatternSpecs.

S55D_G4A_U08_ExpressionGeneratorImplementation
- Purpose: implement deterministic horizontal expression generation.
- Output:
  - expression string, blankedDisplayText, finalAnswer, step metadata.
  - operationOrderTrace showing evaluation order.
  - coverage labels: parentheses_first, mul_div_before_add_sub, add_sub_left_to_right, mul_div_left_to_right, comprehensive, large_add_sub_overlay.
- Generator constraints:
  - exact division only.
  - no negative intermediate or final answer.
  - final answer <= 9999.
  - multiplication/division kept small.
  - large add/sub overlay about 20%.
- Acceptance:
  - requested question count generated for each single KP and mixed mode.
  - duplicate prompts bounded.

S55E_G4A_U08_ExpressionValidatorImplementation
- Purpose: validate the expression answer and operation-order semantics.
- Validator requirements:
  - parse/evaluate generated horizontal expression using standard arithmetic precedence.
  - validate operationOrderTrace.
  - validate exact division constraints.
  - validate left-to-right handling for same-level operations.
  - reject corrupted finalAnswer.
  - reject expressions that violate number-control constraints.
- Acceptance:
  - valid generated questions pass.
  - corrupted answers and intentionally wrong trace/order cases fail.

S55F_G4A_U08_WorksheetPipelineAndPromptFormat
- Purpose: make expressions printable in the worksheet pipeline.
- Student-facing prompt:
  - expression = ______
  - no KnowledgePoint labels inside each question.
- Answer key:
  - final numeric answer.
  - Optional future: show step trace, but first printable stage should keep answer concise unless operator asks for worked steps.
- Acceptance:
  - single-KP worksheet builds.
  - same-unit mixed worksheet builds.
  - answerKeyItems are populated.
  - layout is safe for horizontal expressions.

S55G_G4A_U08_NpmAndUISelectorReadback
- Purpose: local verification before PDF smoke.
- Operator command:
  - git fetch public
  - git switch public-main
  - git reset --hard public/main
  - git clean -fd
  - npm test
- Expected UI:
  - 4A-U08 visible KP count matches confirmed KP count.
- Acceptance:
  - npm pass.
  - UI selector confirms G4A-U08 KPs visible and selectable.

S55H_G4A_U08_SingleKPPDFSmoke
- Purpose: verify each visible KP can print correctly.
- PDFs:
  - one PDF per confirmed visible KP.
- Smoke checks:
  - question count = requested count.
  - answer key count = question count.
  - no KP labels inside student prompts.
  - final answers recompute correctly.
  - exact duplicate prompts bounded.
  - layout has no card split or orphan answer fragments.

S55I_G4A_U08_MixedPDFSmokeAndRatioCheck
- Purpose: verify same-unit mixed output.
- PDF:
  - g4a_u08_同單位知識點混合_隨機排序.pdf or correctly named equivalent.
- Smoke checks:
  - all visible KP families appear.
  - mixed ordering is interleaved when shuffle is selected.
  - final answers recompute correctly.
  - large add/sub overlay rate is near 20%, acceptable tolerance e.g. 10%-30% depending question count.
  - multiplication/division remains small.
  - no layout blockers.
- Possible fix branches:
  - S55I_R1 ExpressionPoolFix if duplicate or exhausted pools occur.
  - S55I_R2 RatioTuningFix if large add/sub overlay is too high/low.
  - S55I_R3 LayoutFix if PDF card split occurs.
  - S55I_R4 TraceOrAnswerKeyFix if answers correct but display format is unclear.

S55J_G4A_U08_PrintReadyCloseout
- Purpose: close G4A-U08 after print readiness is proven.
- Requires:
  - npm pass.
  - UI selector pass.
  - single-KP PDF smoke pass.
  - mixed PDF smoke pass.
  - ratio checks pass or accepted.
- Output:
  - docs/curriculum/output/S55J_G4A_U08_UNIT_CLOSEOUT_PASS.marker

critical_path_summary:
1. S55B confirm formal KP and PatternSpec contract.
2. S55C selector projection.
3. S55D expression generator.
4. S55E expression validator.
5. S55F worksheet prompt/answer pipeline.
6. S55G npm + UI readback.
7. S55H single-KP PDF smoke.
8. S55I mixed PDF + ratio smoke.
9. S55J closeout.

GOAL_DISTANCE_BEFORE = D3_G4A_U08_LEFT_TO_RIGHT_RULE_CLARIFIED
GOAL_DISTANCE_AFTER = D3_G4A_U08_TASK_SEQUENCE_LOCKED_FOR_DISCUSSION
DISTANCE_REDUCED = G4A-U08 has a scoped task path from KP/rule discussion to printable UI output, including number-control policy and PDF acceptance gates.
REMAINING_BLOCKERS = ["Need operator confirmation of 4-KP granularity", "Need PatternSpec contract approval before implementation", "Need generator/validator/selector implementation", "Need npm/UI/PDF validation"]
NEXT_SHORTEST_STEP = S55B_G4A_U08_FormalKPAndPatternSpecContract
STOP_REASON = planning_only_waiting_for_kp_patternspec_confirmation
BLOCKER_TYPE = OPERATOR_CONFIRMATION_REQUIRED
LAST_COMPLETED_STATUS = S55A_TASK_SEQUENCE_PLAN_COMPLETED
REQUIRED_OPERATOR_ACTION = Confirm the 4-KP structure and whether to use 8-10 PatternSpecs, then approve S55B contract writing.
NEXT_RESUME_TASK = S55B_G4A_U08_FormalKPAndPatternSpecContract
