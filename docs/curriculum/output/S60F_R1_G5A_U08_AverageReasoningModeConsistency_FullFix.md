# S60F-R1 — G5A-U08 Average Reasoning Mode Consistency FullFix

```text
TASK = S60F_R1_G5A_U08_AverageReasoningModeConsistency_FullFix
STATUS = IMPLEMENTED_PENDING_CI
PR = 72
```

## Root cause

`pg_g5a_u08_average_reasoning` is a reasoning PatternGroup, but the S60E FormalMapping declared its two member PatternSpecs as `mode = application`.

Affected rows:

```text
ps_g5a_u08_app_average_inverse
ps_g5a_u08_app_average_update
```

The S60F membership gate correctly rejected the mismatch.

## FullFix

- changed both PatternSpecs to `mode = reasoning` in S60E;
- marked them `contextualReasoning = true` so their source-backed TemplateFamily remains valid;
- synchronized S60F authority and browser projection;
- corrected mode totals from `16/3/11` to `16/5/9`;
- added S60E group-mode referential-integrity QA;
- added S60E-to-S60F and S60F-to-projection drift QA;
- retained hidden, unrouted and production-forbidden lifecycle gates.

## Acceptance target

```text
patternSpecCount = 30
numeric = 16
reasoning = 5
application = 9
contextualReasoning = 2
group/spec mode mismatches = 0
formal mapping/registry mismatches = 0
registry/projection mismatches = 0
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_G5A_U08_HIDDEN_MATERIALIZATION_MODE_CONSISTENCY_BLOCKED
GOAL_DISTANCE_AFTER  = D2_G5A_U08_30_HIDDEN_PATTERNSPECS_MODE_CONSISTENT_PENDING_CI
DISTANCE_REDUCED     = Corrected the authoritative mode classification and added upstream/downstream regression gates.
REMAINING_BLOCKERS   = ["PR CI", "merge", "main CI"]
NEXT_SHORTEST_STEP   = S60G_G5A_U08_NumericGeneratorAndBlockingValidator
```
