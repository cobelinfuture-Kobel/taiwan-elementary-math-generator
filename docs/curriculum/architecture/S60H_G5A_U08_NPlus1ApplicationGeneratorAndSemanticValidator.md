# S60H — G5A-U08 N+1 Application Generator and Semantic Validator

```text
TASK = S60H_G5A_U08_NPlus1ApplicationGeneratorAndSemanticValidator
FULLFIX_TASK = S60H_R1_G5A_U08_SDGGoalCoverageAllocation_FullFix
STATUS = FULLFIX_PENDING_CI
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

## S60H-R1 allocation FullFix

The failed first implementation balanced only total PatternSpec usage. This allowed N/daily-life rows to consume the low-count position for PatternSpecs whose SDG variants uniquely represented SDG 4 and SDG 13.

The corrected scheduler now uses:

```text
allocation key = PatternSpec × depth × contextType
```

Execution order:

1. resolve a feasible joint depth/context matrix;
2. seed reachable SDG goals without changing the requested margins;
3. seed selected PatternSpecs when their legal cells still have capacity;
4. fill each joint cell by the least-used PatternSpec-depth-context count;
5. derive every allocation summary from the generated questions.

Coverage is feasibility-aware. A single PatternSpec, SDG-only selector, daily-life-only selector, or small question count is required to cover only the goals and cells reachable under that selection. The all-unit 1000-question default must cover all 8 SDG goals while preserving the exact 30/70 and 50/50 margins.

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

Batch validation additionally verifies exact `specAllocation`, `depthAllocation`, `contextAllocation`, `cellAllocation`, and `coveredSdgGoalIds` against the generated questions.

## QA

- every supported PatternSpec/depth/context combination;
- deterministic replay;
- 1000-question stress with exact 30/70 and 50/50 mixes;
- 11 PatternSpecs, 10 TemplateFamilies and all 8 SDG goals reached;
- all 7 application semantic deltas reached;
- single-spec and single-context feasibility;
- small question-count feasibility;
- PatternSpec-depth-context allocation integrity;
- Traditional Chinese and fictional-data checks;
- SDG label-only and unsourced-statistic mutations;
- impossible allocation, insufficient payment, average and transfer mutations;
- batch zero-output enforcement;
- unsupported depth/context/spec rejection.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U08_S60H_IMPLEMENTED_SDG_COVERAGE_ALLOCATION_BLOCKED
GOAL_DISTANCE_AFTER  = D1_G5A_U08_ALL_30_PATTERNSPECS_HAVE_HIDDEN_RUNTIME_FULLFIX_PENDING_CI
DISTANCE_REDUCED     = Replaced total-spec balancing with feasible PatternSpec-depth-context allocation and deterministic SDG coverage seeding.
REMAINING_BLOCKERS   = [
  "S60H-R1 PR CI and merge",
  "S60I promotion/resolver/public selector",
  "S60J worksheet/renderer",
  "S60K public UI/print QA",
  "S60L production stress and D0 closeout"
]
NEXT_SHORTEST_STEP = S60I_G5A_U08_PromotionResolverAndPublicSelectorIntegration
```
