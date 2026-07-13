# S76K — G4A-U08 Full-Source Stress and Semantic QA

```text
TASK = S76K_G4A_U08_FullSourceStressAndSemanticQA
STATUS = PASS_IMPLEMENTED_PENDING_CI
SOURCE_ID = g4a_u08_4a08
```

## Scope

S76K verifies the complete executable public surface of G4A-U08 without changing the S76J selector, resolver, generator, validator, worksheet or renderer contracts.

The executable surface is split into three independently verified layers:

```text
legacy numeric       = 10 PatternSpecs
Phase2A application  = 12 PatternSpecs
Phase2B canonical    = 4 PatternSpecs / 4 PatternGroups
combined executable  = 26 PatternSpecs
```

This milestone does not add curriculum content. It adds stress, semantic, mutation and Chromium HTML/PDF evidence.

## Stress matrix

Phase2B public counts:

```text
1, 4, 17, 64, 120, 200, 1000
```

The matrix validates 1,406 Phase2B questions. Numeric legacy and Phase2A application each add 200 questions, producing 1,806 primary stress questions.

The accepted upper boundary is 1,000 questions. A request for 1,001 questions must return a blocking error and zero output.

## Semantic gates

### Comparison chain

- more-than and less-than direction are retained;
- the middle quantity is independently recomputed;
- the final answer is independently recomputed.

### Equal-value unit price

- known and target quantities differ;
- both purchases have equal total value;
- both unit prices remain integers;
- the final answer is independently recomputed.

### Relative difference

- compared unit value is larger than the base value;
- the difference, not the sum, is multiplied by quantity;
- the final answer is independently recomputed.

### Two-cost-component payment

- both component costs are included;
- payment covers the combined cost;
- change is nonnegative;
- the final answer is independently recomputed.

All public prompt and answer text is checked for internal curriculum IDs and unresolved placeholders.

## Mutation gates

S76K retains blocking rejection for:

- production lifecycle mutation;
- unapproved PatternSpec identity;
- unapproved PatternGroup identity;
- generic fallback activation.

## HTML/PDF smoke

The workflow generates a 120-question and 120-answer WorksheetDocument through the public S76J route, renders it with the existing generic renderer, prints it with Chromium, and validates:

- question and answer counts;
- all four Phase2B PatternGroups and PatternSpecs;
- DOM cell and page containment;
- PDF page count against the WorksheetDocument manifest;
- all rendered pages nonblank;
- PDF text bounding boxes inside A4 pages;
- Traditional Chinese glyph extraction;
- final answer page nonblank;
- zero internal-ID leaks;
- zero unresolved placeholders.

The HTML, PDF, manifest and rendered page images are uploaded as a 30-day workflow artifact. Generated binary artifacts are not committed by this milestone.

## Lifecycle

```text
productionUse = allowed_after_s76k_ci
distance      = D1_G4A_U08_PRODUCTION_STRESS_PENDING_D0_CLOSEOUT
next          = S76L_G4A_U08_FullSourceD0CloseoutAndBatchAMigrationReadback
```

S76K does not declare D0. Fresh-main closeout and Batch A migration readback remain assigned to S76L.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G4A_U08_PHASE2B_RESOLVER_SELECTOR_WORKSHEET_CONNECTED
GOAL_DISTANCE_AFTER  = D1_G4A_U08_FULL_SOURCE_STRESS_SEMANTIC_HTML_PDF_PENDING_CI
DISTANCE_REDUCED     = Added full executable-surface stress, exact semantic recomputation, mutation rejection and Chromium HTML/PDF production evidence.
REMAINING_BLOCKERS   = [S76K CI/Chromium smoke, fresh-main D0 closeout, Batch A migration readback]
NEXT_SHORTEST_STEP   = S76L_G4A_U08_FullSourceD0CloseoutAndBatchAMigrationReadback
```
