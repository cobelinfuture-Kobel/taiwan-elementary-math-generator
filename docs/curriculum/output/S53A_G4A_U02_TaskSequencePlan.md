S53A_G4A_U02_TaskSequencePlan

sourceId = g4a_u02_4a02
unit = 4A-U02 整數的乘法
status = TASK_SEQUENCE_PLAN_COMPLETED
write_type = task_sequence_plan

preflight:
- G4A-U01 is closed as PASS_ACCEPTED_AND_CLOSED in S52H_G4A_U01_UNIT_CLOSEOUT_PASS.marker.
- Batch A source registry contains g4a_u02_4a02 as 4A-U02 整數的乘法.
- Operator provided G4A-U02 source-image pattern set for multi-digit multiplication.
- Operator clarified zero-involved cases should be internal coverage/subcase, not extra visible KnowledgePoints unless they change strategy.

scope_lock:
- Plan G4A-U02 only.
- Do not start implementation in this task.
- Do not add G4A-U04/G4A-U08/G4B-U01/G5A-U08 work.
- Do not create cross-unit fusion tasks.
- Keep UI-visible KnowledgePoints compact; use internal coverage policy for 0/carry/partial-product cases.

source_pattern_summary_from_operator_images:
- numeric_vertical_1: 三位數 × 一位數複習.
- numeric_vertical_2: 四位數 × 一位數（有缺位）.
- numeric_vertical_3: 一位數 × 二位數.
- numeric_vertical_4: 一位數 × 三位數.
- numeric_vertical_5: 二位數 × 二位數.
- numeric_vertical_6: 二位數 × 三位數.
- numeric_vertical_7: 三位數 × 二位數.
- reasoning_1: 用六張數字卡排出三位數 × 二位數，求最大/最小乘積.
- reasoning_2: 接近整百乘法策略，例如 98×99, 98×101.

planned_visible_knowledge_points:
1. kp_g4a_u02_3digit_by_1digit_review
   - displayName = 三位數乘一位數複習
   - outputStyle = vertical_numeric
   - zeroPolicy = internal coverage only
2. kp_g4a_u02_4digit_by_1digit_missing_digit
   - displayName = 四位數乘一位數缺位
   - outputStyle = vertical_missing_digit
   - zeroPolicy = missingDigitCanBeZero required
3. kp_g4a_u02_1digit_by_2digit
   - displayName = 一位數乘二位數
   - outputStyle = vertical_numeric
   - zeroPolicy = internal coverage only
4. kp_g4a_u02_1digit_by_3digit
   - displayName = 一位數乘三位數
   - outputStyle = vertical_numeric
   - zeroPolicy = internal coverage only
5. kp_g4a_u02_2digit_by_2digit
   - displayName = 二位數乘二位數
   - outputStyle = vertical_numeric_with_partial_products
   - zeroPolicy = internal partial-product / multiplier-multiple-of-10 coverage
6. kp_g4a_u02_2digit_by_3digit
   - displayName = 二位數乘三位數
   - outputStyle = vertical_numeric_with_partial_products
   - zeroPolicy = internal partial-product / operand-zero coverage
7. kp_g4a_u02_3digit_by_2digit
   - displayName = 三位數乘二位數
   - outputStyle = vertical_numeric_with_partial_products
   - zeroPolicy = internal partial-product / operand-zero coverage
8. kp_g4a_u02_digit_card_arrangement_product_max_min
   - displayName = 數字卡排列最大最小乘積
   - outputStyle = reasoning_text_short
   - note = one of two reasoning/text patterns
9. kp_g4a_u02_near_hundred_multiplication_strategy
   - displayName = 接近整百乘法策略
   - outputStyle = strategy_reasoning_text
   - note = one of two reasoning/text patterns

zero_and_special_case_policy:
- Do not add separate visible zero-only KPs in first implementation.
- Each numeric multiplication PatternSpec must define coverageMix.
- Suggested numeric coverage mix:
  - normal_no_carry: 30-40%
  - carry_or_multi_carry: 30-40%
  - zero_in_operand_or_partial_product: 15-25%
  - answer_contains_zero_or_trailing_zero: 10-20%
- Missing-digit PatternSpec must include:
  - missingDigitCanBeZero = true
  - answerZeroCoverageRequired = true
  - no-leading-zero guard for operands/products where applicable
- Two-digit multiplier PatternSpecs must include:
  - multiplier_multiple_of_10 coverage
  - partial_product_zero coverage
  - place-value alignment validation
- Zero cases may be promoted later only if PDF QA shows systematic student-facing confusion or renderer/validator problems.

task_sequence:

S53B_G4A_U02_SourceImagePatternScan
- Goal: convert operator images into KnowledgePoint candidates, PatternSpec candidates, subcases, evidence notes, and visible-vs-internal coverage decision.
- Inputs: operator-provided source images and S53A plan.
- Output: docs/curriculum/output/S53B_G4A_U02_SourceImagePatternScan.md
- Acceptance: 9 visible KP candidates, zero coverage policy, and numeric/text split confirmed.
- Distance target: D4 -> D3.

