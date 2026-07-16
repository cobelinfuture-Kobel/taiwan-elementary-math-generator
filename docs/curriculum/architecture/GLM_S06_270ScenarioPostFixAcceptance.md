# GLM-S06 — 270-Scenario Post-Fix HTML/PDF Acceptance

```text
TASK = GLM-S06_270ScenarioPostFixAcceptance
STATUS = CI_EXECUTION_PENDING
DEPENDS_ON = GLM-S05_Global18LayoutFullFix
PUBLIC_UNIT_COUNT = 15
APPROVED_LAYOUT_COUNT = 18
SCENARIO_COUNT = 270
SHARD_COUNT = 5
SCENARIOS_PER_SHARD = 54
```

## 1. Purpose

S06 is the first full render acceptance after S05. It does not accept document-layer success alone. Every public unit must generate, render and print all 18 approved layouts through the current production path.

## 2. Matrix

```text
15 public units × 18 approved layouts = 270 scenarios
18 questions per scenario
question pages only; answer-page stress is reserved for S07
```

The five deterministic shards each contain three complete units and 54 scenarios.

## 3. Required document result

Every scenario must satisfy all of the following:

- generation succeeds;
- exactly 18 questions are present;
- requested and resolved columns match;
- requested and resolved rows per page match;
- `layoutMode = exact_approved_matrix`;
- `layoutExact = true`;
- `capped = false`;
- no static G5A-U02 HTML substitution or other unit exception is allowed.

## 4. Required HTML result

Every generated document is rendered through the current worksheet renderer. The browser inspection requires:

- exactly 18 visible question cards;
- at least one visible question page;
- no missing prompt;
- no card, text or page overflow;
- no inter-card overlap;
- no browser console error;
- no page error.

A failure screenshot is retained for any visual defect.

## 5. Required PDF result

Every rendered HTML document is printed to A4 PDF and inspected independently. Acceptance requires:

- PDF page count equals visible HTML question-page count;
- all PDF pages render to images;
- every PDF page is nonblank;
- no text bounding box exceeds the PDF page boundary;
- PDF SHA-256 and byte count are retained in evidence.

## 6. Aggregate terminal condition

```text
STATUS = PASS_ACCEPTED
GLOBAL_STATUS = ALL_270_POSTFIX_HTML_PDF_PASS
SCENARIO_COUNT = 270
GENERATED_SCENARIO_COUNT = 270
RENDERED_SCENARIO_COUNT = 270
RENDER_PASS_COUNT = 270
ACCEPTANCE_PASS_COUNT = 270
ACCEPTANCE_FAILURE_COUNT = 0
DOCUMENT_CLASSIFICATION.PASS = 270
RENDER_FINDING_COUNTS = {}
```

Any other result blocks S06 and prevents progression to S07.

## 7. Evidence handling

HTML and PDF files remain transient CI material. Each shard uploads its JSON manifest and any failure screenshots. The aggregate artifact retains all scenario metadata, hashes, page counts and findings without committing hundreds of generated PDFs to the repository.

## 8. Continuation

```text
PASS → GLM-S07_AnswerPageAndMaximumBoundaryStress
FAIL → bounded FullFix on the failing source/layout/renderer path, then rerun S06
```

## 9. Distance

```text
GOAL_DISTANCE_BEFORE = D1_GLOBAL_270_EXACT_DOCUMENT_LAYER_ACCEPTED
GOAL_DISTANCE_AFTER  = D0_GLOBAL_270_POSTFIX_HTML_PDF_ACCEPTANCE_PENDING
DISTANCE_REDUCED     = strict post-fix render and PDF authority implemented
REMAINING_BLOCKERS   = five CI shards and aggregate acceptance
NEXT_SHORT_STEP      = GLM-S06_RunFiveShardsAndAggregate
STOP_REASON          = NONE
```
