S49B1_PixelFunctionalQAContractFullFix

CURRENT_MAJOR_TASK = S49_PixelUIFullQA
CURRENT_SUBTASK = S49B1_PixelFunctionalQAContractFullFix
TASK_STATUS = FULLFIX_WRITTEN_PR_CI_PENDING
OUTPUT = S49B Pixel full-chain QA aligned with stable public wiring and unordered selector-membership contracts

## 1. Failure Readback

```text
Math CI Readback = #987
sha = 81bd31721cd1da27c3620d6bccdc058ecae3a4ff
status = FAIL_NPM_TEST
tests = 619
pass = 617
fail = 2
workingTree = clean
```

The two failures were limited to the new S49B QA file:

```text
1. Public-surface wiring assertion expected the nonexistent identifier pixelGenerateButton.
2. Mixed-KnowledgePoint assertion treated canonical output ordering as part of the membership contract.
```

## 2. Root Cause

### Wiring assertion

The deployed Pixel implementation uses:

```text
const generateButton = document.getElementById("pixel-generate-button");
generateButton?.addEventListener("click", generateWorksheet);
```

The original QA incorrectly asserted a stale/nonexistent local identifier:

```text
pixelGenerateButton?.addEventListener("click"...)
```

### Selection ordering assertion

The shared worksheet pipeline preserves the selected KnowledgePoint and PatternGroup membership, but may emit those IDs in canonical registry order. Selection membership is authoritative; UI click order is not part of the worksheetDocument contract.

The original QA used order-sensitive deep equality for mixed selections, causing a failure where the same two authoritative IDs were present in reversed order.

## 3. FullFix

Modified:

```text
tests/ui/pixel-functional-qa.test.js
```

Changes:

```text
- Assert the real stable generate-button binding:
  generateButton?.addEventListener("click", generateWorksheet)
- Add a sorted-membership helper.
- Compare KnowledgePoint IDs and PatternGroup IDs as canonical unordered membership sets for both single and mixed routes.
- Retain all 13-source generator/validator/preview/answer/print full-chain checks.
- Retain unknown/non-public KnowledgePoint sanitization checks.
```

## 4. Scope Integrity

```text
Public Pixel HTML = unchanged
Public Pixel JavaScript = unchanged
Public Pixel CSS = unchanged
Classic UI = unchanged
Generator = unchanged
Validator = unchanged
Renderer = unchanged
Registry = unchanged
PatternSpec = unchanged
G3B-U04 / S57F2 = not continued
```

## 5. Acceptance Status

```text
Root cause identified = PASS
Stable wiring assertion applied = PASS
Order-independent membership contract applied = PASS
Production behavior changed = false
PR CI = PENDING
Main CI = PENDING
```

## 6. Closeout

GOAL_DISTANCE_BEFORE = D1_WEBUI_PIXEL_FUNCTIONAL_QA_CI_FAILED_TWO_UNSTABLE_ASSERTIONS
GOAL_DISTANCE_AFTER = D1_WEBUI_PIXEL_FUNCTIONAL_QA_FULLFIX_WRITTEN_PR_CI_PENDING
DISTANCE_REDUCED = The two S49B-only failures were corrected without changing production behavior: the QA now targets the deployed generate-button contract and authoritative selector membership rather than incidental identifier/order details.
REMAINING_BLOCKERS = ["Need PR CI for S49B1", "Need merge", "Need main Math CI Readback", "Need S49C Batch A / browser-path release QA", "Need S50 final production gate"]
NEXT_SHORTEST_STEP = S49B1_PR_CI_AND_MERGE
STOP_REASON = ci_readback_required
BLOCKER_TYPE = PR_CI_REQUIRED
LAST_COMPLETED_STATUS = S49B1_FULLFIX_WRITTEN
REQUIRED_OPERATOR_ACTION = Wait for or provide PR CI results for branch s49b-pixel-functional-qa-fullfix.
NEXT_RESUME_TASK = S49B1_PR_CIAndMerge
