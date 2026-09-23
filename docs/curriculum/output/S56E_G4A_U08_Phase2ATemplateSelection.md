S56E_G4A_U08_Phase2ATemplateSelection

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題
status = PHASE2A_TEMPLATE_SELECTION_COMPLETED_FOR_DISCUSSION
write_type = phase2a_application_template_selection

operator_decision:
- Use policy A: same-unit contexts only in Phase2A.
- Add money/count/capacity/weight/length/time domains as story-domain pools.
- Do not enable unit conversion in Phase2A.
- Unit domains are not visible KPs.

selection_principle:
- Choose templates that directly support G4A-U08 operation-order modeling.
- Avoid templates whose main difficulty becomes unit conversion, reading complexity, or high semantic ambiguity.
- Prefer reusable templates with swappable context/domain/unit variables.
- Each template must emit a structured equationModel and finalAnswerWithUnit.

phase2a_visible_kp_selection:
- Expose 4 lower-risk visible KPs in Phase2A.
- Hold the 5th high-risk comparison/rate-difference KP for Phase2B.

phase2a_visible_kps:
1. kp_g4a_u08_app_add_sub_sequence
   - displayName = 加減序列應用題
   - selected_subpoints = 4
   - templates:
     1. tpl_app_add_three_quantities
        - model = a + b + c
        - source = 題型1 連續加法
        - domains = count_items, capacity, weight, length, time
        - example_shell = 三批/三段/三次數量分別是 a、b、c，總共是多少？
     2. tpl_app_add_then_subtract_state_change
        - model = a + b - c
        - source = 題型2 先加再減
        - domains = count_items, capacity, weight, length, time
        - example_shell = 原本有 a，又增加 b，後來用掉/減少 c，還剩多少？
     3. tpl_app_subtract_then_add_state_change
        - model = a - b + c
        - source = 題型3 先減再加
        - domains = count_items, capacity, weight, length, time
        - example_shell = 原本有 a，先減少 b，後來補進/增加 c，現在有多少？
     4. tpl_app_subtract_twice_state_change
        - model = a - b - c
        - source = 題型11 連續減法
        - domains = count_items, capacity, weight, length, time
        - example_shell = 原本有 a，上午用掉 b，下午又用掉 c，還剩多少？

2. kp_g4a_u08_app_parentheses_grouping
   - displayName = 括號與組合量應用題
   - selected_subpoints = 3
   - templates:
     1. tpl_app_adjusted_amount_then_subtract
        - model = outer - (base - decrease)
        - source = 題型4 有括號
        - domains = money, capacity, weight, length
        - example_shell = 標準量 base，調整後少 decrease，用 outer 去扣除調整後的量，還剩/找回多少？
     2. tpl_app_divide_by_group_product
        - model = total ÷ (groups × perGroup)
        - source = 題型14 括號內乘除
        - domains = count_items, capacity, weight
        - example_shell = 一份/一組需要 groups 個單位，每個單位 perGroup，總共有 total，可分成幾份/幾組？
     3. tpl_app_multiply_after_difference_then_add_sub
        - model = unit × (planned - cancelled) + extra OR base - unit × (planned - cancelled) + extra
        - source = 題型15 括號混合乘除與加減
        - domains = count_items, capacity, weight, length, time
        - example_shell = 每份需要 unit，原本 planned 份，取消 cancelled 份，再加/減 extra，最後多少？

3. kp_g4a_u08_app_mul_div_sequence
   - displayName = 乘除序列應用題
   - selected_subpoints = 3
   - templates:
     1. tpl_app_multiply_then_share
        - model = boxes × perBox ÷ groups
        - source = 題型6 先乘再除
        - domains = count_items, capacity, weight, length, time
        - example_shell = 有 boxes 組，每組 perBox，平均分給 groups 份，每份多少？
     2. tpl_app_unit_rate_then_scale
        - model = total ÷ knownUnits × targetUnits
        - source = 題型7 先除再乘
        - domains = money, count_items, capacity, weight, length, time
        - example_shell = knownUnits 份共 total，targetUnits 份是多少？
     3. tpl_app_divide_then_divide
        - model = total ÷ groups ÷ peoplePerGroup
        - source = 題型13 連續除法
        - domains = count_items, capacity, weight, length, time
        - example_shell = total 先平均分成 groups 份，每份再平均分給 peoplePerGroup 人/組，每人/每組多少？

4. kp_g4a_u08_app_mul_div_before_add_sub
   - displayName = 乘除先於加減應用題
   - selected_subpoints = 2 for Phase2A
   - templates:
     1. tpl_app_payment_minus_unit_cost_times_quantity
        - model = payment - unitPrice × quantity
        - source = 題型8 先乘除後加減(1)
        - domains = money
        - example_shell = 每個/每次 unitPrice 元，買/用 quantity 個/次，付 payment 元，找回多少？
     2. tpl_app_subtract_divided_amount_or_add_divided_amount
        - model = payment - total ÷ groups OR base + total ÷ groups - used
        - source = 題型12 單純先除再加減
        - domains = money, count_items, capacity, weight, length, time
        - example_shell = total 平均分成 groups 份，每份是多少，再與 base/payment 做加減，結果是多少？

