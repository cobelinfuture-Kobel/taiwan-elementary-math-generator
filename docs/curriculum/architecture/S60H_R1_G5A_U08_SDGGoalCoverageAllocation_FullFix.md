# S60H-R1 — G5A-U08 SDG Goal Coverage Allocation FullFix

```text
TASK = S60H_R1_G5A_U08_SDGGoalCoverageAllocation_FullFix
STATUS = PASS_CI_SYNCED_AND_MERGED
PR = 76
MERGE_COMMIT = d3ccee60c01f7f09118935fb53c3d17bb5924536
MAIN_CI_RUN = 29178859955
MAIN_TESTS = 942
MAIN_PASS = 942
MAIN_FAIL = 0
WORKING_TREE = CLEAN
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
- added blocking validation for cell allocation and SDG coverage summaries;
- replaced the initial cubic planner search with a bounded margin solver before acceptance.

## Acceptance

```text
all-unit 1000 questions = 8/8 SDGs
all-unit depth mix = 300/700
all-unit context mix = 500/500
single-spec feasibility = PASS
single-context feasibility = PASS
small-count feasibility = PASS
deterministic replay = PASS
allocation summaries match questions = PASS
PR workflows = 5/5 PASS
main npm tests = 942/942 PASS
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U08_S60H_IMPLEMENTED_SDG_COVERAGE_ALLOCATION_BLOCKED
GOAL_DISTANCE_AFTER  = D1_G5A_U08_ALL_30_PATTERNSPECS_HAVE_VALIDATED_HIDDEN_RUNTIME
DISTANCE_REDUCED     = All numeric, reasoning, application, N+1 and SDG PatternSpecs now have deterministic hidden generation and blocking validation.
REMAINING_BLOCKERS   = [
  "S60I promotion/resolver/public selector",
  "S60J worksheet/renderer",
  "S60K public UI/print QA",
  "S60L production stress and D0 closeout"
]
NEXT_SHORTEST_STEP   = S60I_G5A_U08_PromotionResolverAndPublicSelectorIntegration
```
