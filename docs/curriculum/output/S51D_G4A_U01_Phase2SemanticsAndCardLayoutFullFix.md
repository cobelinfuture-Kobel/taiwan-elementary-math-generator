S51D_G4A_U01_Phase2SemanticsAndCardLayoutFullFix

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = FIX_APPLIED_STATIC_READBACK_PASS_TEST_AND_PDF_READBACK_REQUIRED
write_type = implementation_readback_report

operator_requested_changes:
- 非標準位值組合: counts should be 1-99, e.g. 23個百萬, 51個十.
- 相同數字不同位值差: add sum of the two represented values, not only difference.
- 位值卡組合: not every place-value card must appear; do not write zero/missing cards.

scope_lock:
- Apply only G4A-U01 Phase 2 semantic refinements and the related sparse-card print layout cap.
- Do not implement Phase 3 Chinese-number/word-problem patterns.
- Do not start G4A-U02/G4A-U04/G4A-U08.
- Do not alter unrelated Batch A units except shared validator/test coverage required for G4A-U01.

files_modified:
- site/modules/curriculum/batch-a/g4a-u01-phase1-generator.js
- site/modules/curriculum/batch-a/batch-a-browser-validator.js
- site/modules/curriculum/batch-a/source-pattern-index.js
- site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
- site/modules/curriculum/registry/batch-a-selector-g4a-extension.js
- tests/curriculum/batch-a/g4a-u01-phase1.test.js

implementation_summary:

1. Nonstandard place-value composition
- Replaced the prior mostly-standard count model with sparse nonstandard unit-count prompts.
- Counts in generated nonstandard placeModel are now 1-99.
- At least one place count is > 9.
- Prompts can now resemble source-image cases such as many 百萬 units plus smaller unit counts, e.g. 23個百萬 / 51個十 style.
- Validator now rejects nonstandard place counts outside 1-99 and still requires a computed 8-digit value within 10,000,000-99,999,999.

2. Same-digit place-value relation
- Existing patternSpecId retained: ps_g4a_u01_same_digit_place_value_difference.
- Generator now alternates relation mode:
  - placeValueRelationMode = difference
  - placeValueRelationMode = sum
- Prompts can now ask either 相差多少 or 合起來是多少.
- Validator computes expected answer by relation mode.
- Selector/source title updated from 相同數字不同位值差 to 相同數字不同位值差和.

3. Place-value card composition
- Generator now creates sparse card prompts instead of listing every card place.
- Missing/zero cards are omitted from blankedDisplayText and promptText.
- placeCounts still records zero for omitted places, so validator/answer computation remains deterministic.
- Value can be within 1 to 99,999,999, not forced to include 千萬卡.
- Validator rejects prompts containing 0張 and verifies sparse card count/value consistency.
- Added print layout caps for sparse-card composition:
  - question side: 4 columns x 8 rows.
  - answer side: 4 columns x 6 rows.

static_readback:
- g4a-u01 generator readback confirms same-digit relation mode supports difference/sum.
- g4a-u01 generator readback confirms nonstandard counts are generated as 1-99.
- g4a-u01 generator readback confirms card prompts use sparse included cards only.
- validator readback confirms refined semantic validation for same-digit, nonstandard, and card composition.
- worksheet readback confirms card-composition layout caps are present.
- test readback confirms added unit tests for refined semantics and sparse card layout caps.

commits:
- 9e546992d3b59b05232778502589ce16d16362a2 feat(g4a-u01): refine phase 2 place value prompts
- f331d98dd0b8ab41452bf646a6ac54e0b90bb0a2 docs(g4a-u01): update same digit relation title
- 610a00075408bd84671053e232e8db73ba591068 docs(g4a-u01): rename same digit selector label
- 2d0959387c797bf1b23ebe4c04fef2a3047e9b19 fix(g4a-u01): cap sparse card print layout
- 21d5279688b20b1aab34f21fe0d5c1c9f6a835f9 feat(g4a-u01): validate refined phase 2 semantics
- 7c01caaf0c494f87250e9f54150f43c385e43f6d test(g4a-u01): cover refined phase 2 semantics

validation_status:
- GitHub connector writes completed.
- Static readback completed.
- workflow_runs = [] for latest inspected commit 7c01caaf0c494f87250e9f54150f43c385e43f6d at inspection time.
- combined statuses = [] for latest inspected commit 7c01caaf0c494f87250e9f54150f43c385e43f6d at inspection time.
- npm test is not claimed as passed until operator or Actions readback confirms.
- PDF print smoke is not claimed as passed until regenerated PDFs are inspected.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_ui_result_after_pull:
- 4A-U01 still shows 11 KnowledgePoints.
- Same-digit KP label should show 相同數字不同位值差和.
- Phase 2 generation should still work for all 11 printable patterns.

expected_pdf_smoke_after_fix:
- Regenerate:
  - g4a_u01_非標準位值組合.pdf
  - g4a_u01_相同數字不同位值差和.pdf or same selected KP output
  - g4a_u01_位值卡組合.pdf
- Check:
  - nonstandard prompts contain counts in 1-99 and include at least one count > 9.
  - same-digit prompts include both 相差 and 合起來 variants across enough questions.
  - card-composition prompts omit zero/missing cards and no longer produce excessive/interleaved blank pages.

anti_scope_check:
- No Phase 3 work performed.
- No G4A-U02/G4A-U04/G4A-U08 work performed.
- No other unit generator semantics changed.

GOAL_DISTANCE_BEFORE = D1_G4A_U01_PHASE2_CONTENT_PASS_LAYOUT_BLOCKED
GOAL_DISTANCE_AFTER = D1_G4A_U01_PHASE2_SEMANTIC_REFINEMENT_AND_CARD_LAYOUT_FIX_APPLIED_TEST_PENDING
DISTANCE_REDUCED = The remaining Phase 2 card-layout blocker was addressed together with the three operator-requested source-image semantic refinements; execution and regenerated PDF readback remain pending.
REMAINING_BLOCKERS = ["Need npm test readback after S51D", "Need regenerated PDFs for the three refined Phase 2 patterns", "Need final Phase 2 closeout marker", "Phase 3 fine-grained source-image patterns deferred"]
NEXT_SHORTEST_STEP = S51E_G4A_U01_Phase2SemanticFixNpmAndPDFReadback
STOP_REASON = awaiting_required_test_and_pdf_readback
BLOCKER_TYPE = TEST_AND_PDF_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S51D_FIX_APPLIED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, run npm test, then regenerate the three refined Phase 2 PDFs for inspection.
NEXT_RESUME_TASK = S51E_G4A_U01_Phase2SemanticFixNpmAndPDFReadback
