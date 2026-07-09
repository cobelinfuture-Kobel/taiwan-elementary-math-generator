S56B_G4A_U08_Phase2NumericToApplicationCoverageGap

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2 應用題
status = NUMERIC_TO_APPLICATION_COVERAGE_GAP_ANALYZED
write_type = phase2_coverage_gap_analysis

input_basis:
- Phase1 numeric PatternSpecs were closed in S55J_G4A_U08_UNIT_CLOSEOUT_PASS.marker.
- Operator supplied 10 application problem types after Phase1 closeout.
- This task compares Phase1 numeric expression families against the 10 application types.

phase1_numeric_patternspecs:
1. ps_g4a_u08_parentheses_add_sub
2. ps_g4a_u08_parentheses_mul_div
3. ps_g4a_u08_mul_before_add_sub
4. ps_g4a_u08_div_before_add_sub
5. ps_g4a_u08_add_sub_left_to_right
6. ps_g4a_u08_mul_div_left_to_right
7. ps_g4a_u08_mixed_mul_div_add_sub_no_parentheses
8. ps_g4a_u08_mixed_with_parentheses
9. ps_g4a_u08_large_add_sub_overlay_no_parentheses
10. ps_g4a_u08_large_add_sub_overlay_with_parentheses

operator_application_types:
1. 題型1 連續加法 => a + b + c
2. 題型2 先加再減 => a + b - c
3. 題型3 先減再加 => a - b + c
4. 題型4 有括號 => payment - (base - discount) or total - (base - decrease)
5. 題型5 比較型問法 => relation-direction add/sub reasoning
6. 題型6 先乘再除 => boxes × perBox ÷ groups
7. 題型7 先除再乘 => total ÷ knownUnits × targetUnits
8. 題型8 先乘除後加減(1) => payment - unitPrice × quantity
9. 題型9 先乘除後加減(2) => payment - directUnitRate × qty - packageRate ÷ packageQty × qty
10. 題型10 差距追及/同時變化 => targetDifference ÷ (rateA - rateB)

coverage_matrix:
- ps_g4a_u08_parentheses_add_sub:
  - status = covered
  - covered_by = 題型4, 題型10 partially
  - notes = 題型4 strongly covers grouped add/sub or discounted quantity; 題型10 uses rateA-rateB grouping.

- ps_g4a_u08_parentheses_mul_div:
  - status = missing
  - missing_shape_examples = a ÷ (b × c), a × (b ÷ c), (a × b) ÷ c + d
  - notes = No submitted application type clearly requires first evaluating multiplication/division inside parentheses.

- ps_g4a_u08_mul_before_add_sub:
  - status = covered
  - covered_by = 題型8, 題型9 partially
  - notes = payment - unitPrice × quantity is a direct application of multiplication before subtraction.

- ps_g4a_u08_div_before_add_sub:
  - status = weak_or_partial
  - covered_by = 題型9 partially
  - missing_shape_examples = payment - total ÷ people, total + items ÷ groups - used
  - notes = 題型9 has division inside a cost component, but there is no simple standalone division-before-add/sub application equivalent to Phase1 numeric div_before_add_sub.

- ps_g4a_u08_add_sub_left_to_right:
  - status = mostly_covered_with_gap
  - covered_by = 題型1, 題型2, 題型3, 題型5
  - missing_shape_examples = a - b - c continuous subtraction
  - notes = The supplied types cover a+b+c, a+b-c, a-b+c, and semantic comparison. They do not explicitly cover a-b-c as sequential double-decrease.

- ps_g4a_u08_mul_div_left_to_right:
  - status = mostly_covered_with_gap
  - covered_by = 題型6, 題型7
  - missing_shape_examples = a ÷ b ÷ c continuous division
  - notes = 題型6 covers multiply then divide. 題型7 covers divide then multiply. No type explicitly covers divide then divide.

- ps_g4a_u08_mixed_mul_div_add_sub_no_parentheses:
  - status = covered
  - covered_by = 題型9
  - notes = 題型9 can combine multiplication, division, subtraction, and derived unit-price components without parentheses.

- ps_g4a_u08_mixed_with_parentheses:
  - status = weak_or_partial
  - covered_by = 題型10 partially; 題型4 partially
  - missing_shape_examples = a + b × (c - d), a - b × (c - d) + e, a + b ÷ (c - d) × e
  - notes = Existing application types contain grouped quantities, but not enough cases where parentheses interact with multiplication/division and outer add/sub in a broad mixed expression.

