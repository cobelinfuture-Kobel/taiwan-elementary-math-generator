S52 R4 G3A-U06 Parity Unique Pool Fix
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3a_u06_3a06
AFFECTED_KP = kp_g3a_u06_parity_range_missing_digit
AFFECTED_SPEC = ps_g3a_u06_parity_range_missing_digit

Failure readback:
- Browser smoke showed: batch_a_g3a_u06_unique_pool_exhausted.
- UI context showed 4 columns and 10 rows per page, so a single-KP full page can request 40 printable prompts.
- The old parity generator only cycled a small fixed set of tens digit / parity / bounds combinations, so single-KP parity worksheets could exhaust the duplicate-safe pool.

Fix:
- Expanded parity-range generation by varying tens digit, parity target, lower bound, and upper bound.
- Kept answer enumeration deterministic and validator-auditable.
- Restored full condition text in blankedDisplayText so printable prompts include both range constraints.
- Added tests for 40 unique parity prompts.
- Added worksheet smoke for a 4x10 single-KP parity worksheet.

GOAL_DISTANCE_BEFORE = D1_G3A_U06_S52_LOCAL_PASS_BROWSER_PDF_SMOKE_PENDING
GOAL_DISTANCE_AFTER = D1_G3A_U06_PARITY_UNIQUE_POOL_FIX_IMPLEMENTED_PENDING_READBACK
DISTANCE_REDUCED = fixed browser-smoke blocker where parity single-KP worksheet could exhaust the unique prompt pool
REMAINING_BLOCKERS = npm test readback pending; browser PDF smoke pending; Pages deploy may need rerun
NEXT_SHORTEST_STEP = git pull public main; npm test; git status; regenerate G3A-U06 parity or mixed worksheet
