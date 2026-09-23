# G5AU02-S102 P0 Nontrivial Common-Factor Sampling and Witness FullFix

## Status

```text
PASS_CI_SYNCED_AND_MERGED
PR = #251
MERGE_SHA = cf03acc976f420ebc13ff60bfc3dd76c00bcae87
```

## Authority

S102 implements pattern orders 16 and 17 from the merged S99 P0 source-method and representation contract.

Source evidence:

- `g5a_u02_5a02a:p2:left-middle` — derive common factors from two complete factor structures;
- `g5a_u02_5a02a1:p1:left-bottom` — enumerate complete common factors;
- `g5a_u02_5a02a1:p1:right-top` — derive the greatest common factor from the full common-factor set.

## Locked scope

```text
ps_g5a_u02_common_factor_enumeration
ps_g5a_u02_greatest_common_factor
```

S103 digit-code generation, S104 integrated closeout, P1/P2 patterns and all other units remain unchanged.

## Deterministic nondegenerate sampling

Every generated operand pair satisfies:

```text
a != b
gcd(a,b) >= 2
gcd(a,b) < min(a,b)
factorSet(a) != factorSet(b)
```

Sampling uses a finite deterministic multiplier-pair registry and a seeded common base. Generic fallback, retry-until-pass generation and free-form AI are forbidden.

## Structured witnesses

### Common-factor enumeration

Display model:

```text
parallel_factor_sets_with_intersection
```

The learner sees the complete factor set of each operand and writes their intersection. The canonical answer is the complete ascending common-factor list.

### Greatest common factor

Display model:

```text
common_factor_set_with_gcf
```

The learner sees both complete factor sets, writes their intersection, and derives the maximum member.

Additive answer model:

```text
commonFactorAndGcfAnswer = {
  commonFactors,
  greatestCommonFactor
}
```

## Answer isolation

The learner-facing question display carries the two operands and their complete factor sets only. It excludes:

```text
commonFactors
greatestCommonFactor
answer
structuredAnswer
answerText
```

The common-factor set and GCF remain answer-key-only.

## Contract precedence

```text
S84 base materialization
→ S99 additive answer-model contract
→ S101 runtime overlay
→ S102 runtime overlay
```

The base S84 artifact and S101 overlay remain immutable. S102 changes only pattern order 17 from `integerAnswer` to `commonFactorAndGcfAnswer`.

## Blocking validation

```text
G5AU02_P0_COMMON_FACTOR_OPERANDS_DEGENERATE
G5AU02_P0_FACTOR_SET_WITNESS_MISSING
G5AU02_P0_COMMON_FACTOR_INTERSECTION_MISMATCH
G5AU02_P0_GCF_OPERANDS_DEGENERATE
G5AU02_P0_GCF_COMMON_SET_MISSING
G5AU02_P0_GCF_NOT_MAXIMUM
```

Canonical factor sets, intersections, GCFs and answers are independently recomputed from the two operands.

## Accepted evidence

```text
source runtime                         128 / 128 PASS
generated browser bundle              128 / 128 PASS
full Node regression                 1611 / 1611 PASS
S97 backward compatibility            120 / 120 PASS
S100 backward compatibility           384 / 384 PASS
S101 backward compatibility           192 / 192 PASS
GLM-S05 15 units × 18 layouts                    PASS
GLM-S06 strict HTML/PDF                270 / 270 PASS
GLM-S07 answer boundary                 90 / 90 PASS
S102 delegated GLM-S09 geometry       270 / 270 PASS
S95 production stress                            PASS
S96D bundle/focused/full regression              PASS
S96G dynamic 200-question HTML/PDF                PASS
S96I live browser/print E2E                       PASS
S96Q public-control DOM E2E                       PASS
S96R 24-combination HTML/PDF                      PASS
```

The S102 workflow owns a five-shard delegated GLM-S09 gate because the global S09 workflow path filter does not include unit-specific runtime files.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G5A_U02_S101_PARTITION_GEOMETRY_REPRESENTATION_FIXED
GOAL_DISTANCE_AFTER  = D1_G5A_U02_S102_NONTRIVIAL_COMMON_FACTOR_WITNESS_FIXED
DISTANCE_REDUCED = two P0 common-factor PatternSpecs now have deterministic nondegenerate operands, complete factor-set witnesses, intersection-derived common factors and maximum-from-set GCF derivation
D0_ELIGIBLE = false
NEXT_SHORT_STEP = G5AU02-S103_P0SourceDigitCodeReferenceAndGeneratedFamilySeparation
NEXT_STEP_REQUIRES_IMPLEMENTATION_APPROVAL = true
```
