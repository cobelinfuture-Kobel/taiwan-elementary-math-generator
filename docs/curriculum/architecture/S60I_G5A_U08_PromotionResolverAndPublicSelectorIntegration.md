# S60I — G5A-U08 Promotion, Resolver and Public Selector Integration

```text
TASK = S60I_G5A_U08_PromotionResolverAndPublicSelectorIntegration
STATUS = IMPLEMENTED_PENDING_CI
```

## Promotion

```text
visible KnowledgePoints = 11
visible PatternGroups = 17
promoted PatternSpecs = 30
numeric groups = 8
application groups = 6
reasoning groups = 3
```

The S60F hidden authority remains unchanged. Promotion is an overlay with selector visibility and canonical runtime eligibility only; worksheet eligibility and production use remain blocked until S60J.

## Public controls

```text
questionMode = mixed | numeric | application | reasoning
depthMode = mixed | N | N_PLUS_1
contextMode = mixed | daily_life | sdg
public N+2 = false
public formal equation = false
```

The `reasoning` mode is retained because S60B defines it as an explicit public PatternGroup mode. Non-context reasoning uses S60G; contextual average inverse/update reasoning uses S60H.

## Resolver and route

The visible resolver accepts only `singleKnowledgePoint` and `mixedKnowledgePointsSameUnit`. A KnowledgePoint with multiple PatternGroups requires explicit group selection. Public PatternSpec injection is ignored; all families are derived from visible groups.

Canonical execution:

```text
visible KP/group selection
→ mode/depth/context compatibility filtering
→ group-first runtime allocation
→ S60G numeric/non-context reasoning or S60H contextual runtime
→ blocking validator
→ S60I canonical lifecycle validation
→ canonical runtime output
```

Any resolver, compatibility, generation or validator error returns zero canonical questions. Generic fallback is forbidden.

## Browser state

G5A-U08 worksheet plans preserve:

```text
selectionMode
selectedKnowledgePointIds
selectedPatternGroupIds
questionMode
depthMode
contextMode
questionCount
ordering
includeAnswerKey
```

Other units retain their existing state shape.

## Boundary

S60I does not add worksheet eligibility, renderer profiles, print pagination, HTML/PDF smoke, N+2, formal equation solving, or production promotion.

## QA

- JSON/runtime promotion parity;
- 11 KP / 17 group / 30 PatternSpec selector projection;
- hidden authority immutability;
- strict multi-group resolver behavior;
- browser state round trip for all three public controls;
- S60G numeric canonical route;
- S60H N+1 SDG canonical route;
- mixed non-context/contextual reasoning route;
- impossible control combination rejection;
- arbitrary PatternSpec injection rejection;
- blocking validator zero-output behavior;
- source-unit and unrelated route preservation.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U08_ALL_30_PATTERNSPECS_HAVE_VALIDATED_HIDDEN_RUNTIME
GOAL_DISTANCE_AFTER  = D1_G5A_U08_PUBLIC_SELECTOR_AND_CANONICAL_RUNTIME_INTEGRATED_PENDING_CI
DISTANCE_REDUCED     = Promoted all 11 KPs, 17 groups and 30 PatternSpecs into resolver-derived public controls and a validated no-fallback canonical runtime.
REMAINING_BLOCKERS   = [
  "S60I PR CI and merge",
  "S60J worksheet/answer key/renderer",
  "S60K public UI/print/query-state QA",
  "S60L production stress and D0 closeout"
]
NEXT_SHORTEST_STEP = S60J_G5A_U08_WorksheetAnswerKeyAndRendererIntegration
```
