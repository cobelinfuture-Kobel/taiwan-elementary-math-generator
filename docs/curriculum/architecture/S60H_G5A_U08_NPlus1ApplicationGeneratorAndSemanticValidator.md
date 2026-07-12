# S60H — G5A-U08 N+1 Application Generator and Semantic Validator

```text
TASK = S60H_G5A_U08_NPlus1ApplicationGeneratorAndSemanticValidator
STATUS = IMPLEMENTED_PENDING_CI
```

## Runtime scope

```text
application PatternSpecs = 9
contextual reasoning PatternSpecs = 2
total S60H PatternSpecs = 11
source-backed TemplateFamilies = 10
```

Average inverse and average update remain `mode = reasoning`, carry `contextualReasoning = true`, and retain their source-backed average TemplateFamily.

## Generation policy

Default hidden-batch policy:

```text
Level N = 30%
Level N+1 = 70%
daily life = 50%
SDG = 50%
max semantic delta per N+1 item = 1
N+2 = forbidden
```

The generator supports deterministic seed replay, exact count 1–1000, grouped/shuffled ordering, selected PatternSpec filtering, depth filtering and context filtering.

The first SDG allowlist is:

```text
SDG 2, 4, 6, 7, 11, 12, 13, 15
```

All generated SDG quantities are `fictionalized_for_practice`. Real-statistic claims require a future `sourceRef` and are rejected without one.

## Semantic validation

Each item validates:

- source, KP, PatternGroup, PatternSpec and mode identity;
- TemplateFamily and contextual-reasoning ownership;
- N/N+1 depth and exactly one allowlisted semantic delta for N+1;
- RoleBinding and UnitFlow;
- Traditional Chinese prompt presence;
- SDG semantic relevance rather than label-only wording;
- nonnegative quantities;
- exact grouping and allocation feasibility;
- payment sufficiency and fixed-group discounts;
- one-expression answer, numeric answer and answer unit;
- average, average inverse, average update and transfer direction;
- zero output on blocking semantic failure;
- no generic fallback or public routing.

## QA

- every supported PatternSpec/depth/context combination;
- deterministic replay;
- 1000-question stress with exact 30/70 and 50/50 mixes;
- 11 PatternSpecs, 10 TemplateFamilies and all 8 SDG goals reached;
- all 7 application semantic deltas reached;
- Traditional Chinese and fictional-data checks;
- SDG label-only and unsourced-statistic mutations;
- impossible allocation, insufficient payment, average and transfer mutations;
- batch zero-output enforcement;
- unsupported depth/context/spec rejection.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U08_NUMERIC_AND_NONCONTEXT_REASONING_RUNTIME_COMPLETE
GOAL_DISTANCE_AFTER  = D1_G5A_U08_ALL_30_PATTERNSPECS_HAVE_HIDDEN_RUNTIME_PENDING_CI
DISTANCE_REDUCED     = Added deterministic N/N+1 daily-life and SDG generation plus semantic validation for all 11 contextual PatternSpecs.
REMAINING_BLOCKERS   = [
  "S60H PR CI and merge",
  "S60I promotion/resolver/public selector",
  "S60J worksheet/renderer",
  "S60K public UI/print QA",
  "S60L production stress and D0 closeout"
]
NEXT_SHORTEST_STEP = S60I_G5A_U08_PromotionResolverAndPublicSelectorIntegration
```
