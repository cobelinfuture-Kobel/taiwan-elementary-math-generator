S53E_R1_G4A_U02_NumericDuplicateAndOperandOrderFix

sourceId = g4a_u02_4a02
unit = 4A-U02 整數的乘法
status = FIX_APPLIED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = numeric_quality_fix_report

scope_lock:
- Fix only S53E numeric PDF smoke blockers confirmed after operator criteria correction.
- Keep horizontal expression layout; vertical multiplication rendering is not required in this stage.
- Do not start S53F reasoning/text implementation yet.
- Do not add zero-only visible KnowledgePoints.

operator_criteria_applied:
- 一位數 × 二位數 must display one-digit factor first, e.g. 5 × 20.
- 一位數 × 三位數 must display one-digit factor first, e.g. 3 × 120.
- 二位數 × 三位數 must display two-digit factor first, e.g. 33 × 199.
- 三位數 × 二位數 must display three-digit factor first, e.g. 199 × 33.
- Horizontal output is accepted.

fixes_implemented:
1. Operand display order fix
- Added displayLeftFactor / displayRightFactor / displayOrder fields.
- Added displayOperandDigitCounts.
- For ps_g4a_u02_1digit_by_2digit, ps_g4a_u02_1digit_by_3digit, and ps_g4a_u02_2digit_by_3digit, the generator flips display order while preserving internal multiplicand/multiplier model used for validation.
- ps_g4a_u02_3digit_by_2digit remains multiplicand-first.
- blankedDisplayText, promptText, and displayText now use the corrected display order.

2. Duplicate reduction fix
- Replaced fixed coverage operands such as 486 × 7, 125 × 8, 1□23 × 8 with sequence-varied operand pools.
- Added varied pools for:
  - no-carry cases
  - carry cases
  - zero-in-operand cases
  - trailing-zero / zero-in-product cases
  - multiplier-multiple-of-10 / partial-product-zero cases
  - missing-digit zero-answer cases
- Added prompt-level duplicate guard keyed by PatternSpec + blankedDisplayText.
- Generation now errors with g4a_u02_unique_pool_exhausted if a requested count cannot be met with unique prompts.
- Fixed per-pattern coverage sequencing to use local attempt sequence rather than global question count; this preserves missing-digit zero-answer coverage and normal coverage cycling.

files_modified:
- site/modules/curriculum/batch-a/g4a-u02-numeric-generator.js
- tests/curriculum/batch-a/g4a-u02-numeric.test.js

new_test_coverage:
- G4A-U02 operand display order matches KP names:
  - ps_g4a_u02_1digit_by_2digit => display digits [1, 2]
  - ps_g4a_u02_1digit_by_3digit => display digits [1, 3]
  - ps_g4a_u02_2digit_by_3digit => display digits [2, 3]
  - ps_g4a_u02_3digit_by_2digit => display digits [3, 2]
- Single-KP worksheets avoid excessive duplicate prompts.
- Mixed 150-question numeric worksheet duplicate rate is bounded.
- Existing coverage tests still assert zero, partial-product, missing-zero, validator, worksheet, answer key, and shuffle behavior.

static_readback:
- Horizontal expression layout remains active.
- Corrected display order is stored explicitly and rendered through blankedDisplayText.
- Internal multiplication model remains validator-compatible.
- Duplicate guard is applied before each accepted question.
- Reasoning/text KPs remain deferred.

not_claimed:
- npm test has not been run in this environment.
- Regenerated S53E_R1 PDFs have not yet been inspected.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_pdf_regeneration_after_test_pass:
- Regenerate the same 8 PDFs:
  - g4a_u02_三位數乘一位數複習.pdf
  - g4a_u02_四位數乘一位數缺位.pdf
  - g4a_u02_一位數乘二位數.pdf
  - g4a_u02_一位數乘三位數.pdf
  - g4a_u02_二位數乘二位數.pdf
  - g4a_u02_二位數乘三位數.pdf
  - g4a_u02_三位數乘二位數.pdf
  - g4a_u02_同單位知識點混合_隨機排序.pdf

expected_pdf_smoke_checks:
- Answer errors = 0.
- Single-KP duplicate rate acceptable.
- Mixed duplicate rate acceptable.
- 1×2, 1×3, 2×3, 3×2 display shapes match operator criteria.
- Zero-involved and missing-digit-zero coverage remains visible.

GOAL_DISTANCE_BEFORE = D1_G4A_U02_NUMERIC_PDF_CRITERIA_REVISED_FIX_SCOPE_LOCKED
GOAL_DISTANCE_AFTER = D1_G4A_U02_NUMERIC_DUPLICATE_AND_OPERAND_FIX_APPLIED_TEST_PENDING
DISTANCE_REDUCED = G4A-U02 numeric PDF blockers were narrowed and patched: horizontal layout remains accepted, while operand display order and duplicate prompt generation are fixed in code with tests added.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after S53E_R1", "Need regenerated numeric PDFs and smoke review", "Reasoning/text KPs deferred to S53F"]
NEXT_SHORTEST_STEP = S53E_R2_G4A_U02_NumericNpmRetestAndPDFSmoke
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S53E_R1_FIX_APPLIED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, run npm test, then regenerate the 8 G4A-U02 numeric PDFs.
NEXT_RESUME_TASK = S53E_R2_G4A_U02_NumericNpmRetestAndPDFSmoke
