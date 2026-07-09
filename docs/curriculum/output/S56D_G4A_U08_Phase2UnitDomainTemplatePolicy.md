S56D_G4A_U08_Phase2UnitDomainTemplatePolicy

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2 應用題
status = UNIT_DOMAIN_TEMPLATE_POLICY_COMPLETED_FOR_DISCUSSION
write_type = application_problem_unit_domain_policy

operator_question:
- Besides the operator-provided life templates, should Phase2 add measurement domains:
  - capacity: L, mL
  - weight: kg, g
  - length: km, m, cm, mm
  - time: hour, minute, second
- Goal: make application problems more life-like.

recommendation:
- Yes, add these domains, but treat them as context/unit-domain overlays, not as new visible KPs.
- The primary Phase2 skill remains equation modeling and operation-order reasoning.
- Unit conversion must be controlled so this does not become a measurement-conversion unit.

policy_layer_1_same_unit_contexts:
- Use in Phase2A by default.
- All quantities in a problem use one unit only.
- Purpose: make problems life-like without adding conversion burden.
- Examples:
  - capacity: 350 mL + 250 mL - 100 mL
  - weight: 2 kg + 3 kg - 1 kg
  - length: 120 cm - 30 cm - 20 cm
  - time: 40 minutes + 15 minutes - 10 minutes
- Validator requirement:
  - all measured quantities share the same unitLabel.
  - final answer retains the same unitLabel.
  - no hidden unit conversion is needed.

policy_layer_2_simple_conversion_overlay:
- Use as optional overlay, not default Phase2A core.
- Recommended for Phase2B or Phase2A advanced bucket only.
- Suggested ratio: 10%-20% at most.
- Allowed conversions:
  - 1 L = 1000 mL
  - 1 kg = 1000 g
  - 1 km = 1000 m
  - 1 m = 100 cm
  - 1 cm = 10 mm
  - 1 hour = 60 minutes
  - 1 minute = 60 seconds
- Do not chain more than one conversion in a single problem during first implementation.
- Avoid conversion plus high-risk semantic models in the same first-pass item.

unit_domain_registry_proposal:
1. money
   - units = 元
   - best_for = price, payment, change, discount, cost components.
   - suitable_subpoints = 題型4, 題型8, 題型9.

2. count_items
   - units = 個, 箱, 盒, 包, 片, 張, 支, 顆, 人, 班
   - best_for = aggregation, sharing, packaging, classroom/materials.
   - suitable_subpoints = 題型1,2,3,6,7,8,11,12,13,14,15.

3. capacity
   - units = L, mL
   - best_for = water, rainwater, drink, medicine liquid, fuel, tank, bottle.
   - same_unit_default = mL or L only.
   - conversion_overlay = L to mL or mL to L only when explicitly enabled.

4. weight
   - units = kg, g
   - best_for = food, powder, ingredients, parcels, cargo.
   - same_unit_default = g for smaller quantities, kg for larger quantities.
   - conversion_overlay = kg to g or g to kg only when explicitly enabled.

5. length
   - units = km, m, cm, mm
   - best_for = wire, rope, road, track, fabric, distance, height/depth.
   - same_unit_default = cm/m for classroom/life; km for distance; mm for tiny measurement.
   - conversion_overlay = only one adjacent conversion per item in the first implementation.

6. time
   - units = 時, 分, 秒
   - best_for = duration, schedule, exercise time, machine runtime, charging time.
   - same_unit_default = minutes or seconds.
   - conversion_overlay = high care because base 60; use only when expression remains clean.

recommended_mapping_to_5_phase2_kps:
- kp_g4a_u08_app_add_sub_sequence:
  - strong domains: capacity, weight, length, time, count_items.
  - examples: rainfall totals, ingredient weights, cable length, elapsed time.

- kp_g4a_u08_app_parentheses_grouping:
  - strong domains: money, capacity, weight, length.
  - examples: discount/adjusted amount, package capacity, group quantity needed.

- kp_g4a_u08_app_mul_div_sequence:
  - strong domains: count_items, capacity, weight, length, time.
  - examples: boxes × items per box ÷ groups; total time ÷ sessions × target sessions.