S53C_G4A_U02_PatternSpecContract
- Goal: write FormalMapping / PatternSpec contract for the 9 visible KPs.
- Must define:
  - operand ranges
  - vertical layout requirements
  - carry/regroup/partial-product semantics
  - missing-digit answer model
  - digit-card max/min product model
  - near-hundred strategy model
  - zero coverage mix
- Output: docs/curriculum/output/S53C_G4A_U02_PatternSpecContract.md
- Acceptance: generator/validator contracts complete without code changes.
- Distance target: D3 -> D2.

S53D_G4A_U02_NumericGeneratorValidatorImplementation
- Goal: implement first 7 numeric vertical multiplication KPs.
- Include internal coverage for 0/carry/partial product.
- Do not implement reasoning text patterns in this task.
- Files likely touched:
  - source-pattern-index.js or sub-extension
  - new/extended G4A-U02 generator module
  - batch-a-browser-validator extension
  - selector registry extension
  - unit tests
- Acceptance: static readback + tests pending.
- Distance target: D2 -> D1 for numeric core.

S53E_G4A_U02_NumericNpmAndPDFSmoke
- Goal: validate first 7 numeric KPs.
- Operator action required:
  - npm test
  - generate single-KP PDFs for the 7 numeric KPs
  - generate one same-unit mixed numeric PDF
- Acceptance:
  - npm pass
  - question/answer count match
  - vertical layout readable
  - answer errors = 0
  - zero/carry/partial-product coverage visible where expected
- Distance target: D1 -> D0 for numeric core.

S53F_G4A_U02_ReasoningPatternImplementation
- Goal: implement the 2 reasoning/text KPs.
- Includes:
  - digit-card arrangement max/min product
  - near-hundred multiplication strategy
- Constraints:
  - short wording for application prompts
  - deterministic answer model
  - explicit validator contract for min/max product and strategy decomposition
- Acceptance: static readback + tests pending.
- Distance target: D2/D1 -> D1 for reasoning KPs.

S53G_G4A_U02_ReasoningNpmAndPDFSmoke
- Goal: validate the two reasoning/text KPs.
- Operator action required:
  - npm test
  - generate two single-KP PDFs
  - generate all-9 same-unit mixed PDF
- Acceptance:
  - reasoning answers correct
  - text length does not break PDF layout
  - mixed generation works
  - shuffleAcrossPatterns interleaves numeric and reasoning patterns
- Distance target: D1 -> D0 for reasoning KPs.

S53H_G4A_U02_UnitCloseout
- Goal: close G4A-U02 only if numeric + reasoning npm/PDF smoke pass.
- Acceptance:
  - all 9 visible KPs selectable
  - all PatternSpecs generated and validated
  - npm pass on public/main
  - single-KP and mixed PDFs pass
  - no open G4A-U02 correctness blocker
- Output: docs/curriculum/output/S53H_G4A_U02_UNIT_CLOSEOUT_PASS.marker
- Distance target: D1 -> D0.

recommended_execution_order:
1. S53B source scan
2. S53C PatternSpec contract
3. S53D numeric implementation
4. S53E numeric npm/PDF smoke
5. S53F reasoning implementation
6. S53G reasoning npm/PDF smoke
7. S53H unit closeout

why_numeric_first:
- 7 of 9 operator-provided patterns are numeric vertical multiplication.
- Numeric KPs share operand/carry/zero/partial-product infrastructure.
- Reasoning/text KPs have different validator and layout risk.
- Splitting avoids one large implementation task and keeps PDF debugging bounded.

anti_scope_creep_decision:
- Do not split zero cases into separate visible KPs now.
- Do not implement all G4A multiplication edge cases from outside the provided images.
- Do not begin G4A-U04 division until G4A-U02 is closed or explicitly paused.

GOAL_DISTANCE_BEFORE = D4_G4A_U02_SOURCE_IMAGES_UNSTRUCTURED
GOAL_DISTANCE_AFTER = D3_G4A_U02_TASK_SEQUENCE_AND_KP_CANDIDATES_PLANNED
DISTANCE_REDUCED = G4A-U02 moved from informal source-image discussion to a bounded 7-task execution sequence with 9 visible KP candidates and internal zero-coverage policy.
REMAINING_BLOCKERS = ["Need S53B source-image pattern scan before contracts", "Need PatternSpec contract before implementation", "Need operator approval before moving from planning-only into implementation", "PDF source images are currently conversation-provided, not yet formalized into repo evidence artifact"]
NEXT_SHORTEST_STEP = S53B_G4A_U02_SourceImagePatternScan
STOP_REASON = planning_to_implementation_requires_operator_approval
BLOCKER_TYPE = OPERATOR_APPROVAL_REQUIRED
LAST_COMPLETED_STATUS = S53A_TASK_SEQUENCE_PLAN_COMPLETED
REQUIRED_OPERATOR_ACTION = Approve S53B source-image pattern scan, or revise the proposed 9-KP scope before implementation starts.
NEXT_RESUME_TASK = S53B_G4A_U02_SourceImagePatternScan
