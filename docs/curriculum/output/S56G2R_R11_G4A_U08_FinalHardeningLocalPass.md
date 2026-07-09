S56G2R_R11_G4A_U08_FinalHardeningLocalPass

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題 + Phase1 numeric mixed UI
status = FINAL_HARDENING_LOCAL_PASS_REGENERATED_PDF_SMOKE_REQUIRED
write_type = local_validation_readback

operator_local_readback:
- tests = 499
- pass = 499
- fail = 0
- cancelled = 0
- skipped = 0
- todo = 0
- duration_ms = 11810.0696

readback_correction:
- Previous R10 report expected tests = 500.
- Actual count remained tests = 499 because the semantic-tightening regression test had already been added before the prior 499/499 run.
- R10 changed generator hardening and status docs, but did not add an additional test file beyond the existing semantic-tightening regression.
- Therefore 499/499 is accepted as the correct local pass for the final hardening patch.

validated_scope:
- Hybrid numeric + application mixed generation remains covered by regression tests.
- Phase2A application high-count generation remains covered.
- Semantic tightening regression remains covered.
- Local npm test gate passed.

closeout_gate:
- Unit closeout is still not created in this step.
- Reason: regenerated PDF smoke after final hardening has not yet been reviewed.
- The previously uploaded PDF confirmed numeric+application mixing and had no severe blocker after R9, but final hardening changed generator behavior afterward.
- A fresh PDF generated from the current code is required before closeout.

required_operator_action:
1. Regenerate the mixed G4A-U08 PDF from the current pulled code.
2. Use the same important smoke case:
   - G4A-U08 numeric KPs + Phase2A application KPs selected together.
   - questionCount = 200 if possible.
   - shuffleAcrossPatterns if possible.
3. Upload the regenerated PDF for final semantic smoke.

acceptance_for_next_step:
- Numeric calculation questions and application word problems both appear.
- Generated question count matches requested count.
- No severe semantic blockers:
  - near-total discount such as 原價12元折扣11元;
  - far-away payment such as 付325元;
  - same-unit 144L / 95kg / 140m class prompts;
  - generic capacity/weight 材料包 blocker phrasing;
  - broken connector phrases.

GOAL_DISTANCE_BEFORE = D1_G4A_U08_FINAL_SEMANTIC_HARDENING_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U08_FINAL_HARDENING_LOCAL_PASS_PDF_SMOKE_PENDING
DISTANCE_REDUCED = Final hardening local validation is now accepted as PASS; only regenerated PDF smoke remains before unit closeout.
REMAINING_BLOCKERS = ["Need regenerated PDF smoke after final hardening", "Need Phase2A closeout marker"]
NEXT_SHORTEST_STEP = S56G2R_R11_RegeneratedPDFSmoke
STOP_REASON = awaiting_regenerated_pdf_smoke
BLOCKER_TYPE = PDF_SMOKE_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S56G2R_R11_FINAL_HARDENING_LOCAL_PASS
REQUIRED_OPERATOR_ACTION = Regenerate and upload the current G4A-U08 mixed numeric+application PDF.
NEXT_RESUME_TASK = S56G2R_R11_RegeneratedPDFSmoke