- kp_g4a_u08_app_mul_div_before_add_sub:
  - strong domains: money, capacity, weight, count_items, length.
  - examples: payment minus unit price × quantity; warehouse inventory plus boxes × units minus shipment.

- kp_g4a_u08_app_comparison_and_rate_difference:
  - strong domains: length, time, capacity, count_items.
  - examples: per-step distance difference, per-minute production difference, rate-difference accumulation.
  - risk: high semantic validation requirement.

answer_key_policy:
- For Phase2 application problems, final answer only may be insufficient for QA/debug.
- Recommended answer key should include at least:
  - equationModel
  - finalAnswerWithUnit
- Student-facing answer key can optionally display only final answer, but internal data should keep equationModel.
- If printed answer key space allows, use: 算式：...；答案：...。

validator_policy:
- Every problem should include structured fields:
  - storyTemplateId
  - unitDomain
  - unitLabel
  - quantities
  - equationModel
  - operationOrderTags
  - finalAnswer
  - finalUnitLabel
  - conversionRequired boolean
  - conversionRule if conversionRequired
- Same-unit Phase2A validator checks:
  - quantity units are consistent.
  - expression evaluates to finalAnswer.
  - finalUnitLabel matches expected unit.
- Conversion overlay validator checks:
  - conversion rule is allowed.
  - conversion is applied exactly once.
  - final answer and unit are coherent.

anti_scope_creep:
- Do not make capacity/weight/length/time into independent visible KPs for G4A-U08 Phase2.
- Do not make the worksheet primarily a unit-conversion worksheet.
- Do not combine unit conversion with comparison-direction or rate-difference problems until semantic validator is stable.
- Do not use decimal answers in first implementation.
- Prefer integer conversions and exact division.

recommended_phase2a_policy:
- Include unit domains in Phase2A as same-unit contexts.
- Use money/count/capacity/weight/length/time as story-domain pools.
- Do not enable conversionRequired in first Phase2A generator unless operator explicitly approves.
- Add conversion overlay later after base application generator and validator pass.

coverage_effect:
- Unit domains improve real-life coverage without changing the 5 visible KP structure.
- They also increase template diversity and reduce repeated life-story shells.
- They should be implemented as template variables and constraints, not as separate curriculum nodes.

open_decisions:
1. Enable only same-unit contexts in Phase2A, or allow a small 10%-20% unit-conversion overlay?
2. For time, should Phase2A allow only same-unit minutes/seconds, or include hour-minute conversion?
3. Should printed answer keys show equationModel plus answer, or final answer only?

recommended_next_step:
- S56E_G4A_U08_Phase2APatternSpecContract
- Contract should include:
  - 5 visible KP groups.
  - 16 subpoints.
  - unitDomain registry.
  - same-unit default policy.
  - optional conversion overlay policy, probably disabled in Phase2A.
  - answer key policy.

GOAL_DISTANCE_BEFORE = D3_G4A_U08_PHASE2_GROUPED_KP_SUBPOINTS_COVERAGE_CHECKED
GOAL_DISTANCE_AFTER = D3_G4A_U08_PHASE2_UNIT_DOMAIN_TEMPLATE_POLICY_DEFINED
DISTANCE_REDUCED = Phase2 application templates now have a unit-domain policy that increases life-like contexts while preserving the 5-KP structure and avoiding scope creep into measurement conversion.
REMAINING_BLOCKERS = ["Need operator decision on same-unit only vs conversion overlay", "Need decide answer-key style", "Need formal Phase2A PatternSpec contract", "Need implementation after contract approval"]
NEXT_SHORTEST_STEP = S56E_G4A_U08_Phase2APatternSpecContract
STOP_REASON = planning_discussion_required
BLOCKER_TYPE = OPERATOR_DECISION_REQUIRED
LAST_COMPLETED_STATUS = S56D_UNIT_DOMAIN_TEMPLATE_POLICY_COMPLETED_FOR_DISCUSSION
REQUIRED_OPERATOR_ACTION = Choose whether Phase2A uses same-unit contexts only or also a limited unit-conversion overlay, and choose answer-key style.
NEXT_RESUME_TASK = S56E_G4A_U08_Phase2APatternSpecContract
