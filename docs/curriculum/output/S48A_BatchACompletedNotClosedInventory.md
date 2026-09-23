S48A_BatchACompletedNotClosedInventory

status = COMPLETED
write_type = inventory_report_only
scope = Batch A 13 sourceId closeout inventory

batch_a_source_authority:
- site/modules/curriculum/batch-a/source-units.js
- Batch A contains 13 sourceIds:
  - g3a_u01_3a01 3A-U01 10000以內的數
  - g3a_u02_3a02 3A-U02 四位數的加減
  - g3a_u03_3a03 3A-U03 乘法
  - g3a_u06_3a06 3A-U06 二位數除以一位數
  - g3b_u01_3b01 3B-U01 除法
  - g3b_u04_3b04 3B-U04 兩步驟計算
  - g3b_u08_3b08 3B-U08 乘法與除法
  - g4a_u01_4a01 4A-U01 1億以內的數
  - g4a_u02_4a02 4A-U02 整數的乘法
  - g4a_u04_4a04 4A-U04 整數的除法
  - g4a_u08_4a08 4A-U08 整數四則
  - g4b_u01_4b01 4B-U01 多位數的乘與除
  - g5a_u08_5a08 5A-U08 整數四則

classification_rules:
- FORMALLY_CLOSED = has unit closeout marker with status PASS_ACCEPTED_AND_CLOSED.
- COMPLETED_NOT_FORMALLY_CLOSED = output QA is accepted enough to transition, but no PASS_ACCEPTED_AND_CLOSED unit marker exists.
- NOT_COMPLETED_FOR_CLOSEOUT = only registry/KP/code/local-pass evidence exists, or a manual PDF/browser readback blocker remains.

formally_closed_units:
- g3a_u02_3a02: PASS_ACCEPTED_AND_CLOSED via S45_G3A_U02_UNIT_CLOSEOUT_PASS.marker.
- g3a_u03_3a03: PASS_ACCEPTED_AND_CLOSED via S46_G3A_U03_UNIT_CLOSEOUT_PASS.marker.
- g3a_u06_3a06: PASS_ACCEPTED_AND_CLOSED via S47_G3A_U06_UNIT_CLOSEOUT_PASS.marker.

completed_not_formally_closed_units:
- g3a_u01_3a01:
  - status marker = S44M1_G3A_U01_TRANSITION_TO_NEXT_UNIT.marker
  - marker status = TRANSITION_APPROVED_BY_OPERATOR
  - evidence = closed_for_now; output QA repair complete enough to move to next unit; major blockers resolved; remaining minor duplicate accepted as non-blocking/backlog.
  - closeout_gap = no PASS_ACCEPTED_AND_CLOSED unit closeout marker found in current inventory.
  - recommended_action = create a formal G3A-U01 accepted closeout marker so G3A status is consistent with G3A-U02/U03/U06.

not_completed_for_closeout_yet:
- g3b_u01_3b01:
  - current evidence = S43E5_R4M_LOCAL_PASS.marker
  - status = PASS_LOCAL_TESTS
  - remaining blocker = manual regenerated PDF smoke
  - decision = not completed for closeout until manual/browser PDF smoke is accepted or explicitly waived.
- g3b_u04_3b04:
  - current evidence = S43E6 KP expansion overlay/report
  - decision = no unit output QA closeout found; not completed for closeout.
- g3b_u08_3b08:
  - current evidence = S43E7 KP expansion overlay/report
  - decision = no unit output QA closeout found; not completed for closeout.
- g4a_u01_4a01:
  - current evidence = S43E8 KP expansion plus later G4A-U01 output route commits
  - decision = no unit output QA closeout found; not completed for closeout.
- g4a_u02_4a02:
  - current evidence = S43E9 KP expansion overlay/report
  - decision = no unit output QA closeout found; not completed for closeout.
- g4a_u04_4a04:
  - current evidence = S43E10 KP expansion overlay/report
  - decision = no unit output QA closeout found; not completed for closeout.
- g4a_u08_4a08:
  - current evidence = S43E11 KP expansion overlay/report
  - decision = no unit output QA closeout found; not completed for closeout.
- g4b_u01_4b01:
  - current evidence = S43E12 KP expansion overlay/report
  - decision = no unit output QA closeout found; not completed for closeout.
- g5a_u08_5a08:
  - current evidence = S43E13 KP expansion overlay/report
  - decision = no unit output QA closeout found; not completed for closeout.

summary_counts:
- Batch A total sourceIds = 13
- formally_closed_units = 3
- completed_not_formally_closed_units = 1
- not_completed_for_closeout_yet = 9

priority_decision:
- If the goal is to make G3A internally consistent before G4A, the next shortest step is to formal-close G3A-U01.
- After that, G3A has four Batch A sourceIds all accepted/closed, and G4A-U01 should be the next unit output review.

anti_scope_check:
- No generator/validator/renderer code modified.
- No Batch D g3a_u04 work performed.
- No PDF/browser smoke executed in this inventory task.
- No unit was closed by this task.

GOAL_DISTANCE_BEFORE = D1_BATCH_A_UNIT_CLOSEOUT_INVENTORY_IN_PROGRESS
GOAL_DISTANCE_AFTER = D1_BATCH_A_COMPLETED_NOT_CLOSED_INVENTORY_COMPLETE
DISTANCE_REDUCED = Batch A closeout ambiguity is now reduced to one completed-but-not-formally-closed unit: G3A-U01.
REMAINING_BLOCKERS = ["G3A-U01 needs formal accepted closeout marker for consistency", "G3B-U01 manual regenerated PDF smoke remains", "G4A units still need output QA", "browser/PDF smoke later", "optional renderer-wide blank-page cleanup backlog"]
NEXT_SHORTEST_STEP = S48B_G3A_U01_FormalAcceptedCloseoutMarker
