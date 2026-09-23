# S43D9 HTML Zero-Visible Selector UI Implementation

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43D9_HTMLZeroVisibleSelectorUIImplementation
TASK_STATUS = IMPLEMENTED_READBACK_PENDING_CI
WRITE_TYPE = html_ui_plus_browser_binding_plus_styles_plus_tests_plus_docs
```

S43D9 implements the HTML KnowledgePoint selector UI shell in the current zero-visible state. It preserves the existing sourceId worksheet generation path and does not enable KnowledgePoint worksheet generation.

## Files Modified / Created

```text
MODIFIED:
site/index.html
site/assets/browser/main.js
site/assets/styles/app.css

CREATED:
tests/site/html-zero-visible-selector.test.js
docs/curriculum/output/S43D9_HTMLZeroVisibleSelectorUIImplementation.md
```

## Implemented HTML Selector Shell

`site/index.html` now includes a KnowledgePoint selector control group after the Batch A source selector.

Added DOM IDs:

```text
batch-a-knowledge-point-selector
batch-a-selection-mode-select
batch-a-knowledge-point-empty-state
batch-a-knowledge-point-availability-summary
batch-a-knowledge-point-panel
batch-a-knowledge-point-warning-list
```

Selector options:

```text
sourceUnit = enabled / selected
singleKnowledgePoint = disabled
mixedKnowledgePointsSameUnit = disabled
mixedKnowledgePointsCrossUnit = disabled
```

Current empty-state copy:

```text
目前此單元尚無已通過 QA 的可選知識點。請先使用單元出題，或等待 KnowledgePoint QA 完成。
```

## Implemented Browser Binding

`site/assets/browser/main.js` now imports:

```text
BATCH_A_SELECTION_MODES
setBatchASelectionMode
BATCH_A_SELECTOR_AVAILABILITY
listBatchAKnowledgePointAvailabilityBySource
listVisibleBatchAKnowledgePoints
```

Implemented UI functions:

```text
syncSelectionModeOptions()
renderKnowledgePointAvailability()
renderSelectorWarnings()
syncKnowledgePointSelectorFromState()
```

Current behavior:

```text
- sourceUnit remains the only enabled mode
- every non-sourceUnit option is disabled
- state is forced back to BATCH_A_SELECTION_MODES.SOURCE_UNIT
- availability counts are rendered from browser-safe selector-candidates module
- KnowledgePoint panel remains empty in current zero-visible state
- selector warning list renders safe warning codes only
```

## SourceId Generation Preserved

Existing regenerate flow remains:

```text
readControlsIntoState
-> writeQueryStateFromState
-> buildWorksheetDocumentFromState
-> renderPreviewFrame
```

No resolver call was added to `main.js`.

No worksheet-builder integration was added.

No KnowledgePoint generation path was enabled.

## Leakage Guard Preserved

Static HTML and `main.js` do not hardcode or render hidden A / D row IDs as selectable values.

Forbidden IDs covered by tests:

```text
kp_g3a_u02_add_multi_carry
kp_g3a_u02_sub_multi_borrow
kp_g3a_u02_estimate_nearest_thousand
kp_g3a_u02_word_problem_estimation_add_sub
pg_g3a_u02_add_multi_carry_seed
pg_g3a_u02_sub_multi_borrow_seed
pg_g3a_u02_estimate_nearest_thousand
pg_g3a_u02_word_problem_estimation_add_sub
```

## Styling Added

`site/assets/styles/app.css` now includes zero-visible selector styling for:

```text
availability-summary
knowledge-point-panel
selector-warning-list
empty panel placeholder
```

## Tests Added

```text
tests/site/html-zero-visible-selector.test.js
```

Test coverage:

```text
- index.html contains the zero-visible KnowledgePoint selector shell IDs
- KnowledgePoint modes are disabled in zero-visible state
- hidden A / D row IDs do not appear in static HTML
- main.js binds selector availability helpers
- main.js forces sourceUnit selector state
- main.js does not call resolver / does not enable KP generation
- hidden A / D row IDs do not appear in main.js selector code
```

## Scope Preserved

```text
KnowledgePoint worksheet generation = not enabled
VisiblePatternGroup resolver = not wired to UI
worksheet builder integration = not implemented
future visible-KP query survival = not implemented
positive visible-KP resolver fixture = not possible until QA promotion
no KP promoted to selectable
fine PatternSpec JSON = not materialized
generator/validator variants = not implemented
```

## S43D9 Gate

```text
S43D9_GATE = PASS_HTML_ZERO_VISIBLE_SELECTOR_UI_IMPLEMENTED_READBACK_PENDING_CI

PASS:
- selector shell added to index.html
- sourceUnit remains enabled and selected
- KP modes remain disabled
- empty-state copy added
- availability summary added
- empty KP panel added
- selector warning list added
- main.js renders zero-visible availability from browser-safe selector module
- main.js forces selector mode to sourceUnit
- main.js does not call resolver
- sourceId worksheet generation path preserved
- hidden A / D IDs not hardcoded into HTML or main.js
- static selector tests added
- no KP promoted to selectable

GAPS:
- post-S43D9 CI / npm test status not observed
- future visible-KP query survival not implemented
- resolver not wired to worksheet builder or UI
- positive visible-KP path not possible until explicit QA promotion
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_POST_RESOLVER_LOCAL_TEST_READBACK_PASS
GOAL_DISTANCE_AFTER  = D1_HTML_ZERO_VISIBLE_SELECTOR_UI_IMPLEMENTED_PENDING_TEST_READBACK
DISTANCE_REDUCED     = S43 now has a zero-visible HTML selector UI that exposes availability safely while preserving sourceId generation and preventing hidden/not_selectable row leakage

KPResolverTestReadback               100% -> 100%
HTMLZeroVisibleSelectorUI              0% -> 100%
KPHTMLSelectablePath                   0% ->  20%
S43Overall                            98% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43D9 npm test PASS 尚未 observed",
  "future visible-KP query survival 尚未 implemented",
  "resolver not wired to worksheet builder or UI",
  "positive visible-KP resolver fixture 尚未 possible until QA promotion",
  "no KP is selectable yet",
  "fine PatternSpec JSON 尚未 materialized",
  "generator/validator variants 尚未 implemented"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43D9R1_CIOrLocalTestReadback
```

S43D9R1 should obtain `npm test` or GitHub CI readback after the zero-visible HTML selector UI implementation before any worksheet-builder or visible-KP integration.
