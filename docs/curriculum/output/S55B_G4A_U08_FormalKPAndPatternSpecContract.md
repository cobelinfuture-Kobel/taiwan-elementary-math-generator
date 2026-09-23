S55B_G4A_U08_FormalKPAndPatternSpecContract

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
status = PATTERN_SPEC_CONTRACT_COMPLETED
write_type = formal_kp_and_pattern_spec_contract

scope_lock:
- Implement horizontal expression calculation for operation-order learning.
- Do not implement algebraic transposition/移項.
- Do not introduce fractions, decimals, or negative answers.
- Do not turn the unit into large-number arithmetic practice.
- Multiplication/division stay small; addition/subtraction may include <=9999 values as a 20% overlay.

visible_knowledge_points:
1. kp_g4a_u08_parentheses_first
   - displayName = 括號優先計算
   - coreRule = expressions with parentheses must evaluate the parenthesized part first.
   - patternSpecs = [ps_g4a_u08_parentheses_add_sub, ps_g4a_u08_parentheses_mul_div]

2. kp_g4a_u08_mul_div_before_add_sub
   - displayName = 乘除先於加減
   - coreRule = without overriding parentheses, multiplication/division are evaluated before addition/subtraction.
   - patternSpecs = [ps_g4a_u08_mul_before_add_sub, ps_g4a_u08_div_before_add_sub]

3. kp_g4a_u08_left_to_right_same_level
   - displayName = 同級運算由左至右
   - coreRule = same-level operations must be processed left to right.
   - patternSpecs = [ps_g4a_u08_add_sub_left_to_right, ps_g4a_u08_mul_div_left_to_right]

4. kp_g4a_u08_comprehensive_order_of_operations
   - displayName = 四則與括號綜合計算
   - coreRule = parentheses first; then multiplication/division left-to-right; then addition/subtraction left-to-right.
   - patternSpecs = [ps_g4a_u08_mixed_mul_div_add_sub_no_parentheses, ps_g4a_u08_mixed_with_parentheses, ps_g4a_u08_large_add_sub_overlay_no_parentheses, ps_g4a_u08_large_add_sub_overlay_with_parentheses]

pattern_specs:
1. ps_g4a_u08_parentheses_add_sub
   - title = 括號優先：加減括號
   - expressionShape = a - (b + c) OR a + (b - c)
   - mustHaveParentheses = true
   - ruleTags = [parentheses_first]

2. ps_g4a_u08_parentheses_mul_div
   - title = 括號優先：乘除括號
   - expressionShape = a ÷ (b × c) OR a × (b ÷ c)
   - mustHaveParentheses = true
   - exactDivisionOnly = true
   - ruleTags = [parentheses_first, mul_div_same_level]

3. ps_g4a_u08_mul_before_add_sub
   - title = 乘法先於加減
   - expressionShape = a + b × c - d
   - mustHaveMulDivBeforeAddSub = true
   - ruleTags = [mul_div_before_add_sub]

4. ps_g4a_u08_div_before_add_sub
   - title = 除法先於加減
   - expressionShape = a + b ÷ c - d
   - exactDivisionOnly = true
   - ruleTags = [mul_div_before_add_sub]

5. ps_g4a_u08_add_sub_left_to_right
   - title = 加減同級由左至右
   - expressionShape = a - b + c OR a - b - c
   - ruleTags = [add_sub_left_to_right]

6. ps_g4a_u08_mul_div_left_to_right
   - title = 乘除同級由左至右
   - expressionShape = a ÷ b × c OR a × b ÷ c
   - exactDivisionOnly = true
   - ruleTags = [mul_div_left_to_right]

7. ps_g4a_u08_mixed_mul_div_add_sub_no_parentheses
   - title = 無括號四則混合
   - expressionShape = a + b ÷ c × d - e OR a + b × c - d
   - exactDivisionOnly = true
   - ruleTags = [mul_div_before_add_sub, mul_div_left_to_right, add_sub_left_to_right]

