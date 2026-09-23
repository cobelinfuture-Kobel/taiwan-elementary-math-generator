S56F_G4A_U08_Phase2APatternSpecContract

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題
status = PATTERN_SPEC_CONTRACT_COMPLETED_IMPLEMENTATION_APPROVAL_REQUIRED
write_type = phase2a_pattern_spec_contract

operator_confirmations:
- Phase2A visible KPs = 4 lower-risk grouped KPs.
- Phase2A answer key style = equation + answer.
- Phase2A unit policy = 60% same-unit only, 40% simple unit-conversion overlay.

contract_scope:
- Implement application word problems for G4A-U08 Phase2A only.
- Do not implement Phase2B high-risk comparison / rate-difference / two-cost / large-overlay templates in this stage.
- Use the 5-KP architecture long term, but expose only 4 Phase2A visible KPs in this stage.
- Unit domains are template overlays, not visible KPs.

phase2a_visible_kps:
1. kp_g4a_u08_app_add_sub_sequence
   - displayName = 加減序列應用題
   - patternSpecCount = 4
2. kp_g4a_u08_app_parentheses_grouping
   - displayName = 括號與組合量應用題
   - patternSpecCount = 3
3. kp_g4a_u08_app_mul_div_sequence
   - displayName = 乘除序列應用題
   - patternSpecCount = 3
4. kp_g4a_u08_app_mul_div_before_add_sub
   - displayName = 乘除先於加減應用題
   - patternSpecCount = 2

phase2b_hidden_pending_kp:
- kp_g4a_u08_app_comparison_and_rate_difference
  - displayName = 比較與差距應用題
  - status = hidden_pending_phase2b
  - reason = high semantic validation risk.

phase2a_pattern_specs:
1. ps_g4a_u08_app_add_three_quantities
   - kp = kp_g4a_u08_app_add_sub_sequence
   - model = a + b + c
   - storyTemplate = 三批/三段/三次數量分別是 a、b、c，總共是多少？
   - allowedUnitDomains = count_items, capacity, weight, length, time

2. ps_g4a_u08_app_add_then_subtract_state_change
   - kp = kp_g4a_u08_app_add_sub_sequence
   - model = a + b - c
   - storyTemplate = 原本有 a，又增加 b，後來用掉/減少 c，還剩多少？
   - allowedUnitDomains = count_items, capacity, weight, length, time

3. ps_g4a_u08_app_subtract_then_add_state_change
   - kp = kp_g4a_u08_app_add_sub_sequence
   - model = a - b + c
   - storyTemplate = 原本有 a，先減少 b，後來補進/增加 c，現在有多少？
   - allowedUnitDomains = count_items, capacity, weight, length, time

4. ps_g4a_u08_app_subtract_twice_state_change
   - kp = kp_g4a_u08_app_add_sub_sequence
   - model = a - b - c
   - storyTemplate = 原本有 a，上午用掉 b，下午又用掉 c，還剩多少？
   - allowedUnitDomains = count_items, capacity, weight, length, time

5. ps_g4a_u08_app_adjusted_amount_then_subtract
   - kp = kp_g4a_u08_app_parentheses_grouping
   - model = outer - (base - decrease)
   - storyTemplate = 標準量 base，調整後少 decrease，用 outer 去扣除調整後的量，還剩/找回多少？
   - allowedUnitDomains = money, capacity, weight, length

6. ps_g4a_u08_app_divide_by_group_product
   - kp = kp_g4a_u08_app_parentheses_grouping
   - model = total ÷ (groups × perGroup)
   - storyTemplate = 一份/一組需要 groups 個單位，每個單位 perGroup，總共有 total，可分成幾份/幾組？
   - allowedUnitDomains = count_items, capacity, weight

7. ps_g4a_u08_app_multiply_after_difference_then_add_sub
   - kp = kp_g4a_u08_app_parentheses_grouping
   - model = unit × (planned - cancelled) + extra OR base - unit × (planned - cancelled) + extra
   - storyTemplate = 每份需要 unit，原本 planned 份，取消 cancelled 份，再加/減 extra，最後多少？
   - allowedUnitDomains = count_items, capacity, weight, length, time

8. ps_g4a_u08_app_multiply_then_share
   - kp = kp_g4a_u08_app_mul_div_sequence
   - model = boxes × perBox ÷ groups
   - storyTemplate = 有 boxes 組，每組 perBox，平均分給 groups 份，每份多少？
   - allowedUnitDomains = count_items, capacity, weight, length, time

