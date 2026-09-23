# S43G2N WordProblemEstimationDesignScan

STATUS = PASS_DESIGN_LOCKED

TARGET = kp_g3a_u02_word_problem_estimation_add_sub

## Current row

- supportClass = D
- htmlSelectableStatus = not_selectable
- holdReason = word_problem_template_required

## Locked minimal template

Phase 3 word problem is limited to deterministic two-number add/sub estimation.

Rule:

1. Generate two four-digit integers.
2. Round each integer to the nearest thousand.
3. Apply one operation: add or subtract.
4. finalAnswer = roundedA +/- roundedB.
5. answerText is the final estimated integer.

Question shape:

- kind = wordProblemEstimation
- promptText = fixed context text
- displayText = prompt + blank
- blankedDisplayText = prompt + blank
- answerText = estimated answer
- explanationText = rounded numbers and final operation

Validator:

- recompute rounded operands
- recompute estimated final answer
- compare answerText and finalAnswer

Non-scope:

- free-form NLP
- multiple valid answers
- open context generation
- cross-unit mixed
- productionUse

NEXT = S43G2O_WordProblemEstimationImplementation
