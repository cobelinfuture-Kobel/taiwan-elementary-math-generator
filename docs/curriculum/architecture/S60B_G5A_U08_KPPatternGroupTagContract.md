# S60B — G5A-U08 KnowledgePoint, PatternGroup and Tag Contract

```text
TASK = S60B_G5A_U08_KPPatternGroupTagContract
STATUS = IMPLEMENTED_PENDING_CI
```

## Result

S60B freezes 11 mathematical KnowledgePoints, 17 representation/task PatternGroups and 37 canonical tags.

The layer boundary is explicit:

```text
KnowledgePoint = mathematical concept
PatternGroup = numeric / application / reasoning mode
PatternSpec = deterministic generatable structure
TemplateFamily = semantic relation and context
SDG = semantic context taxonomy
N+1 = semantic depth property
```

No generic word-problem, SDG or multi-step-context row remains a KnowledgePoint.

## Mode ownership

- `numeric`: arithmetic evaluation, equivalent transformation and compensation.
- `application`: source-backed contextual modeling and one-expression tasks.
- `reasoning`: missing-operator, equivalence/error judgement and average inverse/update structures.

Application groups require a TemplateFamily contract. Reasoning groups require structured answer models.

## Canonical constraints

The tag registry explicitly records integer-only scope, nonnegative quantities, exact division when required, one-expression requirements and the maximum one semantic delta rule.

## Acceptance

```text
11 unique KPs
17 unique PatternGroups
37 unique canonical tags
0 orphan PatternGroups
0 duplicate tags
0 generic application-only KPs
all groups have explicit mode
```

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D3_G5A_U08_SOURCE_RECONCILED_LAYER_OWNERSHIP_UNFROZEN
GOAL_DISTANCE_AFTER  = D3_G5A_U08_KP_PATTERN_GROUP_AND_TAG_CONTRACT_FROZEN
DISTANCE_REDUCED     = Mathematical concepts, task modes and canonical tags now have non-overlapping ownership.
REMAINING_BLOCKERS   = [
  "N baseline and N+1 semantic-delta allowlist are not defined per KP",
  "Application TemplateFamily and SDG context contracts are not defined",
  "FormalMapping and answer/validator contracts remain pending"
]
NEXT_SHORTEST_STEP = S60C_G5A_U08_NBaselineAndNPlus1SemanticDeltaMatrix
```
