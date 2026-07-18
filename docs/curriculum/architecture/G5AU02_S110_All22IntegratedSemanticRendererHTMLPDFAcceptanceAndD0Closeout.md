# G5AU02-S110 All-22 Integrated Semantic Renderer HTML/PDF Acceptance and D0 Closeout

## Status

```text
STATUS = IMPLEMENTED_PENDING_CI
UNIT = g5a_u02
PATTERN_COUNT = 22
D0_ELIGIBLE = false
```

## Locked Scope

S110 is the final integration and acceptance milestone defined by S105. It does not create a second generator, validator, renderer or browser runtime.

The accepted path is:

```text
22 canonical PatternSpecs
→ canonical resolver and blocking validator
→ committed browser bundle
→ public global-layout projection
→ shared G5A-U02 semantic renderer
→ question sheet and answer key
→ actual 18-layout browser geometry
→ HTML/PDF print acceptance
→ D0 eligibility
```

Frozen:

```text
PatternSpec IDs
KnowledgePoint IDs
PatternGroup IDs
FormalMapping IDs
answer-model IDs
P0 behavior
S106 behavior
S107 behavior
S108 behavior
S109 regression-only behavior
other units
GCTX
free-form AI
generic fallback
runtime web search
```

## Pattern Partition

```text
P0 accepted orders       = 1,2,4,8,9,11,13,16,17,20,21,22
Repaired orders          = 3,5,6,7,12,14,15
Regression-only orders   = 10,18,19
Structured representations = 19
Plain-prompt locked rows   = 3
Total patterns             = 22
```

The three S109 rows must remain plain-prompt patterns with `questionDisplayModel = null` and `promptCompletenessStatus = not_required_for_pattern`. S110 must not invent a representation for them.

## Item Integration Gate

```text
22 patterns × 64 seeds = 1408 scenarios
```

Every scenario must pass:

```text
deterministic canonical replay
canonical blocking validation
stable route / PatternSpec / answer-model identity
canonical source and committed browser bundle deep parity
public projection
question/answer boundary checks
shared renderer HTML output
no internal ID leakage
no learner-visible answer leakage
```

## Actual Layout and HTML/PDF Gate

```text
22 patterns × 18 approved layouts = 396 scenarios
```

Each scenario is rendered in Chromium print media and verified using:

```text
actual visible question-card X-coordinate clusters
computed CSS grid column count
computed CSS grid row count
card overflow count
page overflow
card overlap count
PDF page count
PDF blank-page count
PDF bounding-box overflow count
```

Metadata alone is not accepted as column or row evidence.

## Answer Boundary Gate

```text
22 patterns × 3 layouts × 2 answer states = 132 scenarios
layouts = 3x5, 2x6, 1x7
answer states = off, on
```

The question section must contain no answer nodes. Answer pages must appear only when enabled, use the approved `1 × 5` answer layout, and remain free of internal IDs, overflow, overlap, clipping, blank pages and out-of-bounds PDF text.

## Browser Bundle and Regression Gate

The committed browser bundle must be byte-identical to a fresh canonical-source build. S104, S106, S107, S108 and S109 focused gates remain blocking, followed by the complete repository Node regression.

## D0 Decision Rule

D0 may be declared only when all of the following are true on one accepted PR head:

```text
1408 / 1408 item integrations PASS
396 / 396 actual layout HTML/PDF scenarios PASS
132 / 132 answer-boundary HTML/PDF scenarios PASS
browser bundle parity PASS
predecessor gates PASS
full repository regression PASS
PASS marker committed
PR merged to main
```

No partial matrix, queued job, metadata-only geometry claim, or historical run from a different runtime head is sufficient for D0.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_S109_REGRESSION_ONLY_SOURCE_PARITY_LOCKED_AND_MERGED
GOAL_DISTANCE_AFTER  = D1_G5A_U02_ALL22_INTEGRATED_ACCEPTANCE_PENDING_CI
DISTANCE_REDUCED     = all 22 patterns now share one explicit final item, browser-bundle, layout, answer-boundary, HTML/PDF and regression acceptance contract
REMAINING_BLOCKERS   = [S110 CI matrices, closeout marker, merge]
D0_ELIGIBLE          = false
NEXT_SHORTEST_STEP   = run S110 CI; fix only demonstrated integration failures; then close out and merge
STOP_REASON          = NONE
```
