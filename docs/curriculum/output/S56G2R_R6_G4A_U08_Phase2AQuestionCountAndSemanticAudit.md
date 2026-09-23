S56G2R_R6_G4A_U08_Phase2AQuestionCountAndSemanticAudit

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
phase = Phase2A 應用題
status = AUDIT_COMPLETED_FIX_REQUIRED
write_type = question_count_and_semantic_pdf_audit

operator_local_readback:
- tests = 496
- pass = 496
- fail = 0
- duration_ms = 5980.9477

operator_questions:
1. Is there a question-count limit? It appears single worksheets cannot exceed around 30 questions.
2. Mixed KnowledgePoint worksheet appears to stop around 108 questions.
3. Check whether semantic problems remain in the generated PDFs.

uploaded_pdf_evidence_reviewed:
- g4a_u08_加減序列應用題.pdf
- g4a_u08_同單位知識點混合_應用題_隨機排序.pdf
- g4a_u08_乘除先於加減應用題.pdf
- g4a_u08_乘除序列應用題.pdf
- g4a_u08_括號與組合量應用題.pdf

question_count_audit:
- The uploaded single-KP PDFs reviewed in this audit each contain 40 unique questions plus duplicated answer-key entries.
- Therefore the current generated PDFs are not limited to 30 questions at the PDF content level.
- The HTML UI input currently declares min = 1 and max = 200 for question count.
- The config-state positiveInteger helper also clamps questionCount to max = 200.
- setQuestionCount writes the requested normalized value into draftConfig.generation.questionCount and state.batchA.questionCount.
- The worksheet document summary is based on generated.questions.length.
- The visible PatternGroup resolver allocates the requested questionCount evenly across selected PatternSpecs.
- The Phase2A application generator uses plan.questionCount and allocation entries; it does not hard-code 30 or 108.

question_count_suspected_failure_modes:
1. Not a hard 30-question code limit.
   - Evidence: uploaded Phase2A PDFs include 40 unique questions.
2. Possible stale PDF / stale browser preview.
   - The uploaded mixed PDF still contains pre-R4 old phrases such as 飲料, 藥粉, 道路, 課程時間, 標準門票, 每次使用門票.
   - This indicates at least one uploaded PDF was generated before the scenario-bank patch or from stale browser/cache state.
3. Possible unique-prompt exhaustion for larger counts.
   - The application generator rejects duplicate prompt text per PatternSpec.
   - If a selected PatternSpec has too small a prompt/number variation pool, high requested counts can stop with unique_pool_exhausted.
   - This would be a generator diversity problem, not a UI max-count problem.
4. Mixed worksheet stopping around 108 may indicate a high-count generation failure in one or more PatternSpecs, not a UI cap.
   - The code path should surface this as validation/generation error, but the UI message may not be explicit enough.

remaining_semantic_issues_found:
1. Add/sub sequence PDF improved but still has action-verb polarity errors.
   - Example pattern: 木工角原本有 300 mm 的木條，先用掉 117 mm，後來再鋸 45 mm，現在有多少 mm？
   - The model appears to be a - b + c, but 再鋸 usually means cutting more, which should reduce length.
   - Fix: for subtract-then-add templates, length scenarios must use increase verbs such as 接上, 補上一段, 找到, 加接, not 再鋸.

2. Some time and duration wording remains awkward.
   - 用掉閱讀時間 / 用掉練球時間 / 用掉烘烤時間 is mathematically understandable but not the best life wording.
   - Fix: use 已完成, 已花, 已安排, 延長, 縮短 depending equation direction.

3. Mixed PDF is stale and cannot be accepted as current content smoke.
   - It still shows old weak phrases that R4 was supposed to remove:
     - 飲料分成三批
     - 藥粉分成三批
     - 道路分成三批
     - 課程時間分成三批
     - 標準門票
     - 每次使用門票
   - Required action: regenerate mixed PDF after pulling latest public/main and clearing stale preview state.

