S52 R5 G3A-U06 Parity Multi-Answer Distribution Fix
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3a_u06_3a06
AFFECTED_KP = kp_g3a_u06_parity_range_missing_digit
AFFECTED_SPEC = ps_g3a_u06_parity_range_missing_digit

PDF smoke readback:
- g3a_u06_同單位混合知識點隨機2.pdf passed six-KP mixed allocation/order and answer-key smoke.
- g3a_u06_奇偶數判斷.pdf generated successfully and no longer exhausted the unique pool.
- However, the first 20 parity prompts were mostly single-answer intervals.
- Original source-style example expects possible-answer enumeration such as 3□ > 30 and 3□ < 37 => 32、34、36.

Fix:
- Parity interval selection now prefers multi-answer intervals for most prompts.
- Single-answer intervals are still retained periodically for variation.
- The first 20 prompts must now include at least four multi-answer prompts.
- Multi-answer prompts continue to use deterministic full-answer enumeration and audit validation.

Files updated:
- site/modules/curriculum/batch-a/g3a-u06-parity-generator.js
- tests/curriculum/g3a-u06-parity-range.test.js

Validation required:
- git pull public main
- npm test
- git status
- regenerate g3a_u06_奇偶數判斷.pdf

GOAL_DISTANCE_BEFORE = D1_G3A_U06_MIXED_PASS_PARITY_VARIATION_FIX_NEEDED
GOAL_DISTANCE_AFTER = D1_G3A_U06_PARITY_MULTI_ANSWER_DISTRIBUTION_FIX_IMPLEMENTED_PENDING_READBACK
DISTANCE_REDUCED = parity PDF smoke quality blocker fixed at generator/test contract level
REMAINING_BLOCKERS = npm test readback pending; parity PDF smoke pending; Pages deploy may need rerun
NEXT_SHORTEST_STEP = git pull public main; npm test; git status; regenerate parity PDF
