# S60F — G5A-U08 Hidden PatternSpec Materialization

```text
TASK = S60F_G5A_U08_HiddenPatternSpecMaterialization
STATUS = FULLFIXED_PENDING_CI
FULLFIX_TASK = S60F_R1_G5A_U08_AverageReasoningModeConsistency_FullFix
```

## Result

The corrected S60E FormalMapping is materialized as an authoritative hidden registry and a browser-neutral frozen projection.

```text
PatternGroups = 17
PatternSpecs = 30
numeric = 16
reasoning = 5
application = 9
contextual reasoning = 2
visible = 0
routed = 0
production = 0
```

## S60F-R1 correction

The original S60F gate correctly rejected two PatternSpecs whose `mode` did not match their owning reasoning group:

- `ps_g5a_u08_app_average_inverse`
- `ps_g5a_u08_app_average_update`

Both are now `mode = reasoning`, remain assigned to `pg_g5a_u08_average_reasoning`, and retain their application-style semantic template through the explicit `contextualReasoning = true` contract.

The fix is applied at every authority boundary:

- S60E FormalMapping;
- S60F authoritative registry;
- browser-neutral projection;
- mode distribution summaries;
- S60E and S60F regression tests.

## Lifecycle

```text
selector visibility = hidden
canonical routing = disabled
production use = forbidden
generator = hidden_not_implemented
validator = contract_only_not_runtime
generic fallback = forbidden
public N+2 = forbidden
public formal equation = forbidden
```

The historical S43E13 overlay remains unchanged. S60F is the new hidden authority and does not activate any public selector or runtime route.

## Drift protection

Static QA compares:

- PatternGroup ID, KP, mode and member specs;
- PatternSpec ID, group, KP, mode, answer model, TemplateFamily, contextual-reasoning flag and order;
- S60E FormalMapping against S60F authority;
- S60F authority against browser projection;
- complete non-overlapping group membership;
- deep-frozen browser projection;
- hidden/no-routing/no-production lifecycle.

## Distance closeout

```text
GOAL_DISTANCE_BEFORE = D2_G5A_U08_HIDDEN_MATERIALIZATION_MODE_CONSISTENCY_BLOCKED
GOAL_DISTANCE_AFTER  = D2_G5A_U08_30_HIDDEN_PATTERNSPECS_MODE_CONSISTENT_PENDING_CI
DISTANCE_REDUCED     = Corrected the upstream and downstream mode contract for average inverse/update and added two-layer drift protection.
REMAINING_BLOCKERS   = [
  "S60F-R1 PR CI and merge are pending",
  "Numeric generator and blocking validator are not implemented",
  "N+1 application generator and semantic validator are not implemented",
  "Promotion, UI, worksheet and print remain pending"
]
NEXT_SHORTEST_STEP = S60G_G5A_U08_NumericGeneratorAndBlockingValidator
```
