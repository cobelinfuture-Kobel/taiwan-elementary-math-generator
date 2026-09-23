S53E_R0_G4A_U02_NumericPDFCriteriaCorrection

sourceId = g4a_u02_4a02
unit = 4A-U02 整數的乘法
status = CRITERIA_CORRECTION_RECORDED
write_type = operator_criteria_correction

operator_clarification:
- Vertical multiplication rendering is not required for this stage; horizontal expressions are acceptable.
- Bug 3 operand-shape correction:
  1. 一位數 × 二位數 should render one-digit first, e.g. 5 × 20.
  2. 一位數 × 三位數 should render one-digit first, e.g. 3 × 120.
  3. 二位數 × 三位數 should render two-digit first, e.g. 33 × 199.
- The previous vertical-rendering blocker should be downgraded from blocker to non-required criterion for the current stage.

revised_pdf_smoke_interpretation:
- Answer correctness remains PASS.
- Horizontal layout is acceptable.
- Partial-product visual scaffold is not required in S53E_R1 unless explicitly reintroduced.
- Remaining content blockers:
  1. Excessive duplicate prompts.
  2. Operand order / shape mismatch for selected KPs.

bug2_explanation:
- Duplicate bug means too many repeated prompt strings inside the same PDF.
- Example: a 30-question single-KP worksheet should not repeat the same exact item 7-15 times.
- The reviewed PDFs showed:
  - 三位數乘一位數複習: 30 questions, 15 unique prompts, top repeat 486 × 7 = ______ appears 8 times; 125 × 8 = ______ appears 7 times.
  - 一位數乘三位數: 30 questions, 14 unique prompts, top repeat 486 × 7 = ______ appears 8 times; 125 × 8 = ______ appears 7 times.
  - 一位數乘二位數: 30 questions, 14 unique prompts, top repeat 87 × 7 = ______ appears 8 times; 25 × 8 = ______ appears 7 times.
  - 四位數乘一位數缺位: 30 questions, 16 unique prompts, top repeat 1□23 × 8 = 8184 appears 15 times.
  - Mixed PDF: 150 questions, 88 unique prompts, duplicate extras = 62.

revised_fix_scope_S53E_R1:
1. Keep horizontal expression layout.
2. Fix operand order by KP:
   - 1digit_by_2digit: one-digit factor first, two-digit factor second.
   - 1digit_by_3digit: one-digit factor first, three-digit factor second.
   - 2digit_by_3digit: two-digit factor first, three-digit factor second.
   - 3digit_by_2digit: three-digit factor first, two-digit factor second.
3. Reduce duplicates by replacing fixed coverage operands with seed/sequence-varied examples.
4. Add duplicate guard / uniqueness threshold tests.
5. Preserve internal coverage cases: zero, carry, missing digit zero, multiplier multiple of 10, partial-product metadata.
6. Regenerate 8 PDFs after npm test.

acceptance_update:
- S53E remains not accepted because duplicate rate and operand-shape mismatch remain blockers.
- Vertical layout and partial-product visual scaffold are no longer blockers for this stage.

GOAL_DISTANCE_BEFORE = D1_G4A_U02_NUMERIC_PDF_SMOKE_FAIL_CONTENT_BLOCKER
GOAL_DISTANCE_AFTER = D1_G4A_U02_NUMERIC_PDF_CRITERIA_REVISED_FIX_SCOPE_LOCKED
DISTANCE_REDUCED = The blocker set was narrowed: horizontal layout is accepted, leaving duplicate reduction and operand-shape correction as the next effective fix scope.
REMAINING_BLOCKERS = ["Excessive duplicate prompts", "Operand-shape/order mismatch for 1×2, 1×3, 2×3 KPs", "Need npm test after S53E_R1", "Need regenerated PDF smoke after S53E_R1", "Reasoning/text KPs deferred to S53F"]
NEXT_SHORTEST_STEP = S53E_R1_G4A_U02_NumericDuplicateAndOperandOrderFix
STOP_REASON = NONE
BLOCKER_TYPE = NONE
LAST_COMPLETED_STATUS = S53E_R0_CRITERIA_CORRECTION_RECORDED
REQUIRED_OPERATOR_ACTION = NONE
NEXT_RESUME_TASK = S53E_R1_G4A_U02_NumericDuplicateAndOperandOrderFix
