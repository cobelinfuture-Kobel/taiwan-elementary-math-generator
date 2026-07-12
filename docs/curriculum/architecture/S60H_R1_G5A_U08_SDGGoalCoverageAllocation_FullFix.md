# S60H-R1 — G5A-U08 SDG Goal Coverage Allocation FullFix

```text
TASK = S60H_R1_G5A_U08_SDGGoalCoverageAllocation_FullFix
STATUS = IMPLEMENTED_PENDING_CI
PR = 76
```

## Failure

The first S60H scheduler balanced total PatternSpec counts only. Under the default 1000-question N/N+1 and daily-life/SDG ordering, the SDG variants uniquely carrying SDG 4 and SDG 13 were skipped.

## FullFix

- preserved the original deterministic question generator as a dedicated core module;
- replaced batch scheduling with a feasible joint depth/context planner;
- changed balancing to `PatternSpec × depth × contextType`;
- seeded reachable SDG goals before balanced fill;
- seeded selected PatternSpecs when legal capacity remained;
- retained exact 30/70 and 50/50 defaults for the all-unit selection;
- relaxed unreachable global coverage for constrained selectors and small counts;
- derived all allocation summaries from actual questions;
- added blocking validation for cell allocation and SDG coverage summaries.

## Acceptance

```text
all-unit 1000 questions = 8/8 SDGs
all-unit depth mix = 300/700
all-unit context mix = 500/500
single-spec feasibility = required
single-context feasibility = required
small-count feasibility = required
deterministic replay = required
allocation summaries match questions = required
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U08_S60H_IMPLEMENTED_SDG_COVERAGE_ALLOCATION_BLOCKED
GOAL_DISTANCE_AFTER  = D1_G5A_U08_S60H_R1_ALLOCATION_FULLFIX_PENDING_CI
DISTANCE_REDUCED     = Restored deterministic coverage of all reachable SDG goals without weakening selector or allocation contracts.
REMAINING_BLOCKERS   = ["PR CI", "merge", "main CI", "S60I-S60L"]
NEXT_SHORTEST_STEP   = S60I_G5A_U08_PromotionResolverAndPublicSelectorIntegration
```
