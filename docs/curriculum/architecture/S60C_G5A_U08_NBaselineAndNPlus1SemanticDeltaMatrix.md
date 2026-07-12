# S60C — G5A-U08 N Baseline and N+1 Semantic Delta Matrix

```text
TASK = S60C_G5A_U08_NBaselineAndNPlus1SemanticDeltaMatrix
STATUS = IMPLEMENTED_PENDING_CI
```

## Core rule

```text
N       = complete elementary arithmetic structure for one KP
N+1     = N plus exactly one allowlisted semantic relation
N+2     = challenge extension, forbidden in core generation
```

The semantic delta is not counted by operator count or expression length. It is an additional quantity relation such as combining groups, adjusting a unit amount, inverse reasoning, population update, nested grouping, one discount/offset, or comparing equivalent models.

## Coverage

- 11/11 KPs have an explicit N baseline.
- 7 application-capable KPs have an N+1 allowlist.
- 4 KPs remain numeric/reasoning-only in core.
- all 8 approved semantic deltas are used.
- each core item permits at most one delta.
- formal `x` equations remain optional challenge representations; an elementary arithmetic solution path is mandatory.

## Production default

```text
N = 30%
N+1 = 70%
N+2 = 0% in core
```

## Acceptance

```text
11 explicit N baselines
8 unique semantic deltas
all application-capable KPs have allowlists
semantic-delta count matches selected depth
no accidental N+2
no formal-equation requirement
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D3_G5A_U08_KP_PATTERN_GROUP_TAGS_FROZEN_DEPTH_UNDEFINED
GOAL_DISTANCE_AFTER  = D2_G5A_U08_N_AND_NPLUS1_SEMANTIC_DELTA_MATRIX_FROZEN
DISTANCE_REDUCED     = Every KP now has a stable N baseline and controlled N+1 expansion boundary.
REMAINING_BLOCKERS   = [
  "Application TemplateFamily and SDG ContextVariant contracts are not defined",
  "FormalMapping, answer models and validator contracts are not defined",
  "PatternSpecs and runtime remain hidden/unimplemented"
]
NEXT_SHORTEST_STEP = S60D_G5A_U08_ApplicationTemplateAndSDGContextContract
```
