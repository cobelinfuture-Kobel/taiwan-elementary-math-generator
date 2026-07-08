S53F_G4A_U02_ReasoningPatternImplementation

sourceId = g4a_u02_4a02
unit = 4A-U02 整數的乘法
status = IMPLEMENTED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = reasoning_generator_validator_selector_implementation

preflight:
- S53E_R3 numeric core accepted.
- Operator npm readback before S53F: tests 462, pass 462, fail 0.
- Operator confirmed numeric operand order:
  - 1×2 one-digit first = ok
  - 1×3 one-digit first = ok
  - 2×3 two-digit first = ok
  - 3×2 three-digit first = ok
- Uploaded mixed numeric PDF smoke passed: 150 questions, 150 answers, answer_errors = 0, duplicate_prompt_extras = 0.

scope_lock:
- Implement only deferred G4A-U02 reasoning/text KnowledgePoints.
- Do not change accepted numeric behavior except source-unit inclusion count.
- Do not start G4A-U04.

implemented_reasoning_knowledge_points:
1. kp_g4a_u02_digit_card_arrangement_product_max_min
   - patternSpecId = ps_g4a_u02_digit_card_arrangement_product_max_min
   - kind = g4aU02DigitCardArrangementProductMaxMin
   - prompt = six digit cards; arrange a three-digit by two-digit expression; find maximum and minimum product.
   - answer model = max/min factor pair and product.
   - generation method = deterministic digit-card sets + exhaustive legal arrangement search.
   - no-leading-zero guard = true for both 3-digit and 2-digit factors.

2. kp_g4a_u02_near_hundred_multiplication_strategy
   - patternSpecId = ps_g4a_u02_near_hundred_multiplication_strategy
   - kind = g4aU02NearHundredMultiplicationStrategy
   - prompt shapes:
     - n × 99 = n × 100 - n
     - n × 101 = n × 100 + n
   - answer model = baseProduct, adjustment, finalProduct.
   - generation alternates 99 and 101.

files_modified:
- site/modules/curriculum/batch-a/source-pattern-g4a-u02-extension.js
- site/modules/curriculum/batch-a/g4a-u02-numeric-generator.js
- site/modules/curriculum/registry/batch-a-selector-g4a-extension.js
- site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-extension.js
- tests/curriculum/batch-a/g4a-u02-numeric.test.js
- tests/site/selector-state.test.js
- tests/curriculum/batch-a/g3a-u01-kp-expansion.test.js
- tests/curriculum/batch-a/g3a-u02-missing-digit.test.js
- tests/curriculum/batch-a/g3a-u02-rounding-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u02-word-problem-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u03-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u03-supplementary-kp.test.js
- tests/curriculum/batch-a/g3b-u01-kp-expansion.test.js

implementation_summary:
- Added G4A-U02 reasoning PatternSpec definitions.
- Added two visible selector KnowledgePoints.
- G4A-U02 visible KnowledgePoints now expected = 9.
- Batch A global visible KnowledgePoints now expected = 68.
- Source-unit G4A-U02 generation now includes all 9 PatternSpecs.
- Same-unit mix can select all 9 KPs.
- Extended generator now creates numeric + reasoning G4A-U02 questions.
- Extended validator now validates digit-card max/min product and near-hundred strategy.
- Tests cover:
  - 9 visible G4A-U02 KPs.
  - source-unit 9 PatternSpecs.
  - digit-card max/min by brute force.
  - near-hundred 99/101 alternation.
  - all-KP mixed worksheet and answer key.
  - existing numeric correctness/coverage/duplicate/order behavior.

static_readback:
- Numeric horizontal output remains accepted and unchanged in intent.
- Numeric duplicate guard remains active.
- Reasoning prompts are short text prompts suitable for current PDF grid.
- No unit closeout claimed yet.

not_claimed:
- npm test after S53F has not been run.
- Reasoning PDFs have not been generated or inspected.
- All-9 mixed PDF has not been inspected.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_ui_result_after_pull:
- 4A-U02 本單元可選知識點 should show 9.
- New visible KPs:
  - 數字卡排列最大最小乘積
  - 接近整百乘法策略

expected_reasoning_pdf_smoke_after_test_pass:
- Generate single-KP PDF for 數字卡排列最大最小乘積.
- Generate single-KP PDF for 接近整百乘法策略.
- Generate all-9 G4A-U02 same-unit mixed PDF.
- Check answer correctness, text length, duplicate rate, and shuffle interleave.

GOAL_DISTANCE_BEFORE = D0_G4A_U02_NUMERIC_CORE_ACCEPTED_PLUS_D2_REASONING_CONTRACT_ONLY
GOAL_DISTANCE_AFTER = D1_G4A_U02_REASONING_IMPLEMENTED_STATIC_READBACK_PASS_TEST_PENDING
DISTANCE_REDUCED = The two deferred G4A-U02 reasoning KnowledgePoints moved from contract-only to PatternSpec + selector + generator + validator + tests implemented.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after S53F", "Need reasoning single-KP PDFs", "Need all-9 mixed PDF smoke", "optional renderer-wide blank-page cleanup backlog"]
NEXT_SHORTEST_STEP = S53G_G4A_U02_ReasoningNpmAndPDFSmoke
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S53F_IMPLEMENTED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, run npm test, then generate the two reasoning PDFs and one all-9 mixed PDF.
NEXT_RESUME_TASK = S53G_G4A_U02_ReasoningNpmAndPDFSmoke