4. 乘除先於加減 has excessive repeated money/change questions and unrealistic payment scale.
   - Many items are simple payment-change shells with 200/500/1000 元 and small unit prices.
   - The arithmetic is valid, but the worksheet is monotonous and produces very large change values.
   - Fix: add scenario variants for budget remaining, group fund balance, coupon/discount, package purchase, and cap payment choices closer to cost.

5. 乘除先於加減 includes unnatural measured-quantity division-add wording.
   - Example class: 共有 200 時 的烘烤時間，平均分成 5 份後，又再烤 20 時.
   - 200 hours of baking time is not a good Grade 4 life context.
   - Fix: clamp same-unit time to minutes/seconds for normal cases; use hours only in conversion overlay or small values.

6. 乘除序列 contains missing connector wording.
   - Examples: 運動會2 份毛巾, 園藝課5 份澆花水, 籃球隊4 份練球時間.
   - Fix: add 的 / 空格-safe phrase construction: 在運動會中，2 份毛巾... or 運動會準備 2 份毛巾...

7. Some package/container units are semantically mismatched.
   - Examples: 積木 uses 條 / 張 / 本 in material-pack templates; 獎勵卡 uses 本 / 包 in some outputs.
   - Fix: scenario item should carry allowed count labels, not use generic count_items labels by sequence.

8. Some quantities remain too large for plausible life contexts.
   - Examples include 4000 L 運動飲料, 5000 kg 飼料, 3200 個毛巾, 2400 m 緞帶, 200 時烘烤時間.
   - Fix: add domain-specific range policies and cap large values unless explicitly in warehouse/event-scale contexts.

required_fix_scope:
- Keep 4 Phase2A visible KPs.
- Keep 12 PatternSpecs.
- Keep 60% same-unit / 40% one-step conversion target.
- Add scenario-specific unit-label policy instead of generic count_items unit-label cycling.
- Add scenario-specific quantity caps.
- Add action-polarity maps for add/sub templates.
- Add connector-safe phrasing for unit-rate templates.
- Add high-count generation tests for 120 and 200 questions to diagnose the reported 108-question ceiling.
- Add semantic regression tests for the remaining weak phrases and quantity caps.

recommended_next_milestone:
- S56G2R_R7_G4A_U08_Phase2ASemanticAndHighCountFix

acceptance_for_next_milestone:
- npm test pass.
- High-count tests:
  - single Phase2A KP 120 questions should generate or fail with explicit diagnostic if content pool is exhausted.
  - mixed Phase2A 200 questions should generate or fail with explicit diagnostic if content pool is exhausted.
- Regenerated PDFs should no longer contain stale old phrases.
- Regenerated PDFs should avoid semantic polarity errors such as 再鋸 in a-b+c templates.
- Regenerated PDFs should avoid generic malformed phrases such as 運動會2 份毛巾.
- Regenerated PDFs should show acceptable scenario diversity without implausible quantities.

GOAL_DISTANCE_BEFORE = D1_G4A_U08_PHASE2A_SCENARIO_UNIT_LABEL_FIX_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U08_PHASE2A_COUNT_AND_SEMANTIC_AUDIT_FIX_REQUIRED
DISTANCE_REDUCED = Local npm validation reached pass 496/496, then PDF/UI audit isolated remaining user-facing blockers: no hard 30-question cap was found, but stale mixed output, potential high-count unique-pool exhaustion, and semantic scenario defects remain.
REMAINING_BLOCKERS = ["Need semantic/action-polarity patch", "Need high-count generation diagnostics/tests", "Need regenerate PDFs after patch", "Need equation+answer HTML answer-key rendering", "Need Phase2A closeout"]
NEXT_SHORTEST_STEP = S56G2R_R7_G4A_U08_Phase2ASemanticAndHighCountFix
STOP_REASON = content_quality_and_high_count_fix_required
BLOCKER_TYPE = CONTENT_QUALITY_BLOCKER
LAST_COMPLETED_STATUS = S56G2R_R6_AUDIT_COMPLETED
REQUIRED_OPERATOR_ACTION = None; proceed to bounded semantic/high-count fix unless operator wants to freeze content changes first.
NEXT_RESUME_TASK = S56G2R_R7_G4A_U08_Phase2ASemanticAndHighCountFix
