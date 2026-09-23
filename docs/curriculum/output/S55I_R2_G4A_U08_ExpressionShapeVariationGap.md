S55I_R2_G4A_U08_ExpressionShapeVariationGap

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
status = CONTENT_VARIATION_GAP_CONFIRMED_FIX_REQUIRED
write_type = pdf_content_gap_report

operator_observation:
- The generated PDFs fix the operation position too much.
- This makes the worksheet too monotonous for the item writer/authoring perspective.
- The issue is not answer correctness; it is expression-shape diversity.

confirmed_from_uploaded_pdfs:
- 括號優先計算:
  - Current shapes mostly repeat two fixed shells:
    - a - (b + c)
    - a + (b - c)
    - a ÷ (b × c)
    - a × (b ÷ c)
- 乘除先於加減:
  - Current shapes repeat:
    - a + b × c - d
    - a + b ÷ c - d
- 同級運算由左至右:
  - Current shapes repeat:
    - a - b + c
    - a - b - c
    - a ÷ b × c
    - a × b ÷ c
- 四則與括號綜合計算:
  - Current shapes are broader than the other KPs but still show predictable shells.
  - Large-add/sub overlay also has a separate over-representation issue in single-KP mode from S55I findings.

risk:
- Students may learn the fixed shell rather than the operation-order rule.
- Item authors cannot use the current generator as a sufficiently diverse pattern source.
- The worksheet gives correct answers but has low expression grammar coverage.

required_fix:
- Add an expression-shape variation layer before formal closeout.
- Preserve the same 4 visible KPs.
- Preserve horizontal expression prompt format.
- Preserve exact division, nonnegative integer answers, and small multiplication/division constraints.
- Add multiple shape templates per PatternSpec family instead of one or two fixed shells.
- Keep large-add/sub overlay near 20% for both source-unit mixed and single-KP comprehensive output.

minimum_shape_targets:
1. kp_g4a_u08_parentheses_first
   - Include parentheses at different positions:
     - leading: (a + b) × c - d
     - middle: a + (b - c) × d
     - trailing: a × b + (c - d)
     - divisor/factor: a ÷ (b × c), a × (b ÷ c)
   - Still force parentheses to be the first evaluation target.

2. kp_g4a_u08_mul_div_before_add_sub
   - Vary multiplication/division position:
     - a + b × c - d
     - a - b × c + d
     - b × c + a - d
     - a + d - b × c
     - a + b ÷ c - d
     - a - b ÷ c + d
     - b ÷ c + a - d
     - a + d - b ÷ c
   - Keep final/intermediate results nonnegative.

3. kp_g4a_u08_left_to_right_same_level
   - Vary same-level chains:
     - a - b + c
     - a + b - c
     - a - b - c
     - a ÷ b × c
     - a × b ÷ c
     - a ÷ b ÷ c
   - Ensure examples include cases where wrong grouping gives a different answer.

4. kp_g4a_u08_comprehensive_order_of_operations
   - Vary mixed expressions:
     - a + b × c - d ÷ e
     - a - b ÷ c + d × e
     - a × (b - c) + d - e
     - (a + b) × c - d
     - a + (b - c) × d - e
     - a - b × (c - d) + e
     - largeA + b × c - largeB
     - largeA - (a + b) + c × d
   - Keep overlay ratio controlled.

acceptance_after_fix:
- npm test pass.
- The new tests should assert multiple expression shapes per KP.
- Single-KP PDFs should no longer be dominated by one fixed operator layout.
- The mixed PDF should show visibly varied operator positions.
- Existing checks remain required:
  - answer recomputation errors = 0
  - duplicate prompts = 0 or bounded
  - label leaks = 0
  - large add/sub overlay near 20%
  - no layout blockers

GOAL_DISTANCE_BEFORE = D1_G4A_U08_PDF_SMOKE_REVIEWED_RATIO_FIX_REQUIRED
GOAL_DISTANCE_AFTER = D1_G4A_U08_EXPRESSION_SHAPE_VARIATION_GAP_CONFIRMED
DISTANCE_REDUCED = Converted the operator's qualitative issue into a specific generator coverage blocker and acceptance contract.
REMAINING_BLOCKERS = ["Need npm test readback after previous allocation fix", "Need implement expression-shape variation layer", "Need fix single-KP comprehensive overlay ratio", "Need regenerate G4A-U08 PDFs and smoke them again"]
NEXT_SHORTEST_STEP = S55I_R3_G4A_U08_ExpressionShapeVariationAndRatioFix
STOP_REASON = content_generator_fix_required_before_closeout
BLOCKER_TYPE = CONTENT_VARIATION_BLOCKER
LAST_COMPLETED_STATUS = S55I_R2_VARIATION_GAP_CONFIRMED
REQUIRED_OPERATOR_ACTION = Approve S55I_R3 implementation if the proposed shape targets are acceptable.
NEXT_RESUME_TASK = S55I_R3_G4A_U08_ExpressionShapeVariationAndRatioFix
