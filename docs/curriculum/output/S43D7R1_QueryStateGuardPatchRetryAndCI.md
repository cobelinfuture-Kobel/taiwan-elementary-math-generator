# S43D7R1 Query State Guard Patch Retry and CI

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43D7R1_QueryStateGuardPatchRetryAndCI
TASK_STATUS = QUERY_STATE_ZERO_VISIBLE_GUARD_IMPLEMENTED_READBACK_PENDING_CI
WRITE_TYPE = query_state_runtime_plus_tests_plus_docs
```

S43D7R1 retries the query-state implementation that was blocked in S43D7. This retry uses a smaller current-state patch: because the S43D6 browser selector projection currently has zero visible KnowledgePoints, query-state now forces selector URLs back to `sourceUnit` and drops `kp` / `pg` values.

## Files Modified / Created

```text
MODIFIED:
site/assets/browser/state/query-state.js

CREATED:
tests/site/query-state-selector.test.js
docs/curriculum/output/S43D7R1_QueryStateGuardPatchRetryAndCI.md
```

## Implemented Query-State Behavior

```text
- existing sourceId / questionCount / ordering / answerKey / generationSeed / columns / rowsPerPage params remain backward compatible
- parseQueryState() always returns selectionMode = sourceUnit in current zero-visible state
- parseQueryState() drops kp selector IDs in current zero-visible state
- parseQueryState() drops pg selector IDs in current zero-visible state
- parseQueryState() emits safe aggregate selectorWarnings
- writeQueryStateFromState() writes only source-unit params and does not write selectionMode / kp / pg while sourceUnit is active
```

## Current Zero-Visible Boundary

Current selector projection remains:

```text
visibleCount = 0
hiddenPendingCount = 2
notSelectableCount = 2
```

Therefore the current query-state implementation is intentionally conservative:

```text
singleKnowledgePoint query -> fallback to sourceUnit
mixedKnowledgePointsSameUnit query -> fallback to sourceUnit
mixedKnowledgePointsCrossUnit query -> fallback to sourceUnit
kp IDs -> dropped
pg IDs -> dropped
```

This prevents hidden A rows and D rows from surviving URL hydration.

## Tests Added

```text
tests/site/query-state-selector.test.js
```

Test coverage:

```text
- source-unit query params remain backward compatible
- hidden A row query IDs are dropped
- D row query IDs are dropped
- selector warnings are emitted for dropped selector queries
- writeQueryStateFromState() does not write selectionMode / kp / pg while sourceUnit is active
```

## Scope Preserved

```text
HTML selector = not implemented
resolver = not implemented
generator/validator variants = not implemented
fine PatternSpec JSON = not materialized
no KP promoted to selectable
sourceId worksheet path = preserved
```

## Known Limitation

This patch is correct for the current S43 state where visibleCount = 0.

A future promotion task that creates visible KnowledgePoint candidates must extend query-state parsing / writing so valid visible KP IDs may survive. That future extension must still use browser-safe selector helpers and resolver revalidation.

## S43D7R1 Gate

```text
S43D7R1_GATE = PASS_QUERY_STATE_ZERO_VISIBLE_GUARD_IMPLEMENTED_READBACK_PENDING_CI

PASS:
- query-state.js update succeeded after smaller retry
- existing source-unit query behavior preserved
- selectionMode/kp/pg are dropped in current zero-visible selector state
- hidden A-row URLs cannot hydrate selected KP state
- D-row URLs cannot hydrate selected KP state
- query-state selector tests added
- HTML selector not implemented
- resolver not implemented
- no KP promoted to selectable

GAPS:
- CI / npm test status not observed in this environment
- future visible-KP query survival is not implemented yet
- resolver not implemented yet
- HTML selector not implemented yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_SELECTOR_STATE_PARTIAL_IMPLEMENTED_QUERY_BLOCKED
GOAL_DISTANCE_AFTER  = D1_SELECTOR_STATE_QUERY_ZERO_VISIBLE_GUARD_IMPLEMENTED
DISTANCE_REDUCED     = S43 now has both state-level and query-state-level guards for the current zero-visible KnowledgePoint selector state

SelectorStateImplementation          60% -> 100%
SelectorQueryStateImplementation      0% ->  60%
KPResolverImplementation              0% ->   0%
KPHTMLSelectablePath                  0% ->   0%
S43Overall                           94% ->  95%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "CI / npm test 尚未 observed",
  "future visible-KP query survival 尚未 implemented",
  "VisiblePatternGroup resolver 尚未 implemented",
  "resolver tests 尚未 implemented",
  "HTML KnowledgePoint selector 尚未實作",
  "no KP is selectable yet",
  "fine PatternSpec JSON 尚未 materialized",
  "generator/validator variants 尚未 implemented"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43D7R2_CIOrLocalTestReadback
```

S43D7R2 should obtain `npm test` or GitHub CI readback for the S43D6/S43D7/S43D7R1 tests before moving to resolver implementation.