9. ps_g4a_u08_app_unit_rate_then_scale
   - kp = kp_g4a_u08_app_mul_div_sequence
   - model = total ÷ knownUnits × targetUnits
   - storyTemplate = knownUnits 份共 total，targetUnits 份是多少？
   - allowedUnitDomains = money, count_items, capacity, weight, length, time

10. ps_g4a_u08_app_divide_then_divide
    - kp = kp_g4a_u08_app_mul_div_sequence
    - model = total ÷ groups ÷ peoplePerGroup
    - storyTemplate = total 先平均分成 groups 份，每份再平均分給 peoplePerGroup 人/組，每人/每組多少？
    - allowedUnitDomains = count_items, capacity, weight, length, time

11. ps_g4a_u08_app_payment_minus_unit_cost_times_quantity
    - kp = kp_g4a_u08_app_mul_div_before_add_sub
    - model = payment - unitPrice × quantity
    - storyTemplate = 每個/每次 unitPrice 元，買/用 quantity 個/次，付 payment 元，找回多少？
    - allowedUnitDomains = money

12. ps_g4a_u08_app_subtract_divided_amount_or_add_divided_amount
    - kp = kp_g4a_u08_app_mul_div_before_add_sub
    - model = payment - total ÷ groups OR base + total ÷ groups - used
    - storyTemplate = total 平均分成 groups 份，每份是多少，再與 base/payment 做加減，結果是多少？
    - allowedUnitDomains = money, count_items, capacity, weight, length, time

unit_domain_registry:
- money:
  - unitLabels = 元
  - conversionEligible = false in Phase2A
- count_items:
  - unitLabels = 個, 箱, 盒, 包, 片, 張, 支, 顆, 人, 班
  - conversionEligible = false in Phase2A
- capacity:
  - unitLabels = L, mL
  - conversionEligible = true
  - allowedConversionRules = L_to_mL, mL_to_L
- weight:
  - unitLabels = kg, g
  - conversionEligible = true
  - allowedConversionRules = kg_to_g, g_to_kg
- length:
  - unitLabels = km, m, cm, mm
  - conversionEligible = true
  - allowedConversionRules = km_to_m, m_to_km, m_to_cm, cm_to_m, cm_to_mm, mm_to_cm
- time:
  - unitLabels = 時, 分, 秒
  - conversionEligible = true
  - allowedConversionRules = hour_to_minute, minute_to_hour, minute_to_second, second_to_minute

unit_conversion_policy:
- worksheet_distribution_target:
  - sameUnitRate = 60%
  - conversionOverlayRate = 40%
- conversionOverlay means the story includes one explicit unit conversion before or during equation evaluation.
- Conversion overlay must be simple and single-step only.
- No chained conversions.
- No decimal final answers.
- Prefer generating conversion numbers that divide exactly when converting from smaller to larger units.
- Conversion overlay should be distributed across capacity, weight, length, and time; money and count_items stay same-unit only.
- Do not combine conversion overlay with Phase2B hidden-pending high-risk templates in this stage.

allowed_conversion_examples:
- capacity:
  - 2 L = 2000 mL
  - 1500 mL = 1.5 L is disallowed if it produces decimal; prefer 2000 mL = 2 L.
- weight:
  - 3 kg = 3000 g
  - 2500 g = 2.5 kg disallowed in Phase2A.
- length:
  - 4 m = 400 cm
  - 300 cm = 3 m
  - 7 cm = 70 mm
- time:
  - 2 時 = 120 分
  - 180 分 = 3 時
  - 5 分 = 300 秒
  - 150 秒 = 2.5 分 disallowed in Phase2A.

question_object_contract:
- Required fields:
  - id
  - sourceId = g4a_u08_4a08
  - phase = Phase2A
  - kind = g4aU08ApplicationWordProblem
  - knowledgePointId
  - patternSpecId
  - storyTemplateId
  - unitDomain
  - unitLabel
  - finalUnitLabel
  - quantities
  - conversionRequired boolean
  - conversionRule nullable
  - equationModel
  - equationTokens
  - finalAnswer
  - finalAnswerWithUnit
  - answerText
  - promptText
  - operationOrderTags
  - metadata
- For conversionRequired = true:
  - conversionRule must be present.
  - convertedQuantities must be present.
  - equationModel must use a single coherent final unit.

