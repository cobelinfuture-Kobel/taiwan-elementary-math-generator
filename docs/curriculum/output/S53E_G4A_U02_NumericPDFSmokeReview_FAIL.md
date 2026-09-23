S53E_G4A_U02_NumericPDFSmokeReview_FAIL

sourceId = g4a_u02_4a02
unit = 4A-U02 整數的乘法
status = FAIL_CONTENT_QUALITY_BLOCKER
write_type = numeric_pdf_smoke_review

scope_reviewed:
- g4a_u02_三位數乘一位數複習.pdf
- g4a_u02_四位數乘一位數缺位.pdf
- g4a_u02_一位數乘二位數.pdf
- g4a_u02_一位數乘三位數.pdf
- g4a_u02_二位數乘二位數.pdf
- g4a_u02_二位數乘三位數.pdf
- g4a_u02_三位數乘二位數.pdf
- g4a_u02_同單位知識點混合_隨機排序.pdf

inspection_method:
- Rendered PDFs to PNG for visual layout smoke.
- Extracted text from every page.
- Parsed question and answer items.
- Recomputed multiplication products and missing-digit answers.
- Counted unique prompts and duplicates.

answer_correctness_result:
- Single-KP PDFs: 30 questions each, 30 answer items each.
- Mixed PDF: 150 questions, 150 answer items.
- Recomputed answer_errors = 0 across all reviewed PDFs.
- Missing-digit equations also recomputed correctly.

layout_result:
- Content is readable and not clipped in rendered smoke.
- Single-KP PDFs have 6 pages each: question pages 1-2, blank pages 3 and 6, answer pages 4-5.
- Mixed PDF has 22 pages: question pages 1-10, blank pages 11 and 22, answer pages 12-21.
- Blank pages are recorded as existing renderer pagination artifact, not the primary math correctness blocker.

blocking_findings:

BUG_1_VERTICAL_SOURCE_PATTERN_NOT_RENDERED:
- S53C/S53D contract and source images are vertical multiplication patterns.
- Output PDFs render compact horizontal expressions such as '486 × 7 = ______' instead of vertical column multiplication.
- This affects all 7 numeric KPs and the mixed PDF.
- This is a source-alignment blocker because the unit source images emphasize vertical multiplication layout, digit columns, carries, and partial-product alignment.

BUG_2_EXCESSIVE_DUPLICATES:
- Duplicate rate is too high for worksheet quality.
- 三位數乘一位數複習: 30 questions, unique prompts = 15, duplicate extras = 15. Top repeats: '486 × 7 = ______' appears 8 times; '125 × 8 = ______' appears 7 times.
- 一位數乘三位數: 30 questions, unique prompts = 14, duplicate extras = 16. Top repeats: '486 × 7 = ______' appears 8 times; '125 × 8 = ______' appears 7 times.
- 一位數乘二位數: 30 questions, unique prompts = 14, duplicate extras = 16. Top repeats: '87 × 7 = ______' appears 8 times; '25 × 8 = ______' appears 7 times.
- 四位數乘一位數缺位: 30 questions, unique prompts = 16, duplicate extras = 14. Top repeat: '1□23 × 8 = 8184' appears 15 times.
- 二位數乘二位數: 30 questions, unique prompts = 20, duplicate extras = 10. Top repeats: '87 × 36 = ______' appears 6 times; '25 × 40 = ______' appears 6 times.
- 三位數乘二位數: 30 questions, unique prompts = 23, duplicate extras = 7. Top repeat: '486 × 36 = ______' appears 6 times.
- 二位數乘三位數: 30 questions, unique prompts = 23, duplicate extras = 7. Top repeat: '486 × 36 = ______' appears 6 times.
- Mixed PDF: 150 questions, unique prompts = 88, duplicate extras = 62. Top repeats: '1□23 × 8 = 8184' appears 11 times, '486 × 7 = ______' appears 11 times, '125 × 8 = ______' appears 10 times, '486 × 36 = ______' appears 8 times.

BUG_3_OPERAND_ORDER_AND_KP_DISTINCTION_ERODED_BY_HORIZONTAL_OUTPUT:
- '一位數乘二位數' renders as two-digit × one-digit examples such as 30 × 5, 87 × 7, 40 × 6.
- '一位數乘三位數' renders as three-digit × one-digit examples such as 579 × 9, 486 × 7.
- '二位數乘三位數' and '三位數乘二位數' both render as three-digit × two-digit expression shapes.
- Because output is horizontal, source-image distinctions by vertical operand placement and column alignment are lost.

BUG_4_PARTIAL_PRODUCT_LEARNING_SURFACE_ABSENT:
- Two-digit multiplier patterns have partialProducts metadata internally, but PDFs only show final answer blank.
- Source images for two-digit multiplier patterns emphasize partial-product / place-value alignment.
- Current PDF does not show the partial-product rows or vertical alignment scaffold, so the intended learning target is not visible.

non_blocking_positive_findings:
- Numeric answer computation is correct.
- Missing-digit answer computation is correct.
- Same-unit mixed random ordering is not grouped-only; mixed PDF visibly interleaves different PatternSpecs.
- Zero-involved cases are present.
- Multiplier-multiple-of-10 cases are present.

acceptance_decision:
- Do not accept S53E numeric PDF smoke.
- Do not proceed to S53F reasoning implementation yet.
- Fix S53D numeric rendering/generator quality first.

recommended_fix_scope_S53E_R1:
1. Add vertical multiplication display model for G4A-U02 numeric KPs.
2. Preserve source-specific operand order/placement in rendered prompt.
3. Show partial-product rows or vertical scaffold for two-digit multiplier KPs.
4. Replace fixed coverage operands with seed/sequence-varied pools while keeping coverage cases.
5. Add duplicate guard/unique-pool policy for single-KP and mixed output.
6. Add tests for uniqueness thresholds and vertical representation fields.
7. Regenerate the same 8 PDFs for smoke review.

GOAL_DISTANCE_BEFORE = D1_G4A_U02_NUMERIC_IMPLEMENTED_STATIC_READBACK_PASS_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U02_NUMERIC_PDF_SMOKE_FAIL_CONTENT_BLOCKER
DISTANCE_REDUCED = No distance reduction from PDF smoke; the task exposed correctness-adjacent content quality blockers that prevent numeric closeout.
REMAINING_BLOCKERS = ["G4A-U02 numeric output is horizontal rather than vertical source-aligned", "Excessive duplicate prompts", "Operand-order/KP distinction is unclear", "Partial-product learning surface absent", "Need npm test readback after fixes", "Need regenerated PDF smoke after fixes", "Reasoning/text KPs deferred to S53F"]
NEXT_SHORTEST_STEP = S53E_R1_G4A_U02_NumericVerticalLayoutAndDuplicateFix
STOP_REASON = pdf_smoke_failed
BLOCKER_TYPE = CONTENT_QUALITY_BLOCKER
LAST_COMPLETED_STATUS = S53E_NUMERIC_PDF_SMOKE_REVIEW_FAIL
REQUIRED_OPERATOR_ACTION = NONE; fix is within approved G4A-U02 numeric scope.
NEXT_RESUME_TASK = S53E_R1_G4A_U02_NumericVerticalLayoutAndDuplicateFix
