# G5AU02-S109 P2 Regression-Only Source Parity Lock

## Status

```text
STATUS = IMPLEMENTED_PENDING_CI
UNIT = g5a_u02
PATTERN_ORDERS = 10,18,19
RUNTIME_MUTATION_ALLOWED = false
LEARNER_FACING_MUTATION_ALLOWED = false
```

## Milestone Authority

S109 implements only the three `regressionOnlyContracts` frozen by `G5AU02-S105_P1P2SourceParityMilestoneDefinition`:

| Order | PatternSpec | Source evidence | Locked answer model |
|---:|---|---|---|
| 10 | `ps_g5a_u02_equal_partition_range_constrained_recipients` | `g5a_u02_5a02a:p1:right-bottom` | `integerListWithUnitAnswer` |
| 18 | `ps_g5a_u02_maximum_equal_grouping` | `g5a_u02_5a02a1:p1:left-middle` | `integerAnswer` |
| 19 | `ps_g5a_u02_possible_equal_packaging_counts` | `g5a_u02_5a02a1:p1:right-middle` | `integerListWithUnitAnswer` |

These patterns were already classified as source-parity PASS. S109 therefore adds executable regression authority only; it does not repair, extend or rewrite their runtime behavior.

## Locked Semantics

### Order 10 — Range-constrained equal sharing

Required learner-visible roles:

```text
recipient range
equal sharing
no remainder
all feasible recipient counts
```

Canonical answer:

```text
factors(total) filtered by minRecipients <= value <= maxRecipients
```

### Order 18 — Maximum equal grouping

Required learner-visible roles:

```text
both quantities
equal composition in every group
maximum group count
all quantities allocated by the grouping operation
```

Canonical answer:

```text
gcd(red, blue)
```

### Order 19 — All possible equal packaging counts

Required learner-visible roles:

```text
both quantities
equal quantity of each type per box
all items used
all possible box counts
```

Canonical answer:

```text
complete common-factor set of quantityA and quantityB
```

## Acceptance Matrix

```text
canonical deterministic scenarios = 3 × 64 = 192
public worksheet scenarios         = 3 × 64 = 192
negative answer mutations          = 3
full repository regression         = required
```

For every public question, S109 requires:

```text
canonical prompt parity
stable PatternSpec and answer-model identity
questionDisplayModel = null
promptCompletenessStatus = not_required_for_pattern
no answer / structuredAnswer / answerText leakage
```

The `questionDisplayModel = null` assertion is intentional: S109 must not create new representations for already accepted P2 patterns.

## Scope Guard

Only these paths may change in the S109 PR:

```text
.github/workflows/g5a-u02-s109-regression-only-source-parity-lock.yml
data/curriculum/contracts/G5AU02_S109_P2RegressionOnlySourceParityLock.json
docs/curriculum/architecture/G5AU02_S109_P2RegressionOnlySourceParityLock.md
docs/curriculum/output/G5AU02_S109_P2_REGRESSION_ONLY_SOURCE_PARITY_PENDING.marker
docs/curriculum/output/G5AU02_S109_P2_REGRESSION_ONLY_SOURCE_PARITY_PASS.marker
tests/curriculum/g5a-u02-s109-regression-only-source-parity-lock.test.js
```

The workflow blocks all changes under `src/`, `site/`, browser bundles, other units and GCTX.

## Frozen Boundaries

```text
PatternSpec IDs
KnowledgePoint IDs
PatternGroup IDs
FormalMapping IDs
answer-model IDs
S108 accepted behavior
P0 / S106 / S107 accepted behavior
runtime generator
blocking validator
question-display pipeline
public renderer
browser bundle
other units
GCTX
free-form AI
generic fallback
runtime web search
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_S108_REMAINDER_TRANSFER_CONTEXT_FIXED_AND_MERGED
GOAL_DISTANCE_AFTER  = D1_G5A_U02_S109_REGRESSION_ONLY_SOURCE_PARITY_LOCK_PENDING_CI
DISTANCE_REDUCED     = orders 10,18,19 now have executable source-parity locks without creating a second runtime authority
REMAINING_BLOCKERS   = [S109 CI acceptance, merge, S110]
D0_ELIGIBLE          = false
NEXT_SHORTEST_STEP   = accept and merge S109, then execute G5AU02-S110_All22IntegratedSemanticRendererHTMLPDFAcceptanceAndD0Closeout
STOP_REASON          = NONE
```