printed_prompt_contract:
- Student prompt is a Traditional Chinese word problem.
- No visible internal template labels.
- No hidden equation in the question prompt.
- Unit conversion must be explicitly stated in the story if conversionRequired = true.
- Example wording for conversion:
  - 1 L = 1000 mL。...
  - 1 kg = 1000 g。...
  - 1 時 = 60 分。...

answer_key_contract:
- Printed answer key must include:
  - 算式：<equationModel> = <finalAnswer>
  - 答案：<finalAnswerWithUnit>
- For conversionRequired = true, answer key should include conversion when needed:
  - 換算：2 L = 2000 mL
  - 算式：2000 + 350 - 600 = 1750
  - 答案：1750 mL
- Internal validator may require conversion step data even if printed answer key is compact.

validator_contract:
- Validate sourceId, phase, kind, kp, PatternSpec.
- Validate patternSpecId belongs to selected knowledgePointId.
- Validate unitDomain and unitLabel are allowed for the PatternSpec.
- Validate conversionRequired rate at worksheet level can be measured against target 40% with tolerance.
- Validate conversionRequired = false:
  - all story quantities use the same unitLabel.
  - finalUnitLabel equals unitLabel, except money where finalUnitLabel = 元.
- Validate conversionRequired = true:
  - conversionRule is allowed for unitDomain.
  - exactly one conversion rule is used.
  - no decimal final answer.
  - equationModel uses the converted coherent unit.
- Validate equationTokens evaluate to finalAnswer using standard G4A-U08 order rules.
- Validate division is exact.
- Validate no negative intermediate or final result.
- Validate answerText / finalAnswerWithUnit matches finalAnswer and finalUnitLabel.
- Validate printed prompt does not leak template ids, PatternSpec ids, or KP ids.

worksheet_allocation_contract:
- Phase2A mixed source/unit worksheet should allocate across 12 PatternSpecs.
- Same-unit/conversion distribution target:
  - 60% same-unit
  - 40% conversion overlay
- Suggested acceptance tolerance:
  - sameUnitRate 50%-70%
  - conversionOverlayRate 30%-50%
- Single-KP worksheets should also preserve approximate conversion distribution if the selected templates include conversion-eligible unit domains.
- If selected KP/template only supports money or count_items, conversion overlay is not forced.

number_control_contract:
- Integer-only quantities and answers.
- No negative final answer.
- No decimal final answer.
- Exact division only.
- Keep products generally <= 500 for Phase2A readability unless a conversion step makes a measured quantity larger.
- Measured same-unit add/sub quantities generally 10-500, except converted values may be 1000+ when natural.
- Time values should use clean values such as 5, 10, 15, 20, 30, 40, 45, 60, 120, 180.
- Money payments should use clean values such as 100, 200, 500, 1000.

not_in_scope:
- Phase2B comparison direction templates.
- Phase2B rate-difference / pursuit templates.
- Phase2B two-cost-component template.
- Phase2B large add/sub overlay application template.
- Multi-step/chained unit conversion.
- Decimal answers.
- Fractions.
- Worked-step pedagogy beyond equation + answer.

implementation_entry_requirement:
- This contract is planning-only.
- Implementation requires explicit operator approval because it moves from planning/contract into generator/validator/UI code changes.

GOAL_DISTANCE_BEFORE = D3_G4A_U08_PHASE2A_TEMPLATE_SELECTION_COMPLETED
GOAL_DISTANCE_AFTER = D2_G4A_U08_PHASE2A_PATTERN_SPEC_CONTRACT_COMPLETED
DISTANCE_REDUCED = Phase2A moved from selected templates to a formal PatternSpec, unit-domain, conversion, answer-key, validator, and allocation contract.
REMAINING_BLOCKERS = ["Need explicit operator approval to implement Phase2A generator/validator/UI", "Need implementation", "Need npm test after implementation", "Need generated PDF smoke after implementation"]
NEXT_SHORTEST_STEP = S56G_G4A_U08_Phase2AImplementation
STOP_REASON = implementation_approval_required
BLOCKER_TYPE = OPERATOR_APPROVAL_REQUIRED
LAST_COMPLETED_STATUS = S56F_PHASE2A_PATTERN_SPEC_CONTRACT_COMPLETED
REQUIRED_OPERATOR_ACTION = Approve S56G implementation if the Phase2A contract is accepted.
NEXT_RESUME_TASK = S56G_G4A_U08_Phase2AImplementation