8. ps_g4a_u08_mixed_with_parentheses
   - title = 有括號四則混合
   - expressionShape = a + b × (c - d) OR a + b ÷ (c - d) × e
   - exactDivisionOnly = true
   - ruleTags = [parentheses_first, mul_div_before_add_sub]

9. ps_g4a_u08_large_add_sub_overlay_no_parentheses
   - title = 大數加減包裝：無括號
   - expressionShape = largeA + b × c - largeB OR largeA - b ÷ c + largeB
   - exactDivisionOnly = true
   - largeAddSubOverlay = true
   - ruleTags = [mul_div_before_add_sub, large_add_sub_overlay]

10. ps_g4a_u08_large_add_sub_overlay_with_parentheses
   - title = 大數加減包裝：有括號
   - expressionShape = largeA - (a + b) + c × d OR largeA + c × (d - e) - largeB
   - largeAddSubOverlay = true
   - ruleTags = [parentheses_first, mul_div_before_add_sub, large_add_sub_overlay]

shared_answer_model:
- shape = final_numeric_answer
- required fields:
  - expression
  - expressionTokens
  - finalAnswer
  - operationOrderTrace
  - intermediateResults
  - coverageCase
  - largeAddSubOverlay
- prompt shape:
  - expression = ______
- answer key shape:
  - final numeric answer only for first printable stage.

number_control_contract:
- normal_process_rate = 0.80
- large_add_sub_overlay_rate = 0.20 via 2 overlay PatternSpecs out of 10 source-unit PatternSpecs.
- allowNegative = false
- allowDecimal = false
- exactDivisionOnly = true
- finalAnswerMin = 0
- finalAnswerMax = 9999
- intermediateMin = 0
- intermediateMax = 9999
- normalAddSubOperandMax = 100
- largeAddSubOperandMax = 9999
- multiplicationProductMaxNormal = 200
- multiplicationProductMaxOverlay = 500
- divisionQuotientMax = 100

validator_contract:
- Evaluate expressionTokens with standard precedence.
- Parentheses override normal precedence.
- Multiplication/division are evaluated before addition/subtraction.
- Same-level operations are left-associative.
- Division must be exact at each division step.
- Computed answer must equal finalAnswer and answerText.
- No intermediate result may be negative or decimal.
- No final answer may exceed 9999.
- Large overlay specs must have largeAddSubOverlay=true; non-overlay specs must not.

pdf_smoke_acceptance_contract:
- Student prompts contain only horizontal expressions and blank answer line.
- No KnowledgePoint/source-case labels inside each question.
- Answer key count equals question count.
- Recomputed expression answers = 0 errors.
- Mixed worksheet contains all 4 visible KP families.
- Mixed worksheet overlay ratio near 20%, acceptable tolerance 10%-30% for standard 100+ question mixed PDF.
- No card split or orphan answer fragments.

GOAL_DISTANCE_BEFORE = D3_G4A_U08_TASK_SEQUENCE_LOCKED_FOR_DISCUSSION
GOAL_DISTANCE_AFTER = D2_G4A_U08_PATTERN_SPEC_CONTRACT_COMPLETED
DISTANCE_REDUCED = G4A-U08 moved from task-sequence planning into formal KP, PatternSpec, answer model, number-control, validator, and PDF-smoke contracts.
REMAINING_BLOCKERS = ["Need selector/generator/validator implementation", "Need npm/UI/PDF validation", "Need PDF ratio smoke for 20% large add/sub overlay"]
NEXT_SHORTEST_STEP = S55C_G4A_U08_SourcePatternAndSelectorProjection
STOP_REASON = NONE
BLOCKER_TYPE = NONE
LAST_COMPLETED_STATUS = S55B_PATTERN_SPEC_CONTRACT_COMPLETED
REQUIRED_OPERATOR_ACTION = NONE
NEXT_RESUME_TASK = S55C_G4A_U08_SourcePatternAndSelectorProjection
