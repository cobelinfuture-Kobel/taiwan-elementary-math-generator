# G5AU02-S103 P0 Source Digit-Code Reference and Generated-Family Separation

## Status

```text
PASS_CI_SYNCED_AND_MERGED
PR = 252
MERGE_SHA = b067c4df1a4d89d14cb6123fa2fcec353d022e41
```

## Authority

S103 implements pattern order 22 from the merged S99 P0 source-method and representation contract.

```text
ps_g5a_u02_multi_constraint_digit_code
```

Source evidence remains:

```text
g5a_u02_5a02a1:p2:right-top
```

S104 integrated closeout, P1/P2 patterns and all other units remain unchanged.

## Problem closed

Before S103, every seed generated the same source-backed answer `1725`. The source example was mathematically valid but was also being used as the default production family, so repeated allocation produced no generative diversity.

S103 separates two profiles:

```text
source_1725_reference
  productionAllocation = reference_only

generated_unique_code_v1
  productionAllocation = default_regeneration
```

The source profile is retained as an explicit fixture and excluded from default allocation.

## Source reference profile

The source fixture keeps:

- the unique solution `1725`;
- the source evidence reference;
- the five original reasoning conditions;
- the original learner-facing Traditional Chinese wording;
- no direct positional answer clues.

It can be requested only by explicit profile ID. Seed-only/default generation never selects it.

## Generated profile

The generated candidate domain is closed and deterministic:

```text
1000..9999
four distinct digits
nonzero thousands digit
candidate count = 4536
```

The finite grammar supports:

- a digit being a common factor of controlled values;
- a controlled constant being a common multiple of selected digits;
- whole-code divisibility by controlled divisors;
- a controlled offset relation between two digit positions;
- a controlled digit-sum target.

Eight approved blueprints are selected deterministically from the seed. No free-form condition authoring, retry-until-pass loop, generic fallback or AI generation is permitted.

## Exact solver

For every profile, the validator enumerates the complete candidate domain and evaluates the structured conditions independently of prompt text.

Acceptance requires and now confirms:

```text
solutionCount = 1
canonical answer = the only solver result
```

For generated profiles, each condition is removed in turn. The profile is blocked if removing any required condition leaves the same unique solution.

## Display model

```text
unique_digit_code_constraints
```

Required learner-visible fields:

```text
profileId
productionAllocation
candidateDomain
conditions
solutionCount
sourceReference
```

The student-facing display model contains no:

```text
answer
structuredAnswer
answerText
digits
value
expectedSolution
sourceSolution
```

The answer remains isolated in the answer-key record through the existing `digitTupleAnswer` model.

## Blocking validation

```text
G5AU02_P0_DIGIT_CODE_PROFILE_INVALID
G5AU02_P0_DIGIT_CODE_NOT_UNIQUE
G5AU02_P0_DIGIT_CODE_CONDITION_INSUFFICIENT
G5AU02_P0_SOURCE_REFERENCE_REPEATED_AS_DEFAULT
```

The historical source-answer mismatch code remains available only for explicit source fixture mutations:

```text
G5AU02_DIGIT_TUPLE_NOT_1725
```

## Accepted evidence

```text
focused generated profile                 = 64 / 64 PASS
explicit source reference fixture         = 1 / 1 PASS
bundled generated profile                 = 64 / 64 PASS
source-reference default repeats          = 0 PASS
eight generated blueprints reached        = 8 / 8 PASS
full Node regression                      = 1619 / 1619 PASS
S97 backward compatibility                = 120 / 120 PASS
S100 backward compatibility               = 384 / 384 PASS
S101 backward compatibility               = 192 / 192 PASS
S102 backward compatibility               = 128 / 128 PASS
GLM-S05 exact 18-layout matrix            = 15 units × 18 layouts PASS
GLM-S06 HTML/PDF matrix                   = 270 / 270 PASS
GLM-S07 answer-boundary matrix            = 90 / 90 PASS
delegated GLM-S09 actual-column geometry  = 270 / 270 PASS
S95 production stress                     = PASS
S96D bundle/focused/full suite            = PASS
S96G dynamic 200-question HTML/PDF        = PASS
S96I live browser/print E2E               = PASS
S96Q public-control DOM E2E               = PASS
S96R 24-combination HTML/PDF              = PASS
```

## Fixed boundaries

- PatternSpec, KnowledgePoint, PatternGroup, FormalMapping, source and answer-model IDs remain stable.
- The source template-family ID remains stable.
- S84 and S99–S102 authorities remain immutable.
- S104 and P1/P2 behavior remain frozen.
- Runtime web search, generic fallback and free-form AI remain forbidden.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_S102_NONTRIVIAL_COMMON_FACTOR_WITNESS_FIXED
GOAL_DISTANCE_AFTER  = D1_G5A_U02_S103_SOURCE_AND_GENERATED_DIGIT_CODE_SEPARATED
DISTANCE_REDUCED = fixed source example separated from deterministic unique generated-code production family
D0_ELIGIBLE = false
NEXT_SHORT_STEP = G5AU02-S104_P0IntegratedSemanticRendererHTMLPDFAcceptance
NEXT_STEP_REQUIRES_IMPLEMENTATION_APPROVAL = true
```
