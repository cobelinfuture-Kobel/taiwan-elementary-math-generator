S56A_G4A_U08_Phase2ApplicationProblemTypologyScan

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2 應用題
status = TYPOLOGY_SCAN_COMPLETED_FOR_DISCUSSION
write_type = application_problem_typology_scan

scope_note:
- Operator wrote g3a_u08, but the current active unit and submitted examples match G4A-U08 Phase2 application word problems.
- This scan treats the target as G4A-U08 Phase2 unless corrected by the operator.
- This is discussion/planning only; no generator implementation is included in this task.

phase2_goal:
- Convert Phase1 horizontal expression rules into application word-problem families.
- Preserve the core rule set:
  1. parentheses / grouping first when the situation implies a grouped quantity.
  2. multiplication/division before addition/subtraction when rates, unit prices, or equal sharing appear with add/sub conditions.
  3. same-level operations are handled left-to-right when the situation is sequential change or same-level chain.
- Use scenario wording to force an equation model, not just arithmetic computation.

operator_supplied_typology:
1. 題型1 連續加法
   - math model = a + b + c
   - example type = three additive quantities aggregated.
   - likely KP link = same-level add/sub; low-complexity prerequisite.

2. 題型2 先加再減
   - math model = a + b - c
   - example type = start amount, increase, then decrease.
   - likely KP link = add/sub left-to-right; sequential state change.

3. 題型3 先減再加
   - math model = a - b + c
   - example type = start amount, decrease, then increase.
   - likely KP link = add/sub left-to-right; sequential state change.

4. 題型4 有括號
   - math model = pay - (base - discount) OR total - (base - decrease)
   - example type = first compute adjusted price/amount, then compare/pay/subtract.
   - likely KP link = parentheses first.

5. 題型5 比較型問法
   - math model = given A and relationships A to B, B to C; solve C.
   - common shape = C = A - diffAB + diffCB depending relation direction.
   - likely KP link = add/sub left-to-right with semantic direction reasoning.
   - special risk = wording direction is more important than arithmetic order.

6. 題型6 先乘再除
   - math model = boxes × perBox ÷ groups
   - example type = total from multiplication, then equal sharing.
   - likely KP link = mul/div left-to-right or multiplication-before-sharing.

7. 題型7 先除再乘
   - math model = totalCost ÷ knownUnits × targetUnits
   - example type = unit rate, then scale to target quantity.
   - likely KP link = mul/div left-to-right and rate reasoning.

8. 題型8 先乘除後加減(1)
   - math model = payment - unitPrice × quantity
   - example type = one cost component and change from payment.
   - likely KP link = multiplication before subtraction.

9. 題型9 先乘除後加減(2)
   - math model = payment - unitRateA × quantityA - packageRateB ÷ packageQtyB × quantityB
   - example type = two cost components, one direct unit price and one derived unit price.
   - likely KP link = multiplication/division before addition/subtraction; mixed no-parentheses.

10. 題型10 差距追及/同時變化
   - math model = targetDifference ÷ (rateA - rateB)
   - example type = two agents start together; per-step difference accumulates.
   - likely KP link = parentheses/grouping first because the per-step difference is a grouped rate.
   - This is conceptually harder than the other nine and may need a later difficulty tier.

initial_grouping_for_system_design:
A. Same-level add/sub word problems
- 題型1 連續加法
- 題型2 先加再減
- 題型3 先減再加
- 題型5 比較型問法

B. Parentheses / grouped-quantity word problems
- 題型4 有括號
- 題型10 差距追及/同時變化

C. Same-level mul/div word problems
- 題型6 先乘再除
- 題型7 先除再乘

D. Multiplication/division before add/sub word problems
- 題型8 先乘除後加減(1)
- 題型9 先乘除後加減(2)

complexity_tier_proposal:
- Tier 1: 題型1, 2, 3, 6, 7
  - direct sequential or same-level operation.
- Tier 2: 題型4, 8
  - one grouped/priority operation plus one outer add/sub step.
- Tier 3: 題型5, 9
  - wording direction or two cost components.
- Tier 4: 題型10
  - rate difference / same-time cumulative difference; may be too conceptually deep for first printable Phase2 batch unless explicitly accepted.

implementation_risks:
- 題型5 comparison wording can be semantically correct but easy for generator to invert; needs explicit relationship direction fields.
- 題型9 combines unit-price derivation and payment/change; needs exact division and nonnegative change.
- 題型10 requires per-step difference; if described poorly it becomes a rate/linear equation problem rather than basic four-operations application.
- Unit consistency must be enforced: mm, mg, ml, cm, people, items, dollars, etc.
- Values should remain small enough that reading/modeling is the focus.

recommended_next_discussion:
- Decide whether Phase2 should implement all 10 types at once or split into Phase2A/Phase2B.
- Recommended split:
  - Phase2A = 題型1-4, 6-8
  - Phase2B = 題型5, 9, 10
- Reason: 題型5/9/10 require stronger semantic constraints and more validator coverage.

candidate_visible_kp_mapping:
1. kp_g4a_u08_app_add_sub_sequence
   - covers 題型1, 2, 3
2. kp_g4a_u08_app_parentheses_grouping
   - covers 題型4
3. kp_g4a_u08_app_mul_div_sequence
   - covers 題型6, 7
4. kp_g4a_u08_app_mul_div_before_add_sub
   - covers 題型8, 9
5. kp_g4a_u08_app_comparison_and_rate_difference
   - covers 題型5, 10

operator_decision_needed:
- Option A: implement 10 types as 10 visible KPs.
- Option B: implement 5 visible KPs as grouped application-problem families.
- Option C: Phase2A first with only direct lower-risk types, then Phase2B for comparison/rate-difference types.

GOAL_DISTANCE_BEFORE = D0_G4A_U08_PHASE1_UNIT_CLOSED
GOAL_DISTANCE_AFTER = D3_G4A_U08_PHASE2_APPLICATION_TYPOLOGY_SCANNED
DISTANCE_REDUCED = G4A-U08 Phase2 application examples were converted into a structured typology, initial KP grouping, risk list, and implementation split proposal.
REMAINING_BLOCKERS = ["Need operator decision: 10 visible types vs 5 grouped KPs", "Need decide whether to split Phase2A/Phase2B", "Need formal PatternSpec contract for selected Phase2 scope", "Need generator/validator implementation after contract approval"]
NEXT_SHORTEST_STEP = S56B_G4A_U08_Phase2ScopeAndPatternSpecContract
STOP_REASON = planning_discussion_required
BLOCKER_TYPE = OPERATOR_DECISION_REQUIRED
LAST_COMPLETED_STATUS = S56A_TYPOLOGY_SCAN_COMPLETED_FOR_DISCUSSION
REQUIRED_OPERATOR_ACTION = Discuss/choose the Phase2 scope split and KP granularity before implementation.
NEXT_RESUME_TASK = S56B_G4A_U08_Phase2ScopeAndPatternSpecContract
