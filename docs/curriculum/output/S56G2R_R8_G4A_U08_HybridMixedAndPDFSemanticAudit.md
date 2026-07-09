S56G2R_R8_G4A_U08_HybridMixedAndPDFSemanticAudit

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題 + Phase1 numeric mixed UI
status = HYBRID_MIXED_FIX_APPLIED_SEMANTIC_BLOCKER_REMAINS_LOCAL_TEST_READBACK_REQUIRED
write_type = hybrid_mixed_fix_and_pdf_semantic_audit

operator_local_readback:
- tests = 497
- pass = 497
- fail = 0
- duration_ms = 10018.7034

operator_feedback:
- Application-only mixed KnowledgePoints can generate 200 questions.
- Mixed numeric calculation KPs + application KPs only generated about 108 questions.
- Numeric calculation questions did not appear.
- Operator requested PDF semantic inspection and unit closeout only if no semantic issues remain.

functional_bug_confirmed:
- The G4A-U08 router selected the Phase2A application generator whenever the resolved plan contained any application PatternSpec.
- In a hybrid numeric+application selection, this caused numeric PatternSpecs to be dropped.
- The observed 108-question ceiling matches application-only allocation after numeric groups were filtered out.
- This was not a UI max-count cap; it was a router/generator dispatch bug for hybrid G4A-U08 selections.

functional_fix_applied:
- Updated site/modules/curriculum/batch-a/batch-a-browser-question-router.js.
- Added hybrid detection for G4A-U08 plans that contain both:
  - numeric expression PatternSpecs; and
  - Phase2A application PatternSpecs.
- Hybrid path now:
  1. computes numeric and application allocation shares from the original resolved allocation;
  2. calls the numeric expression generator for numeric KPs;
  3. calls the Phase2A application generator for application KPs;
  4. combines generated questions and allocation;
  5. preserves full requested questionCount.

regression_test_added:
- Created tests/curriculum/batch-a/g4a-u08-hybrid-mixed.test.js.
- New test verifies all 8 G4A-U08 visible KPs can build a 200-question mixed worksheet.
- It asserts:
  - generatedQuestions.length = 200;
  - allocation sum = 200;
  - at least one numeric expression question appears;
  - at least one application word problem appears;
  - combined questions validate.

pdf_semantic_audit_result:
- Unit cannot be closed yet.
- Uploaded PDFs pass arithmetic plausibility in sampled items, but user-facing semantic quality still has blockers.

semantic_blockers_found:
1. Payment/discount semantic issue remains in parentheses-grouping and mixed PDFs.
   - Example pattern: 原價 15 元，折扣 14 元，付 479 元，找回 478 元.
   - This is mathematically valid but pedagogically poor and unrealistic.
   - Required fix: money adjustment templates must use realistic base prices, discounts, and payment choices close to the adjusted price.

2. Large measured quantities still appear in application contexts.
   - Examples include 144 L of fruit juice per product, 95 kg of rice per product, hundreds of kg of parcels, and large meters of ribbon/rope.
   - Some can be acceptable in warehouse/event contexts, but they are too frequent and too large for general Grade 4 life problems.
   - Required fix: domain-specific same-unit label and quantity policy must be tightened further.

3. Multiplicative scaling contexts remain repetitive.
   - Many prompts use the shell: 在{scene}中，n份{item}共需要x，照這樣計算...
   - This is semantically valid but over-repeated in the 200-question mixed PDF.
   - Required fix: add additional scale templates such as 每天/每組/每盒/每人/每次 variants.

4. Material-pack wording is mathematically valid but still artificial in several contexts.
   - Examples: 每份材料包需要5組，每組用5mL的飲用水.
   - Required fix: for capacity/weight domains, use actual containers/recipes rather than generic 材料包.

5. Application-only 加減序列 PDF is substantially improved and has no blocker-level phrase leak.
   - It still includes some large same-unit quantities such as hundreds of kg of vegetables/feed, which should be reduced in the next semantic pass.

not_closed_reason:
- Closeout is blocked because semantic blockers remain in uploaded PDFs.
- The hybrid numeric+application bug has been fixed, but local npm readback and regenerated mixed PDF smoke are still required.

expected_local_readback:
- Previous test count = 497.
- New hybrid regression test adds 1 test.
- Expected after pull:
  - tests = 498
  - pass = 498
  - fail = 0

required_local_commands:
```powershell
git fetch public
git switch public-main
git reset --hard public/main
git clean -fd
npm test
```

GOAL_DISTANCE_BEFORE = D1_G4A_U08_PHASE2A_SEMANTIC_HIGH_COUNT_FIX_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U08_HYBRID_MIXED_FIX_APPLIED_SEMANTIC_BLOCKER_REMAINS
DISTANCE_REDUCED = The 108-question numeric+application mixed-generation bug was isolated and fixed; PDF semantic audit found remaining user-facing content blockers, so unit closeout is not allowed yet.
REMAINING_BLOCKERS = ["Need local npm test readback for hybrid fix", "Need semantic quantity/payment/template patch", "Need regenerate PDFs and inspect content diversity", "Need equation+answer HTML answer-key rendering", "Need Phase2A closeout"]
NEXT_SHORTEST_STEP = S56G2R_R8_LocalRetest
STOP_REASON = awaiting_local_test_readback
BLOCKER_TYPE = LOCAL_TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S56G2R_R8_HYBRID_MIXED_FIX_APPLIED_SEMANTIC_AUDIT_COMPLETED
REQUIRED_OPERATOR_ACTION = Pull public/main, run local npm test, then paste tests/pass/fail output.
NEXT_RESUME_TASK = S56G2R_R8_LocalRetest