phase2b_hold:
- Hold the following for Phase2B because semantic risk or scope complexity is higher:
  1. kp_g4a_u08_app_mul_div_before_add_sub subpoint 3
     - tpl_app_two_cost_components
     - model = payment - directUnitRate × qty - packageRate ÷ packageQty × qty
  2. kp_g4a_u08_app_mul_div_before_add_sub subpoint 4
     - tpl_app_large_add_sub_overlay
     - model = largeA + b × c - largeB OR largeA - (a + b) + c × d
  3. kp_g4a_u08_app_comparison_and_rate_difference subpoint 1
     - tpl_app_chained_comparison_direction
     - model = relation-direction add/sub unknown solving
  4. kp_g4a_u08_app_comparison_and_rate_difference subpoint 2
     - tpl_app_rate_difference_accumulation
     - model = targetDifference ÷ (rateA - rateB)

phase2a_template_count_summary:
- visible_kp_count = 4
- template_count = 12
- subpoint_count = 12
- held_for_phase2b = 4 templates/subpoints

unit_domain_selection_by_template:
- Add/sub sequence templates:
  - count_items, capacity, weight, length, time.
- Parentheses grouping templates:
  - adjusted amount: money, capacity, weight, length.
  - divide by group product: count_items, capacity, weight.
  - multiply after difference: count_items, capacity, weight, length, time.
- Mul/div sequence templates:
  - count_items, capacity, weight, length, time; money allowed only for unit-rate scale.
- Mul/div before add/sub templates:
  - money for payment/change; same-unit measured quantities allowed for divided amount add/sub.

same_unit_constraints:
- Phase2A conversionRequired = false for every generated item.
- All measured quantities in a single item use exactly one unitLabel.
- finalUnitLabel must equal the problem's unitLabel unless the domain is money where finalUnitLabel = 元.
- Time uses same-unit 時 or 分 or 秒 only; no 時分 conversion in Phase2A.
- Capacity uses all L or all mL only; no L/mL conversion in Phase2A.
- Weight uses all kg or all g only; no kg/g conversion in Phase2A.
- Length uses all km or all m or all cm or all mm only; no conversion in Phase2A.

number_control_initial_policy:
- Keep values readable and integer-only.
- No decimal answers.
- No negative answers.
- Exact division only for templates involving division.
- For Phase2A, do not use the Phase1 large overlay by default.
- Suggested ranges:
  - add/sub same-unit normal quantities: 10-500 depending domain.
  - money payment/change: payment 100/500/1000 style; change nonnegative.
  - mul/div factors: small integer factors, product usually <= 500.
  - time: prefer 5,10,15,20,30,40,45,60 style values.

answer_key_selection:
- Recommended for Phase2A: equation + answer.
- Internal fields must store equationModel and finalAnswerWithUnit.
- Printed answer key should preferably show:
  - 算式：...
  - 答案：...
- Reason: Phase2 is about application-modeling, not just arithmetic; equation display helps QA and student correction.

coverage_check:
- Phase2A covers the lower-risk direct models:
  - a+b+c
  - a+b-c
  - a-b+c
  - a-b-c
  - outer-(base-decrease)
  - total÷(groups×perGroup)
  - unit×(planned-cancelled)+extra
  - boxes×perBox÷groups
  - total÷knownUnits×targetUnits
  - total÷groups÷peoplePerGroup
  - payment-unitPrice×quantity
  - payment-total÷groups or base+total÷groups-used
- Phase2A intentionally holds high semantic-risk models for Phase2B.

open_decisions_before_contract:
1. Confirm Phase2A uses 4 visible KPs only, with the comparison/rate-difference KP hidden pending until Phase2B.
2. Confirm Phase2A answer key uses equation + answer.
3. Confirm Phase2A has no unit conversion overlay.
4. Confirm Phase2B will later handle high-risk comparison, two-cost, large-overlay, and rate-difference templates.

GOAL_DISTANCE_BEFORE = D3_G4A_U08_PHASE2_UNIT_DOMAIN_TEMPLATE_POLICY_DEFINED
GOAL_DISTANCE_AFTER = D3_G4A_U08_PHASE2A_TEMPLATE_SELECTION_COMPLETED
DISTANCE_REDUCED = Phase2A template set selected: 4 visible KPs, 12 same-unit application templates, equation+answer answer key recommendation, and Phase2B held templates identified.
REMAINING_BLOCKERS = ["Need operator confirmation for 4 visible KPs in Phase2A", "Need confirm answer key equation+answer", "Need formal Phase2A PatternSpec contract", "Need implementation after contract approval"]
NEXT_SHORTEST_STEP = S56F_G4A_U08_Phase2APatternSpecContract
STOP_REASON = planning_discussion_required
BLOCKER_TYPE = OPERATOR_CONFIRMATION_REQUIRED
LAST_COMPLETED_STATUS = S56E_PHASE2A_TEMPLATE_SELECTION_COMPLETED
REQUIRED_OPERATOR_ACTION = Confirm Phase2A template selection and answer-key policy before contract/implementation.
NEXT_RESUME_TASK = S56F_G4A_U08_Phase2APatternSpecContract
