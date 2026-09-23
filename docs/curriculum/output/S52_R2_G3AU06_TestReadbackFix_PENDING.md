S52 R2 G3A-U06 Test Readback Fix
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3a_u06_3a06

Failure readback:
- npm test reported tests 370, pass 360, fail 10.
- Nine failures were stale Batch A visibleCount assertions expecting 19 after G3A-U06 grew from 2 to 6 visible KPs.
- One failure was an old division source smoke asserting every G3A-U06 source-level answer was an integer; G3A-U06 now intentionally includes text and multi-answer KPs.

Fix:
- Updated stale visibleCount assertions to 23.
- Updated the division source smoke to assert all six G3A-U06 PatternSpecs are generated instead of requiring all final answers to be integer raw values.

GOAL_DISTANCE_BEFORE = D1_G3A_U06_SIX_KP_WORKSHEET_BRIDGE_SMOKE_IMPLEMENTED_PENDING_READBACK
GOAL_DISTANCE_AFTER = D1_G3A_U06_S52_TEST_READBACK_FIX_IMPLEMENTED_PENDING_READBACK
DISTANCE_REDUCED = resolved test-contract drift caused by increasing Batch A visibleCount from 19 to 23 and broadening G3A-U06 answer models
REMAINING_BLOCKERS = npm test readback pending; browser PDF smoke pending; Pages deploy may need rerun
NEXT_SHORTEST_STEP = git pull public main; npm test; git status
