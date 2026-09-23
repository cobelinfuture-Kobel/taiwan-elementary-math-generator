S56C_G4A_U08_Phase2GroupedKPSubpointCoverageCheck

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2 應用題
status = GROUPED_KP_SUBPOINT_COVERAGE_CHECK_COMPLETED_FOR_DISCUSSION
write_type = grouped_kp_subpoint_coverage_check

scope_decision_applied:
- Maintain 5 visible Phase2 application-problem KnowledgePoints.
- Do not make the original 10 operator types or the gap-filler types into 10+ visible KPs.
- Treat each operator type / gap-filler type as a subpoint or PatternSpec candidate under one of the 5 grouped KPs.
- This is planning only; no generator implementation is included.

visible_kp_1:
- id = kp_g4a_u08_app_add_sub_sequence
- displayName = 加減序列應用題
- subpoint_count = 4
- subpoints:
  1. 連續加法
     - source = operator 題型1
     - model = a + b + c
     - coverage = application prerequisite; maps under add/sub sequence.
  2. 先加再減
     - source = operator 題型2
     - model = a + b - c
     - coverage = add_sub_left_to_right.
  3. 先減再加
     - source = operator 題型3
     - model = a - b + c
     - coverage = add_sub_left_to_right.
  4. 連續減法
     - source = gap filler 題型11
     - model = a - b - c
     - coverage = fills Phase1 numeric gap for continuous subtraction.
- coverage_status = complete_for_add_sub_sequence

visible_kp_2:
- id = kp_g4a_u08_app_parentheses_grouping
- displayName = 括號與組合量應用題
- subpoint_count = 3
- subpoints:
  1. 加減括號 / 折扣或調整量
     - source = operator 題型4
     - model = payment - (base - discount) OR total - (base - decrease)
     - coverage = parentheses_add_sub.
  2. 括號內乘除
     - source = gap filler 題型14
     - model = a ÷ (b × c) OR a × (b ÷ c)
     - coverage = fills Phase1 numeric gap for parentheses_mul_div.
  3. 括號混合乘除與加減
     - source = gap filler 題型15
     - model = a + b × (c - d) OR a - b × (c - d) + e
     - coverage = fills weak coverage for mixed_with_parentheses.
- coverage_status = complete_for_parentheses_grouping

visible_kp_3:
- id = kp_g4a_u08_app_mul_div_sequence
- displayName = 乘除序列應用題
- subpoint_count = 3
- subpoints:
  1. 先乘再除
     - source = operator 題型6
     - model = boxes × perBox ÷ groups
     - coverage = mul_div_left_to_right; multiply then divide.
  2. 先除再乘
     - source = operator 題型7
     - model = total ÷ knownUnits × targetUnits
     - coverage = mul_div_left_to_right; divide then multiply.
  3. 連續除法
     - source = gap filler 題型13
     - model = a ÷ b ÷ c
     - coverage = fills Phase1 numeric gap for continuous division.
- coverage_status = complete_for_mul_div_sequence

visible_kp_4:
- id = kp_g4a_u08_app_mul_div_before_add_sub
- displayName = 乘除先於加減應用題
- subpoint_count = 4
- subpoints:
  1. 乘法成本後找零 / 單一乘法成本
     - source = operator 題型8
     - model = payment - unitPrice × quantity
     - coverage = mul_before_add_sub.
  2. 單純先除再加減
     - source = gap filler 題型12
     - model = payment - total ÷ groups OR a + b ÷ c - d
     - coverage = fills weak coverage for div_before_add_sub.
  3. 兩個成本成分 / 直接單價加派生單價
     - source = operator 題型9
     - model = payment - directUnitRate × qty - packageRate ÷ packageQty × qty
     - coverage = mixed_mul_div_add_sub_no_parentheses.
  4. 大數加減包裝
     - source = gap filler 題型16
     - model = largeA + b × c - largeB OR largeA - (a + b) + c × d
     - coverage = fills Phase1 large_add_sub_overlay_no_parentheses and large_add_sub_overlay_with_parentheses gaps.
     - note = this subpoint may generate both no-parentheses and with-parentheses overlay PatternSpecs but remains one subpoint in the visible KP group.
- coverage_status = complete_for_mul_div_before_add_sub_and_large_overlay

visible_kp_5:
- id = kp_g4a_u08_app_comparison_and_rate_difference
- displayName = 比較與差距應用題
- subpoint_count = 2
- subpoints:
  1. 比較型問法
     - source = operator 題型5
     - model = relation-direction add/sub reasoning; solve unknown quantity from chained comparisons.
     - coverage = semantic add/sub relation reasoning.
  2. 差距追及 / 同時變化
     - source = operator 題型10
     - model = targetDifference ÷ (rateA - rateB)
     - coverage = grouped rate difference; parentheses/grouping plus division.
