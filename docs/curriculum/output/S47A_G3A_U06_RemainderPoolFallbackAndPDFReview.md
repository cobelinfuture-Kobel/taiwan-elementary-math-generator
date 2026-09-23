S47A_G3A_U06_RemainderPoolFallbackAndPDFReview

sourceId = g3a_u06_3a06
unit = 3A-U06 二位數除以一位數
status = IMPLEMENTED_PENDING_CI_OR_BROWSER_READBACK
operator_report = 100 questions can print; 150 questions failed with batch_a_remainder_dividend_out_of_range; if one knowledge-point pool is insufficient, fill from other same-unit knowledge points and show which pool is insufficient.
write_type = code_fix_plus_review_report

batch_membership_check:
- Batch A does not include g3a_u04_3a04.
- Batch A includes g3a_u06_3a06.
- g3a_u04_3a04 belongs to later visual/measurement scope and is not part of this fix.

pdf_review:
- Uploaded G3A-U06 100-question PDF reviewed from parsed content.
- Question pages cover Q1-Q100.
- Answer key pages cover Q1-Q100.
- Observed worksheet cycle includes:
  - division with remainder
  - quotative division / packaging word problems
  - parity missing digit range reasoning
  - exact division
  - divisibility exact check
  - partitive division / equal sharing word problems
- The uploaded 100-question PDF is consistent with the intended G3A-U06 division scope.

root_cause:
- The previous remainder generator could produce dividends above the PatternSpec range [10, 99] when sequenceNumber grew past the smaller smoke count.
- With 150 questions, the allocation requested enough remainder questions to reach those out-of-range generated dividends.
- Validator correctly rejected these as batch_a_remainder_dividend_out_of_range.

files_modified:
- site/modules/curriculum/batch-a/g3a-u06-remainder-generator.js
- site/modules/curriculum/batch-a/g3a-u06-division-generator.js

changes:
- Replaced the remainder model with a precomputed valid two-digit dividend pool.
- Every generated remainder item now satisfies:
  - 10 <= dividend <= 99
  - 2 <= divisor <= 9
  - 0 < remainder < divisor
  - dividend = divisor * quotient + remainder
- Added same-unit fallback behavior in planned division generation.
- If a requested knowledge-point / pattern pool is exhausted, generation records a warning naming the insufficient knowledge point / pattern and attempts to fill the remaining count from other same-unit patterns.
- If fallback still cannot fill the target count, the error message includes the missing count and the specific insufficient pool details.

expected_user_visible_change:
- G3A-U06 150-question same-unit mixed generation should no longer fail from batch_a_remainder_dividend_out_of_range.
- If a future pool is truly insufficient, the validation panel should show a warning like:
  知識點/題型「...」可用題庫不足：要求 N 題，目前只產生 M 題；系統會改由同單元其他知識點補足 K 題。

validation_status:
- Static GitHub readback completed for modified files.
- CI status was not available through connector status endpoints for the latest commit at the time of this report.
- Browser readback is required: select g3a_u06_3a06, set questionCount = 150, seed = batch-a-browser, include answer key, generate.

anti_scope_check:
- No Batch D g3a_u04 implementation performed.
- No UI redesign performed.
- No renderer-wide blank-page cleanup performed.
- No Batch B/C/D/E expansion performed.

GOAL_DISTANCE_BEFORE = D1_G3A_U06_100_PASS_150_REMAINDER_RANGE_BLOCKED
GOAL_DISTANCE_AFTER = D1_G3A_U06_REMAINDER_POOL_FALLBACK_IMPLEMENTED_PENDING_BROWSER_READBACK
DISTANCE_REDUCED = G3A-U06 150-question failure was localized to the remainder generator range and same-unit pool fallback behavior; code fix was written and read back.
REMAINING_BLOCKERS = ["browser readback for g3a_u06 questionCount=150", "CI/readback unavailable from connector status endpoint", "browser/PDF smoke later", "optional renderer-wide blank-page cleanup backlog"]
NEXT_SHORTEST_STEP = S47A_R1_G3A_U06_150QuestionBrowserReadback
