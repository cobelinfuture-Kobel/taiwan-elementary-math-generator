# G5AU02-S109 P2 Regression-Only Source Parity Lock

## Status

```text
STATUS = PASS_ACCEPTED_PENDING_MERGE
UNIT = g5a_u02
PATTERN_ORDERS = 10,18,19
RUNTIME_MUTATION_ALLOWED = false
LEARNER_FACING_MUTATION_ALLOWED = false
ACCEPTED_TEST_HEAD = e4c817fea1e3f0f047dbda1fee243339f1a0e999
ACCEPTANCE_NODE_RUN = 29647711856
PR = 266
```

## Milestone Authority

S109 implements only the three `regressionOnlyContracts` frozen by `G5AU02-S105_P1P2SourceParityMilestoneDefinition`:

| Order | PatternSpec | Source evidence | Locked answer model |
|---:|---|---|---|
| 10 | `ps_g5a_u02_equal_partition_range_constrained_recipients` | `g5a_u02_5a02a:p1:right-bottom` | `integerListWithUnitAnswer` |
| 18 | `ps_g5a_u02_maximum_equal_grouping` | `g5a_u02_5a02a1:p1:left-middle` | `integerAnswer` |
| 19 | `ps_g5a_u02_possible_equal_packaging_counts` | `g5a_u02_5a02a1:p1:right-middle` | `integerListWithUnitAnswer` |

These patterns were already classified as source-parity PASS. S109 adds executable regression authority only; it does not repair, extend or rewrite runtime behavior.

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
canonical deterministic scenarios = 3 × 64 = 192 PASS
public worksheet scenarios         = 3 × 64 = 192 PASS
negative answer mutations          = 3 PASS
full repository Node regression    = PASS
```

For every public question, S109 locks:

```text
canonical prompt parity
stable PatternSpec and answer-model identity
questionDisplayModel = null
promptCompletenessStatus = not_required_for_pattern
no answer / structuredAnswer / answerText leakage
```

The `questionDisplayModel = null` assertion is intentional: S109 must not create new representations for already accepted P2 patterns.

## Scope Guard Evidence

PR #266 changed exactly five files:

```text
.github/workflows/g5a-u02-s109-regression-only-source-parity-lock.yml
data/curriculum/contracts/G5AU02_S109_P2RegressionOnlySourceParityLock.json
docs/curriculum/architecture/G5AU02_S109_P2RegressionOnlySourceParityLock.md
docs/curriculum/output/G5AU02_S109_P2_REGRESSION_ONLY_SOURCE_PARITY_PENDING.marker
tests/curriculum/g5a-u02-s109-regression-only-source-parity-lock.test.js
```

No `src/`, `site/`, renderer, validator, browser bundle, other-unit or GCTX file changed.

The dedicated S109 workflow run `29647711884` remained runner-queued at acceptance time. This queue state was not treated as a failure or blocker because equivalent blocking evidence on the exact same head had already completed:

```text
PR changed-file audit = PASS 5/5 allowed
Node Test run 29647711856 = success
S109 focused tests included in npm test = PASS
S105 predecessor test included in npm test = PASS
full repository regression = PASS
```

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

## Closeout

```text
1. Distance shortened:
   three already-correct P2 patterns now have executable, deterministic source-parity regression authority.

2. System node advanced:
   accepted PatternSpecs -> regression contract -> canonical/public parity tests -> full repository gate.

3. Blocker removed:
   orders 10,18,19 no longer remain unprotected P2 assumptions before all-22 closeout.

4. New blocker:
   none; no runtime authority or learner-facing behavior was added.

5. Next shortest effective step:
   merge PR #266 and execute S110 all-22 integrated acceptance and D0 closeout.
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_S108_REMAINDER_TRANSFER_CONTEXT_FIXED_AND_MERGED
GOAL_DISTANCE_AFTER  = D1_G5A_U02_S109_REGRESSION_ONLY_SOURCE_PARITY_LOCKED
DISTANCE_REDUCED     = orders 10,18,19 now have 192 canonical and 192 public executable source-parity locks, negative mutation coverage and full-regression acceptance without runtime mutation
REMAINING_BLOCKERS   = [merge PR #266, S110]
D0_ELIGIBLE          = false
NEXT_SHORTEST_STEP   = merge S109 and execute G5AU02-S110_All22IntegratedSemanticRendererHTMLPDFAcceptanceAndD0Closeout
STOP_REASON          = NONE
```