- ps_g4a_u08_large_add_sub_overlay_no_parentheses:
  - status = missing
  - missing_shape_examples = largeA + b × c - largeB, largeA - total ÷ groups + largeB
  - notes = Operator examples mostly use small numbers around 10-100 and do not include Phase1's 1萬以下 large add/sub overlay.

- ps_g4a_u08_large_add_sub_overlay_with_parentheses:
  - status = missing
  - missing_shape_examples = largeA - (a + b) + c × d, largeA + c × (d - e) - largeB
  - notes = No submitted application type combines large add/sub wrapping with parentheses and multiplication/division.

strict_missing_numeric_families:
1. parentheses_mul_div
2. large_add_sub_overlay_no_parentheses
3. large_add_sub_overlay_with_parentheses

partial_or_weak_numeric_families:
1. div_before_add_sub simple standalone application
2. add_sub_left_to_right continuous subtraction a-b-c
3. mul_div_left_to_right continuous division a÷b÷c
4. mixed_with_parentheses broad parenthesized mixed expressions

application_only_or_extra_family:
- 題型1 連續加法 is an application-family prerequisite not represented as a dedicated Phase1 numeric PatternSpec.
- It can be mapped under add/sub sequence, but if Phase2 uses 10 visible types it may become its own visible type.

recommended_new_application_types_to_fill_gaps:
11. 連續減法
   - model = a - b - c
   - example = 倉庫原有100箱，上午出貨30箱，下午又出貨20箱，還剩幾箱？

12. 單純先除再加減
   - model = payment - total ÷ groups OR a + b ÷ c - d
   - example = 老師有84顆糖，平分給7組後，自己又留下5顆，總共算作幾顆？

13. 連續除法
   - model = a ÷ b ÷ c
   - example = 120張貼紙先平均分成4包，每包再平均分給5人，每人得幾張？

14. 括號內乘除
   - model = a ÷ (b × c) or a × (b ÷ c)
   - example = 有150支筆，每組需要3盒，每盒5支，可以分成幾組？

15. 括號混合乘除與加減
   - model = a + b × (c - d) or a - b × (c - d) + e
   - example = 每份材料要4包，原本要做9份，取消2份後，又多買10包，共需要幾包？

16. 大數加減包裝
   - model = largeA + b × c - largeB; largeA - (a+b) + c×d
   - example = 倉庫有5670件貨，今天補進8箱、每箱6件，又出貨1200件，還剩幾件？

implementation_recommendation:
- Do not implement all missing gaps as separate visible KPs immediately.
- Add missing shapes as PatternSpecs under the 5 grouped Phase2 application KPs.
- Keep Phase2A lower-risk scope as 題型1-4, 6-8 plus selected gap fillers 11, 12, 13, 14.
- Reserve 題型5, 9, 10 and large overlay variants for Phase2B unless operator wants full coverage now.

GOAL_DISTANCE_BEFORE = D3_G4A_U08_PHASE2_APPLICATION_TYPOLOGY_SCANNED
GOAL_DISTANCE_AFTER = D3_G4A_U08_PHASE2_NUMERIC_APPLICATION_COVERAGE_GAPS_IDENTIFIED
DISTANCE_REDUCED = Phase2 application types were compared against Phase1 numeric PatternSpecs; strict missing, partial coverage, and recommended gap-filler application types were identified.
REMAINING_BLOCKERS = ["Need operator decision whether to add gap-filler types 11-16", "Need decide Phase2A scope", "Need formal PatternSpec contract after scope decision"]
NEXT_SHORTEST_STEP = S56C_G4A_U08_Phase2ScopeDecisionAndContract
STOP_REASON = planning_discussion_required
BLOCKER_TYPE = OPERATOR_DECISION_REQUIRED
LAST_COMPLETED_STATUS = S56B_NUMERIC_TO_APPLICATION_COVERAGE_GAP_ANALYZED
REQUIRED_OPERATOR_ACTION = Discuss whether to add the missing numeric families into Phase2 application scope and choose Phase2A/Phase2B split.
NEXT_RESUME_TASK = S56C_G4A_U08_Phase2ScopeDecisionAndContract
