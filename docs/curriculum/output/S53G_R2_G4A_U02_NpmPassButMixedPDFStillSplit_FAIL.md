S53G_R2_G4A_U02_NpmPassButMixedPDFStillSplit_FAIL

sourceId = g4a_u02_4a02
unit = 4A-U02 整數的乘法
status = FAIL_REGENERATED_MIXED_PDF_STILL_HAS_ANSWER_KEY_SPLIT
write_type = npm_pass_pdf_smoke_fail_report

operator_npm_readback:
- tests = 465
- pass = 465
- fail = 0
- cancelled = 0
- skipped = 0
- todo = 0
- duration_ms = 5012.7505
- status = PASS_LOCAL_PUBLIC_MAIN

uploaded_pdf_reviewed:
- g4a_u02_同單位知識點混合2_隨機排序.pdf

render_review:
- Rendered the uploaded PDF to PNG.
- page_count = 23
- question_pages = 1-10
- answer_key_pages_observed = 12-23, with blank/split artifact around page 15 and page 20.

blocking_finding:
- The uploaded mixed PDF still has the same answer-key split as the previous failed smoke.
- Page 14 contains answer-key items 31-45, but item cards 43, 44, and 45 start at the bottom with prompts only.
- Page 15 contains only detached answer fragments: 336, 0, 70830.
- This confirms the orphan answer-fragment blocker is still present in the uploaded mixed PDF.
- Therefore G4A-U02 cannot be closed yet and the task cannot move to the next unit.

interpretation:
- Because npm now passes 465/465 after the S53G_R1 layout-code fix, the code-level regression test is passing.
- The uploaded PDF still showing the exact 3 x 5 answer-key pagination pattern strongly suggests the PDF was generated from stale browser/site assets or a generation path that did not pick up the S53G_R1 layout fix.
- The current uploaded PDF is not accepted as evidence of the fixed output.

expected_fixed_pdf_characteristic:
- The mixed answer key should not place 15 answer cards per answer-key page when G4A-U02 reasoning cards are present.
- Fixed output should not have a page containing only detached answer fragments like page 15.
- Answer-key pages should keep item number, prompt, and answer inside the same card/page.

no_new_code_change_in_this_step:
- No additional production code change was applied in S53G_R2.
- The existing S53G_R1 fix remains the active candidate fix:
  - G4A-U02 reasoning layout profiles
  - answer-key rowsPerPage cap
  - avoidPageBreakInside hints
  - regression test asserting safe mixed answer-key layout

required_operator_action:
- Confirm the working tree is reset to public/main after commit 2827c56b1e6b7eaae7a16dc8d33124ed8c8b8be0 or later.
- Hard refresh the browser page or clear site cache before generating the PDF.
- Regenerate g4a_u02_同單位知識點混合2_隨機排序.pdf after the hard refresh.
- Upload the regenerated PDF for another page-boundary smoke check.

optional_debug_command:
- git log -1 --format=%H
- git status --short

acceptance_status:
- npm: PASS
- PDF answer correctness: not re-claimed in this step
- mixed answer-key layout: FAIL
- unit closeout: BLOCKED

GOAL_DISTANCE_BEFORE = D1_G4A_U02_REASONING_PDF_LAYOUT_FIX_APPLIED_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U02_NPM_PASS_MIXED_PDF_LAYOUT_STILL_BLOCKED
DISTANCE_REDUCED = npm blocker cleared, but the uploaded mixed PDF still shows the orphan answer-fragment layout blocker; unit closeout remains blocked.
REMAINING_BLOCKERS = ["Uploaded mixed PDF still has page 15 orphan answer fragments", "Need regenerate PDF from confirmed latest public/main / non-stale browser assets", "Need confirm mixed answer key no longer splits item cards", "optional renderer-wide blank-page cleanup backlog"]
NEXT_SHORTEST_STEP = S53G_R3_G4A_U02_RegeneratedMixedPDFLayoutSmoke
STOP_REASON = awaiting_required_pdf_regeneration
BLOCKER_TYPE = PDF_LAYOUT_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S53G_R2_NPM_PASS_PDF_STILL_FAILS_LAYOUT_SMOKE
REQUIRED_OPERATOR_ACTION = Hard refresh/clear browser cache, regenerate the mixed G4A-U02 PDF from latest public/main, and upload it again.
NEXT_RESUME_TASK = S53G_R3_G4A_U02_RegeneratedMixedPDFLayoutSmoke
