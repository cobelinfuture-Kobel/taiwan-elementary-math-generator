# S60F-R1 — G5A-U08 Average Reasoning Mode Consistency FullFix

```text
TASK = S60F_R1_G5A_U08_AverageReasoningModeConsistency_FullFix
STATUS = PASS_CI_SYNCED_AND_MERGED
IMPLEMENTATION_PR = 72
MERGE_COMMIT = cabb579c79852c5a3c5e0f06aec0f6010aba5805
MAIN_CI_RUN = 29177196142
```

## Root cause

`pg_g5a_u08_average_reasoning` is a reasoning PatternGroup, but the S60E FormalMapping declared its two member PatternSpecs as `mode = application`.

Affected rows:

```text
ps_g5a_u08_app_average_inverse
ps_g5a_u08_app_average_update
```

The S60F membership gate correctly rejected the mismatch before merge.

## FullFix

- changed both PatternSpecs to `mode = reasoning` in S60E;
- marked them `contextualReasoning = true` so their source-backed TemplateFamily remains valid;
- synchronized S60F authority and browser projection;
- corrected mode totals from `16/3/11` to `16/5/9`;
- added S60E group-mode referential-integrity QA;
- added S60E-to-S60F and S60F-to-projection drift QA;
- retained hidden, unrouted and production-forbidden lifecycle gates.

## Acceptance

```text
patternSpecCount = 30
numeric = 16
reasoning = 5
application = 9
contextualReasoning = 2
group/spec mode mismatches = 0
formal mapping/registry mismatches = 0
registry/projection mismatches = 0
PR checks = PASS
main tests = 904
main pass = 904
main fail = 0
working tree = clean
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D2_G5A_U08_HIDDEN_MATERIALIZATION_MODE_CONSISTENCY_BLOCKED
GOAL_DISTANCE_AFTER  = D2_G5A_U08_30_HIDDEN_PATTERNSPECS_MODE_CONSISTENT
DISTANCE_REDUCED     = Corrected the authoritative mode classification, synchronized all projections and added permanent upstream/downstream regression gates.
REMAINING_BLOCKERS   = [
  "Numeric generator and blocking validator are not implemented",
  "N+1 application generator and semantic validator are not implemented",
  "Promotion, UI, worksheet and print are pending"
]
NEXT_SHORTEST_STEP   = S60G_G5A_U08_NumericGeneratorAndBlockingValidator
STOP_REASON          = NONE
```