- coverage_status = complete_but_high_semantic_risk

total_visible_kp_count = 5
total_subpoint_count = 16

coverage_check_against_phase1_numeric_families:
- parentheses_add_sub = covered by visible_kp_2 subpoint 1.
- parentheses_mul_div = covered by visible_kp_2 subpoint 2.
- mul_before_add_sub = covered by visible_kp_4 subpoint 1.
- div_before_add_sub = covered by visible_kp_4 subpoint 2.
- add_sub_left_to_right = covered by visible_kp_1 subpoints 2,3,4; 題型1 is additive prerequisite.
- mul_div_left_to_right = covered by visible_kp_3 subpoints 1,2,3.
- mixed_mul_div_add_sub_no_parentheses = covered by visible_kp_4 subpoint 3.
- mixed_with_parentheses = covered by visible_kp_2 subpoint 3 and visible_kp_5 subpoint 2 partially.
- large_add_sub_overlay_no_parentheses = covered by visible_kp_4 subpoint 4.
- large_add_sub_overlay_with_parentheses = covered by visible_kp_4 subpoint 4.

missing_check_result:
- No Phase1 numeric family is intentionally left unmapped after adding gap-filler subpoints 11-16.
- Original operator 題型1-10 are all retained.
- Gap-filler types 11-16 are all placed under the 5 visible KP groups.
- The only remaining concern is not coverage absence but implementation risk for semantic validation.

implementation_risk_ranking:
- low_risk:
  - visible_kp_1 subpoints 1-4
  - visible_kp_3 subpoints 1-3
  - visible_kp_4 subpoints 1-2
- medium_risk:
  - visible_kp_2 subpoints 1-3
  - visible_kp_4 subpoint 4 large overlay
- high_risk:
  - visible_kp_4 subpoint 3 two cost components
  - visible_kp_5 subpoint 1 comparison direction
  - visible_kp_5 subpoint 2 rate difference / pursuit

recommended_phase_split:
- Phase2A recommended visible KPs/subpoints:
  - kp_g4a_u08_app_add_sub_sequence: all 4 subpoints
  - kp_g4a_u08_app_parentheses_grouping: subpoints 1-3
  - kp_g4a_u08_app_mul_div_sequence: all 3 subpoints
  - kp_g4a_u08_app_mul_div_before_add_sub: subpoints 1-2
- Phase2B recommended later:
  - kp_g4a_u08_app_mul_div_before_add_sub subpoint 3
  - kp_g4a_u08_app_mul_div_before_add_sub subpoint 4
  - kp_g4a_u08_app_comparison_and_rate_difference subpoints 1-2

open_design_decisions:
1. Whether Phase2A should already expose all 5 visible KPs or only the lower-risk 4 visible KPs.
2. Whether high-risk subpoints should be hidden pending / not selectable until Phase2B.
3. Whether large overlay application questions should use the same ~20% policy as Phase1 numeric expressions.
4. Whether answer key should show only the final answer or also the modeled equation for Phase2 application questions.

recommended_next_step:
- S56D_G4A_U08_Phase2APatternSpecContract
- Contract should define:
  - 5 visible KP shell or Phase2A visible subset.
  - subpoint-to-PatternSpec mapping.
  - story schema fields.
  - equationModel fields.
  - semantic validator requirements.
  - number controls and unit consistency rules.

GOAL_DISTANCE_BEFORE = D3_G4A_U08_PHASE2_NUMERIC_APPLICATION_COVERAGE_GAPS_IDENTIFIED
GOAL_DISTANCE_AFTER = D3_G4A_U08_PHASE2_GROUPED_KP_SUBPOINTS_COVERAGE_CHECKED
DISTANCE_REDUCED = The Phase2 scope was normalized into 5 visible KP groups with 16 subpoints, and all Phase1 numeric families plus operator-provided application types were mapped with no intentional coverage gap.
REMAINING_BLOCKERS = ["Need operator decision on Phase2A visible subset vs all 5 KPs", "Need decide hidden-pending handling for high-risk subpoints", "Need formal Phase2A PatternSpec contract", "Need answer-key style decision: final answer only vs equation + answer"]
NEXT_SHORTEST_STEP = S56D_G4A_U08_Phase2APatternSpecContract
STOP_REASON = planning_discussion_required
BLOCKER_TYPE = OPERATOR_DECISION_REQUIRED
LAST_COMPLETED_STATUS = S56C_GROUPED_KP_SUBPOINT_COVERAGE_CHECK_COMPLETED
REQUIRED_OPERATOR_ACTION = Review the 5 grouped KPs, 16 subpoints, and phase split before implementation.
NEXT_RESUME_TASK = S56D_G4A_U08_Phase2APatternSpecContract
