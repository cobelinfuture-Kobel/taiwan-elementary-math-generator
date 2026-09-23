# S96I G5A-U02 Public Text Seed and Live Click-Path Fix

## Observed production failure

The public Classic UI failed when a user selected the G5A-U02 KnowledgePoint `多條件四位數推理` and clicked `產生 / 重新產生` with the default seed value `batch-a-browser`.

## Root cause

The public browser state intentionally stores `generationSeed` as text. The G5A-U02 dynamic runtime passed that value directly to the hidden worksheet plan as `baseSeed`, while the hidden worksheet contract only accepts integers from 1 through `0x7fffffff`.

S96G stress did not detect the problem because all stress seeds were numeric (`96001`, `96002`, `96003`, `96200`) and only a subset of public KnowledgePoints was exercised.

## Bounded fix

- preserve valid integer seeds;
- parse valid numeric strings as integers;
- deterministically hash arbitrary text seeds into the accepted integer range;
- keep the same text seed deterministic across replays;
- do not add generic fallback or free-form AI;
- do not change KnowledgePoint, PatternGroup, PatternSpec, generator semantics, or validator semantics.

## Required regression coverage

1. Reproduce the reported public path:
   - source: `g5a_u02_5a02`;
   - KnowledgePoint: `kp_g5a_u02_multi_constraint_digit_code_number_theory`;
   - question count: 20;
   - generation seed: `batch-a-browser`;
   - answer key: disabled.
2. Verify all 18 public G5A-U02 KnowledgePoints through the actual state-to-worksheet pipeline using the default public text seed.
3. Verify numeric seeds, numeric strings, arbitrary text seeds, and deterministic replay.
4. Regenerate the deployable browser bundle from the canonical source.

## Distance

```text
GOAL_DISTANCE_BEFORE = D0_G5A_U02_DYNAMIC_RELEASE_DECLARED_BUT_PUBLIC_DEFAULT_SEED_BLOCKED
GOAL_DISTANCE_AFTER  = D0_G5A_U02_DYNAMIC_RELEASE_PUBLIC_CLICK_PATH_FIX_PENDING_CI
```
